/**
 * =========================================================================
 * ZOPTRO - CHALLENGER 1 (M2-IT2) EMPIRICAL ADVERSARIAL TEST HARNESS
 * =========================================================================
 * Roles: critic, specialist (Empirical Challenger)
 * Verification Objectives:
 * 1. Verify strict DOM registry & ZERO phantom IDs queried in JavaScript
 * 2. Verify all dynamic views (Story Time, EQ Lab, Daily GK, Quizzes, News)
 *    genuinely populate real DOM elements with real dynamic content
 * 3. Verify CBSE Class 1 to Class 10 content isolation with 0% cross-grade leakage
 * 4. Stress-test rapid child switching (<10ms) without UI desync or race condition
 * 5. Verify Content Exhaustion & Grade Mastery handling in UI
 * 6. Verify zero hardcoded content invariants across HTML/JS
 * =========================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("⚔️  STARTING CHALLENGER 1 (M2-IT2) EMPIRICAL ADVERSARIAL HARNESS");
console.log("=================================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  ✅ PASS: ${name}`);
}

function fail(name, err) {
  totalTests++;
  failedTests++;
  const msg = err && err.message ? err.message : String(err);
  console.error(`  🚨 FAIL: ${name}`);
  console.error(`     Reason: ${msg}`);
  failures.push({ name, error: msg });
}

function testSync(name, fn) {
  try {
    fn();
    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

// -------------------------------------------------------------------------
// Load Source Files
// -------------------------------------------------------------------------
const htmlFilePath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
assert.ok(fs.existsSync(htmlFilePath), "App HTML file must exist at " + htmlFilePath);
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Parse HTML markup vs main script tag
const scriptMatches = htmlContent.match(/<script>([\s\S]*?)<\/script>/g);
assert.ok(scriptMatches && scriptMatches.length > 0, "Script tag must exist in HTML");
const mainScriptTag = scriptMatches[scriptMatches.length - 1];
const mainScriptIndex = htmlContent.lastIndexOf(mainScriptTag);
const htmlMarkup = htmlContent.slice(0, mainScriptIndex);
const scriptCode = mainScriptTag.replace('<script>', '').replace('</script>', '');

// Build strict realistic DOM elements registry
const domRegistry = {};
const idRegex = /\bid=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(htmlMarkup)) !== null) {
  const id = m[1];
  domRegistry[id] = {
    id: id,
    tagName: 'DIV',
    _innerText: '',
    _innerHTML: '',
    get innerText() {
      return this._innerText || (this._innerHTML ? this._innerHTML.replace(/<[^>]+>/g, '').trim() : '');
    },
    set innerText(v) {
      this._innerText = String(v);
      this._innerHTML = String(v);
    },
    get innerHTML() {
      return this._innerHTML || this._innerText || '';
    },
    set innerHTML(v) {
      this._innerHTML = String(v);
      this._innerText = String(v).replace(/<[^>]+>/g, '').trim();
    },
    value: '',
    style: {},
    className: '',
    children: [],
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      has: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      get value() { return Array.from(this._classes).join(' '); }
    },
    getContext: () => ({ clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {} }),
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k]; },
    appendChild: function(c) { this.children.push(c); return c; },
    insertBefore: function(c) { this.children.unshift(c); return c; },
    querySelectorAll: function() { return []; },
    addEventListener: function() {},
    removeEventListener: function() {}
  };
}

// Track runtime getElementById queries
const queriedIdsLog = [];
const mockDocument = {
  getElementById: function(id) {
    queriedIdsLog.push(id);
    if (Object.prototype.hasOwnProperty.call(domRegistry, id)) {
      return domRegistry[id];
    }
    // STRICT: Return null for any ID not declared in HTML markup!
    return null;
  },
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      innerText: '',
      innerHTML: '',
      className: '',
      style: {},
      children: [],
      classList: {
        _classes: new Set(),
        add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
        contains: function(c) { return this._classes.has(c); },
        has: function(c) { return this._classes.has(c); },
        toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
      },
      appendChild: function(c) { this.children.push(c); return c; },
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k]; },
      addEventListener: function() {}
    };
  },
  querySelectorAll: function() { return []; },
  querySelector: function(sel) {
    if (sel.startsWith('#')) {
      return this.getElementById(sel.slice(1));
    }
    return null;
  },
  body: {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  }
};

const mockLocalStorage = {
  _store: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

const mockExports = {};
const mockWindow = {
  localStorage: mockLocalStorage,
  innerWidth: 1024,
  innerHeight: 768,
  AudioContext: function() {
    return {
      currentTime: 0,
      destination: {},
      createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }),
      createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } })
    };
  },
  speechSynthesis: {
    speak: () => {},
    cancel: () => {}
  },
  SpeechSynthesisUtterance: function(text) { this.text = text; },
  addEventListener: () => {}
};

const mockContext = {
  module: { exports: mockExports },
  exports: mockExports,
  window: mockWindow,
  document: mockDocument,
  console: console,
  setTimeout: (fn, ms) => setTimeout(fn, ms || 1),
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {},
  requestAnimationFrame: () => 1
};

vm.createContext(mockContext);
vm.runInContext(scriptCode, mockContext);

const BrowserMockBackend = mockContext.window.BrowserMockBackend || mockExports.BrowserMockBackend;
const ZoptroApiClient = mockContext.window.ZoptroApiClient || mockExports.ZoptroApiClient;

// =========================================================================
// RUN ADVERSARIAL CHALLENGES
// =========================================================================
async function runAllChallengerAttacks() {

  // -----------------------------------------------------------------------
  // ATTACK SECTION 1: ZERO PHANTOM IDS IN STATIC & RUNTIME JS
  // -----------------------------------------------------------------------
  console.log("--- SECTION 1: ZERO PHANTOM IDS AUDIT ---");

  testSync("CHALLENGE-01: HTML declares >= 240 distinct element IDs", () => {
    const idCount = Object.keys(domRegistry).length;
    assert.ok(idCount >= 240, `Expected >= 240 IDs in HTML markup, got ${idCount}`);
  });

  testSync("CHALLENGE-02: Zero phantom IDs in static document.getElementById calls", () => {
    const staticIdMatches = [...scriptCode.matchAll(/document\.getElementById\s*\(\s*['"]([^'"]+)['"]\s*\)/g)];
    const missing = new Set();
    staticIdMatches.forEach(m => {
      const id = m[1];
      if (!domRegistry[id]) {
        missing.add(id);
      }
    });
    assert.strictEqual(missing.size, 0, `Found phantom IDs in script: ${[...missing].join(', ')}`);
  });

  testSync("CHALLENGE-03: Zero phantom IDs in static document.querySelector('#...') calls", () => {
    const queryMatches = [...scriptCode.matchAll(/document\.querySelector\s*\(\s*['"]#([^'"]+)['"]\s*\)/g)];
    const missing = new Set();
    queryMatches.forEach(m => {
      const id = m[1];
      if (!domRegistry[id]) {
        missing.add(id);
      }
    });
    assert.strictEqual(missing.size, 0, `Found phantom querySelector IDs in script: ${[...missing].join(', ')}`);
  });

  testSync("CHALLENGE-04: Story and EQ sub-tab buttons resolve both hyphenated and camelCase conventions", () => {
    assert.ok(domRegistry['storySubBtn-lore'] || domRegistry['storySubTabBtnLore'], "Lore tab button must exist");
    assert.ok(domRegistry['storySubBtn-eq'] || domRegistry['storySubTabBtnEq'], "EQ tab button must exist");
  });

  // -----------------------------------------------------------------------
  // ATTACK SECTION 2: GENUINE REAL DOM POPULATION ACROSS DYNAMIC VIEWS
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 2: GENUINE REAL DOM POPULATION (STORY, EQ, GK, PYQP, NEWS) ---");

  // Re-initialize mock backend clean state
  BrowserMockBackend.init(true);

  await testAsync("CHALLENGE-05: Story Time populates real DOM with genuine content & reflection", async () => {
    mockContext.activeChildId = 'u_stu_demo'; // Class 3
    mockContext.renderStoryTime();
    await new Promise(r => setTimeout(r, 80));

    const titleEl = domRegistry['storyTitle'];
    const parasEl = domRegistry['storyContentText'];
    const badgeEl = domRegistry['storyActiveChildGradeBadge'];
    const readTimeEl = domRegistry['storyReadTime'];
    const genreEl = domRegistry['storyGenrePill'];
    const eqPromptEl = domRegistry['storyEqPrompt'];
    const questionsCardEl = domRegistry['storyQuestionsCard'];
    const celebrationEl = domRegistry['storyMasteryCelebration'];
    const submitBtn = domRegistry['storySubmitQuestBtn'];

    // Assert real non-empty content
    assert.ok(titleEl && titleEl.innerText.length > 3, "storyTitle must contain real title");
    assert.notStrictEqual(titleEl.innerText, "Loading Story...", "storyTitle must not remain stuck on placeholder");
    assert.ok(parasEl && parasEl.innerHTML.includes("<p"), "storyContentText must contain formatted paragraphs");
    assert.ok(!parasEl.innerHTML.includes("animate-pulse"), "Skeleton pulse must be cleared from storyContentText");
    assert.ok(badgeEl && badgeEl.innerText.includes("Class 3"), "storyActiveChildGradeBadge must reflect Class 3");
    assert.ok(readTimeEl && readTimeEl.innerText.includes("Min Read"), "storyReadTime must indicate read duration");
    assert.ok(genreEl && genreEl.innerText.length > 2, "storyGenrePill must indicate story genre");
    assert.ok(eqPromptEl && eqPromptEl.innerText.length > 5, "storyEqPrompt must contain moral reflection prompt");

    // Celebration must be hidden; submit button & questions must be visible
    assert.ok(celebrationEl.classList.contains('hidden'), "Mastery celebration must be hidden while stories remain");
    assert.strictEqual(submitBtn.classList.contains('hidden'), false, "Submit quest button must be visible");
    assert.strictEqual(questionsCardEl.classList.contains('hidden'), false, "Questions card must be visible");

    // Verify quest answer recording & submission
    mockContext.recordStoryAnswer(0, 0);
    const initialCoins = mockContext.focusCoins || 0;
    mockContext.submitStoryQuest();
    await new Promise(r => setTimeout(r, 60));

    assert.ok(mockContext.focusCoins >= initialCoins, "Focus coins must be awarded after story quest completion");
  });

  await testAsync("CHALLENGE-06: EQ Lab populates real DOM with dilemma, choices & ethical feedback", async () => {
    mockContext.activeChildId = 'u_stu_demo'; // Class 3
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 80));

    const headingEl = domRegistry['eqScenarioHeading'];
    const dilemmaTitleEl = domRegistry['eqDilemmaTitle'];
    const virtueBadgeEl = domRegistry['eqVirtueBadge'];
    const gradeBadgeEl = domRegistry['eqGradeBadge'];
    const bodyEl = domRegistry['eqScenarioBody'];
    const choicesEl = domRegistry['eqChoicesContainer'];
    const feedbackBox = domRegistry['eqFeedbackBox'];
    const submitBtn = domRegistry['eqSubmitBtn'];

    assert.ok(headingEl && headingEl.innerText.length > 3, "eqScenarioHeading must be populated");
    assert.ok(dilemmaTitleEl && dilemmaTitleEl.innerText.length > 3, "eqDilemmaTitle must be populated");
    assert.ok(virtueBadgeEl && virtueBadgeEl.innerText.startsWith("Virtue:"), "eqVirtueBadge must display virtue domain");
    assert.ok(gradeBadgeEl && gradeBadgeEl.innerText.includes("Class 3"), "eqGradeBadge must display Class 3");
    assert.ok(bodyEl && bodyEl.innerHTML.includes("<p"), "eqScenarioBody must contain formatted dilemma description");
    assert.ok(!bodyEl.innerHTML.includes("animate-pulse"), "Skeleton pulse must be cleared from eqScenarioBody");
    assert.ok(choicesEl && choicesEl.children.length >= 2, "eqChoicesContainer must render decision choice buttons");
    assert.ok(feedbackBox.classList.contains('hidden'), "Feedback box must be hidden initially");
    assert.strictEqual(submitBtn.classList.contains('hidden'), false, "EQ submit button must be visible");

    // Select Option B and verify consequence revelation
    mockContext.selectEqChoice('B');
    assert.strictEqual(feedbackBox.classList.contains('hidden'), false, "Feedback box must be visible after selecting option");
    assert.ok(feedbackBox.innerHTML.includes("Chosen Path: Option B"), "Feedback box must display chosen path B");
    assert.ok(feedbackBox.innerHTML.includes("text-[#666D57]"), "Feedback box must render consequence text");

    // Set reflection and submit dilemma
    const personalNoteEl = domRegistry['eqPersonalNote'];
    if (personalNoteEl) personalNoteEl.value = "Truth and moral courage build lasting self-respect.";
    mockContext.submitEqDilemma();
    await new Promise(r => setTimeout(r, 60));
  });

  await testAsync("CHALLENGE-07: Daily GK populates real DOM with national and world facts", async () => {
    mockContext.activeChildId = 'u_stu_demo';
    mockContext.renderDailyGk();
    await new Promise(r => setTimeout(r, 80));

    const bannerEl = domRegistry['gkGradeBannerLabel'];
    const natList = domRegistry['gkNationalFactsList'];
    const worldList = domRegistry['gkWorldFactsList'];

    assert.ok(bannerEl && bannerEl.innerText.includes("Class 3"), "gkGradeBannerLabel must display Class 3");
    assert.ok(natList && natList.innerHTML.length > 50, "gkNationalFactsList must contain rendered facts");
    assert.ok(!natList.innerHTML.includes("animate-pulse"), "Skeleton pulse must be cleared from natList");
    assert.ok(worldList && worldList.innerHTML.length > 50, "gkWorldFactsList must contain rendered facts");
    assert.ok(!worldList.innerHTML.includes("animate-pulse"), "Skeleton pulse must be cleared from worldList");
  });

  await testAsync("CHALLENGE-08: Competitive Exams (PYQP) populates real DOM with exam pills & benchmarks", async () => {
    mockContext.activeChildId = 'u_stu_demo';
    mockContext.renderCompetitiveExams();
    await new Promise(r => setTimeout(r, 80));

    const pillsEl = domRegistry['examSelectorPills'];
    const benchEl = domRegistry['pyqpGradeBenchmark'];

    assert.ok(benchEl && benchEl.innerText.includes("Class 3"), "pyqpGradeBenchmark must display Class 3");
    assert.ok(pillsEl && pillsEl.innerHTML.includes("<button"), "examSelectorPills must render exam option buttons");
    assert.ok(!pillsEl.innerHTML.includes("animate-pulse"), "Skeleton pulse must be cleared from examSelectorPills");
  });

  await testAsync("CHALLENGE-09: Junior Current Affairs (News) populates real DOM without static fallback", async () => {
    mockContext.activeChildId = 'u_stu_demo';
    mockContext.loadDynamicNews();
    await new Promise(r => setTimeout(r, 80));

    const pillsEl = domRegistry['newsPillList'];
    assert.ok(pillsEl && pillsEl.innerHTML.length > 10, "newsPillList must be populated dynamically");
    assert.ok(!pillsEl.innerHTML.includes("Space Technology Exploration"), "Must not use static space news fallback");
  });

  // -----------------------------------------------------------------------
  // ATTACK SECTION 3: MULTI-GRADE PENETRATION & ZERO CROSS-GRADE LEAKAGE
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 3: MULTI-GRADE ISOLATION (CLASS 1 TO 10) ---");

  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  for (const targetGrade of grades) {
    await testAsync(`CHALLENGE-10-${targetGrade.replace(' ', '')}: Grade isolation for ${targetGrade}`, async () => {
      // Mock student profile with target grade
      const tempStudentId = `u_stu_grade_${targetGrade.replace(' ', '_').toLowerCase()}`;
      const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
      users.push({
        id: tempStudentId,
        username: `student_${targetGrade.replace(' ', '')}`,
        fullName: `Cadet ${targetGrade}`,
        role: 'student',
        gradeClass: targetGrade,
        age: 8,
        parentalPermissions: { allowRewardRedemption: true }
      });
      BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, users);

      // Query content for targetGrade via ZoptroApiClient
      const storyRes = await ZoptroApiClient.getNextContentItem({
        studentId: tempStudentId,
        contentType: 'story'
      });
      assert.strictEqual(storyRes.success, true);
      if (storyRes.item) {
        assert.strictEqual(
          storyRes.item.gradeClass || storyRes.item.grade,
          targetGrade,
          `Story for ${targetGrade} student must match ${targetGrade}, got ${storyRes.item.gradeClass}`
        );
      }

      const eqRes = await ZoptroApiClient.getNextContentItem({
        studentId: tempStudentId,
        contentType: 'eq_scenario'
      });
      assert.strictEqual(eqRes.success, true);
      if (eqRes.item) {
        assert.strictEqual(
          eqRes.item.gradeClass || eqRes.item.grade,
          targetGrade,
          `EQ scenario for ${targetGrade} student must match ${targetGrade}, got ${eqRes.item.gradeClass}`
        );
      }

      const gkRes = await ZoptroApiClient.getContentByGrade({
        studentId: tempStudentId,
        contentType: 'daily_knowledge',
        targetGrade: targetGrade
      });
      assert.strictEqual(gkRes.success, true);
      gkRes.items.forEach(item => {
        assert.strictEqual(
          item.gradeClass || item.grade,
          targetGrade,
          `Daily GK item for ${targetGrade} must not leak other grade: ${item.gradeClass}`
        );
      });
    });
  }

  // -----------------------------------------------------------------------
  // ATTACK SECTION 4: RAPID CHILD SWITCHING & UI DESYNC DEFENSE (<10ms)
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 4: RAPID CHILD SWITCHING STRESS HARNESS (<10ms) ---");

  testSync("CHALLENGE-11: Rapid 200-cycle child switching benchmark (<10ms per cycle)", () => {
    const selectActiveChildFn = mockContext.selectActiveChild;
    assert.strictEqual(typeof selectActiveChildFn, 'function', "selectActiveChild must exist");

    // Ensure Divyank (Class 3) and Priya (Class 5) exist
    const durations = [];
    const iterations = 200;

    for (let i = 0; i < iterations; i++) {
      const targetId = (i % 2 === 0) ? 'u_stu_priya' : 'u_stu_demo';
      const expectedGrade = (i % 2 === 0) ? 'Class 5' : 'Class 3';

      const t0 = process.hrtime.bigint();
      selectActiveChildFn(targetId);
      const t1 = process.hrtime.bigint();

      const ms = Number(t1 - t0) / 1000000;
      durations.push(ms);

      // Verify immediate state synchronization
      assert.strictEqual(mockContext.activeChildId, targetId, `Switch cycle ${i}: activeChildId desync!`);
      const observedGrade = mockContext.getActiveStudentGrade();
      assert.strictEqual(observedGrade, expectedGrade, `Switch cycle ${i}: grade desync!`);
    }

    const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxMs = Math.max(...durations);
    console.log(`     Latency Stats over 200 switches: Avg=${avgMs.toFixed(3)}ms, Max=${maxMs.toFixed(3)}ms`);
    assert.ok(maxMs < 10, `Worst-case child switch duration must be < 10ms (was ${maxMs.toFixed(3)}ms)`);
    assert.ok(avgMs < 2, `Average child switch duration must be < 2ms (was ${avgMs.toFixed(3)}ms)`);
  });

  await testAsync("CHALLENGE-12A: Zero UI desync under burst switching when content is active/uncompleted", async () => {
    // Reset completions so both children have uncompleted content
    BrowserMockBackend._setTable(BrowserMockBackend.KEYS.STUDENT_COMPLETIONS, []);

    const selectActiveChildFn = mockContext.selectActiveChild;

    // Burst switch rapidly 10 times in synchronous loop
    for (let i = 0; i < 10; i++) {
      selectActiveChildFn(i % 2 === 0 ? 'u_stu_priya' : 'u_stu_demo');
    }
    // Settle on Divyank (Class 3)
    selectActiveChildFn('u_stu_demo');
    assert.strictEqual(mockContext.activeChildId, 'u_stu_demo');
    assert.strictEqual(mockContext.getActiveStudentGrade(), 'Class 3');

    // Trigger dynamic renders and check that all badges and views synchronize to Class 3
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    mockContext.renderDailyGk();
    mockContext.renderCompetitiveExams();
    await new Promise(r => setTimeout(r, 100));

    const storyBadge = domRegistry['storyActiveChildGradeBadge'];
    const eqBadge = domRegistry['eqGradeBadge'];
    const gkBanner = domRegistry['gkGradeBannerLabel'];
    const pyqpBadge = domRegistry['pyqpGradeBenchmark'];

    assert.ok(storyBadge && storyBadge.innerText.includes("Class 3"), "Story badge must be synchronized to Class 3");
    assert.ok(eqBadge && eqBadge.innerText.includes("Class 3"), "EQ badge must be synchronized to Class 3");
    assert.ok(gkBanner && gkBanner.innerText.includes("Class 3"), "GK banner must be synchronized to Class 3");
    assert.ok(pyqpBadge && pyqpBadge.innerText.includes("Class 3"), "PYQP badge must be synchronized to Class 3");
  });

  await testAsync("CHALLENGE-12B [ADVERSARIAL PROBE]: Grade badge desync when switching from sibling to content-exhausted child", async () => {
    const selectActiveChildFn = mockContext.selectActiveChild;

    // 1. Switch to Priya (Class 5) and render -> sets badges to Class 5
    selectActiveChildFn('u_stu_priya');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 80));

    const storyBadgePriya = domRegistry['storyActiveChildGradeBadge'];
    const eqBadgePriya = domRegistry['eqGradeBadge'];
    assert.ok(storyBadgePriya && storyBadgePriya.innerText.includes("Class 5"), "Priya Story badge must be Class 5");
    assert.ok(eqBadgePriya && eqBadgePriya.innerText.includes("Class 5"), "Priya EQ badge must be Class 5");

    // 2. Mark all Class 3 content completed for Divyank
    const stories = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    stories.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_demo', contentType: 'story', contentId: s.id, score: 100 }));
    const eq = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    eq.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_demo', contentType: 'eq_scenario', contentId: s.id, score: 100 }));

    // 3. Switch back to Divyank (Class 3) whose stories/EQ are now exhausted
    selectActiveChildFn('u_stu_demo');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 80));

    const storyBadgeDivyank = domRegistry['storyActiveChildGradeBadge'];
    const eqBadgeDivyank = domRegistry['eqGradeBadge'];

    // Empirical check: In the current implementation, lines 6468-6480 and lines 6632-6646
    // return early in the isAllCompleted branch without updating storyActiveChildGradeBadge or eqGradeBadge.
    // They retain 'Class 5 Track' and 'Class 5 Dilemma' from Priya!
    const storyBadgeDesynced = storyBadgeDivyank && storyBadgeDivyank.innerText.includes("Class 5");
    const eqBadgeDesynced = eqBadgeDivyank && eqBadgeDivyank.innerText.includes("Class 5");

    if (storyBadgeDesynced || eqBadgeDesynced) {
      throw new Error(
        `Grade badge UI desync detected on content-exhausted child switch! ` +
        `Active child is Divyank (${mockContext.getActiveStudentGrade()}), but ` +
        `storyActiveChildGradeBadge='${storyBadgeDivyank.innerText}' and ` +
        `eqGradeBadge='${eqBadgeDivyank.innerText}' (leaked from Priya). ` +
        `Remediation required: In renderStoryTime() and renderEqLab(), update storyActiveChildGradeBadge and eqGradeBadge before the isAllCompleted return.`
      );
    }
  });

  // -----------------------------------------------------------------------
  // ATTACK SECTION 5: CONTENT EXHAUSTION & CELEBRATION UI RESILIENCE
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 5: CONTENT EXHAUSTION & GRADE MASTERY RESILIENCE ---");

  await testAsync("CHALLENGE-13: Story Time handles complete grade exhaustion gracefully", async () => {
    // Mark ALL stories for Class 3 completed
    const stories = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    stories.forEach(s => {
      BrowserMockBackend.recordContentCompletion({
        studentId: 'u_stu_demo',
        contentType: 'story',
        contentId: s.id,
        score: 100
      });
    });

    mockContext.activeChildId = 'u_stu_demo';
    mockContext.renderStoryTime();
    await new Promise(r => setTimeout(r, 80));

    const celebrationEl = domRegistry['storyMasteryCelebration'];
    const submitBtn = domRegistry['storySubmitQuestBtn'];
    const questionsCard = domRegistry['storyQuestionsCard'];
    const titleEl = domRegistry['storyTitle'];

    assert.strictEqual(celebrationEl.classList.contains('hidden'), false, "Celebration must be unhidden on exhaustion");
    assert.strictEqual(submitBtn.classList.contains('hidden'), true, "Submit button must be hidden on exhaustion");
    assert.strictEqual(questionsCard.classList.contains('hidden'), true, "Questions card must be hidden on exhaustion");
    assert.ok(titleEl.innerText.includes("Mastered"), "Title must indicate mastery");
  });

  await testAsync("CHALLENGE-14: EQ Lab handles complete grade exhaustion gracefully", async () => {
    // Mark ALL EQ scenarios for Class 3 completed
    const eqItems = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    eqItems.forEach(s => {
      BrowserMockBackend.recordContentCompletion({
        studentId: 'u_stu_demo',
        contentType: 'eq_scenario',
        contentId: s.id,
        score: 100
      });
    });

    mockContext.activeChildId = 'u_stu_demo';
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 80));

    const headingEl = domRegistry['eqScenarioHeading'];
    const submitBtn = domRegistry['eqSubmitBtn'];
    const feedbackBox = domRegistry['eqFeedbackBox'];

    assert.ok(headingEl.innerText.includes("Mastered"), "EQ heading must indicate track mastery");
    assert.strictEqual(submitBtn.classList.contains('hidden'), true, "EQ submit button must be hidden on exhaustion");
    assert.strictEqual(feedbackBox.classList.contains('hidden'), true, "EQ feedback box must be hidden on exhaustion");
  });

  // -----------------------------------------------------------------------
  // ATTACK SECTION 6: ZERO HARDCODED CONTENT INVARIANTS
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 6: ZERO HARDCODED CONTENT INVARIANTS AUDIT ---");

  testSync("CHALLENGE-15: Eradication of const currentStory literal", () => {
    assert.strictEqual(/const\s+currentStory\s*=/.test(htmlContent), false);
  });

  testSync("CHALLENGE-16: Eradication of const dailyGkDatabase literal", () => {
    assert.strictEqual(/const\s+dailyGkDatabase\s*=/.test(htmlContent), false);
  });

  testSync("CHALLENGE-17: Eradication of const competitiveExamsData literal", () => {
    assert.strictEqual(/const\s+competitiveExamsData\s*=/.test(htmlContent), false);
  });

  testSync("CHALLENGE-18: Eradication of const newsArticles literal", () => {
    assert.strictEqual(/const\s+newsArticles\s*=/.test(htmlContent), false);
  });

  testSync("CHALLENGE-19: Eradication of hardcoded Space Technology Exploration article literal", () => {
    const hasSpaceNews = htmlContent.includes("Space Technology Exploration") &&
      htmlContent.includes("Scientists and astronauts conduct deep space experiments");
    assert.strictEqual(hasSpaceNews, false, "Must not embed hardcoded space news literal in fallback");
  });

  testSync("CHALLENGE-20: Eradication of static Ganges River Dolphin fallback in HTML DOM", () => {
    const gkSection = htmlContent.match(/<section id="view-dailygk"[\s\S]*?<\/section>/);
    assert.ok(gkSection, "view-dailygk section must exist");
    assert.strictEqual(gkSection[0].includes("Ganges River Dolphin"), false);
  });

  testSync("CHALLENGE-21: Eradication of Memory Tip for Divyank in news DOM markup", () => {
    const newsSection = htmlContent.match(/<section id="view-news"[\s\S]*?<\/section>/);
    assert.ok(newsSection, "view-news section must exist");
    assert.strictEqual(newsSection[0].includes("Memory Tip for Divyank"), false);
  });

  // -----------------------------------------------------------------------
  // SUMMARY AND VERDICT
  // -----------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`🏁 CHALLENGER 1 ADVERSARIAL HARNESS COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.error(`💥 ${failedTests} VULNERABILITIES DETECTED!`);
    failures.forEach(f => console.error(`  - [${f.name}]: ${f.error}`));
    process.exit(1);
  } else {
    console.log("🎉 ALL ADVERSARIAL CHALLENGES DEFENDED WITH 100% SUCCESS!");
    console.log("=================================================================\n");
  }
}

runAllChallengerAttacks().catch(err => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
