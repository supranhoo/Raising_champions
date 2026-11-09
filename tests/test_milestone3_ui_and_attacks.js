/**
 * Zoptro Educational Focus & Multi-Child Mission Control Platform
 * Milestone 3 Adversarial Attack Surface & UI Controller Harness
 * Author: m3_challenger_1 (Empirical Challenger)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML_PATH = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createEnv() {
  const domElements = {};
  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1];
    domElements[id] = {
      id: id,
      tagName: 'DIV',
      value: '',
      innerText: '',
      innerHTML: '',
      checked: false,
      disabled: false,
      className: '',
      classList: {
        _classes: new Set(),
        add: function(...c) { c.forEach(x => this._classes.add(x)); },
        remove: function(...c) { c.forEach(x => this._classes.delete(x)); },
        contains: function(c) { return this._classes.has(c); }
      },
      style: {},
      children: [],
      appendChild: function(c) { this.children.push(c); return c; },
      focus: function() {},
      closest: function(sel) { return this; },
      getContext: function() {
        return {
          clearRect: () => {}, save: () => {}, restore: () => {},
          translate: () => {}, rotate: () => {}, fillRect: () => {},
          beginPath: () => {}, arc: () => {}, fill: () => {},
          stroke: () => {}, moveTo: () => {}, lineTo: () => {}, closePath: () => {}
        };
      }
    };
  }

  const mockStorage = {
    _data: {},
    getItem: function(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  };

  const mockDoc = {
    getElementById: function(id) { return domElements[id] || null; },
    querySelector: function(sel) {
      if (sel && sel.startsWith('#')) return domElements[sel.slice(1)] || null;
      return null;
    },
    querySelectorAll: function(sel) { return []; },
    createElement: function(tag) {
      return {
        tagName: tag.toUpperCase(),
        innerText: '',
        innerHTML: '',
        className: '',
        classList: {
          _classes: new Set(),
          add: function(...c) { c.forEach(x => this._classes.add(x)); },
          remove: function(...c) { c.forEach(x => this._classes.delete(x)); },
          contains: function(c) { return this._classes.has(c); }
        },
        style: {},
        children: [],
        appendChild: function(c) { this.children.push(c); return c; }
      };
    },
    body: { style: {}, appendChild: function() {} },
    addEventListener: function() {}
  };

  let customAlerts = [];
  let sounds = [];
  let confetti = false;

  const mockWin = {
    location: { hash: '' },
    localStorage: mockStorage,
    document: mockDoc,
    innerWidth: 1280,
    innerHeight: 800,
    scrollTo: function() {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date,
    Math: Math,
    JSON: JSON,
    console: console,
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
    playSound: function(s) { sounds.push(s); },
    spawnConfetti: function() { confetti = true; },
    alertCustom: function(t, m) { customAlerts.push({ title: t, message: m }); }
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);

  // Hook functions after script execution so our spies aren't overwritten
  const origPlaySound = sandbox.playSound;
  sandbox.playSound = function(s) {
    sounds.push(s);
    try { if (origPlaySound && origPlaySound !== sandbox.playSound) origPlaySound(s); } catch (e) {}
  };
  const origSpawnConfetti = sandbox.spawnConfetti;
  sandbox.spawnConfetti = function() {
    confetti = true;
    try { if (origSpawnConfetti && origSpawnConfetti !== sandbox.spawnConfetti) origSpawnConfetti(); } catch (e) {}
  };
  const origAlertCustom = sandbox.alertCustom;
  sandbox.alertCustom = function(t, m) {
    customAlerts.push({ title: t, message: m });
    try { if (origAlertCustom && origAlertCustom !== sandbox.alertCustom) origAlertCustom(t, m); } catch (e) {}
  };

  return {
    sandbox: sandbox,
    window: mockWin,
    document: mockDoc,
    domElements: domElements,
    mockStorage: mockStorage,
    getCustomAlerts: () => customAlerts,
    getSounds: () => sounds,
    getConfetti: () => confetti
  };
}

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`    ✔ ${name}`);
  } catch (e) {
    console.error(`    ✖ ${name}: ${e.message}`);
    throw e;
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`    ✔ ${name}`);
  } catch (e) {
    console.error(`    ✖ ${name}: ${e.message}`);
    throw e;
  }
}

(async function main() {
  console.log('\n=========================================================================');
  console.log('  MILESTONE 3: ATTACK SURFACE & INTERACTIVE UI CONTROLLER STRESS TESTS');
  console.log('=========================================================================\n');

  const env = createEnv();
  const mock = env.sandbox.BrowserMockBackend;
  mock.init(true);

  // -------------------------------------------------------------------------
  // 1. BOUNDARY & OUT-OF-BOUNDS QUANTITY CLAMPING
  // -------------------------------------------------------------------------
  console.log('>>> 1. Boundary & Out-of-Bounds Quantity Clamping <<<');

  test('Clamps quantity < 1 to minimum 1', () => {
    const items = mock._synthesizeCurriculumQuestions({
      gradeClass: 'Class 5',
      subject: 'Math',
      quantity: -10
    });
    assert.strictEqual(items.length, 1);
  });

  test('Clamps quantity > 20 to maximum 20', () => {
    const items = mock._synthesizeCurriculumQuestions({
      gradeClass: 'Class 5',
      subject: 'Math',
      quantity: 999
    });
    assert.strictEqual(items.length, 20);
  });

  test('Defaults invalid non-numeric quantity to 5', () => {
    const items = mock._synthesizeCurriculumQuestions({
      gradeClass: 'Class 5',
      subject: 'Math',
      quantity: 'invalid_string'
    });
    assert.strictEqual(items.length, 5);
  });

  // -------------------------------------------------------------------------
  // 2. CORRUPTED STORAGE SELF-HEALING & FAULT TOLERANCE
  // -------------------------------------------------------------------------
  console.log('\n>>> 2. Corrupted Storage Self-Healing & Fault Tolerance <<<');

  test('checkAndIncrementRateLimit survives corrupted JSON in timestamps storage', () => {
    env.mockStorage.setItem('gemini_rpm_timestamps_gemini-1.5-flash', 'CORRUPTED_{{{NOT_JSON');
    const decision = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(decision.allowed, true);
    assert.strictEqual(decision.rpmCurrent, 1);
  });

  test('checkAndIncrementRateLimit survives corrupted string in RPD storage', () => {
    const todayUtc = new Date().toISOString().substring(0, 10);
    env.mockStorage.setItem('gemini_rpd_gemini-1.5-flash_' + todayUtc, 'NAN_VALUE_FOO');
    const decision = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(decision.allowed, true);
    assert.strictEqual(decision.rpdCurrent, 1);
  });

  test('generateCurriculumQuestionsWithGemini survives corrupted cache entry JSON', () => {
    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 4',
      subject: 'Science',
      chapter: 'Light',
      topic: 'Shadows'
    };
    const fp = mock.computeGeminiCacheFingerprint(payload);
    env.mockStorage.setItem('gemini_cache_' + fp, 'CORRUPT_CACHE_NOT_JSON');

    // Should gracefully bypass corrupted cache and generate fresh items
    const res = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.cached, false);
    assert.ok(res.items.length > 0);
  });

  test('getGeminiQuotaStatus survives Table 15 logs table with missing or string-encoded numbers', () => {
    // If Table 15 contains records with missing fields or string numbers
    const partialLogs = [
      { id: '1' }, // Missing totalTokens (defaults to 0)
      { id: '2', totalTokens: '300', cachedFlag: 'invalid' }, // String number "300"
      { id: '3', totalTokens: 500, cachedFlag: true, status: 'SUCCESS' }
    ];
    mock._setTable(mock.KEYS.GEMINI_TOKEN_LOGS, partialLogs);

    const status = mock.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
    assert.strictEqual(status.success, true);
    assert.strictEqual(status.totalTokensLogged, 800); // 0 + 300 + 500 = 800
    assert.strictEqual(status.totalCallsLogged, 3);
    assert.strictEqual(status.cacheHitCount, 1);
  });

  // -------------------------------------------------------------------------
  // 3. INTERACTIVE PREVIEW DECK & INLINE EDITING MUTATIONS
  // -------------------------------------------------------------------------
  console.log('\n>>> 3. Interactive Preview Deck & Inline Editing Mutations <<<');

  test('handleGeminiGenerationSuccess initializes currentGeneratedBatch and renders preview deck', () => {
    const mockApiResponse = {
      success: true,
      cached: false,
      model: 'gemini-1.5-flash',
      items: [
        {
          id: 'test_q_1',
          grade: 'Class 3',
          subject: 'Math',
          chapter: 'Money',
          topic: 'Coins',
          questionText: 'How many 50p coins make 1 rupee?',
          options: ['1', '2', '4', '5'],
          correctOptionIndex: 1,
          hint: '100 paise = 1 rupee.',
          explanation: '50 * 2 = 100 paise.',
          bloomLevel: 'Understanding',
          difficulty: 'Easy'
        },
        {
          id: 'test_q_2',
          grade: 'Class 3',
          subject: 'Math',
          chapter: 'Money',
          topic: 'Notes',
          questionText: 'Which note is green?',
          options: ['₹10', '₹20', '₹50', '₹500'],
          correctOptionIndex: 1,
          hint: 'Look at the color of 20 rupee note.',
          explanation: '₹20 note is greenish-yellow.',
          bloomLevel: 'Remembering',
          difficulty: 'Easy'
        }
      ],
      tokenUsage: { promptTokens: 450, candidateTokens: 240, totalTokens: 690 },
      rateLimits: { rpmRemaining: 14, dailyRemaining: 1490 }
    };

    env.sandbox.handleGeminiGenerationSuccess(mockApiResponse, 35);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 2);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 2 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '2');
    assert.strictEqual(env.domElements.aiGenSummaryTotalTokens.innerText, '690');
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('How many 50p coins make 1 rupee?'));
  });

  test('updateGeneratedQuestionText mutates questionText in currentGeneratedBatch in real-time', () => {
    env.sandbox.updateGeneratedQuestionText(0, 'MODIFIED QUESTION TEXT');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].questionText, 'MODIFIED QUESTION TEXT');
  });

  test('updateGeneratedQuestionOption mutates specific option in currentGeneratedBatch', () => {
    env.sandbox.updateGeneratedQuestionOption(0, 2, 'MODIFIED OPTION C');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options[2], 'MODIFIED OPTION C');
  });

  test('updateGeneratedQuestionCorrectIndex switches correctOptionIndex and re-renders radio selection', () => {
    env.sandbox.updateGeneratedQuestionCorrectIndex(0, 3);
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].correctOptionIndex, 3);
  });

  test('updateGeneratedQuestionHint and updateGeneratedQuestionExplanation mutate respective pedagogical fields', () => {
    env.sandbox.updateGeneratedQuestionHint(0, 'NEW HINT CONTENT');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].hint, 'NEW HINT CONTENT');

    env.sandbox.updateGeneratedQuestionExplanation(0, 'NEW EXPLANATION CONTENT');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].explanation, 'NEW EXPLANATION CONTENT');
  });

  test('discardGeneratedQuestion removes specific card and updates deck counter', () => {
    env.sandbox.discardGeneratedQuestion(0);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].id, 'test_q_2');
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 1 Item');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '1');
  });

  test('discardEntireGeneratedBatch empties inspection deck and hides preview deck', () => {
    env.sandbox.discardEntireGeneratedBatch();
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
    assert.ok(env.domElements.aiGenPreviewDeck.classList.contains('hidden'));
  });

  // -------------------------------------------------------------------------
  // 4. STORAGE COMMITMENT BRIDGE (Table 11 CurriculumQuizzes)
  // -------------------------------------------------------------------------
  console.log('\n>>> 4. Storage Commitment Bridge (Table 11 CurriculumQuizzes) <<<');

  await testAsync('commitGeneratedBatchToStorage ingests edited items into Table 11 and dispatches celebration effects', async () => {
    mock.init(true);

    // Populate currentGeneratedBatch
    env.sandbox.currentGeneratedBatch = [
      {
        id: 'test_ingest_1',
        grade: 'Class 4',
        subject: 'Social Science',
        chapter: 'Our Country',
        topic: 'States and Capitals',
        questionText: 'What is the capital of Karnataka?',
        options: ['Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai'],
        correctOptionIndex: 1,
        hint: 'Known as the Silicon Valley of India.',
        explanation: 'Bengaluru is the capital city of Karnataka.',
        bloomLevel: 'Remembering',
        difficulty: 'Easy'
      }
    ];

    env.sandbox.commitGeneratedBatchToStorage();
    await new Promise(r => setTimeout(r, 100));

    if (env.sandbox.currentGeneratedBatch.length !== 0) {
      console.log('DEBUG ALERTS:', env.getCustomAlerts());
    }

    // Verify deck is cleared
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);

    // Verify audio, confetti, and toast feedback
    assert.ok(env.getSounds().includes('correct'));
    assert.strictEqual(env.getConfetti(), true);
    assert.ok(env.getCustomAlerts().length > 0);
    assert.ok(env.getCustomAlerts()[0].title.includes('Curriculum Ingestion Complete'));

    // Verify item is present in Table 11 CurriculumQuizzes
    const quizzes = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES);
    const found = quizzes.find(q => q.id === 'test_ingest_1');
    assert.ok(found, 'Ingested question must exist in Table 11 CurriculumQuizzes');
    assert.strictEqual(found.subject, 'Social Science');
    assert.strictEqual(found.examCategory, 'CBSE');
    assert.strictEqual(found.correctOptionIndex, 1);
    assert.strictEqual(found.isActive, true);
  });

  // -------------------------------------------------------------------------
  // 5. RATE LIMIT COUNTDOWN BANNER CONTROLLER
  // -------------------------------------------------------------------------
  console.log('\n>>> 5. Rate Limit Countdown Banner Controller <<<');

  test('startRateLimitCountdown updates banner text, disables submit button, and counts down', () => {
    env.domElements.aiGenCountdownBanner.classList.add('hidden');
    env.domElements.aiGenSubmitBtn.disabled = false;

    // Start 3 second countdown
    env.sandbox.startRateLimitCountdown(3);

    assert.strictEqual(env.domElements.aiGenCountdownBanner.classList.contains('hidden'), false);
    assert.strictEqual(env.domElements.aiGenSubmitBtn.disabled, true);
    assert.strictEqual(String(env.domElements.aiGenCountdownTimer.innerText), '3');
  });

  console.log('\n=========================================================================');
  console.log(`  ALL ${totalTests} ATTACK & UI CONTROLLER TESTS PASSED (100% SUCCESS)`);
  console.log('=========================================================================\n');
})();
