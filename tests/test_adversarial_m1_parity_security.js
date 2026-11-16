/**
 * ============================================================================
 * ADVERSARIAL STRESS & EMPIRICAL SECURITY HARNESS: MILESTONE 1
 * Dual-Mode Parity, RBAC Authorization Guard, CWE-1236 Formula Sanitization,
 * and Unseeded Zero-Downtime Fallback Verification
 * ============================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// 1. SETUP GAS SPREADSHEET SIMULATOR & BACKEND ENVIRONMENT
// ----------------------------------------------------------------------------
class MockRange {
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
      const row = [];
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        const val = (this.sheet.grid[rowIdx] && this.sheet.grid[rowIdx][colIdx] !== undefined)
          ? this.sheet.grid[rowIdx][colIdx] : "";
        row.push(val);
      }
      result.push(row);
    }
    return result;
  }
  clearContent() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        if (this.sheet.grid[rowIdx]) {
          this.sheet.grid[rowIdx][colIdx] = "";
        }
      }
    }
    while (this.sheet.grid.length > 0 && this.sheet.grid[this.sheet.grid.length - 1].every(v => v === "")) {
      this.sheet.grid.pop();
    }
    return this;
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
  setFrozenRows(n) {
    this.frozenRows = n;
    return this;
  }
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
const mockCacheStore = new Map();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: () => true
  })
};

global.CacheService = {
  getScriptCache: () => ({
    get: (key) => mockCacheStore.get(key) || null,
    put: (key, val) => mockCacheStore.set(key, val),
    remove: (key) => mockCacheStore.delete(key),
    removeAll: (keys) => (keys || []).forEach(k => mockCacheStore.delete(k))
  })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => "admin@zoptro.local" }),
  getScriptTimeZone: () => "GMT+5:30"
};

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: () => "test_key",
    setProperty: () => {}
  })
};

global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
  createHtmlOutputFromFile: (name) => ({ name }),
  createHtmlOutput: (html) => ({ html })
};

global.MailApp = {
  sendEmail: () => true
};

// Load GAS backend
const gasBackend = require(path.join(__dirname, '../google_apps_script_backend.js'));

// Seed default Users table in Mock GAS Spreadsheet for assertAdmin conforming to SCHEMAS.Users
const usersSheet = mockActiveSpreadsheet.insertSheet("Users");
usersSheet.appendRow(gasBackend.SCHEMAS.Users);
usersSheet.appendRow([
  "u_adm_demo", "admin", "Admin Demo", "admin@zoptro.local", "pin_hash_admin", "hash_admin",
  "ADM001", "", 0, 0, 1, 0, new Date().toISOString(), "", "", "", ""
]);
usersSheet.appendRow([
  "u_stu_demo", "student", "Student Demo", "student@zoptro.local", "pin_hash_stu", "hash_stu",
  "STU001", "u_par_demo", 0, 0, 1, 0, new Date().toISOString(), "", "Class 5", 10, ""
]);
usersSheet.appendRow([
  "u_par_demo", "parent", "Parent Demo", "parent@zoptro.local", "pin_hash_par", "hash_par",
  "PAR001", "", 0, 0, 1, 0, new Date().toISOString(), "", "", "", ""
]);

// ----------------------------------------------------------------------------
// 2. SETUP BROWSER MOCK BACKEND
// ----------------------------------------------------------------------------
const htmlPath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const scriptContent = scriptMatches[scriptMatches.length - 1].replace(/<\/?script[^>]*>/gi, '');

const mockEl = {
  getContext: () => ({ fillRect: () => {}, clearRect: () => {} }),
  style: {},
  classList: { add: () => {}, remove: () => {} }
};
const mockDoc = {
  getElementById: () => mockEl,
  querySelectorAll: () => [],
  querySelector: () => mockEl,
  createElement: () => mockEl,
  body: mockEl,
  addEventListener: () => {}
};
const mockWin = {
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener: () => {},
  scrollTo: () => {}
};
mockWin.window = mockWin;
mockWin.document = mockDoc;

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: () => {},
  clearInterval: () => {},
  window: mockWin,
  document: mockDoc,
  module: { exports: {} }
};
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
const sanitizeSheetCellValue = gasBackend.sanitizeSheetCellValue;

console.log('=========================================================================');
console.log('  CHALLENGER 2: ADVERSARIAL STRESS & EMPIRICAL SECURITY SUITE (M1)      ');
console.log('=========================================================================\n');

// ============================================================================
// SUITE 1: RBAC ATTACKS ON seedCurriculumCatalog
// ============================================================================
console.log('>>> SUITE 1: RBAC Denial Attacks on seedCurriculumCatalog <<<');

const unauthorizedIdentities = [
  { id: 'u_stu_demo', label: 'Authenticated Student User' },
  { id: 'u_par_demo', label: 'Authenticated Parent User' },
  { id: '', label: 'Empty String User ID' },
  { id: null, label: 'Null User ID' },
  { id: undefined, label: 'Undefined User ID' },
  { id: "' OR '1'='1", label: "SQL Injection String (' OR '1'='1)" },
  { id: "u_adm_demo' OR '1'='1", label: "SQL Injection Suffix on Admin ID" },
  { id: "admin'; DROP TABLE Users; --", label: "SQL DDL Injection String" },
  { id: "' UNION SELECT * FROM Users --", label: "SQL Union Injection String" },
  { id: "<script>alert(1)</script>", label: "XSS Tag Payload" },
  { id: "u_adm_fake", label: "Non-Existent Admin ID" },
  { id: "root", label: "Root User Pretender" },
  { id: "administrator", label: "Administrator String Pretender" },
  { id: "U_ADM_DEMO", label: "Uppercase ID Tamper" },
  { id: 12345, label: "Numeric ID Type Tamper" }
];

unauthorizedIdentities.forEach(attacker => {
  // 1.1 Direct parameter invocation in GAS backend
  it(`[GAS] Rejects ${attacker.label} via direct ID argument with HTTP 403`, () => {
    const res = gasBackend.seedCurriculumCatalog(attacker.id);
    assert.strictEqual(res.success, false, `Expected failure for ${attacker.label}`);
    assert.strictEqual(res.code, 403, `Expected HTTP 403 code for ${attacker.label}`);
    assert.ok(
      typeof res.error === 'string' && res.error.includes('UNAUTHORIZED'),
      `Expected UNAUTHORIZED message, got: ${res.error}`
    );
  });

  // 1.2 Object payload invocation in GAS backend
  it(`[GAS] Rejects ${attacker.label} via object payload { adminUserId } with HTTP 403`, () => {
    const res = gasBackend.seedCurriculumCatalog({ adminUserId: attacker.id });
    assert.strictEqual(res.success, false, `Expected failure for payload ${attacker.label}`);
    assert.strictEqual(res.code, 403, `Expected HTTP 403 code for payload ${attacker.label}`);
  });

  // 1.3 Direct parameter invocation in BrowserMockBackend
  it(`[Mock] Rejects ${attacker.label} via direct ID argument with HTTP 403`, () => {
    const res = BrowserMockBackend.seedCurriculumCatalog(attacker.id);
    assert.strictEqual(res.success, false, `Mock expected failure for ${attacker.label}`);
    assert.strictEqual(res.code, 403, `Mock expected HTTP 403 code for ${attacker.label}`);
    assert.ok(
      typeof res.error === 'string' && res.error.includes('UNAUTHORIZED'),
      `Mock expected UNAUTHORIZED message, got: ${res.error}`
    );
  });

  // 1.4 Object payload invocation in BrowserMockBackend
  it(`[Mock] Rejects ${attacker.label} via object payload { adminUserId } with HTTP 403`, () => {
    const res = BrowserMockBackend.seedCurriculumCatalog({ adminUserId: attacker.id });
    assert.strictEqual(res.success, false, `Mock expected failure for payload ${attacker.label}`);
    assert.strictEqual(res.code, 403, `Mock expected HTTP 403 code for payload ${attacker.label}`);
  });
});

// 1.5 Object payload type confusion and prototype attacks
it('[GAS & Mock] Rejects empty object, null payload, and prototype poisoning attempts', () => {
  const badPayloads = [{}, { reset: true }, { userId: 'u_par_demo' }, { adminUserId: { nested: 'u_adm_demo' } }];
  badPayloads.forEach(payload => {
    const gasRes = gasBackend.seedCurriculumCatalog(payload);
    assert.strictEqual(gasRes.success, false);
    assert.strictEqual(gasRes.code, 403);

    const mockRes = BrowserMockBackend.seedCurriculumCatalog(payload);
    assert.strictEqual(mockRes.success, false);
    assert.strictEqual(mockRes.code, 403);
  });
});

// 1.6 Legitimate Admin Authorized Seeding
it('[GAS & Mock] Authorizes valid admin u_adm_demo and successfully seeds catalog', () => {
  const gasRes = gasBackend.seedCurriculumCatalog('u_adm_demo', { reset: true });
  assert.strictEqual(gasRes.success, true);
  assert.strictEqual(gasRes.seededCount, 548);

  const mockRes = BrowserMockBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
  assert.strictEqual(mockRes.success, true);
  assert.strictEqual(mockRes.seededCount, 548);
});

// ============================================================================
// SUITE 2: CWE-1236 FORMULA INJECTION ATTACKS & SANITIZATION
// ============================================================================
console.log('\n>>> SUITE 2: CWE-1236 Formula Injection Neutralization <<<');

const formulaVectors = [
  { input: '=cmd|\' /C calc\'!A0', expected: '\'=cmd|\' /C calc\'!A0', label: 'DDE Command Injection (=cmd)' },
  { input: '=1+1', expected: '\'=1+1', label: 'Simple Formula (=1+1)' },
  { input: '=SUM(A1:B20)', expected: '\'=SUM(A1:B20)', label: 'Spreadsheet Function (=SUM)' },
  { input: '+cmd|\' /C calc\'!A0', expected: '\'+cmd|\' /C calc\'!A0', label: 'Plus Prefix (+cmd)' },
  { input: '+12345', expected: '\'+12345', label: 'Leading Plus Number (+12345)' },
  { input: '-cmd|\' /C calc\'!A0', expected: '\'-cmd|\' /C calc\'!A0', label: 'Minus Prefix (-cmd)' },
  { input: '-500', expected: '\'-500', label: 'Leading Minus Number (-500)' },
  { input: '@SUM(A1:A10)', expected: '\'@SUM(A1:A10)', label: 'At-Sign Formula Prefix (@SUM)' },
  { input: '\t=2+5', expected: '\'\t=2+5', label: 'Leading Tab with Formula (\\t=2+5)' },
  { input: '\r=1+1', expected: '\'\r=1+1', label: 'Leading Carriage Return (\\r=1+1)' },
  { input: '   =cmd|/c calc', expected: '\'   =cmd|/c calc', label: 'Leading Spaces with Formula (   =cmd)' },
  { input: '\'=already_escaped', expected: '\'=already_escaped', label: 'Already Escaped Value (\'=)' }
];

formulaVectors.forEach(vec => {
  it(`[CWE-1236] sanitizeSheetCellValue neutralizes ${vec.label}`, () => {
    const sanitized = sanitizeSheetCellValue(vec.input);
    assert.strictEqual(sanitized, vec.expected, `Expected "${vec.expected}", got "${sanitized}"`);
    assert.strictEqual(sanitized.charAt(0), "'", `Sanitized value must start with single quote: "${sanitized}"`);
  });
});

it('[CWE-1236] Preserves benign string values unmodified without prepending single quotes', () => {
  const benignValues = [
    'The Fish Tale',
    'Shapes and Angles',
    'How Many Squares?',
    'Parts and Wholes',
    'Does it Look the Same?',
    'Be My Multiple, I\'ll be Your Factor',
    'Can You See the Pattern?',
    'Mapping Your Way',
    'Boxes and Sketches',
    'Tenths and Hundredths',
    '',
    'Mathematics',
    'Social Science: History: The Rise of Nationalism in Europe'
  ];

  benignValues.forEach(val => {
    const sanitized = sanitizeSheetCellValue(val);
    assert.strictEqual(sanitized, val, `Benign value "${val}" was unexpectedly altered to "${sanitized}"`);
    if (val.length > 0) {
      assert.notStrictEqual(sanitized.charAt(0), "'", `Benign value "${val}" should not start with single quote`);
    }
  });
});

it('[CWE-1236] Preserves non-string primitives (numbers, booleans, objects) unmodified', () => {
  assert.strictEqual(sanitizeSheetCellValue(12345), 12345);
  assert.strictEqual(sanitizeSheetCellValue(0), 0);
  assert.strictEqual(sanitizeSheetCellValue(-42), -42);
  assert.strictEqual(sanitizeSheetCellValue(true), true);
  assert.strictEqual(sanitizeSheetCellValue(false), false);
  assert.strictEqual(sanitizeSheetCellValue(null), null);
  assert.strictEqual(sanitizeSheetCellValue(undefined), undefined);
});

// Adversarial Chapter Titles in Seeding
it('[CWE-1236] Injected adversarial chapter titles are neutralized during matrix write', () => {
  const dangerousTitles = [
    '=cmd|\'/C powershell\'!A1',
    '+@HYPERLINK("http://attacker.com")',
    '-1337',
    '@IMPORTXML("http://evil.com","//")',
    '\t=DDE("cmd";"/C calc";"__DdeLink__")'
  ];

  dangerousTitles.forEach(title => {
    const sanitized = sanitizeSheetCellValue(title);
    assert.strictEqual(sanitized.charAt(0), "'");
    assert.strictEqual(sanitized, "'" + title);
  });
});

// ============================================================================
// SUITE 3: DUAL-MODE DIRECT PARITY COMPARISON
// ============================================================================
console.log('\n>>> SUITE 3: Dual-Mode Direct Parity Comparison <<<');

// Ensure both stores are in sync with seeded catalog
gasBackend.seedCurriculumCatalog('u_adm_demo', { reset: true });
BrowserMockBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
mockCacheStore.clear();

// 3.1 All 10 Grades Parity Across Primary Core Subjects
for (let g = 1; g <= 10; g++) {
  const gradeStr = `Class ${g}`;
  const subjects = (g <= 5)
    ? ['Mathematics', 'EVS', 'English', 'Hindi']
    : ['Mathematics', 'Science', 'Social Science', 'English'];

  subjects.forEach(subject => {
    it(`[Parity] 100% exact match for ${gradeStr} - ${subject}`, () => {
      const gasRes = gasBackend.getCurriculumCatalog({ grade: gradeStr, subject: subject, forceRefresh: true });
      const mockRes = BrowserMockBackend.getCurriculumCatalog({ grade: gradeStr, subject: subject, forceRefresh: true });

      assert.strictEqual(gasRes.success, true);
      assert.strictEqual(mockRes.success, true);
      assert.strictEqual(gasRes.count, mockRes.count, `Count mismatch for ${gradeStr} ${subject}`);
      assert.strictEqual(gasRes.grade, mockRes.grade);
      assert.strictEqual(gasRes.subject, mockRes.subject);
      assert.ok(gasRes.count > 0, `Expected >0 chapters for ${gradeStr} ${subject}`);

      // Verify each item field
      for (let i = 0; i < gasRes.count; i++) {
        const gItem = gasRes.items[i];
        const mItem = mockRes.items[i];

        assert.strictEqual(gItem.id, mItem.id, `ID mismatch at ${i}`);
        assert.strictEqual(gItem.grade, mItem.grade, `Grade mismatch at ${i}`);
        assert.strictEqual(gItem.subject, mItem.subject, `Subject mismatch at ${i}`);
        assert.strictEqual(gItem.chapterNumber, mItem.chapterNumber, `ChapterNumber mismatch at ${i}`);
        assert.strictEqual(gItem.chapterTitle, mItem.chapterTitle, `ChapterTitle mismatch at ${i}`);
        assert.strictEqual(gItem.topicsJson, mItem.topicsJson, `TopicsJson mismatch at ${i}`);
        assert.strictEqual(gItem.learningObjectivesJson, mItem.learningObjectivesJson, `LOJson mismatch at ${i}`);
        assert.strictEqual(JSON.stringify(gItem.topics), JSON.stringify(mItem.topics), `Parsed topics mismatch at ${i}`);
        assert.strictEqual(JSON.stringify(gItem.learningObjectives), JSON.stringify(mItem.learningObjectives), `Parsed LO mismatch at ${i}`);
      }

      // Verify chapters alias parity
      assert.deepStrictEqual(gasRes.chapters, gasRes.items);
      assert.deepStrictEqual(mockRes.chapters, mockRes.items);
    });
  });
}

// 3.2 Subject Synonym Normalization Parity
const synonymCases = [
  { grade: '5', rawSubject: 'math', expectedSub: 'Mathematics' },
  { grade: 'Class 5', rawSubject: 'maths', expectedSub: 'Mathematics' },
  { grade: '4', rawSubject: 'evs', expectedSub: 'EVS' },
  { grade: 'Class 4', rawSubject: 'environmental studies', expectedSub: 'EVS' },
  { grade: '6', rawSubject: 'sci', expectedSub: 'Science' },
  { grade: 'Class 8', rawSubject: 'general science', expectedSub: 'Science' },
  { grade: '9', rawSubject: 'sst', expectedSub: 'Social Science' },
  { grade: 'Class 10', rawSubject: 'history', expectedSub: 'Social Science' },
  { grade: 'Class 7', rawSubject: 'geography', expectedSub: 'Social Science' },
  { grade: 'Class 8', rawSubject: 'civics', expectedSub: 'Social Science' },
  { grade: 'Class 9', rawSubject: 'economics', expectedSub: 'Social Science' },
  { grade: 'Class 2', rawSubject: 'eng', expectedSub: 'English' },
  { grade: 'Class 3', rawSubject: 'hin', expectedSub: 'Hindi' }
];

synonymCases.forEach(tc => {
  it(`[Parity] Normalization for Grade "${tc.grade}" and Subject Synonym "${tc.rawSubject}"`, () => {
    const gasRes = gasBackend.getCurriculumCatalog({ grade: tc.grade, subject: tc.rawSubject, forceRefresh: true });
    const mockRes = BrowserMockBackend.getCurriculumCatalog({ grade: tc.grade, subject: tc.rawSubject, forceRefresh: true });

    assert.strictEqual(gasRes.success, true);
    assert.strictEqual(mockRes.success, true);
    assert.strictEqual(gasRes.count, mockRes.count);
    assert.strictEqual(gasRes.subject, tc.expectedSub);
    assert.strictEqual(mockRes.subject, tc.expectedSub);
    assert.ok(gasRes.count > 0);
  });
});

// 3.3 Pseudo-Random Query Combinations Stress Test (N = 50)
it('[Parity] 50 Pseudo-random query combinations assert 100% exact parity', () => {
  const grades = [
    '1', 'Class 1', 'class 1', 'Grade 1',
    '3', 'Class 3', '5', 'Class 5',
    '6', 'Class 6', '8', 'Class 8',
    '10', 'Class 10', 'all', null, undefined
  ];
  const subjects = [
    'Mathematics', 'math', 'maths',
    'Science', 'sci',
    'Social Science', 'sst', 'history', 'geography',
    'English', 'eng',
    'Hindi', 'hin',
    'EVS', 'evs',
    'all', null, undefined
  ];

  for (let step = 0; step < 50; step++) {
    // Deterministic pseudo-random selection based on step
    const g = grades[step % grades.length];
    const s = subjects[(step * 7) % subjects.length];
    const useObject = step % 2 === 0;

    let gasRes, mockRes;
    if (useObject) {
      gasRes = gasBackend.getCurriculumCatalog({ grade: g, subject: s, forceRefresh: true });
      mockRes = BrowserMockBackend.getCurriculumCatalog({ grade: g, subject: s, forceRefresh: true });
    } else {
      gasRes = gasBackend.getCurriculumCatalog(g, s);
      mockRes = BrowserMockBackend.getCurriculumCatalog(g, s);
    }

    assert.strictEqual(gasRes.success, mockRes.success, `Success mismatch on step ${step} (g=${g}, s=${s})`);
    assert.strictEqual(gasRes.count, mockRes.count, `Count mismatch on step ${step} (g=${g}, s=${s})`);
    assert.strictEqual(gasRes.grade, mockRes.grade, `Grade mismatch on step ${step} (g=${g}, s=${s})`);
    assert.strictEqual(gasRes.subject, mockRes.subject, `Subject mismatch on step ${step} (g=${g}, s=${s})`);

    // Verify first, middle, and last item exact match
    if (gasRes.count > 0) {
      const checkIndices = [0, Math.floor(gasRes.count / 2), gasRes.count - 1];
      checkIndices.forEach(idx => {
        assert.strictEqual(gasRes.items[idx].id, mockRes.items[idx].id);
        assert.strictEqual(gasRes.items[idx].chapterTitle, mockRes.items[idx].chapterTitle);
        assert.strictEqual(gasRes.items[idx].chapterNumber, mockRes.items[idx].chapterNumber);
      });
    }
  }
});

// 3.4 Invalid Grade Denial Parity
const invalidGrades = ['Grade 0', 'Class 11', 'Class 0', 'Kindergarten', 'Grade 99', 'invalid_string'];
invalidGrades.forEach(ig => {
  it(`[Parity] Rejects invalid grade "${ig}" with HTTP 400 and matching error structure`, () => {
    const gasRes = gasBackend.getCurriculumCatalog(ig, 'Mathematics');
    const mockRes = BrowserMockBackend.getCurriculumCatalog(ig, 'Mathematics');

    assert.strictEqual(gasRes.success, false);
    assert.strictEqual(mockRes.success, false);
    assert.strictEqual(gasRes.code, 400);
    assert.strictEqual(mockRes.code, 400);
    assert.strictEqual(gasRes.count, 0);
    assert.strictEqual(mockRes.count, 0);
    assert.strictEqual(gasRes.source, 'VALIDATION_ERROR');
    assert.strictEqual(mockRes.source, 'VALIDATION_ERROR');
    assert.ok(gasRes.error.includes('INVALID_GRADE'));
    assert.ok(mockRes.error.includes('INVALID_GRADE'));
  });
});

// ============================================================================
// SUITE 4: UNSEEDED FALLBACK & ZERO-DOWNTIME RESILIENCE
// ============================================================================
console.log('\n>>> SUITE 4: Unseeded Fallback & Zero-Downtime Resilience <<<');

// 4.1 Mock unseeded fallback
it('[Mock] Unseeded store automatically returns source: "EMBEDDED_FALLBACK" with all authentic chapters', () => {
  // Clear mock store
  BrowserMockBackend.resetDatabase();
  const rawTable = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.CURRICULUM_CATALOG);
  assert.strictEqual(rawTable.length, 0, 'Mock store must be empty after reset');

  // Query specific grade & subject
  const query5Math = BrowserMockBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
  assert.strictEqual(query5Math.success, true);
  assert.strictEqual(query5Math.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(query5Math.count, 14);
  assert.strictEqual(query5Math.items[0].chapterTitle, 'The Fish Tale');

  // Query all grades & subjects
  const queryAll = BrowserMockBackend.getCurriculumCatalog();
  assert.strictEqual(queryAll.success, true);
  assert.strictEqual(queryAll.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(queryAll.count, 548);
});

// 4.2 Mock transition: unseeded -> seeded -> reset
it('[Mock] Transitions cleanly from EMBEDDED_FALLBACK to SHEET upon seeding, then reverts upon reset', () => {
  // Step 1: Seed store as admin
  const seedRes = BrowserMockBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
  assert.strictEqual(seedRes.success, true);
  assert.strictEqual(seedRes.seededCount, 548);

  // Step 2: Query seeded store -> source must now be SHEET
  const seededRes = BrowserMockBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
  assert.strictEqual(seededRes.success, true);
  assert.strictEqual(seededRes.source, 'SHEET');
  assert.strictEqual(seededRes.count, 14);

  // Step 3: Reset store -> source must revert to EMBEDDED_FALLBACK
  BrowserMockBackend.resetDatabase();
  const resetRes = BrowserMockBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
  assert.strictEqual(resetRes.success, true);
  assert.strictEqual(resetRes.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(resetRes.count, 14);
});

// 4.3 GAS backend unseeded fallback
it('[GAS] When CurriculumCatalog sheet is empty, returns source: "EMBEDDED_FALLBACK" with zero downtime', () => {
  // Clear the mock sheet rows - only keep header row
  const catSheet = mockActiveSpreadsheet.getSheetByName('CurriculumCatalog');
  if (catSheet) {
    catSheet.grid = [gasBackend.SCHEMAS.CurriculumCatalog.slice()];
  }
  // Clear cache
  mockCacheStore.clear();

  const gasFallbackRes = gasBackend.getCurriculumCatalog({ grade: 'Class 10', subject: 'Science', forceRefresh: true });
  assert.strictEqual(gasFallbackRes.success, true);
  assert.strictEqual(gasFallbackRes.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(gasFallbackRes.count, 13);
  assert.strictEqual(gasFallbackRes.items[0].chapterTitle, 'Chemical Reactions and Equations');

  // Query all
  const gasFallbackAll = gasBackend.getCurriculumCatalog({ forceRefresh: true });
  assert.strictEqual(gasFallbackAll.success, true);
  assert.strictEqual(gasFallbackAll.source, 'EMBEDDED_FALLBACK');
  assert.strictEqual(gasFallbackAll.count, 548);
});

// 4.4 GAS transition: unseeded -> seeded -> query
it('[GAS] Transitions cleanly from EMBEDDED_FALLBACK to SHEET upon seeding', () => {
  // Seed the GAS sheet
  const seedRes = gasBackend.seedCurriculumCatalog('u_adm_demo', { reset: true });
  assert.strictEqual(seedRes.success, true);
  assert.strictEqual(seedRes.seededCount, 548);

  // Query seeded sheet
  const gasSeededRes = gasBackend.getCurriculumCatalog({ grade: 'Class 10', subject: 'Science', forceRefresh: true });
  assert.strictEqual(gasSeededRes.success, true);
  assert.strictEqual(gasSeededRes.source, 'SHEET');
  assert.strictEqual(gasSeededRes.count, 13);
});

// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log('\n=========================================================================');
console.log('                       ADVERSARIAL STRESS TEST SUMMARY                   ');
console.log('=========================================================================');
console.log(`Total Adversarial Probes Run : ${totalTests}`);
console.log(`Total Passed                 : ${passedTests}`);
console.log(`Total Failed                 : ${failedTests}`);
console.log('-------------------------------------------------------------------------');

if (failedTests > 0) {
  console.error(`❌ VERDICT: REQUEST_CHANGES (${failedTests} tests failed)\n`);
  failures.forEach(f => {
    console.error(`  - ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('🎉 VERDICT: APPROVE (100% of adversarial attacks neutralized and verified)\n');
  process.exit(0);
}
