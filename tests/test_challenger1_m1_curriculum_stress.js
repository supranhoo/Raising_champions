/**
 * =========================================================================
 * EMPIRICAL CHALLENGER TEST SUITE: MILESTONE 1 CURRICULUM CATALOG & QUERY STRESS
 * =========================================================================
 * Author: Challenger Agent (challenger_1_m1)
 * Target: curriculum_catalog_data.js, google_apps_script_backend.js,
 *         divyank_mission_control_google_apps_script_app.html
 * =========================================================================
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('=========================================================================');
console.log('  CHALLENGER 1: MILESTONE 1 ADVERSARIAL STRESS TEST SUITE');
console.log('=========================================================================');

const results = {
  passed: 0,
  failed: 0,
  findings: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.failed++;
    console.log(`  [FAIL] ${name}`);
    console.log(`         Error: ${err.message}`);
    results.findings.push({ name, error: err.message });
  }
}

// -------------------------------------------------------------------------
// 1. DATASET INTEGRITY & 548 CANONICAL RECORDS
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 1: Canonical Dataset Rigor (curriculum_catalog_data.js) <<<');
const dataModule = require('../curriculum_catalog_data.js');
const catalog = dataModule.CANONICAL_CURRICULUM_CATALOG;

test('1.1 Exact Chapter Count: Catalog has exactly 548 records', () => {
  assert.strictEqual(catalog.length, 548, `Expected exactly 548 chapters, found ${catalog.length}`);
});

test('1.2 Primary Key Invariance: All 548 IDs are globally unique', () => {
  const ids = new Set();
  catalog.forEach((item, idx) => {
    assert.ok(item.id, `Item ${idx} missing id`);
    assert.ok(!ids.has(item.id), `Duplicate id: ${item.id}`);
    ids.add(item.id);
  });
  assert.strictEqual(ids.size, 548);
});

test('1.3 Schema Compliance: Every chapter has all 7 Table 16 fields', () => {
  const reqFields = ["id", "grade", "subject", "chapterNumber", "chapterTitle", "topicsJson", "learningObjectivesJson"];
  catalog.forEach(item => {
    reqFields.forEach(col => {
      assert.ok(item[col] !== undefined && item[col] !== null, `Item ${item.id} missing ${col}`);
      if (typeof item[col] === 'string') {
        assert.ok(item[col].trim().length > 0, `Item ${item.id} field ${col} is empty string`);
      }
    });
  });
});

test('1.4 JSON Validity: topicsJson & learningObjectivesJson parse to non-empty string arrays', () => {
  catalog.forEach(item => {
    const t = JSON.parse(item.topicsJson);
    const lo = JSON.parse(item.learningObjectivesJson);
    assert.ok(Array.isArray(t) && t.length > 0, `Item ${item.id} topicsJson is empty array`);
    assert.ok(Array.isArray(lo) && lo.length > 0, `Item ${item.id} loJson is empty array`);
    assert.deepStrictEqual(t, item.topics, `Item ${item.id} topics array mismatch`);
    assert.deepStrictEqual(lo, item.learningObjectives, `Item ${item.id} learningObjectives array mismatch`);
  });
});

test('1.5 Chapter Number Contiguity across single-book subjects', () => {
  const singleBookSubjects = ['Mathematics', 'Science', 'EVS', 'English', 'Hindi'];
  for (let g = 1; g <= 10; g++) {
    const gradeStr = `Class ${g}`;
    for (const sub of singleBookSubjects) {
      const chs = catalog.filter(c => c.grade === gradeStr && c.subject === sub);
      if (chs.length > 0) {
        chs.forEach((c, i) => {
          assert.strictEqual(c.chapterNumber, i + 1, `Grade ${gradeStr} Subject ${sub} expected ch ${i+1}, got ${c.chapterNumber}`);
        });
      }
    }
  }
});

test('1.6 Sub-Discipline Contiguity in Social Science (Classes 6-10)', () => {
  for (let g = 6; g <= 10; g++) {
    const gradeStr = `Class ${g}`;
    const sstChs = catalog.filter(c => c.grade === gradeStr && c.subject === 'Social Science');
    if (g === 6) {
      sstChs.forEach((c, i) => {
        assert.strictEqual(c.chapterNumber, i + 1, `Class 6 Social Science ch ${i+1} mismatch`);
      });
    } else {
      const subDisciplines = [...new Set(sstChs.map(c => c.subSubject).filter(Boolean))];
      assert.ok(subDisciplines.length >= 3, `Expected at least 3 sub-disciplines for ${gradeStr}`);
      for (const disc of subDisciplines) {
        const discChs = sstChs.filter(c => c.subSubject === disc);
        discChs.forEach((c, i) => {
          assert.strictEqual(c.chapterNumber, i + 1, `${gradeStr} ${disc} expected ch ${i+1}, got ${c.chapterNumber}`);
        });
      }
    }
  }
});

// -------------------------------------------------------------------------
// 2. QUERY NORMALIZATION & VARIATION STRESS
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 2: Query Normalization, Casing, Spacing & Type Variations <<<');
const gas = require('../google_apps_script_backend.js');

test('2.1 Grade variations across Classes 1-10 (numeric, string, whitespace, prefixes)', () => {
  for (let g = 1; g <= 10; g++) {
    const expectedGrade = `Class ${g}`;
    const variations = [
      g,
      String(g),
      `  ${g}  `,
      `class ${g}`,
      `Class ${g}`,
      `CLASS ${g}`,
      `cLaSs   ${g}`,
      `grade ${g}`,
      `Grade ${g}`,
      `GRADE ${g}`,
      `class${g}`,
      `grade${g}`
    ];
    for (const v of variations) {
      const norm = gas.normalizeGrade(v);
      assert.strictEqual(norm, expectedGrade, `normalizeGrade failed for ${JSON.stringify(v)}, expected ${expectedGrade}, got ${norm}`);
    }
  }
});

test('2.2 Subject irregular casing and spacing resolution', () => {
  const mathPermutations = [
    'mathematics', 'Mathematics', 'MATHEMATICS', '  mathematics  ', 'mAtH', 'MATHS',
    'math-magic', 'Joyful Mathematics', 'Maths Mela', 'ganita prakash'
  ];
  for (const s of mathPermutations) {
    const res = gas.getCurriculumCatalog('Class 5', s);
    assert.strictEqual(res.success, true, `Query failed for subject variation: ${s}`);
    assert.strictEqual(res.count, 14, `Expected 14 math chapters for ${s}, got ${res.count}`);
    assert.strictEqual(res.subject, 'Mathematics');
  }

  const sciencePermutations = ['science', 'Science', 'SCIENCE', '  science  ', 'sci', 'general science', 'curiosity'];
  for (const s of sciencePermutations) {
    const res = gas.getCurriculumCatalog('Class 6', s);
    assert.strictEqual(res.success, true, `Query failed for subject variation: ${s}`);
    assert.strictEqual(res.count, 12, `Expected 12 science chapters for ${s}, got ${res.count}`);
    assert.strictEqual(res.subject, 'Science');
  }

  const evsPermutations = ['evs', 'EVS', 'Environmental Studies', 'ENVIRONMENTAL STUDIES', 'our wondrous world', 'looking around'];
  for (const s of evsPermutations) {
    const res = gas.getCurriculumCatalog('Class 3', s);
    assert.strictEqual(res.success, true, `Query failed for subject variation: ${s}`);
    assert.strictEqual(res.count, 12, `Expected 12 EVS chapters for ${s}, got ${res.count}`);
    assert.strictEqual(res.subject, 'EVS');
  }

  const englishPermutations = ['english', 'ENGLISH', 'eng', 'mridang', 'santoor', 'marigold', 'poorvi', 'honeycomb', 'honeydew', 'beehive', 'first flight'];
  for (const s of englishPermutations) {
    const res = gas.getCurriculumCatalog('Class 1', s);
    assert.strictEqual(res.success, true, `Query failed for subject variation: ${s}`);
    assert.strictEqual(res.count, 9, `Expected 9 English chapters for ${s}, got ${res.count}`);
    assert.strictEqual(res.subject, 'English');
  }

  const hindiPermutations = ['hindi', 'HINDI', 'hin', 'sarangi', 'veena', 'rimjhim'];
  for (const s of hindiPermutations) {
    const res = gas.getCurriculumCatalog('Class 1', s);
    assert.strictEqual(res.success, true, `Query failed for subject variation: ${s}`);
    assert.strictEqual(res.count, 19, `Expected 19 Hindi chapters for ${s}, got ${res.count}`);
    assert.strictEqual(res.subject, 'Hindi');
  }
});

// -------------------------------------------------------------------------
// 3. ADVERSARIAL FALSY VALUES & INVALID GRADE STRESS
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 3: Adversarial Invalid Grades & Falsy Parameter Vulnerability <<<');

test('3.1 Invalid grade strings rejection (HTTP 400)', () => {
  const invalidStringGrades = [
    '0', '11', '-1', 'Grade 99', 'Kindergarten', 'KG', 'LKG', 'UKG', 'Nursery', 'Pre-K',
    'Class 0', 'Class 11', 'Class -5', 'Grade 0', 'Grade 12', 'Class 13', 'Twelve', 'tenth',
    'abc', 'null', 'undefined', 'false', 'true', '<script>alert(1)</script>'
  ];
  for (const g of invalidStringGrades) {
    const res = gas.getCurriculumCatalog(g, 'Mathematics');
    assert.strictEqual(res.success, false, `String grade ${JSON.stringify(g)} was unexpectedly accepted`);
    assert.strictEqual(res.code, 400, `String grade ${JSON.stringify(g)} did not return HTTP 400`);
    assert.ok(res.error.includes('INVALID_GRADE'), `String grade ${JSON.stringify(g)} error message invalid: ${res.error}`);
  }
});

test('3.2 Non-zero invalid numeric grades rejection (HTTP 400)', () => {
  const invalidNumericGrades = [11, -1, 99, 100, -5, 0.5, 3.14, Infinity, -Infinity];
  for (const g of invalidNumericGrades) {
    const res = gas.getCurriculumCatalog(g, 'Mathematics');
    assert.strictEqual(res.success, false, `Numeric grade ${g} was unexpectedly accepted`);
    assert.strictEqual(res.code, 400, `Numeric grade ${g} did not return HTTP 400`);
    assert.ok(res.error.includes('INVALID_GRADE'), `Numeric grade ${g} error message invalid: ${res.error}`);
  }
});

test('3.3 [VULNERABILITY PROBE] Numeric 0 must be rejected with HTTP 400 (not treated as "all")', () => {
  // Positional 0
  const posRes = gas.getCurriculumCatalog(0, 'Mathematics');
  assert.strictEqual(
    posRes.success,
    false,
    `BUG DETECTED: getCurriculumCatalog(0, 'Mathematics') succeeded with HTTP 200 (count: ${posRes.count}) instead of HTTP 400 rejection!`
  );
  assert.strictEqual(posRes.code, 400);

  // Payload { grade: 0 }
  const payloadRes = gas.getCurriculumCatalog({ grade: 0, subject: 'Mathematics' });
  assert.strictEqual(
    payloadRes.success,
    false,
    `BUG DETECTED: getCurriculumCatalog({ grade: 0 }) succeeded with HTTP 200 (count: ${payloadRes.count}) instead of HTTP 400 rejection!`
  );
  assert.strictEqual(payloadRes.code, 400);
});

test('3.4 [VULNERABILITY PROBE] NaN must be rejected with HTTP 400', () => {
  const nanRes = gas.getCurriculumCatalog(NaN, 'Mathematics');
  assert.strictEqual(
    nanRes.success,
    false,
    `BUG DETECTED: getCurriculumCatalog(NaN, 'Mathematics') succeeded with HTTP 200 (count: ${nanRes.count}) instead of HTTP 400 rejection!`
  );
  assert.strictEqual(nanRes.code, 400);
});

// -------------------------------------------------------------------------
// 4. EDGE CASES & NON-EXISTENT COMBINATIONS
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 4: Edge Cases & Non-Existent Combinations <<<');

test('4.1 Omitted subject returns all chapters for the target grade', () => {
  const res1 = gas.getCurriculumCatalog('Class 5');
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.count, 63, `Expected 63 chapters for Class 5, got ${res1.count}`);

  const res2 = gas.getCurriculumCatalog({ grade: 'Class 5' });
  assert.strictEqual(res2.count, 63);
});

test('4.2 "all" grade and subject combinations', () => {
  const resAllAll = gas.getCurriculumCatalog('all', 'all');
  assert.strictEqual(resAllAll.success, true);
  assert.strictEqual(resAllAll.count, 548);

  const resAllMath = gas.getCurriculumCatalog('all', 'Mathematics');
  assert.strictEqual(resAllMath.success, true);
  assert.strictEqual(resAllMath.count, 128); // 13+11+14+14+14+10+13+13+12+14 = 128

  const resClass5All = gas.getCurriculumCatalog('Class 5', 'all');
  assert.strictEqual(resClass5All.success, true);
  assert.strictEqual(resClass5All.count, 63);

  const resEmptyObj = gas.getCurriculumCatalog({});
  assert.strictEqual(resEmptyObj.count, 548);
});

test('4.3 Non-existent grade/subject combinations return empty list with success: true', () => {
  // Class 1 does not have Science (only EVS)
  const res1 = gas.getCurriculumCatalog('Class 1', 'Science');
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.count, 0);
  assert.strictEqual(res1.items.length, 0);

  // Class 10 does not have EVS (has Science)
  const res2 = gas.getCurriculumCatalog('Class 10', 'EVS');
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.count, 0);

  // Bogus subject
  const res3 = gas.getCurriculumCatalog('Class 5', 'Astrophysics');
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.count, 0);
});

// -------------------------------------------------------------------------
// 5. SOCIAL SCIENCE MULTI-BOOK DISCIPLINARY ORDERING CRITIQUE
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 5: Social Science Multi-Book Disciplinary Ordering <<<');

test('5.1 [USABILITY PROBE] Social Science chapter ordering should be grouped by discipline/book', () => {
  const res = gas.getCurriculumCatalog('Class 7', 'Social Science');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.count, 23);

  // Check if chapters are grouped by subSubject or interleaved by chapterNumber
  const subDisciplines = res.items.map(item => item.subSubject || (item.chapterTitle.includes(':') ? item.chapterTitle.split(':')[0] : ''));
  const firstSixChNumbers = res.items.slice(0, 6).map(item => item.chapterNumber);
  
  // If interleaved, first items will be [1, 1, 1, 2, 2, 2]
  const isInterleaved = (firstSixChNumbers[0] === 1 && firstSixChNumbers[1] === 1 && firstSixChNumbers[2] === 1);
  assert.ok(
    !isInterleaved,
    `ORDERING ANOMALY DETECTED: Class 7 Social Science chapters are sorted as chapterNumber [${firstSixChNumbers.join(', ')}] across books instead of grouping contiguous chapters per textbook/sub-discipline!`
  );
});

// -------------------------------------------------------------------------
// 6. DUAL-MODE PARITY (GAS vs BROWSER MOCK)
// -------------------------------------------------------------------------
console.log('\n>>> GROUP 6: Dual-Mode BrowserMockBackend Parity <<<');

const htmlContent = fs.readFileSync('divyank_mission_control_google_apps_script_app.html', 'utf8');
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const scriptContent = scriptMatches[scriptMatches.length - 1].replace(/<\/?script[^>]*>/gi, '');

const mockEl = { getContext: () => ({}), style: {}, classList: { add: () => {}, remove: () => {} } };
const mockDoc = {
  getElementById: () => mockEl, querySelectorAll: () => [], querySelector: () => mockEl,
  createElement: () => mockEl, body: mockEl, addEventListener: () => {}
};
const mockWin = { innerWidth: 1200, innerHeight: 800, addEventListener: () => {}, scrollTo: () => {} };
mockWin.window = mockWin;
mockWin.document = mockDoc;

const sandbox = {
  console: console, setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: () => {}, clearInterval: () => {},
  window: mockWin, document: mockDoc, module: { exports: {} }
};
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;

test('6.1 BrowserMockBackend handles valid queries with identical count to GAS backend', () => {
  const queryCases = [
    ['Class 1', 'Mathematics', 13],
    ['Class 2', 'English', 13],
    ['Class 4', 'EVS', 27],
    ['Class 6', 'Science', 12],
    ['Class 10', 'Social Science', 22],
    ['Class 8', 'Mathematics', 13]
  ];
  for (const [grade, sub, exp] of queryCases) {
    const mockRes = BrowserMockBackend.getCurriculumCatalog(grade, sub);
    const gasRes = gas.getCurriculumCatalog(grade, sub);
    assert.strictEqual(mockRes.success, true);
    assert.strictEqual(gasRes.success, true);
    assert.strictEqual(mockRes.count, exp);
    assert.strictEqual(gasRes.count, exp);
    assert.strictEqual(mockRes.items[0].id, gasRes.items[0].id);
  }
});

test('6.2 [VULNERABILITY PROBE] BrowserMockBackend numeric 0 must be rejected with HTTP 400', () => {
  const mockPosRes = BrowserMockBackend.getCurriculumCatalog(0, 'Mathematics');
  assert.strictEqual(
    mockPosRes.success,
    false,
    `BUG DETECTED in BrowserMockBackend: getCurriculumCatalog(0, 'Mathematics') returned success: true (count: ${mockPosRes.count}) instead of HTTP 400 rejection!`
  );
  assert.strictEqual(mockPosRes.code, 400);

  const mockPayloadRes = BrowserMockBackend.getCurriculumCatalog({ grade: 0, subject: 'Mathematics' });
  assert.strictEqual(
    mockPayloadRes.success,
    false,
    `BUG DETECTED in BrowserMockBackend: getCurriculumCatalog({ grade: 0 }) returned success: true (count: ${mockPayloadRes.count}) instead of HTTP 400 rejection!`
  );
  assert.strictEqual(mockPayloadRes.code, 400);
});

// -------------------------------------------------------------------------
// SUMMARY & FINDINGS LOG
// -------------------------------------------------------------------------
console.log('\n=========================================================================');
console.log(`  EXECUTION SUMMARY: ${results.passed} Passed, ${results.failed} Failed`);
console.log('=========================================================================');

if (results.failed > 0) {
  console.log('\nCONFIRMED VULNERABILITIES & FAILURE MODES:');
  results.findings.forEach((f, i) => {
    console.log(`${i + 1}. [FAIL] ${f.name}`);
    console.log(`   -> ${f.error}\n`);
  });
}
