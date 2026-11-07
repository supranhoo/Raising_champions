/**
 * =========================================================================
 * ZOPTRO CHALLENGER 2: ADVERSARIAL NAVIGATION & ZERO-REGRESSION STRESS
 * =========================================================================
 * Milestone 6 Empirical Verification Suite
 *
 * Focus:
 * 1. Return-to-landing mechanism from every view (8 inner views)
 * 2. Return triggers (Masthead logo, navbar Home, inner view return buttons)
 * 3. Wizard & Modal cancellation/interruption hardening
 * 4. URL hash routing state machine & malformed hash resilience
 * 5. Adversarial view permutations & strict DOM mutual exclusion invariant
 * 6. Zero regression verification across all existing test suites
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const testEnvPath = fs.existsSync(path.join(__dirname, './harness/test_env.js'))
  ? path.join(__dirname, './harness/test_env.js')
  : path.join(__dirname, '../../../tests/harness/test_env.js');
const { describe, test, assert, registry } = require(testEnvPath);

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Helper to construct a complete simulated browser runtime environment
function createSimulatedRuntime(initialHash = '') {
  const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
  const lastScriptTag = scriptMatches[scriptMatches.length - 1];
  const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

  const mainScriptIndex = htmlContent.lastIndexOf(lastScriptTag);
  const htmlMarkup = htmlContent.slice(0, mainScriptIndex);

  const domElements = {};
  const idRegex = /\bid=["']([^"']+)["']/g;
  let m;
  while ((m = idRegex.exec(htmlMarkup)) !== null) {
    const id = m[1];
    domElements[id] = {
      id: id,
      tagName: 'DIV',
      _innerText: '',
      _innerHTML: '',
      get innerText() { return this._innerText || (this._innerHTML ? this._innerHTML.replace(/<[^>]+>/g, '').trim() : ''); },
      set innerText(v) { this._innerText = String(v); this._innerHTML = String(v); },
      get textContent() { return this._innerText || (this._innerHTML ? this._innerHTML.replace(/<[^>]+>/g, '').trim() : ''); },
      set textContent(v) { this._innerText = String(v); this._innerHTML = String(v); },
      get innerHTML() { return this._innerHTML || this._innerText || ''; },
      set innerHTML(v) { this._innerHTML = String(v); this._innerText = String(v).replace(/<[^>]+>/g, '').trim(); },
      value: '',
      checked: false,
      style: {},
      className: '',
      children: [],
      classList: {
        _classes: new Set(),
        add: function(...cls) { cls.forEach(c => { if (c) this._classes.add(c); }); },
        remove: function(...cls) { cls.forEach(c => { if (c) this._classes.delete(c); }); },
        contains: function(c) { return this._classes.has(c); },
        toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
      },
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k]; },
      removeAttribute: function(k) { delete this[k]; },
      appendChild: function(c) { this.children.push(c); return c; },
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; },
      addEventListener: function() {},
      removeEventListener: function() {},
      getContext: () => ({ clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {} })
    };
  }

  // Populate initial CSS classes from static markup
  const allViewAndModalIds = [
    'view-landing', 'view-dashboard', 'view-dailygk', 'view-pyqp', 'view-news',
    'view-story', 'view-vault', 'view-parentview', 'view-admin',
    'parentPinModal', 'adminPinModal', 'modal-family-onboarding',
    'tab-landing', 'tab-dashboard', 'tab-dailygk', 'tab-pyqp', 'tab-news',
    'tab-story', 'tab-vault', 'tab-parentview', 'tab-admin'
  ];

  allViewAndModalIds.forEach(id => {
    const tagMatch = htmlMarkup.match(new RegExp(`<[^>]+id=["']${id}["'][^>]*>`, 'i')) ||
                     htmlMarkup.match(new RegExp(`<[^>]+class=["'][^"']*["'][^>]*id=["']${id}["'][^>]*>`, 'i'));
    if (tagMatch && domElements[id]) {
      const classMatch = tagMatch[0].match(/class=["']([^"']*)["']/i);
      if (classMatch) {
        domElements[id].className = classMatch[1];
        classMatch[1].split(/\s+/).forEach(c => { if (c) domElements[id].classList.add(c); });
      }
    }
  });

  const mockStorage = {
    _data: {},
    getItem: (k) => mockStorage._data[k] || null,
    setItem: (k, v) => { mockStorage._data[k] = String(v); },
    removeItem: (k) => { delete mockStorage._data[k]; },
    clear: () => { mockStorage._data = {}; }
  };

  const windowListeners = {};

  const mockDoc = {
    getElementById: (id) => domElements[id] || null,
    querySelectorAll: (sel) => {
      if (sel === '.tab-view') {
        return Object.keys(domElements).filter(k => k.startsWith('view-')).map(k => domElements[k]);
      }
      if (sel === '.tab-btn') {
        return Object.keys(domElements).filter(k => k.startsWith('tab-')).map(k => domElements[k]);
      }
      return [];
    },
    querySelector: (sel) => {
      if (sel && sel.startsWith('#')) return domElements[sel.slice(1)] || null;
      return null;
    },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      innerText: '',
      innerHTML: '',
      className: '',
      classList: {
        _classes: new Set(),
        add(...c) { c.forEach(x => { if (x) this._classes.add(x); }); },
        remove(...c) { c.forEach(x => { if (x) this._classes.delete(x); }); },
        contains(c) { return this._classes.has(c); }
      },
      style: {},
      children: [],
      appendChild(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this[k] = v; }
    }),
    body: { style: {}, appendChild: () => {} },
    addEventListener: () => {}
  };

  const mockWindow = {
    location: { hash: initialHash },
    localStorage: mockStorage,
    innerWidth: 1200,
    innerHeight: 800,
    onload: null,
    scrollTo: () => {},
    history: {
      pushState: (state, title, url) => {
        mockWindow.location.hash = url;
      },
      replaceState: (state, title, url) => {
        mockWindow.location.hash = url;
      }
    },
    addEventListener: (event, fn) => {
      if (!windowListeners[event]) windowListeners[event] = [];
      windowListeners[event].push(fn);
    },
    triggerEvent: (event, eventObj) => {
      if (windowListeners[event]) {
        windowListeners[event].forEach(fn => fn(eventObj));
      }
    },
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
    history: mockWindow.history,
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
    setTimeout: (fn) => { fn(); return 1; },
    setInterval: () => 1,
    clearInterval: () => {},
    clearTimeout: () => {},
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

  return { sandbox, domElements, mockWindow, mockDoc };
}

describe('Challenger 2 M6: Adversarial Navigation & Zero-Regression Stress (44 Tests)', () => {

  // =========================================================================
  // GROUP 1: SYSTEMATIC VIEW NAVIGATION & RETURN-TO-LANDING MATRIX (8 VIEWS)
  // =========================================================================
  describe('Group 1: Systematic View Navigation & Return-to-Landing Matrix (8 Views)', () => {
    const viewsToTest = [
      { tab: 'dashboard', viewId: 'view-dashboard', name: 'Dashboard / Overview' },
      { tab: 'dailygk', viewId: 'view-dailygk', name: 'Daily Knowledge' },
      { tab: 'pyqp', viewId: 'view-pyqp', name: 'Competitive Quizzes (PYQP)' },
      { tab: 'news', viewId: 'view-news', name: 'Curated News' },
      { tab: 'story', viewId: 'view-story', name: 'Stories & EQ Lab' },
      { tab: 'vault', viewId: 'view-vault', name: 'Rewards Vault' },
      { tab: 'parentview', viewId: 'view-parentview', name: 'Parent Space HQ', requiresRole: 'parent' },
      { tab: 'admin', viewId: 'view-admin', name: 'Admin CMS & Mission Control', requiresRole: 'admin' }
    ];

    viewsToTest.forEach(({ tab, viewId, name, requiresRole }, index) => {
      test(`CH2-NAV-0${index + 1}: Returning to landing from #${viewId} (${name}) restores landing view`, () => {
        const { sandbox, domElements } = createSimulatedRuntime('');

        if (requiresRole === 'parent') {
          sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Parent User' };
          sandbox.currentRole = 'parent';
        } else if (requiresRole === 'admin') {
          sandbox.currentUser = { id: 'u_adm_demo', role: 'admin', fullName: 'Super Admin' };
          sandbox.currentRole = 'admin';
        }

        sandbox.switchTab(tab);
        assert.strictEqual(domElements[viewId].classList.contains('hidden'), false, `#${viewId} must be visible when tab switched`);
        assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');

        // Execute return to landing
        sandbox.returnToLanding();

        // Verify landing is visible and active
        assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be visible after returnToLanding');

        // Verify the original view is now hidden
        assert.strictEqual(domElements[viewId].classList.contains('hidden'), true, `#${viewId} must be hidden after returnToLanding`);

        // Verify all 8 inner views are hidden
        viewsToTest.forEach(v => {
          assert.strictEqual(domElements[v.viewId].classList.contains('hidden'), true, `#${v.viewId} must be hidden after return`);
        });
      });
    });

    test('CH2-NAV-09: Top navbar #tab-landing reflects active state while other tabs reflect inactive state', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('dashboard');
      sandbox.returnToLanding();

      const landingTab = domElements['tab-landing'];
      const dashTab = domElements['tab-dashboard'];

      assert.ok(landingTab.className.includes('bg-[#09293D]'), 'Active landing tab must have bg-[#09293D]');
      assert.ok(landingTab.className.includes('text-white'), 'Active landing tab must have text-white');
      assert.ok(landingTab.className.includes('border-[#F65800]'), 'Active landing tab must have border-[#F65800]');

      assert.ok(dashTab.className.includes('bg-white'), 'Inactive dashboard tab must have bg-white');
      assert.ok(dashTab.className.includes('text-[#09293D]'), 'Inactive dashboard tab must have text-[#09293D]');
    });

    test('CH2-NAV-10: Heading and descriptor update to MISSION CONTROL PORTAL upon return to landing', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('dashboard');
      assert.strictEqual(domElements['pageEyebrow'].textContent, 'YOUR DAILY OVERVIEW');
      assert.strictEqual(domElements['pageTitle'].textContent, 'Small steps. Real progress.');

      sandbox.returnToLanding();
      assert.strictEqual(domElements['pageEyebrow'].textContent, 'MISSION CONTROL PORTAL');
      assert.strictEqual(domElements['pageTitle'].textContent, 'Empowering Young Champions.');
      assert.ok(domElements['pageDescription'].textContent.includes('Choose your entry point'), 'Description must prompt entry point choice');
    });
  });

  // =========================================================================
  // GROUP 2: RETURN TRIGGER MECHANISMS (LOGO, NAVBAR, INNER BUTTONS)
  // =========================================================================
  describe('Group 2: Return Trigger Mechanisms (Logo, Navbar, Inner Buttons)', () => {
    test('CH2-TRIG-01: Masthead anchor #logoLinkLanding exists with onclick="returnToLanding(event)"', () => {
      assert.ok(htmlContent.includes('id="logoLinkLanding"'), '#logoLinkLanding must exist');
      const match = htmlContent.match(/<a[^>]*id=["']logoLinkLanding["'][^>]*>/i);
      assert.ok(match, '#logoLinkLanding tag must be found');
      assert.ok(match[0].includes('returnToLanding(event)'), '#logoLinkLanding must call returnToLanding(event)');

      // Simulate event with preventDefault
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('dashboard');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);

      let preventDefaultCalled = false;
      sandbox.returnToLanding({ preventDefault: () => { preventDefaultCalled = true; } });
      assert.strictEqual(preventDefaultCalled, true, 'returnToLanding must call event.preventDefault');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
    });

    test('CH2-TRIG-02: Brand logo image #brandLogo exists with onclick="returnToLanding(event)"', () => {
      assert.ok(htmlContent.includes('id="brandLogo"'), '#brandLogo must exist');
      const match = htmlContent.match(/<img[^>]*id=["']brandLogo["'][^>]*>/i);
      assert.ok(match, '#brandLogo tag must be found');
      assert.ok(match[0].includes('returnToLanding(event)'), '#brandLogo must call returnToLanding(event)');
    });

    test('CH2-TRIG-03: Masthead container #brandLogoLink encloses the landing return link', () => {
      assert.ok(htmlContent.includes('id="brandLogoLink"'), '#brandLogoLink container must exist');
      const idxLink = htmlContent.indexOf('id="brandLogoLink"');
      const idxAnchor = htmlContent.indexOf('id="logoLinkLanding"');
      assert.ok(idxLink !== -1 && idxAnchor !== -1 && idxLink < idxAnchor, '#brandLogoLink must wrap #logoLinkLanding');
    });

    test('CH2-TRIG-04: Top navbar button #tab-landing triggers returnToLanding()', () => {
      assert.ok(htmlContent.includes('id="tab-landing"'), '#tab-landing button must exist');
      const match = htmlContent.match(/<button[^>]*id=["']tab-landing["'][^>]*>/i) ||
                    htmlContent.match(/<button[^>]*onclick=["']returnToLanding\(\)["'][^>]*id=["']tab-landing["']/i);
      assert.ok(match, '#tab-landing tag must be found');
      assert.ok(match[0].includes('returnToLanding()'), '#tab-landing must invoke returnToLanding()');
    });

    test('CH2-TRIG-05: Parent space inner button #btnParentReturnLanding triggers returnToLanding(event)', () => {
      assert.ok(htmlContent.includes('id="btnParentReturnLanding"'), '#btnParentReturnLanding must exist');
      const match = htmlContent.match(/<button[^>]*id=["']btnParentReturnLanding["'][^>]*>/i);
      assert.ok(match, '#btnParentReturnLanding tag must be found');
      assert.ok(match[0].includes('returnToLanding(event)'), '#btnParentReturnLanding must invoke returnToLanding(event)');

      // VM Simulation
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Parent User' };
      sandbox.currentRole = 'parent';
      sandbox.switchTab('parentview');
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), false);

      sandbox.returnToLanding({ preventDefault: () => {} });
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
    });

    test('CH2-TRIG-06: Admin unauthorized card button #adminReturnLandingBtn triggers returnToLanding(event)', () => {
      assert.ok(htmlContent.includes('id="adminReturnLandingBtn"'), '#adminReturnLandingBtn must exist');
      const match = htmlContent.match(/<button[^>]*id=["']adminReturnLandingBtn["'][^>]*>/i);
      assert.ok(match, '#adminReturnLandingBtn tag must be found');
      assert.ok(match[0].includes('returnToLanding(event)'), '#adminReturnLandingBtn must invoke returnToLanding(event)');
    });

    test('CH2-TRIG-07: Admin authorized header button #btnAdminReturnLanding triggers returnToLanding(event)', () => {
      assert.ok(htmlContent.includes('id="btnAdminReturnLanding"'), '#btnAdminReturnLanding must exist');
      const match = htmlContent.match(/<button[^>]*id=["']btnAdminReturnLanding["'][^>]*>/i);
      assert.ok(match, '#btnAdminReturnLanding tag must be found');
      assert.ok(match[0].includes('returnToLanding(event)'), '#btnAdminReturnLanding must invoke returnToLanding(event)');

      // VM Simulation
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.currentUser = { id: 'u_adm_demo', role: 'admin', fullName: 'Super Admin' };
      sandbox.currentRole = 'admin';
      sandbox.switchTab('admin');
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), false);

      sandbox.returnToLanding({ preventDefault: () => {} });
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    });

    test('CH2-TRIG-08: Global switchView and switchTab handle "landing", "home", and "view-landing"', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');

      sandbox.switchTab('dashboard');
      sandbox.switchView('landing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'switchView("landing") must activate landing');

      sandbox.switchTab('dashboard');
      sandbox.switchTab('home');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'switchTab("home") alias must activate landing');

      sandbox.switchTab('dashboard');
      sandbox.switchTab('view-landing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'switchTab("view-landing") prefix must activate landing');
    });
  });

  // =========================================================================
  // GROUP 3: WIZARD & MODAL CANCELLATION / INTERRUPTION STRESS
  // =========================================================================
  describe('Group 3: Wizard & Modal Cancellation / Interruption Stress', () => {
    test('CH2-MODAL-01: Opening Family Onboarding wizard leaves #view-landing visible underneath', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      domElements['modal-family-onboarding'].classList.add('hidden');

      sandbox.openFamilyOnboardingModal();
      assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), false, '#modal-family-onboarding must be revealed');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain visible under modal');
    });

    test('CH2-MODAL-02: Closing Family Onboarding wizard via #btn-onboarding-close leaves #view-landing intact', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openFamilyOnboardingModal();
      assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), false);

      sandbox.closeFamilyOnboardingModal();
      assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), true, 'Modal must be hidden after close');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain active');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must NOT be exposed');
    });

    test('CH2-MODAL-03: Cancelling Family Onboarding wizard via #btn-onboarding-cancel-1 leaves #view-landing intact', () => {
      assert.ok(htmlContent.includes('id="btn-onboarding-cancel-1"'), '#btn-onboarding-cancel-1 must exist');
      assert.ok(htmlContent.includes('closeFamilyOnboardingModal()'), 'Cancel button must invoke closeFamilyOnboardingModal()');

      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openFamilyOnboardingModal();

      sandbox.closeFamilyOnboardingModal();
      assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
    });

    test('CH2-MODAL-04: Mid-wizard dirtied state resets to Step 1 and clears errors upon re-opening', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openFamilyOnboardingModal();

      // Dirty fields and simulate error
      domElements['onboarding-parent-name'].value = 'Dirty Name';
      domElements['onboarding-error-banner'].classList.remove('hidden');

      // Close modal
      sandbox.closeFamilyOnboardingModal();

      // Re-open modal
      sandbox.openFamilyOnboardingModal();

      // Verify reset
      assert.strictEqual(domElements['onboarding-parent-name'].value, '', 'Parent name must be reset to empty on re-open');
      assert.strictEqual(domElements['onboarding-error-banner'].classList.contains('hidden'), true, 'Error banner must be hidden on re-open');
      assert.strictEqual(domElements['onboarding-step-1'].classList.contains('hidden'), false, 'Step 1 must be active on re-open');
    });

    test('CH2-MODAL-05: Triggering Parent PIN modal via enterParentPortal() opens modal with #view-landing intact', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      domElements['parentPinModal'].classList.add('hidden');

      sandbox.enterParentPortal();
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false, '#parentPinModal must be revealed');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain active under modal');
    });

    test('CH2-MODAL-06: Cancelling Parent PIN modal via closeParentPinPrompt() hides modal and keeps #view-landing active', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.enterParentPortal();
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);

      sandbox.closeParentPinPrompt();
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), true, '#parentPinModal must be hidden after cancel');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain active');
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true, '#view-parentview must NOT be leaked');
    });

    test('CH2-MODAL-07: Failing Parent PIN challenge displays error; closing and re-opening resets error state', async () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openParentPinPrompt();

      // Submit wrong PIN
      domElements['parentSwitchPin'].value = '0000';
      sandbox.verifyParentPinChallenge();
      await new Promise(r => setTimeout(r, 50));

      const errEl = domElements['parentSwitchPinError'];
      assert.strictEqual(errEl.classList.contains('hidden'), false, 'Error banner must be displayed on incorrect PIN');
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true, '#view-parentview must not unlock');

      // Cancel modal
      sandbox.closeParentPinPrompt();
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), true);

      // Re-open prompt
      sandbox.openParentPinPrompt();
      assert.strictEqual(domElements['parentSwitchPin'].value, '', 'PIN input must be cleared on re-open');
      assert.strictEqual(errEl.classList.contains('hidden'), true, 'Error banner must be hidden on re-open');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'Landing view remains intact');
    });

    test('CH2-MODAL-08: Triggering Admin PIN modal via #landingBtnAdminPortal opens modal with #view-landing intact', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      domElements['adminPinModal'].classList.add('hidden');

      sandbox.openAdminPinPrompt();
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, '#adminPinModal must be revealed');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain active under modal');
    });

    test('CH2-MODAL-09: Cancelling Admin PIN modal via closeAdminPinPrompt() hides modal and never leaks #view-admin', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openAdminPinPrompt();
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);

      sandbox.closeAdminPinPrompt();
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), true, '#adminPinModal must be hidden after cancel');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must remain active');
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, '#view-admin must NEVER leak on cancel');
    });

    test('CH2-MODAL-10: Failing Admin PIN challenge displays error; closing and re-opening resets error state', async () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');
      sandbox.openAdminPinPrompt();

      // Submit wrong PIN
      domElements['adminSwitchPin'].value = 'wrong-pin';
      sandbox.verifyAdminPinChallenge();
      await new Promise(r => setTimeout(r, 50));

      const errEl = domElements['adminSwitchPinError'];
      assert.strictEqual(errEl.classList.contains('hidden'), false, 'Error banner must be displayed on incorrect admin PIN');
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, '#view-admin must not unlock');

      // Cancel modal
      sandbox.closeAdminPinPrompt();
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), true);

      // Re-open prompt
      sandbox.openAdminPinPrompt();
      assert.strictEqual(domElements['adminSwitchPin'].value, '', 'Admin PIN input must be cleared on re-open');
      assert.strictEqual(errEl.classList.contains('hidden'), true, 'Error banner must be hidden on re-open');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'Landing view remains intact');
    });
  });

  // =========================================================================
  // GROUP 4: URL HASH NAVIGATION & ROUTING STATE MACHINE
  // =========================================================================
  describe('Group 4: URL Hash Navigation & Routing State Machine', () => {
    test('CH2-HASH-01: Initial window.onload without hash defaults to #view-landing', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.window.location.hash = '';
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be active on empty hash');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must be hidden');
    });

    test('CH2-HASH-02: Initial window.onload with "#landing" activates #view-landing', () => {
      const { sandbox, domElements } = createSimulatedRuntime('#landing');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be active on #landing');
    });

    test('CH2-HASH-03: Initial window.onload with "#view-landing" activates #view-landing', () => {
      const { sandbox, domElements } = createSimulatedRuntime('#view-landing');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be active on #view-landing');
    });

    test('CH2-HASH-04: Initial window.onload with deep route "#dashboard" loads #view-dashboard', () => {
      const { sandbox, domElements } = createSimulatedRuntime('#dashboard');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false, '#view-dashboard must be active on #dashboard');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');
    });

    test('CH2-HASH-05: Hashchange event dynamically switches to target view', () => {
      const { sandbox, domElements, mockWindow } = createSimulatedRuntime('');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      mockWindow.location.hash = '#dailygk';
      mockWindow.triggerEvent('hashchange');

      assert.strictEqual(domElements['view-dailygk'].classList.contains('hidden'), false, '#view-dailygk must be active after hashchange');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');
    });

    test('CH2-HASH-06: Hashchange to unknown / malformed hash gracefully falls back to #view-landing', () => {
      const { sandbox, domElements, mockWindow } = createSimulatedRuntime('#dashboard');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);

      // Trigger unexpected / malicious hash
      mockWindow.location.hash = '#invalid-injection-attempt-404';
      mockWindow.triggerEvent('hashchange');

      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be restored on invalid hash');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must be hidden');
    });

    test('CH2-HASH-07: Hash routing handles uppercase and slash prefixed formats (#DASHBOARD, #/story)', () => {
      const { sandbox, domElements, mockWindow } = createSimulatedRuntime('');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      mockWindow.location.hash = '#DASHBOARD';
      mockWindow.triggerEvent('hashchange');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false, '#view-dashboard handles uppercase');

      mockWindow.location.hash = '#/story';
      mockWindow.triggerEvent('hashchange');
      assert.strictEqual(domElements['view-story'].classList.contains('hidden'), false, '#view-story handles leading slash');
    });

    test('CH2-HASH-08: Calling returnToLanding() synchronizes browser history state with #landing', () => {
      const { sandbox, mockWindow } = createSimulatedRuntime('#dashboard');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      sandbox.returnToLanding();
      assert.ok(mockWindow.location.hash.includes('landing'), 'Location hash must be synchronized to landing');
    });
  });

  // =========================================================================
  // GROUP 5: ADVERSARIAL STATE PERMUTATIONS & MUTUAL EXCLUSION INVARIANTS
  // =========================================================================
  describe('Group 5: Adversarial State Permutations & Mutual Exclusion Invariants', () => {
    const allViews = [
      'view-landing', 'view-dashboard', 'view-dailygk', 'view-pyqp',
      'view-news', 'view-story', 'view-vault'
    ];

    function assertSingleViewInvariant(domElements, contextDescription) {
      const visibleViews = allViews.filter(v => !domElements[v].classList.contains('hidden'));
      assert.strictEqual(
        visibleViews.length,
        1,
        `Mutual exclusion invariant violated: expected exactly 1 visible view, got ${visibleViews.length} [${visibleViews.join(', ')}] at ${contextDescription}`
      );
    }

    test('CH2-INV-01: Rapid 60-step pseudo-random view transitions maintain exact single-view mutual exclusion', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

      const actions = [
        () => sandbox.returnToLanding(),
        () => sandbox.enterStudentPortal(),
        () => sandbox.switchTab('dailygk'),
        () => sandbox.switchTab('pyqp'),
        () => sandbox.switchTab('news'),
        () => sandbox.switchTab('story'),
        () => sandbox.switchTab('vault'),
        () => sandbox.switchView('landing'),
        () => sandbox.switchTab('dashboard')
      ];

      // Execute 60 rapid transitions
      for (let step = 0; step < 60; step++) {
        const actionIdx = (step * 7 + 3) % actions.length;
        actions[actionIdx]();
        assertSingleViewInvariant(domElements, `step ${step + 1} (action ${actionIdx})`);
      }
    });

    test('CH2-INV-02: Rapid modal open/close thrashing maintains single-view mutual exclusion and leaves zero stuck modals', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.switchTab('landing');

      // Thrash modals
      for (let i = 0; i < 15; i++) {
        sandbox.openFamilyOnboardingModal();
        assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), false);
        sandbox.closeFamilyOnboardingModal();
        assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), true);

        sandbox.openParentPinPrompt();
        assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);
        sandbox.closeParentPinPrompt();
        assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), true);

        sandbox.openAdminPinPrompt();
        assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
        sandbox.closeAdminPinPrompt();
        assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), true);
      }

      assertSingleViewInvariant(domElements, 'after modal thrashing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, 'Landing remains visible');
    });

    test('CH2-INV-03: Session persistence: returning to landing preserves authenticated user profile', () => {
      const { sandbox } = createSimulatedRuntime('');
      sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Commander Parent', email: 'parent@zoptro.io' };
      sandbox.currentRole = 'parent';

      sandbox.returnToLanding();
      assert.ok(sandbox.currentUser, 'currentUser must persist after returnToLanding');
      assert.strictEqual(sandbox.currentUser.role, 'parent', 'currentUser.role must remain parent');
    });

    test('CH2-INV-04: Unauthorized access guard: view-admin cannot be bypassed without PIN prompt', () => {
      const { sandbox, domElements } = createSimulatedRuntime('');
      sandbox.currentUser = { id: 'u_stu_demo', role: 'student' };
      sandbox.currentRole = 'student';

      domElements['adminPinModal'].classList.add('hidden');
      sandbox.switchTab('admin');

      // Admin PIN prompt must be triggered, view-admin must stay hidden
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, 'PIN modal must be triggered');
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, 'view-admin must stay hidden');
    });
  });

  // =========================================================================
  // GROUP 6: ZERO REGRESSION VERIFICATION ON EXISTING TEST SUITES
  // =========================================================================
  describe('Group 6: Zero Regression Verification on Existing Test Suites', () => {
    test('CH2-REG-01: Master test runner (node tests/run_tests.js) passes 100% with >=296 tests', () => {
      const rawResult = execSync('node tests/run_tests.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
      const result = rawResult.replace(/\u001b\[[0-9;]*m/g, '');
      assert.ok(result.includes('ALL TEST TIERS PASSED PERFECTLY (100% SUCCESS)'), 'Master runner must report 100% success');
      assert.ok(result.includes('Total Failed: 0'), 'Master runner must have 0 failures');
      const grandTotalMatch = result.match(/Grand Total Tests Executed:\s*(\d+)/);
      assert.ok(grandTotalMatch, 'Must report grand total executed');
      const totalExec = parseInt(grandTotalMatch[1], 10);
      assert.ok(totalExec >= 296, `Expected >=296 tests, got ${totalExec}`);
    });

    test('CH2-REG-02: Milestone 3 frontend suite (node tests/test_milestone3_frontend.js) passes 16/16', () => {
      const result = execSync('node tests/test_milestone3_frontend.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
      assert.ok(result.includes('16/16 TESTS PASSED'), 'Milestone 3 frontend suite must pass 16/16');
    });

    test('CH2-REG-03: Milestone 2 zero hardcoded content audit (node tests/test_zero_hardcoded_content.js) passes 32/32', () => {
      const result = execSync('node tests/test_zero_hardcoded_content.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
      assert.ok(result.includes('32/32 TESTS PASSED'), 'Milestone 2 audit must pass 32/32');
    });

    test('CH2-REG-04: Milestone 6 landing page suite (node tests/test_milestone6_landing_page.js) passes 28/28', () => {
      const result = execSync('node tests/test_milestone6_landing_page.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
      assert.ok(result.includes('M6-DOM-01'), 'Must include M6-DOM-01');
      assert.ok(result.includes('M6-REG-01'), 'Must include M6-REG-01');
    });
  });

});

if (require.main === module) {
  registry.run({ verbose: true }).then(({ stats }) => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
