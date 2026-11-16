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

const testCases = [
  { input: 0, expectCode: 400, desc: 'numeric 0' },
  { input: '0', expectCode: 400, desc: 'string 0' },
  { input: 'Class 0', expectCode: 400, desc: 'string Class 0' },
  { input: NaN, expectCode: 400, desc: 'numeric NaN' },
  { input: 'NaN', expectCode: 400, desc: 'string NaN' },
  { input: -1, expectCode: 400, desc: 'numeric -1' },
  { input: '-1', expectCode: 400, desc: 'string -1' },
  { input: 11, expectCode: 400, desc: 'numeric 11' },
  { input: 'Class 11', expectCode: 400, desc: 'string Class 11' },
  { input: 3.14, expectCode: 400, desc: 'numeric 3.14' },
  { input: { grade: 0 }, expectCode: 400, desc: 'object { grade: 0 }' },
  { input: { grade: '0' }, expectCode: 400, desc: 'object { grade: 0 }' },
  { input: { grade: NaN }, expectCode: 400, desc: 'object { grade: NaN }' },
  { input: { grade: 'NaN' }, expectCode: 400, desc: 'object { grade: NaN }' },
  { input: { grade: -1 }, expectCode: 400, desc: 'object { grade: -1 }' },
  { input: { grade: 11 }, expectCode: 400, desc: 'object { grade: 11 }' },
  { input: { gradeClass: 0 }, expectCode: 400, desc: 'object { gradeClass: 0 }' },
  { input: { gradeClass: '0' }, expectCode: 400, desc: 'object { gradeClass: 0 }' },
  { input: { gradeClass: NaN }, expectCode: 400, desc: 'object { gradeClass: NaN }' },
  { input: null, expectSuccess: true, expectCount: 548, desc: 'null (all grades)' },
  { input: undefined, expectSuccess: true, expectCount: 548, desc: 'undefined (all grades)' },
  { input: '', expectSuccess: true, expectCount: 548, desc: 'empty string (all grades)' },
  { input: 'all', expectSuccess: true, expectCount: 548, desc: 'all (all grades)' },
  { input: '  ALL  ', expectSuccess: true, expectCount: 548, desc: '  ALL   (all grades)' },
  { input: {}, expectSuccess: true, expectCount: 548, desc: '{} (all grades)' },
  { input: { grade: null }, expectSuccess: true, expectCount: 548, desc: '{ grade: null }' },
  { input: { grade: '' }, expectSuccess: true, expectCount: 548, desc: '{ grade: empty }' },
  { input: { grade: 'all' }, expectSuccess: true, expectCount: 548, desc: '{ grade: all }' },
  { input: 5, expectSuccess: true, expectGrade: 'Class 5', desc: 'numeric 5' },
  { input: '5', expectSuccess: true, expectGrade: 'Class 5', desc: 'string 5' },
  { input: 'Class 5', expectSuccess: true, expectGrade: 'Class 5', desc: 'string Class 5' },
  { input: { grade: 5 }, expectSuccess: true, expectGrade: 'Class 5', desc: 'object { grade: 5 }' },
  { input: { gradeClass: 5 }, expectSuccess: true, expectGrade: 'Class 5', desc: 'object { gradeClass: 5 }' }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const gasRes = gas.getCurriculumCatalog(tc.input);
  const mockRes = BrowserMockBackend.getCurriculumCatalog(tc.input);

  if (tc.expectCode) {
    if (gasRes.code !== tc.expectCode || gasRes.success !== false) {
      console.log('FAIL [GAS]', tc.desc, 'expected code', tc.expectCode, 'got', gasRes);
      failed++;
    } else {
      passed++;
    }
    if (mockRes.code !== tc.expectCode || mockRes.success !== false) {
      console.log('FAIL [Mock]', tc.desc, 'expected code', tc.expectCode, 'got', mockRes);
      failed++;
    } else {
      passed++;
    }
  } else if (tc.expectSuccess) {
    if (gasRes.success !== true) {
      console.log('FAIL [GAS]', tc.desc, 'expected success: true, got', gasRes);
      failed++;
    } else {
      passed++;
    }
    if (mockRes.success !== true) {
      console.log('FAIL [Mock]', tc.desc, 'expected success: true, got', mockRes);
      failed++;
    } else {
      passed++;
    }
    if (tc.expectCount !== undefined) {
      if (gasRes.count !== tc.expectCount || mockRes.count !== tc.expectCount) {
        console.log('FAIL count', tc.desc, 'GAS:', gasRes.count, 'Mock:', mockRes.count);
        failed++;
      }
    }
    if (tc.expectGrade !== undefined) {
      if (gasRes.grade !== tc.expectGrade || mockRes.grade !== tc.expectGrade) {
        console.log('FAIL grade', tc.desc, 'GAS:', gasRes.grade, 'Mock:', mockRes.grade);
        failed++;
      }
    }
  }
}

console.log(`Adversarial Matrix Results: ${passed} passed, ${failed} failed out of ${testCases.length * 2} checks.`);
if (failed > 0) process.exit(1);
