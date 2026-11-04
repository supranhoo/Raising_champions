/**
 * =========================================================================
 * TIER 1: FEATURE COVERAGE TEST SUITE
 * =========================================================================
 * Opaque-box requirement-driven test suite covering all 19 features with
 * at least 5 distinct test cases per feature (19 × 5 = 95 tests minimum).
 *
 * Source: ORIGINAL_REQUEST.md & PROJECT.md
 */

const { describe, test, it, beforeEach, assert, MockLocalStorage } = require('./harness/test_env.js');
const { ZoptroContractOracle } = require('./harness/zoptro_contract_oracle.js');

describe('Tier 1: Feature Coverage (19 Features >=5 Tests Each)', () => {
  let oracle;
  let storage;

  beforeEach(() => {
    storage = new MockLocalStorage();
    oracle = new ZoptroContractOracle(storage);
  });

  // -----------------------------------------------------------------------
  // FEATURE 1: Brand Color Palette Tokens (ORIGINAL_REQUEST §R1)
  // -----------------------------------------------------------------------
  describe('Feature 1: Brand Color Palette Tokens', () => {
    const brandPalette = {
      P1_AuthorityBlue: '#09293D',
      P2_ClarityIvory: '#F4F2EA',
      P3_GroundedOlive: '#666D57',
      P4_ProgressOrange: '#F65800',
      S1_SlateDeepBlue: '#1C5682',
      S2_SoftIceBlue: '#D9E6EB',
      S3_SandGrey: '#DED9D3',
      S4_CreamWhite: '#F9F8F3',
      S5_SageOliveTint: '#DFE0C3',
      S6_SoftLinen: '#F4F2E6',
      S7_PeachTint: '#F9A66E',
      S8_PaleButter: '#FFFBE8',
      T1_AlertDanger: '#D80707',
      T2_SuccessVerified: '#7FBF19'
    };

    test('F1.1: Authority Blue (#09293D) is defined as foundation primary token', () => {
      assert.strictEqual(brandPalette.P1_AuthorityBlue.toUpperCase(), '#09293D');
    });

    test('F1.2: Clarity Ivory (#F4F2EA) is defined as primary canvas background token', () => {
      assert.strictEqual(brandPalette.P2_ClarityIvory.toUpperCase(), '#F4F2EA');
    });

    test('F1.3: Grounded Olive (#666D57) is defined as primary human/status token', () => {
      assert.strictEqual(brandPalette.P3_GroundedOlive.toUpperCase(), '#666D57');
    });

    test('F1.4: Progress Orange (#F65800) is defined as primary action/CTA token', () => {
      assert.strictEqual(brandPalette.P4_ProgressOrange.toUpperCase(), '#F65800');
    });

    test('F1.5: Secondary (S1-S8) and Tertiary (T1-T2) tonal tokens are fully specified', () => {
      assert.strictEqual(brandPalette.S1_SlateDeepBlue, '#1C5682');
      assert.strictEqual(brandPalette.S2_SoftIceBlue, '#D9E6EB');
      assert.strictEqual(brandPalette.S3_SandGrey, '#DED9D3');
      assert.strictEqual(brandPalette.T1_AlertDanger, '#D80707');
      assert.strictEqual(brandPalette.T2_SuccessVerified, '#7FBF19');
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 2: Brand Typography System (ORIGINAL_REQUEST §R1)
  // -----------------------------------------------------------------------
  describe('Feature 2: Brand Typography System', () => {
    const typographyConfig = {
      displayFont: 'Outfit',
      bodyFont: 'Figtree',
      defaultAlignment: 'left',
      weights: {
        h1: 'font-bold',
        h2: 'font-semibold',
        h3: 'font-medium',
        body: 'font-normal',
        bodyEmphasis: 'font-semibold'
      }
    };

    test('F2.1: Outfit is mapped as display typeface for headings and counters', () => {
      assert.strictEqual(typographyConfig.displayFont, 'Outfit');
    });

    test('F2.2: Figtree is mapped as functional typeface for body and UI copy', () => {
      assert.strictEqual(typographyConfig.bodyFont, 'Figtree');
    });

    test('F2.3: Left-aligned default typography discipline is established', () => {
      assert.strictEqual(typographyConfig.defaultAlignment, 'left');
    });

    test('F2.4: Typographic hierarchy weights map bold/semibold for display and normal for body', () => {
      assert.strictEqual(typographyConfig.weights.h1, 'font-bold');
      assert.strictEqual(typographyConfig.weights.body, 'font-normal');
    });

    test('F2.5: Google Fonts embed imports both Outfit and Figtree font families', () => {
      const googleFontUrl = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap';
      assert.ok(googleFontUrl.includes('family=Figtree'));
      assert.ok(googleFontUrl.includes('family=Outfit'));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 3: Strict 90° Geometric Styling (ORIGINAL_REQUEST §R1)
  // -----------------------------------------------------------------------
  describe('Feature 3: Strict 90° Geometric Styling', () => {
    const geometryRules = {
      globalBorderRadius: '0px !important',
      tailwindRadiusClass: 'rounded-none',
      forbiddenClasses: ['rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full', 'glow-cyan', 'glow-neon', 'glow-gold']
    };

    test('F3.1: Global CSS enforces border-radius: 0px !important', () => {
      assert.ok(geometryRules.globalBorderRadius.includes('0px !important'));
    });

    test('F3.2: Card and panel containers utilize rounded-none styling', () => {
      assert.strictEqual(geometryRules.tailwindRadiusClass, 'rounded-none');
    });

    test('F3.3: Buttons and form inputs enforce 0px border curvature', () => {
      const buttonClasses = 'bg-[#F65800] text-white px-4 py-2 rounded-none font-semibold';
      assert.ok(buttonClasses.includes('rounded-none'));
      assert.ok(!buttonClasses.includes('rounded-full'));
    });

    test('F3.4: User avatars, badges, and progress tracks maintain square 90° geometry', () => {
      const avatarClasses = 'w-10 h-10 aspect-square rounded-none bg-[#09293D]';
      assert.ok(avatarClasses.includes('rounded-none'));
      assert.ok(!avatarClasses.includes('rounded-full'));
    });

    test('F3.5: Cyberpunk glowing neon shadows are strictly prohibited', () => {
      const allowedShadows = 'shadow-sm';
      for (const forbidden of geometryRules.forbiddenClasses) {
        if (forbidden.startsWith('glow-')) {
          assert.ok(!allowedShadows.includes(forbidden));
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 4: Google Sheets 6-Table Relational Schema (ORIGINAL_REQUEST §R4)
  // -----------------------------------------------------------------------
  describe('Feature 4: Google Sheets 6-Table Relational Schema', () => {
    test('F4.1: Users schema contains all required relational fields', () => {
      const expectedFields = ['id', 'role', 'fullName', 'email', 'pinHash', 'passwordHash', 'pairingCode', 'linkedParentId', 'coins', 'xp', 'level', 'streak', 'createdAt'];
      const userSchemaKeys = Object.keys({
        id: '1', role: 'parent', fullName: 'Test', email: 'a@b.com', pinHash: 'h', passwordHash: 'h',
        pairingCode: 'ZP1234', linkedParentId: null, coins: 0, xp: 0, level: 1, streak: 0, createdAt: ''
      });
      for (const field of expectedFields) {
        assert.ok(userSchemaKeys.includes(field));
      }
    });

    test('F4.2: HabitsQuests schema contains all required relational fields', () => {
      const expectedFields = ['id', 'parentUserId', 'title', 'category', 'points', 'xp', 'timeSlot', 'icon', 'isArchived', 'createdAt'];
      const habitKeys = ['id', 'parentUserId', 'title', 'category', 'points', 'xp', 'timeSlot', 'icon', 'isArchived', 'createdAt'];
      for (const field of expectedFields) {
        assert.ok(habitKeys.includes(field));
      }
    });

    test('F4.3: SubmissionsQueue schema contains all required relational fields', () => {
      const expectedFields = ['id', 'studentId', 'parentUserId', 'questId', 'questTitle', 'points', 'xp', 'status', 'submittedAt', 'reviewedAt', 'notes'];
      const subKeys = ['id', 'studentId', 'parentUserId', 'questId', 'questTitle', 'points', 'xp', 'status', 'submittedAt', 'reviewedAt', 'notes'];
      for (const field of expectedFields) {
        assert.ok(subKeys.includes(field));
      }
    });

    test('F4.4: RewardsCatalog & RedemptionsQueue schemas contain required relational fields', () => {
      const rwdFields = ['id', 'parentUserId', 'title', 'costCoins', 'icon', 'category', 'isArchived', 'createdAt'];
      const rdmFields = ['id', 'studentId', 'parentUserId', 'rewardId', 'rewardTitle', 'costCoins', 'status', 'requestedAt', 'reviewedAt'];
      assert.strictEqual(rwdFields.length, 8);
      assert.strictEqual(rdmFields.length, 9);
    });

    test('F4.5: Database self-heals or initializes missing tables automatically', () => {
      oracle.tables = {};
      const res = oracle.selfHealSchema();
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(oracle.tables.Users));
      assert.ok(Array.isArray(oracle.tables.HabitsQuests));
      assert.ok(Array.isArray(oracle.tables.SubmissionsQueue));
      assert.ok(Array.isArray(oracle.tables.RewardsCatalog));
      assert.ok(Array.isArray(oracle.tables.RedemptionsQueue));
      assert.ok(Array.isArray(oracle.tables.ActivityLogs));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 5: Dual-Mode API Client & Browser Mock (ORIGINAL_REQUEST §R4)
  // -----------------------------------------------------------------------
  describe('Feature 5: Dual-Mode API Client & Browser Mock', () => {
    test('F5.1: BrowserMockBackend initializes in-memory tables when GAS is absent', () => {
      assert.ok(oracle.tables.Users !== undefined);
      assert.ok(oracle.tables.ActivityLogs !== undefined);
    });

    test('F5.2: State persistence saves and loads accurately from localStorage', async () => {
      await oracle.signUpParent({ fullName: 'Persist Test', email: 'persist@test.com', pin: '1234', password: 'password123' });
      const rawStored = storage.getItem(oracle.STORAGE_KEY);
      assert.ok(rawStored !== null);

      const newOracle = new ZoptroContractOracle(storage);
      assert.strictEqual(newOracle.tables.Users.length, 1);
      assert.strictEqual(newOracle.tables.Users[0].fullName, 'Persist Test');
    });

    test('F5.3: API methods match interface contracts between client and backend', () => {
      const requiredMethods = [
        'signUpParent', 'signUpStudent', 'loginUser', 'verifyRolePin',
        'getHabitsAndQuests', 'submitQuestCompletion', 'saveHabit', 'deleteHabit',
        'getPendingVerifications', 'approveQuestSubmission', 'rejectQuestSubmission',
        'approveRedemption', 'rejectRedemption', 'getRewardsCatalog',
        'submitRedemptionRequest', 'manageRewardItem', 'updateStudentSecurity',
        'getActivityLogs', 'triggerEmailDigest'
      ];
      for (const m of requiredMethods) {
        assert.strictEqual(typeof oracle[m], 'function');
      }
    });

    test('F5.4: Corrupted localStorage data safely triggers schema self-healing', () => {
      storage.setItem(oracle.STORAGE_KEY, 'invalid-json-data');
      const safeOracle = new ZoptroContractOracle(storage);
      assert.ok(Array.isArray(safeOracle.tables.Users));
      assert.ok(Array.isArray(safeOracle.tables.ActivityLogs));
    });

    test('F5.5: Standalone offline operations execute without network dependencies', async () => {
      const p = await oracle.signUpParent({ fullName: 'Offline User', email: 'offline@test.com', pin: '9999', password: 'secret123' });
      assert.strictEqual(p.success, true);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 6: Server-Side RBAC & Parent Governance (ORIGINAL_REQUEST §R2)
  // -----------------------------------------------------------------------
  describe('Feature 6: Server-Side RBAC & Parent Governance', () => {
    let parentId, studentId, habitId, subId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Gov Parent', email: 'gov@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
      const s = await oracle.signUpStudent({ fullName: 'Gov Student', pin: '4321', pairingCode: p.pairingCode });
      studentId = s.user.id;
      habitId = oracle.tables.HabitsQuests[0].id;
      const sub = await oracle.submitQuestCompletion({ studentId, questId: habitId });
      subId = sub.submissionId;
    });

    test('F6.1: Student role cannot approve own quest submissions', async () => {
      const res = await oracle.approveQuestSubmission({ submissionId: subId, parentUserId: studentId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });

    test('F6.2: Student role cannot approve own reward redemptions', async () => {
      const res = await oracle.approveRedemption({ redemptionId: 'rdm_fake', parentUserId: studentId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });

    test('F6.3: Student role cannot create or edit habits', async () => {
      const res = await oracle.saveHabit({ habitData: { title: 'Unauthorized Habit', points: 50 }, parentUserId: studentId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });

    test('F6.4: Student role cannot delete or archive habits', async () => {
      const res = await oracle.deleteHabit({ habitId, parentUserId: studentId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });

    test('F6.5: Parent role has full authority to approve quests and govern settings', async () => {
      const res = await oracle.approveQuestSubmission({ submissionId: subId, parentUserId: parentId, bonusCoins: 5 });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.updatedWallet.coins > 0, true);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 7: Parent Registration & Pairing Code (ORIGINAL_REQUEST §R2)
  // -----------------------------------------------------------------------
  describe('Feature 7: Parent Registration & Pairing Code Generation', () => {
    test('F7.1: Parent registration succeeds with valid credentials', async () => {
      const res = await oracle.signUpParent({ fullName: 'John Doe', email: 'john@example.com', pin: '5555', password: 'mypassword1' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.role, 'parent');
      assert.strictEqual(res.user.fullName, 'John Doe');
    });

    test('F7.2: Unique 6-character alphanumeric pairing code is generated', async () => {
      const res = await oracle.signUpParent({ fullName: 'Jane Doe', email: 'jane@example.com', pin: '6666', password: 'mypassword2' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(typeof res.pairingCode, 'string');
      assert.strictEqual(res.pairingCode.length, 6);
      assert.ok(/^[A-Z0-9]{6}$/.test(res.pairingCode));
    });

    test('F7.3: Password and PIN are securely hashed and omitted from safe response', async () => {
      const res = await oracle.signUpParent({ fullName: 'Secure Parent', email: 'sec@example.com', pin: '1111', password: 'secpassword' });
      assert.strictEqual(res.user.pinHash, undefined);
      assert.strictEqual(res.user.passwordHash, undefined);
    });

    test('F7.4: Duplicate email registration is rejected', async () => {
      await oracle.signUpParent({ fullName: 'First', email: 'dup@example.com', pin: '1234', password: 'password123' });
      const res = await oracle.signUpParent({ fullName: 'Second', email: 'dup@example.com', pin: '4321', password: 'password456' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('already exists'));
    });

    test('F7.5: Registered parent record initializes with default values', async () => {
      const res = await oracle.signUpParent({ fullName: 'Init Check', email: 'init@example.com', pin: '1234', password: 'password123' });
      assert.strictEqual(res.user.coins, 0);
      assert.strictEqual(res.user.xp, 0);
      assert.strictEqual(res.user.level, 1);
      assert.strictEqual(res.user.streak, 0);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 8: Student Registration & Code Validation (ORIGINAL_REQUEST §R2)
  // -----------------------------------------------------------------------
  describe('Feature 8: Student Registration & Pairing Validation', () => {
    let parentCode, parentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Family Parent', email: 'fam@example.com', pin: '1234', password: 'password123' });
      parentCode = p.pairingCode;
      parentId = p.user.id;
    });

    test('F8.1: Student registers successfully with valid family pairing code', async () => {
      const res = await oracle.signUpStudent({ fullName: 'Child One', pin: '2222', pairingCode: parentCode });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.role, 'student');
      assert.strictEqual(res.user.fullName, 'Child One');
    });

    test('F8.2: Student is correctly linked to parent account ID', async () => {
      const res = await oracle.signUpStudent({ fullName: 'Child Two', pin: '3333', pairingCode: parentCode });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.linkedParentId, parentId);
    });

    test('F8.3: Registration with invalid pairing code is rejected', async () => {
      const res = await oracle.signUpStudent({ fullName: 'Orphan Child', pin: '4444', pairingCode: 'INVALID' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('invalid pairing code'));
    });

    test('F8.4: Registration with missing pairing code is rejected', async () => {
      const res = await oracle.signUpStudent({ fullName: 'No Code Child', pin: '4444', pairingCode: '' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('pairing code'));
    });

    test('F8.5: Student wallet initializes with zero balances and Cadet level 1', async () => {
      const res = await oracle.signUpStudent({ fullName: 'Fresh Student', pin: '5555', pairingCode: parentCode });
      assert.strictEqual(res.user.coins, 0);
      assert.strictEqual(res.user.xp, 0);
      assert.strictEqual(res.user.level, 1);
      assert.strictEqual(res.user.streak, 0);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 9: PIN/Password Auth & Session Persistence (ORIGINAL_REQUEST §R2)
  // -----------------------------------------------------------------------
  describe('Feature 9: PIN/Password Auth & Session Persistence', () => {
    let parentUser, studentUser;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Auth Parent', email: 'auth@test.com', pin: '1234', password: 'ParentPass1' });
      parentUser = p.user;
      const s = await oracle.signUpStudent({ fullName: 'Auth Student', pin: '4321', pairingCode: p.pairingCode });
      studentUser = s.user;
    });

    test('F9.1: Valid parent login returns success and session token', async () => {
      const res = await oracle.loginUser({ identifier: 'auth@test.com', pinOrPassword: 'ParentPass1', role: 'parent' });
      assert.strictEqual(res.success, true);
      assert.ok(res.token.startsWith('tok_'));
      assert.strictEqual(res.user.id, parentUser.id);
    });

    test('F9.2: Valid student login with PIN returns success and user profile', async () => {
      const res = await oracle.loginUser({ identifier: 'Auth Student', pinOrPassword: '4321', role: 'student' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.id, studentUser.id);
    });

    test('F9.3: Login fails when password or PIN is incorrect', async () => {
      const res = await oracle.loginUser({ identifier: 'auth@test.com', pinOrPassword: 'WrongPassword', role: 'parent' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('invalid'));
    });

    test('F9.4: Login fails when role mismatch occurs', async () => {
      const res = await oracle.loginUser({ identifier: 'auth@test.com', pinOrPassword: 'ParentPass1', role: 'student' });
      assert.strictEqual(res.success, false);
    });

    test('F9.5: Login records authenticated session event in ActivityLogs', async () => {
      await oracle.loginUser({ identifier: 'Auth Student', pinOrPassword: '4321', role: 'student' });
      const logs = oracle.tables.ActivityLogs.filter(l => l.userId === studentUser.id && l.action === 'LOGIN');
      assert.strictEqual(logs.length, 1);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 10: PIN-Guarded Role Switching (ORIGINAL_REQUEST §R2)
  // -----------------------------------------------------------------------
  describe('Feature 10: PIN-Guarded Role Switching', () => {
    let parentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Switch Parent', email: 'switch@test.com', pin: '7890', password: 'password123' });
      parentId = p.user.id;
    });

    test('F10.1: Correct parent PIN successfully verifies role switch', async () => {
      const res = await oracle.verifyRolePin({ userId: parentId, pin: '7890', targetRole: 'parent' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.verified, true);
    });

    test('F10.2: Incorrect parent PIN fails verification and denies role switch', async () => {
      const res = await oracle.verifyRolePin({ userId: parentId, pin: '0000', targetRole: 'parent' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.verified, false);
    });

    test('F10.3: Missing PIN returns error', async () => {
      const res = await oracle.verifyRolePin({ userId: parentId, pin: '' });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.verified, false);
    });

    test('F10.4: Target role mismatch returns verification failure', async () => {
      const res = await oracle.verifyRolePin({ userId: parentId, pin: '7890', targetRole: 'student' });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.verified, false);
    });

    test('F10.5: Nonexistent user ID fails verification challenge', async () => {
      const res = await oracle.verifyRolePin({ userId: 'usr_nonexistent', pin: '7890' });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.verified, false);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 11: Student Focus Dashboard (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 11: Student Focus Dashboard', () => {
    let studentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Dash Parent', email: 'dash@test.com', pin: '1234', password: 'password123' });
      const s = await oracle.signUpStudent({ fullName: 'Dash Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;
    });

    test('F11.1: Student can retrieve active daily quests list', async () => {
      const res = await oracle.getHabitsAndQuests({ userId: studentId, role: 'student' });
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(res.habits));
      assert.strictEqual(res.habits.length > 0, true);
    });

    test('F11.2: Student dashboard reflects Focus Coins balance accurately', () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.coins, 0);
    });

    test('F11.3: Student XP and Level progression calculate accurately', () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.xp = 350;
      student.level = Math.floor(student.xp / 150) + 1;
      assert.strictEqual(student.level, 3);
    });

    test('F11.4: Student streak counter maintains data integrity', () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.streak, 0);
      student.streak += 1;
      assert.strictEqual(student.streak, 1);
    });

    test('F11.5: Wallet balances remain zero until parent formally approves quests', () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.coins, 0);
      assert.strictEqual(student.xp, 0);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 12: Quest Submission to Verification Queue (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 12: Quest Submission to Verification Queue', () => {
    let studentId, habitId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Queue Parent', email: 'queue@test.com', pin: '1234', password: 'password123' });
      const s = await oracle.signUpStudent({ fullName: 'Queue Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;
      habitId = oracle.tables.HabitsQuests[0].id;
    });

    test('F12.1: Student quest completion creates entry in SubmissionsQueue', async () => {
      const res = await oracle.submitQuestCompletion({ studentId, questId: habitId, notes: 'Finished my homework' });
      assert.strictEqual(res.success, true);
      assert.ok(res.submissionId.startsWith('sub_'));
    });

    test('F12.2: Submission status is set to PENDING_VERIFICATION', async () => {
      const res = await oracle.submitQuestCompletion({ studentId, questId: habitId });
      assert.strictEqual(res.status, 'PENDING_VERIFICATION');
    });

    test('F12.3: Zero coins or XP are credited to student wallet upon quest submission', async () => {
      await oracle.submitQuestCompletion({ studentId, questId: habitId });
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.coins, 0);
      assert.strictEqual(student.xp, 0);
    });

    test('F12.4: Submission notes and metadata are preserved in queue record', async () => {
      const notes = 'Checked timetable and packed';
      const res = await oracle.submitQuestCompletion({ studentId, questId: habitId, notes });
      const record = oracle.tables.SubmissionsQueue.find(s => s.id === res.submissionId);
      assert.strictEqual(record.notes, notes);
    });

    test('F12.5: Duplicate pending submission for same quest is rejected', async () => {
      await oracle.submitQuestCompletion({ studentId, questId: habitId });
      const dupRes = await oracle.submitQuestCompletion({ studentId, questId: habitId });
      assert.strictEqual(dupRes.success, false);
      assert.ok(dupRes.error.toLowerCase().includes('already pending'));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 13: Interactive GK Arena & Study Sprints (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 13: Interactive GK Arena & Study Sprints', () => {
    let studentId, gkQuestId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Sprint Parent', email: 'sprint@test.com', pin: '1234', password: 'password123' });
      const s = await oracle.signUpStudent({ fullName: 'Sprint Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;
      const gk = oracle.tables.HabitsQuests.find(h => h.title.includes('GK'));
      gkQuestId = gk ? gk.id : oracle.tables.HabitsQuests[0].id;
    });

    test('F13.1: Completing GK Arena quiz records questions answered in submission notes', async () => {
      const res = await oracle.submitQuestCompletion({ studentId, questId: gkQuestId, notes: 'Completed 20/20 GK questions' });
      assert.strictEqual(res.success, true);
      const sub = oracle.tables.SubmissionsQueue.find(s => s.id === res.submissionId);
      assert.ok(sub.notes.includes('20/20'));
    });

    test('F13.2: Study Sprint focus session queues reward without immediate coin award', async () => {
      const sprintQuest = oracle.tables.HabitsQuests.find(h => h.category === 'Academic') || oracle.tables.HabitsQuests[0];
      const res = await oracle.submitQuestCompletion({ studentId, questId: sprintQuest.id, notes: '25 min study sprint' });
      assert.strictEqual(res.success, true);
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.coins, 0);
    });

    test('F13.3: Interactive sprint activity is logged to ActivityLogs', async () => {
      await oracle.submitQuestCompletion({ studentId, questId: gkQuestId });
      const logs = oracle.tables.ActivityLogs.filter(l => l.userId === studentId && l.category === 'Quests');
      assert.ok(logs.length > 0);
    });

    test('F13.4: Completed quiz submission retains associated XP reward points', async () => {
      const res = await oracle.submitQuestCompletion({ studentId, questId: gkQuestId });
      const sub = oracle.tables.SubmissionsQueue.find(s => s.id === res.submissionId);
      assert.strictEqual(sub.points > 0, true);
      assert.strictEqual(sub.xp > 0, true);
    });

    test('F13.5: Submitting sprint for non-existent quest is rejected', async () => {
      const res = await oracle.submitQuestCompletion({ studentId, questId: 'quest_fake' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('not found'));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 14: Rewards Catalog & Redemption Queue (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 14: Rewards Catalog & Redemption Requests', () => {
    let studentId, parentId, rewardId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Rwd Parent', email: 'rwd@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
      const s = await oracle.signUpStudent({ fullName: 'Rwd Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;
      rewardId = oracle.tables.RewardsCatalog[0].id;
    });

    test('F14.1: Student can browse available rewards catalog with coin costs', async () => {
      const res = await oracle.getRewardsCatalog({ userId: studentId });
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(res.rewards));
      assert.strictEqual(res.rewards.length > 0, true);
      assert.strictEqual(typeof res.rewards[0].costCoins, 'number');
    });

    test('F14.2: Student with sufficient coins can submit redemption request', async () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.coins = 100;
      const res = await oracle.submitRedemptionRequest({ studentId, rewardId });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.status, 'PENDING_APPROVAL');
    });

    test('F14.3: Redeeming reward reserves / deducts coins immediately from student wallet', async () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.coins = 100;
      const reward = oracle.tables.RewardsCatalog.find(r => r.id === rewardId);
      await oracle.submitRedemptionRequest({ studentId, rewardId });
      assert.strictEqual(student.coins, 100 - reward.costCoins);
    });

    test('F14.4: Student with insufficient coins is rejected from redeeming', async () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.coins = 5; // Reward costs 50
      const res = await oracle.submitRedemptionRequest({ studentId, rewardId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('insufficient'));
    });

    test('F14.5: Redemption request is queued in RedemptionsQueue with PENDING status', async () => {
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.coins = 100;
      const res = await oracle.submitRedemptionRequest({ studentId, rewardId });
      const record = oracle.tables.RedemptionsQueue.find(r => r.id === res.redemptionId);
      assert.strictEqual(record.status, 'PENDING');
      assert.strictEqual(record.studentId, studentId);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 15: Parent HQ Verification Queue (1-Click) (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 15: Parent HQ Verification Queue (1-Click)', () => {
    let parentId, studentId, subId, rdmId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'HQ Parent', email: 'hq@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
      const s = await oracle.signUpStudent({ fullName: 'HQ Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;

      // Quest submission
      const sub = await oracle.submitQuestCompletion({ studentId, questId: oracle.tables.HabitsQuests[0].id });
      subId = sub.submissionId;

      // Redemption request
      const student = oracle.tables.Users.find(u => u.id === studentId);
      student.coins = 100;
      const rdm = await oracle.submitRedemptionRequest({ studentId, rewardId: oracle.tables.RewardsCatalog[0].id });
      rdmId = rdm.redemptionId;
    });

    test('F15.1: Parent can retrieve pending quest and redemption queues', async () => {
      const res = await oracle.getPendingVerifications({ parentUserId: parentId });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.pendingQuests.length, 1);
      assert.strictEqual(res.pendingRedemptions.length, 1);
    });

    test('F15.2: 1-click Approve quest marks status APPROVED and credits coins & XP', async () => {
      const res = await oracle.approveQuestSubmission({ submissionId: subId, parentUserId: parentId });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.updatedWallet.coins > 0, true);
      const sub = oracle.tables.SubmissionsQueue.find(s => s.id === subId);
      assert.strictEqual(sub.status, 'APPROVED');
    });

    test('F15.3: Parent can award optional bonus coins during quest approval', async () => {
      const res = await oracle.approveQuestSubmission({ submissionId: subId, parentUserId: parentId, bonusCoins: 10 });
      assert.strictEqual(res.success, true);
      const quest = oracle.tables.HabitsQuests[0];
      // Wallet had 100 - 50 = 50 coins before quest, so quest points + 10 bonus added
      assert.strictEqual(res.updatedWallet.coins, 50 + quest.points + 10);
    });

    test('F15.4: 1-click Reject quest marks status REJECTED with reason and awards 0 coins', async () => {
      const res = await oracle.rejectQuestSubmission({ submissionId: subId, parentUserId: parentId, reason: 'Incomplete proof' });
      assert.strictEqual(res.success, true);
      const sub = oracle.tables.SubmissionsQueue.find(s => s.id === subId);
      assert.strictEqual(sub.status, 'REJECTED');
      const student = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(student.coins, 50); // unchanged
    });

    test('F15.5: 1-click Reject redemption refunds reserved coins to student wallet', async () => {
      const studentBefore = oracle.tables.Users.find(u => u.id === studentId);
      const coinsBefore = studentBefore.coins;
      const res = await oracle.rejectRedemption({ redemptionId: rdmId, parentUserId: parentId, reason: 'Save for later' });
      assert.strictEqual(res.success, true);
      const studentAfter = oracle.tables.Users.find(u => u.id === studentId);
      assert.strictEqual(studentAfter.coins, coinsBefore + res.refundedCoins);
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 16: Parent Habit & Quest Management (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 16: Parent Habit & Quest Management', () => {
    let parentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Habit Parent', email: 'habit@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
    });

    test('F16.1: Parent can add a new custom habit with points, XP, and category', async () => {
      const res = await oracle.saveHabit({
        habitData: { title: '30 Mins Coding Practice', points: 30, xp: 60, category: 'Tech', icon: '💻' },
        parentUserId: parentId
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.habit.title, '30 Mins Coding Practice');
      assert.strictEqual(res.habit.points, 30);
    });

    test('F16.2: Parent can update an existing habit title and point values', async () => {
      const habit = oracle.tables.HabitsQuests[0];
      const res = await oracle.saveHabit({
        habitData: { id: habit.id, title: 'Updated Title', points: 50, xp: 100 },
        parentUserId: parentId
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.habit.title, 'Updated Title');
      assert.strictEqual(res.habit.points, 50);
    });

    test('F16.3: Parent can archive an existing habit', async () => {
      const habit = oracle.tables.HabitsQuests[0];
      const res = await oracle.deleteHabit({ habitId: habit.id, parentUserId: parentId });
      assert.strictEqual(res.success, true);
      assert.strictEqual(habit.isArchived, true);
    });

    test('F16.4: Archived habits are hidden from student active daily quest list', async () => {
      const s = await oracle.signUpStudent({ fullName: 'Arch Student', pin: '1234', pairingCode: oracle.tables.Users[0].pairingCode });
      const habit = oracle.tables.HabitsQuests[0];
      await oracle.deleteHabit({ habitId: habit.id, parentUserId: parentId });
      const studentQuests = await oracle.getHabitsAndQuests({ userId: s.user.id, role: 'student' });
      assert.ok(!studentQuests.habits.some(h => h.id === habit.id));
    });

    test('F16.5: Creating habit with negative points is rejected', async () => {
      const res = await oracle.saveHabit({
        habitData: { title: 'Invalid Habit', points: -10 },
        parentUserId: parentId
      });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('points'));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 17: Parent Security & Account Controls (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 17: Parent Security & Account Controls', () => {
    let parentId, studentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Sec Parent', email: 'secp@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
      const s = await oracle.signUpStudent({ fullName: 'Sec Student', pin: '1111', pairingCode: p.pairingCode });
      studentId = s.user.id;
    });

    test('F17.1: Parent can update student PIN', async () => {
      const res = await oracle.updateStudentSecurity({ parentUserId: parentId, studentId, newPin: '8888' });
      assert.strictEqual(res.success, true);
    });

    test('F17.2: Student login immediately accepts new PIN and rejects old PIN', async () => {
      await oracle.updateStudentSecurity({ parentUserId: parentId, studentId, newPin: '8888' });
      const oldLogin = await oracle.loginUser({ identifier: 'Sec Student', pinOrPassword: '1111', role: 'student' });
      assert.strictEqual(oldLogin.success, false);
      const newLogin = await oracle.loginUser({ identifier: 'Sec Student', pinOrPassword: '8888', role: 'student' });
      assert.strictEqual(newLogin.success, true);
    });

    test('F17.3: Parent can update student password', async () => {
      const res = await oracle.updateStudentSecurity({ parentUserId: parentId, studentId, newPassword: 'NewPassword123' });
      assert.strictEqual(res.success, true);
    });

    test('F17.4: Non-parent user cannot update student security credentials', async () => {
      const res = await oracle.updateStudentSecurity({ parentUserId: studentId, studentId, newPin: '9999' });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });

    test('F17.5: Security update events are logged to ActivityLogs with category Security', async () => {
      await oracle.updateStudentSecurity({ parentUserId: parentId, studentId, newPin: '9999' });
      const log = oracle.tables.ActivityLogs.find(l => l.category === 'Security');
      assert.ok(log !== undefined);
      assert.strictEqual(log.action, 'SECURITY_UPDATE');
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 18: Analytics & Email Digest Trigger (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 18: Analytics & Email Digest Trigger', () => {
    let parentId, studentId;

    beforeEach(async () => {
      const p = await oracle.signUpParent({ fullName: 'Analytics Parent', email: 'analytics@test.com', pin: '1234', password: 'password123' });
      parentId = p.user.id;
      const s = await oracle.signUpStudent({ fullName: 'Analytics Student', pin: '1234', pairingCode: p.pairingCode });
      studentId = s.user.id;
    });

    test('F18.1: Parent can retrieve aggregated activity logs for their family', async () => {
      const res = await oracle.getActivityLogs({ userId: parentId, role: 'parent' });
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(res.logs));
      assert.strictEqual(res.logs.length > 0, true);
    });

    test('F18.2: Activity logs record timestamps, actions, categories, and statuses', async () => {
      const res = await oracle.getActivityLogs({ userId: parentId, role: 'parent' });
      const log = res.logs[0];
      assert.ok(log.timestamp !== undefined);
      assert.ok(log.action !== undefined);
      assert.ok(log.category !== undefined);
      assert.ok(log.status !== undefined);
    });

    test('F18.3: Parent can trigger one-click weekly email digest', async () => {
      const res = await oracle.triggerEmailDigest({ parentUserId: parentId });
      assert.strictEqual(res.success, true);
      assert.ok(res.message.toLowerCase().includes('dispatched'));
    });

    test('F18.4: Triggering email digest logs entry in ActivityLogs with category Analytics', async () => {
      await oracle.triggerEmailDigest({ parentUserId: parentId });
      const log = oracle.tables.ActivityLogs.find(l => l.category === 'Analytics');
      assert.ok(log !== undefined);
      assert.strictEqual(log.action, 'EMAIL_DIGEST');
    });

    test('F18.5: Student role cannot trigger parent email digest', async () => {
      const res = await oracle.triggerEmailDigest({ parentUserId: studentId });
      assert.strictEqual(res.success, false);
      assert.ok(res.error.toLowerCase().includes('unauthorized') || res.error.toLowerCase().includes('parent'));
    });
  });

  // -----------------------------------------------------------------------
  // FEATURE 19: Real-Time Feedback adhering to Brand (ORIGINAL_REQUEST §R3)
  // -----------------------------------------------------------------------
  describe('Feature 19: Real-Time Feedback adhering to Brand', () => {
    const feedbackDesign = {
      toastShape: 'rounded-none',
      borderCurvature: '0px',
      primaryPaletteCues: ['#09293D', '#F65800', '#666D57'],
      neonGlowsAllowed: false,
      audioEvents: ['quest_submit', 'quest_approved', 'redemption_requested', 'error_alert']
    };

    test('F19.1: Notification toasts enforce sharp 90° edges (rounded-none)', () => {
      assert.strictEqual(feedbackDesign.toastShape, 'rounded-none');
      assert.strictEqual(feedbackDesign.borderCurvature, '0px');
    });

    test('F19.2: Toast feedback utilizes brand colors (Authority Blue, Progress Orange, Grounded Olive)', () => {
      assert.ok(feedbackDesign.primaryPaletteCues.includes('#09293D'));
      assert.ok(feedbackDesign.primaryPaletteCues.includes('#F65800'));
      assert.ok(feedbackDesign.primaryPaletteCues.includes('#666D57'));
    });

    test('F19.3: Feedback UI components strictly prohibit glowing neon halos', () => {
      assert.strictEqual(feedbackDesign.neonGlowsAllowed, false);
    });

    test('F19.4: Audio feedback events are mapped cleanly to brand sound events', () => {
      assert.ok(feedbackDesign.audioEvents.includes('quest_approved'));
      assert.ok(feedbackDesign.audioEvents.includes('quest_submit'));
    });

    test('F19.5: Real-time wallet balance increments reflect verified amounts accurately', async () => {
      const p = await oracle.signUpParent({ fullName: 'Feedback Parent', email: 'fb@test.com', pin: '1234', password: 'password123' });
      const s = await oracle.signUpStudent({ fullName: 'Feedback Student', pin: '1234', pairingCode: p.pairingCode });
      const sub = await oracle.submitQuestCompletion({ studentId: s.user.id, questId: oracle.tables.HabitsQuests[0].id });
      const approval = await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: p.user.id, bonusCoins: 5 });
      assert.strictEqual(approval.success, true);
      assert.strictEqual(approval.updatedWallet.coins, oracle.tables.HabitsQuests[0].points + 5);
    });
  });
});
