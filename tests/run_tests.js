#!/usr/bin/env node
/**
 * =========================================================================
 * ZOPTRO AUTOMATED E2E TEST RUNNER
 * =========================================================================
 * Master test executor for Tiers 1 through 6:
 * - Tier 1: Feature Coverage (Features 1-19, >=5 tests per feature)
 * - Tier 2: Boundary & Corner Cases (Features 1-19, >=5 tests per feature)
 * - Tier 3: Pairwise Combinatorial Tests (>=19 tests)
 * - Tier 4: Real-World Scenarios (>=6 realistic workflows)
 * - Tier 5: 1-to-N Multi-Child Backend & State Isolation (>=30 tests)
 * - Tier 6: 1-to-N Multi-Child Frontend SPA & Parent HQ (>=22 tests)
 *
 * Usage:
 *   node tests/run_tests.js
 *   node tests/run_tests.js --tier=1
 *   node tests/run_tests.js --tier=2
 *   node tests/run_tests.js --tier=3
 *   node tests/run_tests.js --tier=4
 *   node tests/run_tests.js --tier=5
 *   node tests/run_tests.js --tier=6
 */

const path = require('node:path');
const { registry } = require('./harness/test_env.js');

async function main() {
  const args = process.argv.slice(2);
  let requestedTier = null;

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      requestedTier = parseInt(arg.split('=')[1], 10);
    }
  }

  const allTiers = [
    { tier: 1, name: 'Tier 1: Feature Coverage (19 Features >=5/feat)', file: './tier1_feature_coverage.test.js', minExpected: 95 },
    { tier: 2, name: 'Tier 2: Boundary & Corner Cases (19 Features >=5/feat)', file: './tier2_boundary_corner.test.js', minExpected: 95 },
    { tier: 3, name: 'Tier 3: Pairwise Combinatorial Interactions', file: './tier3_pairwise_combinations.test.js', minExpected: 19 },
    { tier: 4, name: 'Tier 4: Real-World End-to-End Workflows', file: './tier4_real_world_scenarios.test.js', minExpected: 6 },
    { tier: 5, name: 'Tier 5: 1-to-N Multi-Child Backend & State Isolation', file: './test_multichild_backend_and_isolation.js', minExpected: 30 },
    { tier: 6, name: 'Tier 6: 1-to-N Multi-Child Frontend SPA & Parent HQ', file: './test_multichild_frontend_hq.js', minExpected: 22 }
  ];

  const tiersToRun = requestedTier
    ? allTiers.filter(t => t.tier === requestedTier)
    : allTiers;

  if (tiersToRun.length === 0) {
    console.error(`\x1b[31mInvalid tier requested: --tier=${requestedTier}. Valid options are 1, 2, 3, 4, 5, 6.\x1b[0m`);
    process.exit(1);
  }

  console.log('\x1b[1m\x1b[34m=========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[37m  ZOPTRO AUTOMATED E2E TEST SUITE RUNNER (OPAQUE-BOX VERIFICATION)\x1b[0m');
  console.log('\x1b[1m\x1b[34m=========================================================================\x1b[0m');
  console.log(`Execution Mode: ${requestedTier ? `Targeted Tier ${requestedTier}` : 'Full Suite (Tiers 1-6)'}`);
  console.log(`Target Directory: ${path.resolve(__dirname)}`);
  console.log('Timestamp:', new Date().toISOString());

  const tierSummaries = [];
  let grandTotalPassed = 0;
  let grandTotalFailed = 0;
  let grandTotalTests = 0;
  const overallStartTime = Date.now();

  for (const tierConfig of tiersToRun) {
    console.log(`\n\x1b[1m\x1b[35m>>> RUNNING ${tierConfig.name.toUpperCase()} <<<\x1b[0m`);
    registry.reset();

    try {
      require(tierConfig.file);
    } catch (err) {
      console.error(`\x1b[31mFailed to load test file ${tierConfig.file}:\x1b[0m`, err);
      process.exit(1);
    }

    const { stats, results } = await registry.run({ verbose: true });

    tierSummaries.push({
      tier: tierConfig.tier,
      name: tierConfig.name,
      passed: stats.passed,
      failed: stats.failed,
      total: stats.total,
      minExpected: tierConfig.minExpected,
      durationMs: stats.durationMs
    });

    grandTotalPassed += stats.passed;
    grandTotalFailed += stats.failed;
    grandTotalTests += stats.total;
  }

  const grandTotalDuration = Date.now() - overallStartTime;

  console.log('\n\x1b[1m\x1b[34m=========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[37m                       FINAL E2E EXECUTION SUMMARY                      \x1b[0m');
  console.log('\x1b[1m\x1b[34m=========================================================================\x1b[0m');
  console.log('Tier Breakdown:');

  let allThresholdsMet = true;
  for (const sum of tierSummaries) {
    const passedStr = sum.failed === 0 ? `\x1b[32m${sum.passed} passed\x1b[0m` : `\x1b[32m${sum.passed} passed\x1b[0m, \x1b[31m${sum.failed} failed\x1b[0m`;
    const thresholdMet = sum.total >= sum.minExpected;
    const thresholdStr = thresholdMet
      ? `\x1b[32m[THRESHOLD MET >=${sum.minExpected}]\x1b[0m`
      : `\x1b[31m[THRESHOLD MISSED: ${sum.total} < ${sum.minExpected}]\x1b[0m`;

    if (!thresholdMet) allThresholdsMet = false;

    console.log(`  • ${sum.name.padEnd(52)} : ${passedStr} (total ${sum.total}) in ${sum.durationMs}ms ${thresholdStr}`);
  }

  console.log('-------------------------------------------------------------------------');
  console.log(`Grand Total Tests Executed: \x1b[1m${grandTotalTests}\x1b[0m (Threshold: >=268 tests)`);
  console.log(`Total Passed: \x1b[1m\x1b[32m${grandTotalPassed}\x1b[0m`);
  console.log(`Total Failed: \x1b[1m${grandTotalFailed === 0 ? '\x1b[32m0\x1b[0m' : `\x1b[31m${grandTotalFailed}\x1b[0m`}`);
  console.log(`Execution Time: ${grandTotalDuration}ms`);

  const passed = grandTotalFailed === 0 && allThresholdsMet && (requestedTier || grandTotalTests >= 268);

  if (passed) {
    console.log('\n\x1b[1m\x1b[42m\x1b[30m  ALL TEST TIERS PASSED PERFECTLY (100% SUCCESS)  \x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\n\x1b[1m\x1b[41m\x1b[37m  TEST EXECUTION FAILED OR THRESHOLDS UNMET  \x1b[0m\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal error in test runner:\x1b[0m', err);
  process.exit(1);
});
