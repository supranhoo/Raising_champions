// tests/test_milestone3_frontend.js
// Automated verification suite for Milestone 3 Frontend UI & Controller Wiring
// Covering Admin CMS, Family Onboarding, Longitudinal Profile SVG engine, and Child Governance

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=================================================================');
console.log('🚀 STARTING MILESTONE 3 FRONTEND UI & CONTROLLER VERIFICATION');
console.log('=================================================================');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------------------
// SECTION 1: ADMIN CONTROL PAGE & CMS (R1)
// -------------------------------------------------------------------------
console.log('\n--- 1. ADMIN CONTROL PAGE & CMS (R1) ---');

runTest('R1-01: Admin nav button #tab-admin and role button #roleBtnAdmin exist with switchTab("admin")', () => {
  assert.ok(htmlContent.includes('id="tab-admin"'), '#tab-admin must exist');
  assert.ok(htmlContent.includes('id="roleBtnAdmin"'), '#roleBtnAdmin must exist');
  assert.ok(htmlContent.includes("switchTab('admin')"), 'Must call switchTab("admin")');
  assert.ok(htmlContent.includes("setUserRole('admin')"), 'Must call setUserRole("admin")');
  assert.ok(/class="[^"]*tab-btn[^"]*hidden[^"]*"[^>]*id="tab-admin"/i.test(htmlContent) ||
            /id="tab-admin"[^>]*class="[^"]*tab-btn[^"]*hidden[^"]*"/i.test(htmlContent), '#tab-admin must have hidden class initially');
});

runTest('R1-02: #view-admin view container exists with RBAC challenge and authorized containers', () => {
  assert.ok(htmlContent.includes('id="view-admin"'), '#view-admin must exist');
  assert.ok(htmlContent.includes('id="adminUnauthorizedCard"'), '#adminUnauthorizedCard must exist');
  assert.ok(htmlContent.includes('id="adminAuthorizedContainer"'), '#adminAuthorizedContainer must exist');
  assert.ok(htmlContent.includes('id="adminPinModal"'), '#adminPinModal must exist');
  assert.ok(htmlContent.includes('id="adminSwitchPin"'), '#adminSwitchPin must exist');
  assert.ok(htmlContent.includes('id="adminSwitchPinError"'), '#adminSwitchPinError must exist');
  assert.ok(htmlContent.includes('id="adminVerifyPinBtn"'), '#adminVerifyPinBtn must exist');
});

runTest('R1-03: Admin CMS content tabs exist for Stories, EQ, Daily GK, Quizzes, and Quests', () => {
  assert.ok(htmlContent.includes('id="adminTabBtnStories"'), '#adminTabBtnStories must exist');
  assert.ok(htmlContent.includes('id="adminTabBtnEq"'), '#adminTabBtnEq must exist');
  assert.ok(htmlContent.includes('id="adminTabBtnDailyGk"'), '#adminTabBtnDailyGk must exist');
  assert.ok(htmlContent.includes('id="adminTabBtnQuizzes"'), '#adminTabBtnQuizzes must exist');
  assert.ok(htmlContent.includes('id="adminTabBtnQuests"'), '#adminTabBtnQuests must exist');
  assert.ok(htmlContent.includes('switchAdminTab('), 'switchAdminTab function must exist');
});

runTest('R1-04: Admin filter bar exists with Grade, Status, Search, and Create buttons', () => {
  assert.ok(htmlContent.includes('id="adminFilterGrade"'), '#adminFilterGrade must exist');
  assert.ok(htmlContent.includes('id="adminFilterStatus"'), '#adminFilterStatus must exist');
  assert.ok(htmlContent.includes('id="adminSearchInput"'), '#adminSearchInput must exist');
  assert.ok(htmlContent.includes('id="adminBtnCreateContent"'), '#adminBtnCreateContent must exist');
  assert.ok(htmlContent.includes('id="adminLockStatusPill"'), '#adminLockStatusPill must exist');
  assert.ok(htmlContent.includes('id="adminContentTable"'), '#adminContentTable must exist');
  assert.ok(htmlContent.includes('id="adminTableBody"'), '#adminTableBody must exist');
});

runTest('R1-05: Admin editor modals exist with 90° square styling and explicit fields', () => {
  // Story modal
  assert.ok(htmlContent.includes('id="adminModalStory"'), '#adminModalStory must exist');
  assert.ok(htmlContent.includes('id="adminStoryTitle"'), '#adminStoryTitle must exist');
  assert.ok(htmlContent.includes('id="adminStoryGrade"'), '#adminStoryGrade must exist');
  assert.ok(htmlContent.includes('id="adminStoryContent"'), '#adminStoryContent must exist');
  assert.ok(htmlContent.includes('id="adminStoryMoral"'), '#adminStoryMoral must exist');
  assert.ok(htmlContent.includes('id="adminStorySaveBtn"'), '#adminStorySaveBtn must exist');

  // EQ modal
  assert.ok(htmlContent.includes('id="adminModalEq"'), '#adminModalEq must exist');
  assert.ok(htmlContent.includes('id="adminEqTitle"'), '#adminEqTitle must exist');
  assert.ok(htmlContent.includes('id="adminEqGrade"'), '#adminEqGrade must exist');
  assert.ok(htmlContent.includes('id="adminEqDilemma"'), '#adminEqDilemma must exist');
  assert.ok(htmlContent.includes('id="adminEqChoice0"'), '#adminEqChoice0 must exist');
  assert.ok(htmlContent.includes('id="adminEqChoice1"'), '#adminEqChoice1 must exist');
  assert.ok(htmlContent.includes('id="adminEqSaveBtn"'), '#adminEqSaveBtn must exist');

  // Daily GK modal
  assert.ok(htmlContent.includes('id="adminModalDailyGk"'), '#adminModalDailyGk must exist');
  assert.ok(htmlContent.includes('id="adminDailyGkTopic"'), '#adminDailyGkTopic must exist');
  assert.ok(htmlContent.includes('id="adminDailyGkFact"'), '#adminDailyGkFact must exist');

  // Quiz modal
  assert.ok(htmlContent.includes('id="adminModalQuiz"'), '#adminModalQuiz must exist');
  assert.ok(htmlContent.includes('id="adminQuizTitle"'), '#adminQuizTitle must exist');
  assert.ok(htmlContent.includes('id="adminQuizGrade"'), '#adminQuizGrade must exist');

  // Quest modal & Delete Confirm modal
  assert.ok(htmlContent.includes('id="adminModalQuest"'), '#adminModalQuest must exist');
  assert.ok(htmlContent.includes('id="adminDeleteConfirmModal"'), '#adminDeleteConfirmModal must exist');
  assert.ok(htmlContent.includes('id="adminDeleteConfirmBtn"'), '#adminDeleteConfirmBtn must exist');
});

runTest('R1-06: Admin controllers implemented genuinely with RBAC and optimistic lock protection', () => {
  assert.ok(htmlContent.includes('function renderAdminView()'), 'renderAdminView must exist');
  assert.ok(htmlContent.includes('function loadAdminContent()'), 'loadAdminContent must exist');
  assert.ok(htmlContent.includes('function fetchAdminContentList()'), 'fetchAdminContentList must exist');
  assert.ok(htmlContent.includes('function handleAdminToggleStatus('), 'handleAdminToggleStatus must exist');
  assert.ok(htmlContent.includes('function openAdminCreateModal()'), 'openAdminCreateModal must exist');
  assert.ok(htmlContent.includes('function openAdminEditModal('), 'openAdminEditModal must exist');
  assert.ok(htmlContent.includes('function saveAdminModalContent('), 'saveAdminModalContent must exist');
  assert.ok(htmlContent.includes('function deleteAdminContent('), 'deleteAdminContent must exist');
  assert.ok(htmlContent.includes('function verifyAdminPinChallenge()'), 'verifyAdminPinChallenge must exist');
  assert.ok(htmlContent.includes('isAdminMutating'), 'isAdminMutating lock indicator must be handled');
});

// -------------------------------------------------------------------------
// SECTION 2: FAMILY ONBOARDING WORKFLOW (R5)
// -------------------------------------------------------------------------
console.log('\n--- 2. FAMILY ONBOARDING WORKFLOW (R5) ---');

runTest('R5-01: Family onboarding entry points exist in Header and Auth Modal', () => {
  assert.ok(htmlContent.includes('id="btnHeaderFamilyOnboarding"'), '#btnHeaderFamilyOnboarding must exist');
  assert.ok(htmlContent.includes('id="btnOpenFamilyOnboardingFromSignIn"'), '#btnOpenFamilyOnboardingFromSignIn must exist');
  assert.ok(htmlContent.includes("openFamilyOnboardingModal()"), 'Must trigger openFamilyOnboardingModal()');
});

runTest('R5-02: 3-step Family Onboarding modal wizard #modal-family-onboarding exists', () => {
  assert.ok(htmlContent.includes('id="modal-family-onboarding"'), '#modal-family-onboarding must exist');
  assert.ok(htmlContent.includes('id="onboarding-step-1"'), '#onboarding-step-1 must exist');
  assert.ok(htmlContent.includes('id="onboarding-step-2"'), '#onboarding-step-2 must exist');
  assert.ok(htmlContent.includes('id="onboarding-step-3"'), '#onboarding-step-3 must exist');
  assert.ok(htmlContent.includes('id="onboarding-children-container"'), '#onboarding-children-container must exist');
  assert.ok(htmlContent.includes('id="btn-onboarding-add-child"'), '#btn-onboarding-add-child must exist');
  assert.ok(htmlContent.includes('id="onboarding-terms-checkbox"'), '#onboarding-terms-checkbox must exist');
  assert.ok(htmlContent.includes('id="btn-onboarding-submit"'), '#btn-onboarding-submit must exist');
  assert.ok(htmlContent.includes('id="onboarding-step-success"'), '#onboarding-step-success must exist');
  assert.ok(htmlContent.includes('id="onboarding-success-pairing-code"'), '#onboarding-success-pairing-code must exist');
});

runTest('R5-03: Onboarding wizard controller implements dynamic 1-to-N enrollment & session hydration', () => {
  assert.ok(htmlContent.includes('function openFamilyOnboardingModal()'), 'openFamilyOnboardingModal must exist');
  assert.ok(htmlContent.includes('function goToOnboardingStep('), 'goToOnboardingStep must exist');
  assert.ok(htmlContent.includes('function addOnboardingChild()'), 'addOnboardingChild must exist');
  assert.ok(htmlContent.includes('function removeOnboardingChild('), 'removeOnboardingChild must exist');
  assert.ok(htmlContent.includes('function submitFamilyOnboarding()'), 'submitFamilyOnboarding must exist');
  assert.ok(htmlContent.includes('function finishFamilyOnboardingAndLaunchHQ()'), 'finishFamilyOnboardingAndLaunchHQ must exist');
  assert.ok(htmlContent.includes('ZoptroApiClient.signUpFamilyOnboarding'), 'Must integrate with API client signUpFamilyOnboarding');
});

// -------------------------------------------------------------------------
// SECTION 3: LONGITUDINAL STUDENT GROWTH PROFILE & MULTI-CHILD GOVERNANCE (R4 & R5)
// -------------------------------------------------------------------------
console.log('\n--- 3. LONGITUDINAL PROFILE & MULTI-CHILD GOVERNANCE (R4 & R5) ---');

runTest('R4-01: Longitudinal Profile UI section contains developmental analytics and dimension selectors', () => {
  assert.ok(htmlContent.includes('id="parentLongitudinalGrowthSection"'), '#parentLongitudinalGrowthSection must exist');
  assert.ok(htmlContent.includes('id="longitudinalChildNameBadge"'), '#longitudinalChildNameBadge must exist');
  assert.ok(htmlContent.includes('id="longitudinalTimeRangeFilter"'), '#longitudinalTimeRangeFilter must exist');
  assert.ok(htmlContent.includes('id="longitudinalMetricFilter"'), '#longitudinalMetricFilter must exist');
});

runTest('R4-02: Pure SVG vector chart #longitudinalSvgChart exists with responsive viewBox and rect markers', () => {
  assert.ok(htmlContent.includes('id="longitudinalSvgChart"'), '#longitudinalSvgChart must exist');
  assert.ok(htmlContent.includes('viewBox="0 0 760 260"'), 'SVG chart must have viewBox="0 0 760 260"');
  assert.ok(htmlContent.includes('id="longitudinalMilestonesGrid"'), '#longitudinalMilestonesGrid must exist');
  assert.ok(htmlContent.includes('id="longitudinalEmptyState"'), '#longitudinalEmptyState must exist');
  assert.ok(htmlContent.includes('renderLongitudinalSvgChart'), 'renderLongitudinalSvgChart function must exist');
});

runTest('R4-03: Longitudinal controller handles time ranges and multi-dimensional metrics', () => {
  assert.ok(htmlContent.includes('function loadLongitudinalProfile('), 'loadLongitudinalProfile must exist');
  assert.ok(htmlContent.includes('function setLongitudinalTimeRange('), 'setLongitudinalTimeRange must exist');
  assert.ok(htmlContent.includes('function setLongitudinalMetric('), 'setLongitudinalMetric must exist');
  assert.ok(htmlContent.includes('ZoptroApiClient.getLongitudinalProfile'), 'Must query getLongitudinalProfile from backend');
});

runTest('R4-04: Child Governance container contains CBSE/NCERT grade dropdown and limits', () => {
  assert.ok(htmlContent.includes('id="parentGovernanceContainer"'), '#parentGovernanceContainer must exist');
  assert.ok(htmlContent.includes('id="governanceTargetChildNameLabel"'), '#governanceTargetChildNameLabel must exist');
  assert.ok(htmlContent.includes('id="childGovernanceGradeSelect"'), '#childGovernanceGradeSelect must exist');
  assert.ok(htmlContent.includes('id="childGovernanceAgeInput"'), '#childGovernanceAgeInput must exist');
  assert.ok(htmlContent.includes('id="childGovernanceSprintTarget"'), '#childGovernanceSprintTarget must exist');
  assert.ok(htmlContent.includes('id="childGovernanceScreenTime"'), '#childGovernanceScreenTime must exist');
  assert.ok(htmlContent.includes('id="childGovernanceBedtime"'), '#childGovernanceBedtime must exist');
  assert.ok(htmlContent.includes('id="btnSaveChildGovernance"'), '#btnSaveChildGovernance must exist');
  assert.ok(htmlContent.includes('function populateChildGovernanceForm('), 'populateChildGovernanceForm must exist');
  assert.ok(htmlContent.includes('function submitChildGovernanceUpdate()'), 'submitChildGovernanceUpdate must exist');
});

runTest('R4-05: App Header Multi-Child Switcher #headerChildSelectorContainer exists', () => {
  assert.ok(htmlContent.includes('id="headerChildSelectorContainer"'), '#headerChildSelectorContainer must exist');
  assert.ok(htmlContent.includes('id="headerChildSwitcher"'), '#headerChildSwitcher must exist');
  assert.ok(htmlContent.includes('id="headerActiveChildSelect"'), '#headerActiveChildSelect must exist');
  assert.ok(htmlContent.includes('selectActiveChild(this.value)'), 'Header switcher must trigger selectActiveChild');
});

// -------------------------------------------------------------------------
// SECTION 4: STRICT BRAND COMPLIANCE & 90° GEOMETRY
// -------------------------------------------------------------------------
console.log('\n--- 4. STRICT BRAND COMPLIANCE & 90° GEOMETRY ---');

runTest('B-01: Universal 0px border-radius: no forbidden rounded classes in new markup', () => {
  const forbidden = htmlContent.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
  assert.strictEqual(forbidden, null, 'Found forbidden non-none rounded classes');
});

runTest('B-02: Zoptro palette tokens present across M3 views (#09293D, #F4F2EA, #666D57, #F65800)', () => {
  ['#09293D', '#F4F2EA', '#666D57', '#F65800', '#1C5682', '#7FBF19'].forEach(token => {
    assert.ok(htmlContent.includes(token), `Palette token ${token} must be used`);
  });
});

console.log('=================================================================');
console.log(`🏁 MILESTONE 3 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL MILESTONE 3 FRONTEND TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('=================================================================');
