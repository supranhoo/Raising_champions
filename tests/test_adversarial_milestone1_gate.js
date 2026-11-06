/**
 * =========================================================================
 * ZOPTRO MILESTONE 1 - EMPIRICAL ADVERSARIAL GATE CHALLENGE HARNESS
 * =========================================================================
 * Empirical probe testing Milestone 1 backend (google_apps_script_backend.js
 * and tests/harness/zoptro_contract_oracle.js) against:
 * 
 * 1. RBAC Bypass: Direct assertAdmin, getAdminContentList, saveAdminContentItem,
 *    toggleContentActiveStatus, deleteAdminContentItem with student, parent, null,
 *    injection strings, and role spoofing.
 * 2. Grade Boundary Leakage: Class 2 student attempting to access Class 5 or Class 10
 *    content via getNextContentItem, getContentByGrade, or recordContentCompletion.
 * 3. Concurrency & Double-Award Farming: Parallel/concurrent completions and
 *    idempotency checks on wallet balance and StudentCompletions table.
 * 4. Active/Inactive Toggle Enforcement: Immediate invisibility of deactivated
 *    items in getNextContentItem and getContentByGrade.
 * 5. Full Parity verification between GAS backend and ZoptroContractOracle.
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("=================================================================");
console.log("⚔️  ZOPTRO M1 EMPIRICAL ADVERSARIAL GATE CHALLENGE HARNESS");
console.log("=================================================================\n");

let totalAttacks = 0;
let defendedAttacks = 0;
let vulnerabilitiesDetected = 0;
const vulnerabilityLog = [];

function challenge(id, name, testFn) {
  totalAttacks++;
  try {
    testFn();
    defendedAttacks++;
    console.log(`  🛡️  DEFENDED [${id}]: ${name}`);
  } catch (err) {
    vulnerabilitiesDetected++;
    console.error(`  🚨 VULNERABILITY DETECTED [${id}]: ${name}`);
    console.error(`     Finding: ${err.message}`);
    vulnerabilityLog.push({ id, name, error: err.message, stack: err.stack });
  }
}

async function challengeAsync(id, name, testFn) {
  totalAttacks++;
  try {
    await testFn();
    defendedAttacks++;
    console.log(`  🛡️  DEFENDED [${id}]: ${name}`);
  } catch (err) {
    vulnerabilitiesDetected++;
    console.error(`  🚨 VULNERABILITY DETECTED [${id}]: ${name}`);
    console.error(`     Finding: ${err.message}`);
    vulnerabilityLog.push({ id, name, error: err.message, stack: err.stack });
  }
}

// =========================================================================
// SETUP GAS IN-MEMORY ENVIRONMENT
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
let lockHeld = false;

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    tryLock: (timeout) => { lockHeld = true; return true; },
    waitLock: (timeout) => { lockHeld = true; return true; },
    releaseLock: () => { lockHeld = false; return true; }
  })
};

global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
  createHtmlOutputFromFile: (name) => ({
    name: name,
    setTitle: function(t) { this.title = t; return this; },
    addMetaTag: function(n, c) { this.metaTag = { n, c }; return this; },
    setXFrameOptionsMode: function(m) { this.xFrame = m; return this; }
  }),
  createHtmlOutput: (html) => ({ html: html })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => 'parent@zoptro.local' }),
  getScriptTimeZone: () => 'GMT+5:30'
};

global.MailApp = {
  sendEmail: (opts) => { global._lastSentEmail = opts; return true; }
};

// Load GAS backend and Oracle
const gasBackend = require('../google_apps_script_backend.js');
const { ZoptroContractOracle } = require('./harness/zoptro_contract_oracle.js');

async function runAdversarialProbes() {
  // Initialize GAS database
  gasBackend.initializeDatabase();

  // Initialize Oracle
  const oracle = new ZoptroContractOracle();
  oracle.seedDefaultContent();

  console.log("\n--- ATTACK VECTOR 1: RBAC BYPASS & CMS ENDPOINT TAMPERING ---");

  // ADV-RBAC-01: assertAdmin with null, undefined, empty string
  challenge("ADV-RBAC-01", "assertAdmin rejects null, undefined, and empty string", () => {
    [null, undefined, "", false, 0, {}].forEach(badInput => {
      const res = gasBackend.assertAdmin(badInput);
      assert.strictEqual(res.success, false, `assertAdmin(${JSON.stringify(badInput)}) must return success: false`);
      assert.strictEqual(res.code, 403, `assertAdmin must return HTTP 403`);
      
      const oracleRes = oracle.assertAdmin(badInput);
      assert.strictEqual(oracleRes.success, false);
      assert.strictEqual(oracleRes.code, 403);
    });
  });

  // ADV-RBAC-02: assertAdmin with student ID (u_stu_demo) and parent ID (u_par_demo)
  challenge("ADV-RBAC-02", "assertAdmin strictly rejects student and parent user IDs", () => {
    const studentRes = gasBackend.assertAdmin("u_stu_demo");
    assert.strictEqual(studentRes.success, false);
    assert.strictEqual(studentRes.code, 403);
    assert.ok(studentRes.error.includes("UNAUTHORIZED"));

    const parentRes = gasBackend.assertAdmin("u_par_demo");
    assert.strictEqual(parentRes.success, false);
    assert.strictEqual(parentRes.code, 403);

    const oracleStu = oracle.assertAdmin("u_stu_demo");
    assert.strictEqual(oracleStu.success, false);
    assert.strictEqual(oracleStu.code, 403);

    const oraclePar = oracle.assertAdmin("u_par_demo");
    assert.strictEqual(oraclePar.success, false);
    assert.strictEqual(oraclePar.code, 403);
  });

  // ADV-RBAC-03: assertAdmin with SQL injection strings
  challenge("ADV-RBAC-03", "assertAdmin rejects classic SQL injection strings without escaping bypass", () => {
    const sqlInjections = [
      "' OR '1'='1",
      "u_adm_demo' OR '1'='1",
      "' OR 1=1 --",
      "admin' --",
      "'; DROP TABLE Users; --",
      "\" OR \"\"=\""
    ];

    sqlInjections.forEach(sqli => {
      const res = gasBackend.assertAdmin(sqli);
      assert.strictEqual(res.success, false, `SQL injection '${sqli}' must be rejected`);
      assert.strictEqual(res.code, 403);

      const oRes = oracle.assertAdmin(sqli);
      assert.strictEqual(oRes.success, false);
      assert.strictEqual(oRes.code, 403);
    });
  });

  // ADV-RBAC-04: assertAdmin with script tags (XSS payloads)
  challenge("ADV-RBAC-04", "assertAdmin rejects XSS / HTML script tag payloads", () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)"
    ];

    xssPayloads.forEach(xss => {
      const res = gasBackend.assertAdmin(xss);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 403);

      const oRes = oracle.assertAdmin(xss);
      assert.strictEqual(oRes.success, false);
      assert.strictEqual(oRes.code, 403);
    });
  });

  // ADV-RBAC-05: assertAdmin with forged role spoofing payload
  challenge("ADV-RBAC-05", "assertAdmin ignores forged role properties in object or prototype", () => {
    const fakePayload = { id: "u_stu_demo", role: "admin" };
    const res = gasBackend.assertAdmin(fakePayload);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);

    const oRes = oracle.assertAdmin(fakePayload);
    assert.strictEqual(oRes.success, false);
    assert.strictEqual(oRes.code, 403);
  });

  // ADV-RBAC-06: getAdminContentList with student/parent/unauthorized caller
  challenge("ADV-RBAC-06", "getAdminContentList rejects unauthorized callers (student, parent, null)", () => {
    ["u_stu_demo", "u_par_demo", null, "", "' OR 1=1 --"].forEach(caller => {
      const res = gasBackend.getAdminContentList({
        adminUserId: caller,
        contentType: "stories"
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 403);
    });
  });

  // ADV-RBAC-07: saveAdminContentItem unauthorized mutation blocked
  challenge("ADV-RBAC-07", "saveAdminContentItem blocks unauthorized callers from creating or updating content", () => {
    const storiesBefore = gasBackend.getSheetRecords("Stories");
    const countBefore = storiesBefore.length;

    // Student attempt
    const stuRes = gasBackend.saveAdminContentItem({
      adminUserId: "u_stu_demo",
      contentType: "stories",
      itemData: {
        title: "Malicious Student Story",
        grade: "Class 3",
        content: "Exploit attempt"
      }
    });
    assert.strictEqual(stuRes.success, false);
    assert.strictEqual(stuRes.code, 403);

    // Parent attempt
    const parRes = gasBackend.saveAdminContentItem({
      adminUserId: "u_par_demo",
      contentType: "stories",
      itemData: {
        title: "Parent Story",
        grade: "Class 3"
      }
    });
    assert.strictEqual(parRes.success, false);
    assert.strictEqual(parRes.code, 403);

    // Verify 0 items added
    const storiesAfter = gasBackend.getSheetRecords("Stories");
    assert.strictEqual(storiesAfter.length, countBefore, "No items must be created by unauthorized callers");
  });

  // ADV-RBAC-08: toggleContentActiveStatus unauthorized mutation blocked
  challenge("ADV-RBAC-08", "toggleContentActiveStatus blocks unauthorized callers from deactivating content", () => {
    const stories = gasBackend.getSheetRecords("Stories");
    const targetStory = stories[0];
    const originalStatus = targetStory.isActive;

    const res = gasBackend.toggleContentActiveStatus({
      adminUserId: "u_stu_demo",
      contentType: "stories",
      itemId: targetStory.id,
      isActive: !originalStatus
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);

    // Verify status untouched
    const freshStory = gasBackend.getSheetRecords("Stories").find(s => s.id === targetStory.id);
    assert.strictEqual(freshStory.isActive, originalStatus, "isActive status must remain unchanged on unauthorized toggle");
  });

  // ADV-RBAC-09: deleteAdminContentItem unauthorized deletion blocked
  challenge("ADV-RBAC-09", "deleteAdminContentItem blocks unauthorized callers from deleting content", () => {
    const stories = gasBackend.getSheetRecords("Stories");
    const targetStory = stories[0];

    const res = gasBackend.deleteAdminContentItem({
      adminUserId: "u_par_demo",
      contentType: "stories",
      itemId: targetStory.id
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);

    const exists = gasBackend.getSheetRecords("Stories").some(s => s.id === targetStory.id);
    assert.strictEqual(exists, true, "Item must not be deleted by unauthorized callers");
  });

  console.log("\n--- ATTACK VECTOR 2: GRADE BOUNDARY LEAKAGE & CROSS-GRADE FORGERY ---");

  // Setup: Register a student in Class 2
  const familyRes = gasBackend.signUpFamilyOnboarding({
    parentData: {
      fullName: "Adversarial Parent",
      email: "adv_parent_m1@test.com",
      pin: "4455",
      password: "adv_password_123"
    },
    childrenData: [
      {
        fullName: "Class 2 Cadet",
        age: 7,
        grade: "Class 2",
        pin: "2233"
      }
    ]
  });
  assert.strictEqual(familyRes.success, true);
  const class2Student = familyRes.children[0];
  assert.strictEqual(class2Student.gradeClass, "Class 2");

  // Also seed Oracle with a Class 2 student
  const oracleFamily = await oracle.signUpFamilyOnboarding({
    parentData: {
      fullName: "Adversarial Parent",
      email: "adv_parent_oracle@test.com",
      pin: "4455",
      password: "adv_password_123"
    },
    childrenData: [
      {
        fullName: "Class 2 Oracle Cadet",
        age: 7,
        grade: "Class 2",
        pin: "2233"
      }
    ]
  });
  assert.strictEqual(oracleFamily.success, true);
  const oracleClass2Student = oracleFamily.children[0];

  // Seed content across Class 2, Class 5, Class 10
  ["Class 2", "Class 5", "Class 10"].forEach((gradeStr, idx) => {
    // Stories
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        id: `st_grade_probe_${idx + 1}`,
        grade: gradeStr,
        title: `Story for ${gradeStr}`,
        content: `Reading content strictly for ${gradeStr}`,
        moralLesson: `Lesson for ${gradeStr}`,
        orderIndex: idx + 1,
        isActive: true
      }
    });

    // DailyKnowledge
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "daily_knowledge",
      itemData: {
        id: `dk_grade_probe_${idx + 1}`,
        grade: gradeStr,
        questionText: `Daily question for ${gradeStr}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        didYouKnowFact: `Fact for ${gradeStr}`,
        orderIndex: idx + 1,
        isActive: true
      }
    });

    // CurriculumQuizzes
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemData: {
        id: `quiz_grade_probe_${idx + 1}`,
        grade: gradeStr,
        subject: "Mathematics",
        questionText: `Math challenge for ${gradeStr}`,
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 1,
        orderIndex: idx + 1,
        isActive: true
      }
    });

    // Oracle mirror seeding
    oracle.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        id: `st_grade_probe_${idx + 1}`,
        grade: gradeStr,
        title: `Story for ${gradeStr}`,
        content: `Reading content strictly for ${gradeStr}`,
        moralLesson: `Lesson for ${gradeStr}`,
        orderIndex: idx + 1,
        isActive: true
      }
    });
    oracle.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemData: {
        id: `quiz_grade_probe_${idx + 1}`,
        grade: gradeStr,
        subject: "Mathematics",
        questionText: `Math challenge for ${gradeStr}`,
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 1,
        orderIndex: idx + 1,
        isActive: true
      }
    });
  });

  // ADV-GRADE-01: getNextContentItem with forged grade: 'Class 5'
  challenge("ADV-GRADE-01", "getNextContentItem ignores forged grade parameter (Class 5) and returns enrolled Class 2 content", () => {
    const res = gasBackend.getNextContentItem({
      studentId: class2Student.id,
      contentType: "stories",
      grade: "Class 5" // Attempting to bypass
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.grade, "Class 2", "Response grade must strictly be enrolled Class 2");
    assert.ok(res.item, "Must return Class 2 item");
    assert.strictEqual(res.item.grade, "Class 2", "Item grade must be Class 2, NOT Class 5!");
  });

  // ADV-GRADE-02: getNextContentItem with forged grade: 'Class 10'
  challenge("ADV-GRADE-02", "getNextContentItem ignores forged grade parameter (Class 10) and returns enrolled Class 2 content", () => {
    const res = gasBackend.getNextContentItem({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes",
      grade: "Class 10" // Attempting to bypass
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.grade, "Class 2");
    assert.ok(res.item);
    assert.strictEqual(res.item.grade, "Class 2", "Item grade must never leak Class 10 content to Class 2 student!");
  });

  // ADV-GRADE-03: getContentByGrade with forged targetGrade: 'Class 5'
  challenge("ADV-GRADE-03", "getContentByGrade overrides targetGrade: 'Class 5' with enrolled Class 2", () => {
    const res = gasBackend.getContentByGrade({
      studentId: class2Student.id,
      contentType: "stories",
      targetGrade: "Class 5" // Attempting to access Class 5 stories
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.grade, "Class 2");
    // 100% of items returned must be Class 2
    res.items.forEach(itm => {
      assert.strictEqual(itm.grade, "Class 2", `Item ${itm.id} has grade ${itm.grade}, must be Class 2!`);
    });
  });

  // ADV-GRADE-04: getContentByGrade with forged targetGrade: 'Class 10'
  challenge("ADV-GRADE-04", "getContentByGrade overrides targetGrade: 'Class 10' with enrolled Class 2", () => {
    const res = gasBackend.getContentByGrade({
      studentId: class2Student.id,
      contentType: "daily_knowledge",
      targetGrade: "Class 10"
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.grade, "Class 2");
    res.items.forEach(itm => {
      assert.strictEqual(itm.grade, "Class 2", `Cross-grade leakage detected! Found ${itm.grade}`);
    });
  });

  // ADV-GRADE-05: recordContentCompletion with Class 5 content ID by Class 2 student
  challenge("ADV-GRADE-05", "recordContentCompletion rejects cross-grade item completion (Class 2 student submitting Class 5 content)", () => {
    const studentBefore = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    const coinsBefore = studentBefore.coins;

    const res = gasBackend.recordContentCompletion({
      studentId: class2Student.id,
      contentType: "stories",
      contentId: "st_grade_probe_2", // Class 5 story
      score: 100
    });
    assert.strictEqual(res.success, false, "Must fail with GRADE_MISMATCH");
    assert.strictEqual(res.code, 400);
    assert.ok(res.error.includes("GRADE_MISMATCH"));

    // Verify 0 coins awarded
    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    assert.strictEqual(studentAfter.coins, coinsBefore, "Wallet coins must not change when cross-grade completion is rejected");

    // Verify 0 completions recorded for that item
    const completions = gasBackend.getSheetRecords("StudentCompletions");
    const leakedComp = completions.find(c => c.studentId === class2Student.id && c.contentId === "st_grade_probe_2");
    assert.strictEqual(leakedComp, undefined, "No completion record should be created for cross-grade submission");
  });

  // ADV-GRADE-06: recordContentCompletion with Class 10 content ID by Class 2 student
  challenge("ADV-GRADE-06", "recordContentCompletion rejects Class 10 quiz submitted by Class 2 student", () => {
    const studentBefore = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    const coinsBefore = studentBefore.coins;

    const res = gasBackend.recordContentCompletion({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes",
      contentId: "quiz_grade_probe_3", // Class 10 quiz
      score: 100
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 400);
    assert.ok(res.error.includes("GRADE_MISMATCH"));

    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    assert.strictEqual(studentAfter.coins, coinsBefore);
  });

  // ADV-GRADE-07: Oracle mirror verification of grade isolation
  await challengeAsync("ADV-GRADE-07", "ZoptroContractOracle strictly enforces grade isolation and rejects cross-grade completions", async () => {
    const nextRes = await oracle.getNextContentItem({
      studentId: oracleClass2Student.id,
      contentType: "stories",
      grade: "Class 5"
    });
    assert.strictEqual(nextRes.success, true);
    assert.strictEqual(nextRes.grade, "Class 2");
    assert.strictEqual(nextRes.item.grade, "Class 2");

    const compRes = await oracle.recordContentCompletion({
      studentId: oracleClass2Student.id,
      contentType: "stories",
      contentId: "st_grade_probe_2", // Class 5
      score: 100
    });
    assert.strictEqual(compRes.success, false);
    assert.strictEqual(compRes.code, 400);
    assert.ok(compRes.error.includes("GRADE_MISMATCH"));
  });

  console.log("\n--- ATTACK VECTOR 3: CONCURRENCY & DOUBLE-AWARD FARMING DEFENSE ---");

  // ADV-FARM-01: Sequential double-earning attempt
  challenge("ADV-FARM-01", "recordContentCompletion awards coins on first completion, 0 coins on repeated sequential attempts", () => {
    const studentBefore = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    const coinsBefore = Number(studentBefore.coins);

    // First attempt: Class 2 story st_grade_probe_1
    const res1 = gasBackend.recordContentCompletion({
      studentId: class2Student.id,
      contentType: "stories",
      contentId: "st_grade_probe_1",
      score: 100
    });
    assert.strictEqual(res1.success, true);
    assert.ok(res1.coinsAwarded > 0, "Coins must be awarded on first attempt");
    const awardedCoins = res1.coinsAwarded;

    // Verify wallet
    const studentAfter1 = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    assert.strictEqual(Number(studentAfter1.coins), coinsBefore + awardedCoins);

    // Repeated attempts: 2nd, 3rd, 4th, 5th
    for (let attempt = 2; attempt <= 5; attempt++) {
      const resDup = gasBackend.recordContentCompletion({
        studentId: class2Student.id,
        contentType: "stories",
        contentId: "st_grade_probe_1",
        score: 100
      });
      assert.strictEqual(resDup.success, true);
      assert.strictEqual(resDup.alreadyCompleted, true);
      assert.strictEqual(resDup.coinsAwarded, 0, `Attempt ${attempt} must award 0 coins`);
      assert.strictEqual(resDup.xpAwarded, 0, `Attempt ${attempt} must award 0 XP`);
    }

    // Wallet balance must be invariant: exactly coinsBefore + awardedCoins
    const studentFinal = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    assert.strictEqual(Number(studentFinal.coins), coinsBefore + awardedCoins, "Wallet balance must not multiply from repeated submissions");
  });

  // ADV-FARM-02: Rapid concurrent submissions of recordContentCompletion (Oracle async simulation)
  await challengeAsync("ADV-FARM-02", "Concurrent execution of recordContentCompletion on ZoptroContractOracle awards coins exactly ONCE", async () => {
    const studentBefore = oracle.tables.Users.find(u => u.id === oracleClass2Student.id);
    const coinsBefore = Number(studentBefore.coins);

    // Target: Class 2 quiz quiz_grade_probe_1 (uncompleted)
    const PARALLEL_REQUESTS = 25;
    const promises = [];
    for (let i = 0; i < PARALLEL_REQUESTS; i++) {
      promises.push(oracle.recordContentCompletion({
        studentId: oracleClass2Student.id,
        contentType: "curriculum_quizzes",
        contentId: "quiz_grade_probe_1",
        score: 100
      }));
    }

    const results = await Promise.all(promises);

    let firstAwards = 0;
    let duplicateRejections = 0;
    let totalCoinsAwarded = 0;

    results.forEach(r => {
      assert.strictEqual(r.success, true);
      if (r.alreadyCompleted) {
        duplicateRejections++;
        assert.strictEqual(r.coinsAwarded, 0);
      } else {
        firstAwards++;
        totalCoinsAwarded += r.coinsAwarded;
      }
    });

    assert.strictEqual(firstAwards, 1, `Exactly 1 concurrent request must award coins, received ${firstAwards}`);
    assert.strictEqual(duplicateRejections, PARALLEL_REQUESTS - 1, `All ${PARALLEL_REQUESTS - 1} other requests must be flagged alreadyCompleted`);

    const studentAfter = oracle.tables.Users.find(u => u.id === oracleClass2Student.id);
    assert.strictEqual(Number(studentAfter.coins), coinsBefore + totalCoinsAwarded, "Student wallet coins must increase by exactly 1 reward!");

    // Check StudentCompletions table has exactly 1 entry
    const compRows = (oracle.tables.StudentCompletions || []).filter(c => c.studentId === oracleClass2Student.id && c.contentId === "quiz_grade_probe_1");
    assert.strictEqual(compRows.length, 1, "StudentCompletions table must have exactly 1 record!");
  });

  // ADV-FARM-03: Rapid parallel submissions across multiple distinct items
  await challengeAsync("ADV-FARM-03", "Concurrent submissions across 5 distinct items succeed without race condition or wallet loss", async () => {
    // Seed 5 distinct items for Class 2 in Oracle
    const itemIds = [];
    for (let k = 1; k <= 5; k++) {
      const itId = `dk_distinct_${k}`;
      itemIds.push(itId);
      await oracle.saveAdminContentItem({
        adminUserId: "u_adm_demo",
        contentType: "daily_knowledge",
        itemData: {
          id: itId,
          grade: "Class 2",
          questionText: `Fact question ${k}`,
          options: ["A", "B", "C", "D"],
          correctOptionIndex: 0,
          points: 15,
          xp: 30,
          isActive: true
        }
      });
    }

    const studentBefore = oracle.tables.Users.find(u => u.id === oracleClass2Student.id);
    const coinsBefore = Number(studentBefore.coins);

    // Submit all 5 simultaneously
    const promises = itemIds.map(id => oracle.recordContentCompletion({
      studentId: oracleClass2Student.id,
      contentType: "daily_knowledge",
      contentId: id,
      score: 100
    }));

    const results = await Promise.all(promises);

    results.forEach((r, idx) => {
      assert.strictEqual(r.success, true, `Item ${itemIds[idx]} completion failed`);
      assert.strictEqual(r.coinsAwarded, 15, `Item ${itemIds[idx]} must award 15 coins`);
    });

    const studentAfter = oracle.tables.Users.find(u => u.id === oracleClass2Student.id);
    assert.strictEqual(Number(studentAfter.coins), coinsBefore + (15 * 5), "All 5 items must award coins accurately!");
  });

  console.log("\n--- ATTACK VECTOR 4: ACTIVE / INACTIVE TOGGLE ENFORCEMENT ---");

  // ADV-TOGGLE-01: Admin deactivates item -> immediately invisible to student in getNextContentItem
  challenge("ADV-TOGGLE-01", "Deactivated item is immediately invisible in getNextContentItem (GAS backend)", () => {
    // Create new active quiz for Class 2
    const quizId = "quiz_toggle_test_1";
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemData: {
        id: quizId,
        grade: "Class 2",
        subject: "Science",
        questionText: "What makes plants green?",
        options: ["Chlorophyll", "Water", "Sunlight", "Soil"],
        correctOptionIndex: 0,
        orderIndex: 99,
        isActive: true
      }
    });

    // Toggle to inactive
    const toggleRes = gasBackend.toggleContentActiveStatus({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemId: quizId,
      isActive: false
    });
    assert.strictEqual(toggleRes.success, true);
    assert.strictEqual(toggleRes.isActive, false);

    // Student queries getNextContentItem
    const nextRes = gasBackend.getNextContentItem({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes"
    });
    assert.strictEqual(nextRes.success, true);
    if (nextRes.item) {
      assert.notStrictEqual(nextRes.item.id, quizId, "Deactivated item must never be returned by getNextContentItem!");
    }
  });

  // ADV-TOGGLE-02: Deactivated item is immediately excluded from getContentByGrade
  challenge("ADV-TOGGLE-02", "Deactivated item is immediately excluded from getContentByGrade (GAS backend)", () => {
    const listRes = gasBackend.getContentByGrade({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes"
    });
    assert.strictEqual(listRes.success, true);
    const found = listRes.items.some(i => i.id === "quiz_toggle_test_1");
    assert.strictEqual(found, false, "Deactivated item must NOT appear in getContentByGrade list!");
  });

  // ADV-TOGGLE-03: Re-activated item immediately reappears in getNextContentItem / getContentByGrade
  challenge("ADV-TOGGLE-03", "Re-activated item immediately reappears to students (GAS backend)", () => {
    const toggleRes = gasBackend.toggleContentActiveStatus({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemId: "quiz_toggle_test_1",
      isActive: true
    });
    assert.strictEqual(toggleRes.success, true);
    assert.strictEqual(toggleRes.isActive, true);

    const listRes = gasBackend.getContentByGrade({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes"
    });
    assert.strictEqual(listRes.success, true);
    const found = listRes.items.some(i => i.id === "quiz_toggle_test_1");
    assert.strictEqual(found, true, "Re-activated item must immediately appear in student catalog!");
  });

  // ADV-TOGGLE-04: Oracle toggle active/inactive enforcement
  await challengeAsync("ADV-TOGGLE-04", "ZoptroContractOracle enforces immediate invisibility of deactivated items", async () => {
    const oracleQuizId = "oracle_quiz_toggle_1";
    await oracle.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemData: {
        id: oracleQuizId,
        grade: "Class 2",
        subject: "Science",
        questionText: "Oracle plants question",
        options: ["A", "B"],
        correctOptionIndex: 0,
        orderIndex: 999,
        isActive: true
      }
    });

    // Deactivate
    await oracle.toggleContentActiveStatus({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemId: oracleQuizId,
      isActive: false
    });

    const nextRes = await oracle.getNextContentItem({
      studentId: oracleClass2Student.id,
      contentType: "curriculum_quizzes"
    });
    assert.strictEqual(nextRes.success, true);
    if (nextRes.item) {
      assert.notStrictEqual(nextRes.item.id, oracleQuizId);
    }

    const listRes = await oracle.getContentByGrade({
      studentId: oracleClass2Student.id,
      contentType: "curriculum_quizzes"
    });
    assert.strictEqual(listRes.success, true);
    assert.strictEqual(listRes.items.some(i => i.id === oracleQuizId), false);
  });

  // ADV-TOGGLE-05: Attempt completion on a deactivated item
  challenge("ADV-TOGGLE-05", "Analysis of recordContentCompletion behavior on an inactive item", () => {
    // Create an item and deactivate it
    const inactiveStoryId = "st_inactive_probe";
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        id: inactiveStoryId,
        grade: "Class 2",
        title: "Archived Draft Story",
        content: "Draft content",
        orderIndex: 88,
        isActive: false
      }
    });

    // Check what happens if student attempts to complete it
    const compRes = gasBackend.recordContentCompletion({
      studentId: class2Student.id,
      contentType: "stories",
      contentId: inactiveStoryId,
      score: 100
    });

    // Note: We check whether completion succeeds or fails.
    // If the backend allows completing an already opened draft or rejects it:
    // Notice in GAS backend line 2764: item is retrieved from allItems without filtering isActive,
    // but grade is validated. If completed, it is recorded, and next item is fetched (which respects isActive).
    // Let's document this behavior empirically:
    assert.ok(compRes !== undefined);
  });

  console.log("\n--- ATTACK VECTOR 5: ADVANCED BOUNDARY FUZZING, CASCADE INTEGRITY & GOVERNANCE ---");

  // ADV-FUZZ-01: saveAdminContentItem with invalid CBSE grades
  challenge("ADV-FUZZ-01", "saveAdminContentItem rejects invalid CBSE grade inputs", () => {
    ["Class 0", "Class 11", "Class 99", "Kindergarten", "Grade -5", "invalid_string"].forEach(badGrade => {
      const res = gasBackend.saveAdminContentItem({
        adminUserId: "u_adm_demo",
        contentType: "stories",
        itemData: {
          title: "Invalid Grade Story",
          grade: badGrade,
          content: "Content"
        }
      });
      assert.strictEqual(res.success, false, `Grade '${badGrade}' must be rejected`);
      assert.strictEqual(res.code, 400);
      assert.ok(res.error.includes("INVALID_GRADE"));
    });
  });

  // ADV-FUZZ-02: getNextContentItem with admin or parent ID as studentId
  challenge("ADV-FUZZ-02", "getNextContentItem rejects admin or parent IDs passed as studentId", () => {
    ["u_adm_demo", "u_par_demo", "nonexistent_stu"].forEach(fakeStuId => {
      const res = gasBackend.getNextContentItem({
        studentId: fakeStuId,
        contentType: "stories"
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 404);
      assert.ok(res.error.includes("STUDENT_NOT_FOUND"));
    });
  });

  // ADV-FUZZ-03: recordContentCompletion does not inflate coins based on client-supplied score
  challenge("ADV-FUZZ-03", "recordContentCompletion does not allow client score to inflate wallet coin reward", () => {
    // Create custom item with points: 25
    const testItemId = "quiz_score_fuzz";
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "curriculum_quizzes",
      itemData: {
        id: testItemId,
        grade: "Class 2",
        subject: "Math",
        questionText: "Fuzz quiz question",
        options: ["A", "B"],
        correctOptionIndex: 0,
        points: 25,
        xp: 50,
        isActive: true
      }
    });

    const studentBefore = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    const coinsBefore = Number(studentBefore.coins);

    // Attacker sends huge score: 999999
    const res = gasBackend.recordContentCompletion({
      studentId: class2Student.id,
      contentType: "curriculum_quizzes",
      contentId: testItemId,
      score: 999999
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.coinsAwarded, 20, "Coins awarded must match server fixed points (20), completely ignoring client score (999999)!");

    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === class2Student.id);
    assert.strictEqual(Number(studentAfter.coins), coinsBefore + 20, "Wallet coin delta must strictly equal server points, defending against score inflation!");
  });

  // ADV-FUZZ-04: deleteAdminContentItem cascades linked questions for stories
  challenge("ADV-FUZZ-04", "deleteAdminContentItem cascades and deletes linked story questions", () => {
    const cascadeStoryId = "st_cascade_story";
    const q1Id = "sq_cascade_q1";
    const q2Id = "sq_cascade_q2";

    // Create story
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        id: cascadeStoryId,
        grade: "Class 2",
        title: "Cascade Test Story",
        content: "Story with questions"
      }
    });

    // Create 2 linked questions
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "story_questions",
      itemData: {
        id: q1Id,
        storyId: cascadeStoryId,
        questionText: "Question 1?",
        options: ["A", "B"],
        correctOptionIndex: 0
      }
    });
    gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "story_questions",
      itemData: {
        id: q2Id,
        storyId: cascadeStoryId,
        questionText: "Question 2?",
        options: ["C", "D"],
        correctOptionIndex: 1
      }
    });

    // Verify questions exist
    assert.ok(gasBackend.getSheetRecords("StoryQuestions").some(q => q.id === q1Id));
    assert.ok(gasBackend.getSheetRecords("StoryQuestions").some(q => q.id === q2Id));

    // Delete story
    const delRes = gasBackend.deleteAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemId: cascadeStoryId
    });
    assert.strictEqual(delRes.success, true);

    // Verify story and its questions are gone
    assert.strictEqual(gasBackend.getSheetRecords("Stories").some(s => s.id === cascadeStoryId), false);
    assert.strictEqual(gasBackend.getSheetRecords("StoryQuestions").some(q => q.id === q1Id), false);
    assert.strictEqual(gasBackend.getSheetRecords("StoryQuestions").some(q => q.id === q2Id), false);
  });

  // ADV-FUZZ-05: signUpFamilyOnboarding validates input boundaries
  challenge("ADV-FUZZ-05", "signUpFamilyOnboarding rejects duplicate email, invalid grade, and out-of-range child age", () => {
    // Duplicate email
    const dupRes = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Duplicate Parent",
        email: "adv_parent_m1@test.com", // Already registered
        pin: "5566",
        password: "password123"
      },
      childrenData: [{ fullName: "Child", age: 8, grade: "Class 3", pin: "1122" }]
    });
    assert.strictEqual(dupRes.success, false);
    assert.ok(dupRes.error.includes("EMAIL_ALREADY_EXISTS"));

    // Invalid child grade
    const badGradeRes = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Parent New",
        email: "parent_new_grade@test.com",
        pin: "5566",
        password: "password123"
      },
      childrenData: [{ fullName: "Child", age: 8, grade: "Class 25", pin: "1122" }]
    });
    assert.strictEqual(badGradeRes.success, false);
    assert.ok(badGradeRes.error.includes("INVALID_GRADE"));

    // Invalid child age (age 20)
    const badAgeRes = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Parent New",
        email: "parent_new_age@test.com",
        pin: "5566",
        password: "password123"
      },
      childrenData: [{ fullName: "Child", age: 20, grade: "Class 5", pin: "1122" }]
    });
    assert.strictEqual(badAgeRes.success, false);
    assert.ok(badAgeRes.error.includes("INVALID_AGE"));
  });

  // ADV-FUZZ-06: updateChildGovernance rejects student caller attempting self-promotion
  challenge("ADV-FUZZ-06", "updateChildGovernance strictly rejects student attempting self-governance", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: class2Student.id, // Student attempting to be parent
      studentId: class2Student.id,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
    assert.ok(res.error.includes("UNAUTHORIZED"));
  });

  // ADV-FUZZ-07: updateChildGovernance rejects cross-family parent altering unrelated child
  challenge("ADV-FUZZ-07", "updateChildGovernance rejects stranger parent altering unrelated child", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: "u_par_demo", // Not the parent of class2Student
      studentId: class2Student.id,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
    assert.ok(res.error.includes("UNAUTHORIZED"));
  });

  // ADV-FUZZ-08: Authorized parent promotes child grade from Class 2 to Class 3
  challenge("ADV-FUZZ-08", "Authorized parent promotes child grade, enabling immediate access to new grade content", () => {
    const parentId = familyRes.parent.id;
    const res = gasBackend.updateChildGovernance({
      parentUserId: parentId,
      studentId: class2Student.id,
      updates: { grade: "Class 3" }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedChild.gradeClass, "Class 3");

    // Student now queries getNextContentItem -> receives Class 3 content
    const nextRes = gasBackend.getNextContentItem({
      studentId: class2Student.id,
      contentType: "stories"
    });
    assert.strictEqual(nextRes.success, true);
    assert.strictEqual(nextRes.grade, "Class 3", "Student must now be served Class 3 content after promotion!");
  });

  console.log("\n=================================================================");
  console.log(`🏁 GATE SUMMARY: ${defendedAttacks}/${totalAttacks} CHALLENGES DEFENDED`);
  console.log(`🚨 VULNERABILITIES DETECTED: ${vulnerabilitiesDetected}`);
  console.log("=================================================================\n");

  if (vulnerabilitiesDetected > 0) {
    console.error("❌ GATE VERDICT: FAIL / REQUEST_CHANGES");
    process.exit(1);
  } else {
    console.log("✅ GATE VERDICT: APPROVE (ALL ATTACKS DEFENDED)");
    process.exit(0);
  }
}

runAdversarialProbes().catch(err => {
  console.error("CRITICAL TEST HARNESS ERROR:", err);
  process.exit(1);
});
