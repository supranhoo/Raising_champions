/**
 * =========================================================================
 * TIER 5: 1-TO-N MULTI-CHILD BACKEND & STATE ISOLATION TEST SUITE
 * =========================================================================
 * Comprehensive opaque-box and contract verification suite for the 1-to-N
 * parent-to-children relational upgrade.
 *
 * Requirements Covered (ORIGINAL_REQUEST.md §R2, PROJECT.md §1 & §2):
 * 1. Multi-Child Linking & Family Pairing Code (2, 3, 5+ children)
 * 2. Children Roster Querying (getLinkedStudents & getLinkedChildren) & Zero Hash Leakage
 * 3. Strict Wallet, XP, Level, & Streak State Isolation (∂x_b / ∂x_a = 0)
 * 4. Independent Daily Quest State Machine
 * 5. Verification Queue Attribution Badges & Child-Specific Filtering
 * 6. Redemption Escrow Hold & Rejection Refund Isolation
 * 7. LockService Concurrency Protection & Transaction Serialization
 * 8. Sibling Tampering Defense & Foreign Family RBAC Enforcement
 */

const path = require('node:path');
const fs = require('node:fs');
const testEnvPath = fs.existsSync(path.join(__dirname, './harness/test_env.js'))
  ? path.join(__dirname, './harness/test_env.js')
  : path.join(__dirname, '../../../tests/harness/test_env.js');
const oraclePath = fs.existsSync(path.join(__dirname, './harness/zoptro_contract_oracle.js'))
  ? path.join(__dirname, './harness/zoptro_contract_oracle.js')
  : path.join(__dirname, '../../../tests/harness/zoptro_contract_oracle.js');

const { describe, test, it, beforeEach, assert, MockLocalStorage, registry } = require(testEnvPath);
const { ZoptroContractOracle } = require(oraclePath);

describe('Tier 5: 1-to-N Multi-Child Backend & State Isolation (>=20 Tests)', () => {
  let oracle;
  let storage;

  beforeEach(() => {
    storage = new MockLocalStorage();
    oracle = new ZoptroContractOracle(storage);
  });

  // -----------------------------------------------------------------------
  // GROUP 1: Multi-Child Registration & Pairing Code Architecture
  // -----------------------------------------------------------------------
  describe('Group 1: Multi-Child Registration & Pairing Code Architecture', () => {
    test('MC-B01: Single parent registration generates unique 6-character family pairing code', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Colonel Rajesh',
        email: 'rajesh.singh@example.com',
        pin: '1234',
        password: 'Password123'
      });

      assert.strictEqual(pRes.success, true);
      assert.ok(pRes.pairingCode, 'Pairing code must be present');
      assert.strictEqual(typeof pRes.pairingCode, 'string');
      assert.strictEqual(pRes.pairingCode.length, 6, 'Pairing code must be exactly 6 characters');
      assert.ok(/^[A-Z0-9]{6}$/.test(pRes.pairingCode), 'Pairing code must be uppercase alphanumeric');
      assert.strictEqual(pRes.user.role, 'parent');
      assert.strictEqual(pRes.user.pairingCode, pRes.pairingCode);
    });

    test('MC-B02: Multiple sibling students (N=2) register under identical family pairing code', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Major Sharma',
        email: 'sharma@example.com',
        pin: '4321',
        password: 'SecurePassword123'
      });
      const code = pRes.pairingCode;

      const s1 = await oracle.signUpStudent({
        fullName: 'Commander Divyank',
        pin: '1234',
        pairingCode: code
      });
      const s2 = await oracle.signUpStudent({
        fullName: 'Cadet Priya',
        pin: '5678',
        pairingCode: code
      });

      assert.strictEqual(s1.success, true);
      assert.strictEqual(s2.success, true);
      assert.notStrictEqual(s1.user.id, s2.user.id, 'Sibling student IDs must be unique');
      assert.strictEqual(s1.user.linkedParentId, pRes.user.id, 'Child 1 must link to parent ID');
      assert.strictEqual(s2.user.linkedParentId, pRes.user.id, 'Child 2 must link to parent ID');
      assert.strictEqual(s1.user.pairingCode, code);
      assert.strictEqual(s2.user.pairingCode, code);
    });

    test('MC-B03: High-cardinality multi-child registration (N=5+) scales without pairing collisions', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Dr. Vikram Patel',
        email: 'patel@example.com',
        pin: '9876',
        password: 'PatelPassword123'
      });
      const code = pRes.pairingCode;

      const studentNames = ['Aarav', 'Diya', 'Vihaan', 'Ananya', 'Kabir'];
      const registeredStudents = [];

      for (let i = 0; i < studentNames.length; i++) {
        const sRes = await oracle.signUpStudent({
          fullName: studentNames[i],
          pin: `100${i}`,
          pairingCode: code
        });
        assert.strictEqual(sRes.success, true, `Student ${studentNames[i]} registration must succeed`);
        assert.strictEqual(sRes.user.linkedParentId, pRes.user.id);
        registeredStudents.push(sRes.user);
      }

      assert.strictEqual(registeredStudents.length, 5);
      const uniqueIds = new Set(registeredStudents.map(s => s.id));
      assert.strictEqual(uniqueIds.size, 5, 'All 5 children must receive unique IDs');

      const rosterRes = await oracle.getLinkedStudents({ parentUserId: pRes.user.id });
      assert.strictEqual(rosterRes.success, true);
      assert.strictEqual(rosterRes.students.length, 5, 'Roster must contain all 5 registered children');
    });

    test('MC-B04: Student registration with invalid or corrupted pairing code fails closed', async () => {
      const invalidCodes = ['INVALID', '12345', 'ZOP9999', '', '   '];

      for (const badCode of invalidCodes) {
        const res = await oracle.signUpStudent({
          fullName: 'Test Student',
          pin: '1234',
          pairingCode: badCode
        });
        assert.strictEqual(res.success, false, `Registration with code '${badCode}' must fail`);
        assert.ok(res.error, 'Error message must be returned');
      }
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 2: Children Roster Querying & Privacy / Zero Hash Leakage
  // -----------------------------------------------------------------------
  describe('Group 2: Children Roster Querying & Data Privacy', () => {
    test('MC-B05: getLinkedStudents returns all linked children with accurate profile fields', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Captain Neha',
        email: 'neha@example.com',
        pin: '2345',
        password: 'Password987'
      });
      const s1 = await oracle.signUpStudent({ fullName: 'Child Alpha', pin: '1111', pairingCode: pRes.pairingCode });
      const s2 = await oracle.signUpStudent({ fullName: 'Child Beta', pin: '2222', pairingCode: pRes.pairingCode });

      const roster = await oracle.getLinkedStudents({ parentUserId: pRes.user.id });
      assert.strictEqual(roster.success, true);
      assert.strictEqual(roster.students.length, 2);

      const alpha = roster.students.find(s => s.id === s1.user.id);
      const beta = roster.students.find(s => s.id === s2.user.id);

      assert.ok(alpha, 'Child Alpha must exist in roster');
      assert.ok(beta, 'Child Beta must exist in roster');
      assert.strictEqual(alpha.fullName, 'Child Alpha');
      assert.strictEqual(beta.fullName, 'Child Beta');
      assert.strictEqual(typeof alpha.coins, 'number');
      assert.strictEqual(typeof alpha.xp, 'number');
      assert.strictEqual(typeof alpha.level, 'number');
      assert.strictEqual(typeof alpha.streak, 'number');
    });

    test('MC-B06: getLinkedChildren provides exact contract parity with getLinkedStudents', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Parent Parity',
        email: 'parity@example.com',
        pin: '3456',
        password: 'Password456'
      });
      await oracle.signUpStudent({ fullName: 'Child One', pin: '3333', pairingCode: pRes.pairingCode });

      const byStudents = await oracle.getLinkedStudents({ parentUserId: pRes.user.id });
      const byChildren = await oracle.getLinkedChildren({ parentUserId: pRes.user.id });

      assert.strictEqual(byStudents.success, true);
      assert.strictEqual(byChildren.success, true);
      assert.deepStrictEqual(byStudents.students, byChildren.children);
    });

    test('MC-B07: Zero hash leakage invariant: pinHash and passwordHash are strictly omitted from roster', async () => {
      const pRes = await oracle.signUpParent({
        fullName: 'Parent Security',
        email: 'security@example.com',
        pin: '4567',
        password: 'Password789'
      });
      await oracle.signUpStudent({ fullName: 'Child Secret', pin: '9999', pairingCode: pRes.pairingCode });

      const roster = await oracle.getLinkedStudents({ parentUserId: pRes.user.id });
      assert.strictEqual(roster.success, true);
      const student = roster.students[0];

      assert.strictEqual(student.pinHash, undefined, 'pinHash must be omitted');
      assert.strictEqual(student.passwordHash, undefined, 'passwordHash must be omitted');
      assert.strictEqual(student.pin, undefined, 'raw pin must be omitted');

      const serialized = JSON.stringify(roster);
      assert.strictEqual(serialized.includes('pinHash'), false, 'Serialized roster must not leak pinHash');
      assert.strictEqual(serialized.includes('passwordHash'), false, 'Serialized roster must not leak passwordHash');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 3: Strict Wallet, XP, Level, & Streak State Isolation
  // -----------------------------------------------------------------------
  describe('Group 3: Strict Wallet, XP, Level, & Streak State Isolation (∂x_b / ∂x_a = 0)', () => {
    test('MC-B08: Quest approval for Child A credits Child A wallet with zero delta to Child B wallet', async () => {
      const p = await oracle.signUpParent({ fullName: 'Governor Rao', email: 'rao@example.com', pin: '5555', password: 'Password555' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      uA.coins = 100;
      uB.coins = 50;

      const habits = await oracle.getHabitsAndQuests({ userId: sA.user.id });
      const quest = habits.habits[0];

      const subRes = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: quest.id });
      assert.strictEqual(subRes.success, true);

      // Parent approves Child A's submission (+quest.points, +bonus 10)
      const approveRes = await oracle.approveQuestSubmission({
        submissionId: subRes.submissionId,
        parentUserId: p.user.id,
        bonusCoins: 10
      });
      assert.strictEqual(approveRes.success, true);

      // Verify Child A state mutated
      const expectedACoins = 100 + quest.points + 10;
      assert.strictEqual(uA.coins, expectedACoins, 'Child A coins must be credited');
      assert.ok(uA.xp > 0, 'Child A XP must increase');

      // Verify Child B state is completely invariant: ∂x_B / ∂x_A = 0
      assert.strictEqual(uB.coins, 50, 'Child B coins must remain strictly invariant at 50');
      assert.strictEqual(uB.xp, 0, 'Child B XP must remain strictly invariant at 0');
    });

    test('MC-B09: Parent bonus awarded to Child B credits Child B with zero delta to Child A', async () => {
      const p = await oracle.signUpParent({ fullName: 'Elder Verma', email: 'verma@example.com', pin: '6666', password: 'Password666' });
      const sA = await oracle.signUpStudent({ fullName: 'Child One', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child Two', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      uA.coins = 200;
      uB.coins = 40;

      // Award bonus of 30 coins specifically to Child B via genuine contract API
      const bonusRes = await oracle.awardParentBonus({
        parentUserId: p.user.id,
        studentId: sB.user.id,
        coins: 30,
        reason: 'Helped family'
      });

      assert.strictEqual(bonusRes.success, true);
      assert.strictEqual(bonusRes.coins, 70);
      assert.strictEqual(uB.coins, 70, 'Child B coins must increment by 30');
      assert.strictEqual(uA.coins, 200, 'Child A coins must remain strictly invariant at 200');
      assert.strictEqual(uA.xp, 0, 'Child A XP must remain strictly invariant at 0');
    });

    test('MC-B10: Progression level-up tiers are strictly isolated per child', async () => {
      const p = await oracle.signUpParent({ fullName: 'Commander General', email: 'cg@example.com', pin: '7777', password: 'Password777' });
      const sA = await oracle.signUpStudent({ fullName: 'High Earner', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Beginner Cadet', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);

      // Child A earns XP through genuine contract call (750 XP reaches Level 4)
      const resA = await oracle.awardParentBonus({
        parentUserId: p.user.id,
        studentId: sA.user.id,
        coins: 200,
        xp: 750,
        reason: 'Mastery Level-Up'
      });

      assert.strictEqual(resA.success, true);
      assert.strictEqual(resA.level, 4, 'Child A must reach level 4');
      assert.strictEqual(uA.level, 4, 'Child A user record must be level 4');
      assert.strictEqual(uA.xp, 750, 'Child A XP must be 750');
      assert.strictEqual(uB.level, 1, 'Child B must remain at level 1');
      assert.strictEqual(uB.xp, 0, 'Child B XP must remain 0');
    });

    test('MC-B11: Streak counter increments for Child A do not affect Child B streak', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Streak', email: 'ps@example.com', pin: '8888', password: 'Password888' });
      const sA = await oracle.signUpStudent({ fullName: 'Active Cadet', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Dormant Cadet', pin: '2222', pairingCode: p.pairingCode });

      // Parent creates habit
      const habit = await oracle.saveHabit({
        habitData: { title: 'Morning Exercise', points: 15, category: 'health', timeSlot: 'morning' },
        parentUserId: p.user.id
      });

      // Child A submits quest completion
      const sub = await oracle.submitQuestCompletion({
        studentId: sA.user.id,
        questId: habit.habit.id,
        notes: 'Completed 20 pushups'
      });

      // Parent approves Child A submission
      const approveRes = await oracle.approveQuestSubmission({
        submissionId: sub.submissionId,
        parentUserId: p.user.id,
        bonusCoins: 0
      });

      assert.strictEqual(approveRes.success, true);
      assert.strictEqual(approveRes.updatedWallet.streak, 1, 'Child A streak must increment to 1');

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);

      assert.strictEqual(uA.streak, 1, 'Child A streak must be 1');
      assert.strictEqual(uB.streak, 0, 'Child B streak must remain strictly invariant at 0');
    });

    test('MC-B12: Interleaved multi-child operations preserve exact linear balance invariants', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Matrix', email: 'matrix@example.com', pin: '9999', password: 'Password999' });
      const sA = await oracle.signUpStudent({ fullName: 'Child X', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child Y', pin: '2222', pairingCode: p.pairingCode });
      const sC = await oracle.signUpStudent({ fullName: 'Child Z', pin: '3333', pairingCode: p.pairingCode });

      // Give initial balances via genuine bonus calls
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sA.user.id, coins: 50 }); // A: 50
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sB.user.id, coins: 100 }); // B: 100
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sC.user.id, coins: 30 }); // C: 30

      // Setup Quest and Reward catalog items
      const q1 = await oracle.saveHabit({ habitData: { title: 'Quest 1', points: 25 }, parentUserId: p.user.id });
      const r1 = await oracle.manageRewardItem({ rewardData: { title: 'Reward 1', costCoins: 40 }, parentUserId: p.user.id });
      const r2 = await oracle.manageRewardItem({ rewardData: { title: 'Reward 2', costCoins: 30 }, parentUserId: p.user.id });

      // 1. Child A submits Q1 -> Approved (+25 + 5 bonus = +30) -> A balance: 50 + 30 = 80
      const subA = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: q1.habit.id });
      await oracle.approveQuestSubmission({ submissionId: subA.submissionId, parentUserId: p.user.id, bonusCoins: 5 });

      // 2. Child B requests R1 -> Escrow held (-40) -> B balance: 100 - 40 = 60
      const rdmB1 = await oracle.submitRedemptionRequest({ studentId: sB.user.id, rewardId: r1.reward.id });

      // 3. Parent awards bonus to Child C (+20) -> C balance: 30 + 20 = 50
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sC.user.id, coins: 20 });

      // 4. Parent rejects Child B's redemption -> Refund (+40) -> B balance: 60 + 40 = 100
      await oracle.rejectRedemption({ redemptionId: rdmB1.redemptionId, parentUserId: p.user.id, reason: 'Out of stock' });

      // 5. Child A requests R2 -> Escrow held (-30) -> A balance: 80 - 30 = 50
      const rdmA = await oracle.submitRedemptionRequest({ studentId: sA.user.id, rewardId: r2.reward.id });

      // 6. Parent approves Child A redemption -> Delivery verified (already debited) -> A balance: 50
      await oracle.approveRedemption({ redemptionId: rdmA.redemptionId, parentUserId: p.user.id });

      // 7. Parent awards bonus to Child B (+35) -> B balance: 100 + 35 = 135
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sB.user.id, coins: 35 });

      // 8. Child C requests R2 -> Escrow held (-30) -> C balance: 50 - 30 = 20
      await oracle.submitRedemptionRequest({ studentId: sC.user.id, rewardId: r2.reward.id });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      const uC = oracle.tables.Users.find(u => u.id === sC.user.id);

      assert.strictEqual(uA.coins, 50, 'Child X final balance must be exactly 50');
      assert.strictEqual(uB.coins, 135, 'Child Y final balance must be exactly 135');
      assert.strictEqual(uC.coins, 20, 'Child Z final balance must be exactly 20');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 4: Independent Daily Quest State Machine
  // -----------------------------------------------------------------------
  describe('Group 4: Independent Daily Quest State Machine', () => {
    test('MC-B13: Shared quest submission by Child A transitions state to PENDING for Child A only', async () => {
      const p = await oracle.signUpParent({ fullName: 'Quest Parent', email: 'qp@example.com', pin: '1212', password: 'Password1212' });
      const sA = await oracle.signUpStudent({ fullName: 'Child Alpha', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child Beta', pin: '2222', pairingCode: p.pairingCode });

      const habitsA = await oracle.getHabitsAndQuests({ userId: sA.user.id });
      const questId = habitsA.habits[0].id;

      const subRes = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId });
      assert.strictEqual(subRes.success, true);

      // Child A sees PENDING_VERIFICATION
      const hAAfter = await oracle.getHabitsAndQuests({ userId: sA.user.id });
      const qA = hAAfter.habits.find(h => h.id === questId);
      assert.strictEqual(qA.status, 'PENDING_VERIFICATION');
      assert.strictEqual(qA.completed, false);

      // Child B sees AVAILABLE
      const hBAfter = await oracle.getHabitsAndQuests({ userId: sB.user.id });
      const qB = hBAfter.habits.find(h => h.id === questId);
      assert.strictEqual(qB.status, 'AVAILABLE');
      assert.strictEqual(qB.completed, false);
    });

    test('MC-B14: Child B can submit the same daily quest independently on the same calendar day', async () => {
      const p = await oracle.signUpParent({ fullName: 'Shared Quest Parent', email: 'sqp@example.com', pin: '1313', password: 'Password1313' });
      const sA = await oracle.signUpStudent({ fullName: 'Child Alpha', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child Beta', pin: '2222', pairingCode: p.pairingCode });

      const questId = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits[0].id;

      // Both children submit the same quest
      const subA = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId, notes: 'A submission' });
      const subB = await oracle.submitQuestCompletion({ studentId: sB.user.id, questId, notes: 'B submission' });

      assert.strictEqual(subA.success, true);
      assert.strictEqual(subB.success, true);
      assert.notStrictEqual(subA.submissionId, subB.submissionId);

      const queue = oracle.tables.SubmissionsQueue.filter(s => s.questId === questId);
      assert.strictEqual(queue.length, 2, 'SubmissionsQueue must hold two distinct entries for the same quest');
    });

    test('MC-B15: Duplicate quest submission on the same day by the same child is rejected', async () => {
      const p = await oracle.signUpParent({ fullName: 'Dedup Parent', email: 'dedup@example.com', pin: '1414', password: 'Password1414' });
      const sA = await oracle.signUpStudent({ fullName: 'Child Alpha', pin: '1111', pairingCode: p.pairingCode });

      const questId = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits[0].id;

      const sub1 = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId });
      assert.strictEqual(sub1.success, true);

      // Second submission by Child A should fail
      const sub2 = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId });
      assert.strictEqual(sub2.success, false);
      assert.ok(sub2.error.includes('already pending') || sub2.error.includes('QUEST_ALREADY_PENDING'));
    });

    test('MC-B16: Parent approval for Child A updates status to APPROVED for Child A while Child B remains independent', async () => {
      const p = await oracle.signUpParent({ fullName: 'Approval Parent', email: 'app@example.com', pin: '1515', password: 'Password1515' });
      const sA = await oracle.signUpStudent({ fullName: 'Child Alpha', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child Beta', pin: '2222', pairingCode: p.pairingCode });

      const questId = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits[0].id;

      const subA = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId });
      const subB = await oracle.submitQuestCompletion({ studentId: sB.user.id, questId });

      // Approve only Child A
      await oracle.approveQuestSubmission({ submissionId: subA.submissionId, parentUserId: p.user.id });

      const hA = await oracle.getHabitsAndQuests({ userId: sA.user.id });
      const hB = await oracle.getHabitsAndQuests({ userId: sB.user.id });

      const qA = hA.habits.find(h => h.id === questId);
      const qB = hB.habits.find(h => h.id === questId);

      assert.strictEqual(qA.status, 'APPROVED');
      assert.strictEqual(qA.completed, true);
      assert.strictEqual(qB.status, 'PENDING_VERIFICATION');
      assert.strictEqual(qB.completed, false);
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 5: Verification Queue Attribution Badges & Child Filtering
  // -----------------------------------------------------------------------
  describe('Group 5: Verification Queue Attribution Badges & Child Filtering', () => {
    test('MC-B17: getPendingVerifications enriches quest submissions with studentName and studentId', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent VQ', email: 'vq@example.com', pin: '1616', password: 'Password1616' });
      const sA = await oracle.signUpStudent({ fullName: 'Divyank', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Priya', pin: '2222', pairingCode: p.pairingCode });

      const habits = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits;
      await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: habits[0].id });
      await oracle.submitQuestCompletion({ studentId: sB.user.id, questId: habits[1].id });

      const queueRes = await oracle.getPendingVerifications({ parentUserId: p.user.id });
      assert.strictEqual(queueRes.success, true);
      assert.strictEqual(queueRes.pendingQuests.length, 2);

      const qA = queueRes.pendingQuests.find(q => q.studentId === sA.user.id);
      const qB = queueRes.pendingQuests.find(q => q.studentId === sB.user.id);

      assert.ok(qA, 'Child A submission must exist');
      assert.ok(qB, 'Child B submission must exist');
      assert.strictEqual(qA.studentName, 'Divyank');
      assert.strictEqual(qB.studentName, 'Priya');
    });

    test('MC-B18: getPendingVerifications enriches redemption requests with studentName and studentId', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent RDM', email: 'rdm@example.com', pin: '1717', password: 'Password1717' });
      const sA = await oracle.signUpStudent({ fullName: 'Divyank', pin: '1111', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      uA.coins = 100;

      const rw = oracle.tables.RewardsCatalog.find(r => r.parentUserId === p.user.id);
      await oracle.submitRedemptionRequest({ studentId: sA.user.id, rewardId: rw.id });

      const queueRes = await oracle.getPendingVerifications({ parentUserId: p.user.id });
      assert.strictEqual(queueRes.success, true);
      assert.strictEqual(queueRes.pendingRedemptions.length, 1);

      const rdm = queueRes.pendingRedemptions[0];
      assert.strictEqual(rdm.studentName, 'Divyank');
      assert.strictEqual(rdm.studentId, sA.user.id);
      assert.strictEqual(rdm.costCoins, rw.costCoins);
    });

    test('MC-B19: Specifying optional studentId filter isolates verification queue to target child', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Filter', email: 'pf@example.com', pin: '1818', password: 'Password1818' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const habits = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits;
      await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: habits[0].id });
      await oracle.submitQuestCompletion({ studentId: sB.user.id, questId: habits[1].id });

      // Query specifically for Child A
      const filterA = await oracle.getPendingVerifications({ parentUserId: p.user.id, studentId: sA.user.id });
      assert.strictEqual(filterA.success, true);
      assert.strictEqual(filterA.pendingQuests.length, 1);
      assert.strictEqual(filterA.pendingQuests[0].studentId, sA.user.id);

      // Query specifically for Child B
      const filterB = await oracle.getPendingVerifications({ parentUserId: p.user.id, studentId: sB.user.id });
      assert.strictEqual(filterB.success, true);
      assert.strictEqual(filterB.pendingQuests.length, 1);
      assert.strictEqual(filterB.pendingQuests[0].studentId, sB.user.id);
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 6: Redemption Escrow Hold & Rejection Refund Isolation
  // -----------------------------------------------------------------------
  describe('Group 6: Redemption Escrow Hold & Refund Isolation', () => {
    test('MC-B20: Redemption request debits escrow coins strictly from requesting child balance', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Escrow', email: 'pe@example.com', pin: '1919', password: 'Password1919' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      uA.coins = 100;
      uB.coins = 30;

      const rw = oracle.tables.RewardsCatalog.find(r => r.parentUserId === p.user.id); // cost 50
      const rdmRes = await oracle.submitRedemptionRequest({ studentId: sA.user.id, rewardId: rw.id });
      assert.strictEqual(rdmRes.success, true);

      assert.strictEqual(uA.coins, 50, 'Child A balance must be debited to 50 in escrow');
      assert.strictEqual(uB.coins, 30, 'Child B balance must remain strictly invariant at 30');
    });

    test('MC-B21: Insufficient balance prevents redemption without cross-child pooling', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent NoPool', email: 'nopool@example.com', pin: '2020', password: 'Password2020' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      uA.coins = 60;
      uB.coins = 30; // 30 < 50, even though 60+30=90 > 50

      const rw = oracle.tables.RewardsCatalog.find(r => r.parentUserId === p.user.id);
      const rdmRes = await oracle.submitRedemptionRequest({ studentId: sB.user.id, rewardId: rw.id });

      assert.strictEqual(rdmRes.success, false);
      assert.ok(rdmRes.error.includes('Insufficient Focus Coins'));
      assert.strictEqual(uB.coins, 30, 'Child B coins must remain 30');
      assert.strictEqual(uA.coins, 60, 'Child A coins must remain 60');
    });

    test('MC-B22: Rejection of redemption refunds escrow coins strictly to requesting child', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Refund', email: 'refund@example.com', pin: '2121', password: 'Password2121' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);
      uA.coins = 100;
      uB.coins = 40;

      const rw = oracle.tables.RewardsCatalog.find(r => r.parentUserId === p.user.id);
      const rdmRes = await oracle.submitRedemptionRequest({ studentId: sA.user.id, rewardId: rw.id });
      assert.strictEqual(uA.coins, 50);

      const rejRes = await oracle.rejectRedemption({
        redemptionId: rdmRes.redemptionId,
        parentUserId: p.user.id,
        reason: 'Out of stock'
      });
      assert.strictEqual(rejRes.success, true);
      assert.strictEqual(rejRes.refundedCoins, 50);

      assert.strictEqual(uA.coins, 100, 'Child A coins must be fully refunded to 100');
      assert.strictEqual(uB.coins, 40, 'Child B coins must remain strictly invariant at 40');
    });

    test('MC-B23: Approval of redemption permanently debits escrow coins without double debit', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Permanent', email: 'perm@example.com', pin: '2222', password: 'Password2222' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      uA.coins = 100;

      const rw = oracle.tables.RewardsCatalog.find(r => r.parentUserId === p.user.id);
      const rdmRes = await oracle.submitRedemptionRequest({ studentId: sA.user.id, rewardId: rw.id });
      assert.strictEqual(uA.coins, 50);

      const appRes = await oracle.approveRedemption({ redemptionId: rdmRes.redemptionId, parentUserId: p.user.id });
      assert.strictEqual(appRes.success, true);
      assert.strictEqual(uA.coins, 50, 'Child A balance remains 50 (coins permanently surrendered)');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 7: LockService Concurrency Protection & Transaction Serialization
  // -----------------------------------------------------------------------
  describe('Group 7: LockService Concurrency Protection & Serialization', () => {
    test('MC-B24: Mutating endpoints are guarded by withScriptLock with 10,000ms fail-closed timeout', () => {
      const gasFilePath = fs.existsSync(path.join(__dirname, '../google_apps_script_backend.js'))
        ? path.join(__dirname, '../google_apps_script_backend.js')
        : path.join(__dirname, '../../../google_apps_script_backend.js');
      const backendCode = fs.readFileSync(gasFilePath, 'utf8');

      assert.ok(backendCode.includes('function withScriptLock('), 'withScriptLock function must be defined');
      assert.ok(backendCode.includes('lock.tryLock(10000)'), 'Lock timeout must be 10,000ms');

      const protectedFunctions = [
        'signUpParent',
        'signUpStudent',
        'submitQuestCompletion',
        'approveQuestSubmission',
        'rejectQuestSubmission',
        'submitRedemptionRequest',
        'approveRedemption',
        'rejectRedemption',
        'awardParentBonus',
        'updateStudentSecurity'
      ];

      for (const fnName of protectedFunctions) {
        const regex = new RegExp(`function\\s+${fnName}[\\s\\S]*?withScriptLock`, 'm');
        assert.ok(regex.test(backendCode), `${fnName} must invoke withScriptLock`);
      }
    });

    test('MC-B25: Concurrency simulation: failed lock acquisition fails closed without state mutation', () => {
      const backend = require(path.join(__dirname, '../google_apps_script_backend.js'));
      let mutatingActionExecuted = false;

      global.LockService = {
        getScriptLock: () => ({
          tryLock: () => false,
          releaseLock: () => {}
        })
      };

      try {
        assert.throws(() => {
          backend.withScriptLock(() => {
            mutatingActionExecuted = true;
          });
        }, /LOCK_ACQUISITION_FAILED: Timed out waiting for script lock after 10000ms/);

        assert.strictEqual(mutatingActionExecuted, false, 'Mutating action must never execute when lock fails');
      } finally {
        delete global.LockService;
      }
    });

    test('MC-B26: Rapid sequential transactions across siblings execute deterministically without race conditions', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Concurrency', email: 'conc@example.com', pin: '2323', password: 'Password2323' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const habit = await oracle.saveHabit({ habitData: { title: 'Drill Practice', points: 10 }, parentUserId: p.user.id });
      const reward = await oracle.manageRewardItem({ rewardData: { title: 'Sticker Pack', costCoins: 15 }, parentUserId: p.user.id });

      // Seed initial balances via genuine bonus contract
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sA.user.id, coins: 50, xp: 100 });
      await oracle.awardParentBonus({ parentUserId: p.user.id, studentId: sB.user.id, coins: 150, xp: 300 });

      // Execute 5 rapid sequential interleaved transactions across siblings
      for (let i = 1; i <= 5; i++) {
        const subA = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: habit.habit.id, notes: `Round ${i}` });
        assert.strictEqual(subA.success, true);

        const rdmB = await oracle.submitRedemptionRequest({ studentId: sB.user.id, rewardId: reward.reward.id });
        assert.strictEqual(rdmB.success, true);

        const appA = await oracle.approveQuestSubmission({ submissionId: subA.submissionId, parentUserId: p.user.id, bonusCoins: 5 });
        assert.strictEqual(appA.success, true);

        const appB = await oracle.approveRedemption({ redemptionId: rdmB.redemptionId, parentUserId: p.user.id });
        assert.strictEqual(appB.success, true);
      }

      const uA = oracle.tables.Users.find(u => u.id === sA.user.id);
      const uB = oracle.tables.Users.find(u => u.id === sB.user.id);

      assert.strictEqual(uA.coins, 125, 'Child A coins must match exact sum of 5 approved submissions (125)');
      assert.strictEqual(uB.coins, 75, 'Child B coins must match exact remaining balance after 5 redemptions (75)');

      const aSubs = oracle.tables.SubmissionsQueue.filter(s => s.studentId === sA.user.id);
      const bRdms = oracle.tables.RedemptionsQueue.filter(r => r.studentId === sB.user.id);
      assert.strictEqual(aSubs.length, 5, 'Submissions queue must contain exactly 5 records for Child A');
      assert.strictEqual(bRdms.length, 5, 'Redemptions queue must contain exactly 5 records for Child B');
      assert.ok(aSubs.every(s => s.status === 'APPROVED'), 'All Child A submissions must be APPROVED');
      assert.ok(bRdms.every(r => r.status === 'APPROVED'), 'All Child B redemptions must be APPROVED');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 8: Sibling Tampering Defense & Foreign Family RBAC Rejection
  // -----------------------------------------------------------------------
  describe('Group 8: Sibling Tampering Defense & RBAC Enforcement', () => {
    test('MC-B27: Sibling attempting to approve quest submission fails with UNAUTHORIZED', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent RBAC', email: 'rbac@example.com', pin: '2424', password: 'Password2424' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      const habits = (await oracle.getHabitsAndQuests({ userId: sA.user.id })).habits;
      const sub = await oracle.submitQuestCompletion({ studentId: sA.user.id, questId: habits[0].id });

      // Child B attempts to approve Child A's quest
      const tamperedApprove = await oracle.approveQuestSubmission({
        submissionId: sub.submissionId,
        parentUserId: sB.user.id
      });

      assert.strictEqual(tamperedApprove.success, false);
      assert.ok(tamperedApprove.error.includes('Unauthorized') || tamperedApprove.error.includes('UNAUTHORIZED'));
    });

    test('MC-B28: Sibling attempting to update credentials fails with UNAUTHORIZED', async () => {
      const p = await oracle.signUpParent({ fullName: 'Parent Sec', email: 'sec@example.com', pin: '2525', password: 'Password2525' });
      const sA = await oracle.signUpStudent({ fullName: 'Child A', pin: '1111', pairingCode: p.pairingCode });
      const sB = await oracle.signUpStudent({ fullName: 'Child B', pin: '2222', pairingCode: p.pairingCode });

      // Child B attempts to change Child A's PIN
      const res = await oracle.updateStudentSecurity({
        parentUserId: sB.user.id,
        studentId: sA.user.id,
        newPin: '0000'
      });

      assert.strictEqual(res.success, false);
      assert.ok(res.error.includes('Unauthorized') || res.error.includes('UNAUTHORIZED'));
    });

    test('MC-B29: Foreign parent attempting actions on another family child fails assertParentPairing', async () => {
      const p1 = await oracle.signUpParent({ fullName: 'Family One Parent', email: 'f1@example.com', pin: '2626', password: 'Password2626' });
      const p2 = await oracle.signUpParent({ fullName: 'Family Two Parent', email: 'f2@example.com', pin: '2727', password: 'Password2727' });

      const s1 = await oracle.signUpStudent({ fullName: 'Family One Child', pin: '1111', pairingCode: p1.pairingCode });

      // Parent 2 attempts assertParentPairing with Child 1
      assert.throws(() => {
        oracle.assertParentPairing(p2.user.id, s1.user.id);
      }, /Student is not paired with this parent account/);
    });

    test('MC-B30: triggerEmailDigest aggregates progress cards exclusively for authenticated parent children', async () => {
      const p1 = await oracle.signUpParent({ fullName: 'Parent Digest 1', email: 'digest1@example.com', pin: '2828', password: 'Password2828' });
      const p2 = await oracle.signUpParent({ fullName: 'Parent Digest 2', email: 'digest2@example.com', pin: '2929', password: 'Password2929' });

      const s1A = await oracle.signUpStudent({ fullName: 'Child 1A', pin: '1111', pairingCode: p1.pairingCode });
      const s1B = await oracle.signUpStudent({ fullName: 'Child 1B', pin: '2222', pairingCode: p1.pairingCode });
      const s2A = await oracle.signUpStudent({ fullName: 'Child 2A', pin: '3333', pairingCode: p2.pairingCode });

      const digest1 = await oracle.triggerEmailDigest({ parentUserId: p1.user.id });
      assert.strictEqual(digest1.success, true);
      assert.strictEqual(digest1.childCount, 2);
      assert.strictEqual(digest1.children.length, 2);

      const digestChildIds = digest1.children.map(c => c.id);
      assert.ok(digestChildIds.includes(s1A.user.id));
      assert.ok(digestChildIds.includes(s1B.user.id));
      assert.strictEqual(digestChildIds.includes(s2A.user.id), false, 'Child from family 2 must never appear in family 1 digest');
    });
  });
});

if (require.main === module) {
  registry.run({ verbose: true }).then(({ stats }) => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
