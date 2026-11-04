/**
 * Zoptro Milestone 3 Remediation Challenger Attacks
 * 
 * In-depth adversarial challenge suite by challenger_m3_final.
 * Probes role switching, quest approval boundaries, and front/backend synchronization.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================================');
console.log('⚔️  RUNNING CHALLENGER EMPIRICAL ATTACKS: ROLE SWITCH & QUEST APPROVALS');
console.log('====================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const backendPath = path.join(__dirname, '..', 'google_apps_script_backend.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const backendContent = fs.readFileSync(backendPath, 'utf8');

function setupEnvironment() {
  const mockLocalStorage = {};
  const mockStorage = {
    getItem: (k) => (k in mockLocalStorage ? mockLocalStorage[k] : null),
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };

  const rawDom = {};
  function createMockElement(id) {
    return {
      id: id,
      value: '',
      innerText: '',
      innerHTML: '',
      className: '',
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
        fillRect: () => {}
      }),
      addEventListener: () => {},
      insertBefore: () => {},
      appendChild: function(child) { this.children = this.children || []; this.children.push(child); },
      children: []
    };
  }

  const domElements = new Proxy(rawDom, {
    get: (target, prop) => {
      if (typeof prop === 'string' && !(prop in target)) {
        target[prop] = createMockElement(prop);
      }
      return target[prop];
    }
  });

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
    navigator: { userAgent: 'ZoptroChallengerRunner' },
    console: console,
    setTimeout: (fn, ms) => setTimeout(fn, ms !== undefined ? ms : 0),
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

  // Wrap alertCustom to record all alert notifications
  const origAlert = sandbox.alertCustom;
  sandbox.alertCustom = function(title, msg) {
    alerts.push({ title, msg });
    if (typeof origAlert === 'function') origAlert(title, msg);
  };

  const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
  const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

  BrowserMockBackend.init(true);

  return {
    sandbox,
    domElements,
    mockStorage,
    alerts,
    BrowserMockBackend,
    ZoptroApiClient
  };
}

let passed = 0;
let failed = 0;
const errors = [];

function assertDefense(name, condition, extraInfo = '') {
  if (condition) {
    passed++;
    console.log(`  🛡️  [DEFENDED] ${name}`);
  } else {
    failed++;
    console.log(`  ❌ [FAILED]   ${name} - ${extraInfo}`);
    errors.push({ name, extraInfo });
  }
}

async function runAttacks() {
  console.log('--- SECTION 1: ROLE SWITCHING & AUTH BYPASS ATTACKS ---');
  {
    const env = setupEnvironment();
    const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient, alerts } = env;

    // Attack 1.1: Direct programmatic switchTab('parentview') in student session
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student', linkedParentId: 'u_par_demo' };
    domElements['view-parentview'].classList.add('hidden');
    domElements['parentPinModal'].classList.add('hidden');

    sandbox.switchTab('parentview');

    assertDefense(
      'Attack 1.1: switchTab("parentview") in student session leaves parent view hidden and opens PIN prompt',
      domElements['view-parentview'].classList.contains('hidden') &&
      !domElements['parentPinModal'].classList.contains('hidden')
    );

    // Attack 1.2: Asymmetric state attack: currentRole='parent' but currentUser.role='student'
    sandbox.currentRole = 'parent';
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student', linkedParentId: 'u_par_demo' };
    domElements['view-parentview'].classList.add('hidden');
    domElements['parentPinModal'].classList.add('hidden');

    sandbox.switchTab('parentview');

    assertDefense(
      'Attack 1.2: Asymmetric state (currentRole=parent, currentUser.role=student) is intercepted by switchTab',
      domElements['view-parentview'].classList.contains('hidden') &&
      !domElements['parentPinModal'].classList.contains('hidden')
    );

    // Attack 1.3: Asymmetric state attack: currentUser.role='parent' but currentRole='divyank'
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent', linkedStudentId: 'u_stu_demo' };
    domElements['view-parentview'].classList.add('hidden');
    domElements['parentPinModal'].classList.add('hidden');

    sandbox.switchTab('parentview');

    assertDefense(
      'Attack 1.3: Asymmetric state (currentUser.role=parent, currentRole=divyank) is intercepted by switchTab',
      domElements['view-parentview'].classList.contains('hidden') &&
      !domElements['parentPinModal'].classList.contains('hidden')
    );

    // Attack 1.4: PIN Challenge Bypass: empty string
    domElements['parentSwitchPin'].value = '';
    sandbox.verifyParentPinChallenge();
    assertDefense(
      'Attack 1.4: Empty PIN in verifyParentPinChallenge rejected with error message',
      domElements['parentSwitchPinError'].innerText.includes('required') &&
      !domElements['parentSwitchPinError'].classList.contains('hidden')
    );

    // Attack 1.5: PIN Challenge Bypass: whitespace only
    domElements['parentSwitchPin'].value = '     ';
    sandbox.verifyParentPinChallenge();
    assertDefense(
      'Attack 1.5: Whitespace PIN in verifyParentPinChallenge rejected',
      domElements['parentSwitchPinError'].innerText.includes('required') &&
      !domElements['parentSwitchPinError'].classList.contains('hidden')
    );

    // Attack 1.6: PIN Challenge Bypass: incorrect PIN
    domElements['parentSwitchPin'].value = '999999_WRONG_PIN';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 80));
    assertDefense(
      'Attack 1.6: Incorrect PIN rejected with Access Denied',
      domElements['parentSwitchPinError'].innerText.includes('Access Denied') &&
      sandbox.currentRole !== 'parent'
    );

    // Attack 1.7: Role toggle cycle: authenticate parent -> switch to student -> verify parent controls blocked
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student', linkedParentId: 'u_par_demo' };
    domElements['parentSwitchPin'].value = '1234'; // default demo parent PIN
    
    const origVerifyRolePin = ZoptroApiClient.verifyRolePin;
    ZoptroApiClient.verifyRolePin = async function(p) {
      console.log('CALL verifyRolePin with payload:', p);
      const r = await origVerifyRolePin.call(this, p);
      console.log('RESULT verifyRolePin:', r);
      return r;
    };

    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 100));
    console.log('DEBUG 1.7a:', { currentRole: sandbox.currentRole, currentUser: sandbox.currentUser, errEl: domElements['parentSwitchPinError'].innerText });
    assertDefense(
      'Attack 1.7a: Correct PIN elevates session to parent role',
      sandbox.currentRole === 'parent' && sandbox.currentUser.role === 'parent',
      `role: ${sandbox.currentRole}, user: ${JSON.stringify(sandbox.currentUser)}`
    );

    // Now switch back to student
    sandbox.setUserRole('divyank');
    assertDefense(
      'Attack 1.7b: Demoting to student role resets currentUser.role to student',
      sandbox.currentRole === 'divyank' && sandbox.currentUser.role === 'student'
    );

    // Student now attempts to call approveQuest directly
    alerts.length = 0;
    sandbox.approveQuest('any_sub_id');
    assertDefense(
      'Attack 1.7c: Post-demotion approveQuest invocation rejected with Access Denied',
      alerts.some(a => a.title.includes('Access Denied') || a.msg.includes('Parent authorization required'))
    );
  }

  console.log('\n--- SECTION 2: QUEST APPROVAL & GOVERNANCE ATTACKS ---');
  {
    const env = setupEnvironment();
    const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient, alerts } = env;

    // Student submits quest
    const questSub = await ZoptroApiClient.submitQuestCompletion({
      studentId: 'u_stu_demo',
      questId: 'h_1',
      notes: 'Morning routine completion'
    });
    assertDefense(
      'Attack 2.0: Legitimate quest completion enters PENDING_VERIFICATION',
      questSub && questSub.success && questSub.status === 'PENDING_VERIFICATION'
    );

    // Attack 2.1: Student session calls approveQuest in UI
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student', linkedParentId: 'u_par_demo' };
    alerts.length = 0;
    sandbox.approveQuest(questSub.submissionId);
    assertDefense(
      'Attack 2.1: Student calling approveQuest() UI function is rejected with Access Denied',
      alerts.some(a => a.title.includes('Access Denied') || a.msg.includes('Parent authorization required'))
    );

    // Verify student wallet balance unchanged
    const stu1 = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo');
    assertDefense(
      'Attack 2.1b: Student wallet balance remained intact (340 coins)',
      stu1.coins === 340
    );

    // Attack 2.2: Student calls approveQuestSubmission directly on API specifying own student ID as parentUserId
    const directApiRes = await ZoptroApiClient.approveQuestSubmission({
      submissionId: questSub.submissionId,
      parentUserId: 'u_stu_demo',
      bonusCoins: 50
    });
    assertDefense(
      'Attack 2.2: Direct API approveQuestSubmission with studentId rejected by backend RBAC',
      directApiRes && directApiRes.success === false && directApiRes.error.includes('UNAUTHORIZED')
    );

    // Attack 2.3: Cross-tenant attack: Unlinked parent attempts to approve student quest
    const p2Reg = BrowserMockBackend.signUpParent({ fullName: 'Malicious Parent', email: 'mal@evil.com', pin: '5555', password: 'EvilPassword' });
    const crossRes = await ZoptroApiClient.approveQuestSubmission({
      submissionId: questSub.submissionId,
      parentUserId: p2Reg.user.id,
      bonusCoins: 100
    });
    assertDefense(
      'Attack 2.3: Cross-tenant parent cannot approve unlinked student quest',
      crossRes && crossRes.success === false && crossRes.error.includes('UNAUTHORIZED')
    );

    // Attack 2.4: Parent approval with negative bonus coins (-500)
    const legApprove1 = await ZoptroApiClient.approveQuestSubmission({
      submissionId: questSub.submissionId,
      parentUserId: 'u_par_demo',
      bonusCoins: -500
    });
    assertDefense(
      'Attack 2.4: Parent approval with negative bonus coins succeeds with bonus clamped to 0 (no wallet deduction)',
      legApprove1 && legApprove1.success && legApprove1.updatedWallet.coins === 340 + 15 // h_1 is 15 points
    );

    // Attack 2.5: Replay / Double approval attack on already approved quest
    const doubleApprove = await ZoptroApiClient.approveQuestSubmission({
      submissionId: questSub.submissionId,
      parentUserId: 'u_par_demo',
      bonusCoins: 50
    });
    assertDefense(
      'Attack 2.5: Double approval of already approved quest rejected',
      doubleApprove && doubleApprove.success === false && doubleApprove.error.includes('ALREADY_REVIEWED')
    );

    // Attack 2.6: Rejection attack on already approved quest
    const rejectAfterApprove = await ZoptroApiClient.rejectQuestSubmission({
      submissionId: questSub.submissionId,
      parentUserId: 'u_par_demo',
      reason: 'Trying to reject already approved'
    });
    assertDefense(
      'Attack 2.6: Rejection of already approved quest rejected',
      rejectAfterApprove && rejectAfterApprove.success === false && rejectAfterApprove.error.includes('ALREADY_REVIEWED')
    );

    // Attack 2.7: Archived quest completion submission in BrowserMockBackend
    const newHabit = await ZoptroApiClient.saveHabit({
      parentUserId: 'u_par_demo',
      habit: { title: 'Secret Archived Task', points: 30 }
    });
    await ZoptroApiClient.deleteHabit({
      parentUserId: 'u_par_demo',
      habitId: newHabit.habit.id
    });
    const subArchived = await ZoptroApiClient.submitQuestCompletion({
      studentId: 'u_stu_demo',
      questId: newHabit.habit.id,
      notes: 'Submitting archived'
    });
    assertDefense(
      'Attack 2.7: Submitting completion for archived quest rejected in BrowserMock',
      subArchived && subArchived.success === false && subArchived.error.includes('QUEST_ARCHIVED')
    );
  }

  console.log('\n--- SECTION 3: OTHER PARENT HQ HANDLERS ATTACK MATRIX ---');
  {
    const env = setupEnvironment();
    const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient, alerts } = env;

    // Student session
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student', linkedParentId: 'u_par_demo' };

    // Attack 3.1: Student calling approveRedemption
    alerts.length = 0;
    sandbox.approveRedemption('any_red_id');
    assertDefense(
      'Attack 3.1: Student calling approveRedemption() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.2: Student calling confirmRejection
    alerts.length = 0;
    sandbox.confirmRejection();
    assertDefense(
      'Attack 3.2: Student calling confirmRejection() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.3: Student calling saveAddEditHabit
    alerts.length = 0;
    sandbox.saveAddEditHabit();
    assertDefense(
      'Attack 3.3: Student calling saveAddEditHabit() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.4: Student calling archiveHabit
    alerts.length = 0;
    sandbox.archiveHabit('h_1');
    assertDefense(
      'Attack 3.4: Student calling archiveHabit() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.5: Student calling submitStudentSecurityUpdate
    alerts.length = 0;
    sandbox.submitStudentSecurityUpdate();
    assertDefense(
      'Attack 3.5: Student calling submitStudentSecurityUpdate() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.6: Student calling awardParentBonus
    alerts.length = 0;
    sandbox.awardParentBonus(50);
    assertDefense(
      'Attack 3.6: Student calling awardParentBonus() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );

    // Attack 3.7: Student calling sendParentEmailDigest
    alerts.length = 0;
    sandbox.sendParentEmailDigest();
    assertDefense(
      'Attack 3.7: Student calling sendParentEmailDigest() blocked with Access Denied',
      alerts.some(a => a.title.includes('Access Denied'))
    );
  }

  console.log('\n--- SECTION 4: GOOGLE APPS SCRIPT BACKEND PARITY ATTACKS ---');
  {
    // Validate GAS source code checks
    assertDefense(
      'Attack 4.1: GAS backend checks isArchived in submitQuestCompletion',
      backendContent.includes('QUEST_ARCHIVED: Cannot submit completion for an archived quest.')
    );
    assertDefense(
      'Attack 4.2: GAS backend checks isArchived in submitRedemptionRequest',
      backendContent.includes('REWARD_ARCHIVED: Cannot redeem an archived reward.')
    );
    assertDefense(
      'Attack 4.3: GAS backend enforces assertParent in approveQuestSubmission',
      backendContent.includes('assertParent(parentUserId);')
    );
    assertDefense(
      'Attack 4.4: GAS backend enforces assertParentPairing in approveQuestSubmission',
      backendContent.includes('assertParentPairing(parentUserId, sub.studentId)')
    );
    assertDefense(
      'Attack 4.5: GAS backend rejects non-linked parent in approveQuestSubmission',
      backendContent.includes('UNAUTHORIZED: Parent is not linked to this quest submission.')
    );
  }

  console.log('\n====================================================================');
  console.log(`CHALLENGER EMPIRICAL RESULTS SUMMARY:`);
  console.log(`Total Attacks Executed : ${passed + failed}`);
  console.log(`Attacks Defended       : ${passed}`);
  console.log(`Attacks Succeeded      : ${failed}`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAttacks().catch(err => {
  console.error('Fatal attack error:', err);
  process.exit(1);
});
