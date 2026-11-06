/**
 * =========================================================================
 * CHALLENGER 2: EMPIRICAL MULTI-CHILD PROFILE SWITCHING & EXHAUSTION STRESS
 * =========================================================================
 * Empirical adversarial stress testing of:
 * - Multi-child profile switching between Divyank (Class 5) and Priya (Class 2)
 * - Zero cross-child data bleeding across Growth Profiles, Habits, and Curriculum
 * - Exhausted child edge cases: badge synchronization, empty state loops resistance
 * Target File: divyank_mission_control_google_apps_script_app.html
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=================================================================');
console.log('⚔️  CHALLENGER 2: MULTI-CHILD SWITCHING & EXHAUSTION STRESS SUITE');
console.log('    Divyank (Class 5) <==> Priya (Class 2) State Isolation & Boundary');
console.log('=================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const appScriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createSimulatedEnvironment(options = {}) {
  const mockLocalStorage = {};
  const mockStorage = {
    getItem: (k) => (k in mockLocalStorage ? mockLocalStorage[k] : null),
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };

  const domElements = {};

  function createMockElement(id) {
    return {
      id: id,
      value: '',
      innerText: '',
      innerHTML: '',
      className: '',
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); },
        toggle: function(c) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        }
      },
      style: {},
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        fillRect: () => {},
        fillText: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {}
      }),
      querySelectorAll: (sel) => [],
      querySelector: (sel) => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      insertBefore: () => {},
      appendChild: function(child) {
        this.children = this.children || [];
        this.children.push(child);
      },
      setAttribute: () => {},
      getAttribute: () => null,
      children: []
    };
  }

  const mockDoc = {
    getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
    querySelectorAll: (sel) => {
      if (sel === '.tab-view') {
        return Object.keys(domElements).filter(k => k.startsWith('view-')).map(k => domElements[k]);
      }
      if (sel === '.tab-btn') {
        return Object.keys(domElements).filter(k => k.startsWith('tab-')).map(k => domElements[k]);
      }
      return [];
    },
    querySelector: (sel) => null,
    createElement: (tag) => createMockElement(tag + '_' + Math.random().toString(36).slice(2)),
    body: createMockElement('body'),
    addEventListener: () => {}
  };

  const mockWindow = {
    localStorage: mockStorage,
    innerWidth: 1200,
    innerHeight: 800,
    onload: null,
    scrollTo: () => {},
    addEventListener: () => {},
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { setValueAtTime: () => {} },
          type: ''
        }),
        createGain: () => ({
          connect: () => {},
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        })
      };
    }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockDoc;

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: mockStorage,
    navigator: { userAgent: 'ZoptroChallenger2M3Stress' },
    console: console,
    setTimeout: (fn, ms) => {
      if (options.synchronousTimeouts) return fn();
      return setTimeout(fn, ms || 0);
    },
    clearTimeout: (id) => clearTimeout(id),
    setInterval: () => 1,
    clearInterval: () => {},
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
    process: process,
    module: { exports: {} }
  };

  vm.createContext(sandbox);
  vm.runInContext(appScriptContent, sandbox);

  const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
  const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;

  BrowserMockBackend.init(true);
  BrowserMockBackend._ensureMultiChildSeed();

  // Configure Parent session and Divyank (Class 5) + Priya (Class 2) profiles
  vm.runInContext(`
    currentUser = {
      id: 'u_par_demo',
      role: 'parent',
      fullName: 'Commander Parent',
      email: 'parent@zoptro.com'
    };
    currentRole = 'parent';
    linkedChildren = [
      {
        id: 'u_stu_demo',
        role: 'student',
        fullName: 'Commander Divyank',
        gradeClass: 'Class 5',
        grade: 'Class 5',
        age: 10,
        parentalPermissions: { allowRewardRedemption: true, allowCustomHabits: true },
        coins: 500,
        xp: 1000,
        level: 5,
        streak: 12,
        avatar: '🚀',
        pin: '1234',
        linkedParentId: 'u_par_demo'
      },
      {
        id: 'u_stu_priya',
        role: 'student',
        fullName: 'Cadet Priya',
        gradeClass: 'Class 2',
        grade: 'Class 2',
        age: 7,
        parentalPermissions: { allowRewardRedemption: false, allowCustomHabits: false },
        coins: 120,
        xp: 240,
        level: 2,
        streak: 4,
        avatar: '🔬',
        pin: '5678',
        linkedParentId: 'u_par_demo'
      }
    ];
    activeChildId = 'u_stu_demo';
  `, sandbox);

  // Synchronize USERS table in BrowserMockBackend
  const dbUsers = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
  const divUser = dbUsers.find(u => u.id === 'u_stu_demo');
  if (divUser) {
    divUser.gradeClass = 'Class 5';
    divUser.coins = 500;
    divUser.xp = 1000;
    divUser.streak = 12;
  }
  const priyaUser = dbUsers.find(u => u.id === 'u_stu_priya');
  if (priyaUser) {
    priyaUser.gradeClass = 'Class 2';
    priyaUser.coins = 120;
    priyaUser.xp = 240;
    priyaUser.streak = 4;
  }
  BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, dbUsers);

  // Initial UI render
  vm.runInContext(`
    renderParentChildSelector();
    updateActiveChildDisplay();
    refreshDynamicContentForActiveChild();
  `, sandbox);

  function runInCtx(code) {
    return vm.runInContext(code, sandbox);
  }

  function getEl(id) {
    return mockDoc.getElementById(id);
  }

  return {
    sandbox,
    domElements,
    mockDoc,
    mockWindow,
    BrowserMockBackend,
    ZoptroApiClient,
    runInCtx,
    getEl
  };
}

let passed = 0;
let failed = 0;
const failures = [];

async function runTest(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message, stack: err.stack });
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function main() {
  console.log('--- STARTING EMPIRICAL VERIFICATION OF CHILD SWITCHING & EXHAUSTION ---\n');

  // =========================================================================
  // TEST 1: Baseline Multi-Child Profile Setup Verification
  // =========================================================================
  await runTest('T1: Divyank is registered as Class 5 and Priya as Class 2 with isolated properties', async () => {
    const env = createSimulatedEnvironment();
    const children = env.runInCtx('linkedChildren');
    assert.strictEqual(children.length, 2);

    const div = children.find(c => c.id === 'u_stu_demo');
    const priya = children.find(c => c.id === 'u_stu_priya');

    assert.strictEqual(div.gradeClass, 'Class 5');
    assert.strictEqual(div.coins, 500);
    assert.strictEqual(priya.gradeClass, 'Class 2');
    assert.strictEqual(priya.coins, 120);

    // Initial active child is Divyank
    assert.strictEqual(env.runInCtx('activeChildId'), 'u_stu_demo');
    assert.strictEqual(env.getEl('activeChildNameLabel').innerText, 'Commander Divyank');
    assert.strictEqual(env.getEl('parentObservedCoins').innerText, 500);
    assert.ok(env.getEl('longitudinalChildNameBadge').innerText.includes('Class 5'));
  });

  // =========================================================================
  // TEST 2: Longitudinal Growth Profile Switching & Zero Data Bleed
  // =========================================================================
  await runTest('T2: Switching active child instantly swaps longitudinal growth profile without metric bleed', async () => {
    const env = createSimulatedEnvironment();

    // Seed distinct growth profiles in backend mock
    const now = new Date();
    const today = now.toISOString().substring(0, 10);
    const yesterday = new Date(now.getTime() - 86400000).toISOString().substring(0, 10);

    const divProfiles = [
      {
        id: 'gp_div_1',
        studentId: 'u_stu_demo',
        date: yesterday,
        focusMinutes: 60,
        habitRate: 90,
        academicScore: 95,
        eqScore: 85,
        milestonesJson: JSON.stringify([{ id: 'FOCUS_STARTER', title: 'First Sprint' }])
      },
      {
        id: 'gp_div_2',
        studentId: 'u_stu_demo',
        date: today,
        focusMinutes: 75,
        habitRate: 85,
        academicScore: 92,
        eqScore: 88,
        milestonesJson: JSON.stringify([{ id: 'FOCUS_CENTURION', title: 'Centurion' }])
      }
    ];

    const priyaProfiles = [
      {
        id: 'gp_priya_1',
        studentId: 'u_stu_priya',
        date: today,
        focusMinutes: 25,
        habitRate: 60,
        academicScore: 78,
        eqScore: 70,
        milestonesJson: JSON.stringify([{ id: 'ENROLLED', title: 'Enrolled' }])
      }
    ];

    env.BrowserMockBackend._setTable(
      env.BrowserMockBackend.KEYS.STUDENT_GROWTH_PROFILES,
      [...divProfiles, ...priyaProfiles]
    );

    // 1. Load Divyank's profile
    env.runInCtx(`loadLongitudinalProfile('u_stu_demo', '30d')`);
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(env.getEl('metricFocusDurationVal').innerText, '135m'); // 60 + 75 = 135
    assert.strictEqual(env.getEl('metricAcademicAccuracyVal').innerText, '93.5%'); // round((95+92)/2*10)/10 = 93.5
    assert.strictEqual(env.getEl('metricHabitAdherenceVal').innerText, '87.5%'); // round((90+85)/2*10)/10 = 87.5
    assert.strictEqual(Number(env.getEl('metricEqOutcomesVal').innerText), 2);

    // 2. Switch to Priya
    env.runInCtx(`selectActiveChild('u_stu_priya')`);
    await new Promise(r => setTimeout(r, 40));

    // Priya's metrics must be active immediately with ZERO Divyank data bleeding
    assert.strictEqual(env.runInCtx('activeChildId'), 'u_stu_priya');
    assert.strictEqual(env.getEl('metricFocusDurationVal').innerText, '25m', 'Priya focus minutes must be 25m');
    assert.strictEqual(env.getEl('metricAcademicAccuracyVal').innerText, '78%', 'Priya academic score must be 78%');
    assert.strictEqual(env.getEl('metricHabitAdherenceVal').innerText, '60%', 'Priya habit adherence must be 60%');
    assert.strictEqual(Number(env.getEl('metricEqOutcomesVal').innerText), 1, 'Priya EQ outcomes count must be 1');

    // Verify SVG chart for Priya contains exactly 1 data point / marker
    const priyaSvg = env.getEl('longitudinalSvgChart').innerHTML;
    assert.ok(!priyaSvg.includes('NaN'));
    assert.ok(!priyaSvg.includes('135')); // Must NOT contain Divyank's numbers

    // 3. Switch back to Divyank
    env.runInCtx(`selectActiveChild('u_stu_demo')`);
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(env.getEl('metricFocusDurationVal').innerText, '135m');
    assert.strictEqual(env.getEl('metricAcademicAccuracyVal').innerText, '93.5%');
    assert.strictEqual(env.getEl('metricHabitAdherenceVal').innerText, '87.5%');
    assert.strictEqual(Number(env.getEl('metricEqOutcomesVal').innerText), 2);
  });

  // =========================================================================
  // TEST 3: Dynamic Curriculum Switching & Strict Cross-Grade Isolation
  // =========================================================================
  await runTest('T3: Changing active child refreshes curriculum strictly aligning Class 5 vs Class 2', async () => {
    const env = createSimulatedEnvironment();

    // Seed distinct Class 5 and Class 2 content
    const stories = [
      {
        id: 'st_c5_1',
        title: 'The Great Space Voyage',
        gradeClass: 'Class 5',
        grade: 'Class 5',
        genre: 'Sci-Fi Leadership',
        estimatedReadTimeMinutes: 10,
        paragraphs: ['Chapter 1 for Class 5 explorers.'],
        moralLesson: 'Perseverance in adversity',
        isActive: true
      },
      {
        id: 'st_c2_1',
        title: 'The Little Green Sprout',
        gradeClass: 'Class 2',
        grade: 'Class 2',
        genre: 'Nature & Kindness',
        estimatedReadTimeMinutes: 5,
        paragraphs: ['Story for Class 2 cadets.'],
        moralLesson: 'Kindness to living beings',
        isActive: true
      }
    ];

    const eqScenarios = [
      {
        id: 'eq_c5_1',
        title: 'Fair Play in Inter-School Sports',
        scenarioTitle: 'Fair Play in Inter-School Sports',
        gradeClass: 'Class 5',
        grade: 'Class 5',
        category: 'Integrity',
        scenarioText: 'A referee makes an incorrect call in your favor...',
        isActive: true
      },
      {
        id: 'eq_c2_1',
        title: 'Sharing Toys at Recess',
        scenarioTitle: 'Sharing Toys at Recess',
        gradeClass: 'Class 2',
        grade: 'Class 2',
        category: 'Empathy',
        scenarioText: 'A classmate wants to play with your building blocks...',
        isActive: true
      }
    ];

    const dailyKnowledge = [
      {
        id: 'gk_c5_1',
        question: 'What is the speed of light in vacuum?',
        answer: '300,000 km/s',
        gradeClass: 'Class 5',
        grade: 'Class 5',
        domain: 'national',
        isActive: true
      },
      {
        id: 'gk_c2_1',
        question: 'Which planet is known as the Red Planet?',
        answer: 'Mars',
        gradeClass: 'Class 2',
        grade: 'Class 2',
        domain: 'national',
        isActive: true
      }
    ];

    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.STORIES, stories);
    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.EQ_SCENARIOS, eqScenarios);
    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.DAILY_KNOWLEDGE, dailyKnowledge);

    // 1. Explicit refresh for active child (Divyank Class 5)
    env.runInCtx(`refreshDynamicContentForActiveChild()`);
    await new Promise(r => setTimeout(r, 40));

    // Verify Divyank receives Class 5 curriculum
    assert.strictEqual(env.getEl('gkGradeBannerLabel').innerText, 'Enrolled Grade: Class 5 • Daily Knowledge Arena');
    assert.strictEqual(env.getEl('storyTitle').innerText, 'The Great Space Voyage');
    assert.strictEqual(env.getEl('storyActiveChildGradeBadge').innerText, 'Class 5 Track');
    assert.strictEqual(env.getEl('eqScenarioHeading').innerText, 'Fair Play in Inter-School Sports');
    assert.strictEqual(env.getEl('eqGradeBadge').innerText, 'Class 5 Dilemma');

    // 2. Switch to Priya (Class 2)
    env.runInCtx(`selectActiveChild('u_stu_priya')`);
    await new Promise(r => setTimeout(r, 40));

    // Verify Priya receives Class 2 curriculum with 0% Class 5 leakage
    assert.strictEqual(env.getEl('gkGradeBannerLabel').innerText, 'Enrolled Grade: Class 2 • Daily Knowledge Arena');
    assert.strictEqual(env.getEl('storyTitle').innerText, 'The Little Green Sprout');
    assert.strictEqual(env.getEl('storyActiveChildGradeBadge').innerText, 'Class 2 Track');
    assert.strictEqual(env.getEl('eqScenarioHeading').innerText, 'Sharing Toys at Recess');
    assert.strictEqual(env.getEl('eqGradeBadge').innerText, 'Class 2 Dilemma');

    // 3. Switch back to Divyank (Class 5)
    env.runInCtx(`selectActiveChild('u_stu_demo')`);
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(env.getEl('gkGradeBannerLabel').innerText, 'Enrolled Grade: Class 5 • Daily Knowledge Arena');
    assert.strictEqual(env.getEl('storyTitle').innerText, 'The Great Space Voyage');
    assert.strictEqual(env.getEl('storyActiveChildGradeBadge').innerText, 'Class 5 Track');
  });

  // =========================================================================
  // TEST 4: Verification Queue and Habit Isolation
  // =========================================================================
  await runTest('T4: Pending submissions and active child targeting remain isolated in verification queue', async () => {
    const env = createSimulatedEnvironment();

    // Seed distinct submissions for Divyank and Priya
    const submissions = [
      {
        id: 'sub_div_1',
        studentId: 'u_stu_demo',
        studentName: 'Commander Divyank',
        parentUserId: 'u_par_demo',
        questId: 'h_1',
        questTitle: 'Math Homework Sprint',
        coins: 25,
        xp: 50,
        status: 'PENDING_VERIFICATION'
      },
      {
        id: 'sub_priya_1',
        studentId: 'u_stu_priya',
        studentName: 'Cadet Priya',
        parentUserId: 'u_par_demo',
        questId: 'h_2',
        questTitle: 'Reading Phonics Aloud',
        coins: 15,
        xp: 30,
        status: 'PENDING_VERIFICATION'
      }
    ];

    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.SUBMISSIONS, submissions);

    // 1. Start on Priya first with verificationQueueFilter = 'active'
    env.runInCtx(`
      verificationQueueFilter = 'active';
      selectActiveChild('u_stu_priya');
    `);
    await new Promise(r => setTimeout(r, 40));

    // Verify Priya's submission is shown, Divyank's is filtered out
    const questsHtmlPriya = env.getEl('pendingQuestsContainer').innerHTML;
    assert.ok(questsHtmlPriya.includes('Reading Phonics Aloud'));
    assert.ok(!questsHtmlPriya.includes('Math Homework Sprint'));

    // 2. Switch to Divyank
    env.runInCtx(`selectActiveChild('u_stu_demo')`);
    await new Promise(r => setTimeout(r, 40));

    // Verify Divyank's submission is shown, Priya's is filtered out
    const questsHtmlDiv = env.getEl('pendingQuestsContainer').innerHTML;
    assert.ok(questsHtmlDiv.includes('Math Homework Sprint'));
    assert.ok(!questsHtmlDiv.includes('Reading Phonics Aloud'));
  });

  // =========================================================================
  // TEST 5: Switching to an Exhausted Child Does Not Desynchronize UI Badges
  // =========================================================================
  await runTest('T5: Switching to an exhausted child (100% completed / 0 data) maintains badge sync without empty state loops', async () => {
    const env = createSimulatedEnvironment();

    // Divyank has Class 5 content; Priya has Class 2 content
    const stories = [
      {
        id: 'st_c5_1',
        title: 'The Great Space Voyage',
        gradeClass: 'Class 5',
        grade: 'Class 5',
        genre: 'Sci-Fi Leadership',
        paragraphs: ['Chapter 1'],
        isActive: true
      },
      {
        id: 'st_c2_1',
        title: 'The Little Green Sprout',
        gradeClass: 'Class 2',
        grade: 'Class 2',
        genre: 'Nature & Kindness',
        paragraphs: ['Chapter 1'],
        isActive: true
      }
    ];
    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.STORIES, stories);

    // Priya (Class 2) has completed her story in StudentCompletions (100% exhaustion)
    const completions = [
      {
        id: 'comp_priya_1',
        studentId: 'u_stu_priya',
        contentType: 'Stories',
        contentId: 'st_c2_1',
        completedAt: new Date().toISOString()
      }
    ];
    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.STUDENT_COMPLETIONS, completions);

    // Priya has 0 growth profiles (cold-start / exhausted)
    env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.STUDENT_GROWTH_PROFILES, []);

    // 1. Active child is Divyank
    env.runInCtx(`selectActiveChild('u_stu_demo')`);
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(env.getEl('activeChildNameLabel').innerText, 'Commander Divyank');
    assert.strictEqual(env.getEl('parentObservedCoins').innerText, 500);
    assert.strictEqual(env.getEl('headerActiveChildSelect').value, 'u_stu_demo');
    assert.strictEqual(env.getEl('longitudinalChildNameBadge').innerText, 'Commander Divyank (Class 5)');

    // 2. Switch to Priya (exhausted child)
    env.runInCtx(`selectActiveChild('u_stu_priya')`);
    await new Promise(r => setTimeout(r, 40));

    // Verify UI badges synchronized IMMEDIATELY to Priya
    assert.strictEqual(env.getEl('activeChildNameLabel').innerText, 'Cadet Priya', 'Active child label must sync to Priya');
    assert.strictEqual(env.getEl('parentObservedCoins').innerText, 120, 'Observed coins must sync to Priya (120)');
    assert.strictEqual(env.getEl('headerActiveChildSelect').value, 'u_stu_priya', 'Header select must sync to Priya');
    assert.strictEqual(env.getEl('longitudinalChildNameBadge').innerText, 'Cadet Priya (Class 2)', 'Longitudinal badge must sync to Priya (Class 2)');

    // Verify Longitudinal Empty State is displayed gracefully (not hidden)
    assert.ok(
      !env.getEl('longitudinalEmptyState').classList.contains('hidden'),
      '#longitudinalEmptyState must be revealed for exhausted/cold child'
    );
    assert.strictEqual(env.getEl('longitudinalSvgChart').innerHTML, '', 'SVG chart must be empty on empty state');

    // Verify Story Mastery Celebration is displayed gracefully
    assert.ok(
      !env.getEl('storyMasteryCelebration').classList.contains('hidden'),
      '#storyMasteryCelebration must be revealed for exhausted child'
    );
    assert.strictEqual(env.getEl('storyTitle').innerText, 'Grade Story Track Mastered! 🏆');
    assert.strictEqual(env.getEl('storyActiveChildGradeBadge').innerText, 'Class 2 Track');

    // 3. Switch back to Divyank
    env.runInCtx(`selectActiveChild('u_stu_demo')`);
    await new Promise(r => setTimeout(r, 40));

    // Verify all badges and elements restore to Divyank cleanly
    assert.strictEqual(env.getEl('activeChildNameLabel').innerText, 'Commander Divyank');
    assert.strictEqual(env.getEl('parentObservedCoins').innerText, 500);
    assert.strictEqual(env.getEl('headerActiveChildSelect').value, 'u_stu_demo');
    assert.strictEqual(env.getEl('longitudinalChildNameBadge').innerText, 'Commander Divyank (Class 5)');
    assert.strictEqual(env.getEl('storyTitle').innerText, 'The Great Space Voyage');
    assert.strictEqual(env.getEl('storyActiveChildGradeBadge').innerText, 'Class 5 Track');
    assert.ok(env.getEl('storyMasteryCelebration').classList.contains('hidden'));
  });

  // =========================================================================
  // TEST 6: Rapid 100-Cycle Switching Between Active and Exhausted Child
  // =========================================================================
  await runTest('T6: 100 rapid alternating switches between active (Divyank C5) and exhausted (Priya C2) with 0 desync and <10ms SLA', async () => {
    const env = createSimulatedEnvironment({ synchronousTimeouts: true });

    const kids = ['u_stu_demo', 'u_stu_priya'];
    const latencies = [];

    for (let i = 0; i < 100; i++) {
      const targetId = kids[i % 2];
      const isDivyank = targetId === 'u_stu_demo';

      const t0 = process.hrtime.bigint();
      env.runInCtx(`selectActiveChild('${targetId}')`);
      const t1 = process.hrtime.bigint();
      const ms = Number(t1 - t0) / 1000000;
      latencies.push(ms);

      // Verify SLA
      assert.ok(ms < 10, `Cycle ${i}: Switch to ${targetId} took ${ms.toFixed(3)}ms (exceeded 10ms SLA)`);

      // Verify UI Badge Synchronization
      const expectedName = isDivyank ? 'Commander Divyank' : 'Cadet Priya';
      const expectedCoins = isDivyank ? 500 : 120;
      const expectedBadge = isDivyank ? 'Commander Divyank (Class 5)' : 'Cadet Priya (Class 2)';

      assert.strictEqual(env.getEl('activeChildNameLabel').innerText, expectedName, `Cycle ${i} name desync`);
      assert.strictEqual(env.getEl('parentObservedCoins').innerText, expectedCoins, `Cycle ${i} coins desync`);
      assert.strictEqual(env.getEl('longitudinalChildNameBadge').innerText, expectedBadge, `Cycle ${i} badge desync`);
      assert.strictEqual(env.getEl('headerActiveChildSelect').value, targetId, `Cycle ${i} header select desync`);
    }

    const maxMs = Math.max(...latencies);
    const avgMs = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`     [Benchmark] 100 Cycles Active <-> Exhausted: Avg=${avgMs.toFixed(3)}ms, Max=${maxMs.toFixed(3)}ms`);
    assert.ok(maxMs < 10, 'Max switch latency must remain under 10ms');
  });

  console.log('\n=================================================================');
  console.log(`🏁 SUMMARY: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('=================================================================');

  if (failed === 0) {
    console.log('🎉 ALL MULTI-CHILD PROFILE SWITCHING & EXHAUSTION STRESS TESTS PASSED!');
    process.exit(0);
  } else {
    console.error(`❌ ${failed} TESTS FAILED.`);
    failures.forEach(f => console.error(`- ${f.name}: ${f.error}`));
    process.exit(1);
  }
}

main();
