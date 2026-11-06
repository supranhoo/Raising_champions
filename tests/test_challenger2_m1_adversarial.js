/**
 * =========================================================================
 * ZOPTRO - CHALLENGER 2 MILESTONE 1 ADVERSARIAL STRESS SUITE
 * =========================================================================
 * Focus Areas:
 * 1. Family Onboarding Stress & Transactional Rollback
 * 2. Cross-Family Permission Tampering
 * 3. Longitudinal Metric Invariants (Focus Sprints, Zero-Habits Div-by-Zero, Date Filters)
 * 4. Schema Self-Healing Under Corruption (Shuffled, Missing, Extra Columns)
 * 5. Oracle Contract Parity
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log("=================================================================");
console.log("🔥 STARTING CHALLENGER 2 MILESTONE 1 ADVERSARIAL STRESS SUITE");
console.log("=================================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    failureDetails.push({ name, error: err.message, stack: err.stack });
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
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
    failureDetails.push({ name, error: err.message, stack: err.stack });
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// =========================================================================
// MOCK APPS SCRIPT SPREADSHEET ENGINE
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

const mockActiveSpreadsheet = new MockSpreadsheet();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true
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

class InMemStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

async function runAdversarialProbe() {
  console.log("-----------------------------------------------------------------");
  console.log("⚡ SECTION 1: FAMILY ONBOARDING STRESS & TRANSACTIONAL ROLLBACK");
  console.log("-----------------------------------------------------------------");

  // Initialize fresh database
  gasBackend.initializeDatabase();

  it("1.1 [GAS] Duplicate email exact match rejection", () => {
    const res1 = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Vikram Sharma",
        email: "vikram.sharma@example.com",
        pin: "4321",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Aarav Sharma", age: 10, grade: "Class 5", pin: "1111" }
      ]
    });
    assert.strictEqual(res1.success, true, "First signup should succeed");

    const res2 = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Another Vikram",
        email: "vikram.sharma@example.com",
        pin: "9999",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Rohan Sharma", age: 8, grade: "Class 3", pin: "2222" }
      ]
    });
    assert.strictEqual(res2.success, false, "Second signup must fail on duplicate email");
    assert.strictEqual(res2.error.includes("EMAIL_ALREADY_EXISTS"), true, "Error must indicate EMAIL_ALREADY_EXISTS");
  });

  it("1.2 [GAS] Duplicate email case-insensitivity rejection", () => {
    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Vikram Upper",
        email: "VIKRAM.SHARMA@EXAMPLE.COM",
        pin: "5555",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Diya Sharma", age: 9, grade: "Class 4", pin: "3333" }
      ]
    });
    assert.strictEqual(res.success, false, "Uppercase email duplicate must be rejected");
    assert.strictEqual(res.error.includes("EMAIL_ALREADY_EXISTS"), true);
  });

  it("1.3 [GAS] Invalid child PIN (< 4 numeric digits)", () => {
    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Ananya Patel",
        email: "ananya.patel@example.com",
        pin: "4444",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Aryan Patel", age: 11, grade: "Class 6", pin: "123" }
      ]
    });
    assert.strictEqual(res.success, false, "Child PIN < 4 digits must fail");
    assert.strictEqual(res.error.includes("INVALID_PIN"), true);
  });

  it("1.4 [GAS] Invalid child PIN (non-digit alphabetic string)", () => {
    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Ananya Patel 2",
        email: "ananya.patel2@example.com",
        pin: "4444",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Aryan Patel", age: 11, grade: "Class 6", pin: "abcd" }
      ]
    });
    assert.strictEqual(res.success, false, "Non-numeric child PIN must fail");
    assert.strictEqual(res.error.includes("INVALID_PIN"), true);
  });

  it("1.5 [GAS] Out-of-range grade 'Class 0' rejection", () => {
    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Rohit Verma",
        email: "rohit.verma@example.com",
        pin: "1234",
        password: "Password123"
      },
      childrenData: [
        { fullName: "Kid Zero", age: 5, grade: "Class 0", pin: "1234" }
      ]
    });
    assert.strictEqual(res.success, false, "Class 0 must be rejected");
    assert.strictEqual(res.error.includes("INVALID_GRADE"), true);
  });

  it("1.6 [GAS] Out-of-range grade 'Class 11' rejection", () => {
    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Rohit Verma 2",
        email: "rohit.verma2@example.com",
        pin: "1234",
        password: "Password123"
      },
      childrenData: [
        { fullName: "Kid Eleven", age: 16, grade: "Class 11", pin: "1234" }
      ]
    });
    assert.strictEqual(res.success, false, "Class 11 must be rejected");
    assert.strictEqual(res.error.includes("INVALID_GRADE"), true);
  });

  it("1.7 [GAS] Out-of-range grade 'Grade 12' and 'Kindergarten' rejection", () => {
    const resK = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Parent K",
        email: "parent.k@example.com",
        pin: "1234",
        password: "Password123"
      },
      childrenData: [
        { fullName: "Child K", age: 4, grade: "Kindergarten", pin: "1234" }
      ]
    });
    assert.strictEqual(resK.success, false, "Kindergarten must be rejected");

    const res12 = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Parent 12",
        email: "parent.12@example.com",
        pin: "1234",
        password: "Password123"
      },
      childrenData: [
        { fullName: "Child 12", age: 17, grade: "Grade 12", pin: "1234" }
      ]
    });
    assert.strictEqual(res12.success, false, "Grade 12 must be rejected");
  });

  it("1.8 [GAS] High child count (N=10 children) succeeds and provisions all", () => {
    const tenChildren = [];
    for (let i = 1; i <= 10; i++) {
      tenChildren.push({
        fullName: `Child Number ${i}`,
        age: 5 + Math.floor(i / 2),
        grade: `Class ${i}`,
        pin: `100${i}`
      });
    }

    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Mega Family Parent",
        email: "megafamily@example.com",
        pin: "7777",
        password: "MegaPassword123"
      },
      childrenData: tenChildren
    });

    assert.strictEqual(res.success, true, "Onboarding 10 children should succeed");
    assert.strictEqual(res.children.length, 10, "Must return 10 provisioned children");
    assert.strictEqual(typeof res.pairingCode, "string", "Must generate pairingCode");

    const usersSheet = mockActiveSpreadsheet.getSheetByName("Users");
    const userRows = usersSheet.getDataRange().getValues().slice(1);
    const parentRow = userRows.find(r => r[3] === "megafamily@example.com");
    assert.ok(parentRow, "Parent row must exist in Users sheet");

    const studentRows = userRows.filter(r => r[7] === parentRow[0]);
    assert.strictEqual(studentRows.length, 10, "10 student rows must be linked to parent");

    // Verify each child has a baseline StudentGrowthProfiles row
    const sgpSheet = mockActiveSpreadsheet.getSheetByName("StudentGrowthProfiles");
    const sgpRows = sgpSheet.getDataRange().getValues().slice(1);
    studentRows.forEach(s => {
      const p = sgpRows.find(row => row[1] === s[0]);
      assert.ok(p, `Student ${s[0]} must have a baseline growth profile row`);
    });
  });

  it("1.9 [GAS] Transactional rollback / atomic pre-validation on child 10 failure (grade Class 11)", () => {
    const usersSheet = mockActiveSpreadsheet.getSheetByName("Users");
    const habitsSheet = mockActiveSpreadsheet.getSheetByName("HabitsQuests");
    const sgpSheet = mockActiveSpreadsheet.getSheetByName("StudentGrowthProfiles");

    const initialUserCount = usersSheet.getDataRange().getValues().length;
    const initialHabitsCount = habitsSheet.getDataRange().getValues().length;
    const initialSgpCount = sgpSheet.getDataRange().getValues().length;

    const nineValidPlusOneInvalid = [];
    for (let i = 1; i <= 9; i++) {
      nineValidPlusOneInvalid.push({
        fullName: `Valid Child ${i}`,
        age: 6 + Math.floor(i / 2),
        grade: `Class ${i}`,
        pin: `200${i}`
      });
    }
    // Child 10 has out-of-range grade
    nineValidPlusOneInvalid.push({
      fullName: "Invalid Child 10",
      age: 17,
      grade: "Class 11",
      pin: "2010"
    });

    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Partial Failure Parent",
        email: "partial.fail@example.com",
        pin: "8888",
        password: "SecretPassword123"
      },
      childrenData: nineValidPlusOneInvalid
    });

    assert.strictEqual(res.success, false, "Transaction must fail");
    assert.strictEqual(res.error.includes("INVALID_GRADE"), true);

    // Verify 0 rows were written (Zero-Leakage Rollback / Pre-Validation)
    const postUserCount = usersSheet.getDataRange().getValues().length;
    const postHabitsCount = habitsSheet.getDataRange().getValues().length;
    const postSgpCount = sgpSheet.getDataRange().getValues().length;

    assert.strictEqual(postUserCount, initialUserCount, "No rows must be added to Users");
    assert.strictEqual(postHabitsCount, initialHabitsCount, "No rows must be added to HabitsQuests");
    assert.strictEqual(postSgpCount, initialSgpCount, "No rows must be added to StudentGrowthProfiles");
  });

  it("1.10 [GAS] Transactional rollback on child 3 failure (invalid PIN '12')", () => {
    const usersSheet = mockActiveSpreadsheet.getSheetByName("Users");
    const initialUserCount = usersSheet.getDataRange().getValues().length;

    const res = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Pin Failure Parent",
        email: "pin.fail@example.com",
        pin: "8888",
        password: "SecretPassword123"
      },
      childrenData: [
        { fullName: "Child 1", age: 7, grade: "Class 2", pin: "1111" },
        { fullName: "Child 2", age: 9, grade: "Class 4", pin: "2222" },
        { fullName: "Child 3", age: 11, grade: "Class 6", pin: "12" } // Invalid PIN
      ]
    });

    assert.strictEqual(res.success, false, "Must fail on invalid PIN");
    assert.strictEqual(res.error.includes("INVALID_PIN"), true);

    const postUserCount = usersSheet.getDataRange().getValues().length;
    assert.strictEqual(postUserCount, initialUserCount, "Zero records written to Users");
  });

  it("1.11 [Oracle] Duplicate email rejection in Oracle", async () => {
    const oracle = new ZoptroContractOracle();
    const res1 = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Parent", email: "oracle.par@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Oracle Kid", age: 8, grade: "Class 3", pin: "1234" }]
    });
    assert.strictEqual(res1.success, true);

    const res2 = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Parent 2", email: "ORACLE.PAR@EXAMPLE.COM", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Oracle Kid 2", age: 9, grade: "Class 4", pin: "1234" }]
    });
    assert.strictEqual(res2.success, false);
    assert.strictEqual(res2.error.includes("EMAIL_ALREADY_EXISTS"), true);
  });

  it("1.12 [Oracle] Invalid grade and PIN rejection in Oracle", async () => {
    const oracle = new ZoptroContractOracle();
    const resGrade = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Parent G", email: "oracle.g@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Oracle Kid G", age: 8, grade: "Class 0", pin: "1234" }]
    });
    assert.strictEqual(resGrade.success, false);
    assert.strictEqual(resGrade.error.includes("INVALID_GRADE"), true);

    const resPin = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Parent P", email: "oracle.p@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Oracle Kid P", age: 8, grade: "Class 3", pin: "12" }]
    });
    assert.strictEqual(resPin.success, false);
    assert.strictEqual(resPin.error.includes("INVALID_PIN"), true);
  });

  it("1.13 [Oracle] N=10 children onboarding and transactional rollback in Oracle", async () => {
    const oracle = new ZoptroContractOracle();
    const initialUsersCount = oracle.tables.Users.length;

    // Fail case: 9 valid + 1 invalid (Class 11)
    const list = [];
    for (let i = 1; i <= 9; i++) {
      list.push({ fullName: `Kid ${i}`, age: 6 + i, grade: `Class ${i}`, pin: `100${i}` });
    }
    list.push({ fullName: "Kid 10", age: 16, grade: "Class 11", pin: "1010" });

    const failRes = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Fail Parent", email: "fail.par@example.com", pin: "1234", password: "Password123" },
      childrenData: list
    });
    assert.strictEqual(failRes.success, false);
    assert.strictEqual(oracle.tables.Users.length, initialUsersCount, "Rollback: Zero users added");

    // Success case: 10 valid children
    list[9].grade = "Class 10";
    const okRes = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Success Parent", email: "ok.par@example.com", pin: "1234", password: "Password123" },
      childrenData: list
    });
    assert.strictEqual(okRes.success, true);
    assert.strictEqual(okRes.children.length, 10);
    assert.strictEqual(oracle.tables.Users.length, initialUsersCount + 11);
  });

  console.log("\n-----------------------------------------------------------------");
  console.log("⚡ SECTION 2: CROSS-FAMILY PERMISSION TAMPERING");
  console.log("-----------------------------------------------------------------");

  // Create Family Alpha and Family Beta
  const familyAlphaRes = gasBackend.signUpFamilyOnboarding({
    parentData: { fullName: "Alpha Parent", email: "alpha.parent@example.com", pin: "1111", password: "PasswordAlpha123" },
    childrenData: [{ fullName: "Alpha Child", age: 8, grade: "Class 3", pin: "1111" }]
  });
  const familyBetaRes = gasBackend.signUpFamilyOnboarding({
    parentData: { fullName: "Beta Parent", email: "beta.parent@example.com", pin: "2222", password: "PasswordBeta123" },
    childrenData: [{ fullName: "Beta Child", age: 9, grade: "Class 4", pin: "2222" }]
  });

  const parentAlphaId = familyAlphaRes.parent.id;
  const childAlphaId = familyAlphaRes.children[0].id;
  const parentBetaId = familyBetaRes.parent.id;
  const childBetaId = familyBetaRes.children[0].id;

  it("2.1 [GAS] Parent Alpha cannot promote/modify Parent Beta's child grade", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: parentAlphaId,
      studentId: childBetaId,
      updates: { grade: "Class 6" }
    });
    assert.strictEqual(res.success, false, "Must reject cross-family governance mutation");
    assert.strictEqual(res.code, 403, "Must return HTTP 403");
    assert.strictEqual(res.error.includes("UNAUTHORIZED"), true);

    // Verify Child Beta grade was not modified
    const users = gasBackend.getSheetRecords("Users");
    const betaChild = users.find(u => u.id === childBetaId);
    assert.strictEqual(betaChild.gradeClass, "Class 4", "Child Beta grade must remain unchanged");
  });

  it("2.2 [GAS] Parent Alpha cannot reset PIN of Parent Beta's child", () => {
    const usersBefore = gasBackend.getSheetRecords("Users");
    const betaBefore = usersBefore.find(u => u.id === childBetaId);

    const res = gasBackend.updateChildGovernance({
      parentUserId: parentAlphaId,
      studentId: childBetaId,
      updates: { newPin: "9999" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);

    const usersAfter = gasBackend.getSheetRecords("Users");
    const betaAfter = usersAfter.find(u => u.id === childBetaId);
    assert.strictEqual(betaAfter.pinHash, betaBefore.pinHash, "PIN hash must remain unmodified");
  });

  it("2.3 [GAS] Parent Alpha cannot alter permissions of Parent Beta's child", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: parentAlphaId,
      studentId: childBetaId,
      updates: { permissions: { screenTimeLimitMins: 0, bedtimeHour: 18 } }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  it("2.4 [GAS] Parent Alpha cannot query getLongitudinalProfile for Parent Beta's child", () => {
    const res = gasBackend.getLongitudinalProfile({
      parentUserId: parentAlphaId,
      studentId: childBetaId,
      timeRange: "30d"
    });
    assert.strictEqual(res.success, false, "Must reject cross-family profile read");
    assert.strictEqual(res.code, 403, "Must return HTTP 403");
    assert.strictEqual(res.error.includes("UNAUTHORIZED"), true);
  });

  it("2.5 [GAS] Legitimate Parent Alpha CAN query profile and update governance for Child Alpha", () => {
    const govRes = gasBackend.updateChildGovernance({
      parentUserId: parentAlphaId,
      studentId: childAlphaId,
      updates: { grade: "Class 4" }
    });
    assert.strictEqual(govRes.success, true, "Legitimate parent governance update must succeed");
    assert.strictEqual(govRes.updatedChild.gradeClass, "Class 4");

    const profRes = gasBackend.getLongitudinalProfile({
      parentUserId: parentAlphaId,
      studentId: childAlphaId,
      timeRange: "30d"
    });
    assert.strictEqual(profRes.success, true, "Legitimate parent profile query must succeed");
    assert.strictEqual(profRes.studentId, childAlphaId);
  });

  it("2.6 [GAS] Student account cannot invoke updateChildGovernance (Privilege Escalation)", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: childAlphaId, // Student trying to act as parent
      studentId: childAlphaId,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(res.success, false, "Student caller must be rejected");
    assert.strictEqual(res.code, 403);
    assert.strictEqual(res.error.includes("UNAUTHORIZED"), true);
  });

  it("2.7 [GAS] Non-existent parent ID cannot invoke updateChildGovernance", () => {
    const res = gasBackend.updateChildGovernance({
      parentUserId: "u_par_nonexistent_999",
      studentId: childAlphaId,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  it("2.8 [Oracle] Cross-family updateChildGovernance & getLongitudinalProfile tampering in Oracle", async () => {
    const oracle = new ZoptroContractOracle();
    const fa = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Alpha", email: "ora.alpha@example.com", pin: "1111", password: "Password123" },
      childrenData: [{ fullName: "Ora Kid A", age: 8, grade: "Class 3", pin: "1111" }]
    });
    const fb = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Oracle Beta", email: "ora.beta@example.com", pin: "2222", password: "Password123" },
      childrenData: [{ fullName: "Ora Kid B", age: 9, grade: "Class 4", pin: "2222" }]
    });

    const pA = fa.parent.id;
    const sB = fb.children[0].id;

    // Tampering 1: updateChildGovernance
    const govRes = await oracle.updateChildGovernance({
      parentUserId: pA,
      studentId: sB,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(govRes.success, false);
    assert.strictEqual(govRes.code, 403);

    // Tampering 2: getLongitudinalProfile
    const profRes = await oracle.getLongitudinalProfile({
      parentUserId: pA,
      studentId: sB
    });
    assert.strictEqual(profRes.success, false);
    assert.strictEqual(profRes.code, 403);

    // Tampering 3: Student caller
    const stuCaller = await oracle.updateChildGovernance({
      parentUserId: sB,
      studentId: sB,
      updates: { grade: "Class 10" }
    });
    assert.strictEqual(stuCaller.success, false);
    assert.strictEqual(stuCaller.code, 403);
  });

  console.log("\n-----------------------------------------------------------------");
  console.log("⚡ SECTION 3: LONGITUDINAL METRIC INVARIANTS");
  console.log("-----------------------------------------------------------------");

  it("3.1 [GAS] Focus sprint accumulation & non-negative bounds", () => {
    // Record focus sprints on Child Alpha
    const sprint1 = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "FOCUS_SPRINT",
      payload: { minutes: 25 }
    });
    assert.strictEqual(sprint1.success, true);
    assert.strictEqual(sprint1.profile.focusMinutes, 25);

    const sprint2 = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "FOCUS_COMPLETED",
      payload: { durationMins: 15 }
    });
    assert.strictEqual(sprint2.success, true);
    assert.strictEqual(sprint2.profile.focusMinutes, 40, "25 + 15 = 40 minutes");

    const sprint3 = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "FOCUS_SPRINT",
      payload: { focusMinutes: 30 }
    });
    assert.strictEqual(sprint3.success, true);
    assert.strictEqual(sprint3.profile.focusMinutes, 70, "40 + 30 = 70 minutes");

    // Negative duration should be bounded to 0
    const sprintNeg = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "FOCUS_SPRINT",
      payload: { minutes: -100 }
    });
    assert.strictEqual(sprintNeg.success, true);
    assert.strictEqual(sprintNeg.profile.focusMinutes >= 0, true, "Focus minutes must not become negative");
  });

  it("3.2 [GAS] Habit adherence calculation with 0 habits (Division by Zero Resilience)", () => {
    // Create Family Gamma with 0 habits
    const famGamma = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Gamma Parent", email: "gamma.parent@example.com", pin: "3333", password: "Password123" },
      childrenData: [{ fullName: "Gamma Child", age: 10, grade: "Class 5", pin: "3333" }]
    });
    const gammaStudentId = famGamma.children[0].id;
    const gammaParentId = famGamma.parent.id;

    // Archive or remove all habits for Gamma parent
    const habitsSheet = mockActiveSpreadsheet.getSheetByName("HabitsQuests");
    const habits = gasBackend.getSheetRecords("HabitsQuests");
    habits.forEach(h => {
      if (h.parentUserId === gammaParentId) {
        gasBackend.updateSheetRecord("HabitsQuests", "id", h.id, { isArchived: true });
      }
    });

    // Record habit completion event when 0 active habits exist
    const res = gasBackend.recordGrowthEvent({
      studentId: gammaStudentId,
      eventType: "HABIT_COMPLETED"
    });

    assert.strictEqual(res.success, true, "Must succeed without throwing division-by-zero");
    assert.strictEqual(isNaN(res.profile.habitRate), false, "habitRate must NOT be NaN");
    assert.strictEqual(isFinite(res.profile.habitRate), true, "habitRate must be finite");
    assert.strictEqual(res.profile.habitRate, 100, "With 0 habits, habitRate must default safely to 100%");
  });

  it("3.3 [GAS] Habit adherence calculation with active habits (Partial adherence)", () => {
    // Create Family Delta
    const famDelta = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Delta Parent", email: "delta.parent@example.com", pin: "4444", password: "Password123" },
      childrenData: [{ fullName: "Delta Child", age: 10, grade: "Class 5", pin: "4444" }]
    });
    const deltaStudentId = famDelta.children[0].id;
    const deltaParentId = famDelta.parent.id;

    // Default habits seeded by onboarding is 4 habits.
    // Insert 2 approved submissions for today
    const now = new Date().toISOString();
    const today = now.substring(0, 10);

    gasBackend.appendSheetRecord("SubmissionsQueue", {
      id: "sub_delta_1",
      habitId: "h_ob_" + deltaParentId + "_1",
      studentId: deltaStudentId,
      parentUserId: deltaParentId,
      status: "APPROVED",
      reviewedAt: today + "T10:00:00Z",
      createdAt: now
    });
    gasBackend.appendSheetRecord("SubmissionsQueue", {
      id: "sub_delta_2",
      habitId: "h_ob_" + deltaParentId + "_2",
      studentId: deltaStudentId,
      parentUserId: deltaParentId,
      status: "APPROVED",
      reviewedAt: today + "T11:00:00Z",
      createdAt: now
    });

    // Record habit completed
    const res = gasBackend.recordGrowthEvent({
      studentId: deltaStudentId,
      eventType: "QUEST_APPROVED"
    });

    assert.strictEqual(res.success, true);
    // 2 approved out of 4 habits = 50%
    assert.strictEqual(res.profile.habitRate, 50, "2 / 4 habits must yield 50% adherence");
  });

  it("3.4 [GAS] Habit adherence bounds capping (0 to 100)", () => {
    const resLow = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "HABIT_COMPLETED",
      payload: { adherenceRate: -45 }
    });
    assert.strictEqual(resLow.profile.habitRate, 0, "Negative adherence must be clamped to 0");

    const resHigh = gasBackend.recordGrowthEvent({
      studentId: childAlphaId,
      eventType: "HABIT_COMPLETED",
      payload: { adherenceRate: 250 }
    });
    assert.strictEqual(resHigh.profile.habitRate, 100, "Excessive adherence must be clamped to 100");
  });

  it("3.5 [GAS] Date range filtering: 7d, 30d, all", () => {
    // Create new student for isolated date range testing
    const famDates = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Dates Parent", email: "dates.parent@example.com", pin: "5555", password: "Password123" },
      childrenData: [{ fullName: "Dates Child", age: 10, grade: "Class 5", pin: "5555" }]
    });
    const datesStudentId = famDates.children[0].id;
    const datesParentId = famDates.parent.id;

    // Clear any existing profiles for datesStudentId to have clean fixture
    const sgpSheet = mockActiveSpreadsheet.getSheetByName("StudentGrowthProfiles");
    for (let r = sgpSheet.grid.length - 1; r >= 1; r--) {
      if (sgpSheet.grid[r][1] === datesStudentId) {
        sgpSheet.deleteRow(r + 1);
      }
    }

    const now = new Date();
    const makeDate = (daysAgo) => {
      const d = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      return d.toISOString().substring(0, 10);
    };

    const d0 = makeDate(0);   // Today
    const d4 = makeDate(4);   // 4 days ago
    const d6 = makeDate(6);   // 6 days ago
    const d10 = makeDate(10); // 10 days ago
    const d25 = makeDate(25); // 25 days ago
    const d45 = makeDate(45); // 45 days ago
    const d95 = makeDate(95); // 95 days ago

    // Also a future date that should NOT appear
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)).toISOString().substring(0, 10);

    const testProfiles = [
      { date: d0, focusMinutes: 20, habitRate: 100, academicScore: 90, eqScore: 10 },
      { date: d4, focusMinutes: 30, habitRate: 80, academicScore: 85, eqScore: 20 },
      { date: d6, focusMinutes: 25, habitRate: 90, academicScore: 95, eqScore: 0 },
      { date: d10, focusMinutes: 40, habitRate: 70, academicScore: 75, eqScore: 15 },
      { date: d25, focusMinutes: 15, habitRate: 100, academicScore: 80, eqScore: 0 },
      { date: d45, focusMinutes: 50, habitRate: 60, academicScore: 70, eqScore: 25 },
      { date: d95, focusMinutes: 60, habitRate: 90, academicScore: 88, eqScore: 30 },
      { date: tomorrow, focusMinutes: 999, habitRate: 0, academicScore: 0, eqScore: 0 } // Future
    ];

    testProfiles.forEach(tp => {
      gasBackend.appendSheetRecord("StudentGrowthProfiles", {
        id: `sgp_${datesStudentId}_${tp.date}`,
        studentId: datesStudentId,
        date: tp.date,
        focusMinutes: tp.focusMinutes,
        habitRate: tp.habitRate,
        academicScore: tp.academicScore,
        eqScore: tp.eqScore,
        milestonesJson: "[]",
        updatedAt: new Date().toISOString()
      });
    });

    // Test 7d
    const res7d = gasBackend.getLongitudinalProfile({
      parentUserId: datesParentId,
      studentId: datesStudentId,
      timeRange: "7d"
    });
    assert.strictEqual(res7d.success, true);
    assert.strictEqual(res7d.historicalData.length, 3, "7d must include d0, d4, d6");
    const dates7d = res7d.historicalData.map(h => h.date);
    assert.deepStrictEqual(dates7d, [d6, d4, d0].sort());
    assert.strictEqual(res7d.summary.totalFocusMinutes, 20 + 30 + 25, "7d totalFocusMinutes: 75");

    // Test 30d
    const res30d = gasBackend.getLongitudinalProfile({
      parentUserId: datesParentId,
      studentId: datesStudentId,
      timeRange: "30d"
    });
    assert.strictEqual(res30d.success, true);
    assert.strictEqual(res30d.historicalData.length, 5, "30d must include d0, d4, d6, d10, d25");
    assert.strictEqual(res30d.summary.totalFocusMinutes, 20 + 30 + 25 + 40 + 15, "30d totalFocusMinutes: 130");

    // Test all
    const resAll = gasBackend.getLongitudinalProfile({
      parentUserId: datesParentId,
      studentId: datesStudentId,
      timeRange: "all"
    });
    assert.strictEqual(resAll.success, true);
    assert.strictEqual(resAll.historicalData.length, 7, "all must include 7 historical records, excluding future");
    assert.strictEqual(resAll.historicalData.some(h => h.date === tomorrow), false, "Future date must be excluded");
    assert.strictEqual(resAll.summary.totalFocusMinutes, 20 + 30 + 25 + 40 + 15 + 50 + 60, "all totalFocusMinutes: 240");
  });

  it("3.6 [Oracle] Metric invariants & division by zero in Oracle", async () => {
    const oracle = new ZoptroContractOracle();
    const fa = await oracle.signUpFamilyOnboarding({
      parentData: { fullName: "Ora Metric Par", email: "ora.metric@example.com", pin: "1111", password: "Password123" },
      childrenData: [{ fullName: "Ora Metric Kid", age: 8, grade: "Class 3", pin: "1111" }]
    });
    const sId = fa.children[0].id;
    const pId = fa.parent.id;

    // Focus sprints
    await oracle.recordGrowthEvent({ studentId: sId, eventType: "FOCUS_SPRINT", payload: { minutes: 25 } });
    await oracle.recordGrowthEvent({ studentId: sId, eventType: "FOCUS_COMPLETED", payload: { durationMins: 35 } });
    const prof = await oracle.getLongitudinalProfile({ parentUserId: pId, studentId: sId });
    assert.strictEqual(prof.summary.totalFocusMinutes, 60);

    // Div-by-zero check: Clear habits
    oracle.tables.HabitsQuests = [];
    const habitRes = await oracle.recordGrowthEvent({ studentId: sId, eventType: "HABIT_COMPLETED" });
    assert.strictEqual(habitRes.success, true);
    const updatedProf = await oracle.getLongitudinalProfile({ parentUserId: pId, studentId: sId });
    assert.strictEqual(updatedProf.summary.averageHabitAdherence, 100);
  });

  console.log("\n-----------------------------------------------------------------");
  console.log("⚡ SECTION 4: SCHEMA SELF-HEALING UNDER CORRUPTION");
  console.log("-----------------------------------------------------------------");

  it("4.1 [GAS] Missing columns self-healing (Users sheet truncated to 6 columns)", () => {
    const usersSheet = mockActiveSpreadsheet.getSheetByName("Users");
    assert.ok(usersSheet, "Users sheet must exist");

    // Corrupt Users row 1 to have only 6 columns
    usersSheet.grid[0] = ["id", "role", "fullName", "email", "pinHash", "passwordHash"];
    assert.strictEqual(usersSheet.grid[0].length, 6, "Users header corrupted to 6 columns");

    // Run initializeDatabase()
    const healRes = gasBackend.initializeDatabase();
    assert.strictEqual(healRes.success, true);

    // Verify row 1 restored to 17 canonical headers
    assert.strictEqual(usersSheet.grid[0].length, 17, "Users headers restored to 17 columns");
    assert.strictEqual(usersSheet.grid[0][14], "gradeClass");
    assert.strictEqual(usersSheet.grid[0][15], "age");
    assert.strictEqual(usersSheet.grid[0][16], "parentalPermissions");
  });

  it("4.2 [GAS] Shuffled headers self-healing (Stories headers reversed)", () => {
    const storiesSheet = mockActiveSpreadsheet.getSheetByName("Stories");
    assert.ok(storiesSheet, "Stories sheet must exist");

    // Reverse the headers
    storiesSheet.grid[0] = ["updatedAt", "createdAt", "isActive", "orderIndex", "moralLesson", "content", "genre", "title", "grade", "id"];
    assert.strictEqual(storiesSheet.grid[0][0], "updatedAt", "Headers reversed");

    // Run self-healing
    gasBackend.initializeDatabase();

    // Verify row 1 restored to exact canonical schema
    const canonical = [
      "id", "grade", "title", "genre", "content",
      "moralLesson", "orderIndex", "isActive", "createdAt", "updatedAt"
    ];
    for (let c = 0; c < canonical.length; c++) {
      assert.strictEqual(storiesSheet.grid[0][c], canonical[c], `Header column ${c} must match canonical ${canonical[c]}`);
    }
  });

  it("4.3 [GAS] Extra columns resilience (CurriculumQuizzes with 4 extra columns)", () => {
    const quizSheet = mockActiveSpreadsheet.getSheetByName("CurriculumQuizzes");
    assert.ok(quizSheet);

    // Append 4 extra columns to row 1
    quizSheet.grid[0].push("extraCol1", "extraCol2", "extraCol3", "extraCol4");
    assert.strictEqual(quizSheet.grid[0].length, 18);

    // Run initializeDatabase()
    gasBackend.initializeDatabase();

    // Append record and ensure it maps to canonical columns
    const testQuiz = {
      id: "q_test_selfheal",
      grade: "Class 4",
      subject: "Science",
      examCategory: "CBSE",
      title: "Photosynthesis Basics",
      questionText: "What do plants absorb?",
      optionsJson: JSON.stringify(["Carbon Dioxide", "Oxygen", "Nitrogen", "Helium"]),
      correctOptionIndex: 0,
      hint: "Gas required for photosynthesis",
      explanation: "Plants absorb carbon dioxide for photosynthesis.",
      orderIndex: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    gasBackend.appendSheetRecord("CurriculumQuizzes", testQuiz);

    const records = gasBackend.getSheetRecords("CurriculumQuizzes");
    const found = records.find(r => r.id === "q_test_selfheal");
    assert.ok(found, "Record must be retrievable");
    assert.strictEqual(found.grade, "Class 4");
    assert.strictEqual(found.subject, "Science");
  });

  it("4.4 [GAS] Empty sheet tab self-healing (Completely empty sheet)", () => {
    // Corrupt DailyKnowledge: wipe all rows
    const dkSheet = mockActiveSpreadsheet.getSheetByName("DailyKnowledge");
    dkSheet.grid = [];
    assert.strictEqual(dkSheet.grid.length, 0);

    // Run initializeDatabase()
    gasBackend.initializeDatabase();

    // Verify headers restored
    assert.strictEqual(dkSheet.grid.length >= 1, true, "Must have header row");
    assert.strictEqual(dkSheet.grid[0][0], "id");
    assert.strictEqual(dkSheet.grid[0][1], "grade");
  });

  it("4.5 [Oracle] Self-healing missing tables & corrupted storage in Oracle", async () => {
    const storage = new InMemStorage();
    const oracle = new ZoptroContractOracle(storage);

    // Delete critical tables from memory
    delete oracle.tables.StudentGrowthProfiles;
    delete oracle.tables.CurriculumQuizzes;
    delete oracle.tables.Stories;

    const healRes = oracle.selfHealSchema();
    assert.strictEqual(healRes.success, true);
    assert.ok(Array.isArray(oracle.tables.StudentGrowthProfiles), "StudentGrowthProfiles table restored");
    assert.ok(Array.isArray(oracle.tables.CurriculumQuizzes), "CurriculumQuizzes table restored");
    assert.ok(Array.isArray(oracle.tables.Stories), "Stories table restored");

    // Corrupt storage with malformed JSON
    storage.setItem("ZOPTRO_LOCAL_DB_V1", "{ malformed_json: [ unclosed");

    // Instantiate new oracle with corrupted storage
    const healedOracle = new ZoptroContractOracle(storage);
    assert.ok(Array.isArray(healedOracle.tables.Users), "Must recover Users table from corrupt storage");
    assert.ok(Array.isArray(healedOracle.tables.StudentGrowthProfiles), "Must recover StudentGrowthProfiles");
  });

  console.log("\n=================================================================");
  console.log(`🏁 ADVERSARIAL SUITE EXECUTION COMPLETE`);
  console.log(`Total Attacks Attempted: ${totalTests}`);
  console.log(`Attacks Defended:        ${passedTests}`);
  console.log(`Vulnerabilities Found:   ${failedTests}`);
  console.log("=================================================================\n");

  if (failedTests > 0) {
    console.error("❌ VULNERABILITIES DETECTED:");
    failureDetails.forEach((f, idx) => {
      console.error(`  ${idx + 1}. ${f.name}`);
      console.error(`     ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log("🎉 VERDICT: ALL ADVERSARIAL ATTACKS DEFENDED (100% PASS)!");
    process.exit(0);
  }
}

runAdversarialProbe().catch(err => {
  console.error("FATAL RUNNER ERROR:", err);
  process.exit(1);
});
