/**
 * tests/test_challenger_m2_it2_burst_rigor.js
 *
 * EMPIRICAL ADVERSARIAL HARNESS — BURST CHALLENGER (M2-IT2)
 *
 * Focus:
 * 1. Strict Google Apps Script CacheService TTL limit enforcement (1 <= ttl <= 21600).
 * 2. Sliding 60-second window rate limiting (15 RPM) with anti-tumbling minute boundary invariance.
 * 3. 24-hour mathematical cycle analysis of secondsUntilUtcMidnight and rpdCacheTtl.
 * 4. Two-tier CacheService L1 + PropertiesService L2 persistence and 6-hour eviction survival.
 * 5. High-volume burst stress, concurrency contention, and model quota isolation.
 */

const assert = require('assert');
const path = require('path');

console.log('=========================================================================');
console.log('⚔️  STARTING BURST CHALLENGER (M2-IT2) ADVERSARIAL HARNESS');
console.log('=================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runChallenge(id, desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${id}: ${desc}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${id}: ${desc}`);
    console.error(`         Error: ${err.message}`);
    failures.push({ id, desc, error: err });
  }
}

// -------------------------------------------------------------------------
// Load Target Backend
// -------------------------------------------------------------------------
const backend = require('../google_apps_script_backend.js');

// =========================================================================
// SECTION 1: STRICT GAS CACHESERVICE TTL CEILING & FLOOR ENFORCEMENT
// =========================================================================
console.log('>>> SECTION 1: Strict GAS CacheService TTL Floor (>=1) & Ceiling (<=21600) <<<');

runChallenge('GAS-TTL-01', 'Direct _inMemoryScriptCache.put rejects ttl < 1 with GAS exception', () => {
  assert.throws(() => {
    backend._inMemoryScriptCache.put('k1', 'v1', 0);
  }, /between 1 and 21600 seconds/);

  assert.throws(() => {
    backend._inMemoryScriptCache.put('k1', 'v1', -50);
  }, /between 1 and 21600 seconds/);
});

runChallenge('GAS-TTL-02', 'Direct _inMemoryScriptCache.put rejects ttl > 21600 with GAS exception', () => {
  assert.throws(() => {
    backend._inMemoryScriptCache.put('k1', 'v1', 21601);
  }, /between 1 and 21600 seconds/);

  assert.throws(() => {
    backend._inMemoryScriptCache.put('k1', 'v1', 86400);
  }, /between 1 and 21600 seconds/);
});

runChallenge('GAS-TTL-03', 'Direct _inMemoryScriptCache.put accepts boundary values (1 and 21600) and defaults to 600', () => {
  backend._inMemoryScriptCache.put('test_boundary_min', 'val_min', 1);
  assert.strictEqual(backend._inMemoryScriptCache.get('test_boundary_min'), 'val_min');

  backend._inMemoryScriptCache.put('test_boundary_max', 'val_max', 21600);
  assert.strictEqual(backend._inMemoryScriptCache.get('test_boundary_max'), 'val_max');

  backend._inMemoryScriptCache.put('test_default', 'val_default');
  assert.strictEqual(backend._inMemoryScriptCache.get('test_default'), 'val_default');
});

runChallenge('GAS-TTL-04', 'setCachedGeminiResponse clamps extreme and malformed TTLs strictly into [1, 21600]', () => {
  const strictCalls = [];
  const strictMockCache = {
    get: () => null,
    put: (k, v, ttl) => {
      if (typeof ttl !== 'number' || isNaN(ttl) || ttl < 1 || ttl > 21600) {
        throw new Error(`GAS TTL VIOLATION: put called with ttl=${ttl}`);
      }
      strictCalls.push({ k, v, ttl });
    }
  };

  const origCacheService = global.CacheService;
  global.CacheService = { getScriptCache: () => strictMockCache };

  try {
    const testCases = [
      { ttl: 86400, expected: 21600 },
      { ttl: 1000000, expected: 21600 },
      { ttl: 21601, expected: 21600 },
      { ttl: 21600, expected: 21600 },
      { ttl: 3600, expected: 3600 },
      { ttl: 1, expected: 1 },
      { ttl: 0.5, expected: 1 },
      { ttl: 0, expected: 21600 },
      { ttl: -100, expected: 21600 },
      { ttl: NaN, expected: 21600 },
      { ttl: Infinity, expected: 21600 },
      { ttl: -Infinity, expected: 21600 },
      { ttl: null, expected: 21600 },
      { ttl: undefined, expected: 21600 }
    ];

    testCases.forEach((tc, idx) => {
      strictCalls.length = 0;
      const ok = backend.setCachedGeminiResponse(`fp_strict_${idx}`, { items: ['Q1'] }, tc.ttl);
      assert.strictEqual(ok, true, `Call ${idx} with ttl=${tc.ttl} must succeed`);
      assert.strictEqual(strictCalls.length, 1);
      assert.strictEqual(strictCalls[0].ttl, tc.expected, `Call ${idx} ttl=${tc.ttl} should clamp to ${tc.expected}, got ${strictCalls[0].ttl}`);
      assert.ok(strictCalls[0].ttl >= 1 && strictCalls[0].ttl <= 21600);
    });
  } finally {
    global.CacheService = origCacheService;
  }
});

// =========================================================================
// SECTION 2: 24-HOUR MATHEMATICAL SWEEP OF RATE LIMIT CACHE TTL
// =========================================================================
console.log('\n>>> SECTION 2: Mathematical Sweep of 86,400 UTC Seconds for rpdCacheTtl <<<');

runChallenge('GAS-TTL-05', 'Exhaustive verification: secondsUntilUtcMidnight and rpdCacheTtl across entire 24h day', () => {
  // Simulate every second across 24 hours (86,400 sample points)
  // Formula under audit:
  // const secondsUntilUtcMidnight = Math.max(1, 86400 - (Math.floor(now / 1000) % 86400));
  // const rpdCacheTtl = Math.min(secondsUntilUtcMidnight, 21600);
  
  let minTtl = Infinity;
  let maxTtl = -Infinity;
  let minRaw = Infinity;
  let maxRaw = -Infinity;

  for (let sec = 0; sec < 86400; sec++) {
    const simulatedNow = (1700000000000 - (1700000000000 % 86400000)) + (sec * 1000);
    const secondsUntilUtcMidnight = Math.max(1, 86400 - (Math.floor(simulatedNow / 1000) % 86400));
    const rpdCacheTtl = Math.min(secondsUntilUtcMidnight, 21600);

    if (secondsUntilUtcMidnight < minRaw) minRaw = secondsUntilUtcMidnight;
    if (secondsUntilUtcMidnight > maxRaw) maxRaw = secondsUntilUtcMidnight;
    if (rpdCacheTtl < minTtl) minTtl = rpdCacheTtl;
    if (rpdCacheTtl > maxTtl) maxTtl = rpdCacheTtl;

    if (rpdCacheTtl < 1 || rpdCacheTtl > 21600) {
      throw new Error(`Out-of-bounds TTL at sec ${sec}: rpdCacheTtl=${rpdCacheTtl}`);
    }
  }

  assert.strictEqual(minRaw, 1, 'Minimum raw seconds until midnight is 1 (at 23:59:59 UTC)');
  assert.strictEqual(maxRaw, 86400, 'Maximum raw seconds until midnight is 86400 (at 00:00:00 UTC)');
  assert.strictEqual(minTtl, 1, 'Minimum clamped rpdCacheTtl is 1');
  assert.strictEqual(maxTtl, 21600, 'Maximum clamped rpdCacheTtl is 21600 (GAS ceiling)');
});

runChallenge('GAS-TTL-06', 'checkAndIncrementRateLimit under strict GAS mock never throws across all day phases', () => {
  const strictMockCache = {
    _store: {},
    get: function(k) { return this._store[k] || null; },
    put: function(k, v, ttl) {
      if (typeof ttl !== 'number' || isNaN(ttl) || ttl < 1 || ttl > 21600) {
        throw new Error(`STRICT GAS EXCEPTION: put(key=${k}, val=${v}, ttl=${ttl}) exceeds [1, 21600]`);
      }
      this._store[k] = String(v);
    }
  };

  const origCacheService = global.CacheService;
  global.CacheService = { getScriptCache: () => strictMockCache };

  try {
    // Test key UTC timestamps:
    // 00:00:00 UTC (sec 0)
    // 06:00:00 UTC (sec 21600)
    // 18:00:00 UTC (sec 64800)
    // 23:59:59 UTC (sec 86399)
    const testOffsetsSec = [0, 1, 100, 21599, 21600, 21601, 43200, 64799, 64800, 64801, 86398, 86399];
    
    testOffsetsSec.forEach(secOffset => {
      const origDateNow = Date.now;
      const baseMidnight = 1700006400000; // Exact UTC midnight
      Date.now = () => baseMidnight + (secOffset * 1000);
      try {
        const decision = backend.checkAndIncrementRateLimit(`gemini-ttl-phase-${secOffset}`, true);
        assert.strictEqual(decision.allowed, true, `Call at offset ${secOffset}s should succeed`);
      } finally {
        Date.now = origDateNow;
      }
    });
  } finally {
    global.CacheService = origCacheService;
  }
});

// =========================================================================
// SECTION 3: SLIDING 60-SECOND WINDOW (15 RPM) & ANTI-TUMBLING INVARIANCE
// =========================================================================
console.log('\n>>> SECTION 3: Sliding 60-Second Window (15 RPM) & Anti-Tumbling <<<');

runChallenge('SLIDE-01', '15 requests at t=0 succeed, 16th at t=0 rejected with retryAfterSeconds=60', () => {
  const model = 'gemini-slide-burst-' + Date.now();
  for (let i = 1; i <= 15; i++) {
    const res = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(res.allowed, true, `Request ${i} must be allowed`);
    assert.strictEqual(res.rpmCurrent, i);
    assert.strictEqual(res.rpmRemaining, 15 - i);
  }

  const res16 = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(res16.allowed, false, '16th burst request must be blocked');
  assert.strictEqual(res16.rpmRemaining, 0);
  assert.strictEqual(res16.retryAfterSeconds, 60, 'retryAfterSeconds must be 60 for burst at t=0');
});

runChallenge('SLIDE-02', 'Sub-minute boundary test: request at t=59,999ms blocked, request at t=60,001ms allowed', () => {
  const model = 'gemini-submin-' + Date.now();
  const startTime = 1700000000000;
  let simulatedTime = startTime;

  const origDateNow = Date.now;
  Date.now = () => simulatedTime;

  try {
    // Send 15 requests at t=0
    for (let i = 1; i <= 15; i++) {
      const res = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(res.allowed, true);
    }

    // Attempt at t = 59,999ms (1ms before window expiration)
    simulatedTime = startTime + 59999;
    const resBlocked = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(resBlocked.allowed, false, 'Must still be blocked at t=59,999ms');
    assert.strictEqual(resBlocked.retryAfterSeconds, 1, 'retryAfterSeconds must be 1s at t=59,999ms');

    // Advance to t = 60,001ms (1ms after oldest request expires)
    simulatedTime = startTime + 60001;
    const resAllowed = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(resAllowed.allowed, true, 'Slot must open at t=60,001ms');
    assert.strictEqual(resAllowed.rpmCurrent, 1, 'Only the new request is in window');

    // 14 more requests should be allowed at t=60,001ms
    for (let j = 2; j <= 15; j++) {
      const resMore = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(resMore.allowed, true, `Request ${j} in new window must succeed`);
    }

    // 16th request at t=60,001ms must be blocked again
    const resBlockedAgain = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(resBlockedAgain.allowed, false);
  } finally {
    Date.now = origDateNow;
  }
});

runChallenge('SLIDE-03', 'Anti-Tumbling Test: Fixed minute boundary rollover (23:59:50 -> 00:00:10) does NOT reset window', () => {
  // Classic tumbling window bug: 15 calls at 23:59:50 UTC, then at 00:00:05 UTC (new minute)
  // tumbling window allows 15 more (30 calls in 15 seconds!).
  // Sliding window MUST block until 23:59:50 + 60s = 00:00:50 UTC.
  const model = 'gemini-antitumble-' + Date.now();
  const baseTime = 1700006390000; // 23:59:50 UTC
  let simulatedTime = baseTime;

  const origDateNow = Date.now;
  Date.now = () => simulatedTime;

  try {
    // 15 requests at 23:59:50 UTC
    for (let i = 1; i <= 15; i++) {
      assert.strictEqual(backend.checkAndIncrementRateLimit(model, true).allowed, true);
    }

    // Advance to 00:00:10 UTC next day (20 seconds later, new minute & new day!)
    simulatedTime = baseTime + 20000; // 00:00:10 UTC
    const decNewMinute = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decNewMinute.allowed, false, 'Rolling window must NOT reset across minute boundary');
    assert.strictEqual(decNewMinute.retryAfterSeconds, 40, 'retryAfterSeconds must be exactly 40s (60 - 20)');

    // Advance to 00:00:49 UTC (59 seconds after burst)
    simulatedTime = baseTime + 59000;
    const decStillBlocked = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decStillBlocked.allowed, false, 'Must remain blocked at +59s');
    assert.strictEqual(decStillBlocked.retryAfterSeconds, 1);

    // Advance to 00:00:51 UTC (61 seconds after burst)
    simulatedTime = baseTime + 61000;
    const decFinallyAllowed = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decFinallyAllowed.allowed, true, 'Window clears after full 60s sliding elapsed');
  } finally {
    Date.now = origDateNow;
  }
});

runChallenge('SLIDE-04', 'Staggered sliding window: 5 at t=0, 5 at t=20, 5 at t=40, smooth gradual expiration', () => {
  const model = 'gemini-staggered-' + Date.now();
  const startTime = 1700000000000;
  let simulatedTime = startTime;

  const origDateNow = Date.now;
  Date.now = () => simulatedTime;

  try {
    // 5 at t=0
    for (let i = 0; i < 5; i++) backend.checkAndIncrementRateLimit(model, true);

    // 5 at t=20s
    simulatedTime = startTime + 20000;
    for (let i = 0; i < 5; i++) backend.checkAndIncrementRateLimit(model, true);

    // 5 at t=40s
    simulatedTime = startTime + 40000;
    for (let i = 0; i < 5; i++) backend.checkAndIncrementRateLimit(model, true);

    // At t=45s: 15 calls in window, next call blocked
    simulatedTime = startTime + 45000;
    const blocked45 = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blocked45.allowed, false);
    assert.strictEqual(blocked45.retryAfterSeconds, 15, 'Oldest call was at t=0, expires at t=60 (60 - 45 = 15s)');

    // At t=65s: First 5 calls expired, 10 remain. Exactly 5 calls should succeed!
    simulatedTime = startTime + 65000;
    for (let i = 1; i <= 5; i++) {
      const allowed65 = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(allowed65.allowed, true, `Slot ${i}/5 should open at t=65s`);
    }
    // 6th call at t=65s must be blocked
    const blocked65 = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(blocked65.allowed, false);
    assert.strictEqual(blocked65.retryAfterSeconds, 15, 'Next batch was at t=20, expires at t=80 (80 - 65 = 15s)');
  } finally {
    Date.now = origDateNow;
  }
});

// =========================================================================
// SECTION 4: MODEL ISOLATION & CONSUME=FALSE IMMUTABILITY
// =========================================================================
console.log('\n>>> SECTION 4: Model Isolation & Non-Mutating Inspection <<<');

runChallenge('MODEL-01', 'Independent rate limit buckets: exhausting Model A does NOT throttle Model B or Model C', () => {
  const ts = Date.now();
  const modelA = `gemini-1.5-flash-test-${ts}`;
  const modelB = `gemini-2.0-flash-test-${ts}`;
  const modelC = `gemini-1.5-pro-test-${ts}`;

  // Exhaust model A (15 requests)
  for (let i = 0; i < 15; i++) backend.checkAndIncrementRateLimit(modelA, true);
  assert.strictEqual(backend.checkAndIncrementRateLimit(modelA, true).allowed, false, 'Model A must be blocked');

  // Model B must still have full 15 RPM available
  const decB = backend.checkAndIncrementRateLimit(modelB, true);
  assert.strictEqual(decB.allowed, true, 'Model B must be allowed');
  assert.strictEqual(decB.rpmCurrent, 1);
  assert.strictEqual(decB.rpmRemaining, 14);

  // Model C must still have full 15 RPM available
  const decC = backend.checkAndIncrementRateLimit(modelC, true);
  assert.strictEqual(decC.allowed, true, 'Model C must be allowed');
  assert.strictEqual(decC.rpmCurrent, 1);
  assert.strictEqual(decC.rpmRemaining, 14);
});

runChallenge('MODEL-02', 'Inspection mode (consume=false) is strictly idempotent and does not mutate quota or timestamps', () => {
  const model = 'gemini-inspect-idempotent-' + Date.now();

  // Baseline inspection
  const q0 = backend.checkAndIncrementRateLimit(model, false);
  assert.strictEqual(q0.allowed, true);
  assert.strictEqual(q0.rpmCurrent, 0);
  assert.strictEqual(q0.rpmRemaining, 15);
  assert.strictEqual(q0.rpdCurrent, 0);

  // Consume 7 slots
  for (let i = 0; i < 7; i++) backend.checkAndIncrementRateLimit(model, true);

  // Inspect 100 consecutive times
  for (let i = 0; i < 100; i++) {
    const qIter = backend.checkAndIncrementRateLimit(model, false);
    assert.strictEqual(qIter.allowed, true);
    assert.strictEqual(qIter.rpmCurrent, 7, 'rpmCurrent must stay 7');
    assert.strictEqual(qIter.rpmRemaining, 8, 'rpmRemaining must stay 8');
    assert.strictEqual(qIter.rpdCurrent, 7, 'rpdCurrent must stay 7');
  }

  // 8th real consumption must succeed
  const c8 = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(c8.allowed, true);
  assert.strictEqual(c8.rpmCurrent, 8);
});

// =========================================================================
// SECTION 5: TWO-TIER PERSISTENCE (L1 CACHE + L2 PROPERTIES) & EVICTION
// =========================================================================
console.log('\n>>> SECTION 5: Two-Tier Persistence & 6-Hour Eviction Survival <<<');

runChallenge('PERSIST-01', 'Counter survives total L1 CacheService purge by recovering from L2 PropertiesService', () => {
  const model = 'gemini-eviction-test-' + Date.now();
  const startTime = 1700000000000;
  let simulatedTime = startTime;
  const origDateNow = Date.now;
  Date.now = () => simulatedTime;

  try {
    // Consume 42 requests legally across 3 separate minute windows (15 + 15 + 12)
    // Batch 1: 15 requests at t=0
    for (let i = 0; i < 15; i++) {
      const dec = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(dec.allowed, true);
    }
    // Batch 2: 15 requests at t=61s
    simulatedTime = startTime + 61000;
    for (let i = 0; i < 15; i++) {
      const dec = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(dec.allowed, true);
    }
    // Batch 3: 12 requests at t=122s
    simulatedTime = startTime + 122000;
    for (let i = 0; i < 12; i++) {
      const dec = backend.checkAndIncrementRateLimit(model, true);
      assert.strictEqual(dec.allowed, true);
    }

    // Verify L1 and L2 both have 42
    const todayUtc = new Date(simulatedTime).toISOString().substring(0, 10);
    const modelSafeKey = model.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const rpdKey = 'gemini_rpd_' + modelSafeKey + '_' + todayUtc;

    assert.strictEqual(backend._inMemoryScriptCache.get(rpdKey), '42');
    assert.strictEqual(backend.getScriptProperties_().getProperty(rpdKey), '42');

    // SIMULATE 6-HOUR CACHESERVICE COMPLETE EVICTION
    backend._inMemoryScriptCache.remove(rpdKey);
    assert.strictEqual(backend._inMemoryScriptCache.get(rpdKey), null, 'L1 cache is now evicted');

    // Inspection recovers from L2 PropertiesService
    const inspectRecovered = backend.checkAndIncrementRateLimit(model, false);
    assert.strictEqual(inspectRecovered.rpdCurrent, 42, 'Must recover 42 from L2');
    assert.strictEqual(inspectRecovered.dailyRemaining, 1500 - 42);

    // Verify L1 cache was rehydrated!
    assert.strictEqual(backend._inMemoryScriptCache.get(rpdKey), '42', 'L1 cache must be rehydrated after recovery');

    // Next consumption increments to 43 and persists to both tiers
    const nextCall = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(nextCall.rpdCurrent, 43);
    assert.strictEqual(backend._inMemoryScriptCache.get(rpdKey), '43');
    assert.strictEqual(backend.getScriptProperties_().getProperty(rpdKey), '43');
  } finally {
    Date.now = origDateNow;
  }
});

runChallenge('PERSIST-02', 'L2 PropertiesService enforces 1,500 RPD boundary even if L1 CacheService was empty', () => {
  const model = 'gemini-cap-evict-' + Date.now();
  const now = Date.now();
  const todayUtc = new Date(now).toISOString().substring(0, 10);
  const modelSafeKey = model.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const rpdKey = 'gemini_rpd_' + modelSafeKey + '_' + todayUtc;

  // Manually set L2 PropertiesService to 1500 while L1 cache is completely empty
  backend.getScriptProperties_().setProperty(rpdKey, '1500');
  backend._inMemoryScriptCache.remove(rpdKey);

  const decBlocked = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(decBlocked.allowed, false, 'Must be blocked at 1500 even on L1 cache miss');
  assert.strictEqual(decBlocked.rpdCurrent, 1500);
  assert.strictEqual(decBlocked.dailyRemaining, 0);
  assert.ok(decBlocked.error && decBlocked.error.includes('DAILY_QUOTA_EXCEEDED'));
});

// =========================================================================
// SECTION 6: RESILIENCE UNDER SERVICE CRASHES & DEGRADATION
// =========================================================================
console.log('\n>>> SECTION 6: Resilience Under Fault Injection & Graceful Fallbacks <<<');

runChallenge('RESIL-01', 'checkAndIncrementRateLimit functions gracefully when CacheService throws exceptions', () => {
  const faultyCache = {
    get: () => { throw new Error('Simulated CacheService network timeout'); },
    put: () => { throw new Error('Simulated CacheService quota exceeded'); }
  };

  const origCacheService = global.CacheService;
  global.CacheService = { getScriptCache: () => faultyCache };

  try {
    const dec = backend.checkAndIncrementRateLimit('gemini-faulty-cache', true);
    // Should gracefully fall back without throwing unhandled exception
    assert.strictEqual(typeof dec.allowed, 'boolean');
    assert.strictEqual(dec.rpmLimit, 15);
    assert.strictEqual(dec.rpdLimit, 1500);
  } finally {
    global.CacheService = origCacheService;
  }
});

runChallenge('RESIL-02', 'checkAndIncrementRateLimit functions gracefully when PropertiesService throws exceptions', () => {
  const faultyProps = {
    getProperty: () => { throw new Error('Simulated PropertiesService outage'); },
    setProperty: () => { throw new Error('Simulated PropertiesService write failure'); },
    deleteProperty: () => { throw new Error('Simulated PropertiesService delete failure'); }
  };

  const origPropsService = global.PropertiesService;
  global.PropertiesService = { getScriptProperties: () => faultyProps };

  try {
    const dec = backend.checkAndIncrementRateLimit('gemini-faulty-props', true);
    assert.strictEqual(dec.allowed, true);
  } finally {
    global.PropertiesService = origPropsService;
  }
});

// =========================================================================
// SECTION 7: PATHOLOGICAL INPUTS & MALFORMED CACHE STATE RESILIENCE
// =========================================================================
console.log('\n>>> SECTION 7: Pathological Inputs & Corrupted Cache State Resilience <<<');

runChallenge('CORRUPT-01', 'Corrupted timestamps JSON in CacheService falls back safely to empty window', () => {
  const model = 'gemini-corrupt-json-' + Date.now();
  const modelSafeKey = model.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const timestampsKey = 'gemini_rpm_timestamps_' + modelSafeKey;

  // Inject invalid JSON
  backend._inMemoryScriptCache.put(timestampsKey, '{{INVALID_JSON_CORRUPT');

  const dec = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(dec.allowed, true, 'Should recover gracefully from invalid JSON');
  assert.strictEqual(dec.rpmCurrent, 1);
});

runChallenge('CORRUPT-02', 'Non-array or contaminated array in timestamps cache is filtered cleanly', () => {
  const model = 'gemini-contam-array-' + Date.now();
  const modelSafeKey = model.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const timestampsKey = 'gemini_rpm_timestamps_' + modelSafeKey;

  // Inject object instead of array
  backend._inMemoryScriptCache.put(timestampsKey, JSON.stringify({ bad: 'not an array' }));
  const decObj = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(decObj.allowed, true);
  assert.strictEqual(decObj.rpmCurrent, 1);

  // Inject array with null, strings, NaN, and expired numbers
  const contaminated = [null, 'malicious_string', NaN, undefined, 1000, Date.now() - 100000];
  backend._inMemoryScriptCache.put(timestampsKey, JSON.stringify(contaminated));
  const decContam = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(decContam.allowed, true);
  assert.strictEqual(decContam.rpmCurrent, 1, 'Only newly consumed timestamp should be present');
});

runChallenge('INPUT-01', 'Model parameter edge cases (null, undefined, empty, special characters, path traversal)', () => {
  const edgeModels = [
    null,
    undefined,
    '',
    '   ',
    '../../etc/passwd',
    '<script>alert(1)</script>',
    'gemini/1.5/flash::v2',
    'Model with spaces and unicode 🚀'
  ];

  edgeModels.forEach((m, idx) => {
    const dec = backend.checkAndIncrementRateLimit(m, true);
    assert.strictEqual(dec.allowed, true, `Model edge case ${idx} (${m}) must be handled safely`);
    assert.strictEqual(dec.rpmLimit, 15);
    assert.strictEqual(dec.rpdLimit, 1500);
  });
});

// =========================================================================
// SECTION 8: MASSIVE 200-BURST RAPID FIRING STRESS TEST
// =========================================================================
console.log('\n>>> SECTION 8: Massive 200-Burst Rapid Firing Stress Test <<<');

runChallenge('BURST-200', '200 rapid requests in same second: exactly 15 allowed, exactly 185 blocked', () => {
  const burstModel = 'gemini-burst-200-' + Date.now();
  let allowed = 0;
  let blocked = 0;

  for (let i = 1; i <= 200; i++) {
    const res = backend.checkAndIncrementRateLimit(burstModel, true);
    if (res.allowed) {
      allowed++;
      assert.strictEqual(res.rpmCurrent, allowed);
      assert.strictEqual(res.rpmRemaining, 15 - allowed);
    } else {
      blocked++;
      assert.strictEqual(res.rpmCurrent, 15);
      assert.strictEqual(res.rpmRemaining, 0);
      assert.ok(res.retryAfterSeconds > 0 && res.retryAfterSeconds <= 60);
      assert.ok(res.error.includes('RATE_LIMIT_EXCEEDED'));
    }
  }

  assert.strictEqual(allowed, 15, `Exactly 15 of 200 requests must be permitted; got ${allowed}`);
  assert.strictEqual(blocked, 185, `Exactly 185 of 200 requests must be rejected; got ${blocked}`);
});

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log('\n=========================================================================');
console.log(`TOTAL BURST RIGOR TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`SUCCESS RATE: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('=========================================================================');

if (failedTests > 0) {
  console.error('\nFAILURE BREAKDOWN:');
  failures.forEach(f => {
    console.error(`- ${f.id} (${f.desc}): ${f.error.message}`);
  });
  process.exit(1);
} else {
  console.log('\nALL BURST CHALLENGER RIGOROUS TESTS PASSED EMPIRICALLY (100% SUCCESS)');
}
