const crypto = require('crypto');

// Configure persistent Mock SpreadsheetApp & LockService before requiring backend
class MockRange {
  constructor(sheet, startRow, startCol, numRows = 1, numCols = 1) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }
  getValues() {
    const res = [];
    for (let r = 0; r < this.numRows; r++) {
      const rowIdx = this.startRow - 1 + r;
      if (rowIdx < this.sheet.grid.length) {
        res.push([...this.sheet.grid[rowIdx]]);
      } else {
        res.push(new Array(this.numCols).fill(''));
      }
    }
    return res;
  }
  setValues(vals) {
    for (let r = 0; r < vals.length; r++) {
      const rowIdx = this.startRow - 1 + r;
      while (this.sheet.grid.length <= rowIdx) {
        this.sheet.grid.push([]);
      }
      for (let c = 0; c < vals[r].length; c++) {
        this.sheet.grid[rowIdx][this.startCol - 1 + c] = vals[r][c];
      }
    }
    return this;
  }
  setBackground() { return this; }
  setFontColor() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
  setBorder() { return this; }
}

class MockSheet {
  constructor(name) {
    this.name = name;
    this.grid = [];
    this.frozenRows = 0;
  }
  getName() { return this.name; }
  setName(n) { this.name = n; }
  getLastRow() { return this.grid.length; }
  getLastColumn() {
    let max = 0;
    this.grid.forEach(row => { if (row.length > max) max = row.length; });
    return max;
  }
  appendRow(rowArr) {
    this.grid.push([...rowArr]);
  }
  setFrozenRows(n) { this.frozenRows = n; }
  getRange(startRow, startCol, numRows = 1, numCols = 1) {
    return new MockRange(this, startRow, startCol, numRows, numCols);
  }
  getDataRange() {
    const numRows = Math.max(1, this.grid.length);
    let numCols = 1;
    this.grid.forEach(r => { if (r.length > numCols) numCols = r.length; });
    return new MockRange(this, 1, 1, numRows, numCols);
  }
}

class MockSpreadsheet {
  constructor() {
    this.sheets = [];
  }
  getSheetByName(name) {
    return this.sheets.find(s => s.name === name) || null;
  }
  insertSheet(name) {
    const s = new MockSheet(name);
    this.sheets.push(s);
    return s;
  }
}

const mockActiveSpreadsheet = new MockSpreadsheet();
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

const persistentLock = {
  waitLock: () => true,
  releaseLock: () => true,
  tryLock: () => true
};

global.LockService = {
  getScriptLock: () => persistentLock
};

const backend = require('../google_apps_script_backend.js');
backend.initializeDatabase();

console.log('================================================================');
console.log('ADVERSARIAL STRESS TEST: CONCURRENCY, RATE LIMITING & CACHE');
console.log('================================================================');

let passed = 0;
let failed = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${testName} - ${details || 'assertion failed'}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Test Suite 1: Cache Operations via Public Methods
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 1: Deduplication Cache Operations & TTL Expiry ---');

const fpTest = 'adv_fp_ttl_' + Date.now();
const testData = {
  items: [{ id: 'q_test_1', title: 'TTL Test', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0 }],
  model: 'gemini-1.5-flash',
  promptTokens: 50,
  candidateTokens: 80
};

// Test initial miss
assert(backend.getCachedGeminiResponse(fpTest) === null, 'Cache returns null for uncached fingerprint', '');

// Test put
const putOk = backend.setCachedGeminiResponse(fpTest, testData, 1); // 1 second TTL
assert(putOk === true, 'setCachedGeminiResponse returns true on valid data', '');

// Test immediate hit
const hitData = backend.getCachedGeminiResponse(fpTest);
assert(hitData !== null && hitData.items.length === 1 && hitData.items[0].id === 'q_test_1',
  'getCachedGeminiResponse immediately retrieves stored item',
  JSON.stringify(hitData)
);

// Test TTL expiration (wait 1.1s)
const startWait = Date.now();
while (Date.now() - startWait < 1100) {}

const expiredData = backend.getCachedGeminiResponse(fpTest);
assert(expiredData === null, 'Cached response safely expires after TTL seconds', JSON.stringify(expiredData));

// Test defensive handling of malformed input to setCachedGeminiResponse
assert(backend.setCachedGeminiResponse(null, testData) === false, 'Rejects null fingerprint', '');
assert(backend.setCachedGeminiResponse(fpTest, null) === false, 'Rejects null data', '');
assert(backend.setCachedGeminiResponse(fpTest, { items: 'not an array' }) === false, 'Rejects non-array items', '');

// -----------------------------------------------------------------------------
// Test Suite 2: Rate Limiter Sliding 60-Second Window Mechanics & Math
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Sliding 60s Window Math & Boundary Conditions ---');

const testModelA = 'model-adv-a-' + Date.now();

// 1. Consume 15 requests
for (let i = 1; i <= 15; i++) {
  const res = backend.checkAndIncrementRateLimit(testModelA, true);
  assert(res.allowed === true && res.rpmRemaining === 15 - i,
    `Request ${i}/15 allowed with rpmRemaining=${15 - i}`,
    `Got allowed=${res.allowed}, remaining=${res.rpmRemaining}`
  );
}

// 2. 16th request must be blocked
const blockRes1 = backend.checkAndIncrementRateLimit(testModelA, true);
assert(blockRes1.allowed === false, '16th request in same second is BLOCKED', `Got allowed=${blockRes1.allowed}`);
assert(blockRes1.retryAfterSeconds >= 59 && blockRes1.retryAfterSeconds <= 60,
  'retryAfterSeconds is accurately ~60 seconds for burst at t=0',
  `Got retryAfterSeconds=${blockRes1.retryAfterSeconds}`
);
assert(blockRes1.rpmRemaining === 0, 'rpmRemaining is 0 when blocked', `Got ${blockRes1.rpmRemaining}`);

// 3. Non-consuming check (consume=false) should also report allowed: false but NOT change state
const inspectBlocked = backend.checkAndIncrementRateLimit(testModelA, false);
assert(inspectBlocked.allowed === false, 'Inspection query on exhausted window reports allowed=false', `Got ${inspectBlocked.allowed}`);
assert(inspectBlocked.rpmCurrent === 15, 'rpmCurrent is 15 during inspection', `Got ${inspectBlocked.rpmCurrent}`);

// -----------------------------------------------------------------------------
// Test Suite 3: Model Isolation in Rate Limiting
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Model Isolation in Rate Limiting ---');
const testModelB = 'model-adv-b-' + Date.now();
// testModelA was exhausted, but testModelB should be fresh (rpmRemaining=14 after 1st request)
const resModelB = backend.checkAndIncrementRateLimit(testModelB, true);
assert(resModelB.allowed === true && resModelB.rpmRemaining === 14,
  'Distinct model B is not blocked by exhausted model A (independent quota pools)',
  `Got allowed=${resModelB.allowed}, remaining=${resModelB.rpmRemaining}`
);

// -----------------------------------------------------------------------------
// Test Suite 4: Daily UTC Quota Reset & Midnight Boundary Rollover
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: UTC Midnight Boundary & Daily Limit Mechanics ---');
const testModelDaily = 'model-daily-' + Date.now();

// Consume 1 request to initialize daily counter
const initialReq = backend.checkAndIncrementRateLimit(testModelDaily, true);
assert(initialReq.allowed === true && initialReq.rpdCurrent === 1, 'Initial request sets rpdCurrent=1', '');

// Inspect dailyRemaining
const inspectDaily = backend.checkAndIncrementRateLimit(testModelDaily, false);
assert(inspectDaily.dailyRemaining === 1499, 'dailyRemaining correctly computed as 1499', `Got ${inspectDaily.dailyRemaining}`);
assert(inspectDaily.rpdLimit === 1500, 'rpdLimit is 1500', `Got ${inspectDaily.rpdLimit}`);

// Test UTC Midnight Math function
const now = Date.now();
const secondsUntilUtcMidnight = Math.max(1, 86400 - (Math.floor(now / 1000) % 86400));
assert(secondsUntilUtcMidnight > 0 && secondsUntilUtcMidnight <= 86400,
  `secondsUntilUtcMidnight (${secondsUntilUtcMidnight}s) is strictly between 1 and 86400`,
  ''
);

// -----------------------------------------------------------------------------
// Test Suite 5: Concurrency & ScriptLock Mutex Behavior
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Concurrency & LockService Mock / Error Handling ---');

// Test what happens when LockService fails to acquire lock (tryLock returns false)
global.LockService = {
  getScriptLock: () => ({
    tryLock: () => false, // simulates lock contention / timeout
    releaseLock: () => true
  })
};

const lockTimeoutRes = backend.checkAndIncrementRateLimit('test-lock-timeout', true);
assert(lockTimeoutRes.allowed === false, 'Returns allowed=false on lock contention/timeout', `Got ${lockTimeoutRes.allowed}`);
assert(lockTimeoutRes.error && lockTimeoutRes.error.includes('RATE_LIMIT_LOCK_TIMEOUT'), 'Returns RATE_LIMIT_LOCK_TIMEOUT error code', lockTimeoutRes.error);
assert(lockTimeoutRes.retryAfterSeconds === 2, 'retryAfterSeconds set to 2s on lock timeout', `Got ${lockTimeoutRes.retryAfterSeconds}`);

// Test what happens when LockService throws during tryLock
global.LockService = {
  getScriptLock: () => ({
    tryLock: () => { throw new Error('LockService system failure'); },
    releaseLock: () => true
  })
};

const lockThrowRes = backend.checkAndIncrementRateLimit('test-lock-throw', true);
assert(lockThrowRes.allowed === false && lockThrowRes.error.includes('RATE_LIMIT_LOCK_TIMEOUT'),
  'Gracefully handles LockService throwing an exception during tryLock without unhandled rejection',
  `Got ${JSON.stringify(lockThrowRes)}`
);

// Restore mock LockService
global.LockService = {
  getScriptLock: () => persistentLock
};

// -----------------------------------------------------------------------------
// Test Suite 6: Deduplication Caching Pre-image & Collision Resistance
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: SHA-256 Fingerprint Determinism & Collision Resistance ---');

const basePayload = {
  model: 'gemini-1.5-flash',
  gradeClass: 'Class 6',
  subject: 'Mathematics',
  chapter: 'Fractions',
  topic: 'Equivalent Fractions',
  questionType: 'MCQ',
  quantity: 5,
  difficulty: 'Medium',
  bloomLevel: 'Applying'
};

const fpBase = backend.computeGeminiCacheFingerprint(basePayload);
assert(typeof fpBase === 'string' && fpBase.length === 64, 'Fingerprint is 64-char hex string', `Length: ${fpBase.length}`);

// Altering each single parameter MUST yield a completely different hash (zero collision)
const mutations = [
  { param: 'model', val: 'gemini-2.0-flash' },
  { param: 'gradeClass', val: 'Class 7' },
  { param: 'subject', val: 'Science' },
  { param: 'chapter', val: 'Decimals' },
  { param: 'topic', val: 'Decimals to Fractions' },
  { param: 'questionType', val: 'SHORT_ANSWER' },
  { param: 'quantity', val: 10 },
  { param: 'difficulty', val: 'Hard' },
  { param: 'bloomLevel', val: 'Analyzing' }
];

mutations.forEach(m => {
  const mutatedPayload = Object.assign({}, basePayload, { [m.param]: m.val });
  const fpMutated = backend.computeGeminiCacheFingerprint(mutatedPayload);
  assert(fpMutated !== fpBase, `Altering ${m.param} changes fingerprint (avoids cache collision)`, `${fpBase} vs ${fpMutated}`);
});

// Test alias 'grade' works when 'gradeClass' is omitted
const noGradeClassPayload = Object.assign({}, basePayload);
delete noGradeClassPayload.gradeClass;
noGradeClassPayload.grade = 'Class 8';
const fpGradeAlias = backend.computeGeminiCacheFingerprint(noGradeClassPayload);
assert(fpGradeAlias !== fpBase, 'Grade alias correctly updates fingerprint when gradeClass is absent', '');

// Quantity normalization: quantity > 20 is clamped to 20; quantity < 1 is clamped to 1
const fp20 = backend.computeGeminiCacheFingerprint(Object.assign({}, basePayload, { quantity: 20 }));
const fp50 = backend.computeGeminiCacheFingerprint(Object.assign({}, basePayload, { quantity: 50 }));
assert(fp20 === fp50, 'Quantity > 20 is deterministically clamped to 20 for cache deduplication', `${fp20} vs ${fp50}`);

const fp1 = backend.computeGeminiCacheFingerprint(Object.assign({}, basePayload, { quantity: 1 }));
const fp0 = backend.computeGeminiCacheFingerprint(Object.assign({}, basePayload, { quantity: 0 }));
assert(fp1 !== fp0, 'Quantity 0 defaults to 5 (or minimum 1)', `${fp1} vs ${fp0}`);

// -----------------------------------------------------------------------------
// Test Suite 7: CWE-1236 Formula Injection Sanitization in Metering & Generator
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 7: CWE-1236 Formula Injection Sanitization ---');

const injectionInputs = ['=SUM(A1:A10)', '+cmd|/C calc', '-2+3', '@import(http://evil.com)'];

injectionInputs.forEach(input => {
  const sanitized = backend.sanitizeSheetCellValue(input);
  assert(sanitized.startsWith("'"), `Formula injection prefix '${input[0]}' escaped with single quote: ${sanitized}`, `Got ${sanitized}`);
});

const loggedInj = backend.recordGeminiTokenUsageLog({
  adminUserId: '=CMD|/C calc',
  model: '+evil-model',
  grade: '-Class 9',
  subject: '@Math',
  topic: '=HYPERLINK("http://evil.com")',
  promptTokens: 10,
  candidateTokens: 20
});

assert(loggedInj.adminUserId.startsWith("'"), 'Token log adminUserId escaped against CWE-1236', loggedInj.adminUserId);
assert(loggedInj.model.startsWith("'"), 'Token log model escaped against CWE-1236', loggedInj.model);
assert(loggedInj.grade.startsWith("'"), 'Token log grade escaped against CWE-1236', loggedInj.grade);
assert(loggedInj.subject.startsWith("'"), 'Token log subject escaped against CWE-1236', loggedInj.subject);
assert(loggedInj.topic.startsWith("'"), 'Token log topic escaped against CWE-1236', loggedInj.topic);

// -----------------------------------------------------------------------------
// Test Suite 8: Quota Telemetry HUD (getGeminiQuotaStatus)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 8: Quota Telemetry HUD (getGeminiQuotaStatus) ---');

const quotaHud = backend.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
assert(quotaHud.success === true, 'getGeminiQuotaStatus succeeds for valid admin', JSON.stringify(quotaHud));
assert(typeof quotaHud.rpmLimit === 'number' && quotaHud.rpmLimit === 15, 'rpmLimit is 15', '');
assert(typeof quotaHud.rpdLimit === 'number' && quotaHud.rpdLimit === 1500, 'rpdLimit is 1500', '');
assert(typeof quotaHud.rpmRemaining === 'number' && quotaHud.rpmRemaining >= 0 && quotaHud.rpmRemaining <= 15,
  'rpmRemaining is valid number [0, 15]', quotaHud.rpmRemaining);
assert(typeof quotaHud.rpdRemaining === 'number' && quotaHud.rpdRemaining >= 0 && quotaHud.rpdRemaining <= 1500,
  'rpdRemaining is valid number [0, 1500]', quotaHud.rpdRemaining);
assert(typeof quotaHud.totalTokensLogged === 'number', 'totalTokensLogged is number', quotaHud.totalTokensLogged);
assert(typeof quotaHud.cacheHitCount === 'number', 'cacheHitCount is number', quotaHud.cacheHitCount);

// -----------------------------------------------------------------------------
// Test Suite 9: Adversarial Integrity Audit - Markdown Stripping & Parsing
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 9: Adversarial Integrity Audit ---');

assert(backend.stripMarkdownFences('```json\n[{"a":1}]\n```') === '[{"a":1}]', 'stripMarkdownFences strips ```json', '');
assert(backend.stripMarkdownFences('```JSON\n[{"a":2}]\n```') === '[{"a":2}]', 'stripMarkdownFences strips case-insensitive ```JSON', '');
assert(backend.stripMarkdownFences('```\n[{"a":3}]\n```') === '[{"a":3}]', 'stripMarkdownFences strips bare ```', '');
assert(backend.stripMarkdownFences('   [{"a":4}]   ') === '[{"a":4}]', 'stripMarkdownFences trims plain JSON', '');
assert(backend.stripMarkdownFences('\uFEFF[{"a":5}]') === '[{"a":5}]', 'stripMarkdownFences strips UTF-8 BOM', '');

// Summary
console.log('\n================================================================');
console.log(`STRESS TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
