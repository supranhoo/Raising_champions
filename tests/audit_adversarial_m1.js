/**
 * Forensic Audit Adversarial Stress-Test Suite for Milestone 1 Deliverables
 * Author: Forensic Auditor Agent (auditor_m1)
 */

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('=============================================================');
console.log('  FORENSIC AUDIT ADVERSARIAL STRESS-TEST SUITE: MILESTONE 1  ');
console.log('=============================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------------------
// 1. Load Modules
// -------------------------------------------------------------------------
const catalogModule = require('../curriculum_catalog_data.js');
const canonicalCatalog = catalogModule.CANONICAL_CURRICULUM_CATALOG;
const gasBackend = require('../google_apps_script_backend.js');

// Load BrowserMockBackend and ZoptroApiClient from HTML
const htmlContent = fs.readFileSync('divyank_mission_control_google_apps_script_app.html', 'utf8');
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const scriptContent = scriptMatches[scriptMatches.length - 1].replace(/<\/?script[^>]*>/gi, '');

const mockEl = { getContext: () => ({}), style: {}, classList: { add: () => {}, remove: () => {} } };
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

const browserMock = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend || mockWin.BrowserMockBackend;
const apiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient || mockWin.ZoptroApiClient;

assert.ok(browserMock, 'BrowserMockBackend must be loaded');
assert.ok(apiClient, 'ZoptroApiClient must be loaded');

console.log('\n--- SUITE 1: ADVERSARIAL INPUTS & QUERY ROBUSTNESS ---');

runTest('Invalid grade "Class 11" returns 400 validation error in GAS backend', () => {
  const res = gasBackend.getCurriculumCatalog('Class 11', 'Mathematics');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 400);
  assert.strictEqual(res.source, 'VALIDATION_ERROR');
  assert.strictEqual(res.count, 0);
  assert.ok(res.error.includes('INVALID_GRADE'));
});

runTest('Invalid grade "Class 0" returns 400 validation error in BrowserMockBackend', () => {
  const res = browserMock.getCurriculumCatalog('Class 0', 'Mathematics');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 400);
  assert.strictEqual(res.source, 'VALIDATION_ERROR');
  assert.strictEqual(res.count, 0);
  assert.ok(res.error.includes('INVALID_GRADE'));
});

runTest('Non-numeric / gibberish grade "Grade X" returns 400 validation error', () => {
  const res = gasBackend.getCurriculumCatalog('Grade X', 'Mathematics');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 400);
});

runTest('Unknown subject "Astrophysics" returns count: 0 and empty items without crashing', () => {
  const res = gasBackend.getCurriculumCatalog('Class 10', 'Astrophysics');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.count, 0);
  assert.deepStrictEqual(res.items, []);
  assert.deepStrictEqual(res.chapters, []);
});

runTest('Case and whitespace insensitive grade and subject normalization ("  cLass 5  ", "  mAtHs  ")', () => {
  const res = gasBackend.getCurriculumCatalog('  cLass 5  ', '  mAtHs  ');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.grade, 'Class 5');
  assert.strictEqual(res.subject, 'Mathematics');
  assert.strictEqual(res.count, 14);
});

runTest('Querying "sst" or "Social Science" resolves correctly to Social Science chapters', () => {
  const resSst = gasBackend.getCurriculumCatalog('Class 9', 'sst');
  const resSoc = gasBackend.getCurriculumCatalog('Class 9', 'Social Science');
  assert.strictEqual(resSst.count, 20);
  assert.strictEqual(resSoc.count, 20);
  assert.strictEqual(resSst.items[0].subject, 'Social Science');
});

runTest('Sub-discipline queries like "Economics" normalize to CBSE core subject "Social Science"', () => {
  const res = gasBackend.getCurriculumCatalog('Class 10', 'Economics');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.subject, 'Social Science');
  assert.strictEqual(res.count, 22);
  const econChapters = res.items.filter(ch => ch.subSubject === 'Economics');
  assert.strictEqual(econChapters.length, 5);
});

console.log('\n--- SUITE 2: RBAC ENFORCEMENT & UNAUTHORIZED MUTATION ---');

runTest('Student user "u_stu_demo" rejected from seedCurriculumCatalog with HTTP 403 in GAS backend', () => {
  const res = gasBackend.seedCurriculumCatalog('u_stu_demo');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 403);
  assert.ok(res.error.includes('UNAUTHORIZED'));
});

runTest('Parent user "u_par_demo" rejected from seedCurriculumCatalog with HTTP 403', () => {
  const res = gasBackend.seedCurriculumCatalog('u_par_demo');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 403);
});

runTest('Empty string caller rejected from seedCurriculumCatalog with HTTP 403', () => {
  const res = gasBackend.seedCurriculumCatalog('');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 403);
});

runTest('Null / undefined caller rejected from seedCurriculumCatalog with HTTP 403', () => {
  const res1 = gasBackend.seedCurriculumCatalog(null);
  assert.strictEqual(res1.success, false);
  assert.strictEqual(res1.code, 403);
  const res2 = gasBackend.seedCurriculumCatalog();
  assert.strictEqual(res2.success, false);
  assert.strictEqual(res2.code, 403);
});

runTest('BrowserMockBackend rejects student user "u_stu_demo" with HTTP 403', () => {
  const res = browserMock.seedCurriculumCatalog({ adminUserId: 'u_stu_demo' });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.code, 403);
  assert.ok(res.error.includes('UNAUTHORIZED'));
});

runTest('BrowserMockBackend accepts admin user "u_adm_demo" and seeds catalog', () => {
  browserMock.resetDatabase();
  const res = browserMock.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.seededCount, 548);
});

console.log('\n--- SUITE 3: CWE-1236 FORMULA INJECTION SANITIZATION ---');

runTest('Formula triggers = + - @ are prepended with apostrophe in sanitizeSheetCellValue', () => {
  const payloads = [
    '=SUM(A1:B10)',
    '+123456789',
    '-cmd|"/C calc"!A0',
    '@SUM(A1)',
    '  =1+1',
    '\t=malicious_formula()',
    '\n=dangerous()'
  ];

  payloads.forEach(p => {
    const sanitized = gasBackend.sanitizeSheetCellValue(p);
    assert.ok(sanitized.startsWith("'"), `Expected '${sanitized}' to start with apostrophe for payload: '${p}'`);
  });
});

runTest('Standard strings and numbers are preserved untouched by sanitizeSheetCellValue', () => {
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Mathematics'), 'Mathematics');
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(42), 42);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue(true), true);
  assert.strictEqual(gasBackend.sanitizeSheetCellValue('Class 10'), 'Class 10');
});

console.log('\n--- SUITE 4: DYNAMIC SORTING & NUMERIC STABILITY ---');

runTest('Stable sorting sorts chapterNumber numerically (1, 2 ... 9, 10, 11) rather than lexicographically', () => {
  const res = gasBackend.getCurriculumCatalog('Class 1', 'Hindi'); // 19 chapters
  assert.strictEqual(res.count, 19);
  for (let i = 0; i < res.items.length; i++) {
    assert.strictEqual(res.items[i].chapterNumber, i + 1, `Expected chapterNumber ${i + 1} at index ${i}`);
  }
});

runTest('Multi-grade query sorts grades in numeric order (1 through 10)', () => {
  const res = gasBackend.getCurriculumCatalog('all', 'Mathematics');
  assert.strictEqual(res.success, true);
  assert.ok(res.count >= 100);

  let prevGradeNum = 0;
  res.items.forEach(ch => {
    const gradeNum = parseInt(ch.grade.replace(/\D/g, ''), 10);
    assert.ok(gradeNum >= prevGradeNum, `Grade ordering violated: ${gradeNum} appeared after ${prevGradeNum}`);
    prevGradeNum = gradeNum;
  });
});

console.log('\n--- SUITE 5: FACADE & HARDCODED RESULT DETECTION ---');

runTest('Response items are not static fixtures: querying different subjects yields different results', () => {
  const math = gasBackend.getCurriculumCatalog('Class 10', 'Mathematics');
  const sci = gasBackend.getCurriculumCatalog('Class 10', 'Science');
  const eng = gasBackend.getCurriculumCatalog('Class 10', 'English');
  const soc = gasBackend.getCurriculumCatalog('Class 10', 'Social Science');

  assert.notStrictEqual(math.count, sci.count);
  assert.notStrictEqual(math.count, eng.count);
  assert.notStrictEqual(sci.count, soc.count);
  assert.notStrictEqual(math.items[0].chapterTitle, sci.items[0].chapterTitle);
  assert.notStrictEqual(eng.items[0].chapterTitle, soc.items[0].chapterTitle);
});

runTest('Topics and learning objectives parse dynamically to matching string arrays', () => {
  const res = gasBackend.getCurriculumCatalog('Class 7', 'Science');
  assert.strictEqual(res.count, 13);
  res.items.forEach(ch => {
    assert.ok(Array.isArray(ch.topics), `ch.topics must be array for ${ch.id}`);
    assert.ok(Array.isArray(ch.learningObjectives), `ch.learningObjectives must be array for ${ch.id}`);
    assert.ok(ch.topics.length > 0, `ch.topics cannot be empty for ${ch.id}`);
    assert.ok(ch.learningObjectives.length > 0, `ch.learningObjectives cannot be empty for ${ch.id}`);
    assert.strictEqual(ch.topicsJson, JSON.stringify(ch.topics));
    assert.strictEqual(ch.learningObjectivesJson, JSON.stringify(ch.learningObjectives));
  });
});

console.log('\n=============================================================');
console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests.`);
console.log('=============================================================');

if (failedTests > 0) {
  process.exit(1);
}
