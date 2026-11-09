/**
 * ZOPTRO ARCHITECTURE ADVERSARIAL STRESS HARNESS (CHALLENGER 2 - MILESTONE 1)
 *
 * Empirical verification and adversarial stress testing for:
 * 1. Schema Alignment & optionsJson Serialization Integrity (Table 11 CurriculumQuizzes & Table 14 StudentQuestionResponses)
 * 2. Formula Injection Neutralization (CWE-1236) & sanitizeSheetCellValue edge cases
 * 3. Dual-Mode Parity: GAS vs BrowserMockBackend fingerprint divergence, cache collisions, and getGeminiQuotaStatus
 * 4. Architectural Invariants: 0px border-radius, Outfit/Figtree typography, and DOM ID resolution (M6-REG-01)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Setup global mocks for GAS environment
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: () => null,
    insertSheet: (name) => ({
      getName: () => name,
      appendRow: () => {},
      getRange: () => ({
        setValue: () => {},
        setValues: () => {},
        getValues: () => []
      })
    })
  })
};
global.CacheService = {
  getScriptCache: () => ({
    get: () => null,
    put: () => {}
  })
};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: () => "test_key",
    setProperty: () => {}
  })
};
global.LockService = {
  getScriptLock: () => ({
    waitLock: () => true,
    releaseLock: () => true,
    tryLock: () => true
  })
};
global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
  createHtmlOutputFromFile: (name) => ({ name }),
  createHtmlOutput: (html) => ({ html })
};
global.Session = {
  getActiveUser: () => ({ getEmail: () => "admin@zoptro.local" }),
  getScriptTimeZone: () => "GMT+5:30"
};
global.MailApp = {
  sendEmail: () => true
};

const backend = require(path.join(__dirname, "../google_apps_script_backend.js"));

function sha256(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details) {
  if (condition) {
    passedCount++;
    console.log(`  ✔ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✖ [FAIL] ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

console.log("=========================================================================");
console.log("  CHALLENGER 2: EMPIRICAL DUAL-MODE PARITY, SCHEMA & SECURITY HARNESS    ");
console.log("=========================================================================\n");

const docPath = path.join(__dirname, "../docs/gemini_content_generation_architecture_and_syllabus_plan.md");
const docContent = fs.readFileSync(docPath, "utf8");

const htmlPath = path.join(__dirname, "../divyank_mission_control_google_apps_script_app.html");
const htmlContent = fs.readFileSync(htmlPath, "utf8");

// =============================================================================
// TEST SUITE 1: SCHEMA ALIGNMENT & OPTIONSJSON SERIALIZATION INTEGRITY
// =============================================================================
console.log(">>> TEST SUITE 1: Schema Alignment & optionsJson Integrity <<<");

// 1.1 Table 11 CurriculumQuizzes Schema Alignment
const cqSchema = backend.SCHEMAS.CurriculumQuizzes;
const expectedCqCols = [
  "id", "grade", "subject", "examCategory", "title", "questionText",
  "optionsJson", "correctOptionIndex", "hint", "explanation", "orderIndex",
  "isActive", "createdAt", "updatedAt"
];
const cqSchemaMatch = expectedCqCols.every(col => cqSchema.includes(col)) && cqSchema.length === 14;

assert(
  cqSchemaMatch,
  "Empirical Probe 1: Table 11 CurriculumQuizzes schema has exact 14 columns matching blueprint",
  `Found columns: ${cqSchema ? cqSchema.join(", ") : "undefined"}`
);

// 1.2 Table 14 StudentQuestionResponses Schema Alignment
const sqrSchema = backend.SCHEMAS.StudentQuestionResponses;
const expectedSqrCols = [
  "id", "completionId", "studentId", "grade", "contentType", "contentId",
  "questionId", "questionText", "optionsJson", "studentChoiceIndex",
  "studentChoiceText", "correctOptionIndex", "isCorrect", "pointsEarned",
  "explanation", "timeSpentSeconds", "answeredAt"
];
const sqrSchemaMatch = expectedSqrCols.every(col => sqrSchema.includes(col)) && sqrSchema.length === 17;

assert(
  sqrSchemaMatch,
  "Empirical Probe 2: Table 14 StudentQuestionResponses schema has exact 17 columns matching blueprint",
  `Found columns: ${sqrSchema ? sqrSchema.join(", ") : "undefined"}`
);

// 1.3 optionsJson Serialization and Deserialization with Special Characters
const testOptions = [
  "First Option: Simple text",
  "Second Option: With quotes \"and\" special chars <>&%",
  "Third Option: Mathematical +100°C and -50m/s",
  "=SUM(A1:B10)"
];

const serializedOptionsJson = JSON.stringify(testOptions);
// Sanitize through backend function
const sanitizedOptionsJson = backend.sanitizeSheetCellValue(serializedOptionsJson);

assert(
  serializedOptionsJson === sanitizedOptionsJson,
  "Empirical Probe 3: optionsJson is NOT corrupted by sanitizeSheetCellValue (starts with [)",
  `Original: ${serializedOptionsJson.substring(0, 30)}... Sanitized: ${sanitizedOptionsJson.substring(0, 30)}...`
);

let parsedOptions;
try {
  parsedOptions = JSON.parse(sanitizedOptionsJson);
} catch (e) {
  parsedOptions = null;
}

assert(
  parsedOptions !== null && Array.isArray(parsedOptions) && parsedOptions.length === 4,
  "Empirical Probe 4: Deserializing optionsJson recovers all 4 distinct options identically",
  `Parsed length: ${parsedOptions ? parsedOptions.length : 0}`
);

assert(
  parsedOptions && parsedOptions[3] === "=SUM(A1:B10)",
  "Empirical Probe 5: Formula option text '=SUM(A1:B10)' preserves exact string without spreadsheet execution",
  `Option 4 value: ${parsedOptions ? parsedOptions[3] : null}`
);

// =============================================================================
// TEST SUITE 2: CWE-1236 FORMULA INJECTION MITIGATION ANALYSIS
// =============================================================================
console.log("\n>>> TEST SUITE 2: CWE-1236 Formula Injection Neutralization <<<");

// Test dangerous leading characters on cell values
const formulaAttacks = [
  "=1+1",
  "+cmd|' /C calc'!A0",
  "-2+3+cmd|' /C calc'!A0",
  "@SUM(1,2)",
  " =SUM(A1:A10)",
  "   +999",
  "   -50"
];

const allNeutralized = formulaAttacks.every(payload => {
  const sanitized = backend.sanitizeSheetCellValue(payload);
  return typeof sanitized === "string" && sanitized.startsWith("'");
});

assert(
  allNeutralized,
  "Empirical Probe 6: sanitizeSheetCellValue prepends single quote to =, +, -, @ even with leading whitespace",
  `Tested: ${formulaAttacks.join(", ")}`
);

// Edge Case Analysis: Leading Tab and CR behavior in sanitizeSheetCellValue
const tabAttack = "\tTabSeparated";
const crAttack = "\rCarriageReturn";
const sanitizedTab = backend.sanitizeSheetCellValue(tabAttack);
const sanitizedCr = backend.sanitizeSheetCellValue(crAttack);

const tabVulnerabilityFound = !sanitizedTab.startsWith("'") && !sanitizedCr.startsWith("'");
assert(
  tabVulnerabilityFound,
  "Empirical Probe 7 (Vulnerability Discovery): sanitizeSheetCellValue trims input before regex, so bare \\t and \\r are not quote-prefixed",
  `sanitizedTab: ${JSON.stringify(sanitizedTab)}, sanitizedCr: ${JSON.stringify(sanitizedCr)}`
);

// Numbers, booleans, and nulls must remain unmodified
assert(
  backend.sanitizeSheetCellValue(42) === 42 &&
  backend.sanitizeSheetCellValue(true) === true &&
  backend.sanitizeSheetCellValue(null) === null,
  "Empirical Probe 8: Non-string values (numbers, booleans, null) pass through sanitizeSheetCellValue untouched"
);

// =============================================================================
// TEST SUITE 3: DUAL-MODE PARITY DISCREPANCIES (GAS VS BROWSERMOCK)
// =============================================================================
console.log("\n>>> TEST SUITE 3: Dual-Mode Parity Discrepancies (GAS vs Mock) <<<");

// Discrepancy 1: SHA-256 Fingerprint Key Mismatch between GAS and Mock
// In doc Section 1.7 line 549 (GAS):
// sha256("gemini:" + grade + ":" + subject + ":" + chapter + ":" + topic + ":" + type + ":" + quantity + ":" + difficulty)
// In doc Section 1.4.2 line 314 (BrowserMock):
// "mock_cache_" + sha256((payload.gradeClass || "Class 3") + ":" + (payload.subject || "General Science") + ":" + (payload.chapter || "Unit 1") + ":" + (payload.topic || "Core") + ":" + (payload.questionType || "MCQ") + ":" + (payload.quantity || 5))

function gasDocFingerprint(p) {
  return sha256("gemini:" + p.gradeClass + ":" + p.subject + ":" + p.chapter + ":" + p.topic + ":" + p.questionType + ":" + p.quantity + ":" + p.difficulty);
}

function mockDocFingerprint(p) {
  return "mock_cache_" + sha256(p.gradeClass + ":" + p.subject + ":" + p.chapter + ":" + p.topic + ":" + p.questionType + ":" + p.quantity);
}

const reqEasy = {
  gradeClass: "Class 6",
  subject: "Mathematics",
  chapter: "Fractions",
  topic: "Equivalent Fractions",
  questionType: "MCQ",
  quantity: 5,
  difficulty: "Easy"
};

const reqHard = {
  gradeClass: "Class 6",
  subject: "Mathematics",
  chapter: "Fractions",
  topic: "Equivalent Fractions",
  questionType: "MCQ",
  quantity: 5,
  difficulty: "Hard"
};

const mockHashEasy = mockDocFingerprint(reqEasy);
const mockHashHard = mockDocFingerprint(reqHard);

assert(
  mockHashEasy === mockHashHard,
  "Empirical Probe 9 (Parity Flaw): BrowserMock fingerprint omits 'difficulty', causing Easy and Hard requests to collide",
  `Mock Easy: ${mockHashEasy} === Mock Hard: ${mockHashHard}`
);

const gasHashEasy = gasDocFingerprint(reqEasy);
const gasHashHard = gasDocFingerprint(reqHard);

assert(
  gasHashEasy !== gasHashHard,
  "Empirical Probe 10: GAS fingerprint includes 'difficulty', correctly separating Easy and Hard requests",
  `GAS Easy: ${gasHashEasy} !== GAS Hard: ${gasHashHard}`
);

// Discrepancy 2: Interface Contract 2 (getGeminiQuotaStatus) presence
const docHasQuotaStatus = docContent.includes("getGeminiQuotaStatus");
assert(
  !docHasQuotaStatus,
  "Empirical Probe 11 (Contract Omission): getGeminiQuotaStatus is defined in PROJECT.md Contract 2 but omitted from architecture document",
  `Found getGeminiQuotaStatus in doc: ${docHasQuotaStatus}`
);

// Discrepancy 3: Undefined Helper Methods in Mock Specification
const mockHelpers = [
  "_checkMockRateLimits",
  "_getCacheItem",
  "_setCacheItem",
  "_synthesizeCurriculumQuestions",
  "_recordMockTokenLog"
];

const mockHelperImplementations = mockHelpers.filter(helper => {
  // Check if the doc actually defines the implementation
  const regex = new RegExp(`BrowserMockBackend\\.${helper}|function\\s+${helper}`, "i");
  return regex.test(docContent);
});

assert(
  mockHelperImplementations.length === 0,
  "Empirical Probe 12 (Specification Gap): 5 internal helper methods called by BrowserMockBackend snippet have no implementation specifications",
  `Unspecified helper methods: ${mockHelpers.join(", ")}`
);

// =============================================================================
// TEST SUITE 4: INVARIANTS, BRAND DISCIPLINE & DOM ELEMENT ID RESOLUTION
// =============================================================================
console.log("\n>>> TEST SUITE 4: Invariants, Brand Discipline & M6-REG-01 <<<");

// 4.1 Universal 0px border-radius in CSS
const hasZeroRadiusRule = /\*\s*\{[^}]*border-radius:\s*0px\s*!important/i.test(htmlContent);
assert(
  hasZeroRadiusRule,
  "Empirical Probe 13: SPA enforces universal 0px border-radius via global CSS rule (* { border-radius: 0px !important; })"
);

// 4.2 Typography: Outfit and Figtree
const hasOutfit = htmlContent.includes("Outfit");
const hasFigtree = htmlContent.includes("Figtree");
assert(
  hasOutfit && hasFigtree,
  "Empirical Probe 14: SPA configures and imports Outfit (display) and Figtree (body) fonts"
);

// 4.3 M6-REG-01 DOM ID resolution invariant
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, "");
const mainScriptIndex = htmlContent.lastIndexOf(lastScriptTag);
const htmlMarkup = htmlContent.slice(0, mainScriptIndex);

const parsedIds = new Set();
const idRegex = /\bid=["']([^"']+)["']/g;
let match;
while ((match = idRegex.exec(htmlMarkup)) !== null) {
  parsedIds.add(match[1]);
}

const scriptIds = [...scriptContent.matchAll(/document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
const missingIds = new Set();
scriptIds.forEach(id => {
  if (!parsedIds.has(id)) {
    missingIds.add(id);
  }
});

assert(
  missingIds.size === 0,
  "Empirical Probe 15: M6-REG-01 strictly passes currently in HTML SPA (0 missing DOM IDs)",
  `Missing IDs count: ${missingIds.size}`
);

// 4.4 New DOM IDs proposed in blueprint do not conflict with existing IDs
const proposedBlueprintIds = [
  "adminTabBtnAiGenerate",
  "adminAiGenerateContainer",
  "aiGenTokenStatsBanner",
  "aiGenPreviewContainer",
  "geminiGradeSelect",
  "geminiSubjectSelect",
  "geminiChapterSelect",
  "geminiTopicSelect",
  "geminiBloomSelect",
  "geminiDifficultySelect"
];

const existingCollisions = proposedBlueprintIds.filter(id => parsedIds.has(id));
assert(
  existingCollisions.length === 0,
  "Empirical Probe 16: All 10 proposed DOM IDs in blueprint are fresh and do not collide with existing DOM elements",
  `Collisions: ${existingCollisions.join(", ")}`
);

// =============================================================================
// SUMMARY
// =============================================================================
console.log("\n=========================================================================");
console.log(`TOTAL PROBES: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("=========================================================================\n");

process.exit(failedCount > 0 ? 1 : 0);
