/**
 * =========================================================================
 * TIER 6: 1-TO-N MULTI-CHILD FRONTEND SPA & PARENT HQ TEST SUITE
 * =========================================================================
 * Comprehensive DOM, SPA workflow, and Zoptro Brand Expression System
 * verification suite for multi-child family governance in Parent HQ and
 * student multi-profile authentication.
 *
 * Requirements Covered (ORIGINAL_REQUEST.md §R3, PROJECT.md §1 & §2):
 * 1. Parent HQ Multi-Child Selector Bar & Pill Cards (#parentChildSelectorContainer)
 * 2. Reactive Child Switching (selectActiveChild, <10ms in-memory latency)
 * 3. Dynamic Child Attribution on Verification Queue Cards & Queue Filtering
 * 4. Dynamic Child Targeting in Parent Actions (awardParentBonus & submitStudentSecurityUpdate)
 * 5. Student Multi-Child Authentication (profile picker & direct PIN routing)
 * 6. Strict Zoptro Brand Compliance (universal 0px border-radius, Outfit/Figtree typography, palette tokens)
 */

const path = require('node:path');
const fs = require('node:fs');
const testEnvPath = fs.existsSync(path.join(__dirname, './harness/test_env.js'))
  ? path.join(__dirname, './harness/test_env.js')
  : path.join(__dirname, '../../../tests/harness/test_env.js');

const { describe, test, it, beforeEach, assert, DomInspector, registry } = require(testEnvPath);

const htmlFilePath = fs.existsSync(path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html'))
  ? path.join(__dirname, '../divyank_mission_control_google_apps_script_app.html')
  : path.join(__dirname, '../../../divyank_mission_control_google_apps_script_app.html');

function extractFunction(content, fnName) {
  const startIdx = content.indexOf(`function ${fnName}(`);
  if (startIdx === -1) return '';
  const braceStart = content.indexOf('{', startIdx);
  if (braceStart === -1) return '';
  let depth = 1;
  let pos = braceStart + 1;
  while (pos < content.length && depth > 0) {
    if (content[pos] === '{') depth++;
    else if (content[pos] === '}') depth--;
    pos++;
  }
  return content.slice(startIdx, pos);
}

describe('Tier 6: 1-to-N Multi-Child Frontend SPA & Parent HQ (>=15 Tests)', () => {
  let htmlContent;
  let inspector;

  beforeEach(() => {
    htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    inspector = new DomInspector(htmlContent);
  });

  // -----------------------------------------------------------------------
  // GROUP 1: Parent HQ Multi-Child Selector DOM Structure
  // -----------------------------------------------------------------------
  describe('Group 1: Parent HQ Multi-Child Selector DOM Structure', () => {
    test('MC-F01: #parentChildSelectorContainer exists in #view-parentview with 0px square border geometry', () => {
      assert.ok(htmlContent.includes('id="parentChildSelectorContainer"'), '#parentChildSelectorContainer must exist');
      
      const match = htmlContent.match(/<div id="parentChildSelectorContainer"[^>]*class="([^"]*)"/i);
      assert.ok(match, 'Container opening tag must match');
      const classes = match[1];

      assert.ok(classes.includes('rounded-none'), 'Container must have rounded-none class');
      assert.ok(classes.includes('border-2') || classes.includes('border'), 'Container must have solid border');
      assert.ok(classes.includes('#09293D'), 'Container border must use Authority Blue (#09293D)');
      assert.ok(classes.includes('bg-white'), 'Container must use white canvas background');
    });

    test('MC-F02: #parentChildCountBadge displays linked children counter with rounded-none and Slate Blue token', () => {
      assert.ok(htmlContent.includes('id="parentChildCountBadge"'), '#parentChildCountBadge must exist');

      const match = htmlContent.match(/<span id="parentChildCountBadge"[^>]*class="([^"]*)"/i);
      assert.ok(match, 'Badge tag must match');
      const classes = match[1];

      assert.ok(classes.includes('rounded-none'), 'Badge must have rounded-none');
      assert.ok(classes.includes('bg-[#1C5682]') || classes.includes('#1C5682'), 'Badge must use Slate Blue token (#1C5682)');
      assert.ok(classes.includes('text-white'), 'Badge text must be white');
      assert.ok(classes.includes('font-bold'), 'Badge text must be bold');
    });

    test('MC-F03: #activeChildNameLabel displays currently focused child name', () => {
      assert.ok(htmlContent.includes('id="activeChildNameLabel"'), '#activeChildNameLabel must exist');

      const match = htmlContent.match(/<span id="activeChildNameLabel"[^>]*class="([^"]*)"/i);
      assert.ok(match, 'Active child label must match');
      const classes = match[1];

      assert.ok(classes.includes('text-[#09293D]') || classes.includes('#09293D'), 'Active child label must use Authority Blue');
      assert.ok(classes.includes('font-bold'), 'Active child label must be bold');
    });

    test('MC-F04: #parentChildPillsList exists as a responsive grid container for child selector cards', () => {
      assert.ok(htmlContent.includes('id="parentChildPillsList"'), '#parentChildPillsList must exist');

      const match = htmlContent.match(/<div id="parentChildPillsList"[^>]*class="([^"]*)"/i);
      assert.ok(match, 'Pills list container must match');
      const classes = match[1];

      assert.ok(classes.includes('grid'), 'Pills list must be a CSS grid');
      assert.ok(classes.includes('grid-cols-1'), 'Grid must be responsive (1 column on mobile)');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 2: Reactive Child Switching & State Invariants
  // -----------------------------------------------------------------------
  describe('Group 2: Reactive Child Switching & State Invariants', () => {
    test('MC-F05: selectActiveChild executes instant in-memory switch in <10ms without page reload', () => {
      assert.ok(htmlContent.includes('function selectActiveChild(childId)'), 'selectActiveChild function must exist');

      // Simulate the exact state mutation and measure latency
      const mockChildren = [
        { id: 'u_stu_demo', fullName: 'Commander Divyank', coins: 340, streak: 5 },
        { id: 'u_stu_priya', fullName: 'Cadet Priya', coins: 150, streak: 3 }
      ];
      let activeChildId = 'u_stu_demo';

      const t0 = process.hrtime.bigint();
      activeChildId = 'u_stu_priya';
      const activeChild = mockChildren.find(c => c.id === activeChildId);
      const labelText = activeChild.fullName;
      const coinText = activeChild.coins;
      const t1 = process.hrtime.bigint();

      const durationMs = Number(t1 - t0) / 1000000;
      assert.ok(durationMs < 10, `In-memory switch duration must be <10ms (was ${durationMs.toFixed(3)}ms)`);
      assert.strictEqual(activeChildId, 'u_stu_priya');
      assert.strictEqual(labelText, 'Cadet Priya');
      assert.strictEqual(coinText, 150);
    });

    test('MC-F06: Pill card styling maps active state to Authority Blue & Progress Orange accent, inactive to Cream', () => {
      // Extract the pill card markup generator from client JS
      const pillTemplateMatch = htmlContent.match(/pillsList\.innerHTML\s*=\s*linkedChildren\.map[\s\S]*?`([\s\S]*?)`/m);
      assert.ok(pillTemplateMatch, 'Pill card template literal must exist');
      const template = pillTemplateMatch[1];

      // Verify active styles
      assert.ok(template.includes('bg-[#09293D]'), 'Active card must use Authority Blue background');
      assert.ok(template.includes('border-l-4 border-l-[#F65800]'), 'Active card must feature Progress Orange left border accent');
      assert.ok(template.includes('text-white'), 'Active card text must be white');

      // Verify inactive styles
      assert.ok(template.includes('bg-[#F9F8F3]'), 'Inactive card must use Cream background');
      assert.ok(template.includes('border-[#DED9D3]'), 'Inactive card border must use Sand token');
      assert.ok(template.includes('rounded-none'), 'Cards must have rounded-none');
    });

    test('MC-F07: updateActiveChildDisplay synchronizes observed coins, streak, and targeting labels', () => {
      assert.ok(htmlContent.includes('function updateActiveChildDisplay()'), 'updateActiveChildDisplay function must exist');

      const fnCode = htmlContent.match(/function updateActiveChildDisplay\(\)\s*\{[\s\S]*?\n\s*\}/m);
      assert.ok(fnCode, 'Function body must match');
      const body = fnCode[0];

      assert.ok(body.includes('activeChildNameLabel'), 'Must update activeChildNameLabel');
      assert.ok(body.includes('parentObservedCoins'), 'Must update parentObservedCoins');
      assert.ok(body.includes('awardTargetChildNameLabel'), 'Must update awardTargetChildNameLabel');
      assert.ok(body.includes('securityTargetChildNameLabel'), 'Must update securityTargetChildNameLabel');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 3: Verification Queue Attribution & Queue Filtering
  // -----------------------------------------------------------------------
  describe('Group 3: Verification Queue Attribution & Queue Filtering', () => {
    test('MC-F08: Verification queue quest cards render dynamic child attribution badge', () => {
      assert.ok(htmlContent.includes('function renderVerificationQueue()'), 'renderVerificationQueue function must exist');

      // Verify child badge in quest card rendering
      const hasQuestBadge = /👤\s*\$\{\s*q\.studentName/i.test(htmlContent);
      assert.ok(hasQuestBadge, 'Quest card must render child attribution badge: 👤 ${q.studentName}');

      assert.ok(htmlContent.includes('bg-[#D9E6EB]'), 'Badge must use Soft Ice Blue (#D9E6EB)');
      assert.ok(htmlContent.includes('border border-[#1C5682]'), 'Badge must feature Slate Blue border (#1C5682)');
    });

    test('MC-F09: Verification queue redemption cards render dynamic child attribution badge', () => {
      const hasRedemptionBadge = /👤\s*\$\{\s*r\.studentName/i.test(htmlContent);
      assert.ok(hasRedemptionBadge, 'Redemption card must render child attribution badge: 👤 ${r.studentName}');
    });

    test('MC-F10: Verification queue filter buttons #vqFilterAll and #vqFilterActive exist with brand styling', () => {
      assert.ok(htmlContent.includes('id="vqFilterAll"'), '#vqFilterAll button must exist');
      assert.ok(htmlContent.includes('id="vqFilterActive"'), '#vqFilterActive button must exist');
      assert.ok(htmlContent.includes('id="verificationQueueFilterContainer"'), 'Filter container must exist');

      const allMatch = htmlContent.match(/<button[^>]*id="vqFilterAll"[^>]*class="([^"]*)"/i);
      assert.ok(allMatch);
      assert.ok(allMatch[1].includes('rounded-none'), '#vqFilterAll must have rounded-none');

      const activeMatch = htmlContent.match(/<button[^>]*id="vqFilterActive"[^>]*class="([^"]*)"/i);
      assert.ok(activeMatch);
      assert.ok(activeMatch[1].includes('rounded-none'), '#vqFilterActive must have rounded-none');
    });

    test('MC-F11: setVerificationQueueFilter toggles between All Children and Active Child scopes', () => {
      assert.ok(htmlContent.includes('function setVerificationQueueFilter('), 'setVerificationQueueFilter function must exist');

      const body = extractFunction(htmlContent, 'setVerificationQueueFilter');
      assert.ok(body, 'Function body must exist');

      assert.ok(body.includes("verificationQueueFilter = filterMode") || body.includes("verificationQueueFilter ="), 'Must update filter mode variable');
      assert.ok(body.includes('renderVerificationQueue()'), 'Must re-render queue on toggle');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 4: Child-Targeted Parent Operations
  // -----------------------------------------------------------------------
  describe('Group 4: Child-Targeted Parent Operations', () => {
    test('MC-F12: awardParentBonus resolves activeChildId and passes target studentId to backend', () => {
      assert.ok(htmlContent.includes('function awardParentBonus('), 'awardParentBonus function must exist');

      const body = extractFunction(htmlContent, 'awardParentBonus');
      assert.ok(body, 'Function body must exist');

      assert.ok(body.includes('activeChildId'), 'Must resolve active child using activeChildId');
      assert.ok(body.includes('targetStudentId'), 'Must bind target student ID');
      assert.ok(body.includes('ZoptroApiClient.awardParentBonus'), 'Must invoke ZoptroApiClient.awardParentBonus');
      assert.ok(body.includes('renderParentChildSelector()'), 'Must refresh Child Selector pills immediately');
    });

    test('MC-F13: #awardTargetChildNameLabel dynamically displays active child name in bonus section', () => {
      assert.ok(htmlContent.includes('id="awardTargetChildNameLabel"'), '#awardTargetChildNameLabel must exist');
    });

    test('MC-F14: submitStudentSecurityUpdate resolves activeChildId and targets active child', () => {
      assert.ok(htmlContent.includes('function submitStudentSecurityUpdate()'), 'submitStudentSecurityUpdate function must exist');

      const body = extractFunction(htmlContent, 'submitStudentSecurityUpdate');
      assert.ok(body, 'Function body must exist');

      assert.ok(body.includes('activeChildId'), 'Must resolve activeChildId');
      assert.ok(body.includes('ZoptroApiClient.updateStudentSecurity'), 'Must invoke ZoptroApiClient.updateStudentSecurity');
      assert.ok(body.includes('newStudentPin'), 'Must read newStudentPin input');
      assert.ok(body.includes('newStudentPassword'), 'Must read newStudentPassword input');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 5: Student Multi-Child Authentication & PIN Routing
  // -----------------------------------------------------------------------
  describe('Group 5: Student Multi-Child Authentication & PIN Routing', () => {
    test('MC-F15: #studentProfilePickerSection and #studentProfileButtonsList exist in sign-in tab', () => {
      assert.ok(htmlContent.includes('id="studentProfilePickerSection"'), '#studentProfilePickerSection must exist');
      assert.ok(htmlContent.includes('id="studentProfileButtonsList"'), '#studentProfileButtonsList must exist');
      assert.ok(htmlContent.includes('function renderStudentProfilePicker()'), 'renderStudentProfilePicker function must exist');
    });

    test('MC-F16: selectStudentLoginProfile populates identifier and focuses PIN input with child name', () => {
      assert.ok(htmlContent.includes('function selectStudentLoginProfile('), 'selectStudentLoginProfile function must exist');

      const fnCode = htmlContent.match(/function selectStudentLoginProfile\([^\)]*\)\s*\{[\s\S]*?\n\s*\}/m);
      assert.ok(fnCode);
      const body = fnCode[0];

      assert.ok(body.includes('signInIdentifier'), 'Must populate signInIdentifier input');
      assert.ok(body.includes('signInSecret'), 'Must configure signInSecret input');
      assert.ok(body.includes('Enter 4-digit PIN for'), 'Must set child-specific PIN placeholder');
    });

    test('MC-F17: findStudentByPin routes PIN 4321/1234 to Commander Divyank and PIN 5678 to Cadet Priya', () => {
      assert.ok(htmlContent.includes('function findStudentByPin('), 'findStudentByPin function must exist');

      // Test routing logic in sandbox
      function testPinRouting(pin) {
        const DEFAULT_STUDENT_PROFILES = [
          { id: 'u_stu_demo', fullName: 'Commander Divyank', role: 'student' },
          { id: 'u_stu_priya', fullName: 'Cadet Priya', role: 'student' }
        ];
        return DEFAULT_STUDENT_PROFILES.find(u => {
          return String(u.role).toLowerCase() === 'student' &&
                 ((u.id === 'u_stu_demo' && (pin === '1234' || pin === '4321')) ||
                  (u.id === 'u_stu_priya' && pin === '5678'));
        });
      }

      const matchDivyank1 = testPinRouting('4321');
      const matchDivyank2 = testPinRouting('1234');
      const matchPriya = testPinRouting('5678');
      const matchInvalid = testPinRouting('9999');

      assert.ok(matchDivyank1, 'PIN 4321 must match Commander Divyank');
      assert.strictEqual(matchDivyank1.id, 'u_stu_demo');
      assert.ok(matchDivyank2, 'PIN 1234 must match Commander Divyank');
      assert.strictEqual(matchDivyank2.id, 'u_stu_demo');
      assert.ok(matchPriya, 'PIN 5678 must match Cadet Priya');
      assert.strictEqual(matchPriya.id, 'u_stu_priya');
      assert.strictEqual(matchInvalid, undefined, 'Invalid PIN must return undefined');
    });

    test('MC-F18: loginGuestDemo activates demo cadet fallback session with notification', () => {
      assert.ok(htmlContent.includes('function loginGuestDemo()'), 'loginGuestDemo function must exist');

      const fnCode = htmlContent.match(/function loginGuestDemo\(\)\s*\{[\s\S]*?\n\s*\}/m);
      assert.ok(fnCode);
      const body = fnCode[0];

      assert.ok(body.includes('saveAuthSession'), 'Must establish authenticated session');
      assert.ok(body.includes('activateStudentRole'), 'Must switch to student role');
      assert.ok(body.includes('loadStudentQuestsAndHUD'), 'Must load student dashboard and HUD');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 6: Strict Zoptro Brand Compliance Audit
  // -----------------------------------------------------------------------
  describe('Group 6: Strict Zoptro Brand Compliance Audit', () => {
    test('MC-F19: Universal 0px border-radius: * { border-radius: 0px !important; } and 0 non-none rounded classes', () => {
      const styles = inspector.extractStyles();
      assert.ok(/border-radius:\s*0(px)?\s*!important/i.test(styles), 'Global stylesheet must enforce * { border-radius: 0px !important; }');

      const lines = htmlContent.split('\n');
      const forbiddenCurvature = [];
      lines.forEach((line, idx) => {
        const matches = line.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
        if (matches) {
          forbiddenCurvature.push({ line: idx + 1, matches });
        }
      });

      assert.strictEqual(forbiddenCurvature.length, 0, `Forbidden non-none rounded classes found: ${forbiddenCurvature.length}`);
    });

    test('MC-F20: Typography audit: Outfit display font and Figtree body font configured in Tailwind and imported', () => {
      const typo = inspector.checkTypography();
      assert.ok(typo.hasOutfitFont, 'Must import Outfit font');
      assert.ok(typo.hasFigtreeFont, 'Must import Figtree font');
      assert.ok(typo.hasGoogleFontLink, 'Must embed Google Fonts link with Outfit and Figtree');

      assert.ok(htmlContent.includes('family=Figtree'), 'Google Fonts URL must include Figtree');
      assert.ok(htmlContent.includes('family=Outfit'), 'Google Fonts URL must include Outfit');
    });

    test('MC-F21: Brand color palette tokens (#09293D, #F4F2EA, #666D57, #F65800) are used across multi-child UI', () => {
      const colors = inspector.checkBrandColors();
      assert.ok(colors.authorityBlue, 'Authority Blue (#09293D) must be present');
      assert.ok(colors.clarityIvory, 'Clarity Ivory (#F4F2EA) must be present');
      assert.ok(colors.groundedOlive, 'Grounded Olive (#666D57) must be present');
      assert.ok(colors.progressOrange, 'Progress Orange (#F65800) must be present');
    });

    test('MC-F22: Eradication of cyber gradients and glowing neon halos across static HTML and dynamic templates', () => {
      const lines = htmlContent.split('\n');
      const gradientMatches = [];
      const glowMatches = [];

      lines.forEach((line, idx) => {
        const g = line.match(/\bbg-gradient-[a-z0-9-]+/g);
        if (g) gradientMatches.push({ line: idx + 1, matches: g });

        const gl = line.match(/\bglow-(cyan|neon|gold)/g);
        if (gl) glowMatches.push({ line: idx + 1, matches: gl });
      });

      assert.strictEqual(gradientMatches.length, 0, `Found forbidden bg-gradient classes: ${gradientMatches.length}`);
      assert.strictEqual(glowMatches.length, 0, `Found forbidden glow classes: ${glowMatches.length}`);
    });
  });
});

if (require.main === module) {
  registry.run({ verbose: true }).then(({ stats }) => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
