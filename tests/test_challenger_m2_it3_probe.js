/**
 * =========================================================================
 * ZOPTRO CHALLENGER 2 ITERATION 3 EMPIRICAL DEEP-PROBE HARNESS
 * =========================================================================
 * Verifies:
 * 1. Grade Boundary Isolation & Cross-Grade Anti-Leakage
 * 2. Multi-Child Content Exhaustion & Rapid Switching Invariants
 * 3. Anti-Farming Protection & Replay Attack Defense
 * =========================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("⚔️  ZOPTRO CHALLENGER 2 (M2-IT3) DEEP-PROBE ADVERSARIAL HARNESS");
console.log("=================================================================\n");

const htmlFilePath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const oracleFilePath = path.join(__dirname, 'harness/zoptro_contract_oracle.js');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
const { ZoptroContractOracle } = require(oracleFilePath);

// Prepare mock DOM for Frontend VM
function createMockElement(id = '') {
  return {
    id,
    getContext: () => ({
      clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {}
    }),
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      has(c) { return this._classes.has(c); },
      toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
    },
    innerText: '',
    innerHTML: '',
    value: '',
    style: {},
    setAttribute() {},
    appendChild() {},
    insertBefore() {},
    querySelectorAll: () => []
  };
}

function setupFrontendVM() {
  const domElements = {};
  const mockDocument = {
    getElementById: (id) => {
      if (!domElements[id]) domElements[id] = createMockElement(id);
      return domElements[id];
    },
    querySelectorAll: () => [],
    createElement: (tag) => createMockElement(tag),
    body: { appendChild() {} },
    addEventListener: () => {}
  };

  const mockWindow = {
    innerWidth: 1024,
    innerHeight: 768,
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
      clear() { this._data = {}; }
    },
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }),
        createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } })
      };
    },
    addEventListener: () => {},
    lucide: { createIcons: () => {} }
  };

  const mockContext = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    },
    window: mockWindow,
    document: mockDocument,
    setTimeout: (fn, ms) => setTimeout(fn, ms || 1),
    clearTimeout,
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: () => 1,
    module: { exports: {} },
    exports: {}
  };

  const scriptMatches = [...htmlContent.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
  const appScript = scriptMatches[scriptMatches.length - 1][1];

  vm.createContext(mockContext);
  vm.runInContext(appScript, mockContext);

  const mockBackend = mockContext.window.BrowserMockBackend || mockContext.module.exports.BrowserMockBackend;
  const apiClient = mockContext.window.ZoptroApiClient || mockContext.module.exports.ZoptroApiClient;

  return {
    ctx: mockContext,
    domElements,
    mockDocument,
    mockBackend,
    apiClient
  };
}

let attacksAttempted = 0;
let attacksDefended = 0;

async function testProbe(name, fn) {
  attacksAttempted++;
  try {
    await fn();
    attacksDefended++;
    console.log(`  🛡️  DEFENDED [PROBE-${attacksAttempted}]: ${name}`);
  } catch (err) {
    console.error(`  🚨 FAILED [PROBE-${attacksAttempted}]: ${name}`);
    console.error(`     Reason: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runProbes() {
  const { mockBackend, apiClient, ctx, domElements } = setupFrontendVM();
  mockBackend.init(true);

  const oracle = new ZoptroContractOracle();
  oracle.tables.Stories = mockBackend._getTable(mockBackend.KEYS.STORIES).map(s => Object.assign({}, s));
  oracle.tables.EQScenarios = mockBackend._getTable(mockBackend.KEYS.EQ_SCENARIOS).map(s => Object.assign({}, s));
  oracle.tables.DailyKnowledge = mockBackend._getTable(mockBackend.KEYS.DAILY_KNOWLEDGE).map(s => Object.assign({}, s));
  oracle.tables.CurriculumQuizzes = mockBackend._getTable(mockBackend.KEYS.CURRICULUM_QUIZZES).map(s => Object.assign({}, s));
  oracle.tables.StudentCompletions = [];

  console.log("--- 1. GRADE BOUNDARY ENFORCEMENT & TAMPER RESISTANCE ---");

  await testProbe("Client parameter tampering: getNextContentItem ignores requested grade", async () => {
    // Divyank is registered as Class 3
    const res = await apiClient.getNextContentItem({
      studentId: 'u_stu_demo',
      contentType: 'story',
      grade: 'Class 8' // malicious injection
    });
    assert.strictEqual(res.success, true);
    if (res.item) {
      assert.strictEqual(res.item.gradeClass, 'Class 3', "Item served must belong to student's enrolled Class 3");
    }
  });

  await testProbe("Cross-grade completion attack: Class 3 student attempting to complete Class 7 item", async () => {
    const stories = mockBackend._getTable(mockBackend.KEYS.STORIES);
    const class7Story = stories.find(s => s.grade === 'Class 7' || s.gradeClass === 'Class 7');
    assert.ok(class7Story, "Class 7 story must exist in database");

    const res = await mockBackend.recordContentCompletion({
      studentId: 'u_stu_demo', // Divyank (Class 3)
      contentType: 'story',
      contentId: class7Story.id,
      score: 100
    });
    assert.strictEqual(res.success, false, "Cross-grade completion must be rejected");
    assert.ok(res.error && res.error.includes("GRADE_MISMATCH"), "Error must report GRADE_MISMATCH");
  });

  await testProbe("Oracle parity: cross-grade completion attack rejected in ZoptroContractOracle", async () => {
    const class5Story = oracle.tables.Stories.find(s => s.grade === 'Class 5' || s.gradeClass === 'Class 5');
    assert.ok(class5Story, "Class 5 story must exist in Oracle");

    const res = await oracle.recordContentCompletion({
      studentId: 'u_stu_demo', // Divyank (Class 3)
      contentType: 'Stories',
      contentId: class5Story.id,
      score: 100
    });
    assert.strictEqual(res.success, false, "Oracle must reject cross-grade completion");
  });

  console.log("\n--- 2. CONTENT EXHAUSTION & SIBLING SWITCHING INVARIANTS ---");

  await testProbe("Complete content exhaustion for Class 3 cleanly transitions to mastery state", async () => {
    // Complete all stories and EQ dilemmas for Divyank (Class 3)
    const stories = mockBackend._getTable(mockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    for (const s of stories) {
      await mockBackend.recordContentCompletion({
        studentId: 'u_stu_demo',
        contentType: 'story',
        contentId: s.id,
        score: 100
      });
    }
    const eqScenarios = mockBackend._getTable(mockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
    for (const eq of eqScenarios) {
      await mockBackend.recordContentCompletion({
        studentId: 'u_stu_demo',
        contentType: 'eq_scenario',
        contentId: eq.id,
        score: 100
      });
    }

    const res = await apiClient.getNextContentItem({
      studentId: 'u_stu_demo',
      contentType: 'story'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.item, null, "Item must be null when all completed");
    assert.strictEqual(res.hasMore, false, "hasMore must be false when exhausted");
    assert.strictEqual(res.allCompleted, true, "allCompleted must be true");
  });

  await testProbe("Multi-child burst switching: alternating between exhausted Divyank (Class 3) and active Priya (Class 5)", async () => {
    const selectChild = ctx.selectActiveChild;

    // Reset Priya completions to ensure she has active content
    const completions = mockBackend._getTable(mockBackend.KEYS.STUDENT_COMPLETIONS);
    mockBackend._setTable(
      mockBackend.KEYS.STUDENT_COMPLETIONS,
      completions.filter(c => c.studentId !== 'u_stu_priya')
    );

    // 10 alternating switches
    for (let i = 0; i < 10; i++) {
      // Switch to Priya (Class 5)
      selectChild('u_stu_priya');
      ctx.renderStoryTime();
      ctx.renderEqLab();
      await new Promise(r => setTimeout(r, 20));

      const storyBadgePriya = domElements['storyActiveChildGradeBadge'];
      const eqBadgePriya = domElements['eqGradeBadge'];
      assert.ok(storyBadgePriya && storyBadgePriya.innerText.includes('Class 5'), `Iter ${i}: Priya story badge must show Class 5, got: ${storyBadgePriya.innerText}`);
      assert.ok(eqBadgePriya && eqBadgePriya.innerText.includes('Class 5'), `Iter ${i}: Priya eq badge must show Class 5, got: ${eqBadgePriya.innerText}`);

      // Switch to Divyank (Class 3, exhausted)
      selectChild('u_stu_demo');
      ctx.renderStoryTime();
      ctx.renderEqLab();
      await new Promise(r => setTimeout(r, 20));

      const storyBadgeDivyank = domElements['storyActiveChildGradeBadge'];
      const eqBadgeDivyank = domElements['eqGradeBadge'];
      const storyTitleDivyank = domElements['storyTitle'];
      const eqTitleDivyank = domElements['eqDilemmaTitle'];

      assert.ok(storyBadgeDivyank && storyBadgeDivyank.innerText.includes('Class 3'), `Iter ${i}: Divyank story badge must show Class 3, got: ${storyBadgeDivyank.innerText}`);
      assert.ok(!storyBadgeDivyank.innerText.includes('Class 5'), `Iter ${i}: Divyank story badge must not leak Class 5`);
      assert.ok(eqBadgeDivyank && eqBadgeDivyank.innerText.includes('Class 3'), `Iter ${i}: Divyank eq badge must show Class 3, got: ${eqBadgeDivyank.innerText}`);
      assert.ok(!eqBadgeDivyank.innerText.includes('Class 5'), `Iter ${i}: Divyank eq badge must not leak Class 5`);

      // Verify mastery celebration text is displayed
      assert.ok(storyTitleDivyank && storyTitleDivyank.innerText.includes('Mastered'), `Iter ${i}: Story title should indicate mastery`);
      assert.ok(eqTitleDivyank && eqTitleDivyank.innerText.includes('Completed'), `Iter ${i}: EQ title should indicate completed`);
    }
  });

  console.log("\n--- 3. ANTI-FARMING & REPLAY ATTACK INVARIANTS ---");

  await testProbe("Replay attack: 50 concurrent / rapid duplicate completion requests award points exactly once", async () => {
    // Register a new test student in Class 2
    const testStudentId = 'u_stu_farm_test';
    const users = mockBackend._getTable(mockBackend.KEYS.USERS);
    users.push({
      id: testStudentId,
      fullName: 'Farm Tester',
      role: 'student',
      gradeClass: 'Class 2',
      coins: 100,
      xp: 200
    });
    mockBackend._setTable(mockBackend.KEYS.USERS, users);

    // Find a Class 2 story
    const stories = mockBackend._getTable(mockBackend.KEYS.STORIES);
    const class2Story = stories.find(s => s.grade === 'Class 2' || s.gradeClass === 'Class 2');
    assert.ok(class2Story, "Class 2 story must exist");

    // First completion
    const firstRes = await mockBackend.recordContentCompletion({
      studentId: testStudentId,
      contentType: 'story',
      contentId: class2Story.id,
      score: 100
    });
    assert.strictEqual(firstRes.success, true);
    assert.strictEqual(firstRes.coinsAwarded, 20);
    assert.strictEqual(firstRes.xpAwarded, 40);

    // Snapshot wallet balances
    const userAfterFirst = mockBackend._getTable(mockBackend.KEYS.USERS).find(u => u.id === testStudentId);
    assert.strictEqual(userAfterFirst.coins, 120);
    assert.strictEqual(userAfterFirst.xp, 240);

    // Replay 50 times with varied scores and payloads
    for (let r = 0; r < 50; r++) {
      const replayRes = await mockBackend.recordContentCompletion({
        studentId: testStudentId,
        contentType: 'story',
        contentId: class2Story.id,
        score: r % 2 === 0 ? 100 : 75,
        answers: { replayId: r }
      });
      assert.strictEqual(replayRes.success, true);
      assert.strictEqual(replayRes.coinsAwarded, 0, `Replay ${r} must award 0 coins`);
      assert.strictEqual(replayRes.xpAwarded, 0, `Replay ${r} must award 0 XP`);
      assert.strictEqual(replayRes.alreadyCompleted, true, `Replay ${r} must flag alreadyCompleted: true`);
    }

    // Assert final wallet balance is identical to post-first-completion balance
    const userFinal = mockBackend._getTable(mockBackend.KEYS.USERS).find(u => u.id === testStudentId);
    assert.strictEqual(userFinal.coins, 120, "Wallet coins must NOT increase from replay spam");
    assert.strictEqual(userFinal.xp, 240, "XP must NOT increase from replay spam");

    // Check completion records: strictly 1 completion entry exists
    const completions = mockBackend._getTable(mockBackend.KEYS.STUDENT_COMPLETIONS)
      .filter(c => c.studentId === testStudentId && c.contentId === class2Story.id);
    assert.strictEqual(completions.length, 1, "Only exactly 1 completion record must exist in database");
  });

  await testProbe("Oracle anti-farming parity: duplicate completion produces alreadyCompleted with 0 coins", async () => {
    const testStudentId = 'u_stu_oracle_farm';
    oracle.tables.Users.push({
      id: testStudentId,
      fullName: 'Oracle Farm Tester',
      role: 'student',
      gradeClass: 'Class 4',
      coins: 50,
      xp: 100
    });

    const story = oracle.tables.Stories.find(s => s.grade === 'Class 4' || s.gradeClass === 'Class 4');
    assert.ok(story, "Class 4 story must exist in Oracle");

    const r1 = await oracle.recordContentCompletion({
      studentId: testStudentId,
      contentType: 'Stories',
      contentId: story.id,
      score: 100
    });
    assert.strictEqual(r1.success, true);
    assert.strictEqual(r1.coinsAwarded, 20);

    const r2 = await oracle.recordContentCompletion({
      studentId: testStudentId,
      contentType: 'Stories',
      contentId: story.id,
      score: 100
    });
    assert.strictEqual(r2.success, true);
    assert.strictEqual(r2.coinsAwarded, 0, "Oracle must award 0 coins on duplicate completion");
    assert.strictEqual(r2.alreadyCompleted, true, "Oracle must set alreadyCompleted: true");

    const user = oracle.tables.Users.find(u => u.id === testStudentId);
    assert.strictEqual(user.coins, 70, "Oracle wallet balance must be 70 (50 + 20)");
  });

  console.log("\n=================================================================");
  console.log(`🏁 DEEP-PROBE HARNESS COMPLETE: ${attacksDefended}/${attacksAttempted} DEFENDED`);
  console.log("=================================================================");

  if (attacksDefended === attacksAttempted && !process.exitCode) {
    console.log("🎉 ALL DEEP-PROBE CHALLENGES DEFENDED WITH 100% INTEGRITY!\n");
  } else {
    process.exit(1);
  }
}

runProbes().catch(err => {
  console.error("Fatal error running deep-probe harness:", err);
  process.exit(1);
});
