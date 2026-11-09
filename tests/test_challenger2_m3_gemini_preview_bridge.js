/**
 * =========================================================================
 * CHALLENGER 2: MILESTONE 3 EMPIRICAL ADVERSARIAL STRESS SUITE
 * =========================================================================
 * Target: divyank_mission_control_google_apps_script_app.html
 * Scope: Milestone 3 UI Interaction, Preview Deck, and Storage Ingestion Bridge
 *
 * Test Dimensions:
 * 1. Interactive Deck Mutation Integrity (1, 5, 20 questions, inline edits, discards)
 * 2. Direct Storage Ingestion Bridge (Table 11 schema mapping, API invocation, post-commit state)
 * 3. DOM Invariant & Brand Stress (M6-REG-01 ID 100% resolution, 0px border-radius, brand colors)
 * 4. Adversarial Edge Cases (XSS, CWE-1236 formula injection, double-commit defense, non-MCQ types)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML_PATH = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

// Extract main application frontend script block
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptCode = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

/**
 * Creates an instrumented mock browser environment matching the DOM in HTML.
 */
function createInstrumentedEnvironment() {
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
    querySelectorAll: function(sel) {
      if (sel === '.tab-view') {
        return Object.keys(domElements).filter(k => k.startsWith('view-')).map(k => domElements[k]);
      }
      if (sel === '.tab-btn') {
        return Object.keys(domElements).filter(k => k.startsWith('tab-')).map(k => domElements[k]);
      }
      return [];
    },
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

  const audioPlayed = [];
  let confettiSpawned = false;
  let customAlerts = [];

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
    alertCustom: function(t, m) { customAlerts.push({ title: t, message: m }); }
  };
  mockWin.window = mockWin;

  const sandbox = vm.createContext(mockWin);
  vm.runInContext(scriptCode, sandbox);

  // Hook audio, confetti, and alerts to spy on them
  sandbox.playSound = function(s) { audioPlayed.push(s); };
  sandbox.spawnConfetti = function() { confettiSpawned = true; };
  sandbox.alertCustom = function(t, m) { customAlerts.push({ title: t, message: m }); };

  return {
    sandbox: sandbox,
    window: mockWin,
    document: mockDoc,
    domElements: domElements,
    getAudioPlayed: () => audioPlayed,
    getConfettiSpawned: () => confettiSpawned,
    getCustomAlerts: () => customAlerts,
    resetSpies: () => {
      audioPlayed.length = 0;
      confettiSpawned = false;
      customAlerts.length = 0;
    }
  };
}

// Helpers for test execution
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const testResults = [];

function test(name, fn) {
  totalAssertions++;
  try {
    fn();
    passedAssertions++;
    testResults.push({ name, pass: true });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedAssertions++;
    testResults.push({ name, pass: false, error: err.message });
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`    ${err.stack || err.message}`);
  }
}

async function testAsync(name, fn) {
  totalAssertions++;
  try {
    await fn();
    passedAssertions++;
    testResults.push({ name, pass: true });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedAssertions++;
    testResults.push({ name, pass: false, error: err.message });
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`    ${err.stack || err.message}`);
  }
}

function generateMockQuestions(count, options = {}) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: `q_test_${i}`,
      grade: options.grade || 'Class 5',
      subject: options.subject || 'Mathematics',
      chapter: options.chapter || 'Geometry',
      topic: options.topic || 'Angles',
      title: `Geometry - Angles (Q${i})`,
      questionText: `What is the measure of angle #${i}?`,
      options: ['45 degrees', '90 degrees', '180 degrees', '360 degrees'],
      optionsJson: JSON.stringify(['45 degrees', '90 degrees', '180 degrees', '360 degrees']),
      correctOptionIndex: (i - 1) % 4,
      hint: `Think of right angle for #${i}.`,
      explanation: `An angle measuring 90 degrees is a right angle.`,
      bloomLevel: options.bloomLevel || 'Understanding',
      difficulty: options.difficulty || 'Medium',
      examCategory: 'CBSE'
    });
  }
  return items;
}

(async function runChallengerSuite() {
  console.log('=========================================================================');
  console.log('  CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS SUITE (MILESTONE 3)');
  console.log('=========================================================================\n');

  const env = createInstrumentedEnvironment();
  const mock = env.sandbox.BrowserMockBackend;
  mock.init(true);

  // =========================================================================
  // SUITE 1: INTERACTIVE DECK MUTATION INTEGRITY (1, 5, 20 QUESTIONS)
  // =========================================================================
  console.log('\n--- SUITE 1: Interactive Deck Mutation Integrity (1, 5, 20 Questions) ---');

  test('Deck Mutation 1.1: Render preview deck with exactly 1 question (singular badge)', () => {
    const single = generateMockQuestions(1);
    env.sandbox.handleGeminiGenerationSuccess({ items: single }, { gradeClass: 'Class 5', subject: 'Mathematics' });
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 1 Item', 'Must use singular "Item" for 1 item');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '1');
    assert.strictEqual(env.domElements.aiGenPreviewDeck.classList.contains('hidden'), false);
    assert.strictEqual(env.domElements.aiGenPreviewEmptyState.classList.contains('hidden'), true);
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('Q1'));
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('What is the measure of angle #1?'));
  });

  test('Deck Mutation 1.2: Render preview deck with exactly 5 questions (plural badge)', () => {
    const five = generateMockQuestions(5);
    env.sandbox.handleGeminiGenerationSuccess({ items: five }, { gradeClass: 'Class 5', subject: 'Mathematics' });
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 5);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 5 Items', 'Must use plural "Items" for 5 items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '5');
    assert.strictEqual(env.domElements.aiGenCommitBtn.disabled, false);
    for (let i = 1; i <= 5; i++) {
      assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes(`Q${i}`), `Must contain Q${i}`);
    }
  });

  test('Deck Mutation 1.3: Render preview deck with maximum batch of 20 questions', () => {
    const twenty = generateMockQuestions(20);
    env.sandbox.handleGeminiGenerationSuccess({ items: twenty }, { gradeClass: 'Class 5', subject: 'Mathematics' });
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 20);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 20 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '20');
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('Q20'), 'Must contain Q20');
    assert.strictEqual(env.domElements.aiGenPreviewEmptyState.classList.contains('hidden'), true);
  });

  test('Deck Mutation 1.4: Inline text edits via updateGeneratedQuestionText update memory state without data loss', () => {
    // Modify Q0, Q2, Q4
    env.sandbox.updateGeneratedQuestionText(0, 'Edited prompt for Question One with math: 2x + 5 = 15');
    env.sandbox.updateGeneratedQuestionText(2, 'Edited prompt for Question Three with symbols: α + β = 90°');
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].questionText, 'Edited prompt for Question One with math: 2x + 5 = 15');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[2].questionText, 'Edited prompt for Question Three with symbols: α + β = 90°');
    
    // Other items and fields remain completely intact
    assert.strictEqual(env.sandbox.currentGeneratedBatch[1].questionText, 'What is the measure of angle #2?');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].hint, 'Think of right angle for #1.');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options.length, 4);
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].correctOptionIndex, 0);
  });

  test('Deck Mutation 1.5: Inline option edits via updateGeneratedQuestionOption update memory state and optionsJson', () => {
    env.sandbox.updateGeneratedQuestionOption(0, 0, 'Zero degrees');
    env.sandbox.updateGeneratedQuestionOption(0, 1, 'Forty-five degrees');
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options[0], 'Zero degrees');
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].options[1], 'Forty-five degrees');
    
    // optionsJson must match updated options array
    const parsedOptions = JSON.parse(env.sandbox.currentGeneratedBatch[0].optionsJson);
    assert.strictEqual(parsedOptions[0], 'Zero degrees');
    assert.strictEqual(parsedOptions[1], 'Forty-five degrees');
    assert.strictEqual(parsedOptions[2], '180 degrees');
    assert.strictEqual(parsedOptions[3], '360 degrees');
  });

  test('Deck Mutation 1.6: Correct option index change updates memory and re-renders visual selection styling', () => {
    // Current correctOptionIndex for Q0 was 0. Update to 2.
    env.sandbox.updateGeneratedQuestionCorrectIndex(0, 2);
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].correctOptionIndex, 2);
    
    // Inspect DOM HTML of aiGenQuestionsList: Option C (index 2) must have active green border and badge
    const html = env.domElements.aiGenQuestionsList.innerHTML;
    assert.ok(html.includes('border-2 border-[#7FBF19] bg-[#7FBF19]/10'), 'Active option must have green border & tint');
    assert.ok(html.includes('✓ Correct'), 'Active option must have Correct badge');
  });

  test('Deck Mutation 1.7: Per-item discard removes item, decrements count badge, and renumbers remaining items sequentially', () => {
    // Current count: 20. Discard index 0.
    env.resetSpies();
    env.sandbox.discardGeneratedQuestion(0);
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 19);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 19 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '19');
    assert.ok(env.getAudioPlayed().includes('coin'), 'Audio coin must be played on discard');
    
    // First question in list is now the old Q2, but rendered badge must be Q1
    assert.strictEqual(env.sandbox.currentGeneratedBatch[0].questionText, 'What is the measure of angle #2?');
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('>Q1<'), 'First rendered item must be renumbered to Q1');
  });

  test('Deck Mutation 1.8: Discarding remaining items down to 0 transitions deck to empty state and disables commit button', () => {
    // Reset to 1 question then discard it
    env.sandbox.handleGeminiGenerationSuccess({ items: generateMockQuestions(1) });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 1);
    
    env.sandbox.discardGeneratedQuestion(0);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 0 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '0');
    assert.strictEqual(env.domElements.aiGenCommitBtn.disabled, true, 'Commit button must be disabled when count is 0');
    assert.strictEqual(env.domElements.aiGenPreviewEmptyState.classList.contains('hidden'), false, 'Empty state must be visible');
  });

  test('Deck Mutation 1.9: Batch discard via discardEntireGeneratedBatch empties batch, hides deck, and clears list', () => {
    env.sandbox.handleGeminiGenerationSuccess({ items: generateMockQuestions(8) });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 8);
    assert.strictEqual(env.domElements.aiGenPreviewDeck.classList.contains('hidden'), false);
    
    env.resetSpies();
    env.sandbox.discardEntireGeneratedBatch();
    
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0);
    assert.strictEqual(env.sandbox.currentGenerationMetadata, null);
    assert.strictEqual(env.domElements.aiGenPreviewDeck.classList.contains('hidden'), true, 'Deck container must be hidden');
    assert.strictEqual(env.domElements.aiGenQuestionsList.innerHTML, '', 'Questions list must be cleared');
    assert.ok(env.getAudioPlayed().includes('coin'), 'Audio coin must be played on batch discard');
  });

  test('Deck Mutation 1.10: Discard with invalid/out-of-bounds index (-1, 999) does not throw or mutate batch', () => {
    env.sandbox.handleGeminiGenerationSuccess({ items: generateMockQuestions(3) });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 3);
    
    env.sandbox.discardGeneratedQuestion(-1);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 3, 'Index -1 must not mutate batch');
    
    env.sandbox.discardGeneratedQuestion(999);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 3, 'Index 999 must not mutate batch');
  });


  // =========================================================================
  // SUITE 2: DIRECT STORAGE INGESTION BRIDGE (TABLE 11 CURRICULUM QUIZZES)
  // =========================================================================
  console.log('\n--- SUITE 2: Direct Storage Ingestion Bridge (Table 11 Schema & API) ---');

  test('Storage Bridge 2.1: Empty batch rejection with informative toast', () => {
    env.sandbox.currentGeneratedBatch = [];
    env.resetSpies();
    
    env.sandbox.handleCommitAiGeneratedToStorage();
    
    assert.strictEqual(env.getCustomAlerts().length, 1);
    assert.strictEqual(env.getCustomAlerts()[0].title, 'No Questions to Commit');
  });

  test('Storage Bridge 2.2: Incomplete question validation (empty prompt) blocks commit', () => {
    env.sandbox.handleGeminiGenerationSuccess({
      items: [
        {
          questionText: '   ', // blank prompt
          options: ['A', 'B', 'C', 'D'],
          correctOptionIndex: 0
        }
      ]
    });
    env.resetSpies();
    
    env.sandbox.commitGeneratedBatchToStorage();
    
    assert.strictEqual(env.getCustomAlerts().length, 1);
    assert.strictEqual(env.getCustomAlerts()[0].title, 'Incomplete Question');
    assert.ok(env.getCustomAlerts()[0].message.includes('Question #1'));
  });

  await testAsync('Storage Bridge 2.3: Schema mapping and persistence into Table 11 CurriculumQuizzes', async () => {
    const rawBatch = [
      {
        questionText: 'Which organ pumps blood in human body?',
        options: ['Lungs', 'Heart', 'Kidneys', 'Liver'],
        correctOptionIndex: 1,
        hint: 'It beats continuously.',
        explanation: 'The heart is a muscular organ that pumps blood throughout the circulatory system.',
        grade: 'Class 4',
        subject: 'Science',
        chapter: 'Human Body',
        topic: 'Circulatory System',
        bloomLevel: 'Understanding',
        difficulty: 'Easy'
      },
      {
        questionText: 'How many chambers does a human heart have?',
        options: ['Two', 'Three', 'Four', 'Five'],
        correctOptionIndex: 2,
        hint: 'Two atria and two ventricles.',
        explanation: 'The human heart has 4 chambers: right atrium, left atrium, right ventricle, left ventricle.',
        grade: 'Class 4',
        subject: 'Science',
        chapter: 'Human Body',
        topic: 'Heart Anatomy',
        bloomLevel: 'Remembering',
        difficulty: 'Medium'
      }
    ];

    // Spy on ZoptroApiClient.bulkUploadContentBatch payload
    let capturedPayload = null;
    const origBulkUpload = env.sandbox.ZoptroApiClient.bulkUploadContentBatch;
    env.sandbox.ZoptroApiClient.bulkUploadContentBatch = async function(p) {
      capturedPayload = p;
      return origBulkUpload.call(this, p);
    };

    env.sandbox.handleGeminiGenerationSuccess({ items: rawBatch }, { gradeClass: 'Class 4', subject: 'Science' });
    const beforeCount = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES).length;

    env.resetSpies();
    env.sandbox.handleCommitAiGeneratedToStorage();

    // Await async bulkUploadContentBatch
    await new Promise(r => setTimeout(r, 100));

    // Restore spy
    env.sandbox.ZoptroApiClient.bulkUploadContentBatch = origBulkUpload;

    // 1. Verify mappedBatch payload passed to bulkUploadContentBatch
    assert.ok(capturedPayload, 'bulkUploadContentBatch must be called with payload');
    assert.strictEqual(capturedPayload.contentType, 'CurriculumQuizzes');
    assert.strictEqual(capturedPayload.items.length, 2);

    const payloadItem1 = capturedPayload.items[0];
    assert.strictEqual(payloadItem1.grade, 'Class 4');
    assert.strictEqual(payloadItem1.subject, 'Science');
    assert.strictEqual(payloadItem1.chapter, 'Human Body');
    assert.strictEqual(payloadItem1.topic, 'Circulatory System');
    assert.strictEqual(payloadItem1.bloomLevel, 'Understanding');
    assert.strictEqual(payloadItem1.difficulty, 'Easy');
    assert.strictEqual(payloadItem1.examCategory, 'CBSE');
    assert.strictEqual(payloadItem1.orderIndex, 1);
    assert.strictEqual(payloadItem1.isActive, true);

    // 2. Verify persistence in mock backend storage (Table 11 schema columns)
    const tableAfter = mock._getTable(mock.KEYS.CURRICULUM_QUIZZES);
    assert.strictEqual(tableAfter.length, beforeCount + 2, 'Must ingest exactly 2 items into Table 11');

    const item1 = tableAfter[tableAfter.length - 2];
    const item2 = tableAfter[tableAfter.length - 1];

    // Verify all canonical Table 11 columns
    assert.ok(item1.id && item1.id.startsWith('curr_'), 'Item 1 must have valid curr_ id');
    assert.strictEqual(item1.grade, 'Class 4');
    assert.strictEqual(item1.subject, 'Science');
    assert.strictEqual(item1.examCategory, 'CBSE');
    assert.strictEqual(item1.title, 'Human Body - Circulatory System (Q1)');
    assert.strictEqual(item1.questionText, 'Which organ pumps blood in human body?');
    assert.strictEqual(item1.optionsJson, JSON.stringify(['Lungs', 'Heart', 'Kidneys', 'Liver']));
    assert.strictEqual(item1.correctOptionIndex, 1);
    assert.strictEqual(item1.hint, 'It beats continuously.');
    assert.strictEqual(item1.explanation, 'The heart is a muscular organ that pumps blood throughout the circulatory system.');
    assert.strictEqual(item1.orderIndex, 1);
    assert.strictEqual(item1.isActive, true);
    assert.ok(item1.createdAt && item1.updatedAt, 'Must have createdAt and updatedAt timestamps');

    // Verify Item 2
    assert.strictEqual(item2.orderIndex, 2);
    assert.strictEqual(item2.correctOptionIndex, 2);
  });

  await testAsync('Storage Bridge 2.4: Post-commit UX feedback: audio, confetti, toast, preview deck reset, and Tab switch', async () => {
    const singleBatch = generateMockQuestions(1, { grade: 'Class 6', subject: 'Science' });
    env.sandbox.handleGeminiGenerationSuccess({ items: singleBatch });
    env.resetSpies();

    let tabSwitchedTo = null;
    const origSwitchAdminTab = env.sandbox.switchAdminTab;
    env.sandbox.switchAdminTab = function(tab) {
      tabSwitchedTo = tab;
      try { if (origSwitchAdminTab) origSwitchAdminTab(tab); } catch (e) {}
    };

    env.sandbox.commitGeneratedBatchToStorage();
    await new Promise(r => setTimeout(r, 100));

    // Verify audio played
    assert.ok(env.getAudioPlayed().includes('correct'), 'Must play sound "correct" on successful commit');
    
    // Verify confetti triggered
    assert.strictEqual(env.getConfettiSpawned(), true, 'Must trigger spawnConfetti() on commit');

    // Verify custom toast
    const alerts = env.getCustomAlerts();
    assert.ok(alerts.length >= 1);
    assert.ok(alerts[alerts.length - 1].title.includes('Curriculum Ingestion Complete'));

    // Verify preview deck reset
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 0, 'Memory batch must be cleared');
    assert.strictEqual(env.sandbox.currentGenerationMetadata, null, 'Generation metadata must be reset');
    assert.strictEqual(env.domElements.aiGenPreviewDeck.classList.contains('hidden'), true, 'Preview deck container must be hidden');
    assert.strictEqual(env.domElements.aiGenQuestionsList.innerHTML, '', 'Questions list must be cleared');

    // Verify automatic tab switch to curriculum_quizzes
    assert.strictEqual(tabSwitchedTo, 'curriculum_quizzes', 'Must switch to curriculum_quizzes tab');
    
    // Restore switchAdminTab
    env.sandbox.switchAdminTab = origSwitchAdminTab;
  });

  await testAsync('Storage Bridge 2.5: Resilient error handling when bulk ingestion fails (preserves batch)', async () => {
    // Populate batch
    const freshBatch = generateMockQuestions(2);
    env.sandbox.handleGeminiGenerationSuccess({ items: freshBatch });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 2);

    // Mock API failure
    const origBulkUpload = env.sandbox.ZoptroApiClient.bulkUploadContentBatch;
    env.sandbox.ZoptroApiClient.bulkUploadContentBatch = async function() {
      return { success: false, error: 'Database transaction lock timeout' };
    };

    env.resetSpies();
    env.sandbox.commitGeneratedBatchToStorage();
    await new Promise(r => setTimeout(r, 100));

    // Must play sound 'wrong'
    assert.ok(env.getAudioPlayed().includes('wrong'), 'Must play "wrong" on ingestion error');

    // Must display error alert
    const alerts = env.getCustomAlerts();
    assert.ok(alerts.length >= 1);
    assert.strictEqual(alerts[alerts.length - 1].title, 'Ingestion Error');
    assert.ok(alerts[alerts.length - 1].message.includes('Database transaction lock timeout'));

    // Crucial: Batch must NOT be discarded so user does not lose edited content!
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 2, 'Batch must be preserved upon error');
    assert.strictEqual(env.domElements.aiGenCommitBtn.disabled, false, 'Commit button must be re-enabled');

    // Restore API
    env.sandbox.ZoptroApiClient.bulkUploadContentBatch = origBulkUpload;
  });


  // =========================================================================
  // SUITE 3: DOM INVARIANT & BRAND COMPLIANCE STRESS
  // =========================================================================
  console.log('\n--- SUITE 3: DOM Invariant & Brand Compliance Stress ---');

  test('DOM Invariant 3.1: M6-REG-01 100% resolution of document.getElementById queries in static HTML', () => {
    const mainScriptIndex = htmlContent.lastIndexOf(lastScriptTag);
    const htmlMarkup = htmlContent.slice(0, mainScriptIndex);

    const parsedIds = new Set();
    const idRegex = /\bid=["']([^"']+)["']/g;
    let match;
    while ((match = idRegex.exec(htmlMarkup)) !== null) {
      parsedIds.add(match[1]);
    }

    const scriptIds = [...scriptCode.matchAll(/document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
    const missing = new Set();
    scriptIds.forEach(id => {
      if (!parsedIds.has(id)) {
        missing.add(id);
      }
    });

    assert.strictEqual(missing.size, 0, `All referenced DOM IDs in script must exist in HTML markup. Missing: ${[...missing].join(', ')}`);
  });

  test('Brand Compliance 3.2: Universal 0px border-radius: zero non-none rounded classes', () => {
    const forbidden = htmlContent.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
    assert.strictEqual(forbidden, null, `Found forbidden rounded classes: ${forbidden}`);
  });

  test('Brand Compliance 3.3: Universal 0px border-radius: zero standalone rounded classes', () => {
    const standalone = htmlContent.match(/\bclass="[^"]*\brounded\b(?!-none)[^"]*"/g);
    assert.strictEqual(standalone, null, `Found standalone rounded classes: ${standalone}`);
  });

  test('Brand Compliance 3.4: Brand color palette tokens present (#09293D, #F4F2EA, #666D57, #F65800)', () => {
    ['#09293D', '#F4F2EA', '#666D57', '#F65800'].forEach(token => {
      assert.ok(htmlContent.includes(token), `Brand palette token ${token} must be present`);
    });
  });

  test('Brand Compliance 3.5: Display (Outfit) and Body (Figtree) typography configuration', () => {
    assert.ok(htmlContent.includes('Outfit'), 'Outfit display font must be loaded');
    assert.ok(htmlContent.includes('Figtree'), 'Figtree body font must be loaded');
  });

  test('Brand Compliance 3.6: Zero cyberpunk glowing halos or forbidden background gradients', () => {
    const glows = htmlContent.match(/\bglow-(cyan|neon|gold)\b/gi) || [];
    assert.strictEqual(glows.length, 0, 'No cyberpunk neon glows permitted');
    const gradients = htmlContent.match(/\bbg-gradient-[a-z0-9-]+\b/gi) || [];
    assert.strictEqual(gradients.length, 0, 'No forbidden background gradients permitted');
  });


  // =========================================================================
  // SUITE 4: ADVERSARIAL STRESS & CORNER CASES
  // =========================================================================
  console.log('\n--- SUITE 4: Adversarial Stress & Corner Cases ---');

  test('Adversarial 4.1: XSS injection defense in question text and options during preview render', () => {
    const xssBatch = [
      {
        questionText: '<script>window.pwned=true;</script><b>Math Problem</b>',
        options: [
          '<img src="x" onerror="window.pwned=true;">',
          '&quot;Normal Option&quot;',
          '<svg onload="window.pwned=true;">',
          'Safe Option 4'
        ],
        correctOptionIndex: 0,
        hint: '<script>alert("hint")</script>',
        explanation: '"><script>alert("exp")</script>'
      }
    ];

    env.sandbox.handleGeminiGenerationSuccess({ items: xssBatch });
    const renderedHtml = env.domElements.aiGenQuestionsList.innerHTML;

    // Must be escaped into &lt;script&gt; and &lt;img and &lt;svg
    assert.ok(!renderedHtml.includes('<script>window.pwned=true;</script>'), 'Raw unescaped script tag must not be injected into DOM');
    assert.ok(!renderedHtml.includes('<img src="x" onerror="window.pwned=true;">'), 'Raw unescaped img tag must not be injected into DOM');
    assert.ok(renderedHtml.includes('&lt;script&gt;window.pwned=true;&lt;/script&gt;'), 'Script tag must be HTML-escaped');
  });

  test('Adversarial 4.2: CWE-1236 Formula sanitization during question synthesis', () => {
    const synthResult = mock._synthesizeCurriculumQuestions({
      gradeClass: 'Class 4',
      subject: 'Science',
      chapter: '=CMD()',
      topic: '+INJECTION',
      questionType: 'MCQ',
      quantity: 1
    });

    const q = synthResult[0];
    assert.ok(q.title.startsWith("'="), 'Title starting with = must be sanitized with \'');
    
    // Test individual cell sanitizer for all CWE-1236 trigger characters
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('=SUM(1,2)'), "'=SUM(1,2)");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('@admin'), "'@admin");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('+123'), "'+123");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('-456'), "'-456");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('\tTabbed'), "'\tTabbed");
    assert.strictEqual(env.sandbox.sanitizeSheetCellValue('\rCarriage'), "'\rCarriage");
  });

  test('Adversarial 4.3: Non-MCQ question types (e.g. SHORT_ANSWER, TRUE_FALSE) render gracefully', () => {
    const nonMcqBatch = [
      {
        questionType: 'SHORT_ANSWER',
        questionText: 'Define photosynthesis in two sentences.',
        options: [], // empty options
        correctOptionIndex: 0,
        hint: 'Process used by plants using sunlight.',
        explanation: 'Photosynthesis converts light energy into chemical energy.'
      },
      {
        questionType: 'TRUE_FALSE',
        questionText: 'Water boils at 100 degrees Celsius at sea level.',
        options: ['True', 'False'],
        correctOptionIndex: 0,
        hint: 'Standard boiling point.',
        explanation: '100°C is the boiling point of pure water at 1 atm.'
      }
    ];

    env.sandbox.handleGeminiGenerationSuccess({ items: nonMcqBatch });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 2);

    const html = env.domElements.aiGenQuestionsList.innerHTML;
    assert.ok(html.includes('SHORT_ANSWER'), 'Must display SHORT_ANSWER badge');
    assert.ok(html.includes('TRUE_FALSE'), 'Must display TRUE_FALSE badge');
    assert.ok(html.includes('Define photosynthesis'));
    assert.ok(html.includes('Water boils at 100 degrees'));
  });

  test('Adversarial 4.4: Large batch scale stress (50 questions) memory and ordering integrity', () => {
    const fifty = generateMockQuestions(50);
    const start = Date.now();
    env.sandbox.handleGeminiGenerationSuccess({ items: fifty });
    const duration = Date.now() - start;

    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 50);
    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 50 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '50');
    assert.ok(duration < 200, `Rendering 50 items must complete within 200ms (took ${duration}ms)`);

    // Verify ordering Q1 and Q50 present
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('>Q1<'));
    assert.ok(env.domElements.aiGenQuestionsList.innerHTML.includes('>Q50<'));
  });

  test('Adversarial 4.5: Multiple rapid discard cycles maintain deterministic state', () => {
    env.sandbox.handleGeminiGenerationSuccess({ items: generateMockQuestions(10) });
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 10);

    // Discard index 5
    env.sandbox.discardGeneratedQuestion(5);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 9);

    // Discard index 0
    env.sandbox.discardGeneratedQuestion(0);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 8);

    // Discard index 7 (last item)
    env.sandbox.discardGeneratedQuestion(7);
    assert.strictEqual(env.sandbox.currentGeneratedBatch.length, 7);

    assert.strictEqual(env.domElements.aiGenDeckCountBadge.innerText, 'Showing 7 Items');
    assert.strictEqual(env.domElements.aiGenCommitCountBadge.innerText, '7');
  });

  test('Adversarial 4.6: Verification of Function Names and Handshake Signatures', () => {
    // Check required primary functions
    assert.strictEqual(typeof env.sandbox.renderAiGenPreviewDeck, 'function', 'renderAiGenPreviewDeck must be a function');
    assert.strictEqual(typeof env.sandbox.updateGeneratedQuestionText, 'function', 'updateGeneratedQuestionText must be a function');
    assert.strictEqual(typeof env.sandbox.updateGeneratedQuestionOption, 'function', 'updateGeneratedQuestionOption must be a function');
    assert.strictEqual(typeof env.sandbox.updateGeneratedQuestionCorrectIndex, 'function', 'updateGeneratedQuestionCorrectIndex must be a function');
    assert.strictEqual(typeof env.sandbox.updateGeneratedQuestionHint, 'function', 'updateGeneratedQuestionHint must be a function');
    assert.strictEqual(typeof env.sandbox.updateGeneratedQuestionExplanation, 'function', 'updateGeneratedQuestionExplanation must be a function');
    assert.strictEqual(typeof env.sandbox.discardGeneratedQuestion, 'function', 'discardGeneratedQuestion must be a function');
    assert.strictEqual(typeof env.sandbox.discardEntireGeneratedBatch, 'function', 'discardEntireGeneratedBatch must be a function');
    assert.strictEqual(typeof env.sandbox.commitGeneratedBatchToStorage, 'function', 'commitGeneratedBatchToStorage must be a function');
    assert.strictEqual(typeof env.sandbox.handleCommitAiGeneratedToStorage, 'function', 'handleCommitAiGeneratedToStorage must be a function');
  });

  // Summary
  console.log('\n=========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedAssertions} / ${totalAssertions} ASSERTIONS PASSED`);
  if (failedAssertions > 0) {
    console.error(`  FAILURES: ${failedAssertions} assertions failed!`);
  } else {
    console.log('  100% OF ADVERSARIAL STRESS ASSERTIONS PASSED PERFECTLY!');
  }
  console.log('=========================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
})();
