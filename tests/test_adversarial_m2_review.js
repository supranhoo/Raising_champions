const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("⚔️  STARTING REVIEWER ADVERSARIAL STRESS TEST FOR MILESTONE 2");
console.log("=================================================================\n");

const htmlFilePath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// 1. Check for integrity shortcuts or cheating
console.log("--- 1. INTEGRITY & ZERO HARDCODING INTEGRITY SCAN ---");

const suspiciousPatterns = [
  { name: 'Hardcoded test bypass', regex: /if\s*\([^)]*===\s*['"]The Stargazer of Ladakh['"]\)/ },
  { name: 'Hardcoded test token bypass', regex: /if\s*\([^)]*===\s*['"]u_adm_demo['"]\s*&&\s*test/ },
  { name: 'Mock fake pass-through', regex: /function\s+saveAdminContentItem\s*\([^)]*\)\s*\{\s*return\s*\{[^}]*success:\s*true/ },
  { name: 'const currentStory', regex: /const\s+currentStory\s*=/ },
  { name: 'let currentStory', regex: /let\s+currentStory\s*=/ },
  { name: 'var currentStory', regex: /var\s+currentStory\s*=/ },
  { name: 'const dailyGkDatabase', regex: /const\s+dailyGkDatabase\s*=/ },
  { name: 'const competitiveExamsData', regex: /const\s+competitiveExamsData\s*=/ },
  { name: 'const newsArticles', regex: /const\s+newsArticles\s*=/ }
];

suspiciousPatterns.forEach(p => {
  const match = htmlContent.match(p.regex);
  if (match) {
    console.error(`  🚨 VIOLATION FOUND: ${p.name}`);
    process.exit(1);
  } else {
    console.log(`  🛡️  CLEAN: No occurrences of ${p.name}`);
  }
});

// 2. Setup mock environment and load script
const scriptMatches = htmlContent.match(/<script>([\s\S]*?)<\/script>/g);
const scriptCode = scriptMatches[scriptMatches.length - 1].replace('<script>', '').replace('</script>', '');

const mockExports = {};
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
      createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
      createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
    };
  },
  addEventListener: () => {}
};

const mockDocument = {
  getElementById: () => ({
    getContext: () => ({ clearRect: () => {}, save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, fillRect: () => {} }),
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    innerText: '',
    innerHTML: '',
    value: '',
    style: {},
    setAttribute: () => {},
    appendChild: () => {},
    insertBefore: () => {},
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  createElement: () => ({
    classList: { add: () => {}, remove: () => {} },
    innerText: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    setAttribute: () => {}
  }),
  body: { appendChild: () => {} }
};

const mockContext = {
  module: { exports: mockExports },
  exports: mockExports,
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

const BrowserMockBackend = mockContext.window.BrowserMockBackend || mockExports.BrowserMockBackend;
const ZoptroApiClient = mockContext.window.ZoptroApiClient || mockExports.ZoptroApiClient;

BrowserMockBackend.init(true);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAdversarialTests() {
  console.log("\n--- 2. ADVERSARIAL ROLE & PRIVILEGE ESCALATION ATTACKS ---");

  test("ADV-01: Non-admin student cannot invoke saveAdminContentItem", () => {
    const res = BrowserMockBackend.saveAdminContentItem({
      adminUserId: "u_stu_demo",
      contentType: "Stories",
      itemData: { title: "Malicious Hack Story", grade: "Class 3" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  test("ADV-02: Parent cannot invoke toggleContentActiveStatus", () => {
    const res = BrowserMockBackend.toggleContentActiveStatus({
      adminUserId: "u_par_demo",
      contentType: "Stories",
      itemId: "story_c3_1",
      isActive: false
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  test("ADV-03: Null/undefined adminUserId is blocked on deleteAdminContentItem", () => {
    const res = BrowserMockBackend.deleteAdminContentItem({
      adminUserId: null,
      contentType: "Stories",
      itemId: "story_c3_1"
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  console.log("\n--- 3. CROSS-GRADE LEAKAGE & ANTI-TAMPERING ATTACKS ---");

  test("ADV-04: Student enrolled in Class 3 attempting recordContentCompletion on Class 8 quiz is blocked", () => {
    const res = BrowserMockBackend.recordContentCompletion({
      studentId: "u_stu_demo", // enrolled in Class 3
      contentType: "CurriculumQuizzes",
      contentId: "quiz_c8_1", // Class 8
      score: 100
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 400);
    assert.ok(res.error.includes("GRADE_MISMATCH"));
  });

  test("ADV-05: getNextContentItem strictly serves enrolled Class 3 story despite requesting Class 10", () => {
    const res = BrowserMockBackend.getNextContentItem({
      studentId: "u_stu_demo",
      contentType: "Stories",
      grade: "Class 10" // Forged grade override attempt
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.grade, "Class 3");
    assert.strictEqual(res.item.gradeClass, "Class 3");
  });

  test("ADV-06: getContentByGrade rejects forged targetGrade for student", () => {
    const res = BrowserMockBackend.getContentByGrade({
      studentId: "u_stu_demo",
      contentType: "DailyKnowledge",
      targetGrade: "Class 9"
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "GRADE_MISMATCH_FORBIDDEN");
  });

  console.log("\n--- 4. ECONOMIC INVARIANTS & DOUBLE-COMPLETION RESILIENCE ---");

  await testAsync("ADV-07: Double submission of same item awards ZERO additional coins & XP", async () => {
    const studentBefore = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo');
    const coinsBefore = studentBefore.coins;

    const first = BrowserMockBackend.recordContentCompletion({
      studentId: "u_stu_demo",
      contentType: "Stories",
      contentId: "story_c3_1",
      score: 100
    });
    assert.strictEqual(first.success, true);
    assert.ok(first.coinsAwarded > 0);

    const studentMid = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo');
    const coinsMid = studentMid.coins;
    assert.strictEqual(coinsMid, coinsBefore + first.coinsAwarded);

    // Replay attack
    const second = BrowserMockBackend.recordContentCompletion({
      studentId: "u_stu_demo",
      contentType: "Stories",
      contentId: "story_c3_1",
      score: 100
    });
    assert.strictEqual(second.success, true);
    assert.strictEqual(second.duplicate, true);
    assert.strictEqual(second.coinsAwarded, 0);
    assert.strictEqual(second.xpAwarded, 0);

    const studentAfter = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.USERS).find(u => u.id === 'u_stu_demo');
    assert.strictEqual(studentAfter.coins, coinsMid, "Wallet coins must NOT increase on duplicate completion");
  });

  console.log("\n--- 5. FAMILY GOVERNANCE & SIBLING ISOLATION ---");

  test("ADV-08: Stranger parent cannot update governance of another parent's child", () => {
    const res = BrowserMockBackend.updateChildGovernance({
      parentUserId: "u_par_stranger",
      studentId: "u_stu_demo",
      updates: { gradeClass: "Class 10" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  test("ADV-09: Student cannot update own child governance", () => {
    const res = BrowserMockBackend.updateChildGovernance({
      parentUserId: "u_stu_demo",
      studentId: "u_stu_demo",
      updates: { gradeClass: "Class 10" }
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 403);
  });

  console.log("\n--- 6. SCHEMA SELF-HEALING & CORRUPTION RESILIENCE ---");

  test("ADV-10: Corrupted content tables self-heal without crashing", () => {
    mockWindow.localStorage.setItem(BrowserMockBackend.KEYS.STORIES, "invalid-json{{[");
    BrowserMockBackend.selfHealSchema();
    const healed = BrowserMockBackend._getTable(BrowserMockBackend.KEYS.STORIES);
    assert.ok(Array.isArray(healed));
    assert.ok(healed.length >= 10, "Stories must restore seed data upon self-heal");
  });

  console.log("\n=================================================================");
  console.log(`🏁 ADVERSARIAL STRESS SUITE: ${passed}/${passed + failed} TESTS PASSED`);
  if (failed > 0) {
    console.error(`💥 ${failed} ADVERSARIAL FAILURES FOUND`);
    process.exit(1);
  } else {
    console.log("🎉 ALL ADVERSARIAL ATTACKS DEFENDED (100% PASS)!");
    console.log("=================================================================\n");
  }
}

runAdversarialTests().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
