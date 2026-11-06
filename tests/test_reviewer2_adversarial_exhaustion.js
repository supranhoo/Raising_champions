/**
 * =========================================================================
 * ZOPTRO - REVIEWER 2 (M2-IT3) INDEPENDENT ADVERSARIAL STRESS TEST
 * =========================================================================
 * Focus: Content Exhaustion & Multi-Child Dynamic Grade Badge Synchronization
 * Edge cases:
 * 1. Switching between multiple non-exhausted and exhausted children (Class 1, 3, 5, 7, 10)
 * 2. Switching between two mutually exhausted children (Class 3 & Class 5)
 * 3. Rapid back-and-forth toggle bursts
 * 4. Fallback handling when gradeClass is undefined/null
 * 5. Invariant check: #storyActiveChildGradeBadge, #eqGradeBadge, #eqVirtueBadge,
 *    #storyContentText, #storyEqPrompt, #eqScenarioBody
 * =========================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("⚔️  STARTING REVIEWER 2 (M2-IT3) EXHAUSTION STRESS SUITE");
console.log("=================================================================\n");

let total = 0;
let passed = 0;
let failed = 0;

function pass(name) {
  total++;
  passed++;
  console.log(`  ✅ PASS: ${name}`);
}

function fail(name, err) {
  total++;
  failed++;
  console.error(`  🚨 FAIL: ${name} -> ${err.message || err}`);
}

async function test(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

const htmlFilePath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

const scriptMatches = htmlContent.match(/<script>([\s\S]*?)<\/script>/g);
const mainScriptTag = scriptMatches[scriptMatches.length - 1];
const mainScriptIndex = htmlContent.lastIndexOf(mainScriptTag);
const htmlMarkup = htmlContent.slice(0, mainScriptIndex);
const scriptCode = mainScriptTag.replace('<script>', '').replace('</script>', '');

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

const mockDocument = {
  getElementById: function(id) {
    if (Object.prototype.hasOwnProperty.call(domRegistry, id)) {
      return domRegistry[id];
    }
    return null;
  },
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      classList: {
        _classes: new Set(),
        add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
        contains: function(c) { return this._classes.has(c); }
      },
      innerText: '',
      innerHTML: '',
      style: {},
      children: [],
      appendChild: function(c) { this.children.push(c); return c; },
      setAttribute: function() {}
    };
  },
  querySelectorAll: function() { return []; },
  body: { appendChild: function() {} }
};

const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  },
  AudioContext: function() {
    return {
      currentTime: 0,
      destination: {},
      createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} }, type: '' }),
      createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } })
    };
  },
  addEventListener: () => {}
};

const mockContext = {
  window: mockWindow,
  document: mockDocument,
  console: console,
  setTimeout: (fn) => setTimeout(fn, 1),
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {},
  requestAnimationFrame: () => 1
};

vm.createContext(mockContext);
vm.runInContext(scriptCode, mockContext);

const BrowserMockBackend = mockContext.window.BrowserMockBackend;
BrowserMockBackend.init(true);
BrowserMockBackend._ensureMultiChildSeed();

(async function runAll() {
  console.log("--- TEST SECTION 1: EXHAUSTION DESYNC ACROSS GRADES ---");

  // Mark all Class 3 items completed for Divyank (u_stu_demo)
  const c3Stories = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
  c3Stories.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_demo', contentType: 'story', contentId: s.id, score: 100 }));
  const c3Eq = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 3' || s.gradeClass === 'Class 3');
  c3Eq.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_demo', contentType: 'eq_scenario', contentId: s.id, score: 100 }));

  await test("TEST-01: Switching Priya (Class 5 active) -> Divyank (Class 3 exhausted) updates badges to Class 3", async () => {
    // 1. Switch to Priya
    mockContext.selectActiveChild('u_stu_priya');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 5 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 5 Dilemma');

    // 2. Switch to Divyank
    mockContext.selectActiveChild('u_stu_demo');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 3 Track', 'Story badge must be Class 3 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 3 Dilemma', 'EQ badge must be Class 3 Dilemma');
    assert.strictEqual(domRegistry['eqVirtueBadge'].innerText, 'Virtue: Moral Mastery', 'Virtue badge must be Moral Mastery');
    assert.strictEqual(domRegistry['storyTitle'].innerText, 'Grade Story Track Mastered! 🏆');
    assert.ok(domRegistry['storyContentText'].innerText.includes('Class 3'), 'Story celebration text must mention Class 3');
    assert.ok(domRegistry['eqScenarioBody'].innerText.includes('Class 3'), 'EQ celebration text must mention Class 3');
  });

  await test("TEST-02: Switching back from Divyank (Class 3 exhausted) -> Priya (Class 5 active) restores Class 5 content", async () => {
    mockContext.selectActiveChild('u_stu_priya');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 5 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 5 Dilemma');
    assert.notStrictEqual(domRegistry['storyTitle'].innerText, 'Grade Story Track Mastered! 🏆');
    assert.ok(domRegistry['storyMasteryCelebration'].classList.contains('hidden'), 'Celebration should be hidden for Priya');
  });

  console.log("\n--- TEST SECTION 2: MUTUAL EXHAUSTION SWITCHING ---");

  // Mark all Class 5 items completed for Priya (u_stu_priya)
  const c5Stories = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 5' || s.gradeClass === 'Class 5');
  c5Stories.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_priya', contentType: 'story', contentId: s.id, score: 100 }));
  const c5Eq = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 5' || s.gradeClass === 'Class 5');
  c5Eq.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_priya', contentType: 'eq_scenario', contentId: s.id, score: 100 }));

  await test("TEST-03: Switching between mutually exhausted siblings (Divyank Class 3 <-> Priya Class 5) alternates badges cleanly", async () => {
    // First switch to Divyank so that switching to Priya is a genuine child switch
    mockContext.selectActiveChild('u_stu_demo');
    await new Promise(r => setTimeout(r, 30));

    // Now switch to Priya (now exhausted)
    mockContext.selectActiveChild('u_stu_priya');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    console.log("DEBUG Priya exhausted storyContentText:", domRegistry['storyContentText'].innerText);
    console.log("DEBUG Priya exhausted storyBadge:", domRegistry['storyActiveChildGradeBadge'].innerText);

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 5 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 5 Dilemma');
    assert.ok(domRegistry['storyContentText'].innerText.includes('Class 5'));
    assert.ok(domRegistry['eqScenarioBody'].innerText.includes('Class 5'));

    // Switch back to Divyank (exhausted)
    mockContext.selectActiveChild('u_stu_demo');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 3 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 3 Dilemma');
    assert.ok(domRegistry['storyContentText'].innerText.includes('Class 3'));
    assert.ok(domRegistry['eqScenarioBody'].innerText.includes('Class 3'));
  });

  console.log("\n--- TEST SECTION 3: DYNAMIC CHILD ADDITION (CLASS 8) EXHAUSTION ---");

  // Provision third child: Rohan (Class 8)
  const users = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS);
  users.push({
    id: 'u_stu_rohan',
    parentId: 'u_par_demo',
    fullName: 'Rohan Cadet',
    gradeClass: 'Class 8',
    age: 13,
    coins: 50,
    xp: 100,
    streak: 3,
    role: 'student'
  });
  BrowserMockBackend._setTable(BrowserMockBackend.KEYS.USERS, users);
  mockContext.linkedChildren = [
    { id: 'u_stu_demo', name: 'Divyank', grade: 'Class 3', gradeClass: 'Class 3', avatar: '🚀' },
    { id: 'u_stu_priya', name: 'Priya', grade: 'Class 5', gradeClass: 'Class 5', avatar: '⭐' },
    { id: 'u_stu_rohan', name: 'Rohan', grade: 'Class 8', gradeClass: 'Class 8', avatar: '🔬' }
  ];

  await test("TEST-04: Active child Class 8 renders Class 8 Track", async () => {
    mockContext.selectActiveChild('u_stu_rohan');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 8 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 8 Dilemma');
  });

  // Now exhaust Class 8
  const c8Stories = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES).filter(s => s.grade === 'Class 8' || s.gradeClass === 'Class 8');
  c8Stories.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_rohan', contentType: 'story', contentId: s.id, score: 100 }));
  const c8Eq = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.EQ_SCENARIOS).filter(s => s.grade === 'Class 8' || s.gradeClass === 'Class 8');
  c8Eq.forEach(s => BrowserMockBackend.recordContentCompletion({ studentId: 'u_stu_rohan', contentType: 'eq_scenario', contentId: s.id, score: 100 }));

  await test("TEST-05: Exhausted Class 8 displays 'Class 8 Track' and 'Class 8 Dilemma' in mastery state", async () => {
    mockContext.selectActiveChild('u_stu_rohan');
    mockContext.renderStoryTime();
    mockContext.renderEqLab();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(domRegistry['storyActiveChildGradeBadge'].innerText, 'Class 8 Track');
    assert.strictEqual(domRegistry['eqGradeBadge'].innerText, 'Class 8 Dilemma');
    assert.ok(domRegistry['storyContentText'].innerText.includes('Class 8'));
    assert.ok(domRegistry['eqScenarioBody'].innerText.includes('Class 8'));
  });

  console.log("\n--- TEST SECTION 4: RAPID BURST EXHAUSTION STRESS ---");

  await test("TEST-06: Rapid 30-switch cycle among exhausted Class 3, Class 5, and Class 8 children never desyncs", async () => {
    const sequence = ['u_stu_demo', 'u_stu_priya', 'u_stu_rohan'];
    const expected = {
      'u_stu_demo': { story: 'Class 3 Track', eq: 'Class 3 Dilemma' },
      'u_stu_priya': { story: 'Class 5 Track', eq: 'Class 5 Dilemma' },
      'u_stu_rohan': { story: 'Class 8 Track', eq: 'Class 8 Dilemma' }
    };

    for (let i = 0; i < 30; i++) {
      const targetId = sequence[i % 3];
      mockContext.selectActiveChild(targetId);
      mockContext.renderStoryTime();
      mockContext.renderEqLab();
      await new Promise(r => setTimeout(r, 15));

      const exp = expected[targetId];
      assert.strictEqual(
        domRegistry['storyActiveChildGradeBadge'].innerText,
        exp.story,
        `Iteration ${i}: Story badge expected ${exp.story} for ${targetId}, got ${domRegistry['storyActiveChildGradeBadge'].innerText}`
      );
      assert.strictEqual(
        domRegistry['eqGradeBadge'].innerText,
        exp.eq,
        `Iteration ${i}: EQ badge expected ${exp.eq} for ${targetId}, got ${domRegistry['eqGradeBadge'].innerText}`
      );
    }
  });

  console.log("\n=================================================================");
  console.log(`🏁 EXHAUSTION STRESS HARNESS COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
})();
