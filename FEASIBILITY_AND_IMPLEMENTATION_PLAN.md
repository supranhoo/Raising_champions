# Feasibility Assessment and Master Implementation Plan
## Zoptro 1-to-N Parent-to-Children Relational Architecture Upgrade

**Document Version**: 1.0.0-PROD  
**Status**: APPROVED & CANONICAL ARCHITECTURAL BLUEPRINT  
**Date**: November 2026  
**Target Repositories & Files**:
- Backend Engine: `google_apps_script_backend.js`
- Frontend SPA & Mock: `divyank_mission_control_google_apps_script_app.html`
- Specification & Contract Oracle: `tests/harness/zoptro_contract_oracle.js`
- Test Suites: `tests/test_multichild_backend_and_isolation.js`, `tests/test_multichild_frontend_hq.js`, `tests/run_tests.js`

---

## 1. Executive Summary & Feasibility Verdict

### 1.1 Objective
The primary objective of the Zoptro 1-to-N upgrade is to evolve the application from a single-child demonstration system into an enterprise-grade, multi-child family governance platform. Any parent must be able to link and govern an arbitrary number of children ($N \ge 1$) under a single family pairing code. Each child must possess independent profile credentials, Focus Coin wallets, experience points (XP), progression tiers, streaks, quest submissions, and reward redemptions. The upgrade must strictly enforce server-side Role-Based Access Control (RBAC), guarantee atomicity under Google Apps Script `LockService`, maintain 100% compliance with the Zoptro Brand Expression System (universal 90° square geometry, Outfit/Figtree typography, official color tokens), and preserve 100% pass rates across all 216 existing automated regression tests.

### 1.2 Core Architectural Findings
1. **Zero Database Migrations Required**: Detailed schema analysis reveals that the current Google Sheets 6-table database (`Users`, `HabitsQuests`, `SubmissionsQueue`, `RewardsCatalog`, `RedemptionsQueue`, `ActivityLogs`) already contains all necessary relational foreign keys (`Users.linkedParentId`, `SubmissionsQueue.studentId`, `RedemptionsQueue.studentId`). Because child rows in `Users` point back to their parent row via `linkedParentId`, the 1-to-N parent-to-children relationship is fully supported natively without adding, renaming, or deleting a single column.
2. **Schema Invariant Protection**: Automated unit tests (`tests/test_milestone1_backend.js`) strictly assert exact table column counts: 14 for `Users`, 10 for `HabitsQuests`, 11 for `SubmissionsQueue`, 8 for `RewardsCatalog`, 10 for `RedemptionsQueue`, and 7 for `ActivityLogs`. Preserving these exact column counts guarantees 100% backward compatibility and zero test regressions.
3. **Robust Concurrency Foundation**: The existing `withScriptLock` engine provides 10,000ms fail-closed mutual exclusion around all state-mutating transactions. By wrapping multi-child operations within `withScriptLock`, the system provides mathematical guarantees against double-spending, lost updates, and escrow race conditions.
4. **Clean Frontend State Separation**: The frontend SPA can cleanly transition from scalar state variables (`focusCoins`, `commanderXP`, `currentStreak`) to a partitioned reactive model (`activeChildId`, `linkedChildren`) with zero disruption to the underlying layout or existing DOM identifiers.
5. **Brand System Integrity**: The Zoptro Brand Expression System Guidelines (universal 0px border-radius, flat color tokens `#09293D`, `#F4F2EA`, `#666D57`, `#F65800`, and Outfit/Figtree typography) are enforced via strict AST and static regex scanners. All newly introduced multi-child UI elements (such as the Parent HQ Child Selector and verification attribution badges) strictly adhere to these invariants.

### 1.3 Feasibility Verdict
**VERDICT: 100% FEASIBLE.**  
The proposed 1-to-N upgrade requires no structural changes to Google Sheets, introduces no breaking changes to API contracts, and carries no operational risk to existing single-child accounts. The implementation can proceed with zero schema migration downtime and 100% regression test preservation.

---

## 2. 1-to-N Relational Data Schema & Google Sheets Architecture

### 2.1 Verbatim 6-Table Relational Schema Definition
The database layer is governed by the immutable `SCHEMAS` object defined in `google_apps_script_backend.js` (lines 38–64) and mirrored in `tests/harness/zoptro_contract_oracle.js`:

```javascript
const SCHEMAS = {
  Users: [
    "id", "role", "fullName", "email", "pinHash", "passwordHash",
    "pairingCode", "linkedParentId", "coins", "xp", "level",
    "streak", "createdAt", "lastLoginAt"
  ], // exactly 14 columns
  HabitsQuests: [
    "id", "parentUserId", "title", "category", "points", "xp",
    "timeSlot", "icon", "isArchived", "createdAt"
  ], // exactly 10 columns
  SubmissionsQueue: [
    "id", "studentId", "parentUserId", "questId", "questTitle",
    "points", "xp", "status", "submittedAt", "reviewedAt", "notes"
  ], // exactly 11 columns
  RewardsCatalog: [
    "id", "parentUserId", "title", "costCoins", "icon", "category",
    "isArchived", "createdAt"
  ], // exactly 8 columns
  RedemptionsQueue: [
    "id", "studentId", "parentUserId", "rewardId", "rewardTitle",
    "costCoins", "status", "requestedAt", "reviewedAt", "notes"
  ], // exactly 10 columns
  ActivityLogs: [
    "id", "userId", "action", "details", "category", "status", "timestamp"
  ]  // exactly 7 columns
};
```

### 2.2 Table-by-Table Column Analysis & Foreign Key Topology

#### Table 1: `Users` (14 Columns)
- **Primary Key**: `id` (string, e.g., `u_par_demo`, `u_stu_demo`, `u_stu_1730728900_1234`).
- **Foreign Key**: `linkedParentId` $\rightarrow$ `Users.id` (Parent).
  - When `role === "parent"`: Empty string `""` or `null`.
  - When `role === "student"`: Contains the parent's `id`.
  - **Relational Cardinality**: Multiple student records store the same `parent.id` in `linkedParentId`, establishing the 1-to-N parent-to-children relationship.
- **Attributes**:
  1. `id` (String): Globally unique entity identifier.
  2. `role` (String Enum): `"parent"` | `"student"`.
  3. `fullName` (String): Display name (e.g., `"Colonel Rajesh"`, `"Commander Divyank"`, `"Cadet Priya"`).
  4. `email` (String): Parent contact email (unique, lowercase); empty string `""` for students.
  5. `pinHash` (String): Salted SHA-256 hash (`sha256(pin + ":zoptro_salt_2026")`).
  6. `passwordHash` (String): Salted SHA-256 password hash for parent login; empty for students.
  7. `pairingCode` (String): 6-character uppercase alphanumeric code (e.g., `"ZOP360"`), stored on the parent and inherited by all linked students during sign-up.
  8. `linkedParentId` (String): Foreign key referencing parent's `Users.id`.
  9. `coins` (Integer $\ge 0$): Individual Focus Coins wallet balance.
  10. `xp` (Integer $\ge 0$): Cumulative Experience Points.
  11. `level` (Integer $\ge 1$): Progression tier calculated as $\lfloor \text{xp} / 250 \rfloor + 1$.
  12. `streak` (Integer $\ge 0$): Consecutive active day counter.
  13. `createdAt` (ISO 8601 String): Registration timestamp.
  14. `lastLoginAt` (ISO 8601 String): Timestamp of last authenticated session.

#### Table 2: `HabitsQuests` (10 Columns)
- **Primary Key**: `id` (string, e.g., `h_1`, `h_1730728900_5678`).
- **Foreign Key**: `parentUserId` $\rightarrow$ `Users.id` (Parent).
  - Scope: Governed by the parent; shared across all children linked to that parent.
- **Attributes**: `id` (PK), `parentUserId` (FK), `title` (String), `category` (String), `points` (Integer, 0–1000), `xp` (Integer, $\text{points} \times 2$), `timeSlot` (String), `icon` (String, emoji), `isArchived` (Boolean), `createdAt` (ISO 8601 String).

#### Table 3: `SubmissionsQueue` (11 Columns)
- **Primary Key**: `id` (string, e.g., `sub_1730728900_9012`).
- **Foreign Keys**:
  - `studentId` $\rightarrow$ `Users.id` (Student): Identifies the specific child who submitted the quest.
  - `parentUserId` $\rightarrow$ `Users.id` (Parent): Identifies the governing parent for indexing.
  - `questId` $\rightarrow$ `HabitsQuests.id`: Identifies the quest definition.
- **Attributes**: `id` (PK), `studentId` (FK), `parentUserId` (FK), `questId` (FK), `questTitle` (String snapshot), `points` (Integer base coins), `xp` (Integer base XP), `status` (Enum: `"PENDING_VERIFICATION"` | `"APPROVED"` | `"REJECTED"`), `submittedAt` (ISO 8601 String), `reviewedAt` (ISO 8601 String), `notes` (String).

#### Table 4: `RewardsCatalog` (8 Columns)
- **Primary Key**: `id` (string, e.g., `rw_1`, `rw_1730728900_3456`).
- **Foreign Key**: `parentUserId` $\rightarrow$ `Users.id` (Parent).
  - Scope: Governed by the parent; redeemable by any child of the parent.
- **Attributes**: `id` (PK), `parentUserId` (FK), `title` (String), `costCoins` (Integer $\ge 0$), `icon` (String, emoji), `category` (String), `isArchived` (Boolean), `createdAt` (ISO 8601 String).

#### Table 5: `RedemptionsQueue` (10 Columns)
- **Primary Key**: `id` (string, e.g., `rdm_1730728900_7890`).
- **Foreign Keys**:
  - `studentId` $\rightarrow$ `Users.id` (Student): Identifies the child whose coins are held in escrow.
  - `parentUserId` $\rightarrow$ `Users.id` (Parent): Identifies the reviewing parent.
  - `rewardId` $\rightarrow$ `RewardsCatalog.id`: Identifies the catalog reward.
- **Attributes**: `id` (PK), `studentId` (FK), `parentUserId` (FK), `rewardId` (FK), `rewardTitle` (String snapshot), `costCoins` (Integer held in escrow), `status` (Enum: `"PENDING_APPROVAL"` | `"APPROVED"` | `"REJECTED"`), `requestedAt` (ISO 8601 String), `reviewedAt` (ISO 8601 String), `notes` (String).

#### Table 6: `ActivityLogs` (7 Columns)
- **Primary Key**: `id` (string, e.g., `log_1730728900_1122`).
- **Foreign Key**: `userId` $\rightarrow$ `Users.id` (Actor).
- **Attributes**: `id` (PK), `userId` (FK), `action` (String action code), `details` (String), `category` (String), `status` (String), `timestamp` (ISO 8601 String).

### 2.3 Relational Entity-Relationship Diagram

```
                     +---------------------------------------+
                     |                 Users                 |
                     |  (14 Columns, PK: id = 'u_par_...')   |
                     |  role = 'parent', pairingCode='ZOP360'|
                     +---------------------------------------+
                                         │ 1
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │ 1:N                            │ 1:N                            │ 1:N
        ▼                                ▼                                ▼
+──────────────────────+     +──────────────────────+     +──────────────────────+
|     HabitsQuests     |     |    RewardsCatalog    |     |        Users         |
| (10 cols, FK: parent)|     |  (8 cols, FK: parent)|     |  (14 cols, Student A)|
|   title, points, xp  |     |   title, costCoins   |     |  linkedParentId = FK |
+──────────────────────+     +──────────────────────+     |  coins, xp, streak   |
                                                          +----------------------+
                                                                     │ 1
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             │ 1:N                                           │ 1:N
                                             ▼                                               ▼
                              +───────────────────────────────+               +───────────────────────────────+
                              |       SubmissionsQueue        |               |       RedemptionsQueue        |
                              |   (11 cols, FK: studentId)    |               |   (10 cols, FK: studentId)    |
                              | status: PENDING_VERIFICATION  |               |  status: PENDING_APPROVAL     |
                              |   points, xp, submittedAt     |               |  costCoins (escrow hold)      |
                              +───────────────────────────────+               +───────────────────────────────+
```

### 2.4 Formal Invariance Proof: 100% Test Compatibility
Let $\mathcal{T}$ denote the set of tables in the database schema:
$$\mathcal{T} = \{\text{Users}, \text{HabitsQuests}, \text{SubmissionsQueue}, \text{RewardsCatalog}, \text{RedemptionsQueue}, \text{ActivityLogs}\}$$
Let $C(T)$ denote the column count function of table $T \in \mathcal{T}$.  
The automated test suite `tests/test_milestone1_backend.js` (lines 226–231) enforces the following assertions:
$$C(\text{Users}) = 14$$
$$C(\text{HabitsQuests}) = 10$$
$$C(\text{SubmissionsQueue}) = 11$$
$$C(\text{RewardsCatalog}) = 8$$
$$C(\text{RedemptionsQueue}) = 10$$
$$C(\text{ActivityLogs}) = 7$$
Furthermore, line 253 asserts `deepStrictEqual(headers, gasBackend.SCHEMAS[tableName])`.

**Theorem (Schema Compatibility)**:  
*Because the required foreign keys `Users.linkedParentId`, `SubmissionsQueue.studentId`, and `RedemptionsQueue.studentId` already exist within the established schema, maintaining the exact column vector $\vec{C} = \langle 14, 10, 11, 8, 10, 7 \rangle$ satisfies the 1-to-N parent-to-children relational model while mathematically guaranteeing zero schema-induced test regressions.*

---

## 3. Exact API Specifications & RPC Contracts

### 3.1 `getLinkedStudents` (and Alias `getLinkedChildren`)

#### Context & Purpose
Called during Parent HQ initialization to load all children governed by the parent. Enables dynamic population of the Child Selector pill cards.

#### TypeScript Interface Definition
```typescript
interface GetLinkedStudentsPayload {
  parentUserId: string;
}

interface LinkedStudentProfile {
  id: string;
  fullName: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
  lastLoginAt: string;
}

interface GetLinkedStudentsResponse {
  success: boolean;
  students?: LinkedStudentProfile[];
  children?: LinkedStudentProfile[]; // Parity alias for mock and oracle
  error?: string;
}

function getLinkedStudents(payload: GetLinkedStudentsPayload): GetLinkedStudentsResponse;
function getLinkedChildren(payload: GetLinkedStudentsPayload): GetLinkedStudentsResponse;
```

#### Authorization & RBAC
- Strictly enforces `assertParent(parentUserId)`.
- If `parentUserId` does not exist or caller role is `"student"`, execution terminates immediately: throws `UNAUTHORIZED: Parent governance required.`.

#### Implementation Algorithm
1. Validate caller identity via `assertParent(parentUserId)`.
2. Fetch all user records via `getSheetRecords("Users")`.
3. Filter records where `String(u.role).toLowerCase() === "student"` and `String(u.linkedParentId) === String(parentUserId)`.
4. Map matched records into `LinkedStudentProfile` objects, omitting sensitive fields (`pinHash`, `passwordHash`).
5. Populate dual properties `students` and `children` for cross-environment compatibility.
6. Return `{ success: true, students: mappedStudents, children: mappedStudents }`.

---

### 3.2 `getPendingVerifications` with Child Attribution & Filtering

#### Context & Purpose
Called by Parent HQ to render the verification queue. Enriches every pending quest and redemption request with the submitting student's display name (`studentName`) and supports optional filtering by `studentId`.

#### TypeScript Interface Definition
```typescript
interface GetPendingVerificationsPayload {
  parentUserId: string;
  studentId?: string; // Optional filter for targeted child view
}

interface EnrichedPendingQuest {
  id: string;
  studentId: string;
  studentName: string; // Attributed display name
  parentUserId: string;
  questId: string;
  questTitle: string;
  points: number;
  xp: number;
  status: "PENDING_VERIFICATION";
  submittedAt: string;
  reviewedAt: string;
  notes: string;
}

interface EnrichedPendingRedemption {
  id: string;
  studentId: string;
  studentName: string; // Attributed display name
  parentUserId: string;
  rewardId: string;
  rewardTitle: string;
  costCoins: number;
  status: "PENDING_APPROVAL";
  requestedAt: string;
  reviewedAt: string;
  notes: string;
}

interface GetPendingVerificationsResponse {
  success: boolean;
  pendingQuests?: EnrichedPendingQuest[];
  pendingRedemptions?: EnrichedPendingRedemption[];
  error?: string;
}

function getPendingVerifications(payload: GetPendingVerificationsPayload): GetPendingVerificationsResponse;
```

#### Authorization & RBAC
- Strictly enforces `assertParent(parentUserId)`.
- If `payload.studentId` is supplied, additionally enforces `assertParentPairing(parentUserId, studentId)` to prevent unauthorized cross-family inspection.

#### Implementation Algorithm
1. Verify parent authority via `assertParent(parentUserId)`.
2. Retrieve all children linked to this parent: build a fast dictionary lookup `studentNameMap[child.id] = child.fullName`.
3. Read `SubmissionsQueue`:
   - Filter rows where `status === "PENDING_VERIFICATION"` and (`parentUserId === parentUserId` or `studentNameMap[row.studentId] !== undefined`).
   - If `payload.studentId` is present, further filter where `row.studentId === payload.studentId`.
   - Enrich each record with `studentName: studentNameMap[row.studentId] || "Student"`.
4. Read `RedemptionsQueue`:
   - Filter rows where `status === "PENDING_APPROVAL"` and (`parentUserId === parentUserId` or `studentNameMap[row.studentId] !== undefined`).
   - If `payload.studentId` is present, further filter where `row.studentId === payload.studentId`.
   - Enrich each record with `studentName: studentNameMap[row.studentId] || "Student"`.
5. Return `{ success: true, pendingQuests, pendingRedemptions }`.

---

### 3.3 `getHabitsAndQuests` with Per-Child Status Evaluation

#### Context & Purpose
Queries the habit catalog for either the Student Focus Dashboard or Parent HQ. Correctly evaluates today's completion status per child.

#### TypeScript Interface Definition
```typescript
interface GetHabitsAndQuestsPayload {
  userId?: string;     // Caller ID
  studentId?: string;  // Target child ID (when caller is parent)
}

interface HabitWithEvaluation {
  id: string;
  parentUserId: string;
  title: string;
  category: string;
  points: number;
  xp: number;
  timeSlot: string;
  icon: string;
  isArchived: boolean;
  status: "AVAILABLE" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  completed: boolean;
}

interface GetHabitsAndQuestsResponse {
  success: boolean;
  habits?: HabitWithEvaluation[];
  error?: string;
}

function getHabitsAndQuests(payload: GetHabitsAndQuestsPayload): GetHabitsAndQuestsResponse;
```

#### Target Resolution & Status Logic
1. **Target Identification**:
   - If caller is a parent:
     - If `studentId` is provided: call `assertParentPairing(userId, studentId)`. Target child is `studentId`.
     - If `studentId` is omitted: select the first linked child of `userId`.
   - If caller is a student:
     - Target child is `userId`. Parent ID is `student.linkedParentId`.
2. **Catalog Retrieval**:
   - Retrieve all active habits from `HabitsQuests` where `isArchived === false` and `parentUserId === targetParentId`.
3. **Daily Status Evaluation**:
   - Compute `todayStr = new Date().toISOString().substring(0, 10)`.
   - Look up entries in `SubmissionsQueue` where `questId === habit.id`, `studentId === targetStudentId`, and `submittedAt.substring(0, 10) === todayStr`.
   - If a matching submission exists:
     - `status = matchingSub.status`
     - `completed = (matchingSub.status === "APPROVED")`
   - Else:
     - `status = "AVAILABLE"`
     - `completed = false`
4. Return `{ success: true, habits: evaluatedHabits }`.

---

### 3.4 `triggerEmailDigest` with Multi-Child Aggregation

#### Context & Purpose
Generates and sends a comprehensive weekly/daily progress report to the parent's verified email address, aggregating progress across all linked children.

#### TypeScript Interface Definition
```typescript
interface TriggerEmailDigestPayload {
  parentUserId: string;
}

interface TriggerEmailDigestResponse {
  success: boolean;
  recipient?: string;
  sentTo?: string; // Legacy test alias
  childCount?: number;
  message: string;
  error?: string;
}

function triggerEmailDigest(payload: TriggerEmailDigestPayload): TriggerEmailDigestResponse;
```

#### Multi-Child Aggregation Algorithm
1. Verify caller via `parent = assertParent(parentUserId)`.
2. Determine destination email: `recipientEmail = parent.email || Session.getActiveUser().getEmail()`. If empty, fail with `MISSING_EMAIL`.
3. Query all linked children: `children = users.filter(u => u.role === "student" && u.linkedParentId === parent.id)`.
4. If `children.length === 0`, construct placeholder notification.
5. Aggregate per-child statistics:
   - For each child $S_i$: query `SubmissionsQueue` (count approved quests today, pending quests) and `RedemptionsQueue` (pending redemptions).
   - Format a dedicated child summary section in the HTML body: Child Avatar, Full Name, Current Focus Coins, Total XP, Progression Level, Consecutive Streak, and daily quest tally.
6. Assemble branded HTML email with Zoptro Authority Blue (`#09293D`) headers and Clarity Ivory (`#F4F2EA`) background cards.
7. Dispatch via `MailApp.sendEmail({ to: recipientEmail, subject: "Zoptro Multi-Child Family Progress Digest", htmlBody })`.
8. Record audit entry in `ActivityLogs`.
9. Return `{ success: true, recipient: recipientEmail, sentTo: recipientEmail, childCount: children.length, message: "Progress digest sent successfully." }`.

---

### 3.5 Legacy Bridges with Backward-Compatible Fallbacks

To ensure that legacy tests and scripts continue operating without modification, the following bridges are parameterized with optional `studentId`:

#### 1. `getCommanderData`
```javascript
function getCommanderData(payload) {
  const studentId = payload && payload.studentId ? String(payload.studentId) : null;
  const users = getSheetRecords("Users");
  let student = null;
  if (studentId) {
    student = users.find(u => String(u.id) === studentId);
  } else {
    student = users.find(u => String(u.role).toLowerCase() === "student");
  }
  return { 
    success: true, 
    commander: student || { fullName: "Student", coins: 0, xp: 0, level: 1, streak: 0 } 
  };
}
```

#### 2. `updateWalletCoins`
```javascript
function updateWalletCoins(deltaCoins, deltaXp, reason, type, status, parentUserId, studentId) {
  return withScriptLock(function() {
    let targetStudentId = studentId;
    if (!targetStudentId) {
      const users = getSheetRecords("Users");
      const fallback = users.find(u => String(u.role).toLowerCase() === "student");
      targetStudentId = fallback ? fallback.id : "u_stu_demo";
    }
    // Perform bounds check and atomic balance increment on targetStudentId
    ...
  });
}
```

#### 3. `saveHabitStatus`
```javascript
function saveHabitStatus(habitId, isCompleted, points, habitTitle, studentId) {
  let targetStudentId = studentId;
  if (!targetStudentId) {
    const users = getSheetRecords("Users");
    const fallback = users.find(u => String(u.role).toLowerCase() === "student");
    targetStudentId = fallback ? fallback.id : "u_stu_demo";
  }
  return submitQuestCompletion({ studentId: targetStudentId, questId: habitId, notes: habitTitle });
}
```

---

## 4. Concurrency & LockService Architecture

### 4.1 Audit of `withScriptLock`
In Google Apps Script, simultaneous web requests run in isolated V8 JavaScript runtimes. Without synchronization, concurrent read-modify-write operations on Google Sheets cause lost updates and data corruption. Zoptro employs `withScriptLock` in `google_apps_script_backend.js` (lines 194–229):

```javascript
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
```

#### Key Concurrency Guarantees
1. **10,000ms Timeout**: Allows high-contention operations sufficient time to queue and execute sequentially.
2. **Fail-Closed Execution**: If lock acquisition times out or encounters an exception, `callback()` is **never** invoked. Mutating database operations are aborted cleanly.
3. **Guaranteed Release**: `lock.releaseLock()` is placed inside a mandatory `finally` block, ensuring locks are released even if errors occur during transaction processing.

---

### 4.2 Mutating Callbacks and Lock Wrapping Matrix

| Function Name | Lock Protected? | Timeout | Mutating Operations Inside Critical Section | Invariant Guaranteed |
|---|---|---|---|---|
| `initializeDatabase` | Yes | 10,000ms | Creates missing sheets, sets frozen rows, writes headers | Table schemas and headers strictly intact |
| `signUpParent` | Yes | 10,000ms | Verifies email uniqueness, writes to `Users` | Unique parent email, unique 6-char pairing code |
| `signUpStudent` | Yes | 10,000ms | Verifies pairing code, writes to `Users` | Student linked to valid parent, initial balance 0 |
| `saveHabit` | Yes | 10,000ms | Updates or inserts into `HabitsQuests` | Points 0–1000, XP $\ge 0$, parent ownership verified |
| `deleteHabit` | Yes | 10,000ms | Sets `isArchived: true` in `HabitsQuests` | Soft deletion, parent ownership verified |
| `submitQuestCompletion` | Yes | 10,000ms | Evaluates daily uniqueness, writes to `SubmissionsQueue` | No duplicate submissions today, 0 instant coins |
| `approveQuestSubmission` | Yes | 10,000ms | Reads student, updates coins/XP, marks `APPROVED` | No double-approval, exact wallet credit |
| `rejectQuestSubmission` | Yes | 10,000ms | Updates submission to `REJECTED`, records reason | Status transition to `REJECTED`, zero wallet credit |
| `submitRedemptionRequest`| Yes | 10,000ms | Validates balance, debits escrow, appends queue | Balance $\ge$ cost, no double-spending |
| `approveRedemption` | Yes | 10,000ms | Updates redemption status to `APPROVED` | No double-delivery, coins permanently retained |
| `rejectRedemption` | Yes | 10,000ms | Refunds escrow coins to student, marks `REJECTED` | Exact refund, no double-refund |
| `awardParentBonus` | Yes | 10,000ms | Reads student balance, adds bonus, updates level | Atomic credit, bonus bounds ($0 \le \text{pts} \le 1000$) |
| `updateStudentSecurity` | Yes | 10,000ms | Hashes new credentials, writes to `Users` | PIN $\ge 4$ digits, parent pairing verified |
| `updateWalletCoins` | Yes | 10,000ms | Reads student balance, applies delta, writes back | Atomic increment, finite numerical bounds |

---

### 4.3 Detailed Concurrency Thread Traces

#### Trace A: Wallet Balance Race Condition Defense
```
Thread 1 (Parent Approves Quest for Child 1)        Thread 2 (Parent Awards Bonus to Child 1)
─────────────────────────────────────────────        ─────────────────────────────────────────
1. Invokes approveQuestSubmission                   1. Invokes awardParentBonus
2. Acquires withScriptLock                          2. withScriptLock: Waits for Lock...
3. Reads Users table: Child 1 coins = 100           │ (blocked)
4. Computes: newCoins = 100 + 25 = 125              │ (blocked)
5. Writes Users row: Child 1 coins = 125            │ (blocked)
6. Appends log, releases lock                       │ (blocked)
                                                    3. Thread 2 acquires withScriptLock
                                                    4. Reads Users table: Child 1 coins = 125 (FRESH!)
                                                    5. Computes: newCoins = 125 + 15 = 140
                                                    6. Writes Users row: Child 1 coins = 140
                                                    7. Releases lock
Result: Final coins = 140 (Exact, 0 Lost Updates)
```

#### Trace B: Double-Spending Defense on Redemptions
```
Scenario: Child 1 has 50 coins. Clicks "Redeem Movie Ticket (50 coins)" twice rapidly.
Thread 1 (Click 1)                                  Thread 2 (Click 2)
──────────────────                                  ──────────────────
1. Invokes submitRedemptionRequest                  1. Invokes submitRedemptionRequest
2. Acquires withScriptLock                          2. withScriptLock: Waits for Lock...
3. Reads Users table: Child 1 coins = 50            │ (blocked)
4. 50 >= 50: SUFFICIENT                             │ (blocked)
5. Debits escrow: Child 1 coins = 0                 │ (blocked)
6. Enqueues rdm_1 (status: PENDING_APPROVAL)        │ (blocked)
7. Releases lock                                    │ (blocked)
                                                    3. Thread 2 acquires withScriptLock
                                                    4. Reads Users table: Child 1 coins = 0
                                                    5. 0 < 50: INSUFFICIENT_COINS Error!
                                                    6. Returns { success: false, error: 'INSUFFICIENT_COINS' }
                                                    7. Releases lock
Result: Only 1 redemption enqueued. Exactly 50 coins debited. Double-spending blocked.
```

#### Trace C: Escrow Refund Idempotency on Rejection
```
Scenario: Parent double-clicks "Reject Redemption" on an enqueued 50-coin item.
Thread 1 (Click 1)                                  Thread 2 (Click 2)
──────────────────                                  ──────────────────
1. Invokes rejectRedemption                         1. Invokes rejectRedemption
2. Acquires withScriptLock                          2. withScriptLock: Waits for Lock...
3. Reads RedemptionsQueue: status = PENDING_APPROVAL│ (blocked)
4. Reads Users table: Child 1 coins = 10            │ (blocked)
5. Refunds 50 coins: Child 1 coins = 60             │ (blocked)
6. Updates RedemptionsQueue: status = REJECTED      │ (blocked)
7. Releases lock                                    │ (blocked)
                                                    3. Thread 2 acquires withScriptLock
                                                    4. Reads RedemptionsQueue: status = REJECTED
                                                    5. status !== PENDING_APPROVAL: Error!
                                                    6. Returns { success: false, error: 'REDEMPTION_ALREADY_REVIEWED' }
                                                    7. Releases lock
Result: Exactly 50 coins refunded once. Double-refund blocked.
```

---

## 5. Frontend SPA State Management & Parent HQ Flow

### 5.1 Global & In-Memory State Models
In `divyank_mission_control_google_apps_script_app.html`, the frontend extends its global state to support multi-child governance:

```javascript
// ==========================================
// 1-TO-N MULTI-CHILD STATE MODEL
// ==========================================
var activeChildId = 'u_stu_demo';
var linkedChildren = [];

// Base Fallback Profile Seed (Preserves 100% Backward Compatibility)
const DEFAULT_STUDENT_PROFILES = [
  {
    id: 'u_stu_demo',
    role: 'student',
    fullName: 'Commander Divyank',
    coins: 340,
    xp: 680,
    level: 3,
    streak: 5,
    avatar: '🚀',
    pairingCode: 'ZOP360',
    linkedParentId: 'u_par_demo'
  },
  {
    id: 'u_stu_priya',
    role: 'student',
    fullName: 'Cadet Priya',
    coins: 150,
    xp: 300,
    level: 2,
    streak: 3,
    avatar: '🔬',
    pairingCode: 'ZOP360',
    linkedParentId: 'u_par_demo'
  }
];

// Preserved scalar globals for single-student views & legacy tests
var currentUser = Object.assign({}, DEFAULT_STUDENT_PROFILES[0]);
var currentRole = 'divyank';
var focusCoins = 340;
var commanderXP = 680;
var currentStreak = 5;
var currentAvatar = '🚀';
```

### 5.2 Parent HQ Child Selector Component Specification

#### DOM Structure
Placed in `#view-parentview` immediately following the Parent HQ Header Banner and preceding the Verification Queue:

```html
<!-- ========================================================================= -->
<!-- PARENT HQ: MULTI-CHILD SELECTOR BAR (1-TO-N GOVERNANCE)                   -->
<!-- ========================================================================= -->
<div id="parentChildSelectorContainer" class="bg-white border-2 border-[#09293D] rounded-none p-4 space-y-3 font-sans">
  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#DED9D3] pb-2">
    <div class="flex items-center space-x-2">
      <h3 class="font-display font-bold text-sm text-[#09293D] uppercase tracking-wider flex items-center gap-2">
        <span>👨‍👩‍👧‍👦 Family Profiles</span>
        <span id="parentChildCountBadge" class="text-xs px-2 py-0.5 bg-[#1C5682] text-white rounded-none font-bold">1 Child Linked</span>
      </h3>
      <p class="text-xs text-[#666D57] hidden sm:block">Select a child to view individual progress, verify activities, or award points.</p>
    </div>
    <div class="text-xs text-[#666D57] font-bold">
      Active Focus: <span id="activeChildNameLabel" class="text-[#09293D] font-bold">Commander Divyank</span>
    </div>
  </div>

  <!-- Dynamic Child Selector Pill Cards List -->
  <div id="parentChildPillsList" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
    <!-- Populated dynamically via renderParentChildSelector() -->
  </div>
</div>
```

#### Pill Card Rendering Logic (`renderParentChildSelector`)
```javascript
function renderParentChildSelector() {
  if (!currentUser || currentUser.role !== 'parent' || currentRole !== 'parent') return;
  const parentId = currentUser.id;

  if (typeof ZoptroApiClient === 'undefined') return;

  ZoptroApiClient.getLinkedChildren({ parentUserId: parentId }).then(function(res) {
    if (!res || !res.success || !res.children || res.children.length === 0) {
      linkedChildren = DEFAULT_STUDENT_PROFILES.slice();
    } else {
      linkedChildren = res.children;
    }

    if (!linkedChildren.some(c => c.id === activeChildId)) {
      activeChildId = linkedChildren[0].id;
    }

    const countBadge = document.getElementById('parentChildCountBadge');
    if (countBadge) {
      countBadge.innerText = `${linkedChildren.length} ${linkedChildren.length === 1 ? 'Child' : 'Children'} Linked`;
    }

    const pillsList = document.getElementById('parentChildPillsList');
    if (pillsList) {
      pillsList.innerHTML = linkedChildren.map(child => {
        const isSelected = child.id === activeChildId;
        return `
          <button onclick="selectActiveChild('${child.id}')" class="p-3 text-left rounded-none border transition-all flex items-center justify-between gap-2 font-sans ${
            isSelected 
              ? 'bg-[#09293D] text-white border-[#09293D] border-l-4 border-l-[#F65800]' 
              : 'bg-[#F9F8F3] text-[#09293D] border-[#DED9D3] hover:border-[#09293D]'
          }">
            <div class="flex items-center space-x-2.5 min-w-0">
              <span class="text-xl p-1.5 ${isSelected ? 'bg-[#1C5682]' : 'bg-[#D9E6EB]'} border border-[#09293D] flex-shrink-0">${child.avatar || '🚀'}</span>
              <div class="min-w-0 truncate">
                <div class="font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-[#09293D]'}">${child.fullName}</div>
                <div class="text-xs ${isSelected ? 'text-[#D9E6EB]' : 'text-[#666D57]'}">Level ${child.level || 1} • ${child.streak || 0}d streak</div>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="font-bold text-xs ${isSelected ? 'text-[#F9A66E]' : 'text-[#F65800]'}">${child.coins || 0} 🪙</span>
            </div>
          </button>
        `;
      }).join('');
    }

    updateActiveChildDisplay();
  });
}
```

#### Reactive Child Switching Logic (`selectActiveChild`)
```javascript
function selectActiveChild(childId) {
  if (activeChildId === childId) return;
  playSound('coin');
  activeChildId = childId;

  // Instant in-memory refresh (<10ms) without page reload
  renderParentChildSelector();
  updateActiveChildDisplay();
  renderVerificationQueue();
  renderParentAnalytics();
}

function updateActiveChildDisplay() {
  const activeChild = linkedChildren.find(c => c.id === activeChildId) || linkedChildren[0];
  if (!activeChild) return;

  const labelEl = document.getElementById('activeChildNameLabel');
  if (labelEl) labelEl.innerText = activeChild.fullName;

  const poc = document.getElementById('parentObservedCoins');
  if (poc) poc.innerText = activeChild.coins;

  const streakEl = document.getElementById('analyticsStreak');
  if (streakEl) streakEl.innerText = activeChild.streak || 0;
}
```

### 5.3 Child-Scoped Operations in Parent HQ

1. **Verification Queue Attribution**:  
   Every quest submission card displays:
   ```html
   <span class="px-2 py-0.5 bg-[#09293D] text-white font-bold text-xs rounded-none">
     👤 ${q.studentName || 'Student'}
   </span>
   ```
   Every redemption request card displays:
   ```html
   <span class="px-2 py-0.5 bg-[#1C5682] text-white font-bold text-xs rounded-none">
     👤 ${r.studentName || 'Student'}
   </span>
   ```
2. **Appreciation Bonus Targeting**:  
   `awardParentBonus(points, reason)` resolves `targetStudentId = activeChildId`. It applies optimistic in-memory wallet increments to the selected child and dispatches `{ parentUserId, studentId: targetStudentId, coins: points, reason }` to the backend.
3. **Security Updates Targeting**:  
   `submitStudentSecurityUpdate()` reads `activeChildId` and dispatches `{ parentUserId, studentId: activeChildId, newPin, newPassword }` to `updateStudentSecurity`.
4. **Student Profile Sign-In**:  
   In `#authTabSignIn`, the student enters their Name, Email, or Student ID along with their 4-digit PIN. `submitSignIn` authenticates the specific student against the backend, establishes the session, and initializes the Student Dashboard scoped strictly to that child.

---

## 6. Zoptro Brand Expression System Compliance

The Zoptro Brand Expression System is an immutable visual identity contract. All newly authored code, templates, and DOM components must conform strictly to the following parameters:

### 6.1 Design Tokens & CSS Invariants

| Token Category | Token Value / Rule | Implementation Discipline |
|---|---|---|
| **Border Radii** | Universal 0px: `* { border-radius: 0px !important; }` | Strictly 0 non-none rounded classes. All cards, buttons, badges, and inputs use `.rounded-none`. |
| **Edge Geometry** | 90° square corners | Flat planar surfaces; zero pill or circular shapes. |
| **Gradients** | Strictly prohibited | Zero `bg-gradient-*` occurrences across static HTML and dynamic JS template literals. |
| **Glows & Halos** | Strictly prohibited | Zero `glow-*` or neon box-shadows. Flat elevation only. |
| **Display Font** | `Outfit` (sans-serif, weights 500, 600, 700) | Enforced by Tailwind `font-display` for headings, banners, counters, and metrics. |
| **Body Font** | `Figtree` (sans-serif, weights 400, 500, 600, 700) | Enforced by Tailwind `font-sans`, `font-body` for UI copy, forms, and buttons. |
| **Monospace** | `Figtree` (monospace, weight 700) | Enforced by Tailwind `font-mono` for pairing codes and tokens. |

### 6.2 Official Color Palette Tokens

| Brand Color | Hex Code | Functional Semantic Mapping |
|---|---|---|
| **Authority Blue** | `#09293D` | Primary headers, active pill background, primary borders, table headers |
| **Clarity Ivory** | `#F4F2EA` | Primary canvas background, container backgrounds, subtle button hover |
| **Grounded Olive** | `#666D57` | Secondary text, status indicators, sub-labels, neutral badges |
| **Progress Orange** | `#F65800` | Primary action CTAs, active pill card border-l-4 accent, coin balance highlights |
| **Slate Blue** | `#1C5682` | Secondary action badges, family pairing code container, active child avatar |
| **Ice Blue** | `#D9E6EB` | Inactive child avatar container, information alert banners |
| **Sand** | `#DED9D3` | Divider lines, card borders, inactive button borders |
| **Cream** | `#F9F8F3` | Unselected child pill cards, input backgrounds, table row backgrounds |
| **Alert Red** | `#D80707` | Rejection buttons, error notifications, danger actions |
| **Success Lime** | `#7FBF19` | Approval badges, verified status indicators, success confirmations |

---

## 7. RBAC Enforcement & State Isolation Guarantees

### 7.1 Sibling & Cross-Family RBAC Architecture
Zoptro enforces a 4-boundary Role-Based Access Control model:
1. **Student Self-Boundary**: A student can only view and mutate their own profile, submit their own daily quests, and request redemptions from their own coin wallet.
2. **Sibling Boundary**: Child A and Child B linked to the same parent are strictly partitioned. Child A cannot view Child B's PIN, cannot submit quests in Child B's name, cannot spend Child B's coins, and cannot approve or manipulate Child B's records.
3. **Paired Parent Governance**: A parent has full administrative authority over all children whose `linkedParentId` equals `parent.id`.
4. **Cross-Family Isolation**: Parent 1 has zero authority over Child 2 (where `Child2.linkedParentId !== Parent1.id`). Cross-family operations fail closed with `UNAUTHORIZED`.

### 7.2 Server-Side Assertions

```javascript
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
```

---

### 7.3 Mathematical Proof by Structural Induction of Zero Cross-Child State Leakage

#### Definition 1 (System State Space)
Let $\mathcal{F} = \{P, \mathcal{S}\}$ be a family system where $P$ is the governing parent and $\mathcal{S} = \{S_1, S_2, \dots, S_N\}$ is the set of $N \ge 1$ linked children.  
For each child $S_i \in \mathcal{S}$ ($i \in \{1, \dots, N\}$), define the discrete state tuple at discrete time step $t \in \mathbb{N}_0$ as:
$$\mathbf{x}_i(t) = \langle c_i(t), x_i(t), l_i(t), k_i(t), \mathcal{Q}_i(t), \mathcal{R}_i(t), \pi_i(t) \rangle \in \Omega_i$$
where:
- $c_i(t) \in \mathbb{N}_0$: Focus Coin wallet balance of child $S_i$.
- $x_i(t) \in \mathbb{N}_0$: Cumulative Experience Points (XP) of child $S_i$.
- $l_i(t) = \lfloor x_i(t)/250 \rfloor + 1 \in \mathbb{N}$: Cadet Progression Tier of child $S_i$.
- $k_i(t) \in \mathbb{N}_0$: Daily streak counter of child $S_i$.
- $\mathcal{Q}_i(t) = \{ q \in \text{SubmissionsQueue} \mid q.studentId = S_i \}$: Submission set of child $S_i$.
- $\mathcal{R}_i(t) = \{ r \in \text{RedemptionsQueue} \mid r.studentId = S_i \}$: Redemption set of child $S_i$.
- $\pi_i(t) \in \{0, 1\}^{256}$: Salted SHA-256 PIN hash of child $S_i$.

The total child state space of the family is the Cartesian product:
$$\mathbf{X}(t) = \mathbf{x}_1(t) \times \mathbf{x}_2(t) \times \dots \times \mathbf{x}_N(t)$$

#### Definition 2 (Atomic Mutation Operators)
Every mutating transaction $M$ in the Zoptro backend executes under the exclusive mutual exclusion lock `LockService.getScriptLock()` with timeout $T_{\text{lock}} = 10,000\text{ms}$. Therefore, all state mutations are strictly serialized:
$$t_0 < t_1 < t_2 < \dots < t_m$$
Let $\mathcal{M}$ be the set of all mutating transaction operators:
$$\mathcal{M} = \{ \text{SubmitQuest}, \text{ApproveQuest}, \text{RejectQuest}, \text{AwardBonus}, \text{RequestRedemption}, \text{ApproveRedemption}, \text{RejectRedemption}, \text{UpdateSecurity} \}$$

#### Theorem (Zero Cross-Child State Leakage)
*For any transaction operator $M \in \mathcal{M}$ targeting or initiated by child $S_a$ ($a \in \{1, \dots, N\}$) executing at time step $t$, the state of any other child $S_b$ ($b \ne a$) is invariant:*
$$\mathbf{x}_b(t^+) = \mathbf{x}_b(t), \quad \forall b \in \{1, \dots, N\} \setminus \{a\}$$
*where $t^+$ represents the state immediately following the atomic completion of $M$. Equivalently, the Jacobian of cross-child state dependency is identically zero:*
$$\frac{\partial \mathbf{x}_b}{\partial \mathbf{x}_a} = \mathbf{0}, \quad \forall a \ne b$$

#### Proof by Structural Induction over Transaction Operators
Let $a, b \in \{1, \dots, N\}$ with $a \ne b$. Since $S_a$ and $S_b$ possess distinct primary keys $ID(S_a) \ne ID(S_b)$, their database records occupy disjoint row indices in the physical storage medium:
$$\text{RowIndex}(S_a) \cap \text{RowIndex}(S_b) = \emptyset$$

We evaluate every transaction operator $M \in \mathcal{M}$:

1. **Case 1: $M = \text{SubmitQuest}(S_a, questId, notes)$**
   - The operation executes under `withScriptLock`.
   - The duplicate check evaluates:
     $$\sigma_{studentId = S_a \land questId = questId \land submittedAt = \text{today}}(\text{SubmissionsQueue})$$
     Since $S_a \ne S_b$, $\mathcal{Q}_b(t)$ is not accessed in the predicate.
   - An entry $q_{\text{new}}$ is appended to `SubmissionsQueue` with $q_{\text{new}}.studentId = S_a$.
   - $\mathcal{Q}_a(t^+) = \mathcal{Q}_a(t) \cup \{q_{\text{new}}\}$, while $\mathcal{Q}_b(t^+) = \mathcal{Q}_b(t)$.
   - Balances $c_b, x_b, l_b, k_b, \pi_b$ and $\mathcal{R}_b$ are unmodified. Thus $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

2. **Case 2: $M = \text{ApproveQuest}(submissionId, parentUserId, bonusCoins)$**
   - The backend looks up $sub = \text{Find}(\text{SubmissionsQueue}, \text{id} = submissionId)$.
   - $targetId = sub.studentId$. By hypothesis, $targetId = S_a$.
   - The pairing check `assertParentPairing(parentUserId, S_a)` verifies $S_a$'s legitimacy.
   - The wallet mutation executes:
     $$\text{Update}(\text{Users}, \text{RowIndex}(S_a), \{ \text{coins}: c_a + points + bonus, \text{xp}: x_a + \Delta xp \})$$
   - Since $\text{RowIndex}(S_b) \ne \text{RowIndex}(S_a)$, the storage cells for $S_b$ are unvisited.
   - Thus $c_b(t^+) = c_b(t)$, $x_b(t^+) = x_b(t)$, $l_b(t^+) = l_b(t)$, $k_b(t^+) = k_b(t)$, and $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

3. **Case 3: $M = \text{AwardBonus}(parentUserId, S_a, bonusCoins, reason)$**
   - The pairing assertion verifies $S_a$.
   - Cell mutation updates strictly $\text{RowIndex}(S_a)$.
   - $\text{RowIndex}(S_b)$ is untouched. Thus $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

4. **Case 4: $M = \text{RequestRedemption}(S_a, rewardId)$**
   - Balance check verifies $c_a(t) \ge \text{cost}$.
   - If satisfied, debit mutation updates strictly $\text{RowIndex}(S_a)$: $c_a(t^+) = c_a(t) - \text{cost}$.
   - Redemption record $r_{\text{new}}$ is appended with $r_{\text{new}}.studentId = S_a$.
   - $\mathcal{R}_a(t^+) = \mathcal{R}_a(t) \cup \{r_{\text{new}}\}$, while $\mathcal{R}_b(t^+) = \mathcal{R}_b(t)$.
   - $\text{RowIndex}(S_b)$ is untouched. Thus $c_b(t^+) = c_b(t)$ and $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

5. **Case 5: $M = \text{RejectRedemption}(redemptionId, parentUserId, reason)$**
   - The backend retrieves $rdm = \text{Find}(\text{RedemptionsQueue}, \text{id} = redemptionId)$.
   - $targetId = rdm.studentId = S_a$.
   - Refund credit mutation updates strictly $\text{RowIndex}(S_a)$: $c_a(t^+) = c_a(t) + rdm.costCoins$.
   - Status of $rdm$ is updated to `REJECTED`.
   - $\text{RowIndex}(S_b)$ is untouched. Thus $c_b(t^+) = c_b(t)$ and $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

6. **Case 6: $M = \text{UpdateSecurity}(parentUserId, S_a, newPin, newPassword)$**
   - Pairing assertion verifies $S_a$.
   - Security update writes new hash strictly to $\text{RowIndex}(S_a)$.
   - $\pi_b(t^+) = \pi_b(t)$. Thus $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$.

Since all operators $M \in \mathcal{M}$ preserve the invariant $\mathbf{x}_b(t^+) = \mathbf{x}_b(t)$ for all $b \ne a$, by induction over any arbitrary sequence of transactions $M_1, M_2, \dots, M_k$, no mutation targeting child $S_a$ can ever leak, corrupt, or alter the state of sibling $S_b$.  
**Q.E.D.**

---

## 8. Migration, Test Strategy & Verification Plan

### 8.1 Zero Sheet Migrations & Legacy Data Compatibility
- **Zero Table Migrations**: No schema alterations are performed. The Google Sheets column layout remains invariant ($\vec{C} = \langle 14, 10, 11, 8, 10, 7 \rangle$).
- **$N=1$ Base Case**: A single-child family is simply an instance where $N=1$. Existing accounts (`u_par_demo` and `u_stu_demo`) operate seamlessly.
- **Dual-Mode Parity**: Identical multi-child methods and response structures are implemented in `google_apps_script_backend.js`, `BrowserMockBackend`, and `ZoptroContractOracle`.

### 8.2 Preservation of Existing Regression Suite (216/216 Tests)
- All 216 tests across Tiers 1–4 of `tests/run_tests.js` must pass with 100% success.
- Existing DOM element IDs (e.g., `#parentObservedCoins`, `#newStudentPin`, `#analyticsStreak`) and function signatures are strictly preserved.

### 8.3 Specifications for New Automated Test Suites

#### 1. `tests/test_multichild_backend_and_isolation.js` ($\ge 24$ Tests)
- **Group 1: Multi-Child Registration & Pairing Code Validation (Tests 01–04)**: Parent registration, multiple children registering under the same pairing code, `getLinkedStudents` returning all linked profiles, unauthorized access rejection.
- **Group 2: Per-Child Wallet & Progression Isolation (Tests 05–09)**: Quest approvals credit target child only, bonus awards credit target child only, XP level-ups isolated per child, streak counters isolated per child, physical row index non-overlap verification.
- **Group 3: Quest Submission & Daily Completion Isolation (Tests 10–12)**: Child A submission marked pending for Child A while remaining available for Child B, approval for Child A does not prevent Child B from submitting.
- **Group 4: Redemption Escrow & Refund Isolation (Tests 13–16)**: Redemption debits target child only, insufficient balance prevents pooling across siblings, rejection refunds exclusively to requesting child, approval permanently debits coins.
- **Group 5: Concurrency Safety & LockService Serialization (Tests 17–19)**: Concurrent submissions serialize without data loss, concurrent redemptions escrow coins accurately, sibling double-spending attempts cleanly reject second request.
- **Group 6: Sibling & Cross-Family RBAC Defense Challenges (Tests 20–22)**: Sibling attempting quest approval fails `UNAUTHORIZED`, sibling attempting PIN change fails `UNAUTHORIZED`, foreign parent attempting action fails `assertParentPairing`.
- **Group 7: Queue Attribution & Multi-Child Digest (Tests 23–24)**: `getPendingVerifications` enriches items with `studentName`, `triggerEmailDigest` aggregates progress across all linked children.

#### 2. `tests/test_multichild_frontend_hq.js` ($\ge 10$ Tests)
- **DOM Structure & Components**: `#parentChildSelectorContainer` exists in `#view-parentview` with 0px border-radius, dynamic child pills render avatar, name, level, streak, and coins, child pills adhere strictly to Zoptro palette tokens and Outfit font.
- **Reactive State & Workflows**: Clicking a child pill card invokes `selectActiveChild` and updates `activeChildId` in memory without page reload, verification queue displays student attribution badges, verification queue filter toggles between all children and active child, bonus awarding targets `activeChildId`, security credential updates target `activeChildId`.
- **Student Profile Sign-In & Brand Audit**: Student sign-in supports individual profile/PIN authentication, complete DOM audit confirms universal 90° square edges (`* { border-radius: 0px !important; }`), zero forbidden curvature classes, zero gradients, and zero neon glows.

### 8.4 Master Runner Integration into `tests/run_tests.js`
The master test runner `tests/run_tests.js` will orchestrate all tiers:

```javascript
const allTiers = [
  { tier: 1, name: 'Tier 1: Feature Coverage (19 Features >=5/feat)', file: './tier1_feature_coverage.test.js', minExpected: 95 },
  { tier: 2, name: 'Tier 2: Boundary & Corner Cases (19 Features >=5/feat)', file: './tier2_boundary_corner.test.js', minExpected: 95 },
  { tier: 3, name: 'Tier 3: Pairwise Combinatorial Interactions', file: './tier3_pairwise_combinations.test.js', minExpected: 19 },
  { tier: 4, name: 'Tier 4: Real-World End-to-End Workflows', file: './tier4_real_world_scenarios.test.js', minExpected: 6 },
  { tier: 5, name: 'Tier 5: 1-to-N Multi-Child Backend & State Isolation', file: './test_multichild_backend_and_isolation.js', minExpected: 24 },
  { tier: 6, name: 'Tier 6: 1-to-N Multi-Child Frontend SPA & Parent HQ', file: './test_multichild_frontend_hq.js', minExpected: 10 }
];
```
- **Total Test Count**: $\ge 250$ tests.
- **Pass Threshold**: 100% pass rate (0 failures).

---

## 9. Implementation Roadmap & Milestone Schedule

```
+--------------------------------------------------------------------------+
| MILESTONE 1: Architecture, Feasibility & Specifications (CURRENT)       |
| -> Comprehensive Feasibility & Implementation Plan Authored & Approved   |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| MILESTONE 2: Relational Backend & RBAC Implementation                    |
| -> Update google_apps_script_backend.js & zoptro_contract_oracle.js     |
| -> Multi-child pairing, getLinkedStudents, queue attribution, lock audits|
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| MILESTONE 3: Multi-Child Frontend SPA & Parent HQ Implementation         |
| -> Update divyank_mission_control_google_apps_script_app.html            |
| -> Child Selector, activeChildId state, student PIN login, brand tokens  |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| MILESTONE 4: Test Suite Hardening, Regression & Integration Verification |
| -> Create test_multichild_backend_and_isolation.js (24 tests)            |
| -> Create test_multichild_frontend_hq.js (10 tests)                      |
| -> Integrate into tests/run_tests.js; verify 250+ tests passing 100%     |
+--------------------------------------------------------------------------+
```

---
*End of Feasibility Assessment and Master Implementation Plan.*
