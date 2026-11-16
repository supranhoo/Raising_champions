const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const { CANONICAL_CURRICULUM_CATALOG } = require('./../curriculum_catalog_data.js');

// 1. Setup GAS backend
const gasSandbox = {
  SpreadsheetApp: undefined,
  CANONICAL_CURRICULUM_CATALOG,
  getScriptCache_: () => null,
  console: console
};
const gasCode = fs.readFileSync('google_apps_script_backend.js', 'utf8');
vm.createContext(gasSandbox);
vm.runInContext(gasCode, gasSandbox);
const gas = gasSandbox;

// 2. Setup Mock Backend
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

const mockSandbox = {
  console: console, setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: () => {}, clearInterval: () => {},
  window: mockWin, document: mockDoc, module: { exports: {} }
};
vm.createContext(mockSandbox);
vm.runInContext(scriptContent, mockSandbox);
const BrowserMockBackend = mockSandbox.module.exports.BrowserMockBackend || mockSandbox.BrowserMockBackend;

function verifySocialScienceGrouping(items, grade) {
  const disciplinesSeen = [];
  let currentDisc = null;
  let lastChNum = 0;

  for (const item of items) {
    const disc = item.subSubject;
    assert(disc, `Expected subSubject for ${grade} chapter ${item.chapterTitle}`);
    if (disc !== currentDisc) {
      assert(!disciplinesSeen.includes(disc), `Discipline ${disc} re-appeared out of order in ${grade}! (seen: ${disciplinesSeen.join(', ')})`);
      disciplinesSeen.push(disc);
      currentDisc = disc;
      lastChNum = 0;
    }
    assert(item.chapterNumber > lastChNum, `Chapter numbers must be strictly ascending within ${disc} in ${grade}. Found ${item.chapterNumber} after ${lastChNum}`);
    lastChNum = item.chapterNumber;
  }
  return disciplinesSeen;
}

function verifyStrictSequential(items, grade, subject) {
  for (let i = 0; i < items.length; i++) {
    const expected = i + 1;
    assert.strictEqual(
      items[i].chapterNumber,
      expected,
      `Chapter numbers must be strictly 1..N in ${grade} ${subject}. Found ${items[i].chapterNumber} at index ${i}`
    );
  }
}

// Test both backends
for (const [backendName, backend] of [['GAS', gas], ['Mock', BrowserMockBackend]]) {
  console.log(`Checking ${backendName} backend...`);

  // Class 7 Social Science
  const c7 = backend.getCurriculumCatalog('Class 7', 'Social Science');
  const d7 = verifySocialScienceGrouping(c7.items, 'Class 7');
  assert.deepStrictEqual(d7, ['History', 'Geography', 'Civics']);

  // Class 8 Social Science
  const c8 = backend.getCurriculumCatalog('Class 8', 'Social Science');
  const d8 = verifySocialScienceGrouping(c8.items, 'Class 8');
  assert.deepStrictEqual(d8, ['History', 'Geography', 'Civics']);

  // Class 9 Social Science
  const c9 = backend.getCurriculumCatalog('Class 9', 'Social Science');
  const d9 = verifySocialScienceGrouping(c9.items, 'Class 9');
  assert.deepStrictEqual(d9, ['History', 'Geography', 'Civics', 'Economics']);

  // Class 10 Social Science
  const c10 = backend.getCurriculumCatalog('Class 10', 'Social Science');
  const d10 = verifySocialScienceGrouping(c10.items, 'Class 10');
  assert.deepStrictEqual(d10, ['History', 'Geography', 'Civics', 'Economics']);

  // Class 6 Social Science (single book, contiguous 1..14)
  const c6soc = backend.getCurriculumCatalog('Class 6', 'Social Science');
  assert.strictEqual(c6soc.items.length, 14);
  verifyStrictSequential(c6soc.items, 'Class 6', 'Social Science');

  // Class 6 Science (internal colons, contiguous 1..12)
  const c6sci = backend.getCurriculumCatalog('Class 6', 'Science');
  assert.strictEqual(c6sci.items.length, 12);
  verifyStrictSequential(c6sci.items, 'Class 6', 'Science');

  // Class 2 EVS (internal colons, contiguous 1..5)
  const c2evs = backend.getCurriculumCatalog('Class 2', 'EVS');
  assert.strictEqual(c2evs.items.length, 5);
  verifyStrictSequential(c2evs.items, 'Class 2', 'EVS');

  // Class 3 EVS (contiguous 1..12)
  const c3evs = backend.getCurriculumCatalog('Class 3', 'EVS');
  assert.strictEqual(c3evs.items.length, 12);
  verifyStrictSequential(c3evs.items, 'Class 3', 'EVS');

  // Class 4 EVS
  const c4evs = backend.getCurriculumCatalog('Class 4', 'EVS');
  assert.strictEqual(c4evs.items.length, 27);
  verifyStrictSequential(c4evs.items, 'Class 4', 'EVS');
}

console.log('ALL SORTING INVARIANCES & CONTIGUITY CHECKS PASSED PERFECTLY!');
