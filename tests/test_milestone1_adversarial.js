/**
 * =========================================================================
 * ZOPTRO - MILESTONE 1 ADVERSARIAL STRESS TEST SUITE
 * =========================================================================
 * Challenger: challenger_1_m1 (Empirical Challenger)
 * Scope:
 * - Attack RBAC governance & student privilege escalation
 * - Cross-family / Multi-tenant authorization bypass
 * - Authentication boundaries (short PINs, weak passwords, invalid pairing codes, bad emails)
 * - Economic logic & boundary exploits (negative coins, excessive points, double-earning)
 * - State persistence & self-healing resilience in BrowserMockBackend & GAS
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

console.log("=================================================================");
console.log("⚔️  STARTING ZOPTRO MILESTONE 1 ADVERSARIAL CHALLENGE SUITE");
console.log("=================================================================\n");

let suiteStats = {
  total: 0,
  passed: 0,
  failed: 0,
  findings: []
};

function challenge(id, name, fn) {
  suiteStats.total++;
  try {
    fn();
    suiteStats.passed++;
    console.log(`  🛡️  DEFENDED [${id}]: ${name}`);
  } catch (err) {
    suiteStats.failed++;
    const finding = { id, name, error: err.message };
    suiteStats.findings.push(finding);
    console.error(`  🚨 VULNERABILITY FOUND [${id}]: ${name}`);
    console.error(`     Finding: ${err.message}`);
  }
}

async function challengeAsync(id, name, fn) {
  suiteStats.total++;
  try {
    await fn();
    suiteStats.passed++;
    console.log(`  🛡️  DEFENDED [${id}]: ${name}`);
  } catch (err) {
    suiteStats.failed++;
    const finding = { id, name, error: err.message };
    suiteStats.findings.push(finding);
    console.error(`  🚨 VULNERABILITY FOUND [${id}]: ${name}`);
    console.error(`     Finding: ${err.message}`);
  }
}

// =========================================================================
// SETUP: IN-MEMORY GOOGLE APPS SCRIPT SPREADSHEET SIMULATOR
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
  appendRow(rowArr) { this.grid.push([...rowArr]); }
  insertRowsBefore(beforeRow, count) {
    for (let i = 0; i < count; i++) this.grid.splice(beforeRow - 1, 0, []);
  }
  deleteRow(rowNumber) { this.grid.splice(rowNumber - 1, 1); }
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
  constructor() { this.sheets = []; }
  getSheetByName(name) { return this.sheets.find(s => s.name === name) || null; }
  insertSheet(name) {
    const s = new MockSheet(name);
    this.sheets.push(s);
    return s;
  }
}

let mockActiveSpreadsheet = new MockSpreadsheet();

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
    name,
    setTitle: function() { return this; },
    addMetaTag: function() { return this; },
    setXFrameOptionsMode: function() { return this; }
  }),
  createHtmlOutput: (html) => ({ html })
};

global.Session = {
  getActiveUser: () => ({ getEmail: () => 'parent@zoptro.local' }),
  getScriptTimeZone: () => 'GMT+5:30'
};

global.MailApp = {
  sendEmail: () => true
};

// Load GAS backend module
const gasBackend = require('../google_apps_script_backend.js');

// Load BrowserMockBackend from HTML file
const htmlFilePath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const htmlSource = fs.readFileSync(htmlFilePath, 'utf8');
const scriptMatches = htmlSource.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const appScript = lastScriptTag.replace(/<\/?script[\s\S]*?>/gi, "");

class InMemStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(String(k)) ? this.map.get(String(k)) : null; }
  setItem(k, v) { this.map.set(String(k), String(v)); }
  removeItem(k) { this.map.delete(String(k)); }
  clear() { this.map.clear(); }
}

function createBrowserMockEnv(preExistingStore = null) {
  const memStore = preExistingStore || new InMemStorage();
  const mockExports = {};
  const mockElement = {
    getContext: () => ({
      clearRect: () => {}, save: () => {}, restore: () => {},
      translate: () => {}, rotate: () => {}, fillRect: () => {}
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
        currentTime: 0, destination: {},
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
      };
    },
    localStorage: {
      getItem: (k) => memStore.getItem(k),
      setItem: (k, v) => memStore.setItem(k, v),
      removeItem: (k) => memStore.removeItem(k)
    }
  };

  const mockContext = {
    module: { exports: mockExports },
    exports: mockExports,
    console: console,
    Date: Date,
    Math: Math,
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout: () => {},
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
    },
    tailwind: { config: {} }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockContext.document;

  vm.createContext(mockContext);
  vm.runInContext(appScript, mockContext);

  const mock = mockContext.window.BrowserMockBackend || mockContext.module.exports.BrowserMockBackend;
  const client = mockContext.window.ZoptroApiClient || mockContext.module.exports.ZoptroApiClient;
  mock.init(false);
  return { mock, client, storage: memStore };
}

// =========================================================================
// RUN ADVERSARIAL CHALLENGES
// =========================================================================
async function runAdversarialSuite() {

  console.log("--- ATTACK VECTOR 1: STRICT RBAC & STUDENT PRIVILEGE ESCALATION ---");

  // Re-init database
  mockActiveSpreadsheet = new MockSpreadsheet();
  gasBackend.initializeDatabase();
  const gasUsers = gasBackend.getSheetRecords("Users");
  const student = gasUsers.find(u => u.role === "student");
  const parent = gasUsers.find(u => u.role === "parent");

  // Create a pending submission
  const subRes = gasBackend.submitQuestCompletion({
    studentId: student.id,
    questId: "h_1",
    notes: "Adversarial test quest"
  });
  const subId = subRes.submissionId;

  // Challenge 1.1: Student attempting to approve quest submission
  challenge("ADV-RBAC-01", "Student ID calling approveQuestSubmission must be rejected", () => {
    const res = gasBackend.approveQuestSubmission({
      submissionId: subId,
      parentUserId: student.id,
      bonusCoins: 50
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.2: Student attempting to reject quest submission
  challenge("ADV-RBAC-02", "Student ID calling rejectQuestSubmission must be rejected", () => {
    const res = gasBackend.rejectQuestSubmission({
      submissionId: subId,
      parentUserId: student.id,
      reason: "Self rejection test"
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.3: Student attempting saveHabit (points alteration)
  challenge("ADV-RBAC-03", "Student ID calling saveHabit to inject 9999 points must be rejected", () => {
    const res = gasBackend.saveHabit({
      parentUserId: student.id,
      habitData: { title: "Hacked Quest", points: 9999, xp: 20000 }
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.4: Student attempting deleteHabit
  challenge("ADV-RBAC-04", "Student ID calling deleteHabit must be rejected", () => {
    const res = gasBackend.deleteHabit({
      parentUserId: student.id,
      habitId: "h_1"
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.5: Student attempting manageRewardItem
  challenge("ADV-RBAC-05", "Student ID calling manageRewardItem must be rejected", () => {
    const res = gasBackend.manageRewardItem({
      parentUserId: student.id,
      rewardData: { title: "Free PS5", costCoins: 0 }
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.6: Student attempting awardParentBonus
  challenge("ADV-RBAC-06", "Student ID calling awardParentBonus must be rejected", () => {
    const res = gasBackend.awardParentBonus({
      parentUserId: student.id,
      studentId: student.id,
      coins: 1000
    });
    assert.strictEqual(res.success, false, "Must return success: false");
    assert.ok(res.error && res.error.includes("UNAUTHORIZED"), "Error must state UNAUTHORIZED");
  });

  // Challenge 1.7: Student calling legacy updateWalletCoins (unauthenticated privilege escalation)
  challenge("ADV-RBAC-07", "Direct invocation of legacy updateWalletCoins must NOT allow arbitrary unverified student coin awards", () => {
    const initialCoins = Number(student.coins);
    const res = gasBackend.updateWalletCoins(500, 1000, "Student injected coins");
    const updatedUsers = gasBackend.getSheetRecords("Users");
    const updatedStudent = updatedUsers.find(u => u.id === student.id);
    
    if (res.success && updatedStudent.coins === initialCoins + 500) {
      throw new Error(`Legacy bridge updateWalletCoins allows direct unauthenticated wallet manipulation (+500 coins awarded without parent governance).`);
    }
  });

  console.log("\n--- ATTACK VECTOR 2: CROSS-FAMILY / MULTI-TENANT AUTHORIZATION BYPASS ---");

  // Create Family 2
  const parent2Signup = gasBackend.signUpParent({
    fullName: "Imposter Parent",
    email: "imposter@adversary.com",
    pin: "9999",
    password: "password999"
  });
  const parent2Id = parent2Signup.user.id;

  // Challenge 2.1: Imposter Parent altering Student 1's PIN/Password via updateStudentSecurity
  challenge("ADV-MULTI-01", "Unpaired Parent 2 attempting updateStudentSecurity on Student 1 must be rejected", () => {
    const res = gasBackend.updateStudentSecurity({
      parentUserId: parent2Id,
      studentId: student.id,
      newPin: "0000"
    });
    assert.strictEqual(res.success, false, "Unpaired parent must NOT be permitted to alter student security credentials");
    assert.ok(res.error && (res.error.includes("not paired") || res.error.includes("UNAUTHORIZED")), 
      `Expected pairing rejection but received: ${JSON.stringify(res)}`);
  });

  // Challenge 2.2: Imposter Parent approving Student 1's quest submission
  challenge("ADV-MULTI-02", "Unpaired Parent 2 attempting approveQuestSubmission on Student 1 must be rejected", () => {
    const res = gasBackend.approveQuestSubmission({
      submissionId: subId,
      parentUserId: parent2Id,
      bonusCoins: 100
    });
    assert.strictEqual(res.success, false, "Unpaired parent must NOT be permitted to approve other families' quest submissions");
  });

  // Challenge 2.3: Imposter Parent approving Student 1's redemption request
  const rdmRes = gasBackend.submitRedemptionRequest({
    studentId: student.id,
    rewardId: "rw_1"
  });
  const rdmId = rdmRes.redemptionId;

  challenge("ADV-MULTI-03", "Unpaired Parent 2 attempting approveRedemption on Student 1 must be rejected", () => {
    const res = gasBackend.approveRedemption({
      redemptionId: rdmId,
      parentUserId: parent2Id
    });
    assert.strictEqual(res.success, false, "Unpaired parent must NOT be permitted to approve other families' redemptions");
  });

  // Challenge 2.4: Imposter Parent awarding bonus to Student 1
  challenge("ADV-MULTI-04", "Unpaired Parent 2 attempting awardParentBonus to Student 1 must be rejected", () => {
    const res = gasBackend.awardParentBonus({
      parentUserId: parent2Id,
      studentId: student.id,
      coins: 50
    });
    assert.strictEqual(res.success, false, "Unpaired parent must NOT be permitted to award bonus coins to other families' students");
  });

  console.log("\n--- ATTACK VECTOR 3: AUTHENTICATION, PAIRING CODES & CREDENTIAL BOUNDARIES ---");

  // Challenge 3.1: Student signup with invalid pairing codes
  challenge("ADV-AUTH-01", "Student signup with non-existent pairing code must fail", () => {
    const res = gasBackend.signUpStudent({
      fullName: "Attacker",
      pin: "1234",
      pairingCode: "BADCOD"
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes("INVALID_PAIRING_CODE"));
  });

  // Challenge 3.2: Student signup using Student's pairing code instead of Parent's
  challenge("ADV-AUTH-02", "Student signup using a student account's pairing code must fail", () => {
    const res = gasBackend.signUpStudent({
      fullName: "Attacker 2",
      pin: "1234",
      pairingCode: "ZOP360"
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.linkedParentId, parent.id);
  });

  // Challenge 3.3: Duplicate Email (Case-Insensitive)
  challenge("ADV-AUTH-03", "Parent signup with uppercase duplicate email must be rejected", () => {
    const res = gasBackend.signUpParent({
      fullName: "Duplicate Colonel",
      email: "RAJESH@ZOPTRO.LOCAL",
      pin: "1234",
      password: "password123"
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "EMAIL_ALREADY_EXISTS");
  });

  // Challenge 3.4: Weak PIN Format (< 4 digits) in Parent Signup
  challenge("ADV-AUTH-04", "Parent signup with trivial 1-digit PIN ('1') must be rejected", () => {
    const res = gasBackend.signUpParent({
      fullName: "Weak Pin Parent",
      email: "weakpin@zoptro.local",
      pin: "1",
      password: "password123"
    });
    assert.strictEqual(res.success, false, `Expected 1-digit PIN to be rejected, but received success=${res.success}`);
  });

  // Challenge 3.5: Weak PIN Format (< 4 digits) in Student Signup
  challenge("ADV-AUTH-05", "Student signup with trivial 2-digit PIN ('12') must be rejected", () => {
    const res = gasBackend.signUpStudent({
      fullName: "Weak Pin Student",
      pin: "12",
      pairingCode: "ZOP360"
    });
    assert.strictEqual(res.success, false, `Expected 2-digit PIN to be rejected, but received success=${res.success}`);
  });

  // Challenge 3.6: Non-numeric PIN in Student Security Update
  challenge("ADV-AUTH-06", "Updating student PIN to non-numeric characters ('ABCD') must be rejected", () => {
    const res = gasBackend.updateStudentSecurity({
      parentUserId: parent.id,
      studentId: student.id,
      newPin: "ABCD"
    });
    assert.strictEqual(res.success, false, `Expected non-numeric PIN 'ABCD' to be rejected, but received success=${res.success}`);
  });

  // Challenge 3.7: Weak Password (< 6 chars) in Parent Signup
  challenge("ADV-AUTH-07", "Parent signup with short password ('abc') must be rejected", () => {
    const res = gasBackend.signUpParent({
      fullName: "Weak Pass Parent",
      email: "weakpass@zoptro.local",
      pin: "1234",
      password: "abc"
    });
    assert.strictEqual(res.success, false, `Expected password < 6 chars to be rejected, but received success=${res.success}`);
  });

  // Challenge 3.8: Malformed Email in Parent Signup
  challenge("ADV-AUTH-08", "Parent signup with malformed email ('notanemail') must be rejected", () => {
    const res = gasBackend.signUpParent({
      fullName: "Bad Email Parent",
      email: "notanemail",
      pin: "1234",
      password: "password123"
    });
    assert.strictEqual(res.success, false, `Expected malformed email to be rejected, but received success=${res.success}`);
  });

  // Challenge 3.9: Role Switch PIN verification boundary
  challenge("ADV-AUTH-09", "Role switch PIN verification with empty PIN or non-existent user must fail safely", () => {
    const r1 = gasBackend.verifyRolePin({ userId: student.id, pin: "" });
    assert.strictEqual(r1.success, false);
    assert.strictEqual(r1.verified, false);

    const r2 = gasBackend.verifyRolePin({ userId: "nonexistent", pin: "1234" });
    assert.strictEqual(r2.success, false);
    assert.strictEqual(r2.verified, false);

    const r3 = gasBackend.verifyRolePin({ userId: student.id, pin: "WRONG" });
    assert.strictEqual(r3.verified, false);
  });

  console.log("\n--- ATTACK VECTOR 4: ECONOMIC LOGIC & BOUNDARY EXPLOITS ---");

  // Challenge 4.1: Negative Bonus Coins in approveQuestSubmission
  challenge("ADV-ECON-01", "approveQuestSubmission with negative bonus coins must not produce negative wallet coins", () => {
    const newSub = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_2",
      notes: "Negative coin test"
    });
    const res = gasBackend.approveQuestSubmission({
      submissionId: newSub.submissionId,
      parentUserId: parent.id,
      bonusCoins: -99999
    });
    if (res.success) {
      assert.ok(res.updatedWallet.coins >= 0, `Coins underflowed to ${res.updatedWallet.coins}`);
    } else {
      assert.strictEqual(res.success, false, "Negative bonus coins rejected");
    }
  });

  // Challenge 4.2: Negative Reward Cost Exploit (Infinite Coin Loop)
  challenge("ADV-ECON-02", "manageRewardItem must reject negative costCoins to prevent infinite coin generation", () => {
    const res = gasBackend.manageRewardItem({
      parentUserId: parent.id,
      rewardData: { title: "Exploit Reward", costCoins: -100 }
    });
    if (res.success) {
      assert.ok(res.reward.costCoins >= 0, `Negative costCoins was accepted: ${res.reward.costCoins}`);
    } else {
      assert.strictEqual(res.success, false);
    }
  });

  // Challenge 4.3: Excessive / Unbounded Habit Points
  challenge("ADV-ECON-03", "saveHabit with excessive points (>1000) must be rejected", () => {
    const res = gasBackend.saveHabit({
      parentUserId: parent.id,
      habitData: { title: "Unbounded Points Quest", points: 50000 }
    });
    assert.strictEqual(res.success, false, `Excessive habit points (50,000) was accepted: ${JSON.stringify(res)}`);
  });

  // Challenge 4.4: Double-submission of already-approved quest on the same day
  challenge("ADV-ECON-04", "Student cannot submit a quest that was already approved today (double-earning prevention)", () => {
    const duplicateSub = gasBackend.submitQuestCompletion({
      studentId: student.id,
      questId: "h_2",
      notes: "Attempting to earn double on same quest today"
    });
    assert.strictEqual(duplicateSub.success, false, "Submitting already-approved quest on same day must be rejected");
  });

  // Challenge 4.5: Double Review Replay Attack
  challenge("ADV-ECON-05", "Double approval or rejection of quest submission is safely prevented", () => {
    const sub = gasBackend.submitQuestCompletion({ studentId: student.id, questId: "h_3" });
    const app1 = gasBackend.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.id });
    assert.strictEqual(app1.success, true);
    const app2 = gasBackend.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.id });
    assert.strictEqual(app2.success, false);
    assert.strictEqual(app2.error, "SUBMISSION_ALREADY_REVIEWED");
  });

  console.log("\n--- ATTACK VECTOR 5: BROWSER MOCK BACKEND PERSISTENCE & PARITY ---");

  // Challenge 5.1: BrowserMockBackend parity for RBAC on all parent endpoints
  challenge("ADV-MOCK-01", "BrowserMockBackend enforces parent governance on all mutating endpoints", () => {
    const { mock } = createBrowserMockEnv();
    const mockStudent = mock._getTable(mock.KEYS.USERS).find(u => u.role === 'student');

    // 1. approveQuestSubmission
    const a1 = mock.approveQuestSubmission({ submissionId: "fake", parentUserId: mockStudent.id });
    assert.strictEqual(a1.success, false);
    assert.ok(a1.error.includes("UNAUTHORIZED"));

    // 2. rejectQuestSubmission
    const a2 = mock.rejectQuestSubmission({ submissionId: "fake", parentUserId: mockStudent.id });
    assert.strictEqual(a2.success, false);
    assert.ok(a2.error.includes("UNAUTHORIZED"));

    // 3. saveHabit
    const a3 = mock.saveHabit({ parentUserId: mockStudent.id, habitData: { title: "Hack" } });
    assert.strictEqual(a3.success, false);
    assert.ok(a3.error.includes("UNAUTHORIZED"));

    // 4. deleteHabit
    const a4 = mock.deleteHabit({ parentUserId: mockStudent.id, habitId: "h_1" });
    assert.strictEqual(a4.success, false);
    assert.ok(a4.error.includes("UNAUTHORIZED"));

    // 5. manageRewardItem
    const a5 = mock.manageRewardItem({ parentUserId: mockStudent.id, rewardData: { title: "Hack" } });
    assert.strictEqual(a5.success, false);
    assert.ok(a5.error.includes("UNAUTHORIZED"));

    // 6. approveRedemption
    const a6 = mock.approveRedemption({ redemptionId: "fake", parentUserId: mockStudent.id });
    assert.strictEqual(a6.success, false);
    assert.ok(a6.error.includes("UNAUTHORIZED"));

    // 7. rejectRedemption
    const a7 = mock.rejectRedemption({ redemptionId: "fake", parentUserId: mockStudent.id });
    assert.strictEqual(a7.success, false);
    assert.ok(a7.error.includes("UNAUTHORIZED"));

    // 8. awardParentBonus
    const a8 = mock.awardParentBonus({ parentUserId: mockStudent.id, studentId: mockStudent.id, coins: 50 });
    assert.strictEqual(a8.success, false);
    assert.ok(a8.error.includes("UNAUTHORIZED"));

    // 9. updateStudentSecurity
    const a9 = mock.updateStudentSecurity({ parentUserId: mockStudent.id, studentId: mockStudent.id, newPin: "9999" });
    assert.strictEqual(a9.success, false);
    assert.ok(a9.error.includes("UNAUTHORIZED"));
  });

  // Challenge 5.2: Corrupted JSON in localStorage triggers self-healing in BrowserMockBackend
  challenge("ADV-MOCK-02", "BrowserMockBackend self-heals when localStorage contains corrupted JSON", () => {
    const { mock, storage } = createBrowserMockEnv();
    storage.setItem(mock.KEYS.USERS, "{broken-json-corrupted-data");
    
    mock.init();
    const users = mock._getTable(mock.KEYS.USERS);
    assert.ok(Array.isArray(users), "Must return an array");
    assert.ok(users.length >= 2, `Database must self-heal seed users on corruption, but found ${users.length} users`);
  });

  // Challenge 5.3: End-to-End Multi-Action Persistence across Simulated Browser Reload
  challenge("ADV-MOCK-03", "BrowserMockBackend preserves state across simulated page reload with new backend instance", () => {
    const memStore = new InMemStorage();
    const env1 = createBrowserMockEnv(memStore);
    env1.mock.resetDatabase();

    const users = JSON.parse(memStore.getItem('zoptro_db_users'));
    const parentUser = users.find(u => u.role === 'parent');
    const studentUser = users.find(u => u.role === 'student');

    // Add new habit via mock API
    const saveRes = env1.mock.saveHabit({
      parentUserId: parentUser.id,
      habitData: { title: 'Persistent Math Challenge', points: 30, xp: 60 }
    });
    assert.strictEqual(saveRes.success, true);

    // Reload with fresh backend instance
    const env2 = createBrowserMockEnv(memStore);
    const reloadedHabits = env2.mock._getTable(env2.mock.KEYS.HABITS);
    assert.ok(reloadedHabits.some(h => h.title === 'Persistent Math Challenge'), "Custom habit must persist across session reload");
  });

  // Challenge 5.4: Multi-tenant student security isolation in BrowserMockBackend
  challenge("ADV-MOCK-04", "BrowserMockBackend rejects cross-family credential alteration", () => {
    const { mock } = createBrowserMockEnv();
    const imposter = mock.signUpParent({
      fullName: "Imposter Mock Parent",
      email: "imposter_mock@test.com",
      pin: "8888",
      password: "password888"
    });
    const defaultStudent = mock._getTable(mock.KEYS.USERS).find(u => u.role === 'student');

    const res = mock.updateStudentSecurity({
      parentUserId: imposter.user.id,
      studentId: defaultStudent.id,
      newPin: "0000"
    });
    assert.strictEqual(res.success, false, "Imposter parent must not alter student credentials in BrowserMockBackend");
  });

  // Challenge 5.5: Negative coin exploit prevention in BrowserMockBackend
  challenge("ADV-MOCK-05", "BrowserMockBackend prevents infinite coins via negative cost rewards", () => {
    const { mock } = createBrowserMockEnv();
    const parent = mock._getTable(mock.KEYS.USERS).find(u => u.role === 'parent');
    const res = mock.manageRewardItem({
      parentUserId: parent.id,
      rewardData: { title: "Negative Cost Exploit", costCoins: -200 }
    });
    if (res.success) {
      assert.ok(res.reward.costCoins >= 0, `Negative costCoins accepted: ${res.reward.costCoins}`);
    } else {
      assert.strictEqual(res.success, false);
    }
  });

  console.log("\n=================================================================");
  console.log(`🏁 ADVERSARIAL SUITE SUMMARY: ${suiteStats.passed}/${suiteStats.total} CHALLENGES DEFENDED`);
  console.log(`🚨 VULNERABILITIES DETECTED: ${suiteStats.failed}`);
  console.log("=================================================================\n");

  if (suiteStats.findings.length > 0) {
    console.log("DETAILED VULNERABILITY FINDINGS:");
    suiteStats.findings.forEach((f, idx) => {
      console.log(`\n${idx + 1}. [${f.id}] ${f.name}`);
      console.log(`   Failure reason: ${f.error}`);
    });
  }

  return suiteStats;
}

if (require.main === module) {
  runAdversarialSuite().then(stats => {
    if (stats.failed > 0) {
      console.log(`\n⚠️  CHALLENGE VERDICT: ISSUES FOUND (${stats.failed} vulnerabilities identified)`);
    } else {
      console.log("\n✅ CHALLENGE VERDICT: ALL ATTACKS DEFENDED");
    }
  }).catch(err => {
    console.error("FATAL ERROR IN TEST HARNESS:", err);
    process.exit(1);
  });
}

module.exports = { runAdversarialSuite };
