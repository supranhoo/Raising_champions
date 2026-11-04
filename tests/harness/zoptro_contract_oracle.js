/**
 * =========================================================================
 * ZOPTRO CONTRACT ORACLE & REFERENCE PROGRAM
 * =========================================================================
 * Authoritative specification-derived reference engine strictly embodying:
 * 1. Interface Contracts defined in PROJECT.md § Interface Contracts
 * 2. 6-Table Relational Schema in PROJECT.md § Relational Schema Structure
 * 3. Optra360 / Zoptro Brand Expression System (90° geometry, palette, typography)
 * 4. Dual-Mode LocalStorage persistence and self-healing schema
 */

const crypto = require('node:crypto');

class ZoptroContractOracle {
  constructor(storage = null) {
    this.storage = storage;
    this.STORAGE_KEY = 'ZOPTRO_LOCAL_DB_V1';
    this.tables = {
      Users: [],
      HabitsQuests: [],
      SubmissionsQueue: [],
      RewardsCatalog: [],
      RedemptionsQueue: [],
      ActivityLogs: []
    };

    if (this.storage) {
      this.loadFromStorage();
    } else {
      this.selfHealSchema();
    }
  }

  // -----------------------------------------------------------------------
  // Schema Initialization & Self-Healing (Feature 4)
  // -----------------------------------------------------------------------
  selfHealSchema() {
    const requiredTables = [
      'Users',
      'HabitsQuests',
      'SubmissionsQueue',
      'RewardsCatalog',
      'RedemptionsQueue',
      'ActivityLogs'
    ];

    for (const table of requiredTables) {
      if (!Array.isArray(this.tables[table])) {
        this.tables[table] = [];
      }
    }

    if (this.storage) {
      this.saveToStorage();
    }
    return { success: true, message: 'Schema self-healed successfully.' };
  }

  saveToStorage() {
    if (!this.storage) return;
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(this.tables));
  }

  loadFromStorage() {
    if (!this.storage) return;
    const raw = this.storage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.tables = {
          Users: parsed.Users || [],
          HabitsQuests: parsed.HabitsQuests || [],
          SubmissionsQueue: parsed.SubmissionsQueue || [],
          RewardsCatalog: parsed.RewardsCatalog || [],
          RedemptionsQueue: parsed.RedemptionsQueue || [],
          ActivityLogs: parsed.ActivityLogs || []
        };
      } catch {
        this.selfHealSchema();
      }
    } else {
      this.selfHealSchema();
    }
  }

  _hash(str) {
    if (!str) return '';
    return crypto.createHash('sha256').update(String(str)).digest('hex');
  }

  _generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  _generatePairingCode() {
    // Exactly 6 uppercase alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ZP';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  _logActivity(userId, action, details, category = 'General', status = 'SUCCESS') {
    const entry = {
      id: this._generateId('log'),
      userId: userId || 'SYSTEM',
      action,
      details,
      category,
      status,
      timestamp: new Date().toISOString()
    };
    this.tables.ActivityLogs.push(entry);
    this.saveToStorage();
    return entry;
  }

  assertParent(parentUserId) {
    if (!parentUserId) {
      throw new Error('UNAUTHORIZED: Parent governance required.');
    }
    const parent = this.tables.Users.find(
      u => u.id === parentUserId && u.role === 'parent'
    );
    if (!parent) {
      throw new Error('UNAUTHORIZED: Parent governance required.');
    }
    return parent;
  }

  assertParentPairing(parentUserId, studentId) {
    const parent = this.assertParent(parentUserId);
    if (!studentId) {
      throw new Error('MISSING_STUDENT_ID: studentId is required for family pairing verification.');
    }
    const student = this.tables.Users.find(
      u => u.id === studentId && u.role === 'student'
    );
    if (!student) {
      throw new Error('STUDENT_NOT_FOUND: Student record does not exist.');
    }
    if (student.linkedParentId !== parent.id) {
      throw new Error('UNAUTHORIZED: Student is not paired with this parent account.');
    }
    return { parent, student };
  }

  // -----------------------------------------------------------------------
  // Auth & Pairing (Features 6, 7, 8, 9, 10)
  // -----------------------------------------------------------------------
  async signUpParent({ fullName, email, pin, password }) {
    if (!fullName || !fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }
    if (!pin || String(pin).trim().length < 4) {
      return { success: false, error: 'PIN must be at least 4 digits.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.tables.Users.find(
      u => u.email && u.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    let pairingCode = this._generatePairingCode();
    while (this.tables.Users.some(u => u.pairingCode === pairingCode)) {
      pairingCode = this._generatePairingCode();
    }

    const user = {
      id: this._generateId('usr_p'),
      role: 'parent',
      fullName: fullName.trim(),
      email: normalizedEmail,
      pinHash: this._hash(pin),
      passwordHash: this._hash(password),
      pairingCode,
      linkedParentId: null,
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: new Date().toISOString()
    };

    this.tables.Users.push(user);
    this._logActivity(user.id, 'SIGNUP_PARENT', `Parent registered: ${user.fullName}`, 'Auth');
    this.saveToStorage();

    // Default habits seeded for this parent
    const seedHabits = [
      { title: 'Neat Uniform & Shoes Placed After School', category: 'Routine', points: 15, xp: 30, icon: '👟' },
      { title: 'Lunch Box & Bottle in Kitchen Sink', category: 'Responsibility', points: 15, xp: 30, icon: '🍱' },
      { title: 'Daily Study Block 1 Finish', category: 'Academic', points: 25, xp: 50, icon: '📝' },
      { title: 'Daily GK Arena: 20 Questions Solved', category: 'Learning', points: 20, xp: 40, icon: '🌍' }
    ];
    for (const h of seedHabits) {
      this.tables.HabitsQuests.push({
        id: this._generateId('hbt'),
        parentUserId: user.id,
        title: h.title,
        category: h.category,
        points: h.points,
        xp: h.xp,
        timeSlot: 'Daily',
        icon: h.icon,
        isArchived: false,
        createdAt: new Date().toISOString()
      });
    }

    // Default rewards seeded for this parent
    const seedRewards = [
      { title: '30 Mins Weekend Gaming Pass', costCoins: 50, icon: '🎮', category: 'Screen Time' },
      { title: 'Choose Weekend Family Movie', costCoins: 80, icon: '🎬', category: 'Leisure' },
      { title: 'Favorite Snack / Ice Cream Treat', costCoins: 40, icon: '🍦', category: 'Treat' }
    ];
    for (const r of seedRewards) {
      this.tables.RewardsCatalog.push({
        id: this._generateId('rwd'),
        parentUserId: user.id,
        title: r.title,
        costCoins: r.costCoins,
        icon: r.icon,
        category: r.category,
        isArchived: false,
        createdAt: new Date().toISOString()
      });
    }

    this.saveToStorage();

    const safeUser = { ...user };
    delete safeUser.pinHash;
    delete safeUser.passwordHash;

    return { success: true, user: safeUser, pairingCode };
  }

  async signUpStudent({ fullName, pin, pairingCode }) {
    if (!fullName || !fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!pin || String(pin).trim().length < 4) {
      return { success: false, error: 'PIN must be at least 4 digits.' };
    }
    if (!pairingCode || !pairingCode.trim()) {
      return { success: false, error: 'Family pairing code is required.' };
    }

    const cleanCode = pairingCode.trim().toUpperCase();
    const parent = this.tables.Users.find(
      u => u.role === 'parent' && u.pairingCode === cleanCode
    );
    if (!parent) {
      return { success: false, error: 'Invalid pairing code. No matching parent account found.' };
    }

    const student = {
      id: this._generateId('usr_s'),
      role: 'student',
      fullName: fullName.trim(),
      email: null,
      pinHash: this._hash(pin),
      passwordHash: null,
      pairingCode: cleanCode,
      linkedParentId: parent.id,
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: new Date().toISOString()
    };

    this.tables.Users.push(student);
    this._logActivity(student.id, 'SIGNUP_STUDENT', `Student registered: ${student.fullName} paired with parent ${parent.fullName}`, 'Auth');
    this.saveToStorage();

    const safeStudent = { ...student };
    delete safeStudent.pinHash;
    delete safeStudent.passwordHash;

    return { success: true, user: safeStudent };
  }

  async loginUser({ identifier, pinOrPassword, role }) {
    if (!identifier || !pinOrPassword) {
      return { success: false, error: 'Identifier and credentials are required.' };
    }

    const hash = this._hash(pinOrPassword);
    const user = this.tables.Users.find(u => {
      const matchRole = !role || u.role === role;
      const matchEmail = u.email && u.email.toLowerCase() === identifier.trim().toLowerCase();
      const matchName = u.fullName && u.fullName.toLowerCase() === identifier.trim().toLowerCase();
      const matchCreds = u.pinHash === hash || u.passwordHash === hash;
      return matchRole && (matchEmail || matchName) && matchCreds;
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials or role mismatch.' };
    }

    const token = `tok_${user.id}_${Date.now()}`;
    const safeUser = { ...user };
    delete safeUser.pinHash;
    delete safeUser.passwordHash;

    this._logActivity(user.id, 'LOGIN', `User ${user.fullName} logged in`, 'Auth');
    return { success: true, token, user: safeUser };
  }

  async verifyRolePin({ userId, pin, targetRole }) {
    if (!userId || !pin) {
      return { success: false, verified: false, error: 'User ID and PIN are required.' };
    }
    const hash = this._hash(pin);
    const user = this.tables.Users.find(u => u.id === userId);
    if (!user) {
      return { success: false, verified: false, error: 'User not found.' };
    }
    if (targetRole && user.role !== targetRole) {
      return { success: false, verified: false, error: 'Target role does not match user.' };
    }
    const verified = user.pinHash === hash;
    return { success: true, verified };
  }

  // -----------------------------------------------------------------------
  // Habits & Quests (Features 11, 12, 13, 16)
  // -----------------------------------------------------------------------
  async getHabitsAndQuests({ userId, role, studentId } = {}) {
    if (!userId) {
      return { success: false, error: 'User ID is required.' };
    }
    const user = this.tables.Users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    let habits = [];
    let targetStudentId = null;

    if (user.role === 'parent') {
      if (studentId) {
        const student = this.tables.Users.find(
          u => u.id === studentId && u.role === 'student' && u.linkedParentId === user.id
        );
        if (!student) {
          return { success: false, error: 'UNAUTHORIZED: Student is not paired with this parent account.' };
        }
        targetStudentId = student.id;
      } else {
        const linkedStudent = this.tables.Users.find(
          u => u.role === 'student' && u.linkedParentId === user.id
        );
        targetStudentId = linkedStudent ? linkedStudent.id : null;
      }
      habits = this.tables.HabitsQuests.filter(h => h.parentUserId === user.id);
    } else {
      targetStudentId = user.id;
      habits = this.tables.HabitsQuests.filter(
        h => h.parentUserId === user.linkedParentId && !h.isArchived
      );
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const enrichedHabits = habits.map(h => {
      const sub = targetStudentId ? this.tables.SubmissionsQueue.find(s =>
        s.questId === h.id &&
        s.studentId === targetStudentId &&
        (s.submittedAt ? s.submittedAt.substring(0, 10) === todayStr : false)
      ) : null;

      let status = 'AVAILABLE';
      let completed = false;
      if (sub) {
        status = sub.status === 'PENDING' ? 'PENDING_VERIFICATION' : sub.status;
        completed = sub.status === 'APPROVED';
      }

      return {
        ...h,
        status,
        completed
      };
    });

    return { success: true, habits: enrichedHabits };
  }

  async submitQuestCompletion({ studentId, questId, notes = '' }) {
    if (!studentId || !questId) {
      return { success: false, error: 'Student ID and Quest ID are required.' };
    }
    const student = this.tables.Users.find(u => u.id === studentId && u.role === 'student');
    if (!student) {
      return { success: false, error: 'Student account not found.' };
    }

    const quest = this.tables.HabitsQuests.find(h => h.id === questId);
    if (!quest) {
      return { success: false, error: 'Quest not found.' };
    }
    if (quest.isArchived) {
      return { success: false, error: 'Cannot complete an archived quest.' };
    }

    // Check duplicate pending submission
    const existingPending = this.tables.SubmissionsQueue.find(
      s => s.studentId === studentId && s.questId === questId && s.status === 'PENDING'
    );
    if (existingPending) {
      return { success: false, error: 'A completion submission for this quest is already pending parent verification.' };
    }

    const submission = {
      id: this._generateId('sub'),
      studentId: student.id,
      parentUserId: student.linkedParentId,
      questId: quest.id,
      questTitle: quest.title,
      points: quest.points,
      xp: quest.xp,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      notes: notes || ''
    };

    this.tables.SubmissionsQueue.push(submission);
    // CRITICAL REQUIREMENT: Coins and XP are NOT added to student wallet yet!
    this._logActivity(student.id, 'QUEST_SUBMIT', `Submitted quest: ${quest.title} (Pending Verification)`, 'Quests');
    this.saveToStorage();

    return {
      success: true,
      submissionId: submission.id,
      status: 'PENDING_VERIFICATION'
    };
  }

  async saveHabit({ habitData, parentUserId }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can manage habits.' };
    }

    if (!habitData || !habitData.title || !habitData.title.trim()) {
      return { success: false, error: 'Habit title is required.' };
    }

    const points = parseInt(habitData.points, 10);
    if (isNaN(points) || points < 0 || points > 1000) {
      return { success: false, error: 'Points must be a positive integer between 0 and 1000.' };
    }

    const xp = parseInt(habitData.xp, 10) || points * 2;

    if (habitData.id) {
      const habit = this.tables.HabitsQuests.find(
        h => h.id === habitData.id && h.parentUserId === parentUserId
      );
      if (!habit) {
        return { success: false, error: 'Habit not found.' };
      }
      habit.title = habitData.title.trim();
      habit.points = points;
      habit.xp = xp;
      habit.category = habitData.category || habit.category;
      habit.icon = habitData.icon || habit.icon;
      habit.timeSlot = habitData.timeSlot || habit.timeSlot;
      this.saveToStorage();
      this._logActivity(parentUserId, 'HABIT_UPDATE', `Updated habit: ${habit.title}`, 'Habits');
      return { success: true, habit };
    }

    const newHabit = {
      id: this._generateId('hbt'),
      parentUserId,
      title: habitData.title.trim(),
      category: habitData.category || 'General',
      points,
      xp,
      timeSlot: habitData.timeSlot || 'Daily',
      icon: habitData.icon || '⭐',
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    this.tables.HabitsQuests.push(newHabit);
    this.saveToStorage();
    this._logActivity(parentUserId, 'HABIT_CREATE', `Created habit: ${newHabit.title}`, 'Habits');
    return { success: true, habit: newHabit };
  }

  async deleteHabit({ habitId, parentUserId }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can delete habits.' };
    }

    const habit = this.tables.HabitsQuests.find(
      h => h.id === habitId && h.parentUserId === parentUserId
    );
    if (!habit) {
      return { success: false, error: 'Habit not found.' };
    }

    habit.isArchived = true;
    this.saveToStorage();
    this._logActivity(parentUserId, 'HABIT_ARCHIVE', `Archived habit: ${habit.title}`, 'Habits');
    return { success: true };
  }

  // -----------------------------------------------------------------------
  // Verification Queue (Feature 6, 15) & Roster (Milestone 2)
  // -----------------------------------------------------------------------
  async getLinkedStudents({ parentUserId }) {
    try {
      this.assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const students = this.tables.Users
      .filter(u => u.role === 'student' && u.linkedParentId === parentUserId)
      .map(u => ({
        id: u.id,
        fullName: u.fullName,
        coins: Number(u.coins) || 0,
        xp: Number(u.xp) || 0,
        level: Number(u.level) || 1,
        streak: Number(u.streak) || 0,
        createdAt: u.createdAt || '',
        lastLoginAt: u.lastLoginAt || ''
      }));

    return {
      success: true,
      students,
      children: students
    };
  }

  async getLinkedChildren(payload) {
    return this.getLinkedStudents(payload);
  }

  async getPendingVerifications(payload) {
    const parentUserId = payload && payload.parentUserId ? payload.parentUserId : null;
    const studentId = payload && payload.studentId ? payload.studentId : null;

    try {
      this.assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (studentId) {
      try {
        this.assertParentPairing(parentUserId, studentId);
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const linkedStudents = this.tables.Users.filter(
      u => u.role === 'student' && u.linkedParentId === parentUserId
    );
    const linkedStudentIds = new Set(linkedStudents.map(u => u.id));

    const studentNameMap = {};
    this.tables.Users.forEach(u => {
      if (u.role === 'student') {
        studentNameMap[u.id] = u.fullName || 'Student';
      }
    });

    const pendingQuests = this.tables.SubmissionsQueue
      .filter(s => {
        const isPending = s.status === 'PENDING' || s.status === 'PENDING_VERIFICATION';
        const isFamily = s.parentUserId === parentUserId || linkedStudentIds.has(s.studentId);
        const isStudentMatch = !studentId || s.studentId === studentId;
        return isPending && isFamily && isStudentMatch;
      })
      .map(s => ({
        ...s,
        studentName: studentNameMap[s.studentId] || 'Student'
      }));

    const pendingRedemptions = this.tables.RedemptionsQueue
      .filter(r => {
        const isPending = r.status === 'PENDING' || r.status === 'PENDING_APPROVAL';
        const isFamily = r.parentUserId === parentUserId || linkedStudentIds.has(r.studentId);
        const isStudentMatch = !studentId || r.studentId === studentId;
        return isPending && isFamily && isStudentMatch;
      })
      .map(r => ({
        ...r,
        studentName: studentNameMap[r.studentId] || 'Student'
      }));

    return { success: true, pendingQuests, pendingRedemptions };
  }

  async approveQuestSubmission({ submissionId, parentUserId, bonusCoins = 0 }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can approve quest submissions.' };
    }

    const submission = this.tables.SubmissionsQueue.find(
      s => s.id === submissionId && s.parentUserId === parentUserId
    );
    if (!submission) {
      return { success: false, error: 'Submission not found in verification queue.' };
    }
    if (submission.status !== 'PENDING') {
      return { success: false, error: `Submission already has status ${submission.status}.` };
    }

    const bonus = parseInt(bonusCoins, 10) || 0;
    if (bonus < 0 || bonus > 1000) {
      return { success: false, error: 'Bonus coins must be a non-negative integer <= 1000.' };
    }

    submission.status = 'APPROVED';
    submission.reviewedAt = new Date().toISOString();

    const student = this.tables.Users.find(u => u.id === submission.studentId);
    if (student) {
      student.coins += (submission.points + bonus);
      student.xp += submission.xp;
      student.level = Math.floor(student.xp / 150) + 1;
      student.streak = (student.streak || 0) + 1;
    }

    this._logActivity(
      parentUserId,
      'QUEST_APPROVED',
      `Approved quest '${submission.questTitle}' for student. Awarded ${submission.points + bonus} coins, ${submission.xp} XP.`,
      'Verification'
    );
    this.saveToStorage();

    return {
      success: true,
      updatedWallet: student ? { coins: student.coins, xp: student.xp, level: student.level, streak: student.streak } : null
    };
  }

  async rejectQuestSubmission({ submissionId, parentUserId, reason = '' }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can reject submissions.' };
    }

    const submission = this.tables.SubmissionsQueue.find(
      s => s.id === submissionId && s.parentUserId === parentUserId
    );
    if (!submission) {
      return { success: false, error: 'Submission not found.' };
    }
    if (submission.status !== 'PENDING') {
      return { success: false, error: `Submission already has status ${submission.status}.` };
    }

    submission.status = 'REJECTED';
    submission.reviewedAt = new Date().toISOString();
    submission.notes = reason || 'Rejected by parent';

    this._logActivity(
      parentUserId,
      'QUEST_REJECTED',
      `Rejected quest '${submission.questTitle}'. Reason: ${submission.notes}`,
      'Verification'
    );
    this.saveToStorage();

    return { success: true };
  }

  // -----------------------------------------------------------------------
  // Rewards & Redemptions (Features 14, 15)
  // -----------------------------------------------------------------------
  async getRewardsCatalog({ userId }) {
    if (!userId) {
      return { success: false, error: 'User ID is required.' };
    }
    const user = this.tables.Users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const parentId = user.role === 'parent' ? user.id : user.linkedParentId;
    const rewards = this.tables.RewardsCatalog.filter(
      r => r.parentUserId === parentId && !r.isArchived
    );
    return { success: true, rewards };
  }

  async submitRedemptionRequest({ studentId, rewardId }) {
    if (!studentId || !rewardId) {
      return { success: false, error: 'Student ID and Reward ID are required.' };
    }
    const student = this.tables.Users.find(u => u.id === studentId && u.role === 'student');
    if (!student) {
      return { success: false, error: 'Student not found.' };
    }

    const reward = this.tables.RewardsCatalog.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found in catalog.' };
    }
    if (reward.isArchived) {
      return { success: false, error: 'Cannot redeem an archived reward.' };
    }

    if (student.coins < reward.costCoins) {
      return {
        success: false,
        error: `Insufficient Focus Coins. Need ${reward.costCoins}, but student has ${student.coins}.`
      };
    }

    // Reserve / hold coins
    student.coins -= reward.costCoins;

    const redemption = {
      id: this._generateId('rdm'),
      studentId: student.id,
      parentUserId: student.linkedParentId,
      rewardId: reward.id,
      rewardTitle: reward.title,
      costCoins: reward.costCoins,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      reviewedAt: null
    };

    this.tables.RedemptionsQueue.push(redemption);
    this._logActivity(
      student.id,
      'REWARD_REQUEST',
      `Requested reward '${reward.title}' (${reward.costCoins} coins reserved)`,
      'Rewards'
    );
    this.saveToStorage();

    return {
      success: true,
      redemptionId: redemption.id,
      status: 'PENDING_APPROVAL'
    };
  }

  async approveRedemption({ redemptionId, parentUserId }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can approve redemptions.' };
    }

    const redemption = this.tables.RedemptionsQueue.find(
      r => r.id === redemptionId && r.parentUserId === parentUserId
    );
    if (!redemption) {
      return { success: false, error: 'Redemption request not found.' };
    }
    if (redemption.status !== 'PENDING') {
      return { success: false, error: `Redemption already has status ${redemption.status}.` };
    }

    redemption.status = 'APPROVED';
    redemption.reviewedAt = new Date().toISOString();

    this._logActivity(
      parentUserId,
      'REWARD_APPROVED',
      `Approved redemption '${redemption.rewardTitle}' for student`,
      'Verification'
    );
    this.saveToStorage();

    return { success: true };
  }

  async rejectRedemption({ redemptionId, parentUserId, reason = '' }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can reject redemptions.' };
    }

    const redemption = this.tables.RedemptionsQueue.find(
      r => r.id === redemptionId && r.parentUserId === parentUserId
    );
    if (!redemption) {
      return { success: false, error: 'Redemption request not found.' };
    }
    if (redemption.status !== 'PENDING') {
      return { success: false, error: `Redemption already has status ${redemption.status}.` };
    }

    redemption.status = 'REJECTED';
    redemption.reviewedAt = new Date().toISOString();

    // REFUND COINS TO STUDENT
    const student = this.tables.Users.find(u => u.id === redemption.studentId);
    if (student) {
      student.coins += redemption.costCoins;
    }

    this._logActivity(
      parentUserId,
      'REWARD_REJECTED',
      `Rejected redemption '${redemption.rewardTitle}'. Refunded ${redemption.costCoins} coins. Reason: ${reason}`,
      'Verification'
    );
    this.saveToStorage();

    return { success: true, refundedCoins: redemption.costCoins };
  }

  async manageRewardItem({ rewardData, parentUserId }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can manage rewards.' };
    }

    if (!rewardData || !rewardData.title) {
      return { success: false, error: 'Reward title is required.' };
    }

    const costCoins = parseInt(rewardData.costCoins, 10);
    if (isNaN(costCoins) || costCoins < 0) {
      return { success: false, error: 'Cost in coins must be a positive integer.' };
    }

    if (rewardData.id) {
      const reward = this.tables.RewardsCatalog.find(
        r => r.id === rewardData.id && r.parentUserId === parentUserId
      );
      if (!reward) {
        return { success: false, error: 'Reward item not found.' };
      }
      reward.title = rewardData.title;
      reward.costCoins = costCoins;
      reward.icon = rewardData.icon || reward.icon;
      reward.category = rewardData.category || reward.category;
      if (rewardData.isArchived !== undefined) {
        reward.isArchived = Boolean(rewardData.isArchived);
      }
      this.saveToStorage();
      return { success: true, reward };
    }

    const newReward = {
      id: this._generateId('rwd'),
      parentUserId,
      title: rewardData.title,
      costCoins,
      icon: rewardData.icon || '🎁',
      category: rewardData.category || 'General',
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    this.tables.RewardsCatalog.push(newReward);
    this.saveToStorage();
    return { success: true, reward: newReward };
  }

  // -----------------------------------------------------------------------
  // Parent Security Controls & Analytics (Features 17, 18)
  // -----------------------------------------------------------------------
  async updateStudentSecurity({ parentUserId, studentId, newPin, newPassword }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: parent role required.' };
    }

    const student = this.tables.Users.find(
      u => u.id === studentId && u.linkedParentId === parentUserId
    );
    if (!student) {
      return { success: false, error: 'Student not found or not paired with this parent.' };
    }

    if (newPin) {
      if (String(newPin).trim().length < 4 || !/^\d+$/.test(String(newPin).trim())) {
        return { success: false, error: 'Student PIN must be at least 4 digits (numeric).' };
      }
      student.pinHash = this._hash(newPin);
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      student.passwordHash = this._hash(newPassword);
    }

    this._logActivity(
      parentUserId,
      'SECURITY_UPDATE',
      `Updated credentials for student ${student.fullName}`,
      'Security'
    );
    this.saveToStorage();

    return { success: true };
  }

  async getActivityLogs({ userId, role }) {
    if (!userId) {
      return { success: false, error: 'User ID is required.' };
    }
    const user = this.tables.Users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    let logs = [];
    if (user.role === 'parent') {
      const studentIds = this.tables.Users.filter(u => u.linkedParentId === user.id).map(u => u.id);
      const relevantUserIds = new Set([user.id, ...studentIds, 'SYSTEM']);
      logs = this.tables.ActivityLogs.filter(l => relevantUserIds.has(l.userId));
    } else {
      logs = this.tables.ActivityLogs.filter(l => l.userId === user.id);
    }

    return { success: true, logs: logs.slice(-50) };
  }

  async triggerEmailDigest({ parentUserId }) {
    if (!parentUserId) {
      return { success: false, error: 'Parent authorization required.' };
    }
    const parent = this.tables.Users.find(u => u.id === parentUserId && u.role === 'parent');
    if (!parent) {
      return { success: false, error: 'Unauthorized: only parents can trigger email digest.' };
    }

    const children = this.tables.Users.filter(
      u => u.role === 'student' && u.linkedParentId === parent.id
    );

    const childCards = children.map(c => {
      const completedQuests = this.tables.SubmissionsQueue.filter(
        s => s.studentId === c.id && s.status === 'APPROVED'
      ).length;
      return {
        id: c.id,
        fullName: c.fullName,
        coins: c.coins || 0,
        xp: c.xp || 0,
        level: c.level || 1,
        streak: c.streak || 0,
        questCount: completedQuests
      };
    });

    this._logActivity(
      parentUserId,
      'EMAIL_DIGEST',
      `Dispatched weekly progress email digest to ${parent.email}`,
      'Analytics'
    );
    this.saveToStorage();

    return {
      success: true,
      recipient: parent.email,
      sentTo: parent.email,
      childCount: children.length,
      children: childCards,
      message: `Weekly progress digest dispatched successfully to ${parent.email}.`
    };
  }

  // -----------------------------------------------------------------------
  // Legacy Bridges (Backward Compatibility)
  // -----------------------------------------------------------------------
  async getCommanderData({ studentId } = {}) {
    let student = null;
    if (studentId) {
      student = this.tables.Users.find(u => u.id === studentId && u.role === 'student');
    } else {
      student = this.tables.Users.find(u => u.role === 'student');
    }
    const defaultStudent = student || { id: 'u_stu_demo', fullName: 'Commander Divyank', coins: 340, xp: 680, level: 3, streak: 5 };
    const habitsRes = await this.getHabitsAndQuests({ userId: defaultStudent.id, role: 'student' });
    const logsRes = await this.getActivityLogs({ userId: defaultStudent.id, role: 'student' });

    const profileData = {
      id: defaultStudent.id,
      fullName: defaultStudent.fullName,
      focusCoins: Number(defaultStudent.coins) || 0,
      xp: Number(defaultStudent.xp) || 0,
      level: Number(defaultStudent.level) || 1,
      streak: Number(defaultStudent.streak) || 0,
      avatar: '🚀'
    };

    return {
      success: true,
      commander: profileData,
      profile: profileData,
      habits: habitsRes.habits || [],
      logs: logsRes.logs || []
    };
  }

  // -----------------------------------------------------------------------
  // Parent Bonus Awards (Feature 11 / Contract Parity with GAS Backend)
  // -----------------------------------------------------------------------
  async awardParentBonus(payload) {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : '';
    const studentId = payload && payload.studentId ? String(payload.studentId) : 'u_stu_demo';

    let pairing;
    try {
      pairing = this.assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const rawCoins = payload && payload.coins !== undefined ? Number(payload.coins) : 15;
    if (isNaN(rawCoins) || !Number.isFinite(rawCoins) || rawCoins < 0 || rawCoins > 1000) {
      return { success: false, error: 'INVALID_COINS: Coins must be a valid non-negative number <= 1000.' };
    }
    const coins = Math.floor(rawCoins);

    const rawXp = payload && payload.xp !== undefined ? Number(payload.xp) : coins * 2;
    if (isNaN(rawXp) || !Number.isFinite(rawXp) || rawXp < 0) {
      return { success: false, error: 'INVALID_XP: XP must be a valid non-negative number.' };
    }
    const xp = Math.floor(rawXp);

    const reason = payload && payload.reason ? String(payload.reason) : 'Respect & Obedience';
    const category = payload && payload.category ? String(payload.category) : 'respect';

    const student = pairing.student;
    const currentCoins = Number.isFinite(Number(student.coins)) ? Number(student.coins) : 0;
    const currentXp = Number.isFinite(Number(student.xp)) ? Number(student.xp) : 0;

    const newCoins = Math.max(0, currentCoins + coins);
    const newXp = Math.max(0, currentXp + xp);
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    student.coins = newCoins;
    student.xp = newXp;
    student.level = newLevel;

    this._logActivity(
      parentUserId,
      'PARENT_BONUS',
      `Awarded ${coins} Coins to ${student.fullName}: ${reason}`,
      category,
      'VERIFIED'
    );

    if (this.storage) this.saveToStorage();

    return {
      success: true,
      coins: newCoins,
      xp: newXp,
      level: newLevel
    };
  }
}

module.exports = {
  ZoptroContractOracle
};
