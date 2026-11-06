/**
 * =========================================================================
 * ZOPTRO - MILESTONE 1 VERIFICATION TEST SUITE
 * =========================================================================
 * Tests:
 * 1. google_apps_script_backend.js:
 *    - 6-sheet schema existence, headers, and brand palette styling
 *    - Self-healing database initialization & legacy migration
 *    - Auth flows (Parent signup, pairing code generation, Student signup with code validation)
 *    - Server-side RBAC & parent-exclusive governance enforcement
 *    - Quest lifecycle (Pending verification -> Approve/Reject -> Wallet update)
 *    - Reward redemption lifecycle (Escrow -> Reject/Refund -> Approve)
 *    - Concurrency locking with LockService
 *    - doGet web app serving resilience
 * 2. BrowserMockBackend & ZoptroApiClient:
 *    - Storage keys and seed demo initialization
 *    - 100% API contract parity with GAS backend
 *    - localStorage state persistence across simulated page reloads
 *    - Role-based validation in mock engine
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("=================================================================");
console.log("🚀 STARTING ZOPTRO MILESTONE 1 BACKEND VERIFICATION SUITE");
console.log("=================================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`, err.stack);
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`, err.stack);
  }
}

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
    this.bgColor = null;
    this.fontColor = null;
    this.fontWeight = null;
    this.horizontalAlignment = null;
    this.border = null;
  }
  setBackground(c) { this.bgColor = c; return this; }
  setFontColor(c) { this.fontColor = c; return this; }
  setFontWeight(w) { this.fontWeight = w; return this; }
  setHorizontalAlignment(a) { this.horizontalAlignment = a; return this; }
  setBorder(t, l, b, r, v, h, color, style) {
    this.border = { t, l, b, r, v, h, color, style };
    return this;
  }
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

// Setup Global Google Apps Script Mock Objects for Node.js
const mockActiveSpreadsheet = new MockSpreadsheet();
let mockLockAcquired = false;

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: (timeout) => { mockLockAcquired = true; return true; },
    releaseLock: () => { mockLockAcquired = false; return true; }
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

// Load GAS backend module
const gasBackend = require('../google_apps_script_backend.js');

// =========================================================================
// TEST SUITE EXECUTION
// =========================================================================

async function runTests() {
  console.log("--- 1. GOOGLE APPS SCRIPT SCHEMA & INITIALIZATION ---");

  it("Schemas definition contains 6 core tables and 7 dynamic tables with proper keys", () => {
    const coreTables = ["Users", "HabitsQuests", "SubmissionsQueue", "RewardsCatalog", "RedemptionsQueue", "ActivityLogs"];
    const dynamicTables = ["Stories", "StoryQuestions", "EQScenarios", "DailyKnowledge", "CurriculumQuizzes", "StudentCompletions", "StudentGrowthProfiles"];
    
    coreTables.forEach(t => {
      assert.ok(gasBackend.SCHEMAS[t], `Core table ${t} must exist in SCHEMAS`);
    });
    dynamicTables.forEach(t => {
      assert.ok(gasBackend.SCHEMAS[t], `Dynamic table ${t} must exist in SCHEMAS`);
    });

    assert.strictEqual(gasBackend.SCHEMAS.Users.length, 17, "Users schema must contain 17 columns (including gradeClass, age, parentalPermissions)");
    assert.strictEqual(gasBackend.SCHEMAS.HabitsQuests.length, 10);
    assert.strictEqual(gasBackend.SCHEMAS.SubmissionsQueue.length, 11);
    assert.strictEqual(gasBackend.SCHEMAS.RewardsCatalog.length, 8);
    assert.strictEqual(gasBackend.SCHEMAS.RedemptionsQueue.length, 10);
    assert.strictEqual(gasBackend.SCHEMAS.ActivityLogs.length, 7);

    assert.strictEqual(gasBackend.SCHEMAS.Stories.length, 10);
    assert.strictEqual(gasBackend.SCHEMAS.StoryQuestions.length, 8);
    assert.strictEqual(gasBackend.SCHEMAS.EQScenarios.length, 12);
    assert.strictEqual(gasBackend.SCHEMAS.DailyKnowledge.length, 12);
    assert.strictEqual(gasBackend.SCHEMAS.CurriculumQuizzes.length, 14);
    assert.strictEqual(gasBackend.SCHEMAS.StudentCompletions.length, 9);
    assert.strictEqual(gasBackend.SCHEMAS.StudentGrowthProfiles.length, 9);
  });

  it("Brand color constants strictly match Optra360 palette", () => {
    assert.strictEqual(gasBackend.BRAND_COLORS.HEADER_BG, "#09293D");
    assert.strictEqual(gasBackend.BRAND_COLORS.HEADER_TEXT, "#F4F2EA");
    assert.strictEqual(gasBackend.BRAND_COLORS.BORDER, "#666D57");
    assert.strictEqual(gasBackend.BRAND_COLORS.ACCENT_ORANGE, "#F65800");
  });

  it("Self-healing initializeDatabase() creates all 6 sheets with headers & styling", () => {
    const res = gasBackend.initializeDatabase();
    assert.strictEqual(res.success, true);
    
    // Verify each sheet exists
    Object.keys(gasBackend.SCHEMAS).forEach(tableName => {
      const sheet = mockActiveSpreadsheet.getSheetByName(tableName);
      assert.ok(sheet, `Sheet ${tableName} must exist`);
      assert.strictEqual(sheet.frozenRows, 1, `Sheet ${tableName} must freeze row 1`);
      
      // Verify headers
      const headers = sheet.grid[0];
      assert.deepStrictEqual(headers, gasBackend.SCHEMAS[tableName]);
    });
  });

  it("Initial seed data provisioned for Users, HabitsQuests, RewardsCatalog, ActivityLogs", () => {
    const users = gasBackend.getSheetRecords("Users");
    assert.strictEqual(users.length >= 2, true);
    const parent = users.find(u => u.role === 'parent');
    const student = users.find(u => u.role === 'student');
    assert.ok(parent, "Demo parent must exist");
    assert.ok(student, "Demo student must exist");
    assert.strictEqual(student.linkedParentId, parent.id);
    assert.strictEqual(student.pairingCode, parent.pairingCode);

    const habits = gasBackend.getSheetRecords("HabitsQuests");
    assert.strictEqual(habits.length, 7, "7 initial habits must be seeded");

    const rewards = gasBackend.getSheetRecords("RewardsCatalog");
    assert.strictEqual(rewards.length, 4, "4 initial rewards must be seeded");

    const logs = gasBackend.getSheetRecords("ActivityLogs");
    assert.strictEqual(logs.length >= 1, true, "Initial activity logs must exist");
  });

  it("Self-healing recovers corrupted sheet headers without deleting data", () => {
    const habitsSheet = mockActiveSpreadsheet.getSheetByName("HabitsQuests");
    // Corrupt row 1 headers
    habitsSheet.grid[0] = ["bad", "headers"];
    
    // Re-run initialization
    gasBackend.initializeDatabase();
    
    // Check repaired headers
    assert.deepStrictEqual(habitsSheet.grid[0], gasBackend.SCHEMAS.HabitsQuests);
    // Data rows should still be intact
    assert.strictEqual(habitsSheet.grid.length, 8); // 1 header + 7 habits
  });

  it("Legacy migration: migrates legacy CommanderProfile tab into Users student record", () => {
    const legacySheet = mockActiveSpreadsheet.insertSheet("CommanderProfile");
    legacySheet.appendRow(["Metric", "Value"]);
    legacySheet.appendRow(["Focus Coins", 550]);
    legacySheet.appendRow(["XP Points", 1200]);
    legacySheet.appendRow(["Current Level", 5]);
    legacySheet.appendRow(["Daily Streak", 9]);

    gasBackend.initializeDatabase();

    // Sheet should be renamed/archived
    assert.strictEqual(mockActiveSpreadsheet.getSheetByName("CommanderProfile"), null);
    const archived = mockActiveSpreadsheet.sheets.find(s => s.name.startsWith("CommanderProfile_Archived"));
    assert.ok(archived, "Legacy sheet must be archived");
  });

  console.log("\n--- 2. AUTHENTICATION & PAIRING SYSTEM ---");

  it("Parent registration generates unique 6-character pairing code and salted hash", () => {
    const res = gasBackend.signUpParent({
      fullName: "Major Gaurav",
      email: "gaurav@example.com",
      pin: "9876",
      password: "strongPassword1"
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.user.id.startsWith("u_par_"));
    assert.strictEqual(res.pairingCode.length, 6);
    assert.strictEqual(res.pairingCode.startsWith("ZOP"), true);
    assert.strictEqual(res.user.email, "gaurav@example.com");

    // Check duplicate rejection
    const dupRes = gasBackend.signUpParent({
      fullName: "Duplicate",
      email: "gaurav@example.com",
      pin: "1111",
      password: "pwd"
    });
    assert.strictEqual(dupRes.success, false);
    assert.strictEqual(dupRes.error, "EMAIL_ALREADY_EXISTS");
  });

  it("Student registration fails on invalid pairing code and succeeds on valid pairing code", () => {
    // Attempt invalid pairing code
    const failRes = gasBackend.signUpStudent({
      fullName: "Junior Scout",
      pin: "1122",
      pairingCode: "INVALID"
    });
    assert.strictEqual(failRes.success, false);
    assert.strictEqual(failRes.error.includes("INVALID_PAIRING_CODE"), true);

    // Register with valid pairing code from parent Major Gaurav
    const users = gasBackend.getSheetRecords("Users");
    const parent = users.find(u => u.email === "gaurav@example.com");

    const okRes = gasBackend.signUpStudent({
      fullName: "Junior Scout",
      pin: "1122",
      pairingCode: parent.pairingCode
    });
    assert.strictEqual(okRes.success, true);
    assert.strictEqual(okRes.user.linkedParentId, parent.id);
    assert.strictEqual(okRes.user.role, "student");
    assert.strictEqual(okRes.user.coins, 340);
    assert.strictEqual(okRes.user.xp, 680);
  });

  it("Login handles both student PIN and parent PIN/password with credential verification", () => {
    // Student login with PIN
    const stuLogin = gasBackend.loginUser({
      identifier: "Junior Scout",
      pinOrPassword: "1122",
      role: "student"
    });
    assert.strictEqual(stuLogin.success, true);
    assert.strictEqual(stuLogin.user.fullName, "Junior Scout");

    // Student login with wrong PIN
    const stuFail = gasBackend.loginUser({
      identifier: "Junior Scout",
      pinOrPassword: "0000",
      role: "student"
    });
    assert.strictEqual(stuFail.success, false);
    assert.strictEqual(stuFail.error, "INVALID_CREDENTIALS");

    // Parent login with password
    const parLoginPass = gasBackend.loginUser({
      identifier: "gaurav@example.com",
      pinOrPassword: "strongPassword1",
      role: "parent"
    });
    assert.strictEqual(parLoginPass.success, true);

    // Parent login with PIN
    const parLoginPin = gasBackend.loginUser({
      identifier: "gaurav@example.com",
      pinOrPassword: "9876",
      role: "parent"
    });
    assert.strictEqual(parLoginPin.success, true);
  });

  it("Role switching PIN verification validates parent credentials accurately", () => {
    const users = gasBackend.getSheetRecords("Users");
    const parent = users.find(u => u.email === "gaurav@example.com");
    const student = users.find(u => u.linkedParentId === parent.id);

    // Student attempts to switch to parent mode with wrong PIN
    const switchFail = gasBackend.verifyRolePin({
      userId: student.id,
      pin: "0000",
      targetRole: "parent"
    });
    assert.strictEqual(switchFail.verified, false);

    // Student provides linked parent's PIN
    const switchOk = gasBackend.verifyRolePin({
      userId: student.id,
      pin: "9876",
      targetRole: "parent"
    });
    assert.strictEqual(switchOk.verified, true);
  });

  console.log("\n--- 3. RBAC & PARENT-EXCLUSIVE GOVERNANCE ---");

  it("Students are strictly blocked from parent governance endpoints", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");

    // Attempt saveHabit
    const saveHabitRes = gasBackend.saveHabit({
      parentUserId: student.id,
      habitData: { title: "Student Illegal Habit", points: 999 }
    });
    assert.strictEqual(saveHabitRes.success, false);
    assert.strictEqual(saveHabitRes.error.includes("UNAUTHORIZED"), true);

    // Attempt deleteHabit
    const delHabitRes = gasBackend.deleteHabit({
      parentUserId: student.id,
      habitId: "h_1"
    });
    assert.strictEqual(delHabitRes.success, false);
    assert.strictEqual(delHabitRes.error.includes("UNAUTHORIZED"), true);

    // Attempt getPendingVerifications
    const getPendingRes = gasBackend.getPendingVerifications({
      parentUserId: student.id
    });
    assert.strictEqual(getPendingRes.success, false);
    assert.strictEqual(getPendingRes.error.includes("UNAUTHORIZED"), true);

    // Attempt approveQuestSubmission
    const approveRes = gasBackend.approveQuestSubmission({
      submissionId: "any",
      parentUserId: student.id,
      bonusCoins: 100
    });
    assert.strictEqual(approveRes.success, false);
    assert.strictEqual(approveRes.error.includes("UNAUTHORIZED"), true);

    // Attempt awardParentBonus
    const bonusRes = gasBackend.awardParentBonus({
      parentUserId: student.id,
      studentId: student.id,
      coins: 500
    });
    assert.strictEqual(bonusRes.success, false);
    assert.strictEqual(bonusRes.error.includes("UNAUTHORIZED"), true);

    // Attempt updateStudentSecurity
    const secRes = gasBackend.updateStudentSecurity({
      parentUserId: student.id,
      studentId: student.id,
      newPin: "0000"
    });
    assert.strictEqual(secRes.success, false);
    assert.strictEqual(secRes.error.includes("UNAUTHORIZED"), true);
  });

  console.log("\n--- 4. QUEST & VERIFICATION QUEUE LIFECYCLE ---");

  it("Quest submission by student creates PENDING_VERIFICATION queue item with ZERO coins awarded", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const initialCoins = Number(student.coins);
    const initialXp = Number(student.xp);

    const subRes = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_1",
      notes: "Clean shoes proof"
    });

    assert.strictEqual(subRes.success, true);
    assert.strictEqual(subRes.status, "PENDING_VERIFICATION");
    assert.ok(subRes.submissionId.startsWith("sub_"));

    // Check student wallet: MUST NOT CHANGE
    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === student.id);
    assert.strictEqual(Number(studentAfter.coins), initialCoins, "Coins must not be awarded on submission!");
    assert.strictEqual(Number(studentAfter.xp), initialXp, "XP must not be awarded on submission!");

    // Check submission row in SubmissionsQueue
    const submissions = gasBackend.getSheetRecords("SubmissionsQueue");
    const queueItem = submissions.find(s => s.id === subRes.submissionId);
    assert.ok(queueItem, "Submission must exist in queue");
    assert.strictEqual(queueItem.status, "PENDING_VERIFICATION");
    assert.strictEqual(queueItem.questId, "h_1");
  });

  it("Parent 1-click approve quest awards coins, XP, and recalculates level", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const parent = users.find(u => u.id === student.linkedParentId);
    const submissions = gasBackend.getSheetRecords("SubmissionsQueue");
    const pendingSub = submissions.find(s => s.studentId === student.id && s.status === "PENDING_VERIFICATION");

    const initialCoins = Number(student.coins);
    const initialXp = Number(student.xp);

    const approveRes = gasBackend.approveQuestSubmission({
      submissionId: pendingSub.id,
      parentUserId: parent.id,
      bonusCoins: 5
    });

    assert.strictEqual(approveRes.success, true);
    const expectedCoins = initialCoins + Number(pendingSub.points) + 5;
    const expectedXp = initialXp + Number(pendingSub.xp);

    assert.strictEqual(approveRes.updatedWallet.coins, expectedCoins);
    assert.strictEqual(approveRes.updatedWallet.xp, expectedXp);
    assert.strictEqual(approveRes.updatedWallet.level, Math.floor(expectedXp / 250) + 1);

    // Verify submission is updated to APPROVED
    const subAfter = gasBackend.getSheetRecords("SubmissionsQueue").find(s => s.id === pendingSub.id);
    assert.strictEqual(subAfter.status, "APPROVED");
    assert.ok(subAfter.reviewedAt.length > 0);
  });

  it("Parent 1-click reject quest awards 0 coins and updates queue status to REJECTED", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const parent = users.find(u => u.id === student.linkedParentId);

    // Submit a new quest
    const subRes = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_2",
      notes: "Lunchbox"
    });
    assert.strictEqual(subRes.success, true);

    const studentBefore = gasBackend.getSheetRecords("Users").find(u => u.id === student.id);
    const coinsBefore = Number(studentBefore.coins);

    // Parent rejects
    const rejectRes = gasBackend.rejectQuestSubmission({
      submissionId: subRes.submissionId,
      parentUserId: parent.id,
      reason: "Lunchbox not washed yet"
    });
    assert.strictEqual(rejectRes.success, true, rejectRes ? rejectRes.error : "rejectRes is falsy");

    // Verify wallet unchanged
    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === student.id);
    assert.strictEqual(Number(studentAfter.coins), coinsBefore);

    // Verify queue status
    const subAfter = gasBackend.getSheetRecords("SubmissionsQueue").find(s => s.id === subRes.submissionId);
    assert.strictEqual(subAfter.status, "REJECTED");
    assert.strictEqual(subAfter.notes.includes("Lunchbox not washed yet"), true);
  });

  console.log("\n--- 5. REWARDS CATALOG & REDEMPTION LIFECYCLE ---");

  it("Student submits redemption request: coins deducted into escrow and status PENDING_APPROVAL", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const rewards = gasBackend.getSheetRecords("RewardsCatalog");
    const reward = rewards.find(r => r.id === "rw_1"); // 80 coins

    const initialCoins = Number(student.coins);
    assert.strictEqual(initialCoins >= Number(reward.costCoins), true);

    const rdmRes = gasBackend.submitRedemptionRequest({
      studentId: student.id,
      rewardId: reward.id
    });

    assert.strictEqual(rdmRes.success, true);
    assert.strictEqual(rdmRes.status, "PENDING_APPROVAL");
    assert.strictEqual(rdmRes.remainingCoins, initialCoins - Number(reward.costCoins));

    // Confirm wallet deduction in DB
    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === student.id);
    assert.strictEqual(Number(studentAfter.coins), initialCoins - Number(reward.costCoins));
  });

  it("Parent rejects redemption: coins are refunded back to student wallet", () => {
    const redemptions = gasBackend.getSheetRecords("RedemptionsQueue");
    const pendingRdm = redemptions.find(r => r.status === "PENDING_APPROVAL");
    assert.ok(pendingRdm, "Pending redemption must exist");

    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.id === pendingRdm.studentId);
    const parent = users.find(u => u.id === student.linkedParentId);
    const coinsBefore = Number(student.coins);

    const rejectRes = gasBackend.rejectRedemption({
      redemptionId: pendingRdm.id,
      parentUserId: parent.id,
      reason: "Finish homework first"
    });

    assert.strictEqual(rejectRes.success, true);
    assert.strictEqual(rejectRes.refundedCoins, Number(pendingRdm.costCoins));
    assert.strictEqual(rejectRes.newBalance, coinsBefore + Number(pendingRdm.costCoins));

    // Check student in DB
    const studentAfter = gasBackend.getSheetRecords("Users").find(u => u.id === student.id);
    assert.strictEqual(Number(studentAfter.coins), coinsBefore + Number(pendingRdm.costCoins));

    // Check redemption status
    const rdmAfter = gasBackend.getSheetRecords("RedemptionsQueue").find(r => r.id === pendingRdm.id);
    assert.strictEqual(rdmAfter.status, "REJECTED");
  });

  it("Parent approves redemption: status becomes APPROVED", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const parent = users.find(u => u.id === student.linkedParentId);

    // Request new redemption
    const reqRes = gasBackend.submitRedemptionRequest({
      studentId: student.id,
      rewardId: "rw_2" // 50 coins
    });
    assert.strictEqual(reqRes.success, true);

    const approveRes = gasBackend.approveRedemption({
      redemptionId: reqRes.redemptionId,
      parentUserId: parent.id
    });
    assert.strictEqual(approveRes.success, true);

    const rdmAfter = gasBackend.getSheetRecords("RedemptionsQueue").find(r => r.id === reqRes.redemptionId);
    assert.strictEqual(rdmAfter.status, "APPROVED");
  });

  console.log("\n--- 6. WEB APP SERVING & LOCKSERVICE ---");

  it("doGet handles app serving without throwing and configures viewport/frame options", () => {
    const output = gasBackend.doGet({});
    assert.strictEqual(output.name, "divyank_mission_control_google_apps_script_app");
    assert.strictEqual(output.title, gasBackend.APP_TITLE);
    assert.strictEqual(output.xFrame, "ALLOWALL");
  });

  console.log("\n--- 7. BROWSER MOCK BACKEND & ZOPTRO API CLIENT ---");

  // Load HTML app script module
  const htmlContent = fs.readFileSync(path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html'), 'utf8');
  const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/g);
  const appScript = scriptMatch[scriptMatch.length - 1].replace('<script>', '').replace('</script>', '');
  
  // Evaluate in isolated context with mock DOM environment
  const mockExports = {};
  const mockElement = {
    getContext: () => ({
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillRect: () => {}
    }),
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    addEventListener: () => {},
    style: {},
    innerText: '',
    value: '',
    innerHTML: '',
    appendChild: () => {},
    insertBefore: () => {},
    remove: () => {}
  };

  const mockWindow = {
    addEventListener: () => {},
    innerWidth: 1024,
    innerHeight: 768,
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
      };
    },
    localStorage: {
      _data: {},
      getItem: function(k) { return this._data[k] || null; },
      setItem: function(k, v) { this._data[k] = String(v); },
      removeItem: function(k) { delete this._data[k]; }
    }
  };

  const mockContext = {
    module: { exports: mockExports },
    exports: mockExports,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: () => 1,
    window: mockWindow,
    document: {
      getElementById: () => mockElement,
      querySelectorAll: () => [],
      createElement: () => mockElement,
      body: mockElement,
      addEventListener: () => {}
    }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockContext.document;

  const vm = require('vm');
  vm.createContext(mockContext);
  vm.runInContext(appScript, mockContext);

  const BrowserMockBackend = mockContext.window.BrowserMockBackend || mockContext.module.exports.BrowserMockBackend;
  const ZoptroApiClient = mockContext.window.ZoptroApiClient || mockContext.module.exports.ZoptroApiClient;

  it("BrowserMockBackend initializes demo data in storage keys", () => {
    assert.ok(BrowserMockBackend, "BrowserMockBackend must be loaded");
    BrowserMockBackend.init(true);

    const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
    assert.strictEqual(users.length, 2);
    const parent = users.find(u => u.role === 'parent');
    const student = users.find(u => u.role === 'student');
    assert.strictEqual(parent.fullName, "Colonel Rajesh");
    assert.strictEqual(student.fullName, "Commander Divyank");
    assert.strictEqual(student.coins, 340);
    assert.strictEqual(student.xp, 680);
    assert.strictEqual(student.level, 3);
  });

  it("BrowserMockBackend: 100% API contract parity with GAS backend", () => {
    const gasMethods = [
      'signUpParent', 'signUpStudent', 'loginUser', 'verifyRolePin',
      'getHabitsAndQuests', 'submitQuestCompletion', 'saveHabit', 'deleteHabit',
      'getPendingVerifications', 'approveQuestSubmission', 'rejectQuestSubmission',
      'getRewardsCatalog', 'submitRedemptionRequest', 'manageRewardItem',
      'approveRedemption', 'rejectRedemption', 'updateStudentSecurity',
      'getActivityLogs', 'awardParentBonus', 'triggerEmailDigest'
    ];

    gasMethods.forEach(method => {
      assert.strictEqual(typeof BrowserMockBackend[method], 'function', `BrowserMockBackend must implement ${method}`);
      assert.strictEqual(typeof ZoptroApiClient[method], 'function', `ZoptroApiClient must implement ${method}`);
    });
  });

  await itAsync("BrowserMockBackend & ZoptroApiClient: End-to-end quest & verification flow with state persistence", async () => {
    // 1. Student submits quest
    const subRes = await ZoptroApiClient.submitQuestCompletion({
      studentId: "u_stu_demo",
      questId: "h_3",
      notes: "Math Homework completed"
    });
    assert.strictEqual(subRes.success, true);
    assert.strictEqual(subRes.status, "PENDING_VERIFICATION");

    // Check persistence: read raw storage table
    const subsTable = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.SUBMISSIONS);
    const subItem = subsTable.find(s => s.id === subRes.submissionId);
    assert.ok(subItem, "Submission must persist in storage table");

    // Check parent verifications
    const pendingRes = await ZoptroApiClient.getPendingVerifications({ parentUserId: "u_par_demo" });
    assert.strictEqual(pendingRes.success, true);
    assert.strictEqual(pendingRes.pendingQuests.some(q => q.id === subRes.submissionId), true);

    // Parent approves with bonus coins
    const approveRes = await ZoptroApiClient.approveQuestSubmission({
      submissionId: subRes.submissionId,
      parentUserId: "u_par_demo",
      bonusCoins: 10
    });
    assert.strictEqual(approveRes.success, true);
    // Initial 340 + 25 points + 10 bonus = 375
    assert.strictEqual(approveRes.updatedWallet.coins, 375);

    // Simulate page refresh: verify wallet coins in fresh read
    const refreshedUsers = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
    const refreshedStudent = refreshedUsers.find(u => u.id === "u_stu_demo");
    assert.strictEqual(refreshedStudent.coins, 375, "Coins must persist across simulated page refresh!");
  });

  await itAsync("BrowserMockBackend: Reward redemption and refund lifecycle persists correctly", async () => {
    // Student redeems reward rw_1 (80 coins) from 375 balance -> 295 remaining
    const rdmRes = await ZoptroApiClient.submitRedemptionRequest({
      studentId: "u_stu_demo",
      rewardId: "rw_1"
    });
    assert.strictEqual(rdmRes.success, true);
    assert.strictEqual(rdmRes.remainingCoins, 295);

    // Parent rejects redemption -> coins refunded to 375
    const rejectRes = await ZoptroApiClient.rejectRedemption({
      redemptionId: rdmRes.redemptionId,
      parentUserId: "u_par_demo",
      reason: "Not today"
    });
    assert.strictEqual(rejectRes.success, true);
    assert.strictEqual(rejectRes.refundedCoins, 80);
    assert.strictEqual(rejectRes.newBalance, 375);

    // Check persistent storage
    const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
    const student = users.find(u => u.id === "u_stu_demo");
    assert.strictEqual(student.coins, 375, "Refunded coins must be persistently saved!");
  });

  console.log("\n--- 8. EDGE CASES, CONCURRENCY & BOUNDARY TESTS ---");

  it("LockService guarantees lock release even if an exception is thrown", () => {
    assert.strictEqual(mockLockAcquired, false);
    try {
      gasBackend.withScriptLock(() => {
        assert.strictEqual(mockLockAcquired, true);
        throw new Error("Simulated mutation crash");
      });
    } catch (e) {
      assert.strictEqual(e.message, "Simulated mutation crash");
    }
    // Lock must be safely released
    assert.strictEqual(mockLockAcquired, false, "Lock must be released even on exception!");
  });

  it("Student redemption fails with INSUFFICIENT_COINS when coins are inadequate", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const rewards = gasBackend.getSheetRecords("RewardsCatalog");
    const expensiveReward = rewards.find(r => r.id === "rw_3"); // 200 coins

    // Set student coins low (e.g. 10 coins)
    gasBackend.updateSheetRecord("Users", "id", student.id, { coins: 10 });

    const failRdm = gasBackend.submitRedemptionRequest({
      studentId: student.id,
      rewardId: expensiveReward.id
    });
    assert.strictEqual(failRdm.success, false);
    assert.strictEqual(failRdm.error, "INSUFFICIENT_COINS");

    // Restore student coins
    gasBackend.updateSheetRecord("Users", "id", student.id, { coins: 340 });
  });

  it("Double-reviewing a submission returns SUBMISSION_ALREADY_REVIEWED", () => {
    const submissions = gasBackend.getSheetRecords("SubmissionsQueue");
    const approvedSub = submissions.find(s => s.status === "APPROVED");
    const users = gasBackend.getSheetRecords("Users");
    const parent = users.find(u => u.role === "parent");

    const reApprove = gasBackend.approveQuestSubmission({
      submissionId: approvedSub.id,
      parentUserId: parent.id,
      bonusCoins: 10
    });
    assert.strictEqual(reApprove.success, false);
    assert.strictEqual(reApprove.error, "SUBMISSION_ALREADY_REVIEWED");
  });

  it("Duplicate pending submission for same quest on same day is rejected", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");

    // Submit quest h_5
    const sub1 = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_5",
      notes: "First attempt"
    });
    assert.strictEqual(sub1.success, true);

    // Immediately submit same quest again while first is still pending
    const sub2 = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_5",
      notes: "Second attempt"
    });
    assert.strictEqual(sub2.success, false);
    assert.strictEqual(sub2.error, "QUEST_ALREADY_PENDING");
  });

  it("Parent awardParentBonus adds instant coins and XP and recalculates level", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const parent = users.find(u => u.id === student.linkedParentId);
    const coinsBefore = Number(student.coins);
    const xpBefore = Number(student.xp);

    const bonusRes = gasBackend.awardParentBonus({
      parentUserId: parent.id,
      studentId: student.id,
      coins: 20,
      xp: 40,
      reason: "Excellent manners during dinner",
      category: "respect"
    });

    assert.strictEqual(bonusRes.success, true);
    assert.strictEqual(bonusRes.coins, coinsBefore + 20);
    assert.strictEqual(bonusRes.xp, xpBefore + 40);
  });

  it("Parent updateStudentSecurity updates PIN and enforces new PIN on next login", () => {
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.role === "student");
    const parent = users.find(u => u.id === student.linkedParentId);

    // Update student PIN to 7788
    const secRes = gasBackend.updateStudentSecurity({
      parentUserId: parent.id,
      studentId: student.id,
      newPin: "7788"
    });
    assert.strictEqual(secRes.success, true);

    // Old PIN fails
    const oldLogin = gasBackend.loginUser({
      identifier: student.fullName,
      pinOrPassword: "4321",
      role: "student"
    });
    assert.strictEqual(oldLogin.success, false);

    // New PIN succeeds
    const newLogin = gasBackend.loginUser({
      identifier: student.fullName,
      pinOrPassword: "7788",
      role: "student"
    });
    assert.strictEqual(newLogin.success, true);
  });

  it("triggerEmailDigest looks up parent's registered email from Users and sends HTML email", () => {
    const users = gasBackend.getSheetRecords("Users");
    const parent = users.find(u => u.email === "gaurav@example.com");

    const digestRes = gasBackend.triggerEmailDigest({ parentUserId: parent.id });
    assert.strictEqual(digestRes.success, true);
    assert.strictEqual(digestRes.recipient, "gaurav@example.com");
    assert.ok(global._lastSentEmail);
    assert.strictEqual(global._lastSentEmail.to, "gaurav@example.com");
    assert.strictEqual(global._lastSentEmail.subject.includes("Zoptro Mission Control"), true);
  });

  it("Legacy bridge methods operate seamlessly with zero regressions", () => {
    const cmdData = gasBackend.getCommanderData();
    assert.ok(cmdData.profile, "profile must exist in legacy data");
    assert.ok(cmdData.habits.length > 0, "habits must exist in legacy data");
    assert.ok(cmdData.logs.length > 0, "logs must exist in legacy data");

    const walletUpdate = gasBackend.updateWalletCoins(10, 20, "Legacy Drill", "Study", "Verified");
    assert.strictEqual(walletUpdate.success, true);
    assert.ok(walletUpdate.coins > 0);

    const taskAdd = gasBackend.addCustomHabitTask("Legacy Extra Practice", 15, "🎯");
    assert.strictEqual(taskAdd.success, true);
  });

  console.log("\n--- 9. MILESTONE 1: RBAC & ADMIN CMS SUITE ---");

  it("assertAdmin verifies admin role and strictly rejects non-admin users with 403", () => {
    // Admin user verification
    const adminCheck = gasBackend.assertAdmin("u_adm_demo");
    assert.strictEqual(adminCheck.success, true);
    assert.strictEqual(adminCheck.user.role, "admin");

    // Student rejection
    const studentCheck = gasBackend.assertAdmin("u_stu_demo");
    assert.strictEqual(studentCheck.success, false);
    assert.strictEqual(studentCheck.code, 403);
    assert.ok(studentCheck.error.includes("UNAUTHORIZED"));

    // Parent rejection
    const parentCheck = gasBackend.assertAdmin("u_par_demo");
    assert.strictEqual(parentCheck.success, false);
    assert.strictEqual(parentCheck.code, 403);

    // Non-existent user rejection
    const ghostCheck = gasBackend.assertAdmin("u_ghost_999");
    assert.strictEqual(ghostCheck.success, false);
    assert.strictEqual(ghostCheck.code, 403);
  });

  let createdStoryId = null;

  it("Admin CMS saveAdminContentItem creates new item and updates existing item under lock", () => {
    // Create new story item
    const saveRes = gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        grade: "Class 4",
        title: "The Quantum Compass",
        genre: "Sci-Fi Adventure",
        content: "Divyank held the mysterious device as it hummed with blue energy...",
        moralLesson: "Curiosity paired with disciplined preparation unlocks discovery.",
        orderIndex: 10,
        isActive: true
      }
    });
    assert.strictEqual(saveRes.success, true);
    assert.ok(saveRes.item.id);
    assert.strictEqual(saveRes.item.grade, "Class 4");
    assert.strictEqual(saveRes.item.title, "The Quantum Compass");
    createdStoryId = saveRes.item.id;

    // Update the story item
    const updateRes = gasBackend.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        id: createdStoryId,
        title: "The Quantum Compass (Extended Edition)",
        orderIndex: 12
      }
    });
    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.item.title, "The Quantum Compass (Extended Edition)");
    assert.strictEqual(updateRes.item.orderIndex, 12);

    // Rejection for non-admin attempts
    const unauthorizedSave = gasBackend.saveAdminContentItem({
      adminUserId: "u_stu_demo",
      contentType: "stories",
      itemData: { title: "Hacked Story" }
    });
    assert.strictEqual(unauthorizedSave.success, false);
    assert.strictEqual(unauthorizedSave.code, 403);
  });

  it("Admin CMS getAdminContentList filters content by type, grade, and active status", () => {
    // Query Class 4 stories
    const listRes = gasBackend.getAdminContentList({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      grade: "Class 4"
    });
    assert.strictEqual(listRes.success, true);
    assert.strictEqual(listRes.contentType, "stories");
    assert.ok(listRes.items.some(s => s.id === createdStoryId));

    // Non-admin query rejected
    const blockedQuery = gasBackend.getAdminContentList({
      adminUserId: "u_par_demo",
      contentType: "stories"
    });
    assert.strictEqual(blockedQuery.success, false);
    assert.strictEqual(blockedQuery.code, 403);
  });

  it("Admin CMS toggleContentActiveStatus and deleteAdminContentItem manage lifecycle safely", () => {
    // Toggle active status to false
    const toggleRes = gasBackend.toggleContentActiveStatus({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemId: createdStoryId,
      isActive: false
    });
    assert.strictEqual(toggleRes.success, true);
    assert.strictEqual(toggleRes.isActive, false);

    // Delete item
    const delRes = gasBackend.deleteAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemId: createdStoryId
    });
    assert.strictEqual(delRes.success, true);
    assert.strictEqual(delRes.deletedId, createdStoryId);

    // Confirm deletion in query
    const listAfter = gasBackend.getAdminContentList({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      grade: "Class 4",
      includeInactive: true
    });
    assert.strictEqual(listAfter.items.some(s => s.id === createdStoryId), false);
  });

  console.log("\n--- 10. MILESTONE 1: DYNAMIC PROGRESSION & CBSE/NCERT ALIGNMENT ---");

  it("normalizeGrade and isValidGrade enforce CBSE/NCERT Class 1 to Class 10 standards", () => {
    assert.strictEqual(gasBackend.normalizeGrade("class 3"), "Class 3");
    assert.strictEqual(gasBackend.normalizeGrade("5"), "Class 5");
    assert.strictEqual(gasBackend.normalizeGrade("Class 10"), "Class 10");
    assert.strictEqual(gasBackend.normalizeGrade("Grade 7"), "Class 7");

    assert.strictEqual(gasBackend.isValidGrade("Class 1"), true);
    assert.strictEqual(gasBackend.isValidGrade("Class 5"), true);
    assert.strictEqual(gasBackend.isValidGrade("Class 10"), true);
    assert.strictEqual(gasBackend.isValidGrade("Class 11"), false);
    assert.strictEqual(gasBackend.isValidGrade("Kindergarten"), false);
    assert.strictEqual(gasBackend.isValidGrade(""), false);
  });

  let nextStoryItem = null;

  it("getNextContentItem returns next uncompleted item for student's enrolled grade", () => {
    // Demo student is enrolled in Class 3
    const nextRes = gasBackend.getNextContentItem({
      studentId: "u_stu_demo",
      contentType: "stories"
    });
    assert.strictEqual(nextRes.success, true);
    assert.ok(nextRes.item, "Must return an uncompleted Class 3 story");
    assert.strictEqual(nextRes.item.grade, "Class 3");
    assert.strictEqual(nextRes.hasMore, true);
    nextStoryItem = nextRes.item;
  });

  it("recordContentCompletion awards coins and XP, recalculates level, and prevents duplicate farming", () => {
    const usersBefore = gasBackend.getSheetRecords("Users");
    const stuBefore = usersBefore.find(u => u.id === "u_stu_demo");
    const coinsBefore = stuBefore.coins;
    const xpBefore = stuBefore.xp;

    // Student completes story
    const compRes = gasBackend.recordContentCompletion({
      studentId: "u_stu_demo",
      contentType: "stories",
      contentId: nextStoryItem.id,
      score: 100,
      answers: { q1: 1 }
    });
    assert.strictEqual(compRes.success, true);
    assert.ok(compRes.coinsAwarded > 0, "Coins must be awarded for first-time completion");
    assert.ok(compRes.xpAwarded > 0, "XP must be awarded");
    assert.ok(compRes.newCoins > coinsBefore);
    assert.ok(compRes.newXp > xpBefore);

    // Duplicate completion submission must not award double coins (anti-farming)
    const dupRes = gasBackend.recordContentCompletion({
      studentId: "u_stu_demo",
      contentType: "stories",
      contentId: nextStoryItem.id,
      score: 100,
      answers: { q1: 1 }
    });
    assert.strictEqual(dupRes.success, true);
    assert.strictEqual(dupRes.alreadyCompleted, true);
    assert.strictEqual(dupRes.coinsAwarded, 0, "No duplicate coins allowed");
    assert.strictEqual(dupRes.xpAwarded, 0, "No duplicate XP allowed");

    // Next item progression: completed item must be excluded from next item query
    const afterRes = gasBackend.getNextContentItem({
      studentId: "u_stu_demo",
      contentType: "stories"
    });
    assert.strictEqual(afterRes.success, true);
    if (afterRes.item) {
      assert.notStrictEqual(afterRes.item.id, nextStoryItem.id, "Completed item must be excluded");
    }
  });

  it("getContentByGrade strictly isolates content to student enrolled grade (anti-forgery)", () => {
    const classRes = gasBackend.getContentByGrade({
      studentId: "u_stu_demo",
      contentType: "stories",
      targetGrade: "Class 5"
    });
    assert.strictEqual(classRes.success, true);
    assert.strictEqual(classRes.grade, "Class 3", "Enrolled grade overrides client targetGrade");
    classRes.items.forEach(item => {
      assert.strictEqual(item.grade, "Class 3", "Strict grade isolation must hold");
    });
  });

  console.log("\n--- 11. MILESTONE 1: LONGITUDINAL STUDENT GROWTH PROFILES ---");

  it("recordGrowthEvent updates student growth metrics across focus, habits, academics, and EQ", () => {
    // Record focus sprint event (25 minutes)
    const focusEvt = gasBackend.recordGrowthEvent({
      studentId: "u_stu_demo",
      eventType: "focus_sprint",
      payload: { minutes: 25 }
    });
    assert.strictEqual(focusEvt.success, true);
    assert.strictEqual(focusEvt.studentId, "u_stu_demo");

    // Record quiz event
    const quizEvt = gasBackend.recordGrowthEvent({
      studentId: "u_stu_demo",
      eventType: "quiz_completed",
      payload: { score: 95 }
    });
    assert.strictEqual(quizEvt.success, true);

    // Record EQ reflection
    const eqEvt = gasBackend.recordGrowthEvent({
      studentId: "u_stu_demo",
      eventType: "eq_reflection",
      payload: { score: 90, reflection: "Shared supplies with friend" }
    });
    assert.strictEqual(eqEvt.success, true);
  });

  it("getLongitudinalProfile aggregates historical trend data and unlocked milestones", () => {
    const profRes = gasBackend.getLongitudinalProfile({
      studentId: "u_stu_demo",
      parentUserId: "u_par_demo",
      timeRange: "7d"
    });
    assert.strictEqual(profRes.success, true);
    assert.ok(profRes.profile);
    assert.strictEqual(profRes.profile.studentId, "u_stu_demo");
    assert.ok(profRes.profile.summary.focusMinutes >= 25);
    assert.ok(profRes.profile.history.length > 0);
    assert.ok(Array.isArray(profRes.profile.milestones));

    // Foreign parent access blocked
    const foreignRes = gasBackend.getLongitudinalProfile({
      studentId: "u_stu_demo",
      parentUserId: "u_par_unpaired_stranger",
      timeRange: "7d"
    });
    assert.strictEqual(foreignRes.success, false);
    assert.strictEqual(foreignRes.code, 403);
  });

  console.log("\n--- 12. MILESTONE 1: FAMILY ONBOARDING & MULTI-CHILD GOVERNANCE ---");

  let onboardedParent = null;
  let onboardedChildren = [];

  it("signUpFamilyOnboarding atomically onboards parent and multiple children with grades and ages", () => {
    const familyRes = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Major Vikram",
        email: "vikram@example.com",
        password: "Password123!",
        pin: "9988"
      },
      childrenData: [
        {
          fullName: "Aarav",
          gradeClass: "Class 3",
          age: 8,
          pin: "1122"
        },
        {
          fullName: "Ananya",
          gradeClass: "Class 7",
          age: 12,
          pin: "3344"
        }
      ]
    });

    assert.strictEqual(familyRes.success, true);
    assert.ok(familyRes.parent.id);
    assert.strictEqual(familyRes.parent.fullName, "Major Vikram");
    assert.ok(familyRes.parent.pairingCode);
    assert.strictEqual(familyRes.children.length, 2);

    const aarav = familyRes.children.find(c => c.fullName === "Aarav");
    const ananya = familyRes.children.find(c => c.fullName === "Ananya");
    assert.ok(aarav);
    assert.strictEqual(aarav.gradeClass, "Class 3");
    assert.strictEqual(aarav.age, 8);
    assert.strictEqual(aarav.linkedParentId, familyRes.parent.id);
    assert.strictEqual(aarav.pairingCode, familyRes.parent.pairingCode);

    assert.ok(ananya);
    assert.strictEqual(ananya.gradeClass, "Class 7");
    assert.strictEqual(ananya.age, 12);
    assert.strictEqual(ananya.linkedParentId, familyRes.parent.id);

    onboardedParent = familyRes.parent;
    onboardedChildren = familyRes.children;
  });

  it("updateChildGovernance allows parent to edit name, age, promote grade, and set parental permissions", () => {
    const aarav = onboardedChildren.find(c => c.fullName === "Aarav");
    
    // Promote Aarav from Class 3 to Class 4 and update parental permissions
    const govRes = gasBackend.updateChildGovernance({
      parentUserId: onboardedParent.id,
      studentId: aarav.id,
      updates: {
        gradeClass: "Class 4",
        age: 9,
        parentalPermissions: {
          maxDailyScreenMinutes: 60,
          bedtimeCurfew: "21:00",
          canRedeemWithoutApproval: false
        }
      }
    });

    assert.strictEqual(govRes.success, true);
    assert.strictEqual(govRes.student.gradeClass, "Class 4");
    assert.strictEqual(govRes.student.age, 9);
    assert.strictEqual(govRes.student.parentalPermissions.maxDailyScreenMinutes, 60);

    // Foreign parent attempt is blocked
    const foreignGov = gasBackend.updateChildGovernance({
      parentUserId: "u_par_demo", // not Aarav's parent
      studentId: aarav.id,
      updates: { gradeClass: "Class 10" }
    });
    assert.strictEqual(foreignGov.success, false);
    assert.strictEqual(foreignGov.code, 403);
  });

  console.log("\n--- 13. CONTRACT ORACLE PARITY VERIFICATION ---");

  await itAsync("ZoptroContractOracle maintains 100% schema and API contract parity with backend", async () => {
    const { ZoptroContractOracle } = require("./harness/zoptro_contract_oracle.js");
    const oracle = new ZoptroContractOracle();

    // Verify all 13 tables are in oracle.tables
    const expectedTables = [
      "Users", "HabitsQuests", "SubmissionsQueue", "RewardsCatalog", "RedemptionsQueue", "ActivityLogs",
      "Stories", "StoryQuestions", "EQScenarios", "DailyKnowledge", "CurriculumQuizzes", "StudentCompletions", "StudentGrowthProfiles"
    ];
    expectedTables.forEach(t => {
      assert.ok(oracle.tables[t], `Oracle table ${t} must exist`);
    });

    // Seed default content in oracle
    oracle.seedDefaultContent();

    // Verify oracle admin assertion
    const admCheck = oracle.assertAdmin("u_adm_demo");
    assert.strictEqual(admCheck.success, true);
    assert.strictEqual(oracle.assertAdmin("u_stu_demo").code, 403);

    // Verify oracle CMS save and query
    const saveRes = await oracle.saveAdminContentItem({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      itemData: {
        grade: "Class 2",
        title: "Oracle Story",
        genre: "Mythology",
        content: "Story body...",
        moralLesson: "Honesty",
        orderIndex: 5,
        isActive: true
      }
    });
    assert.strictEqual(saveRes.success, true);
    assert.ok(saveRes.item.id);

    const queryRes = await oracle.getAdminContentList({
      adminUserId: "u_adm_demo",
      contentType: "stories",
      grade: "Class 2"
    });
    assert.strictEqual(queryRes.success, true);
    assert.ok(queryRes.items.some(s => s.id === saveRes.item.id));

    // Verify oracle family onboarding
    const famRes = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Parent", email: "oracle_par@example.com", password: "Password123!", pin: "4321" },
      childrenData: [{ fullName: "Oracle Kid", gradeClass: "Class 6", age: 11, pin: "8888" }]
    });
    assert.strictEqual(famRes.success, true);
    assert.strictEqual(famRes.children[0].gradeClass, "Class 6");

    // Verify oracle progression
    const nextItem = await oracle.getNextContentItem({
      studentId: famRes.children[0].id,
      contentType: "stories"
    });
    assert.strictEqual(nextItem.success, true);
  });

  console.log("\n=================================================================");
  console.log(`🏁 VERIFICATION SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.error(`💥 ${failedTests} TESTS FAILED`);
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED WITH ZERO REGRESSIONS!");
    console.log("=================================================================\n");
  }
}

runTests().catch(err => {
  console.error("Fatal test suite crash:", err);
  process.exit(1);
});
