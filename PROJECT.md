# Project: Zoptro 1-to-N Parent-to-Children Architecture Upgrade

## Architecture
Zoptro is a dual-user (Student and Parent) web application designed for Google Apps Script deployment with a built-in local browser mock fallback.
This project upgrades Zoptro from a single-child model to a **1-to-N parent-to-children relational architecture**, allowing any parent to link and monitor multiple children separately with individual profiles, wallets, streaks, quests, and rewards, with strict RBAC enforcement, LockService concurrency protection, and full adherence to the Zoptro Brand Expression System Guidelines (zero border-radius, Outfit/Figtree typography, and official Zoptro color palette).

### System Data Flow
```
[Student / Parent Browser SPA UI]
             │
      (ZoptroApiClient)
       /             \
      ▼               ▼
[GAS Production]  [Local Browser Mock]
 google.script.run   localStorage engine
      │               │
      ▼               ▼
[Google Sheets DB] [Persistent Local Store]
  - Users (14 cols, linkedParentId FK)
  - HabitsQuests (10 cols, parentUserId FK)
  - SubmissionsQueue (11 cols, studentId FK, parentUserId FK)
  - RewardsCatalog (8 cols, parentUserId FK)
  - RedemptionsQueue (10 cols, studentId FK, parentUserId FK)
  - ActivityLogs (7 cols, userId FK)
```

### Module Boundaries
1. **Relational Backend Engine (`google_apps_script_backend.js`)**:
   - Google Sheets 6-table relational schema with existing foreign keys (`Users.linkedParentId`, `SubmissionsQueue.studentId`, `RedemptionsQueue.studentId`).
   - Atomic concurrency control via `withScriptLock` (10s timeout, fail-closed).
   - Parent governance & pairing assertions: `assertParent(parentUserId)`, `assertParentPairing(parentUserId, studentId)`.
   - 1-to-N multi-child queries: `getLinkedStudents({ parentUserId })`.
   - Enriched verification queue: `getPendingVerifications({ parentUserId, studentId })` with child name attribution and optional child filter.
   - Per-child quest status tracking in `getHabitsAndQuests({ userId, studentId })`.
   - Multi-child progress reporting in `triggerEmailDigest({ parentUserId })`.
   - Backward-compatible legacy bridges (`getCommanderData`, `updateWalletCoins`, `saveHabitStatus`) with optional `studentId`.

2. **Frontend SPA & Parent HQ (`divyank_mission_control_google_apps_script_app.html`)**:
   - `BrowserMockBackend` & `ZoptroApiClient` with 1-to-N multi-child support (`getLinkedChildren`).
   - Multi-child in-memory state: `activeChildId`, `linkedChildren`.
   - Parent HQ Child Selector bar with dynamic child pill cards (avatar, name, level, streak, coins).
   - Dynamic child-scoped operations in Parent HQ: 1-click verification queue with child attribution badges, custom appreciation bonus targeting `activeChildId`, security/PIN update targeting `activeChildId`, child-specific analytics.
   - Student authentication: individual child profile & PIN access per child.
   - Strict Zoptro Brand System compliance: universal 90° square edges (`* { border-radius: 0px !important; }`), zero gradients, zero neon glows, Outfit display font, Figtree body font, and official color palette (#09293D, #F4F2EA, #666D57, #F65800).

3. **Authoritative Specification & Contract Oracle (`tests/harness/zoptro_contract_oracle.js`)**:
   - Reference implementation maintaining parity with GAS backend and BrowserMockBackend.
   - Multi-child contract simulation for automated test suites.

4. **Automated Test Suites (`tests/`, `tests/run_tests.js`)**:
   - Master runner executing existing Tiers 1-4 (216 tests, 100% pass guarantee).
   - Dedicated multi-child automated tests covering multi-child linking, wallet isolation, quest isolation, redemption escrow/refund isolation, Parent HQ child switching, LockService concurrency, and sibling RBAC defenses.

---

## Feature Inventory
Every feature required for the 1-to-N parent-to-children upgrade is cataloged below with its assigned milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Feasibility Assessment & Architecture Blueprint | Formal architectural assessment detailing 1-to-N schema, API changes, LockService concurrency, Parent HQ state flow, and migration/test strategy | M1 | R1, Survey |
| 2 | Backend 1-to-N Multi-Child Pairing & Query API | Ability for a parent to link multiple children via family pairing code and query them via `getLinkedStudents({ parentUserId })` | M2 | R2, Survey |
| 3 | Per-Child Wallet & Streak State Isolation | Guarantee that coins, XP, level, and streak are tracked strictly per-child with zero cross-child leakage | M2 | R2, Acceptance Criteria |
| 4 | Verification Queue Child Attribution & Filtering | Enrich `getPendingVerifications` with `studentName` and support optional `studentId` filtering | M2 | R2, Survey |
| 5 | Per-Child Quest Status Evaluation | Update `getHabitsAndQuests` to evaluate quest completion per child when queried by a parent | M2 | R2, Survey |
| 6 | LockService Concurrency & RBAC Enforcement | Verify `withScriptLock` wraps all multi-child mutations and `assertParentPairing` prevents cross-family/sibling tampering | M2 | R2, Acceptance Criteria |
| 7 | Multi-Child Email Digest Aggregation | Update `triggerEmailDigest` to format and report progress for all linked children of the parent | M2 | R2, Survey |
| 8 | Legacy Bridge Parameterization | Update legacy bridge functions (`getCommanderData`, `updateWalletCoins`, `saveHabitStatus`) with optional `studentId` | M2 | R2, Survey |
| 9 | Dual-Mode Parity (MockBackend & ZoptroApiClient) | Implement multi-child support and seed data in `BrowserMockBackend`, `ZoptroApiClient`, and `ZoptroContractOracle` | M3 | R3, Survey |
| 10 | Parent HQ Child Selector Component | Brand-compliant child selector bar in Parent HQ allowing parent to switch active child context | M3 | R3, Acceptance Criteria |
| 11 | Child-Scoped Parent Actions & Attribution | Verification queue child badges, custom bonus targeting `activeChildId`, PIN update targeting `activeChildId` | M3 | R3, Acceptance Criteria |
| 12 | Student Login with Individual Profile/PIN | Support individual child profile selection and PIN verification during student sign-in | M3 | R3, Acceptance Criteria |
| 13 | Zoptro Brand Expression Compliance | Verify 0px border-radius, Outfit/Figtree fonts, Zoptro color palette (#09293D, #F4F2EA, #666D57, #F65800), zero gradients | M3 | R3, Brand PDF |
| 14 | Automated Multi-Child Backend & Isolation Tests | Comprehensive test suite for multi-child linking, wallet isolation, redemption escrow/refund, concurrency, and RBAC | M4 | R4, Acceptance Criteria |
| 15 | Automated Multi-Child Frontend & Parent HQ Tests | DOM and SPA workflow tests verifying child selector, child badges, bonus targeting, and student PIN login | M4 | R4, Acceptance Criteria |
| 16 | Regression Verification (216/216 Tests Passing) | Guarantee 100% pass rate on existing test runner (`node tests/run_tests.js`) with zero regressions | M4 | R4, Acceptance Criteria |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Feasibility Assessment & Architecture Plan | Compile comprehensive feasibility assessment and implementation plan covering schema, concurrency, RBAC, state, and test strategy | Survey complete | DONE |
| M2 | 1-to-N Relational Backend & RBAC Implementation | Update `google_apps_script_backend.js` and `tests/harness/zoptro_contract_oracle.js` for multi-child linking, isolation, queries, and LockService RBAC | M1 | DONE |
| M3 | Multi-Child Frontend SPA & Parent HQ Implementation | Update `divyank_mission_control_google_apps_script_app.html` with Child Selector, child-scoped actions, student PIN login, brand compliance | M2 | DONE |
| M4 | Test Suite Update, Regression Verification & Hardening | Update `tests/`, add multi-child test suites, integrate into `tests/run_tests.js`, verify 100% pass with zero regressions | M2, M3 | DONE |

---

## Interface Contracts

### 1. Multi-Child Backend API Contract
```javascript
// Children Roster Query
getLinkedStudents({ parentUserId }) => Promise<{ success: boolean, students: Array<{ id, fullName, coins, xp, level, streak, createdAt, lastLoginAt }> }>
// Local Mock & Oracle alias:
getLinkedChildren({ parentUserId }) => Promise<{ success: boolean, children: Array<{ id, fullName, coins, xp, level, streak, createdAt, lastLoginAt }> }>

// Verification Queue with Child Attribution
getPendingVerifications({ parentUserId, studentId? }) => Promise<{
  success: boolean,
  pendingQuests: Array<{ id, studentId, studentName, questId, questTitle, points, xp, status, submittedAt, notes }>,
  pendingRedemptions: Array<{ id, studentId, studentName, rewardId, rewardTitle, costCoins, status, requestedAt, notes }>
}>

// Per-Child Quest Status Query
getHabitsAndQuests({ userId, studentId? }) => Promise<{ success: boolean, habits: Array<HabitObject> }>

// Multi-Child Email Digest
triggerEmailDigest({ parentUserId }) => Promise<{ success: boolean, message: string }>

// Legacy Bridges with Optional studentId
getCommanderData({ studentId? }) => Promise<{ success: boolean, commander: object }>
updateWalletCoins(deltaCoins, deltaXp, reason, type, status, parentUserId, studentId?) => Promise<{ success: boolean, updatedWallet: object }>
saveHabitStatus(habitId, isCompleted, points, habitTitle, studentId?) => Promise<{ success: boolean }>
```

### 2. Frontend State Management Contract
```javascript
// Active Multi-Child State in Window Scope:
var activeChildId = 'u_stu_demo';
var linkedChildren = []; // Array of student profile objects

// Child Switcher Function:
function selectActiveChild(childId);
function renderParentChildSelector();
function updateActiveChildDisplay();
```

---

## Code Layout
- `google_apps_script_backend.js`: Production Google Apps Script backend engine with 6-sheet schema, LockService concurrency, RBAC, and 1-to-N endpoints.
- `divyank_mission_control_google_apps_script_app.html`: Single-page frontend app with `BrowserMockBackend`, `ZoptroApiClient`, Parent HQ child selector, and student profile/PIN login.
- `tests/harness/zoptro_contract_oracle.js`: Authoritative specification reference program and relational schema oracle.
- `tests/test_multichild_backend_and_isolation.js`: Automated tests for 1-to-N backend linking, state isolation, concurrency, and RBAC.
- `tests/test_multichild_frontend_hq.js`: Automated tests for Parent HQ child selector, DOM elements, and student login.
- `tests/run_tests.js`: Master test suite runner executing all regression and 1-to-N test suites.
- `FEASIBILITY_AND_IMPLEMENTATION_PLAN.md`: Comprehensive feasibility assessment and detailed architectural blueprint.
