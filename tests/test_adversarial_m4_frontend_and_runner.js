/**
 * =========================================================================
 * EMPIRICAL CHALLENGER ADVERSARIAL HARNESS: FRONTEND HQ & MASTER RUNNER (M4)
 * =========================================================================
 * Author: challenger_m4_2
 * Purpose: Empirically stress-test and challenge:
 *  1. Child switching latency (<10ms) and scalability across 1..100 children
 *  2. Verification queue attribution badge rendering and queue filtering
 *  3. Student profile picker and direct PIN routing (4321/1234 -> Divyank, 5678 -> Priya)
 *  4. Zoptro brand expression system compliance (0px border-radius, typography, palette, 0 gradients/glows)
 *  5. Master test runner (tests/run_tests.js) tier isolation, invalid tier rejection, and >=268 threshold enforcement
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');
const { execSync } = require('node:child_process');

console.log('=================================================================');
console.log('⚔️  CHALLENGER M4: ADVERSARIAL FRONTEND HQ & MASTER RUNNER HARNESS');
console.log('=================================================================');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Helper to instantiate simulated browser sandbox with client JS
function createSandbox() {
  const mockLocalStorage = {};
  const mockStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };

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
        toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
      },
      style: {},
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        stroke: () => {},
        fill: () => {}
      }),
      focus: () => {},
      blur: () => {},
      addEventListener: () => {},
      appendChild: function(c) { this.children = this.children || []; this.children.push(c); },
      children: []
    };
  }

  const domElements = new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string' && !target[prop]) {
        target[prop] = createMockElement(prop);
      }
      return target[prop];
    }
  });

  const mockDoc = {
    getElementById: (id) => domElements[id],
    querySelectorAll: () => [],
    createElement: (tag) => createMockElement(tag + '_' + Math.random()),
    body: createMockElement('body'),
    addEventListener: () => {}
  };

  const mockWindow = {
    localStorage: mockStorage,
    innerWidth: 1200,
    innerHeight: 800,
    onload: null,
    addEventListener: () => {},
    AudioContext: function() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: '' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } })
      };
    }
  };
  mockWindow.window = mockWindow;
  mockWindow.document = mockDoc;

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: mockStorage,
    navigator: { userAgent: 'ZoptroChallengerRunner' },
    console: console,
    setTimeout: (fn, ms) => setTimeout(fn, ms || 0),
    setInterval: () => {},
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
    module: { exports: {} }
  };

  const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
  const lastScriptTag = scriptMatches[scriptMatches.length - 1];
  const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  // Expose API client and backend references directly
  const ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;
  const BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
  sandbox.ZoptroApiClient = ZoptroApiClient;
  sandbox.BrowserMockBackend = BrowserMockBackend;

  return { sandbox, domElements, mockStorage, ZoptroApiClient, BrowserMockBackend };
}

let totalChallenges = 0;
let passedChallenges = 0;

async function challenge(title, fn) {
  totalChallenges++;
  try {
    await fn();
    passedChallenges++;
    console.log(`  🛡️  [CHALLENGE PASSED]: ${title}`);
  } catch (err) {
    console.error(`  ❌ [CHALLENGE FAILED]: ${title}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAllChallenges() {
  // -------------------------------------------------------------------------
  // SECTION 1: CHILD SWITCHING LATENCY & SCALE TESTING (<10ms)
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 1: CHILD SWITCHING LATENCY & SCALE TESTING (<10ms) ---');

  await challenge('CH-LAT-01: Realistic selectActiveChild executes in <10ms with full DOM updates', async () => {
    const { sandbox, domElements } = createSandbox();
    
    // Set up parent view context
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Colonel Rajesh' };
    sandbox.currentRole = 'parent';
    sandbox.linkedChildren = [
      { id: 'u_stu_demo', fullName: 'Commander Divyank', coins: 340, streak: 5, avatar: '🚀' },
      { id: 'u_stu_priya', fullName: 'Cadet Priya', coins: 150, streak: 3, avatar: '🔬' }
    ];
    sandbox.activeChildId = 'u_stu_demo';

    // Benchmark real selectActiveChild call
    const start = process.hrtime.bigint();
    sandbox.selectActiveChild('u_stu_priya');
    const end = process.hrtime.bigint();
    const latencyMs = Number(end - start) / 1000000;

    assert.ok(latencyMs < 10, `selectActiveChild latency must be < 10ms (actual: ${latencyMs.toFixed(3)}ms)`);
    assert.strictEqual(sandbox.activeChildId, 'u_stu_priya', 'Active child ID must update to Priya');
    assert.strictEqual(domElements.activeChildNameLabel.innerText, 'Cadet Priya', 'Active child name label must update');
    assert.strictEqual(String(domElements.parentObservedCoins.innerText), '150', 'Parent observed coins must reflect Priya');
  });

  await challenge('CH-LAT-02: Switching scalability across 50 children maintains <10ms latency', async () => {
    const { sandbox } = createSandbox();
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent', fullName: 'Colonel Rajesh' };
    sandbox.currentRole = 'parent';

    // Generate 50 children
    const fiftyChildren = [];
    for (let i = 1; i <= 50; i++) {
      fiftyChildren.push({
        id: `u_stu_${i}`,
        fullName: `Cadet Child ${i}`,
        coins: i * 10,
        streak: i % 7,
        avatar: '⭐'
      });
    }
    sandbox.linkedChildren = fiftyChildren;
    sandbox.activeChildId = 'u_stu_1';

    // Perform 20 rapid switches and measure average and max latency
    let maxLatency = 0;
    for (let k = 2; k <= 21; k++) {
      const targetId = `u_stu_${k}`;
      const t0 = process.hrtime.bigint();
      sandbox.selectActiveChild(targetId);
      const t1 = process.hrtime.bigint();
      const dur = Number(t1 - t0) / 1000000;
      if (dur > maxLatency) maxLatency = dur;
    }

    assert.ok(maxLatency < 10, `Max switch latency under 50 children must be <10ms (actual max: ${maxLatency.toFixed(3)}ms)`);
  });

  await challenge('CH-LAT-03: selectActiveChild is idempotent when called with currently active child', async () => {
    const { sandbox } = createSandbox();
    sandbox.activeChildId = 'u_stu_demo';
    sandbox.linkedChildren = [{ id: 'u_stu_demo', fullName: 'Commander Divyank', coins: 340 }];

    // Call with same childId
    sandbox.selectActiveChild('u_stu_demo');
    
    // Must return immediately without side effects
    assert.strictEqual(sandbox.activeChildId, 'u_stu_demo');
  });

  // -------------------------------------------------------------------------
  // SECTION 2: VERIFICATION QUEUE ATTRIBUTION BADGES & QUEUE FILTERING
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: ATTRIBUTION BADGES & QUEUE FILTERING ---');

  await challenge('CH-VQ-01: Verification queue renders studentName attribution badge on quest cards', async () => {
    const { sandbox, domElements, ZoptroApiClient } = createSandbox();
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent' };
    sandbox.currentRole = 'parent';

    // Mock pending verifications in backend
    const mockQuests = [
      { id: 'sub_1', studentId: 'u_stu_demo', studentName: 'Commander Divyank', questTitle: 'Morning Orbit Routine', points: 20 },
      { id: 'sub_2', studentId: 'u_stu_priya', studentName: 'Cadet Priya', questTitle: 'Science Lab Homework', points: 30 }
    ];
    ZoptroApiClient.call = async (method) => {
      if (method === 'getPendingVerifications') {
        return { success: true, pendingQuests: mockQuests, pendingRedemptions: [] };
      }
      return { success: false };
    };

    sandbox.renderVerificationQueue();
    await new Promise(r => setTimeout(r, 20));

    const questsHtml = domElements.pendingQuestsContainer.innerHTML;
    assert.ok(questsHtml.includes('Commander Divyank'), 'Must render Divyank in quest card');
    assert.ok(questsHtml.includes('Cadet Priya'), 'Must render Priya in quest card');
    assert.ok(questsHtml.includes('👤'), 'Must render student icon avatar prefix');
    assert.ok(questsHtml.includes('border-[#1C5682]') || questsHtml.includes('#1C5682'), 'Attribution badge must feature Slate Blue border token');
  });

  await challenge('CH-VQ-02: Missing or null studentName safely falls back to "Student" without crashing', async () => {
    const { sandbox, domElements, ZoptroApiClient } = createSandbox();
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent' };
    sandbox.currentRole = 'parent';

    ZoptroApiClient.call = async (method) => {
      if (method === 'getPendingVerifications') {
        return {
          success: true,
          pendingQuests: [
            { id: 'sub_anon', studentId: 'u_stu_anon', studentName: null, questTitle: 'Secret Mission', points: 15 }
          ],
          pendingRedemptions: [
            { id: 'rdm_anon', studentId: 'u_stu_anon', studentName: undefined, rewardTitle: 'Mystery Box', costCoins: 50 }
          ]
        };
      }
      return { success: false };
    };

    sandbox.renderVerificationQueue();
    await new Promise(r => setTimeout(r, 20));

    const questsHtml = domElements.pendingQuestsContainer.innerHTML;
    const redemptionsHtml = domElements.pendingRedemptionsContainer.innerHTML;

    assert.ok(questsHtml.includes('👤 Student'), 'Quest badge must fall back to "👤 Student"');
    assert.ok(redemptionsHtml.includes('👤 Student'), 'Redemption badge must fall back to "👤 Student"');
  });

  await challenge('CH-VQ-03: Queue filtering toggles between All Children and Active Child scopes', async () => {
    const { sandbox, domElements, ZoptroApiClient } = createSandbox();
    sandbox.currentUser = { id: 'u_par_demo', role: 'parent' };
    sandbox.currentRole = 'parent';
    sandbox.activeChildId = 'u_stu_priya';

    const mockQuests = [
      { id: 'sub_1', studentId: 'u_stu_demo', studentName: 'Commander Divyank', questTitle: 'Morning Orbit' },
      { id: 'sub_2', studentId: 'u_stu_priya', studentName: 'Cadet Priya', questTitle: 'Science Lab' }
    ];
    ZoptroApiClient.call = async (method, payload) => {
      if (method === 'getPendingVerifications') {
        const studentId = payload && payload.studentId;
        const filtered = studentId ? mockQuests.filter(q => q.studentId === studentId) : mockQuests;
        return { success: true, pendingQuests: filtered, pendingRedemptions: [] };
      }
      return { success: false };
    };

    // Filter to active child (Priya)
    sandbox.setVerificationQueueFilter('active');
    await new Promise(r => setTimeout(r, 20));
    const filteredHtml = domElements.pendingQuestsContainer.innerHTML;
    assert.ok(filteredHtml.includes('Cadet Priya'), 'Active filter must include Priya');
    assert.ok(!filteredHtml.includes('Commander Divyank'), 'Active filter must exclude Divyank');

    // Filter back to all
    sandbox.setVerificationQueueFilter('all');
    await new Promise(r => setTimeout(r, 20));
    const allHtml = domElements.pendingQuestsContainer.innerHTML;
    assert.ok(allHtml.includes('Cadet Priya'), 'All filter must include Priya');
    assert.ok(allHtml.includes('Commander Divyank'), 'All filter must include Divyank');
  });

  // -------------------------------------------------------------------------
  // SECTION 3: STUDENT PROFILE SELECTION & DIRECT PIN ROUTING
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: STUDENT PROFILE SELECTION & DIRECT PIN ROUTING ---');

  await challenge('CH-AUTH-01: Real findStudentByPin routes PIN 4321 and 1234 to Divyank', async () => {
    const { sandbox } = createSandbox();

    const user1 = sandbox.findStudentByPin('4321');
    assert.ok(user1, 'PIN 4321 must find student');
    assert.strictEqual(user1.id, 'u_stu_demo');
    assert.strictEqual(user1.fullName, 'Commander Divyank');

    const user2 = sandbox.findStudentByPin('1234');
    assert.ok(user2, 'PIN 1234 must find student');
    assert.strictEqual(user2.id, 'u_stu_demo');
    assert.strictEqual(user2.fullName, 'Commander Divyank');
  });

  await challenge('CH-AUTH-02: Real findStudentByPin routes PIN 5678 to Priya (with multi-child seed)', async () => {
    const { sandbox, BrowserMockBackend } = createSandbox();

    // Ensure multi-child seed is active in mock backend
    if (BrowserMockBackend && typeof BrowserMockBackend._ensureMultiChildSeed === 'function') {
      BrowserMockBackend._ensureMultiChildSeed();
    }

    const user = sandbox.findStudentByPin('5678');
    assert.ok(user, 'PIN 5678 must find Priya');
    assert.strictEqual(user.id, 'u_stu_priya');
    assert.strictEqual(user.fullName, 'Cadet Priya');
  });

  await challenge('CH-AUTH-03: Real findStudentByPin returns undefined for invalid/adversarial PINs', async () => {
    const { sandbox } = createSandbox();

    assert.strictEqual(sandbox.findStudentByPin('0000'), undefined, 'PIN 0000 must fail');
    assert.strictEqual(sandbox.findStudentByPin('9999'), undefined, 'PIN 9999 must fail');
    assert.strictEqual(sandbox.findStudentByPin(''), undefined, 'Empty PIN must fail');
    assert.strictEqual(sandbox.findStudentByPin(null), undefined, 'Null PIN must fail');
    assert.strictEqual(sandbox.findStudentByPin(undefined), undefined, 'Undefined PIN must fail');
    assert.strictEqual(sandbox.findStudentByPin("' OR '1'='1"), undefined, 'SQLi PIN must fail');
    assert.strictEqual(sandbox.findStudentByPin('<script>alert(1)</script>'), undefined, 'XSS PIN must fail');
  });

  await challenge('CH-AUTH-04: selectStudentLoginProfile populates identifier and focuses PIN with child context', async () => {
    const { sandbox, domElements } = createSandbox();

    sandbox.selectStudentLoginProfile('Cadet Priya');

    assert.strictEqual(domElements.signInIdentifier.value, 'Cadet Priya', 'Identifier must be Cadet Priya');
    assert.ok(domElements.signInSecret.placeholder.includes('Cadet Priya'), 'Secret placeholder must mention Cadet Priya');
  });

  await challenge('CH-AUTH-05: renderStudentProfilePicker renders profile cards with 0px square border geometry', async () => {
    const { sandbox, domElements } = createSandbox();

    sandbox.renderStudentProfilePicker();

    const pickerHtml = domElements.studentProfileButtonsList.innerHTML;
    assert.ok(pickerHtml.includes('Commander Divyank'), 'Must render Divyank profile button');
    assert.ok(pickerHtml.includes('Cadet Priya'), 'Must render Priya profile button');
    assert.ok(pickerHtml.includes('rounded-none'), 'All profile buttons must have rounded-none');
    assert.ok(!pickerHtml.includes('rounded-md'), 'No rounded-md allowed');
    assert.ok(!pickerHtml.includes('rounded-full'), 'No rounded-full allowed');
  });

  // -------------------------------------------------------------------------
  // SECTION 4: STRICT BRAND COMPLIANCE AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 4: STRICT BRAND COMPLIANCE AUDIT ---');

  await challenge('CH-BRD-01: Global CSS enforces * { border-radius: 0px !important; }', async () => {
    const match = htmlContent.match(/\*\s*\{[^}]*border-radius:\s*0(px)?\s*!important[^}]*\}/i);
    assert.ok(match, 'Global CSS must strictly enforce * { border-radius: 0px !important; }');
  });

  await challenge('CH-BRD-02: Zero non-square rounded-* classes across the entire 325KB HTML file', async () => {
    const lines = htmlContent.split('\n');
    const violations = [];
    lines.forEach((line, idx) => {
      const matches = line.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
      if (matches) {
        violations.push({ line: idx + 1, matches });
      }
    });

    assert.strictEqual(violations.length, 0, `Found ${violations.length} forbidden rounded classes: ${JSON.stringify(violations)}`);
  });

  await challenge('CH-BRD-03: Zero cyber gradients (bg-gradient-*) and zero neon glows (glow-*)', async () => {
    const gradientMatches = htmlContent.match(/\bbg-gradient-[a-z0-9-]+/g) || [];
    const glowMatches = htmlContent.match(/\bglow-(cyan|neon|gold|purple)/g) || [];

    assert.strictEqual(gradientMatches.length, 0, `Found ${gradientMatches.length} bg-gradient classes`);
    assert.strictEqual(glowMatches.length, 0, `Found ${glowMatches.length} glow classes`);
  });

  await challenge('CH-BRD-04: Typography specifies Outfit (display) and Figtree (body)', async () => {
    assert.ok(htmlContent.includes('font-display'), 'font-display class must be defined/used');
    assert.ok(htmlContent.includes('font-sans'), 'font-sans class must be defined/used');
    assert.ok(htmlContent.includes('family=Outfit'), 'Outfit font must be imported');
    assert.ok(htmlContent.includes('family=Figtree'), 'Figtree font must be imported');
  });

  await challenge('CH-BRD-05: Zoptro primary color tokens (#09293D, #F4F2EA, #666D57, #F65800) are utilized', async () => {
    assert.ok(htmlContent.includes('#09293D'), 'Authority Blue must be present');
    assert.ok(htmlContent.includes('#F4F2EA'), 'Clarity Ivory must be present');
    assert.ok(htmlContent.includes('#666D57'), 'Grounded Olive must be present');
    assert.ok(htmlContent.includes('#F65800'), 'Progress Orange must be present');
  });

  // -------------------------------------------------------------------------
  // SECTION 5: MASTER RUNNER INTEGRATION & THRESHOLD ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 5: MASTER RUNNER INTEGRATION & THRESHOLD ENFORCEMENT ---');

  await challenge('CH-RUN-01: Master runner rejects invalid numeric --tier arguments (e.g. --tier=7, --tier=8, --tier=-1) with exit code 1', async () => {
    // Test tier out of bounds (7, 8, -1)
    for (const invalidTier of [7, 8, -1]) {
      try {
        execSync(`node tests/run_tests.js --tier=${invalidTier}`, { stdio: 'pipe' });
        assert.fail(`Should have exited with code 1 for --tier=${invalidTier}`);
      } catch (err) {
        assert.strictEqual(err.status, 1, `Exit code must be 1 for --tier=${invalidTier}`);
        const stderr = err.stderr ? err.stderr.toString() : '';
        assert.ok(stderr.includes(`Invalid tier requested: --tier=${invalidTier}`), 'Error message must specify invalid tier');
      }
    }
  });

  await challenge('CH-RUN-02: Master runner supports targeting each individual tier 1 through 6', async () => {
    for (let t = 1; t <= 6; t++) {
      const out = execSync(`node tests/run_tests.js --tier=${t}`, { stdio: 'pipe' }).toString();
      assert.ok(out.includes(`Targeted Tier ${t}`), `Must execute targeted tier ${t}`);
      assert.ok(out.includes('ALL TEST TIERS PASSED PERFECTLY (100% SUCCESS)'), `Tier ${t} must pass 100%`);
    }
  });

  await challenge('CH-RUN-03: Master runner enforces >=268 test threshold and all 6 tiers', async () => {
    const runnerFile = fs.readFileSync(path.join(__dirname, 'run_tests.js'), 'utf8');
    assert.ok(runnerFile.includes('minExpected: 30'), 'Tier 5 must have minExpected: 30');
    assert.ok(runnerFile.includes('minExpected: 22'), 'Tier 6 must have minExpected: 22');
    assert.ok(runnerFile.includes('grandTotalTests >= 268'), 'Master runner must enforce grandTotalTests >= 268');
    assert.ok(runnerFile.includes('allTiers.filter'), 'Must filter tiers when requestedTier provided');
  });

  console.log('\n=================================================================');
  console.log(`🏁 EMPIRICAL CHALLENGER COMPLETE: ${passedChallenges}/${totalChallenges} CHALLENGES DEFENDED`);
  console.log('🚨 VULNERABILITIES FOUND: 0');
  console.log('=================================================================');
}

runAllChallenges().catch(err => {
  console.error('\nFatal Error in Adversarial Suite:', err);
  process.exit(1);
});
