/**
 * =========================================================================
 * TIER 3: PAIRWISE COMBINATORIAL INTERACTIONS TEST SUITE
 * =========================================================================
 * Pairwise interaction matrix covering key cross-feature workflows
 * (>=19 tests minimum).
 *
 * Source: ORIGINAL_REQUEST.md, PROJECT.md & TEST_INFRA.md
 */

const { describe, test, it, beforeEach, assert, MockLocalStorage } = require('./harness/test_env.js');
const { ZoptroContractOracle } = require('./harness/zoptro_contract_oracle.js');

describe('Tier 3: Pairwise Combinatorial Interactions (>=19 Tests)', () => {
  let oracle;
  let storage;

  beforeEach(() => {
    storage = new MockLocalStorage();
    oracle = new ZoptroContractOracle(storage);
  });

  test('P01: Parent Registration (F7) ➔ Student Registration with Pairing Code (F8)', async () => {
    const parent = await oracle.signUpParent({
      fullName: 'Pairing Mother',
      email: 'mother@family.com',
      pin: '1234',
      password: 'password123'
    });
    assert.strictEqual(parent.success, true);
    assert.strictEqual(typeof parent.pairingCode, 'string');
    assert.strictEqual(parent.pairingCode.length, 6);

    const student = await oracle.signUpStudent({
      fullName: 'Son Tommy',
      pin: '4321',
      pairingCode: parent.pairingCode
    });
    assert.strictEqual(student.success, true);
    assert.strictEqual(student.user.linkedParentId, parent.user.id);
  });

  test('P02: Student Registration (F8) ➔ Initial Focus Dashboard State Verification (F11)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P2 Parent', email: 'p2@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P2 Student', pin: '1234', pairingCode: parent.pairingCode });

    const dashboard = await oracle.getHabitsAndQuests({ userId: student.user.id, role: 'student' });
    assert.strictEqual(dashboard.success, true);
    assert.ok(dashboard.habits.length > 0);

    const user = oracle.tables.Users.find(u => u.id === student.user.id);
    assert.strictEqual(user.coins, 0);
    assert.strictEqual(user.xp, 0);
    assert.strictEqual(user.level, 1);
    assert.strictEqual(user.streak, 0);
  });

  test('P03: Parent Habit Creation with Custom Points (F16) ➔ Student Quest List Reflection (F11)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P3 Parent', email: 'p3@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P3 Student', pin: '1234', pairingCode: parent.pairingCode });

    const newHabit = await oracle.saveHabit({
      habitData: { title: 'Algebra Practice 30m', points: 35, xp: 70, category: 'Academic', icon: '📐' },
      parentUserId: parent.user.id
    });
    assert.strictEqual(newHabit.success, true);

    const studentHabits = await oracle.getHabitsAndQuests({ userId: student.user.id, role: 'student' });
    const algebraQuest = studentHabits.habits.find(h => h.id === newHabit.habit.id);
    assert.ok(algebraQuest !== undefined);
    assert.strictEqual(algebraQuest.points, 35);
  });

  test('P04: Student Quest Submission (F11) ➔ SubmissionsQueue Entry with 0 Instant Wallet Increment (F12)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P4 Parent', email: 'p4@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P4 Student', pin: '1234', pairingCode: parent.pairingCode });
    const quest = oracle.tables.HabitsQuests[0];

    const submission = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: quest.id });
    assert.strictEqual(submission.success, true);
    assert.strictEqual(submission.status, 'PENDING_VERIFICATION');

    const studentRecord = oracle.tables.Users.find(u => u.id === student.user.id);
    assert.strictEqual(studentRecord.coins, 0);
    assert.strictEqual(studentRecord.xp, 0);
  });

  test('P05: SubmissionsQueue Entry (F12) ➔ Parent 1-Click Approval ➔ Student Wallet Credit (F15)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P5 Parent', email: 'p5@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P5 Student', pin: '1234', pairingCode: parent.pairingCode });
    const quest = oracle.tables.HabitsQuests[0];

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: quest.id });
    const approval = await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id });

    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.updatedWallet.coins, quest.points);
    assert.strictEqual(approval.updatedWallet.xp, quest.xp);
  });

  test('P06: Parent Approval with Bonus Coins (F15) ➔ Student Wallet Credit with Points + Bonus (F11)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P6 Parent', email: 'p6@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P6 Student', pin: '1234', pairingCode: parent.pairingCode });
    const quest = oracle.tables.HabitsQuests[0];

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: quest.id });
    const approval = await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id, bonusCoins: 15 });

    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.updatedWallet.coins, quest.points + 15);
  });

  test('P07: SubmissionsQueue Entry (F12) ➔ Parent 1-Click Rejection ➔ Zero Wallet Change (F15)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P7 Parent', email: 'p7@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P7 Student', pin: '1234', pairingCode: parent.pairingCode });
    const quest = oracle.tables.HabitsQuests[0];

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: quest.id });
    const rejection = await oracle.rejectQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id, reason: 'Incomplete notes' });

    assert.strictEqual(rejection.success, true);
    const studentRecord = oracle.tables.Users.find(u => u.id === student.user.id);
    assert.strictEqual(studentRecord.coins, 0);
    assert.strictEqual(studentRecord.xp, 0);
  });

  test('P08: Student GK Arena Completion (F13) ➔ Quest Submission (F12) ➔ Parent Approval (F15)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P8 Parent', email: 'p8@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P8 Student', pin: '1234', pairingCode: parent.pairingCode });
    const gkQuest = oracle.tables.HabitsQuests.find(h => h.title.includes('GK')) || oracle.tables.HabitsQuests[0];

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: gkQuest.id, notes: '20/20 Perfect GK Arena score' });
    assert.strictEqual(sub.success, true);

    const approval = await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id, bonusCoins: 5 });
    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.updatedWallet.coins, gkQuest.points + 5);
  });

  test('P09: Student Study Sprint Session (F13) ➔ Queued Submission (F12) ➔ Parent Verification (F15)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P9 Parent', email: 'p9@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P9 Student', pin: '1234', pairingCode: parent.pairingCode });
    const sprintQuest = oracle.tables.HabitsQuests[0];

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: sprintQuest.id, notes: 'Focus study sprint 25m' });
    const queue = await oracle.getPendingVerifications({ parentUserId: parent.user.id });
    assert.strictEqual(queue.pendingQuests.length, 1);
    assert.strictEqual(queue.pendingQuests[0].id, sub.submissionId);
  });

  test('P10: Student Earns Coins (F11) ➔ Submits Reward Redemption (F14) ➔ Coins Reserved (F14)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P10 Parent', email: 'p10@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P10 Student', pin: '1234', pairingCode: parent.pairingCode });
    const studentRecord = oracle.tables.Users.find(u => u.id === student.user.id);
    studentRecord.coins = 100;

    const reward = oracle.tables.RewardsCatalog[0];
    const redemption = await oracle.submitRedemptionRequest({ studentId: student.user.id, rewardId: reward.id });

    assert.strictEqual(redemption.success, true);
    assert.strictEqual(redemption.status, 'PENDING_APPROVAL');
    assert.strictEqual(studentRecord.coins, 100 - reward.costCoins);
  });

  test('P11: Redemption Request (F14) ➔ Parent 1-Click Rejection (F15) ➔ Coins Refunded to Wallet (F14)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P11 Parent', email: 'p11@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P11 Student', pin: '1234', pairingCode: parent.pairingCode });
    const studentRecord = oracle.tables.Users.find(u => u.id === student.user.id);
    studentRecord.coins = 100;

    const reward = oracle.tables.RewardsCatalog[0];
    const redemption = await oracle.submitRedemptionRequest({ studentId: student.user.id, rewardId: reward.id });
    assert.strictEqual(studentRecord.coins, 100 - reward.costCoins);

    const rejectRes = await oracle.rejectRedemption({
      redemptionId: redemption.redemptionId,
      parentUserId: parent.user.id,
      reason: 'Budget limit'
    });

    assert.strictEqual(rejectRes.success, true);
    assert.strictEqual(rejectRes.refundedCoins, reward.costCoins);
    assert.strictEqual(studentRecord.coins, 100);
  });

  test('P12: Redemption Request (F14) ➔ Parent 1-Click Approval (F15) ➔ Coins Deducted Permanently (F15)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P12 Parent', email: 'p12@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P12 Student', pin: '1234', pairingCode: parent.pairingCode });
    const studentRecord = oracle.tables.Users.find(u => u.id === student.user.id);
    studentRecord.coins = 100;

    const reward = oracle.tables.RewardsCatalog[0];
    const redemption = await oracle.submitRedemptionRequest({ studentId: student.user.id, rewardId: reward.id });
    const approval = await oracle.approveRedemption({ redemptionId: redemption.redemptionId, parentUserId: parent.user.id });

    assert.strictEqual(approval.success, true);
    assert.strictEqual(studentRecord.coins, 100 - reward.costCoins);
    const rdmRecord = oracle.tables.RedemptionsQueue.find(r => r.id === redemption.redemptionId);
    assert.strictEqual(rdmRecord.status, 'APPROVED');
  });

  test('P13: Parent Updates Habit Points (F16) ➔ Student Submits Quest (F12) ➔ New Point Value Queued', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P13 Parent', email: 'p13@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P13 Student', pin: '1234', pairingCode: parent.pairingCode });
    const habit = oracle.tables.HabitsQuests[0];

    await oracle.saveHabit({ habitData: { id: habit.id, title: habit.title, points: 60, xp: 120 }, parentUserId: parent.user.id });
    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: habit.id });

    const queueRecord = oracle.tables.SubmissionsQueue.find(s => s.id === sub.submissionId);
    assert.strictEqual(queueRecord.points, 60);
    assert.strictEqual(queueRecord.xp, 120);
  });

  test('P14: Parent Archives Habit (F16) ➔ Student Active Quest List Excludes It Immediately (F11)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P14 Parent', email: 'p14@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P14 Student', pin: '1234', pairingCode: parent.pairingCode });
    const habitToArchive = oracle.tables.HabitsQuests[0];

    await oracle.deleteHabit({ habitId: habitToArchive.id, parentUserId: parent.user.id });
    const studentList = await oracle.getHabitsAndQuests({ userId: student.user.id, role: 'student' });

    assert.strictEqual(studentList.habits.some(h => h.id === habitToArchive.id), false);
  });

  test('P15: Parent Updates Student PIN (F17) ➔ Role Switch Challenge Requires New PIN (F10)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P15 Parent', email: 'p15@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P15 Student', pin: '1111', pairingCode: parent.pairingCode });

    await oracle.updateStudentSecurity({ parentUserId: parent.user.id, studentId: student.user.id, newPin: '7777' });

    const oldPinCheck = await oracle.verifyRolePin({ userId: student.user.id, pin: '1111' });
    assert.strictEqual(oldPinCheck.verified, false);

    const newPinCheck = await oracle.verifyRolePin({ userId: student.user.id, pin: '7777' });
    assert.strictEqual(newPinCheck.verified, true);
  });

  test('P16: Parent Approves Verification (F15) ➔ ActivityLogs Records Audit Trail (F18)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P16 Parent', email: 'p16@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P16 Student', pin: '1234', pairingCode: parent.pairingCode });
    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: oracle.tables.HabitsQuests[0].id });
    await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id });

    const logs = await oracle.getActivityLogs({ userId: parent.user.id, role: 'parent' });
    const approvalLog = logs.logs.find(l => l.action === 'QUEST_APPROVED');
    assert.ok(approvalLog !== undefined);
  });

  test('P17: ActivityLogs Aggregation (F18) ➔ Parent One-Click Email Digest Trigger (F18)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P17 Parent', email: 'p17@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P17 Student', pin: '1234', pairingCode: parent.pairingCode });

    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: oracle.tables.HabitsQuests[0].id });
    await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parent.user.id });

    const digest = await oracle.triggerEmailDigest({ parentUserId: parent.user.id });
    assert.strictEqual(digest.success, true);
    assert.ok(digest.message.includes('p17@test.com'));
  });

  test('P18: Browser Mock Storage State (F5) ➔ Simulated Reload Restores All 6 Tables (F4, F5)', async () => {
    const parent = await oracle.signUpParent({ fullName: 'Reload Parent', email: 'reload@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'Reload Student', pin: '1234', pairingCode: parent.pairingCode });
    const sub = await oracle.submitQuestCompletion({ studentId: student.user.id, questId: oracle.tables.HabitsQuests[0].id });

    // Simulate page reload with fresh oracle instance using same storage
    const reloadedOracle = new ZoptroContractOracle(storage);
    assert.strictEqual(reloadedOracle.tables.Users.length, 2);
    assert.strictEqual(reloadedOracle.tables.SubmissionsQueue.length, 1);
    assert.strictEqual(reloadedOracle.tables.SubmissionsQueue[0].id, sub.submissionId);
  });

  test('P19: Student Active Session ➔ Direct Call to Parent API (F6) ➔ Server-Side RBAC Rejection', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P19 Parent', email: 'p19@test.com', pin: '1234', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P19 Student', pin: '1234', pairingCode: parent.pairingCode });

    // Student session attempts to call parent governance endpoints
    const directApproval = await oracle.approveQuestSubmission({ submissionId: 'sub_fake', parentUserId: student.user.id });
    assert.strictEqual(directApproval.success, false);

    const directDigest = await oracle.triggerEmailDigest({ parentUserId: student.user.id });
    assert.strictEqual(directDigest.success, false);
  });

  test('P20: Role Switching from Student to Parent (F10) ➔ PIN Validation (F9) ➔ Session Elevation', async () => {
    const parent = await oracle.signUpParent({ fullName: 'P20 Parent', email: 'p20@test.com', pin: '5678', password: 'password123' });
    const student = await oracle.signUpStudent({ fullName: 'P20 Student', pin: '1111', pairingCode: parent.pairingCode });

    // Student is logged in; wants to switch to parent mode
    const pinCheckFail = await oracle.verifyRolePin({ userId: parent.user.id, pin: '0000', targetRole: 'parent' });
    assert.strictEqual(pinCheckFail.verified, false);

    const pinCheckSuccess = await oracle.verifyRolePin({ userId: parent.user.id, pin: '5678', targetRole: 'parent' });
    assert.strictEqual(pinCheckSuccess.verified, true);
  });
});
