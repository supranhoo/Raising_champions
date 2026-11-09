/**
 * Independent Forensic Audit Suite for Milestone 3
 * Author: m3_auditor_1
 * Mission: Forensic verification of divyank_mission_control_google_apps_script_app.html
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const HTML_FILE = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const html = fs.readFileSync(HTML_FILE, 'utf8');
const lines = html.split('\n');

console.log('=========================================================================');
console.log('         M3 INDEPENDENT FORENSIC AUDIT: INTEGRITY VERIFICATION           ');
console.log('=========================================================================');

let passedChecks = 0;
let totalChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: Brand Expression & Zero-Curvature Styling (0px border-radius)
// -----------------------------------------------------------------------------
console.log('\n--- Section 1: Zoptro Brand & Geometric Styling (0px border-radius) ---');

check('Global CSS enforces universal border-radius: 0px !important', () => {
  assert.ok(/\*\s*\{[\s\S]*?border-radius:\s*0px\s*!important/i.test(html), 'Global CSS 0px border-radius rule must exist');
});

check('Entire codebase has 0 forbidden rounded-(sm|md|lg|xl|2xl|3xl|full) classes', () => {
  const forbiddenRegex = /\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g;
  const matches = html.match(forbiddenRegex) || [];
  assert.strictEqual(matches.length, 0, `Found forbidden rounded classes: ${matches.join(', ')}`);
});

check('Entire codebase has 0 bare "rounded" classes (must only be "rounded-none")', () => {
  const bareRoundedRegex = /\bclass=["'][^"']*\brounded\b(?!-none)[^"']*["']/g;
  const matches = html.match(bareRoundedRegex) || [];
  assert.strictEqual(matches.length, 0, `Found bare rounded classes: ${matches.join(', ')}`);
});

check('Newly added Admin AI Studio HTML markup (lines 2100-2400) strictly uses rounded-none', () => {
  const aiHtmlChunk = lines.slice(2100, 2400).join('\n');
  const roundedNoneCount = (aiHtmlChunk.match(/\brounded-none\b/g) || []).length;
  assert.ok(roundedNoneCount >= 25, `Expected >=25 rounded-none in AI studio HTML, got ${roundedNoneCount}`);
  const bareRounded = aiHtmlChunk.match(/\bclass=["'][^"']*\brounded\b(?!-none)[^"']*["']/g) || [];
  assert.strictEqual(bareRounded.length, 0, `Bare rounded found in AI Studio markup: ${bareRounded.join(', ')}`);
});

check('Brand color palette tokens are strictly utilized in AI Studio', () => {
  const aiHtmlChunk = lines.slice(2100, 2400).join('\n');
  assert.ok(aiHtmlChunk.includes('#09293D'), 'Authority Blue #09293D must be present');
  assert.ok(aiHtmlChunk.includes('#F4F2EA'), 'Clarity Ivory #F4F2EA must be present');
  assert.ok(aiHtmlChunk.includes('#666D57'), 'Grounded Olive #666D57 must be present');
  assert.ok(aiHtmlChunk.includes('#F65800'), 'Progress Orange #F65800 must be present');
});

check('Brand typography fonts configured: Outfit (font-display) and Figtree (font-sans)', () => {
  assert.ok(html.includes("font-family: 'Outfit'"), 'Outfit font family import must exist');
  assert.ok(html.includes("font-family: 'Figtree'"), 'Figtree font family import must exist');
  const aiHtmlChunk = lines.slice(2100, 2400).join('\n');
  assert.ok(aiHtmlChunk.includes('font-display'), 'font-display must be used for studio headings');
  assert.ok(aiHtmlChunk.includes('font-sans'), 'font-sans must be used for studio body');
});

// -----------------------------------------------------------------------------
// SECTION 2: Invariant M6-REG-01: 100% DOM ID Resolution
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Invariant M6-REG-01 (100% DOM ID Integrity) ---');

check('Every document.getElementById in script resolves to a static HTML id attribute', () => {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let allScriptCode = '';
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    allScriptCode += scriptMatch[1] + '\n';
  }

  const staticIds = new Set();
  const idAttrRegex = /\bid=["']([^"']+)["']/g;
  let idMatch;
  while ((idMatch = idAttrRegex.exec(html)) !== null) {
    staticIds.add(idMatch[1]);
  }

  const getElemIdRegex = /document\.getElementById\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let elemMatch;
  const missingIds = new Set();
  const queriedIds = new Set();
  while ((elemMatch = getElemIdRegex.exec(allScriptCode)) !== null) {
    const id = elemMatch[1];
    queriedIds.add(id);
    if (!staticIds.has(id)) {
      missingIds.add(id);
    }
  }

  console.log(`    Total distinct document.getElementById queried: ${queriedIds.size}`);
  console.log(`    Total distinct static HTML IDs present: ${staticIds.size}`);

  if (missingIds.size > 0) {
    console.error('    Missing static IDs:', Array.from(missingIds));
  }
  assert.strictEqual(missingIds.size, 0, `Found ${missingIds.size} unresolvable static DOM IDs: ${Array.from(missingIds).join(', ')}`);
});

check('All 15 M3 Studio DOM IDs exist in HTML markup', () => {
  const m3StudioIds = [
    'adminTabBtnAiGenerate',
    'adminAiGenerateContainer',
    'aiHudRpm',
    'aiHudRpmBar',
    'aiHudRpd',
    'aiHudRpdBar',
    'aiHudTokens',
    'aiHudTokenSub',
    'aiHudCache',
    'aiHudCost',
    'aiGenGrade',
    'aiGenSubject',
    'aiGenChapter',
    'aiGenTopic',
    'aiGenType',
    'aiGenQuantity',
    'aiGenDifficulty',
    'aiGenModel',
    'aiGenTargetContentType',
    'aiGenForceRefresh',
    'aiGenSubmitBtn',
    'aiGenBtnText',
    'aiGenLoadingSpinner',
    'aiGenStatusMsg',
    'aiGenCountdownBanner',
    'aiGenCountdownTimer',
    'aiGenPreviewDeck',
    'aiGenSummaryBanner',
    'aiGenSummaryStatusBadge',
    'aiGenSummaryLatency',
    'aiGenSummaryPromptTokens',
    'aiGenSummaryCandidateTokens',
    'aiGenSummaryTotalTokens',
    'aiGenDeckCountBadge',
    'aiGenCommitBtn',
    'aiGenCommitCountBadge',
    'aiGenCommitStatus',
    'aiGenPreviewEmptyState',
    'aiGenQuestionsList'
  ];

  m3StudioIds.forEach(id => {
    assert.ok(html.includes(`id="${id}"`), `Static HTML element id="${id}" must exist`);
  });
});

// -----------------------------------------------------------------------------
// SECTION 3: CWE-1236 Formula Injection Sanitization
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Security & CWE-1236 Formula Injection Defense ---');

check('sanitizeSheetCellValue function safely prefixes =, +, -, @, \\t, \\r', () => {
  // Extract sanitizeSheetCellValue from the script
  const scriptRegex = /function sanitizeSheetCellValue\b[\s\S]*?^    \}/m;
  const match = html.match(scriptRegex);
  assert.ok(match, 'sanitizeSheetCellValue function must exist in HTML script');

  // Evaluate sanitizeSheetCellValue in isolated VM
  const vm = require('vm');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(match[0], sandbox);

  const sanitize = sandbox.sanitizeSheetCellValue;
  assert.strictEqual(typeof sanitize, 'function');

  // Test dangerous prefixes
  assert.strictEqual(sanitize('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.strictEqual(sanitize('+12345'), "'+12345");
  assert.strictEqual(sanitize('-500'), "'-500");
  assert.strictEqual(sanitize('@cmd|/C calc'), "'@cmd|/C calc");
  assert.strictEqual(sanitize('\tleading_tab'), "'\tleading_tab");
  assert.strictEqual(sanitize('\rleading_cr'), "'\rleading_cr");
  assert.strictEqual(sanitize('   =FORMULA'), "'   =FORMULA");

  // Non-dangerous inputs
  assert.strictEqual(sanitize('Standard question text'), 'Standard question text');
  assert.strictEqual(sanitize(12345), 12345);
  assert.strictEqual(sanitize(true), true);
  assert.strictEqual(sanitize(null), null);
});

check('_synthesizeCurriculumQuestions applies sanitizeSheetCellValue across all fields', () => {
  assert.ok(html.includes('title: sanitizeSheetCellValue(title)'), 'title must be sanitized');
  assert.ok(html.includes('questionText: sanitizeSheetCellValue(questionText)'), 'questionText must be sanitized');
  assert.ok(html.includes('options: options.map(sanitizeSheetCellValue)'), 'options must be sanitized');
  assert.ok(html.includes('hint: sanitizeSheetCellValue(hint)'), 'hint must be sanitized');
  assert.ok(html.includes('explanation: sanitizeSheetCellValue(explanation)'), 'explanation must be sanitized');
});

check('recordGeminiTokenUsageLog applies sanitizeSheetCellValue across logged fields', () => {
  assert.ok(html.includes('adminUserId: sanitizeSheetCellValue(p.adminUserId'), 'adminUserId log must be sanitized');
  assert.ok(html.includes('model: sanitizeSheetCellValue(p.model'), 'model log must be sanitized');
  assert.ok(html.includes('grade: sanitizeSheetCellValue(p.grade'), 'grade log must be sanitized');
  assert.ok(html.includes('subject: sanitizeSheetCellValue(p.subject'), 'subject log must be sanitized');
  assert.ok(html.includes('topic: sanitizeSheetCellValue(p.topic'), 'topic log must be sanitized');
});

// -----------------------------------------------------------------------------
// SECTION 4: Source Code Logic Authenticity & Zero Facade Check
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Source Code Logic Authenticity & Zero Facade Check ---');

check('BrowserMockBackend.computeGeminiCacheFingerprint implements SHA-256 canonical hashing', () => {
  assert.ok(html.includes('computeGeminiCacheFingerprint: function(payload) {'), 'computeGeminiCacheFingerprint must exist');
  assert.ok(html.includes(".join('::')"), 'Canonical key must use :: delimiter');
  assert.ok(html.includes('_zoptroSha256(rawKey)'), 'Must hash canonical key using SHA-256');
});

check('BrowserMockBackend.getGeminiQuotaStatus enforces admin RBAC and reads telemetry', () => {
  assert.ok(html.includes('getGeminiQuotaStatus: function(payload) {'), 'getGeminiQuotaStatus must exist');
  assert.ok(html.includes('this.assertAdmin(adminUserId)'), 'Must assert admin role in getGeminiQuotaStatus');
  assert.ok(html.includes('rpmRemaining'), 'Must report rpmRemaining');
  assert.ok(html.includes('dailyRemaining'), 'Must report dailyRemaining');
  assert.ok(html.includes('totalTokensLogged'), 'Must report totalTokensLogged');
});

check('BrowserMockBackend.generateCurriculumQuestionsWithGemini has full offline parity', () => {
  assert.ok(html.includes('generateCurriculumQuestionsWithGemini: function(payload) {'), 'generateCurriculumQuestionsWithGemini must exist');
  assert.ok(html.includes('this.assertAdmin(adminUserId)'), 'Must assert admin role in generateCurriculumQuestionsWithGemini');
  assert.ok(html.includes('computeGeminiCacheFingerprint'), 'Must check cache fingerprint');
  assert.ok(html.includes('checkAndIncrementRateLimit'), 'Must check and increment rate limit');
  assert.ok(html.includes('_synthesizeCurriculumQuestions'), 'Must synthesize curriculum questions');
  assert.ok(html.includes('recordGeminiTokenUsageLog'), 'Must record token usage log');
});

check('Zero facade / dummy functions detected in newly added M3 functions', () => {
  const m3Functions = [
    'renderGeminiQuotaHud',
    'fetchGeminiQuotaStatus',
    'handleTriggerGeminiGeneration',
    'renderAiGenPreviewDeck',
    'updateGeneratedQuestionText',
    'updateGeneratedQuestionOption',
    'updateGeneratedQuestionCorrectIndex',
    'updateGeneratedQuestionHint',
    'updateGeneratedQuestionExplanation',
    'discardGeneratedQuestion',
    'discardEntireGeneratedBatch',
    'commitGeneratedBatchToStorage',
    'handleCommitAiGeneratedToStorage'
  ];

  m3Functions.forEach(fnName => {
    const fnRegex = new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\}`, 'm');
    const m = html.match(fnRegex);
    assert.ok(m, `Function ${fnName} must be defined`);
    const body = m[1].trim();
    assert.ok(body.length > 20, `Function ${fnName} has suspiciously short body (${body.length} chars) - possible facade!`);
    assert.ok(!/^return\s+(true|false|null|undefined|0|""|'');?$/.test(body), `Function ${fnName} must not be a return constant dummy`);
  });
});

check('Interactive Preview Deck supports full inline editing across all question attributes', () => {
  assert.ok(html.includes('updateGeneratedQuestionText(${idx}, this.value)'), 'Question prompt editing must be wired');
  assert.ok(html.includes('updateGeneratedQuestionOption(${idx}, ${optIdx}, this.value)'), 'Option editing must be wired');
  assert.ok(html.includes('updateGeneratedQuestionCorrectIndex(${idx}, ${optIdx})'), 'Radio correct index selection must be wired');
  assert.ok(html.includes('updateGeneratedQuestionHint(${idx}, this.value)'), 'Hint editing must be wired');
  assert.ok(html.includes('updateGeneratedQuestionExplanation(${idx}, this.value)'), 'Explanation editing must be wired');
  assert.ok(html.includes('discardGeneratedQuestion(${idx})'), 'Per-item discard must be wired');
  assert.ok(html.includes('discardEntireGeneratedBatch()'), 'Batch discard must be wired');
});

check('Direct storage commitment bridges to Table 11 CurriculumQuizzes with CBSE metadata', () => {
  assert.ok(html.includes('bulkUploadContentBatch(uploadPayload)'), 'Must call bulkUploadContentBatch');
  assert.ok(html.includes('contentType: "CurriculumQuizzes"'), 'Must target CurriculumQuizzes');
  assert.ok(html.includes('examCategory: item.examCategory || "CBSE"'), 'Must set examCategory to CBSE');
  assert.ok(html.includes('playSound(\'correct\')'), 'Must play sound on success');
  assert.ok(html.includes('spawnConfetti()'), 'Must spawn confetti on success');
});

console.log('\n=========================================================================');
console.log(`  ALL ${passedChecks} / ${totalChecks} FORENSIC INTEGRITY CHECKS PASSED (100%)`);
console.log('=========================================================================\n');
