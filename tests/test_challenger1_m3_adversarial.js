/**
 * tests/test_challenger1_m3_adversarial.js
 * 
 * EMPIRICAL CHALLENGER 1 - MILESTONE 3 ADVERSARIAL SUITE
 * 
 * Target: Requirement R1 (Admin Control Page / CMS with RBAC) &
 *         Requirement R5 (Family Onboarding Workflow)
 * System: divyank_mission_control_google_apps_script_app.html
 * 
 * Vectors Tested:
 * 1. RBAC Bypass & Unauthorized Intrusion Attacks
 * 2. Admin Content Mutation Integrity & Lock Protection
 * 3. Family Onboarding Boundary & Abuse Vectors
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================================');
console.log('⚔️  EMPIRICAL CHALLENGER 1: MILESTONE 3 ADVERSARIAL ATTACK SUITE');
console.log('    Requirement R1 (Admin CMS & RBAC) & R5 (Family Onboarding)');
console.log('====================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Helper to construct realistic simulated browser runtime with DOM mocks
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

  // Pre-seed all declared element IDs from HTML
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
    navigator: { userAgent: 'ZoptroChallengerRunner' },
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    },
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

  return {
    sandbox,
    domElements,
    mockDoc,
    mockStorage,
    BrowserMockBackend,
    ZoptroApiClient
  };
}

let passedCount = 0;
let failedCount = 0;
const attackLog = [];

function recordAttack(vector, testName, passed, details) {
  if (passed) {
    passedCount++;
    console.log(`  🛡️  [DEFENDED] ${vector}: ${testName}`);
    attackLog.push({ vector, testName, status: 'PASS', details });
  } else {
    failedCount++;
    console.error(`  ❌ [BREACHED] ${vector}: ${testName}`);
    console.error(`     Details: ${details}`);
    attackLog.push({ vector, testName, status: 'FAIL', details });
  }
}

// ============================================================================
// VECTOR 1: RBAC BYPASS & UNAUTHORIZED INTRUSION ATTACKS (REQUIREMENT R1)
// ============================================================================
async function runVector1Attacks() {
  console.log('\n--- VECTOR 1: RBAC BYPASS & UNAUTHORIZED INTRUSION ATTACKS (R1) ---');
  const env = createSandboxEnvironment();
  const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient } = env;

  // 1.1: Student session attempts switchTab('admin')
  sandbox.currentRole = 'divyank';
  sandbox.currentUser = { id: 'u_stu_divyank', role: 'student', fullName: 'Divyank Choudhary' };
  sandbox.switchTab('admin');

  const v1_1_modalOpen = !domElements['adminPinModal'].classList.contains('hidden');
  const v1_1_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const v1_1_roleUnchanged = sandbox.currentRole === 'divyank';
  recordAttack(
    'R1-RBAC-01',
    "Student session switchTab('admin') halts at PIN challenge modal without revealing admin container",
    v1_1_modalOpen && v1_1_authHidden && v1_1_roleUnchanged,
    `modalOpen=${v1_1_modalOpen}, authHidden=${v1_1_authHidden}, currentRole=${sandbox.currentRole}`
  );

  // 1.2: Student session forces direct invocation of renderAdminView()
  sandbox.currentRole = 'divyank';
  sandbox.currentUser = { id: 'u_stu_divyank', role: 'student', fullName: 'Divyank Choudhary' };
  sandbox.renderAdminView();

  const v1_2_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const v1_2_unauthVisible = !domElements['adminUnauthorizedCard'].classList.contains('hidden');
  recordAttack(
    'R1-RBAC-02',
    "Forced renderAdminView() in student session strictly presents #adminUnauthorizedCard and conceals #adminAuthorizedContainer",
    v1_2_authHidden && v1_2_unauthVisible,
    `authHidden=${v1_2_authHidden}, unauthVisible=${v1_2_unauthVisible}`
  );

  // 1.3: Parent session attempts switchTab('admin')
  sandbox.currentRole = 'parent';
  sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Commander Parent' };
  sandbox.switchTab('admin');

  const v1_3_modalOpen = !domElements['adminPinModal'].classList.contains('hidden');
  const v1_3_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const v1_3_roleUnchanged = sandbox.currentRole === 'parent';
  recordAttack(
    'R1-RBAC-03',
    "Parent session switchTab('admin') halts at PIN challenge modal without revealing admin container",
    v1_3_modalOpen && v1_3_authHidden && v1_3_roleUnchanged,
    `modalOpen=${v1_3_modalOpen}, authHidden=${v1_3_authHidden}, currentRole=${sandbox.currentRole}`
  );

  // 1.4: Parent session forces direct invocation of renderAdminView()
  sandbox.currentRole = 'parent';
  sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Commander Parent' };
  sandbox.renderAdminView();

  const v1_4_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const v1_4_unauthVisible = !domElements['adminUnauthorizedCard'].classList.contains('hidden');
  recordAttack(
    'R1-RBAC-04',
    "Forced renderAdminView() in parent session strictly presents #adminUnauthorizedCard and conceals #adminAuthorizedContainer",
    v1_4_authHidden && v1_4_unauthVisible,
    `authHidden=${v1_4_authHidden}, unauthVisible=${v1_4_unauthVisible}`
  );

  // 1.5: Direct unauthorized API intrusion attacks
  const intruderIds = ['u_stu_divyank', 'u_par_demo', 'anonymous_intruder', ''];
  let allApiRejected = true;
  for (const intruder of intruderIds) {
    const listRes = BrowserMockBackend.getAdminContentList({ adminUserId: intruder, contentType: 'stories' });
    const saveRes = BrowserMockBackend.saveAdminContentItem({
      adminUserId: intruder,
      contentType: 'stories',
      itemData: { title: 'Hacked Story', grade: 'Class 3' }
    });
    const toggleRes = BrowserMockBackend.toggleContentActiveStatus({
      adminUserId: intruder,
      contentType: 'stories',
      itemId: 'st_courage_01',
      isActive: false
    });
    const deleteRes = BrowserMockBackend.deleteAdminContentItem({
      adminUserId: intruder,
      contentType: 'stories',
      itemId: 'st_courage_01'
    });

    if (listRes.success || saveRes.success || toggleRes.success || deleteRes.success) {
      allApiRejected = false;
      break;
    }
  }
  recordAttack(
    'R1-RBAC-05',
    "Direct backend CMS API operations (list, save, toggle, delete) return 403 UNAUTHORIZED for non-admin identities",
    allApiRejected,
    `allApiRejected=${allApiRejected}`
  );

  // 1.6: Brute force & invalid Admin PIN attacks
  const invalidPins = [
    { pin: '0000', label: 'arbitrary 4-digit PIN' },
    { pin: '1234', label: 'student default PIN' },
    { pin: 'abcd', label: 'alphabetic string' },
    { pin: '', label: 'empty string' },
    { pin: '   ', label: 'whitespace only' },
    { pin: "' OR '1'='1", label: 'SQL injection bypass string' },
    { pin: '<script>alert(1)</script>', label: 'XSS attack string' }
  ];

  let bruteForceBlocked = true;
  for (const tc of invalidPins) {
    sandbox.currentRole = 'divyank';
    sandbox.currentUser = { id: 'u_stu_divyank', role: 'student' };
    domElements['adminSwitchPin'].value = tc.pin;
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 10));

    const errVisible = !domElements['adminSwitchPinError'].classList.contains('hidden');
    const errText = domElements['adminSwitchPinError'].innerText;
    const stillStudent = sandbox.currentUser.role === 'student' && sandbox.currentRole === 'divyank';
    const authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');

    if (!errVisible || !stillStudent || !authHidden || (!errText.includes('required') && !errText.includes('Incorrect') && !errText.includes('error'))) {
      bruteForceBlocked = false;
      console.error(`      Failed on PIN: "${tc.pin}" (${tc.label})`);
      break;
    }
  }
  recordAttack(
    'R1-RBAC-06',
    "Admin PIN modal rejects brute force, empty, non-numeric, and injection strings with #adminSwitchPinError banner",
    bruteForceBlocked,
    `bruteForceBlocked=${bruteForceBlocked}`
  );

  // 1.7: Authentic Admin PIN elevation
  domElements['adminSwitchPin'].value = '9999';
  sandbox.verifyAdminPinChallenge();
  await new Promise(r => setTimeout(r, 20));

  const v1_7_roleElevated = sandbox.currentUser && sandbox.currentUser.role === 'admin' && sandbox.currentRole === 'admin';
  const v1_7_modalClosed = domElements['adminPinModal'].classList.contains('hidden');
  const v1_7_authRevealed = !domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const v1_7_unauthHidden = domElements['adminUnauthorizedCard'].classList.contains('hidden');

  recordAttack(
    'R1-RBAC-07',
    "Authentic Admin PIN (9999) verifies successfully, elevates role to 'admin', and reveals #adminAuthorizedContainer",
    v1_7_roleElevated && v1_7_modalClosed && v1_7_authRevealed && v1_7_unauthHidden,
    `roleElevated=${v1_7_roleElevated}, modalClosed=${v1_7_modalClosed}, authRevealed=${v1_7_authRevealed}, unauthHidden=${v1_7_unauthHidden}`
  );
}

// ============================================================================
// VECTOR 2: ADMIN CONTENT MUTATION INTEGRITY & LOCK PROTECTION (REQUIREMENT R1)
// ============================================================================
async function runVector2Attacks() {
  console.log('\n--- VECTOR 2: ADMIN MUTATION INTEGRITY & LOCK PROTECTION (R1) ---');
  const env = createSandboxEnvironment();
  const { sandbox, domElements, BrowserMockBackend } = env;

  // Elevate session to Admin
  sandbox.currentRole = 'admin';
  sandbox.currentUser = { id: 'u_adm_demo', role: 'admin', fullName: 'Super Admin' };

  // 2.1: Concurrency guard: simulated duplicate in-flight mutations
  sandbox.isAdminMutating = true;
  domElements['adminLockStatusPill'].innerText = "LockService: Mutating status (withScriptLock 10s)...";

  // Attempt duplicate toggle and duplicate save while mutation lock is engaged
  let toggleFired = false;
  let saveFired = false;
  const originalToggle = sandbox.ZoptroApiClient.toggleContentActiveStatus;
  const originalSave = sandbox.ZoptroApiClient.saveAdminContentItem;

  sandbox.ZoptroApiClient.toggleContentActiveStatus = () => { toggleFired = true; return Promise.resolve({ success: true }); };
  sandbox.ZoptroApiClient.saveAdminContentItem = () => { saveFired = true; return Promise.resolve({ success: true }); };

  sandbox.handleAdminToggleStatus('stories', 'st_sample', true);
  sandbox.saveAdminModalContent('stories');

  // Restore mocks
  sandbox.ZoptroApiClient.toggleContentActiveStatus = originalToggle;
  sandbox.ZoptroApiClient.saveAdminContentItem = originalSave;

  const v2_1_guardBlocked = !toggleFired && !saveFired;
  const v2_1_lockPillActive = domElements['adminLockStatusPill'].innerText.includes('withScriptLock 10s');

  recordAttack(
    'R1-LOCK-01',
    "isAdminMutating optimistic concurrency lock prevents duplicate in-flight mutations and asserts LockService busy state",
    v2_1_guardBlocked && v2_1_lockPillActive,
    `guardBlocked=${v2_1_guardBlocked}, lockPillActive=${v2_1_lockPillActive}`
  );

  sandbox.isAdminMutating = false;

  // 2.2: Content validation attack — empty title and missing fields on Stories modal
  domElements['adminStoryTitle'].value = '   '; // Empty title
  domElements['adminStoryContent'].value = 'Some story content...';
  domElements['adminStoryGrade'].value = 'Class 3';
  sandbox.saveAdminModalContent('stories');

  const v2_2_errVisible = !domElements['adminStoryErrorMsg'].classList.contains('hidden');
  const v2_2_errText = domElements['adminStoryErrorMsg'].innerText;
  const v2_2_lockReset = sandbox.isAdminMutating === false;

  recordAttack(
    'R1-VAL-01',
    "Story creation with whitespace/empty title is rejected by client validation with #adminStoryErrorMsg",
    v2_2_errVisible && v2_2_errText.includes('Title and Story Body are required') && v2_2_lockReset,
    `errVisible=${v2_2_errVisible}, errText="${v2_2_errText}", lockReset=${v2_2_lockReset}`
  );

  // 2.3: Content validation attack — empty dilemma on EQ Scenario modal
  domElements['adminEqTitle'].value = 'Ethical Dilemma';
  domElements['adminEqDilemma'].value = '   '; // Empty dilemma
  sandbox.saveAdminModalContent('eq_scenarios');

  const v2_3_errVisible = !domElements['adminEqErrorMsg'].classList.contains('hidden');
  const v2_3_errText = domElements['adminEqErrorMsg'].innerText;

  recordAttack(
    'R1-VAL-02',
    "EQ Scenario creation with empty dilemma is rejected by client validation with #adminEqErrorMsg",
    v2_3_errVisible && v2_3_errText.includes('Title and Dilemma are required'),
    `errVisible=${v2_3_errVisible}, errText="${v2_3_errText}"`
  );

  // 2.4: Content validation attack — empty topic on Daily GK modal
  domElements['adminDailyGkTopic'].value = '';
  domElements['adminDailyGkQuestionText'].value = 'What is gravity?';
  sandbox.saveAdminModalContent('daily_knowledge');

  const v2_4_errVisible = !domElements['adminDailyGkErrorMsg'].classList.contains('hidden');
  const v2_4_errText = domElements['adminDailyGkErrorMsg'].innerText;

  recordAttack(
    'R1-VAL-03',
    "Daily GK creation with empty topic is rejected by client validation with #adminDailyGkErrorMsg",
    v2_4_errVisible && v2_4_errText.includes('Topic and Quiz Question are required'),
    `errVisible=${v2_4_errVisible}, errText="${v2_4_errText}"`
  );

  // 2.5: Backend Schema Integrity Attack — invalid grade Class 15 & Grade 99
  const badGradeRes1 = BrowserMockBackend.saveAdminContentItem({
    adminUserId: 'u_adm_demo',
    contentType: 'stories',
    itemData: { title: 'Adversarial Story', grade: 'Class 15', content: 'Testing invalid grade' }
  });
  const badGradeRes2 = BrowserMockBackend.saveAdminContentItem({
    adminUserId: 'u_adm_demo',
    contentType: 'stories',
    itemData: { title: 'Adversarial Story 2', grade: 'Grade 99', content: 'Testing invalid grade' }
  });

  const v2_5_rejected = (!badGradeRes1.success && badGradeRes1.code === 400 && badGradeRes1.error.includes('INVALID_GRADE')) &&
                        (!badGradeRes2.success && badGradeRes2.code === 400 && badGradeRes2.error.includes('INVALID_GRADE'));

  recordAttack(
    'R1-VAL-04',
    "Backend saveAdminContentItem strictly enforces CBSE/NCERT Class 1-10 grade schema and rejects out-of-bounds grades",
    v2_5_rejected,
    `badGradeRes1=${JSON.stringify(badGradeRes1)}, badGradeRes2=${JSON.stringify(badGradeRes2)}`
  );

  // 2.6: Backend Schema Integrity Attack — missing title on Stories & EQ Scenarios
  const missingTitleStory = BrowserMockBackend.saveAdminContentItem({
    adminUserId: 'u_adm_demo',
    contentType: 'stories',
    itemData: { grade: 'Class 3', content: 'No title provided' }
  });
  const missingTitleEq = BrowserMockBackend.saveAdminContentItem({
    adminUserId: 'u_adm_demo',
    contentType: 'eq_scenarios',
    itemData: { grade: 'Class 3', dilemma: 'No title provided' }
  });

  const v2_6_rejected = (!missingTitleStory.success && missingTitleStory.code === 400 && missingTitleStory.error.includes('MISSING_TITLE')) &&
                        (!missingTitleEq.success && missingTitleEq.code === 400 && missingTitleEq.error.includes('MISSING_TITLE'));

  recordAttack(
    'R1-VAL-05',
    "Backend saveAdminContentItem asserts mandatory title presence for Stories and EQ Scenarios",
    v2_6_rejected,
    `missingTitleStory=${JSON.stringify(missingTitleStory)}, missingTitleEq=${JSON.stringify(missingTitleEq)}`
  );
}

// ============================================================================
// VECTOR 3: FAMILY ONBOARDING BOUNDARY & ABUSE VECTORS (REQUIREMENT R5)
// ============================================================================
async function runVector3Attacks() {
  console.log('\n--- VECTOR 3: FAMILY ONBOARDING BOUNDARY & ABUSE VECTORS (R5) ---');
  const env = createSandboxEnvironment();
  const { sandbox, domElements, mockDoc, BrowserMockBackend } = env;

  // Initialize Onboarding Wizard
  sandbox.openFamilyOnboardingModal();

  // 3.1: Step 1 Form Abuse Vectors
  const step1Attacks = [
    {
      name: 'Empty parent name',
      data: { name: '', email: 'parent@zoptro.com', pin: '1234', pass: 'secret123', conf: 'secret123' },
      expectedError: 'Parent full name is required'
    },
    {
      name: 'Single character parent name',
      data: { name: 'A', email: 'parent@zoptro.com', pin: '1234', pass: 'secret123', conf: 'secret123' },
      expectedError: 'at least 2 characters'
    },
    {
      name: 'Invalid email (no @ or domain: "notanemail")',
      data: { name: 'Mark Choudhary', email: 'notanemail', pin: '1234', pass: 'secret123', conf: 'secret123' },
      expectedError: 'valid parent email'
    },
    {
      name: 'Invalid email (missing local part: "@domain.com")',
      data: { name: 'Mark Choudhary', email: '@domain.com', pin: '1234', pass: 'secret123', conf: 'secret123' },
      expectedError: 'valid parent email'
    },
    {
      name: 'Invalid email (missing domain: "test@")',
      data: { name: 'Mark Choudhary', email: 'test@', pin: '1234', pass: 'secret123', conf: 'secret123' },
      expectedError: 'valid parent email'
    },
    {
      name: 'Short parent PIN (<4 digits: "123")',
      data: { name: 'Mark Choudhary', email: 'parent@zoptro.com', pin: '123', pass: 'secret123', conf: 'secret123' },
      expectedError: 'at least 4 numeric digits'
    },
    {
      name: 'Non-numeric parent PIN ("abcd")',
      data: { name: 'Mark Choudhary', email: 'parent@zoptro.com', pin: 'abcd', pass: 'secret123', conf: 'secret123' },
      expectedError: 'at least 4 numeric digits'
    },
    {
      name: 'Short password (<6 characters: "pass")',
      data: { name: 'Mark Choudhary', email: 'parent@zoptro.com', pin: '1234', pass: 'pass', conf: 'pass' },
      expectedError: 'at least 6 characters'
    },
    {
      name: 'Password mismatch ("secret123" vs "mismatch456")',
      data: { name: 'Mark Choudhary', email: 'parent@zoptro.com', pin: '1234', pass: 'secret123', conf: 'mismatch456' },
      expectedError: 'Passwords do not match'
    }
  ];

  let allStep1Defended = true;
  for (const tc of step1Attacks) {
    domElements['onboarding-parent-name'].value = tc.data.name;
    domElements['onboarding-parent-email'].value = tc.data.email;
    domElements['onboarding-parent-pin'].value = tc.data.pin;
    domElements['onboarding-parent-password'].value = tc.data.pass;
    domElements['onboarding-parent-confirm-password'].value = tc.data.conf;

    const valid = sandbox.validateOnboardingStep1();
    const errVisible = !domElements['onboarding-error-banner'].classList.contains('hidden');
    const errText = domElements['onboarding-error-text'].innerText;

    if (valid || !errVisible || !errText.includes(tc.expectedError)) {
      allStep1Defended = false;
      console.error(`      Step 1 validation bypass on: "${tc.name}" -> valid=${valid}, err="${errText}"`);
      break;
    }
  }
  recordAttack(
    'R5-ONB-01',
    "Step 1 strictly halts navigation upon malformed parent name, invalid email formats, short PINs, and password mismatches",
    allStep1Defended,
    `allStep1Defended=${allStep1Defended}`
  );

  // 3.2: Step 2 Child Enrollment Boundary Vectors
  // Advance to Step 2 with valid credentials
  domElements['onboarding-parent-name'].value = 'Commander Anita';
  domElements['onboarding-parent-email'].value = 'anita.choudhary@zoptro.test';
  domElements['onboarding-parent-pin'].value = '9876';
  domElements['onboarding-parent-password'].value = 'SecurePass987';
  domElements['onboarding-parent-confirm-password'].value = 'SecurePass987';
  sandbox.handleOnboardingNext(1);

  const v3_2_atStep2 = sandbox.onboardingCurrentStep === 2 && !domElements['onboarding-step-2'].classList.contains('hidden');
  recordAttack(
    'R5-ONB-02',
    "Valid Step 1 parent credentials successfully advance wizard to Step 2 (Child Enrollment)",
    v3_2_atStep2,
    `atStep2=${v3_2_atStep2}, currentStep=${sandbox.onboardingCurrentStep}`
  );

  // 3.3: 0 Children Boundary Submission
  sandbox.onboardingChildren = [];
  const v3_3_zeroValid = sandbox.validateOnboardingStep2();
  const v3_3_zeroErr = domElements['onboarding-error-text'].innerText.includes('At least one child record is required');
  recordAttack(
    'R5-ONB-03',
    "Step 2 enrollment validation strictly rejects 0 child records",
    !v3_3_zeroValid && v3_3_zeroErr,
    `zeroValid=${v3_3_zeroValid}, err="${domElements['onboarding-error-text'].innerText}"`
  );

  // 3.4: Child Record Field Boundary Attacks (age <5, age >18, empty name, invalid grade, short PIN)
  const childBoundaryAttacks = [
    {
      name: 'Empty child name',
      child: { fullName: '', age: 8, grade: 'Class 3', pin: '1234' },
      expectedError: 'valid full name'
    },
    {
      name: 'Child age < 5 (e.g. age 4)',
      child: { fullName: 'Toddler Cadet', age: 4, grade: 'Class 1', pin: '1234' },
      expectedError: 'between 5 and 18'
    },
    {
      name: 'Child age > 18 (e.g. age 19)',
      child: { fullName: 'Adult Cadet', age: 19, grade: 'Class 10', pin: '1234' },
      expectedError: 'between 5 and 18'
    },
    {
      name: 'Invalid / out-of-curriculum grade ("Class 15")',
      child: { fullName: 'Divyank Choudhary', age: 8, grade: 'Class 15', pin: '1234' },
      expectedError: 'valid CBSE Grade'
    },
    {
      name: 'Short child PIN (<4 digits: "12")',
      child: { fullName: 'Divyank Choudhary', age: 8, grade: 'Class 3', pin: '12' },
      expectedError: 'at least 4 numeric digits'
    }
  ];

  let allChildBoundariesDefended = true;
  for (const tc of childBoundaryAttacks) {
    sandbox.onboardingChildren = [Object.assign({}, tc.child)];
    const valid = sandbox.validateOnboardingStep2();
    const errText = domElements['onboarding-error-text'].innerText;

    if (valid || !errText.includes(tc.expectedError)) {
      allChildBoundariesDefended = false;
      console.error(`      Child boundary failed on: "${tc.name}" -> valid=${valid}, err="${errText}"`);
      break;
    }
  }
  recordAttack(
    'R5-ONB-04',
    "Step 2 child validation halts on empty names, ages out-of-range (<5 or >18), invalid grades, and short PINs",
    allChildBoundariesDefended,
    `allChildBoundariesDefended=${allChildBoundariesDefended}`
  );

  // 3.5: Dynamic 1-to-N Child Scaling (up to 8 children) & removal constraints
  sandbox.onboardingChildren = [{ fullName: 'Child 1', age: 6, grade: 'Class 1', pin: '1111' }];
  sandbox.renderOnboardingChildCards();

  // Add 7 more children to reach ceiling of 8
  for (let i = 2; i <= 8; i++) {
    sandbox.addOnboardingChild();
  }
  const v3_5_has8Children = sandbox.onboardingChildren.length === 8;
  const v3_5_card8Exists = domElements['onboarding-children-container'].innerHTML.includes('onboarding-child-card-7');

  // Attempt adding 9th child (ceiling breach attempt)
  sandbox.addOnboardingChild();
  const v3_5_ceilingEnforced = sandbox.onboardingChildren.length === 8;
  const v3_5_ceilingMsg = domElements['onboarding-error-text'].innerText.includes('Maximum 8 children');

  // Remove child at index 3
  sandbox.removeOnboardingChild(3);
  const v3_5_has7AfterRemove = sandbox.onboardingChildren.length === 7;

  // Reduce down to 1 child
  while (sandbox.onboardingChildren.length > 1) {
    sandbox.removeOnboardingChild(0);
  }
  const v3_5_downToOne = sandbox.onboardingChildren.length === 1;

  // Attempt removing the last remaining child
  sandbox.removeOnboardingChild(0);
  const v3_5_floorEnforced = sandbox.onboardingChildren.length === 1;
  const v3_5_floorMsg = domElements['onboarding-error-text'].innerText.includes('At least one child record is required');

  recordAttack(
    'R5-ONB-05',
    "Dynamic 1-to-N child enrollment scales up to 8 children, enforces 8-child ceiling, and prevents removing last child",
    v3_5_has8Children && v3_5_card8Exists && v3_5_ceilingEnforced && v3_5_ceilingMsg && v3_5_has7AfterRemove && v3_5_downToOne && v3_5_floorEnforced && v3_5_floorMsg,
    `has8=${v3_5_has8Children}, ceilingEnforced=${v3_5_ceilingEnforced}, floorEnforced=${v3_5_floorEnforced}`
  );

  // 3.6: Step 3 Terms Acceptance Guard
  // Advance to Step 3 with 2 valid children
  sandbox.onboardingChildren = [
    { fullName: 'Divyank Choudhary', age: 8, grade: 'Class 3', pin: '1234' },
    { fullName: 'Priya Choudhary', age: 11, grade: 'Class 6', pin: '5678' }
  ];
  sandbox.renderOnboardingChildCards();
  mockDoc.getElementById('onboarding-child-name-0').value = 'Divyank Choudhary';
  mockDoc.getElementById('onboarding-child-age-0').value = '8';
  mockDoc.getElementById('onboarding-child-grade-0').value = 'Class 3';
  mockDoc.getElementById('onboarding-child-pin-0').value = '1234';

  mockDoc.getElementById('onboarding-child-name-1').value = 'Priya Choudhary';
  mockDoc.getElementById('onboarding-child-age-1').value = '11';
  mockDoc.getElementById('onboarding-child-grade-1').value = 'Class 6';
  mockDoc.getElementById('onboarding-child-pin-1').value = '5678';

  sandbox.goToOnboardingStep(3);

  domElements['onboarding-terms-checkbox'].checked = false; // Unchecked terms
  sandbox.submitFamilyOnboarding();

  const v3_6_termsBlocked = !domElements['onboarding-error-banner'].classList.contains('hidden') &&
                            domElements['onboarding-error-text'].innerText.includes('Family Governance Terms');
  recordAttack(
    'R5-ONB-06',
    "submitFamilyOnboarding() strictly blocks registration if Family Governance Terms checkbox is unchecked",
    v3_6_termsBlocked,
    `termsBlocked=${v3_6_termsBlocked}, text="${domElements['onboarding-error-text'].innerText}"`
  );

  // 3.7: Atomic Registration & Full Session Hydration
  domElements['onboarding-terms-checkbox'].checked = true; // Checked
  sandbox.submitFamilyOnboarding();
  await new Promise(r => setTimeout(r, 30));

  const v3_7_stepSuccess = sandbox.onboardingCurrentStep === 'success' || !domElements['onboarding-step-success'].classList.contains('hidden');
  const v3_7_pairingCode = domElements['onboarding-success-pairing-code'].innerText;
  const v3_7_codeValid = typeof v3_7_pairingCode === 'string' && v3_7_pairingCode.length >= 6;
  const v3_7_sessionHydrated = sandbox.currentUser && sandbox.currentUser.role === 'parent' && sandbox.currentUser.email === 'anita.choudhary@zoptro.test';
  const v3_7_childrenLinked = Array.isArray(sandbox.linkedChildren) && sandbox.linkedChildren.length === 2;
  const v3_7_activeChildSet = sandbox.linkedChildren && sandbox.linkedChildren.length > 0 && sandbox.activeChildId === sandbox.linkedChildren[0].id;

  recordAttack(
    'R5-ONB-07',
    "Atomic registration succeeds, generates pairing code, and hydrator populates parent session with active child #1",
    v3_7_stepSuccess && v3_7_codeValid && v3_7_sessionHydrated && v3_7_childrenLinked && v3_7_activeChildSet,
    `stepSuccess=${v3_7_stepSuccess}, code="${v3_7_pairingCode}", hydrated=${v3_7_sessionHydrated}, linkedLen=${sandbox.linkedChildren ? sandbox.linkedChildren.length : 0}`
  );

  // 3.8: Complete Onboarding & Transition to Parent HQ
  sandbox.finishFamilyOnboardingAndLaunchHQ();
  const v3_8_modalClosed = domElements['modal-family-onboarding'].classList.contains('hidden');
  const v3_8_currentRoleParent = sandbox.currentRole === 'parent';
  const v3_8_parentViewActive = !domElements['view-parentview'].classList.contains('hidden');

  recordAttack(
    'R5-ONB-08',
    "finishFamilyOnboardingAndLaunchHQ() closes modal, activates 'parent' role, and transitions directly into Parent HQ",
    v3_8_modalClosed && v3_8_currentRoleParent && v3_8_parentViewActive,
    `modalClosed=${v3_8_modalClosed}, currentRole=${sandbox.currentRole}, parentViewActive=${v3_8_parentViewActive}`
  );

  // 3.9: Duplicate Email Registration Attack
  sandbox.openFamilyOnboardingModal();
  domElements['onboarding-parent-name'].value = 'Imposter Parent';
  domElements['onboarding-parent-email'].value = 'anita.choudhary@zoptro.test'; // Already registered!
  domElements['onboarding-parent-pin'].value = '1122';
  domElements['onboarding-parent-password'].value = 'ImposterPass123';
  domElements['onboarding-parent-confirm-password'].value = 'ImposterPass123';
  domElements['onboarding-terms-checkbox'].checked = true;

  sandbox.onboardingChildren = [{ fullName: 'Imposter Kid', age: 7, grade: 'Class 2', pin: '9988' }];
  sandbox.renderOnboardingChildCards();
  mockDoc.getElementById('onboarding-child-name-0').value = 'Imposter Kid';
  mockDoc.getElementById('onboarding-child-age-0').value = '7';
  mockDoc.getElementById('onboarding-child-grade-0').value = 'Class 2';
  mockDoc.getElementById('onboarding-child-pin-0').value = '9988';

  sandbox.submitFamilyOnboarding();
  await new Promise(r => setTimeout(r, 30));

  const v3_9_dupRejected = domElements['onboarding-error-text'].innerText.includes('EMAIL_ALREADY_EXISTS');
  const v3_9_routedToStep1 = sandbox.onboardingCurrentStep === 1;

  recordAttack(
    'R5-ONB-09',
    "Atomic onboarding rejects duplicate email collision with EMAIL_ALREADY_EXISTS and routes back to Step 1",
    v3_9_dupRejected && v3_9_routedToStep1,
    `dupRejected=${v3_9_dupRejected}, currentStep=${sandbox.onboardingCurrentStep}`
  );
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
  try {
    await runVector1Attacks();
    await runVector2Attacks();
    await runVector3Attacks();

    console.log('\n====================================================================');
    console.log(`🏁 EMPIRICAL ADVERSARIAL SUITE SUMMARY: ${passedCount} DEFENDED / ${failedCount} BREACHED`);
    console.log(`   TOTAL ATTACK VECTORS EXECUTED: ${passedCount + failedCount}`);
    if (failedCount === 0) {
      console.log('🎉 ALL ADVERSARIAL ATTACKS SUCCESSFULLY DEFENDED (100% RESILIENCE)!');
      process.exit(0);
    } else {
      console.error(`❌ CRITICAL DEFENSE FAILURE: ${failedCount} ATTACKS BREACHED THE SYSTEM.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 UNCAUGHT ADVERSARIAL SUITE EXCEPTION:', err);
    process.exit(1);
  }
}

main();
