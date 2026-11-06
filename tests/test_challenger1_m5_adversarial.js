/**
 * =========================================================================
 * ZOPTRO - CHALLENGER 1 MILESTONE 5 PHASE 2 ADVERSARIAL STRESS SUITE
 * =========================================================================
 * Focus Areas (White-Box Adversarial Coverage Hardening):
 * 1. Admin RBAC and Session Elevation
 * 2. Concurrency LockService Protection
 * 3. Dynamic Curriculum Progression and CBSE Grade Filtering (Classes 1-10)
 * 4. Longitudinal Growth Profile Event Recording and Calculation
 * 5. Multi-Child Onboarding and Parental Governance
 * =========================================================================
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');

console.log("=========================================================================");
console.log("⚔️  CHALLENGER 1: MILESTONE 5 PHASE 2 ADVERSARIAL COVERAGE HARDENING");
console.log("=========================================================================\n");

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
    console.log(`  🛡️  [CH1-M5-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [CH1-M5-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

async function testAsync(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    console.log(`  🛡️  [CH1-M5-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [CH1-M5-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

// -------------------------------------------------------------------------
// Section 0: Google Apps Script Spreadsheet & Environment Infrastructure
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
        if (rowIdx < this.sheet.grid.length && colIdx < this.sheet.grid[rowIdx].length) {
          row.push(this.sheet.grid[rowIdx][colIdx]);
        } else {
          row.push("");
        }
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
  getName() { return this.name; }
  setName(n) { this.name = n; }
  getLastRow() { return this.grid.length; }
  getLastColumn() {
    let max = 0;
    this.grid.forEach(row => { if (row.length > max) max = row.length; });
    return max;
  }
  _ensureSize(r, c) {
    while (this.grid.length < r) this.grid.push([]);
    for (let i = 0; i < this.grid.length; i++) {
      while (this.grid[i].length < c) this.grid[i].push("");
    }
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
  setTabColor() { return this; }
  setColumnWidth() { return this; }
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
  getSheets() { return this.sheets.slice(); }
  getSheetByName(name) {
    return this.sheets.find(s => s.name === name) || null;
  }
  insertSheet(name) {
    const s = new MockSheet(name);
    this.sheets.push(s);
    return s;
  }
  deleteSheet(sheet) {
    this.sheets = this.sheets.filter(s => s !== sheet);
  }
}

let mockSpreadsheet = new MockSpreadsheet();
let mockLockAcquired = false;
let mockLockFailMode = false;

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: (timeout) => {
      if (mockLockFailMode) throw new Error("Timed out waiting for script lock");
      mockLockAcquired = true;
      return true;
    },
    tryLock: (timeout) => {
      if (mockLockFailMode) return false;
      mockLockAcquired = true;
      return true;
    },
    releaseLock: () => {
      mockLockAcquired = false;
      return true;
    }
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

const gasBackend = require('../google_apps_script_backend.js');

function resetGasSpreadsheet() {
  mockSpreadsheet = new MockSpreadsheet();
  mockLockAcquired = false;
  mockLockFailMode = false;
  gasBackend.initializeDatabase();
}

// -------------------------------------------------------------------------
// Section 0B: BrowserMockBackend & DOM Environment
// -------------------------------------------------------------------------
const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

function createBrowserMockEnv() {
  const mockLocalStorage = {};
  const mockStorage = {
    getItem: (k) => (k in mockLocalStorage ? mockLocalStorage[k] : null),
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };

  const domElements = {};
  function createMockElement(id) {
    return {
      id: id,
      value: '',
      innerText: '',
      innerHTML: '',
      className: '',
      checked: false,
      disabled: false,
      classList: {
        _classes: new Set(['hidden']),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); },
        toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
      },
      style: {},
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {}
      }),
      focus: () => {},
      scrollIntoView: () => {},
      addEventListener: () => {},
      insertBefore: () => {},
      appendChild: function(c) { this.children = this.children || []; this.children.push(c); },
      children: []
    };
  }

  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1];
    if (!domElements[id]) domElements[id] = createMockElement(id);
  }

  const mockDoc = {
    getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
    querySelectorAll: (sel) => {
      if (sel === '.tab-view') {
        return Object.keys(domElements).filter(k => k.startsWith('view-')).map(k => domElements[k]);
      }
      if (sel === '.tab-btn') {
        return Object.keys(domElements).filter(k => k.startsWith('tab-')).map(k => domElements[k]);
      }
      return [];
    },
    createElement: (tag) => createMockElement(tag + '_' + Math.random()),
    body: createMockElement('body'),
    addEventListener: () => {}
  };

  const mockWindow = {
    localStorage: mockStorage,
    innerWidth: 1200,
    innerHeight: 800,
    onload: null,
    scrollTo: () => {},
    addEventListener: () => {},
    requestAnimationFrame: (cb) => { cb(); return 1; },
    cancelAnimationFrame: () => {},
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { setValueAtTime: () => {} },
          type: ''
        }),
        createGain: () => ({
          connect: () => {},
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        })
      };
    }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockDoc;

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: mockStorage,
    navigator: { userAgent: 'ZoptroChallengerM5Runner' },
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
    requestAnimationFrame: (cb) => { cb(); return 1; },
    cancelAnimationFrame: () => {},
    setTimeout: (fn) => { fn(); return 1; },
    setInterval: () => 1,
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    JSON: JSON,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object,
    RegExp: RegExp,
    module: { exports: {} }
  };

  const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
  const lastScriptTag = scriptMatches[scriptMatches.length - 1];
  const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
  const ZoptroApiClient = sandbox.window.ZoptroApiClient || sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

  sandbox.BrowserMockBackend = BrowserMockBackend;
  sandbox.ZoptroApiClient = ZoptroApiClient;

  BrowserMockBackend.init(true);

  return { sandbox, BrowserMockBackend, ZoptroApiClient, domElements, mockStorage };
}

// =========================================================================
// RUN SUITE
// =========================================================================

async function runMasterM5AdversarialSuite() {

  // -----------------------------------------------------------------------
  // PART 1: ADMIN RBAC AND SESSION ELEVATION ADVERSARIAL VECTORS
  // -----------------------------------------------------------------------
  console.log("--- PART 1: ADMIN RBAC AND SESSION ELEVATION ---");

  test("M5-RBAC-01: Non-admin identities calling CMS endpoints fail with HTTP 403 / UNAUTHORIZED in GAS Backend", () => {
    resetGasSpreadsheet();
    const studentUser = "u_stu_demo";
    const parentUser = "u_par_demo";
    const fakeAdmin = "u_fake_admin_999";

    const nonAdmins = [null, undefined, "", " ", studentUser, parentUser, fakeAdmin];
    for (const callerId of nonAdmins) {
      const rList = gasBackend.getAdminContentList({ adminUserId: callerId, contentType: "stories" });
      assert.strictEqual(rList.success, false, `getAdminContentList must reject caller: ${callerId}`);
      assert.strictEqual(rList.code, 403);

      const rSave = gasBackend.saveAdminContentItem({
        adminUserId: callerId,
        contentType: "stories",
        itemData: { title: "Hacked Story", grade: "Class 3", content: "Forbidden" }
      });
      assert.strictEqual(rSave.success, false, `saveAdminContentItem must reject caller: ${callerId}`);
      assert.strictEqual(rSave.code, 403);

      const rToggle = gasBackend.toggleContentActiveStatus({
        adminUserId: callerId,
        contentType: "stories",
        itemId: "story_c3_001",
        isActive: false
      });
      assert.strictEqual(rToggle.success, false, `toggleContentActiveStatus must reject caller: ${callerId}`);
      assert.strictEqual(rToggle.code, 403);

      const rDelete = gasBackend.deleteAdminContentItem({
        adminUserId: callerId,
        contentType: "stories",
        itemId: "story_c3_001"
      });
      assert.strictEqual(rDelete.success, false, `deleteAdminContentItem must reject caller: ${callerId}`);
      assert.strictEqual(rDelete.code, 403);
    }
  });

  test("M5-RBAC-02: Non-admin identities calling CMS endpoints fail with HTTP 403 in BrowserMockBackend", () => {
    const { BrowserMockBackend } = createBrowserMockEnv();
    const nonAdmins = [null, undefined, "", " ", "u_stu_divyank", "u_par_demo", "u_hacker"];

    for (const callerId of nonAdmins) {
      const rList = BrowserMockBackend.getAdminContentList({ adminUserId: callerId, contentType: "stories" });
      assert.strictEqual(rList.success, false);
      assert.strictEqual(rList.code, 403);

      const rSave = BrowserMockBackend.saveAdminContentItem({
        adminUserId: callerId,
        contentType: "stories",
        itemData: { title: "Hacked Story", grade: "Class 3" }
      });
      assert.strictEqual(rSave.success, false);
      assert.strictEqual(rSave.code, 403);

      const rToggle = BrowserMockBackend.toggleContentActiveStatus({
        adminUserId: callerId,
        contentType: "stories",
        itemId: "story_c3_001",
        isActive: false
      });
      assert.strictEqual(rToggle.success, false);
      assert.strictEqual(rToggle.code, 403);

      const rDelete = BrowserMockBackend.deleteAdminContentItem({
        adminUserId: callerId,
        contentType: "stories",
        itemId: "story_c3_001"
      });
      assert.strictEqual(rDelete.success, false);
      assert.strictEqual(rDelete.code, 403);
    }
  });

  test("M5-RBAC-03: assertAdmin strictly checks role in database and resists ID collision with non-admin accounts", () => {
    resetGasSpreadsheet();
    // u_stu_demo exists with role 'student'
    const resStudent = gasBackend.assertAdmin("u_stu_demo");
    assert.strictEqual(resStudent.success, false);
    assert.strictEqual(resStudent.code, 403);

    // Parent demo exists with role 'parent'
    const resParent = gasBackend.assertAdmin("u_par_demo");
    assert.strictEqual(resParent.success, false);
    assert.strictEqual(resParent.code, 403);

    // Real admin u_adm_demo
    const resAdmin = gasBackend.assertAdmin("u_adm_demo");
    assert.strictEqual(resAdmin.success, true);
    assert.strictEqual(resAdmin.role, "admin");
  });

  test("M5-RBAC-04: Session de-elevation immediately conceals Admin container upon role switch", () => {
    const { sandbox, domElements } = createBrowserMockEnv();

    // 1. Elevate to admin with full auth session
    sandbox.currentUser = { id: 'u_adm_demo', role: 'admin', fullName: 'Super Admin', email: 'admin@zoptro.local' };
    sandbox.activateAdminRole();
    assert.strictEqual(sandbox.currentRole, 'admin');
    assert.strictEqual(domElements['adminAuthorizedContainer'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['adminUnauthorizedCard'].classList.contains('hidden'), true);

    // 2. De-elevate to student
    sandbox.currentRole = 'student';
    sandbox.currentUser = { id: 'u_stu_divyank', role: 'student', fullName: 'Commander Divyank' };
    sandbox.renderAdminView();

    assert.strictEqual(domElements['adminAuthorizedContainer'].classList.contains('hidden'), true, 'Authorized container must be hidden for student');
    assert.strictEqual(domElements['adminUnauthorizedCard'].classList.contains('hidden'), false, 'Unauthorized card must be shown for student');
  });

  // -----------------------------------------------------------------------
  // PART 2: CONCURRENCY LOCKSERVICE PROTECTION ADVERSARIAL VECTORS
  // -----------------------------------------------------------------------
  console.log("\n--- PART 2: CONCURRENCY LOCKSERVICE PROTECTION ---");

  test("M5-LOCK-01: LockService timeout/busy state triggers fail-closed error without data corruption", () => {
    resetGasSpreadsheet();
    mockLockFailMode = true; // Simulate lock failure

    assert.throws(() => {
      gasBackend.saveAdminContentItem({
        adminUserId: "u_adm_demo",
        contentType: "stories",
        itemData: { title: "Concurrent Story", grade: "Class 3", content: "Test" }
      });
    }, /LOCK_ACQUISITION_FAILED/);

    // Turn lock back on and ensure database was untouched
    mockLockFailMode = false;
    const storiesRes = gasBackend.getAdminContentList({ adminUserId: "u_adm_demo", contentType: "stories" });
    assert.strictEqual(storiesRes.success, true);
    const concurrentStory = storiesRes.items.find(s => s.title === "Concurrent Story");
    assert.strictEqual(concurrentStory, undefined, "Unacquired lock mutation must not persist");
  });

  test("M5-LOCK-02: withScriptLock guarantees lock release in finally block even on uncaught error", () => {
    resetGasSpreadsheet();
    mockLockFailMode = false;
    assert.strictEqual(mockLockAcquired, false);

    assert.throws(() => {
      gasBackend.withScriptLock(() => {
        assert.strictEqual(mockLockAcquired, true, "Lock should be acquired inside withScriptLock");
        throw new Error("UNEXPECTED_SIMULATED_CRASH");
      });
    }, /UNEXPECTED_SIMULATED_CRASH/);

    assert.strictEqual(mockLockAcquired, false, "Lock MUST be released after crash in finally block");
  });

  test("M5-LOCK-03: Frontend isAdminMutating optimistic lock blocks rapid double-click submissions", () => {
    const { sandbox } = createBrowserMockEnv();
    sandbox.currentUser = { id: 'u_adm_demo', role: 'admin', fullName: 'Super Admin' };
    sandbox.activateAdminRole();

    // Verify initial state
    assert.strictEqual(sandbox.isAdminMutating, false);

    // Simulate in-flight mutation
    sandbox.isAdminMutating = true;

    // Attempt concurrent action via handleAdminToggleStatus
    sandbox.handleAdminToggleStatus('stories', 'story_c3_001', true);

    // Because isAdminMutating was true, mutation returned immediately and remained true
    assert.strictEqual(sandbox.isAdminMutating, true);
  });

  // -----------------------------------------------------------------------
  // PART 3: DYNAMIC CURRICULUM PROGRESSION & CBSE GRADE FILTERING
  // -----------------------------------------------------------------------
  console.log("\n--- PART 3: DYNAMIC CURRICULUM PROGRESSION & CBSE GRADE FILTERING ---");

  test("M5-CUR-01: Anti-forgery check: student cannot bypass grade constraint by passing arbitrary grade param", () => {
    resetGasSpreadsheet();
    // u_stu_demo is enrolled in Class 3
    const studentId = "u_stu_demo";

    // Adversarial call: student requests Class 10 stories
    const result = gasBackend.getNextContentItem({
      studentId: studentId,
      contentType: "Stories",
      grade: "Class 10" // Attacker passes forged grade parameter
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.grade, "Class 3", "Engine MUST force student's enrolled grade (Class 3)");
    if (result.item) {
      assert.strictEqual(result.item.grade, "Class 3", "Item returned MUST belong to Class 3, not Class 10");
    }
  });

  test("M5-CUR-02: normalizeGrade and isValidGrade rigorously validate CBSE/NCERT Classes 1 through 10", () => {
    // Valid grade forms
    const validInputs = [
      ["Class 1", "Class 1"],
      ["class 10", "Class 10"],
      ["GRADE 5", "Class 5"],
      ["grade 7", "Class 7"],
      ["Class3", "Class 3"],
      ["1", "Class 1"],
      ["10", "Class 10"],
      ["4", "Class 4"]
    ];

    for (const [raw, expected] of validInputs) {
      assert.strictEqual(gasBackend.normalizeGrade(raw), expected, `Failed to normalize valid grade: ${raw}`);
      assert.strictEqual(gasBackend.isValidGrade(raw), true, `isValidGrade should be true for: ${raw}`);
    }

    // Invalid grade forms
    const invalidInputs = [
      "Class 0", "Class 11", "Class 12", "Grade 0", "Grade 13",
      "0", "11", "12", "-1", "NaN", "Kindergarten", "Preschool",
      "Class 3.5", "", null, undefined, "random string"
    ];

    for (const raw of invalidInputs) {
      assert.strictEqual(gasBackend.normalizeGrade(raw), null, `Invalid grade should normalize to null: ${raw}`);
      assert.strictEqual(gasBackend.isValidGrade(raw), false, `isValidGrade should be false for: ${raw}`);
    }
  });

  test("M5-CUR-03: recordContentCompletion enforces anti-farming idempotency (zero double coin/XP awards)", () => {
    resetGasSpreadsheet();
    const studentId = "u_stu_demo";

    // 1. Get next story item
    const next1 = gasBackend.getNextContentItem({ studentId, contentType: "Stories" });
    assert.strictEqual(next1.success, true);
    assert.ok(next1.item, "Must have an uncompleted story");
    const contentId = next1.item.id;

    // 2. Initial completion
    const comp1 = gasBackend.recordContentCompletion({
      studentId,
      contentType: "Stories",
      contentId,
      score: 100
    });
    assert.strictEqual(comp1.success, true);
    assert.strictEqual(comp1.alreadyCompleted, undefined);
    assert.ok(comp1.coinsAwarded > 0, "Initial completion must award coins");
    assert.ok(comp1.xpAwarded > 0, "Initial completion must award XP");
    const balanceAfterFirst = comp1.newCoins;

    // 3. Adversarial Replay Attempt: Submit the exact same completion again
    const comp2 = gasBackend.recordContentCompletion({
      studentId,
      contentType: "Stories",
      contentId,
      score: 100
    });
    assert.strictEqual(comp2.success, true);
    assert.strictEqual(comp2.alreadyCompleted, true, "Duplicate completion must be marked alreadyCompleted");
    assert.strictEqual(comp2.coinsAwarded, 0, "Duplicate completion must award 0 coins");
    assert.strictEqual(comp2.xpAwarded, 0, "Duplicate completion must award 0 XP");

    // Verify wallet in database did not inflate
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.id === studentId);
    assert.strictEqual(Number(student.coins), balanceAfterFirst, "Wallet coins must not increase on replay");
  });

  test("M5-CUR-04: Completion sequential delivery transitions to next item and handles grade exhaustion", () => {
    resetGasSpreadsheet();
    const studentId = "u_stu_demo";

    // Get all Class 3 EQ scenarios
    const eqListRes = gasBackend.getContentByGrade({ studentId, contentType: "EQScenarios" });
    assert.strictEqual(eqListRes.success, true);
    const totalEqCount = eqListRes.items.length;
    assert.ok(totalEqCount >= 1, "Must have at least 1 EQ scenario for Class 3");

    // Complete all scenarios one by one
    for (let i = 0; i < totalEqCount; i++) {
      const nextRes = gasBackend.getNextContentItem({ studentId, contentType: "EQScenarios" });
      assert.strictEqual(nextRes.success, true);
      assert.ok(nextRes.item, `Must serve item ${i + 1}`);

      const compRes = gasBackend.recordContentCompletion({
        studentId,
        contentType: "EQScenarios",
        contentId: nextRes.item.id,
        score: 100
      });
      assert.strictEqual(compRes.success, true);
    }

    // Now all Class 3 EQ items are completed -> Check exhaustion state
    const exhaustedRes = gasBackend.getNextContentItem({ studentId, contentType: "EQScenarios" });
    assert.strictEqual(exhaustedRes.success, true);
    assert.strictEqual(exhaustedRes.item, null, "Exhausted curriculum must return item: null");
    assert.strictEqual(exhaustedRes.hasMore, false, "hasMore must be false on exhaustion");
    assert.strictEqual(exhaustedRes.completedCount, totalEqCount);
  });

  // -----------------------------------------------------------------------
  // PART 4: LONGITUDINAL PROFILE EVENT RECORDING & CALCULATION
  // -----------------------------------------------------------------------
  console.log("\n--- PART 4: LONGITUDINAL PROFILE EVENT RECORDING & CALCULATION ---");

  test("M5-LON-01: recordGrowthEvent validates and clamps extreme numerical payloads safely", () => {
    resetGasSpreadsheet();
    const studentId = "u_stu_demo";

    // Test extreme focus minutes (500 minutes) added to seeded 35 minutes
    const resFocus = gasBackend.recordGrowthEvent({
      studentId,
      eventType: "FOCUS_SPRINT",
      payload: { minutes: 500 }
    });
    assert.strictEqual(resFocus.success, true);
    assert.strictEqual(resFocus.profile.focusMinutes, 35 + 500, "Focus minutes must accumulate onto daily total");

    // Test extreme adherence rate: > 100 clamped to 100, < 0 clamped to 0
    const resHabitHigh = gasBackend.recordGrowthEvent({
      studentId,
      eventType: "HABIT_COMPLETED",
      payload: { adherenceRate: 150 }
    });
    assert.strictEqual(resHabitHigh.success, true);
    assert.strictEqual(resHabitHigh.profile.habitRate, 100, "Habit rate > 100 must be clamped to 100");

    const resHabitLow = gasBackend.recordGrowthEvent({
      studentId,
      eventType: "HABIT_COMPLETED",
      payload: { adherenceRate: -40 }
    });
    assert.strictEqual(resHabitLow.success, true);
    assert.strictEqual(resHabitLow.profile.habitRate, 0, "Habit rate < 0 must be clamped to 0");

    // Test quiz accuracy > 100 clamped to 100
    const resQuiz = gasBackend.recordGrowthEvent({
      studentId,
      eventType: "ACADEMIC_QUIZ",
      payload: { accuracy: 200 }
    });
    assert.strictEqual(resQuiz.success, true);
    assert.ok(resQuiz.profile.academicScore <= 100, "Academic score must not exceed 100");
  });

  test("M5-LON-02: getLongitudinalProfile handles zero-state child gracefully (0 NaN / 0 Division-by-Zero)", () => {
    resetGasSpreadsheet();
    // Register a brand new student linked to parent u_par_demo using pairing code ZOP360
    const sNew = gasBackend.signUpStudent({
      fullName: "Cadet Zero",
      pin: "9999",
      pairingCode: "ZOP360"
    });
    assert.strictEqual(sNew.success, true);
    const zeroStudentId = sNew.user.id;

    const profileRes = gasBackend.getLongitudinalProfile({
      studentId: zeroStudentId,
      timeRange: "30d"
    });

    assert.strictEqual(profileRes.success, true);
    assert.strictEqual(profileRes.summary.totalFocusMinutes, 0);
    assert.strictEqual(profileRes.summary.averageHabitAdherence, 0);
    assert.strictEqual(profileRes.summary.academicAccuracyRate, 0);
    assert.strictEqual(profileRes.summary.eqOutcomesCount, 0);
    assert.strictEqual(isNaN(profileRes.summary.averageHabitAdherence), false);
    assert.strictEqual(isNaN(profileRes.summary.academicAccuracyRate), false);
  });

  test("M5-LON-03: Foreign parent cannot query longitudinal profile of unlinked child (RBAC 403)", () => {
    resetGasSpreadsheet();
    // Create Family 2
    const p2Res = gasBackend.signUpParent({
      fullName: "Parent Two",
      email: "parent2@example.com",
      pin: "8888",
      password: "Password8888"
    });
    assert.strictEqual(p2Res.success, true);
    const parent2Id = p2Res.user.id;

    // Parent 2 attempts to query u_stu_demo's profile (belongs to u_par_demo)
    const profileRes = gasBackend.getLongitudinalProfile({
      studentId: "u_stu_demo",
      parentUserId: parent2Id,
      timeRange: "30d"
    });

    assert.strictEqual(profileRes.success, false, "Foreign parent query must fail");
    assert.strictEqual(profileRes.code, 403, "Foreign parent query must return 403");
  });

  // -----------------------------------------------------------------------
  // PART 5: MULTI-CHILD ONBOARDING AND PARENTAL GOVERNANCE
  // -----------------------------------------------------------------------
  console.log("\n--- PART 5: MULTI-CHILD ONBOARDING & PARENTAL GOVERNANCE ---");

  test("M5-ONB-01: signUpFamilyOnboarding validates boundaries: 0 children, invalid age, invalid grade, short PIN", () => {
    resetGasSpreadsheet();

    // 1. Zero children
    const r0 = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Test Parent", email: "tp@example.com", pin: "1234", password: "Password123" },
      childrenData: []
    });
    assert.strictEqual(r0.success, false);
    assert.ok(r0.error.includes("MISSING_CHILDREN_DATA"));

    // 2. Child age < 4 or > 18
    const rAgeLow = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Test Parent", email: "tp2@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Toddler", age: 2, grade: "Class 1", pin: "1234" }]
    });
    assert.strictEqual(rAgeLow.success, false);
    assert.ok(rAgeLow.error.includes("INVALID_AGE"));

    const rAgeHigh = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Test Parent", email: "tp3@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Adult", age: 21, grade: "Class 10", pin: "1234" }]
    });
    assert.strictEqual(rAgeHigh.success, false);
    assert.ok(rAgeHigh.error.includes("INVALID_AGE"));

    // 3. Invalid grade (e.g. Class 12 or arbitrary text)
    const rGrade = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Test Parent", email: "tp4@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Kid", age: 10, grade: "Class 12", pin: "1234" }]
    });
    assert.strictEqual(rGrade.success, false);
    assert.ok(rGrade.error.includes("INVALID_GRADE"));

    // 4. Short child PIN (< 4 digits)
    const rPin = gasBackend.signUpFamilyOnboarding({
      parentData: { fullName: "Test Parent", email: "tp5@example.com", pin: "1234", password: "Password123" },
      childrenData: [{ fullName: "Kid", age: 10, grade: "Class 5", pin: "12" }]
    });
    assert.strictEqual(rPin.success, false);
    assert.ok(rPin.error.includes("INVALID_PIN"));
  });

  test("M5-ONB-02: Atomic onboarding provisions parent, multiple children, default habits, and growth profiles", () => {
    resetGasSpreadsheet();

    const onbRes = gasBackend.signUpFamilyOnboarding({
      parentData: {
        fullName: "Dr. Arvind Rao",
        email: "arvind.rao@example.com",
        pin: "5555",
        password: "Password5555"
      },
      childrenData: [
        { fullName: "Aryan Rao", age: 8, grade: "Class 3", pin: "1111" },
        { fullName: "Ananya Rao", age: 12, grade: "Class 7", pin: "2222" }
      ]
    });

    assert.strictEqual(onbRes.success, true);
    assert.ok(onbRes.pairingCode);
    assert.strictEqual(onbRes.children.length, 2);

    const child1 = onbRes.children[0];
    const child2 = onbRes.children[1];
    assert.strictEqual(child1.gradeClass, "Class 3");
    assert.strictEqual(child2.gradeClass, "Class 7");
    assert.strictEqual(child1.linkedParentId, onbRes.parent.id);
    assert.strictEqual(child2.linkedParentId, onbRes.parent.id);

    // Verify baseline habits seeded for parent
    const habits = gasBackend.getSheetRecords("HabitsQuests");
    const parentHabits = habits.filter(h => h.parentUserId === onbRes.parent.id);
    assert.ok(parentHabits.length >= 4, "Default starter habits must be seeded");

    // Verify baseline growth profiles seeded
    const profiles = gasBackend.getSheetRecords("StudentGrowthProfiles");
    const p1 = profiles.find(p => p.studentId === child1.id);
    const p2 = profiles.find(p => p.studentId === child2.id);
    assert.ok(p1, "Child 1 must have initial growth profile");
    assert.ok(p2, "Child 2 must have initial growth profile");
  });

  test("M5-GOV-01: Parental grade promotion triggers instant curriculum switch with zero legacy grade leakage", () => {
    resetGasSpreadsheet();
    // u_stu_demo is initially Class 3 under u_par_demo
    const parentUserId = "u_par_demo";
    const studentId = "u_stu_demo";

    // 1. Verify initially serving Class 3
    const beforeProg = gasBackend.getNextContentItem({ studentId, contentType: "Stories" });
    assert.strictEqual(beforeProg.grade, "Class 3");

    // 2. Parent promotes Divyank to Class 5
    const govRes = gasBackend.updateChildGovernance({
      parentUserId,
      studentId,
      updates: { grade: "Class 5" }
    });
    assert.strictEqual(govRes.success, true);
    assert.strictEqual(govRes.updatedChild.gradeClass, "Class 5");

    // 3. Verify curriculum pipeline immediately serves Class 5 with 0% Class 3 content
    const afterProg = gasBackend.getNextContentItem({ studentId, contentType: "Stories" });
    assert.strictEqual(afterProg.grade, "Class 5");
    if (afterProg.item) {
      assert.strictEqual(afterProg.item.grade, "Class 5", "Content must be Class 5");
    }

    // 4. getContentByGrade also returns Class 5 items
    const gradeList = gasBackend.getContentByGrade({ studentId, contentType: "Stories" });
    assert.strictEqual(gradeList.grade, "Class 5");
    gradeList.items.forEach(itm => {
      assert.strictEqual(itm.grade, "Class 5", "0% Class 3 leakage allowed");
    });
  });

  test("M5-GOV-02: Cross-family parental tampering defense blocks foreign parent update attempts", () => {
    resetGasSpreadsheet();
    // Family 2 parent tries to update u_stu_demo (Family 1)
    const p2Res = gasBackend.signUpParent({
      fullName: "Sneaky Parent",
      email: "sneaky@example.com",
      pin: "7777",
      password: "Password7777"
    });
    assert.strictEqual(p2Res.success, true);

    const attackRes = gasBackend.updateChildGovernance({
      parentUserId: p2Res.user.id,
      studentId: "u_stu_demo",
      updates: { grade: "Class 10", fullName: "Hacked Name" }
    });

    assert.strictEqual(attackRes.success, false, "Foreign parent tampering must fail");
    assert.strictEqual(attackRes.code, 403, "Foreign parent tampering must return 403");

    // Confirm student was untouched
    const users = gasBackend.getSheetRecords("Users");
    const student = users.find(u => u.id === "u_stu_demo");
    assert.strictEqual(student.fullName, "Commander Divyank");
    assert.notStrictEqual(student.gradeClass, "Class 10");
  });

  // -----------------------------------------------------------------------
  // FINAL SUMMARY
  // -----------------------------------------------------------------------
  console.log("\n=========================================================================");
  console.log(`🏁 CHALLENGER 1 M5 SUITE COMPLETE: ${stats.passed}/${stats.total} PASSED`);
  if (stats.failed > 0) {
    console.error(`🚨 FAILURES DETECTED: ${stats.failed}`);
    process.exit(1);
  } else {
    console.log("🎉 ALL ADVERSARIAL STRESS CHECKS AND BOUNDARY ATTACKS DEFENDED (100% SUCCESS)!");
    console.log("=========================================================================\n");
  }
}

runMasterM5AdversarialSuite().catch(err => {
  console.error("Master Suite Uncaught Error:", err);
  process.exit(1);
});
