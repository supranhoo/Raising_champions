/**
 * tests/test_cli_runner_matrix.js
 * Automated CLI Argument Matrix Verification for tests/run_tests.js
 *
 * Covers 20 comprehensive permutations:
 * - Category 1: Default execution (Full Suite, exit 0)
 * - Category 2: Valid targeted tiers (--tier=1 through --tier=8, exit 0)
 * - Category 3: Out-of-bounds integer tiers (--tier=0, 9, -1, 100, exit 1)
 * - Category 4: Non-numeric strings (--tier=invalid, abc, foo, exit 1)
 * - Category 5: Empty value (--tier=, exit 1)
 * - Category 6: Edge cases / truncation defense (--tier=1abc, 1.5, " ", exit 1)
 */

const { spawnSync } = require('node:child_process');
const assert = require('node:assert');
const path = require('node:path');

const RUNNER_PATH = path.resolve(__dirname, 'run_tests.js');

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function runCLI(args = []) {
  const result = spawnSync(process.execPath, [RUNNER_PATH, ...args], {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

console.log('=========================================================================');
console.log('  TEST MATRIX: CLI ARGUMENT PERMUTATIONS (tests/run_tests.js)           ');
console.log('=========================================================================');

let passedCount = 0;
let totalCount = 0;

function check(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
  }
}

// Category 1: Default execution
check('P01: Default invocation executes full suite (343 tests, exit 0)', () => {
  const { status, stdout } = runCLI([]);
  assert.strictEqual(status, 0, 'Exit code must be 0');
  const cleanStdout = stripAnsi(stdout);
  assert.ok(cleanStdout.includes('Execution Mode: Full Suite (Tiers 1-8)'), 'Must indicate Full Suite mode');
  assert.ok(cleanStdout.includes('Grand Total Tests Executed: 343'), 'Must execute 343 tests');
  assert.ok(cleanStdout.includes('ALL TEST TIERS PASSED PERFECTLY (100% SUCCESS)'), 'Must report 100% success');
});

// Category 2: Valid targeted tiers (Tiers 1 to 8)
const tierThresholds = [
  { tier: 1, min: 95 },
  { tier: 2, min: 95 },
  { tier: 3, min: 19 },
  { tier: 4, min: 6 },
  { tier: 5, min: 30 },
  { tier: 6, min: 22 },
  { tier: 7, min: 28 },
  { tier: 8, min: 30 }
];

tierThresholds.forEach(({ tier, min }) => {
  const pNum = String(tier + 1).padStart(2, '0');
  check(`P${pNum}: Valid --tier=${tier} executes only Tier ${tier} and exits 0`, () => {
    const { status, stdout } = runCLI([`--tier=${tier}`]);
    assert.strictEqual(status, 0, `Exit code must be 0 for --tier=${tier}`);
    assert.ok(stdout.includes(`Execution Mode: Targeted Tier ${tier}`), `Must indicate Targeted Tier ${tier}`);
    assert.ok(stdout.includes(`[THRESHOLD MET >=${min}]`), `Must meet minimum threshold of ${min}`);
    assert.ok(stdout.includes('ALL TEST TIERS PASSED PERFECTLY (100% SUCCESS)'), 'Must pass cleanly');
  });
});

// Category 3: Out-of-bounds integer tiers
const outOfBoundsTiers = ['0', '9', '-1', '100'];
outOfBoundsTiers.forEach((tier) => {
  check(`P_OOB: Out-of-bounds --tier=${tier} exits with code 1 and error message`, () => {
    const { status, stderr, stdout } = runCLI([`--tier=${tier}`]);
    assert.strictEqual(status, 1, `Exit code must be 1 for out-of-bounds --tier=${tier}`);
    assert.ok(
      stderr.includes(`Invalid tier requested: --tier=${tier}. Valid options are 1, 2, 3, 4, 5, 6, 7, 8.`),
      `Expected stderr error message for --tier=${tier}. Actual stderr: ${stderr}`
    );
    assert.ok(!stdout.includes('>>> RUNNING TIER'), 'Must not execute any tests');
  });
});

// Category 4: Non-numeric strings
const nonNumericTiers = ['invalid', 'abc', 'foo'];
nonNumericTiers.forEach((tier) => {
  check(`P_STR: Non-numeric --tier=${tier} exits with code 1 and error message`, () => {
    const { status, stderr, stdout } = runCLI([`--tier=${tier}`]);
    assert.strictEqual(status, 1, `Exit code must be 1 for non-numeric --tier=${tier}`);
    assert.ok(
      stderr.includes(`Invalid tier requested: --tier=${tier}. Valid options are 1, 2, 3, 4, 5, 6, 7, 8.`),
      `Expected stderr error message for --tier=${tier}. Actual stderr: ${stderr}`
    );
    assert.ok(!stdout.includes('>>> RUNNING TIER'), 'Must not execute any tests');
  });
});

// Category 5: Empty value
check('P17: Empty value --tier= exits with code 1 and error message', () => {
  const { status, stderr, stdout } = runCLI(['--tier=']);
  assert.strictEqual(status, 1, 'Exit code must be 1 for empty --tier=');
  assert.ok(
    stderr.includes('Invalid tier requested: --tier=. Valid options are 1, 2, 3, 4, 5, 6, 7, 8.'),
    `Expected stderr error message for empty --tier=. Actual stderr: ${stderr}`
  );
  assert.ok(!stdout.includes('>>> RUNNING TIER'), 'Must not execute any tests');
});

// Category 6: Edge Cases / Truncation Defense
const edgeCases = ['1abc', '1.5', ' '];
edgeCases.forEach((tier) => {
  check(`P_EDGE: Edge case --tier=${tier} exits with code 1 and error message`, () => {
    const { status, stderr, stdout } = runCLI([`--tier=${tier}`]);
    assert.strictEqual(status, 1, `Exit code must be 1 for edge case --tier=${tier}`);
    assert.ok(
      stderr.includes(`Invalid tier requested: --tier=${tier}. Valid options are 1, 2, 3, 4, 5, 6, 7, 8.`),
      `Expected stderr error message for --tier=${tier}. Actual stderr: ${stderr}`
    );
    assert.ok(!stdout.includes('>>> RUNNING TIER'), 'Must not execute any tests');
  });
});

console.log('-------------------------------------------------------------------------');
console.log(`Matrix Results: ${passedCount} / ${totalCount} passed`);
console.log('=========================================================================');

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  process.exit(0);
}
