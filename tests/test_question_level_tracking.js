/**
 * test_question_level_tracking.js
 * Comprehensive automated verification for:
 * 1. Table 14: StudentQuestionResponses granular question-level logging
 * 2. Parent Answer Sheet inspection & assertParentPairing RBAC
 * 3. Relative student pacing & dynamic progression engine (getNextPersonalizedCurriculum)
 * 4. Admin Bulk Ingestion (bulkUploadContentBatch)
 * 5. Full BrowserMockBackend and ZoptroApiClient parity
 * 6. Frontend DOM elements & brand compliance
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// =========================================================================
// SECTION 1: IN-MEMORY GOOGLE APPS SCRIPT SPREADSHEET SIMULATOR
// =========================================================================
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

const mockActiveSpreadsheet = new MockSpreadsheet();

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

global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
  createHtmlOutputFromFile: (name) => ({ name }),
  createHtmlOutput: (html) => ({ html })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => 'parent@zoptro.local' }),
  getScriptTimeZone: () => 'GMT+5:30'
};

global.MailApp = {
  sendEmail: () => true
};

// Now require backend with simulator configured
const backend = require(path.join(__dirname, '../google_apps_script_backend.js'));
const htmlPath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ ${name}`);
  } catch (err) {
    console.error(`  ✖ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('=========================================================================');
console.log('  QUESTION-LEVEL TRACKING, ADAPTIVE ENGINE & BULK INGESTION TEST SUITE   ');
console.log('=========================================================================\n');

function main() {
  // Initialize in-memory database
  backend.initializeDatabase();

  // -------------------------------------------------------------------------
  // GROUP 1: BACKEND SCHEMA & QUESTION RESPONSE LOGGING
  // -------------------------------------------------------------------------
  console.log('>>> GROUP 1: Table 14 StudentQuestionResponses & Logging Contracts <<<');

  runTest('T1.1: Table 14 StudentQuestionResponses exists in backend SCHEMAS', () => {
    assert.ok(backend.SCHEMAS.StudentQuestionResponses, 'StudentQuestionResponses schema table must exist');
    const cols = backend.SCHEMAS.StudentQuestionResponses;
    const required = [
      'id', 'completionId', 'studentId', 'grade', 'contentType', 'contentId',
      'questionId', 'questionText', 'optionsJson', 'studentChoiceIndex',
      'studentChoiceText', 'correctOptionIndex', 'isCorrect', 'pointsEarned',
      'explanation', 'timeSpentSeconds', 'answeredAt'
    ];
    required.forEach(col => {
      assert.ok(cols.includes(col), `Column ${col} must exist in StudentQuestionResponses schema`);
    });
  });

  runTest('T1.2: signUpFamilyOnboarding provisions parent and students cleanly', () => {
    const res = backend.signUpFamilyOnboarding({
      parentData: {
        fullName: 'Captain Vikram',
        email: 'vikram.qa@example.com',
        pin: '1234',
        password: 'Password123'
      },
      childrenData: [
        { fullName: 'Cadet Aryan', grade: 'Class 3', age: 8, pin: '1111' },
        { fullName: 'Cadet Ananya', grade: 'Class 5', age: 10, pin: '2222' }
      ]
    });
    assert.ok(res.success, 'Family onboarding must succeed');
    assert.strictEqual(res.children.length, 2, 'Must provision 2 children');
    assert.ok(res.pairingCode, 'Must generate family pairing code');
  });

  runTest('T1.3: recordQuestionResponses successfully inserts fine-grained questions', () => {
    const users = backend.getSheetRecords('Users');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');
    assert.ok(aryan, 'Cadet Aryan must exist');

    const logRes = backend.recordQuestionResponses({
      studentId: aryan.id,
      completionId: 'comp_test_01',
      responses: [
        {
          grade: 'Class 3',
          contentType: 'CurriculumQuizzes',
          contentId: 'quiz_sci_01',
          questionId: 'q_01',
          questionText: 'What is the closest star to Earth?',
          options: ['Alpha Centauri', 'The Sun', 'Sirius', 'Polaris'],
          studentChoiceIndex: 1,
          studentChoiceText: 'The Sun',
          correctOptionIndex: 1,
          isCorrect: true,
          pointsEarned: 10,
          explanation: 'The Sun is the closest star at approximately 150 million kilometers.'
        },
        {
          grade: 'Class 3',
          contentType: 'CurriculumQuizzes',
          contentId: 'quiz_sci_01',
          questionId: 'q_02',
          questionText: 'Which animal is a mammal?',
          options: ['Frog', 'Snake', 'Dolphin', 'Eagle'],
          studentChoiceIndex: 0,
          studentChoiceText: 'Frog',
          correctOptionIndex: 2,
          isCorrect: false,
          pointsEarned: 0,
          explanation: 'Dolphins are warm-blooded mammals that breathe air and give live birth.'
        }
      ]
    });

    assert.ok(logRes.success, 'Logging responses must succeed');
    assert.strictEqual(logRes.insertedCount, 2, 'Must record 2 responses');
  });

  // -------------------------------------------------------------------------
  // GROUP 2: PARENT ANSWER SHEET RETRIEVAL & SIBLING ISOLATION
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 2: Parent Answer Sheet Drilldown & RBAC Isolation <<<');

  runTest('T2.1: Parent retrieves linked child answer sheet with exact question details', () => {
    const users = backend.getSheetRecords('Users');
    const parent = users.find(u => u.email === 'vikram.qa@example.com');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');

    const sheet = backend.getStudentAnswerSheet({
      callerId: parent.id,
      studentId: aryan.id
    });

    assert.ok(sheet.success, 'Parent answer sheet retrieval must succeed');
    assert.strictEqual(sheet.totalQuestionsAnswered, 2, 'Must report 2 answered questions');
    assert.strictEqual(sheet.correctCount, 1, 'Must report 1 correct answer');
    assert.strictEqual(sheet.questionResponses.length, 2, 'Responses list must contain 2 items');

    const q1 = sheet.questionResponses.find(r => r.questionId === 'q_01');
    assert.ok(q1, 'Question 1 must be present');
    assert.strictEqual(q1.isCorrect, true);
    assert.strictEqual(q1.pointsEarned, 10);
  });

  runTest('T2.2: Sibling attempting to query brother/sister answer sheet fails with 403', () => {
    const users = backend.getSheetRecords('Users');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');
    const ananya = users.find(u => u.fullName === 'Cadet Ananya');

    const res = backend.getStudentAnswerSheet({
      callerId: ananya.id, // Sibling caller
      studentId: aryan.id   // Target student
    });

    assert.strictEqual(res.success, false, 'Sibling caller must be blocked');
    assert.strictEqual(res.code, 403, 'Must return 403 forbidden');
    assert.ok(res.error.includes('UNAUTHORIZED'), 'Must identify unauthorized access');
  });

  runTest('T2.3: Unpaired foreign parent cannot inspect another family child', () => {
    const foreignParent = backend.signUpParent({
      fullName: 'Foreign Parent',
      email: 'foreign.audit@example.com',
      pin: '9876',
      password: 'Password9876'
    });

    const users = backend.getSheetRecords('Users');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');

    const res = backend.getStudentAnswerSheet({
      callerId: foreignParent.user.id,
      studentId: aryan.id
    });

    assert.strictEqual(res.success, false, 'Foreign parent must be blocked');
    assert.strictEqual(res.code, 403, 'Must return 403 code');
  });

  // -------------------------------------------------------------------------
  // GROUP 3: ADAPTIVE PROGRESSION ENGINE & RELATIVE STUDENT PACING
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 3: Dynamic Adaptive Engine & Relative Student Pacing <<<');

  runTest('T3.1: getNextPersonalizedCurriculum respects student grade and tracks progress', () => {
    const users = backend.getSheetRecords('Users');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');

    const prog = backend.getNextPersonalizedCurriculum({
      studentId: aryan.id,
      contentType: 'CurriculumQuizzes'
    });

    assert.ok(prog.success, 'Personalized curriculum query must succeed');
    assert.strictEqual(prog.grade, 'Class 3', 'Must target student enrolled grade');
    assert.ok(typeof prog.progressPercent === 'number', 'Must compute progress percent');
    assert.ok(typeof prog.accuracy === 'number', 'Must calculate student overall accuracy');
  });

  // -------------------------------------------------------------------------
  // GROUP 4: ADMIN BATCH BULK INGESTION
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 4: Admin Batch Bulk Ingestion (bulkUploadContentBatch) <<<');

  runTest('T4.1: Non-admin caller is rejected when attempting bulk upload', () => {
    const users = backend.getSheetRecords('Users');
    const aryan = users.find(u => u.fullName === 'Cadet Aryan');

    const res = backend.bulkUploadContentBatch({
      adminUserId: aryan.id, // Student attempting admin action
      contentType: 'CurriculumQuizzes',
      items: [{ questionText: 'Hacked question' }]
    });

    assert.strictEqual(res.success, false, 'Non-admin must be rejected');
    assert.strictEqual(res.code, 403, 'Must return 403 unauthorized');
  });

  runTest('T4.2: Verified admin can bulk import a batch of curriculum questions', () => {
    backend.ensureAdminUserInSheet();
    const res = backend.bulkUploadContentBatch({
      adminUserId: 'u_adm_demo',
      contentType: 'CurriculumQuizzes',
      items: [
        {
          grade: 'Class 3',
          subject: 'General Science',
          title: 'States of Matter Batch QA',
          questionText: 'Which state of matter has a fixed volume but no fixed shape?',
          options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
          correctOptionIndex: 1,
          hint: 'Think about water poured into a glass.',
          explanation: 'Liquids take the shape of their container while retaining fixed volume.'
        },
        {
          grade: 'Class 3',
          subject: 'Mathematics',
          title: 'Fractions Introduction',
          questionText: 'What fraction of a pizza is left if 1 slice out of 4 is eaten?',
          options: ['1/4', '2/4', '3/4', '4/4'],
          correctOptionIndex: 2,
          hint: 'Subtract 1 from 4 slices.',
          explanation: '4 - 1 = 3 slices remaining, so 3/4 is left.'
        }
      ]
    });

    assert.ok(res.success, 'Admin bulk import must succeed');
    assert.strictEqual(res.importedCount, 2, 'Must import 2 items');

    const quizzes = backend.getSheetRecords('CurriculumQuizzes');
    const imported = quizzes.find(q => q.title === 'States of Matter Batch QA');
    assert.ok(imported, 'Imported question must exist in database');
    assert.strictEqual(imported.grade, 'Class 3');
  });

  // -------------------------------------------------------------------------
  // GROUP 5: FRONTEND SPA DOM ELEMENTS & PARITY AUDIT
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 5: Frontend SPA DOM Elements & Contract Parity <<<');

  runTest('T5.1: Parent HQ Answer Sheet trigger button (#btnOpenParentAnswerSheet) exists', () => {
    assert.ok(htmlContent.includes('id="btnOpenParentAnswerSheet"'), '#btnOpenParentAnswerSheet must exist in HTML');
    assert.ok(htmlContent.includes('openParentAnswerSheetModal()'), 'Must trigger openParentAnswerSheetModal()');
  });

  runTest('T5.2: Parent Answer Sheet Modal (#modal-parent-answersheet) exists with required controls', () => {
    assert.ok(htmlContent.includes('id="modal-parent-answersheet"'), '#modal-parent-answersheet must exist in HTML');
    assert.ok(htmlContent.includes('id="answerSheetChildSelect"'), '#answerSheetChildSelect must exist');
    assert.ok(htmlContent.includes('id="answerSheetSessionSelect"'), '#answerSheetSessionSelect must exist');
    assert.ok(htmlContent.includes('id="answerSheetTotalQuestions"'), '#answerSheetTotalQuestions metric must exist');
    assert.ok(htmlContent.includes('id="answerSheetCorrectCount"'), '#answerSheetCorrectCount metric must exist');
    assert.ok(htmlContent.includes('id="answerSheetAccuracyPct"'), '#answerSheetAccuracyPct metric must exist');
    assert.ok(htmlContent.includes('id="answerSheetTotalPoints"'), '#answerSheetTotalPoints metric must exist');
    assert.ok(htmlContent.includes('id="answerSheetQuestionsContainer"'), '#answerSheetQuestionsContainer must exist');
  });

  runTest('T5.3: Admin Bulk Ingestion tab button and container exist in Admin CMS', () => {
    assert.ok(htmlContent.includes('id="adminTabBtnBulk"'), '#adminTabBtnBulk must exist in HTML');
    assert.ok(htmlContent.includes('id="adminBulkUploadContainer"'), '#adminBulkUploadContainer must exist in HTML');
    assert.ok(htmlContent.includes('id="bulkUploadPayload"'), '#bulkUploadPayload must exist');
    assert.ok(htmlContent.includes('id="btnSubmitBulkUpload"'), '#btnSubmitBulkUpload must exist');
  });

  runTest('T5.4: BrowserMockBackend includes STUDENT_QUESTION_RESPONSES and all 4 API methods', () => {
    assert.ok(htmlContent.includes("STUDENT_QUESTION_RESPONSES: 'zoptro_db_student_question_responses'"), 'STUDENT_QUESTION_RESPONSES must be in KEYS');
    assert.ok(htmlContent.includes('recordQuestionResponses: function'), 'recordQuestionResponses must be in BrowserMockBackend');
    assert.ok(htmlContent.includes('getStudentAnswerSheet: function'), 'getStudentAnswerSheet must be in BrowserMockBackend');
    assert.ok(htmlContent.includes('getNextPersonalizedCurriculum: function'), 'getNextPersonalizedCurriculum must be in BrowserMockBackend');
    assert.ok(htmlContent.includes('bulkUploadContentBatch: function'), 'bulkUploadContentBatch must be in BrowserMockBackend');
  });

  runTest('T5.5: ZoptroApiClient includes wrappers for all 4 new APIs', () => {
    assert.ok(htmlContent.includes("recordQuestionResponses: function(payload) { return this.call('recordQuestionResponses', payload); }"));
    assert.ok(htmlContent.includes("getStudentAnswerSheet: function(payload) { return this.call('getStudentAnswerSheet', payload); }"));
    assert.ok(htmlContent.includes("getNextPersonalizedCurriculum: function(payload) { return this.call('getNextPersonalizedCurriculum', payload); }"));
    assert.ok(htmlContent.includes("bulkUploadContentBatch: function(payload) { return this.call('bulkUploadContentBatch', payload); }"));
  });

  runTest('T5.6: Universal 0px border-radius and brand color compliance', () => {
    assert.ok(htmlContent.includes('border-radius: 0px !important;'), 'Universal 0px border radius must be active');
    assert.ok(htmlContent.includes('#09293D'), 'Authority Blue must be present');
    assert.ok(htmlContent.includes('#F4F2EA'), 'Clarity Ivory must be present');
    assert.ok(htmlContent.includes('#666D57'), 'Grounded Olive must be present');
    assert.ok(htmlContent.includes('#F65800'), 'Progress Orange must be present');
  });

  console.log('\n=========================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('=========================================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main();
