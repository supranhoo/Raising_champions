/**
 * Zoptro Milestone 3 Adversarial Challenge & Attack Suite
 * 
 * Tests empirical defense against:
 * 1. Unauthenticated role switching & UI navigation bypass
 * 2. Quest self-awarding & instant coin earning
 * 3. Reward redemption double-spending & escrow manipulation
 * 4. Habit points manipulation & unauthorized parent actions
 * 5. Brand expression system geometric & visual integrity
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================================');
console.log('⚔️  RUNNING ADVERSARIAL CHALLENGE SUITE: MILESTONE 3 PORTALS & AUTH');
console.log('====================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const backendPath = path.join(__dirname, '..', 'google_apps_script_backend.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const backendContent = fs.readFileSync(backendPath, 'utf8');

// Helper to instantiate simulated browser environment
function createSandboxEnvironment() {
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

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: mockStorage,
    navigator: { userAgent: 'ZoptroAdversarialRunner' },
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

  const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
  const lastScriptTag = scriptMatches[scriptMatches.length - 1];
  const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
  const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

  BrowserMockBackend.init(true);

  return {
    sandbox,
    domElements,
    mockStorage,
    BrowserMockBackend,
    ZoptroApiClient
  };
}

let passedChallenges = 0;
let totalChallenges = 0;
const findings = [];

function recordResult(category, testName, passed, details) {
  totalChallenges++;
  if (passed) {
    passedChallenges++;
    console.log(`  🛡️  DEFENDED [${category}]: ${testName}`);
  } else {
    console.log(`  ❌ VULNERABILITY [${category}]: ${testName}`);
    findings.push({ category, testName, details });
  }
}

// ====================================================================
// VECTOR 1: UNAUTHENTICATED ROLE SWITCHING & ACCESS CONTROL
// ====================================================================
console.log('\n--- VECTOR 1: UNAUTHENTICATED ROLE SWITCHING & ACCESS CONTROL ---');

async function testVector1() {
  const env = createSandboxEnvironment();
  const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient } = env;

  // 1.1: setUserRole('parent') without authenticated parent session triggers PIN modal
  sandbox.currentRole = 'divyank';
  sandbox.currentUser = { id: 'u_stu_divyank', role: 'student', linkedParentId: 'u_par_demo' };
  sandbox.setUserRole('parent');

  const modalOpen = !domElements['parentPinModal'].classList.contains('hidden');
  const roleRemainsStudent = sandbox.currentRole === 'divyank';
  recordResult('V1.1', 'Role switch to parent triggers PIN challenge modal without elevation',
    modalOpen && roleRemainsStudent,
    `modalOpen: ${modalOpen}, currentRole: ${sandbox.currentRole}`
  );

  // 1.2: Incorrect PIN submission fails challenge
  domElements['parentSwitchPin'].value = '0000'; // Wrong PIN
  sandbox.verifyParentPinChallenge();
  // Wait microtask for promise resolution
  await new Promise(r => setTimeout(r, 10));
  const pinDenied = domElements['parentSwitchPinError'] &&
    !domElements['parentSwitchPinError'].classList.contains('hidden') &&
    domElements['parentSwitchPinError'].innerText.includes('Incorrect');
  const stillStudent = sandbox.currentRole === 'divyank';
  recordResult('V1.2', 'Incorrect parent PIN rejects elevation and displays access denied',
    pinDenied && stillStudent,
    `pinDenied: ${pinDenied}, currentRole: ${sandbox.currentRole}`
  );

  // 1.3: Empty or whitespace PIN submission rejected
  domElements['parentSwitchPin'].value = '   ';
  sandbox.verifyParentPinChallenge();
  const emptyRejected = domElements['parentSwitchPinError'] &&
    !domElements['parentSwitchPinError'].classList.contains('hidden') &&
    domElements['parentSwitchPinError'].innerText.includes('required');
  recordResult('V1.3', 'Empty or whitespace PIN challenge is rejected',
    emptyRejected,
    `emptyRejected: ${emptyRejected}`
  );

  // 1.4: SQL injection / malicious payload in PIN verification
  const sqlPinRes = await ZoptroApiClient.verifyRolePin({
    userId: 'u_par_demo',
    pin: "' OR '1'='1",
    targetRole: 'parent'
  });
  recordResult('V1.4', 'SQL injection payload in PIN fails authentication',
    sqlPinRes && sqlPinRes.verified === false,
    `result: ${JSON.stringify(sqlPinRes)}`
  );

  // 1.5: Navbar direct tab-parentview bypass test
  // If user clicks the tab button <button onclick="switchTab('parentview')" id="tab-parentview">
  sandbox.currentRole = 'divyank';
  sandbox.currentUser = { id: 'u_stu_divyank', role: 'student', linkedParentId: 'u_par_demo' };
  sandbox.switchTab('parentview');
  
  // Note: Does switchTab enforce role check or does it let unauthenticated student open view-parentview?
  const parentViewUnhidden = !domElements['view-parentview'].classList.contains('hidden');
  // An unauthenticated student should NOT be able to open parent view directly via switchTab
  // In a hardened app, switchTab('parentview') should verify role or redirect to PIN modal!
  recordResult('V1.5', 'Direct tab switch to parentview should require parent role/PIN',
    !parentViewUnhidden || sandbox.currentRole === 'parent',
    `view-parentview was made visible to student without PIN challenge (parentViewUnhidden: ${parentViewUnhidden})`
  );

  // 1.6: Spoofed localStorage session with non-existent parent ID
  env.mockStorage.setItem('zoptro_auth_session', JSON.stringify({
    user: { id: 'u_hacker_999', role: 'parent', fullName: 'Hacker Parent' },
    token: 'fake_jwt_token'
  }));
  const habitHackRes = await ZoptroApiClient.saveHabit({
    habit: { title: 'Hack Habit', points: 500 },
    parentUserId: 'u_hacker_999'
  });
  recordResult('V1.6', 'Spoofed parent session in client storage rejected by backend API',
    habitHackRes && habitHackRes.success === false && habitHackRes.error.includes('UNAUTHORIZED'),
    `habitHackRes: ${JSON.stringify(habitHackRes)}`
  );
}

// ====================================================================
// VECTOR 2: QUEST COMPLETION & SELF-AWARDING ATTACKS
// ====================================================================
console.log('\n--- VECTOR 2: QUEST COMPLETION & SELF-AWARDING ATTACKS ---');

async function testVector2() {
  const env = createSandboxEnvironment();
  const { BrowserMockBackend, ZoptroApiClient } = env;

  const pReg = BrowserMockBackend.signUpParent({ fullName: 'Parent Alice', email: 'alice@test.com', pin: '4455', password: 'PasswordAlice' });
  const sReg = BrowserMockBackend.signUpStudent({ fullName: 'Student Bob', pin: '1122', pairingCode: pReg.pairingCode });

  const initialCoins = sReg.user.coins;
  const initialXp = sReg.user.xp;

  // 2.1: Student submitQuestCompletion yields 0 instant coins
  const subRes = await ZoptroApiClient.submitQuestCompletion({
    studentId: sReg.user.id,
    questId: 'h_1',
    notes: 'Adversarial instant coin test'
  });
  const studentAfterSub = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  const zeroInstantCoins = studentAfterSub.coins === initialCoins && studentAfterSub.xp === initialXp;
  recordResult('V2.1', 'Student quest submission grants 0 instant coins / XP (queued as PENDING)',
    subRes.success && subRes.status === 'PENDING_VERIFICATION' && zeroInstantCoins,
    `coins: ${studentAfterSub.coins} (initial: ${initialCoins}), status: ${subRes.status}`
  );

  // 2.2: Student attempts to self-approve quest by supplying own studentId as parentUserId
  const selfApproveRes = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subRes.submissionId,
    parentUserId: sReg.user.id,
    bonusCoins: 50
  });
  recordResult('V2.2', 'Student self-approval attempt with studentId rejected by server RBAC',
    selfApproveRes && selfApproveRes.success === false && selfApproveRes.error.includes('UNAUTHORIZED'),
    `selfApproveRes: ${JSON.stringify(selfApproveRes)}`
  );

  // 2.3: Cross-family parent cannot approve student quest
  const pRegOther = BrowserMockBackend.signUpParent({ fullName: 'Parent Eve', email: 'eve@test.com', pin: '9900', password: 'PasswordEve' });
  const crossApproveRes = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subRes.submissionId,
    parentUserId: pRegOther.user.id,
    bonusCoins: 20
  });
  recordResult('V2.3', 'Cross-family parent cannot approve unlinked student quest',
    crossApproveRes && crossApproveRes.success === false && crossApproveRes.error.includes('UNAUTHORIZED'),
    `crossApproveRes: ${JSON.stringify(crossApproveRes)}`
  );

  // 2.4: Attempt to submit quest for non-existent quest ID
  const fakeQuestRes = await ZoptroApiClient.submitQuestCompletion({
    studentId: sReg.user.id,
    questId: 'quest_fake_99999',
    notes: 'Fake quest attack'
  });
  recordResult('V2.4', 'Submission for non-existent quest is rejected',
    fakeQuestRes && fakeQuestRes.success === false,
    `fakeQuestRes: ${JSON.stringify(fakeQuestRes)}`
  );

  // 2.5: Archived quest submission is rejected
  const customHabit = await ZoptroApiClient.saveHabit({
    parentUserId: pReg.user.id,
    habit: { title: 'Temporary Habit', points: 30, xpReward: 60 }
  });
  await ZoptroApiClient.deleteHabit({ habitId: customHabit.habit.id, parentUserId: pReg.user.id });
  const archivedSubRes = await ZoptroApiClient.submitQuestCompletion({
    studentId: sReg.user.id,
    questId: customHabit.habit.id,
    notes: 'Archived habit attempt'
  });
  recordResult('V2.5', 'Submission for archived quest is rejected',
    archivedSubRes && archivedSubRes.success === false,
    `archivedSubRes: ${JSON.stringify(archivedSubRes)}`
  );

  // 2.6: Excessive bonus coins manipulation (bonus > 1000 or negative)
  const excessiveApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subRes.submissionId,
    parentUserId: pReg.user.id,
    bonusCoins: 9999999
  });
  const studentAfterExcessive = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  // Bonus must be capped at 1000 or rejected
  const bonusCapped = studentAfterExcessive.coins <= initialCoins + 1000 + 50;
  recordResult('V2.6', 'Excessive bonus coins input (>1000) is clamped to max 1000',
    bonusCapped,
    `coins after approve: ${studentAfterExcessive.coins}`
  );

  // 2.7: Double approval attack on already approved submission
  const secondApprove = await ZoptroApiClient.approveQuestSubmission({
    submissionId: subRes.submissionId,
    parentUserId: pReg.user.id,
    bonusCoins: 10
  });
  recordResult('V2.7', 'Double approval on already approved submission is rejected',
    secondApprove && secondApprove.success === false && secondApprove.error.includes('ALREADY_REVIEWED'),
    `secondApprove: ${JSON.stringify(secondApprove)}`
  );
}

// ====================================================================
// VECTOR 3: REDEMPTION DOUBLE-SPENDING & ESCROW ATTACKS
// ====================================================================
console.log('\n--- VECTOR 3: REDEMPTION DOUBLE-SPENDING & ESCROW ATTACKS ---');

async function testVector3() {
  const env = createSandboxEnvironment();
  const { BrowserMockBackend, ZoptroApiClient } = env;

  const pReg = BrowserMockBackend.signUpParent({ fullName: 'Parent Carol', email: 'carol@test.com', pin: '7788', password: 'PasswordCarol' });
  const sReg = BrowserMockBackend.signUpStudent({ fullName: 'Student Dave', pin: '3344', pairingCode: pReg.pairingCode });

  // Set student wallet to exactly 50 coins
  const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
  const student = users.find(u => u.id === sReg.user.id);
  student.coins = 50;
  BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, users);

  // Create a reward costing 40 coins
  const catalogRes = await ZoptroApiClient.manageRewardItem({
    parentUserId: pReg.user.id,
    rewardData: { title: '40-Coin Game Time', costCoins: 40, category: 'gaming' }
  });
  const rewardId = catalogRes.reward.id;

  // 3.1: First redemption deducts 40 coins into escrow
  const rdm1 = await ZoptroApiClient.submitRedemptionRequest({
    studentId: sReg.user.id,
    rewardId: rewardId
  });
  const stuAfter1 = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  recordResult('V3.1', 'Redemption request deducts cost into escrow immediately (50 -> 10)',
    rdm1 && rdm1.success && stuAfter1.coins === 10 && rdm1.remainingCoins === 10,
    `coins: ${stuAfter1.coins}, rdm1: ${JSON.stringify(rdm1)}`
  );

  // 3.2: Double-spending attack: Student attempts second 40-coin redemption with 10 coins balance
  const rdm2 = await ZoptroApiClient.submitRedemptionRequest({
    studentId: sReg.user.id,
    rewardId: rewardId
  });
  const stuAfter2 = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  recordResult('V3.2', 'Second redemption with insufficient escrow balance is rejected (no double-spend)',
    rdm2 && rdm2.success === false && rdm2.error.includes('INSUFFICIENT_COINS') && stuAfter2.coins === 10,
    `coins: ${stuAfter2.coins}, rdm2: ${JSON.stringify(rdm2)}`
  );

  // 3.3: Rejection refund: Parent rejects redemption 1 -> 40 coins restored to 50
  const rej1 = await ZoptroApiClient.rejectRedemption({
    redemptionId: rdm1.redemptionId,
    parentUserId: pReg.user.id,
    reason: 'Exam week focus'
  });
  const stuAfterRej = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  recordResult('V3.3', 'Parent rejection accurately refunds escrowed coins (10 -> 50)',
    rej1 && rej1.success && rej1.refundedCoins === 40 && stuAfterRej.coins === 50,
    `refunded: ${rej1.refundedCoins}, balance: ${stuAfterRej.coins}`
  );

  // 3.4: Duplicate rejection attack (attempting to trigger infinite refund loop)
  const rej2 = await ZoptroApiClient.rejectRedemption({
    redemptionId: rdm1.redemptionId,
    parentUserId: pReg.user.id,
    reason: 'Re-rejecting to get another refund'
  });
  const stuAfterDoubleRej = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === sReg.user.id);
  recordResult('V3.4', 'Duplicate rejection attack fails without duplicate refund (balance remains 50)',
    rej2 && rej2.success === false && rej2.error.includes('ALREADY_REVIEWED') && stuAfterDoubleRej.coins === 50,
    `balance: ${stuAfterDoubleRej.coins}, rej2: ${JSON.stringify(rej2)}`
  );

  // 3.5: Approval after rejection attack
  const appAfterRej = await ZoptroApiClient.approveRedemption({
    redemptionId: rdm1.redemptionId,
    parentUserId: pReg.user.id
  });
  recordResult('V3.5', 'Approving an already rejected/refunded redemption is rejected',
    appAfterRej && appAfterRej.success === false && appAfterRej.error.includes('ALREADY_REVIEWED'),
    `appAfterRej: ${JSON.stringify(appAfterRej)}`
  );

  // 3.6: Student attempting to self-approve redemption
  const rdm3 = await ZoptroApiClient.submitRedemptionRequest({
    studentId: sReg.user.id,
    rewardId: rewardId
  });
  const studentSelfApprove = await ZoptroApiClient.approveRedemption({
    redemptionId: rdm3.redemptionId,
    parentUserId: sReg.user.id
  });
  recordResult('V3.6', 'Student attempting to self-approve redemption is rejected by RBAC',
    studentSelfApprove && studentSelfApprove.success === false && studentSelfApprove.error.includes('UNAUTHORIZED'),
    `studentSelfApprove: ${JSON.stringify(studentSelfApprove)}`
  );
}

// ====================================================================
// VECTOR 4: HABIT POINTS MANIPULATION & GOVERNANCE ATTACKS
// ====================================================================
console.log('\n--- VECTOR 4: HABIT POINTS MANIPULATION & GOVERNANCE ATTACKS ---');

async function testVector4() {
  const env = createSandboxEnvironment();
  const { BrowserMockBackend, ZoptroApiClient } = env;

  const pReg = BrowserMockBackend.signUpParent({ fullName: 'Parent Dan', email: 'dan@test.com', pin: '5566', password: 'PasswordDan' });
  const sReg = BrowserMockBackend.signUpStudent({ fullName: 'Student Emma', pin: '2233', pairingCode: pReg.pairingCode });

  // 4.1: Student attempts to create habit with huge points
  const stuCreateHabit = await ZoptroApiClient.saveHabit({
    parentUserId: sReg.user.id,
    habit: { title: 'Free 5000 Coins Habit', points: 5000 }
  });
  recordResult('V4.1', 'Student cannot create habits or alter points (RBAC enforced)',
    stuCreateHabit && stuCreateHabit.success === false && stuCreateHabit.error.includes('UNAUTHORIZED'),
    `stuCreateHabit: ${JSON.stringify(stuCreateHabit)}`
  );

  // 4.2: Habit points out-of-bounds (>1000 points rejected)
  const excessiveHabit = await ZoptroApiClient.saveHabit({
    parentUserId: pReg.user.id,
    habit: { title: 'Over 1000 Points Habit', points: 2500 }
  });
  recordResult('V4.2', 'Habit creation with points > 1000 is rejected by backend',
    excessiveHabit && excessiveHabit.success === false && (excessiveHabit.error.includes('POINTS_OUT_OF_BOUNDS') || excessiveHabit.error.includes('INVALID_POINTS')),
    `excessiveHabit: ${JSON.stringify(excessiveHabit)}`
  );

  // 4.3: Habit points negative rejected
  const negHabit = await ZoptroApiClient.saveHabit({
    parentUserId: pReg.user.id,
    habit: { title: 'Negative Points Habit', points: -50 }
  });
  recordResult('V4.3', 'Habit creation with negative points is rejected',
    negHabit && negHabit.success === false && (negHabit.error.includes('POINTS_OUT_OF_BOUNDS') || negHabit.error.includes('INVALID_POINTS')),
    `negHabit: ${JSON.stringify(negHabit)}`
  );

  // 4.4: Student attempts to archive / delete a habit
  const validHabit = await ZoptroApiClient.saveHabit({
    parentUserId: pReg.user.id,
    habit: { title: 'Daily Reading', points: 20 }
  });
  const stuDeleteHabit = await ZoptroApiClient.deleteHabit({
    habitId: validHabit.habit.id,
    parentUserId: sReg.user.id
  });
  recordResult('V4.4', 'Student cannot delete or archive habits',
    stuDeleteHabit && stuDeleteHabit.success === false && stuDeleteHabit.error.includes('UNAUTHORIZED'),
    `stuDeleteHabit: ${JSON.stringify(stuDeleteHabit)}`
  );

  // 4.5: Student attempts to modify security credentials of student without parent auth
  const secHack = await ZoptroApiClient.updateStudentSecurity({
    parentUserId: sReg.user.id,
    studentId: sReg.user.id,
    newPin: '0000'
  });
  recordResult('V4.5', 'Student cannot perform parent security updates',
    secHack && secHack.success === false && secHack.error.includes('UNAUTHORIZED'),
    `secHack: ${JSON.stringify(secHack)}`
  );
}

// ====================================================================
// VECTOR 5: BRAND EXPRESSION SYSTEM GEOMETRIC AUDIT
// ====================================================================
console.log('\n--- VECTOR 5: BRAND EXPRESSION SYSTEM GEOMETRIC AUDIT ---');

function testVector5() {
  // 5.1: No rounded-* classes other than rounded-none
  const roundedMatches = htmlContent.match(/\brounded-(?!none)[a-z0-9-]+/g) || [];
  recordResult('V5.1', 'Zero non-square rounded-* classes in HTML',
    roundedMatches.length === 0,
    `Found: ${roundedMatches.join(', ')}`
  );

  // 5.2: No standalone rounded class
  const standaloneRounded = htmlContent.match(/(['" ])rounded(['" ])/g) || [];
  recordResult('V5.2', 'Zero standalone rounded classes in HTML',
    standaloneRounded.length === 0,
    `Found: ${standaloneRounded.length} instances`
  );

  // 5.3: Global CSS enforces border-radius: 0px !important
  const hasGlobalOverride = htmlContent.includes('* { border-radius: 0px !important; }') ||
    htmlContent.includes('border-radius: 0px !important');
  recordResult('V5.3', 'Global CSS hard border-radius 0px override is present',
    hasGlobalOverride,
    `hasGlobalOverride: ${hasGlobalOverride}`
  );

  // 5.4: Zero prohibited gradients
  const gradientMatches = htmlContent.match(/\bbg-gradient-[a-z0-9-]+/g) || [];
  recordResult('V5.4', 'Zero bg-gradient-* classes in HTML',
    gradientMatches.length === 0,
    `Found: ${gradientMatches.join(', ')}`
  );

  // 5.5: Zero prohibited neon glows
  const glowMatches = htmlContent.match(/\bglow-[a-z0-9-]+/g) || [];
  recordResult('V5.5', 'Zero glow-* classes in HTML',
    glowMatches.length === 0,
    `Found: ${glowMatches.join(', ')}`
  );
}

async function runAll() {
  await testVector1();
  await testVector2();
  await testVector3();
  await testVector4();
  testVector5();

  console.log('\n====================================================================');
  console.log(`📊 ADVERSARIAL EXECUTION SUMMARY`);
  console.log(`Total Challenges Executed : ${totalChallenges}`);
  console.log(`Challenges Defended       : ${passedChallenges}`);
  console.log(`Vulnerabilities Found     : ${findings.length}`);
  console.log('====================================================================\n');

  if (findings.length > 0) {
    console.log('⚠️  VULNERABILITY FINDINGS REPORT:');
    findings.forEach((f, i) => {
      console.log(`\n[Finding ${i + 1}] Category: ${f.category} — ${f.testName}`);
      console.log(`Details: ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 ALL 24 ADVERSARIAL CHALLENGES RIGOROUSLY DEFENDED! NO VULNERABILITIES FOUND.');
    process.exit(0);
  }
}

runAll().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
