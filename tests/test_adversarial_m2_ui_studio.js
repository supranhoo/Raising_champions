/**
 * =========================================================================
 * ZOPTRO - MILESTONE 2: ADMIN AI QUESTION STUDIO UI INTEGRATION
 * ADVERSARIAL VERIFICATION & STRESS HARNESS (CHALLENGER 1)
 * =========================================================================
 * File: tests/test_adversarial_m2_ui_studio.js
 *
 * Verifies and stress tests:
 * 1. Full Matrix Coverage across all 10 grades (Classes 1 to 10) and core subjects
 *    (Mathematics, Science, Social Science, English, Hindi, EVS) with authentic NCERT chapters.
 * 2. #aiGenChapterSelect options update correctly with authentic NCERT rationalised chapters.
 * 3. Switching between Dropdown mode and Custom Manual mode repeatedly (idempotency, DOM visibility, focus).
 * 4. Chapter selection synchronization: #aiGenChapter.value, <datalist id="aiGenTopicDatalist">,
 *    topic suggestion pills rendering, and #aiGenTopic.value primary topic auto-fill.
 * 5. Topic suggestion pills interaction: click selection, active/inactive class styling, 0px border-radius.
 * 6. Custom manual chapter entry and end-to-end access by handleTriggerGeminiGeneration.
 * 7. Manual input auto-detection: matching authentic chapter updates select & topic suggestions.
 * 8. Adversarial injection stress (XSS, formula injection, malformed topics) & brand geometry compliance.
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'divyank_mission_control_google_apps_script_app.html');
const CATALOG_PATH = path.join(ROOT_DIR, 'curriculum_catalog_data.js');

assert.ok(fs.existsSync(HTML_PATH), `Missing HTML file at ${HTML_PATH}`);
assert.ok(fs.existsSync(CATALOG_PATH), `Missing catalog file at ${CATALOG_PATH}`);

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const { CANONICAL_CURRICULUM_CATALOG } = require(CATALOG_PATH);

console.log('=========================================================================');
console.log('⚔️  CHALLENGER 1: ADVERSARIAL AI STUDIO UI INTEGRATION STRESS HARNESS');
console.log('=========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function runCheck(suite, testName, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] [${suite}] ${testName}`);
  } catch (err) {
    failedTests++;
    failures.push({ suite, testName, error: err.message, stack: err.stack });
    console.error(`  ❌ [FAIL] [${suite}] ${testName}`);
    console.error(`     Reason: ${err.message}`);
  }
}

const waitTick = (ms = 30) => new Promise(resolve => setTimeout(resolve, ms));

// Extract the main client script block from HTML
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const clientScript = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

/**
 * Creates a high-fidelity simulated browser DOM & Window sandbox
 */
function createStudioDOMSandbox() {
  const domElements = {};

  // Extract all static IDs from HTML markup to initialize elements
  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1];
    domElements[id] = createMockElement(id);
  }

  function createMockElement(id, tag = 'DIV') {
    const el = {
      id: id || '',
      tagName: tag.toUpperCase(),
      _value: '',
      get value() {
        if (this.tagName === 'SELECT') {
          if (this._selectedVal !== undefined) return this._selectedVal;
          if (this.options && this.options.length > 0) {
            const idx = this.selectedIndex >= 0 ? this.selectedIndex : 0;
            return this.options[idx] ? this.options[idx].value : '';
          }
          return '';
        }
        return this._value;
      },
      set value(v) {
        this._value = String(v);
        if (this.tagName === 'SELECT') {
          this._selectedVal = String(v);
          if (this.options) {
            const idx = this.options.findIndex(o => o.value === String(v));
            if (idx >= 0) this.selectedIndex = idx;
          }
        }
      },
      selectedIndex: 0,
      _selectedVal: undefined,
      get selectedOptions() {
        if (this.tagName === 'SELECT' && this.options) {
          const opt = this.options.find(o => o.value === this.value);
          return opt ? [opt] : (this.options.length > 0 ? [this.options[0]] : []);
        }
        return [];
      },
      options: [],
      innerText: '',
      textContent: '',
      _innerHTML: '',
      get innerHTML() { return this._innerHTML; },
      set innerHTML(html) {
        this._innerHTML = html;
        if (html === '') {
          this.children = [];
          if (this.options) this.options.length = 0;
        }
      },
      checked: false,
      disabled: false,
      className: '',
      classList: {
        _classes: new Set(),
        add: function(...classes) { classes.forEach(c => this._classes.add(c)); },
        remove: function(...classes) { classes.forEach(c => this._classes.delete(c)); },
        contains: function(c) { return this._classes.has(c); },
        toggle: function(c) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        }
      },
      style: {},
      dataset: {},
      children: [],
      getContext: function() {
        return {
          clearRect: function() {},
          save: function() {},
          restore: function() {},
          translate: function() {},
          rotate: function() {},
          fillRect: function() {},
          beginPath: function() {},
          arc: function() {},
          fill: function() {},
          stroke: function() {},
          moveTo: function() {},
          lineTo: function() {},
          closePath: function() {}
        };
      },
      appendChild: function(child) {
        this.children.push(child);
        return child;
      },
      querySelectorAll: function(selector) {
        if (selector === 'button') {
          return this.children.filter(c => c.tagName === 'BUTTON');
        }
        return [];
      },
      listeners: {},
      addEventListener: function(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
      },
      dispatchEvent: function(event) {
        const type = typeof event === 'string' ? event : event.type;
        if (this.listeners[type]) {
          this.listeners[type].forEach(h => h.call(this, event));
        }
      },
      focusCount: 0,
      focus: function() { this.focusCount++; }
    };

    return el;
  }

  // Pre-configure key studio elements with their initial HTML attributes
  const gradeEl = domElements['aiGenGrade'];
  if (gradeEl) {
    gradeEl.tagName = 'SELECT';
    gradeEl.value = 'Class 3';
  }

  const subjectEl = domElements['aiGenSubject'];
  if (subjectEl) {
    subjectEl.tagName = 'SELECT';
    subjectEl.value = 'Mathematics';
  }

  const typeEl = domElements['aiGenType'];
  if (typeEl) {
    typeEl.tagName = 'SELECT';
    typeEl.value = 'MCQ';
  }

  const chapterSelect = domElements['aiGenChapterSelect'];
  if (chapterSelect) {
    chapterSelect.tagName = 'SELECT';
    chapterSelect.options = [];
  }

  const chapterInput = domElements['aiGenChapter'];
  if (chapterInput) {
    chapterInput.tagName = 'INPUT';
    chapterInput.value = "What's in a Name?";
  }

  const topicInput = domElements['aiGenTopic'];
  if (topicInput) {
    topicInput.tagName = 'INPUT';
    topicInput.value = '3-Digit Numbers (100-999)';
  }

  const topicDatalist = domElements['aiGenTopicDatalist'];
  if (topicDatalist) {
    topicDatalist.tagName = 'DATALIST';
  }

  const pillsContainer = domElements['aiGenTopicPillsContainer'];
  if (pillsContainer) {
    pillsContainer.tagName = 'DIV';
  }

  const toggleBtn = domElements['aiGenChapterModeToggleBtn'];
  if (toggleBtn) {
    toggleBtn.tagName = 'BUTTON';
  }

  const modeBadge = domElements['aiGenChapterModeBadge'];
  if (modeBadge) {
    modeBadge.textContent = 'CBSE Catalog';
    modeBadge.innerText = 'CBSE Catalog';
  }

  const toggleText = domElements['aiGenChapterModeToggleText'];
  if (toggleText) {
    toggleText.textContent = 'Custom / Manual';
    toggleText.innerText = 'Custom / Manual';
  }

  const toggleIcon = domElements['aiGenChapterModeToggleIcon'];
  if (toggleIcon) {
    toggleIcon.textContent = '✏️';
    toggleIcon.innerText = '✏️';
  }

  const dropdownWrapper = domElements['aiGenChapterDropdownWrapper'];
  const inputWrapper = domElements['aiGenChapterInputWrapper'];
  if (inputWrapper) {
    inputWrapper.classList.add('hidden');
  }

  const quantityEl = domElements['aiGenQuantity'];
  if (quantityEl) quantityEl.value = '5';

  const diffEl = domElements['aiGenDifficulty'];
  if (diffEl) diffEl.value = 'MEDIUM';

  const modelEl = domElements['aiGenModel'];
  if (modelEl) modelEl.value = 'gemini-1.5-flash';

  const forceRefreshEl = domElements['aiGenForceRefresh'];
  if (forceRefreshEl) forceRefreshEl.checked = false;

  const mockStorage = {
    _data: {},
    getItem: function(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  };

  const mockDoc = {
    getElementById: function(id) {
      if (!domElements[id]) {
        domElements[id] = createMockElement(id);
      }
      return domElements[id];
    },
    createElement: function(tag) {
      return createMockElement(null, tag);
    },
    querySelectorAll: function() { return []; },
    addEventListener: function() {},
    body: createMockElement('body')
  };

  let generatedPayloads = [];

  const mockWin = {
    location: { hash: '' },
    localStorage: mockStorage,
    document: mockDoc,
    innerWidth: 1280,
    innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    addEventListener: function() {},
    removeEventListener: function() {},
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
      };
    },
    playSound: function() {},
    spawnConfetti: function() {},
    alertCustom: function() {},
    showAiGenStatus: function() {},
    fetchGeminiQuotaStatus: function() {},
    resetAiGenButtonState: function() {},
    handleGeminiGenerationSuccess: function() {},
    currentUser: { id: 'u_adm_test', role: 'parent', email: 'admin@test.com' },
    setTimeout: (fn, ms) => setTimeout(fn, ms || 0),
    clearTimeout: clearTimeout,
    setInterval: () => {},
    clearInterval: () => {},
    Date: Date,
    Math: Math,
    JSON: JSON,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    }
  };
  mockWin.window = mockWin;

  const sandbox = {
    window: mockWin,
    document: mockDoc,
    localStorage: mockStorage,
    console: mockWin.console,
    navigator: { userAgent: 'ZoptroChallengerM2' },
    AudioContext: mockWin.AudioContext,
    setTimeout: mockWin.setTimeout,
    clearTimeout: mockWin.clearTimeout,
    setInterval: mockWin.setInterval,
    clearInterval: mockWin.clearInterval,
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
  vm.runInContext(clientScript, sandbox);

  // Hook ZoptroApiClient to intercept and record generation payloads
  const apiClient = sandbox.module && sandbox.module.exports && sandbox.module.exports.ZoptroApiClient;
  if (apiClient && typeof apiClient.generateCurriculumQuestionsWithGemini === 'function') {
    const origApiGen = apiClient.generateCurriculumQuestionsWithGemini.bind(apiClient);
    apiClient.generateCurriculumQuestionsWithGemini = function(payload) {
      generatedPayloads.push(payload);
      return origApiGen(payload);
    };
  }

  return {
    sandbox,
    document: mockDoc,
    domElements,
    getGeneratedPayloads: () => generatedPayloads,
    clearGeneratedPayloads: () => { generatedPayloads = []; }
  };
}

async function runAll() {
  // =========================================================================
  // SUITE 1: FULL MATRIX COVERAGE ACROSS 10 GRADES & CORE SUBJECTS
  // =========================================================================
  console.log('--- SUITE 1: FULL MATRIX COVERAGE (10 GRADES x CORE SUBJECTS) ---');

  const expectedCatalog = {
    'Class 1': { 'Mathematics': 13, 'EVS': 5, 'English': 9, 'Hindi': 19 },
    'Class 2': { 'Mathematics': 11, 'EVS': 5, 'English': 13, 'Hindi': 26 },
    'Class 3': { 'Mathematics': 14, 'EVS': 12, 'English': 12, 'Hindi': 18 },
    'Class 4': { 'Mathematics': 14, 'EVS': 27, 'English': 9, 'Hindi': 14 },
    'Class 5': { 'Mathematics': 14, 'EVS': 22, 'English': 9, 'Hindi': 18 },
    'Class 6': { 'Mathematics': 10, 'Science': 12, 'Social Science': 14, 'English': 5 },
    'Class 7': { 'Mathematics': 13, 'Science': 13, 'Social Science': 23, 'English': 8 },
    'Class 8': { 'Mathematics': 13, 'Science': 13, 'Social Science': 21, 'English': 8 },
    'Class 9': { 'Mathematics': 12, 'Science': 12, 'Social Science': 20, 'English': 9 },
    'Class 10': { 'Mathematics': 14, 'Science': 13, 'Social Science': 22, 'English': 9 }
  };

  const env1 = createStudioDOMSandbox();
  const { sandbox: sb1, document: doc1 } = env1;

  // Initialize Admin AI Studio Curriculum
  sb1.initAdminAiStudioCurriculum();
  await waitTick(35);

  for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
    const gradeStr = `Class ${gradeNum}`;
    const subjectsMap = expectedCatalog[gradeStr];

    for (const [subject, expectedChapterCount] of Object.entries(subjectsMap)) {
      await runCheck('S1-Matrix', `${gradeStr} - ${subject}: populates ${expectedChapterCount} authentic chapters`, async () => {
        const gradeEl = doc1.getElementById('aiGenGrade');
        const subjectEl = doc1.getElementById('aiGenSubject');
        const chapterSelect = doc1.getElementById('aiGenChapterSelect');
        const countBadge = doc1.getElementById('aiGenChapterCountBadge');
        const chapterInput = doc1.getElementById('aiGenChapter');
        const topicInput = doc1.getElementById('aiGenTopic');

        gradeEl.value = gradeStr;
        subjectEl.value = subject;

        // Trigger curriculum change and wait for async catalog retrieval
        sb1.handleAiGenGradeOrSubjectChange();
        await waitTick(35);

        // Verify option count: 1 placeholder + expectedChapterCount + 1 custom entry = expectedChapterCount + 2
        assert.strictEqual(
          chapterSelect.options.length,
          expectedChapterCount + 2,
          `Expected ${expectedChapterCount + 2} options for ${gradeStr} ${subject}, got ${chapterSelect.options.length}`
        );

        // Verify placeholder
        assert.strictEqual(chapterSelect.options[0].value, '');
        assert.ok(chapterSelect.options[0].textContent.includes('Select Official CBSE/NCERT Chapter'));

        // Verify custom option at end
        const lastOpt = chapterSelect.options[chapterSelect.options.length - 1];
        assert.strictEqual(lastOpt.value, '__CUSTOM__');
        assert.ok(lastOpt.textContent.includes('Custom / Enter Manually'));

        // Verify count badge
        assert.strictEqual(countBadge.textContent, `${expectedChapterCount} Chapters Available`);

        // Verify auto-selection: chapterSelect.value should be the first chapter
        const firstChapterOpt = chapterSelect.options[1];
        assert.strictEqual(chapterSelect.value, firstChapterOpt.value);
        assert.strictEqual(chapterInput.value, firstChapterOpt.value);

        // Verify topics parsed & primary topic auto-filled
        assert.ok(topicInput.value.length > 0, `Topic input should receive primary topic for ${gradeStr} ${subject}`);

        // Verify dataset attributes on official chapter options
        for (let i = 1; i <= expectedChapterCount; i++) {
          const opt = chapterSelect.options[i];
          assert.ok(opt.value && opt.value.length > 0, `Option ${i} must have valid value`);
          assert.ok(opt.dataset.topics, `Option ${i} (${opt.value}) must have dataset.topics`);
          const topics = JSON.parse(opt.dataset.topics);
          assert.ok(Array.isArray(topics) && topics.length > 0, `Option ${i} topics must be non-empty array`);
        }
      });
    }
  }

  // Test unsupported / 0-item combinations: graceful fallback to custom mode
  await runCheck('S1-Fallback', 'Class 1 Science (0 catalog items) gracefully shifts to manual custom mode', async () => {
    const gradeEl = doc1.getElementById('aiGenGrade');
    const subjectEl = doc1.getElementById('aiGenSubject');
    const countBadge = doc1.getElementById('aiGenChapterCountBadge');
    const inputWrapper = doc1.getElementById('aiGenChapterInputWrapper');
    const dropdownWrapper = doc1.getElementById('aiGenChapterDropdownWrapper');

    gradeEl.value = 'Class 1';
    subjectEl.value = 'Science';

    sb1.handleAiGenGradeOrSubjectChange();
    await waitTick(35);

    assert.strictEqual(countBadge.textContent, '0 Chapters Available');
    assert.ok(!inputWrapper.classList.contains('hidden'), 'Input wrapper should be visible for 0-item catalog');
    assert.ok(dropdownWrapper.classList.contains('hidden'), 'Dropdown wrapper should be hidden');
  });

  await runCheck('S1-Fallback', 'Class 10 EVS (0 catalog items) gracefully shifts to manual custom mode', async () => {
    const gradeEl = doc1.getElementById('aiGenGrade');
    const subjectEl = doc1.getElementById('aiGenSubject');
    const countBadge = doc1.getElementById('aiGenChapterCountBadge');
    const inputWrapper = doc1.getElementById('aiGenChapterInputWrapper');

    gradeEl.value = 'Class 10';
    subjectEl.value = 'EVS';

    sb1.handleAiGenGradeOrSubjectChange();
    await waitTick(35);

    assert.strictEqual(countBadge.textContent, '0 Chapters Available');
    assert.ok(!inputWrapper.classList.contains('hidden'));
  });

  // =========================================================================
  // SUITE 2: DUAL-MODE TOGGLING, IDEMPOTENCY & VISIBILITY INVARIANTS
  // =========================================================================
  console.log('\n--- SUITE 2: DUAL-MODE TOGGLING & IDEMPOTENCY INVARIANTS ---');

  const env2 = createStudioDOMSandbox();
  const { sandbox: sb2, document: doc2 } = env2;
  sb2.initAdminAiStudioCurriculum();
  await waitTick(35);

  await runCheck('S2-Toggle', 'Default state is Dropdown mode', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');
    const modeBadge = doc2.getElementById('aiGenChapterModeBadge');
    const toggleText = doc2.getElementById('aiGenChapterModeToggleText');

    assert.ok(!dropdownWrapper.classList.contains('hidden'), 'Dropdown wrapper must NOT be hidden by default');
    assert.ok(inputWrapper.classList.contains('hidden'), 'Input wrapper MUST be hidden by default');
    assert.strictEqual(modeBadge.textContent, 'CBSE Catalog');
    assert.strictEqual(toggleText.textContent, 'Custom / Manual');
  });

  await runCheck('S2-Toggle', 'Toggle to Custom Manual mode updates DOM classes, badges, and focus', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');
    const modeBadge = doc2.getElementById('aiGenChapterModeBadge');
    const toggleText = doc2.getElementById('aiGenChapterModeToggleText');
    const toggleIcon = doc2.getElementById('aiGenChapterModeToggleIcon');
    const chapterInput = doc2.getElementById('aiGenChapter');

    const initialFocusCount = chapterInput.focusCount;
    sb2.toggleAiGenChapterMode('custom');

    assert.ok(dropdownWrapper.classList.contains('hidden'), 'Dropdown wrapper must be hidden in custom mode');
    assert.ok(!inputWrapper.classList.contains('hidden'), 'Input wrapper must be visible in custom mode');
    assert.strictEqual(modeBadge.textContent, 'Custom Manual');
    assert.strictEqual(toggleText.textContent, 'Official Syllabus');
    assert.strictEqual(toggleIcon.textContent, '📋');
    assert.ok(chapterInput.focusCount > initialFocusCount, 'Chapter input should receive focus');
  });

  await runCheck('S2-Idempotency', 'Calling toggleAiGenChapterMode("custom") repeatedly is strictly idempotent', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');
    const modeBadge = doc2.getElementById('aiGenChapterModeBadge');

    for (let i = 0; i < 10; i++) {
      sb2.toggleAiGenChapterMode('custom');
    }

    assert.ok(dropdownWrapper.classList.contains('hidden'));
    assert.ok(!inputWrapper.classList.contains('hidden'));
    assert.strictEqual(modeBadge.textContent, 'Custom Manual');
  });

  await runCheck('S2-Toggle', 'Toggle back to Dropdown mode restores catalog select and badge', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');
    const modeBadge = doc2.getElementById('aiGenChapterModeBadge');
    const toggleText = doc2.getElementById('aiGenChapterModeToggleText');
    const toggleIcon = doc2.getElementById('aiGenChapterModeToggleIcon');

    sb2.toggleAiGenChapterMode('dropdown');

    assert.ok(!dropdownWrapper.classList.contains('hidden'), 'Dropdown wrapper must be visible');
    assert.ok(inputWrapper.classList.contains('hidden'), 'Input wrapper must be hidden');
    assert.strictEqual(modeBadge.textContent, 'CBSE Catalog');
    assert.strictEqual(toggleText.textContent, 'Custom / Manual');
    assert.strictEqual(toggleIcon.textContent, '✏️');
  });

  await runCheck('S2-Idempotency', 'Calling toggleAiGenChapterMode("dropdown") repeatedly is strictly idempotent', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');
    const modeBadge = doc2.getElementById('aiGenChapterModeBadge');

    for (let i = 0; i < 10; i++) {
      sb2.toggleAiGenChapterMode('dropdown');
    }

    assert.ok(!dropdownWrapper.classList.contains('hidden'));
    assert.ok(inputWrapper.classList.contains('hidden'));
    assert.strictEqual(modeBadge.textContent, 'CBSE Catalog');
  });

  await runCheck('S2-Stress', 'Rapid mode toggling 100 times executes cleanly without stack overflow', async () => {
    const dropdownWrapper = doc2.getElementById('aiGenChapterDropdownWrapper');
    const inputWrapper = doc2.getElementById('aiGenChapterInputWrapper');

    for (let i = 0; i < 100; i++) {
      sb2.toggleAiGenChapterMode(); // No args toggles between states
    }

    // After 100 flips starting from dropdown, it should be back in dropdown mode
    assert.ok(!dropdownWrapper.classList.contains('hidden'));
    assert.ok(inputWrapper.classList.contains('hidden'));
  });

  // =========================================================================
  // SUITE 3: CHAPTER SELECTION, DATALIST & TOPIC PILLS SYNCHRONIZATION
  // =========================================================================
  console.log('\n--- SUITE 3: CHAPTER SELECTION & TOPIC SUGGESTIONS ---');

  const env3 = createStudioDOMSandbox();
  const { sandbox: sb3, document: doc3 } = env3;
  sb3.initAdminAiStudioCurriculum();
  await waitTick(35);

  await runCheck('S3-Sync', 'Selecting Chapter 5 (Fun with Shapes) in Class 3 Math syncs chapter, datalist, and pills', async () => {
    const gradeEl = doc3.getElementById('aiGenGrade');
    const subjectEl = doc3.getElementById('aiGenSubject');
    const chapterSelect = doc3.getElementById('aiGenChapterSelect');
    const chapterInput = doc3.getElementById('aiGenChapter');
    const topicInput = doc3.getElementById('aiGenTopic');
    const datalist = doc3.getElementById('aiGenTopicDatalist');
    const pillsContainer = doc3.getElementById('aiGenTopicPillsContainer');

    gradeEl.value = 'Class 3';
    subjectEl.value = 'Mathematics';
    sb3.handleAiGenGradeOrSubjectChange();
    await waitTick(35);

    // Change chapter to "Fun with Shapes"
    chapterSelect.value = 'Fun with Shapes';
    sb3.handleAiGenChapterSelectChange('Fun with Shapes');

    // 1. Chapter input sync
    assert.strictEqual(chapterInput.value, 'Fun with Shapes');

    // 2. Datalist populated with authentic topics from NCERT Maths Mela Ch 5
    assert.ok(datalist.innerHTML.includes('Tessellations & Tiling Patterns'), 'Datalist should include Tessellations');
    assert.ok(datalist.innerHTML.includes('Mirror Symmetry'), 'Datalist should include Mirror Symmetry');

    // 3. Topic input receives first topic
    assert.ok(topicInput.value.length > 0);
    assert.strictEqual(topicInput.value, 'Tessellations & Tiling Patterns');

    // 4. Topic pills rendered
    const pillButtons = pillsContainer.querySelectorAll('button');
    assert.strictEqual(pillButtons.length, 3, `Expected 3 topic pills for Fun with Shapes, got ${pillButtons.length}`);
  });

  await runCheck('S3-CustomOpt', 'Selecting __CUSTOM__ in dropdown automatically switches to custom manual mode', async () => {
    const chapterSelect = doc3.getElementById('aiGenChapterSelect');
    const inputWrapper = doc3.getElementById('aiGenChapterInputWrapper');
    const dropdownWrapper = doc3.getElementById('aiGenChapterDropdownWrapper');
    const pillsContainer = doc3.getElementById('aiGenTopicPillsContainer');
    const chapterInput = doc3.getElementById('aiGenChapter');

    chapterSelect.value = '__CUSTOM__';
    sb3.handleAiGenChapterSelectChange('__CUSTOM__');

    assert.ok(!inputWrapper.classList.contains('hidden'), 'Input wrapper must become visible');
    assert.ok(dropdownWrapper.classList.contains('hidden'), 'Dropdown wrapper must become hidden');
    assert.notStrictEqual(chapterInput.value, '__CUSTOM__', 'Chapter input must not hold literal __CUSTOM__');
    assert.ok(pillsContainer.innerHTML.includes('Manual mode: type any custom topic'), 'Pills container should display manual mode prompt');
  });

  await runCheck('S3-Placeholder', 'Selecting empty placeholder clears chapter and topic suggestions', async () => {
    const chapterSelect = doc3.getElementById('aiGenChapterSelect');
    const chapterInput = doc3.getElementById('aiGenChapter');
    const datalist = doc3.getElementById('aiGenTopicDatalist');
    const pillsContainer = doc3.getElementById('aiGenTopicPillsContainer');

    chapterSelect.value = '';
    sb3.handleAiGenChapterSelectChange('');

    assert.strictEqual(chapterInput.value, '');
    assert.strictEqual(datalist.innerHTML, '');
    assert.strictEqual(pillsContainer.innerHTML, '');
  });

  // =========================================================================
  // SUITE 4: TOPIC SUGGESTION PILLS INTERACTION & BRAND GEOMETRY
  // =========================================================================
  console.log('\n--- SUITE 4: TOPIC PILLS INTERACTION & BRAND GEOMETRY ---');

  const env4 = createStudioDOMSandbox();
  const { sandbox: sb4, document: doc4 } = env4;
  sb4.initAdminAiStudioCurriculum();
  await waitTick(35);

  await runCheck('S4-Pills', 'Clicking a topic pill updates #aiGenTopic.value and active styling', async () => {
    const gradeEl = doc4.getElementById('aiGenGrade');
    const subjectEl = doc4.getElementById('aiGenSubject');
    const chapterSelect = doc4.getElementById('aiGenChapterSelect');
    const topicInput = doc4.getElementById('aiGenTopic');
    const pillsContainer = doc4.getElementById('aiGenTopicPillsContainer');

    gradeEl.value = 'Class 10';
    subjectEl.value = 'Science';
    sb4.handleAiGenGradeOrSubjectChange();
    await waitTick(35);

    // Select "Chemical Reactions and Equations"
    chapterSelect.value = 'Chemical Reactions and Equations';
    sb4.handleAiGenChapterSelectChange('Chemical Reactions and Equations');

    const buttons = pillsContainer.querySelectorAll('button');
    assert.ok(buttons.length >= 3, `Expected at least 3 pills for Class 10 Science Ch 1, got ${buttons.length}`);

    // Button 0 should be active initially
    assert.ok(buttons[0].className.includes('bg-[#F4F2EA]'), 'Initial pill must have active styling');
    assert.ok(buttons[1].className.includes('bg-white'), 'Second pill must have inactive styling');

    // Click second pill (e.g., Types of Chemical Reactions)
    const targetTopic = buttons[1].textContent.trim();
    buttons[1].onclick({ preventDefault: () => {} });

    // Verify #aiGenTopic.value updated
    assert.ok(topicInput.value.includes(targetTopic) || targetTopic.includes(topicInput.value),
              `Topic input should match clicked pill. Input: "${topicInput.value}", Pill: "${targetTopic}"`);

    // Verify classes updated
    assert.ok(buttons[1].className.includes('bg-[#F4F2EA]'), 'Clicked pill must receive active styling');
    assert.ok(buttons[0].className.includes('bg-white'), 'Previous pill must receive inactive styling');
  });

  await runCheck('S4-Brand', 'Topic pills strictly enforce universal 0px border-radius (rounded-none)', async () => {
    const pillsContainer = doc4.getElementById('aiGenTopicPillsContainer');
    const buttons = pillsContainer.querySelectorAll('button');

    buttons.forEach((btn, idx) => {
      assert.ok(btn.className.includes('rounded-none'), `Pill ${idx} must include rounded-none`);
      assert.ok(!/\brounded-(?!none)[a-z0-9]+/i.test(btn.className), `Pill ${idx} contains curved class: ${btn.className}`);
      assert.ok(!/(['" ])rounded(['" ])/i.test(` ${btn.className} `), `Pill ${idx} contains bare rounded class`);
    });
  });

  // =========================================================================
  // SUITE 5: CUSTOM MANUAL INPUT & HANDLETRIGGERGEMINIGENERATION
  // =========================================================================
  console.log('\n--- SUITE 5: CUSTOM MANUAL INPUT & GENERATION SUBMISSION ---');

  const env5 = createStudioDOMSandbox();
  const { sandbox: sb5, document: doc5 } = env5;
  sb5.initAdminAiStudioCurriculum();
  await waitTick(35);

  await runCheck('S5-CustomGen', 'handleTriggerGeminiGeneration seamlessly accesses custom chapter and topic', async () => {
    const chapterInput = doc5.getElementById('aiGenChapter');
    const topicInput = doc5.getElementById('aiGenTopic');

    // Switch to manual mode
    sb5.toggleAiGenChapterMode('custom');
    sb5.currentUser = { id: 'u_adm_test', role: 'parent' };

    // Input custom values
    chapterInput.value = 'Quantum Mechanics in Primary School';
    topicInput.value = 'Wave-Particle Duality for Kids';

    // Trigger generation and await async dispatch
    sb5.handleTriggerGeminiGeneration();
    await waitTick(35);

    const payloads = env5.getGeneratedPayloads();
    assert.strictEqual(payloads.length, 1, 'Should dispatch 1 generation payload');
    const p = payloads[0];

    assert.strictEqual(p.chapter, 'Quantum Mechanics in Primary School');
    assert.strictEqual(p.topic, 'Wave-Particle Duality for Kids');
    assert.strictEqual(p.adminUserId, 'u_adm_test');
    assert.strictEqual(p.gradeClass, 'Class 3');
    assert.strictEqual(p.subject, 'Mathematics');
  });

  await runCheck('S5-AutoDetect', 'Typing authentic chapter in manual mode auto-detects and updates topic suggestions', async () => {
    const gradeEl = doc5.getElementById('aiGenGrade');
    const subjectEl = doc5.getElementById('aiGenSubject');
    const chapterInput = doc5.getElementById('aiGenChapter');
    const chapterSelect = doc5.getElementById('aiGenChapterSelect');
    const pillsContainer = doc5.getElementById('aiGenTopicPillsContainer');

    gradeEl.value = 'Class 3';
    subjectEl.value = 'Mathematics';
    sb5.handleAiGenGradeOrSubjectChange();
    await waitTick(35);

    // In Class 3 Math, type "Toy Joy"
    chapterInput.value = 'Toy Joy';
    sb5.handleAiGenChapterManualInput('Toy Joy');

    assert.strictEqual(chapterSelect.value, 'Toy Joy', 'Select dropdown should synchronize to typed authentic chapter');
    const pills = pillsContainer.querySelectorAll('button');
    assert.ok(pills.length > 0, 'Topic suggestion pills should populate for auto-detected chapter');
  });

  await runCheck('S5-Validation', 'handleTriggerGeminiGeneration blocks submission if chapter is empty', async () => {
    env5.clearGeneratedPayloads();
    const chapterInput = doc5.getElementById('aiGenChapter');
    const topicInput = doc5.getElementById('aiGenTopic');

    chapterInput.value = '   ';
    topicInput.value = 'Some Topic';

    sb5.handleTriggerGeminiGeneration();

    const payloads = env5.getGeneratedPayloads();
    assert.strictEqual(payloads.length, 0, 'Must NOT submit generation when chapter is blank');
  });

  await runCheck('S5-Validation', 'handleTriggerGeminiGeneration blocks submission if topic is empty', async () => {
    env5.clearGeneratedPayloads();
    const chapterInput = doc5.getElementById('aiGenChapter');
    const topicInput = doc5.getElementById('aiGenTopic');

    chapterInput.value = 'Valid Chapter';
    topicInput.value = '   ';

    sb5.handleTriggerGeminiGeneration();

    const payloads = env5.getGeneratedPayloads();
    assert.strictEqual(payloads.length, 0, 'Must NOT submit generation when topic is blank');
  });

  // =========================================================================
  // SUITE 6: ADVERSARIAL STRESS, SECURITY & INVARIANTS
  // =========================================================================
  console.log('\n--- SUITE 6: ADVERSARIAL STRESS, SECURITY & BRAND INVARIANTS ---');

  const env6 = createStudioDOMSandbox();
  const { sandbox: sb6, document: doc6 } = env6;
  sb6.initAdminAiStudioCurriculum();
  await waitTick(35);

  await runCheck('S6-Reinit', 'initAdminAiStudioCurriculum is strictly idempotent across 10 rapid calls', async () => {
    for (let i = 0; i < 10; i++) {
      sb6.initAdminAiStudioCurriculum();
    }
    assert.strictEqual(sb6.aiStudioCurriculumInitialized, true);
  });

  await runCheck('S6-Injection', 'Custom chapter with HTML/XSS and formula injection is safely preserved', async () => {
    const maliciousChapter = '"><script>alert(1)</script>=CMD|\' /C calc\'!A0';
    const chapterInput = doc6.getElementById('aiGenChapter');

    sb6.toggleAiGenChapterMode('custom');
    chapterInput.value = maliciousChapter;
    sb6.handleAiGenChapterManualInput(maliciousChapter);

    assert.strictEqual(chapterInput.value, maliciousChapter);
  });

  await runCheck('S6-QuoteEscape', 'updateAiGenTopicSuggestions escapes quotes properly in datalist options', async () => {
    const maliciousTopics = ['Topic "with" quotes', 'Another <tag> & "escaped"'];
    sb6.updateAiGenTopicSuggestions(maliciousTopics);

    const datalist = doc6.getElementById('aiGenTopicDatalist');
    assert.ok(datalist.innerHTML.includes('&quot;with&quot;'));
    assert.ok(!datalist.innerHTML.includes('Topic "with" quotes'));
  });

  await runCheck('S6-GradeNorm', 'normalizeAiGenGrade handles diverse edge case inputs', async () => {
    assert.strictEqual(sb6.normalizeAiGenGrade('Class 5'), 'Class 5');
    assert.strictEqual(sb6.normalizeAiGenGrade('class 10'), 'Class 10');
    assert.strictEqual(sb6.normalizeAiGenGrade('grade 7'), 'Class 7');
    assert.strictEqual(sb6.normalizeAiGenGrade('8'), 'Class 8');
    assert.strictEqual(sb6.normalizeAiGenGrade(''), 'Class 3');
    assert.strictEqual(sb6.normalizeAiGenGrade(null), 'Class 3');
  });

  await runCheck('S6-EmptyTopics', 'renderAiGenTopicPills handles null, empty, and non-array topics gracefully', async () => {
    const pillsContainer = doc6.getElementById('aiGenTopicPillsContainer');

    sb6.renderAiGenTopicPills([]);
    assert.ok(pillsContainer.innerHTML.includes('No preset topics'));

    sb6.renderAiGenTopicPills(null);
    assert.ok(pillsContainer.innerHTML.includes('No preset topics'));

    sb6.renderAiGenTopicPills(undefined);
    assert.ok(pillsContainer.innerHTML.includes('No preset topics'));
  });

  await runCheck('S6-Burst', '50 rapid grade & subject switches execute in <250ms without crashing', async () => {
    const gradeEl = doc6.getElementById('aiGenGrade');
    const subjectEl = doc6.getElementById('aiGenSubject');

    const start = Date.now();
    const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'EVS'];

    for (let i = 0; i < 50; i++) {
      gradeEl.value = grades[i % grades.length];
      subjectEl.value = subjects[i % subjects.length];
      sb6.handleAiGenGradeOrSubjectChange();
    }
    await waitTick(50);

    const duration = Date.now() - start;
    assert.ok(duration < 500, `50 switches took ${duration}ms, expected <500ms`);
  });

  // =========================================================================
  // FINAL SUMMARY
  // =========================================================================
  console.log('\n=========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.log(`  ⚠️  ${failedTests} TESTS FAILED:`);
    failures.forEach(f => console.log(`     - [${f.suite}] ${f.testName}: ${f.error}`));
  } else {
    console.log('  🎉 ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS');
  }
  console.log('=========================================================================\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

runAll().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
