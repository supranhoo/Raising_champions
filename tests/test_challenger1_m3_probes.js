/**
 * tests/test_challenger1_m3_probes.js
 * 
 * Deep Adversarial Boundary Probes for Milestone 3 Iteration 2
 * Focus: verifyRolePin & activateAdminRole boundary probes, tamper resistance,
 * tri-engine contract parity, and session lifecycle enforcement.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================================');
console.log('🔬 CHALLENGER 1: ADDITIONAL ADVERSARIAL BOUNDARY PROBES');
console.log('   Target: verifyRolePin & activateAdminRole tamper resistance');
console.log('====================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const gasBackendPath = path.join(__dirname, '..', 'google_apps_script_backend.js');
const oraclePath = path.join(__dirname, 'harness', 'zoptro_contract_oracle.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const gasBackendContent = fs.readFileSync(gasBackendPath, 'utf8');
const { ZoptroContractOracle } = require(oraclePath);

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
        clearRect: () => {}, save: () => {}, restore: () => {},
        translate: () => {}, rotate: () => {}, fillRect: () => {},
        beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {}
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
          connect: () => {}, start: () => {}, stop: () => {},
          frequency: { setValueAtTime: () => {} }, type: ''
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
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
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
    BrowserMockBackend,
    ZoptroApiClient
  };
}

function createGasBackendEnvironment() {
  const gasSandbox = {
    Logger: { log: () => {} },
    Utilities: {
      computeDigest: () => [1, 2, 3],
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      base64Encode: () => 'hash'
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        releaseLock: () => {}
      })
    },
    SpreadsheetApp: {},
    console: console,
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    JSON: JSON,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object
  };

  // Extract helper functions and verifyRolePin from google_apps_script_backend.js
  vm.createContext(gasSandbox);
  vm.runInContext(gasBackendContent, gasSandbox);
  return gasSandbox;
}

async function runProbes() {
  let passed = 0;
  let failed = 0;

  function record(id, desc, ok, details = '') {
    if (ok) {
      console.log(`  🛡️  [DEFENDED] ${id}: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [BREACHED] ${id}: ${desc} — ${details}`);
      failed++;
    }
  }

  const env = createSandboxEnvironment();
  const { sandbox, domElements, BrowserMockBackend, ZoptroApiClient } = env;

  console.log('--- PROBE SET 1: verifyRolePin Contract Boundary Probes ---');

  // Probe 1.1: verifyRolePin with null / undefined payload
  try {
    const resNull = BrowserMockBackend.verifyRolePin(null);
    const ok = resNull && resNull.success === false && resNull.verified === false && resNull.error === 'MISSING_VERIFICATION_FIELDS';
    record('PROBE-PIN-01', 'verifyRolePin(null) safely rejects with MISSING_VERIFICATION_FIELDS', ok, JSON.stringify(resNull));
  } catch (err) {
    record('PROBE-PIN-01', 'verifyRolePin(null) safely rejects with MISSING_VERIFICATION_FIELDS', false, err.message);
  }

  // Probe 1.2: verifyRolePin with empty payload {}
  try {
    const resEmpty = BrowserMockBackend.verifyRolePin({});
    const ok = resEmpty && resEmpty.success === false && resEmpty.verified === false && resEmpty.error === 'MISSING_VERIFICATION_FIELDS';
    record('PROBE-PIN-02', 'verifyRolePin({}) safely rejects with MISSING_VERIFICATION_FIELDS', ok, JSON.stringify(resEmpty));
  } catch (err) {
    record('PROBE-PIN-02', 'verifyRolePin({}) safely rejects with MISSING_VERIFICATION_FIELDS', false, err.message);
  }

  // Probe 1.3: Non-existent user ID
  try {
    const resNoUser = BrowserMockBackend.verifyRolePin({ userId: 'u_ghost_invalid_99999', pin: '9999', targetRole: 'admin' });
    const ok = resNoUser && resNoUser.success === false && resNoUser.verified === false && resNoUser.error === 'USER_NOT_FOUND';
    record('PROBE-PIN-03', 'Non-existent userId returns USER_NOT_FOUND with verified=false', ok, JSON.stringify(resNoUser));
  } catch (err) {
    record('PROBE-PIN-03', 'Non-existent userId returns USER_NOT_FOUND with verified=false', false, err.message);
  }

  // Probe 1.4: Student account attempting targetRole=admin
  try {
    const resMismatch = BrowserMockBackend.verifyRolePin({ userId: 'u_stu_demo', pin: '1234', targetRole: 'admin' });
    const ok = resMismatch && resMismatch.success === false && resMismatch.verified === false && resMismatch.error === 'TARGET_ROLE_MISMATCH';
    record('PROBE-PIN-04', 'Student attempting targetRole=admin returns TARGET_ROLE_MISMATCH', ok, JSON.stringify(resMismatch));
  } catch (err) {
    record('PROBE-PIN-04', 'Student attempting targetRole=admin returns TARGET_ROLE_MISMATCH', false, err.message);
  }

  // Probe 1.5: Parent account attempting targetRole=admin
  try {
    const resParMismatch = BrowserMockBackend.verifyRolePin({ userId: 'u_par_demo', pin: '1234', targetRole: 'admin' });
    const ok = resParMismatch && resParMismatch.success === false && resParMismatch.verified === false && resParMismatch.error === 'TARGET_ROLE_MISMATCH';
    record('PROBE-PIN-05', 'Parent attempting targetRole=admin returns TARGET_ROLE_MISMATCH', ok, JSON.stringify(resParMismatch));
  } catch (err) {
    record('PROBE-PIN-05', 'Parent attempting targetRole=admin returns TARGET_ROLE_MISMATCH', false, err.message);
  }

  // Probe 1.6: Case-insensitivity in targetRole ('ADMIN', 'Admin')
  try {
    const resUpper = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: '9999', targetRole: 'ADMIN' });
    const ok = resUpper && resUpper.success === true && resUpper.verified === true && resUpper.verifiedRole === 'admin';
    record('PROBE-PIN-06', 'targetRole case-insensitivity (ADMIN -> admin) verifies successfully', ok, JSON.stringify(resUpper));
  } catch (err) {
    record('PROBE-PIN-06', 'targetRole case-insensitivity verifies successfully', false, err.message);
  }

  // Probe 1.7: PIN whitespace trimming
  try {
    const resTrim = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: '   9999   ', targetRole: 'admin' });
    const ok = resTrim && resTrim.success === true && resTrim.verified === true;
    record('PROBE-PIN-07', 'PIN whitespace trimming accepts padded authentic PIN "   9999   "', ok, JSON.stringify(resTrim));
  } catch (err) {
    record('PROBE-PIN-07', 'PIN whitespace trimming accepts padded authentic PIN', false, err.message);
  }

  // Probe 1.8: Incorrect admin PINs return success=true, verified=false, error=INVALID_ROLE_PIN
  const badPins = ['0000', '1234', '9998', 'admin', 'password', "' OR '1'='1", '<script>alert(1)</script>'];
  let allBadRejected = true;
  for (const bp of badPins) {
    const resBad = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: bp, targetRole: 'admin' });
    if (!resBad || resBad.verified !== false || resBad.error !== 'INVALID_ROLE_PIN') {
      allBadRejected = false;
      console.error(`      Failed rejection on: "${bp}" =>`, resBad);
      break;
    }
  }
  record('PROBE-PIN-08', 'Diverse inauthentic PINs return verified=false & error=INVALID_ROLE_PIN', allBadRejected);

  // Probe 1.9: Lazy seeding idempotency: multiple resets and calls
  BrowserMockBackend.resetDatabase();
  const resAfterReset = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: '9999', targetRole: 'admin' });
  const okLazy = resAfterReset && resAfterReset.success === true && resAfterReset.verified === true;
  record('PROBE-PIN-09', 'Lazy admin seed automatically re-provisions u_adm_demo immediately after resetDatabase()', okLazy, JSON.stringify(resAfterReset));

  // Probe 1.10: Admin password authentication ('adminPass123')
  const resPass = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: 'adminPass123', targetRole: 'admin' });
  const okPass = resPass && resPass.success === true && resPass.verified === true && resPass.verifiedRole === 'admin';
  record('PROBE-PIN-10', 'Authentic Admin Password ("adminPass123") verifies successfully via verifyRolePin', okPass, JSON.stringify(resPass));

  console.log('\n--- PROBE SET 2: activateAdminRole & UI Tamper Resistance ---');

  // Probe 2.1: Direct invocation of activateAdminRole() from student session
  sandbox.currentUser = { id: 'u_stu_demo', role: 'student', fullName: 'Commander Divyank' };
  sandbox.currentRole = 'divyank';
  domElements['adminAuthorizedContainer'].classList.add('hidden');
  domElements['adminUnauthorizedCard'].classList.remove('hidden');

  sandbox.activateAdminRole();

  // Because currentUser.role is still 'student', renderAdminView() must keep adminAuthorizedContainer hidden!
  const probe2_1_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const probe2_1_unauthVisible = !domElements['adminUnauthorizedCard'].classList.contains('hidden');
  record(
    'PROBE-ACT-01',
    'Calling activateAdminRole() while currentUser.role is student fails closed (authorized container remains HIDDEN)',
    probe2_1_authHidden && probe2_1_unauthVisible,
    `authHidden=${probe2_1_authHidden}, unauthVisible=${probe2_1_unauthVisible}`
  );

  // Probe 2.2: Direct call to renderAdminView() with spoofed currentRole
  sandbox.currentUser = { id: 'u_stu_demo', role: 'student' };
  sandbox.currentRole = 'admin'; // attacker spoofed currentRole variable
  sandbox.renderAdminView();

  const probe2_2_blocked = domElements['adminAuthorizedContainer'].classList.contains('hidden') &&
                           !domElements['adminUnauthorizedCard'].classList.contains('hidden');
  record(
    'PROBE-ACT-02',
    'Spoofing currentRole="admin" while currentUser is student fails closed in renderAdminView()',
    probe2_2_blocked,
    `authHidden=${domElements['adminAuthorizedContainer'].classList.contains('hidden')}`
  );

  // Probe 2.3: setUserRole('admin') when logged in as student triggers modal prompt, NOT instant elevation
  sandbox.currentUser = { id: 'u_stu_demo', role: 'student' };
  sandbox.currentRole = 'divyank';
  domElements['adminPinModal'].classList.add('hidden');

  sandbox.setUserRole('admin');

  const probe2_3_promptOpened = !domElements['adminPinModal'].classList.contains('hidden');
  const probe2_3_stillStudent = sandbox.currentRole === 'divyank' && sandbox.currentUser.role === 'student';
  record(
    'PROBE-ACT-03',
    'setUserRole("admin") from student session strictly opens PIN prompt modal without activating admin',
    probe2_3_promptOpened && probe2_3_stillStudent,
    `promptOpened=${probe2_3_promptOpened}, currentRole=${sandbox.currentRole}`
  );

  // Probe 2.4: Submitting empty PIN to verifyAdminPinChallenge() keeps modal open and shows error
  domElements['adminSwitchPin'].value = '';
  domElements['adminSwitchPinError'].classList.add('hidden');
  sandbox.verifyAdminPinChallenge();

  const probe2_4_modalOpen = !domElements['adminPinModal'].classList.contains('hidden');
  const probe2_4_errShown = !domElements['adminSwitchPinError'].classList.contains('hidden');
  record(
    'PROBE-ACT-04',
    'Submitting empty PIN to verifyAdminPinChallenge halts immediately, displays error, and keeps modal open',
    probe2_4_modalOpen && probe2_4_errShown
  );

  // Probe 2.5: Submitting incorrect PIN (0000) displays Access Denied and does not elevate
  domElements['adminSwitchPin'].value = '0000';
  sandbox.verifyAdminPinChallenge();
  await new Promise(r => setTimeout(r, 25));

  const probe2_5_authHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const probe2_5_notAdmin = sandbox.currentUser.role === 'student';
  const probe2_5_errVisible = !domElements['adminSwitchPinError'].classList.contains('hidden') &&
                              domElements['adminSwitchPinError'].innerText.includes('Incorrect');
  record(
    'PROBE-ACT-05',
    'Submitting incorrect PIN (0000) displays Access Denied, leaves currentUser unchanged, keeps admin hidden',
    probe2_5_authHidden && probe2_5_notAdmin && probe2_5_errVisible,
    `authHidden=${probe2_5_authHidden}, notAdmin=${probe2_5_notAdmin}, errVisible=${probe2_5_errVisible}`
  );

  // Probe 2.6: Submitting authentic Admin PIN (9999) fully elevates session, closes modal, and reveals admin container
  domElements['adminSwitchPin'].value = '9999';
  sandbox.verifyAdminPinChallenge();
  await new Promise(r => setTimeout(r, 25));

  const probe2_6_elevated = sandbox.currentUser.role === 'admin' && sandbox.currentRole === 'admin';
  const probe2_6_modalClosed = domElements['adminPinModal'].classList.contains('hidden');
  const probe2_6_authRevealed = !domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const probe2_6_unauthHidden = domElements['adminUnauthorizedCard'].classList.contains('hidden');
  record(
    'PROBE-ACT-06',
    'Submitting authentic Admin PIN (9999) elevates role, closes modal, reveals container, hides unauthorized card',
    probe2_6_elevated && probe2_6_modalClosed && probe2_6_authRevealed && probe2_6_unauthHidden,
    `elevated=${probe2_6_elevated}, modalClosed=${probe2_6_modalClosed}, authRevealed=${probe2_6_authRevealed}`
  );

  // Probe 2.7: Switching role back to student hides #view-admin, and subsequent switchTab('admin') halts at PIN challenge
  sandbox.setUserRole('divyank');
  const probe2_7_viewAdminHidden = domElements['view-admin'].classList.contains('hidden');
  const probe2_7_roleStudent = sandbox.currentRole === 'divyank';
  
  // Attempting to navigate back to admin view halts at PIN prompt
  sandbox.switchTab('admin');
  const probe2_7_pinPromptOpened = !domElements['adminPinModal'].classList.contains('hidden');
  const probe2_7_viewAdminStillHidden = domElements['view-admin'].classList.contains('hidden');
  record(
    'PROBE-ACT-07',
    'Switching to student role conceals #view-admin; switchTab("admin") halts at PIN prompt without revealing admin view',
    probe2_7_viewAdminHidden && probe2_7_roleStudent && probe2_7_pinPromptOpened && probe2_7_viewAdminStillHidden,
    `viewAdminHidden=${probe2_7_viewAdminHidden}, role=${sandbox.currentRole}, pinPromptOpened=${probe2_7_pinPromptOpened}`
  );

  // Probe 2.8: Calling logoutUser() completely purges session, resets currentUser to student, and revokes admin UI
  sandbox.logoutUser();
  const probe2_8_studentUser = sandbox.currentUser && sandbox.currentUser.role === 'student';
  const probe2_8_studentRole = sandbox.currentRole === 'divyank';
  const probe2_8_tabAdminHidden = domElements['tab-admin'].classList.contains('hidden');
  const probe2_8_btnAdminHidden = domElements['roleBtnAdmin'].classList.contains('hidden');

  sandbox.renderAdminView();
  const probe2_8_authContainerHidden = domElements['adminAuthorizedContainer'].classList.contains('hidden');
  const probe2_8_unauthCardVisible = !domElements['adminUnauthorizedCard'].classList.contains('hidden');
  record(
    'PROBE-ACT-08',
    'logoutUser() purges session, resets currentUser to student, conceals #tab-admin, and enforces fail-closed renderAdminView',
    probe2_8_studentUser && probe2_8_studentRole && probe2_8_tabAdminHidden && probe2_8_btnAdminHidden && probe2_8_authContainerHidden && probe2_8_unauthCardVisible,
    `studentUser=${probe2_8_studentUser}, tabHidden=${probe2_8_tabAdminHidden}, authHidden=${probe2_8_authContainerHidden}`
  );

  console.log('\n--- PROBE SET 3: Multi-Engine Contract Parity Probes ---');

  const oracle = new ZoptroContractOracle();

  // Probe 3.1: Contract Parity for Authentic Admin PIN (9999)
  const mockRes3_1 = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: '9999', targetRole: 'admin' });
  const oracleRes3_1 = await oracle.verifyRolePin({ userId: 'u_adm_demo', pin: '9999', targetRole: 'admin' });
  const parity3_1 = mockRes3_1.success === true && mockRes3_1.verified === true &&
                    oracleRes3_1.success === true && oracleRes3_1.verified === true;
  record('PROBE-PAR-01', 'Multi-engine contract parity for authentic Admin PIN 9999 (Mock & Oracle return verified: true)', parity3_1, `mock=${JSON.stringify(mockRes3_1)}, oracle=${JSON.stringify(oracleRes3_1)}`);

  // Probe 3.2: Contract Parity for Inauthentic PIN (0000)
  const mockRes3_2 = BrowserMockBackend.verifyRolePin({ userId: 'u_adm_demo', pin: '0000', targetRole: 'admin' });
  const oracleRes3_2 = await oracle.verifyRolePin({ userId: 'u_adm_demo', pin: '0000', targetRole: 'admin' });
  const parity3_2 = mockRes3_2.verified === false && oracleRes3_2.verified === false;
  record('PROBE-PAR-02', 'Multi-engine contract parity for inauthentic PIN 0000 (Mock & Oracle return verified: false)', parity3_2, `mock=${JSON.stringify(mockRes3_2)}, oracle=${JSON.stringify(oracleRes3_2)}`);

  // Probe 3.3: Contract Parity for Target Role Mismatch
  const mockRes3_3 = BrowserMockBackend.verifyRolePin({ userId: 'u_stu_demo', pin: '1234', targetRole: 'admin' });
  const oracleRes3_3 = await oracle.verifyRolePin({ userId: 'u_stu_demo', pin: '1234', targetRole: 'admin' });
  const parity3_3 = mockRes3_3.verified === false && oracleRes3_3.verified === false;
  record('PROBE-PAR-03', 'Multi-engine contract parity for role mismatch (Mock & Oracle return verified: false)', parity3_3, `mock=${JSON.stringify(mockRes3_3)}, oracle=${JSON.stringify(oracleRes3_3)}`);

  // Probe 3.4: Contract Parity for Missing Payload
  const mockRes3_4 = BrowserMockBackend.verifyRolePin(null);
  const oracleRes3_4 = await oracle.verifyRolePin(null);
  const parity3_4 = mockRes3_4.verified === false && mockRes3_4.success === false &&
                    oracleRes3_4.verified === false && oracleRes3_4.success === false;
  record('PROBE-PAR-04', 'Multi-engine contract parity for null payload (Mock & Oracle return verified: false & success: false)', parity3_4, `mock=${JSON.stringify(mockRes3_4)}, oracle=${JSON.stringify(oracleRes3_4)}`);

  console.log('\n====================================================================');
  console.log(`🏁 BOUNDARY PROBE SUITE SUMMARY: ${passed} DEFENDED / ${failed} BREACHED`);
  console.log(`   TOTAL ADDITIONAL BOUNDARY PROBES EXECUTED: ${passed + failed}`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runProbes().catch(err => {
  console.error('Fatal probe runner error:', err);
  process.exit(1);
});
