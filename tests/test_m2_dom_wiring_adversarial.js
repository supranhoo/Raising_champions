/**
 * =========================================================================
 * INDEPENDENT REVIEWER 2 (MILESTONE 2) ADVERSARIAL DOM WIRING AUDIT
 * =========================================================================
 * Verifies:
 * 1. Story Time DOM wiring: checks if element IDs targeted by renderStoryTime()
 *    actually exist in #view-story in divyank_mission_control_google_apps_script_app.html.
 * 2. EQ Lab DOM wiring: checks if element IDs targeted by renderEqLab()
 *    actually exist in #storySubView-eq.
 * 3. Daily GK DOM wiring: checks if element IDs targeted by renderDailyGk()
 *    actually exist in #view-dailygk.
 * 4. Competitive Exams / PYQP DOM wiring: checks if element IDs targeted by
 *    renderCompetitiveExams() actually exist in #view-pyqp.
 * 5. Junior Current Affairs DOM wiring: checks if element IDs targeted by
 *    loadDynamicNews() actually exist in #view-news.
 * 6. Hardcoded content literals in source code (fallback eradication audit).
 * 7. Active child switching dynamic refresh & latency benchmark.
 * 8. Brand conformance (rounded-none, 0px border radius, Optra360 palette).
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const htmlPath = path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log("=================================================================");
console.log("🔍 STARTING REVIEWER 2 MILESTONE 2 INDEPENDENT ADVERSARIAL AUDIT");
console.log("=================================================================\n");

let passedCount = 0;
let failedCount = 0;
const findings = [];

function check(testName, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } catch (err) {
    failedCount++;
    console.error(`  🚨 FAIL: ${testName}`);
    console.error(`     Reason: ${err.message}`);
    findings.push({ test: testName, error: err.message });
  }
}

// Extract all HTML IDs
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

// Section 1: DOM Wiring Parity for Dynamic Views
console.log("--- SECTION 1: DOM ELEMENT ID WIRING PARITY AUDIT ---");

check("STORY-01: Story title container ID referenced by JS exists in #view-story", () => {
  // Check if renderStoryTime targets an existing ID
  const usesTitleDisplay = html.includes("getElementById('storyTitleDisplay')");
  const hasTitleDisplayInHtml = htmlIds.has('storyTitleDisplay');
  const hasStoryTitleInHtml = htmlIds.has('storyTitle');

  if (usesTitleDisplay && !hasTitleDisplayInHtml) {
    throw new Error(`renderStoryTime() references getElementById('storyTitleDisplay'), but HTML only defines id='${hasStoryTitleInHtml ? "storyTitle" : "NONE"}'`);
  }
  assert.ok(hasTitleDisplayInHtml || !usesTitleDisplay);
});

check("STORY-02: Story content text container ID referenced by JS exists in #view-story", () => {
  const usesParas = html.includes("getElementById('storyContentParagraphs')");
  const hasParasInHtml = htmlIds.has('storyContentParagraphs');
  const hasContentTextInHtml = htmlIds.has('storyContentText');

  if (usesParas && !hasParasInHtml) {
    throw new Error(`renderStoryTime() references getElementById('storyContentParagraphs'), but HTML only defines id='${hasContentTextInHtml ? "storyContentText" : "NONE"}'`);
  }
  assert.ok(hasParasInHtml || !usesParas);
});

check("STORY-03: Story morals reflection prompt ID referenced by JS exists in #view-story", () => {
  const usesMorals = html.includes("getElementById('storyMoralsList')");
  const hasMoralsInHtml = htmlIds.has('storyMoralsList');
  const hasEqPromptInHtml = htmlIds.has('storyEqPrompt');

  if (usesMorals && !hasMoralsInHtml) {
    throw new Error(`renderStoryTime() references getElementById('storyMoralsList'), but HTML only defines id='${hasEqPromptInHtml ? "storyEqPrompt" : "NONE"}'`);
  }
  assert.ok(hasMoralsInHtml || !usesMorals);
});

check("STORY-04: Story mastery submit button ID referenced by JS exists in #view-story", () => {
  const usesSubmitBtn = html.includes("getElementById('storySubmitBtn')");
  const hasSubmitBtnInHtml = htmlIds.has('storySubmitBtn');
  const hasSubmitQuestBtnInHtml = htmlIds.has('storySubmitQuestBtn');

  if (usesSubmitBtn && !hasSubmitBtnInHtml) {
    throw new Error(`renderStoryTime() references getElementById('storySubmitBtn'), but HTML only defines id='${hasSubmitQuestBtnInHtml ? "storySubmitQuestBtn" : "NONE"}'`);
  }
  assert.ok(hasSubmitBtnInHtml || !usesSubmitBtn);
});

check("EQ-01: EQ scenario heading/title ID referenced by JS exists in #storySubView-eq", () => {
  const usesEqTitle = html.includes("getElementById('eqScenarioTitle')");
  const hasEqTitleInHtml = htmlIds.has('eqScenarioTitle');
  const hasEqHeadingInHtml = htmlIds.has('eqScenarioHeading');

  if (usesEqTitle && !hasEqTitleInHtml) {
    throw new Error(`renderEqLab() references getElementById('eqScenarioTitle'), but HTML only defines id='${hasEqHeadingInHtml ? "eqScenarioHeading" : "NONE"}'`);
  }
  assert.ok(hasEqTitleInHtml || !usesEqTitle);
});

check("EQ-02: EQ scenario description/prompt ID referenced by JS exists in #storySubView-eq", () => {
  const usesEqPrompt = html.includes("getElementById('eqDilemmaPrompt')");
  const hasEqPromptInHtml = htmlIds.has('eqDilemmaPrompt');
  const hasEqBodyInHtml = htmlIds.has('eqScenarioBody');

  if (usesEqPrompt && !hasEqPromptInHtml) {
    throw new Error(`renderEqLab() references getElementById('eqDilemmaPrompt'), but HTML only defines id='${hasEqBodyInHtml ? "eqScenarioBody" : "NONE"}'`);
  }
  assert.ok(hasEqPromptInHtml || !usesEqPrompt);
});

check("EQ-03: EQ consequence feedback box ID referenced by JS exists in #storySubView-eq", () => {
  const usesFeedback = html.includes("getElementById('eqConsequenceFeedback')");
  const hasFeedbackInHtml = htmlIds.has('eqConsequenceFeedback');
  const hasFeedbackBoxInHtml = htmlIds.has('eqFeedbackBox');

  if (usesFeedback && !hasFeedbackInHtml) {
    throw new Error(`renderEqLab() references getElementById('eqConsequenceFeedback'), but HTML only defines id='${hasFeedbackBoxInHtml ? "eqFeedbackBox" : "NONE"}'`);
  }
  assert.ok(hasFeedbackInHtml || !usesFeedback);
});

check("EQ-04: EQ personal reflection input ID referenced by JS exists in #storySubView-eq", () => {
  const usesReflection = html.includes("getElementById('eqReflectionInput')");
  const hasReflectionInHtml = htmlIds.has('eqReflectionInput');
  const hasPersonalNoteInHtml = htmlIds.has('eqPersonalNote');

  if (usesReflection && !hasReflectionInHtml) {
    throw new Error(`submitEqDilemma() references getElementById('eqReflectionInput'), but HTML only defines id='${hasPersonalNoteInHtml ? "eqPersonalNote" : "NONE"}'`);
  }
  assert.ok(hasReflectionInHtml || !usesReflection);
});

check("TABS-01: Story Sub-tab buttons IDs referenced in switchStorySubTab exist in HTML", () => {
  const hasBtnLore = htmlIds.has('storySubBtn-lore');
  const hasBtnEq = htmlIds.has('storySubBtn-eq');
  const hasTabBtnLore = htmlIds.has('storySubTabBtnLore');
  const hasTabBtnEq = htmlIds.has('storySubTabBtnEq');

  if (!hasBtnLore || !hasBtnEq) {
    throw new Error(`switchStorySubTab() references getElementById('storySubBtn-lore'/'storySubBtn-eq'), but HTML defines id='${hasTabBtnLore ? "storySubTabBtnLore" : "NONE"}' / '${hasTabBtnEq ? "storySubTabBtnEq" : "NONE"}'`);
  }
  assert.ok(hasBtnLore && hasBtnEq);
});

// Section 2: Daily GK, PYQP, News DOM verification
console.log("\n--- SECTION 2: DAILY GK, PYQP & NEWS DOM PARITY ---");

check("GK-01: Daily GK facts list and quiz containers exist in HTML", () => {
  assert.ok(htmlIds.has('gkNationalFactsList'), "gkNationalFactsList must exist");
  assert.ok(htmlIds.has('gkWorldFactsList'), "gkWorldFactsList must exist");
  assert.ok(htmlIds.has('gkQuestionText'), "gkQuestionText must exist");
  assert.ok(htmlIds.has('gkOptionsContainer'), "gkOptionsContainer must exist");
  assert.ok(htmlIds.has('gkSubmitBtn'), "gkSubmitBtn must exist");
});

check("PYQP-01: PYQP exam selector and drill containers exist in HTML", () => {
  assert.ok(htmlIds.has('examSelectorPills'), "examSelectorPills must exist");
  assert.ok(htmlIds.has('examHeaderTitle'), "examHeaderTitle must exist");
  assert.ok(htmlIds.has('examSyllabusList'), "examSyllabusList must exist");
  assert.ok(htmlIds.has('dailyPracticeQuestionText'), "dailyPracticeQuestionText must exist");
});

check("NEWS-01: Junior news pills, article body and retention quiz containers exist in HTML", () => {
  assert.ok(htmlIds.has('newsPillList'), "newsPillList must exist");
  assert.ok(htmlIds.has('newsTitle'), "newsTitle must exist");
  assert.ok(htmlIds.has('newsBody'), "newsBody must exist");
  assert.ok(htmlIds.has('quizQuestionText'), "quizQuestionText must exist");
  assert.ok(htmlIds.has('quizOptionsContainer'), "quizOptionsContainer must exist");
});

// Section 3: Fallback Eradication & Hardcoded Content Literals
console.log("\n--- SECTION 3: FALLBACK ERADICATION & HARDCODED LITERALS AUDIT ---");

check("FALLBACK-01: const currentStory eradicated", () => {
  assert.strictEqual(/const\s+currentStory\s*=/.test(html), false);
});

check("FALLBACK-02: const dailyGkDatabase eradicated", () => {
  assert.strictEqual(/const\s+dailyGkDatabase\s*=/.test(html), false);
});

check("FALLBACK-03: const competitiveExamsData eradicated", () => {
  assert.strictEqual(/const\s+competitiveExamsData\s*=/.test(html), false);
});

check("FALLBACK-04: const newsArticles eradicated", () => {
  assert.strictEqual(/const\s+newsArticles\s*=/.test(html), false);
});

check("FALLBACK-05: No hardcoded educational articles embedded in controller else blocks", () => {
  // Check if loadDynamicNews embeds a hardcoded article literal
  const hasHardcodedSpaceNews = html.includes("Space Technology Exploration") && html.includes("Scientists and astronauts conduct deep space experiments");
  if (hasHardcodedSpaceNews) {
    throw new Error("loadDynamicNews() contains embedded hardcoded article literal 'Space Technology Exploration' in else-fallback branch");
  }
  assert.ok(!hasHardcodedSpaceNews);
});

// Section 4: Child Profile Switching Performance & Grade Isolation
console.log("\n--- SECTION 4: CHILD SWITCHING PERFORMANCE & GRADE REACTION ---");

// Load backend in VM
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g);
const scriptCode = scriptMatches[scriptMatches.length - 1].replace('<script>', '').replace('</script>', '');

const mockContext = {
  window: {
    innerWidth: 1024, innerHeight: 768,
    localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } },
    AudioContext: function() { return { currentTime: 0, destination: {}, createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }), createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }) }; },
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => ({
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        fillRect: () => {}
      }),
      classList: { add() {}, remove() {}, toggle() {} },
      innerText: '', innerHTML: '', value: '', style: {}, appendChild() {}, querySelectorAll: () => []
    }),
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add() {}, remove() {} }, innerText: '', innerHTML: '', style: {}, appendChild() {}, setAttribute() {} }),
    body: { appendChild() {} }
  },
  console: console,
  setTimeout: (fn) => setTimeout(fn, 1),
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {}
};

vm.createContext(mockContext);
vm.runInContext(scriptCode, mockContext);

const BrowserMockBackend = mockContext.window.BrowserMockBackend;
BrowserMockBackend.init(true);

check("SWITCH-01: Child switching executes in <10ms and resolves correct grade", () => {
  const t0 = process.hrtime.bigint();
  mockContext.selectActiveChild('u_stu_priya');
  const grade = mockContext.getActiveStudentGrade();
  const t1 = process.hrtime.bigint();
  const durationMs = Number(t1 - t0) / 1000000;

  assert.strictEqual(grade, 'Class 5', `Active student grade should be Class 5, was ${grade}`);
  assert.ok(durationMs < 10, `Switching latency should be <10ms, was ${durationMs.toFixed(3)}ms`);
  
  // Switch back to Divyank
  mockContext.selectActiveChild('u_stu_demo');
  assert.strictEqual(mockContext.getActiveStudentGrade(), 'Class 3');
});

// Section 5: Brand Conformance & 0px Border Radius
console.log("\n--- SECTION 5: BRAND STYLING & GEOMETRIC CONFORMANCE AUDIT ---");

check("BRAND-01: Global CSS enforces universal border-radius: 0px !important", () => {
  const hasZeroRadiusRule = /border-radius:\s*0(px)?\s*!important/i.test(html);
  assert.ok(hasZeroRadiusRule, "Global stylesheet must contain border-radius: 0px !important");
});

check("BRAND-02: No forbidden rounded classes (e.g. rounded-lg, rounded-xl, rounded-full) in dynamic sections", () => {
  // Check dynamic views for non-rounded-none classes
  const dynamicSections = ['view-story', 'view-dailygk', 'view-pyqp', 'view-news'];
  dynamicSections.forEach(secId => {
    const secMatch = html.match(new RegExp(`<section id="${secId}"[\\s\\S]*?<\\/section>`));
    if (secMatch) {
      const secHtml = secMatch[0];
      const roundedMatches = secHtml.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
      assert.strictEqual(roundedMatches, null, `Found non-zero rounded classes in #${secId}: ${roundedMatches}`);
    }
  });
});

check("BRAND-03: Optra360 brand color tokens are present in stylesheet and Tailwind configuration", () => {
  assert.ok(html.includes('#09293D'), "Authority Blue #09293D must be defined");
  assert.ok(html.includes('#F4F2EA'), "Clarity Ivory #F4F2EA must be defined");
  assert.ok(html.includes('#666D57'), "Grounded Olive #666D57 must be defined");
  assert.ok(html.includes('#F65800'), "Progress Orange #F65800 must be defined");
});

console.log("\n=================================================================");
console.log(`🏁 AUDIT COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=================================================================\n");

if (failedCount > 0) {
  console.log("CRITICAL FINDINGS:");
  findings.forEach((f, i) => {
    console.log(`${i + 1}. [${f.test}] ${f.error}`);
  });
}
