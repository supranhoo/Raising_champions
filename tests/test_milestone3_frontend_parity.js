/**
 * Zoptro Educational Focus & Multi-Child Mission Control Platform
 * Milestone 3 Automated Verification Suite: Frontend Admin Studio, Quota HUD,
 * BrowserMockBackend Parity & Direct Storage Ingestion Bridge.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML_PATH = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const BACKEND_PATH = path.join(__dirname, '..', 'google_apps_script_backend.js');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const backendContent = fs.readFileSync(BACKEND_PATH, 'utf8');

// Extract backend methods for parity verification
const backendModule = {};
const backendSandbox = {
  backendModule: backendModule,
  console: console,
  Utilities: {
    computeDigest: function(alg, val) {
      const crypto = require('crypto');
      return Array.from(crypto.createHash('sha256').update(val, 'utf8').digest());
    },
    DigestAlgorithm: { SHA_256: 'SHA_256' }
  }
};
vm.createContext(backendSandbox);
vm.runInContext(backendContent + '\nbackendModule.computeGeminiCacheFingerprint = computeGeminiCacheFingerprint;\nbackendModule.sha256 = sha256;\nbackendModule.normalizeGrade = normalizeGrade;', backendSandbox);

// Extract main application frontend script block
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

// Setup mock DOM and Browser environment
function createMockFrontendEnvironment() {
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

  let audioPlayed = [];
  let confettiSpawned = false;
  let lastCustomAlert = null;

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
    playSound: function(s) { audioPlayed.push(s); },
    spawnConfetti: function() { confettiSpawned = true; },
    alertCustom: function(t, m) { lastCustomAlert = { title: t, message: m }; }
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);

  // Hook functions after script execution so our spies aren't overwritten
  const origPlaySound = sandbox.playSound;
  sandbox.playSound = function(s) {
    audioPlayed.push(s);
    try { if (origPlaySound && origPlaySound !== sandbox.playSound) origPlaySound(s); } catch (e) {}
  };
  const origSpawnConfetti = sandbox.spawnConfetti;
  sandbox.spawnConfetti = function() {
    confettiSpawned = true;
    try { if (origSpawnConfetti && origSpawnConfetti !== sandbox.spawnConfetti) origSpawnConfetti(); } catch (e) {}
  };
  const origAlertCustom = sandbox.alertCustom;
  sandbox.alertCustom = function(t, m) {
    lastCustomAlert = { title: t, message: m };
    try { if (origAlertCustom && origAlertCustom !== sandbox.alertCustom) origAlertCustom(t, m); } catch (e) {}
  };

  return {
    sandbox: sandbox,
    window: mockWin,
    document: mockDoc,
    domElements: domElements,
    getAudioPlayed: function() { return audioPlayed; },
    getConfettiSpawned: function() { return confettiSpawned; },
    getLastCustomAlert: function() { return lastCustomAlert; }
  };
}

let totalTests = 0;
let passedTests = 0;

function runTest(suite, name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`    ✔ [${suite}] ${name}`);
  } catch (err) {
    console.error(`    ✖ [${suite}] ${name}`);
    console.error(`      Error: ${err.message}`);
    throw err;
  }
}

async function runTestAsync(suite, name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`    ✔ [${suite}] ${name}`);
  } catch (err) {
    console.error(`    ✖ [${suite}] ${name}`);
    console.error(`      Error: ${err.message}`);
    throw err;
  }
}

(async function main() {
  console.log('\n=========================================================================');
  console.log('  MILESTONE 3: FRONTEND ADMIN STUDIO, QUOTA HUD & BROWSER MOCK PARITY');
  console.log('=========================================================================\n');

  const env = createMockFrontendEnvironment();
  const mock = env.sandbox.BrowserMockBackend;
  const client = env.sandbox.ZoptroApiClient;

  // Initialize mock backend database
  mock.init(true);

  // -------------------------------------------------------------------------
  // GROUP 1: Cryptographic Fingerprinting & Determinism Parity
  // -------------------------------------------------------------------------
  console.log('>>> GROUP 1: Cryptographic Fingerprint Determinism (RFC 6234 SHA-256) <<<');

  const testPayloads = [
    {
      gradeClass: 'Class 3',
      subject: 'Mathematics',
      chapter: 'Fractions and Decimals',
      topic: 'Equivalent Fractions',
      questionType: 'MCQ',
      quantity: 5,
      difficulty: 'Medium',
      bloomLevel: 'Applying',
      model: 'gemini-1.5-flash'
    },
    {
      gradeClass: 'Class 7',
      subject: 'Science',
      chapter: 'Motion and Time',
      topic: 'Speed Calculations',
      questionType: 'NUMERICAL',
      quantity: 10,
      difficulty: 'Hard',
      bloomLevel: 'Analyzing',
      model: 'gemini-2.0-flash'
    },
    {
      gradeClass: 'Class 10',
      subject: 'Social Science',
      chapter: 'Federalism',
      topic: 'Decentralization in India',
      questionType: 'SHORT_ANSWER',
      quantity: 3,
      difficulty: 'Medium',
      bloomLevel: 'Understanding',
      model: 'gemini-1.5-flash'
    }
  ];

  testPayloads.forEach((payload, idx) => {
    runTest('Group 1', `Payload #${idx + 1} produces byte-for-byte identical SHA-256 fingerprint between GAS and Mock`, () => {
      const serverHash = backendSandbox.backendModule.computeGeminiCacheFingerprint(payload);
      const mockHash = mock.computeGeminiCacheFingerprint(payload);
      assert.strictEqual(typeof mockHash, 'string');
      assert.strictEqual(mockHash.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');
      assert.strictEqual(mockHash, serverHash, 'Client SHA-256 fingerprint must match server hash exactly');
    });
  });

  // -------------------------------------------------------------------------
  // GROUP 2: RBAC Validation, Defect Fix & Table 15 Keys
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 2: RBAC Validation, Defect Fix & Table 15 Keys <<<');

  runTest('Group 2', 'BrowserMockBackend.KEYS includes GEMINI_TOKEN_LOGS Table 15 key', () => {
    assert.strictEqual(mock.KEYS.GEMINI_TOKEN_LOGS, 'zoptro_db_gemini_token_logs');
  });

  runTest('Group 2', 'Latent defect fix: BrowserMockBackend._assertAdmin alias is defined and matches assertAdmin', () => {
    assert.strictEqual(typeof mock._assertAdmin, 'function', '_assertAdmin alias must be defined');
    const valid = mock._assertAdmin('u_adm_demo');
    assert.strictEqual(valid.success, true, 'Valid admin ID must succeed');
    assert.strictEqual(valid.role, 'admin');

    const invalid = mock._assertAdmin('u_stu_demo');
    assert.strictEqual(invalid.success, false, 'Non-admin ID must fail');
    assert.strictEqual(invalid.code, 403);
  });

  runTest('Group 2', 'Calling bulkUploadContentBatch executes without throwing TypeError on this._assertAdmin', () => {
    const res = mock.bulkUploadContentBatch({
      adminUserId: 'u_adm_demo',
      contentType: 'CurriculumQuizzes',
      items: [
        {
          questionText: 'What is 2 + 2?',
          options: ['2', '3', '4', '5'],
          correctOptionIndex: 2,
          explanation: '2 + 2 equals 4.'
        }
      ]
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.importedCount, 1);
  });

  // -------------------------------------------------------------------------
  // GROUP 3: Sliding-Window Rate Limiter & Daily Quota Guard (15 RPM / 1.5K RPD)
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 3: Sliding-Window Rate Limiter & Daily Quota (15 RPM / 1.5K RPD) <<<');

  runTest('Group 3', 'Sliding 60-second rate limiter permits up to 15 requests and throttles on the 16th', () => {
    mock.init(true);
    const model = 'gemini-1.5-flash';

    for (let i = 0; i < 15; i++) {
      const decision = mock.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(decision.allowed, true, `Request #${i + 1} should be permitted`);
      assert.strictEqual(decision.rpmCurrent, i + 1);
      assert.strictEqual(decision.rpmRemaining, 15 - (i + 1));
    }

    // 16th request must be rejected
    const blocked = mock.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blocked.allowed, false, '16th request must breach 15 RPM');
    assert.strictEqual(blocked.rpmRemaining, 0);
    assert.ok(blocked.retryAfterSeconds > 0, 'Retry-after must be positive');
    assert.ok(blocked.error.includes('RATE_LIMIT_EXCEEDED'));
  });

  runTest('Group 3', 'Rate limit inspection with consume=false does not consume RPM/RPD slots', () => {
    env.window.localStorage.clear();
    mock.init(true);
    const model = 'gemini-1.5-flash';
    const statusBefore = mock.checkAndIncrementRateLimit(model, false);
    assert.strictEqual(statusBefore.rpmCurrent, 0);
    assert.strictEqual(statusBefore.rpmRemaining, 15);

    mock.checkAndIncrementRateLimit(model, true); // Consume 1

    const statusAfter = mock.checkAndIncrementRateLimit(model, false);
    assert.strictEqual(statusAfter.rpmCurrent, 1);
    assert.strictEqual(statusAfter.rpmRemaining, 14);

    const statusAfter2 = mock.checkAndIncrementRateLimit(model, false);
    assert.strictEqual(statusAfter2.rpmCurrent, 1); // Remains unchanged
  });

  // -------------------------------------------------------------------------
  // GROUP 4: Deduplication Caching & Token Controls
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 4: SHA-256 Deduplication Caching & Token Controls <<<');

  runTest('Group 4', 'First generation incurs token consumption and stores response in cache', () => {
    env.window.localStorage.clear();
    mock.init(true);
    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 4',
      subject: 'Mathematics',
      chapter: 'Fractions',
      topic: 'Equivalent Fractions',
      questionType: 'MCQ',
      quantity: 5,
      difficulty: 'Medium',
      bloomLevel: 'Applying',
      model: 'gemini-1.5-flash'
    };

    const res1 = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.cached, false, 'Initial request must be a cache miss');
    assert.ok(res1.tokenUsage.totalTokens > 0, 'Tokens must be logged on cache miss');
    assert.strictEqual(res1.items.length, 5);

    // Second call with identical payload must be served from cache with 0 tokens
    const res2 = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.cached, true, 'Subsequent identical request must be served from cache');
    assert.strictEqual(res2.tokenUsage.promptTokens, 0, 'Prompt tokens must be 0 on cache hit');
    assert.strictEqual(res2.tokenUsage.candidateTokens, 0, 'Candidate tokens must be 0 on cache hit');
    assert.strictEqual(res2.tokenUsage.totalTokens, 0, 'Total tokens must be 0 on cache hit');
    assert.strictEqual(res2.items.length, 5);
  });

  runTest('Group 4', 'forceRefresh: true bypasses deduplication cache and re-synthesizes', () => {
    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 4',
      subject: 'Mathematics',
      chapter: 'Fractions',
      topic: 'Equivalent Fractions',
      questionType: 'MCQ',
      quantity: 5,
      difficulty: 'Medium',
      bloomLevel: 'Applying',
      model: 'gemini-1.5-flash',
      forceRefresh: true
    };

    const res = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.cached, false, 'forceRefresh must bypass cache');
    assert.ok(res.tokenUsage.totalTokens > 0);
  });

  // -------------------------------------------------------------------------
  // GROUP 5: Pedagogical Question Synthesis & CWE-1236 Formula Sanitization
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 5: Pedagogical Question Synthesis & CWE-1236 Sanitization <<<');

  const qTypes = ['MCQ', 'SHORT_ANSWER', 'TRUE_FALSE', 'FILL_IN_BLANK', 'NUMERICAL'];
  qTypes.forEach(qType => {
    runTest('Group 5', `Synthesizes valid questions for question type ${qType}`, () => {
      const items = mock._synthesizeCurriculumQuestions({
        gradeClass: 'Class 5',
        subject: 'Science',
        chapter: 'Circulatory System',
        topic: 'Heart Chambers',
        questionType: qType,
        quantity: 4,
        difficulty: 'Medium',
        bloomLevel: 'Understanding'
      });
      assert.strictEqual(items.length, 4);
      items.forEach((item, idx) => {
        assert.ok(item.title, `Item #${idx + 1} must have title`);
        assert.ok(item.questionText, `Item #${idx + 1} must have questionText`);
        assert.strictEqual(item.examCategory, 'CBSE');
        assert.ok(item.hint, `Item #${idx + 1} must have hint`);
        assert.ok(item.explanation, `Item #${idx + 1} must have explanation`);
        assert.strictEqual(item.options.length, 4, `Item #${idx + 1} must have exactly 4 options`);
        assert.ok(item.correctOptionIndex >= 0 && item.correctOptionIndex < 4, `correctOptionIndex must be 0-3`);
      });
    });
  });

  runTest('Group 5', 'Formula sanitization (CWE-1236) prefixes dangerous characters with single quote', () => {
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('+CMD|'), "'+CMD|");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('-42'), "'-42");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('@admin'), "'@admin");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('\tTabbed'), "'\tTabbed");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('Regular Text'), 'Regular Text');
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue("'AlreadyEscaped"), "'AlreadyEscaped");
  });

  // -------------------------------------------------------------------------
  // GROUP 6: Quota Status Telemetry & Log Aggregation
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 6: Quota Status Telemetry & Log Aggregation <<<');

  runTest('Group 6', 'getGeminiQuotaStatus returns complete telemetry matching interface contract', () => {
    const quota = mock.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
    assert.strictEqual(quota.success, true);
    assert.strictEqual(quota.model, 'gemini-1.5-flash');
    assert.strictEqual(quota.rpmLimit, 15);
    assert.strictEqual(quota.rpdLimit, 1500);
    assert.ok(typeof quota.rpmRemaining === 'number');
    assert.ok(typeof quota.rpdRemaining === 'number');
    assert.ok(typeof quota.totalTokensLogged === 'number');
    assert.ok(typeof quota.totalCallsLogged === 'number');
    assert.ok(typeof quota.cacheHitCount === 'number');
  });

  // -------------------------------------------------------------------------
  // GROUP 7: Dual-Mode Client API Dispatch (ZoptroApiClient)
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 7: Dual-Mode Client API Dispatch (ZoptroApiClient) <<<');

  await runTestAsync('Group 7', 'ZoptroApiClient.generateCurriculumQuestionsWithGemini resolves to valid response', async () => {
    const res = await client.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 3',
      subject: 'English',
      chapter: 'Nouns',
      topic: 'Proper Nouns',
      questionType: 'MCQ',
      quantity: 3
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.items.length, 3);
  });

  await runTestAsync('Group 7', 'ZoptroApiClient.getGeminiQuotaStatus resolves to quota telemetry', async () => {
    const quota = await client.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
    assert.strictEqual(quota.success, true);
    assert.strictEqual(quota.rpmLimit, 15);
  });

  await runTestAsync('Group 7', 'ZoptroApiClient.apiCall generic bridge routes correctly', async () => {
    const res = await client.apiCall('getGeminiQuotaStatus', { adminUserId: 'u_adm_demo' });
    assert.strictEqual(res.success, true);
  });

  // -------------------------------------------------------------------------
  // GROUP 8: Admin Studio UI & Quota HUD DOM Invariants
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 8: Admin Studio UI & Quota HUD DOM Architecture <<<');

  const requiredStaticIds = [
    'adminTabBtnAiGenerate',
    'adminAiGenerateContainer',
    'adminGeminiQuotaHud',
    'aiHudRpm',
    'aiHudRpmBar',
    'aiHudRpd',
    'aiHudRpdBar',
    'aiHudTokens',
    'aiHudTokenSub',
    'aiHudCache',
    'aiHudCost',
    'aiGenConfigPanel',
    'aiGenGrade',
    'aiGenSubject',
    'aiGenType',
    'aiGenChapter',
    'aiGenTopic',
    'aiGenQuantity',
    'aiGenDifficulty',
    'aiGenModel',
    'aiGenTargetContentType',
    'aiGenForceRefresh',
    'aiGenSubmitBtn',
    'aiGenBtnText',
    'aiGenLoadingSpinner',
    'aiGenStatusMsg',
    'aiGenCountdownBanner',
    'aiGenCountdownTimer',
    'aiGenPreviewDeck',
    'aiGenSummaryBanner',
    'aiGenSummaryStatusBadge',
    'aiGenSummaryLatency',
    'aiGenSummaryPromptTokens',
    'aiGenSummaryCandidateTokens',
    'aiGenSummaryTotalTokens',
    'aiGenDeckCountBadge',
    'aiGenDiscardBatchBtn',
    'aiGenCommitBtn',
    'aiGenCommitCountBadge',
    'aiGenCommitStatus',
    'aiGenPreviewEmptyState',
    'aiGenQuestionsList'
  ];

  requiredStaticIds.forEach(id => {
    runTest('Group 8', `Static DOM ID #${id} exists in HTML markup`, () => {
      assert.ok(env.domElements[id], `Missing required static DOM element #${id}`);
    });
  });

  runTest('Group 8', 'renderGeminiQuotaHud populates HUD elements correctly', () => {
    env.sandbox.renderGeminiQuotaHud({
      rpmLimit: 15,
      rpmRemaining: 12,
      rpdLimit: 1500,
      rpdRemaining: 1480,
      totalTokensLogged: 4500,
      totalCallsLogged: 8,
      cacheHitCount: 3
    });
    assert.strictEqual(env.domElements.aiHudRpm.innerText, '12 / 15 RPM');
    assert.strictEqual(env.domElements.aiHudRpd.innerText, '1,480 / 1,500 RPD');
    assert.strictEqual(env.domElements.aiHudTokens.innerText, '4,500 tokens');
    assert.strictEqual(env.domElements.aiHudTokenSub.innerText, 'Across 8 generation calls');
    assert.strictEqual(env.domElements.aiHudCache.innerText, '38% (3 saved)');
    assert.strictEqual(env.domElements.aiHudCost.innerText, '$0.00');
  });

  // -------------------------------------------------------------------------
  // GROUP 9: Interactive Preview Deck Controller
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 9: Interactive Preview Deck Controller <<<');

  runTest('Group 9', 'handleGeminiGenerationSuccess renders question cards and summary telemetry', () => {
    const sampleItems = [
      {
        id: 'curr_test_1',
        grade: 'Class 3',
        subject: 'Mathematics',
        chapter: 'Fractions',
        topic: 'Halves',
        questionText: 'What fraction of an apple is left after eating half?',
        options: ['1/4', '1/2', '3/4', '1/3'],
        correctOptionIndex: 1,
        hint: 'Two halves make a whole.',
        explanation: '1 - 1/2 = 1/2.',
        bloomLevel: 'Understanding',
        difficulty: 'Easy',
        examCategory: 'CBSE'
      },
      {
        id: 'curr_test_2',
        grade: 'Class 3',
        subject: 'Mathematics',
        chapter: 'Fractions',
        topic: 'Quarters',
        questionText: 'How many quarters make one whole?',
        options: ['2', '3', '4', '5'],
        correctOptionIndex: 2,
        hint: 'Think of 25 paise coins.',
        explanation: 'Four quarters make 1 whole.',
        bloomLevel: 'Remembering',
        difficulty: 'Easy',
        examCategory: 'CBSE'
      }
    ];

    env.sandbox.handleGeminiGenerationSuccess({
      items: sampleItems,
      cached: false,
      tokenUsage: { promptTokens: 450, candidateTokens: 240, totalTokens: 690 },
      latencyMs: 120
    }, {
      model: 'gemini-1.5-flash',
      gradeClass: 'Class 3',
      subject: 'Mathematics',
      chapter: 'Fractions',
      topic: 'Fractions Intro'
    });

    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 2 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '2');
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('What fraction of an apple'));
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('How many quarters make one whole'));
  });

  runTest('Group 9', 'Inline editing modifies currentGeneratedBatch in place', () => {
    env.sandbox.updateGeneratedQuestionText(0, 'Modified prompt for question 1');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].questionText, 'Modified prompt for question 1');

    env.sandbox.updateGeneratedQuestionOption(0, 0, 'New Option A');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options[0], 'New Option A');

    env.sandbox.updateGeneratedQuestionCorrectIndex(0, 3);
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].correctOptionIndex, 3);

    env.sandbox.updateGeneratedQuestionHint(0, 'Updated Hint');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].hint, 'Updated Hint');

    env.sandbox.updateGeneratedQuestionExplanation(0, 'Updated Explanation');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].explanation, 'Updated Explanation');
  });

  runTest('Group 9', 'Per-item discard removes question and decrements deck counter', () => {
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 2);
    env.sandbox.discardGeneratedQuestion(0);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 1 Item');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '1');
  });

  runTest('Group 9', 'discardEntireGeneratedBatch empties the inspection deck', () => {
    env.sandbox.discardEntireGeneratedBatch();
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
    assert.ok(env.domElements.aiGenPreviewDeck.classList.contains('hidden'));
  });

  // -------------------------------------------------------------------------
  // GROUP 10: Direct Storage Ingestion Bridge & Audio/Confetti Feedback
  // -------------------------------------------------------------------------
  console.log('\n>>> GROUP 10: Direct Storage Commitment & User Feedback <<<');

  await runTestAsync('Group 10', 'commitGeneratedBatchToStorage ingests items into Table 11 CurriculumQuizzes and triggers audio/confetti', async () => {
    // Populate batch
    const freshBatch = [
      {
        questionText: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctOptionIndex: 1,
        hint: 'Named after Roman god of war.',
        explanation: 'Mars appears red due to iron oxide on its surface.',
        grade: 'Class 4',
        subject: 'Science',
        chapter: 'Solar System',
        topic: 'Planets',
        bloomLevel: 'Remembering',
        difficulty: 'Easy'
      }
    ];

    env.sandbox.handleGeminiGenerationSuccess({ items: freshBatch }, { gradeClass: 'Class 4', subject: 'Science' });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);

    // Initial count in Table 11
    const beforeCount = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES).length;

    // Trigger commit
    env.sandbox.handleCommitAiGeneratedToStorage();

    // Await async ZoptroApiClient.bulkUploadContentBatch resolution
    await new Promise(r => setTimeout(r, 80));

    // Verify addition in Table 11
    const quizzes = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES);
    assert.strictEqual(quizzes.length, beforeCount + 1);

    const committed = quizzes[quizzes.length - 1];
    assert.strictEqual(committed.questionText, 'Which planet is known as the Red Planet?');
    assert.strictEqual(committed.examCategory, 'CBSE');
    assert.strictEqual(committed.correctOptionIndex, 1);
    assert.strictEqual(committed.isActive, true);

    // Verify feedback triggers
    assert.ok(env.getAudioPlayed().includes('correct'), 'Audio "correct" must be played on commit');
    assert.strictEqual(env.getConfettiSpawned(), true, 'Confetti must be spawned on commit');
    assert.ok(env.getLastCustomAlert().title.includes('Curriculum Ingestion Complete'));

    // Preview deck must be reset
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
  });

  console.log('\n=========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('=========================================================================\n');
  process.exit(passedTests === totalTests ? 0 : 1);
})();
