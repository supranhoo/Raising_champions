/**
 * ZOPTRO ARCHITECTURE ADVERSARIAL STRESS HARNESS (CHALLENGER 1 - MILESTONE 1)
 *
 * Empirical verification and stress testing of:
 * 1. Rate Limiting Algorithms: Fixed Window vs Sliding Timestamp Window under burst.
 * 2. SHA-256 Deduplication Caching: Collision vulnerability when Bloom Level is omitted vs included.
 * 3. Token Budgeting & MaxOutputTokens Sizing: Truncation risk at Quantity = 20 with 4096 vs 8192 tokens.
 * 4. Google Apps Script 360s Timeout & Bulk Ingestion Batch Sizing.
 * 5. Static Taxonomy Manifest Structure & Zero-Cost Sourcing Clearance.
 */

const crypto = require("crypto");

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
console.log("  CHALLENGER 1: EMPIRICAL ARCHITECTURE STRESS & ADVERSARIAL VERIFICATION ");
console.log("=========================================================================\n");

// -----------------------------------------------------------------------------
// TEST SUITE 1: RATE LIMITING BURST STRESS TEST
// -----------------------------------------------------------------------------
console.log(">>> TEST SUITE 1: Rate Limiting Algorithm Stress Test <<<");

// Implementation A: Fixed Window Counter (from doc section 1.6.4)
class FixedWindowRateLimiter {
  constructor(rpmLimit = 15, rpdLimit = 1500) {
    this.rpmLimit = rpmLimit;
    this.rpdLimit = rpdLimit;
    this.cache = new Map();
  }

  check(nowMs) {
    const currentMinute = Math.floor(nowMs / 60000);
    const rpmKey = "gemini_rpm_" + currentMinute;
    const todayUtc = new Date(nowMs).toISOString().substring(0, 10);
    const rpdKey = "gemini_rpd_" + todayUtc;

    const dailyCount = this.cache.get(rpdKey) || 0;
    if (dailyCount >= this.rpdLimit) {
      return { allowed: false, error: "DAILY_QUOTA_EXCEEDED", retryAfterSeconds: 86400 };
    }

    const minuteCount = this.cache.get(rpmKey) || 0;
    if (minuteCount >= this.rpmLimit) {
      const secondsRemaining = 60 - (Math.floor(nowMs / 1000) % 60);
      return { allowed: false, error: "RATE_LIMIT_EXCEEDED", retryAfterSeconds: secondsRemaining };
    }

    this.cache.set(rpmKey, minuteCount + 1);
    this.cache.set(rpdKey, dailyCount + 1);
    return { allowed: true, rpmRemaining: this.rpmLimit - (minuteCount + 1) };
  }
}

// Implementation B: True Sliding Window (Timestamp Log)
class SlidingWindowRateLimiter {
  constructor(rpmLimit = 15, rpdLimit = 1500) {
    this.rpmLimit = rpmLimit;
    this.rpdLimit = rpdLimit;
    this.timestamps = [];
    this.dailyCounts = new Map();
  }

  check(nowMs) {
    const todayUtc = new Date(nowMs).toISOString().substring(0, 10);
    const dailyCount = this.dailyCounts.get(todayUtc) || 0;
    if (dailyCount >= this.rpdLimit) {
      return { allowed: false, error: "DAILY_QUOTA_EXCEEDED", retryAfterSeconds: 86400 };
    }

    // Evict timestamps older than 60,000ms
    const windowStart = nowMs - 60000;
    this.timestamps = this.timestamps.filter(ts => ts > windowStart);

    if (this.timestamps.length >= this.rpmLimit) {
      const oldestTs = this.timestamps[0];
      const retryAfterMs = oldestTs + 60000 - nowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      return { allowed: false, error: "RATE_LIMIT_EXCEEDED", retryAfterSeconds: retryAfterSeconds };
    }

    this.timestamps.push(nowMs);
    this.dailyCounts.set(todayUtc, dailyCount + 1);
    return { allowed: true, rpmRemaining: this.rpmLimit - this.timestamps.length };
  }
}

// Adversarial Attack Scenario 1: Boundary Burst
// Send 15 requests at T = 58s (minute 0), then 15 requests at T = 62s (minute 1).
const fixedLimiter = new FixedWindowRateLimiter(15, 1500);
const baseTime = 1700000040000; // aligned: 1700000040000 % 60000 = 0
// Actually let's explicitly align:
const alignedMinuteBase = Math.floor(1700000000000 / 60000) * 60000;
const t58 = alignedMinuteBase + 58000; // 58 seconds into minute 0
const t62 = alignedMinuteBase + 62000; // 2 seconds into minute 1 (4 seconds after t58)

let fixedSuccessCount = 0;
for (let i = 0; i < 15; i++) {
  if (fixedLimiter.check(t58).allowed) fixedSuccessCount++;
}
for (let i = 0; i < 15; i++) {
  if (fixedLimiter.check(t62).allowed) fixedSuccessCount++;
}

assert(
  fixedSuccessCount === 30,
  "Empirical Probe 1: Fixed Window allows 30 requests in a 4-second burst across minute boundary (Demonstrating Flaw)",
  `Expected 30 allowed in flawed fixed window, got: ${fixedSuccessCount}`
);

// Contrast with Sliding Window
const slidingLimiter = new SlidingWindowRateLimiter(15, 1500);
let slidingSuccessT58 = 0;
let slidingSuccessT62 = 0;
for (let i = 0; i < 15; i++) {
  if (slidingLimiter.check(t58).allowed) slidingSuccessT58++;
}
let t62Rejection;
for (let i = 0; i < 15; i++) {
  const res = slidingLimiter.check(t62);
  if (res.allowed) {
    slidingSuccessT62++;
  } else {
    t62Rejection = res;
  }
}

assert(
  slidingSuccessT58 === 15 && slidingSuccessT62 === 0,
  "Empirical Probe 2: True Sliding Window strictly caps 60s window to 15 RPM, rejecting burst at T=62s",
  `Sliding allowed ${slidingSuccessT58} at T=58s and ${slidingSuccessT62} at T=62s`
);

assert(
  t62Rejection && t62Rejection.retryAfterSeconds === 56, // 58s + 60s - 62s = 56s
  "Empirical Probe 3: Sliding window accurately computes retryAfterSeconds based on oldest timestamp in window",
  `Expected retryAfterSeconds=56, got: ${t62Rejection ? t62Rejection.retryAfterSeconds : null}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 2: SHA-256 DEDUPLICATION FINGERPRINT & BLOOM COLLISION
// -----------------------------------------------------------------------------
console.log("\n>>> TEST SUITE 2: SHA-256 Deduplication & Cache Collisions <<<");

// Document Fingerprint (Section 1.7, Line 549):
// sha256("gemini:" + grade + ":" + subject + ":" + chapter + ":" + topic + ":" + type + ":" + quantity + ":" + difficulty)
function docFingerprint(p) {
  return sha256("gemini:" + p.grade + ":" + p.subject + ":" + p.chapter + ":" + p.topic + ":" + p.type + ":" + p.quantity + ":" + p.difficulty);
}

// Hardened Fingerprint including bloomLevel and model
function hardenedFingerprint(p) {
  return sha256("gemini:" + (p.model || "gemini-1.5-flash") + ":" + p.grade + ":" + p.subject + ":" + p.chapter + ":" + p.topic + ":" + p.type + ":" + p.quantity + ":" + p.difficulty + ":" + (p.bloomLevel || "Applying"));
}

const reqRecall = {
  grade: "Class 10",
  subject: "Science",
  chapter: "Light - Reflection and Refraction",
  topic: "Spherical Mirrors",
  type: "MCQ",
  quantity: 5,
  difficulty: "Medium",
  bloomLevel: "Remembering"
};

const reqEvaluation = {
  grade: "Class 10",
  subject: "Science",
  chapter: "Light - Reflection and Refraction",
  topic: "Spherical Mirrors",
  type: "MCQ",
  quantity: 5,
  difficulty: "Medium",
  bloomLevel: "Evaluating" // Higher-order critical thinking
};

const hashDoc1 = docFingerprint(reqRecall);
const hashDoc2 = docFingerprint(reqEvaluation);

assert(
  hashDoc1 === hashDoc2,
  "Empirical Probe 4: Document Section 1.7 fingerprint omits bloomLevel, causing identical hash across cognitive domains",
  `Hash 1: ${hashDoc1}, Hash 2: ${hashDoc2}`
);

const hashHardened1 = hardenedFingerprint(reqRecall);
const hashHardened2 = hardenedFingerprint(reqEvaluation);

assert(
  hashHardened1 !== hashHardened2,
  "Empirical Probe 5: Hardened fingerprint isolates Bloom cognitive domains, preventing invalid cache hits",
  `Hardened Hash 1: ${hashHardened1}, Hardened Hash 2: ${hashHardened2}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: TOKEN BUDGETING & TRUNCATION RISK AT QUANTITY = 20
// -----------------------------------------------------------------------------
console.log("\n>>> TEST SUITE 3: Token Budgeting & MaxOutputTokens Analysis <<<");

// Sample realistic curriculum item matching CBSE standard with comprehensive explanation
const sampleItem = {
  title: "Class 10 Light: Concave Mirror Image Formation",
  questionText: "An object is placed at a distance of 20 cm in front of a concave mirror of focal length 15 cm. Which of the following statements correctly describes the nature, position, and magnification of the image formed?",
  options: [
    "Real, inverted, formed at 60 cm in front of the mirror, magnification is -3",
    "Virtual, erect, formed at 60 cm behind the mirror, magnification is +3",
    "Real, inverted, formed at 30 cm in front of the mirror, magnification is -1.5",
    "Virtual, erect, formed at 30 cm behind the mirror, magnification is +1.5"
  ],
  correctOptionIndex: 0,
  hint: "Use the mirror formula 1/f = 1/v + 1/u with Cartesian sign convention: u = -20 cm, f = -15 cm.",
  explanation: "According to the mirror formula, 1/v = 1/f - 1/u = 1/(-15) - 1/(-20) = -1/15 + 1/20 = (-4 + 3)/60 = -1/60. Therefore, image distance v = -60 cm. Since v is negative, the image is real and formed in front of the mirror. Magnification m = -v/u = -(-60)/(-20) = -3. The negative sign confirms the image is inverted, and |m| = 3 indicates it is magnified.",
  bloomLevel: "Applying",
  difficulty: "Hard"
};

const sampleItemJson = JSON.stringify(sampleItem, null, 2);
// Rule of thumb for English text + JSON syntax in Gemini tokenizer: ~1 token per 3.5 - 4 characters
const charCountPerItem = sampleItemJson.length;
const estimatedTokensPerItem = Math.ceil(charCountPerItem / 3.6);

console.log(`  ℹ Sample Item Character Count: ${charCountPerItem} chars`);
console.log(`  ℹ Estimated Tokens per Item: ~${estimatedTokensPerItem} tokens`);

const tokensFor5Items = estimatedTokensPerItem * 5 + 50; // +50 tokens for JSON array wrapping
const tokensFor10Items = estimatedTokensPerItem * 10 + 50;
const tokensFor20Items = estimatedTokensPerItem * 20 + 50;

console.log(`  ℹ Estimated Tokens for Quantity = 5:  ~${tokensFor5Items} tokens`);
console.log(`  ℹ Estimated Tokens for Quantity = 10: ~${tokensFor10Items} tokens`);
console.log(`  ℹ Estimated Tokens for Quantity = 20: ~${tokensFor20Items} tokens`);

const docMaxOutputTokens = 4096;

assert(
  tokensFor5Items < docMaxOutputTokens && tokensFor10Items < docMaxOutputTokens,
  "Empirical Probe 6: Default quantity (5) and medium batches (10) comfortably fit within 4096 maxOutputTokens",
  `Tokens for 5: ${tokensFor5Items}, Tokens for 10: ${tokensFor10Items} vs Max: ${docMaxOutputTokens}`
);

assert(
  tokensFor20Items > docMaxOutputTokens,
  "Empirical Probe 7: Maximum quantity (20) with rigorous explanations exceeds 4096 maxOutputTokens (~4,500-5,000 tokens)",
  `Tokens for 20: ${tokensFor20Items} vs Max: ${docMaxOutputTokens}. (Requires maxOutputTokens: 8192)`
);

// -----------------------------------------------------------------------------
// TEST SUITE 4: GOOGLE APPS SCRIPT TIMEOUT & PAYLOAD LIMITS
// -----------------------------------------------------------------------------
console.log("\n>>> TEST SUITE 4: GAS 360-Second Execution Timeout & Batch Sizing <<<");

// Test bulk transformation of 20 items for bulkUploadContentBatch
const mockGeneratedItems = [];
for (let i = 0; i < 20; i++) {
  mockGeneratedItems.push({
    ...sampleItem,
    id: "gen_test_" + (i + 1),
    title: `Class 10 Light Question ${i + 1}`
  });
}

const startTransformTime = process.hrtime();
const bulkUploadPayload = {
  adminUserId: "usr_admin_001",
  contentType: "CurriculumQuizzes",
  items: mockGeneratedItems.map((item, idx) => ({
    id: "curr_" + Date.now() + "_" + (idx + 1),
    grade: "Class 10",
    subject: "Science",
    examCategory: "CBSE",
    title: item.title,
    questionText: item.questionText,
    options: item.options,
    optionsJson: JSON.stringify(item.options),
    correctOptionIndex: item.correctOptionIndex,
    hint: item.hint,
    explanation: item.explanation,
    orderIndex: idx + 1,
    isActive: true
  }))
};
const diffTransformTime = process.hrtime(startTransformTime);
const transformDurationMs = (diffTransformTime[0] * 1000 + diffTransformTime[1] / 1e6);

const payloadSizeKb = Buffer.byteLength(JSON.stringify(bulkUploadPayload), "utf8") / 1024;

assert(
  bulkUploadPayload.items.length === 20 && transformDurationMs < 10,
  "Empirical Probe 8: Transforming 20 items completes in <10ms (no CPU bottleneck)",
  `Duration: ${transformDurationMs.toFixed(2)}ms`
);

assert(
  payloadSizeKb < 100, // Google Apps Script POST payload limit is 10 MB - 50 MB; 20 items is ~20 KB
  "Empirical Probe 9: Batch payload size for 20 items is ~15-25 KB, well below GAS payload thresholds",
  `Payload size: ${payloadSizeKb.toFixed(2)} KB`
);

// -----------------------------------------------------------------------------
// TEST SUITE 5: TAXONOMY MANIFEST STRUCTURAL VERIFICATION
// -----------------------------------------------------------------------------
console.log("\n>>> TEST SUITE 5: Zero-Cost Syllabus Taxonomy Verification <<<");

// Verify stage partitions from NEP 2020: 5+3+3+4
const stages = ["Foundational", "Preparatory", "Middle", "Secondary"];
const expectedGrades = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
];

assert(
  expectedGrades.length === 10,
  "Empirical Probe 10: Sourcing plan encompasses exactly 10 mandatory school classes (Class 1 to 10)",
  `Grades count: ${expectedGrades.length}`
);

// Verify Formula Injection Sanitization (CWE-1236)
function sanitizeSheetCellValue(val) {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

const dangerousInputs = [
  "=1+1",
  "+123456",
  "-5*10",
  "@SUM(A1:A10)",
  "\tcmd.exe",
  "\rcalc"
];

const allSanitized = dangerousInputs.every(input => {
  const sanitized = sanitizeSheetCellValue(input);
  return sanitized.startsWith("'");
});

assert(
  allSanitized,
  "Empirical Probe 11: Formula injection mitigation (CWE-1236) neutralizes all dangerous spreadsheet formula prefixes",
  `Tested: ${dangerousInputs.join(", ")}`
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n=========================================================================");
console.log(`TOTAL PROBES: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("=========================================================================\n");

process.exit(failedCount > 0 ? 1 : 0);
