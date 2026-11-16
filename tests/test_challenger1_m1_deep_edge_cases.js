/**
 * =========================================================================
 * EMPIRICAL CHALLENGER: DEEP EDGE-CASE PROBING & MULTI-BOOK HARNESS
 * =========================================================================
 * Milestone 1 Iteration 2 Gate Challenge
 * Author: Challenger Agent (challenger_1_m1_it2)
 * Targets:
 *   1. Falsy values: 0, -0, NaN, null, undefined, "0", "-0", "", "   ", "all"
 *   2. Single-book subjects with internal title colons
 *   3. Social Science multi-textbook disciplinary ordering (Classes 7-10)
 *   4. BrowserMockBackend and ZoptroApiClient exact dual-mode parity
 * =========================================================================
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const gas = require('../google_apps_script_backend.js');
const { CANONICAL_CURRICULUM_CATALOG } = require('../curriculum_catalog_data.js');

// Setup BrowserMockBackend and ZoptroApiClient VM environment
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

let passed = 0;
let failed = 0;
const failures = [];

function probe(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ name, error: err.message });
  }
}

// Cross-realm array/object equality helper
function assertCrossRealmDeepEqual(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  assert.strictEqual(actualJson, expectedJson, message || `Cross-realm mismatch:\nActual: ${actualJson}\nExpected: ${expectedJson}`);
}

async function runProbes() {
  console.log('=========================================================================');
  console.log('  CHALLENGER DEEP EDGE-CASE PROBE SUITE: FALSY VALUES & COLON HANDLING   ');
  console.log('=========================================================================');

  // -----------------------------------------------------------------------
  // SECTION 1: STRICT REJECTION OF ZERO AND NAN IN ALL FORMS
  // -----------------------------------------------------------------------
  console.log('\n>>> SECTION 1: Numeric 0, -0, NaN, and String "0" Strict Rejection <<<');

  const zeroAndNanCases = [
    { label: 'Positional numeric 0', getArgs: () => [0, 'Mathematics'] },
    { label: 'Positional numeric -0', getArgs: () => [-0, 'Mathematics'] },
    { label: 'Positional NaN', getArgs: () => [NaN, 'Mathematics'] },
    { label: 'Positional string "0"', getArgs: () => ['0', 'Mathematics'] },
    { label: 'Positional string "-0"', getArgs: () => ['-0', 'Mathematics'] },
    { label: 'Positional string "NaN"', getArgs: () => ['NaN', 'Mathematics'] },
    { label: 'Payload { grade: 0 }', getArgs: () => [{ grade: 0, subject: 'Mathematics' }] },
    { label: 'Payload { grade: -0 }', getArgs: () => [{ grade: -0, subject: 'Mathematics' }] },
    { label: 'Payload { grade: NaN }', getArgs: () => [{ grade: NaN, subject: 'Mathematics' }] },
    { label: 'Payload { grade: "0" }', getArgs: () => [{ grade: '0', subject: 'Mathematics' }] },
    { label: 'Payload { gradeClass: 0 }', getArgs: () => [{ gradeClass: 0, subject: 'Mathematics' }] },
    { label: 'Payload { gradeClass: NaN }', getArgs: () => [{ gradeClass: NaN, subject: 'Mathematics' }] },
    { label: 'Payload { gradeClass: "0" }', getArgs: () => [{ gradeClass: '0', subject: 'Mathematics' }] }
  ];

  for (const c of zeroAndNanCases) {
    probe(`[GAS] ${c.label} strictly rejected with HTTP 400`, () => {
      const res = gas.getCurriculumCatalog(...c.getArgs());
      assert.strictEqual(res.success, false, `Expected failure for ${c.label}, got success: true`);
      assert.strictEqual(res.code, 400, `Expected HTTP 400 for ${c.label}, got code ${res.code}`);
      assert.ok(res.error && res.error.includes('INVALID_GRADE'), `Expected INVALID_GRADE error message, got ${res.error}`);
    });

    probe(`[Mock] ${c.label} strictly rejected with HTTP 400`, () => {
      const res = BrowserMockBackend.getCurriculumCatalog(...c.getArgs());
      assert.strictEqual(res.success, false, `Expected mock failure for ${c.label}, got success: true`);
      assert.strictEqual(res.code, 400, `Expected mock HTTP 400 for ${c.label}, got code ${res.code}`);
      assert.ok(res.error && res.error.includes('INVALID_GRADE'), `Expected INVALID_GRADE error message, got ${res.error}`);
    });

    // Also probe ZoptroApiClient
    probe(`[Client] ${c.label} handled properly by ZoptroApiClient`, async () => {
      const res = await ZoptroApiClient.getCurriculumCatalog(...c.getArgs());
      assert.strictEqual(res.success, false, `Expected client failure for ${c.label}, got success: true`);
      assert.strictEqual(res.code, 400, `Expected client HTTP 400 for ${c.label}, got code ${res.code}`);
    });
  }

  // -----------------------------------------------------------------------
  // SECTION 2: FALSY AND DEFAULT QUERY PROBES (null, undefined, "", "all")
  // -----------------------------------------------------------------------
  console.log('\n>>> SECTION 2: Falsy Allowed Values (null, undefined, "", "all") <<<');

  probe('[GAS] Positional null grade returns all grades (548 chapters)', () => {
    const res = gas.getCurriculumCatalog(null);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 548);
  });

  probe('[Mock] Positional null grade returns all grades (548 chapters)', () => {
    const res = BrowserMockBackend.getCurriculumCatalog(null);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 548);
  });

  probe('[GAS] Positional undefined returns all grades (548 chapters)', () => {
    const res = gas.getCurriculumCatalog(undefined);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 548);
  });

  probe('[Mock] Positional undefined returns all grades (548 chapters)', () => {
    const res = BrowserMockBackend.getCurriculumCatalog(undefined);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 548);
  });

  probe('[GAS] Empty string grade "" returns all grades for target subject', () => {
    const res = gas.getCurriculumCatalog('', 'Mathematics');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 128);
  });

  probe('[Mock] Empty string grade "" returns all grades for target subject', () => {
    const res = BrowserMockBackend.getCurriculumCatalog('', 'Mathematics');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 128);
  });

  probe('[GAS] Whitespace string grade "   " returns all grades for target subject', () => {
    const res = gas.getCurriculumCatalog('   ', 'Science');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 63); // 12 + 13 + 13 + 12 + 13 = 63
  });

  probe('[Mock] Whitespace string grade "   " returns all grades for target subject', () => {
    const res = BrowserMockBackend.getCurriculumCatalog('   ', 'Science');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 63);
  });

  probe('[GAS] Grade "all" case variations ("all", "ALL", " All ")', () => {
    for (const v of ['all', 'ALL', ' All ', 'aLl']) {
      const res = gas.getCurriculumCatalog(v, 'Mathematics');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, 128);
    }
  });

  probe('[Mock] Grade "all" case variations ("all", "ALL", " All ")', () => {
    for (const v of ['all', 'ALL', ' All ', 'aLl']) {
      const res = BrowserMockBackend.getCurriculumCatalog(v, 'Mathematics');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, 128);
    }
  });

  probe('[Dual-Parity] Payload { grade: null, subject: "English" }', () => {
    const gasRes = gas.getCurriculumCatalog({ grade: null, subject: 'English' });
    const mockRes = BrowserMockBackend.getCurriculumCatalog({ grade: null, subject: 'English' });
    assert.strictEqual(gasRes.success, true);
    assert.strictEqual(mockRes.success, true);
    assert.strictEqual(gasRes.count, mockRes.count);
    assert.strictEqual(gasRes.items.length, mockRes.items.length);
  });

  probe('[Dual-Parity] Payload { grade: undefined, subject: "Hindi" }', () => {
    const gasRes = gas.getCurriculumCatalog({ grade: undefined, subject: 'Hindi' });
    const mockRes = BrowserMockBackend.getCurriculumCatalog({ grade: undefined, subject: 'Hindi' });
    assert.strictEqual(gasRes.success, true);
    assert.strictEqual(mockRes.success, true);
    assert.strictEqual(gasRes.count, mockRes.count);
  });

  // -----------------------------------------------------------------------
  // SECTION 3: SINGLE-BOOK SUBJECTS WITH COLONS IN CHAPTER TITLES
  // -----------------------------------------------------------------------
  console.log('\n>>> SECTION 3: Single-Book Subjects with Colons in Chapter Titles <<<');

  const singleBookWithColons = [
    { grade: 'Class 6', subject: 'Science', expectedCount: 12 },
    { grade: 'Class 9', subject: 'Science', expectedCount: 12 },
    { grade: 'Class 10', subject: 'Science', expectedCount: 13 },
    { grade: 'Class 2', subject: 'EVS', expectedCount: 5 },
    { grade: 'Class 3', subject: 'EVS', expectedCount: 12 },
    { grade: 'Class 4', subject: 'EVS', expectedCount: 27 },
    { grade: 'Class 5', subject: 'EVS', expectedCount: 22 },
    { grade: 'Class 6', subject: 'Social Science', expectedCount: 14 } // Integrated single-textbook
  ];

  for (const s of singleBookWithColons) {
    probe(`[GAS] ${s.grade} ${s.subject} chapters maintain strictly sequential 1..N order`, () => {
      const res = gas.getCurriculumCatalog(s.grade, s.subject);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, s.expectedCount);

      // Verify strict contiguity: 1, 2, 3, ... N
      const numbers = res.items.map(item => item.chapterNumber);
      const expectedNumbers = Array.from({ length: s.expectedCount }, (_, i) => i + 1);
      assertCrossRealmDeepEqual(numbers, expectedNumbers, `Ordering broken for ${s.grade} ${s.subject}: got ${numbers.join(',')}`);

      // Verify no subSubject was falsely created from internal colon
      if (s.subject !== 'Social Science') {
        res.items.forEach(item => {
          assert.ok(
            !item.subSubject || item.subSubject === '',
            `Item ${item.id} (${item.chapterTitle}) falsely assigned subSubject: ${item.subSubject}`
          );
        });
      }
    });

    probe(`[Mock] ${s.grade} ${s.subject} matches GAS identically with 1..N order`, () => {
      const gasRes = gas.getCurriculumCatalog(s.grade, s.subject);
      const mockRes = BrowserMockBackend.getCurriculumCatalog(s.grade, s.subject);
      assert.strictEqual(mockRes.success, true);
      assert.strictEqual(mockRes.count, s.expectedCount);

      const mockNumbers = mockRes.items.map(item => item.chapterNumber);
      const expectedNumbers = Array.from({ length: s.expectedCount }, (_, i) => i + 1);
      assertCrossRealmDeepEqual(mockNumbers, expectedNumbers);

      // Verify byte-level identity of IDs and sequence
      assertCrossRealmDeepEqual(
        mockRes.items.map(i => i.id),
        gasRes.items.map(i => i.id),
        `ID sequence mismatch between GAS and Mock for ${s.grade} ${s.subject}`
      );
    });
  }

  // -----------------------------------------------------------------------
  // SECTION 4: MULTI-TEXTBOOK SOCIAL SCIENCE DISCIPLINARY GROUPING
  // -----------------------------------------------------------------------
  console.log('\n>>> SECTION 4: Multi-Textbook Social Science Disciplinary Grouping (Classes 7-10) <<<');

  const multiBookSstGrades = [
    { grade: 'Class 7', count: 23, disciplines: ['History', 'Geography', 'Civics'] },
    { grade: 'Class 8', count: 21, disciplines: ['History', 'Geography', 'Civics'] },
    { grade: 'Class 9', count: 20, disciplines: ['History', 'Geography', 'Civics', 'Economics'] },
    { grade: 'Class 10', count: 22, disciplines: ['History', 'Geography', 'Civics', 'Economics'] }
  ];

  for (const sst of multiBookSstGrades) {
    probe(`[GAS] ${sst.grade} Social Science strictly groups by discipline sequence`, () => {
      const res = gas.getCurriculumCatalog(sst.grade, 'Social Science');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, sst.count);

      // Track order of appearance of disciplines
      const seenDisciplines = [];
      let currentDiscipline = null;

      res.items.forEach(item => {
        const disc = item.subSubject || item.chapterTitle.split(':')[0].trim();
        if (disc !== currentDiscipline) {
          assert.ok(
            !seenDisciplines.includes(disc),
            `Discipline ${disc} in ${sst.grade} appeared non-contiguously! Already seen: ${seenDisciplines.join(', ')}`
          );
          seenDisciplines.push(disc);
          currentDiscipline = disc;
        }
      });

      assertCrossRealmDeepEqual(
        seenDisciplines,
        sst.disciplines,
        `Discipline sequence mismatch in ${sst.grade}: expected ${sst.disciplines.join(' -> ')}, got ${seenDisciplines.join(' -> ')}`
      );

      // Verify each discipline has contiguous chapter numbers starting at 1
      for (const d of sst.disciplines) {
        const discItems = res.items.filter(i => (i.subSubject || i.chapterTitle.split(':')[0].trim()) === d);
        assert.ok(discItems.length > 0, `No items found for discipline ${d}`);
        const chNums = discItems.map(i => i.chapterNumber);
        const expectedChNums = Array.from({ length: discItems.length }, (_, i) => i + 1);
        assertCrossRealmDeepEqual(
          chNums,
          expectedChNums,
          `Chapter numbers within ${sst.grade} ${d} not contiguous 1..N: got ${chNums.join(',')}`
        );
      }
    });

    probe(`[Mock] ${sst.grade} Social Science matches GAS order and grouping exactly`, () => {
      const gasRes = gas.getCurriculumCatalog(sst.grade, 'Social Science');
      const mockRes = BrowserMockBackend.getCurriculumCatalog(sst.grade, 'Social Science');
      assert.strictEqual(mockRes.count, sst.count);

      assertCrossRealmDeepEqual(
        mockRes.items.map(i => i.id),
        gasRes.items.map(i => i.id),
        `Mock and GAS returned different item sequence for ${sst.grade} Social Science`
      );
    });
  }

  // -----------------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------------
  console.log('\n=========================================================================');
  console.log(`  EDGE-CASE PROBE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('=========================================================================');

  if (failed > 0) {
    console.error('\nFAILED PROBES:');
    failures.forEach((f, i) => console.error(`${i + 1}. [FAIL] ${f.name}\n   -> ${f.error}`));
    process.exit(1);
  }
}

runProbes().catch(err => {
  console.error('Fatal probe execution error:', err);
  process.exit(1);
});
