/**
 * =========================================================================
 * CHALLENGER 2 MILESTONE 3 ADVERSARIAL STRESS SUITE
 * =========================================================================
 * Empirical adversarial verification of:
 * - Requirement R4: Longitudinal Student Growth Profile
 * - Requirement R5: Parent HQ Multi-Child Switcher & Governance
 * Target File: divyank_mission_control_google_apps_script_app.html
 *
 * Attack Vectors:
 * 1. High-Frequency Active Child Switching Stress Test
 *    - 150 rapid sequential switches across multiple children
 *    - Strict SLA benchmark: <10ms per in-memory switch
 *    - 100% UI element synchronization (activeChildNameLabel, parentObservedCoins,
 *      awardTargetChildNameLabel, securityTargetChildNameLabel, headerActiveChildSelect,
 *      longitudinalChildNameBadge, governanceTargetChildNameLabel)
 *    - Race condition resistance & state isolation across siblings
 *
 * 2. Longitudinal Growth Analytics Stress & Boundary Tests
 *    - Cold-Start / Empty State: 0 historical events, displays #longitudinalEmptyState gracefully
 *    - Extreme Time-Series: 1-day single data point, 365-day dense dataset
 *    - Extreme Metrics: 0-value baseline (no div-by-zero), 100% maximum bounds
 *    - Mathematical scaling: zero NaN, undefined, or Infinity across <svg>, <polyline>, <rect>
 *    - Filter Interaction Stress: rapid toggling of time ranges ('7d', '14d', '30d', 'all')
 *      and metrics ('all', 'focus', 'habit', 'habits', 'academic', 'eq')
 *
 * 3. Child Governance & Curriculum Cross-Alignment Attack
 *    - Grade promotion: Class 3 -> Class 7 via submitChildGovernanceUpdate()
 *    - Backend persistence verification in USERS table
 *    - Immediate reload via refreshDynamicContentForActiveChild()
 *    - 0% cross-grade leakage: 100% Class 7 content served, 0% Class 3 content served
 *    - Anti-forgery enforcement: cross-grade mismatch rejection (403)
 *    - Validation attacks: rejection of invalid grade ('Class 99'), negative age (-5),
 *      non-numeric age ('abc'), toddler age (2), adult age (25), empty name ('')
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=================================================================');
console.log('⚔️  CHALLENGER 2: M3 ADVERSARIAL STRESS & ATTACK SUITE');
console.log('    R4 (Longitudinal Growth Profile) & R5 (Parent HQ Governance)');
console.log('=================================================================\n');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract main application script
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const appScriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];
const testRegistry = [];

function registerTest(name, fn, isAsync = false) {
  testRegistry.push({ name, fn, isAsync });
}

function test(name, fn) {
  registerTest(name, fn, false);
}

function testAsync(name, fn) {
  registerTest(name, fn, true);
}

// -------------------------------------------------------------------------
// SIMULATED BROWSER ENVIRONMENT FACTORY
// -------------------------------------------------------------------------
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
    navigator: { userAgent: 'ZoptroChallenger2M3' },
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

  // Initialize Parent session by default for M3 Parent HQ testing
  vm.runInContext(`
    currentUser = {
      id: 'u_par_demo',
      role: 'parent',
      fullName: 'Commander Parent',
      email: 'parent@zoptro.com'
    };
    currentRole = 'parent';
    linkedChildren = DEFAULT_STUDENT_PROFILES.slice();
    activeChildId = linkedChildren[0].id;
    updateActiveChildDisplay();
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

// =========================================================================
// VECTOR 1: HIGH-FREQUENCY ACTIVE CHILD SWITCHING STRESS TEST
// =========================================================================
test('V1-01: 150 rapid sequential child switches strictly meet <10ms in-memory SLA per switch', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });

  // Add a 3rd child to linkedChildren to stress 3-way switching
  env.runInCtx(`
    linkedChildren.push({
      id: 'u_stu_arjun',
      role: 'student',
      fullName: 'Cadet Arjun',
      gradeClass: 'Class 7',
      age: 12,
      parentalPermissions: { allowRewardRedemption: true, allowCustomHabits: true },
      coins: 450,
      xp: 900,
      level: 4,
      streak: 7,
      avatar: '🌟',
      pin: '9999',
      linkedParentId: 'u_par_demo'
    });
  `);

  const threeKids = ['u_stu_demo', 'u_stu_priya', 'u_stu_arjun'];
  const durations = [];

  for (let i = 0; i < 150; i++) {
    const target = threeKids[i % 3];
    const t0 = process.hrtime.bigint();
    env.runInCtx(`selectActiveChild('${target}')`);
    const t1 = process.hrtime.bigint();
    const durationMs = Number(t1 - t0) / 1000000;
    durations.push(durationMs);

    assert.ok(
      durationMs < 10,
      `Switch #${i + 1} to ${target} exceeded 10ms SLA: took ${durationMs.toFixed(3)}ms`
    );
  }

  const maxMs = Math.max(...durations);
  const minMs = Math.min(...durations);
  const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
  durations.sort((a, b) => a - b);
  const p99Ms = durations[Math.floor(durations.length * 0.99)];

  console.log(`     [Benchmark] 150 Switches: Min=${minMs.toFixed(3)}ms, Avg=${avgMs.toFixed(3)}ms, P99=${p99Ms.toFixed(3)}ms, Max=${maxMs.toFixed(3)}ms (Threshold: <10ms)`);
  assert.ok(maxMs < 10, `Maximum switch latency must be <10ms, was ${maxMs.toFixed(3)}ms`);
});

test('V1-02: 100% UI element targeting synchronization across all rapid switches without lag or drift', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });
  const kids = ['u_stu_priya', 'u_stu_demo'];

  for (let i = 0; i < 120; i++) {
    const target = kids[i % 2];
    env.runInCtx(`selectActiveChild('${target}')`);

    const linked = env.runInCtx('linkedChildren');
    const expectedChild = linked.find(c => c.id === target);
    assert.ok(expectedChild, `Expected child ${target} must exist in linkedChildren`);

    // 1. activeChildNameLabel
    assert.strictEqual(
      env.getEl('activeChildNameLabel').innerText,
      expectedChild.fullName,
      `Cycle ${i}: activeChildNameLabel mismatch`
    );

    // 2. parentObservedCoins
    assert.strictEqual(
      String(env.getEl('parentObservedCoins').innerText),
      String(expectedChild.coins),
      `Cycle ${i}: parentObservedCoins mismatch`
    );

    // 3. awardTargetChildNameLabel
    assert.strictEqual(
      env.getEl('awardTargetChildNameLabel').innerText,
      expectedChild.fullName,
      `Cycle ${i}: awardTargetChildNameLabel mismatch`
    );

    // 4. securityTargetChildNameLabel
    assert.strictEqual(
      env.getEl('securityTargetChildNameLabel').innerText,
      expectedChild.fullName,
      `Cycle ${i}: securityTargetChildNameLabel mismatch`
    );

    // 5. headerActiveChildSelect
    assert.strictEqual(
      env.getEl('headerActiveChildSelect').value,
      target,
      `Cycle ${i}: headerActiveChildSelect value mismatch`
    );

    // 6. longitudinalChildNameBadge
    const expectedBadge = expectedChild.fullName + ' (' + (expectedChild.gradeClass || expectedChild.grade || 'Class 3') + ')';
    assert.strictEqual(
      env.getEl('longitudinalChildNameBadge').innerText,
      expectedBadge,
      `Cycle ${i}: longitudinalChildNameBadge mismatch`
    );

    // 7. governanceTargetChildNameLabel
    assert.strictEqual(
      env.getEl('governanceTargetChildNameLabel').innerText,
      expectedChild.fullName,
      `Cycle ${i}: governanceTargetChildNameLabel mismatch`
    );
  }
});

testAsync('V1-03: Asynchronous race condition resistance under rapid concurrent child switching', async () => {
  const env = createSimulatedEnvironment();
  const kids = ['u_stu_demo', 'u_stu_priya'];

  // Rapidly trigger 20 alternating switches without waiting for background microtasks
  for (let i = 0; i < 20; i++) {
    env.runInCtx(`selectActiveChild('${kids[i % 2]}')`);
  }

  // Force the final deliberate switch to Cadet Priya
  env.runInCtx(`selectActiveChild('u_stu_priya')`);

  // Wait 60ms for any queued async promises (e.g. loadLongitudinalProfile) to resolve
  await new Promise(r => setTimeout(r, 60));

  const finalActiveId = env.runInCtx('activeChildId');
  assert.strictEqual(finalActiveId, 'u_stu_priya', 'Final activeChildId must be u_stu_priya');

  // Verify that late-resolving promises did not corrupt or revert active child UI targeting
  assert.strictEqual(env.getEl('activeChildNameLabel').innerText, 'Cadet Priya');
  assert.strictEqual(String(env.getEl('parentObservedCoins').innerText), '85');
  assert.strictEqual(env.getEl('awardTargetChildNameLabel').innerText, 'Cadet Priya');
  assert.strictEqual(env.getEl('securityTargetChildNameLabel').innerText, 'Cadet Priya');
  assert.strictEqual(env.getEl('headerActiveChildSelect').value, 'u_stu_priya');
  assert.ok(env.getEl('longitudinalChildNameBadge').innerText.includes('Cadet Priya'));
});

test('V1-04: Multi-child memory integrity: sibling balances and grade assignments remain strictly isolated', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });

  // 1. Initial balances
  const initialChildren = env.runInCtx('linkedChildren.map(c => ({ id: c.id, coins: c.coins, grade: c.gradeClass }))');
  const divyankInitial = initialChildren.find(c => c.id === 'u_stu_demo');
  const priyaInitial = initialChildren.find(c => c.id === 'u_stu_priya');

  assert.strictEqual(divyankInitial.coins, 340);
  assert.strictEqual(priyaInitial.coins, 85);
  assert.strictEqual(divyankInitial.grade, 'Class 3');
  assert.strictEqual(priyaInitial.grade, 'Class 5');

  // 2. Select Divyank and mutate his coins
  env.runInCtx(`
    selectActiveChild('u_stu_demo');
    const child = linkedChildren.find(c => c.id === 'u_stu_demo');
    child.coins += 100;
    updateActiveChildDisplay();
  `);

  assert.strictEqual(env.getEl('parentObservedCoins').innerText, 440);

  // 3. Switch to Priya
  env.runInCtx(`selectActiveChild('u_stu_priya');`);
  assert.strictEqual(env.getEl('parentObservedCoins').innerText, 85, "Priya's coins must be unaffected by Divyank's modification");

  // 4. Switch back to Divyank
  env.runInCtx(`selectActiveChild('u_stu_demo');`);
  assert.strictEqual(env.getEl('parentObservedCoins').innerText, 440);
});

// =========================================================================
// VECTOR 2: LONGITUDINAL GROWTH ANALYTICS STRESS & BOUNDARY TESTS
// =========================================================================
test('V2-01: Cold-start / Empty state: brand new student with 0 historical events renders #longitudinalEmptyState gracefully', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });

  // 1. Empty array []
  assert.doesNotThrow(() => {
    env.runInCtx(`renderLongitudinalSvgChart([], 'all')`);
  }, 'renderLongitudinalSvgChart with empty array must not throw');

  assert.strictEqual(env.getEl('longitudinalSvgChart').innerHTML, '', 'SVG must be cleared on empty data');
  assert.ok(
    !env.getEl('longitudinalEmptyState').classList.contains('hidden'),
    '#longitudinalEmptyState must be visible (hidden class removed)'
  );

  // 2. Null input
  assert.doesNotThrow(() => {
    env.runInCtx(`renderLongitudinalSvgChart(null, 'all')`);
  }, 'renderLongitudinalSvgChart with null must not throw');
  assert.strictEqual(env.getEl('longitudinalSvgChart').innerHTML, '');
  assert.ok(!env.getEl('longitudinalEmptyState').classList.contains('hidden'));

  // 3. Undefined input
  assert.doesNotThrow(() => {
    env.runInCtx(`renderLongitudinalSvgChart(undefined, 'academic')`);
  }, 'renderLongitudinalSvgChart with undefined must not throw');
  assert.strictEqual(env.getEl('longitudinalSvgChart').innerHTML, '');
  assert.ok(!env.getEl('longitudinalEmptyState').classList.contains('hidden'));
});

test('V2-02: Extreme Time-Series: 1-day single data point (n=1) produces valid SVG coordinates without division by zero', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });
  const singleDayData = [
    { date: '2026-11-05', focusMinutes: 45, habitRate: 85, academicScore: 92, eqScore: 78 }
  ];

  env.sandbox.singleDayData = singleDayData;
  env.runInCtx(`renderLongitudinalSvgChart(singleDayData, 'all')`);

  const svgContent = env.getEl('longitudinalSvgChart').innerHTML;
  assert.ok(svgContent.length > 0, 'SVG content must not be empty');

  // Verify empty state is hidden
  assert.ok(
    env.getEl('longitudinalEmptyState').classList.contains('hidden'),
    '#longitudinalEmptyState must be hidden when data is present'
  );

  // Verify NO occurrence of NaN, undefined, or Infinity anywhere in the SVG markup
  assert.ok(!svgContent.includes('NaN'), 'SVG must not contain NaN coordinates');
  assert.ok(!svgContent.includes('undefined'), 'SVG must not contain undefined coordinates');
  assert.ok(!svgContent.includes('Infinity'), 'SVG must not contain Infinity coordinates');

  // Verify single-point mathematical placement: centered x = padLeft + plotWidth/2 = 45 + 695/2 = 392.5
  assert.ok(svgContent.includes('392.5'), 'Single point x coordinate must be centered at 392.5');
  assert.ok(svgContent.includes('<polyline points="392.5,'), 'Polyline points must start with valid single coordinate');
  assert.ok(svgContent.includes('<rect'), 'Data markers must be rendered as square rects');
});

test('V2-03: Extreme Time-Series: 365-day dense dataset mathematical scaling audit (0 NaN/Infinity, bounds verified)', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });

  // Generate 365-day dense dataset
  const denseData = [];
  const baseDate = new Date('2025-11-05');
  for (let i = 0; i < 365; i++) {
    const cur = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    denseData.push({
      date: cur.toISOString().substring(0, 10),
      focusMinutes: (i * 7) % 180,
      habitRate: (i * 3 + 20) % 100,
      academicScore: 50 + ((i * 5) % 50),
      eqScore: 60 + ((i * 2) % 40)
    });
  }

  env.sandbox.denseData = denseData;

  const metricsToTest = ['all', 'focus', 'academic', 'habit', 'eq'];
  metricsToTest.forEach(metric => {
    env.runInCtx(`renderLongitudinalSvgChart(denseData, '${metric}')`);
    const svg = env.getEl('longitudinalSvgChart').innerHTML;

    assert.ok(svg.length > 0, `SVG for metric '${metric}' must have content`);
    assert.ok(!svg.includes('NaN'), `Metric '${metric}': SVG contains NaN`);
    assert.ok(!svg.includes('undefined'), `Metric '${metric}': SVG contains undefined`);
    assert.ok(!svg.includes('Infinity'), `Metric '${metric}': SVG contains Infinity`);

    // Verify coordinates stay within SVG canvas boundaries (width=760, height=260)
    const polylineMatches = svg.matchAll(/<polyline points="([^"]+)"/g);
    for (const match of polylineMatches) {
      const points = match[1].trim().split(/\s+/);
      assert.strictEqual(points.length, 365, `Polyline must have 365 points for dense dataset (metric=${metric})`);

      points.forEach((pt, ptIdx) => {
        const [xStr, yStr] = pt.split(',');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);

        assert.ok(!isNaN(x) && isFinite(x), `Point #${ptIdx} x is invalid: ${xStr}`);
        assert.ok(!isNaN(y) && isFinite(y), `Point #${ptIdx} y is invalid: ${yStr}`);
        assert.ok(x >= 45 && x <= 740, `Point #${ptIdx} x out of bounds [45, 740]: was ${x}`);
        assert.ok(y >= 25 && y <= 220, `Point #${ptIdx} y out of bounds [25, 220]: was ${y}`);
      });
    }

    // Verify rect markers
    const rectMatches = svg.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g);
    for (const m of rectMatches) {
      const x = parseFloat(m[1]);
      const y = parseFloat(m[2]);
      const w = parseFloat(m[3]);
      const h = parseFloat(m[4]);

      assert.ok(!isNaN(x) && isFinite(x), `Rect x is invalid: ${m[1]}`);
      assert.ok(!isNaN(y) && isFinite(y), `Rect y is invalid: ${m[2]}`);
      assert.ok(!isNaN(w) && isFinite(w) && w > 0, `Rect width is invalid: ${m[3]}`);
      assert.ok(!isNaN(h) && isFinite(h) && h >= 0, `Rect height is invalid: ${m[4]}`);
    }
  });
});

test('V2-04: Extreme Values: 0-value baseline dataset (0 min focus, 0% habits, 0% score) avoids division-by-zero', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });
  const zeroData = [];
  for (let i = 0; i < 30; i++) {
    zeroData.push({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      focusMinutes: 0,
      habitRate: 0,
      academicScore: 0,
      eqScore: 0
    });
  }

  env.sandbox.zeroData = zeroData;
  env.runInCtx(`renderLongitudinalSvgChart(zeroData, 'all')`);

  const svg = env.getEl('longitudinalSvgChart').innerHTML;
  assert.ok(!svg.includes('NaN'), 'Zero dataset must not produce NaN');
  assert.ok(!svg.includes('Infinity'), 'Zero dataset must not produce Infinity');

  // In zero dataset, val=0 maps to bottom plot baseline: y = padTop + plotHeight = 25 + 195 = 220
  const polylineMatches = svg.matchAll(/<polyline points="([^"]+)"/g);
  for (const match of polylineMatches) {
    const points = match[1].trim().split(/\s+/);
    points.forEach((pt) => {
      const [, yStr] = pt.split(',');
      const y = parseFloat(yStr);
      assert.strictEqual(y, 220, `0% score must plot exactly at y=220 (baseline)`);
    });
  }

  // Focus bars with 0 focus minutes must have height=0
  const focusBarMatches = svg.matchAll(/<rect[^>]*height="([^"]+)"[^>]*fill-opacity="0.25"/g);
  for (const m of focusBarMatches) {
    assert.strictEqual(parseFloat(m[1]), 0, 'Focus bar height for 0 focus minutes must be 0');
  }
});

test('V2-05: Extreme Values: 100% maximum bounds dataset plots cleanly at top guideline (y=25)', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });
  const maxData = [];
  for (let i = 0; i < 30; i++) {
    maxData.push({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      focusMinutes: 300,
      habitRate: 100,
      academicScore: 100,
      eqScore: 100
    });
  }

  env.sandbox.maxData = maxData;
  env.runInCtx(`renderLongitudinalSvgChart(maxData, 'all')`);

  const svg = env.getEl('longitudinalSvgChart').innerHTML;
  assert.ok(!svg.includes('NaN'));
  assert.ok(!svg.includes('Infinity'));

  // 100% value maps to top boundary: y = padTop + plotHeight - (100/100)*plotHeight = padTop = 25
  const polylineMatches = svg.matchAll(/<polyline points="([^"]+)"/g);
  for (const match of polylineMatches) {
    const points = match[1].trim().split(/\s+/);
    points.forEach((pt) => {
      const [, yStr] = pt.split(',');
      const y = parseFloat(yStr);
      assert.strictEqual(y, 25, '100% score must plot exactly at y=25 (top guideline)');
    });
  }
});

test('V2-06: Filter Interaction Stress: rapid toggling of time ranges and metrics cycles 120 times cleanly', () => {
  const env = createSimulatedEnvironment({ synchronousTimeouts: true });
  const timeRanges = ['7d', '14d', '30d', 'all'];
  const metrics = ['all', 'focus', 'habit', 'habits', 'academic', 'eq'];

  // Seed data in currentLongitudinalData
  env.runInCtx(`
    currentLongitudinalData = {
      summary: { totalFocusMinutes: 120, averageHabitAdherence: 85, academicAccuracyRate: 90, eqOutcomesCount: 4 },
      historicalData: [
        { date: '2026-11-01', focusMinutes: 30, habitRate: 80, academicScore: 85, eqScore: 70 },
        { date: '2026-11-02', focusMinutes: 45, habitRate: 90, academicScore: 95, eqScore: 80 },
        { date: '2026-11-03', focusMinutes: 25, habitRate: 85, academicScore: 90, eqScore: 75 }
      ],
      milestones: [{ id: 'FOCUS_STARTER', title: 'First Sprint', unlockedAt: '2026-11-01' }]
    };
  `);

  for (let i = 0; i < 120; i++) {
    const range = timeRanges[i % timeRanges.length];
    const metric = metrics[i % metrics.length];

    assert.doesNotThrow(() => {
      env.runInCtx(`setLongitudinalTimeRange('${range}')`);
      env.runInCtx(`setLongitudinalMetric('${metric}')`);
    }, `Filter cycle #${i + 1} (${range}, ${metric}) failed`);

    const svg = env.getEl('longitudinalSvgChart').innerHTML;
    assert.ok(!svg.includes('NaN'));
    assert.ok(!svg.includes('undefined'));
    assert.ok(!svg.includes('Infinity'));
  }
});

// =========================================================================
// VECTOR 3: CHILD GOVERNANCE & CURRICULUM CROSS-ALIGNMENT ATTACK
// =========================================================================
testAsync('V3-01: Child Grade Promotion Attack: promote Class 3 to Class 7 and verify persistent backend update', async () => {
  const env = createSimulatedEnvironment();

  // Populate governance form with promotion to Class 7
  env.getEl('childGovernanceNameInput').value = 'Commander Divyank';
  env.getEl('childGovernanceGradeSelect').value = 'Class 7';
  env.getEl('childGovernanceAgeInput').value = '12';

  // Trigger governance update submission
  env.runInCtx(`submitChildGovernanceUpdate()`);

  // Wait 40ms for async API call to persist
  await new Promise(r => setTimeout(r, 40));

  // 1. Verify in-memory linkedChildren promotion
  const linked = env.runInCtx('linkedChildren');
  const divyank = linked.find(c => c.id === 'u_stu_demo');
  assert.strictEqual(divyank.gradeClass, 'Class 7', 'In-memory gradeClass must be updated to Class 7');

  // 2. Verify backend mock database persistence in USERS table
  const dbUsers = env.BrowserMockBackend._getTable(env.BrowserMockBackend.KEYS.USERS);
  const dbDivyank = dbUsers.find(u => u.id === 'u_stu_demo');
  assert.strictEqual(dbDivyank.gradeClass, 'Class 7', 'Database record in USERS table must be persisted as Class 7');
  assert.strictEqual(dbDivyank.age, 12, 'Database age must be updated to 12');

  // 3. Verify getActiveStudentGrade() returns promoted grade
  const currentGrade = env.runInCtx('getActiveStudentGrade()');
  assert.strictEqual(currentGrade, 'Class 7', 'getActiveStudentGrade() must return Class 7');

  // 4. Verify UI badge reflects promoted grade
  assert.ok(
    env.getEl('longitudinalChildNameBadge').innerText.includes('Class 7'),
    `longitudinalChildNameBadge must display Class 7, was: ${env.getEl('longitudinalChildNameBadge').innerText}`
  );
});

testAsync('V3-02: Zero Cross-Grade Leakage Attack: refreshDynamicContent loads 100% Class 7 and 0% Class 3', async () => {
  const env = createSimulatedEnvironment();

  // Promote child to Class 7 first
  const dbUsers = env.BrowserMockBackend._getTable(env.BrowserMockBackend.KEYS.USERS);
  const divyank = dbUsers.find(u => u.id === 'u_stu_demo');
  divyank.gradeClass = 'Class 7';
  env.BrowserMockBackend._setTable(env.BrowserMockBackend.KEYS.USERS, dbUsers);

  env.runInCtx(`
    const child = linkedChildren.find(c => c.id === 'u_stu_demo');
    child.gradeClass = 'Class 7';
    updateActiveChildDisplay();
    refreshDynamicContentForActiveChild();
  `);

  await new Promise(r => setTimeout(r, 40));

  // 1. Verify Daily Knowledge served strictly matches Class 7
  const gkRes = await env.ZoptroApiClient.getContentByGrade({
    studentId: 'u_stu_demo',
    contentType: 'daily_knowledge',
    targetGrade: 'Class 7'
  });

  assert.ok(gkRes.success, 'Querying Class 7 content must succeed');
  assert.ok(gkRes.items.length > 0, 'Class 7 items must be returned');

  gkRes.items.forEach((item, idx) => {
    assert.strictEqual(
      item.grade,
      'Class 7',
      `Item #${idx} grade mismatch: expected Class 7, got ${item.grade}`
    );
  });

  // Verify 0% Class 3 content is returned in Class 7 query
  const leakedClass3 = gkRes.items.filter(i => i.grade === 'Class 3');
  assert.strictEqual(leakedClass3.length, 0, 'Zero Class 3 content must leak into Class 7 stream (0% leakage)');

  // 2. Verify anti-forgery guard: student enrolled in Class 7 requesting Class 3 is strictly rejected with 403
  const forgedRes = await env.ZoptroApiClient.getContentByGrade({
    studentId: 'u_stu_demo',
    contentType: 'daily_knowledge',
    targetGrade: 'Class 3'
  });

  assert.strictEqual(forgedRes.success, false, 'Cross-grade forgery query must fail');
  assert.strictEqual(forgedRes.error, 'GRADE_MISMATCH_FORBIDDEN', 'Must reject with GRADE_MISMATCH_FORBIDDEN');
  assert.strictEqual(forgedRes.code, 403, 'Must return HTTP 403 status code');
});

testAsync('V3-03: Governance Validation Attacks: rejection of invalid grade, negative age, and empty name', async () => {
  const env = createSimulatedEnvironment();

  // Attack 1: Invalid grade injection 'Class 99'
  const invalidGradeRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { grade: 'Class 99' }
  });
  assert.strictEqual(invalidGradeRes.success, false, 'Must reject Class 99');
  assert.ok(
    invalidGradeRes.error.includes('INVALID_GRADE'),
    `Expected INVALID_GRADE error, got: ${invalidGradeRes.error}`
  );

  // Attack 2: Negative age (-5)
  const negativeAgeRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { age: -5 }
  });
  assert.strictEqual(negativeAgeRes.success, false, 'Must reject negative age');
  assert.ok(
    negativeAgeRes.error.includes('INVALID_AGE'),
    `Expected INVALID_AGE error, got: ${negativeAgeRes.error}`
  );

  // Attack 3: Non-numeric age ('abc')
  const nonNumAgeRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { age: 'abc' }
  });
  assert.strictEqual(nonNumAgeRes.success, false, 'Must reject non-numeric age');
  assert.ok(
    nonNumAgeRes.error.includes('INVALID_AGE'),
    `Expected INVALID_AGE error, got: ${nonNumAgeRes.error}`
  );

  // Attack 4: Toddler age under minimum limit (2 < 4)
  const toddlerAgeRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { age: 2 }
  });
  assert.strictEqual(toddlerAgeRes.success, false, 'Must reject age under 4');

  // Attack 5: Adult age over maximum limit (25 > 18)
  const adultAgeRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { age: 25 }
  });
  assert.strictEqual(adultAgeRes.success, false, 'Must reject age over 18');

  // Attack 6: Empty full name
  const emptyNameRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_demo',
    studentId: 'u_stu_demo',
    updates: { fullName: '   ' }
  });
  assert.strictEqual(emptyNameRes.success, false, 'Must reject empty fullName');
  assert.ok(
    emptyNameRes.error.includes('INVALID_NAME'),
    `Expected INVALID_NAME error, got: ${emptyNameRes.error}`
  );

  // Attack 7: Unauthorized foreign parent tampering
  const foreignParentRes = await env.ZoptroApiClient.updateChildGovernance({
    parentUserId: 'u_par_foreign_attacker',
    studentId: 'u_stu_demo',
    updates: { age: 10 }
  });
  assert.strictEqual(foreignParentRes.success, false, 'Must reject unauthorized foreign parent');
  assert.strictEqual(foreignParentRes.code, 403, 'Must return 403 for unauthorized parent');
});

// =========================================================================
// RUNNER & SUITE SUMMARY
// =========================================================================
async function runAll() {
  console.log('--- EXECUTING TEST SUITE ---');
  for (const t of testRegistry) {
    totalTests++;
    try {
      if (t.isAsync) {
        await t.fn();
      } else {
        t.fn();
      }
      passedTests++;
      console.log(`  ✅ PASS: ${t.name}`);
    } catch (err) {
      failedTests++;
      failureDetails.push({ name: t.name, error: err.message, stack: err.stack });
      console.error(`  ❌ FAIL: ${t.name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  console.log('\n=================================================================');
  console.log(`🏁 CHALLENGER 2 SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('=================================================================');

  if (failedTests === 0) {
    console.log('🎉 ALL ADVERSARIAL ATTACKS SUCCESSFULLY DEFENDED (100% PASS RATE)!');
    console.log('   Verdict: APPROVE');
    process.exit(0);
  } else {
    console.error(`❌ ${failedTests} ADVERSARIAL ATTACK(S) EXPOSED VULNERABILITIES.`);
    failureDetails.forEach(f => {
      console.error(`\n- Failure: ${f.name}`);
      console.error(`  ${f.error}`);
    });
    console.log('\n   Verdict: REQUEST_CHANGES');
    process.exit(1);
  }
}

runAll();
