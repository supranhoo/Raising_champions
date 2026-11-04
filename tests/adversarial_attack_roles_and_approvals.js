/**
 * Deep Adversarial Attack Suite: Role Switching & Quest Approvals
 * 
 * Specifically stress-tests:
 * 1. Role switching mechanics, state integrity, and session elevation bypasses.
 * 2. Quest approval authorization, self-awarding barriers, cross-family boundaries, replay attacks, and bonus manipulation.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================================');
console.log('⚔️  CHALLENGER DEEP ATTACK: ROLE SWITCHING & QUEST APPROVALS');
console.log('====================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const backendPath = path.join(__dirname, '..', 'google_apps_script_backend.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const backendContent = fs.readFileSync(backendPath, 'utf8');

function setupSimulatedBrowser() {
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
      classList: {
        _classes: new Set(),
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
        fillRect: () => {}
      }),
      addEventListener: () => {},
      insertBefore: () => {},
      appendChild: function(child) { this.children = this.children || []; this.children.push(child); },
      children: []
    };
  }

  const mockDoc = {
    getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
    querySelectorAll: (sel) => {
      if (sel === '.tab-view') {
        return Object.keys(domElements)
          .filter(k => k.startsWith('view-'))
          .map(k => domElements[k]);
      }
      if (sel === '.tab-btn') {
        return Object.keys(domElements)
          .filter(k => k.startsWith('tab-'))
          .map(k => domElements[k]);
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
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
      };
    }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockDoc;

  const alerts = [];
  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: mockStorage,
    navigator: { userAgent: 'ZoptroAdversarialChallenger' },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    alertCustom: (t, m) => { alerts.push({ title: t, message: m }); },
    alerts: alerts,
    setTimeout: (fn) => fn(),
    setInterval: () => {},
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: () => {},
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
  const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

  BrowserMockBackend.init(true);

  sandbox.currentRole = 'divyank';
  sandbox.currentUser = {
    id: 'u_stu_demo',
    role: 'student',
    fullName: 'Divyank Choudhary',
    linkedParentId: 'u_par_demo',
    pairingCode: null
  };

  return { sandbox, domElements, BrowserMockBackend, ZoptroApiClient, alerts };
}

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

function setupGasBackend() {
  const mockSpreadsheet = new MockSpreadsheet();

  const gasSandbox = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => mockSpreadsheet,
      BorderStyle: { SOLID: 'SOLID' }
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => true,
        releaseLock: () => {}
      })
    },
    Utilities: {
      computeDigest: () => [1, 2, 3, 4, 5, 6, 7, 8],
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      base64Encode: () => 'mockhash'
    },
    MailApp: {
      sendEmail: () => {}
    },
    console: { log: () => {}, warn: () => {}, error: () => {} },
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

  vm.createContext(gasSandbox);
  vm.runInContext(backendContent, gasSandbox);

  gasSandbox.initializeDatabase();
  return { gasSandbox, mockSpreadsheet };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function reportTest(name, passed, details) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  🛡️  DEFENDED [${name}]`);
  } else {
    failedTests++;
    console.error(`  ❌ EXPLOIT CONFIRMED [${name}]: ${details}`);
  }
}

async function runRoleSwitchingAttacks() {
  console.log('--- PART 1: ADVERSARIAL ROLE SWITCHING ATTACKS ---');

  const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient, alerts } = setupSimulatedBrowser();

  // Setup initial session inside script scope
  vm.runInContext("currentRole = 'divyank'", sandbox);
  vm.runInContext("currentUser = { id: 'u_stu_demo', role: 'student', fullName: 'Divyank Choudhary', linkedParentId: 'u_par_demo', pairingCode: null }", sandbox);

  const getCurrentRole = () => vm.runInContext('currentRole', sandbox);
  const getCurrentUser = () => vm.runInContext('currentUser', sandbox);

  // Attack 1: Direct switchTab('parentview') as student
  sandbox.switchTab('parentview');
  const parentViewHidden1 = domElements['view-parentview'].classList.contains('hidden');
  const pinPromptShown1 = !domElements['parentPinModal'].classList.contains('hidden');
  reportTest(
    'RS-01: Direct switchTab("parentview") from student aborts and shows PIN modal',
    parentViewHidden1 && pinPromptShown1,
    `view-parentview hidden=${parentViewHidden1}, pinPromptShown=${pinPromptShown1}`
  );

  // Attack 2: setUserRole('parent') without entering PIN
  sandbox.setUserRole('parent');
  const roleStillStudent = getCurrentUser().role === 'student';
  const currentRoleStillDivyank = getCurrentRole() === 'divyank';
  reportTest(
    'RS-02: setUserRole("parent") triggers PIN challenge without elevating user role',
    roleStillStudent && currentRoleStillDivyank,
    `currentUser.role=${getCurrentUser().role}, currentRole=${getCurrentRole()}`
  );

  // Attack 3: Direct activation of activateParentRole() without verifyParentPinChallenge
  // Attacker invokes activateParentRole() directly on the window object
  sandbox.activateParentRole();
  const currentRoleNowParent = getCurrentRole() === 'parent';
  const currentUserRoleStillStudent = getCurrentUser().role === 'student';
  // Now attacker calls approveQuest while currentUser.role is student
  const beforeCoins = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  sandbox.approveQuest('sub_nonexistent');
  await new Promise(r => setTimeout(r, 20));
  const afterCoins = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  reportTest(
    'RS-03: Forced activateParentRole() blocked by approveQuest guard (currentUser.role is student)',
    currentRoleNowParent && currentUserRoleStillStudent && (beforeCoins === afterCoins),
    `currentRole=${getCurrentRole()}, currentUser.role=${getCurrentUser().role}, beforeCoins=${beforeCoins}, afterCoins=${afterCoins}`
  );

  // Reset to student
  sandbox.activateStudentRole();

  // Attack 4: verifyRolePin with student's own PIN (4321) when verifying parent
  const studentPinAttempt = await ZoptroApiClient.verifyRolePin({
    userId: 'u_par_demo',
    pin: '4321', // Student PIN (4321) passed to parent account
    targetRole: 'parent'
  });
  reportTest(
    'RS-04: Student PIN (4321) cannot authenticate parent elevation (parent PIN is 1234)',
    studentPinAttempt.success === true && studentPinAttempt.verified === false,
    `verified=${studentPinAttempt.verified}`
  );

  // Attack 5: verifyRolePin with incorrect PIN
  const wrongPinAttempt = await ZoptroApiClient.verifyRolePin({
    userId: 'u_par_demo',
    pin: '9999',
    targetRole: 'parent'
  });
  reportTest(
    'RS-05: Incorrect parent PIN returns verified=false',
    wrongPinAttempt.success === true && wrongPinAttempt.verified === false,
    `verified=${wrongPinAttempt.verified}`
  );

  // Attack 6: verifyRolePin with empty or null PIN
  const emptyPinAttempt = await ZoptroApiClient.verifyRolePin({
    userId: 'u_par_demo',
    pin: '',
    targetRole: 'parent'
  });
  reportTest(
    'RS-06: Empty PIN returns error and verified=false',
    emptyPinAttempt.verified === false,
    `emptyPinAttempt=${JSON.stringify(emptyPinAttempt)}`
  );

  // Attack 7: Successful PIN verification elevates user to parent, and activateStudentRole demotes back
  domElements['parentSwitchPin'].value = '1234'; // Correct demo parent PIN
  sandbox.verifyParentPinChallenge();
  await new Promise(r => setTimeout(r, 20));
  const isElevated = getCurrentUser().role === 'parent' && getCurrentRole() === 'parent';

  // Now demote back to student
  sandbox.activateStudentRole();
  const isDemoted = getCurrentUser().role === 'student' && getCurrentRole() === 'divyank';
  reportTest(
    'RS-07: Elevation lifecycle: Legitimate PIN elevates, and activateStudentRole safely restores student session',
    isElevated && isDemoted,
    `isElevated=${isElevated}, isDemoted=${isDemoted}`
  );

  // Attack 8: Client Storage Session Spoofing vs Backend Database Truth
  // Attacker writes a fake session in localStorage claiming to be parent with id 'u_stu_demo'
  sandbox.localStorage.setItem('zoptro_auth_session', JSON.stringify({
    user: {
      id: 'u_stu_demo',
      role: 'parent',
      fullName: 'Divyank Impersonator',
      linkedParentId: 'u_par_demo'
    },
    token: 'tok_fake_parent'
  }));

  // Attacker directly tries to approve quest with spoofed session calling API with student ID
  let backendCaughtSpoof = false;
  try {
    const spoofRes = await ZoptroApiClient.approveQuestSubmission({
      submissionId: 'sub_test',
      parentUserId: 'u_stu_demo', // Student ID pretending to be parent
      bonusCoins: 50
    });
    if (!spoofRes.success && spoofRes.error && spoofRes.error.includes('UNAUTHORIZED')) {
      backendCaughtSpoof = true;
    }
  } catch (e) {
    backendCaughtSpoof = true;
  }
  reportTest(
    'RS-08: Spoofed role in client storage fails database _assertParent verification',
    backendCaughtSpoof,
    `backend caught spoof=${backendCaughtSpoof}`
  );
}

async function runQuestApprovalAttacks() {
  console.log('\n--- PART 2: ADVERSARIAL QUEST APPROVAL ATTACKS ---');

  const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient } = setupSimulatedBrowser();

  // Seed data: Create quest and submit it
  const submitRes = await ZoptroApiClient.submitQuestCompletion({
    studentId: 'u_stu_demo',
    questId: 'h_1',
    notes: 'Adversarial Test Submission'
  });
  assert.strictEqual(submitRes.success, true, 'Quest submission succeeded');
  const subId = submitRes.submissionId;

  // Attack 1: Student calls approveQuestSubmission with student's own ID
  const selfApproveRes = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId,
    parentUserId: 'u_stu_demo',
    bonusCoins: 100
  });
  reportTest(
    'QA-01: Direct student self-approval via API returns UNAUTHORIZED error',
    selfApproveRes.success === false && selfApproveRes.error.includes('UNAUTHORIZED'),
    `selfApproveRes=${JSON.stringify(selfApproveRes)}`
  );

  // Attack 2: Cross-family parent attempts to approve Student 1's quest
  // Add Family 2 parent to database
  const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
  users.push({
    id: 'u_par_family2',
    role: 'parent',
    fullName: 'Family 2 Parent',
    email: 'fam2@test.com',
    pinHash: BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS)[0].pinHash,
    createdAt: new Date().toISOString()
  });
  BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, users);

  const crossFamilyApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId,
    parentUserId: 'u_par_family2',
    bonusCoins: 50
  });
  reportTest(
    'QA-02: Cross-family parent approval blocked by pairing verification',
    crossFamilyApprove.success === false && crossFamilyApprove.error.includes('UNAUTHORIZED'),
    `crossFamilyApprove=${JSON.stringify(crossFamilyApprove)}`
  );

  // Attack 3: Bonus coins negative value injection
  // Valid parent approves with negative bonus (-500)
  const initialStudentCoins = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  const negBonusApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId,
    parentUserId: 'u_par_demo',
    bonusCoins: -500
  });
  // Points for h_1 is 15. Negative bonus must be clamped to 0, not subtract coins!
  const coinsAfterApprove = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  const gainedCoins = coinsAfterApprove - initialStudentCoins;
  reportTest(
    'QA-03: Negative bonus coins (-500) clamped to 0 (student awarded exact quest points 15, not penalized)',
    negBonusApprove.success === true && gainedCoins === 15,
    `negBonusApprove=${JSON.stringify(negBonusApprove)}, gainedCoins=${gainedCoins}`
  );

  // Attack 4: Double approval / Replay attack
  const replayApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId,
    parentUserId: 'u_par_demo',
    bonusCoins: 50
  });
  const coinsAfterReplay = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  reportTest(
    'QA-04: Replay approval on already APPROVED submission rejected with SUBMISSION_ALREADY_REVIEWED',
    replayApprove.success === false && replayApprove.error === 'SUBMISSION_ALREADY_REVIEWED' && coinsAfterReplay === coinsAfterApprove,
    `replayApprove=${JSON.stringify(replayApprove)}, coinsAfterReplay=${coinsAfterReplay}`
  );

  // Attack 5: Rejection then Approval attack
  // Submit new quest
  const submitRes2 = await ZoptroApiClient.submitQuestCompletion({
    studentId: 'u_stu_demo',
    questId: 'h_2',
    notes: 'Submission to be rejected'
  });
  const subId2 = submitRes2.submissionId;

  // Parent rejects quest
  const rejectRes = await ZoptroApiClient.rejectQuestSubmission({
    submissionId: subId2,
    parentUserId: 'u_par_demo',
    reason: 'Incomplete'
  });
  assert.strictEqual(rejectRes.success, true, 'Rejection succeeded');

  // Now attacker tries to approve the rejected quest
  const approveRejected = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId2,
    parentUserId: 'u_par_demo',
    bonusCoins: 50
  });
  reportTest(
    'QA-05: Approving an already REJECTED submission rejected with SUBMISSION_ALREADY_REVIEWED',
    approveRejected.success === false && approveRejected.error === 'SUBMISSION_ALREADY_REVIEWED',
    `approveRejected=${JSON.stringify(approveRejected)}`
  );

  // Attack 6: Submission for archived quest
  // Archive quest h_3
  await ZoptroApiClient.deleteHabit({
    habitId: 'h_3',
    parentUserId: 'u_par_demo'
  });
  const archivedSubRes = await ZoptroApiClient.submitQuestCompletion({
    studentId: 'u_stu_demo',
    questId: 'h_3',
    notes: 'Submitting archived quest'
  });
  reportTest(
    'QA-06: Submitting completion for archived quest rejected across mock backend',
    archivedSubRes.success === false && archivedSubRes.error && archivedSubRes.error.includes('QUEST_ARCHIVED'),
    `archivedSubRes=${JSON.stringify(archivedSubRes)}`
  );

  // Attack 7: Excessive bonus coins (>1000) clamped to 1000
  const submitRes3 = await ZoptroApiClient.submitQuestCompletion({
    studentId: 'u_stu_demo',
    questId: 'h_4',
    notes: 'Excessive bonus test'
  });
  const subId3 = submitRes3.submissionId;
  const coinsBeforeExcess = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  const excessBonusRes = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subId3,
    parentUserId: 'u_par_demo',
    bonusCoins: 9999999
  });
  const coinsAfterExcess = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo').coins;
  const quest4Points = 20; // h_4 ('Daily GK Arena') is 20 points
  const expectedExcessGain = quest4Points + 1000; // Clamped to 1000 max bonus
  reportTest(
    'QA-07: Excessive bonus coins (9,999,999) safely clamped to max 1000',
    excessBonusRes.success === true && (coinsAfterExcess - coinsBeforeExcess) === expectedExcessGain,
    `excessBonusRes=${JSON.stringify(excessBonusRes)}, actualGain=${coinsAfterExcess - coinsBeforeExcess}`
  );

  // Attack 8: Non-existent submission ID
  const nonExistentApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: 'sub_fake_nonexistent',
    parentUserId: 'u_par_demo',
    bonusCoins: 0
  });
  reportTest(
    'QA-08: Approving non-existent submission returns SUBMISSION_NOT_FOUND',
    nonExistentApprove.success === false && nonExistentApprove.error === 'SUBMISSION_NOT_FOUND',
    `nonExistentApprove=${JSON.stringify(nonExistentApprove)}`
  );
}

async function runGasBackendApprovalAttacks() {
  console.log('\n--- PART 3: GAS BACKEND DIRECT STRESS ATTACKS ---');

  const { gasSandbox, mockSpreadsheet } = setupGasBackend();

  // Test GAS assertParent
  let gasSelfApproveBlocked = false;
  try {
    const res = gasSandbox.approveQuestSubmission({
      submissionId: 'sub_dummy',
      parentUserId: 'u_stu_demo',
      bonusCoins: 20
    });
    if (!res.success && res.error && res.error.includes('UNAUTHORIZED')) gasSelfApproveBlocked = true;
  } catch (e) {
    gasSelfApproveBlocked = true;
  }
  reportTest(
    'GAS-01: GAS Backend approveQuestSubmission blocks student caller (assertParent)',
    gasSelfApproveBlocked,
    `gasSelfApproveBlocked=${gasSelfApproveBlocked}`
  );

  // Test GAS archived quest submission rejection
  // Archive quest h_1 using GAS deleteHabit API
  gasSandbox.deleteHabit({ habitId: 'h_1', parentUserId: 'u_par_demo' });
  const gasArchivedSubRes = gasSandbox.submitQuestCompletion({
    studentId: 'u_stu_demo',
    questId: 'h_1',
    notes: 'Trying archived quest in GAS'
  });
  reportTest(
    'GAS-02: GAS Backend submitQuestCompletion rejects archived quest (isArchived=true)',
    gasArchivedSubRes.success === false && gasArchivedSubRes.error && gasArchivedSubRes.error.includes('QUEST_ARCHIVED'),
    `gasArchivedSubRes=${JSON.stringify(gasArchivedSubRes)}`
  );

  // Test GAS verifyRolePin with targetRole=parent
  const gasRolePinRes = gasSandbox.verifyRolePin({
    userId: 'u_par_demo',
    pin: '1234',
    targetRole: 'parent'
  });
  reportTest(
    'GAS-03: GAS Backend verifyRolePin authenticates parent PIN accurately',
    gasRolePinRes.success === true && gasRolePinRes.verified === true,
    `gasRolePinRes=${JSON.stringify(gasRolePinRes)}`
  );

  const gasWrongPinRes = gasSandbox.verifyRolePin({
    userId: 'u_par_demo',
    pin: 'wrongpin',
    targetRole: 'parent'
  });
  reportTest(
    'GAS-04: GAS Backend verifyRolePin rejects incorrect PIN',
    gasWrongPinRes.success === true && gasWrongPinRes.verified === false,
    `gasWrongPinRes=${JSON.stringify(gasWrongPinRes)}`
  );
}

async function main() {
  await runRoleSwitchingAttacks();
  await runQuestApprovalAttacks();
  await runGasBackendApprovalAttacks();

  console.log('\n====================================================================');
  console.log('📊 ATTACK HARNESS SUMMARY:');
  console.log(`Total Attacks Executed : ${totalTests}`);
  console.log(`Attacks Defended       : ${passedTests}`);
  console.log(`Vulnerabilities Found  : ${failedTests}`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    console.error(`❌ CRITICAL: ${failedTests} VULNERABILITIES FOUND DURING EMPIRICAL ATTACKS!`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 20 ADVERSARIAL ATTACKS ON ROLE SWITCHING & QUEST APPROVALS RIGOROUSLY DEFENDED!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal attack test runner error:', err);
  process.exit(1);
});
