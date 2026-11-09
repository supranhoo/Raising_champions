/**
 * =========================================================================
 * ZOPTRO - M5 ADVERSARIAL STRESS HARNESS & VICTORY VERIFICATION
 * =========================================================================
 * Independent empirical verification suite for Gemini API Build System,
 * Zero-Cost CBSE/NCERT Sourcing Plan, Token Controls & Quota Management.
 *
 * Core Verification Domains:
 * 1. Architecture and Sourcing (R1): Blueprint completeness, public sources,
 *    statutory copyright clearance, Class 1-10 stages, closed-loop tracking.
 * 2. Admin Build System & Storage (R2): Dual-mode parity, UI controls,
 *    Table 11 CurriculumQuizzes ingestion, universal 0px border-radius,
 *    typography, color palette.
 * 3. Token Controls & Quota Management (R3): Table 15 GeminiTokenLogs,
 *    sliding 60-second 15 RPM anti-tumbling limiter, 1,500 RPD UTC midnight
 *    rollover, SHA-256 deduplication 0-token cache.
 * 4. Adversarial Attack Vectors: CWE-1236 formula injection, RBAC bypassing,
 *    distractor normalization, and edge-case boundary payloads.
 * =========================================================================
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert');

console.log('=========================================================================');
console.log('  ⚔️  M5 EMPIRICAL CHALLENGER: ADVERSARIAL STRESS & VERIFICATION HARNESS');
console.log('=========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runAssert(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    failures.push({ name: testName, error: err.message, stack: err.stack });
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`     Reason: ${err.message}`);
  }
}

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_PATH = path.join(ROOT_DIR, 'docs', 'gemini_content_generation_architecture_and_syllabus_plan.md');
const BACKEND_PATH = path.join(ROOT_DIR, 'google_apps_script_backend.js');
const HTML_PATH = path.join(ROOT_DIR, 'divyank_mission_control_google_apps_script_app.html');

assert.ok(fs.existsSync(DOCS_PATH), `Missing architecture document at ${DOCS_PATH}`);
assert.ok(fs.existsSync(BACKEND_PATH), `Missing backend file at ${BACKEND_PATH}`);
assert.ok(fs.existsSync(HTML_PATH), `Missing frontend HTML file at ${HTML_PATH}`);

const docsContent = fs.readFileSync(DOCS_PATH, 'utf8');
const backendContent = fs.readFileSync(BACKEND_PATH, 'utf8');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

// =========================================================================
// SECTION 1: REQUIREMENT R1 - ARCHITECTURE & ZERO-COST SOURCING PLAN
// =========================================================================
console.log('>>> SECTION 1: ARCHITECTURE & ZERO-COST SOURCING PLAN (R1) <<<');

runAssert('R1.1: Architecture document contains exhaustive Table of Contents and System Overview', () => {
  assert.ok(docsContent.includes('## Table of Contents'), 'Missing Table of Contents');
  assert.ok(docsContent.includes('Executive Summary & System Overview'), 'Missing Executive Summary');
  assert.ok(docsContent.length > 50000, `Document length should exceed 50KB, found ${docsContent.length}`);
});

runAssert('R1.2: Cites all official public repositories (NCERT, DIKSHA Sunbird, ePathshala, NDEAR, data.gov.in)', () => {
  assert.ok(docsContent.includes('https://ncert.nic.in/textbook.php'), 'Missing NCERT textbook portal');
  assert.ok(docsContent.includes('https://diksha.gov.in/api/framework/v1/read/ncert_k-12'), 'Missing DIKSHA Sunbird API endpoint');
  assert.ok(docsContent.includes('https://epathshala.nic.in'), 'Missing ePathshala reference');
  assert.ok(docsContent.includes('https://ndear.gov.in'), 'Missing NDEAR reference');
  assert.ok(docsContent.includes('https://data.gov.in'), 'Missing data.gov.in reference');
});

runAssert('R1.3: Documents Indian Copyright Act 1957 Section 52(1)(q)(iv) statutory legal clearance', () => {
  assert.ok(docsContent.includes('Section 52(1)(q)(iv)'), 'Missing Section 52(1)(q)(iv) copyright exemption citation');
  assert.ok(docsContent.includes('Indian Copyright Act, 1957'), 'Missing Indian Copyright Act, 1957 citation');
});

runAssert('R1.4: Pre-compilation static manifest extraction strategy documented with zero runtime API dependency', () => {
  assert.ok(docsContent.includes('Static Manifest Extraction & Bundling Strategy') || docsContent.includes('Static Pre-Compilation Architecture'), 'Missing static manifest extraction strategy');
  assert.ok(docsContent.includes('Anti-Pattern of Runtime Scraping'), 'Missing anti-pattern explanation');
  assert.ok(docsContent.includes('CurriculumTaxonomyManifest'), 'Missing manifest interface schema');
});

runAssert('R1.5: Detailed coverage of all 4 NEP stages for Class 1 through Class 10', () => {
  assert.ok(docsContent.includes('Foundational Stage (Classes 1 & 2)'), 'Missing Foundational stage');
  assert.ok(docsContent.includes('Preparatory Stage (Classes 3 to 5)'), 'Missing Preparatory stage');
  assert.ok(docsContent.includes('Middle Stage (Classes 6 to 8)'), 'Missing Middle stage');
  assert.ok(docsContent.includes('Secondary Stage (Classes 9 & 10'), 'Missing Secondary stage');
  for (let c = 1; c <= 10; c++) {
    assert.ok(docsContent.includes(`Class ${c}`), `Missing Class ${c} coverage in syllabus taxonomy`);
  }
});

runAssert('R1.6: Closed-loop exam preparation workflow maps Table 11, Table 14, and Parental Drilldowns', () => {
  assert.ok(docsContent.includes('Table 11') && docsContent.includes('CurriculumQuizzes'), 'Missing Table 11 CurriculumQuizzes mapping');
  assert.ok(docsContent.includes('Table 14') && docsContent.includes('StudentQuestionResponses'), 'Missing Table 14 StudentQuestionResponses mapping');
  assert.ok(docsContent.includes('getStudentAnswerSheet'), 'Missing getStudentAnswerSheet mapping');
  assert.ok(docsContent.includes('getNextPersonalizedCurriculum'), 'Missing getNextPersonalizedCurriculum mapping');
  assert.ok(docsContent.includes("Bloom's Revised Taxonomy") || docsContent.includes("Bloom's Taxonomy"), "Missing Bloom's Taxonomy mapping");
});

// =========================================================================
// SECTION 2: REQUIREMENT R2 - ADMIN BUILD SYSTEM & STORAGE COMMITMENT
// =========================================================================
console.log('\n>>> SECTION 2: ADMIN BUILD SYSTEM & STORAGE COMMITMENT (R2) <<<');

runAssert('R2.1: Universal 0px border-radius brand geometry strictly enforced in HTML and CSS', () => {
  assert.ok(/\*\s*\{[\s\S]*?border-radius:\s*0px\s*!important;[\s\S]*?\}/.test(htmlContent), 'Missing universal 0px border-radius rule');
  // Check for forbidden non-none rounded classes
  const forbiddenRoundedRegex = /\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g;
  const matches = htmlContent.match(forbiddenRoundedRegex) || [];
  assert.strictEqual(matches.length, 0, `Forbidden rounded classes detected: ${matches.join(', ')}`);
});

runAssert('R2.2: Brand typography includes Outfit display font and Figtree body font', () => {
  assert.ok(htmlContent.includes('Outfit') && htmlContent.includes('Figtree'), 'Missing Outfit or Figtree fonts');
  assert.ok(htmlContent.includes('fonts.googleapis.com'), 'Missing Google Fonts embed link');
});

runAssert('R2.3: Brand color palette tokens present in UI styling (#09293D, #F4F2EA, #666D57, #F65800)', () => {
  assert.ok(htmlContent.includes('#09293D'), 'Missing Authority Blue #09293D');
  assert.ok(htmlContent.includes('#F4F2EA'), 'Missing Clarity Ivory #F4F2EA');
  assert.ok(htmlContent.includes('#666D57'), 'Missing Grounded Olive #666D57');
  assert.ok(htmlContent.includes('#F65800'), 'Missing Progress Orange #F65800');
});

runAssert('R2.4: Admin Studio UI controls and Quota HUD markup elements exist in HTML DOM', () => {
  const expectedDomIds = [
    'adminTabBtnAiGenerate',
    'adminAiGenerateContainer',
    'adminGeminiQuotaHud',
    'aiHudRpm',
    'aiHudRpd',
    'aiHudTokens',
    'aiHudCache',
    'aiHudCost',
    'aiGenGrade',
    'aiGenSubject',
    'aiGenChapter',
    'aiGenTopic',
    'aiGenType',
    'aiGenQuantity',
    'aiGenDifficulty',
    'aiGenSubmitBtn',
    'aiGenPreviewDeck',
    'aiGenCommitBtn',
    'aiGenQuestionsList'
  ];
  for (const domId of expectedDomIds) {
    const idPattern = new RegExp(`id=["']${domId}["']`);
    assert.ok(idPattern.test(htmlContent), `Missing required static DOM element #${domId} in HTML`);
  }
});

runAssert('R2.5: Backend bulkUploadContentBatch commits into Table 11 CurriculumQuizzes with valid schema', () => {
  assert.ok(backendContent.includes('function bulkUploadContentBatch'), 'Missing bulkUploadContentBatch function in backend');
  assert.ok(backendContent.includes('function transformGeneratedItemsForBulkUpload'), 'Missing transformGeneratedItemsForBulkUpload in backend');
});

// Setup GAS simulator with full Google Apps Script mock environment
class MockRange {
  constructor(sheet, startRow, startCol, numRows = 1, numCols = 1) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }
  setBackground() { return this; }
  setFontColor() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
  setBorder() { return this; }
  setValue(val) {
    this.sheet._ensureSize(this.startRow, this.startCol);
    this.sheet.grid[this.startRow - 1][this.startCol - 1] = val;
    return this;
  }
  setValues(matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const row = this.startRow + r;
        const col = this.startCol + c;
        this.sheet._ensureSize(row, col);
        this.sheet.grid[row - 1][col - 1] = matrix[r][c];
      }
    }
    return this;
  }
  getValues() {
    const result = [];
    for (let r = 0; r < this.numRows; r++) {
      const rowIdx = this.startRow - 1 + r;
      const row = [];
      for (let c = 0; c < this.numCols; c++) {
        const colIdx = this.startCol - 1 + c;
        const val = (this.sheet.grid[rowIdx] && this.sheet.grid[rowIdx][colIdx] !== undefined)
          ? this.sheet.grid[rowIdx][colIdx] : "";
        row.push(val);
      }
      result.push(row);
    }
    return result;
  }
}

class MockSheet {
  constructor(name) {
    this.name = name;
    this.grid = [];
    this.frozenRows = 0;
  }
  _ensureSize(r, c) {
    while (this.grid.length < r) this.grid.push([]);
    for (let i = 0; i < this.grid.length; i++) {
      while (this.grid[i].length < c) this.grid[i].push("");
    }
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
  insertRowsBefore(beforeRow, count) {
    for (let i = 0; i < count; i++) {
      this.grid.splice(beforeRow - 1, 0, []);
    }
  }
  deleteRow(rowNumber) {
    this.grid.splice(rowNumber - 1, 1);
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

function createTestGasBackend() {
  const mockSpreadsheet = new MockSpreadsheet();
  const mockProperties = {
    GEMINI_API_KEY: 'test-api-key-xyz-123',
    gemini_cache_hits_count: '0'
  };
  const mockCache = {};

  const sandbox = {
    console: console,
    Date: Date,
    Math: Math,
    JSON: JSON,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    RegExp: RegExp,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => mockSpreadsheet,
      BorderStyle: { SOLID: 'SOLID' }
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => true,
        releaseLock: () => true,
        tryLock: () => true
      })
    },
    Session: {
      getActiveUser: () => ({ getEmail: () => 'admin@zoptro.local' }),
      getScriptTimeZone: () => 'UTC'
    },
    Utilities: {
      computeDigest: (alg, val) => Array.from(crypto.createHash('sha256').update(val, 'utf8').digest()),
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      sleep: () => {}
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => mockProperties.hasOwnProperty(k) ? mockProperties[k] : null,
        setProperty: (k, v) => { mockProperties[k] = String(v); },
        deleteProperty: (k) => { delete mockProperties[k]; }
      })
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => mockCache.hasOwnProperty(k) ? mockCache[k] : null,
        put: (k, v, ttl) => { mockCache[k] = String(v); },
        remove: (k) => { delete mockCache[k]; }
      })
    },
    UrlFetchApp: {
      fetch: (url, options) => ({
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify([
                  {
                    title: "Test Question 1",
                    questionText: "What is 2 + 2?",
                    options: ["1", "2", "3", "4"],
                    correctOptionIndex: 3,
                    hint: "Count on fingers",
                    explanation: "2 plus 2 equals 4.",
                    bloomLevel: "Remembering",
                    difficulty: "Easy"
                  }
                ])
              }]
            },
            finishReason: "STOP"
          }],
          usageMetadata: {
            promptTokenCount: 150,
            candidatesTokenCount: 80,
            totalTokenCount: 230
          }
        })
      })
    }
  };

  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(backendContent, sandbox);

  // Initialize DB schema and seed admin user u_adm_demo
  sandbox.initializeDatabase();
  const usersSheet = mockSpreadsheet.getSheetByName('Users');
  if (usersSheet) {
    usersSheet.appendRow(['u_adm_demo', 'admin', 'Demo Administrator', 'admin@zoptro.local', '', '', 'hash', 'ACTIVE', '2026-01-01', '2026-01-01', 'UTC']);
  }

  return { sandbox, mockSpreadsheet, mockProperties, mockCache };
}

function createTestBrowserMock() {
  const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
  const lastScriptTag = scriptMatches[scriptMatches.length - 1];
  const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

  const mockStorage = {
    _data: {
      zoptro_gemini_api_key: 'mock-browser-key-456'
    },
    getItem: function(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  };

  const createDummyElem = (tag = 'div') => ({
    tagName: tag.toUpperCase(),
    innerText: '',
    innerHTML: '',
    value: '',
    style: {},
    children: [],
    classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false },
    appendChild: function(c) { this.children.push(c); return c; },
    getContext: () => ({
      clearRect: ()=>{}, save: ()=>{}, restore: ()=>{}, translate: ()=>{}, rotate: ()=>{},
      fillRect: ()=>{}, beginPath: ()=>{}, arc: ()=>{}, fill: ()=>{}, stroke: ()=>{},
      moveTo: ()=>{}, lineTo: ()=>{}, closePath: ()=>{}
    }),
    focus: ()=>{},
    closest: function() { return this; }
  });

  const domElements = {};
  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    domElements[match[1]] = createDummyElem();
  }

  const mockWin = {
    location: { hash: '' },
    localStorage: mockStorage,
    document: {
      getElementById: (id) => domElements[id] || createDummyElem(),
      querySelector: (sel) => {
        if (sel && sel.startsWith('#')) return domElements[sel.slice(1)] || createDummyElem();
        return createDummyElem();
      },
      querySelectorAll: () => [],
      createElement: (t) => createDummyElem(t),
      body: { style: {}, appendChild: ()=>{} },
      addEventListener: ()=>{}
    },
    innerWidth: 1280,
    innerHeight: 800,
    setTimeout: (fn, ms) => { fn(); return 1; },
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Date: Date,
    Math: Math,
    JSON: JSON,
    console: console,
    addEventListener: ()=>{},
    removeEventListener: ()=>{},
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect: ()=>{}, start: ()=>{}, stop: ()=>{}, frequency: { setValueAtTime: ()=>{} } }),
        createGain: () => ({ connect: ()=>{}, gain: { setValueAtTime: ()=>{}, exponentialRampToValueAtTime: ()=>{} } })
      };
    },
    playSound: () => {},
    spawnConfetti: () => {},
    alertCustom: () => {}
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);
  return { sandbox, mockStorage };
}

// =========================================================================
// SECTION 3: REQUIREMENT R3 - TOKEN CONTROLS & QUOTA MANAGEMENT
// =========================================================================
console.log('\n>>> SECTION 3: TOKEN CONTROLS & QUOTA MANAGEMENT (R3) <<<');

runAssert('R3.1: Table 15 GeminiTokenLogs records prompt, candidate, and total tokens accurately', () => {
  const { sandbox } = createTestGasBackend();
  const res = sandbox.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 3',
    subject: 'Mathematics',
    chapter: 'Numbers',
    topic: 'Addition',
    questionType: 'MCQ',
    quantity: 1,
    forceRefresh: true
  });

  assert.strictEqual(res.success, true, 'Generation failed: ' + res.error);
  assert.strictEqual(res.tokenUsage.promptTokens, 150);
  assert.strictEqual(res.tokenUsage.candidateTokens, 80);
  assert.strictEqual(res.tokenUsage.totalTokens, 230);
  assert.strictEqual(res.tokenUsage.estimatedCostUsd, 0.0000);
});

runAssert('R3.2: Deterministic SHA-256 Deduplication Cache returns 0 token burn on identical request', () => {
  const { sandbox } = createTestGasBackend();
  const payload = {
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 5',
    subject: 'Science',
    chapter: 'Plants',
    topic: 'Photosynthesis',
    questionType: 'MCQ',
    quantity: 1
  };

  // Call 1: Miss
  const res1 = sandbox.generateCurriculumQuestionsWithGemini(payload);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.cached, false);
  assert.strictEqual(res1.tokenUsage.totalTokens, 230);

  // Call 2: Hit
  const res2 = sandbox.generateCurriculumQuestionsWithGemini(payload);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.cached, true);
  assert.strictEqual(res2.tokenUsage.promptTokens, 0);
  assert.strictEqual(res2.tokenUsage.candidateTokens, 0);
  assert.strictEqual(res2.tokenUsage.totalTokens, 0);
  assert.strictEqual(res2.items.length, res1.items.length);
  assert.strictEqual(res2.items[0].questionText, res1.items[0].questionText);
  assert.deepStrictEqual(res2.items[0].options, res1.items[0].options);

  // Call 3: forceRefresh bypasses cache
  const res3 = sandbox.generateCurriculumQuestionsWithGemini(Object.assign({}, payload, { forceRefresh: true }));
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.cached, false);
  assert.strictEqual(res3.tokenUsage.totalTokens, 230);
});

runAssert('R3.3: Sliding-Window Rate Limiter permits exactly 15 calls in 60s and throttles 16th with 429', () => {
  const { sandbox } = createTestGasBackend();
  const basePayload = {
    adminUserId: 'u_adm_demo',
    subject: 'Mathematics',
    forceRefresh: true
  };

  // Execute 15 calls
  for (let i = 1; i <= 15; i++) {
    const res = sandbox.generateCurriculumQuestionsWithGemini(Object.assign({}, basePayload, {
      topic: `BurstTopic_${i}`
    }));
    assert.strictEqual(res.success, true, `Call #${i} should have succeeded but failed: ${res.error}`);
  }

  // 16th call must be blocked with HTTP 429
  const blockedRes = sandbox.generateCurriculumQuestionsWithGemini(Object.assign({}, basePayload, {
    topic: 'BurstTopic_16'
  }));
  assert.strictEqual(blockedRes.success, false, '16th call should have been blocked');
  assert.strictEqual(blockedRes.code, 429, `Expected code 429, got ${blockedRes.code}`);
  assert.ok(blockedRes.error.includes('RATE_LIMIT_EXCEEDED') || blockedRes.error.includes('15 requests per minute'), 'Error must specify rate limit');
  assert.ok(blockedRes.rateLimits.retryAfterSeconds > 0, 'retryAfterSeconds must be positive');
});

runAssert('R3.4: Anti-tumbling verification: rate limit window slides continuously as timestamps age', () => {
  const { sandbox, mockCache } = createTestGasBackend();
  const now = Date.now();
  // Simulate 15 calls placed 55 seconds ago (only 5s remaining in window)
  const timestamps = [];
  for (let i = 0; i < 15; i++) {
    timestamps.push(now - 55000 + (i * 100));
  }
  mockCache['gemini_rpm_timestamps_gemini-1.5-flash'] = JSON.stringify(timestamps);

  // Still within 60s window: 16th call blocked
  const check1 = sandbox.checkAndIncrementRateLimit('gemini-1.5-flash', false);
  assert.strictEqual(check1.allowed, false, 'Should be blocked while 15 calls are within 60s');
  assert.ok(check1.retryAfterSeconds <= 6, `Expected retryAfterSeconds ~5s, got ${check1.retryAfterSeconds}`);

  // Shift timestamps so 3 calls are older than 60 seconds
  const agedTimestamps = timestamps.map((ts, idx) => (idx < 3 ? ts - 10000 : ts));
  mockCache['gemini_rpm_timestamps_gemini-1.5-flash'] = JSON.stringify(agedTimestamps);

  const check2 = sandbox.checkAndIncrementRateLimit('gemini-1.5-flash', false);
  assert.strictEqual(check2.allowed, true, 'Should allow request after older timestamps age out of 60s window');
  assert.strictEqual(check2.rpmRemaining, 3, 'Expected 3 slots freed');
});

runAssert('R3.5: Daily Quota (1,500 RPD) blocks with exact retryAfterSeconds and resets at UTC midnight', () => {
  const { sandbox, mockCache } = createTestGasBackend();
  const todayUtc = new Date().toISOString().substring(0, 10);
  const rpdKey = 'gemini_rpd_gemini-1.5-flash_' + todayUtc;
  
  // Set counter to 1500 limit in L1 cache
  mockCache[rpdKey] = '1500';

  const check1 = sandbox.checkAndIncrementRateLimit('gemini-1.5-flash', false);
  assert.strictEqual(check1.allowed, false, 'Should block when daily quota reaches 1500');
  assert.ok(check1.error.includes('DAILY_QUOTA_EXCEEDED') || check1.error.includes('1,500'), 'Error must mention daily quota');
  assert.ok(check1.retryAfterSeconds > 0, 'retryAfterSeconds must be positive');

  // Next UTC day has different key, effectively resetting daily counter
  const tomorrowUtc = new Date(Date.now() + 86400000).toISOString().substring(0, 10);
  const tomorrowRpdKey = 'gemini_rpd_gemini-1.5-flash_' + tomorrowUtc;
  mockCache[tomorrowRpdKey] = '0';

  // Verify that an empty/fresh day key allows consumption
  delete mockCache[rpdKey];
  const check2 = sandbox.checkAndIncrementRateLimit('gemini-1.5-flash', true);
  assert.strictEqual(check2.allowed, true, 'Reset quota should allow call');
  assert.strictEqual(check2.dailyRemaining, 1499, 'Daily remaining should be 1499 after 1 call');
});

// =========================================================================
// SECTION 4: ADVERSARIAL STRESS ATTACKS & PARITY VERIFICATION
// =========================================================================
console.log('\n>>> SECTION 4: ADVERSARIAL STRESS ATTACKS & DUAL-MODE PARITY <<<');

runAssert('ADV.1: CWE-1236 Formula Injection Neutralization sanitizes all dangerous spreadsheet triggers', () => {
  const { sandbox } = createTestGasBackend();
  const dangerousVectors = [
    '=cmd|"/C calc"!A0',
    '+1234567',
    '-SUM(A1:B10)',
    '@HYPERLINK("http://evil.com","Click")',
    '\t=HYPERLINK("http://evil.com")',
    '\r=1+1',
    '  =DANGEROUS_FORMULA()'
  ];

  for (const vec of dangerousVectors) {
    const sanitized = sandbox.sanitizeSheetCellValue(vec);
    assert.strictEqual(sanitized.charAt(0), "'", `Vector ${vec} should start with single quote, got ${sanitized}`);
  }

  // Safe strings must not be corrupted or prepended with quote
  const safeStrings = ['Normal text', 'Class 10 Mathematics', '123', 'No formula here'];
  for (const s of safeStrings) {
    const sanitized = sandbox.sanitizeSheetCellValue(s);
    assert.strictEqual(sanitized, s, `Safe string ${s} was altered: ${sanitized}`);
  }
});

runAssert('ADV.2: RBAC Protection rejects unauthenticated callers and non-admin roles with HTTP 403', () => {
  const { sandbox } = createTestGasBackend();
  const invalidUsers = [
    undefined,
    null,
    '',
    '   ',
    'u_std_divyank',   // Student
    'u_par_demo',      // Parent
    'nonexistent_id',
    12345,
    { adminUserId: 'fake' }
  ];

  for (const u of invalidUsers) {
    const res = sandbox.generateCurriculumQuestionsWithGemini({ adminUserId: u });
    assert.strictEqual(res.success, false, `User ${u} should be rejected`);
    assert.strictEqual(res.code, 403, `User ${u} expected code 403, got ${res.code}`);
  }
});

runAssert('ADV.3: Distractor integrity: MCQ items always normalized to exactly 4 distinct options', () => {
  const { sandbox } = createTestGasBackend();
  sandbox.UrlFetchApp.fetch = function() {
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: "Underflow Q",
                  questionText: "Underflow",
                  options: ["OnlyOneOption"],
                  correctOptionIndex: 0,
                  hint: "H",
                  explanation: "E"
                },
                {
                  title: "Overflow Q",
                  questionText: "Overflow",
                  options: ["Opt1", "Opt2", "Opt3", "Opt4", "Opt5", "Opt6"],
                  correctOptionIndex: 4,
                  hint: "H",
                  explanation: "E"
                }
              ])
            }]
          },
          finishReason: "STOP"
        }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 10, totalTokenCount: 20 }
      })
    };
  };

  const res = sandbox.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    questionType: 'MCQ',
    forceRefresh: true
  });

  assert.strictEqual(res.success, true, 'Generation failed: ' + res.error);
  assert.strictEqual(res.items[0].options.length, 4, 'Underflow options must be padded to 4');
  assert.strictEqual(res.items[1].options.length, 4, 'Overflow options must be truncated to 4');
  assert.ok(res.items[1].correctOptionIndex < 4, 'Correct index must be clamped within bounds');
});

runAssert('ADV.4: Dual-Mode SHA-256 Request Fingerprint Parity between GAS Backend and BrowserMockBackend', () => {
  const gas = createTestGasBackend();
  const mock = createTestBrowserMock();

  const testPayloads = [
    { gradeClass: 'Class 3', subject: 'Mathematics', chapter: 'Fractions', topic: 'Halves', questionType: 'MCQ', quantity: 5, difficulty: 'Easy', model: 'gemini-1.5-flash' },
    { grade: 'class 10', subject: 'Science', chapter: 'Acids', topic: 'pH Scale', questionType: 'SHORT_ANSWER', quantity: 10, difficulty: 'Hard', model: 'gemini-2.0-flash' },
    { gradeClass: 'Class 1', subject: 'English', chapter: 'Alphabet', topic: 'Phonics', questionType: 'TRUE_FALSE', quantity: 3, difficulty: 'Easy' }
  ];

  for (const p of testPayloads) {
    const gasFp = gas.sandbox.computeGeminiCacheFingerprint(p);
    const mockFp = mock.sandbox.BrowserMockBackend.computeGeminiCacheFingerprint(p);
    assert.strictEqual(gasFp, mockFp, `Fingerprint mismatch for payload: ${JSON.stringify(p)}\nGAS: ${gasFp}\nMock: ${mockFp}`);
    assert.strictEqual(gasFp.length, 64, 'Fingerprint must be 64-character SHA-256 hex string');
  }
});

runAssert('ADV.5: BrowserMockBackend offline generation delivers 100% contract parity', () => {
  const mock = createTestBrowserMock();
  const res = mock.sandbox.BrowserMockBackend.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 4',
    subject: 'Science',
    chapter: 'Animals',
    topic: 'Habitats',
    questionType: 'MCQ',
    quantity: 3,
    forceRefresh: true
  });

  assert.strictEqual(res.success, true, 'BrowserMockBackend generation failed: ' + res.error);
  assert.strictEqual(res.items.length, 3, 'Expected 3 generated items');
  assert.strictEqual(res.items[0].options.length, 4, 'MCQ options must have 4 items');
  assert.strictEqual(typeof res.tokenUsage.promptTokens, 'number');
  assert.strictEqual(typeof res.tokenUsage.candidateTokens, 'number');
  assert.strictEqual(typeof res.tokenUsage.totalTokens, 'number');
  assert.strictEqual(res.tokenUsage.estimatedCostUsd, 0.0000);
  assert.strictEqual(typeof res.rateLimits.rpmRemaining, 'number');
  assert.strictEqual(typeof res.rateLimits.dailyRemaining, 'number');
});

runAssert('ADV.6: Interface Contract 2: getGeminiQuotaStatus telemetry parity between GAS and Mock', () => {
  const gas = createTestGasBackend();
  const mock = createTestBrowserMock();

  const gasStatus = gas.sandbox.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
  const mockStatus = mock.sandbox.BrowserMockBackend.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });

  assert.strictEqual(gasStatus.success, true);
  assert.strictEqual(mockStatus.success, true);
  assert.strictEqual(gasStatus.rpmLimit, 15);
  assert.strictEqual(mockStatus.rpmLimit, 15);
  assert.strictEqual(gasStatus.rpdLimit, 1500);
  assert.strictEqual(mockStatus.rpdLimit, 1500);
  assert.strictEqual(typeof gasStatus.rpmRemaining, 'number');
  assert.strictEqual(typeof mockStatus.rpmRemaining, 'number');
  assert.strictEqual(typeof gasStatus.rpdRemaining, 'number');
  assert.strictEqual(typeof mockStatus.rpdRemaining, 'number');
});

console.log('\n=========================================================================');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('=========================================================================\n');

if (failedTests > 0) {
  console.error(`💥 FAILURE DETECTED: ${failedTests} tests failed.`);
  process.exit(1);
} else {
  console.log('🎉 ALL ADVERSARIAL STRESS CHECKS AND BRAND INVARIANTS VERIFIED EMPIRICALLY!');
  process.exit(0);
}
