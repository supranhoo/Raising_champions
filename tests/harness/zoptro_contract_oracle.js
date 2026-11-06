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
      ActivityLogs: [],
      Stories: [],
      StoryQuestions: [],
      EQScenarios: [],
      DailyKnowledge: [],
      CurriculumQuizzes: [],
      StudentCompletions: [],
      StudentGrowthProfiles: []
    };
    this.tables.StudentContentCompletions = this.tables.StudentCompletions;

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
      'ActivityLogs',
      'Stories',
      'StoryQuestions',
      'EQScenarios',
      'DailyKnowledge',
      'CurriculumQuizzes',
      'StudentCompletions',
      'StudentGrowthProfiles'
    ];

    for (const table of requiredTables) {
      if (!Array.isArray(this.tables[table])) {
        this.tables[table] = [];
      }
    }
    this.tables.StudentContentCompletions = this.tables.StudentCompletions;

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
          ActivityLogs: parsed.ActivityLogs || [],
          Stories: parsed.Stories || [],
          StoryQuestions: parsed.StoryQuestions || [],
          EQScenarios: parsed.EQScenarios || [],
          DailyKnowledge: parsed.DailyKnowledge || [],
          CurriculumQuizzes: parsed.CurriculumQuizzes || [],
          StudentCompletions: parsed.StudentCompletions || parsed.StudentContentCompletions || [],
          StudentGrowthProfiles: parsed.StudentGrowthProfiles || []
        };
        this.tables.StudentContentCompletions = this.tables.StudentCompletions;
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

  assertAdmin(adminUserId) {
    if (!adminUserId) {
      return { success: false, error: 'UNAUTHORIZED: Admin privileges required.', code: 403 };
    }
    const admin = this.tables.Users.find(
      u => u.id === adminUserId && u.role === 'admin'
    );
    if (!admin) {
      return { success: false, error: 'UNAUTHORIZED: Admin privileges required.', code: 403 };
    }
    return {
      success: true,
      user: admin,
      id: admin.id,
      role: admin.role,
      fullName: admin.fullName,
      email: admin.email
    };
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

  async verifyRolePin(payload) {
    const { userId, pin, targetRole } = payload || {};
    if (!userId || !pin) {
      return { success: false, verified: false, error: 'User ID and PIN are required.' };
    }
    const hash = this._hash(pin);
    let user = this.tables.Users.find(u => u.id === userId);
    if (!user && (userId === 'u_adm_demo' || targetRole === 'admin')) {
      const now = new Date().toISOString();
      user = {
        id: 'u_adm_demo',
        role: 'admin',
        fullName: 'Super Admin',
        email: 'admin@zoptro.local',
        pinHash: this._hash('9999'),
        passwordHash: this._hash('adminPass123'),
        pairingCode: '',
        linkedParentId: '',
        coins: 0,
        xp: 0,
        level: 99,
        streak: 0,
        createdAt: now,
        lastLoginAt: now,
        gradeClass: '',
        age: null,
        parentalPermissions: {}
      };
      this.tables.Users.push(user);
    }
    if (!user) {
      return { success: false, verified: false, error: 'User not found.' };
    }
    if (targetRole && user.role !== targetRole) {
      return { success: false, verified: false, error: 'Target role does not match user.' };
    }
    const verified = (user.pinHash === hash) || (user.passwordHash === hash);
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

  // -----------------------------------------------------------------------
  // Milestone 1 Helpers
  // -----------------------------------------------------------------------
  _normalizeGrade(rawGrade) {
    if (rawGrade === undefined || rawGrade === null) return null;
    const str = String(rawGrade).trim();
    if (!str) return null;
    const numMatch = str.match(/^([1-9]|10)$/);
    if (numMatch) return 'Class ' + numMatch[1];
    const classMatch = str.match(/^(?:class|grade)\s*([1-9]|10)$/i);
    if (classMatch) return 'Class ' + classMatch[1];
    return null;
  }

  _canonicalizeContentType(contentType) {
    if (!contentType) return null;
    const s = String(contentType).trim().toLowerCase();
    if (s === 'story' || s === 'stories') return 'Stories';
    if (s === 'story_question' || s === 'story_questions' || s === 'storyquestion' || s === 'storyquestions') return 'StoryQuestions';
    if (s === 'eq' || s === 'eqscenario' || s === 'eqscenarios' || s === 'eq_scenario' || s === 'eq_scenarios') return 'EQScenarios';
    if (s === 'dailygk' || s === 'gk' || s === 'dailyknowledge' || s === 'daily_gk' || s === 'daily_knowledge') return 'DailyKnowledge';
    if (s === 'quiz' || s === 'quizzes' || s === 'curriculumquiz' || s === 'curriculumquizzes' || s === 'curriculum_quiz' || s === 'curriculum_quizzes') return 'CurriculumQuizzes';
    return null;
  }

  _formatContentItem(item, contentType) {
    if (!item) return null;
    const clone = { ...item };
    if (clone.optionsJson) {
      if (typeof clone.optionsJson === 'string') {
        try { clone.options = JSON.parse(clone.optionsJson); } catch { clone.options = []; }
      } else if (Array.isArray(clone.optionsJson)) {
        clone.options = clone.optionsJson;
      }
    } else if (clone.options && typeof clone.options === 'string' && (clone.options.startsWith('[') || clone.options.startsWith('{'))) {
      try { clone.options = JSON.parse(clone.options); } catch {}
    }
    if (clone.content && !clone.text) clone.text = clone.content;
    if (clone.text && !clone.content) clone.content = clone.text;
    if (clone.moralLesson && !clone.reflectionPrompt) clone.reflectionPrompt = clone.moralLesson;
    if (clone.reflectionPrompt && !clone.moralLesson) clone.moralLesson = clone.reflectionPrompt;
    if (clone.dilemma && !clone.scenarioText) clone.scenarioText = clone.dilemma;
    if (clone.scenarioText && !clone.dilemma) clone.dilemma = clone.scenarioText;
    if (clone.question && !clone.questionText) clone.questionText = clone.question;
    if (clone.questionText && !clone.question) clone.question = clone.questionText;
    if (clone.correctOptionIndex !== undefined && clone.correctAnswerIndex === undefined) {
      clone.correctAnswerIndex = Number(clone.correctOptionIndex);
    }
    if (clone.correctAnswerIndex !== undefined && clone.correctOptionIndex === undefined) {
      clone.correctOptionIndex = Number(clone.correctAnswerIndex);
    }
    if (clone.correctAnswer !== undefined && clone.correctOptionIndex === undefined) {
      clone.correctOptionIndex = clone.correctAnswer;
    }
    if (clone.examCategory && !clone.examTrack) clone.examTrack = clone.examCategory;
    if (clone.examTrack && !clone.examCategory) clone.examCategory = clone.examTrack;
    clone.orderIndex = Number(clone.orderIndex) || 0;
    clone.isActive = String(clone.isActive).toLowerCase() === 'true' || clone.isActive === true;
    clone.points = Number(clone.points) || 20;
    clone.xp = Number(clone.xp) || 40;
    return clone;
  }

  // -----------------------------------------------------------------------
  // Admin CMS Endpoints (R1)
  // -----------------------------------------------------------------------
  async getAdminContentList({ adminUserId, contentType, grade, includeInactive = true }) {
    const adminAuth = this.assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return {
        success: false,
        error: 'INVALID_CONTENT_TYPE: Supported types are stories, story_questions, eq_scenarios, daily_knowledge, curriculum_quizzes.',
        code: 400
      };
    }

    let items = this.tables[canonicalType].map(r => this._formatContentItem(r, canonicalType));

    if (grade && String(grade).toLowerCase() !== 'all') {
      const normGrade = this._normalizeGrade(grade);
      items = items.filter(i => this._normalizeGrade(i.grade) === normGrade);
    }

    if (!includeInactive) {
      items = items.filter(i => i.isActive === true);
    }

    items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    return {
      success: true,
      contentType,
      count: items.length,
      items
    };
  }

  async saveAdminContentItem({ adminUserId, contentType, itemData }) {
    const adminAuth = this.assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemData || typeof itemData !== 'object') {
      return { success: false, error: 'INVALID_ITEM_DATA: itemData must be a valid object.', code: 400 };
    }

    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return { success: false, error: 'INVALID_CONTENT_TYPE: Supported types are stories, story_questions, eq_scenarios, daily_knowledge, curriculum_quizzes.', code: 400 };
    }

    if (canonicalType !== 'StoryQuestions') {
      if (itemData.grade) {
        const normGrade = this._normalizeGrade(itemData.grade);
        if (!normGrade && String(itemData.grade).toLowerCase() !== 'all') {
          return { success: false, error: 'INVALID_GRADE: Grade must follow CBSE/NCERT format (Class 1 to Class 10).', code: 400 };
        }
        itemData.grade = normGrade;
      } else if (!itemData.id) {
        itemData.grade = 'Class 3';
      }
    }

    if ((canonicalType === 'Stories' || canonicalType === 'EQScenarios') && !itemData.title) {
      return { success: false, error: 'MISSING_TITLE: Title is required.', code: 400 };
    }
    if (canonicalType === 'StoryQuestions' && (!itemData.storyId || !(itemData.questionText || itemData.question))) {
      return { success: false, error: 'MISSING_STORY_QUESTION_FIELDS: storyId and questionText are required.', code: 400 };
    }
    if ((canonicalType === 'DailyKnowledge' || canonicalType === 'CurriculumQuizzes') && !(itemData.questionText || itemData.question)) {
      return { success: false, error: 'MISSING_QUESTION_TEXT: questionText is required.', code: 400 };
    }

    const now = new Date().toISOString();
    let targetId = itemData.id ? String(itemData.id) : '';
    let isNew = false;
    let existingIndex = -1;

    if (targetId) {
      existingIndex = this.tables[canonicalType].findIndex(r => String(r.id) === targetId);
    }

    let savedRecord;
    if (existingIndex !== -1) {
      savedRecord = {
        ...this.tables[canonicalType][existingIndex],
        ...itemData,
        id: targetId,
        updatedAt: now
      };
      this.tables[canonicalType][existingIndex] = savedRecord;
    } else {
      isNew = true;
      const prefix = canonicalType.substring(0, 3).toLowerCase();
      targetId = targetId || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      savedRecord = {
        ...itemData,
        id: targetId,
        isActive: itemData.isActive !== undefined ? Boolean(itemData.isActive) : true,
        orderIndex: Number(itemData.orderIndex) || (this.tables[canonicalType].length + 1),
        createdAt: itemData.createdAt || now,
        updatedAt: now
      };
      this.tables[canonicalType].push(savedRecord);
    }

    this._logActivity(adminUserId, 'ADMIN_CONTENT_SAVE', `Saved ${contentType} item: ${savedRecord.title || savedRecord.id}`, 'CMS');
    this.saveToStorage();

    return {
      success: true,
      item: this._formatContentItem(savedRecord, canonicalType),
      isNew
    };
  }

  async toggleContentActiveStatus({ adminUserId, contentType, itemId, isActive }) {
    const adminAuth = this.assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemId) {
      return { success: false, error: 'MISSING_ITEM_ID: itemId is required.', code: 400 };
    }

    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return { success: false, error: 'INVALID_CONTENT_TYPE', code: 400 };
    }

    const target = this.tables[canonicalType].find(r => String(r.id) === String(itemId));
    if (!target) {
      return { success: false, error: `ITEM_NOT_FOUND: Item ${itemId} not found.`, code: 404 };
    }

    target.isActive = Boolean(isActive);
    target.updatedAt = new Date().toISOString();

    this._logActivity(adminUserId, 'ADMIN_CONTENT_TOGGLE', `Toggled ${contentType} ${itemId} isActive=${Boolean(isActive)}`, 'CMS');
    this.saveToStorage();

    return {
      success: true,
      itemId,
      isActive: Boolean(isActive)
    };
  }

  async deleteAdminContentItem({ adminUserId, contentType, itemId }) {
    const adminAuth = this.assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemId) {
      return { success: false, error: 'MISSING_ITEM_ID: itemId is required.', code: 400 };
    }

    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return { success: false, error: 'INVALID_CONTENT_TYPE', code: 400 };
    }

    const index = this.tables[canonicalType].findIndex(r => String(r.id) === String(itemId));
    if (index === -1) {
      return { success: false, error: `ITEM_NOT_FOUND: Item ${itemId} not found.`, code: 404 };
    }

    this.tables[canonicalType].splice(index, 1);

    if (canonicalType === 'Stories') {
      this.tables.StoryQuestions = this.tables.StoryQuestions.filter(q => String(q.storyId) !== String(itemId));
    }

    this._logActivity(adminUserId, 'ADMIN_CONTENT_DELETE', `Deleted ${contentType} item: ${itemId}`, 'CMS');
    this.saveToStorage();

    return {
      success: true,
      deletedId: itemId
    };
  }

  // -----------------------------------------------------------------------
  // Dynamic Progression & Completion Endpoints (R2, R3)
  // -----------------------------------------------------------------------
  async getNextContentItem({ studentId, contentType, grade }) {
    if (!studentId) {
      return { success: false, error: 'INVALID_PAYLOAD: studentId is required.', code: 400 };
    }
    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return {
        success: false,
        error: 'INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.',
        code: 400
      };
    }

    const student = this.tables.Users.find(u => String(u.id) === String(studentId) && String(u.role).toLowerCase() === 'student');
    if (!student) {
      return { success: false, error: 'STUDENT_NOT_FOUND: Specified studentId does not exist.', code: 404 };
    }

    const effectiveGrade = this._normalizeGrade(student.gradeClass) || 'Class 3';

    const activeItems = this.tables[canonicalType]
      .filter(item => {
        const itemGrade = this._normalizeGrade(item.grade);
        const isActive = String(item.isActive).toUpperCase() === 'TRUE' || item.isActive === true;
        return itemGrade === effectiveGrade && isActive;
      })
      .sort((a, b) => {
        const orderA = Number(a.orderIndex) || 0;
        const orderB = Number(b.orderIndex) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return String(a.id).localeCompare(String(b.id));
      });

    const totalCount = activeItems.length;
    if (totalCount === 0) {
      return {
        success: true,
        grade: effectiveGrade,
        item: null,
        hasMore: false,
        completedCount: 0,
        totalCount: 0,
        message: `No active content items available for ${effectiveGrade}`
      };
    }

    const completions = this.tables.StudentCompletions || [];
    const completedIds = new Set(
      completions
        .filter(c => String(c.studentId) === String(student.id) && this._canonicalizeContentType(c.contentType) === canonicalType)
        .map(c => String(c.contentId))
    );

    let completedCount = 0;
    let nextItem = null;
    for (const itm of activeItems) {
      if (completedIds.has(String(itm.id))) {
        completedCount++;
      } else if (!nextItem) {
        nextItem = itm;
      }
    }

    const formattedItem = nextItem ? this._formatContentItem(nextItem, canonicalType) : null;
    if (formattedItem && canonicalType === 'Stories') {
      formattedItem.questions = this.tables.StoryQuestions
        .filter(q => String(q.storyId) === String(formattedItem.id))
        .map(q => this._formatContentItem(q, 'StoryQuestions'));
    }

    return {
      success: true,
      grade: effectiveGrade,
      item: formattedItem,
      hasMore: formattedItem !== null,
      completedCount,
      totalCount
    };
  }

  async recordContentCompletion({ studentId, contentType, contentId, score, answers }) {
    if (!studentId || !contentId) {
      return { success: false, error: 'INVALID_PAYLOAD: studentId and contentId are required.', code: 400 };
    }
    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return {
        success: false,
        error: 'INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.',
        code: 400
      };
    }

    const student = this.tables.Users.find(u => String(u.id) === String(studentId) && String(u.role).toLowerCase() === 'student');
    if (!student) {
      return { success: false, error: 'STUDENT_NOT_FOUND: Specified studentId does not exist.', code: 404 };
    }

    const effectiveGrade = this._normalizeGrade(student.gradeClass) || 'Class 3';

    const item = this.tables[canonicalType].find(it => String(it.id) === String(contentId));
    if (!item) {
      return { success: false, error: 'CONTENT_NOT_FOUND: Content item does not exist.', code: 404 };
    }

    if (this._normalizeGrade(item.grade) !== effectiveGrade) {
      return {
        success: false,
        error: 'GRADE_MISMATCH: Content item grade does not match student enrolled grade.',
        code: 400
      };
    }

    if (!this.tables.StudentCompletions) this.tables.StudentCompletions = [];
    const existing = this.tables.StudentCompletions.find(c => String(c.studentId) === String(student.id) && String(c.contentId) === String(contentId));

    if (existing) {
      const nextRes = await this.getNextContentItem({ studentId: student.id, contentType: canonicalType });
      return {
        success: true,
        alreadyCompleted: true,
        completionId: existing.id,
        coinsAwarded: 0,
        xpAwarded: 0,
        message: 'Content item already completed previously.',
        nextItem: nextRes.item,
        hasMore: nextRes.hasMore
      };
    }

    const coinsToAward = Math.max(0, parseInt(item.points, 10) || 20);
    const xpToAward = Math.max(0, parseInt(item.xp, 10) || 40);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const compId = `comp_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`;

    const completionRecord = {
      id: compId,
      studentId: student.id,
      contentType: canonicalType,
      contentId: item.id,
      grade: effectiveGrade,
      score: score !== undefined ? Number(score) : 100,
      maxScore: item.maxScore ? Number(item.maxScore) : 100,
      answersJson: typeof answers === 'string' ? answers : JSON.stringify(answers || {}),
      completedAt: now.toISOString()
    };
    this.tables.StudentCompletions.push(completionRecord);

    const newCoins = (Number(student.coins) || 0) + coinsToAward;
    const newXp = (Number(student.xp) || 0) + xpToAward;
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    let currentStreak = Number(student.streak) || 0;
    const lastLogin = student.lastLoginAt ? String(student.lastLoginAt).split('T')[0] : null;
    if (lastLogin !== todayStr) currentStreak += 1;
    if (currentStreak === 0) currentStreak = 1;

    student.coins = newCoins;
    student.xp = newXp;
    student.level = newLevel;
    student.streak = currentStreak;
    student.lastLoginAt = now.toISOString();

    if (canonicalType === 'CurriculumQuizzes' || canonicalType === 'DailyKnowledge') {
      await this.recordGrowthEvent({
        studentId: student.id,
        eventType: 'ACADEMIC_QUIZ',
        payload: { score: score !== undefined ? Number(score) : 100, totalQuestions: 1, accuracy: 100 }
      });
    } else if (canonicalType === 'EQScenarios') {
      await this.recordGrowthEvent({
        studentId: student.id,
        eventType: 'EQ_REFLECTION',
        payload: { score: 50, eqScore: 50 }
      });
    } else if (canonicalType === 'Stories') {
      await this.recordGrowthEvent({
        studentId: student.id,
        eventType: 'FOCUS_SPRINT',
        payload: { minutes: 15 }
      });
    }

    this._logActivity(
      student.id,
      'CONTENT_COMPLETED',
      `Completed ${canonicalType} '${item.title || item.id}'. Awarded ${coinsToAward} coins, ${xpToAward} XP.`,
      canonicalType
    );
    this.saveToStorage();

    const nextProgression = await this.getNextContentItem({ studentId: student.id, contentType: canonicalType });

    return {
      success: true,
      completionId: compId,
      coinsAwarded: coinsToAward,
      xpAwarded: xpToAward,
      newCoins,
      newXp,
      updatedWallet: {
        id: student.id,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        streak: currentStreak
      },
      nextItem: nextProgression.item,
      hasMore: nextProgression.hasMore
    };
  }

  async getContentByGrade({ studentId, contentType, targetGrade }) {
    if (!studentId) {
      return { success: false, error: 'INVALID_PAYLOAD: studentId is required.', code: 400 };
    }
    const canonicalType = this._canonicalizeContentType(contentType);
    if (!canonicalType || !this.tables[canonicalType]) {
      return {
        success: false,
        error: 'INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.',
        code: 400
      };
    }

    const student = this.tables.Users.find(u => String(u.id) === String(studentId) && String(u.role).toLowerCase() === 'student');
    if (!student) {
      return { success: false, error: 'STUDENT_NOT_FOUND: Specified studentId does not exist.', code: 404 };
    }

    const effectiveGrade = this._normalizeGrade(student.gradeClass) || 'Class 3';

    const activeItems = this.tables[canonicalType]
      .filter(item => {
        const itemGrade = this._normalizeGrade(item.grade);
        const isActive = String(item.isActive).toUpperCase() === 'TRUE' || item.isActive === true;
        return itemGrade === effectiveGrade && isActive;
      })
      .sort((a, b) => {
        const orderA = Number(a.orderIndex) || 0;
        const orderB = Number(b.orderIndex) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return String(a.id).localeCompare(String(b.id));
      });

    const completions = this.tables.StudentCompletions || [];
    const completedIds = new Set(
      completions
        .filter(c => String(c.studentId) === String(student.id) && this._canonicalizeContentType(c.contentType) === canonicalType)
        .map(c => String(c.contentId))
    );

    let completedCount = 0;
    const items = activeItems.map(item => {
      const formatted = this._formatContentItem(item, canonicalType);
      const isComp = completedIds.has(String(item.id));
      if (isComp) completedCount++;
      formatted.isCompleted = isComp;
      return formatted;
    });

    return {
      success: true,
      grade: effectiveGrade,
      items,
      totalCount: items.length,
      completedCount
    };
  }

  // -----------------------------------------------------------------------
  // Longitudinal Growth Profile Engine (R4)
  // -----------------------------------------------------------------------
  async recordGrowthEvent({ studentId, eventType, payload = {} }) {
    if (!studentId) {
      return { success: false, error: 'MISSING_STUDENT_ID: studentId is required.' };
    }
    const student = this.tables.Users.find(u => String(u.id) === String(studentId) && String(u.role).toLowerCase() === 'student');
    if (!student) {
      return { success: false, error: 'STUDENT_NOT_FOUND: Valid student record required.' };
    }

    if (!this.tables.StudentGrowthProfiles) this.tables.StudentGrowthProfiles = [];

    const now = new Date().toISOString();
    const today = (payload && payload.date) ? String(payload.date).substring(0, 10) : now.substring(0, 10);

    let profile = this.tables.StudentGrowthProfiles.find(p => String(p.studentId) === String(studentId) && String(p.date) === today);

    if (!profile) {
      profile = {
        id: `sgp_${studentId}_${today}`,
        studentId,
        date: today,
        focusMinutes: 0,
        habitRate: 0,
        academicScore: 0,
        eqScore: 0,
        milestonesJson: '[]',
        cognitiveMilestones: [],
        updatedAt: now
      };
      this.tables.StudentGrowthProfiles.push(profile);
    }

    let milestones = [];
    if (Array.isArray(profile.cognitiveMilestones)) {
      milestones = profile.cognitiveMilestones;
    } else if (profile.milestonesJson) {
      try { milestones = typeof profile.milestonesJson === 'string' ? JSON.parse(profile.milestonesJson) : profile.milestonesJson; } catch { milestones = []; }
    }
    if (!Array.isArray(milestones)) milestones = [];

    const type = String(eventType || '').toUpperCase();
    if (type === 'FOCUS_SPRINT' || type === 'FOCUS_COMPLETED') {
      const mins = Number(payload.minutes || payload.durationMins || payload.focusMinutes || 25);
      profile.focusMinutes = Math.max(0, Number(profile.focusMinutes || 0) + mins);
    } else if (type === 'QUEST_APPROVED' || type === 'HABIT_COMPLETED') {
      if (payload.adherenceRate !== undefined) {
        profile.habitRate = Math.min(100, Math.max(0, Math.round(Number(payload.adherenceRate))));
      } else {
        const totalHabits = this.tables.HabitsQuests.filter(h => h.parentUserId === student.linkedParentId && !h.isArchived).length;
        const approvedToday = this.tables.SubmissionsQueue.filter(s => s.studentId === studentId && s.status === 'APPROVED' && String(s.reviewedAt || '').startsWith(today)).length;
        profile.habitRate = totalHabits > 0 ? Math.min(100, Math.round((approvedToday / totalHabits) * 100)) : 100;
      }
    } else if (type === 'QUIZ_SUBMITTED' || type === 'ACADEMIC_QUIZ') {
      let acc = 0;
      if (payload.accuracy !== undefined) {
        acc = Number(payload.accuracy);
      } else if (payload.academicAccuracyScore !== undefined) {
        acc = Number(payload.academicAccuracyScore);
      } else if (payload.score !== undefined && payload.totalQuestions) {
        acc = Math.round((Number(payload.score) / Math.max(1, Number(payload.totalQuestions))) * 100);
      } else if (payload.score !== undefined) {
        acc = Number(payload.score);
      }
      acc = Math.min(100, Math.max(0, acc));
      const curScore = Number(profile.academicScore || profile.academicAccuracyScore || 0);
      profile.academicScore = curScore > 0 ? Math.round((curScore + acc) / 2) : acc;
    } else if (type === 'EQ_REFLECTION' || type === 'EQ_COMPLETED') {
      const score = Number(payload.score || payload.eqScore || 50);
      const curEq = Number(profile.eqScore || profile.eqReflectionsScore || 0);
      profile.eqScore = curEq > 0 ? Math.min(100, Math.round((curEq + score) / 2)) : Math.min(100, Math.max(0, score));
    }

    // Milestones check
    let allFocus = 0;
    let eqCount = 0;
    for (const p of this.tables.StudentGrowthProfiles.filter(p => String(p.studentId) === String(studentId))) {
      allFocus += Number(p.focusMinutes || 0);
      if (Number(p.eqScore || p.eqReflectionsScore || 0) > 0) eqCount++;
    }

    function checkMilestone(id, title, category) {
      if (!milestones.some(m => m.id === id)) {
        milestones.push({ id, title, category, unlockedAt: now });
      }
    }

    if (allFocus >= 25) checkMilestone('FOCUS_STARTER', 'First Focus Sprint (25m)', 'Focus');
    if (allFocus >= 100) checkMilestone('FOCUS_CENTURION', 'Centurion Focus (100m)', 'Focus');
    if (allFocus >= 300) checkMilestone('FOCUS_TITAN', 'Titan Focus (300m)', 'Focus');
    if (Number(profile.habitRate) >= 80) checkMilestone('HABIT_CONSISTENCY', 'Consistency Cadet (80%+ Habits)', 'Habits');
    if (Number(profile.academicScore) >= 90) checkMilestone('ACADEMIC_ACCURACY_PRO', 'Sharp Mind (90%+ Accuracy)', 'Academic');
    if (eqCount >= 1) checkMilestone('EQ_EMPATHY_EXPLORER', 'Empathy Explorer', 'EQ');

    profile.cognitiveMilestones = milestones;
    profile.milestonesJson = JSON.stringify(milestones);
    profile.updatedAt = now;

    this._logActivity(studentId, `GROWTH_EVENT_${type}`, `Growth event recorded: ${type}`, 'Growth');
    this.saveToStorage();

    return {
      success: true,
      studentId,
      date: today,
      updatedMetrics: {
        focusMinutes: Number(profile.focusMinutes),
        habitAdherenceRate: Number(profile.habitRate),
        academicAccuracyScore: Number(profile.academicScore),
        eqReflectionsScore: Number(profile.eqScore)
      },
      milestones,
      profile
    };
  }

  async getLongitudinalProfile({ studentId, parentUserId, timeRange = '30d' }) {
    if (!studentId) {
      return { success: false, error: 'MISSING_STUDENT_ID: studentId is required.' };
    }

    if (parentUserId) {
      try {
        this.assertParentPairing(parentUserId, studentId);
      } catch (err) {
        return { success: false, error: err.message, code: 403 };
      }
    }

    if (!this.tables.StudentGrowthProfiles) this.tables.StudentGrowthProfiles = [];

    const records = this.tables.StudentGrowthProfiles.filter(p => String(p.studentId) === String(studentId));
    const now = new Date();
    let daysLimit = 30;
    if (timeRange === '7d') daysLimit = 7;
    else if (timeRange === '14d') daysLimit = 14;
    else if (timeRange === '90d') daysLimit = 90;
    else if (timeRange === 'all') daysLimit = 3650;

    const cutoff = new Date(now.getTime() - (daysLimit * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10);
    const todayStr = now.toISOString().substring(0, 10);

    const filtered = records
      .filter(p => String(p.date) >= cutoff && String(p.date) <= todayStr)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    let totalFocusMinutes = 0;
    let habitSum = 0;
    let habitDays = 0;
    let academicSum = 0;
    let academicDays = 0;
    let eqOutcomesCount = 0;
    const milestoneMap = new Map();

    const historicalData = filtered.map(r => {
      const fMins = Number(r.focusMinutes) || 0;
      const hRate = Number(r.habitRate || r.habitAdherenceRate) || 0;
      const aScore = Number(r.academicScore || r.academicAccuracyScore) || 0;
      const eScore = Number(r.eqScore || r.eqReflectionsScore) || 0;

      totalFocusMinutes += fMins;
      if (hRate > 0) { habitSum += hRate; habitDays++; }
      if (aScore > 0) { academicSum += aScore; academicDays++; }
      if (eScore > 0) { eqOutcomesCount++; }

      const ms = Array.isArray(r.cognitiveMilestones) ? r.cognitiveMilestones : (r.milestonesJson ? JSON.parse(r.milestonesJson) : []);
      if (Array.isArray(ms)) {
        ms.forEach(m => {
          if (m && m.id && !milestoneMap.has(m.id)) {
            milestoneMap.set(m.id, m);
          }
        });
      }

      return {
        date: String(r.date),
        focusMinutes: fMins,
        habitRate: hRate,
        academicScore: aScore,
        eqScore: eScore
      };
    });

    const avgHabit = habitDays > 0 ? Math.round((habitSum / habitDays) * 10) / 10 : 0;
    const avgAcademic = academicDays > 0 ? Math.round((academicSum / academicDays) * 10) / 10 : 0;

    const summaryData = {
      totalFocusMinutes,
      focusMinutes: totalFocusMinutes,
      averageHabitAdherence: avgHabit,
      academicAccuracyRate: avgAcademic,
      eqOutcomesCount
    };

    const milestonesList = Array.from(milestoneMap.values());

    return {
      success: true,
      studentId,
      timeRange,
      summary: summaryData,
      historicalData,
      history: historicalData,
      milestones: milestonesList,
      profile: {
        studentId,
        timeRange,
        summary: summaryData,
        historicalData,
        history: historicalData,
        milestones: milestonesList
      }
    };
  }

  // -----------------------------------------------------------------------
  // Family Onboarding & Multi-Child Governance (R5)
  // -----------------------------------------------------------------------
  async signUpFamilyOnboarding({ parentData, childrenData }) {
    if (!parentData) {
      return { success: false, error: 'MISSING_PARENT_DATA: parentData is required.' };
    }
    if (!Array.isArray(childrenData) || childrenData.length === 0) {
      return { success: false, error: 'MISSING_CHILDREN_DATA: At least one child record is required.' };
    }

    const pFullName = String(parentData.fullName || '').trim();
    const pEmail = String(parentData.email || '').trim().toLowerCase();
    const pPin = String(parentData.pin || '').trim();
    const pPassword = String(parentData.password || '');

    if (!pFullName || !pEmail || !pPin || !pPassword) {
      return { success: false, error: 'MISSING_FIELDS: Parent fullName, email, pin, and password are required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pEmail)) {
      return { success: false, error: 'INVALID_EMAIL: Valid parent email address is required.' };
    }

    const existing = this.tables.Users.find(
      u => u.email && u.email.toLowerCase() === pEmail
    );
    if (existing) {
      return { success: false, error: 'EMAIL_ALREADY_EXISTS: An account with this email already exists.' };
    }

    if (String(pPin).length < 4 || !/^\d+$/.test(pPin)) {
      return { success: false, error: 'INVALID_PIN: Parent PIN must be at least 4 numeric digits.' };
    }
    if (pPassword.length < 6) {
      return { success: false, error: 'INVALID_PASSWORD: Password must be at least 6 characters.' };
    }

    // Validate all children
    for (let i = 0; i < childrenData.length; i++) {
      const c = childrenData[i];
      const cName = String(c.fullName || '').trim();
      const cPin = String(c.pin || '').trim();
      const cGrade = this._normalizeGrade(String(c.grade || c.gradeClass || ''));
      const cAge = Number(c.age);

      if (!cName) {
        return { success: false, error: `CHILD_NAME_REQUIRED: Child at index ${i} must have a fullName.` };
      }
      if (!cGrade) {
        return { success: false, error: `INVALID_GRADE: Grade for ${cName} must be Class 1 through Class 10.` };
      }
      if (isNaN(cAge) || cAge < 4 || cAge > 18) {
        return { success: false, error: `INVALID_AGE: Age for ${cName} must be between 4 and 18.` };
      }
      if (String(cPin).length < 4 || !/^\d+$/.test(cPin)) {
        return { success: false, error: `INVALID_PIN: PIN for ${cName} must be at least 4 numeric digits.` };
      }
    }

    let pairingCode = this._generatePairingCode();
    while (this.tables.Users.some(u => String(u.pairingCode).toUpperCase() === pairingCode.toUpperCase())) {
      pairingCode = this._generatePairingCode();
    }

    const now = new Date().toISOString();
    const today = now.substring(0, 10);
    const parentId = this._generateId('usr_p');

    const parentUser = {
      id: parentId,
      role: 'parent',
      fullName: pFullName,
      email: pEmail,
      pinHash: this._hash(pPin),
      passwordHash: this._hash(pPassword),
      pairingCode,
      linkedParentId: '',
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: now,
      lastLoginAt: now,
      gradeClass: '',
      age: null,
      parentalPermissions: {}
    };
    this.tables.Users.push(parentUser);

    const provisionedChildren = [];
    for (let j = 0; j < childrenData.length; j++) {
      const child = childrenData[j];
      const studentId = this._generateId('usr_s');
      const normGrade = this._normalizeGrade(String(child.grade || child.gradeClass));
      const defaultPerms = {
        screenTimeLimitMins: 60,
        focusSprintTarget: 25,
        dailyQuizGoal: 10,
        bedtimeHour: 21,
        allowRewardRedemptions: true
      };
      const mergedPerms = Object.assign({}, defaultPerms, child.permissions || child.parentalPermissions || {});

      const childUser = {
        id: studentId,
        role: 'student',
        fullName: String(child.fullName).trim(),
        email: '',
        pinHash: this._hash(child.pin),
        passwordHash: '',
        pairingCode,
        linkedParentId: parentId,
        coins: 100,
        xp: 200,
        level: 1,
        streak: 0,
        createdAt: now,
        lastLoginAt: now,
        gradeClass: normGrade,
        age: Number(child.age),
        parentalPermissions: mergedPerms
      };
      this.tables.Users.push(childUser);
      provisionedChildren.push(childUser);

      // Baseline growth profile
      if (!this.tables.StudentGrowthProfiles) this.tables.StudentGrowthProfiles = [];
      this.tables.StudentGrowthProfiles.push({
        id: `sgp_${studentId}_${today}`,
        studentId,
        date: today,
        focusMinutes: 0,
        habitRate: 100,
        academicScore: 100,
        eqScore: 0,
        cognitiveMilestones: [{
          id: 'ENROLLED',
          title: 'Enrolled in Zoptro Mission Control',
          category: 'Onboarding',
          unlockedAt: now
        }],
        milestonesJson: JSON.stringify([{
          id: 'ENROLLED',
          title: 'Enrolled in Zoptro Mission Control',
          category: 'Onboarding',
          unlockedAt: now
        }]),
        updatedAt: now
      });
    }

    // Default habits seeded for this parent
    const seedHabits = [
      { title: 'Neat Uniform & Shoes Placed After School', category: 'Routine', points: 15, xp: 30, icon: '👟' },
      { title: 'Lunch Box & Bottle in Kitchen Sink', category: 'Responsibility', points: 15, xp: 30, icon: '🍱' },
      { title: 'Daily Study Block: Homework Finished', category: 'Academic', points: 25, xp: 50, icon: '📝' },
      { title: 'Daily GK Arena: 20 Questions Solved', category: 'Learning', points: 20, xp: 40, icon: '🌍' }
    ];
    for (const h of seedHabits) {
      this.tables.HabitsQuests.push({
        id: this._generateId('hbt'),
        parentUserId: parentId,
        title: h.title,
        category: h.category,
        points: h.points,
        xp: h.xp,
        timeSlot: 'Daily',
        icon: h.icon,
        isArchived: false,
        createdAt: now
      });
    }

    this._logActivity(parentId, 'FAMILY_ONBOARDING', `Onboarded parent ${pFullName} with ${provisionedChildren.length} children`, 'Auth');
    this.saveToStorage();

    const safeParent = { ...parentUser };
    delete safeParent.pinHash;
    delete safeParent.passwordHash;

    const safeChildren = provisionedChildren.map(c => {
      const copy = { ...c };
      delete copy.pinHash;
      delete copy.passwordHash;
      return copy;
    });

    return {
      success: true,
      parent: safeParent,
      pairingCode,
      token: `tok_${parentId}_${Date.now()}`,
      children: safeChildren
    };
  }

  async updateChildGovernance({ parentUserId, studentId, updates = {} }) {
    if (!parentUserId) {
      return { success: false, error: 'UNAUTHORIZED: Parent governance required.' };
    }
    let pairing;
    try {
      pairing = this.assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message, code: 403 };
    }
    const student = pairing.student;

    if (updates.fullName !== undefined) {
      const name = String(updates.fullName).trim();
      if (!name) return { success: false, error: 'INVALID_NAME: Child fullName cannot be empty.' };
      student.fullName = name;
    }

    if (updates.age !== undefined) {
      const age = Number(updates.age);
      if (isNaN(age) || age < 4 || age > 18) {
        return { success: false, error: 'INVALID_AGE: Child age must be between 4 and 18.' };
      }
      student.age = age;
    }

    if (updates.grade !== undefined || updates.gradeClass !== undefined) {
      const rawGrade = updates.grade !== undefined ? updates.grade : updates.gradeClass;
      const normGrade = this._normalizeGrade(String(rawGrade));
      if (!normGrade) {
        return { success: false, error: 'INVALID_GRADE: Grade must be Class 1 through Class 10.' };
      }
      if (normGrade !== student.gradeClass) {
        this._logActivity(parentUserId, 'GRADE_PROMOTION', `Promoted ${student.fullName} from ${student.gradeClass} to ${normGrade}`, 'Governance');
      }
      student.gradeClass = normGrade;
    }

    if (updates.newPin) {
      const pin = String(updates.newPin).trim();
      if (pin.length < 4 || !/^\d+$/.test(pin)) {
        return { success: false, error: 'INVALID_PIN: Student PIN must be at least 4 numeric digits.' };
      }
      student.pinHash = this._hash(pin);
    }

    if (updates.permissions !== undefined || updates.parentalPermissions !== undefined) {
      const perms = updates.permissions || updates.parentalPermissions;
      student.parentalPermissions = Object.assign({}, student.parentalPermissions || {}, perms);
    }

    this._logActivity(parentUserId, 'CHILD_GOVERNANCE_UPDATE', `Updated governance settings for student ${student.fullName}`, 'Governance');
    this.saveToStorage();

    const safeChild = { ...student };
    delete safeChild.pinHash;
    delete safeChild.passwordHash;

    return {
      success: true,
      studentId,
      updatedChild: safeChild,
      student: safeChild,
      child: safeChild
    };
  }

  seedDefaultContent() {
    const now = new Date().toISOString();
    // Default admin if missing
    if (!this.tables.Users.some(u => u.role === 'admin')) {
      this.tables.Users.push({
        id: 'u_adm_demo',
        role: 'admin',
        fullName: 'Super Admin',
        email: 'admin@zoptro.local',
        pinHash: this._hash('9999'),
        passwordHash: this._hash('admin123'),
        pairingCode: 'ZOPADM',
        linkedParentId: '',
        coins: 0,
        xp: 0,
        level: 1,
        streak: 0,
        createdAt: now,
        lastLoginAt: now,
        gradeClass: '',
        age: null,
        parentalPermissions: {}
      });
    }

    // Default student if missing
    let student = this.tables.Users.find(u => u.id === 'u_stu_demo');
    if (!student) {
      student = {
        id: 'u_stu_demo',
        role: 'student',
        fullName: 'Commander Divyank',
        email: '',
        pinHash: this._hash('4321'),
        passwordHash: '',
        pairingCode: 'ZOP360',
        linkedParentId: 'u_par_demo',
        coins: 340,
        xp: 680,
        level: 3,
        streak: 5,
        createdAt: now,
        lastLoginAt: now,
        gradeClass: 'Class 3',
        age: 8,
        parentalPermissions: {}
      };
      this.tables.Users.push(student);
    } else {
      if (!student.gradeClass) student.gradeClass = 'Class 3';
    }

    // Seed sample stories across Class 1 to 10
    const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    grades.forEach((g, idx) => {
      const storyId = `story_c${idx + 1}_1`;
      if (!this.tables.Stories.some(s => s.id === storyId)) {
        this.tables.Stories.push({
          id: storyId,
          grade: g,
          title: g === 'Class 3' ? "The Emperor's Honest Seeds" : `Adventure of ${g}`,
          genre: 'Integrity & Moral Courage',
          content: `Inspirational curriculum story for ${g}.`,
          moralLesson: 'Honesty requires more courage than victory.',
          orderIndex: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now
        });
      }
      const qId = `sq_c${idx + 1}_1`;
      if (!this.tables.StoryQuestions.some(q => q.id === qId)) {
        this.tables.StoryQuestions.push({
          id: qId,
          storyId: storyId,
          questionText: `Comprehension question for ${g}?`,
          optionsJson: JSON.stringify(['Option A', 'Option B (Correct)', 'Option C', 'Option D']),
          correctOptionIndex: 1,
          explanation: 'Option B is correct based on the story.',
          orderIndex: 1,
          createdAt: now
        });
      }
      const eqId = `eq_c${idx + 1}_1`;
      if (!this.tables.EQScenarios.some(e => e.id === eqId)) {
        this.tables.EQScenarios.push({
          id: eqId,
          grade: g,
          title: g === 'Class 3' ? 'The Broken Heirloom' : `EQ Dilemma for ${g}`,
          category: 'Integrity',
          scenarioText: `A challenging character situation for ${g}.`,
          optionsJson: JSON.stringify(['Blame someone', 'Act honestly with courage and kindness', 'Ignore']),
          recommendedOptionIndex: 1,
          reflectionPrompt: 'Courage with kindness resolves dilemmas.',
          orderIndex: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now
        });
      }
      const dkId = `dk_c${idx + 1}_1`;
      if (!this.tables.DailyKnowledge.some(d => d.id === dkId)) {
        this.tables.DailyKnowledge.push({
          id: dkId,
          grade: g,
          domain: 'National',
          topic: 'General Knowledge',
          questionText: `What is a key national symbol relevant to ${g}?`,
          optionsJson: JSON.stringify(['Option 1', 'Royal Bengal Tiger', 'Option 3', 'Option 4']),
          correctOptionIndex: 1,
          didYouKnowFact: 'Bengal tigers are protected under Project Tiger.',
          orderIndex: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now
        });
      }
      const quizId = `quiz_c${idx + 1}_1`;
      if (!this.tables.CurriculumQuizzes.some(q => q.id === quizId)) {
        this.tables.CurriculumQuizzes.push({
          id: quizId,
          grade: g,
          subject: 'Mathematics',
          examCategory: 'IMO',
          title: `Olympiad Math Quiz ${g}`,
          questionText: `Calculate mathematical question for ${g}: What is 12 x 8?`,
          optionsJson: JSON.stringify(['84', '96', '108', '92']),
          correctOptionIndex: 1,
          hint: '12 x 8 = 96.',
          explanation: '12 times 8 is 96.',
          orderIndex: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now
        });
      }
    });

    if (this.storage) this.saveToStorage();
    return { success: true, message: 'Default content seeded successfully.' };
  }
}

module.exports = {
  ZoptroContractOracle
};

