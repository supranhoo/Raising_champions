/**
 * ============================================================================
 * CHALLENGER 2: INDEPENDENT EMPIRICAL AUDIT & STRESS HARNESS
 * Milestone 1 Iteration 2 Gate Challenge
 * ============================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passCount = 0;
let failCount = 0;
const failureList = [];

function check(desc, fn) {
  try {
    fn();
    passCount++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    failCount++;
    failureList.push({ desc, error: err.message });
    console.error(`  [FAIL] ${desc}: ${err.message}`);
  }
}

// 1. Load GAS Backend Simulator
class MockSheetRange {
  constructor(sheet, startRow, startCol, numRows, numCols) {
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
  setValue(v) {
    this.sheet._ensureSize(this.startRow, this.startCol);
    this.sheet.grid[this.startRow - 1][this.startCol - 1] = v;
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
    const res = [];
    for (let r = 0; r < this.numRows; r++) {
      const row = [];
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        row.push(this.sheet.grid[rowIdx] && this.sheet.grid[rowIdx][colIdx] !== undefined ? this.sheet.grid[rowIdx][colIdx] : "");
      }
      res.push(row);
    }
    return res;
  }
  clearContent() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        if (this.sheet.grid[rowIdx]) this.sheet.grid[rowIdx][colIdx] = "";
      }
    }
    return this;
  }
}

class MockSheetObject {
  constructor(name) {
    this.name = name;
    this.grid = [];
  }
  _ensureSize(r, c) {
    while (this.grid.length < r) this.grid.push([]);
    for (let i = 0; i < this.grid.length; i++) {
      while (this.grid[i].length < c) this.grid[i].push("");
    }
  }
  getName() { return this.name; }
  getLastRow() { return this.grid.length; }
  getLastColumn() {
    let max = 0;
    this.grid.forEach(row => { if (row.length > max) max = row.length; });
    return max;
  }
  appendRow(rowArr) {
    this.grid.push([...rowArr]);
  }
  getRange(startRow, startCol, numRows = 1, numCols = 1) {
    return new MockSheetRange(this, startRow, startCol, numRows, numCols);
  }
  getDataRange() {
    const numRows = Math.max(1, this.grid.length);
    let numCols = 1;
    this.grid.forEach(r => { if (r.length > numCols) numCols = r.length; });
    return new MockSheetRange(this, 1, 1, numRows, numCols);
  }
  setFrozenRows() { return this; }
}

class MockSpreadsheetObject {
  constructor() {
    this.sheets = [];
  }
  getSheetByName(name) {
    return this.sheets.find(s => s.name === name) || null;
  }
  insertSheet(name) {
    const s = new MockSheetObject(name);
    this.sheets.push(s);
    return s;
  }
}

const gasSpreadsheet = new MockSpreadsheetObject();
const gasCache = new Map();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => gasSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};
global.LockService = {
  getScriptLock: () => ({ waitLock: () => true, releaseLock: () => true, tryLock: () => true })
};
global.CacheService = {
  getScriptCache: () => ({
    get: (k) => gasCache.get(k) || null,
    put: (k, v) => gasCache.set(k, v),
    remove: (k) => gasCache.delete(k),
    removeAll: (ks) => (ks || []).forEach(k => gasCache.delete(k))
  })
};
global.Session = {
  getActiveUser: () => ({ getEmail: () => "admin@zoptro.local" }),
  getScriptTimeZone: () => "GMT+5:30"
};
global.PropertiesService = {
  getScriptProperties: () => ({ getProperty: () => "k", setProperty: () => {} })
};
global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
  createHtmlOutputFromFile: (name) => ({ name }),
  createHtmlOutput: (html) => ({ html })
};
global.MailApp = { sendEmail: () => true };

const gasBackend = require('../google_apps_script_backend.js');

// Seed Users table in GAS
const uSheet = gasSpreadsheet.insertSheet("Users");
uSheet.appendRow(gasBackend.SCHEMAS.Users);
uSheet.appendRow([
  "u_adm_demo", "admin", "Admin Demo", "admin@zoptro.local", "pin_hash", "pass_hash",
  "ADM001", "", 0, 0, 1, 0, new Date().toISOString(), "", "", "", ""
]);
uSheet.appendRow([
  "u_stu_demo", "student", "Student Demo", "student@zoptro.local", "pin_hash", "pass_hash",
  "STU001", "u_par_demo", 0, 0, 1, 0, new Date().toISOString(), "", "Class 5", 10, ""
]);

// 2. Load BrowserMockBackend
const htmlContent = fs.readFileSync(path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html'), 'utf8');
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const scriptContent = scriptMatches[scriptMatches.length - 1].replace(/<\/?script[^>]*>/gi, '');

const mockEl = { getContext: () => ({ fillRect: () => {}, clearRect: () => {} }), style: {}, classList: { add: () => {}, remove: () => {} } };
const mockDoc = {
  getElementById: () => mockEl,
  querySelectorAll: () => [],
  querySelector: () => mockEl,
  createElement: () => mockEl,
  body: mockEl,
  addEventListener: () => {}
};
const mockWin = { innerWidth: 1200, innerHeight: 800, addEventListener: () => {}, scrollTo: () => {} };
mockWin.window = mockWin;
mockWin.document = mockDoc;

const sandbox = {
  console, setTimeout, clearTimeout, setInterval: () => {}, clearInterval: () => {},
  window: mockWin, document: mockDoc, module: { exports: {} }
};
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;

console.log('================================================================');
console.log('  CHALLENGER 2: INDEPENDENT EMPIRICAL AUDIT SUITE               ');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// TEST 1: Exact Parity across all 40 authentic Grade-Subject Pairs
// ----------------------------------------------------------------------------
console.log('>>> TEST 1: Full Matrix (40 pairs) Dual-Mode Exact Parity <<<');

// Seed both GAS and Mock
gasBackend.seedCurriculumCatalog('u_adm_demo', { reset: true });
BrowserMockBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
gasCache.clear();

const grades = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];

let pairCount = 0;
grades.forEach(grade => {
  const gNum = parseInt(grade.replace(/\D/g, ''), 10);
  const subjects = gNum <= 5
    ? ['Mathematics', 'EVS', 'English', 'Hindi']
    : ['Mathematics', 'Science', 'Social Science', 'English'];

  subjects.forEach(subject => {
    pairCount++;
    check(`Parity on pair #${pairCount}: ${grade} - ${subject}`, () => {
      const gasRes = gasBackend.getCurriculumCatalog({ grade, subject, forceRefresh: true });
      const mockRes = BrowserMockBackend.getCurriculumCatalog({ grade, subject, forceRefresh: true });

      assert.strictEqual(gasRes.success, true);
      assert.strictEqual(mockRes.success, true);
      assert.strictEqual(gasRes.count, mockRes.count, `Count mismatch on ${grade} ${subject}: GAS=${gasRes.count}, Mock=${mockRes.count}`);
      assert.ok(gasRes.count > 0, `Expected at least 1 chapter for ${grade} ${subject}`);

      // Verify every item
      for (let i = 0; i < gasRes.count; i++) {
        const g = gasRes.items[i];
        const m = mockRes.items[i];
        assert.strictEqual(g.id, m.id, `ID mismatch at idx ${i}`);
        assert.strictEqual(g.chapterNumber, m.chapterNumber, `chapterNumber mismatch at idx ${i}`);
        assert.strictEqual(g.chapterTitle, m.chapterTitle, `chapterTitle mismatch at idx ${i}`);
        assert.strictEqual(g.topicsJson, m.topicsJson, `topicsJson mismatch at idx ${i}`);
        assert.strictEqual(g.learningObjectivesJson, m.learningObjectivesJson, `LOJson mismatch at idx ${i}`);
        assert.strictEqual(JSON.stringify(g.topics), JSON.stringify(m.topics), `topics array mismatch at idx ${i}`);
        assert.strictEqual(JSON.stringify(g.learningObjectives), JSON.stringify(m.learningObjectives), `LO array mismatch at idx ${i}`);
        if (g.subSubject || m.subSubject) {
          assert.strictEqual(g.subSubject, m.subSubject, `subSubject mismatch at idx ${i}`);
        }
      }
    });
  });
});

assert.strictEqual(pairCount, 40, 'Must have evaluated exactly 40 grade-subject pairs');

// ----------------------------------------------------------------------------
// TEST 2: RBAC Stress on seedCurriculumCatalog
// ----------------------------------------------------------------------------
console.log('\n>>> TEST 2: RBAC Unauthorized Mutation Stress <<<');

const rbacVectors = [
  'u_stu_demo',
  'u_par_demo',
  'random_id_999',
  '',
  null,
  undefined,
  123,
  { adminUserId: 'u_stu_demo' },
  { adminUserId: null },
  { userId: 'u_stu_demo' },
  { role: 'admin' },
  "admin' --",
  "u_adm_demo' OR '1'='1"
];

rbacVectors.forEach((vec, idx) => {
  check(`RBAC Probe ${idx + 1}: GAS rejects unauthorized vector (${typeof vec === 'object' ? JSON.stringify(vec) : vec})`, () => {
    const res = gasBackend.seedCurriculumCatalog(vec);
    assert.strictEqual(res.success, false, 'GAS must deny');
    assert.strictEqual(res.code, 403, 'GAS must return 403');
  });

  check(`RBAC Probe ${idx + 1}: Mock rejects unauthorized vector (${typeof vec === 'object' ? JSON.stringify(vec) : vec})`, () => {
    const res = BrowserMockBackend.seedCurriculumCatalog(vec);
    assert.strictEqual(res.success, false, 'Mock must deny');
    assert.strictEqual(res.code, 403, 'Mock must return 403');
  });
});

// ----------------------------------------------------------------------------
// TEST 3: CWE-1236 Formula Injection Neutralization
// ----------------------------------------------------------------------------
console.log('\n>>> TEST 3: CWE-1236 Formula Injection Neutralization <<<');

const formulaAttacks = [
  '=1+1',
  '=cmd|\' /C calc\'!A0',
  '-2+3',
  '+4*5',
  '@SUM(A1:A10)',
  '\t=cmd',
  '\r=calc',
  '   =calc',
  '  \t+cmd'
];

formulaAttacks.forEach(att => {
  check(`CWE-1236: sanitizeSheetCellValue neutralizes formula "${att.replace(/\t/g, '\\t').replace(/\r/g, '\\r')}"`, () => {
    const sanitized = gasBackend.sanitizeSheetCellValue(att);
    assert.strictEqual(sanitized.charAt(0), "'", `Sanitized output must start with apostrophe: "${sanitized}"`);
  });
});

check('CWE-1236: Benign numbers, booleans, and clean strings are untouched', () => {
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(100), 100);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(true), true);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Simple Title'), 'Simple Title');
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(''), '');
});

// ----------------------------------------------------------------------------
// TEST 4: Zero-Downtime Unseeded Fallback Verification
// ----------------------------------------------------------------------------
console.log('\n>>> TEST 4: Zero-Downtime Fallback Verification <<<');

check('Mock empty database returns source: EMBEDDED_FALLBACK with 548 items', () => {
  BrowserMockBackend.resetDatabase();
  const res = BrowserMockBackend.getCurriculumCatalog();
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(res.count, 548);
});

check('GAS empty CurriculumCatalog sheet returns source: EMBEDDED_FALLBACK with 548 items', () => {
  const catSheet = gasSpreadsheet.getSheetByName('CurriculumCatalog');
  if (catSheet) {
    catSheet.grid = [gasBackend.SCHEMAS.CurriculumCatalog.slice()];
  }
  gasCache.clear();
  const res = gasBackend.getCurriculumCatalog({ forceRefresh: true });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(res.count, 548);
});

check('GAS non-existent CurriculumCatalog sheet falls back to EMBEDDED_FALLBACK without crashing', () => {
  const idx = gasSpreadsheet.sheets.findIndex(s => s.name === 'CurriculumCatalog');
  if (idx >= 0) gasSpreadsheet.sheets.splice(idx, 1);
  gasCache.clear();
  const res = gasBackend.getCurriculumCatalog({ forceRefresh: true });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(res.count, 548);
});

// ----------------------------------------------------------------------------
// TEST 5: Social Science Multi-Textbook Disciplinary Sequence
// ----------------------------------------------------------------------------
console.log('\n>>> TEST 5: Social Science Multi-Textbook Disciplinary Sequence <<<');

[7, 8, 9, 10].forEach(g => {
  check(`Class ${g} Social Science chapters follow History -> Geography -> Civics (-> Economics) order`, () => {
    const res = gasBackend.getCurriculumCatalog({ grade: `Class ${g}`, subject: 'Social Science', forceRefresh: true });
    assert.strictEqual(res.success, true);
    assert.ok(res.count >= 15, `Expected >= 15 chapters in Class ${g} Social Science, got ${res.count}`);

    const subSubjects = res.items.map(i => i.subSubject);
    let lastOrder = 0;
    const DISCIPLINE_ORDER = { 'history': 1, 'geography': 2, 'civics': 3, 'economics': 4 };

    res.items.forEach(item => {
      const disc = (item.subSubject || '').toLowerCase();
      const currentOrder = DISCIPLINE_ORDER[disc];
      assert.ok(currentOrder !== undefined, `Unknown discipline "${item.subSubject}" in item ${item.id}`);
      assert.ok(currentOrder >= lastOrder, `Discipline order regression: ${item.subSubject} (${currentOrder}) appeared after order ${lastOrder}`);
      lastOrder = currentOrder;
    });
  });
});

check('Class 6 Social Science is single textbook and does not split into disciplines', () => {
  const res = gasBackend.getCurriculumCatalog({ grade: 'Class 6', subject: 'Social Science', forceRefresh: true });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.count, 14);
  // Contiguous 1 to 14
  for (let i = 0; i < 14; i++) {
    assert.strictEqual(res.items[i].chapterNumber, i + 1);
  }
});

// Single book titles with internal colons are preserved contiguous
check('Class 6 Science with colon titles sorts contiguously 1 to 12', () => {
  const res = gasBackend.getCurriculumCatalog({ grade: 'Class 6', subject: 'Science', forceRefresh: true });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.count, 12);
  for (let i = 0; i < 12; i++) {
    assert.strictEqual(res.items[i].chapterNumber, i + 1);
  }
});

console.log('\n================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount}`);
console.log(`PASSED            : ${passCount}`);
console.log(`FAILED            : ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
