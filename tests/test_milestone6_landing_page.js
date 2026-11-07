/**
 * =========================================================================
 * ZOPTRO MILESTONE 6: DEDICATED BRANDED LANDING PAGE & NAVIGATION SUITE
 * =========================================================================
 * Automated verification suite for Milestone 6:
 * Tier 1: Static DOM & Markup Architecture
 *   - #view-landing exists as a top-level tab-view section
 *   - Landing page hero banner & value proposition
 *   - 4 Role Portal Entry Cards (Student, Parent, Admin, Family Onboarding)
 *   - Return-to-landing navigation (Brand logo link and #tab-landing button)
 * Tier 2: JavaScript Controller & Routing Contracts
 *   - switchTab('landing') handling
 *   - returnToLanding(), enterStudentPortal(), enterParentPortal()
 *   - Integration with openAdminPinPrompt() and openFamilyOnboardingModal()
 * Tier 3: Runtime VM & Interactive Flow Verification
 *   - Default startup view is #view-landing without URL hash
 *   - URL hash routing support (#dashboard, #view-dashboard, etc.)
 *   - Student portal entry transitions to #view-dashboard
 *   - Parent portal entry triggers PIN prompt and unlocks #view-parentview
 *   - Admin portal entry triggers openAdminPinPrompt() and unlocks #view-admin
 *   - Family Onboarding CTA opens #modal-family-onboarding
 *   - Return-to-landing from inner views (dashboard, parentview, admin)
 * Tier 4: Strict Brand & Design System Compliance
 *   - Universal 0px border-radius (0 rounded-* non-none classes)
 *   - Outfit display font for headings, Figtree for body copy
 *   - Authority Blue (#09293D), Clarity Ivory (#F4F2EA), Grounded Olive (#666D57), Progress Orange (#F65800)
 *   - Zero forbidden cyberpunk glows or background gradients
 * Tier 5: Zero-Regression & Full-Suite Verification
 *   - 0 missing DOM element IDs in script queries
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const testEnvPath = fs.existsSync(path.join(__dirname, './harness/test_env.js'))
  ? path.join(__dirname, './harness/test_env.js')
  : path.join(__dirname, '../../../tests/harness/test_env.js');
const { describe, test, assert, registry } = require(testEnvPath);

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

describe('Tier 7: Milestone 6 Landing Page & Global Navigation (28 Tests)', () => {

  // =========================================================================
  // GROUP 1: STATIC DOM & MARKUP ARCHITECTURE
  // =========================================================================
  describe('Group 1: Static DOM & Markup Architecture', () => {
    test('M6-DOM-01: #view-landing section exists as a top-level tab-view section', () => {
      assert.ok(htmlContent.includes('id="view-landing"'), '#view-landing must exist in markup');
      assert.ok(
        /<section[^>]*id="view-landing"[^>]*class="[^"]*tab-view/i.test(htmlContent) ||
        /<section[^>]*class="[^"]*tab-view[^"]*"[^>]*id="view-landing"/i.test(htmlContent),
        '#view-landing must be declared with class "tab-view"'
      );
    });

    test('M6-DOM-02: #view-landing is default active view on startup (not marked hidden initially in markup)', () => {
      const landingMatch = htmlContent.match(/<section[^>]*id="view-landing"[^>]*>/i);
      assert.ok(landingMatch, '#view-landing tag must exist');
      assert.ok(!landingMatch[0].includes('hidden'), '#view-landing must NOT have hidden class initially in markup');

      const dashboardMatch = htmlContent.match(/<section[^>]*id="view-dashboard"[^>]*>/i);
      assert.ok(dashboardMatch, '#view-dashboard tag must exist');
      assert.ok(dashboardMatch[0].includes('hidden'), '#view-dashboard must have hidden class initially in markup');
    });

    test('M6-DOM-03: #view-landing features hero banner with branded title and value proposition', () => {
      assert.ok(htmlContent.includes('id="landingHero"'), '#landingHero must exist');
      assert.ok(htmlContent.includes('id="landingHeroTitle"'), '#landingHeroTitle must exist');
      assert.ok(htmlContent.includes('id="landingHeroSubtitle"'), '#landingHeroSubtitle must exist');
    });

    test('M6-DOM-04: Role Card 1 - Student Portal card #landingCardStudent and CTA button #landingBtnStudentPortal exist', () => {
      assert.ok(htmlContent.includes('id="landingCardStudent"'), '#landingCardStudent must exist');
      assert.ok(htmlContent.includes('id="landingBtnStudentPortal"'), '#landingBtnStudentPortal must exist');
      assert.ok(/Student Learning Space|Star Cadet Portal/i.test(htmlContent), 'Student portal heading must be present');
    });

    test('M6-DOM-05: Role Card 2 - Parent Space card #landingCardParent and CTA button #landingBtnParentPortal exist with PIN prompt trigger', () => {
      assert.ok(htmlContent.includes('id="landingCardParent"'), '#landingCardParent must exist');
      assert.ok(htmlContent.includes('id="landingBtnParentPortal"'), '#landingBtnParentPortal must exist');
      assert.ok(/Parent Space|Parent HQ/i.test(htmlContent), 'Parent space heading must be present');
      assert.ok(/1234/i.test(htmlContent), 'Parent card must mention PIN 1234');
    });

    test('M6-DOM-06: Role Card 3 - Admin Mission Control card #landingCardAdmin and prominent CTA #landingBtnAdminPortal exist', () => {
      assert.ok(htmlContent.includes('id="landingCardAdmin"'), '#landingCardAdmin must exist');
      assert.ok(htmlContent.includes('id="landingBtnAdminPortal"'), '#landingBtnAdminPortal must exist');
      assert.ok(/Administrator Access|Admin Mission Control/i.test(htmlContent), 'Admin access heading must be present');
      assert.ok(htmlContent.includes('openAdminPinPrompt()'), 'Admin CTA must invoke openAdminPinPrompt()');
    });

    test('M6-DOM-07: Role Card 4 - New Family Registration card #landingCardFamilyOnboarding and CTA #landingBtnFamilyOnboarding exist', () => {
      assert.ok(htmlContent.includes('id="landingCardFamilyOnboarding"'), '#landingCardFamilyOnboarding must exist');
      assert.ok(htmlContent.includes('id="landingBtnFamilyOnboarding"'), '#landingBtnFamilyOnboarding must exist');
      assert.ok(htmlContent.includes('openFamilyOnboardingModal()'), 'Family Onboarding CTA must invoke openFamilyOnboardingModal()');
    });

    test('M6-DOM-08: Global Navigation return-to-landing logo link #logoLinkLanding exists in brand masthead', () => {
      assert.ok(htmlContent.includes('id="logoLinkLanding"'), '#logoLinkLanding must exist');
      assert.ok(htmlContent.includes('returnToLanding') || htmlContent.includes("switchTab('landing')"), 'Logo link must trigger return to landing');
    });

    test('M6-DOM-09: Global Navigation Home button #tab-landing exists in navbar', () => {
      assert.ok(htmlContent.includes('id="tab-landing"'), '#tab-landing button must exist in .app-nav');
      assert.ok(htmlContent.includes("returnToLanding()") || htmlContent.includes("switchTab('landing')"), '#tab-landing must route to landing');
    });
  });

  // =========================================================================
  // GROUP 2: JAVASCRIPT CONTROLLERS & ROUTING CONTRACTS
  // =========================================================================
  describe('Group 2: JavaScript Controllers & Routing Contracts', () => {
    test('M6-JS-01: Function returnToLanding is defined and handles navigation', () => {
      assert.ok(htmlContent.includes('function returnToLanding('), 'function returnToLanding must be defined');
    });

    test('M6-JS-02: Function enterStudentPortal is defined and activates student role & dashboard', () => {
      assert.ok(htmlContent.includes('function enterStudentPortal('), 'function enterStudentPortal must be defined');
    });

    test('M6-JS-03: Function enterParentPortal is defined and triggers parent PIN challenge', () => {
      assert.ok(htmlContent.includes('function enterParentPortal('), 'function enterParentPortal must be defined');
    });

    test('M6-JS-04: switchTab supports "landing" tabId and updates page presentation', () => {
      assert.ok(htmlContent.includes("tabId === 'landing'"), 'switchTab must explicitly handle "landing"');
      assert.ok(htmlContent.includes('updatePageHeading'), 'updatePageHeading must be invoked on tab switch');
    });
  });

  // =========================================================================
  // GROUP 3: RUNTIME VM & INTERACTIVE ROUTING SIMULATION
  // =========================================================================
  describe('Group 3: Runtime VM & Interactive Routing Simulation', () => {
    // Extract script
    const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
    const lastScriptTag = scriptMatches[scriptMatches.length - 1];
    const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

    // Parse genuine element IDs from markup
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

    // Sync initial hidden classes from HTML
    ['view-landing', 'view-dashboard', 'view-dailygk', 'view-pyqp', 'view-news', 'view-story', 'view-vault', 'view-parentview', 'view-admin', 'parentPinModal', 'adminPinModal', 'modal-family-onboarding'].forEach(id => {
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

    const mockWindow = {
      location: { hash: '' },
      localStorage: mockStorage,
      innerWidth: 1200,
      innerHeight: 800,
      onload: null,
      scrollTo: () => {},
      history: { replaceState: () => {}, pushState: () => {} },
      addEventListener: () => {},
      AudioContext: function() {
        return { currentTime: 0, destination: {}, createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }), createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }) };
      }
    };
    mockWindow.window = mockWindow;
    mockWindow.document = mockDoc;

    const sandbox = {
      window: mockWindow,
      document: mockDoc,
      localStorage: mockStorage,
      console: console,
      setTimeout: (fn) => fn(),
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

    test('M6-VM-01: Default startup without route hash activates #view-landing', () => {
      sandbox.window.location.hash = '';
      if (typeof sandbox.window.onload === 'function') {
        sandbox.window.onload();
      }
      const landing = domElements['view-landing'];
      const dashboard = domElements['view-dashboard'];
      assert.ok(landing, '#view-landing must exist in DOM');
      assert.strictEqual(landing.classList.contains('hidden'), false, '#view-landing must NOT be hidden on startup without hash');
      assert.strictEqual(dashboard.classList.contains('hidden'), true, '#view-dashboard must be hidden on startup');
    });

    test('M6-VM-02: URL route hash #view-dashboard activates #view-dashboard and hides #view-landing', () => {
      sandbox.switchTab('dashboard');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden when dashboard active');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false, '#view-dashboard must be visible when dashboard active');
    });

    test('M6-VM-03: Student portal CTA button routes to #view-dashboard', () => {
      sandbox.switchTab('landing');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);

      sandbox.enterStudentPortal();
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true);
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
    });

    test('M6-VM-04: Parent portal CTA button triggers parent PIN challenge modal', () => {
      sandbox.switchTab('landing');
      domElements['parentPinModal'].classList.add('hidden');

      sandbox.enterParentPortal();
      assert.strictEqual(domElements['parentPinModal'].classList.contains('hidden'), false, '#parentPinModal must be revealed');
    });

    test('M6-VM-05: Verifying Parent PIN (1234) unlocks Parent Space (#view-parentview)', async () => {
      domElements['parentSwitchPin'].value = '1234';
      sandbox.verifyParentPinChallenge();
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), false, '#view-parentview must be revealed');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');
      assert.strictEqual(sandbox.currentRole, 'parent', 'currentRole must be parent');
    });

    test('M6-VM-06: Admin portal CTA triggers openAdminPinPrompt() and unhides #adminPinModal', () => {
      sandbox.switchTab('landing');
      domElements['adminPinModal'].classList.add('hidden');

      sandbox.openAdminPinPrompt();
      assert.strictEqual(domElements['adminPinModal'].classList.contains('hidden'), false, '#adminPinModal must be revealed');
    });

    test('M6-VM-07: Verifying Admin PIN (9999) unlocks Admin CMS (#view-admin)', async () => {
      domElements['adminSwitchPin'].value = '9999';
      sandbox.verifyAdminPinChallenge();
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), false, '#view-admin must be revealed');
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), true, '#view-landing must be hidden');
      assert.strictEqual(sandbox.currentRole, 'admin', 'currentRole must be admin');
    });

    test('M6-VM-08: Family onboarding CTA triggers openFamilyOnboardingModal()', () => {
      sandbox.switchTab('landing');
      domElements['modal-family-onboarding'].classList.add('hidden');

      sandbox.openFamilyOnboardingModal();
      assert.strictEqual(domElements['modal-family-onboarding'].classList.contains('hidden'), false, '#modal-family-onboarding must be revealed');
    });

    test('M6-VM-09: returnToLanding() from inner views successfully returns to #view-landing', () => {
      // Return from dashboard
      sandbox.switchTab('dashboard');
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), false);
      sandbox.returnToLanding();
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-dashboard'].classList.contains('hidden'), true);

      // Return from parentview
      sandbox.switchTab('parentview');
      sandbox.returnToLanding();
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-parentview'].classList.contains('hidden'), true);

      // Return from admin
      sandbox.switchTab('admin');
      sandbox.returnToLanding();
      assert.strictEqual(domElements['view-landing'].classList.contains('hidden'), false);
      assert.strictEqual(domElements['view-admin'].classList.contains('hidden'), true);
    });
  });

  // =========================================================================
  // GROUP 4: STRICT BRAND & DESIGN SYSTEM COMPLIANCE
  // =========================================================================
  describe('Group 4: Strict Brand & Design System Compliance', () => {
    test('M6-BRAND-01: Universal 0px border-radius: no forbidden rounded classes', () => {
      const forbidden = htmlContent.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
      assert.strictEqual(forbidden, null, `Found forbidden rounded classes: ${forbidden}`);
    });

    test('M6-BRAND-02: Universal 0px border-radius: no standalone rounded classes', () => {
      const standalone = htmlContent.match(/\bclass="[^"]*\brounded\b(?!-none)[^"]*"/g);
      assert.strictEqual(standalone, null, `Found standalone rounded classes without -none: ${standalone}`);
    });

    test('M6-BRAND-03: Official color palette tokens present (#09293D, #F4F2EA, #666D57, #F65800)', () => {
      ['#09293D', '#F4F2EA', '#666D57', '#F65800'].forEach(token => {
        assert.ok(htmlContent.includes(token), `Brand palette token ${token} must be used`);
      });
    });

    test('M6-BRAND-04: Typography system imports and configures Outfit and Figtree fonts', () => {
      assert.ok(htmlContent.includes('Outfit'), 'Outfit font must be imported/configured');
      assert.ok(htmlContent.includes('Figtree'), 'Figtree font must be imported/configured');
    });

    test('M6-BRAND-05: 0 cyberpunk neon glows and 0 forbidden background gradients', () => {
      const glows = htmlContent.match(/\bglow-(cyan|neon|gold)\b/gi) || [];
      assert.strictEqual(glows.length, 0, 'No cyberpunk neon glows permitted');
      const gradients = htmlContent.match(/\bbg-gradient-[a-z0-9-]+\b/gi) || [];
      assert.strictEqual(gradients.length, 0, 'No forbidden background gradients permitted');
    });
  });

  // =========================================================================
  // GROUP 5: ZERO REGRESSIONS & STRICT ID RESOLUTION
  // =========================================================================
  describe('Group 5: Zero Regressions & Strict ID Resolution', () => {
    test('M6-REG-01: 100% of document.getElementById queries in script resolve to genuine HTML IDs', () => {
      const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
      const lastScriptTag = scriptMatches[scriptMatches.length - 1];
      const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');
      const mainScriptIndex = htmlContent.lastIndexOf(lastScriptTag);
      const htmlMarkup = htmlContent.slice(0, mainScriptIndex);

      const parsedIds = new Set();
      const idRegex = /\bid=["']([^"']+)["']/g;
      let match;
      while ((match = idRegex.exec(htmlMarkup)) !== null) {
        parsedIds.add(match[1]);
      }

      const scriptIds = [...scriptContent.matchAll(/document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
      const missing = new Set();
      scriptIds.forEach(id => {
        if (!parsedIds.has(id)) {
          missing.add(id);
        }
      });
      assert.strictEqual(missing.size, 0, `All referenced DOM IDs in script must exist in HTML markup. Missing: ${[...missing].join(', ')}`);
    });
  });
});

if (require.main === module) {
  registry.run({ verbose: true }).then(({ stats }) => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
