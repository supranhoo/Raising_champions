/**
 * Milestone 3 Adversarial Forensic & Parity Stress Suite
 * Author: m3_auditor_1
 * Verifies byte-for-byte backend parity, rate limit bursts, cache deduplication,
 * CWE-1236 injection vectors, and storage schema compliance.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML_FILE = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const BACKEND_FILE = path.join(__dirname, '..', 'google_apps_script_backend.js');

const html = fs.readFileSync(HTML_FILE, 'utf8');
const backend = fs.readFileSync(BACKEND_FILE, 'utf8');

console.log('=========================================================================');
console.log('       M3 ADVERSARIAL FORENSIC STRESS & PARITY AUDIT SUITE               ');
console.log('=========================================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✘ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

async function runTestAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✘ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// 1. SETUP BACKEND AND MOCK ENVIRONMENTS
// -----------------------------------------------------------------------------
const backendSandbox = {
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
vm.runInContext(backend + '\nbackendCompute = computeGeminiCacheFingerprint;\nbackendSha256 = sha256;', backendSandbox);

// Extract frontend script
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const frontendScript = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createFrontendEnv() {
  const dom = {};
  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    dom[id] = {
      id: id,
      value: '',
      innerText: '',
      innerHTML: '',
      checked: false,
      disabled: false,
      className: '',
      classList: {
        _set: new Set(),
        add: function(...c) { c.forEach(x => this._set.add(x)); },
        remove: function(...c) { c.forEach(x => this._set.delete(x)); },
        contains: function(c) { return this._set.has(c); }
      },
      style: {},
      focus: function() {},
      closest: function() { return this; },
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

  const storageData = {};
  const mockStorage = {
    getItem: function(k) { return storageData.hasOwnProperty(k) ? storageData[k] : null; },
    setItem: function(k, v) { storageData[k] = String(v); },
    removeItem: function(k) { delete storageData[k]; },
    clear: function() { for (let k in storageData) delete storageData[k]; }
  };

  let playedAudio = [];
  let confettiSpawned = false;
  let customAlert = null;

  const mockWin = {
    console: console,
    localStorage: mockStorage,
    document: {
      getElementById: function(id) { return dom[id] || null; },
      querySelector: function(s) {
        if (s && s.startsWith('#')) return dom[s.slice(1)] || null;
        return null;
      },
      querySelectorAll: function() { return []; },
      createElement: function(tag) {
        return {
          tagName: tag.toUpperCase(),
          innerText: '',
          innerHTML: '',
          className: '',
          classList: {
            _set: new Set(),
            add: function(...c) { c.forEach(x => this._set.add(x)); },
            remove: function(...c) { c.forEach(x => this._set.delete(x)); },
            contains: function(c) { return this._set.has(c); }
          },
          style: {},
          appendChild: function(c) { return c; }
        };
      },
      body: { style: {}, appendChild: function() {} },
      addEventListener: function() {}
    },
    innerWidth: 1280,
    innerHeight: 800,
    scrollTo: function() {},
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
    playSound: function(s) { playedAudio.push(s); },
    spawnConfetti: function() { confettiSpawned = true; },
    alertCustom: function(title, msg) { customAlert = { title: title, message: msg }; },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date,
    Math: Math,
    JSON: JSON
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(frontendScript, sandbox);

  // Re-hook spies
  sandbox.playSound = function(s) { playedAudio.push(s); };
  sandbox.spawnConfetti = function() { confettiSpawned = true; };
  sandbox.alertCustom = function(t, m) { customAlert = { title: t, message: m }; };

  return {
    sandbox: sandbox,
    mock: sandbox.BrowserMockBackend,
    dom: dom,
    storage: mockStorage,
    getAudio: () => playedAudio,
    getConfetti: () => confettiSpawned,
    getAlert: () => customAlert,
    clearAlert: () => { customAlert = null; }
  };
}

(async () => {
  const env = createFrontendEnv();
  const mock = env.mock;

  // ---------------------------------------------------------------------------
  // TEST SET 1: Byte-for-Byte SHA-256 Cache Fingerprint Parity with Backend
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 1: Backend vs BrowserMock SHA-256 Fingerprint Parity ---');

  const testPayloads = [
    { gradeClass: 'Class 3', subject: 'Mathematics', chapter: 'Fractions', topic: 'Half and Quarter', questionType: 'MCQ', quantity: 5, difficulty: 'Medium', bloomLevel: 'Applying', model: 'gemini-1.5-flash' },
    { gradeClass: 'Class 10', subject: 'Science', chapter: 'Electricity', topic: 'Ohm Law', questionType: 'NUMERICAL', quantity: 10, difficulty: 'Hard', bloomLevel: 'Evaluating', model: 'gemini-2.0-flash' },
    { gradeClass: 'Class 6', subject: 'Social Science', chapter: 'Our Pasts', topic: 'Harappan Cities', questionType: 'SHORT_ANSWER', quantity: 3, difficulty: 'Easy', bloomLevel: 'Remembering', model: 'gemini-1.5-flash' },
    { grade: 'Class 8', subject: 'English', chapter: 'Tenses', topic: 'Present Continuous', questionType: 'FILL_IN_BLANK', quantity: 7, difficulty: 'Medium', bloomLevel: 'Understanding', model: 'gemini-1.5-flash' },
    { gradeClass: 'Grade 5', subject: 'Environmental Studies', chapter: 'Super Senses', topic: 'Animal Senses', questionType: 'TRUE_FALSE', quantity: 4, difficulty: 'Easy', bloomLevel: 'Remembering', model: 'gemini-1.5-flash' }
  ];

  testPayloads.forEach((payload, idx) => {
    runTest(`Fingerprint Parity Case #${idx + 1} (${payload.gradeClass || payload.grade} ${payload.subject})`, () => {
      const backendHash = backendSandbox.backendCompute(payload);
      const mockHash = mock.computeGeminiCacheFingerprint(payload);
      assert.strictEqual(typeof backendHash, 'string');
      assert.strictEqual(backendHash.length, 64, 'SHA-256 hash must be 64 hex characters');
      assert.strictEqual(mockHash, backendHash, `Mock hash must match backend hash byte-for-byte! Got mock=${mockHash}, backend=${backendHash}`);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SET 2: Sliding Window Rate Limiting (15 RPM) & Burst Defense
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 2: Sliding-Window Rate Limiting (15 RPM / 1.5K RPD) ---');

  runTest('15 requests in burst are accepted, 16th is rejected with HTTP 429', () => {
    env.storage.clear();
    const payload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 5',
      subject: 'Science',
      chapter: 'Plants',
      topic: 'Photosynthesis',
      questionType: 'MCQ',
      quantity: 2,
      forceRefresh: true
    };

    // Make 15 calls with forceRefresh: true (consuming 15 slots)
    for (let i = 1; i <= 15; i++) {
      const res = mock.generateCurriculumQuestionsWithGemini(payload);
      assert.strictEqual(res.success, true, `Call #${i} must succeed`);
      assert.strictEqual(res.rateLimits.rpmRemaining, 15 - i, `Call #${i} must decrement rpmRemaining`);
    }

    // 16th call must be blocked
    const burstRes = mock.generateCurriculumQuestionsWithGemini(payload);
    assert.strictEqual(burstRes.success, false, '16th call must be blocked');
    assert.strictEqual(burstRes.code, 429, 'Must return HTTP 429');
    assert.ok(burstRes.rateLimits.retryAfterSeconds > 0, 'retryAfterSeconds must be > 0');
  });

  // ---------------------------------------------------------------------------
  // TEST SET 3: Deduplication Cache & Zero-Token Behavior
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 3: Deduplication Caching & Token Telemetry ---');

  runTest('Cached request succeeds even when rate limit is exhausted, burning 0 tokens', () => {
    // With rate limit exhausted from above, normal call without forceRefresh should hit cache!
    const cachedPayload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 5',
      subject: 'Science',
      chapter: 'Plants',
      topic: 'Photosynthesis',
      questionType: 'MCQ',
      quantity: 2,
      forceRefresh: false
    };

    const cachedRes = mock.generateCurriculumQuestionsWithGemini(cachedPayload);
    assert.strictEqual(cachedRes.success, true, 'Cached request must succeed even during rate limit cooldown');
    assert.strictEqual(cachedRes.cached, true, 'cached flag must be true');
    assert.strictEqual(cachedRes.tokenUsage.promptTokens, 0, 'prompt tokens must be 0');
    assert.strictEqual(cachedRes.tokenUsage.candidateTokens, 0, 'candidate tokens must be 0');
    assert.strictEqual(cachedRes.tokenUsage.totalTokens, 0, 'total tokens must be 0');
    assert.strictEqual(cachedRes.tokenUsage.estimatedCostUsd, 0.0000, 'cost must be $0.00');
  });

  // ---------------------------------------------------------------------------
  // TEST SET 4: CWE-1236 Formula Injection Sanitization in Live Pipeline
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 4: CWE-1236 Formula Injection Sanitization ---');

  runTest('Formula injection vectors in user-provided chapter/topic are neutralized', () => {
    env.storage.clear();
    const maliciousPayload = {
      adminUserId: 'u_adm_demo',
      gradeClass: 'Class 7',
      subject: '=CMD|/C calc!A1',
      chapter: '+HYPERLINK("http://evil.com")',
      topic: '-SUM(A1:A100)',
      questionType: 'MCQ',
      quantity: 3,
      forceRefresh: true
    };

    const res = mock.generateCurriculumQuestionsWithGemini(maliciousPayload);
    assert.strictEqual(res.success, true);
    assert.ok(res.items.length > 0);

    // Verify all synthesized item fields prefix dangerous chars with single quote
    res.items.forEach((item, idx) => {
      ['title', 'questionText', 'hint', 'explanation'].forEach(field => {
        const val = item[field];
        if (typeof val === 'string' && val.length > 0) {
          assert.ok(!/^[=+\-@\t\r]/.test(val), `Field ${field} in item #${idx} must not start with dangerous char unescaped: "${val}"`);
        }
      });
      item.options.forEach((opt, optIdx) => {
        if (typeof opt === 'string' && opt.length > 0) {
          assert.ok(!/^[=+\-@\t\r]/.test(opt), `Option #${optIdx} in item #${idx} must not start with dangerous char unescaped: "${opt}"`);
        }
      });
    });

    // Check Table 15 GeminiTokenLogs
    const tokenLogs = mock._getTable(mock.KEYS.GEMINI_TOKEN_LOGS);
    const lastLog = tokenLogs[tokenLogs.length - 1];
    assert.ok(lastLog.subject.startsWith("'"), 'Logged subject formula must be neutralized');
    assert.ok(lastLog.topic.startsWith("'"), 'Logged topic formula must be neutralized');
  });

  // ---------------------------------------------------------------------------
  // TEST SET 5: Interactive Preview Deck Inline Editing & Deletion
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 5: Interactive Preview Deck Inline Editing & Discard ---');

  runTest('Inline modifications to prompt, options, correct index, hint, and explanation', () => {
    const rawBatch = [
      {
        questionText: 'Initial prompt text',
        options: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
        correctOptionIndex: 0,
        hint: 'Initial hint',
        explanation: 'Initial explanation',
        grade: 'Class 8',
        subject: 'Mathematics'
      }
    ];

    env.sandbox.handleGeminiGenerationSuccess({ items: rawBatch }, { gradeClass: 'Class 8', subject: 'Mathematics' });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);

    // Edit prompt
    env.sandbox.updateGeneratedQuestionText(0, 'Sanitized & Revised Prompt');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].questionText, 'Sanitized & Revised Prompt');

    // Edit option 1
    env.sandbox.updateGeneratedQuestionOption(0, 1, 'Revised Option B text');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options[1], 'Revised Option B text');
    assert.ok(env.sandbox.currentGeneratedBatch[0].optionsJson.includes('Revised Option B text'));

    // Switch correct option index to 2
    env.sandbox.updateGeneratedQuestionCorrectIndex(0, 2);
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].correctOptionIndex, 2);

    // Edit hint
    env.sandbox.updateGeneratedQuestionHint(0, 'Pedagogical Revised Hint');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].hint, 'Pedagogical Revised Hint');

    // Edit explanation
    env.sandbox.updateGeneratedQuestionExplanation(0, 'Step-by-step worked derivation');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].explanation, 'Step-by-step worked derivation');
  });

  // ---------------------------------------------------------------------------
  // TEST SET 6: Storage Ingestion Schema & Table 11 Integrity
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Set 6: Storage Ingestion & Table 11 CurriculumQuizzes Parity ---');

  await runTestAsync('Committing batch inserts into Table 11 with full relational schema', async () => {
    const initialTable11Count = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES).length;

    // Trigger commit
    env.sandbox.handleCommitAiGeneratedToStorage();

    // Await async API dispatch
    await new Promise(r => setTimeout(r, 60));

    const updatedTable11 = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES);
    assert.strictEqual(updatedTable11.length, initialTable11Count + 1, 'Table 11 must have 1 new record');

    const committed = updatedTable11[updatedTable11.length - 1];
    assert.strictEqual(committed.questionText, 'Sanitized & Revised Prompt');
    const parsedOptions = JSON.parse(committed.optionsJson);
    assert.strictEqual(parsedOptions[1], 'Revised Option B text');
    assert.strictEqual(committed.correctOptionIndex, 2);
    assert.strictEqual(committed.hint, 'Pedagogical Revised Hint');
    assert.strictEqual(committed.explanation, 'Step-by-step worked derivation');
    assert.strictEqual(committed.examCategory, 'CBSE');
    assert.strictEqual(committed.isActive, true);
    assert.strictEqual(committed.grade, 'Class 8');
    assert.strictEqual(committed.subject, 'Mathematics');
    assert.ok(committed.id.startsWith('curr_'));

    // Verify audio, confetti, and toast feedback
    assert.ok(env.getAudio().includes('correct'), 'Success sound "correct" must play');
    assert.strictEqual(env.getConfetti(), true, 'Confetti must spawn');
    assert.ok(env.getAlert().title.includes('Curriculum Ingestion Complete'));

    // Preview deck must be emptied
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
  });

  console.log('\n=========================================================================');
  console.log(`  ALL ${passedTests} / ${totalTests} ADVERSARIAL FORENSIC STRESS TESTS PASSED (100%)`);
  console.log('=========================================================================\n');
})();
