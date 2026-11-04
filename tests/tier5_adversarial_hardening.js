/**
 * =========================================================================
 * ZOPTRO - TIER 5 WHITE-BOX ADVERSARIAL STRESS & COVERAGE HARDENING SUITE
 * =========================================================================
 * Milestone: M4 Verification Gate / Tier 5 Hardening
 * Author: challenger_m4_tier5
 * 
 * Deep White-Box Stress Vectors Covered:
 * Part 1: Boundary Value & Adversarial Input Fuzzing (GAS + Mock Backend)
 * Part 2: Storage Self-Healing & Structural Corruption Resilience
 * Part 3: Cross-Family Multi-Tenant Isolation & Concurrency Stress
 * Part 4: Economic Integrity, Escrow Underflow, Double Spending & Race Conditions
 * Part 5: Strict 90° Square Edge Geometry & Brand Design System Hardening
 * =========================================================================
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');

console.log("=================================================================");
console.log("⚔️  ZOPTRO TIER 5 WHITE-BOX ADVERSARIAL HARDENING SUITE");
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
    console.log(`  🛡️  [T5-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [T5-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
    console.error(`     Stack: ${err.stack}`);
  }
}

async function testAsync(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    console.log(`  🛡️  [T5-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [T5-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// -------------------------------------------------------------------------
// Mock Google Apps Script Spreadsheet & Environment Infrastructure
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
    tryLock: () => true,
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
      body: mockElement
    },
    localStorage: mockWindow.localStorage
  };

  vm.createContext(mockContext);
  vm.runInContext(appScript + "\n;module.exports = { BrowserMockBackend, ZoptroApiClient };", mockContext);
  return {
    BrowserMockBackend: mockContext.module.exports.BrowserMockBackend,
    ZoptroApiClient: mockContext.module.exports.ZoptroApiClient,
    store: memStore
  };
}

// Reset GAS spreadsheet to empty state
function resetGasSpreadsheet() {
  mockSpreadsheet = new MockSpreadsheet();
  gasBackend.initializeDatabase();
}

async function runMasterTier5HardeningSuite() {
  // =========================================================================
  // PART 1: BOUNDARY VALUE & ADVERSARIAL INPUT FUZZING
  // =========================================================================
  console.log("\n--- PART 1: BOUNDARY VALUE & ADVERSARIAL INPUT FUZZING ---");

  test("T5-BND-01: Null and undefined payloads passed to every endpoint in GAS Backend", () => {
    resetGasSpreadsheet();
    // Verify none of these throw unhandled errors; they must return failure objects or safe defaults
    const r1 = gasBackend.signUpParent(null);
    assert.strictEqual(r1.success, false);
    const r2 = gasBackend.signUpStudent(undefined);
    assert.strictEqual(r2.success, false);
    const r3 = gasBackend.loginUser(null);
    assert.strictEqual(r3.success, false);
    const r4 = gasBackend.verifyRolePin(null);
    assert.strictEqual(r4.success, false);
    const r5 = gasBackend.submitQuestCompletion(null);
    assert.strictEqual(r5.success, false);
    const r6 = gasBackend.saveHabit(null);
    assert.strictEqual(r6.success, false);
    const r7 = gasBackend.deleteHabit(null);
    assert.strictEqual(r7.success, false);
    const r8 = gasBackend.getPendingVerifications(null);
    assert.strictEqual(r8.success, false);
    const r9 = gasBackend.approveQuestSubmission(null);
    assert.strictEqual(r9.success, false);
    const r10 = gasBackend.rejectQuestSubmission(null);
    assert.strictEqual(r10.success, false);
    const r11 = gasBackend.getRewardsCatalog(null);
    assert.strictEqual(r11.success, true);
    const r12 = gasBackend.submitRedemptionRequest(null);
    assert.strictEqual(r12.success, false);
    const r13 = gasBackend.manageRewardItem(null);
    assert.strictEqual(r13.success, false);
    const r14 = gasBackend.approveRedemption(null);
    assert.strictEqual(r14.success, false);
    const r15 = gasBackend.rejectRedemption(null);
    assert.strictEqual(r15.success, false);
    const r16 = gasBackend.updateStudentSecurity(null);
    assert.strictEqual(r16.success, false);
    const r17 = gasBackend.awardParentBonus(null);
    assert.strictEqual(r17.success, false);
    // updateWalletCoins with null delta coerces to 0 (wallet balance remains unchanged 340)
    const r18 = gasBackend.updateWalletCoins(null, null, null, null, null, null);
    assert.strictEqual(r18.coins, 340);
    // NaN delta must be rejected
    const r18NaN = gasBackend.updateWalletCoins(NaN, 0, null, null, null, null);
    assert.strictEqual(r18NaN.success, false);
  });

  test("T5-BND-02: Null and undefined payloads passed to every endpoint in BrowserMockBackend", () => {
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    assert.strictEqual(BrowserMockBackend.signUpParent(null).success, false);
    assert.strictEqual(BrowserMockBackend.signUpStudent(undefined).success, false);
    assert.strictEqual(BrowserMockBackend.loginUser(null).success, false);
    assert.strictEqual(BrowserMockBackend.verifyRolePin(null).success, false);
    assert.strictEqual(BrowserMockBackend.submitQuestCompletion(null).success, false);
    assert.strictEqual(BrowserMockBackend.saveHabit(null).success, false);
    assert.strictEqual(BrowserMockBackend.deleteHabit(null).success, false);
    assert.strictEqual(BrowserMockBackend.getPendingVerifications(null).success, false);
    assert.strictEqual(BrowserMockBackend.approveQuestSubmission(null).success, false);
    assert.strictEqual(BrowserMockBackend.rejectQuestSubmission(null).success, false);
    assert.strictEqual(BrowserMockBackend.getRewardsCatalog(null).success, true);
    assert.strictEqual(BrowserMockBackend.submitRedemptionRequest(null).success, false);
    assert.strictEqual(BrowserMockBackend.manageRewardItem(null).success, false);
    assert.strictEqual(BrowserMockBackend.approveRedemption(null).success, false);
    assert.strictEqual(BrowserMockBackend.rejectRedemption(null).success, false);
    assert.strictEqual(BrowserMockBackend.updateStudentSecurity(null).success, false);
    assert.strictEqual(BrowserMockBackend.awardParentBonus(null).success, false);
    // updateWalletCoins with null delta coerces to 0 (wallet balance remains unchanged 340)
    const mockR18 = BrowserMockBackend.updateWalletCoins(null, null, null, null, null);
    assert.strictEqual(mockR18.coins, 340);
  });

  test("T5-BND-03: NaN, Infinity, -Infinity, and extreme numeric fuzzing in bonusCoins, points, and costs", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Habit points boundary checks
    const badPoints = [NaN, Infinity, -Infinity, -50, 1001, 1e20, "ten", {}];
    for (const pt of badPoints) {
      const resGas = gasBackend.saveHabit({ parentUserId: "u_par_demo", habitData: { title: "Bad Habit", points: pt } });
      assert.strictEqual(resGas.success, false, `GAS saveHabit should reject points=${pt}`);

      const resMock = BrowserMockBackend.saveHabit({ parentUserId: "u_par_demo", habitData: { title: "Bad Habit", points: pt } });
      assert.strictEqual(resMock.success, false, `Mock saveHabit should reject points=${pt}`);
    }

    // Reward cost boundary checks
    const badCosts = [NaN, Infinity, -Infinity, -100, "fifty", {}];
    for (const cost of badCosts) {
      const resGas = gasBackend.manageRewardItem({ parentUserId: "u_par_demo", rewardData: { title: "Bad Reward", costCoins: cost } });
      assert.strictEqual(resGas.success, false, `GAS manageRewardItem should reject cost=${cost}`);

      const resMock = BrowserMockBackend.manageRewardItem({ parentUserId: "u_par_demo", rewardData: { title: "Bad Reward", costCoins: cost } });
      assert.strictEqual(resMock.success, false, `Mock manageRewardItem should reject cost=${cost}`);
    }

    // awardParentBonus boundary checks
    const badBonuses = [NaN, Infinity, -Infinity, -25, 1001, 1e25];
    for (const bonus of badBonuses) {
      const resGas = gasBackend.awardParentBonus({ parentUserId: "u_par_demo", studentId: "u_stu_demo", coins: bonus });
      assert.strictEqual(resGas.success, false, `GAS awardParentBonus should reject coins=${bonus}`);

      const resMock = BrowserMockBackend.awardParentBonus({ parentUserId: "u_par_demo", studentId: "u_stu_demo", coins: bonus });
      assert.strictEqual(resMock.success, false, `Mock awardParentBonus should reject coins=${bonus}`);
    }
  });

  test("T5-BND-04: Formula Injection (CWE-1236) sanitization across all string inputs", () => {
    resetGasSpreadsheet();
    const formulaPayloads = [
      "=cmd|'/C calc'!A0",
      "+cmd|'/C calc'!A0",
      "-5+2+cmd|'/C calc'!A0",
      "@SUM(1,2)",
      "\t=1+1",
      "\r=cmd"
    ];

    for (const payload of formulaPayloads) {
      const sanitized = gasBackend.sanitizeSheetCellValue(payload);
      assert.ok(sanitized.startsWith("'"), `Formula payload '${payload}' must be prepended with a single quote: got '${sanitized}'`);
    }

    // Normal values must not be mangled
    assert.strictEqual(gasBackend.sanitizeSheetCellValue("Hello Zoptro"), "Hello Zoptro");
    assert.strictEqual(gasBackend.sanitizeSheetCellValue(42), 42);
    assert.strictEqual(gasBackend.sanitizeSheetCellValue(true), true);
    assert.strictEqual(gasBackend.sanitizeSheetCellValue(null), null);
  });

  test("T5-BND-05: SQL Injection and Command Injection strings fail safely in authentication", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const maliciousInputs = [
      "' OR '1'='1",
      "'; DROP TABLE Users; --",
      "\" OR \"\"=\"",
      "<script>alert('pwn')</script>",
      "admin' --",
      "\x00admin",
      "\\u0000admin"
    ];

    for (const input of maliciousInputs) {
      const resGas = gasBackend.loginUser({ identifier: input, pinOrPassword: "password123" });
      assert.strictEqual(resGas.success, false, `GAS login should reject SQLi '${input}'`);

      const resMock = BrowserMockBackend.loginUser({ identifier: input, pinOrPassword: "password123" });
      assert.strictEqual(resMock.success, false, `Mock login should reject SQLi '${input}'`);

      const pinGas = gasBackend.verifyRolePin({ userId: "u_par_demo", pin: input });
      assert.strictEqual(pinGas.verified, false, `GAS verifyRolePin should reject SQLi PIN '${input}'`);

      const pinMock = BrowserMockBackend.verifyRolePin({ userId: "u_par_demo", pin: input });
      assert.strictEqual(pinMock.verified, false, `Mock verifyRolePin should reject SQLi PIN '${input}'`);
    }
  });

  test("T5-BND-06: Extreme string length (10,000 chars) and Unicode / Emoji payloads", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const longStr = "A".repeat(10000);
    const unicodeNotes = "🚀 Space Mission: 👨‍👩‍👧‍👦 \u202E RTL Attack \u0000 NullByte Check";

    // Submit quest with long string and unicode in notes
    const resGas = gasBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1", notes: longStr + unicodeNotes });
    assert.strictEqual(resGas.success, true);
    assert.strictEqual(resGas.status, "PENDING_VERIFICATION");

    const resMock = BrowserMockBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1", notes: longStr + unicodeNotes });
    assert.strictEqual(resMock.success, true);
    assert.strictEqual(resMock.status, "PENDING_VERIFICATION");
  });

  // =========================================================================
  // PART 2: STORAGE SELF-HEALING & CORRUPTION RESILIENCE
  // =========================================================================
  console.log("\n--- PART 2: STORAGE SELF-HEALING & STRUCTURAL CORRUPTION RESILIENCE ---");

  test("T5-STO-01: Malformed JSON syntax in individual tables self-heals cleanly", () => {
    const { BrowserMockBackend, store } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Corrupt each table individually with truncated or broken JSON
    const keys = [
      BrowserMockBackend.KEYS.USERS,
      BrowserMockBackend.KEYS.HABITS,
      BrowserMockBackend.KEYS.SUBMISSIONS,
      BrowserMockBackend.KEYS.REWARDS,
      BrowserMockBackend.KEYS.REDEMPTIONS,
      BrowserMockBackend.KEYS.LOGS
    ];

    for (const key of keys) {
      store.setItem(key, "{\"truncated\": [1, 2,"); // syntax error
      assert.doesNotThrow(() => {
        BrowserMockBackend.init();
      }, `BrowserMockBackend.init() must not crash when ${key} has malformed JSON`);
    }

    // Verify system healed
    const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
    assert.ok(Array.isArray(users) && users.length >= 2, "Users table must be healed to seed state");
  });

  test("T5-STO-02: Non-array primitive types stored in tables self-heal to empty array or seed", () => {
    const { BrowserMockBackend, store } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const badPrimitives = ["42", "\"hello world\"", "true", "null", "{\"key\":\"not an array\"}"];
    for (const prim of badPrimitives) {
      store.setItem(BrowserMockBackend.KEYS.SUBMISSIONS, prim);
      const subs = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.SUBMISSIONS);
      assert.ok(Array.isArray(subs), `Table must self-heal to array when storage was '${prim}'`);
    }
  });

  test("T5-STO-03: Simultaneous total storage wipeout and massive garbage corruption", () => {
    const { BrowserMockBackend, store } = createBrowserMockEnv();
    // Put garbage in everything
    store.setItem(BrowserMockBackend.KEYS.USERS, "GARBAGE_###@@@");
    store.setItem(BrowserMockBackend.KEYS.HABITS, "<<<BAD_DATA>>>");
    store.setItem(BrowserMockBackend.KEYS.SUBMISSIONS, "{broken}");
    store.setItem(BrowserMockBackend.KEYS.REWARDS, "[null, undefined, 99999");
    store.setItem(BrowserMockBackend.KEYS.REDEMPTIONS, "NaN");
    store.setItem(BrowserMockBackend.KEYS.LOGS, "");

    BrowserMockBackend.init();

    // Verify complete operational recovery
    const habitsRes = BrowserMockBackend.getHabitsAndQuests({ userId: "u_stu_demo" });
    assert.strictEqual(habitsRes.success, true);
    assert.ok(habitsRes.habits.length >= 5);

    const rewardsRes = BrowserMockBackend.getRewardsCatalog({});
    assert.strictEqual(rewardsRes.success, true);
    assert.ok(rewardsRes.rewards.length >= 3);
  });

  test("T5-STO-04: Google Sheets Database self-heals missing sheets and corrupted headers", () => {
    // Start with completely empty spreadsheet
    mockSpreadsheet = new MockSpreadsheet();
    assert.strictEqual(mockSpreadsheet.sheets.length, 0);

    // Call initializeDatabase
    const initRes = gasBackend.initializeDatabase();
    assert.strictEqual(initRes.success, true);
    assert.strictEqual(mockSpreadsheet.sheets.length, 6);

    // Corrupt headers of Users sheet
    const usersSheet = mockSpreadsheet.getSheetByName("Users");
    usersSheet.getRange(1, 1, 1, 3).setValues([["WRONG_A", "WRONG_B", "WRONG_C"]]);

    // Re-run initializeDatabase -> should detect and repair header row
    const repairRes = gasBackend.initializeDatabase();
    assert.strictEqual(repairRes.success, true);

    const repairedHeaders = usersSheet.getDataRange().getValues()[0];
    assert.strictEqual(repairedHeaders[0], "id");
    assert.strictEqual(repairedHeaders[1], "role");
    assert.strictEqual(repairedHeaders[2], "fullName");
  });

  test("T5-STO-05: Multi-step lifecycle state survives across simulated browser refresh", () => {
    const persistentStore = new InMemStorage();
    const env1 = createBrowserMockEnv(persistentStore);
    env1.BrowserMockBackend.init(true);

    // Perform state changes in env 1
    const pSignup = env1.BrowserMockBackend.signUpParent({
      fullName: "Major Dev",
      email: "major.dev@zoptro.test",
      pin: "8888",
      password: "devpassword123"
    });
    assert.strictEqual(pSignup.success, true);
    const parentId = pSignup.user.id;
    const pairingCode = pSignup.pairingCode;

    const sSignup = env1.BrowserMockBackend.signUpStudent({
      fullName: "Cadet Maya",
      pin: "9999",
      pairingCode: pairingCode
    });
    assert.strictEqual(sSignup.success, true);
    const studentId = sSignup.user.id;

    // Simulate page reload / new browser instance using the same persistentStore
    const env2 = createBrowserMockEnv(persistentStore);
    env2.BrowserMockBackend.init(false); // DO NOT force reset!

    // Verify parent and student persist
    const loginParent = env2.BrowserMockBackend.loginUser({ identifier: "major.dev@zoptro.test", pinOrPassword: "8888", role: "parent" });
    assert.strictEqual(loginParent.success, true);
    assert.strictEqual(loginParent.user.id, parentId);

    const loginStudent = env2.BrowserMockBackend.loginUser({ identifier: "Cadet Maya", pinOrPassword: "9999", role: "student" });
    assert.strictEqual(loginStudent.success, true);
    assert.strictEqual(loginStudent.user.id, studentId);
  });

  // =========================================================================
  // PART 3: CROSS-FAMILY MULTI-TENANT ISOLATION & CONCURRENCY
  // =========================================================================
  console.log("\n--- PART 3: CROSS-FAMILY MULTI-TENANT ISOLATION & CONCURRENCY ---");

  test("T5-ISO-01: Multi-family setup and verification queue isolation in GAS Backend", () => {
    resetGasSpreadsheet();

    // Family 1: Default (u_par_demo, u_stu_demo)
    // Family 2: Parent Beta and Student Beta
    const pBeta = gasBackend.signUpParent({
      fullName: "Dr. Beta",
      email: "dr.beta@zoptro.test",
      pin: "5555",
      password: "betapassword"
    });
    assert.strictEqual(pBeta.success, true);

    const sBeta = gasBackend.signUpStudent({
      fullName: "Junior Beta",
      pin: "6666",
      pairingCode: pBeta.pairingCode
    });
    assert.strictEqual(sBeta.success, true);

    // Create a habit for Family 2
    const hBeta = gasBackend.saveHabit({
      parentUserId: pBeta.user.id,
      habitData: { title: "Beta Lab Work", points: 30 }
    });
    assert.strictEqual(hBeta.success, true);

    // Student 1 submits quest
    const sub1 = gasBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1", notes: "Family 1 quest" });
    assert.strictEqual(sub1.success, true);

    // Student 2 submits quest
    const sub2 = gasBackend.submitQuestCompletion({ studentId: sBeta.user.id, questId: hBeta.habit.id, notes: "Family 2 quest" });
    assert.strictEqual(sub2.success, true);

    // Inspect queues
    const queue1 = gasBackend.getPendingVerifications({ parentUserId: "u_par_demo" });
    assert.strictEqual(queue1.success, true);
    assert.strictEqual(queue1.pendingQuests.length, 1);
    assert.strictEqual(queue1.pendingQuests[0].studentId, "u_stu_demo");

    const queue2 = gasBackend.getPendingVerifications({ parentUserId: pBeta.user.id });
    assert.strictEqual(queue2.success, true);
    assert.strictEqual(queue2.pendingQuests.length, 1);
    assert.strictEqual(queue2.pendingQuests[0].studentId, sBeta.user.id);
  });

  test("T5-ISO-02: Cross-family mutation blockade in GAS Backend", () => {
    // Dr. Beta attempts to approve/reject Family 1's quest
    const queue1 = gasBackend.getPendingVerifications({ parentUserId: "u_par_demo" });
    const sub1Id = queue1.pendingQuests[0].id;

    // Fetch Dr. Beta id
    const users = gasBackend.getSheetRecords("Users");
    const pBeta = users.find(u => u.email === "dr.beta@zoptro.test");

    // Attack 1: Cross-family quest approval
    const crossApprove = gasBackend.approveQuestSubmission({ submissionId: sub1Id, parentUserId: pBeta.id, bonusCoins: 50 });
    assert.strictEqual(crossApprove.success, false);
    assert.ok(crossApprove.error.includes("UNAUTHORIZED") || crossApprove.error.includes("not paired"));

    // Attack 2: Cross-family quest rejection
    const crossReject = gasBackend.rejectQuestSubmission({ submissionId: sub1Id, parentUserId: pBeta.id, reason: "Hacked" });
    assert.strictEqual(crossReject.success, false);

    // Attack 3: Cross-family parent bonus
    const crossBonus = gasBackend.awardParentBonus({ parentUserId: pBeta.id, studentId: "u_stu_demo", coins: 100 });
    assert.strictEqual(crossBonus.success, false);

    // Attack 4: Cross-family security modification
    const crossSec = gasBackend.updateStudentSecurity({ parentUserId: pBeta.id, studentId: "u_stu_demo", newPin: "9999" });
    assert.strictEqual(crossSec.success, false);

    // Verify Family 1 student wallet remains unchanged
    const student1 = gasBackend.getSheetRecords("Users").find(u => u.id === "u_stu_demo");
    assert.strictEqual(Number(student1.coins), 340);
  });

  test("T5-ISO-03: Cross-family isolation and mutation blockade in BrowserMockBackend", () => {
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const pBeta = BrowserMockBackend.signUpParent({
      fullName: "Dr. Beta Mock",
      email: "dr.beta.mock@zoptro.test",
      pin: "5555",
      password: "betapassword"
    });
    const sBeta = BrowserMockBackend.signUpStudent({
      fullName: "Junior Beta Mock",
      pin: "6666",
      pairingCode: pBeta.pairingCode
    });

    const sub1 = BrowserMockBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1" });
    assert.strictEqual(sub1.success, true);

    // Dr Beta attempts mutations on Family 1 student
    assert.strictEqual(BrowserMockBackend.approveQuestSubmission({ submissionId: sub1.submissionId, parentUserId: pBeta.user.id }).success, false);
    assert.strictEqual(BrowserMockBackend.rejectQuestSubmission({ submissionId: sub1.submissionId, parentUserId: pBeta.user.id }).success, false);
    assert.strictEqual(BrowserMockBackend.awardParentBonus({ parentUserId: pBeta.user.id, studentId: "u_stu_demo", coins: 50 }).success, false);
    assert.strictEqual(BrowserMockBackend.updateStudentSecurity({ parentUserId: pBeta.user.id, studentId: "u_stu_demo", newPin: "7777" }).success, false);

    // Verification queue isolation
    const qBeta = BrowserMockBackend.getPendingVerifications({ parentUserId: pBeta.user.id });
    assert.strictEqual(qBeta.pendingQuests.length, 0);
  });

  test("T5-ISO-04: Student cannot pair using another student's pairing code or non-existent code", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // 1. Non-existent pairing code
    assert.strictEqual(gasBackend.signUpStudent({ fullName: "Intruder", pin: "1234", pairingCode: "NOCODE" }).success, false);
    assert.strictEqual(BrowserMockBackend.signUpStudent({ fullName: "Intruder", pin: "1234", pairingCode: "NOCODE" }).success, false);

    // 2. Student account pairing code attempt (student accounts have pairing codes copied from parent, but role is student)
    const badSignupGas = gasBackend.signUpStudent({ fullName: "Intruder2", pin: "1234", pairingCode: "ZOP360" });
    // ZOP360 is parent's code so it links to parent u_par_demo, not student
    assert.strictEqual(badSignupGas.success, true);
    assert.strictEqual(badSignupGas.user.linkedParentId, "u_par_demo");
  });

  // =========================================================================
  // PART 4: ECONOMIC INTEGRITY, ESCROW UNDERFLOW, DOUBLE SPENDING & RACE CONDITIONS
  // =========================================================================
  console.log("\n--- PART 4: ECONOMIC INTEGRITY, ESCROW UNDERFLOW & DOUBLE SPENDING ---");

  test("T5-ECO-01: Escrow protection and double-spending prevention on Reward Redemptions (GAS)", () => {
    resetGasSpreadsheet();
    // Default student has 340 coins. Reward rw_3 costs 200 coins.
    const studentId = "u_stu_demo";
    const rewardId = "rw_3"; // 200 coins

    // First redemption succeeds (340 -> 140 coins)
    const rdm1 = gasBackend.submitRedemptionRequest({ studentId: studentId, rewardId: rewardId });
    assert.strictEqual(rdm1.success, true);
    assert.strictEqual(rdm1.status, "PENDING_APPROVAL");
    assert.strictEqual(rdm1.remainingCoins, 140);

    // Second redemption attempt for 200 coins: MUST FAIL because 140 < 200
    const rdm2 = gasBackend.submitRedemptionRequest({ studentId: studentId, rewardId: rewardId });
    assert.strictEqual(rdm2.success, false);
    assert.strictEqual(rdm2.error, "INSUFFICIENT_COINS");

    // Verify wallet coins not decremented below 140
    const student = gasBackend.getSheetRecords("Users").find(u => u.id === studentId);
    assert.strictEqual(Number(student.coins), 140);
  });

  test("T5-ECO-02: Escrow protection and double-spending prevention on Reward Redemptions (Mock)", () => {
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const studentId = "u_stu_demo";
    const rewardId = "rw_3"; // 200 coins

    const rdm1 = BrowserMockBackend.submitRedemptionRequest({ studentId: studentId, rewardId: rewardId });
    assert.strictEqual(rdm1.success, true);
    assert.strictEqual(rdm1.remainingCoins, 140);

    const rdm2 = BrowserMockBackend.submitRedemptionRequest({ studentId: studentId, rewardId: rewardId });
    assert.strictEqual(rdm2.success, false);
    assert.strictEqual(rdm2.error, "INSUFFICIENT_COINS");

    const student = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === studentId);
    assert.strictEqual(student.coins, 140);
  });

  test("T5-ECO-03: Replay attack on Redemption Approval blocked (GAS & Mock)", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Submit redemption in GAS
    const rdmGas = gasBackend.submitRedemptionRequest({ studentId: "u_stu_demo", rewardId: "rw_2" }); // 50 coins (340 -> 290)
    assert.strictEqual(rdmGas.success, true);

    // Parent approves redemption
    const appGas1 = gasBackend.approveRedemption({ redemptionId: rdmGas.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(appGas1.success, true);

    // Replay approval attempt
    const appGas2 = gasBackend.approveRedemption({ redemptionId: rdmGas.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(appGas2.success, false);
    assert.strictEqual(appGas2.error, "REDEMPTION_ALREADY_REVIEWED");

    // Rejection of approved redemption (prevent refund exploit)
    const rejGas = gasBackend.rejectRedemption({ redemptionId: rdmGas.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(rejGas.success, false);
    assert.strictEqual(rejGas.error, "REDEMPTION_ALREADY_REVIEWED");

    // Repeat on Mock Backend
    const rdmMock = BrowserMockBackend.submitRedemptionRequest({ studentId: "u_stu_demo", rewardId: "rw_2" });
    assert.strictEqual(BrowserMockBackend.approveRedemption({ redemptionId: rdmMock.redemptionId, parentUserId: "u_par_demo" }).success, true);
    assert.strictEqual(BrowserMockBackend.approveRedemption({ redemptionId: rdmMock.redemptionId, parentUserId: "u_par_demo" }).success, false);
    assert.strictEqual(BrowserMockBackend.rejectRedemption({ redemptionId: rdmMock.redemptionId, parentUserId: "u_par_demo" }).success, false);
  });

  test("T5-ECO-04: Replay attack on Redemption Rejection blocked & infinite refund prevented", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Initial coins: 340
    const rdmGas = gasBackend.submitRedemptionRequest({ studentId: "u_stu_demo", rewardId: "rw_2" }); // 50 coins escrowed -> 290
    assert.strictEqual(rdmGas.remainingCoins, 290);

    // Parent rejects redemption -> 50 coins refunded -> balance 340
    const rejGas1 = gasBackend.rejectRedemption({ redemptionId: rdmGas.redemptionId, parentUserId: "u_par_demo", reason: "Not yet" });
    assert.strictEqual(rejGas1.success, true);
    assert.strictEqual(rejGas1.refundedCoins, 50);
    assert.strictEqual(rejGas1.newBalance, 340);

    // Replay rejection attack: calling reject again to gain another +50 coins
    const rejGas2 = gasBackend.rejectRedemption({ redemptionId: rdmGas.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(rejGas2.success, false);
    assert.strictEqual(rejGas2.error, "REDEMPTION_ALREADY_REVIEWED");

    // Verify student balance remains strictly 340 (no infinite refund loop)
    const student = gasBackend.getSheetRecords("Users").find(u => u.id === "u_stu_demo");
    assert.strictEqual(Number(student.coins), 340);

    // Repeat on Mock Backend
    const rdmMock = BrowserMockBackend.submitRedemptionRequest({ studentId: "u_stu_demo", rewardId: "rw_2" });
    const rejMock1 = BrowserMockBackend.rejectRedemption({ redemptionId: rdmMock.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(rejMock1.success, true);
    assert.strictEqual(rejMock1.newBalance, 340);

    const rejMock2 = BrowserMockBackend.rejectRedemption({ redemptionId: rdmMock.redemptionId, parentUserId: "u_par_demo" });
    assert.strictEqual(rejMock2.success, false);
    assert.strictEqual(rejMock2.error, "REDEMPTION_ALREADY_REVIEWED");

    const studentMock = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === "u_stu_demo");
    assert.strictEqual(studentMock.coins, 340);
  });

  test("T5-ECO-05: Double spending prevention on Quest Approvals (GAS & Mock)", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Student submits quest
    const subGas = gasBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1" });
    assert.strictEqual(subGas.success, true);

    // Parent approves with 10 bonus coins (points 15 + 10 = 25 coins). Student starts with 340 -> 365.
    const appGas1 = gasBackend.approveQuestSubmission({ submissionId: subGas.submissionId, parentUserId: "u_par_demo", bonusCoins: 10 });
    assert.strictEqual(appGas1.success, true);
    assert.strictEqual(appGas1.updatedWallet.coins, 365);

    // Replay approval attempt
    const appGas2 = gasBackend.approveQuestSubmission({ submissionId: subGas.submissionId, parentUserId: "u_par_demo", bonusCoins: 10 });
    assert.strictEqual(appGas2.success, false);
    assert.strictEqual(appGas2.error, "SUBMISSION_ALREADY_REVIEWED");

    // Verify student coins did NOT increment again to 390
    const stuGas = gasBackend.getSheetRecords("Users").find(u => u.id === "u_stu_demo");
    assert.strictEqual(Number(stuGas.coins), 365);

    // Rejection on approved quest must be rejected
    const rejGas = gasBackend.rejectQuestSubmission({ submissionId: subGas.submissionId, parentUserId: "u_par_demo" });
    assert.strictEqual(rejGas.success, false);
    assert.strictEqual(rejGas.error, "SUBMISSION_ALREADY_REVIEWED");

    // Repeat on Mock Backend
    const subMock = BrowserMockBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_1" });
    assert.strictEqual(BrowserMockBackend.approveQuestSubmission({ submissionId: subMock.submissionId, parentUserId: "u_par_demo", bonusCoins: 10 }).success, true);
    assert.strictEqual(BrowserMockBackend.approveQuestSubmission({ submissionId: subMock.submissionId, parentUserId: "u_par_demo", bonusCoins: 10 }).success, false);
    assert.strictEqual(BrowserMockBackend.rejectQuestSubmission({ submissionId: subMock.submissionId, parentUserId: "u_par_demo" }).success, false);
  });

  test("T5-ECO-06: Negative bonus coins and negative rewards rejected or clamped safely", () => {
    resetGasSpreadsheet();
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    const subGas = gasBackend.submitQuestCompletion({ studentId: "u_stu_demo", questId: "h_2" });
    // Attempt negative bonus coins (-500)
    const negAppGas = gasBackend.approveQuestSubmission({ submissionId: subGas.submissionId, parentUserId: "u_par_demo", bonusCoins: -500 });
    assert.strictEqual(negAppGas.success, false);
    assert.ok(negAppGas.error.includes("INVALID_BONUS_COINS"));

    // Attempt reward creation with negative cost
    const negRwGas = gasBackend.manageRewardItem({ parentUserId: "u_par_demo", rewardData: { title: "Cheat Reward", costCoins: -100 } });
    assert.strictEqual(negRwGas.success, false);

    const negRwMock = BrowserMockBackend.manageRewardItem({ parentUserId: "u_par_demo", rewardData: { title: "Cheat Reward", costCoins: -100 } });
    assert.strictEqual(negRwMock.success, false);
  });

  test("T5-ECO-07: Concurrency stress: rapid simulated race conditions on redemption requests", () => {
    const { BrowserMockBackend } = createBrowserMockEnv();
    BrowserMockBackend.init(true);

    // Set student coins to exactly 80 (enough for 1 rw_1 reward of 80 coins)
    const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
    const student = users.find(u => u.id === "u_stu_demo");
    student.coins = 80;
    BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, users);

    // Fire 20 rapid redemption requests
    const results = [];
    for (let i = 0; i < 20; i++) {
      results.push(BrowserMockBackend.submitRedemptionRequest({ studentId: "u_stu_demo", rewardId: "rw_1" }));
    }

    const successes = results.filter(r => r.success === true);
    const failures = results.filter(r => r.success === false);

    assert.strictEqual(successes.length, 1, "Exactly one redemption request must succeed");
    assert.strictEqual(failures.length, 19, "Remaining 19 redemption requests must fail with insufficient coins");
    assert.strictEqual(failures[0].error, "INSUFFICIENT_COINS");

    const finalStudent = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === "u_stu_demo");
    assert.strictEqual(finalStudent.coins, 0, "Final coin balance must be exactly 0 (no negative balance or underflow)");
  });

  // =========================================================================
  // PART 5: STRICT 90° SQUARE EDGE GEOMETRY & BRAND HARDENING
  // =========================================================================
  console.log("\n--- PART 5: STRICT 90° SQUARE EDGE GEOMETRY & BRAND HARDENING ---");

  test("T5-GEO-01: Universal scan of static HTML markup for forbidden rounded curvature classes", () => {
    // Look for any class token starting with rounded (with optional pseudo-selectors like hover:, md:, etc.)
    // Negative lookahead: rounded-none is allowed
    const roundedRegex = /(?:^|[\s'"`;`])(?:[a-zA-Z0-9_-]+:)?rounded(?!\-none\b)(?:-[a-zA-Z0-9_\[\]-]+)?(?=[\s'"`;`]|$)/g;
    const matches = [];
    let m;
    while ((m = roundedRegex.exec(htmlSource)) !== null) {
      const cls = m[0].trim().replace(/^[\s'"`;`]+|[\s'"`;`]+$/g, '');
      if (cls && cls !== 'rounded-none') {
        matches.push(cls);
      }
    }
    assert.strictEqual(matches.length, 0, `Found ${matches.length} forbidden rounded classes in static HTML: ` + JSON.stringify(matches));
  });

  test("T5-GEO-02: Universal scan of static inline styles for non-zero border-radius", () => {
    const inlineRadiusRegex = /style=["'][^"']*?border-radius\s*:\s*([^;"'>]+)[^"']*?["']/gi;
    const violations = [];
    let m;
    while ((m = inlineRadiusRegex.exec(htmlSource)) !== null) {
      const val = m[1].trim();
      if (val !== "0px" && val !== "0" && val !== "0px !important") {
        violations.push(m[0]);
      }
    }
    assert.strictEqual(violations.length, 0, `Found ${violations.length} non-zero inline border-radius: ` + JSON.stringify(violations));
  });

  test("T5-GEO-03: Global CSS rule enforcement: * { border-radius: 0px !important; } present", () => {
    assert.ok(htmlSource.includes("border-radius: 0px !important;"), "Global CSS hard override must be present");
    assert.ok(htmlSource.includes("* {"), "Universal selector must be present");
  });

  test("T5-GEO-04: Universal scan of dynamic JS template literals for rounded classes and gradients", () => {
    // Extract all template literals from client JavaScript
    const tplRegex = /`([\s\S]*?)`/g;
    let match;
    let totalTemplates = 0;
    const templateViolations = [];

    while ((match = tplRegex.exec(appScript)) !== null) {
      const content = match[1];
      if (content.includes("<") && content.includes(">")) {
        totalTemplates++;
        // Check for forbidden rounded classes using negative lookahead for rounded-none
        const roundedRegex = /(?:^|[\s'"`;`])(?:[a-zA-Z0-9_-]+:)?rounded(?!\-none\b)(?:-[a-zA-Z0-9_\[\]-]+)?(?=[\s'"`;`]|$)/g;
        let rMatch;
        while ((rMatch = roundedRegex.exec(content)) !== null) {
          const cls = rMatch[0].trim().replace(/^[\s'"`;`]+|[\s'"`;`]+$/g, '');
          if (cls && cls !== 'rounded-none') {
            templateViolations.push({ forbidden: cls, snippet: content.slice(0, 100) });
          }
        }
        // Check for cyber gradients
        if (content.includes("bg-gradient-") || content.includes("linear-gradient")) {
          templateViolations.push({ issue: "gradient", snippet: content.slice(0, 100) });
        }
        // Check for neon glows
        if (content.match(/\bglow-[a-z0-9]+\b/)) {
          templateViolations.push({ issue: "neon-glow", snippet: content.slice(0, 100) });
        }
      }
    }
    assert.ok(totalTemplates >= 15, `Expected at least 15 dynamic HTML templates, found ${totalTemplates}`);
    assert.strictEqual(templateViolations.length, 0, `Found template violations: ` + JSON.stringify(templateViolations));
  });

  test("T5-GEO-05: SVG rect curvature check (rx and ry must be 0 or absent)", () => {
    const svgRectRegex = /<rect\b[^>]*>/gi;
    let match;
    const violations = [];
    while ((match = svgRectRegex.exec(htmlSource)) !== null) {
      const tag = match[0];
      const rxMatch = tag.match(/rx=["']([^"']+)["']/i);
      const ryMatch = tag.match(/ry=["']([^"']+)["']/i);
      if (rxMatch && rxMatch[1] !== "0" && rxMatch[1] !== "0px") violations.push({ tag, rx: rxMatch[1] });
      if (ryMatch && ryMatch[1] !== "0" && ryMatch[1] !== "0px") violations.push({ tag, ry: ryMatch[1] });
    }
    assert.strictEqual(violations.length, 0, `Found curved SVG rect elements: ` + JSON.stringify(violations));
  });

  test("T5-GEO-06: Brand Typography and Color Palette Token Verification", () => {
    // 1. Google Fonts must load Outfit & Figtree
    assert.ok(htmlSource.includes("family=Outfit"), "Google Fonts link must include Outfit");
    assert.ok(htmlSource.includes("family=Figtree"), "Google Fonts link must include Figtree");

    // 2. Banned fonts (Inter, Space Grotesk) must NOT be loaded or declared in CSS font-family
    assert.ok(!htmlSource.includes("family=Inter"), "Google Fonts must not load Inter");
    assert.ok(!htmlSource.includes("Space Grotesk"), "Google Fonts must not load Space Grotesk");

    // 3. Core Brand palette tokens in Tailwind configuration
    assert.ok(htmlSource.includes("#09293D"), "Tailwind must contain Authority Blue #09293D");
    assert.ok(htmlSource.includes("#F65800"), "Tailwind must contain Progress Orange #F65800");
    assert.ok(htmlSource.includes("#666D57"), "Tailwind must contain Grounded Olive #666D57");
    assert.ok(htmlSource.includes("#F4F2EA"), "Tailwind must contain Clarity Ivory #F4F2EA");

    // 4. Tailwind borderRadius defaults overridden to 0px
    assert.ok(htmlSource.includes("none: '0px'") || htmlSource.includes("DEFAULT: '0px'"), "Tailwind borderRadius must default to 0px");
  });

  // =========================================================================
  // SUMMARY & VERDICT
  // =========================================================================
  console.log("\n=================================================================");
  console.log(`🏁 TIER 5 HARNESS COMPLETED: ${stats.passed}/${stats.total} PASSED`);
  console.log(`🚨 FAILURES DETECTED: ${stats.failed}`);
  console.log("=================================================================");

  if (stats.failed > 0) {
    console.error("\n❌ TIER 5 HARDENING VERDICT: FAIL");
    process.exit(1);
  } else {
    console.log("\n✅ TIER 5 HARDENING VERDICT: APPROVE (100% DEFENDED)");
    process.exit(0);
  }
}

runMasterTier5HardeningSuite().catch(err => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
