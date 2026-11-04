/**
 * =========================================================================
 * TIER 4: REAL-WORLD APPLICATION SCENARIOS TEST SUITE
 * =========================================================================
 * Multi-step end-to-end user workflows mirroring actual production operations:
 * - Scenario 1: Complete Family Onboarding Flow
 * - Scenario 2: End-to-End Daily Quest Lifecycle
 * - Scenario 3: Reward Redemption Lifecycle with Parent Rejection & Coin Refund
 * - Scenario 4: Offline / Browser Refresh Persistence Across Sessions
 * - Scenario 5: Unauthorized Student Governance Attempt & RBAC Enforcement
 * - Scenario 6: Habit Modification, Archival & Real-Time Portal Synchronization
 *
 * Source: ORIGINAL_REQUEST.md, PROJECT.md & TEST_INFRA.md
 */

const { describe, test, it, beforeEach, assert, MockLocalStorage } = require('./harness/test_env.js');
const { ZoptroContractOracle } = require('./harness/zoptro_contract_oracle.js');

describe('Tier 4: Real-World Application Scenarios (>=6 Scenarios)', () => {
  let oracle;
  let storage;

  beforeEach(() => {
    storage = new MockLocalStorage();
    oracle = new ZoptroContractOracle(storage);
  });

  test('Scenario 1: Complete Family Onboarding Flow (Parent Signup ➔ 6-Char Pairing Code ➔ Student Signup ➔ Initial Wallet)', async () => {
    // Step 1: Parent registers on landing screen
    const parentSignup = await oracle.signUpParent({
      fullName: 'Anita Sharma',
      email: 'anita.sharma@example.com',
      pin: '8821',
      password: 'FamilyPassword2026!'
    });
    assert.strictEqual(parentSignup.success, true, 'Parent registration must succeed');
    assert.strictEqual(parentSignup.user.role, 'parent', 'Role must be parent');
    assert.strictEqual(typeof parentSignup.pairingCode, 'string', 'Must generate pairing code');
    assert.strictEqual(parentSignup.pairingCode.length, 6, 'Pairing code must be 6 characters');
    const pairingCode = parentSignup.pairingCode;
    const parentId = parentSignup.user.id;

    // Step 2: Verify parent default setup
    assert.strictEqual(parentSignup.user.coins, 0);
    const parentHabits = await oracle.getHabitsAndQuests({ userId: parentId, role: 'parent' });
    assert.ok(parentHabits.habits.length >= 4, 'Parent account must have default seed habits');

    // Step 3: Student registers using the 6-character family pairing code
    const studentSignup = await oracle.signUpStudent({
      fullName: 'Divyank Sharma',
      pin: '1234',
      pairingCode: pairingCode
    });
    assert.strictEqual(studentSignup.success, true, 'Student registration must succeed');
    assert.strictEqual(studentSignup.user.role, 'student', 'Role must be student');
    assert.strictEqual(studentSignup.user.linkedParentId, parentId, 'Must link to parent');
    const studentId = studentSignup.user.id;

    // Step 4: Verify student initial dashboard state
    const studentHabits = await oracle.getHabitsAndQuests({ userId: studentId, role: 'student' });
    assert.strictEqual(studentHabits.habits.length, parentHabits.habits.length, 'Student must receive parent habits');
    const studentUser = oracle.tables.Users.find(u => u.id === studentId);
    assert.strictEqual(studentUser.coins, 0, 'Initial coins must be 0');
    assert.strictEqual(studentUser.xp, 0, 'Initial XP must be 0');
    assert.strictEqual(studentUser.level, 1, 'Initial level must be 1 (Cadet)');
    assert.strictEqual(studentUser.streak, 0, 'Initial streak must be 0');

    // Step 5: Verify audit trail
    const logs = await oracle.getActivityLogs({ userId: parentId, role: 'parent' });
    assert.ok(logs.logs.some(l => l.action === 'SIGNUP_PARENT'), 'Must log parent signup');
    assert.ok(logs.logs.some(l => l.action === 'SIGNUP_STUDENT'), 'Must log student signup');
  });

  test('Scenario 2: End-to-End Daily Quest Lifecycle (Student Completes ➔ Pending State [0 Coins] ➔ Parent PIN Login ➔ 1-Click Approve with Bonus ➔ Wallet Credit)', async () => {
    // Setup family
    const p = await oracle.signUpParent({ fullName: 'P_Scen2', email: 'scen2@test.com', pin: '9900', password: 'Password9900' });
    const s = await oracle.signUpStudent({ fullName: 'S_Scen2', pin: '1122', pairingCode: p.pairingCode });
    const parentId = p.user.id;
    const studentId = s.user.id;

    // Step 1: Student logs into Student Focus Portal
    const studentLogin = await oracle.loginUser({ identifier: 'S_Scen2', pinOrPassword: '1122', role: 'student' });
    assert.strictEqual(studentLogin.success, true);

    // Step 2: Student completes a 25-point homework quest
    const habits = await oracle.getHabitsAndQuests({ userId: studentId, role: 'student' });
    const studyQuest = habits.habits.find(h => h.category === 'Academic') || habits.habits[0];
    const questPoints = studyQuest.points;
    const questXp = studyQuest.xp;

    const submission = await oracle.submitQuestCompletion({
      studentId,
      questId: studyQuest.id,
      notes: 'Solved 15 algebra equations and verified answers'
    });
    assert.strictEqual(submission.success, true);
    assert.strictEqual(submission.status, 'PENDING_VERIFICATION');

    // Step 3: CRITICAL INTEGRITY CHECK - Student wallet MUST NOT receive unverified coins
    let studentRecord = oracle.tables.Users.find(u => u.id === studentId);
    assert.strictEqual(studentRecord.coins, 0, 'Wallet coins must remain 0 while pending');
    assert.strictEqual(studentRecord.xp, 0, 'Wallet XP must remain 0 while pending');

    // Step 4: Parent logs into Parent HQ with PIN verification
    const pinCheck = await oracle.verifyRolePin({ userId: parentId, pin: '9900', targetRole: 'parent' });
    assert.strictEqual(pinCheck.verified, true);

    // Step 5: Parent checks Verification Queue
    const queue = await oracle.getPendingVerifications({ parentUserId: parentId });
    assert.strictEqual(queue.pendingQuests.length, 1);
    assert.strictEqual(queue.pendingQuests[0].id, submission.submissionId);

    // Step 6: Parent performs 1-Click Approval with +10 Bonus Coins for great effort
    const bonus = 10;
    const approval = await oracle.approveQuestSubmission({
      submissionId: submission.submissionId,
      parentUserId: parentId,
      bonusCoins: bonus
    });
    assert.strictEqual(approval.success, true);

    // Step 7: Verify student wallet is now credited accurately
    studentRecord = oracle.tables.Users.find(u => u.id === studentId);
    assert.strictEqual(studentRecord.coins, questPoints + bonus, 'Student wallet must have quest points + bonus coins');
    assert.strictEqual(studentRecord.xp, questXp, 'Student wallet must have quest XP');
    assert.strictEqual(studentRecord.streak, 1, 'Student streak must increment to 1');

    // Step 8: Verify queue item is no longer pending
    const queueAfter = await oracle.getPendingVerifications({ parentUserId: parentId });
    assert.strictEqual(queueAfter.pendingQuests.length, 0, 'Queue must be empty after approval');
  });

  test('Scenario 3: Reward Redemption Lifecycle (Student Earns Coins ➔ Submits Redemption ➔ Parent Rejection ➔ Automatic Coin Refund)', async () => {
    // Setup family
    const p = await oracle.signUpParent({ fullName: 'P_Scen3', email: 'scen3@test.com', pin: '1234', password: 'Password123' });
    const s = await oracle.signUpStudent({ fullName: 'S_Scen3', pin: '1234', pairingCode: p.pairingCode });
    const parentId = p.user.id;
    const studentId = s.user.id;

    // Step 1: Student earns 100 Focus Coins
    const studentRecord = oracle.tables.Users.find(u => u.id === studentId);
    studentRecord.coins = 100;

    // Step 2: Student browses Rewards Catalog and selects a 50-coin reward
    const catalog = await oracle.getRewardsCatalog({ userId: studentId });
    const reward = catalog.rewards[0]; // e.g. 50 coins
    const rewardCost = reward.costCoins;

    // Step 3: Student submits redemption request
    const redemption = await oracle.submitRedemptionRequest({
      studentId,
      rewardId: reward.id
    });
    assert.strictEqual(redemption.success, true);
    assert.strictEqual(redemption.status, 'PENDING_APPROVAL');

    // Step 4: Verify coins are reserved (deducted from spendable balance)
    assert.strictEqual(studentRecord.coins, 100 - rewardCost, 'Available coins must drop by reward cost during reservation');

    // Step 5: Parent reviews redemption queue and decides to reject with reason
    const parentQueue = await oracle.getPendingVerifications({ parentUserId: parentId });
    assert.strictEqual(parentQueue.pendingRedemptions.length, 1);

    const rejection = await oracle.rejectRedemption({
      redemptionId: redemption.redemptionId,
      parentUserId: parentId,
      reason: 'Exam week approaching, save gaming pass for next weekend'
    });
    assert.strictEqual(rejection.success, true);
    assert.strictEqual(rejection.refundedCoins, rewardCost);

    // Step 6: Verify student wallet is refunded back to full 100 coins
    assert.strictEqual(studentRecord.coins, 100, 'Student wallet must be fully refunded upon rejection');

    // Step 7: Verify redemption status is updated in database
    const queueRecord = oracle.tables.RedemptionsQueue.find(r => r.id === redemption.redemptionId);
    assert.strictEqual(queueRecord.status, 'REJECTED');
  });

  test('Scenario 4: Offline / Browser Refresh Persistence (Multi-Action Sequence ➔ Browser Reload ➔ State Integrity)', async () => {
    // Step 1: Initialize parent and student in standalone storage
    const p = await oracle.signUpParent({ fullName: 'P_Scen4', email: 'scen4@test.com', pin: '5555', password: 'Password5555' });
    const s = await oracle.signUpStudent({ fullName: 'S_Scen4', pin: '4444', pairingCode: p.pairingCode });
    const parentId = p.user.id;
    const studentId = s.user.id;

    // Step 2: Perform sequence of actions
    // Action A: Add custom habit
    const habit = await oracle.saveHabit({
      habitData: { title: 'Science Journal Entry', points: 30, xp: 60, category: 'Academic' },
      parentUserId: parentId
    });
    // Action B: Student submits quest
    const sub = await oracle.submitQuestCompletion({ studentId, questId: habit.habit.id, notes: 'Wrote about solar flares' });
    // Action C: Parent approves quest
    await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parentId, bonusCoins: 5 });

    // Step 3: Simulate full browser reload / page refresh
    // Create completely new oracle instance loaded from the persistent MockLocalStorage
    const reloadedOracle = new ZoptroContractOracle(storage);

    // Step 4: Verify state across all 6 tables after reload
    // Table 1: Users
    const reloadedStudent = reloadedOracle.tables.Users.find(u => u.id === studentId);
    assert.ok(reloadedStudent !== undefined, 'Student user must persist');
    assert.strictEqual(reloadedStudent.coins, 35, 'Student wallet coins must persist across reload');
    assert.strictEqual(reloadedStudent.xp, 60, 'Student wallet XP must persist across reload');

    // Table 2: HabitsQuests
    const reloadedHabit = reloadedOracle.tables.HabitsQuests.find(h => h.id === habit.habit.id);
    assert.ok(reloadedHabit !== undefined, 'Custom habit must persist across reload');
    assert.strictEqual(reloadedHabit.title, 'Science Journal Entry');

    // Table 3: SubmissionsQueue
    const reloadedSub = reloadedOracle.tables.SubmissionsQueue.find(s => s.id === sub.submissionId);
    assert.ok(reloadedSub !== undefined, 'Submission queue item must persist');
    assert.strictEqual(reloadedSub.status, 'APPROVED');

    // Table 4: RewardsCatalog
    assert.ok(reloadedOracle.tables.RewardsCatalog.length > 0, 'Rewards catalog must persist');

    // Table 5: RedemptionsQueue
    assert.ok(Array.isArray(reloadedOracle.tables.RedemptionsQueue), 'Redemptions queue must persist');

    // Table 6: ActivityLogs
    assert.ok(reloadedOracle.tables.ActivityLogs.length >= 3, 'Activity logs must persist across reload');
  });

  test('Scenario 5: Unauthorized Student Governance Attempt & RBAC Enforcement (Student Session Invokes Parent API ➔ Rejection & Audit Log)', async () => {
    // Setup family
    const p = await oracle.signUpParent({ fullName: 'P_Scen5', email: 'scen5@test.com', pin: '7777', password: 'Password7777' });
    const s = await oracle.signUpStudent({ fullName: 'S_Scen5', pin: '2222', pairingCode: p.pairingCode });
    const parentId = p.user.id;
    const studentId = s.user.id;

    // Step 1: Student submits a quest
    const quest = oracle.tables.HabitsQuests[0];
    const sub = await oracle.submitQuestCompletion({ studentId, questId: quest.id });

    // Step 2: Student attempts to approve their own quest by passing student ID as parentUserId
    const hackApproval = await oracle.approveQuestSubmission({
      submissionId: sub.submissionId,
      parentUserId: studentId,
      bonusCoins: 500
    });
    assert.strictEqual(hackApproval.success, false, 'Student self-approval must be rejected');
    assert.ok(hackApproval.error.toLowerCase().includes('unauthorized') || hackApproval.error.toLowerCase().includes('parent'));

    // Step 3: Student attempts to create a custom habit with 1,000 points
    const hackHabit = await oracle.saveHabit({
      habitData: { title: 'Free Points Habit', points: 1000 },
      parentUserId: studentId
    });
    assert.strictEqual(hackHabit.success, false, 'Student habit creation must be rejected');

    // Step 4: Student attempts to update security credentials of parent
    const hackSec = await oracle.updateStudentSecurity({
      parentUserId: studentId,
      studentId: parentId,
      newPin: '0000'
    });
    assert.strictEqual(hackSec.success, false, 'Student security manipulation must be rejected');

    // Step 5: Verify student wallet was NOT corrupted by unauthorized attempts
    const studentRecord = oracle.tables.Users.find(u => u.id === studentId);
    assert.strictEqual(studentRecord.coins, 0, 'Wallet must remain 0 after blocked unauthorized calls');
    assert.strictEqual(studentRecord.xp, 0);

    // Step 6: Verify parent can still legitimately approve the original quest
    const validApproval = await oracle.approveQuestSubmission({
      submissionId: sub.submissionId,
      parentUserId: parentId
    });
    assert.strictEqual(validApproval.success, true, 'Legitimate parent approval must succeed');
    assert.strictEqual(studentRecord.coins, quest.points);
  });

  test('Scenario 6: Habit Modification, Archival & Real-Time Portal Synchronization', async () => {
    // Setup family
    const p = await oracle.signUpParent({ fullName: 'P_Scen6', email: 'scen6@test.com', pin: '1234', password: 'Password123' });
    const s = await oracle.signUpStudent({ fullName: 'S_Scen6', pin: '1234', pairingCode: p.pairingCode });
    const parentId = p.user.id;
    const studentId = s.user.id;

    // Step 1: Parent creates new quest "Reading 30 mins" (20 pts)
    const newQuest = await oracle.saveHabit({
      habitData: { title: 'Reading 30 mins', points: 20, xp: 40, category: 'Reading', icon: '📚' },
      parentUserId: parentId
    });
    assert.strictEqual(newQuest.success, true);
    const questId = newQuest.habit.id;

    // Step 2: Student portal reflects the new quest
    let studentHabits = await oracle.getHabitsAndQuests({ userId: studentId, role: 'student' });
    assert.ok(studentHabits.habits.some(h => h.id === questId));

    // Step 3: Parent updates coin value from 20 pts to 30 pts
    const updateQuest = await oracle.saveHabit({
      habitData: { id: questId, title: 'Reading 30 mins', points: 30, xp: 60 },
      parentUserId: parentId
    });
    assert.strictEqual(updateQuest.success, true);
    assert.strictEqual(updateQuest.habit.points, 30);

    // Step 4: Parent archives an obsolete default habit
    const obsoleteHabit = oracle.tables.HabitsQuests[0];
    const archiveRes = await oracle.deleteHabit({ habitId: obsoleteHabit.id, parentUserId: parentId });
    assert.strictEqual(archiveRes.success, true);

    // Step 5: Student portal immediately excludes archived habit and reflects updated points
    studentHabits = await oracle.getHabitsAndQuests({ userId: studentId, role: 'student' });
    assert.strictEqual(studentHabits.habits.some(h => h.id === obsoleteHabit.id), false, 'Archived habit must be hidden from student');
    const studentReadQuest = studentHabits.habits.find(h => h.id === questId);
    assert.strictEqual(studentReadQuest.points, 30, 'Updated points must reflect in student portal');

    // Step 6: Student submits updated quest and parent approves with updated value
    const sub = await oracle.submitQuestCompletion({ studentId, questId });
    const approval = await oracle.approveQuestSubmission({ submissionId: sub.submissionId, parentUserId: parentId });
    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.updatedWallet.coins, 30, 'Wallet must receive the updated 30 coins');
  });
});
