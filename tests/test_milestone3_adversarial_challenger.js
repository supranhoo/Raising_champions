/**
 * Zoptro Educational Focus & Multi-Child Mission Control Platform
 * Milestone 3 Adversarial Empirical Challenger Suite
 * Author: m3_challenger_1 (Empirical Challenger)
 *
 * Rigorously stress-tests BrowserMockBackend in divyank_mission_control_google_apps_script_app.html:
 * 1. Rate Limiting & Burst Protection (15 RPM burst, 429 semantics, sliding-window anti-tumbling, 1500 RPD daily limit, UTC midnight rollover)
 * 2. Canonical Deduplication Caching & Token Controls (SHA-256 fingerprinting, Bloom/Difficulty sensitivity, 0 token hit, forceRefresh)
 * 3. Synthetic Question Generator Rigor (4 subjects, 5 question types, 4 options, valid correctOptionIndex, hints/explanations, CWE-1236 sanitization)
 * 4. Quota Telemetry Non-Mutation (getGeminiQuotaStatus idempotency & zero state mutation)
 * 5. Server-Side RBAC Enforcement (Admin privileges required for generator & telemetry)
 * 6. Storage Bridge Parity (bulkUploadContentBatch commitment to Table 11 CurriculumQuizzes)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML_PATH = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const BACKEND_PATH = path.join(__dirname, '..', 'google_apps_script_backend.js');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const backendContent = fs.readFileSync(BACKEND_PATH, 'utf8');

// Extract backend methods for parity checks
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

// Extract frontend script
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createAdversarialEnvironment(customTime) {
  let currentTime = customTime || Date.now();

  const mockStorage = {
    _data: {},
    getItem: function(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  };

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

  class MockDate extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(currentTime);
      } else {
        super(...args);
      }
    }
    static now() {
      return currentTime;
    }
  }

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
    Date: MockDate,
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
    playSound: function() {},
    spawnConfetti: function() {},
    alertCustom: function() {}
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);

  return {
    sandbox: sandbox,
    window: mockWin,
    document: mockDoc,
    mockStorage: mockStorage,
    setTime: function(t) { currentTime = t; },
    getTime: function() { return currentTime; },
    advanceTime: function(ms) { currentTime += ms; }
  };
}

let totalTests = 0;
let passedTests = 0;
const failures = [];

function runChallengerTest(category, name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`    ✔ [${category}] ${name}`);
  } catch (err) {
    console.error(`    ✖ [${category}] ${name}`);
    console.error(`      Error: ${err.message}`);
    failures.push({ category, name, error: err.message, stack: err.stack });
  }
}

async function runChallengerTestAsync(category, name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`    ✔ [${category}] ${name}`);
  } catch (err) {
    console.error(`    ✖ [${category}] ${name}`);
    console.error(`      Error: ${err.message}`);
    failures.push({ category, name, error: err.message, stack: err.stack });
  }
}

(async function executeAdversarialSuite() {
  console.log('\n=========================================================================');
  console.log('  MILESTONE 3: ADVERSARIAL CHALLENGER EMPIRICAL VERIFICATION HARNESS');
  console.log('=========================================================================\n');

  // =========================================================================
  // SUITE 1: RATE LIMITING & BURST PROTECTION RIGOR
  // =========================================================================
  console.log('>>> SUITE 1: Rate Limiting & Burst Protection Rigor <<<');

  runChallengerTest('RateLimiter', 'Exactly 15 consecutive requests within 60s window are permitted', () => {
    const baseTime = 1700000000000;
    const env = createAdversarialEnvironment(baseTime);
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    for (let i = 1; i <= 15; i++) {
      env.advanceTime(100); // 100ms apart
      const decision = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
      assert.strictEqual(decision.allowed, true, `Request #${i} should be allowed`);
      assert.strictEqual(decision.rpmCurrent, i, `rpmCurrent should be ${i}`);
      assert.strictEqual(decision.rpmRemaining, 15 - i, `rpmRemaining should be ${15 - i}`);
      assert.strictEqual(decision.retryAfterSeconds, 0);
    }
  });

  runChallengerTest('RateLimiter', '16th burst request within 60s is rejected with 429 semantics and valid retryAfterSeconds <= 60', () => {
    const baseTime = 1700000000000;
    const env = createAdversarialEnvironment(baseTime);
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    // Consume 15 slots
    for (let i = 0; i < 15; i++) {
      env.advanceTime(1000); // 1s apart, from t = 1000 to t = 15000
      mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    }

    // 16th call at t = 15500
    env.advanceTime(500);
    const decision = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(decision.allowed, false, '16th burst call must be rejected');
    assert.strictEqual(decision.rpmRemaining, 0);
    assert.ok(decision.retryAfterSeconds > 0 && decision.retryAfterSeconds <= 60, `retryAfterSeconds must be between 1 and 60, got ${decision.retryAfterSeconds}`);
    assert.ok(decision.error.includes('RATE_LIMIT_EXCEEDED'));

    // Check generateCurriculumQuestionsWithGemini returns code 429
    const genResult = mock.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 3',
      subject: 'Mathematics',
      chapter: 'Shapes',
      topic: 'Circles',
      questionType: 'MCQ',
      quantity: 5,
      forceRefresh: true // Force bypass cache to trigger rate limit check
    });
    assert.strictEqual(genResult.success, false);
    assert.strictEqual(genResult.code, 429, 'Must return HTTP 429 code');
    assert.ok(genResult.rateLimits.retryAfterSeconds > 0 && genResult.rateLimits.retryAfterSeconds <= 60);
  });

  runChallengerTest('RateLimiter', 'Sliding window anti-tumbling: slot opens on rolling basis, not fixed tumbling reset', () => {
    const baseTime = 1700000000000;
    const env = createAdversarialEnvironment(baseTime);
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    // Call 1 at t = 0
    const d1 = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(d1.allowed, true);

    // Calls 2 through 15 at t = 30,000ms (30s later)
    env.advanceTime(30000);
    for (let i = 2; i <= 15; i++) {
      const d = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
      assert.strictEqual(d.allowed, true);
    }

    // At t = 35,000ms: 16th call must fail
    env.advanceTime(5000);
    const blocked1 = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(blocked1.allowed, false);

    // At t = 59,900ms (call 1 at t=0 has NOT expired yet, 60s not reached): must still fail
    env.setTime(baseTime + 59900);
    const blocked2 = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(blocked2.allowed, false);

    // At t = 60,100ms: Call 1 (at t=0) has expired (>60s). But calls 2-15 (at t=30,000) are only 30.1s old!
    env.setTime(baseTime + 60100);
    // Exactly 1 slot should be open!
    const allowedAfter1stExpire = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(allowedAfter1stExpire.allowed, true, 'Slot for call 1 should be open');
    assert.strictEqual(allowedAfter1stExpire.rpmCurrent, 15, 'rpmCurrent should be back at 15');

    // A second call at t = 60,100ms MUST BE REJECTED because calls 2-15 have not expired!
    const blockedImmediate = mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    assert.strictEqual(blockedImmediate.allowed, false, 'Should NOT tumble; calls 2-15 are still active');

    // Advance to t = 90,100ms (calls 2-15 were at 30,000ms, now 60.1s have elapsed): all 14 slots open up!
    env.setTime(baseTime + 90100);
    const checkStatus = mock.checkAndIncrementRateLimit('gemini-1.5-flash', false);
    // Only call 16 (made at 60,100ms) is still active in window [30,100ms to 90,100ms]
    assert.strictEqual(checkStatus.rpmCurrent, 1, 'Only call 16 should remain in the window');
    assert.strictEqual(checkStatus.rpmRemaining, 14, '14 slots must be open');
  });

  runChallengerTest('RateLimiter', 'Daily quota exhaustion (1,500 RPD) blocks with 429 and calculates retryAfterSeconds to UTC midnight', () => {
    // Pick a known UTC time: 2026-11-08T18:00:00.000Z (6 hours before UTC midnight = 21,600 seconds)
    const knownUtcTime = Date.parse('2026-11-08T18:00:00.000Z');
    const env = createAdversarialEnvironment(knownUtcTime);
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const model = 'gemini-1.5-flash';
    const todayUtc = '2026-11-08';
    const rpdKey = 'gemini_rpd_gemini-1.5-flash_' + todayUtc;

    // Simulate 1,499 requests already made today
    env.mockStorage.setItem(rpdKey, '1499');

    // 1,500th request: should succeed
    const decision1500 = mock.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision1500.allowed, true, '1500th request must be allowed');
    assert.strictEqual(decision1500.rpdCurrent, 1500);
    assert.strictEqual(decision1500.dailyRemaining, 0);

    // 1,501st request: must be blocked with DAILY_QUOTA_EXCEEDED
    const decision1501 = mock.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision1501.allowed, false, '1501st request must be blocked');
    assert.ok(decision1501.error.includes('DAILY_QUOTA_EXCEEDED'));
    assert.strictEqual(decision1501.rpdCurrent, 1500);
    assert.strictEqual(decision1501.dailyRemaining, 0);

    // retryAfterSeconds calculation: at 18:00:00 UTC, exactly 6 hours = 21,600 seconds remain until UTC midnight
    assert.strictEqual(decision1501.retryAfterSeconds, 21600, 'Must calculate exact seconds to UTC midnight');

    // Verify generateCurriculumQuestionsWithGemini returns 429 and DAILY_QUOTA_EXCEEDED error
    const genResult = mock.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 5',
      subject: 'Science',
      chapter: 'Water Cycle',
      topic: 'Evaporation',
      forceRefresh: true
    });
    assert.strictEqual(genResult.success, false);
    assert.strictEqual(genResult.code, 429);
    assert.ok(genResult.error.includes('DAILY_QUOTA_EXCEEDED'));
    assert.strictEqual(genResult.rateLimits.retryAfterSeconds, 21600);
  });

  runChallengerTest('RateLimiter', 'UTC midnight rollover clears daily quota automatically', () => {
    const knownUtcTime = Date.parse('2026-11-08T23:59:50.000Z'); // 10 seconds before midnight
    const env = createAdversarialEnvironment(knownUtcTime);
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const model = 'gemini-1.5-flash';
    const rpdKeyNov8 = 'gemini_rpd_gemini-1.5-flash_2026-11-08';
    env.mockStorage.setItem(rpdKeyNov8, '1500');

    // At 23:59:50, requests are blocked with retryAfterSeconds = 10
    const blockedBeforeMidnight = mock.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blockedBeforeMidnight.allowed, false);
    assert.strictEqual(blockedBeforeMidnight.retryAfterSeconds, 10);

    // Advance 15 seconds into next day (2026-11-09T00:00:05.000Z)
    env.advanceTime(15000);

    // Request on the new day must be allowed!
    const allowedAfterMidnight = mock.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(allowedAfterMidnight.allowed, true, 'Request after UTC midnight must be allowed');
    assert.strictEqual(allowedAfterMidnight.rpdCurrent, 1, 'RPD counter starts fresh on new day');
    assert.strictEqual(allowedAfterMidnight.dailyRemaining, 1499);
  });

  // =========================================================================
  // SUITE 2: CANONICAL DEDUPLICATION CACHING & TOKEN CONTROLS
  // =========================================================================
  console.log('\n>>> SUITE 2: Canonical Deduplication Caching & Token Controls <<<');

  runChallengerTest('Caching', 'Subsequent calls with identical parameters return cached: true and 0 token burn', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 6',
      subject: 'Science',
      chapter: 'Components of Food',
      topic: 'Vitamins and Minerals',
      questionType: 'MCQ',
      quantity: 5,
      difficulty: 'Medium',
      bloomLevel: 'Understanding',
      model: 'gemini-1.5-flash'
    };

    // First call: fresh generation
    const res1 = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.cached, false);
    assert.ok(res1.tokenUsage.promptTokens > 0);
    assert.ok(res1.tokenUsage.candidateTokens > 0);
    assert.ok(res1.tokenUsage.totalTokens > 0);

    // Second call: exact same payload
    const res2 = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.cached, true, 'Second call must be cached');
    assert.strictEqual(res2.tokenUsage.promptTokens, 0, 'Prompt tokens must be 0 on cache hit');
    assert.strictEqual(res2.tokenUsage.candidateTokens, 0, 'Candidate tokens must be 0 on cache hit');
    assert.strictEqual(res2.tokenUsage.totalTokens, 0, 'Total tokens must be 0 on cache hit');
    assert.strictEqual(res2.items.length, 5);

    // Verify Table 15 GeminiTokenLogs has 2 entries: entry 1 totalTokens > 0, entry 2 totalTokens === 0 & cachedFlag === true
    const logs = mock._getTable(mock.KEYS.GEMINI_TOKEN_LOGS);
    assert.strictEqual(logs.length, 2);
    assert.strictEqual(logs[0].cachedFlag, false);
    assert.ok(logs[0].totalTokens > 0);
    assert.strictEqual(logs[1].cachedFlag, true);
    assert.strictEqual(logs[1].totalTokens, 0);
  });

  runChallengerTest('Caching', 'forceRefresh: true bypasses deduplication cache and burns tokens', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 6',
      subject: 'Science',
      chapter: 'Components of Food',
      topic: 'Proteins',
      questionType: 'MCQ',
      quantity: 4,
      difficulty: 'Easy',
      bloomLevel: 'Remembering',
      model: 'gemini-1.5-flash'
    };

    // Populate cache
    mock.generateCurriculumQuestionsWithGemini(payload);

    // Call with forceRefresh: true
    const refreshed = mock.generateCurriculumQuestionsWithGemini(Object.assign({}, payload, { forceRefresh: true }));
    assert.strictEqual(refreshed.success, true);
    assert.strictEqual(refreshed.cached, false, 'forceRefresh must bypass cache');
    assert.ok(refreshed.tokenUsage.totalTokens > 0, 'forceRefresh must meter new tokens');

    // Table 15 should have 2 non-cached entries
    const logs = mock._getTable(mock.KEYS.GEMINI_TOKEN_LOGS);
    assert.strictEqual(logs.length, 2);
    assert.strictEqual(logs[0].cachedFlag, false);
    assert.strictEqual(logs[1].cachedFlag, false);
  });

  runChallengerTest('Caching', 'Changing Bloom levels produces distinct SHA-256 cache fingerprints', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;

    const bloomLevels = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
    const hashes = new Set();

    bloomLevels.forEach(bloom => {
      const hash = mock.computeGeminiCacheFingerprint({
        gradeClass: 'Class 8',
        subject: 'Mathematics',
        chapter: 'Linear Equations',
        topic: 'One Variable Equations',
        questionType: 'MCQ',
        quantity: 5,
        difficulty: 'Medium',
        bloomLevel: bloom,
        model: 'gemini-1.5-flash'
      });
      assert.strictEqual(hash.length, 64);
      hashes.add(hash);
    });

    assert.strictEqual(hashes.size, bloomLevels.length, 'Each Bloom level must generate a unique fingerprint');
  });

  runChallengerTest('Caching', 'Changing Difficulty produces distinct SHA-256 cache fingerprints', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;

    const difficulties = ['Easy', 'Medium', 'Hard'];
    const hashes = new Set();

    difficulties.forEach(diff => {
      const hash = mock.computeGeminiCacheFingerprint({
        gradeClass: 'Class 9',
        subject: 'Social Science',
        chapter: 'Electoral Politics',
        topic: 'General Elections',
        questionType: 'MCQ',
        quantity: 5,
        difficulty: diff,
        bloomLevel: 'Understanding',
        model: 'gemini-1.5-flash'
      });
      assert.strictEqual(hash.length, 64);
      hashes.add(hash);
    });

    assert.strictEqual(hashes.size, difficulties.length, 'Each Difficulty level must generate a unique fingerprint');
  });

  runChallengerTest('Caching', 'Grade normalization canonically unifies grade string representations', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;

    const variations = ['Class 7', 'class 7', 'Grade 7', 'grade 7', '7'];
    const hashes = new Set();

    variations.forEach(grade => {
      const hash = mock.computeGeminiCacheFingerprint({
        gradeClass: grade,
        subject: 'Science',
        chapter: 'Heat',
        topic: 'Conduction',
        questionType: 'MCQ',
        quantity: 5,
        difficulty: 'Medium',
        bloomLevel: 'Applying',
        model: 'gemini-1.5-flash'
      });
      hashes.add(hash);
    });

    assert.strictEqual(hashes.size, 1, 'All grade variations must produce identical canonical SHA-256 cache fingerprint');
  });

  runChallengerTest('Caching', 'Cached responses are served even when 15 RPM burst limit has been exhausted', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 4',
      subject: 'English',
      chapter: 'Adjectives',
      topic: 'Degrees of Comparison',
      questionType: 'MCQ',
      quantity: 5,
      difficulty: 'Easy',
      bloomLevel: 'Remembering',
      model: 'gemini-1.5-flash'
    };

    // Step 1: Pre-warm cache
    const warmup = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(warmup.success, true);
    assert.strictEqual(warmup.cached, false);

    // Step 2: Exhaust the remaining 14 RPM slots with distinct fresh requests
    for (let i = 0; i < 14; i++) {
      mock.checkAndIncrementRateLimit('gemini-1.5-flash', true);
    }
    // Now rate limit is reached (15 RPM exhausted)
    const rateCheck = mock.checkAndIncrementRateLimit('gemini-1.5-flash', false);
    assert.strictEqual(rateCheck.rpmRemaining, 0);

    // Step 3: Call with the cached payload. MUST SUCCEED with cached: true without 429 error!
    const cachedCall = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(cachedCall.success, true, 'Cached call must succeed even under RPM exhaustion');
    assert.strictEqual(cachedCall.cached, true);
    assert.strictEqual(cachedCall.tokenUsage.totalTokens, 0);
  });

  // =========================================================================
  // SUITE 3: SYNTHETIC QUESTION GENERATOR RIGOR & CWE-1236 SANITIZATION
  // =========================================================================
  console.log('\n>>> SUITE 3: Synthetic Question Generator Rigor & CWE-1236 Sanitization <<<');

  const subjects = ['Mathematics', 'Science', 'Social Science', 'English'];
  const questionTypes = ['MCQ', 'SHORT_ANSWER', 'TRUE_FALSE', 'FILL_IN_BLANK', 'NUMERICAL'];

  subjects.forEach(subject => {
    questionTypes.forEach(qType => {
      runChallengerTest('Generator', `Generates pedagogical questions for ${subject} with question type ${qType}`, () => {
        const env = createAdversarialEnvironment();
        const mock = env.sandbox.BrowserMockBackend;

        const items = mock._synthesizeCurriculumQuestions({
          gradeClass: 'Class 7',
          subject: subject,
          chapter: 'Core Chapter',
          topic: 'Key Concept',
          questionType: qType,
          quantity: 4,
          difficulty: 'Medium',
          bloomLevel: 'Analyzing'
        });

        assert.strictEqual(items.length, 4);

        items.forEach((item, idx) => {
          assert.ok(item.id, `Item #${idx} must have an ID`);
          assert.strictEqual(item.grade, 'Class 7');
          assert.strictEqual(item.subject, subject);
          assert.strictEqual(item.examCategory, 'CBSE');
          assert.ok(item.title && item.title.length > 5, `Item #${idx} title must be non-empty`);
          assert.ok(item.questionText && item.questionText.length > 10, `Item #${idx} questionText must be non-empty`);
          assert.ok(item.hint && item.hint.length > 5, `Item #${idx} hint must be non-empty`);
          assert.ok(item.explanation && item.explanation.length > 5, `Item #${idx} explanation must be non-empty`);

          // Options invariant: EXACTLY 4 options
          assert.strictEqual(Array.isArray(item.options), true, `Item #${idx} options must be array`);
          assert.strictEqual(item.options.length, 4, `Item #${idx} must have exactly 4 options`);
          item.options.forEach((opt, optIdx) => {
            assert.ok(typeof opt === 'string' && opt.length > 0, `Option #${optIdx} in item #${idx} must be non-empty string`);
          });

          // CorrectOptionIndex invariant: 0 <= correctOptionIndex <= 3
          assert.strictEqual(typeof item.correctOptionIndex, 'number');
          assert.ok(item.correctOptionIndex >= 0 && item.correctOptionIndex < 4, `Item #${idx} correctOptionIndex must be 0, 1, 2, or 3 (got ${item.correctOptionIndex})`);

          // optionsJson must parse to identical options array
          const parsedOptions = JSON.parse(item.optionsJson);
          assert.strictEqual(JSON.stringify(parsedOptions), JSON.stringify(item.options));
        });
      });
    });
  });

  runChallengerTest('Sanitization', 'CWE-1236 Formula Injection: Escapes leading =, +, -, @, \\t, \\r and leading whitespace formulas', () => {
    const env = createAdversarialEnvironment();
    const sanitize = env.sandbox.sanitizeSheetCellValue;

    // Test formula prefixes
    assert.strictEqual(sanitize('=SUM(A1:B10)'), "'=SUM(A1:B10)");
    assert.strictEqual(sanitize('+cmd| /C calc'), "'+cmd| /C calc");
    assert.strictEqual(sanitize('-1+1'), "'-1+1");
    assert.strictEqual(sanitize('@IMPORT_XML("http://evil.com")'), "'@IMPORT_XML(\"http://evil.com\")");
    assert.strictEqual(sanitize('\t=1+1'), "'\t=1+1");
    assert.strictEqual(sanitize('\r@admin'), "'\r@admin");

    // Test leading spaces before formula
    assert.strictEqual(sanitize('   =SUM(1,2)'), "'   =SUM(1,2)");
    assert.strictEqual(sanitize('  +calc'), "'  +calc");
    assert.strictEqual(sanitize(' -42'), "' -42");
    assert.strictEqual(sanitize('  @macro'), "'  @macro");

    // Safe strings should remain unchanged
    assert.strictEqual(sanitize('Standard Text Content'), 'Standard Text Content');
    assert.strictEqual(sanitize('Class 10 Mathematics'), 'Class 10 Mathematics');
    assert.strictEqual(sanitize("'AlreadyEscaped"), "'AlreadyEscaped");
    assert.strictEqual(sanitize(12345), 12345);
    assert.strictEqual(sanitize(null), null);
    assert.strictEqual(sanitize(undefined), undefined);
  });

  runChallengerTest('Sanitization', 'Full generator escapes adversarial formula injection in all question output fields', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;

    const items = mock._synthesizeCurriculumQuestions({
      gradeClass: 'Class 5',
      subject: '=HYPERLINK("http://evil.com")',
      chapter: '+cmd| /C calc',
      topic: '-1+1',
      questionType: 'MCQ',
      quantity: 2
    });

    items.forEach((item, idx) => {
      // Check title, questionText, hint, explanation
      ['title', 'questionText', 'hint', 'explanation'].forEach(field => {
        const val = item[field];
        if (/^[=+\-@\t\r]/.test(val) || /^[=+\-@]/.test(val.trim())) {
          assert.strictEqual(val.charAt(0), "'", `Field ${field} in item #${idx} must be single-quote prefixed: ${val}`);
        }
      });
      // Check options
      item.options.forEach((opt, optIdx) => {
        if (/^[=+\-@\t\r]/.test(opt) || /^[=+\-@]/.test(opt.trim())) {
          assert.strictEqual(opt.charAt(0), "'", `Option #${optIdx} in item #${idx} must be single-quote prefixed: ${opt}`);
        }
      });
    });
  });

  // =========================================================================
  // SUITE 4: QUOTA STATUS TELEMETRY & IDEMPOTENCY (NON-MUTATION)
  // =========================================================================
  console.log('\n>>> SUITE 4: Quota Status Telemetry & Idempotency (Non-Mutation) <<<');

  runChallengerTest('Telemetry', 'getGeminiQuotaStatus is purely read-only and does NOT mutate quota or timestamps', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    // Seed some activity: 2 generation calls
    mock.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 3',
      subject: 'Mathematics',
      chapter: 'Numbers',
      topic: 'Addition',
      questionType: 'MCQ',
      quantity: 3
    });
    mock.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 4',
      subject: 'Science',
      chapter: 'Plants',
      topic: 'Photosynthesis',
      questionType: 'MCQ',
      quantity: 3
    });

    // Take complete snapshot of storage and logs
    const storageSnapshotBefore = JSON.stringify(env.mockStorage._data);
    const logsSnapshotBefore = JSON.stringify(mock._getTable(mock.KEYS.GEMINI_TOKEN_LOGS));

    // Call getGeminiQuotaStatus 20 times in a row
    for (let i = 0; i < 20; i++) {
      const status = mock.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' });
      assert.strictEqual(status.success, true);
      assert.strictEqual(status.rpmLimit, 15);
      assert.strictEqual(status.rpmCurrent, 2);
      assert.strictEqual(status.rpmRemaining, 13);
      assert.strictEqual(status.rpdLimit, 1500);
      assert.strictEqual(status.rpdCurrent, 2);
      assert.strictEqual(status.rpdRemaining, 1498);
      assert.strictEqual(status.totalCallsLogged, 2);
    }

    // Verify snapshots are byte-for-byte identical (ZERO state mutation)
    const storageSnapshotAfter = JSON.stringify(env.mockStorage._data);
    const logsSnapshotAfter = JSON.stringify(mock._getTable(mock.KEYS.GEMINI_TOKEN_LOGS));

    assert.strictEqual(storageSnapshotAfter, storageSnapshotBefore, 'localStorage must NOT be mutated by getGeminiQuotaStatus');
    assert.strictEqual(logsSnapshotAfter, logsSnapshotBefore, 'Table 15 logs must NOT be mutated by getGeminiQuotaStatus');
  });

  // =========================================================================
  // SUITE 5: SERVER-SIDE RBAC ENFORCEMENT
  // =========================================================================
  console.log('\n>>> SUITE 5: Server-Side RBAC Enforcement <<<');

  runChallengerTest('RBAC', 'generateCurriculumQuestionsWithGemini rejects student, parent, or unauthenticated callers', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const testPayload = {
      gradeClass: 'Class 5',
      subject: 'Science',
      chapter: 'Space',
      topic: 'Solar System'
    };

    // 1. Student
    const studentRes = mock.generateCurriculumQuestionsWithGemini(Object.assign({}, testPayload, { adminUserId: 'u_stu_demo' }));
    assert.strictEqual(studentRes.success, false);
    assert.strictEqual(studentRes.code, 403);
    assert.ok(studentRes.error.includes('UNAUTHORIZED'));

    // 2. Parent
    const parentRes = mock.generateCurriculumQuestionsWithGemini(Object.assign({}, testPayload, { adminUserId: 'u_par_demo' }));
    assert.strictEqual(parentRes.success, false);
    assert.strictEqual(parentRes.code, 403);

    // 3. Unauthenticated / Missing
    const anonRes = mock.generateCurriculumQuestionsWithGemini(testPayload);
    assert.strictEqual(anonRes.success, false);
    assert.strictEqual(anonRes.code, 403);
  });

  runChallengerTest('RBAC', 'getGeminiQuotaStatus rejects student, parent, or unauthenticated callers', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    assert.strictEqual(mock.getGeminiQuotaStatus({ adminUserId: 'u_stu_demo' }).success, false);
    assert.strictEqual(mock.getGeminiQuotaStatus({ adminUserId: 'u_par_demo' }).success, false);
    assert.strictEqual(mock.getGeminiQuotaStatus({}).success, false);
    assert.strictEqual(mock.getGeminiQuotaStatus({ adminUserId: 'u_adm_demo' }).success, true);
  });

  // =========================================================================
  // SUITE 6: STORAGE BRIDGE PARITY & BULK INGESTION
  // =========================================================================
  console.log('\n>>> SUITE 6: Storage Bridge Parity & Bulk Ingestion <<<');

  runChallengerTest('StorageBridge', 'bulkUploadContentBatch stores questions in Table 11 CurriculumQuizzes with complete schema', () => {
    const env = createAdversarialEnvironment();
    const mock = env.sandbox.BrowserMockBackend;
    mock.init(true);

    const genResult = mock.generateCurriculumQuestionsWithGemini({
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 8',
      subject: 'Science',
      chapter: 'Cell Structure',
      topic: 'Mitochondria',
      questionType: 'MCQ',
      quantity: 3,
      autoCommit: true // Bridge to storage
    });

    assert.strictEqual(genResult.success, true);
    assert.ok(genResult.bulkUploadResult);
    assert.strictEqual(genResult.bulkUploadResult.success, true);
    assert.strictEqual(genResult.bulkUploadResult.importedCount, 3);

    // Verify Table 11 CurriculumQuizzes contains the records via _getTable and getAdminContentList
    const tableQuizzes = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES);
    assert.ok(tableQuizzes.length >= 3, 'Table 11 must contain at least 3 quiz records');

    const adminContent = mock.getAdminContentList({ adminUserId: 'u_adm_demo', contentType: 'CurriculumQuizzes' });
    assert.strictEqual(adminContent.success, true);
    assert.ok(adminContent.items.length >= 3);

    const match = tableQuizzes.find(q => q.id === genResult.items[0].id || (q.title && q.title.includes('Mitochondria')));
    assert.ok(match, 'Generated quiz must exist in Table 11 CurriculumQuizzes');
    assert.strictEqual(match.examCategory, 'CBSE');
    assert.strictEqual(match.isActive, true);
  });

  // =========================================================================
  // FINAL SUMMARY
  // =========================================================================
  console.log('\n=========================================================================');
  console.log(`  ADVERSARIAL CHALLENGER RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (failures.length > 0) {
    console.error(`  FAILURES DETECTED: ${failures.length}`);
    failures.forEach((f, idx) => {
      console.error(`  [${idx + 1}] ${f.category} -> ${f.name}: ${f.error}`);
    });
    console.log('=========================================================================\n');
    process.exit(1);
  } else {
    console.log('  ALL ADVERSARIAL STRESS TESTS PASSED (100% EMPIRICAL SUCCESS)');
    console.log('=========================================================================\n');
  }
})();
