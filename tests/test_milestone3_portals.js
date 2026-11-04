/**
 * Zoptro Milestone 3 Comprehensive Portal & Auth Verification Suite
 * Verifies Dual-User Auth & Pairing UI, Student Focus Portal Workflows,
 * Parent HQ Workflows, and 100% Brand System Compliance.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=================================================================');
console.log('🚀 STARTING ZOPTRO MILESTONE 3 PORTALS & AUTH VERIFICATION SUITE');
console.log('=================================================================');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// -------------------------------------------------------------------
// 1. STATIC DOM INSPECTION: AUTH & PORTAL UI ELEMENTS
// -------------------------------------------------------------------
console.log('\n--- 1. AUTH & PAIRING DOM ELEMENTS ---');

function assertContains(content, searchStr, label) {
  assert.ok(content.includes(searchStr), `Missing required UI element: ${label} (${searchStr})`);
  console.log(`  ✅ PASS: ${label}`);
}

// Header & Auth Session Controls
assertContains(htmlContent, 'id="authSessionContainer"', 'Auth session container in header');
assertContains(htmlContent, 'id="authBtn"', 'Sign-in / Switch Account button');
assertContains(htmlContent, 'id="userBadge"', 'Active user badge display');
assertContains(htmlContent, 'id="userBadgeRole"', 'User role badge display');
assertContains(htmlContent, 'id="userBadgePairing"', 'User pairing code display in badge');

// Auth Modals
assertContains(htmlContent, 'id="authModal"', 'Dual-user auth modal dialog');
assertContains(htmlContent, 'id="parentPinModal"', 'Role switch PIN challenge modal');
assertContains(htmlContent, 'id="addEditHabitModal"', 'Add/Edit Habit quest modal');
assertContains(htmlContent, 'id="rejectPromptModal"', 'Verification rejection reason modal');

// Auth Form Elements
assertContains(htmlContent, 'id="signInRole"', 'Sign-in role select dropdown');
assertContains(htmlContent, 'id="signInIdentifier"', 'Sign-in identifier input');
assertContains(htmlContent, 'id="signInSecret"', 'Sign-in secret (PIN/password) input');
assertContains(htmlContent, 'id="parentSignUpName"', 'Parent registration name input');
assertContains(htmlContent, 'id="parentSignUpEmail"', 'Parent registration email input');
assertContains(htmlContent, 'id="parentSignUpPin"', 'Parent registration PIN input');
assertContains(htmlContent, 'id="parentSignUpPassword"', 'Parent registration password input');
assertContains(htmlContent, 'id="parentGeneratedCode"', 'Parent generated 6-char pairing code display');
assertContains(htmlContent, 'id="studentSignUpName"', 'Student registration name input');
assertContains(htmlContent, 'id="studentSignUpPin"', 'Student registration PIN input');
assertContains(htmlContent, 'id="studentSignUpPairingCode"', 'Student registration pairing code validation input');

// -------------------------------------------------------------------
// 2. PARENT HQ WORKFLOW DOM ELEMENTS
// -------------------------------------------------------------------
console.log('\n--- 2. PARENT HQ DOM ELEMENTS ---');

assertContains(htmlContent, 'id="verificationQueueCount"', 'Strict verification queue counter badge');
assertContains(htmlContent, 'id="pendingQuestsContainer"', 'Pending quests queue container');
assertContains(htmlContent, 'id="pendingRedemptionsContainer"', 'Pending reward redemptions container');
assertContains(htmlContent, 'id="parentHabitsCrudContainer"', 'Parent habits CRUD management container');
assertContains(htmlContent, 'id="newStudentPin"', 'Parent security control: new student PIN input');
assertContains(htmlContent, 'id="newStudentPassword"', 'Parent security control: new student password input');
assertContains(htmlContent, 'id="emailDigestStatus"', 'Weekly email digest feedback banner');
assertContains(htmlContent, 'id="analyticsApprovedQuests"', 'Analytics approved quests metric');
assertContains(htmlContent, 'id="analyticsCoinsGranted"', 'Analytics coins granted metric');
assertContains(htmlContent, 'id="analyticsRedemptions"', 'Analytics redemptions metric');
assertContains(htmlContent, 'id="analyticsStreak"', 'Analytics student streak metric');
assertContains(htmlContent, 'id="parentPairingCodeDisplay"', 'Parent HQ family pairing code display banner');

// -------------------------------------------------------------------
// 3. JAVASCRIPT FUNCTION SIGNATURES & CONTRACTS
// -------------------------------------------------------------------
console.log('\n--- 3. JAVASCRIPT WORKFLOW FUNCTIONS ---');

const requiredJsFunctions = [
  'loadAuthSession',
  'saveAuthSession',
  'clearAuthSession',
  'updateAuthUI',
  'openAuthModal',
  'closeAuthModal',
  'switchAuthTab',
  'submitSignIn',
  'submitParentSignUp',
  'submitStudentSignUp',
  'logoutUser',
  'setUserRole',
  'openParentPinPrompt',
  'closeParentPinPrompt',
  'verifyParentPinChallenge',
  'renderVerificationQueue',
  'approveQuest',
  'approveRedemption',
  'promptRejectQuest',
  'promptRejectRedemption',
  'confirmRejection',
  'closeRejectPromptModal',
  'renderParentHabitsCRUD',
  'openAddEditHabitModal',
  'closeAddEditHabitModal',
  'saveAddEditHabit',
  'archiveHabit',
  'submitStudentSecurityUpdate',
  'sendParentEmailDigest',
  'renderParentAnalytics',
  'renderParentHistory'
];

requiredJsFunctions.forEach(fn => {
  const fnRegex = new RegExp(`function\\s+${fn}\\b`);
  assert.ok(fnRegex.test(htmlContent), `Missing required JavaScript function: ${fn}`);
  console.log(`  ✅ PASS: Function ${fn}() is defined`);
});

// -------------------------------------------------------------------
// 4. BEHAVIORAL & SIMULATION TESTS IN VM ENVIRONMENT
// -------------------------------------------------------------------
console.log('\n--- 4. CLIENT VM RUNTIME & STATE SIMULATION ---');

const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

const mockLocalStorage = {};
const mockStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
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
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(tag + '_' + Math.random()),
  body: createMockElement('body'),
  addEventListener: () => {}
};

const mockWindow = {
  localStorage: mockStorage,
  innerWidth: 1200,
  innerHeight: 800,
  onload: null,
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

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: mockStorage,
  navigator: { userAgent: 'ZoptroTestRunner' },
  console: console,
  setTimeout: (fn) => fn(),
  setInterval: () => {},
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

vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

assert.ok(BrowserMockBackend, 'BrowserMockBackend must be exported or globally available');
assert.ok(ZoptroApiClient, 'ZoptroApiClient must be exported or globally available');

BrowserMockBackend.init(true);

// Test 4.1: Parent registration generates 6-char pairing code
const pReg = BrowserMockBackend.signUpParent({
  fullName: 'Commander Parent',
  email: 'parent@m3test.com',
  pin: '5566',
  password: 'Password123'
});
assert.ok(pReg.success, 'Parent registration should succeed');
assert.strictEqual(pReg.pairingCode.length, 6, 'Pairing code must be exactly 6 characters');
console.log(`  ✅ PASS: Parent registration generated 6-character pairing code: ${pReg.pairingCode}`);

// Test 4.2: Student registration links using parent's pairing code
const sReg = BrowserMockBackend.signUpStudent({
  fullName: 'Student Cadet',
  pin: '7788',
  pairingCode: pReg.pairingCode
});
assert.ok(sReg.success, 'Student registration with pairing code should succeed');
assert.strictEqual(sReg.user.linkedParentId, pReg.user.id, 'Student must be linked to parent ID');
console.log(`  ✅ PASS: Student linked to Parent ID ${pReg.user.id}`);

// Test 4.3: PIN verification for role switching
const pinCheckValid = BrowserMockBackend.verifyRolePin({
  userId: sReg.user.id,
  pin: '5566',
  targetRole: 'parent'
});
assert.strictEqual(pinCheckValid.verified, true, 'Parent PIN challenge should succeed with correct PIN');

const pinCheckInvalid = BrowserMockBackend.verifyRolePin({
  userId: sReg.user.id,
  pin: '0000',
  targetRole: 'parent'
});
assert.strictEqual(pinCheckInvalid.verified, false, 'Parent PIN challenge must fail with wrong PIN');
console.log('  ✅ PASS: Parent PIN challenge verified accurately');

// Test 4.4: Student quest completion queues submission with 0 instant coins
const initialCoins = sReg.user.coins;
const qSub = BrowserMockBackend.submitQuestCompletion({
  studentId: sReg.user.id,
  questId: 'h_1',
  notes: 'Completed morning routine'
});
assert.ok(qSub.success, 'Quest submission should succeed');
assert.strictEqual(qSub.status, 'PENDING_VERIFICATION', 'Status must be PENDING_VERIFICATION');

// Verify student coins did NOT increment automatically
const stuAfterSub = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
assert.strictEqual(stuAfterSub.coins, initialCoins, 'Student coins must NOT increment upon submission (0 instant coins)');
console.log(`  ✅ PASS: Quest queued as PENDING_VERIFICATION with 0 instant coins (balance remained ${initialCoins})`);

// Test 4.5: Parent 1-click approval with bonus coins
const qApprove = BrowserMockBackend.approveQuestSubmission({
  submissionId: qSub.submissionId,
  parentUserId: pReg.user.id,
  bonusCoins: 10
});
assert.ok(qApprove.success, 'Parent approval should succeed');
assert.strictEqual(qApprove.updatedWallet.coins, initialCoins + 25, 'Student wallet should reflect base (15) + bonus (10)');

const stuAfterApprove = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
assert.strictEqual(stuAfterApprove.coins, initialCoins + 25, 'Student wallet should reflect base + bonus coins');
console.log(`  ✅ PASS: Parent approved quest with bonus coins. Wallet credited 25 coins (balance: ${qApprove.updatedWallet.coins}).`);

// Test 4.6: Reward redemption escrow and rejection refund
const catalog = BrowserMockBackend.getRewardsCatalog();
assert.ok(catalog.rewards && catalog.rewards.length > 0, 'Rewards catalog must have active items');
const reward = catalog.rewards[0];
const rewardCost = Number(reward.costCoins);

const stuBeforeRdm = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
const coinsBeforeRdm = Number(stuBeforeRdm.coins);

const rdmSub = BrowserMockBackend.submitRedemptionRequest({
  studentId: sReg.user.id,
  rewardId: reward.id
});
assert.ok(rdmSub.success, 'Reward redemption request should succeed');
assert.strictEqual(rdmSub.status, 'PENDING_APPROVAL', 'Redemption status must be PENDING_APPROVAL');
assert.strictEqual(rdmSub.remainingCoins, coinsBeforeRdm - rewardCost, `Escrow should deduct ${rewardCost} coins immediately`);

const rdmReject = BrowserMockBackend.rejectRedemption({
  redemptionId: rdmSub.redemptionId,
  parentUserId: pReg.user.id,
  reason: 'Bedtime curfew reached'
});
assert.ok(rdmReject.success, 'Redemption rejection should succeed');
assert.strictEqual(rdmReject.refundedCoins, rewardCost, `Cost of ${rewardCost} coins must be refunded`);
assert.strictEqual(rdmReject.newBalance, coinsBeforeRdm, `Student balance must be restored to ${coinsBeforeRdm}`);
console.log(`  ✅ PASS: Reward redemption escrow deducted ${rewardCost} coins and rejection fully refunded ${rewardCost} coins`);

// Test 4.7: Habit CRUD Operations
const habitCreate = BrowserMockBackend.saveHabit({
  parentUserId: pReg.user.id,
  habit: {
    title: 'Guitar Practice 20 Mins',
    points: 20,
    xpReward: 40,
    category: 'arts',
    timeSlot: 'Evening',
    icon: '🎸'
  }
});
assert.ok(habitCreate.success, 'Habit creation should succeed');
assert.strictEqual(habitCreate.habit.title, 'Guitar Practice 20 Mins');

const habitsList = BrowserMockBackend.getHabitsAndQuests({ userId: sReg.user.id });
const foundHabit = habitsList.habits.find(h => h.id === habitCreate.habit.id);
assert.ok(foundHabit, 'Created habit should appear in active habits');

const habitArchive = BrowserMockBackend.deleteHabit({
  habitId: habitCreate.habit.id,
  parentUserId: pReg.user.id
});
assert.ok(habitArchive.success, 'Habit deletion/archival should succeed');

const habitsAfterArchive = BrowserMockBackend.getHabitsAndQuests({ userId: sReg.user.id });
const foundArchived = habitsAfterArchive.habits.find(h => h.id === habitCreate.habit.id);
assert.strictEqual(foundArchived, undefined, 'Archived habit must not appear in active student list');
console.log('  ✅ PASS: Habit CRUD: created and archived habit successfully');

// Test 4.8: Parent Security Controls
const secUpdate = BrowserMockBackend.updateStudentSecurity({
  parentUserId: pReg.user.id,
  studentId: sReg.user.id,
  newPin: '9988'
});
assert.ok(secUpdate.success, 'Parent security PIN update should succeed');

const pinTest = BrowserMockBackend.loginUser({
  identifier: sReg.user.fullName,
  secret: '9988',
  role: 'student'
});
assert.ok(pinTest.success, 'Student new PIN must authenticate successfully');
console.log('  ✅ PASS: Parent updated student PIN, verified immediately on next auth check');

// Test 4.9: Email Digest Dispatch
const digestRes = BrowserMockBackend.triggerEmailDigest({
  parentUserId: pReg.user.id
});
assert.ok(digestRes.success, 'Email digest trigger should succeed');
assert.strictEqual(digestRes.sentTo, 'parent@m3test.com');
console.log(`  ✅ PASS: Email digest dispatched to ${digestRes.sentTo}`);

// -------------------------------------------------------------------
// 5. BRAND SYSTEM AUDIT FOR NEW MILESTONE 3 CODE
// -------------------------------------------------------------------
console.log('\n--- 5. BRAND SYSTEM & 90° SQUARE GEOMETRY AUDIT ---');

// Check that no curved class names were added in the file
const curvedMatches = htmlContent.match(/\brounded-(?!none)[a-z0-9]+/g);
assert.strictEqual(curvedMatches, null, `Found non-square rounded classes: ${curvedMatches ? curvedMatches.join(', ') : ''}`);
console.log('  ✅ PASS: 0 non-square rounded-* classes (universal rounded-none compliance)');

// Check for standalone rounded
const standaloneMatches = htmlContent.match(/(['" ])rounded(['" ])/g);
assert.strictEqual(standaloneMatches, null, `Found standalone rounded: ${standaloneMatches ? standaloneMatches.join(', ') : ''}`);
console.log('  ✅ PASS: 0 standalone rounded classes');

// Check for bg-gradient
const gradientMatches = htmlContent.match(/\bbg-gradient-[a-z0-9-]+/g);
assert.strictEqual(gradientMatches, null, `Found bg-gradient classes: ${gradientMatches ? gradientMatches.join(', ') : ''}`);
console.log('  ✅ PASS: 0 bg-gradient-* classes');

// Check for glow
const glowMatches = htmlContent.match(/\bglow-[a-z0-9-]+/g);
assert.strictEqual(glowMatches, null, `Found glow-* classes: ${glowMatches ? glowMatches.join(', ') : ''}`);
console.log('  ✅ PASS: 0 glow-* classes');

console.log('=================================================================');
console.log('🎉 MILESTONE 3 PORTALS & AUTH VERIFICATION: ALL CHECKS PASSED!');
console.log('=================================================================');
