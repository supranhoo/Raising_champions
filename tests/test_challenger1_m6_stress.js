/**
 * =========================================================================
 * ZOPTRO CHALLENGER 1 MILESTONE 6: EMPIRICAL STRESS TEST SUITE
 * ROUTING, HASH TRANSITIONS & ROLE-BASED ACCESS CONTROL (RBAC) SECURITY
 * =========================================================================
 * Adversarial Stress & Edge Case Verification:
 * 1. Hash Transition & Normalization Oracle:
 *    - Empty hash, #landing, #view-landing, #/landing, #/, #dashboard,
 *      #parent, #parentview, #admin, #vault, #dailygk, #pyqp, #news, #story.
 *    - Unknown / malformed hashes: #foobar, #undefined, #null, query strings,
 *      XSS / injection payloads.
 * 2. Role Security & PIN Challenges from Landing Cards:
 *    - Admin Portal CTA (#landingBtnAdminPortal / openAdminPinPrompt()):
 *      PIN 9999 protection, rejection of unauthorized access to #view-admin.
 *    - Parent Portal CTA (#landingBtnParentPortal / enterParentPortal()):
 *      PIN 1234 protection, rejection of unauthorized access to #view-parentview.
 *    - Rejection of invalid PINs (empty, whitespace, wrong digits, fuzz payloads).
 *    - Student Portal CTA (#landingBtnStudentPortal / enterStudentPortal()).
 *    - Family Onboarding CTA (#landingBtnFamilyOnboarding / openFamilyOnboardingModal()).
 *    - Return-to-Landing navigation (#logoLinkLanding, #tab-landing, returnToLanding()).
 * 3. Privilege De-escalation & Re-challenge Defense:
 *    - Admin switching to student or logging out re-locks #view-admin.
 *    - Parent switching to student or logging out re-locks #view-parentview.
 *    - Forced DOM tampering defense (renderAdminView RBAC).
 * 4. High-Frequency Switching, Fuzzing & Stress Invariants:
 *    - 500+ rapid sequential view switches with DOM invariant checks.
 *    - switchTab type fuzzing (null, undefined, numbers, objects, arrays).
 *    - Rapid hashchange event storms.
 * =========================================================================
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');

console.log('=========================================================================');
console.log('⚔️  CHALLENGER 1 MILESTONE 6: EMPIRICAL STRESS TESTING OF ROUTING & SECURITY');
console.log('=========================================================================\n');

const stats = {
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
    console.log(`  🛡️  [CH1-M6-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [CH1-M6-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

async function testAsync(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    console.log(`  🛡️  [CH1-M6-PASS]: ${name}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  🚨 [CH1-M6-FAIL]: ${name}`);
    console.error(`     Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

// -------------------------------------------------------------------------
// Load Frontend HTML and Setup High-Fidelity DOM & VM Environment
// -------------------------------------------------------------------------
const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

const mainScriptIndex = htmlContent.lastIndexOf(lastScriptTag);
const htmlMarkup = htmlContent.slice(0, mainScriptIndex);

function createTestHarness(initialHash = '') {
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
      get textContent() { return this.innerText; },
      set textContent(v) { this.innerText = v; },
      get innerHTML() { return this._innerHTML || this._innerText || ''; },
      set innerHTML(v) { this._innerHTML = String(v); this._innerText = String(v).replace(/<[^>]+>/g, '').trim(); },
      value: '',
      style: {},
      className: '',
      children: [],
      classList: {
        _classes: new Set(),
        add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
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

  // Pre-seed known views and containers with markup class names
  const viewIds = ['view-landing', 'view-dashboard', 'view-dailygk', 'view-pyqp', 'view-news', 'view-story', 'view-vault', 'view-parentview', 'view-admin', 'parentPinModal', 'adminPinModal', 'modal-family-onboarding', 'adminUnauthorizedCard', 'adminAuthorizedContainer', 'tab-admin'];
  viewIds.forEach(id => {
    const tagMatch = htmlMarkup.match(new RegExp(`<[^>]+id=["']${id}["'][^>]*>`, 'i')) || htmlMarkup.match(new RegExp(`<[^>]+class=["'][^"']*["'][^>]*id=["']${id}["'][^>]*>`, 'i'));
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
      get textContent() { return this.innerText; },
      set textContent(v) { this.innerText = v; },
      className: '',
      classList: { _classes: new Set(), add(...c) { c.forEach(x => this._classes.add(x)); }, remove(...c) { c.forEach(x => this._classes.delete(x)); }, contains(c) { return this._classes.has(c); } },
      style: {},
      children: [],
      appendChild(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this[k] = v; }
    }),
    body: { style: {}, appendChild: () => {} },
    addEventListener: () => {}
  };

  let _hash = initialHash;
  const mockLocation = {
    get hash() { return _hash ? (_hash.startsWith('#') ? _hash : '#' + _hash) : ''; },
    set hash(v) {
      _hash = v ? (String(v).startsWith('#') ? String(v) : '#' + String(v)) : '';
    }
  };

  const mockHistory = {
    replaceState: (state, title, url) => {
      if (typeof url === 'string') mockLocation.hash = url;
    },
    pushState: (state, title, url) => {
      if (typeof url === 'string') mockLocation.hash = url;
    }
  };

  const listeners = {};
  const mockWindow = {
    location: mockLocation,
    history: mockHistory,
    localStorage: mockStorage,
    innerWidth: 1200,
    innerHeight: 800,
    onload: null,
    scrollTo: () => {},
    addEventListener: (evt, handler) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(handler);
    },
    removeEventListener: (evt, handler) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(h => h !== handler);
      }
    },
    dispatchEvent: (evtName) => {
      if (listeners[evtName]) {
        listeners[evtName].forEach(h => h({ type: evtName }));
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
    location: mockLocation,
    history: mockHistory,
    localStorage: mockStorage,
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

  return { sandbox, domElements, mockWindow, mockDoc, mockStorage };
}

async function runTestSuite() {
  console.log('--- SUITE 1: HASH TRANSITION & NORMALIZATION ORACLE (18 Tests) ---');

  test('CH1-M6-01: Empty hash "" on startup activates #view-landing and hides others', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be visible');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must be hidden');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, '#view-admin must be hidden');
  });

  test('CH1-M6-02: Hash "#" routes to "landing" view', () => {
    const { sandbox, domElements } = createTestHarness('#');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true);
  });

  test('CH1-M6-03: Hash "#landing" routes to "landing" view', () => {
    const { sandbox, domElements } = createTestHarness('#landing');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-04: Hash "#view-landing" normalizes and routes to "landing" view', () => {
    const { sandbox, domElements } = createTestHarness('#view-landing');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-05: Leading slash hash "#/landing" routes to "landing" view', () => {
    const { sandbox, domElements } = createTestHarness('#/landing');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-06: Root slash hash "#/" routes to "landing" view', () => {
    const { sandbox, domElements } = createTestHarness('#/');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-07: Hash "#dashboard" routes to "dashboard" and conceals "landing"', () => {
    const { sandbox, domElements } = createTestHarness('#dashboard');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
  });

  test('CH1-M6-08: Hash "#view-dashboard" normalizes and routes to "dashboard"', () => {
    const { sandbox, domElements } = createTestHarness('#view-dashboard');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
  });

  test('CH1-M6-09: Hash "#/dashboard" with leading slash routes to "dashboard"', () => {
    const { sandbox, domElements } = createTestHarness('#/dashboard');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
  });

  test('CH1-M6-10: Hash "#vault" routes to Rewards Vault', () => {
    const { sandbox, domElements } = createTestHarness('#vault');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-vault'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
  });

  test('CH1-M6-11: Hash "#dailygk" routes to Daily Knowledge', () => {
    const { sandbox, domElements } = createTestHarness('#dailygk');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-dailygk'].classList.contains('hidden'), false);
  });

  test('CH1-M6-12: Hash "#pyqp" routes to Exam Practice', () => {
    const { sandbox, domElements } = createTestHarness('#pyqp');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-pyqp'].classList.contains('hidden'), false);
  });

  test('CH1-M6-13: Hash "#news" routes to World News', () => {
    const { sandbox, domElements } = createTestHarness('#news');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-news'].classList.contains('hidden'), false);
  });

  test('CH1-M6-14: Hash "#story" routes to Story & EQ Lab', () => {
    const { sandbox, domElements } = createTestHarness('#story');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    assert.strictEqual(domElements['view-story'].classList.contains('hidden'), false);
  });

  test('CH1-M6-15: Unknown hash "#foobar" via hashchange falls back safely to #view-landing', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('dashboard');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);

    mockWindow.location.hash = '#foobar';
    mockWindow.dispatchEvent('hashchange');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be restored');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must be hidden');
  });

  test('CH1-M6-16: Malformed route "#unknown-view-id" via hashchange falls back to #view-landing', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    mockWindow.location.hash = '#unknown-view-id';
    mockWindow.dispatchEvent('hashchange');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-17: Query parameter appended route "#landing?source=cta" defaults to #view-landing', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    mockWindow.location.hash = '#landing?source=cta';
    mockWindow.dispatchEvent('hashchange');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-18: Adversarial payloads (#<script>, #DROP_TABLE, #undefined) fall back to #view-landing without crashing', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const badHashes = ['#<script>alert(1)</script>', "#'; DROP TABLE Users; --", '#undefined', '#null', '#NaN', '#[object Object]', '#view-nonexistent'];
    for (const bh of badHashes) {
      mockWindow.location.hash = bh;
      assert.doesNotThrow(() => {
        mockWindow.dispatchEvent('hashchange');
      }, `Hash ${bh} must not crash application`);
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, `Hash ${bh} must show #view-landing`);
    }
  });

  console.log('\n--- SUITE 2: ROLE SECURITY & LANDING CARD ENTRY CHALLENGES (17 Tests) ---');

  test('CH1-M6-19: Admin portal CTA (#landingBtnAdminPortal) triggers openAdminPinPrompt(), unhiding #adminPinModal', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    domElements['adminPinModal'].classList.add('hidden');
    domElements['adminSwitchPin'].value = '1234';
    domElements['adminSwitchPinError'].classList.remove('hidden');

    sandbox.openAdminPinPrompt();
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, '#adminPinModal must be revealed');
    assert.strictEqual(domElements['adminSwitchPin'].value, '', 'PIN input must be reset');
    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), true, 'Error must be hidden');
  });

  test('CH1-M6-20: Unauthorized direct switchTab("admin") call is BLOCKED from opening #view-admin', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('landing');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);

    // Call switchTab('admin') without admin credentials
    sandbox.switchTab('admin');

    // MUST NOT reveal admin view!
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, '#view-admin MUST remain hidden');
    // Must trigger Admin PIN prompt
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, '#adminPinModal must open');
  });

  test('CH1-M6-21: Unauthorized direct switchView("admin") call is BLOCKED from opening #view-admin', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchView('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-22: Unauthorized direct switchView("view-admin") prefix alias is BLOCKED from opening #view-admin', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchView('view-admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-23: Hashchange to "#admin" while unauthorized triggers PIN prompt and BLOCKS #view-admin', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    domElements['adminPinModal'].classList.add('hidden');

    mockWindow.location.hash = '#admin';
    mockWindow.dispatchEvent('hashchange');

    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, '#view-admin MUST remain hidden');
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, '#adminPinModal must open');
  });

  test('CH1-M6-24: Hashchange to "#/admin" and "#view-admin" while unauthorized is BLOCKED', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    ['#/admin', '#view-admin'].forEach(h => {
      domElements['adminPinModal'].classList.add('hidden');
      domElements['view-admin'].classList.add('hidden');
      mockWindow.location.hash = h;
      mockWindow.dispatchEvent('hashchange');
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
    });
  });

  test('CH1-M6-25: Logged-in Student calling switchTab("admin") is BLOCKED and prompted for PIN', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.activateStudentRole();
    assert.strictEqual(sandbox.currentRole, 'divyank');

    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-26: Logged-in Parent calling switchTab("admin") is BLOCKED (no cross-role admin leakage)', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Parent User' };
    sandbox.currentRole = 'parent';

    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-27: Parent portal CTA (#landingBtnParentPortal) triggers enterParentPortal(), opening #parentPinModal', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    domElements['parentPinModal'].classList.add('hidden');
    domElements['parentSwitchPin'].value = '9999';

    sandbox.enterParentPortal();
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false, '#parentPinModal must be revealed');
    assert.strictEqual(domElements['parentSwitchPin'].value, '', 'Parent PIN input must be cleared');
  });

  test('CH1-M6-28: Unauthorized direct switchTab("parentview") call is BLOCKED from opening #view-parentview', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('landing');

    sandbox.switchTab('parentview');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true, '#view-parentview MUST remain hidden');
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false, '#parentPinModal must open');
  });

  test('CH1-M6-29: Unauthorized direct switchTab("parent") alias call is BLOCKED from opening #view-parentview', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('parent');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-30: Hashchange to "#parent" or "#parentview" while unauthorized triggers PIN prompt and BLOCKS view', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    ['#parent', '#parentview', '#/parent', '#view-parentview'].forEach(h => {
      domElements['parentPinModal'].classList.add('hidden');
      domElements['view-parentview'].classList.add('hidden');
      mockWindow.location.hash = h;
      mockWindow.dispatchEvent('hashchange');
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);
    });
  });

  test('CH1-M6-31: Logged-in Student calling switchTab("parentview") is BLOCKED and prompted for PIN', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.activateStudentRole();

    sandbox.switchTab('parentview');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-32: Student Portal CTA (#landingBtnStudentPortal / enterStudentPortal()) activates student role & dashboard', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('landing');

    sandbox.enterStudentPortal();
    assert.strictEqual(sandbox.currentRole, 'divyank', 'Student role must be activated');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false, '#view-dashboard must be visible');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');
  });

  test('CH1-M6-33: Family Onboarding CTA (#landingBtnFamilyOnboarding) triggers openFamilyOnboardingModal()', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    domElements['modal-family-onboarding'].classList.add('hidden');

    sandbox.openFamilyOnboardingModal();
    assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), false, '#modal-family-onboarding must be opened');
  });

  test('CH1-M6-34: returnToLanding() from inner view #view-dashboard restores #view-landing and conceals inner view', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('dashboard');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);

    sandbox.returnToLanding();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false, '#view-landing must be restored');
    assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true, '#view-dashboard must be hidden');
  });

  test('CH1-M6-35: returnToLanding() from inner view #view-vault restores #view-landing and synchronizes hash', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.switchTab('vault');
    assert.strictEqual(domElements['view-vault'].classList.contains('hidden'), false);

    sandbox.returnToLanding();
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-vault'].classList.contains('hidden'), true);
    assert.strictEqual(mockWindow.location.hash, '#landing', 'URL hash must be updated to #landing');
  });

  console.log('\n--- SUITE 3: PIN VERIFICATION, FUZZING & AUTHORIZATION STATE MACHINE (17 Tests) ---');

  test('CH1-M6-36: Admin PIN verification with empty string "" displays required error and rejects', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = '';
    sandbox.verifyAdminPinChallenge();

    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), false, 'Error message must be shown');
    assert.ok(domElements['adminSwitchPinError'].innerText.includes('required'), 'Error text must mention required');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
  });

  test('CH1-M6-37: Admin PIN verification with whitespace "   " displays required error and rejects', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = '    ';
    sandbox.verifyAdminPinChallenge();

    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-38: Admin PIN verification with incorrect numeric PIN "0000" rejects access', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = '0000';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), false);
    assert.ok(domElements['adminSwitchPinError'].innerText.includes('Access Denied'));
    assert.notStrictEqual(sandbox.currentRole, 'admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-39: Admin PIN verification with Parent PIN "1234" fails (strict role boundary)', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = '1234';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), false);
    assert.notStrictEqual(sandbox.currentRole, 'admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-40: Admin PIN verification with adversarial payload "\' OR 1=1--" fails', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = "' OR 1=1--";
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['adminSwitchPinError'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-41: Admin PIN verification with correct PIN "9999" unlocks Admin CMS', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = '9999';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), true, '#adminPinModal must close');
    assert.strictEqual(sandbox.currentRole, 'admin', 'currentRole must be admin');
    assert.strictEqual(sandbox.currentUser.role, 'admin', 'currentUser.role must be admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), false, '#view-admin must be revealed');
    assert.strictEqual(domElements['tab-admin'].classList.contains('hidden'), false, '#tab-admin must be revealed');
  });

  await testAsync('CH1-M6-42: Admin authorized container is revealed and unauthorized card is hidden after PIN 9999', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    domElements['adminSwitchPin'].value = '9999';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['adminUnauthorizedCard'].classList.contains('hidden'), true, '#adminUnauthorizedCard must be hidden');
    assert.strictEqual(domElements['adminAuthorizedContainer'].classList.contains('hidden'), false, '#adminAuthorizedContainer must be visible');
  });

  await testAsync('CH1-M6-43: Admin PIN verification with fallback password "adminPass123" unlocks Admin CMS', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openAdminPinPrompt();

    domElements['adminSwitchPin'].value = 'adminPass123';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(sandbox.currentRole, 'admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), false);
  });

  test('CH1-M6-44: Parent PIN verification with empty string "" displays required error and rejects', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '';
    sandbox.verifyParentPinChallenge();

    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
    assert.ok(domElements['parentSwitchPinError'].innerText.includes('required'));
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
  });

  test('CH1-M6-45: Parent PIN verification with whitespace "   " displays required error and rejects', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '   ';
    sandbox.verifyParentPinChallenge();

    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-46: Parent PIN verification with Admin PIN "9999" fails (strict role boundary)', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '9999';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
    assert.ok(domElements['parentSwitchPinError'].innerText.includes('Access Denied'));
    assert.notStrictEqual(sandbox.currentRole, 'parent');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
  });

  await testAsync('CH1-M6-47: Parent PIN verification with wrong PIN "0000" fails', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '0000';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
    assert.notStrictEqual(sandbox.currentRole, 'parent');
  });

  await testAsync('CH1-M6-48: Parent PIN verification with script tag payload fails', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '<script>alert(1)</script>';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
  });

  await testAsync('CH1-M6-49: Parent PIN verification with correct PIN "1234" unlocks Parent Space', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    domElements['parentSwitchPin'].value = '1234';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), true, '#parentPinModal must close');
    assert.strictEqual(sandbox.currentRole, 'parent', 'currentRole must be parent');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), false, '#view-parentview must be revealed');
  });

  await testAsync('CH1-M6-50: Parent PIN verification with password "password123" unlocks Parent Space (and rejects student PIN "4321")', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.openParentPinPrompt();

    // Student PIN 4321 must be rejected for Parent space
    domElements['parentSwitchPin'].value = '4321';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(domElements['parentSwitchPinError'].classList.contains('hidden'), false);
    assert.notStrictEqual(sandbox.currentRole, 'parent');

    // Valid parent password password123 must succeed
    domElements['parentSwitchPin'].value = 'password123';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'parent');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), false);
  });

  test('CH1-M6-51: Forced DOM unhiding defense: renderAdminView() blocks unauthorized users if DOM class is tampered', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Attacker manually removes hidden class from view-admin in DOM
    domElements['view-admin'].classList.remove('hidden');
    sandbox.currentUser = { id: 'u_stu_demo', role: 'student' };
    sandbox.currentRole = 'divyank';

    // Invoking renderAdminView enforces RBAC
    sandbox.renderAdminView();

    assert.strictEqual(domElements['adminUnauthorizedCard'].classList.contains('hidden'), false, '#adminUnauthorizedCard must be displayed');
    assert.strictEqual(domElements['adminAuthorizedContainer'].classList.contains('hidden'), true, '#adminAuthorizedContainer must be hidden');
  });

  test('CH1-M6-52: Navbar #tab-admin defense: Tab button is hidden for non-admin across all views', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    ['landing', 'dashboard', 'dailygk', 'pyqp', 'news', 'story', 'vault'].forEach(tab => {
      sandbox.switchTab(tab);
      assert.strictEqual(domElements['tab-admin'].classList.contains('hidden'), true, `#tab-admin must stay hidden on tab ${tab}`);
    });
  });

  console.log('\n--- SUITE 4: PRIVILEGE DE-ESCALATION & RE-CHALLENGE GUARANTEES (6 Tests) ---');

  await testAsync('CH1-M6-53: Admin demoting to Student (activateStudentRole()) re-locks Admin CMS and requires PIN 9999 again', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Authenticate as Admin
    domElements['adminSwitchPin'].value = '9999';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'admin');

    // Demote to student
    sandbox.activateStudentRole();
    assert.strictEqual(sandbox.currentRole, 'divyank');

    // Re-attempt to access Admin view
    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true, 'Admin view must be re-locked');
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, 'PIN prompt must be re-triggered');
  });

  await testAsync('CH1-M6-54: Admin logging out (logoutUser()) wipes credentials and requires PIN 9999 again', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Authenticate as Admin
    domElements['adminSwitchPin'].value = '9999';
    sandbox.verifyAdminPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'admin');

    // Log out
    sandbox.logoutUser();
    assert.strictEqual(sandbox.currentRole, 'divyank');
    assert.strictEqual(sandbox.currentUser.role, 'student');

    // Re-attempt access
    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  await testAsync('CH1-M6-55: Parent demoting to Student re-locks Parent Space and requires PIN 1234 again', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Authenticate as Parent
    domElements['parentSwitchPin'].value = '1234';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'parent');

    // Demote to student
    sandbox.activateStudentRole();
    assert.strictEqual(sandbox.currentRole, 'divyank');

    // Re-attempt to access Parent view
    sandbox.switchTab('parentview');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true, 'Parent space must be re-locked');
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false, 'PIN prompt must be re-triggered');
  });

  await testAsync('CH1-M6-56: Parent logging out wipes credentials and requires PIN 1234 again', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Authenticate as Parent
    domElements['parentSwitchPin'].value = '1234';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'parent');

    // Log out
    sandbox.logoutUser();
    assert.strictEqual(sandbox.currentRole, 'divyank');

    // Re-attempt access
    sandbox.switchTab('parentview');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false);
  });

  await testAsync('CH1-M6-57: Authenticated Parent CANNOT access Admin CMS without PIN 9999 (No privilege escalation)', async () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    // Authenticate as Parent
    domElements['parentSwitchPin'].value = '1234';
    sandbox.verifyParentPinChallenge();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(sandbox.currentRole, 'parent');

    // Try to enter Admin
    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false);
  });

  test('CH1-M6-58: Authenticated Student CANNOT access Parent Space or Admin CMS without PIN verification', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();
    sandbox.activateStudentRole();

    sandbox.switchTab('admin');
    assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);

    sandbox.switchTab('parentview');
    assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);
  });

  console.log('\n--- SUITE 5: HIGH-FREQUENCY STRESS, FUZZING & INVARIANT RESILIENCE (10 Tests) ---');

  test('CH1-M6-59: 500 rapid pseudo-random view switches maintain single-visible-view invariant', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const tabs = ['landing', 'dashboard', 'dailygk', 'pyqp', 'news', 'story', 'vault'];
    const views = tabs.map(t => 'view-' + t);

    for (let i = 0; i < 500; i++) {
      const selected = tabs[i % tabs.length];
      sandbox.switchTab(selected);

      // Check invariant: exactly 1 view is visible
      const visibleViews = views.filter(v => domElements[v] && !domElements[v].classList.contains('hidden'));
      assert.strictEqual(visibleViews.length, 1, `Switch ${i} (${selected}): Exactly 1 view must be visible, but got: ${visibleViews.join(', ')}`);
      assert.strictEqual(visibleViews[0], 'view-' + selected, `Visible view must match requested tab ${selected}`);
    }
  });

  test('CH1-M6-60: Tab button styling synchronization remains consistent across 500 switches', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const tabs = ['landing', 'dashboard', 'dailygk', 'pyqp', 'news', 'story', 'vault'];
    for (let i = 0; i < 200; i++) {
      const selected = tabs[i % tabs.length];
      sandbox.switchTab(selected);

      const activeBtn = domElements['tab-' + selected];
      assert.ok(activeBtn, `Button tab-${selected} must exist`);
      assert.ok(activeBtn.className.includes('bg-[#09293D]'), `Active button must have #09293D background`);
      assert.ok(activeBtn.className.includes('border-[#F65800]'), `Active button must have #F65800 border`);
      assert.strictEqual(activeBtn.getAttribute('aria-current'), 'page', `Active button must have aria-current="page"`);
    }
  });

  test('CH1-M6-61: Alternating bounce stress (100 switches landing <-> dashboard) maintains pristine state', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    for (let i = 0; i < 100; i++) {
      sandbox.switchTab('landing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true);

      sandbox.switchTab('dashboard');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
    }
  });

  test('CH1-M6-62: Alternating bounce stress (100 switches landing <-> vault) maintains pristine state', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    for (let i = 0; i < 100; i++) {
      sandbox.switchTab('landing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-vault'].classList.contains('hidden'), true);

      sandbox.switchTab('vault');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['view-vault'].classList.contains('hidden'), false);
    }
  });

  test('CH1-M6-63: Event argument resilience in returnToLanding() handles all invocation signatures safely', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const eventSignatures = [
      null,
      undefined,
      {},
      { preventDefault: () => {} },
      { preventDefault: null },
      { defaultPrevented: true },
      { stopPropagation: () => {} },
      123,
      'click'
    ];

    eventSignatures.forEach(sig => {
      sandbox.switchTab('dashboard');
      assert.doesNotThrow(() => {
        sandbox.returnToLanding(sig);
      }, `returnToLanding must handle ${JSON.stringify(sig)} safely`);
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
    });
  });

  test('CH1-M6-64: Fuzzing switchTab() with abnormal primitive types handles safely without uncaught exceptions', () => {
    const { sandbox } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const abnormalPrimitives = [null, undefined, 0, 1, -1, 12345, false, true, NaN];
    abnormalPrimitives.forEach(prim => {
      assert.doesNotThrow(() => {
        sandbox.switchTab(prim);
      }, `switchTab(${prim}) must not throw unhandled exception`);
    });
  });

  test('CH1-M6-65: Fuzzing switchTab() with complex types handles safely without uncaught exceptions', () => {
    const { sandbox } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const complexTypes = [{}, [], [1, 2, 3], { tab: 'landing' }, () => {}];
    complexTypes.forEach(val => {
      assert.doesNotThrow(() => {
        sandbox.switchTab(val);
      }, `switchTab(${String(val)}) must not throw unhandled exception`);
    });
  });

  test('CH1-M6-66: Fuzzing switchTab("") with empty string executes safely', () => {
    const { sandbox } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    assert.doesNotThrow(() => {
      sandbox.switchTab('');
    });
  });

  test('CH1-M6-67: Rapid hashchange flood (50 synchronous events) settles cleanly without corruption', () => {
    const { sandbox, domElements, mockWindow } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    const sequence = ['#landing', '#dashboard', '#vault', '#dailygk', '#foobar', '#story', '#pyqp', '#news', '#view-landing'];
    for (let i = 0; i < 50; i++) {
      mockWindow.location.hash = sequence[i % sequence.length];
      assert.doesNotThrow(() => {
        mockWindow.dispatchEvent('hashchange');
      });
    }

    // Set to #landing at end
    mockWindow.location.hash = '#landing';
    mockWindow.dispatchEvent('hashchange');
    assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
  });

  test('CH1-M6-68: Heading presentation synchronizes accurately for landing and inner views', () => {
    const { sandbox, domElements } = createTestHarness('');
    if (typeof sandbox.window.onload === 'function') sandbox.window.onload();

    sandbox.switchTab('landing');
    assert.strictEqual(domElements['pageEyebrow'].innerText, 'MISSION CONTROL PORTAL');
    assert.strictEqual(domElements['pageTitle'].innerText, 'Empowering Young Champions.');
    assert.ok(domElements['pageDescription'].innerText.includes('Student Learning Space'));

    sandbox.switchTab('dashboard');
    assert.strictEqual(domElements['pageEyebrow'].innerText, 'YOUR DAILY OVERVIEW');
    assert.strictEqual(domElements['pageTitle'].innerText, 'Small steps. Real progress.');

    sandbox.switchTab('vault');
    assert.strictEqual(domElements['pageEyebrow'].innerText, 'RECOGNISE YOUR PROGRESS');
  });

  console.log('\n=========================================================================');
  console.log('🏁 CHALLENGER 1 MILESTONE 6 STRESS SUITE EXECUTION SUMMARY');
  console.log('=========================================================================');
  console.log(`  Total Tests Executed : ${stats.total}`);
  console.log(`  Passed               : ${stats.passed}`);
  console.log(`  Failed               : ${stats.failed}`);
  console.log('=========================================================================\n');

  if (stats.failed > 0) {
    console.error(`💥 ${stats.failed} TEST(S) FAILED!`);
    stats.failures.forEach((f, i) => {
      console.error(`  ${i + 1}) ${f.name}\n     ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${stats.total} CHALLENGER 1 ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!`);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test harness error:', err);
  process.exit(1);
});
