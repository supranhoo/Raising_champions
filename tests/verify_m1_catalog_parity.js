/**
 * =========================================================================
 * MILESTONE 1 VERIFICATION: CANONICAL CBSE/NCERT CATALOG & DUAL-MODE PARITY
 * =========================================================================
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('=========================================================================');
console.log('  MILESTONE 1: VERIFICATION & COMPLIANCE TEST SUITE');
console.log('=========================================================================');

// -------------------------------------------------------------------------
// 1. VERIFY STANDALONE DATASET: curriculum_catalog_data.js
// -------------------------------------------------------------------------
console.log('\n>>> SECTION 1: Standalone Dataset (curriculum_catalog_data.js) <<<');
const dataModule = require('../curriculum_catalog_data.js');
const catalog = dataModule.CANONICAL_CURRICULUM_CATALOG;
const schema = dataModule.CURRICULUM_CATALOG_SCHEMA;

assert.ok(Array.isArray(catalog), 'CANONICAL_CURRICULUM_CATALOG must be an array');
assert.ok(catalog.length >= 500, `Expected at least 500 chapters, found ${catalog.length}`);
console.log(`✔ Total chapters: ${catalog.length} (exceeds 500 threshold)`);

const expectedCols = ["id", "grade", "subject", "chapterNumber", "chapterTitle", "topicsJson", "learningObjectivesJson"];
assert.deepStrictEqual(schema, expectedCols, 'Schema must match Table 16 exactly');

const idSet = new Set();
const gradeCounts = {};

catalog.forEach((item, idx) => {
  assert.ok(item.id, `Item ${idx} missing id`);
  assert.ok(!idSet.has(item.id), `Duplicate id found: ${item.id}`);
  idSet.add(item.id);

  expectedCols.forEach(col => {
    assert.ok(item[col] !== undefined && item[col] !== null, `Item ${item.id} missing column ${col}`);
  });

  const parsedTopics = JSON.parse(item.topicsJson);
  const parsedObjectives = JSON.parse(item.learningObjectivesJson);
  assert.ok(Array.isArray(parsedTopics) && parsedTopics.length > 0, `Item ${item.id} topics empty`);
  assert.ok(Array.isArray(parsedObjectives) && parsedObjectives.length > 0, `Item ${item.id} objectives empty`);

  assert.ok(Array.isArray(item.topics), `Item ${item.id} missing parsed topics array`);
  assert.ok(Array.isArray(item.learningObjectives), `Item ${item.id} missing parsed learningObjectives array`);

  gradeCounts[item.grade] = (gradeCounts[item.grade] || 0) + 1;
});

for (let g = 1; g <= 10; g++) {
  const gStr = 'Class ' + g;
  assert.ok(gradeCounts[gStr] > 0, `Missing grade ${gStr} in catalog`);
}
console.log(`✔ All 10 grades (Class 1 to 10) validated with complete 7-column schema and unique IDs.`);

// Matrix conversion check
const matrix = dataModule.toTable16Matrix();
assert.strictEqual(matrix.length, catalog.length);
assert.strictEqual(matrix[0].length, 7);
console.log(`✔ toTable16Matrix() generated ${matrix.length} rows with 7 columns for atomic setValues().`);

// Universal export check
const browserCtx = { window: {} };
vm.createContext(browserCtx);
vm.runInContext(fs.readFileSync('curriculum_catalog_data.js', 'utf8'), browserCtx);
assert.ok(browserCtx.window.ZOPTRO_CURRICULUM_CATALOG, 'Browser export window.ZOPTRO_CURRICULUM_CATALOG missing');
assert.ok(browserCtx.window.CANONICAL_CURRICULUM_CATALOG, 'Browser export window.CANONICAL_CURRICULUM_CATALOG missing');

const gasCtx = {};
vm.createContext(gasCtx);
vm.runInContext(fs.readFileSync('curriculum_catalog_data.js', 'utf8'), gasCtx);
assert.ok(gasCtx.CANONICAL_CURRICULUM_CATALOG, 'GAS global CANONICAL_CURRICULUM_CATALOG missing');
console.log('✔ Universal polyglot export verified in Node.js, Browser window, and GAS global scopes.');

// -------------------------------------------------------------------------
// 2. VERIFY BACKEND ARCHITECTURE: google_apps_script_backend.js
// -------------------------------------------------------------------------
console.log('\n>>> SECTION 2: Backend Architecture (google_apps_script_backend.js) <<<');
const gasBackend = require('../google_apps_script_backend.js');

// Schema verification
assert.ok(gasBackend.SCHEMAS.CurriculumCatalog, 'SCHEMAS.CurriculumCatalog must exist');
assert.deepStrictEqual(gasBackend.SCHEMAS.CurriculumCatalog, expectedCols);
assert.strictEqual(gasBackend.SCHEMAS.SyllabusCatalog, gasBackend.SCHEMAS.CurriculumCatalog, 'SyllabusCatalog alias must match CurriculumCatalog');
console.log('✔ Table 16 CurriculumCatalog schema and SyllabusCatalog alias verified in SCHEMAS.');

// Normalization verification
assert.strictEqual(gasBackend.normalizeGrade('5'), 'Class 5');
assert.strictEqual(gasBackend.normalizeGrade('class 10'), 'Class 10');
assert.strictEqual(gasBackend.normalizeGrade('all'), null);
assert.strictEqual(gasBackend.normalizeSubject('math'), 'Mathematics');
assert.strictEqual(gasBackend.normalizeSubject('sst'), 'Social Science');
assert.strictEqual(gasBackend.normalizeSubject('evs'), 'EVS');
assert.strictEqual(gasBackend.normalizeSubject('all'), null);
console.log('✔ Grade and subject normalization helpers verified across diverse inputs.');

// getCurriculumCatalog verification (polymorphic, fallback, sort)
const getRes1 = gasBackend.getCurriculumCatalog('Class 5', 'Mathematics');
assert.strictEqual(getRes1.success, true);
assert.strictEqual(getRes1.source, 'EMBEDDED_FALLBACK');
assert.strictEqual(getRes1.count, 14);
assert.strictEqual(getRes1.items.length, 14);
assert.strictEqual(getRes1.chapters.length, 14);
assert.strictEqual(getRes1.items[0].chapterNumber, 1);
assert.strictEqual(getRes1.items[0].chapterTitle, 'The Fish Tale');

const getRes2 = gasBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
assert.strictEqual(getRes2.count, getRes1.count);

const getResAll = gasBackend.getCurriculumCatalog();
assert.strictEqual(getResAll.success, true);
assert.strictEqual(getResAll.count, catalog.length);
console.log(`✔ getCurriculumCatalog verified (polymorphic payload, fallback source, sorting, dual-format items).`);

// Invalid grade error behavior
const invalidGradeRes = gasBackend.getCurriculumCatalog('Grade 99');
assert.strictEqual(invalidGradeRes.success, false);
assert.strictEqual(invalidGradeRes.code, 400);
console.log('✔ getCurriculumCatalog rejects invalid grade with HTTP 400.');

// seedCurriculumCatalog verification (RBAC & concurrency)
const unauthSeed = gasBackend.seedCurriculumCatalog('u_stu_demo');
assert.strictEqual(unauthSeed.success, false);
assert.strictEqual(unauthSeed.code, 403);
console.log('✔ seedCurriculumCatalog rejects non-admin caller with HTTP 403.');

// CWE-1236 formula sanitization check
assert.strictEqual(gasBackend.sanitizeSheetCellValue('=cmd|/c calc'), "'=cmd|/c calc");
assert.strictEqual(gasBackend.sanitizeSheetCellValue('@SUM(A1:A10)'), "'@SUM(A1:A10)");
assert.strictEqual(gasBackend.sanitizeSheetCellValue(123), 123);
console.log('✔ CWE-1236 formula injection sanitization validated.');

// -------------------------------------------------------------------------
// 3. VERIFY CLIENT & BROWSER MOCK: divyank_mission_control_google_apps_script_app.html
// -------------------------------------------------------------------------
console.log('\n>>> SECTION 3: BrowserMockBackend & ZoptroApiClient Parity <<<');
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

const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

assert.strictEqual(BrowserMockBackend.KEYS.CURRICULUM_CATALOG, 'zoptro_db_curriculum_catalog');
assert.strictEqual(BrowserMockBackend.KEYS.SYLLABUS_CATALOG, 'zoptro_db_curriculum_catalog');
console.log('✔ BrowserMockBackend KEYS.CURRICULUM_CATALOG and SYLLABUS_CATALOG registered.');

BrowserMockBackend.resetDatabase();
const mockFallbackRes = BrowserMockBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
assert.strictEqual(mockFallbackRes.success, true);
assert.strictEqual(mockFallbackRes.source, 'EMBEDDED_FALLBACK');
assert.strictEqual(mockFallbackRes.count, 14);
console.log('✔ BrowserMockBackend embedded fallback verified: 14 chapters returned on clean reset.');

// Admin seeding into mock store
const mockAdminSeed = BrowserMockBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo' });
assert.strictEqual(mockAdminSeed.success, true);
assert.strictEqual(mockAdminSeed.seededCount, catalog.length);
console.log(`✔ BrowserMockBackend admin seeding verified: seededCount = ${mockAdminSeed.seededCount}.`);

// Query after seeding
const mockSeededRes = BrowserMockBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
assert.strictEqual(mockSeededRes.success, true);
assert.strictEqual(mockSeededRes.source, 'SHEET');
assert.strictEqual(mockSeededRes.count, 14);
console.log('✔ BrowserMockBackend post-seed query verified: source = SHEET.');

// -------------------------------------------------------------------------
// 4. DUAL-MODE PARITY VERIFICATION
// -------------------------------------------------------------------------
console.log('\n>>> SECTION 4: Dual-Mode Exact Parity Verification <<<');
const testCases = [
  { grade: 'Class 1', subject: 'Mathematics', expectedCount: 13 },
  { grade: 'Class 3', subject: 'Mathematics', expectedCount: 14 },
  { grade: 'Class 5', subject: 'Mathematics', expectedCount: 14 },
  { grade: 'Class 6', subject: 'Science', expectedCount: 12 },
  { grade: 'Class 10', subject: 'Mathematics', expectedCount: 14 },
  { grade: 'Class 10', subject: 'Science', expectedCount: 13 }
];

testCases.forEach(tc => {
  const gasRes = gasBackend.getCurriculumCatalog(tc.grade, tc.subject);
  const mockRes = BrowserMockBackend.getCurriculumCatalog(tc.grade, tc.subject);

  assert.strictEqual(gasRes.count, tc.expectedCount, `GAS count mismatch for ${tc.grade} ${tc.subject}`);
  assert.strictEqual(mockRes.count, tc.expectedCount, `Mock count mismatch for ${tc.grade} ${tc.subject}`);
  assert.strictEqual(gasRes.count, mockRes.count, `Parity count mismatch for ${tc.grade} ${tc.subject}`);

  for (let i = 0; i < gasRes.count; i++) {
    const gItem = gasRes.items[i];
    const mItem = mockRes.items[i];
    assert.strictEqual(gItem.id, mItem.id, `ID parity mismatch at index ${i}`);
    assert.strictEqual(gItem.chapterTitle, mItem.chapterTitle, `Title parity mismatch at index ${i}`);
    assert.strictEqual(gItem.chapterNumber, mItem.chapterNumber, `Number parity mismatch at index ${i}`);
    assert.strictEqual(JSON.stringify(gItem.topics), JSON.stringify(mItem.topics), `Topics parity mismatch at index ${i}`);
    assert.strictEqual(JSON.stringify(gItem.learningObjectives), JSON.stringify(mItem.learningObjectives), `Objectives parity mismatch at index ${i}`);
  }
  console.log(`✔ 100% Parity verified for ${tc.grade} ${tc.subject} (${tc.expectedCount} chapters).`);
});

// ZoptroApiClient asynchronous dispatch test
ZoptroApiClient.getCurriculumCatalog({ grade: 'Class 7', subject: 'Science' }).then(res => {
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.count, 13);
  console.log('✔ ZoptroApiClient.getCurriculumCatalog asynchronous wrapper verified (13 chapters).');
  console.log('\n=========================================================================');
  console.log('🎉 ALL MILESTONE 1 VERIFICATION CHECKS PASSED (100% COMPLIANT)');
  console.log('=========================================================================');
});
