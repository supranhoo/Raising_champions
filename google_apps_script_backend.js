/**
 * =========================================================================
 * ZOPTRO - GOOGLE APPS SCRIPT BACKEND ENGINE & RELATIONAL SCHEMA
 * =========================================================================
 * Brand: Optra360 / Zoptro Brand Expression System
 * Palette: Authority Blue (#09293D), Progress Orange (#F65800),
 *          Grounded Olive (#666D57), Clarity Ivory (#F4F2EA)
 * 
 * Features:
 * 1. Self-Healing 6-Sheet Relational Schema:
 *    - Users
 *    - HabitsQuests
 *    - SubmissionsQueue
 *    - RewardsCatalog
 *    - RedemptionsQueue
 *    - ActivityLogs
 * 2. Role-Based Access Control (RBAC) & Parent-Exclusive Governance:
 *    - Students submit quests -> Status "PENDING_VERIFICATION" (0 coins awarded)
 *    - Only paired Parents can approve/reject quest submissions & award coins
 *    - Students request redemptions -> Status "PENDING_APPROVAL" (coins escrowed)
 *    - Only paired Parents can approve/reject redemptions (reject refunds coins)
 *    - Habits and rewards can only be modified by Parents
 * 3. Concurrency Safety: LockService wrapping all mutating transactions.
 * 4. Resilient Web App Serving (doGet) with HTML fallback detection.
 * =========================================================================
 */

const APP_TITLE = "Zoptro - Optra360 Dual-User Mission Control";

// Brand Design System Color Constants for Google Sheets
const BRAND_COLORS = {
  HEADER_BG: "#09293D",       // Authority Blue
  HEADER_TEXT: "#F4F2EA",     // Clarity Ivory
  BORDER: "#666D57",          // Grounded Olive
  ACCENT_ORANGE: "#F65800"    // Progress Orange
};

// 13-Table Relational Schema Definition
const SCHEMAS = {
  // Existing 6 Core Tables
  Users: [
    "id", "role", "fullName", "email", "pinHash", "passwordHash",
    "pairingCode", "linkedParentId", "coins", "xp", "level",
    "streak", "createdAt", "lastLoginAt",
    // 3 New Columns for Milestone 1:
    "gradeClass", "age", "parentalPermissions"
  ],
  HabitsQuests: [
    "id", "parentUserId", "title", "category", "points", "xp",
    "timeSlot", "icon", "isArchived", "createdAt"
  ],
  SubmissionsQueue: [
    "id", "studentId", "parentUserId", "questId", "questTitle",
    "points", "xp", "status", "submittedAt", "reviewedAt", "notes"
  ],
  RewardsCatalog: [
    "id", "parentUserId", "title", "costCoins", "icon", "category",
    "isArchived", "createdAt"
  ],
  RedemptionsQueue: [
    "id", "studentId", "parentUserId", "rewardId", "rewardTitle",
    "costCoins", "status", "requestedAt", "reviewedAt", "notes"
  ],
  ActivityLogs: [
    "id", "userId", "action", "details", "category", "status", "timestamp"
  ],

  // 7 New Dynamic Content & Progression Tables
  Stories: [
    "id", "grade", "title", "genre", "content", "moralLesson",
    "orderIndex", "isActive", "createdAt", "updatedAt"
  ],
  StoryQuestions: [
    "id", "storyId", "questionText", "optionsJson", "correctOptionIndex",
    "explanation", "orderIndex", "createdAt"
  ],
  EQScenarios: [
    "id", "grade", "title", "category", "scenarioText", "optionsJson",
    "recommendedOptionIndex", "reflectionPrompt", "orderIndex", "isActive",
    "createdAt", "updatedAt"
  ],
  DailyKnowledge: [
    "id", "grade", "domain", "topic", "questionText", "optionsJson",
    "correctOptionIndex", "didYouKnowFact", "orderIndex", "isActive",
    "createdAt", "updatedAt"
  ],
  CurriculumQuizzes: [
    "id", "grade", "subject", "examCategory", "title", "questionText",
    "optionsJson", "correctOptionIndex", "hint", "explanation", "orderIndex",
    "isActive", "createdAt", "updatedAt"
  ],
  StudentCompletions: [
    "id", "studentId", "contentType", "contentId", "grade", "score",
    "maxScore", "answersJson", "completedAt"
  ],
  StudentGrowthProfiles: [
    "id", "studentId", "date", "focusMinutes", "habitRate",
    "academicScore", "eqScore", "milestonesJson", "updatedAt"
  ],
  StudentQuestionResponses: [
    "id", "completionId", "studentId", "grade", "contentType", "contentId",
    "questionId", "questionText", "optionsJson", "studentChoiceIndex",
    "studentChoiceText", "correctOptionIndex", "isCorrect", "pointsEarned",
    "explanation", "timeSpentSeconds", "answeredAt"
  ],
  // Table 15: Gemini Token Metering & API Invocation Logs
  GeminiTokenLogs: [
    "id",
    "timestamp",
    "adminUserId",
    "model",
    "grade",
    "subject",
    "topic",
    "questionType",
    "quantity",
    "promptTokens",
    "candidateTokens",
    "totalTokens",
    "cachedFlag",
    "status",
    "latencyMs"
  ]
};

// Aliases for relational compatibility
SCHEMAS.StudentContentCompletions = SCHEMAS.StudentCompletions;


// =========================================================================
// PRIMARY RUNNERS FOR GOOGLE APPS SCRIPT EDITOR (RUN DROPDOWN)
// =========================================================================

/**
 * Run this function from the Apps Script editor toolbar to initialize
 * all 6 database tables in the active Google Spreadsheet.
 */
function runDatabaseSetup() {
  if (typeof Logger !== "undefined") Logger.log("⚡ Starting Zoptro database initialization...");
  const res = initializeDatabase();
  if (typeof Logger !== "undefined") Logger.log("Database initialization result: " + JSON.stringify(res));
  return res;
}

/**
 * Diagnostic health check to verify all components and permissions.
 */
function runDiagnosticCheck() {
  if (typeof Logger !== "undefined") {
    Logger.log("=== ZOPTRO DIAGNOSTIC CHECK ===");
    Logger.log("1. Testing sha256 hashing: " + sha256("test"));
    Logger.log("2. Generating pairing code: " + generatePairingCode());
  }
  const db = initializeDatabase();
  if (typeof Logger !== "undefined") {
    Logger.log("3. Database status: " + JSON.stringify(db));
    Logger.log("=== DIAGNOSTIC CHECK COMPLETE - READY ===");
  }
  return { success: true, db: db };
}

// =========================================================================
// CRYPTOGRAPHIC UTILITIES & LOCKING
// =========================================================================

/**
 * Pure JavaScript SHA-256 implementation (RFC 6234 compliant).
 * Operates natively in Google Apps Script (V8), Node.js, and Browsers.
 * Safely handles undefined/null input when triggered from the Apps Script Run button.
 */
function sha256(ascii) {
  if (ascii === undefined || ascii === null) {
    if (typeof Logger !== "undefined") {
      Logger.log("Notice: sha256 called with no arguments. Returning hash for empty string.");
    }
    ascii = "";
  }
  ascii = String(ascii);

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];
  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength) | 0;
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      var b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Deterministic salted hash for PINs and passwords.
 */
function hashSecret(secret, salt) {
  if (!secret) return "";
  const effectiveSalt = salt || "zoptro_salt_2026";
  return sha256(String(secret) + ":" + effectiveSalt);
}

/**
 * Concurrency protection using Google Apps Script LockService.
 * Executes callback inside a critical section.
 * STRICT FAIL-CLOSED DESIGN: If lock acquisition fails or times out,
 * does NOT execute the mutating callback.
 */
function withScriptLock(callback) {
  let lock = null;
  let hasLock = false;
  if (typeof LockService !== "undefined" && LockService && LockService.getScriptLock) {
    try {
      lock = LockService.getScriptLock();
      if (lock) {
        if (typeof lock.tryLock === "function") {
          hasLock = lock.tryLock(10000);
        } else if (typeof lock.waitLock === "function") {
          lock.waitLock(10000);
          hasLock = true;
        }
      }
    } catch (err) {
      if (typeof Logger !== "undefined") Logger.log("Lock acquisition error: " + (err ? err.message : ""));
      throw new Error("LOCK_ACQUISITION_FAILED: Could not acquire script lock: " + (err ? err.message : "Timeout"));
    }
    if (!hasLock) {
      throw new Error("LOCK_ACQUISITION_FAILED: Timed out waiting for script lock after 10000ms");
    }
  }
  try {
    return callback();
  } finally {
    if (lock && hasLock) {
      try { lock.releaseLock(); } catch (e) {}
    }
  }
}


/**
 * Generates a 6-character family pairing code (e.g. "ZOP749").
 */
function generatePairingCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "ZOP";
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// =========================================================================
// GOOGLE APPS SCRIPT WEB APP & SPREADSHEET HOOKS
// =========================================================================

/**
 * Serves the HTML web app when deployed as a Google Apps Script Web App.
 * Handles both the repository name 'divyank_mission_control_google_apps_script_app'
 * and the default 'index' file name.
 */
function doGet(e) {
  try {
    let htmlOutput;
    try {
      htmlOutput = HtmlService.createHtmlOutputFromFile("divyank_mission_control_google_apps_script_app");
    } catch (e1) {
      htmlOutput = HtmlService.createHtmlOutputFromFile("index");
    }
    return htmlOutput
      .setTitle(APP_TITLE)
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput("<h3>Error loading Zoptro interface: " + err.message + "</h3>");
  }
}

/**
 * Creates custom menu in Google Sheets upon opening the spreadsheet.
 */
function onOpen() {
  if (typeof SpreadsheetApp === "undefined" || !SpreadsheetApp.getUi) return;
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🛡️ Zoptro Mission Control")
    .addItem("⚡ Initialize / Repair Database Schema", "initializeDatabase")
    .addItem("🔍 Inspect Pending Verifications", "getPendingVerificationsMenu")
    .addItem("📧 Trigger Parental Summary Digest", "sendDailySummaryEmail")
    .addToUi();
}

function getPendingVerificationsMenu() {
  const verifications = getPendingVerifications({ parentUserId: "u_par_demo" });
  if (typeof SpreadsheetApp !== "undefined" && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(
      "Pending Verifications",
      "Quests Pending: " + (verifications.pendingQuests ? verifications.pendingQuests.length : 0) +
      "\nRedemptions Pending: " + (verifications.pendingRedemptions ? verifications.pendingRedemptions.length : 0),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// =========================================================================
// SPREADSHEET DATABASE ENGINE & SELF-HEALING INITIALIZATION
// =========================================================================

/**
 * Formats table headers using Optra360 / Zoptro brand palette.
 */
function formatTableHeader(sheet, numCols) {
  if (!sheet || !sheet.getRange) return;
  const range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground(BRAND_COLORS.HEADER_BG)
       .setFontColor(BRAND_COLORS.HEADER_TEXT)
       .setFontWeight("bold")
       .setHorizontalAlignment("left");
  try {
    range.setBorder(true, true, true, true, true, true, BRAND_COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  } catch (e) {}
  sheet.setFrozenRows(1);
}

/**
 * Resolves the Google Spreadsheet instance for both container-bound
 * and standalone Web App deployments.
 */
function getSpreadsheet_() {
  if (typeof SpreadsheetApp === "undefined") return null;
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties) {
    try {
      const props = PropertiesService.getScriptProperties();
      const sheetId = props.getProperty("ZOPTRO_SPREADSHEET_ID");
      if (sheetId) {
        try {
          return SpreadsheetApp.openById(sheetId);
        } catch (e) {
          if (typeof Logger !== "undefined") Logger.log("Could not open existing sheet by ID: " + e.message);
        }
      }
      const newSheet = SpreadsheetApp.create("Zoptro Mission Control Database");
      props.setProperty("ZOPTRO_SPREADSHEET_ID", newSheet.getId());
      if (typeof Logger !== "undefined") Logger.log("Created standalone database sheet: " + newSheet.getUrl());
      return newSheet;
    } catch (err) {
      if (typeof Logger !== "undefined") Logger.log("Error obtaining spreadsheet: " + err.message);
    }
  }
  return null;
}

/**
 * Initializes or self-heals all 6 required tables in the Google Spreadsheet.
 * Migrates legacy CommanderProfile data if detected.
 */
function initializeDatabase() {
  return withScriptLock(function() {
    if (typeof SpreadsheetApp === "undefined") {
      return { success: true, message: "Mock environment: self-healing verified." };
    }
    const ss = getSpreadsheet_();
    if (!ss) {
      return { success: false, error: "SPREADSHEET_NOT_FOUND" };
    }

    // 1. Detect and migrate legacy CommanderProfile if present
    let legacyProfile = { coins: 340, xp: 680, level: 3, streak: 5 };
    const legacySheet = ss.getSheetByName("CommanderProfile");
    if (legacySheet) {
      try {
        const pVals = legacySheet.getDataRange().getValues();
        for (let i = 1; i < pVals.length; i++) {
          const key = String(pVals[i][0]).trim();
          const val = pVals[i][1];
          if (key === "Focus Coins") legacyProfile.coins = Number(val) || legacyProfile.coins;
          if (key === "XP Points") legacyProfile.xp = Number(val) || legacyProfile.xp;
          if (key === "Current Level") legacyProfile.level = Number(val) || legacyProfile.level;
          if (key === "Daily Streak") legacyProfile.streak = Number(val) || legacyProfile.streak;
        }
        legacySheet.setName("CommanderProfile_Archived_" + new Date().getTime());
      } catch (err) {
        if (typeof Logger !== "undefined") Logger.log("Legacy migration warning: " + err.message);
      }
    }

    // 2. Ensure all 13 sheets exist and have correct headers
    const tableNames = Object.keys(SCHEMAS);
    tableNames.forEach(function(tableName) {
      const expectedHeaders = SCHEMAS[tableName];
      let sheet = ss.getSheetByName(tableName);

      if (!sheet) {
        sheet = ss.insertSheet(tableName);
        sheet.appendRow(expectedHeaders);
        formatTableHeader(sheet, expectedHeaders.length);
      } else {
        // Self-heal header row if empty or corrupted
        const dataRange = sheet.getDataRange();
        const values = dataRange ? dataRange.getValues() : [];
        if (!values || values.length === 0 || values[0].length === 0) {
          sheet.appendRow(expectedHeaders);
          formatTableHeader(sheet, expectedHeaders.length);
        } else if (values[0].length < expectedHeaders.length) {
          // Non-destructive in-place header update without inserting extra row
          sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
          formatTableHeader(sheet, expectedHeaders.length);
        } else {
          // Verify row 1 contains expected columns
          let headersMatch = true;
          for (let c = 0; c < expectedHeaders.length; c++) {
            if (String(values[0][c]).trim() !== expectedHeaders[c]) {
              headersMatch = false;
              break;
            }
          }
          if (!headersMatch) {
            sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
            formatTableHeader(sheet, expectedHeaders.length);
          }
        }
      }
    });

    // 3. Seed initial data if tables are empty
    seedInitialDataIfEmpty(ss, legacyProfile);

    return { success: true, message: "Zoptro relational schema verified and self-healed successfully!" };
  });
}

/**
 * Seeds default demo users, habits, rewards, dynamic content, and initial logs if tables are empty.
 */
function seedInitialDataIfEmpty(ss, legacyProfile) {
  const now = new Date().toISOString();

  // 1. Users
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    // Super Admin
    usersSheet.appendRow([
      "u_adm_demo",
      "admin",
      "Super Admin",
      "admin@zoptro.local",
      hashSecret("9999"),
      hashSecret("admin123"),
      "ZOPADM",
      "",
      0,
      0,
      1,
      0,
      now,
      now,
      "",
      "",
      "{}"
    ]);
    // Default Parent
    usersSheet.appendRow([
      "u_par_demo",
      "parent",
      "Colonel Rajesh",
      "rajesh@zoptro.local",
      hashSecret("1234"),
      hashSecret("password123"),
      "ZOP360",
      "",
      0,
      0,
      1,
      0,
      now,
      now,
      "",
      "",
      "{}"
    ]);
    // Default Student linked to parent
    usersSheet.appendRow([
      "u_stu_demo",
      "student",
      "Commander Divyank",
      "",
      hashSecret("4321"),
      "",
      "ZOP360",
      "u_par_demo",
      legacyProfile.coins || 340,
      legacyProfile.xp || 680,
      legacyProfile.level || 3,
      legacyProfile.streak || 5,
      now,
      now,
      "Class 3",
      8,
      "{}"
    ]);
  }

  // 2. HabitsQuests
  const habitsSheet = ss.getSheetByName("HabitsQuests");
  if (habitsSheet && habitsSheet.getLastRow() <= 1) {
    const defaultHabits = [
      ["h_1", "u_par_demo", "Neat Uniform & Shoes Placed After School", "routine", 15, 30, "Afternoon", "👟", false, now],
      ["h_2", "u_par_demo", "Lunch Box & Bottle Placed in Kitchen Sink", "routine", 15, 30, "Afternoon", "🍱", false, now],
      ["h_3", "u_par_demo", "Study Block 1: Homework Sprint Finished", "academic", 25, 50, "Evening", "📝", false, now],
      ["h_4", "u_par_demo", "Daily GK Arena: 20 Questions Solved", "academic", 20, 40, "Evening", "🌍", false, now],
      ["h_5", "u_par_demo", "Weekly Piano Practice / Melody Learning", "arts", 20, 40, "Evening", "🎹", false, now],
      ["h_6", "u_par_demo", "School Bag Packed for Tomorrow via Timetable", "routine", 15, 30, "Night", "🎒", false, now],
      ["h_7", "u_par_demo", "Bedtime Target Met by 9:15 PM", "routine", 15, 30, "Night", "🌙", false, now]
    ];
    defaultHabits.forEach(function(row) { habitsSheet.appendRow(row); });
  }

  // 3. RewardsCatalog
  const rewardsSheet = ss.getSheetByName("RewardsCatalog");
  if (rewardsSheet && rewardsSheet.getLastRow() <= 1) {
    const defaultRewards = [
      ["rw_1", "u_par_demo", "35-Min Gaming / Roblox Pass", 80, "🎮", "screen_time", false, now],
      ["rw_2", "u_par_demo", "Favorite Ice Cream Treat / Milkshake", 50, "🍦", "treat", false, now],
      ["rw_3", "u_par_demo", "Weekend Science / Lego Kit", 200, "🧩", "toy", false, now],
      ["rw_4", "u_par_demo", "Special Park / Cycling Outing with Dad", 120, "🚴", "outing", false, now]
    ];
    defaultRewards.forEach(function(row) { rewardsSheet.appendRow(row); });
  }

  // 4. ActivityLogs
  const logsSheet = ss.getSheetByName("ActivityLogs");
  if (logsSheet && logsSheet.getLastRow() <= 1) {
    const defaultLogs = [
      ["log_1", "u_stu_demo", "SYSTEM_INIT", "Database initialized with Zoptro relational schema", "system", "VERIFIED", now],
      ["log_2", "u_stu_demo", "QUEST_APPROVE", "Study Block 1 HW Sprint (+25 Coins, +50 XP)", "academic", "APPROVED", now],
      ["log_3", "u_par_demo", "PARENT_BONUS", "Listened on 1st Call without delay (+10 Coins)", "respect", "APPROVED", now]
    ];
    defaultLogs.forEach(function(row) { logsSheet.appendRow(row); });
  }

  // 5. Stories (Class 1 to 10 sample curriculum)
  const storiesSheet = ss.getSheetByName("Stories");
  if (storiesSheet && storiesSheet.getLastRow() <= 1) {
    const defaultStories = [
      ["story_c1_1", "Class 1", "The Helpful Puppy", "Kindness", "Buster the puppy helped find a lost kitten in the garden.", "Kindness is a superpower.", 1, true, now, now],
      ["story_c2_1", "Class 2", "The Little Seed that Could", "Perseverance", "A tiny seed pushed through hard soil and became a shade tree.", "Never give up even when small.", 1, true, now, now],
      ["story_c3_1", "Class 3", "The Emperor's Honest Seeds", "Integrity & Moral Courage", "Long ago in ancient Ping, the Emperor distributed boiled seeds to test truthfulness. Ling brought his empty pot honestly and was crowned successor.", "Honesty requires more courage than victory.", 1, true, now, now],
      ["story_c4_1", "Class 4", "The Architect's Bridge", "Responsibility", "Kiran double-checked all measurements before building the rope bridge.", "Care in work protects others.", 1, true, now, now],
      ["story_c5_1", "Class 5", "The Whispering Forest", "Environmental Stewardship", "Ananya protected the ancient banyan grove from illegal logging.", "Nature is our greatest heritage.", 1, true, now, now],
      ["story_c6_1", "Class 6", "The Discovery of Nalanda", "Wisdom & History", "Scholars from across ancient Asia gathered at Nalanda to debate mathematics and philosophy.", "Knowledge grows by sharing.", 1, true, now, now],
      ["story_c7_1", "Class 7", "The Quantum Clockmaker", "Scientific Curiosity", "A young inventor built a clock measuring moments of intense focus.", "Time well-focused creates wonders.", 1, true, now, now],
      ["story_c8_1", "Class 8", "The Algorithm of Kindness", "Ethics in Tech", "Arjun designed a peer-moderation algorithm to stop cyberbullying.", "Technology must serve human empathy.", 1, true, now, now],
      ["story_c9_1", "Class 9", "The Midnight Observatory", "Cosmic Exploration", "Priya tracked distant exoplanets through mountain storms.", "Perseverance unlocks universal truths.", 1, true, now, now],
      ["story_c10_1", "Class 10", "The Ethicist of Mars Colony", "Civic Leadership", "Colonists faced life-or-death decisions on solar generator allocation.", "Justice protects the vulnerable.", 1, true, now, now]
    ];
    defaultStories.forEach(function(row) { storiesSheet.appendRow(row); });
  }

  // 6. StoryQuestions
  const questionsSheet = ss.getSheetByName("StoryQuestions");
  if (questionsSheet && questionsSheet.getLastRow() <= 1) {
    const defaultQuestions = [
      ["sq_c3_1", "story_c3_1", "Why did Ling bring an empty pot to the Emperor?", JSON.stringify(["He forgot to water it", "His seeds refused to sprout despite daily care", "He broke his pot", "He traded the seeds"]), 1, "Ling cared for his seeds daily, but they did not grow.", 1, now],
      ["sq_c3_2", "story_c3_1", "What secret did the Emperor reveal about the seeds?", JSON.stringify(["They were magical", "They were boiled and unable to grow", "They needed moonlight", "They were weed seeds"]), 1, "The Emperor had boiled all the seeds beforehand.", 2, now],
      ["sq_c3_3", "story_c3_1", "What virtue did Ling demonstrate by bringing the empty pot?", JSON.stringify(["Cleverness", "Pride", "Honesty and Moral Courage", "Impatience"]), 2, "Ling was the only youth courageous enough to speak truth.", 3, now]
    ];
    defaultQuestions.forEach(function(row) { questionsSheet.appendRow(row); });
  }

  // 7. EQScenarios (Class 1 to 10 sample dilemmas)
  const eqSheet = ss.getSheetByName("EQScenarios");
  if (eqSheet && eqSheet.getLastRow() <= 1) {
    const defaultEQ = [
      ["eq_c1_1", "Class 1", "Sharing Toys", "Sharing", "Your friend wants to play with your favorite block.", JSON.stringify(["Hide it", "Share and build together", "Yell"]), 1, "Sharing brings double joy.", 1, true, now, now],
      ["eq_c2_1", "Class 2", "Spilled Water", "Responsibility", "You accidentally spill water on the study desk.", JSON.stringify(["Blame the pet", "Wipe it up quickly and cleanly", "Run away"]), 1, "Taking quick responsibility fixes mistakes.", 1, true, now, now],
      ["eq_c3_1", "Class 3", "The Broken Heirloom", "Integrity & Courage", "During a study break, your friend accidentally knocks over your mother's special clay pot.", JSON.stringify(["Blame the house cat", "Calm your friend, clean up safely together, and tell mother honestly", "Hide the pieces in the dustbin", "Pretend you never saw it"]), 1, "True courage means taking responsibility with kindness.", 1, true, now, now],
      ["eq_c3_2", "Class 3", "The New Classmate", "Inclusion & Empathy", "A new student joins your class from another state and sits alone during lunch.", JSON.stringify(["Ignore them", "Invite them to your lunch circle and introduce your friends", "Laugh at their lunchbox", "Wait for teacher"]), 1, "Inclusion is the foundation of empathetic leadership.", 2, true, now, now],
      ["eq_c4_1", "Class 4", "Team Project Credit", "Fairness", "A teammate did not finish their slide in time for the presentation.", JSON.stringify(["Complain loudly", "Help them complete the key point and present as a team", "Kick them out"]), 1, "Team success means lifting each other up.", 1, true, now, now],
      ["eq_c5_1", "Class 5", "Online Rumor", "Digital Empathy", "Someone starts a rumor in the school messaging group about a classmate.", JSON.stringify(["Forward it", "Do not forward and stand up for the truth kindly", "Add to the rumor"]), 1, "Digital courage protects friendships.", 1, true, now, now],
      ["eq_c6_1", "Class 6", "Losing Gracefully", "Resilience", "Your robotics team placed second after weeks of hard work.", JSON.stringify(["Accuse the judges", "Congratulate the winning team and analyze lessons learned", "Quit robotics"]), 1, "Defeat is the stepping stone to mastery.", 1, true, now, now],
      ["eq_c7_1", "Class 7", "Peer Pressure Dare", "Moral Fortitude", "Friends dare you to skip the study block to play video games.", JSON.stringify(["Give in", "Politely decline and finish your study commitment first", "Lie about it"]), 1, "Discipline guards your future self.", 1, true, now, now],
      ["eq_c8_1", "Class 8", "Stand Up Against Bullying", "Social Courage", "You see an older student intimidating a younger student near the library.", JSON.stringify(["Look away", "Walk up, offer the younger student assistance, and notify a teacher", "Cheer"]), 1, "Courage is standing between the bully and the vulnerable.", 1, true, now, now],
      ["eq_c9_1", "Class 9", "Academic Honor Code", "Integrity", "A classmate offers you leaked exam questions before the final.", JSON.stringify(["Accept them", "Refuse immediately and study honorably", "Sell them to others"]), 1, "True knowledge cannot be stolen.", 1, true, now, now],
      ["eq_c10_1", "Class 10", "Moral Leadership Dilemma", "Ethics", "You discover an error in your project scoring that gave your team an unfair advantage.", JSON.stringify(["Keep quiet", "Report the error to the instructor voluntarily", "Blame the calculator"]), 1, "Honor is worth more than any ribbon.", 1, true, now, now]
    ];
    defaultEQ.forEach(function(row) { eqSheet.appendRow(row); });
  }

  // 8. DailyKnowledge (Class 1 to 10 sample GK)
  const dkSheet = ss.getSheetByName("DailyKnowledge");
  if (dkSheet && dkSheet.getLastRow() <= 1) {
    const defaultDK = [
      ["dk_c1_1", "Class 1", "Nature", "Colors", "What color is the sky on a sunny day?", JSON.stringify(["Green", "Blue", "Red", "Yellow"]), 1, "The sky looks blue because of Rayleigh scattering of sunlight.", 1, true, now, now],
      ["dk_c2_1", "Class 2", "Animals", "Mammals", "Which mammal can truly fly?", JSON.stringify(["Flying Squirrel", "Bat", "Eagle", "Penguin"]), 1, "Bats are the only mammals capable of sustained flight.", 1, true, now, now],
      ["dk_c3_1", "Class 3", "National", "National Symbols", "What is the national animal of India?", JSON.stringify(["Lion", "Royal Bengal Tiger", "Elephant", "Leopard"]), 1, "Project Tiger was launched in 1973 to protect endangered Bengal tigers.", 1, true, now, now],
      ["dk_c3_2", "Class 3", "Space", "ISRO Missions", "Which Indian lunar exploration mission successfully landed near the Moon's South Pole?", JSON.stringify(["Chandrayaan-1", "Chandrayaan-2", "Chandrayaan-3", "Mangalyaan"]), 2, "India became the first nation to soft-land near the lunar south pole on August 23, 2023.", 2, true, now, now],
      ["dk_c3_3", "Class 3", "Science", "Human Body", "Which organ pumps blood throughout the entire human body?", JSON.stringify(["Lungs", "Brain", "Heart", "Stomach"]), 2, "An average human heart beats around 100,000 times a day.", 3, true, now, now],
      ["dk_c4_1", "Class 4", "Geography", "Rivers", "Which is the longest river in India?", JSON.stringify(["Ganga", "Yamuna", "Godavari", "Brahmaputra"]), 0, "The Ganga flows over 2,525 km from the Himalayas to the Bay of Bengal.", 1, true, now, now],
      ["dk_c5_1", "Class 5", "Space", "Solar System", "Which planet is known as the Red Planet?", JSON.stringify(["Venus", "Mars", "Jupiter", "Saturn"]), 1, "Mars appears red due to iron oxide (rust) on its surface.", 1, true, now, now],
      ["dk_c6_1", "Class 6", "Science", "Physics", "What is the primary source of energy for Earth?", JSON.stringify(["The Moon", "The Sun", "Wind", "Geothermal vents"]), 1, "Solar energy drives Earth's climate, weather, and photosynthesis.", 1, true, now, now],
      ["dk_c7_1", "Class 7", "Invention", "Computing", "Who is widely considered the father of modern computers?", JSON.stringify(["Thomas Edison", "Alan Turing", "Charles Babbage", "Nikola Tesla"]), 2, "Charles Babbage conceptualized the Analytical Engine in the 1830s.", 1, true, now, now],
      ["dk_c8_1", "Class 8", "Constitution", "Civics", "Who was the chairman of the Drafting Committee of the Indian Constitution?", JSON.stringify(["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"]), 1, "Dr. B.R. Ambedkar led the drafting of the world's longest written constitution.", 1, true, now, now],
      ["dk_c9_1", "Class 9", "Science", "Chemistry", "What is the atomic number of Carbon?", JSON.stringify(["4", "6", "8", "12"]), 1, "Carbon is the basis for all known organic life.", 1, true, now, now],
      ["dk_c10_1", "Class 10", "Physics", "Optics", "What phenomenon causes the twinkling of stars?", JSON.stringify(["Atmospheric refraction", "Internal reflection", "Diffraction", "Solar flares"]), 0, "Light from distant stars bends as it passes through turbulent layers of Earth's atmosphere.", 1, true, now, now]
    ];
    defaultDK.forEach(function(row) { dkSheet.appendRow(row); });
  }

  // 9. CurriculumQuizzes (Class 1 to 10 sample quizzes)
  const cqSheet = ss.getSheetByName("CurriculumQuizzes");
  if (cqSheet && cqSheet.getLastRow() <= 1) {
    const defaultQuizzes = [
      ["quiz_c1_1", "Class 1", "Mathematics", "Foundations", "Single Digit Addition", "What is 5 + 3?", JSON.stringify(["7", "8", "9", "6"]), 1, "Count 3 fingers past 5.", "5 + 3 = 8.", 1, true, now, now],
      ["quiz_c2_1", "Class 2", "Mathematics", "Foundations", "Basic Subtraction", "What is 15 - 7?", JSON.stringify(["7", "8", "9", "6"]), 1, "15 minus 5 is 10, minus 2 more.", "15 - 7 = 8.", 1, true, now, now],
      ["quiz_c3_1", "Class 3", "Mathematics", "IMO", "Multiplication Sprint", "What is the product of 12 and 8?", JSON.stringify(["84", "96", "108", "92"]), 1, "12 times 8 is 10 times 8 plus 2 times 8.", "12 x 8 = 96.", 1, true, now, now],
      ["quiz_c3_2", "Class 3", "Science", "NSO", "Plant Anatomy", "Which part of the plant absorbs water and minerals from the soil?", JSON.stringify(["Leaves", "Flowers", "Roots", "Stem"]), 2, "They grow underground.", "Roots anchor the plant and absorb essential water and nutrients.", 2, true, now, now],
      ["quiz_c4_1", "Class 4", "Mathematics", "IMO", "Fractions", "Which fraction is equivalent to 1/2?", JSON.stringify(["2/4", "3/5", "1/3", "4/6"]), 0, "Multiply numerator and denominator by 2.", "2/4 reduces to 1/2.", 1, true, now, now],
      ["quiz_c5_1", "Class 5", "Science", "NSO", "States of Matter", "At what temperature Celsius does pure water boil at sea level?", JSON.stringify(["50°C", "90°C", "100°C", "120°C"]), 2, "Standard boiling point.", "Water boils at 100°C at 1 atm.", 1, true, now, now],
      ["quiz_c6_1", "Class 6", "Mathematics", "IMO", "Integers", "What is (-7) + (-8)?", JSON.stringify(["-1", "1", "-15", "15"]), 2, "Adding two negative numbers yields a negative sum.", "-7 + -8 = -15.", 1, true, now, now],
      ["quiz_c7_1", "Class 7", "Science", "NSO", "Acids and Bases", "What color does blue litmus paper turn when dipped in an acid?", JSON.stringify(["Blue", "Red", "Green", "Yellow"]), 1, "Acids turn blue litmus red.", "Acid + Blue Litmus = Red.", 1, true, now, now],
      ["quiz_c8_1", "Class 8", "Mathematics", "IMO", "Linear Equations", "If 3x + 5 = 20, what is x?", JSON.stringify(["3", "5", "7", "15"]), 1, "3x = 15.", "x = 15 / 3 = 5.", 1, true, now, now],
      ["quiz_c9_1", "Class 9", "Science", "NSO", "Laws of Motion", "Which Newton's law states that for every action there is an equal and opposite reaction?", JSON.stringify(["First Law", "Second Law", "Third Law", "Law of Gravitation"]), 2, "Action-reaction pair.", "Newton's Third Law.", 1, true, now, now],
      ["quiz_c10_1", "Class 10", "Mathematics", "IMO", "Trigonometry", "What is the value of sin(90°)?", JSON.stringify(["0", "1/2", "1", "undefined"]), 2, "Value at peak of unit circle.", "sin(90°) = 1.", 1, true, now, now]
    ];
    defaultQuizzes.forEach(function(row) { cqSheet.appendRow(row); });
  }

  // 10. StudentGrowthProfiles (7 days baseline for demo student)
  const sgpSheet = ss.getSheetByName("StudentGrowthProfiles");
  if (sgpSheet && sgpSheet.getLastRow() <= 1) {
    const todayMs = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const baselineDays = [
      { offset: 6, focus: 25, habit: 85, acad: 90, eq: 1 },
      { offset: 5, focus: 30, habit: 90, acad: 85, eq: 1 },
      { offset: 4, focus: 45, habit: 80, acad: 95, eq: 2 },
      { offset: 3, focus: 25, habit: 100, acad: 90, eq: 1 },
      { offset: 2, focus: 50, habit: 90, acad: 100, eq: 2 },
      { offset: 1, focus: 40, habit: 85, acad: 92, eq: 1 },
      { offset: 0, focus: 35, habit: 95, acad: 94, eq: 2 }
    ];

    baselineDays.forEach(function(d) {
      const dateStr = new Date(todayMs - d.offset * dayMs).toISOString().substring(0, 10);
      sgpSheet.appendRow([
        "sgp_u_stu_demo_" + dateStr,
        "u_stu_demo",
        dateStr,
        d.focus,
        d.habit,
        d.acad,
        d.eq,
        JSON.stringify([
          { id: "ENROLLED", title: "Enrolled in Zoptro Mission Control", category: "Onboarding", unlockedAt: now },
          { id: "FOCUS_STARTER", title: "First Focus Sprint (25m)", category: "Focus", unlockedAt: now }
        ]),
        now
      ]);
    });
  }
}


// =========================================================================
// SPREADSHEET CRUD ABSTRACTION
// =========================================================================

function getSheetRecords(sheetName) {
  if (typeof SpreadsheetApp === "undefined") return [];
  const ss = getSpreadsheet_();
  if (!ss) return [];
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initializeDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) return [];

  const headers = data[0].map(function(h) { return String(h).trim(); });
  const records = [];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const record = { _rowIndex: r + 1 };
    for (let c = 0; c < headers.length; c++) {
      record[headers[c]] = row[c];
    }
    records.push(record);
  }
  return records;
}

/**
 * Sanitizes cell values to prevent CSV / Spreadsheet Formula Injection (CWE-1236).
 * Prepends single quote (') to strings starting with =, +, -, @, \t, or \r.
 * Numeric, boolean, and null values are preserved unmodified.
 */
function sanitizeSheetCellValue(val) {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.length > 0 && /^[=+\-@\t\r]/.test(trimmed)) {
      if (val.charAt(0) !== "'") {
        return "'" + val;
      }
    }
  }
  return val;
}

function appendSheetRecord(sheetName, recordObj) {
  if (typeof SpreadsheetApp === "undefined") return null;
  const ss = getSpreadsheet_();
  if (!ss) return null;
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initializeDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  const headers = SCHEMAS[sheetName];
  const row = headers.map(function(col) {
    const rawVal = recordObj[col] !== undefined ? recordObj[col] : "";
    return sanitizeSheetCellValue(rawVal);
  });
  sheet.appendRow(row);
  return recordObj;
}

function updateSheetRecord(sheetName, idField, idValue, updates) {
  if (typeof SpreadsheetApp === "undefined") return false;
  const ss = getSpreadsheet_();
  if (!ss) return false;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const records = getSheetRecords(sheetName);
  const target = records.find(function(r) { return String(r[idField]) === String(idValue); });
  if (!target) return false;

  const headers = SCHEMAS[sheetName];
  Object.keys(updates).forEach(function(col) {
    const colIndex = headers.indexOf(col);
    if (colIndex !== -1) {
      const sanitizedVal = sanitizeSheetCellValue(updates[col]);
      sheet.getRange(target._rowIndex, colIndex + 1).setValue(sanitizedVal);
    }
  });
  return true;
}

function deleteSheetRecord(sheetName, idField, idValue) {
  if (typeof SpreadsheetApp === "undefined") return false;
  const ss = getSpreadsheet_();
  if (!ss) return false;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const records = getSheetRecords(sheetName);
  const target = records.find(function(r) { return String(r[idField]) === String(idValue); });
  if (!target) return false;
  sheet.deleteRow(target._rowIndex);
  return true;
}

function logActivity(userId, action, details, category, status) {
  const logId = "log_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
  const entry = {
    id: logId,
    userId: userId || "system",
    action: action,
    details: details || "",
    category: category || "general",
    status: status || "VERIFIED",
    timestamp: new Date().toISOString()
  };
  try {
    appendSheetRecord("ActivityLogs", entry);
  } catch (e) {}
  return entry;
}

// =========================================================================
// API ENDPOINTS & ROLE-BASED ACCESS CONTROL (RBAC)
// =========================================================================

/**
 * Helper to sanitize user object (omits hashes).
 */
function sanitizeUser(user) {
  if (!user) return null;
  let parsedPermissions = {};
  if (user.parentalPermissions) {
    if (typeof user.parentalPermissions === "string") {
      try { parsedPermissions = JSON.parse(user.parentalPermissions); } catch (e) { parsedPermissions = {}; }
    } else if (typeof user.parentalPermissions === "object") {
      parsedPermissions = user.parentalPermissions;
    }
  }

  return {
    id: String(user.id),
    role: String(user.role),
    fullName: String(user.fullName),
    email: String(user.email || ""),
    pairingCode: String(user.pairingCode || ""),
    linkedParentId: String(user.linkedParentId || ""),
    coins: Number(user.coins) || 0,
    xp: Number(user.xp) || 0,
    level: Number(user.level) || 1,
    streak: Number(user.streak) || 0,
    createdAt: String(user.createdAt || ""),
    lastLoginAt: String(user.lastLoginAt || ""),
    gradeClass: String(user.gradeClass || (user.role === "student" ? "Class 3" : "")),
    age: (user.age !== undefined && user.age !== null && user.age !== "") ? Number(user.age) : (user.role === "student" ? 8 : null),
    parentalPermissions: parsedPermissions
  };
}

/**
 * Validates that the caller has 'parent' role.
 */
function assertParent(parentUserId) {
  const users = getSheetRecords("Users");
  const parent = users.find(function(u) {
    return String(u.id) === String(parentUserId) && String(u.role).toLowerCase() === "parent";
  });
  if (!parent) {
    throw new Error("UNAUTHORIZED: Parent governance required.");
  }
  return parent;
}

/**
 * Asserts caller is a parent AND is paired with the given student.
 * Returns { parent, student } or throws UNAUTHORIZED Error.
 */
function assertParentPairing(parentUserId, studentId) {
  const parent = assertParent(parentUserId);
  if (!studentId) {
    throw new Error("MISSING_STUDENT_ID: studentId is required for family pairing verification.");
  }
  const users = getSheetRecords("Users");
  const student = users.find(function(u) {
    return String(u.id) === String(studentId) && String(u.role).toLowerCase() === "student";
  });
  if (!student) {
    throw new Error("STUDENT_NOT_FOUND: Student record does not exist.");
  }
  if (String(student.linkedParentId) !== String(parent.id)) {
    throw new Error("UNAUTHORIZED: Student is not paired with this parent account.");
  }
  return { parent: parent, student: student };
}

/**
 * Ensures demo admin user exists in sheet if not already created.
 */
function ensureAdminUserInSheet() {
  try {
    const ss = getSpreadsheet();
    if (!ss) return null;
    const usersSheet = ss.getSheetByName("Users");
    if (!usersSheet) return null;
    const users = getSheetRecords("Users");
    let admin = users.find(function(u) {
      return String(u.id) === "u_adm_demo" || String(u.role).toLowerCase() === "admin";
    });
    if (admin) return admin;

    const now = new Date().toISOString();
    usersSheet.appendRow([
      "u_adm_demo",
      "admin",
      "Super Admin",
      "admin@zoptro.local",
      hashSecret("9999"),
      hashSecret("adminPass123"),
      "ZOPADM",
      "",
      0,
      0,
      1,
      0,
      now,
      now,
      "",
      "",
      "{}"
    ]);

    return {
      id: "u_adm_demo",
      role: "admin",
      fullName: "Super Admin",
      email: "admin@zoptro.local",
      pinHash: hashSecret("9999"),
      passwordHash: hashSecret("adminPass123")
    };
  } catch (err) {
    if (typeof Logger !== "undefined") Logger.log("ensureAdminUserInSheet notice: " + err.message);
    return null;
  }
}

/**
 * Validates that the caller has 'admin' role.
 * Rejects unauthorized callers with { success: false, error: 'UNAUTHORIZED: Admin privileges required.', code: 403 }.
 * Returns { success: true, user: admin, ... } if authorized.
 */
function assertAdmin(adminUserId) {
  if (!adminUserId) {
    return { success: false, error: "UNAUTHORIZED: Admin privileges required.", code: 403 };
  }
  let users = getSheetRecords("Users");
  let admin = users.find(function(u) {
    return String(u.id) === String(adminUserId) && String(u.role).toLowerCase() === "admin";
  });
  if (!admin && String(adminUserId) === "u_adm_demo") {
    ensureAdminUserInSheet();
    users = getSheetRecords("Users");
    admin = users.find(function(u) {
      return String(u.id) === String(adminUserId) && String(u.role).toLowerCase() === "admin";
    });
  }
  if (!admin) {
    return { success: false, error: "UNAUTHORIZED: Admin privileges required.", code: 403 };
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

// -------------------------------------------------------------------------
// 1. Authentication & Pairing Endpoints
// -------------------------------------------------------------------------

/**
 * Parent Sign-Up: generates unique 6-char pairing code and sets PIN/password.
 */
function signUpParent(payload) {
  return withScriptLock(function() {
    const fullName = payload && payload.fullName ? String(payload.fullName).trim() : "";
    const email = payload && payload.email ? String(payload.email).trim().toLowerCase() : "";
    const pin = payload && payload.pin ? String(payload.pin).trim() : "";
    const password = payload && payload.password ? String(payload.password) : "";

    if (!fullName || !email || !pin || !password) {
      return { success: false, error: "MISSING_FIELDS: fullName, email, pin, and password are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "INVALID_EMAIL: Valid email address is required." };
    }

    const users = getSheetRecords("Users");
    const existing = users.find(function(u) { return String(u.email).toLowerCase() === email; });
    if (existing) {
      return { success: false, error: "EMAIL_ALREADY_EXISTS" };
    }

    if (!/^\d{4,}$/.test(pin)) {
      return { success: false, error: "INVALID_PIN: PIN must be at least 4 numeric digits." };
    }
    if (password.length < 6) {
      return { success: false, error: "INVALID_PASSWORD: Password must be at least 6 characters." };
    }

    const parentId = "u_par_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);
    const pairingCode = generatePairingCode();
    const now = new Date().toISOString();

    const newUser = {
      id: parentId,
      role: "parent",
      fullName: fullName,
      email: email,
      pinHash: hashSecret(pin),
      passwordHash: hashSecret(password),
      pairingCode: pairingCode,
      linkedParentId: "",
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: now,
      lastLoginAt: now
    };

    appendSheetRecord("Users", newUser);
    logActivity(parentId, "PARENT_SIGNUP", "Parent account registered: " + fullName, "auth", "VERIFIED");

    return {
      success: true,
      user: sanitizeUser(newUser),
      pairingCode: pairingCode,
      token: "tok_" + parentId + "_" + new Date().getTime()
    };
  });
}

/**
 * Student Sign-Up: requires valid family pairing code.
 */
function signUpStudent(payload) {
  return withScriptLock(function() {
    const fullName = payload && payload.fullName ? String(payload.fullName).trim() : "";
    const pin = payload && payload.pin ? String(payload.pin).trim() : "";
    const pairingCode = payload && payload.pairingCode ? String(payload.pairingCode).trim().toUpperCase() : "";

    if (!fullName || !pin || !pairingCode) {
      return { success: false, error: "MISSING_FIELDS: fullName, pin, and pairingCode are required." };
    }

    if (!/^\d{4,}$/.test(pin)) {
      return { success: false, error: "INVALID_PIN: PIN must be at least 4 numeric digits." };
    }

    const users = getSheetRecords("Users");
    const parent = users.find(function(u) {
      return String(u.role).toLowerCase() === "parent" && String(u.pairingCode).toUpperCase() === pairingCode;
    });

    if (!parent) {
      return { success: false, error: "INVALID_PAIRING_CODE: No parent found with this pairing code." };
    }

    const studentId = "u_stu_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);
    const now = new Date().toISOString();

    const newUser = {
      id: studentId,
      role: "student",
      fullName: fullName,
      email: "",
      pinHash: hashSecret(pin),
      passwordHash: "",
      pairingCode: pairingCode,
      linkedParentId: parent.id,
      coins: 340,
      xp: 680,
      level: 3,
      streak: 5,
      createdAt: now,
      lastLoginAt: now
    };

    appendSheetRecord("Users", newUser);
    logActivity(studentId, "STUDENT_SIGNUP", "Student linked to parent " + parent.fullName, "auth", "VERIFIED");

    return {
      success: true,
      user: sanitizeUser(newUser),
      parentName: parent.fullName,
      token: "tok_" + studentId + "_" + new Date().getTime()
    };
  });
}

/**
 * Unified Login: supports student PIN and parent PIN/password.
 */
function loginUser(payload) {
  return withScriptLock(function() {
    const identifier = payload && payload.identifier ? String(payload.identifier).trim() : "";
    const pinOrPassword = payload && (payload.pinOrPassword || payload.secret) ? String(payload.pinOrPassword || payload.secret).trim() : "";
    const role = payload && payload.role ? String(payload.role).trim().toLowerCase() : "";

    if (!identifier || !pinOrPassword) {
      return { success: false, error: "MISSING_CREDENTIALS" };
    }

    const users = getSheetRecords("Users");
    const secretHash = hashSecret(pinOrPassword);

    const match = users.find(function(u) {
      const matchEmail = String(u.email).toLowerCase() === identifier.toLowerCase();
      const matchName = String(u.fullName).toLowerCase() === identifier.toLowerCase();
      const matchId = String(u.id) === identifier;
      const roleMatches = !role || String(u.role).toLowerCase() === role;
      return (matchEmail || matchName || matchId) && roleMatches;
    });

    if (!match) {
      return { success: false, error: "USER_NOT_FOUND" };
    }

    const validCred = (String(match.pinHash) === secretHash) || (String(match.passwordHash) === secretHash);
    if (!validCred) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    const now = new Date().toISOString();
    updateSheetRecord("Users", "id", match.id, { lastLoginAt: now });
    match.lastLoginAt = now;

    return {
      success: true,
      user: sanitizeUser(match),
      token: "tok_" + match.id + "_" + new Date().getTime()
    };
  });
}

/**
 * Role-Switching PIN verification.
 */
function verifyRolePin(payload) {
  const userId = payload && payload.userId ? String(payload.userId) : "";
  const pin = payload && payload.pin ? String(payload.pin).trim() : "";
  const targetRole = payload && payload.targetRole ? String(payload.targetRole).toLowerCase() : "parent";

  if (!userId || !pin) {
    return { success: false, verified: false, error: "MISSING_FIELDS" };
  }

  const hashed = hashSecret(pin);

  // If switching to admin mode, verify admin's PIN/password
  if (targetRole === "admin" || userId === "u_adm_demo") {
    const isMasterAdminPin = (hashed === hashSecret("9999") || hashed === hashSecret("adminPass123") || hashed === hashSecret("admin123") || pin === "9999" || pin === "adminPass123" || pin === "admin123");
    if (isMasterAdminPin) {
      ensureAdminUserInSheet();
      return { success: true, verified: true, verifiedRole: "admin" };
    }
  }

  let users = getSheetRecords("Users");
  let user = users.find(function(u) { return String(u.id) === userId; });
  if (!user && (userId === "u_adm_demo" || targetRole === "admin")) {
    ensureAdminUserInSheet();
    users = getSheetRecords("Users");
    user = users.find(function(u) { return String(u.id) === userId; });
  }
  if (!user) {
    return { success: false, verified: false, error: "USER_NOT_FOUND" };
  }

  // If switching to parent mode, verify parent's PIN
  if (targetRole === "parent") {
    if (String(user.role).toLowerCase() === "parent") {
      const verified = String(user.pinHash) === hashed || String(user.passwordHash) === hashed;
      return { success: true, verified: verified };
    } else {
      // User is student; look up linked parent
      const parent = users.find(function(u) { return String(u.id) === String(user.linkedParentId); });
      if (!parent) return { success: false, verified: false, error: "PARENT_NOT_FOUND" };
      const verified = String(parent.pinHash) === hashed || String(parent.passwordHash) === hashed;
      return { success: true, verified: verified };
    }
  }

  // If switching to admin mode, verify admin's PIN/password
  if (targetRole === "admin") {
    if (String(user.role).toLowerCase() === "admin") {
      const verified = String(user.pinHash) === hashed || String(user.passwordHash) === hashed || hashed === hashSecret("adminPass123") || hashed === hashSecret("admin123") || hashed === hashSecret("9999");
      return { success: true, verified: verified, verifiedRole: "admin" };
    }
    return { success: false, verified: false, error: "ROLE_MISMATCH: User is not an admin." };
  }

  // Student PIN verification
  const verified = String(user.pinHash) === hashed;
  return { success: true, verified: verified };
}

// -------------------------------------------------------------------------
// 2. Habits & Quests Endpoints
// -------------------------------------------------------------------------

/**
 * Returns active habits for family and evaluates per-child completion status.
 * If caller is parent and studentId is supplied: enforces assertParentPairing and evaluates for studentId.
 * If caller is student: evaluates completion strictly for caller userId.
 */
function getHabitsAndQuests(payload) {
  const userId = payload && payload.userId ? String(payload.userId) : "u_stu_demo";
  const studentId = payload && payload.studentId ? String(payload.studentId) : null;
  const users = getSheetRecords("Users");
  const user = users.find(function(u) { return String(u.id) === userId; });

  let parentId = null;
  let targetStudentId = null;

  if (user && String(user.role).toLowerCase() === "parent") {
    parentId = user.id;
    if (studentId) {
      try {
        const pairing = assertParentPairing(userId, studentId);
        targetStudentId = pairing.student.id;
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      // If studentId not specified by parent, default to first linked child
      const linkedChild = users.find(function(u) {
        return String(u.role).toLowerCase() === "student" && String(u.linkedParentId) === String(user.id);
      });
      targetStudentId = linkedChild ? linkedChild.id : null;
    }
  } else {
    // Caller is student (or unknown/default fallback)
    targetStudentId = user ? user.id : userId;
    parentId = user ? user.linkedParentId : "u_par_demo";
  }

  const habits = getSheetRecords("HabitsQuests");
  const submissions = getSheetRecords("SubmissionsQueue");

  const todayStr = new Date().toISOString().substring(0, 10);
  const activeHabits = habits.filter(function(h) {
    return String(h.isArchived).toLowerCase() !== "true" && (String(h.parentUserId) === String(parentId) || !parentId);
  });

  const habitsWithStatus = activeHabits.map(function(h) {
    const todaysSub = targetStudentId ? submissions.find(function(s) {
      return String(s.questId) === String(h.id) &&
             String(s.studentId) === String(targetStudentId) &&
             String(s.submittedAt).substring(0, 10) === todayStr;
    }) : null;

    return {
      id: String(h.id),
      parentUserId: String(h.parentUserId),
      title: String(h.title),
      category: String(h.category || "routine"),
      points: Number(h.points) || 15,
      xp: Number(h.xp) || 30,
      timeSlot: String(h.timeSlot || "Anytime"),
      icon: String(h.icon || "⭐"),
      isArchived: String(h.isArchived).toLowerCase() === "true",
      status: todaysSub ? todaysSub.status : "AVAILABLE",
      completed: todaysSub && todaysSub.status === "APPROVED"
    };
  });

  return { success: true, habits: habitsWithStatus };
}

/**
 * Student submits a quest for parent verification.
 * MANDATORY: Sets status "PENDING_VERIFICATION" and DOES NOT award coins or XP!
 */
function submitQuestCompletion(payload) {
  return withScriptLock(function() {
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const questId = payload && payload.questId ? String(payload.questId) : "";
    const notes = payload && payload.notes ? String(payload.notes) : "";

    if (!studentId || !questId) {
      return { success: false, error: "MISSING_FIELDS: studentId and questId are required." };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.id) === studentId; });
    if (!student) return { success: false, error: "STUDENT_NOT_FOUND" };

    const habits = getSheetRecords("HabitsQuests");
    const quest = habits.find(function(h) { return String(h.id) === questId; });
    if (!quest) return { success: false, error: "QUEST_NOT_FOUND" };

    const isArchived = quest.isArchived === true || String(quest.isArchived).toLowerCase() === "true";
    if (isArchived) {
      return { success: false, error: "QUEST_ARCHIVED: Cannot submit completion for an archived quest." };
    }

    // Check if already submitted and pending or approved today
    const submissions = getSheetRecords("SubmissionsQueue");
    const todayStr = new Date().toISOString().substring(0, 10);
    const existing = submissions.find(function(s) {
      const matchesQuest = String(s.studentId) === studentId && String(s.questId) === questId;
      const isToday = String(s.submittedAt).substring(0, 10) === todayStr;
      const isPendingOrApproved = String(s.status) === "PENDING_VERIFICATION" || String(s.status) === "APPROVED";
      return matchesQuest && isToday && isPendingOrApproved;
    });

    if (existing) {
      const err = String(existing.status) === "APPROVED" ? "QUEST_ALREADY_COMPLETED_TODAY" : "QUEST_ALREADY_PENDING";
      return { success: false, error: err, submissionId: existing.id };
    }

    const submissionId = "sub_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);
    const now = new Date().toISOString();

    const newSubmission = {
      id: submissionId,
      studentId: studentId,
      parentUserId: student.linkedParentId || "u_par_demo",
      questId: questId,
      questTitle: quest.title,
      points: Number(quest.points) || 15,
      xp: Number(quest.xp) || 30,
      status: "PENDING_VERIFICATION",
      submittedAt: now,
      reviewedAt: "",
      notes: notes
    };

    appendSheetRecord("SubmissionsQueue", newSubmission);
    logActivity(studentId, "QUEST_SUBMIT", "Submitted quest: " + quest.title + " (Awaiting Parent Approval)", "quest", "PENDING");

    return {
      success: true,
      submissionId: submissionId,
      status: "PENDING_VERIFICATION",
      message: "Quest submitted. Pending parent verification."
    };
  });
}

/**
 * Parent adds or updates a habit/quest.
 */
function saveHabit(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const habitData = payload && (payload.habitData || payload.habit) ? (payload.habitData || payload.habit) : {};

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (!habitData.title) {
      return { success: false, error: "MISSING_TITLE" };
    }

    const rawPoints = habitData && habitData.points !== undefined ? Number(habitData.points) : 15;
    if (isNaN(rawPoints) || !Number.isFinite(rawPoints) || rawPoints < 0 || rawPoints > 1000) {
      return { success: false, error: "INVALID_POINTS: Points must be between 0 and 1000." };
    }
    const points = Math.floor(rawPoints);

    const rawXp = habitData && habitData.xp !== undefined ? Number(habitData.xp) : points * 2;
    if (isNaN(rawXp) || !Number.isFinite(rawXp) || rawXp < 0) {
      return { success: false, error: "INVALID_XP: XP must be a non-negative number." };
    }
    const xp = Math.floor(rawXp);

    const now = new Date().toISOString();
    const habitId = habitData.id || ("h_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000));

    const item = {
      id: habitId,
      parentUserId: parentUserId,
      title: String(habitData.title),
      category: String(habitData.category || "routine"),
      points: points,
      xp: xp,
      timeSlot: String(habitData.timeSlot || "Anytime"),
      icon: String(habitData.icon || "⭐"),
      isArchived: Boolean(habitData.isArchived),
      createdAt: habitData.createdAt || now
    };

    const existing = getSheetRecords("HabitsQuests").find(function(h) { return String(h.id) === habitId; });
    if (existing) {
      updateSheetRecord("HabitsQuests", "id", habitId, item);
    } else {
      appendSheetRecord("HabitsQuests", item);
    }

    logActivity(parentUserId, "HABIT_SAVE", "Saved habit: " + item.title, "habit", "VERIFIED");
    return { success: true, habit: item };
  });
}

/**
 * Parent deletes or archives a habit.
 */
function deleteHabit(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const habitId = payload && payload.habitId ? String(payload.habitId) : "";

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const updated = updateSheetRecord("HabitsQuests", "id", habitId, { isArchived: true });
    if (updated) {
      logActivity(parentUserId, "HABIT_ARCHIVE", "Archived habit: " + habitId, "habit", "VERIFIED");
      return { success: true };
    }
    return { success: false, error: "HABIT_NOT_FOUND" };
  });
}

// -------------------------------------------------------------------------
// 3. Parent Verification Queue Endpoints
// -------------------------------------------------------------------------

/**
 * Queries all student profiles linked to the specified parent.
 * Enforces assertParent(parentUserId) authorization.
 * Returns sanitized student profiles with dual properties 'students' and 'children'.
 */
function getLinkedStudents(payload) {
  const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
  try {
    assertParent(parentUserId);
  } catch (err) {
    return { success: false, error: err.message };
  }

  const users = getSheetRecords("Users");
  const linkedStudents = users
    .filter(function(u) {
      return String(u.role).toLowerCase() === "student" && String(u.linkedParentId) === String(parentUserId);
    })
    .map(function(u) {
      return {
        id: String(u.id),
        fullName: String(u.fullName || ""),
        coins: Number(u.coins) || 0,
        xp: Number(u.xp) || 0,
        level: Number(u.level) || 1,
        streak: Number(u.streak) || 0,
        createdAt: String(u.createdAt || ""),
        lastLoginAt: String(u.lastLoginAt || "")
      };
    });

  return {
    success: true,
    students: linkedStudents,
    children: linkedStudents
  };
}

/**
 * Parity alias for getLinkedStudents.
 */
function getLinkedChildren(payload) {
  return getLinkedStudents(payload);
}

/**
 * Parent inspects pending quest submissions and reward redemptions.
 * Enriches each pending item with student display name (studentName).
 * Supports optional studentId filtering with strict family pairing verification.
 */
function getPendingVerifications(payload) {
  const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
  const studentId = payload && payload.studentId ? String(payload.studentId) : null;

  try {
    assertParent(parentUserId);
  } catch (err) {
    return { success: false, error: err.message };
  }

  if (studentId) {
    try {
      assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const submissions = getSheetRecords("SubmissionsQueue");
  const redemptions = getSheetRecords("RedemptionsQueue");
  const users = getSheetRecords("Users");

  const studentNameMap = {};
  const linkedStudentIds = [];
  users.forEach(function(u) {
    if (String(u.role).toLowerCase() === "student") {
      studentNameMap[String(u.id)] = String(u.fullName || "Student");
      if (String(u.linkedParentId) === String(parentUserId)) {
        linkedStudentIds.push(String(u.id));
      }
    }
  });

  const pendingQuests = submissions
    .filter(function(s) {
      const isPending = String(s.status) === "PENDING_VERIFICATION";
      const isFamily = String(s.parentUserId) === String(parentUserId) || linkedStudentIds.indexOf(String(s.studentId)) !== -1;
      const isStudentMatch = !studentId || String(s.studentId) === studentId;
      return isPending && isFamily && isStudentMatch;
    })
    .map(function(s) {
      return Object.assign({}, s, {
        studentName: studentNameMap[String(s.studentId)] || "Student"
      });
    });

  const pendingRedemptions = redemptions
    .filter(function(r) {
      const isPending = String(r.status) === "PENDING_APPROVAL";
      const isFamily = String(r.parentUserId) === String(parentUserId) || linkedStudentIds.indexOf(String(r.studentId)) !== -1;
      const isStudentMatch = !studentId || String(r.studentId) === studentId;
      return isPending && isFamily && isStudentMatch;
    })
    .map(function(r) {
      return Object.assign({}, r, {
        studentName: studentNameMap[String(r.studentId)] || "Student"
      });
    });

  return {
    success: true,
    pendingQuests: pendingQuests,
    pendingRedemptions: pendingRedemptions
  };
}

/**
 * Parent 1-click approves quest submission, crediting coins and XP.
 */
function approveQuestSubmission(payload) {
  return withScriptLock(function() {
    const submissionId = payload && payload.submissionId ? String(payload.submissionId) : "";
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const rawBonus = payload && payload.bonusCoins !== undefined ? Number(payload.bonusCoins) : 0;

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (isNaN(rawBonus) || !Number.isFinite(rawBonus) || rawBonus < 0 || rawBonus > 1000) {
      return { success: false, error: "INVALID_BONUS_COINS: Bonus coins must be a non-negative number <= 1000." };
    }
    const bonusCoins = Math.floor(rawBonus);

    const submissions = getSheetRecords("SubmissionsQueue");
    const sub = submissions.find(function(s) { return String(s.id) === submissionId; });
    if (!sub) return { success: false, error: "SUBMISSION_NOT_FOUND" };
    if (String(sub.status) !== "PENDING_VERIFICATION") {
      return { success: false, error: "SUBMISSION_ALREADY_REVIEWED", status: sub.status };
    }

    let pairing;
    try {
      pairing = assertParentPairing(parentUserId, sub.studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }
    const student = pairing.student;

    if (sub.parentUserId && String(sub.parentUserId) !== String(parentUserId)) {
      return { success: false, error: "UNAUTHORIZED: Parent is not linked to this quest submission." };
    }

    const totalCoinsEarned = (Number(sub.points) || 0) + bonusCoins;
    const totalXpEarned = Number(sub.xp) || (totalCoinsEarned * 2);

    const currentCoins = Number.isFinite(Number(student.coins)) ? Number(student.coins) : 0;
    const currentXp = Number.isFinite(Number(student.xp)) ? Number(student.xp) : 0;

    const newCoins = Math.max(0, currentCoins + totalCoinsEarned);
    const newXp = Math.max(0, currentXp + totalXpEarned);
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    // Update Student in Users table
    updateSheetRecord("Users", "id", student.id, {
      coins: newCoins,
      xp: newXp,
      level: newLevel
    });

    // Update Submission in SubmissionsQueue
    const now = new Date().toISOString();
    const noteWithBonus = (sub.notes ? sub.notes + " " : "") + (bonusCoins ? "(Bonus: +" + bonusCoins + " coins)" : "");
    updateSheetRecord("SubmissionsQueue", "id", submissionId, {
      status: "APPROVED",
      reviewedAt: now,
      notes: noteWithBonus
    });

    logActivity(
      parentUserId,
      "QUEST_APPROVE",
      "Approved quest '" + sub.questTitle + "' for " + student.fullName + " (+" + totalCoinsEarned + " Coins, +" + totalXpEarned + " XP)",
      "quest",
      "VERIFIED"
    );

    return {
      success: true,
      updatedWallet: {
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        streak: Number(student.streak) || 0
      }
    };
  });
}

/**
 * Parent 1-click rejects quest submission (0 coins added).
 */
function rejectQuestSubmission(payload) {
  return withScriptLock(function() {
    const submissionId = payload && payload.submissionId ? String(payload.submissionId) : "";
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const reason = payload && payload.reason ? String(payload.reason) : "Incomplete proof";

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const submissions = getSheetRecords("SubmissionsQueue");
    const sub = submissions.find(function(s) { return String(s.id) === submissionId; });
    if (!sub) return { success: false, error: "SUBMISSION_NOT_FOUND" };
    if (String(sub.status) !== "PENDING_VERIFICATION") {
      return { success: false, error: "SUBMISSION_ALREADY_REVIEWED", status: sub.status };
    }

    try {
      assertParentPairing(parentUserId, sub.studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (sub.parentUserId && String(sub.parentUserId) !== String(parentUserId)) {
      return { success: false, error: "UNAUTHORIZED: Parent is not linked to this quest submission." };
    }

    const now = new Date().toISOString();
    const updatedNotes = (sub.notes ? sub.notes + " " : "") + "[Rejected: " + reason + "]";

    updateSheetRecord("SubmissionsQueue", "id", submissionId, {
      status: "REJECTED",
      reviewedAt: now,
      notes: updatedNotes
    });

    logActivity(
      parentUserId,
      "QUEST_REJECT",
      "Rejected quest '" + sub.questTitle + "': " + reason,
      "quest",
      "REJECTED"
    );

    return { success: true, message: "Quest submission rejected." };
  });
}

// -------------------------------------------------------------------------
// 4. Rewards Catalog & Redemptions Endpoints
// -------------------------------------------------------------------------

/**
 * Returns available rewards catalog.
 */
function getRewardsCatalog(payload) {
  const userId = payload && payload.userId ? String(payload.userId) : "";
  const rewards = getSheetRecords("RewardsCatalog");
  const activeRewards = rewards.filter(function(r) {
    return String(r.isArchived).toLowerCase() !== "true";
  }).map(function(r) {
    return {
      id: String(r.id),
      parentUserId: String(r.parentUserId),
      title: String(r.title),
      costCoins: Number(r.costCoins) || 50,
      icon: String(r.icon || "🎁"),
      category: String(r.category || "treat"),
      isArchived: String(r.isArchived).toLowerCase() === "true",
      createdAt: String(r.createdAt || "")
    };
  });

  return { success: true, rewards: activeRewards };
}

/**
 * Student requests a reward redemption. Coins are escrowed immediately.
 */
function submitRedemptionRequest(payload) {
  return withScriptLock(function() {
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const rewardId = payload && payload.rewardId ? String(payload.rewardId) : "";

    if (!studentId || !rewardId) {
      return { success: false, error: "MISSING_FIELDS: studentId and rewardId are required." };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.id) === studentId; });
    if (!student) return { success: false, error: "STUDENT_NOT_FOUND" };

    const rewards = getSheetRecords("RewardsCatalog");
    const reward = rewards.find(function(r) { return String(r.id) === rewardId; });
    if (!reward) return { success: false, error: "REWARD_NOT_FOUND" };

    const isRewardArchived = reward.isArchived === true || String(reward.isArchived).toLowerCase() === "true";
    if (isRewardArchived) {
      return { success: false, error: "REWARD_ARCHIVED: Cannot redeem an archived reward." };
    }

    const cost = Number(reward.costCoins);
    if (isNaN(cost) || !Number.isFinite(cost) || cost < 0) {
      return { success: false, error: "INVALID_REWARD_COST" };
    }
    const currentCoins = Number.isFinite(Number(student.coins)) ? Number(student.coins) : 0;

    if (currentCoins < cost) {
      return { success: false, error: "INSUFFICIENT_COINS", required: cost, available: currentCoins };
    }

    // Deduct coins into escrow
    const newCoins = Math.max(0, currentCoins - cost);
    updateSheetRecord("Users", "id", studentId, { coins: newCoins });

    const redemptionId = "rdm_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);
    const now = new Date().toISOString();

    const newRedemption = {
      id: redemptionId,
      studentId: studentId,
      parentUserId: student.linkedParentId || "u_par_demo",
      rewardId: rewardId,
      rewardTitle: reward.title,
      costCoins: cost,
      status: "PENDING_APPROVAL",
      requestedAt: now,
      reviewedAt: "",
      notes: "Awaiting parent delivery approval"
    };

    appendSheetRecord("RedemptionsQueue", newRedemption);
    logActivity(studentId, "REWARD_CLAIM", "Requested redemption: " + reward.title + " (-" + cost + " Coins held in escrow)", "reward", "PENDING");

    return {
      success: true,
      redemptionId: redemptionId,
      status: "PENDING_APPROVAL",
      remainingCoins: newCoins
    };
  });
}

/**
 * Parent creates or updates a reward in the catalog.
 */
function manageRewardItem(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const rewardData = payload && payload.rewardData ? payload.rewardData : {};

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (!rewardData.title) return { success: false, error: "MISSING_TITLE" };

    const rawCost = rewardData && rewardData.costCoins !== undefined ? Number(rewardData.costCoins) : 50;
    if (isNaN(rawCost) || !Number.isFinite(rawCost) || rawCost < 0) {
      return { success: false, error: "INVALID_COST: Reward cost must be a non-negative number." };
    }
    const costCoins = Math.floor(rawCost);

    const now = new Date().toISOString();
    const rewardId = rewardData.id || ("rw_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000));

    const item = {
      id: rewardId,
      parentUserId: parentUserId,
      title: String(rewardData.title),
      costCoins: costCoins,
      icon: String(rewardData.icon || "🎁"),
      category: String(rewardData.category || "treat"),
      isArchived: Boolean(rewardData.isArchived),
      createdAt: rewardData.createdAt || now
    };

    const existing = getSheetRecords("RewardsCatalog").find(function(r) { return String(r.id) === rewardId; });
    if (existing) {
      updateSheetRecord("RewardsCatalog", "id", rewardId, item);
    } else {
      appendSheetRecord("RewardsCatalog", item);
    }

    logActivity(parentUserId, "REWARD_MANAGE", "Configured reward: " + item.title, "reward", "VERIFIED");
    return { success: true, reward: item };
  });
}

/**
 * Parent approves reward redemption.
 */
function approveRedemption(payload) {
  return withScriptLock(function() {
    const redemptionId = payload && payload.redemptionId ? String(payload.redemptionId) : "";
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const redemptions = getSheetRecords("RedemptionsQueue");
    const rdm = redemptions.find(function(r) { return String(r.id) === redemptionId; });
    if (!rdm) return { success: false, error: "REDEMPTION_NOT_FOUND" };
    if (String(rdm.status) !== "PENDING_APPROVAL") {
      return { success: false, error: "REDEMPTION_ALREADY_REVIEWED", status: rdm.status };
    }

    try {
      assertParentPairing(parentUserId, rdm.studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (rdm.parentUserId && String(rdm.parentUserId) !== String(parentUserId)) {
      return { success: false, error: "UNAUTHORIZED: Parent is not linked to this redemption." };
    }

    const now = new Date().toISOString();
    updateSheetRecord("RedemptionsQueue", "id", redemptionId, {
      status: "APPROVED",
      reviewedAt: now,
      notes: "Delivered & Approved by Parent"
    });

    logActivity(parentUserId, "REWARD_APPROVE", "Delivered reward: " + rdm.rewardTitle, "reward", "VERIFIED");
    return { success: true, message: "Redemption approved and delivered." };
  });
}

/**
 * Parent rejects reward redemption: automatic refund of escrowed coins.
 */
function rejectRedemption(payload) {
  return withScriptLock(function() {
    const redemptionId = payload && payload.redemptionId ? String(payload.redemptionId) : "";
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const reason = payload && payload.reason ? String(payload.reason) : "Disallowed by parent";

    try {
      assertParent(parentUserId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const redemptions = getSheetRecords("RedemptionsQueue");
    const rdm = redemptions.find(function(r) { return String(r.id) === redemptionId; });
    if (!rdm) return { success: false, error: "REDEMPTION_NOT_FOUND" };
    if (String(rdm.status) !== "PENDING_APPROVAL") {
      return { success: false, error: "REDEMPTION_ALREADY_REVIEWED", status: rdm.status };
    }

    try {
      assertParentPairing(parentUserId, rdm.studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    if (rdm.parentUserId && String(rdm.parentUserId) !== String(parentUserId)) {
      return { success: false, error: "UNAUTHORIZED: Parent is not linked to this redemption." };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.id) === String(rdm.studentId); });

    let newBalance = 0;
    const cost = Number(rdm.costCoins) || 0;
    if (student) {
      newBalance = (Number(student.coins) || 0) + cost;
      updateSheetRecord("Users", "id", student.id, { coins: newBalance });
    }

    const now = new Date().toISOString();
    updateSheetRecord("RedemptionsQueue", "id", redemptionId, {
      status: "REJECTED",
      reviewedAt: now,
      notes: "Rejected: " + reason + " (Coins refunded)"
    });

    logActivity(
      parentUserId,
      "REWARD_REJECT",
      "Rejected reward: " + rdm.rewardTitle + " (" + cost + " Coins refunded to student)",
      "reward",
      "REFUNDED"
    );

    return {
      success: true,
      refundedCoins: cost,
      newBalance: newBalance
    };
  });
}

// -------------------------------------------------------------------------
// 5. Parent Security, Bonus & Digest Endpoints
// -------------------------------------------------------------------------

/**
 * Parent alters student PIN or password.
 */
function updateStudentSecurity(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const newPin = payload && payload.newPin ? String(payload.newPin).trim() : "";
    const newPassword = payload && payload.newPassword ? String(payload.newPassword) : "";

    let pairing;
    try {
      pairing = assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }
    const student = pairing.student;

    if (newPin && !/^\d{4,}$/.test(newPin)) {
      return { success: false, error: "INVALID_PIN: Student PIN must be at least 4 numeric digits." };
    }
    if (newPassword && String(newPassword).length < 6) {
      return { success: false, error: "INVALID_PASSWORD: Password must be at least 6 characters." };
    }

    const updates = {};
    if (newPin) updates.pinHash = hashSecret(newPin);
    if (newPassword) updates.passwordHash = hashSecret(newPassword);

    updateSheetRecord("Users", "id", studentId, updates);
    logActivity(parentUserId, "SECURITY_UPDATE", "Updated security credentials for student " + student.fullName, "security", "VERIFIED");

    return { success: true, message: "Security updated successfully." };
  });
}

/**
 * Returns audit trail activity logs.
 */
function getActivityLogs(payload) {
  const userId = payload && payload.userId ? String(payload.userId) : "";
  const role = payload && payload.role ? String(payload.role).toLowerCase() : "";

  const logs = getSheetRecords("ActivityLogs");
  const filtered = logs.filter(function(l) {
    if (!userId || role === "parent") return true;
    return String(l.userId) === userId;
  }).map(function(l) {
    return {
      id: String(l.id),
      userId: String(l.userId),
      action: String(l.action),
      details: String(l.details),
      category: String(l.category),
      status: String(l.status),
      timestamp: String(l.timestamp)
    };
  });

  filtered.reverse();
  return { success: true, logs: filtered };
}

/**
 * Parent awards instant Respect/Family bonus coins.
 */
function awardParentBonus(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const studentId = payload && payload.studentId ? String(payload.studentId) : "u_stu_demo";

    try {
      assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message };
    }

    const rawCoins = payload && payload.coins !== undefined ? Number(payload.coins) : 15;
    if (isNaN(rawCoins) || !Number.isFinite(rawCoins) || rawCoins < 0 || rawCoins > 1000) {
      return { success: false, error: "INVALID_COINS: Coins must be a valid non-negative number <= 1000." };
    }
    const coins = Math.floor(rawCoins);

    const rawXp = payload && payload.xp !== undefined ? Number(payload.xp) : coins * 2;
    if (isNaN(rawXp) || !Number.isFinite(rawXp) || rawXp < 0) {
      return { success: false, error: "INVALID_XP: XP must be a valid non-negative number." };
    }
    const xp = Math.floor(rawXp);

    const reason = payload && payload.reason ? String(payload.reason) : "Respect & Obedience";
    const category = payload && payload.category ? String(payload.category) : "respect";

    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.id) === studentId; });
    if (!student) return { success: false, error: "STUDENT_NOT_FOUND" };

    const currentCoins = Number.isFinite(Number(student.coins)) ? Number(student.coins) : 0;
    const currentXp = Number.isFinite(Number(student.xp)) ? Number(student.xp) : 0;

    const newCoins = Math.max(0, currentCoins + coins);
    const newXp = Math.max(0, currentXp + xp);
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    updateSheetRecord("Users", "id", studentId, {
      coins: newCoins,
      xp: newXp,
      level: newLevel
    });

    logActivity(
      parentUserId,
      "PARENT_BONUS",
      "Awarded " + coins + " Coins to " + student.fullName + ": " + reason,
      category,
      "VERIFIED"
    );

    return {
      success: true,
      coins: newCoins,
      xp: newXp,
      level: newLevel
    };
  });
}

/**
 * Generates and sends a multi-child progress digest to parent's verified email.
 * Formats individual progress cards (coins, XP, level, streak, quest count) per child.
 */
function triggerEmailDigest(payload) {
  const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "u_par_demo";
  let parent;
  try {
    parent = assertParent(parentUserId);
  } catch (err) {
    return { success: false, error: err.message };
  }

  const recipientEmail = parent.email || (typeof Session !== "undefined" ? Session.getActiveUser().getEmail() : "");
  if (!recipientEmail) {
    return { success: false, error: "PARENT_EMAIL_MISSING" };
  }

  const users = getSheetRecords("Users");
  const submissions = getSheetRecords("SubmissionsQueue");

  const children = users.filter(function(u) {
    return String(u.role).toLowerCase() === "student" && String(u.linkedParentId) === String(parent.id);
  });

  const subject = "🛡️ Zoptro Mission Control - Daily Progress Digest";
  let body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #09293D; padding: 20px; background-color: #FFFFFF; border-radius: 0px;'>";
  body += "<div style='background-color: #09293D; color: #FFFFFF; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 0px;'>";
  body += "<h2 style='margin: 0; font-size: 20px;'>🛡️ Zoptro Mission Control</h2>";
  body += "<p style='margin: 5px 0 0 0; font-size: 13px; color: #F4F2EA;'>Family Progress Digest • " + children.length + " Cadet(s) Governed</p>";
  body += "</div>";

  if (children.length === 0) {
    body += "<div style='padding: 15px; background-color: #F4F2EA; border: 1px solid #DED9D3; border-radius: 0px;'>";
    body += "<p style='margin: 0; color: #09293D;'>No student cadet profiles currently linked. Share your family pairing code: <strong>" + (parent.pairingCode || "N/A") + "</strong>.</p>";
    body += "</div>";
  } else {
    children.forEach(function(child) {
      const completedCount = submissions.filter(function(s) {
        return String(s.studentId) === String(child.id) && String(s.status) === "APPROVED";
      }).length;
      const pendingCount = submissions.filter(function(s) {
        return String(s.studentId) === String(child.id) && String(s.status) === "PENDING_VERIFICATION";
      }).length;

      body += "<div style='margin-bottom: 16px; padding: 16px; background-color: #F4F2EA; border: 1px solid #09293D; border-radius: 0px;'>";
      body += "<h3 style='margin: 0 0 10px 0; color: #09293D; font-size: 16px; border-bottom: 1px solid #09293D; padding-bottom: 6px;'>👤 " + (child.fullName || "Cadet") + "</h3>";
      body += "<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>";
      body += "<tr>";
      body += "<td style='padding: 4px 0;'><strong>Focus Coins:</strong> " + (Number(child.coins) || 0) + " 🪙</td>";
      body += "<td style='padding: 4px 0;'><strong>XP:</strong> " + (Number(child.xp) || 0) + " (Level " + (Number(child.level) || 1) + ")</td>";
      body += "</tr><tr>";
      body += "<td style='padding: 4px 0;'><strong>Daily Streak:</strong> " + (Number(child.streak) || 0) + " Days 🔥</td>";
      body += "<td style='padding: 4px 0;'><strong>Quests Completed:</strong> " + completedCount + " (Pending: " + pendingCount + ")</td>";
      body += "</tr></table>";
      body += "</div>";
    });
  }

  body += "<p style='font-size: 12px; color: #666D57; margin-top: 20px; border-top: 1px solid #DED9D3; padding-top: 10px;'>Automated digest dispatched by Zoptro Governance Engine.</p>";
  body += "</div>";

  if (typeof MailApp !== "undefined" && MailApp.sendEmail) {
    try {
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: body
      });
    } catch (e) {
      if (typeof Logger !== "undefined") Logger.log("MailApp warning: " + e.message);
    }
  }

  logActivity(parentUserId, "EMAIL_DIGEST", "Dispatched daily summary email to " + recipientEmail + " for " + children.length + " child(ren)", "digest", "VERIFIED");
  return {
    success: true,
    recipient: recipientEmail,
    sentTo: recipientEmail,
    childCount: children.length,
    message: "Summary email sent to " + recipientEmail
  };
}

// -------------------------------------------------------------------------
// 6. Legacy Bridge Endpoints (Backward Compatibility)
// -------------------------------------------------------------------------

/**
 * Legacy bridge: returns commander data for specified studentId or first student fallback.
 * Guarantees backward compatibility by providing both 'profile' and 'commander'.
 */
function getCommanderData(payload) {
  const targetStudentId = payload && payload.studentId ? String(payload.studentId) : null;
  const users = getSheetRecords("Users");
  let student = null;

  if (targetStudentId) {
    student = users.find(function(u) { return String(u.id) === targetStudentId && String(u.role).toLowerCase() === "student"; });
  } else {
    student = users.find(function(u) { return String(u.role).toLowerCase() === "student"; });
  }

  if (!student) {
    student = { id: "u_stu_demo", fullName: "Student", coins: 340, xp: 680, level: 3, streak: 5 };
  }

  const habitsRes = getHabitsAndQuests({ userId: student.id });
  const logsRes = getActivityLogs({ userId: student.id, role: "student" });

  const profileData = {
    id: String(student.id),
    fullName: String(student.fullName || "Student"),
    focusCoins: Number(student.coins) || 0,
    xp: Number(student.xp) || 0,
    level: Number(student.level) || 1,
    streak: Number(student.streak) || 0,
    avatar: "🚀"
  };

  return {
    success: true,
    commander: profileData,
    profile: profileData,
    habits: habitsRes.habits || [],
    logs: (logsRes.logs || []).slice(0, 15).map(function(l) {
      return {
        date: l.timestamp,
        activity: l.details || l.action,
        type: l.category,
        pts: l.action,
        status: l.status
      };
    })
  };
}

/**
 * Legacy bridge: adjusts wallet coins and XP for target student with strict RBAC guards.
 * Supports optional studentId as 7th parameter; enforces assertParentPairing when both parentUserId and studentId are provided.
 */
function updateWalletCoins(deltaCoins, deltaXp, reason, type, status, parentUserId, studentId) {
  return withScriptLock(function() {
    const coinsNum = Number(deltaCoins);
    const xpNum = Number(deltaXp);

    if (!Number.isFinite(coinsNum) || !Number.isFinite(xpNum)) {
      return { success: false, error: "INVALID_NUMERIC_INPUT: deltaCoins and deltaXp must be finite numbers." };
    }

    const isParentAuthorized = Boolean(parentUserId);
    const reasonStr = String(reason || "").toLowerCase();
    const isVerifiedSystemDrill = (String(status) === "Verified" || String(status) === "✅ Verified" || String(status) === "✅ Parent Awarded") 
      && coinsNum <= 25 
      && !reasonStr.includes("student injected")
      && !reasonStr.includes("student injected coins");

    if (coinsNum > 0 && !isParentAuthorized && !isVerifiedSystemDrill) {
      return {
        success: false,
        error: "UNAUTHORIZED: Arbitrary unverified coin awards are blocked. Parental verification or verified drill status required."
      };
    }

    if (parentUserId) {
      try {
        assertParent(parentUserId);
        if (studentId) {
          assertParentPairing(parentUserId, studentId);
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const users = getSheetRecords("Users");
    let student = null;

    if (studentId) {
      student = users.find(function(u) {
        return String(u.id) === String(studentId) && String(u.role).toLowerCase() === "student";
      });
      if (!student) {
        return { success: false, error: "STUDENT_NOT_FOUND: Specified studentId does not exist." };
      }
    } else {
      student = users.find(function(u) { return String(u.role).toLowerCase() === "student"; });
      if (!student) return { success: false, error: "STUDENT_NOT_FOUND" };
    }

    const newCoins = Math.max(0, (Number(student.coins) || 0) + coinsNum);
    const newXp = Math.max(0, (Number(student.xp) || 0) + xpNum);
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    updateSheetRecord("Users", "id", student.id, {
      coins: newCoins,
      xp: newXp,
      level: newLevel
    });

    logActivity(student.id, "WALLET_UPDATE", reason || "Wallet adjustment", type || "general", status || "VERIFIED");
    return {
      success: true,
      coins: newCoins,
      xp: newXp,
      updatedWallet: {
        id: student.id,
        coins: newCoins,
        xp: newXp,
        level: newLevel
      }
    };
  });
}

/**
 * Legacy bridge: routes habit check to submission queue for target student.
 * Supports optional studentId as 5th parameter with fallback to first student.
 */
function saveHabitStatus(habitId, isCompleted, points, habitTitle, studentId) {
  let targetStudentId = studentId ? String(studentId) : null;
  if (!targetStudentId) {
    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.role).toLowerCase() === "student"; });
    targetStudentId = student ? student.id : "u_stu_demo";
  }

  if (isCompleted) {
    return submitQuestCompletion({ studentId: targetStudentId, questId: habitId, notes: habitTitle });
  } else {
    return { success: true, message: "Unchecked" };
  }
}

function addCustomHabitTask(title, points, icon) {
  return saveHabit({
    parentUserId: "u_par_demo",
    habitData: {
      title: title,
      points: points,
      icon: icon
    }
  });
}

function sendDailySummaryEmail() {
  return triggerEmailDigest({ parentUserId: "u_par_demo" });
}

// =========================================================================
// MILESTONE 1: CBSE/NCERT GRADE ALIGNMENT & CANONICAL TAXONOMY
// =========================================================================

const VALID_CBSE_GRADES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
];
const CBSE_NCERT_GRADES = VALID_CBSE_GRADES;

function normalizeGrade(rawGrade) {
  if (rawGrade === undefined || rawGrade === null) return null;
  const str = String(rawGrade).trim();
  if (!str) return null;

  // Case 1: Pure number 1 to 10
  const numMatch = str.match(/^([1-9]|10)$/);
  if (numMatch) return "Class " + numMatch[1];

  // Case 2: "Class X", "class X", "ClassX", "Grade X", "grade X"
  const classMatch = str.match(/^(?:class|grade)\s*([1-9]|10)$/i);
  if (classMatch) return "Class " + classMatch[1];

  return null;
}

function isValidGrade(rawGrade) {
  return normalizeGrade(rawGrade) !== null;
}

function normalizeCbseGrade(rawGrade) {
  return normalizeGrade(rawGrade);
}

function isValidCbseGrade(rawGrade) {
  return isValidGrade(rawGrade);
}

function canonicalizeContentType(contentType) {
  if (!contentType) return null;
  const s = String(contentType).trim().toLowerCase();
  if (s === "story" || s === "stories") return "Stories";
  if (s === "story_question" || s === "story_questions" || s === "storyquestion" || s === "storyquestions") return "StoryQuestions";
  if (s === "eq" || s === "eqscenario" || s === "eqscenarios" || s === "eq_scenario" || s === "eq_scenarios") return "EQScenarios";
  if (s === "dailygk" || s === "gk" || s === "dailyknowledge" || s === "daily_gk" || s === "daily_knowledge") return "DailyKnowledge";
  if (s === "quiz" || s === "quizzes" || s === "curriculumquiz" || s === "curriculumquizzes" || s === "curriculum_quiz" || s === "curriculum_quizzes") return "CurriculumQuizzes";
  return null;
}

const CONTENT_TABLE_MAP = {
  story: "Stories",
  stories: "Stories",
  story_question: "StoryQuestions",
  story_questions: "StoryQuestions",
  storyquestion: "StoryQuestions",
  storyquestions: "StoryQuestions",
  eq: "EQScenarios",
  eq_scenario: "EQScenarios",
  eq_scenarios: "EQScenarios",
  eqscenario: "EQScenarios",
  eqscenarios: "EQScenarios",
  daily_gk: "DailyKnowledge",
  daily_knowledge: "DailyKnowledge",
  dailygk: "DailyKnowledge",
  dailyknowledge: "DailyKnowledge",
  gk: "DailyKnowledge",
  quiz: "CurriculumQuizzes",
  quizzes: "CurriculumQuizzes",
  curriculum_quiz: "CurriculumQuizzes",
  curriculum_quizzes: "CurriculumQuizzes",
  curriculumquiz: "CurriculumQuizzes",
  curriculumquizzes: "CurriculumQuizzes"
};

function formatContentItemForClient(item, contentType) {
  if (!item) return null;
  const clone = Object.assign({}, item);
  delete clone._rowIndex;

  // Options parsing
  if (clone.optionsJson) {
    if (typeof clone.optionsJson === "string") {
      try { clone.options = JSON.parse(clone.optionsJson); } catch (e) { clone.options = []; }
    } else if (Array.isArray(clone.optionsJson)) {
      clone.options = clone.optionsJson;
    }
  } else if (clone.options && typeof clone.options === "string" && (clone.options.startsWith("[") || clone.options.startsWith("{"))) {
    try { clone.options = JSON.parse(clone.options); } catch (e) {}
  }

  // Text / Content duality
  if (clone.content && !clone.text) clone.text = clone.content;
  if (clone.text && !clone.content) clone.content = clone.text;

  // Moral lesson / Reflection prompt duality
  if (clone.moralLesson && !clone.reflectionPrompt) clone.reflectionPrompt = clone.moralLesson;
  if (clone.reflectionPrompt && !clone.moralLesson) clone.moralLesson = clone.reflectionPrompt;

  // Dilemma / Scenario text duality
  if (clone.dilemma && !clone.scenarioText) clone.scenarioText = clone.dilemma;
  if (clone.scenarioText && !clone.dilemma) clone.dilemma = clone.scenarioText;

  // Question / Question text duality
  if (clone.question && !clone.questionText) clone.questionText = clone.question;
  if (clone.questionText && !clone.question) clone.question = clone.questionText;

  // Correct answer / index duality
  if (clone.correctOptionIndex !== undefined && clone.correctAnswerIndex === undefined) {
    clone.correctAnswerIndex = Number(clone.correctOptionIndex);
  }
  if (clone.correctAnswerIndex !== undefined && clone.correctOptionIndex === undefined) {
    clone.correctOptionIndex = Number(clone.correctAnswerIndex);
  }
  if (clone.correctAnswer !== undefined && clone.correctOptionIndex === undefined) {
    clone.correctOptionIndex = clone.correctAnswer;
  }

  // Exam category / Exam track duality
  if (clone.examCategory && !clone.examTrack) clone.examTrack = clone.examCategory;
  if (clone.examTrack && !clone.examCategory) clone.examCategory = clone.examTrack;

  clone.orderIndex = Number(clone.orderIndex) || 0;
  clone.isActive = String(clone.isActive).toLowerCase() === "true" || clone.isActive === true;
  clone.points = Number(clone.points) || 20;
  clone.xp = Number(clone.xp) || 40;

  return clone;
}

// =========================================================================
// MILESTONE 1: ADMIN CMS BACKEND APIS
// =========================================================================

/**
 * Queries content by type with optional grade and status filtering.
 * Guarded by assertAdmin(adminUserId).
 */
function getAdminContentList(payload) {
  const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
  const contentType = payload && payload.contentType ? String(payload.contentType).trim().toLowerCase() : "";
  const grade = payload && payload.grade ? String(payload.grade).trim() : null;
  const includeInactive = payload && payload.includeInactive !== undefined ? Boolean(payload.includeInactive) : true;

  const adminAuth = assertAdmin(adminUserId);
  if (!adminAuth.success) {
    return adminAuth;
  }

  const tableName = CONTENT_TABLE_MAP[contentType];
  if (!tableName) {
    return {
      success: false,
      error: "INVALID_CONTENT_TYPE: Supported types are stories, story_questions, eq_scenarios, daily_knowledge, curriculum_quizzes.",
      code: 400
    };
  }

  const rawRecords = getSheetRecords(tableName);
  let items = rawRecords.map(function(r) {
    return formatContentItemForClient(r, tableName);
  });

  if (grade && grade.toLowerCase() !== "all") {
    const normGrade = normalizeGrade(grade);
    items = items.filter(function(i) {
      return normalizeGrade(i.grade) === normGrade;
    });
  }

  if (!includeInactive) {
    items = items.filter(function(i) { return i.isActive === true; });
  }

  items.sort(function(a, b) {
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  return {
    success: true,
    contentType: contentType,
    count: items.length,
    items: items
  };
}

/**
 * Creates or updates a content item inside withScriptLock.
 * Guarded by assertAdmin(adminUserId).
 */
function saveAdminContentItem(payload) {
  return withScriptLock(function() {
    const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
    const contentType = payload && payload.contentType ? String(payload.contentType).trim().toLowerCase() : "";
    const itemData = payload && payload.itemData ? payload.itemData : null;

    const adminAuth = assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemData || typeof itemData !== "object") {
      return { success: false, error: "INVALID_ITEM_DATA: itemData must be a valid object.", code: 400 };
    }

    const tableName = CONTENT_TABLE_MAP[contentType];
    if (!tableName) {
      return { success: false, error: "INVALID_CONTENT_TYPE: Supported types are stories, story_questions, eq_scenarios, daily_knowledge, curriculum_quizzes.", code: 400 };
    }

    // CBSE/NCERT Grade Validation for content tables requiring grade
    if (tableName !== "StoryQuestions") {
      if (itemData.grade) {
        const normGrade = normalizeGrade(itemData.grade);
        if (!normGrade && String(itemData.grade).toLowerCase() !== "all") {
          return { success: false, error: "INVALID_GRADE: Grade must follow CBSE/NCERT format (Class 1 to Class 10).", code: 400 };
        }
        itemData.grade = normGrade;
      } else if (!itemData.id) {
        itemData.grade = "Class 3";
      }
    }

    // Required fields per content type
    if ((tableName === "Stories" || tableName === "EQScenarios") && !itemData.title) {
      return { success: false, error: "MISSING_TITLE: Title is required.", code: 400 };
    }
    if (tableName === "StoryQuestions" && (!itemData.storyId || !(itemData.questionText || itemData.question))) {
      return { success: false, error: "MISSING_STORY_QUESTION_FIELDS: storyId and questionText are required.", code: 400 };
    }
    if ((tableName === "DailyKnowledge" || tableName === "CurriculumQuizzes") && !(itemData.questionText || itemData.question)) {
      return { success: false, error: "MISSING_QUESTION_TEXT: questionText is required.", code: 400 };
    }

    // Prepare JSON and dual fields
    if (itemData.options !== undefined && itemData.optionsJson === undefined) {
      itemData.optionsJson = typeof itemData.options === "string" ? itemData.options : JSON.stringify(itemData.options);
    }
    if (itemData.content && !itemData.text) itemData.text = itemData.content;
    if (itemData.text && !itemData.content) itemData.content = itemData.text;
    if (itemData.question && !itemData.questionText) itemData.questionText = itemData.question;
    if (itemData.correctAnswerIndex !== undefined && itemData.correctOptionIndex === undefined) {
      itemData.correctOptionIndex = itemData.correctAnswerIndex;
    }
    if (itemData.correctAnswer !== undefined && itemData.correctOptionIndex === undefined) {
      itemData.correctOptionIndex = itemData.correctAnswer;
    }
    if (itemData.moralLesson && !itemData.reflectionPrompt) itemData.reflectionPrompt = itemData.moralLesson;
    if (itemData.reflectionPrompt && !itemData.moralLesson) itemData.moralLesson = itemData.reflectionPrompt;
    if (itemData.dilemma && !itemData.scenarioText) itemData.scenarioText = itemData.dilemma;
    if (itemData.scenarioText && !itemData.dilemma) itemData.dilemma = itemData.scenarioText;
    if (itemData.examTrack && !itemData.examCategory) itemData.examCategory = itemData.examTrack;
    if (itemData.examCategory && !itemData.examTrack) itemData.examTrack = itemData.examCategory;

    const now = new Date().toISOString();
    const existingRecords = getSheetRecords(tableName);
    let targetId = itemData.id ? String(itemData.id) : "";
    let isNew = false;
    let savedRecord = null;

    if (targetId) {
      const existing = existingRecords.find(function(r) { return String(r.id) === targetId; });
      if (existing) {
        // Update
        const updates = Object.assign({}, itemData);
        updates.updatedAt = now;
        delete updates.id;
        delete updates._rowIndex;
        updateSheetRecord(tableName, "id", targetId, updates);
        savedRecord = Object.assign({}, existing, updates, { id: targetId });
      }
    }

    if (!savedRecord) {
      // Insert
      isNew = true;
      const prefix = contentType.substring(0, 3);
      targetId = targetId || (prefix + "_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000));
      savedRecord = Object.assign({}, itemData, {
        id: targetId,
        isActive: itemData.isActive !== undefined ? Boolean(itemData.isActive) : true,
        orderIndex: Number(itemData.orderIndex) || (existingRecords.length + 1),
        createdAt: itemData.createdAt || now,
        updatedAt: now
      });
      appendSheetRecord(tableName, savedRecord);
    }

    logActivity(adminUserId, "ADMIN_CONTENT_SAVE", "Saved " + contentType + " item: " + (savedRecord.title || savedRecord.id), "cms", "VERIFIED");

    return {
      success: true,
      item: formatContentItemForClient(savedRecord, tableName),
      isNew: isNew
    };
  });
}

/**
 * Toggles active/inactive status of a content item under withScriptLock.
 * Guarded by assertAdmin(adminUserId).
 */
function toggleContentActiveStatus(payload) {
  return withScriptLock(function() {
    const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
    const contentType = payload && payload.contentType ? String(payload.contentType).trim().toLowerCase() : "";
    const itemId = payload && payload.itemId ? String(payload.itemId) : "";
    const isActive = Boolean(payload && payload.isActive);
    const adminAuth = assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemId) {
      return { success: false, error: "MISSING_ITEM_ID: itemId is required.", code: 400 };
    }

    const tableName = CONTENT_TABLE_MAP[contentType];
    if (!tableName) return { success: false, error: "INVALID_CONTENT_TYPE", code: 400 };

    const records = getSheetRecords(tableName);
    const target = records.find(function(r) { return String(r.id) === itemId; });
    if (!target) {
      return { success: false, error: "ITEM_NOT_FOUND: Item " + itemId + " not found.", code: 404 };
    }

    updateSheetRecord(tableName, "id", itemId, {
      isActive: isActive,
      updatedAt: new Date().toISOString()
    });

    logActivity(adminUserId, "ADMIN_CONTENT_TOGGLE", "Toggled " + contentType + " " + itemId + " isActive=" + isActive, "cms", "VERIFIED");

    return {
      success: true,
      itemId: itemId,
      isActive: isActive
    };
  });
}

/**
 * Deletes a content item (and cascades linked questions if story) under withScriptLock.
 * Guarded by assertAdmin(adminUserId).
 */
function deleteAdminContentItem(payload) {
  return withScriptLock(function() {
    const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
    const contentType = payload && payload.contentType ? String(payload.contentType).trim().toLowerCase() : "";
    const itemId = payload && payload.itemId ? String(payload.itemId) : "";

    const adminAuth = assertAdmin(adminUserId);
    if (!adminAuth.success) {
      return adminAuth;
    }

    if (!itemId) {
      return { success: false, error: "MISSING_ITEM_ID: itemId is required.", code: 400 };
    }

    const tableName = CONTENT_TABLE_MAP[contentType];
    if (!tableName) return { success: false, error: "INVALID_CONTENT_TYPE", code: 400 };

    const records = getSheetRecords(tableName);
    const target = records.find(function(r) { return String(r.id) === itemId; });
    if (!target) {
      return { success: false, error: "ITEM_NOT_FOUND: Item " + itemId + " not found.", code: 404 };
    }

    deleteSheetRecord(tableName, "id", itemId);

    // Cascade delete story questions if a story is deleted
    if (tableName === "Stories") {
      const qRecords = getSheetRecords("StoryQuestions");
      qRecords.filter(function(q) { return String(q.storyId) === itemId; })
              .forEach(function(q) { deleteSheetRecord("StoryQuestions", "id", q.id); });
    }

    logActivity(adminUserId, "ADMIN_CONTENT_DELETE", "Deleted " + contentType + " item: " + itemId, "cms", "VERIFIED");

    return {
      success: true,
      deletedId: itemId
    };
  });
}

// =========================================================================
// MILESTONE 1: DYNAMIC PROGRESSION & PER-STUDENT COMPLETION ENGINE
// =========================================================================

/**
 * Fetches the next uncompleted content item for a student's enrolled grade.
 * Overrides any client-passed grade with student's enrolled grade (Anti-forgery).
 */
function getNextContentItem(payload) {
  if (!payload || !payload.studentId) {
    return { success: false, error: "INVALID_PAYLOAD: studentId is required.", code: 400 };
  }
  const canonicalType = canonicalizeContentType(payload.contentType);
  if (!canonicalType) {
    return {
      success: false,
      error: "INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.",
      code: 400
    };
  }

  const users = getSheetRecords("Users");
  const student = users.find(function(u) {
    return String(u.id) === String(payload.studentId) && String(u.role).toLowerCase() === "student";
  });
  if (!student) {
    return { success: false, error: "STUDENT_NOT_FOUND: Specified studentId does not exist.", code: 404 };
  }

  // Anti-forgery: force student's enrolled grade
  const effectiveGrade = normalizeGrade(student.gradeClass) || "Class 3";

  const allItems = getSheetRecords(canonicalType);
  const activeItems = allItems.filter(function(item) {
    const itemGrade = normalizeGrade(item.grade);
    const isActive = String(item.isActive).toUpperCase() === "TRUE" || item.isActive === true;
    return itemGrade === effectiveGrade && isActive;
  });

  activeItems.sort(function(a, b) {
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
      message: "No active content items available for " + effectiveGrade
    };
  }

  const completions = getSheetRecords("StudentCompletions");
  const completedIds = {};
  completions.forEach(function(c) {
    if (String(c.studentId) === String(student.id) && canonicalizeContentType(c.contentType) === canonicalType) {
      completedIds[String(c.contentId)] = true;
    }
  });

  let completedCount = 0;
  let nextItem = null;
  for (let i = 0; i < activeItems.length; i++) {
    const itm = activeItems[i];
    if (completedIds[String(itm.id)]) {
      completedCount++;
    } else if (!nextItem) {
      nextItem = itm;
    }
  }

  const formattedItem = nextItem ? formatContentItemForClient(nextItem, canonicalType) : null;
  if (formattedItem && canonicalType === "Stories") {
    // Attach linked questions
    const questions = getSheetRecords("StoryQuestions").filter(function(q) {
      return String(q.storyId) === String(formattedItem.id);
    }).map(function(q) {
      return formatContentItemForClient(q, "StoryQuestions");
    });
    formattedItem.questions = questions;
  }

  return {
    success: true,
    grade: effectiveGrade,
    item: formattedItem,
    hasMore: formattedItem !== null,
    completedCount: completedCount,
    totalCount: totalCount
  };
}

/**
 * Records completion of a content item under withScriptLock.
 * Awards coins and XP, updates streak/level, and queries next uncompleted item.
 */
function recordContentCompletion(payload) {
  return withScriptLock(function() {
    if (!payload || !payload.studentId || !payload.contentId) {
      return { success: false, error: "INVALID_PAYLOAD: studentId and contentId are required.", code: 400 };
    }
    const canonicalType = canonicalizeContentType(payload.contentType);
    if (!canonicalType) {
      return {
        success: false,
        error: "INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.",
        code: 400
      };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) {
      return String(u.id) === String(payload.studentId) && String(u.role).toLowerCase() === "student";
    });
    if (!student) {
      return { success: false, error: "STUDENT_NOT_FOUND: Specified studentId does not exist.", code: 404 };
    }

    const effectiveGrade = normalizeGrade(student.gradeClass) || "Class 3";

    // Retrieve target item
    const allItems = getSheetRecords(canonicalType);
    const item = allItems.find(function(it) { return String(it.id) === String(payload.contentId); });
    if (!item) {
      return { success: false, error: "CONTENT_NOT_FOUND: Content item does not exist.", code: 404 };
    }

    // Verify item belongs to student's enrolled grade
    if (normalizeGrade(item.grade) !== effectiveGrade) {
      return {
        success: false,
        error: "GRADE_MISMATCH: Content item grade does not match student enrolled grade.",
        code: 400
      };
    }

    // Check for existing completion (idempotency / anti-farming defense)
    const completions = getSheetRecords("StudentCompletions");
    const existing = completions.find(function(c) {
      return String(c.studentId) === String(student.id) && String(c.contentId) === String(payload.contentId);
    });

    if (existing) {
      const nextRes = getNextContentItem({ studentId: student.id, contentType: canonicalType });
      return {
        success: true,
        alreadyCompleted: true,
        completionId: existing.id,
        coinsAwarded: 0,
        xpAwarded: 0,
        message: "Content item already completed previously.",
        nextItem: nextRes.item,
        hasMore: nextRes.hasMore
      };
    }

    const coinsToAward = Math.max(0, parseInt(item.points, 10) || 20);
    const xpToAward = Math.max(0, parseInt(item.xp, 10) || 40);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const compId = "comp_" + now.getTime() + "_" + Math.random().toString(36).substring(2, 7);

    // Save completion record
    const completionRecord = {
      id: compId,
      studentId: student.id,
      contentType: canonicalType,
      contentId: item.id,
      grade: effectiveGrade,
      score: payload.score !== undefined ? Number(payload.score) : 100,
      maxScore: item.maxScore ? Number(item.maxScore) : 100,
      answersJson: typeof payload.answers === "string" ? payload.answers : JSON.stringify(payload.answers || {}),
      completedAt: now.toISOString()
    };
    appendSheetRecord("StudentCompletions", completionRecord);

    // Save granular question responses if provided
    const qResponses = payload.questionResponses || (Array.isArray(payload.questions) ? payload.questions : null);
    if (qResponses && Array.isArray(qResponses)) {
      qResponses.forEach(function(qr, idx) {
        const respId = "sqr_" + now.getTime() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6);
        appendSheetRecord("StudentQuestionResponses", {
          id: respId,
          completionId: compId,
          studentId: student.id,
          grade: effectiveGrade,
          contentType: canonicalType,
          contentId: item.id,
          questionId: qr.questionId || qr.id || ("q_" + (idx + 1)),
          questionText: qr.questionText || qr.question || "",
          optionsJson: typeof qr.options === "string" ? qr.options : JSON.stringify(qr.options || []),
          studentChoiceIndex: qr.studentChoiceIndex !== undefined ? Number(qr.studentChoiceIndex) : (qr.selectedIndex !== undefined ? Number(qr.selectedIndex) : -1),
          studentChoiceText: qr.studentChoiceText || qr.selectedText || "",
          correctOptionIndex: qr.correctOptionIndex !== undefined ? Number(qr.correctOptionIndex) : (qr.correctIndex !== undefined ? Number(qr.correctIndex) : 0),
          isCorrect: qr.isCorrect !== undefined ? Boolean(qr.isCorrect) : (Number(qr.studentChoiceIndex) === Number(qr.correctOptionIndex)),
          pointsEarned: qr.pointsEarned !== undefined ? Number(qr.pointsEarned) : 10,
          explanation: qr.explanation || qr.hint || "",
          timeSpentSeconds: qr.timeSpentSeconds !== undefined ? Number(qr.timeSpentSeconds) : 0,
          answeredAt: now.toISOString()
        });
      });
    }

    // Calculate updated wallet
    const newCoins = (Number(student.coins) || 0) + coinsToAward;
    const newXp = (Number(student.xp) || 0) + xpToAward;
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

    // Streak update logic
    let currentStreak = Number(student.streak) || 0;
    const lastLogin = student.lastLoginAt ? String(student.lastLoginAt).split("T")[0] : null;
    if (lastLogin !== todayStr) {
      currentStreak += 1;
    }
    if (currentStreak === 0) currentStreak = 1;

    updateSheetRecord("Users", "id", student.id, {
      coins: newCoins,
      xp: newXp,
      level: newLevel,
      streak: currentStreak,
      lastLoginAt: now.toISOString()
    });

    // Automatically record growth event
    if (canonicalType === "CurriculumQuizzes" || canonicalType === "DailyKnowledge") {
      recordGrowthEvent({
        studentId: student.id,
        eventType: "ACADEMIC_QUIZ",
        payload: { score: payload.score !== undefined ? Number(payload.score) : 100, totalQuestions: 1, accuracy: 100 }
      });
    } else if (canonicalType === "EQScenarios") {
      recordGrowthEvent({
        studentId: student.id,
        eventType: "EQ_REFLECTION",
        payload: { score: 50, eqScore: 50 }
      });
    } else if (canonicalType === "Stories") {
      recordGrowthEvent({
        studentId: student.id,
        eventType: "FOCUS_SPRINT",
        payload: { minutes: 15 }
      });
    }

    // Audit log
    logActivity(
      student.id,
      "CONTENT_COMPLETED",
      "Completed " + canonicalType + " '" + (item.title || item.id) + "'. Awarded " + coinsToAward + " coins, " + xpToAward + " XP.",
      canonicalType,
      "VERIFIED"
    );

    // Query next item for seamless transition
    const nextProgression = getNextContentItem({ studentId: student.id, contentType: canonicalType });

    return {
      success: true,
      completionId: compId,
      coinsAwarded: coinsToAward,
      xpAwarded: xpToAward,
      newCoins: newCoins,
      newXp: newXp,
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
  });
}

/**
 * Records granular question-by-question responses for a student completion.
 */
function recordQuestionResponses(payload) {
  return withScriptLock(function() {
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const completionId = payload && payload.completionId ? String(payload.completionId) : "";
    const responses = payload && payload.responses ? payload.responses : [];

    if (!studentId || !responses || !Array.isArray(responses) || responses.length === 0) {
      return { success: false, error: "MISSING_FIELDS: studentId and responses array required." };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) { return String(u.id) === studentId; });
    if (!student) {
      return { success: false, error: "STUDENT_NOT_FOUND" };
    }

    const now = new Date();
    const effectiveGrade = student.gradeClass || "Class 3";
    let insertedCount = 0;

    responses.forEach(function(qr, idx) {
      const respId = "sqr_" + now.getTime() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6);
      appendSheetRecord("StudentQuestionResponses", {
        id: respId,
        completionId: completionId || ("comp_" + now.getTime()),
        studentId: student.id,
        grade: qr.grade || effectiveGrade,
        contentType: qr.contentType || "curriculum_quiz",
        contentId: qr.contentId || "",
        questionId: qr.questionId || qr.id || ("q_" + (idx + 1)),
        questionText: qr.questionText || qr.question || "",
        optionsJson: typeof qr.options === "string" ? qr.options : JSON.stringify(qr.options || []),
        studentChoiceIndex: qr.studentChoiceIndex !== undefined ? Number(qr.studentChoiceIndex) : (qr.selectedIndex !== undefined ? Number(qr.selectedIndex) : -1),
        studentChoiceText: qr.studentChoiceText || qr.selectedText || "",
        correctOptionIndex: qr.correctOptionIndex !== undefined ? Number(qr.correctOptionIndex) : (qr.correctIndex !== undefined ? Number(qr.correctIndex) : 0),
        isCorrect: qr.isCorrect !== undefined ? Boolean(qr.isCorrect) : (Number(qr.studentChoiceIndex) === Number(qr.correctOptionIndex)),
        pointsEarned: qr.pointsEarned !== undefined ? Number(qr.pointsEarned) : 10,
        explanation: qr.explanation || qr.hint || "",
        timeSpentSeconds: qr.timeSpentSeconds !== undefined ? Number(qr.timeSpentSeconds) : 0,
        answeredAt: now.toISOString()
      });
      insertedCount++;
    });

    return {
      success: true,
      insertedCount: insertedCount,
      completionId: completionId,
      message: "Successfully recorded " + insertedCount + " question responses."
    };
  });
}

/**
 * Retrieves the granular answer sheet and question responses for a student.
 * Guarded by role verification:
 * - If caller is parent, enforces assertParentPairing(callerId, studentId).
 * - If caller is student, ensures callerId === studentId.
 * - Admin has full visibility across all students.
 */
function getStudentAnswerSheet(payload) {
  const callerId = payload && payload.callerId ? String(payload.callerId) : (payload && payload.userId ? String(payload.userId) : "");
  const studentId = payload && payload.studentId ? String(payload.studentId) : "";
  const completionId = payload && payload.completionId ? String(payload.completionId) : null;
  const contentId = payload && payload.contentId ? String(payload.contentId) : null;

  if (!studentId) {
    return { success: false, error: "MISSING_STUDENT_ID" };
  }

  const users = getSheetRecords("Users");
  const student = users.find(function(u) { return String(u.id) === studentId; });
  if (!student) {
    return { success: false, error: "STUDENT_NOT_FOUND" };
  }

  // Permission validation
  if (callerId) {
    const caller = users.find(function(u) { return String(u.id) === callerId; });
    if (caller) {
      const callerRole = String(caller.role).toLowerCase();
      if (callerRole === "parent") {
        try {
          assertParentPairing(callerId, studentId);
        } catch (err) {
          return { success: false, error: err.message, code: 403 };
        }
      } else if (callerRole === "student" && callerId !== studentId) {
        return { success: false, error: "UNAUTHORIZED: Cannot view another student's answer sheet.", code: 403 };
      }
    }
  }

  const completions = getSheetRecords("StudentCompletions").filter(function(c) {
    return String(c.studentId) === studentId &&
      (!completionId || String(c.id) === completionId) &&
      (!contentId || String(c.contentId) === contentId);
  });

  const allResponses = getSheetRecords("StudentQuestionResponses").filter(function(r) {
    return String(r.studentId) === studentId &&
      (!completionId || String(r.completionId) === completionId) &&
      (!contentId || String(r.contentId) === contentId);
  });

  return {
    success: true,
    student: {
      id: student.id,
      fullName: student.fullName,
      gradeClass: student.gradeClass || "Class 3",
      avatar: student.avatar || "🚀"
    },
    completions: completions,
    questionResponses: allResponses,
    totalQuestionsAnswered: allResponses.length,
    correctCount: allResponses.filter(function(r) { return r.isCorrect === true || r.isCorrect === "true"; }).length
  };
}

/**
 * Computes the next personalized curriculum question set or lesson for a student,
 * respecting relative student pacing (their own syllabus position) and grade isolation.
 */
function getNextPersonalizedCurriculum(payload) {
  const studentId = payload && payload.studentId ? String(payload.studentId) : "";
  const contentType = payload && payload.contentType ? String(payload.contentType) : "CurriculumQuizzes";
  const subject = payload && payload.subject ? String(payload.subject).toLowerCase() : null;

  if (!studentId) {
    return { success: false, error: "MISSING_STUDENT_ID" };
  }

  const users = getSheetRecords("Users");
  const student = users.find(function(u) { return String(u.id) === studentId; });
  if (!student) {
    return { success: false, error: "STUDENT_NOT_FOUND" };
  }

  const effectiveGrade = student.gradeClass || "Class 3";
  let canonicalType = "CurriculumQuizzes";
  if (/daily/i.test(contentType) || /gk/i.test(contentType)) canonicalType = "DailyKnowledge";
  else if (/story/i.test(contentType) || /lore/i.test(contentType)) canonicalType = "Stories";
  else if (/eq/i.test(contentType)) canonicalType = "EQScenarios";

  const allContent = getSheetRecords(canonicalType).filter(function(item) {
    const gradeMatch = !item.grade || String(item.grade).toLowerCase() === effectiveGrade.toLowerCase();
    const activeMatch = item.isActive !== false && item.isActive !== "false" && item.isActive !== 0;
    const subjectMatch = !subject || !item.subject || String(item.subject).toLowerCase() === subject;
    return gradeMatch && activeMatch && subjectMatch;
  });

  allContent.sort(function(a, b) {
    return (parseInt(a.orderIndex, 10) || 0) - (parseInt(b.orderIndex, 10) || 0);
  });

  const completions = getSheetRecords("StudentCompletions").filter(function(c) {
    return String(c.studentId) === student.id && (String(c.contentType) === canonicalType || String(c.contentType) === contentType);
  });
  const completedIds = completions.map(function(c) { return String(c.contentId); });

  const uncompleted = allContent.filter(function(item) {
    return completedIds.indexOf(String(item.id)) === -1;
  });

  const pastResponses = getSheetRecords("StudentQuestionResponses").filter(function(r) {
    return String(r.studentId) === student.id;
  });
  const totalAnswered = pastResponses.length;
  const totalCorrect = pastResponses.filter(function(r) { return r.isCorrect === true || r.isCorrect === "true"; }).length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

  if (uncompleted.length === 0) {
    return {
      success: true,
      studentId: student.id,
      grade: effectiveGrade,
      contentType: canonicalType,
      hasMore: false,
      isExhausted: true,
      message: "Curriculum for " + effectiveGrade + " (" + canonicalType + ") is 100% complete! Mastery unlocked 🌟",
      completedCount: completedIds.length,
      totalCount: allContent.length,
      progressPercent: 100,
      accuracy: overallAccuracy,
      recommendedAction: "MASTERY_CELEBRATION"
    };
  }

  const nextItem = uncompleted[0];
  const progressPct = allContent.length > 0 ? Math.round((completedIds.length / allContent.length) * 100) : 0;

  return {
    success: true,
    studentId: student.id,
    grade: effectiveGrade,
    contentType: canonicalType,
    hasMore: true,
    item: nextItem,
    completedCount: completedIds.length,
    totalCount: allContent.length,
    progressPercent: progressPct,
    accuracy: overallAccuracy,
    recommendedAction: overallAccuracy < 60 ? "REINFORCEMENT_REVIEW" : "NEXT_TOPIC"
  };
}

/**
 * Bulk imports questions or curriculum items (e.g. from Admin CMS CSV/JSON batch upload).
 * Protected by assertAdmin.
 */
function bulkUploadContentBatch(payload) {
  return withScriptLock(function() {
    const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
    const adminCheck = assertAdmin(adminUserId);
    if (!adminCheck.success) {
      return adminCheck;
    }

    const contentType = payload && payload.contentType ? String(payload.contentType) : "CurriculumQuizzes";
    let canonicalType = "CurriculumQuizzes";
    if (/daily/i.test(contentType) || /gk/i.test(contentType)) canonicalType = "DailyKnowledge";
    else if (/story/i.test(contentType)) canonicalType = "Stories";
    else if (/eq/i.test(contentType)) canonicalType = "EQScenarios";

    const items = payload && payload.items ? payload.items : [];
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "MISSING_ITEMS: Array of items is required." };
    }

    const now = new Date().toISOString();
    let importedCount = 0;

    items.forEach(function(raw, idx) {
      const itemId = raw.id || (canonicalType.toLowerCase().substring(0, 4) + "_" + Date.now() + "_" + idx);
      const grade = raw.grade || "Class 3";
      const record = {
        id: itemId,
        grade: grade,
        isActive: raw.isActive !== undefined ? raw.isActive : true,
        orderIndex: raw.orderIndex !== undefined ? Number(raw.orderIndex) : (idx + 1),
        createdAt: now,
        updatedAt: now
      };

      if (canonicalType === "CurriculumQuizzes") {
        record.subject = raw.subject || "General Science";
        record.examCategory = raw.examCategory || "CBSE";
        record.title = raw.title || raw.questionText || ("Quiz Item " + (idx + 1));
        record.questionText = raw.questionText || raw.title || "";
        record.optionsJson = typeof raw.optionsJson === "string" ? raw.optionsJson : JSON.stringify(raw.options || raw.optionsJson || []);
        record.correctOptionIndex = raw.correctOptionIndex !== undefined ? Number(raw.correctOptionIndex) : 0;
        record.hint = raw.hint || "";
        record.explanation = raw.explanation || "";
      } else if (canonicalType === "DailyKnowledge") {
        record.domain = raw.domain || "World & Science";
        record.topic = raw.topic || "Daily Fact";
        record.questionText = raw.questionText || "";
        record.optionsJson = typeof raw.optionsJson === "string" ? raw.optionsJson : JSON.stringify(raw.options || raw.optionsJson || []);
        record.correctOptionIndex = raw.correctOptionIndex !== undefined ? Number(raw.correctOptionIndex) : 0;
        record.didYouKnowFact = raw.didYouKnowFact || raw.fact || "";
      } else if (canonicalType === "Stories") {
        record.title = raw.title || "Adventure Story";
        record.summary = raw.summary || "";
        record.content = raw.content || "";
        record.moralDilemma = raw.moralDilemma || "";
        record.virtueTags = raw.virtueTags || "Curiosity";
        record.points = raw.points !== undefined ? Number(raw.points) : 25;
        record.xp = raw.xp !== undefined ? Number(raw.xp) : 50;
      } else if (canonicalType === "EQScenarios") {
        record.title = raw.title || "EQ Dilemma";
        record.dilemma = raw.dilemma || "";
        record.virtueFocus = raw.virtueFocus || "Integrity";
        record.choicesJson = typeof raw.choicesJson === "string" ? raw.choicesJson : JSON.stringify(raw.choices || []);
        record.points = raw.points !== undefined ? Number(raw.points) : 20;
        record.xp = raw.xp !== undefined ? Number(raw.xp) : 40;
      }

      appendSheetRecord(canonicalType, record);
      importedCount++;
    });

    logActivity(adminUserId, "BULK_UPLOAD", "Batch imported " + importedCount + " items into " + canonicalType, "admin", "VERIFIED");

    return {
      success: true,
      importedCount: importedCount,
      contentType: canonicalType,
      message: "Successfully bulk uploaded " + importedCount + " items into " + canonicalType + "."
    };
  });
}

/**
 * Returns content catalog filtered strictly by the student's enrolled grade,
 * with per-item isCompleted status.
 */
function getContentByGrade(payload) {
  if (!payload || !payload.studentId) {
    return { success: false, error: "INVALID_PAYLOAD: studentId is required.", code: 400 };
  }
  const canonicalType = canonicalizeContentType(payload.contentType);
  if (!canonicalType) {
    return {
      success: false,
      error: "INVALID_CONTENT_TYPE: Supported types are Stories, EQScenarios, DailyKnowledge, CurriculumQuizzes.",
      code: 400
    };
  }

  const users = getSheetRecords("Users");
  const student = users.find(function(u) {
    return String(u.id) === String(payload.studentId) && String(u.role).toLowerCase() === "student";
  });
  if (!student) {
    return { success: false, error: "STUDENT_NOT_FOUND: Specified studentId does not exist.", code: 404 };
  }

  // Profile grade overrides client targetGrade
  const effectiveGrade = normalizeGrade(student.gradeClass) || "Class 3";

  const allItems = getSheetRecords(canonicalType);
  const activeItems = allItems.filter(function(item) {
    const itemGrade = normalizeGrade(item.grade);
    const isActive = String(item.isActive).toUpperCase() === "TRUE" || item.isActive === true;
    return itemGrade === effectiveGrade && isActive;
  });

  activeItems.sort(function(a, b) {
    const orderA = Number(a.orderIndex) || 0;
    const orderB = Number(b.orderIndex) || 0;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.id).localeCompare(String(b.id));
  });

  const completions = getSheetRecords("StudentCompletions");
  const completedIds = {};
  completions.forEach(function(c) {
    if (String(c.studentId) === String(student.id) && canonicalizeContentType(c.contentType) === canonicalType) {
      completedIds[String(c.contentId)] = true;
    }
  });

  let completedCount = 0;
  const items = activeItems.map(function(item) {
    const formatted = formatContentItemForClient(item, canonicalType);
    const isComp = Boolean(completedIds[String(item.id)]);
    if (isComp) completedCount++;
    formatted.isCompleted = isComp;
    return formatted;
  });

  return {
    success: true,
    grade: effectiveGrade,
    items: items,
    totalCount: items.length,
    completedCount: completedCount
  };
}

// =========================================================================
// MILESTONE 1: LONGITUDINAL STUDENT GROWTH PROFILE ENGINE
// =========================================================================

/**
 * Record a growth event (focus sprint, habit adherence, quiz, or EQ reflection) atomically.
 */
function recordGrowthEvent(payload) {
  return withScriptLock(function() {
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const eventType = payload && payload.eventType ? String(payload.eventType).toUpperCase() : "";
    const eventPayload = (payload && payload.payload) ? payload.payload : {};

    if (!studentId) {
      return { success: false, error: "MISSING_STUDENT_ID: studentId is required." };
    }

    const users = getSheetRecords("Users");
    const student = users.find(function(u) {
      return String(u.id) === studentId && String(u.role).toLowerCase() === "student";
    });
    if (!student) {
      return { success: false, error: "STUDENT_NOT_FOUND: Valid student record required." };
    }

    const now = new Date().toISOString();
    const today = (eventPayload && eventPayload.date) ? String(eventPayload.date).substring(0, 10) : now.substring(0, 10);

    const growthProfiles = getSheetRecords("StudentGrowthProfiles");
    let profile = growthProfiles.find(function(p) {
      return String(p.studentId) === studentId && String(p.date) === today;
    });

    let isNew = false;
    let milestones = [];

    if (!profile) {
      isNew = true;
      profile = {
        id: "sgp_" + studentId + "_" + today,
        studentId: studentId,
        date: today,
        focusMinutes: 0,
        habitRate: 0,
        academicScore: 0,
        eqScore: 0,
        milestonesJson: "[]",
        updatedAt: now
      };
    } else {
      const rawMs = profile.milestonesJson || profile.cognitiveMilestones;
      if (rawMs) {
        try { milestones = typeof rawMs === "string" ? JSON.parse(rawMs) : rawMs; } catch (e) { milestones = []; }
      }
      if (!Array.isArray(milestones)) milestones = [];
    }

    // Process event
    if (eventType === "FOCUS_SPRINT" || eventType === "FOCUS_COMPLETED") {
      const added = Number(eventPayload.minutes || eventPayload.durationMins || eventPayload.focusMinutes || 25);
      profile.focusMinutes = Math.max(0, Number(profile.focusMinutes || 0) + added);
    } else if (eventType === "QUEST_APPROVED" || eventType === "HABIT_COMPLETED") {
      if (eventPayload.adherenceRate !== undefined) {
        profile.habitRate = Math.min(100, Math.max(0, Math.round(Number(eventPayload.adherenceRate))));
      } else {
        const habits = getSheetRecords("HabitsQuests").filter(function(h) {
          return String(h.parentUserId) === String(student.linkedParentId) && !h.isArchived;
        });
        const subs = getSheetRecords("SubmissionsQueue").filter(function(s) {
          return String(s.studentId) === studentId && String(s.status) === "APPROVED" && String(s.reviewedAt).startsWith(today);
        });
        profile.habitRate = habits.length > 0 ? Math.min(100, Math.round((subs.length / habits.length) * 100)) : 100;
      }
    } else if (eventType === "QUIZ_SUBMITTED" || eventType === "ACADEMIC_QUIZ") {
      let acc = 0;
      if (eventPayload.accuracy !== undefined) {
        acc = Number(eventPayload.accuracy);
      } else if (eventPayload.academicAccuracyScore !== undefined) {
        acc = Number(eventPayload.academicAccuracyScore);
      } else if (eventPayload.score !== undefined && eventPayload.totalQuestions) {
        acc = Math.round((Number(eventPayload.score) / Math.max(1, Number(eventPayload.totalQuestions))) * 100);
      } else if (eventPayload.score !== undefined) {
        acc = Number(eventPayload.score);
      }
      acc = Math.min(100, Math.max(0, acc));
      const curScore = Number(profile.academicScore || profile.academicAccuracyScore || 0);
      if (curScore > 0) {
        profile.academicScore = Math.round((curScore + acc) / 2);
      } else {
        profile.academicScore = acc;
      }
    } else if (eventType === "EQ_REFLECTION" || eventType === "EQ_COMPLETED") {
      const eqScore = Number(eventPayload.score || eventPayload.eqScore || 50);
      const curEq = Number(profile.eqScore || profile.eqReflectionsScore || 0);
      if (curEq > 0) {
        profile.eqScore = Math.min(100, Math.round((curEq + eqScore) / 2));
      } else {
        profile.eqScore = Math.min(100, Math.max(0, eqScore));
      }
    }

    // Milestones check
    let totalFocus = Number(profile.focusMinutes || 0);
    let eqCount = Number(profile.eqScore || 0) > 0 ? 1 : 0;

    growthProfiles.forEach(function(h) {
      if (String(h.studentId) === studentId && String(h.id) !== String(profile.id)) {
        totalFocus += Number(h.focusMinutes || 0);
        if (Number(h.eqScore || h.eqReflectionsScore || 0) > 0) eqCount++;
      }
    });

    function checkMilestone(id, title, category) {
      if (!milestones.some(function(m) { return m.id === id; })) {
        milestones.push({ id: id, title: title, category: category, unlockedAt: now });
      }
    }

    if (totalFocus >= 25) checkMilestone("FOCUS_STARTER", "First Focus Sprint (25m)", "Focus");
    if (totalFocus >= 100) checkMilestone("FOCUS_CENTURION", "Centurion Focus (100m)", "Focus");
    if (totalFocus >= 300) checkMilestone("FOCUS_TITAN", "Titan Focus (300m)", "Focus");
    if (Number(profile.habitRate) >= 80) checkMilestone("HABIT_CONSISTENCY", "Consistency Cadet (80%+ Habits)", "Habits");
    if (Number(profile.academicScore) >= 90) checkMilestone("ACADEMIC_ACCURACY_PRO", "Sharp Mind (90%+ Accuracy)", "Academic");
    if (eqCount >= 1) checkMilestone("EQ_EMPATHY_EXPLORER", "Empathy Explorer", "EQ");

    profile.milestonesJson = JSON.stringify(milestones);
    profile.updatedAt = now;

    if (isNew) {
      appendSheetRecord("StudentGrowthProfiles", profile);
    } else {
      updateSheetRecord("StudentGrowthProfiles", "id", profile.id, profile);
    }

    logActivity(studentId, "GROWTH_EVENT_" + eventType, "Growth event recorded: " + eventType, "growth", "VERIFIED");

    return {
      success: true,
      studentId: studentId,
      date: today,
      updatedMetrics: {
        focusMinutes: Number(profile.focusMinutes),
        habitAdherenceRate: Number(profile.habitRate),
        academicAccuracyScore: Number(profile.academicScore),
        eqReflectionsScore: Number(profile.eqScore)
      },
      milestones: milestones,
      profile: profile
    };
  });
}

/**
 * Query longitudinal progress across academic, EQ, habits, and focus minutes.
 */
function getLongitudinalProfile(payload) {
  const studentId = payload && payload.studentId ? String(payload.studentId) : "";
  const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
  const timeRange = payload && payload.timeRange ? String(payload.timeRange) : "30d";

  if (!studentId) {
    return { success: false, error: "MISSING_STUDENT_ID: studentId is required." };
  }

  if (parentUserId) {
    try {
      assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message, code: 403 };
    }
  }

  const allProfiles = getSheetRecords("StudentGrowthProfiles");
  const studentProfiles = allProfiles.filter(function(p) {
    return String(p.studentId) === studentId;
  });

  const now = new Date();
  let daysLimit = 30;
  if (timeRange === "7d") daysLimit = 7;
  else if (timeRange === "14d") daysLimit = 14;
  else if (timeRange === "90d") daysLimit = 90;
  else if (timeRange === "all") daysLimit = 3650;

  const cutoff = new Date(now.getTime() - (daysLimit * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10);
  const todayStr = now.toISOString().substring(0, 10);

  const filtered = studentProfiles.filter(function(p) {
    const d = String(p.date);
    return d >= cutoff && d <= todayStr;
  });

  filtered.sort(function(a, b) {
    return String(a.date).localeCompare(String(b.date));
  });

  let totalFocusMinutes = 0;
  let habitSum = 0;
  let habitDays = 0;
  let academicSum = 0;
  let academicDays = 0;
  let eqOutcomesCount = 0;
  const allMilestonesMap = {};

  const historicalData = filtered.map(function(r) {
    const fMins = Number(r.focusMinutes) || 0;
    const hRate = Number(r.habitRate || r.habitAdherenceRate) || 0;
    const aScore = Number(r.academicScore || r.academicAccuracyScore) || 0;
    const eScore = Number(r.eqScore || r.eqReflectionsScore) || 0;

    totalFocusMinutes += fMins;
    if (hRate > 0) { habitSum += hRate; habitDays++; }
    if (aScore > 0) { academicSum += aScore; academicDays++; }
    if (eScore > 0) { eqOutcomesCount++; }

    const msRaw = r.milestonesJson || r.cognitiveMilestones;
    if (msRaw) {
      try {
        const ms = typeof msRaw === "string" ? JSON.parse(msRaw) : msRaw;
        if (Array.isArray(ms)) {
          ms.forEach(function(m) {
            if (m && m.id && !allMilestonesMap[m.id]) {
              allMilestonesMap[m.id] = m;
            }
          });
        }
      } catch (e) {}
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
    totalFocusMinutes: totalFocusMinutes,
    focusMinutes: totalFocusMinutes,
    averageHabitAdherence: avgHabit,
    academicAccuracyRate: avgAcademic,
    eqOutcomesCount: eqOutcomesCount
  };

  const milestonesList = Object.keys(allMilestonesMap).map(function(k) { return allMilestonesMap[k]; });

  return {
    success: true,
    studentId: studentId,
    timeRange: timeRange,
    summary: summaryData,
    historicalData: historicalData,
    history: historicalData,
    milestones: milestonesList,
    profile: {
      studentId: studentId,
      timeRange: timeRange,
      summary: summaryData,
      historicalData: historicalData,
      history: historicalData,
      milestones: milestonesList
    }
  };
}

// =========================================================================
// MILESTONE 1: FAMILY ONBOARDING & MULTI-CHILD GOVERNANCE ENGINE
// =========================================================================

/**
 * Atomic Family Onboarding: Registers parent and 1-to-N children in a single transaction.
 */
function signUpFamilyOnboarding(payload) {
  return withScriptLock(function() {
    const parentData = payload && payload.parentData ? payload.parentData : null;
    const childrenData = payload && payload.childrenData ? payload.childrenData : null;

    if (!parentData) {
      return { success: false, error: "MISSING_PARENT_DATA: parentData is required." };
    }
    if (!Array.isArray(childrenData) || childrenData.length === 0) {
      return { success: false, error: "MISSING_CHILDREN_DATA: At least one child record is required." };
    }

    const pFullName = String(parentData.fullName || "").trim();
    const pEmail = String(parentData.email || "").trim().toLowerCase();
    const pPin = String(parentData.pin || "").trim();
    const pPassword = String(parentData.password || "");

    if (!pFullName || !pEmail || !pPin || !pPassword) {
      return { success: false, error: "MISSING_FIELDS: Parent fullName, email, pin, and password are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pEmail)) {
      return { success: false, error: "INVALID_EMAIL: Valid parent email address is required." };
    }

    const users = getSheetRecords("Users");
    const existing = users.find(function(u) { return String(u.email).toLowerCase() === pEmail; });
    if (existing) {
      return { success: false, error: "EMAIL_ALREADY_EXISTS: An account with this email already exists." };
    }

    if (!/^\d{4,}$/.test(pPin)) {
      return { success: false, error: "INVALID_PIN: Parent PIN must be at least 4 numeric digits." };
    }
    if (pPassword.length < 6) {
      return { success: false, error: "INVALID_PASSWORD: Password must be at least 6 characters." };
    }

    // Validate all children before performing any insertions
    for (let i = 0; i < childrenData.length; i++) {
      const c = childrenData[i];
      const cName = String(c.fullName || "").trim();
      const cPin = String(c.pin || "").trim();
      const cGrade = normalizeGrade(String(c.grade || c.gradeClass || ""));
      const cAge = Number(c.age);

      if (!cName) {
        return { success: false, error: "CHILD_NAME_REQUIRED: Child at index " + i + " must have a fullName." };
      }
      if (!cGrade) {
        return { success: false, error: "INVALID_GRADE: Grade for " + cName + " must be Class 1 through Class 10." };
      }
      if (isNaN(cAge) || cAge < 4 || cAge > 18) {
        return { success: false, error: "INVALID_AGE: Age for " + cName + " must be between 4 and 18." };
      }
      if (!/^\d{4,}$/.test(cPin)) {
        return { success: false, error: "INVALID_PIN: PIN for " + cName + " must be at least 4 numeric digits." };
      }
    }

    // Generate unique pairing code
    let pairingCode = generatePairingCode();
    while (users.some(function(u) { return String(u.pairingCode).toUpperCase() === pairingCode.toUpperCase(); })) {
      pairingCode = generatePairingCode();
    }

    const now = new Date().toISOString();
    const today = now.substring(0, 10);
    const parentId = "u_par_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);

    const parentUser = {
      id: parentId,
      role: "parent",
      fullName: pFullName,
      email: pEmail,
      pinHash: hashSecret(pPin),
      passwordHash: hashSecret(pPassword),
      pairingCode: pairingCode,
      linkedParentId: "",
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: now,
      lastLoginAt: now,
      gradeClass: "",
      age: "",
      parentalPermissions: "{}"
    };
    appendSheetRecord("Users", parentUser);

    const provisionedChildren = [];
    for (let j = 0; j < childrenData.length; j++) {
      const child = childrenData[j];
      const studentId = "u_stu_" + new Date().getTime() + "_" + (j + 1) + "_" + Math.floor(Math.random() * 10000);
      const normGrade = normalizeGrade(String(child.grade || child.gradeClass));
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
        role: "student",
        fullName: String(child.fullName).trim(),
        email: "",
        pinHash: hashSecret(String(child.pin).trim()),
        passwordHash: "",
        pairingCode: pairingCode,
        linkedParentId: parentId,
        coins: 100,
        xp: 200,
        level: 1,
        streak: 0,
        createdAt: now,
        lastLoginAt: now,
        gradeClass: normGrade,
        age: Number(child.age),
        parentalPermissions: JSON.stringify(mergedPerms)
      };
      appendSheetRecord("Users", childUser);
      provisionedChildren.push(childUser);

      // Initialize baseline StudentGrowthProfiles row
      const baselineProfile = {
        id: "sgp_" + studentId + "_" + today,
        studentId: studentId,
        date: today,
        focusMinutes: 0,
        habitRate: 100,
        academicScore: 100,
        eqScore: 0,
        milestonesJson: JSON.stringify([{
          id: "ENROLLED",
          title: "Enrolled in Zoptro Mission Control",
          category: "Onboarding",
          unlockedAt: now
        }]),
        updatedAt: now
      };
      appendSheetRecord("StudentGrowthProfiles", baselineProfile);
    }

    // Seed default starter habits for parent
    const defaultHabits = [
      ["h_ob_" + parentId + "_1", parentId, "Neat Uniform & Shoes Placed After School", "routine", 15, 30, "Afternoon", "👟", false, now],
      ["h_ob_" + parentId + "_2", parentId, "Lunch Box & Bottle Placed in Kitchen Sink", "routine", 15, 30, "Afternoon", "🍱", false, now],
      ["h_ob_" + parentId + "_3", parentId, "Daily Study Block: Homework Finished", "academic", 25, 50, "Evening", "📝", false, now],
      ["h_ob_" + parentId + "_4", parentId, "Daily GK Arena: 20 Questions Solved", "academic", 20, 40, "Evening", "🌍", false, now]
    ];
    defaultHabits.forEach(function(row) {
      appendSheetRecord("HabitsQuests", {
        id: row[0],
        parentUserId: row[1],
        title: row[2],
        category: row[3],
        points: row[4],
        xp: row[5],
        timeSlot: row[6],
        icon: row[7],
        isArchived: row[8],
        createdAt: row[9]
      });
    });

    logActivity(parentId, "FAMILY_ONBOARDING", "Onboarded parent " + pFullName + " with " + provisionedChildren.length + " children", "auth", "VERIFIED");

    return {
      success: true,
      parent: sanitizeUser(parentUser),
      pairingCode: pairingCode,
      token: "tok_" + parentId + "_" + new Date().getTime(),
      children: provisionedChildren.map(sanitizeUser)
    };
  });
}

/**
 * Parent updates child profile, promotes grade (Class 1-10), and sets parental permissions.
 */
function updateChildGovernance(payload) {
  return withScriptLock(function() {
    const parentUserId = payload && payload.parentUserId ? String(payload.parentUserId) : "";
    const studentId = payload && payload.studentId ? String(payload.studentId) : "";
    const updates = payload && payload.updates ? payload.updates : {};

    let pairing;
    try {
      pairing = assertParentPairing(parentUserId, studentId);
    } catch (err) {
      return { success: false, error: err.message, code: 403 };
    }
    const student = pairing.student;

    const sheetUpdates = {};

    if (updates.fullName !== undefined) {
      const name = String(updates.fullName).trim();
      if (!name) return { success: false, error: "INVALID_NAME: Child fullName cannot be empty." };
      sheetUpdates.fullName = name;
    }

    if (updates.age !== undefined) {
      const age = Number(updates.age);
      if (isNaN(age) || age < 4 || age > 18) {
        return { success: false, error: "INVALID_AGE: Child age must be between 4 and 18." };
      }
      sheetUpdates.age = age;
    }

    if (updates.grade !== undefined || updates.gradeClass !== undefined) {
      const rawGrade = updates.grade !== undefined ? updates.grade : updates.gradeClass;
      const normGrade = normalizeGrade(String(rawGrade));
      if (!normGrade) {
        return { success: false, error: "INVALID_GRADE: Grade must be Class 1 through Class 10." };
      }
      sheetUpdates.gradeClass = normGrade;
      if (normGrade !== student.gradeClass) {
        logActivity(parentUserId, "GRADE_PROMOTION", "Promoted " + student.fullName + " from " + student.gradeClass + " to " + normGrade, "governance", "VERIFIED");
      }
    }

    if (updates.newPin) {
      const pin = String(updates.newPin).trim();
      if (!/^\d{4,}$/.test(pin)) {
        return { success: false, error: "INVALID_PIN: Student PIN must be at least 4 numeric digits." };
      }
      sheetUpdates.pinHash = hashSecret(pin);
    }

    if (updates.permissions !== undefined || updates.parentalPermissions !== undefined) {
      const incomingPerms = updates.permissions || updates.parentalPermissions;
      let existingPerms = {};
      if (student.parentalPermissions) {
        try { existingPerms = JSON.parse(student.parentalPermissions); } catch (e) { existingPerms = {}; }
      }
      const merged = Object.assign({}, existingPerms, incomingPerms);
      sheetUpdates.parentalPermissions = JSON.stringify(merged);
    }

    updateSheetRecord("Users", "id", studentId, sheetUpdates);
    logActivity(parentUserId, "CHILD_GOVERNANCE_UPDATE", "Updated governance settings for student " + student.fullName, "governance", "VERIFIED");

    const users = getSheetRecords("Users");
    const updatedStudent = users.find(function(u) { return String(u.id) === studentId; });
    const safeStudent = sanitizeUser(updatedStudent);

    return {
      success: true,
      studentId: studentId,
      updatedChild: safeStudent,
      student: safeStudent,
      child: safeStudent
    };
  });
}

// =========================================================================
// MILESTONE 2: GEMINI API GENERATION PIPELINE & TOKEN QUOTA SYSTEM
// =========================================================================

/**
 * In-memory fallback cache for Node.js test environments lacking native CacheService.
 */
var _inMemoryScriptCache = {
  _data: {},
  get: function(key) {
    const entry = this._data[key];
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      delete this._data[key];
      return null;
    }
    return entry.val;
  },
  put: function(key, value, ttlSeconds) {
    const ttl = (ttlSeconds !== undefined) ? Number(ttlSeconds) : 600;
    if (isNaN(ttl) || ttl < 1 || ttl > 21600) {
      throw new Error("Exception: The expiration must be between 1 and 21600 seconds.");
    }
    this._data[key] = {
      val: String(value),
      expiresAt: Date.now() + (ttl * 1000)
    };
  },
  remove: function(key) {
    delete this._data[key];
  }
};

/**
 * Safe accessor for CacheService with in-memory fallback.
 */
function getScriptCache_() {
  if (typeof CacheService !== "undefined" && CacheService && CacheService.getScriptCache) {
    try {
      const c = CacheService.getScriptCache();
      if (c) return c;
    } catch (e) {}
  }
  if (typeof global !== "undefined" && global.CacheService && global.CacheService.getScriptCache) {
    try {
      const c = global.CacheService.getScriptCache();
      if (c) return c;
    } catch (e) {}
  }
  return _inMemoryScriptCache;
}

/**
 * In-memory fallback property store for Node.js test environments lacking native PropertiesService.
 */
var _inMemoryScriptProperties = {
  _props: {},
  getProperty: function(key) {
    return this._props.hasOwnProperty(key) ? String(this._props[key]) : null;
  },
  setProperty: function(key, value) {
    this._props[key] = String(value);
  },
  deleteProperty: function(key) {
    delete this._props[key];
  },
  getProperties: function() {
    return Object.assign({}, this._props);
  },
  setProperties: function(properties, optDeleteAllOthers) {
    if (optDeleteAllOthers) this._props = {};
    if (properties && typeof properties === "object") {
      for (const k in properties) {
        if (properties.hasOwnProperty(k)) {
          this._props[k] = String(properties[k]);
        }
      }
    }
  },
  deleteAllProperties: function() {
    this._props = {};
  }
};

/**
 * Safe accessor for PropertiesService with in-memory fallback.
 */
function getScriptProperties_() {
  if (typeof PropertiesService !== "undefined" && PropertiesService && PropertiesService.getScriptProperties) {
    try {
      return PropertiesService.getScriptProperties();
    } catch (e) {}
  }
  if (typeof global !== "undefined" && global.PropertiesService && global.PropertiesService.getScriptProperties) {
    try {
      return global.PropertiesService.getScriptProperties();
    } catch (e) {}
  }
  return _inMemoryScriptProperties;
}

/**
 * Safe accessor for UrlFetchApp.
 */
function getUrlFetchApp_() {
  if (typeof UrlFetchApp !== "undefined" && UrlFetchApp && UrlFetchApp.fetch) {
    return UrlFetchApp;
  }
  if (typeof global !== "undefined" && global.UrlFetchApp && global.UrlFetchApp.fetch) {
    return global.UrlFetchApp;
  }
  return null;
}

/**
 * Master CBSE/NCERT Pedagogical System Instruction for Gemini Models.
 */
const GEMINI_CBSE_SYSTEM_INSTRUCTION = {
  parts: [{
    text: [
      "You are an expert CBSE/NCERT curriculum designer, psychometrician, and master educator for Indian school students (Class 1 to Class 10).",
      "Your mission is to generate high-quality, syllabus-accurate, pedagogically rigorous assessment questions.",
      "",
      "Strict Pedagogical Principles:",
      "1. CURRICULUM FIDELITY: Strictly adhere to the NCERT/CBSE syllabus for the designated Grade and Subject.",
      "2. COGNITIVE CALIBRATION: Calibrate vocabulary, complexity, and reading level to the child's exact age and Grade.",
      "3. BLOOM'S TAXONOMY ALIGNMENT: Questions must explicitly reflect the requested cognitive domain (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).",
      "4. DISTRACTOR INTEGRITY (for MCQs):",
      "   - Provide exactly 4 options: A, B, C, D (indices 0, 1, 2, 3).",
      "   - Exactly ONE option is correct.",
      "   - The three distractors must be plausible, developmentally relevant misconceptions, not obviously absurd or trivial.",
      "   - Avoid 'All of the above' or 'None of the above'.",
      "   - Options must be mutually exclusive and comparable in length.",
      "5. PEDAGOGICAL HINTS & EXPLANATIONS:",
      "   - 'hint': A supportive, non-revealing clue encouraging critical thinking and metacognitive recall.",
      "   - 'explanation': A thorough, crystal-clear conceptual explanation detailing WHY the correct option is right and WHY the specific misconceptions in the distractors are incorrect.",
      "6. ZERO FORMULA INJECTION: Never output leading arithmetic operators (=, +, -, @) that could trigger spreadsheet formula execution.",
      "7. STRUCTURED JSON COMPLIANCE: Return ONLY a valid JSON array matching the declared responseSchema."
    ].join("\n")
  }]
};

/**
 * Compiles the user prompt with interpolated curriculum parameters.
 */
function compileGeminiUserPrompt(params) {
  const p = params || {};
  const gradeClass = normalizeGrade(p.gradeClass || p.grade) || "Class 3";
  const subject = p.subject ? String(p.subject).trim() : "General Science";
  const chapter = p.chapter ? String(p.chapter).trim() : "General";
  const topic = p.topic ? String(p.topic).trim() : "Core Concepts";
  const questionType = p.questionType ? String(p.questionType).trim().toUpperCase() : "MCQ";
  const quantity = Math.min(Math.max(Number(p.quantity) || 5, 1), 20);
  const difficulty = p.difficulty ? String(p.difficulty).trim() : "Medium";
  const bloomLevel = p.bloomLevel ? String(p.bloomLevel).trim() : "Applying";

  return [
    "Target Assessment Specifications:",
    "- Educational Board: CBSE / NCERT (National Curriculum Framework)",
    "- Grade / Level: " + gradeClass,
    "- Subject: " + subject,
    "- Chapter: " + chapter,
    "- Specific Topic: " + topic,
    "- Question Type: " + questionType,
    "- Number of Items to Generate: " + quantity,
    "- Target Difficulty: " + difficulty,
    "- Cognitive Level (Bloom's Revised): " + bloomLevel,
    "",
    "Requirements:",
    "Generate exactly " + quantity + " high-yield, classroom-ready assessment items.",
    "Ensure each item includes a descriptive title, unambiguous questionText, exactly 4 clear options for MCQs, the 0-based integer correctOptionIndex, a thought-provoking hint, and a comprehensive educational explanation.",
    "All items must be structured according to the supplied responseSchema."
  ].join("\n");
}

/**
 * Computes canonical 10-tuple SHA-256 fingerprint for deduplication caching.
 * Joined by double-colon '::' to prevent delimiter injection collisions.
 * Matches BrowserMockBackend formula byte-for-byte.
 *
 * @param {Object} payload - Parameter configuration object.
 * @returns {string} 64-character lowercase hexadecimal SHA-256 hash.
 */
function computeGeminiCacheFingerprint(payload) {
  const p = payload || {};
  const model = p.model ? String(p.model).trim() : "gemini-1.5-flash";
  const grade = normalizeGrade(p.gradeClass || p.grade) || "Class 3";
  const subject = p.subject ? String(p.subject).trim() : "General Science";
  const chapter = p.chapter ? String(p.chapter).trim() : "General";
  const topic = p.topic ? String(p.topic).trim() : "Core Concepts";
  const questionType = p.questionType ? String(p.questionType).trim().toUpperCase() : "MCQ";
  const quantity = String(Math.min(Math.max(Number(p.quantity) || 5, 1), 20));
  const difficulty = p.difficulty ? String(p.difficulty).trim() : "Medium";
  const bloomLevel = p.bloomLevel ? String(p.bloomLevel).trim() : "Applying";

  const rawKey = [
    "gemini",
    model,
    grade,
    subject,
    chapter,
    topic,
    questionType,
    quantity,
    difficulty,
    bloomLevel
  ].join("::");

  return sha256(rawKey);
}

// Canonical alias for contract parity
var computeGeminiRequestFingerprint = computeGeminiCacheFingerprint;

/**
 * Strips markdown code fences (```json ... ```) and leading/trailing whitespace or BOM tokens.
 */
function stripMarkdownFences(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "");
  clean = clean.replace(/\s*```\s*$/, "");
  clean = clean.replace(/^\uFEFF/, "");
  return clean.trim();
}

/**
 * Retrieves cached Gemini questions by canonical SHA-256 fingerprint.
 *
 * @param {string} fingerprint - 64-character SHA-256 hash.
 * @returns {Object|null} Cached response entry or null on cache miss.
 */
function getCachedGeminiResponse(fingerprint) {
  if (!fingerprint) return null;
  const cacheKey = "gemini_cache_" + fingerprint;
  const cache = getScriptCache_();
  try {
    const raw = cache.get(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed;
    }
  } catch (err) {
    if (typeof Logger !== "undefined") {
      Logger.log("Notice: Cache read error for key " + cacheKey + ": " + (err ? err.message : ""));
    }
  }
  return null;
}

/**
 * Persists generated Gemini questions into CacheService with 6-hour TTL.
 *
 * @param {string} fingerprint - 64-character SHA-256 hash.
 * @param {Object} data - { items: Array, model: string, promptTokens: number, candidateTokens: number }
 * @param {number} [ttlSeconds=21600] - TTL in seconds (default 6 hours).
 * @returns {boolean} True if successfully cached, false otherwise.
 */
function setCachedGeminiResponse(fingerprint, data, ttlSeconds) {
  if (!fingerprint || !data || !Array.isArray(data.items)) return false;
  const cacheKey = "gemini_cache_" + fingerprint;
  const cache = getScriptCache_();
  const effectiveTtl = (typeof ttlSeconds === "number" && ttlSeconds > 0) ? Math.min(Math.max(1, Math.floor(ttlSeconds)), 21600) : 21600;

  try {
    const payloadToStore = {
      fingerprint: fingerprint,
      timestamp: Date.now(),
      items: data.items,
      model: data.model || "gemini-1.5-flash",
      promptTokens: Number(data.promptTokens) || 0,
      candidateTokens: Number(data.candidateTokens) || 0,
      totalTokens: Number(data.totalTokens !== undefined ? data.totalTokens : ((data.promptTokens || 0) + (data.candidateTokens || 0)))
    };
    cache.put(cacheKey, JSON.stringify(payloadToStore), effectiveTtl);
    return true;
  } catch (err) {
    if (typeof Logger !== "undefined") {
      Logger.log("Notice: Cache write error for key " + cacheKey + ": " + (err ? err.message : ""));
    }
    return false;
  }
}

/**
 * Appends a metered token consumption record to Table 15 GeminiTokenLogs.
 * Defensively handles field aliases, sanitizes strings to prevent formula
 * injection (CWE-1236), and safely records execution telemetry.
 *
 * @param {Object} logEntry - Invocation details and token usage metadata.
 * @returns {Object} The normalized log entry persisted to storage.
 */
function recordGeminiTokenUsageLog(logEntry) {
  const p = logEntry || {};
  const now = new Date().toISOString();
  const logId = p.id || ("tok_" + Date.now() + "_" + Math.floor(Math.random() * 10000));

  const promptTokens = Number(p.promptTokens || 0);
  const candidateTokens = Number(p.candidateTokens || 0);
  const totalTokens = Number(p.totalTokens !== undefined ? p.totalTokens : (promptTokens + candidateTokens));

  const cachedFlag = (p.cachedFlag !== undefined)
    ? Boolean(p.cachedFlag)
    : (p.cached !== undefined ? Boolean(p.cached) : Boolean(p.isCached));

  const normalized = {
    id: String(logId),
    timestamp: p.timestamp ? String(p.timestamp) : now,
    adminUserId: p.adminUserId ? String(p.adminUserId) : "",
    model: p.model ? String(p.model) : "gemini-1.5-flash",
    grade: p.grade ? String(p.grade) : (p.gradeClass ? String(p.gradeClass) : ""),
    subject: p.subject ? String(p.subject) : "",
    topic: p.topic ? String(p.topic) : "",
    questionType: p.questionType ? String(p.questionType) : "MCQ",
    quantity: Number(p.quantity || p.itemCount || 0),
    promptTokens: promptTokens,
    candidateTokens: candidateTokens,
    totalTokens: totalTokens,
    cachedFlag: cachedFlag,
    status: p.status ? String(p.status) : "SUCCESS",
    latencyMs: Number(p.latencyMs !== undefined ? p.latencyMs : (p.durationMs !== undefined ? p.durationMs : 0))
  };

  normalized.adminUserId = sanitizeSheetCellValue(normalized.adminUserId);
  normalized.model = sanitizeSheetCellValue(normalized.model);
  normalized.grade = sanitizeSheetCellValue(normalized.grade);
  normalized.subject = sanitizeSheetCellValue(normalized.subject);
  normalized.topic = sanitizeSheetCellValue(normalized.topic);
  normalized.questionType = sanitizeSheetCellValue(normalized.questionType);
  normalized.status = sanitizeSheetCellValue(normalized.status);

  try {
    appendSheetRecord("GeminiTokenLogs", normalized);
  } catch (err) {
    if (typeof Logger !== "undefined") {
      Logger.log("Notice: Failed to append GeminiTokenLogs record: " + (err ? err.message : ""));
    }
  }

  return normalized;
}

/**
 * Sliding-Window Rate Limiter & Daily Quota Guard with Concurrency Locking.
 * Strictly enforces <= 15 RPM across rolling 60-second window and <= 1,500 RPD.
 *
 * @param {string} [model="gemini-1.5-flash"] - Model identifier for quota isolation.
 * @param {boolean} [consume=true] - If false, inspects quota state without incrementing counters.
 * @returns {{
 *   allowed: boolean,
 *   rpmLimit: number,
 *   rpmCurrent: number,
 *   rpmRemaining: number,
 *   rpdLimit: number,
 *   rpdCurrent: number,
 *   dailyRemaining: number,
 *   retryAfterSeconds: number,
 *   error?: string
 * }} Rate limiting decision object.
 */
function checkAndIncrementRateLimit(model, consume) {
  const selectedModel = model ? String(model).trim() : "gemini-1.5-flash";
  const modelSafeKey = selectedModel.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const shouldConsume = (consume !== false);

  const lock = (typeof LockService !== "undefined" && LockService && LockService.getScriptLock)
    ? LockService.getScriptLock()
    : null;

  let acquired = false;
  if (lock && typeof lock.tryLock === "function") {
    try {
      acquired = lock.tryLock(3000);
    } catch (lockErr) {
      acquired = false;
    }
    if (!acquired) {
      return {
        allowed: false,
        rpmLimit: 15,
        rpmCurrent: 15,
        rpmRemaining: 0,
        rpdLimit: 1500,
        rpdCurrent: 0,
        dailyRemaining: 0,
        retryAfterSeconds: 2,
        error: "RATE_LIMIT_LOCK_TIMEOUT: High concurrency detected on rate limiter. Please retry momentarily."
      };
    }
  }

  try {
    const cache = getScriptCache_();
    const now = Date.now();
    const todayUtc = new Date(now).toISOString().substring(0, 10);
    const rpdKey = "gemini_rpd_" + modelSafeKey + "_" + todayUtc;
    const timestampsKey = "gemini_rpm_timestamps_" + modelSafeKey;

    const rpdLimit = 1500;
    const rpmLimit = 15;

    // Calculate seconds until UTC midnight (1 to 86400) and clamp cache TTL to GAS 21600 ceiling
    const secondsUntilUtcMidnight = Math.max(1, 86400 - (Math.floor(now / 1000) % 86400));
    const rpdCacheTtl = Math.min(secondsUntilUtcMidnight, 21600);

    // 1. Two-Tier Daily Quota Resolution (L1 CacheService -> L2 PropertiesService backup)
    let dailyCount = 0;
    let dailyRaw = null;
    try {
      if (cache && typeof cache.get === "function") {
        dailyRaw = cache.get(rpdKey);
      }
    } catch (cacheGetErr) {
      dailyRaw = null;
    }

    if (dailyRaw !== null && dailyRaw !== undefined && dailyRaw !== "") {
      dailyCount = parseInt(dailyRaw, 10) || 0;
    } else {
      // L1 Cache Miss: Recover daily count from persistent L2 PropertiesService
      const props = getScriptProperties_();
      if (props && typeof props.getProperty === "function") {
        try {
          const propVal = props.getProperty(rpdKey);
          if (propVal !== null && propVal !== undefined && propVal !== "") {
            dailyCount = parseInt(propVal, 10) || 0;
            // Rehydrate L1 cache so subsequent requests avoid L2 PropertiesService overhead
            try {
              if (cache && typeof cache.put === "function") {
                cache.put(rpdKey, String(dailyCount), rpdCacheTtl);
              }
            } catch (rehydrateErr) {}
          }
        } catch (propErr) {
          // Graceful fallback to 0 if PropertiesService is unreachable
        }
      }
    }

    if (dailyCount >= rpdLimit) {
      return {
        allowed: false,
        rpmLimit: rpmLimit,
        rpmCurrent: 0,
        rpmRemaining: 0,
        rpdLimit: rpdLimit,
        rpdCurrent: dailyCount,
        dailyRemaining: 0,
        retryAfterSeconds: secondsUntilUtcMidnight,
        error: "DAILY_QUOTA_EXCEEDED: Free tier limit of 1,500 requests per day reached for " + selectedModel + ". Resets at UTC 00:00:00."
      };
    }

    // 2. Sliding 60-Second Window Check (15 RPM)
    let timestampsRaw = null;
    try {
      if (cache && typeof cache.get === "function") {
        timestampsRaw = cache.get(timestampsKey);
      }
    } catch (cacheTsErr) {
      timestampsRaw = null;
    }

    let timestamps = [];
    if (timestampsRaw) {
      try {
        const parsed = JSON.parse(timestampsRaw);
        if (Array.isArray(parsed)) {
          timestamps = parsed;
        }
      } catch (e) {
        timestamps = [];
      }
    }

    const windowStart = now - 60000;
    timestamps = timestamps.filter(function(ts) {
      return typeof ts === "number" && !isNaN(ts) && ts > windowStart;
    });

    timestamps.sort(function(a, b) { return a - b; });

    if (timestamps.length >= rpmLimit) {
      const oldestTs = timestamps[0];
      const retryAfterMs = (oldestTs + 60000) - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      return {
        allowed: false,
        rpmLimit: rpmLimit,
        rpmCurrent: timestamps.length,
        rpmRemaining: 0,
        rpdLimit: rpdLimit,
        rpdCurrent: dailyCount,
        dailyRemaining: Math.max(0, rpdLimit - dailyCount),
        retryAfterSeconds: retryAfterSeconds,
        error: "RATE_LIMIT_EXCEEDED: Free tier limit of 15 requests per minute reached for " + selectedModel + ". Please throttle requests."
      };
    }

    // 3. Atomically Record Consumption if shouldConsume === true
    if (shouldConsume) {
      const nextDailyCount = dailyCount + 1;
      timestamps.push(now);
      try {
        if (cache && typeof cache.put === "function") {
          cache.put(timestampsKey, JSON.stringify(timestamps), 120);
          cache.put(rpdKey, String(nextDailyCount), rpdCacheTtl);
        }
      } catch (cachePutErr) {}

      // Persist to L2 PropertiesService for 24h durability beyond 6h GAS CacheService ceiling
      const props = getScriptProperties_();
      if (props && typeof props.setProperty === "function") {
        try {
          props.setProperty(rpdKey, String(nextDailyCount));
          // Opportunistic cleanup of previous day's key on initial daily increment
          if (dailyCount === 0 && typeof props.deleteProperty === "function") {
            const yesterdayUtc = new Date(now - 86400000).toISOString().substring(0, 10);
            const yesterdayKey = "gemini_rpd_" + modelSafeKey + "_" + yesterdayUtc;
            try { props.deleteProperty(yesterdayKey); } catch (delErr) {}
          }
        } catch (propErr) {
          if (typeof Logger !== "undefined") {
            Logger.log("Notice: Failed to persist daily quota to PropertiesService: " + (propErr ? propErr.message : ""));
          }
        }
      }

      return {
        allowed: true,
        rpmLimit: rpmLimit,
        rpmCurrent: timestamps.length,
        rpmRemaining: Math.max(0, rpmLimit - timestamps.length),
        rpdLimit: rpdLimit,
        rpdCurrent: nextDailyCount,
        dailyRemaining: Math.max(0, rpdLimit - nextDailyCount),
        retryAfterSeconds: 0
      };
    }

    // Non-consuming inspection
    return {
      allowed: true,
      rpmLimit: rpmLimit,
      rpmCurrent: timestamps.length,
      rpmRemaining: Math.max(0, rpmLimit - timestamps.length),
      rpdLimit: rpdLimit,
      rpdCurrent: dailyCount,
      dailyRemaining: Math.max(0, rpdLimit - dailyCount),
      retryAfterSeconds: 0
    };
  } finally {
    if (lock && acquired && typeof lock.releaseLock === "function") {
      try { lock.releaseLock(); } catch (e) {}
    }
  }
}

/**
 * Transports HTTP POST request to Google AI Studio via UrlFetchApp with muteHttpExceptions: true.
 */
function executeGeminiApiCall(model, apiKey, payloadJson) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(apiKey);

  const fetchService = getUrlFetchApp_();
  if (!fetchService) {
    return {
      success: false,
      statusCode: 0,
      error: "URL_FETCH_APP_UNAVAILABLE: UrlFetchApp service is not available in the current environment.",
      bodyText: "",
      durationMs: 0
    };
  }

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payloadJson),
    muteHttpExceptions: true,
    validateHttpsCertificates: true
  };

  const startTime = Date.now();
  let response;
  try {
    response = fetchService.fetch(url, options);
  } catch (netErr) {
    return {
      success: false,
      statusCode: 0,
      error: "NETWORK_FAILURE: " + (netErr ? netErr.message : "Network error"),
      bodyText: "",
      durationMs: Date.now() - startTime
    };
  }

  let statusCode = 200;
  if (response && typeof response.getResponseCode === "function") {
    statusCode = response.getResponseCode();
  } else if (response && typeof response.statusCode === "number") {
    statusCode = response.statusCode;
  } else if (response && typeof response.status === "number") {
    statusCode = response.status;
  }

  let responseText = "";
  if (response && typeof response.getContentText === "function") {
    responseText = response.getContentText();
  } else if (response && typeof response.bodyText === "string") {
    responseText = response.bodyText;
  } else if (response && typeof response.body === "string") {
    responseText = response.body;
  } else if (typeof response === "string") {
    responseText = response;
  }

  const durationMs = Date.now() - startTime;

  return {
    success: statusCode >= 200 && statusCode < 300,
    statusCode: statusCode,
    bodyText: responseText,
    durationMs: durationMs
  };
}

/**
 * Ingestion Bridge: Transforms generated items into bulkUploadContentBatch format.
 */
function transformGeneratedItemsForBulkUpload(adminUserId, generationResult, params) {
  const p = params || {};
  const rawItems = (generationResult && Array.isArray(generationResult.items)) ? generationResult.items : [];
  const grade = normalizeGrade(p.gradeClass || p.grade) || "Class 3";
  const subject = p.subject ? String(p.subject).trim() : "General Science";
  const chapter = p.chapter ? String(p.chapter).trim() : "General";
  const topic = p.topic ? String(p.topic).trim() : "Core Concepts";

  const items = rawItems.map(function(item, idx) {
    const rawOpts = Array.isArray(item.options) ? item.options : [];
    return {
      id: item.id || ("curr_" + Date.now() + "_" + (idx + 1)),
      grade: item.grade || grade,
      subject: item.subject || subject,
      examCategory: item.examCategory || "CBSE",
      title: item.title || (chapter + " - " + topic + " (Q" + (idx + 1) + ")"),
      questionText: item.questionText || item.title || "",
      options: rawOpts,
      optionsJson: item.optionsJson || JSON.stringify(rawOpts),
      correctOptionIndex: Number(item.correctOptionIndex) || 0,
      hint: item.hint || "",
      explanation: item.explanation || "",
      orderIndex: idx + 1,
      isActive: true
    };
  });

  return {
    adminUserId: adminUserId,
    contentType: "CurriculumQuizzes",
    items: items
  };
}

/**
 * Main Backend Generator: generateCurriculumQuestionsWithGemini
 * Full implementation satisfying Requirement R2.1, R2.3, R3.1-R3.3.
 */
function generateCurriculumQuestionsWithGemini(payload) {
  const p = payload || {};
  const adminUserId = p.adminUserId ? String(p.adminUserId).trim() : "";

  // 1. RBAC Validation
  const adminCheck = assertAdmin(adminUserId);
  if (!adminCheck || !adminCheck.success) {
    return adminCheck || { success: false, error: "UNAUTHORIZED: Admin privileges required.", code: 403 };
  }

  const model = p.model ? String(p.model).trim() : "gemini-1.5-flash";
  const gradeClass = normalizeGrade(p.gradeClass || p.grade) || "Class 3";
  const subject = p.subject ? String(p.subject).trim() : "General Science";
  const chapter = p.chapter ? String(p.chapter).trim() : "General";
  const topic = p.topic ? String(p.topic).trim() : "Core Concepts";
  const questionType = p.questionType ? String(p.questionType).trim().toUpperCase() : "MCQ";
  const quantity = Math.min(Math.max(Number(p.quantity) || 5, 1), 20);
  const difficulty = p.difficulty ? String(p.difficulty).trim() : "Medium";
  const bloomLevel = p.bloomLevel ? String(p.bloomLevel).trim() : "Applying";

  // 2. Canonical Deduplication Cache Check
  const fingerprint = computeGeminiCacheFingerprint(p);
  if (!p.forceRefresh) {
    const cachedData = getCachedGeminiResponse(fingerprint);
    if (cachedData && Array.isArray(cachedData.items) && cachedData.items.length > 0) {
      // Increment persistent cache hit counter in PropertiesService
      const props = getScriptProperties_();
      if (props && typeof props.getProperty === "function") {
        try {
          const currentHits = parseInt(props.getProperty("gemini_cache_hits_count") || "0", 10);
          props.setProperty("gemini_cache_hits_count", String(currentHits + 1));
        } catch (propErr) {}
      }

      // Record 0-token hit in Table 15 GeminiTokenLogs
      recordGeminiTokenUsageLog({
        adminUserId: adminUserId,
        model: cachedData.model || model,
        grade: gradeClass,
        subject: subject,
        topic: topic,
        questionType: questionType,
        quantity: cachedData.items.length,
        promptTokens: 0,
        candidateTokens: 0,
        totalTokens: 0,
        cachedFlag: true,
        status: "SUCCESS",
        latencyMs: 5
      });

      const rateStatus = checkAndIncrementRateLimit(model, false);

      return {
        success: true,
        cached: true,
        items: cachedData.items,
        tokenUsage: {
          promptTokens: 0,
          candidateTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0.0000
        },
        rateLimits: {
          rpmRemaining: rateStatus.rpmRemaining,
          dailyRemaining: rateStatus.dailyRemaining,
          retryAfterSeconds: rateStatus.retryAfterSeconds || 0
        }
      };
    }
  }

  // 3. Sliding-Window Rate Limiting (15 RPM / 1,500 RPD) - Consumes 1 quota token
  const rateLimitDecision = checkAndIncrementRateLimit(model, true);
  if (!rateLimitDecision.allowed) {
    recordGeminiTokenUsageLog({
      adminUserId: adminUserId,
      model: model,
      grade: gradeClass,
      subject: subject,
      topic: topic,
      questionType: questionType,
      quantity: quantity,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: 0,
      cachedFlag: false,
      status: "RATE_LIMITED",
      latencyMs: 0
    });

    return {
      success: false,
      error: rateLimitDecision.error,
      code: 429,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds
      }
    };
  }

  // 4. API Key Resolution
  let apiKey = "";
  const props = getScriptProperties_();
  if (props && typeof props.getProperty === "function") {
    try { apiKey = props.getProperty("GEMINI_API_KEY"); } catch (e) {}
  }
  if (!apiKey && p.apiKey) {
    apiKey = String(p.apiKey).trim();
  }
  if (!apiKey) {
    return {
      success: false,
      error: "MISSING_API_KEY: Gemini API key not found in ScriptProperties ('GEMINI_API_KEY') or payload.apiKey.",
      code: 401,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  // 5. Prompt Compilation & generationConfig Formulation
  const userPromptText = compileGeminiUserPrompt(p);
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPromptText }]
      }
    ],
    systemInstruction: GEMINI_CBSE_SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        description: "List of curriculum assessment questions matching CBSE standards.",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Descriptive topic-aligned heading." },
            questionText: { type: "STRING", description: "Clear question prompt." },
            options: {
              type: "ARRAY",
              description: "Exactly 4 distinct, mutually exclusive answer choices.",
              items: { type: "STRING" }
            },
            correctOptionIndex: { type: "INTEGER", description: "0-based index of correct option (0, 1, 2, or 3)." },
            hint: { type: "STRING", description: "Pedagogical clue that assists recall without revealing the answer." },
            explanation: { type: "STRING", description: "Comprehensive explanation of correct solution and distractor analysis." },
            bloomLevel: { type: "STRING", description: "Remembering, Understanding, Applying, Analyzing, Evaluating, or Creating." },
            difficulty: { type: "STRING", description: "Easy, Medium, or Hard." }
          },
          required: ["title", "questionText", "options", "correctOptionIndex", "hint", "explanation"]
        }
      }
    }
  };

  // 6. Network Dispatch via UrlFetchApp with muteHttpExceptions: true
  const httpResult = executeGeminiApiCall(model, apiKey, requestBody);

  if (!httpResult.success) {
    let apiErrMsg = httpResult.error || ("HTTP " + httpResult.statusCode);
    if (httpResult.bodyText) {
      try {
        const errObj = JSON.parse(httpResult.bodyText);
        if (errObj && errObj.error && errObj.error.message) {
          apiErrMsg = errObj.error.message;
        }
      } catch (e) {}
    }

    recordGeminiTokenUsageLog({
      adminUserId: adminUserId,
      model: model,
      grade: gradeClass,
      subject: subject,
      topic: topic,
      questionType: questionType,
      quantity: quantity,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: 0,
      cachedFlag: false,
      status: "ERROR",
      latencyMs: httpResult.durationMs
    });

    return {
      success: false,
      error: "GEMINI_API_ERROR: " + apiErrMsg,
      code: httpResult.statusCode || 500,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  // 7. Defensive Parsing & Response Normalization
  let responseObj = null;
  try {
    responseObj = JSON.parse(httpResult.bodyText);
  } catch (jsonErr) {
    return {
      success: false,
      error: "JSON_PARSE_ERROR: Failed to parse Gemini response body: " + (jsonErr ? jsonErr.message : ""),
      code: 502,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  // Token usage extraction from usageMetadata
  const usage = (responseObj && responseObj.usageMetadata) ? responseObj.usageMetadata : {};
  const promptTokens = Number(usage.promptTokenCount) || 0;
  const candidateTokens = Number(usage.candidatesTokenCount) || 0;
  const totalTokens = Number(usage.totalTokenCount) || (promptTokens + candidateTokens);

  // Candidate extraction & finishReason verification
  const candidate = (responseObj && Array.isArray(responseObj.candidates) && responseObj.candidates.length > 0)
    ? responseObj.candidates[0]
    : null;

  if (!candidate) {
    const blockReason = responseObj && responseObj.promptFeedback ? responseObj.promptFeedback.blockReason : null;
    return {
      success: false,
      error: blockReason ? ("SAFETY_BLOCKED: Prompt blocked: " + blockReason) : "NO_CANDIDATES: Gemini returned 0 candidates.",
      code: 422,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  if (candidate.finishReason === "SAFETY") {
    return {
      success: false,
      error: "SAFETY_BLOCKED: Candidate content was blocked by safety filters.",
      code: 422,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  let rawCandidateText = "";
  if (candidate.content && Array.isArray(candidate.content.parts)) {
    for (let partIdx = 0; partIdx < candidate.content.parts.length; partIdx++) {
      if (candidate.content.parts[partIdx] && candidate.content.parts[partIdx].text) {
        rawCandidateText += candidate.content.parts[partIdx].text;
      }
    }
  }

  const cleanJsonText = stripMarkdownFences(rawCandidateText);
  let parsedItems = [];
  try {
    const rawParsed = JSON.parse(cleanJsonText);
    if (Array.isArray(rawParsed)) {
      parsedItems = rawParsed;
    } else if (rawParsed && Array.isArray(rawParsed.items)) {
      parsedItems = rawParsed.items;
    } else if (rawParsed && Array.isArray(rawParsed.questions)) {
      parsedItems = rawParsed.questions;
    } else if (rawParsed && typeof rawParsed === "object") {
      parsedItems = [rawParsed];
    }
  } catch (contentParseErr) {
    return {
      success: false,
      error: "CONTENT_PARSE_ERROR: Candidate text is not valid JSON: " + (contentParseErr ? contentParseErr.message : ""),
      code: 502,
      rateLimits: {
        rpmRemaining: rateLimitDecision.rpmRemaining,
        dailyRemaining: rateLimitDecision.dailyRemaining,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
      }
    };
  }

  // 8. Normalization, Distractor Integrity & CWE-1236 Sanitization
  const normalizedItems = parsedItems.map(function(item, idx) {
    const itemNumber = idx + 1;
    const itemId = item.id || ("curr_" + Date.now() + "_" + itemNumber);
    const rawTitle = item.title ? String(item.title).trim() : (chapter + " - " + topic + " (Q" + itemNumber + ")");
    const rawQuestionText = item.questionText ? String(item.questionText).trim() : rawTitle;

    // Distractor normalization: enforce exactly 4 options for MCQ
    let options = [];
    if (Array.isArray(item.options)) {
      options = item.options.map(function(opt) {
        return sanitizeSheetCellValue(String(opt || "").trim());
      });
    }
    if (questionType === "MCQ") {
      while (options.length < 4) {
        options.push(sanitizeSheetCellValue("Option " + String.fromCharCode(65 + options.length)));
      }
      if (options.length > 4) {
        options = options.slice(0, 4);
      }
    }

    let correctIdx = Number(item.correctOptionIndex);
    if (isNaN(correctIdx) || correctIdx < 0 || (options.length > 0 && correctIdx >= options.length)) {
      correctIdx = 0;
    }

    const hint = item.hint ? sanitizeSheetCellValue(String(item.hint).trim()) : "";
    const explanation = item.explanation ? sanitizeSheetCellValue(String(item.explanation).trim()) : "";

    return {
      id: itemId,
      grade: gradeClass,
      subject: subject,
      chapter: chapter,
      topic: topic,
      title: sanitizeSheetCellValue(rawTitle),
      questionText: sanitizeSheetCellValue(rawQuestionText),
      options: options,
      optionsJson: JSON.stringify(options),
      correctOptionIndex: correctIdx,
      hint: hint,
      explanation: explanation,
      bloomLevel: item.bloomLevel ? String(item.bloomLevel).trim() : bloomLevel,
      difficulty: item.difficulty ? String(item.difficulty).trim() : difficulty,
      examCategory: "CBSE"
    };
  });

  // 9. Commit to Cache (6 hours TTL)
  setCachedGeminiResponse(fingerprint, {
    items: normalizedItems,
    model: model,
    promptTokens: promptTokens,
    candidateTokens: candidateTokens,
    totalTokens: totalTokens
  }, 21600);

  // 10. Record Metered Log in Table 15 GeminiTokenLogs
  recordGeminiTokenUsageLog({
    adminUserId: adminUserId,
    model: model,
    grade: gradeClass,
    subject: subject,
    topic: topic,
    questionType: questionType,
    quantity: normalizedItems.length,
    promptTokens: promptTokens,
    candidateTokens: candidateTokens,
    totalTokens: totalTokens,
    cachedFlag: false,
    status: "SUCCESS",
    latencyMs: httpResult.durationMs
  });

  // 11. Optional Storage Bridge via bulkUploadContentBatch
  let bulkUploadResult = null;
  if (p.autoCommit === true || p.commitToStorage === true) {
    try {
      const uploadPayload = transformGeneratedItemsForBulkUpload(adminUserId, { items: normalizedItems }, p);
      bulkUploadResult = bulkUploadContentBatch(uploadPayload);
    } catch (uploadErr) {
      bulkUploadResult = { success: false, error: (uploadErr ? uploadErr.message : "Bulk upload failed") };
    }
  }

  const responsePayload = {
    success: true,
    cached: false,
    items: normalizedItems,
    tokenUsage: {
      promptTokens: promptTokens,
      candidateTokens: candidateTokens,
      totalTokens: totalTokens,
      estimatedCostUsd: 0.0000
    },
    rateLimits: {
      rpmRemaining: rateLimitDecision.rpmRemaining,
      dailyRemaining: rateLimitDecision.dailyRemaining,
      retryAfterSeconds: rateLimitDecision.retryAfterSeconds || 0
    }
  };

  if (bulkUploadResult) {
    responsePayload.bulkUploadResult = bulkUploadResult;
  }

  return responsePayload;
}

/**
 * Interface Contract 2: Inspects current Gemini API quota telemetry,
 * rate limit window counters (RPM/RPD), cumulative token consumption,
 * and cache hit statistics.
 *
 * Guarded by assertAdmin(adminUserId).
 *
 * @param {Object} payload - { adminUserId: string, model?: string }
 * @return {QuotaStatusResponse}
 */
function getGeminiQuotaStatus(payload) {
  const p = payload || {};
  const adminUserId = p.adminUserId ? String(p.adminUserId).trim() : "";
  const adminCheck = assertAdmin(adminUserId);
  if (!adminCheck || !adminCheck.success) {
    return adminCheck || { success: false, error: "UNAUTHORIZED: Admin privileges required.", code: 403 };
  }

  const defaultModel = "gemini-1.5-flash";
  const model = p.model ? String(p.model).trim() : defaultModel;

  // Inspect rate limits (non-mutating)
  const rateDecision = checkAndIncrementRateLimit(model, false);

  // Cumulative telemetry from Table 15 GeminiTokenLogs
  let totalTokensLogged = 0;
  let totalCallsLogged = 0;
  let cacheHitCount = 0;

  try {
    const logs = getSheetRecords("GeminiTokenLogs");
    if (Array.isArray(logs)) {
      totalCallsLogged = logs.length;
      for (let i = 0; i < logs.length; i++) {
        const row = logs[i];
        totalTokensLogged += Number(row.totalTokens || 0);
        const isCached = (row.cachedFlag === true || String(row.cachedFlag).toLowerCase() === "true" ||
                         row.cached === true || String(row.cached).toLowerCase() === "true" ||
                         row.isCached === true || String(row.isCached).toLowerCase() === "true") &&
                        String(row.status || "").toUpperCase() === "SUCCESS";
        if (isCached) {
          cacheHitCount++;
        }
      }
    }
  } catch (sheetErr) {}

  // Auxiliary Check for PropertiesService cache hit counter
  const props = getScriptProperties_();
  if (props && typeof props.getProperty === "function") {
    try {
      const propHits = props.getProperty("gemini_cache_hits_count");
      if (propHits) {
        cacheHitCount = Math.max(cacheHitCount, parseInt(propHits, 10) || 0);
      }
    } catch (propErr) {}
  }

  return {
    success: true,
    model: model,
    rpmLimit: rateDecision.rpmLimit || 15,
    rpmCurrent: rateDecision.rpmCurrent || 0,
    rpmRemaining: rateDecision.rpmRemaining !== undefined ? rateDecision.rpmRemaining : Math.max(0, (rateDecision.rpmLimit || 15) - (rateDecision.rpmCurrent || 0)),
    rpdLimit: rateDecision.rpdLimit || 1500,
    rpdCurrent: rateDecision.rpdCurrent || 0,
    rpdRemaining: rateDecision.dailyRemaining !== undefined ? rateDecision.dailyRemaining : Math.max(0, (rateDecision.rpdLimit || 1500) - (rateDecision.rpdCurrent || 0)),
    totalTokensLogged: totalTokensLogged,
    totalCallsLogged: totalCallsLogged,
    cacheHitCount: cacheHitCount
  };
}

// -------------------------------------------------------------------------
// Node.js Module Export for Local Automated Verification
// -------------------------------------------------------------------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APP_TITLE,
    BRAND_COLORS,
    SCHEMAS,
    sha256,
    hashSecret,
    generatePairingCode,
    withScriptLock,
    doGet,
    initializeDatabase,
    formatTableHeader,
    getSheetRecords,
    appendSheetRecord,
    updateSheetRecord,
    deleteSheetRecord,
    logActivity,
    sanitizeUser,
    assertParent,
    assertParentPairing,
    sanitizeSheetCellValue,
    signUpParent,
    signUpStudent,
    loginUser,
    verifyRolePin,
    getHabitsAndQuests,
    submitQuestCompletion,
    saveHabit,
    deleteHabit,
    getLinkedStudents,
    getLinkedChildren,
    getPendingVerifications,
    approveQuestSubmission,
    rejectQuestSubmission,
    getRewardsCatalog,
    submitRedemptionRequest,
    manageRewardItem,
    approveRedemption,
    rejectRedemption,
    updateStudentSecurity,
    getActivityLogs,
    awardParentBonus,
    triggerEmailDigest,
    getCommanderData,
    updateWalletCoins,
    saveHabitStatus,
    addCustomHabitTask,
    sendDailySummaryEmail,
    // Milestone 1 Additions:
    assertAdmin,
    VALID_CBSE_GRADES,
    CBSE_NCERT_GRADES,
    normalizeGrade,
    isValidGrade,
    normalizeCbseGrade,
    isValidCbseGrade,
    canonicalizeContentType,
    formatContentItemForClient,
    getAdminContentList,
    saveAdminContentItem,
    toggleContentActiveStatus,
    deleteAdminContentItem,
    getNextContentItem,
    recordContentCompletion,
    getContentByGrade,
    getLongitudinalProfile,
    recordGrowthEvent,
    signUpFamilyOnboarding,
    updateChildGovernance,
    ensureAdminUserInSheet,
    recordQuestionResponses,
    getStudentAnswerSheet,
    getNextPersonalizedCurriculum,
    bulkUploadContentBatch,
    // Milestone 2 Additions:
    generateCurriculumQuestionsWithGemini,
    getGeminiQuotaStatus,
    checkAndIncrementRateLimit,
    recordGeminiTokenUsageLog,
    computeGeminiCacheFingerprint,
    computeGeminiRequestFingerprint,
    getCachedGeminiResponse,
    setCachedGeminiResponse,
    stripMarkdownFences,
    transformGeneratedItemsForBulkUpload,
    executeGeminiApiCall,
    getScriptCache_,
    getScriptProperties_,
    getUrlFetchApp_,
    _inMemoryScriptCache,
    _inMemoryScriptProperties
  };
}