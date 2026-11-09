/**
 * ADVERSARIAL STRESS TEST SUITE: MILESTONE 2
 * Security, RBAC, CWE-1236 Formula Injection & Fault Tolerance
 *
 * Target: google_apps_script_backend.js
 * Runner: Node.js (CLI / Master Test Suite integration)
 */

const assert = require("assert");

// =========================================================================
// SECTION 0: IN-MEMORY SPREADSHEET & GAS SIMULATOR SETUP
// =========================================================================
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

const mockActiveSpreadsheet = new MockSpreadsheet();

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockActiveSpreadsheet,
  BorderStyle: { SOLID: 'SOLID' }
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: () => true
  })
};

// Global ScriptProperties mock
const _mockProperties = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => _mockProperties[k] || null,
    setProperty: (k, v) => { _mockProperties[k] = String(v); },
    deleteProperty: (k) => { delete _mockProperties[k]; }
  })
};

const backend = require("../google_apps_script_backend.js");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function runTest(suite, testName, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`  [PASS] ${suite} > ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${suite} > ${testName}: ${err.message}`);
    failureDetails.push({ suite, testName, error: err.message, stack: err.stack });
  }
}

console.log("=========================================================================");
console.log("  MILESTONE 2 ADVERSARIAL STRESS & SECURITY HARNESS (m2_challenger_2)");
console.log("=========================================================================\n");

// Initialize in-memory database and seed admin
backend.initializeDatabase();

// =========================================================================
// SECTION 1: FORMULA INJECTION MITIGATION (CWE-1236)
// =========================================================================
console.log(">>> SECTION 1: Formula Injection (CWE-1236) Sanitization <<<");

runTest("CWE-1236", "Direct sanitizeSheetCellValue prepends single quote to dangerous leading characters", () => {
  const attackVectors = [
    { input: "=1+1", expected: "'=1+1" },
    { input: "=SUM(A1:A10)", expected: "'=SUM(A1:A10)" },
    { input: "+cmd|' /C calc'!A0", expected: "'+cmd|' /C calc'!A0" },
    { input: "-2+3+cmd|' /C calc'!A0", expected: "'-2+3+cmd|' /C calc'!A0" },
    { input: "@eval('process.exit(1)')", expected: "'@eval('process.exit(1)')" },
    { input: "\t=HYPERLINK(\"http://evil.com\")", expected: "'\t=HYPERLINK(\"http://evil.com\")" },
    { input: "\r=1+1", expected: "'\r=1+1" },
    { input: "  =SUM(1,2)", expected: "'  =SUM(1,2)" },
    { input: "   +12345", expected: "'   +12345" },
    { input: "   -danger", expected: "'   -danger" },
    { input: "   @danger", expected: "'   @danger" }
  ];

  for (const v of attackVectors) {
    const res = backend.sanitizeSheetCellValue(v.input);
    assert.strictEqual(res, v.expected, `Failed for input: ${JSON.stringify(v.input)}. Got: ${JSON.stringify(res)}`);
  }
});

runTest("CWE-1236", "Direct sanitizeSheetCellValue does not double-escape already quoted or benign values", () => {
  // Already single-quoted formula
  assert.strictEqual(backend.sanitizeSheetCellValue("'=SUM(A1)"), "'=SUM(A1)");
  // Benign alphanumeric strings
  assert.strictEqual(backend.sanitizeSheetCellValue("Mathematics"), "Mathematics");
  assert.strictEqual(backend.sanitizeSheetCellValue("Class 5"), "Class 5");
  assert.strictEqual(backend.sanitizeSheetCellValue("Photosynthesis"), "Photosynthesis");
  // Numbers must not be converted or quoted
  assert.strictEqual(backend.sanitizeSheetCellValue(42), 42);
  assert.strictEqual(backend.sanitizeSheetCellValue(-15), -15);
  assert.strictEqual(backend.sanitizeSheetCellValue(0), 0);
  assert.strictEqual(backend.sanitizeSheetCellValue(3.1415), 3.1415);
  // Booleans and null
  assert.strictEqual(backend.sanitizeSheetCellValue(true), true);
  assert.strictEqual(backend.sanitizeSheetCellValue(false), false);
  assert.strictEqual(backend.sanitizeSheetCellValue(null), null);
  assert.strictEqual(backend.sanitizeSheetCellValue(undefined), undefined);
});

runTest("CWE-1236", "recordGeminiTokenUsageLog sanitizes all string fields before sheet insertion", () => {
  const maliciousEntry = {
    adminUserId: "=DDE('cmd';'/C calc';'test')",
    model: "+gemini-pro-evil",
    grade: "-Class 10",
    subject: "@MaliciousSubject",
    topic: "=SUM(A1:A100)",
    questionType: "+MCQ_INJECT",
    status: "=NOW()",
    quantity: 5,
    promptTokens: 100,
    candidateTokens: 200,
    cachedFlag: false,
    latencyMs: 50
  };

  const logged = backend.recordGeminiTokenUsageLog(maliciousEntry);
  assert(logged.adminUserId.startsWith("'="), `adminUserId not sanitized: ${logged.adminUserId}`);
  assert(logged.model.startsWith("'+"), `model not sanitized: ${logged.model}`);
  assert(logged.grade.startsWith("'-"), `grade not sanitized: ${logged.grade}`);
  assert(logged.subject.startsWith("'@"), `subject not sanitized: ${logged.subject}`);
  assert(logged.topic.startsWith("'="), `topic not sanitized: ${logged.topic}`);
  assert(logged.questionType.startsWith("'+"), `questionType not sanitized: ${logged.questionType}`);
  assert(logged.status.startsWith("'="), `status not sanitized: ${logged.status}`);
});

runTest("CWE-1236", "appendSheetRecord automatically sanitizes any column write in GeminiTokenLogs", () => {
  const entry = {
    id: "=tok_inject_1",
    timestamp: "+2026-11-07T19:00:00Z",
    adminUserId: "@admin_pwn",
    model: "-model_calc",
    grade: "=Class 5",
    subject: "+Physics",
    topic: "@Magnetism",
    questionType: "=MCQ",
    quantity: 10,
    promptTokens: 50,
    candidateTokens: 50,
    totalTokens: 100,
    cachedFlag: false,
    status: "=SUCCESS",
    latencyMs: 120
  };

  backend.appendSheetRecord("GeminiTokenLogs", entry);
  const rows = backend.getSheetRecords("GeminiTokenLogs");
  const written = rows.find(r => r.id === "'=tok_inject_1");
  assert(written, "Record was not appended with sanitized ID");
  assert(written.timestamp.startsWith("'+"), `timestamp not sanitized: ${written.timestamp}`);
  assert(written.adminUserId.startsWith("'@"), `adminUserId not sanitized: ${written.adminUserId}`);
  assert(written.model.startsWith("'-"), `model not sanitized: ${written.model}`);
  assert(written.grade.startsWith("'="), `grade not sanitized: ${written.grade}`);
  assert(written.subject.startsWith("'+"), `subject not sanitized: ${written.subject}`);
  assert(written.topic.startsWith("'@"), `topic not sanitized: ${written.topic}`);
  assert(written.questionType.startsWith("'="), `questionType not sanitized: ${written.questionType}`);
  assert(written.status.startsWith("'="), `status not sanitized: ${written.status}`);
});

// =========================================================================
// SECTION 2: RBAC ENFORCEMENT (403 ON NON-ADMIN)
// =========================================================================
console.log("\n>>> SECTION 2: RBAC Enforcement (HTTP 403) <<<");

// Create test student and parent users for adversarial identity testing
const testUsers = backend.getSheetRecords("Users");
let testStudent = testUsers.find(u => u.role === "student");
let testParent = testUsers.find(u => u.role === "parent");

if (!testStudent) {
  backend.appendSheetRecord("Users", {
    id: "u_stu_adversarial",
    fullName: "Adversarial Student",
    email: "student@zoptro.local",
    role: "student",
    grade: "Class 5",
    activeStatus: true
  });
  testStudent = { id: "u_stu_adversarial" };
}
if (!testParent) {
  backend.appendSheetRecord("Users", {
    id: "u_par_adversarial",
    fullName: "Adversarial Parent",
    email: "parent@zoptro.local",
    role: "parent",
    activeStatus: true
  });
  testParent = { id: "u_par_adversarial" };
}

const nonAdminIdentities = [
  { desc: "undefined adminUserId", val: undefined },
  { desc: "null adminUserId", val: null },
  { desc: "empty string adminUserId", val: "" },
  { desc: "whitespace-only adminUserId", val: "    " },
  { desc: "nonexistent user ID", val: "u_ghost_99999" },
  { desc: "genuine student user ID", val: testStudent.id },
  { desc: "genuine parent user ID", val: testParent.id },
  { desc: "role injection payload", val: "u_adm_demo' OR role='admin" },
  { desc: "numeric user ID", val: 123456 }
];

for (const idObj of nonAdminIdentities) {
  runTest("RBAC", `generateCurriculumQuestionsWithGemini rejects ${idObj.desc} with HTTP 403`, () => {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: idObj.val,
      gradeClass: "Class 4",
      subject: "Science",
      topic: "Plants",
      quantity: 2
    });
    assert.strictEqual(res.success, false, `Expected success=false for ${idObj.desc}`);
    assert.strictEqual(res.code, 403, `Expected HTTP 403 for ${idObj.desc}, got ${res.code}`);
    assert(res.error && res.error.includes("Admin privileges required"), `Unexpected error message: ${res.error}`);
  });

  runTest("RBAC", `getGeminiQuotaStatus rejects ${idObj.desc} with HTTP 403`, () => {
    const res = backend.getGeminiQuotaStatus({
      adminUserId: idObj.val
    });
    assert.strictEqual(res.success, false, `Expected success=false for ${idObj.desc}`);
    assert.strictEqual(res.code, 403, `Expected HTTP 403 for ${idObj.desc}, got ${res.code}`);
    assert(res.error && res.error.includes("Admin privileges required"), `Unexpected error message: ${res.error}`);
  });
}

runTest("RBAC", "Legitimate admin (u_adm_demo) passes assertAdmin authorization check", () => {
  const check = backend.assertAdmin("u_adm_demo");
  assert.strictEqual(check.success, true, "Valid admin check should succeed");
  assert.strictEqual(check.role, "admin");
});

// =========================================================================
// SECTION 3: API KEY SECURITY (HTTP 401 ON MISSING KEY)
// =========================================================================
console.log("\n>>> SECTION 3: API Key Security (HTTP 401) <<<");

runTest("Auth", "Missing API key with forceRefresh returns HTTP 401 Unauthorized", () => {
  // Ensure global script properties do NOT have GEMINI_API_KEY set
  delete _mockProperties["GEMINI_API_KEY"];

  const missingKeyPayloads = [
    { desc: "omitted apiKey", payload: { adminUserId: "u_adm_demo", forceRefresh: true } },
    { desc: "empty string apiKey", payload: { adminUserId: "u_adm_demo", apiKey: "", forceRefresh: true } },
    { desc: "whitespace-only apiKey", payload: { adminUserId: "u_adm_demo", apiKey: "   \t\n  ", forceRefresh: true } },
    { desc: "null apiKey", payload: { adminUserId: "u_adm_demo", apiKey: null, forceRefresh: true } }
  ];

  for (const item of missingKeyPayloads) {
    const res = backend.generateCurriculumQuestionsWithGemini(item.payload);
    assert.strictEqual(res.success, false, `Should fail for ${item.desc}`);
    assert.strictEqual(res.code, 401, `Expected HTTP 401 for ${item.desc}, got ${res.code}`);
    assert(res.error && res.error.includes("MISSING_API_KEY"), `Expected MISSING_API_KEY error for ${item.desc}, got: ${res.error}`);
    assert(res.rateLimits && typeof res.rateLimits.rpmRemaining === "number", "Should include rateLimits in 401 response");
  }
});

// =========================================================================
// SECTION 4: MARKDOWN CODE FENCE STRIPPING & MALFORMED LLM RESPONSES
// =========================================================================
console.log("\n>>> SECTION 4: Markdown Fence Stripping & Malformed Responses <<<");

runTest("FenceStripping", "stripMarkdownFences strips standard ```json ... ``` fences", () => {
  const input = "```json\n[\n  {\"title\": \"Q1\"}\n]\n```";
  const expected = "[\n  {\"title\": \"Q1\"}\n]";
  assert.strictEqual(backend.stripMarkdownFences(input), expected);
});

runTest("FenceStripping", "stripMarkdownFences handles case-insensitive ```JSON and plain ``` fences", () => {
  const upper = "```JSON\n[1, 2, 3]\n```";
  assert.strictEqual(backend.stripMarkdownFences(upper), "[1, 2, 3]");

  const plain = "```\n{\"key\": \"val\"}\n```";
  assert.strictEqual(backend.stripMarkdownFences(plain), "{\"key\": \"val\"}");
});

runTest("FenceStripping", "stripMarkdownFences handles leading and trailing whitespaces and newlines", () => {
  const messy = "\n\n   ```json\n[{\"test\": 1}]\n```   \n\n";
  assert.strictEqual(backend.stripMarkdownFences(messy), "[{\"test\": 1}]");
});

runTest("FenceStripping", "stripMarkdownFences handles raw JSON strings without code fences", () => {
  const raw = "   [{\"title\": \"Direct JSON\"}]   ";
  assert.strictEqual(backend.stripMarkdownFences(raw), "[{\"title\": \"Direct JSON\"}]");
});

runTest("FenceStripping", "stripMarkdownFences handles BOM marker (\\uFEFF)", () => {
  const withBom = "\uFEFF```json\n[{\"title\": \"With BOM\"}]\n```";
  const stripped = backend.stripMarkdownFences(withBom);
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch (e) {
    assert.fail(`Failed to parse stripped text containing BOM: ${e.message}. Stripped text: ${JSON.stringify(stripped)}`);
  }
  assert.deepStrictEqual(parsed, [{ title: "With BOM" }]);
});

runTest("FenceStripping", "stripMarkdownFences handles null, undefined, and non-string inputs safely", () => {
  assert.strictEqual(backend.stripMarkdownFences(null), "");
  assert.strictEqual(backend.stripMarkdownFences(undefined), "");
  assert.strictEqual(backend.stripMarkdownFences(12345), "");
  assert.strictEqual(backend.stripMarkdownFences({}), "");
});

// =========================================================================
// SECTION 5: INGESTION BRIDGE (transformGeneratedItemsForBulkUpload)
// =========================================================================
console.log("\n>>> SECTION 5: Ingestion Bridge & Schema Parity <<<");

runTest("IngestionBridge", "transformGeneratedItemsForBulkUpload conforms to SCHEMAS.CurriculumQuizzes", () => {
  const generationResult = {
    items: [
      {
        title: "=Photosynthesis in Plants",
        questionText: "+What is the green pigment in leaves?",
        options: ["-Chlorophyll", "@Hemoglobin", "=Carotenoid", "+Melanin"],
        correctOptionIndex: 0,
        hint: "=Look at the green color",
        explanation: "-Chlorophyll absorbs sunlight",
        bloomLevel: "Remembering",
        difficulty: "Easy"
      }
    ]
  };

  const uploadPayload = backend.transformGeneratedItemsForBulkUpload("u_adm_demo", generationResult, {
    gradeClass: "Class 4",
    subject: "Science",
    chapter: "Plant Life",
    topic: "Photosynthesis"
  });

  assert.strictEqual(uploadPayload.adminUserId, "u_adm_demo");
  assert.strictEqual(uploadPayload.contentType, "CurriculumQuizzes");
  assert.strictEqual(uploadPayload.items.length, 1);

  const item = uploadPayload.items[0];
  const requiredFields = [
    "id", "grade", "subject", "examCategory", "title",
    "questionText", "optionsJson", "correctOptionIndex",
    "hint", "explanation", "orderIndex", "isActive"
  ];

  for (const field of requiredFields) {
    assert(item[field] !== undefined, `Missing required CurriculumQuizzes field: ${field}`);
  }

  assert.strictEqual(item.grade, "Class 4");
  assert.strictEqual(item.subject, "Science");
  assert.strictEqual(item.examCategory, "CBSE");
  assert.strictEqual(item.correctOptionIndex, 0);
  assert.strictEqual(typeof item.optionsJson, "string");
  const parsedOptions = JSON.parse(item.optionsJson);
  assert.strictEqual(parsedOptions.length, 4);
});

runTest("IngestionBridge", "bulkUploadContentBatch commits transformed items into CurriculumQuizzes table", () => {
  const generationResult = {
    items: [
      {
        title: "Laws of Motion Test Question",
        questionText: "What is Newton's First Law?",
        options: ["Inertia", "Force", "Action-Reaction", "Gravity"],
        correctOptionIndex: 0,
        hint: "Also known as law of inertia",
        explanation: "An object remains at rest unless acted upon by an external force.",
        bloomLevel: "Understanding",
        difficulty: "Medium"
      }
    ]
  };

  const uploadPayload = backend.transformGeneratedItemsForBulkUpload("u_adm_demo", generationResult, {
    gradeClass: "Class 9",
    subject: "Physics",
    chapter: "Force and Laws of Motion",
    topic: "Newton's First Law"
  });

  const commitResult = backend.bulkUploadContentBatch(uploadPayload);
  assert.strictEqual(commitResult.success, true, `Commit failed: ${commitResult.error}`);
  assert.strictEqual(commitResult.importedCount, 1);
  assert.strictEqual(commitResult.contentType, "CurriculumQuizzes");

  // Verify item in sheet records
  const quizzes = backend.getSheetRecords("CurriculumQuizzes");
  const found = quizzes.find(q => q.title === "Laws of Motion Test Question");
  assert(found, "Saved question not found in CurriculumQuizzes sheet records");
  assert.strictEqual(found.grade, "Class 9");
  assert.strictEqual(found.subject, "Physics");
  assert.strictEqual(found.examCategory, "CBSE");
});

runTest("IngestionBridge", "bulkUploadContentBatch sanitizes formula injection vectors on commit", () => {
  const maliciousGenerationResult = {
    items: [
      {
        grade: "=Class 8",
        title: "=INJECT_TITLE",
        questionText: "+INJECT_QUESTION",
        options: ["-OPT_A", "@OPT_B", "=OPT_C", "+OPT_D"],
        correctOptionIndex: 1,
        hint: "@INJECT_HINT",
        explanation: "=INJECT_EXPLANATION"
      }
    ]
  };

  const uploadPayload = backend.transformGeneratedItemsForBulkUpload("u_adm_demo", maliciousGenerationResult, {
    gradeClass: "=Class 8",
    subject: "+Malicious_Subject",
    chapter: "-Malicious_Chapter",
    topic: "@Malicious_Topic"
  });

  const commitResult = backend.bulkUploadContentBatch(uploadPayload);
  assert.strictEqual(commitResult.success, true);

  const quizzes = backend.getSheetRecords("CurriculumQuizzes");
  const stored = quizzes.find(q => q.title === "'=INJECT_TITLE");
  assert(stored, "Stored item with sanitized title not found");
  assert(stored.questionText.startsWith("'+"), `questionText not sanitized: ${stored.questionText}`);
  assert(stored.hint.startsWith("'@"), `hint not sanitized: ${stored.hint}`);
  assert(stored.explanation.startsWith("'="), `explanation not sanitized: ${stored.explanation}`);
  assert(stored.grade.startsWith("'="), `grade not sanitized: ${stored.grade}`);
  assert(stored.subject.startsWith("'+"), `subject not sanitized: ${stored.subject}`);
});

// =========================================================================
// SECTION 6: ADDITIONAL ADVERSARIAL ATTACK ANGLES
// =========================================================================
console.log("\n>>> SECTION 6: Additional Adversarial Attack Angles <<<");

runTest("Adversarial", "Rate limiter sliding window bounds: 16th request rejected within 60s", () => {
  const model = "gemini-adversarial-test-" + Date.now();
  // Clear any cache keys for this model
  for (let i = 1; i <= 15; i++) {
    const decision = backend.checkAndIncrementRateLimit(model, true);
    assert.strictEqual(decision.allowed, true, `Request ${i} should be allowed`);
    assert.strictEqual(decision.rpmCurrent, i);
  }
  // 16th request in same window
  const blocked = backend.checkAndIncrementRateLimit(model, true);
  assert.strictEqual(blocked.allowed, false, "16th request must be rate limited");
  assert.strictEqual(blocked.rpmRemaining, 0);
  assert(blocked.retryAfterSeconds > 0, "retryAfterSeconds should be > 0");
  assert(blocked.error && blocked.error.includes("RATE_LIMIT_EXCEEDED"));
});

runTest("Adversarial", "Deduplication Cache 10-Tuple Fingerprint collision resistance", () => {
  const base = {
    model: "gemini-1.5-flash",
    gradeClass: "Class 5",
    subject: "Science",
    chapter: "Food",
    topic: "Components",
    questionType: "MCQ",
    quantity: 5,
    difficulty: "Medium",
    bloomLevel: "Understanding"
  };

  const fpBase = backend.computeGeminiCacheFingerprint(base);

  // Altering each dimension individually must produce a distinct SHA-256
  const variations = [
    { ...base, model: "gemini-2.0-flash" },
    { ...base, gradeClass: "Class 6" },
    { ...base, subject: "Social Science" },
    { ...base, chapter: "Nutrition" },
    { ...base, topic: "Vitamins" },
    { ...base, questionType: "SHORT_ANSWER" },
    { ...base, quantity: 10 },
    { ...base, difficulty: "Hard" },
    { ...base, bloomLevel: "Evaluating" }
  ];

  for (let i = 0; i < variations.length; i++) {
    const fpVar = backend.computeGeminiCacheFingerprint(variations[i]);
    assert.notStrictEqual(fpVar, fpBase, `Fingerprint collision detected on variation index ${i}`);
  }
});

runTest("Adversarial", "Distractor integrity: MCQ with 1 option padded to 4; >4 options truncated to 4", () => {
  // Mock Gemini API call response via UrlFetchApp mock
  const originalFetch = global.UrlFetchApp;
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: "Q_underflow",
                  questionText: "What is H2O?",
                  options: ["Water"], // only 1 option!
                  correctOptionIndex: 0,
                  hint: "Common liquid",
                  explanation: "H2O is water"
                },
                {
                  title: "Q_overflow",
                  questionText: "Select one:",
                  options: ["A", "B", "C", "D", "E", "F"], // 6 options!
                  correctOptionIndex: 5, // out of range after truncation to 4
                  hint: "Hint",
                  explanation: "Explanation"
                }
              ])
            }]
          }
        }]
      })
    })
  };

  try {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "dummy_key",
      forceRefresh: true,
      questionType: "MCQ"
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.items.length, 2);

    // Q_underflow: padded to 4 options
    assert.strictEqual(res.items[0].options.length, 4, `Expected 4 options, got ${res.items[0].options.length}`);
    assert.strictEqual(res.items[0].options[0], "Water");
    assert.strictEqual(res.items[0].options[1], "Option B");

    // Q_overflow: truncated to 4 options and correctOptionIndex bounded
    assert.strictEqual(res.items[1].options.length, 4, `Expected 4 options, got ${res.items[1].options.length}`);
    assert.strictEqual(res.items[1].options.join(","), "A,B,C,D");
    assert(res.items[1].correctOptionIndex >= 0 && res.items[1].correctOptionIndex < 4, `correctOptionIndex out of bounds: ${res.items[1].correctOptionIndex}`);
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "generateCurriculumQuestionsWithGemini with autoCommit=true commits directly to CurriculumQuizzes", () => {
  const originalFetch = global.UrlFetchApp;
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 240, totalTokenCount: 360 },
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: "AutoCommit Quiz Item 1",
                  questionText: "What gas do plants absorb?",
                  options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Argon"],
                  correctOptionIndex: 0,
                  hint: "CO2",
                  explanation: "Plants take in carbon dioxide during photosynthesis."
                }
              ])
            }]
          }
        }]
      })
    })
  };

  try {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "dummy_key",
      forceRefresh: true,
      autoCommit: true,
      gradeClass: "Class 6",
      subject: "Biology",
      chapter: "Photosynthesis",
      topic: "Gas Exchange"
    });

    assert.strictEqual(res.success, true);
    assert(res.bulkUploadResult, "Expected bulkUploadResult in response");
    assert.strictEqual(res.bulkUploadResult.success, true);
    assert.strictEqual(res.bulkUploadResult.importedCount, 1);

    const quizzes = backend.getSheetRecords("CurriculumQuizzes");
    const found = quizzes.find(q => q.title === "AutoCommit Quiz Item 1");
    assert(found, "Auto-committed quiz not found in CurriculumQuizzes table");
    assert.strictEqual(found.grade, "Class 6");
    assert.strictEqual(found.subject, "Biology");
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "Full-pipeline formula injection: LLM output with formula payloads is fully sanitized on commit and logging", () => {
  const originalFetch = global.UrlFetchApp;
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 80, totalTokenCount: 130 },
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: "=SUM(1,2)",
                  questionText: "+cmd|'/C calc'!A0",
                  options: ["-OptionA", "@OptionB", "=OptionC", "+OptionD"],
                  correctOptionIndex: 1,
                  hint: "@SecretFormula",
                  explanation: "=EXPLANATION_FORMULA"
                }
              ])
            }]
          }
        }]
      })
    })
  };

  try {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "dummy_key",
      forceRefresh: true,
      autoCommit: true,
      gradeClass: "Class 7",
      subject: "=MaliciousSubject",
      chapter: "+MaliciousChapter",
      topic: "@MaliciousTopic"
    });

    assert.strictEqual(res.success, true);
    const item = res.items[0];
    assert(item.title.startsWith("'="), `title not sanitized: ${item.title}`);
    assert(item.questionText.startsWith("'+"), `questionText not sanitized: ${item.questionText}`);
    assert(item.hint.startsWith("'@"), `hint not sanitized: ${item.hint}`);
    assert(item.explanation.startsWith("'="), `explanation not sanitized: ${item.explanation}`);

    // Verify written to CurriculumQuizzes
    const quizzes = backend.getSheetRecords("CurriculumQuizzes");
    const stored = quizzes.find(q => q.title === "'=SUM(1,2)");
    assert(stored, "Stored quiz record not found with sanitized title");
    assert(stored.questionText.startsWith("'+"), `stored questionText not sanitized: ${stored.questionText}`);

    // Verify written to GeminiTokenLogs
    const tokenLogs = backend.getSheetRecords("GeminiTokenLogs");
    const lastLog = tokenLogs[tokenLogs.length - 1];
    assert(lastLog.subject.startsWith("'="), `tokenLog subject not sanitized: ${lastLog.subject}`);
    assert(lastLog.topic.startsWith("'@"), `tokenLog topic not sanitized: ${lastLog.topic}`);
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "Upstream API error handling: Google 400 error returns HTTP 400 and logs ERROR status", () => {
  const originalFetch = global.UrlFetchApp;
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 400,
      getContentText: () => JSON.stringify({
        error: { code: 400, message: "API_KEY_INVALID", status: "INVALID_ARGUMENT" }
      })
    })
  };

  try {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "bad_key",
      forceRefresh: true
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 400);
    assert(res.error.includes("API_KEY_INVALID"));

    // Check that ERROR was recorded in token logs
    const logs = backend.getSheetRecords("GeminiTokenLogs");
    const errLog = logs[logs.length - 1];
    assert.strictEqual(errLog.status, "ERROR");
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "Safety filter blocked response returns HTTP 422", () => {
  const originalFetch = global.UrlFetchApp;
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{
          finishReason: "SAFETY",
          content: { parts: [{ text: "" }] }
        }]
      })
    })
  };

  try {
    const res = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "valid_key",
      forceRefresh: true
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 422);
    assert(res.error.includes("SAFETY_BLOCKED"));
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "LLM JSON wrapping variations: unwraps { items: [...] } and { questions: [...] }", () => {
  const originalFetch = global.UrlFetchApp;

  // Test 1: { items: [...] }
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                items: [
                  { title: "Wrapped in items", questionText: "Q?", options: ["A", "B", "C", "D"], correctOptionIndex: 0, hint: "H", explanation: "E" }
                ]
              })
            }]
          }
        }]
      })
    })
  };

  try {
    const res1 = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "valid_key",
      forceRefresh: true
    });
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.items.length, 1);
    assert.strictEqual(res1.items[0].title, "Wrapped in items");
  } finally {
    global.UrlFetchApp = originalFetch;
  }

  // Test 2: { questions: [...] }
  global.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                questions: [
                  { title: "Wrapped in questions", questionText: "Q?", options: ["A", "B", "C", "D"], correctOptionIndex: 1, hint: "H", explanation: "E" }
                ]
              })
            }]
          }
        }]
      })
    })
  };

  try {
    const res2 = backend.generateCurriculumQuestionsWithGemini({
      adminUserId: "u_adm_demo",
      apiKey: "valid_key",
      forceRefresh: true
    });
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.items.length, 1);
    assert.strictEqual(res2.items[0].title, "Wrapped in questions");
  } finally {
    global.UrlFetchApp = originalFetch;
  }
});

runTest("Adversarial", "getGeminiQuotaStatus satisfies Interface Contract 2 exact telemetry", () => {
  const status = backend.getGeminiQuotaStatus({ adminUserId: "u_adm_demo" });
  assert.strictEqual(status.success, true);
  assert.strictEqual(status.model, "gemini-1.5-flash");
  assert.strictEqual(status.rpmLimit, 15);
  assert.strictEqual(status.rpdLimit, 1500);
  assert.strictEqual(typeof status.rpmCurrent, "number");
  assert.strictEqual(typeof status.rpmRemaining, "number");
  assert.strictEqual(status.rpmCurrent + status.rpmRemaining, status.rpmLimit);
  assert.strictEqual(typeof status.rpdCurrent, "number");
  assert.strictEqual(typeof status.rpdRemaining, "number");
  assert.strictEqual(status.rpdCurrent + status.rpdRemaining, status.rpdLimit);
  assert.strictEqual(typeof status.totalTokensLogged, "number");
  assert.strictEqual(typeof status.totalCallsLogged, "number");
  assert.strictEqual(typeof status.cacheHitCount, "number");
  assert(status.totalCallsLogged >= 0);
  assert(status.totalTokensLogged >= 0);
});

// =========================================================================
// SUMMARY & EXIT
// =========================================================================
console.log("\n=========================================================================");
console.log(`TOTAL ADVERSARIAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log("=========================================================================\n");

if (failedTests > 0) {
  console.error("FAILURES DETECTED:");
  for (const f of failureDetails) {
    console.error(`- [${f.suite}] ${f.testName}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log("ALL ADVERSARIAL STRESS TESTS COMPLETED WITH 100% SUCCESS!");
  process.exit(0);
}
