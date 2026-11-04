# Project: Zoptro Dual-User Web Application

## Architecture
Zoptro is a dual-user (Student and Parent) web application designed for Google Apps Script deployment with a built-in local browser mock fallback.
The application strictly embodies the Optra360 / Zoptro Brand Expression System (sharp 90° square edges, zero border-radius, Outfit and Figtree typography, Authority Blue #09293D, Progress Orange #F65800, Grounded Olive #666D57, Clarity Ivory #F4F2EA).

### System Data Flow
```
[Student / Parent Browser UI]
             │
      (ZoptroApiClient)
       /             \
      ▼               ▼
[GAS Production]  [Local Browser Mock]
 google.script.run   localStorage engine
      │               │
      ▼               ▼
[Google Sheets DB] [Persistent Local Store]
  - Users          - Users
  - HabitsQuests   - HabitsQuests
  - Submissions    - Submissions
  - RewardsCatalog - RewardsCatalog
  - Redemptions    - Redemptions
  - ActivityLogs   - ActivityLogs
```

### Module Boundaries
1. **Brand & Design System**: Tailwind CSS configuration, typography imports (`Outfit` display, `Figtree` body), color palette tokens, global 90° sharp geometric rules (`rounded-none`, `border-radius: 0px !important`), flat cards with generous padding, zero neon/cyber glows or gradients.
2. **Dual-User Authentication & Pairing**: Parent registration (auto-generates 6-character family pairing code), Student registration (requires valid pairing code), PIN and password authentication, persistent session token in `localStorage`, PIN-guarded role switching.
3. **Student Focus Portal**: Focus Dashboard (daily quest checklist with "Pending Parent Verification" state, streak tracker, Focus Coins & XP wallet, Level progression), Interactive GK Arena (20 questions with queued rewards), Competitive Exam Drills (9 syllabi, PYQP), Junior News & Story Labs, Rewards Catalog (redemption submission).
4. **Parent HQ (Control Hub)**: Strict Verification Queue (1-click Approve/Reject for student quest submissions and reward redemptions before wallet balances are updated), Quest & Habit Management (add, edit, archive, customize coin/XP values), Security Controls (student PIN/password management, study schedule limits), Analytics & Email Digest trigger.
5. **Dual-Mode Backend Engine (`google_apps_script_backend.js` & `ZoptroApiClient`)**:
   - Production mode: Google Apps Script with 6-sheet schema (`Users`, `HabitsQuests`, `SubmissionsQueue`, `RewardsCatalog`, `RedemptionsQueue`, `ActivityLogs`), role-based validation, parent-exclusive governance.
   - Local Browser Mock mode: In-browser `localStorage` database mirroring the 6 tables, providing complete functional parity, instant offline testability, and data persistence across refreshes.

---

## Feature Inventory
Every feature identified during the survey phase is mapped to a milestone below:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Brand Color Palette Tokens | Full integration of Authority Blue #09293D, Progress Orange #F65800, Grounded Olive #666D57, Clarity Ivory #F4F2EA, S1-S8, T1-T8 | M2 | R1, Brand PDF |
| 2 | Brand Typography System | Integration of Outfit (Display) and Figtree (Body), left-aligned default | M2 | R1, Brand PDF |
| 3 | Strict 90° Geometric Styling | Complete eradication of rounded corners (`border-radius: 0px` / `rounded-none`), zero gradients, zero neon glows | M2 | R1, Brand PDF |
| 4 | Google Sheets 6-Table Relational Schema | Self-healing schema: Users, HabitsQuests, SubmissionsQueue, RewardsCatalog, RedemptionsQueue, ActivityLogs | M1 | R4, Survey |
| 5 | Dual-Mode API Client & Browser Mock | `ZoptroApiClient` with persistent `localStorage` mock mirroring GAS backend methods | M1 | R4, Survey |
| 6 | Server-Side RBAC & Parent Governance | Role-based authorization preventing students from awarding coins or approving own tasks | M1 | R2, Survey |
| 7 | Parent Registration & Pairing Code Generation | Parent signs up, sets PIN/password, receives unique 6-char family pairing code | M3 | R2, Survey |
| 8 | Student Registration & Pairing Validation | Student signs up, requires valid pairing code, links to parent account | M3 | R2, Survey |
| 9 | PIN/Password Auth & Session Persistence | Secure login, session token stored in client storage, automatic session restore | M3 | R2, Survey |
| 10 | PIN-Guarded Role Switching | Switching between Student and Parent requires PIN/password authentication | M3 | R2, Acceptance Criteria |
| 11 | Student Focus Dashboard | Daily Quests, streak tracker, Focus Coins & XP wallet, Level progression | M3 | R3, Survey |
| 12 | Quest Submission to Verification Queue | Marking quests complete transitions to "Pending Parent Verification" without instant coins | M3 | R3, Acceptance Criteria |
| 13 | Interactive GK Arena & Study Sprints | Quizzes and focus timer with queued reward submission upon completion | M3 | R3, Survey |
| 14 | Rewards Catalog & Redemption Queue | Student browses rewards and submits redemption requests to parent queue | M3 | R3, Survey |
| 15 | Parent HQ Verification Queue | 1-click Approve/Reject for student quest submissions and reward redemptions | M3 | R3, Acceptance Criteria |
| 16 | Parent Habit & Quest Management | Add, edit, archive habits, customize coin and XP point values | M3 | R3, Survey |
| 17 | Parent Security & Account Controls | Manage student PIN/password, set study schedule limits, view audit trails | M3 | R3, Survey |
| 18 | Analytics & One-Click Email Digest | Weekly logs, streak summaries, and one-click email digest trigger | M3 | R3, Survey |
| 19 | Real-Time Feedback adhering to Brand | Audio and visual feedback with sharp geometric cues (no neon halos) | M3 | R3, Brand PDF |
| 20 | Comprehensive E2E Testing Suite (Tiers 1-4) | Automated requirement-driven opaque-box test suite verifying all features | M4 | E2E Track |
| 21 | Adversarial Coverage Hardening (Tier 5) | White-box stress tests, boundary conditions, integrity verification | M4 | E2E Track |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dual-Mode Backend Engine & Relational Schema | 6-sheet schema self-healing in GAS, RBAC parent-exclusive governance, `ZoptroApiClient` with persistent `localStorage` mock | Survey complete | DONE |
| M2 | Brand System Overhaul & Visual Identity | Eradicate all rounded corners, glows, gradients; apply Outfit/Figtree, Zoptro palette, flat 90° cards | M1 | DONE |
| M3 | Dual-User Auth, Pairing & Portal Workflows | Sign-Up/Sign-In, pairing codes, PIN role lock, Student Portal, Parent HQ verification queue & habit/security controls | M1, M2 | DONE |
| M4 | E2E Test Suite Validation & Adversarial Hardening | Pass 100% E2E tests (Tiers 1-4) published by E2E track, Tier 5 challenger hardening, forensic integrity audit | M1, M2, M3, TEST_READY | IN_PROGRESS |

---

## Interface Contracts

### 1. Backend API (`ZoptroApiClient` & GAS Bridge)
```javascript
// Auth & Pairing
signUpParent({ fullName, email, pin, password }) => Promise<{ success, user, pairingCode }>
signUpStudent({ fullName, pin, pairingCode }) => Promise<{ success, user }>
loginUser({ identifier, pinOrPassword, role }) => Promise<{ success, token, user }>
verifyRolePin({ userId, pin, targetRole }) => Promise<{ success, verified }>

// Habits & Quests
getHabitsAndQuests({ userId, role }) => Promise<{ success, habits }>
submitQuestCompletion({ studentId, questId, notes }) => Promise<{ success, submissionId, status: "PENDING_VERIFICATION" }>
saveHabit({ habitData, parentUserId }) => Promise<{ success, habit }>
deleteHabit({ habitId, parentUserId }) => Promise<{ success }>

// Verification Queue
getPendingVerifications({ parentUserId }) => Promise<{ success, pendingQuests, pendingRedemptions }>
approveQuestSubmission({ submissionId, parentUserId, bonusCoins }) => Promise<{ success, updatedWallet }>
rejectQuestSubmission({ submissionId, parentUserId, reason }) => Promise<{ success }>
approveRedemption({ redemptionId, parentUserId }) => Promise<{ success }>
rejectRedemption({ redemptionId, parentUserId, reason }) => Promise<{ success, refundedCoins }>

// Rewards Catalog
getRewardsCatalog({ userId }) => Promise<{ success, rewards }>
submitRedemptionRequest({ studentId, rewardId }) => Promise<{ success, redemptionId, status: "PENDING_APPROVAL" }>
manageRewardItem({ rewardData, parentUserId }) => Promise<{ success, reward }>

// Parent Controls & Analytics
updateStudentSecurity({ parentUserId, studentId, newPin, newPassword }) => Promise<{ success }>
getActivityLogs({ userId, role }) => Promise<{ success, logs }>
triggerEmailDigest({ parentUserId }) => Promise<{ success, message }>
```

### 2. Relational Schema Structure (Google Sheets & LocalStorage Mock)
- `Users`: `id`, `role`, `fullName`, `email`, `pinHash`, `passwordHash`, `pairingCode`, `linkedParentId`, `coins`, `xp`, `level`, `streak`, `createdAt`
- `HabitsQuests`: `id`, `parentUserId`, `title`, `category`, `points`, `xp`, `timeSlot`, `icon`, `isArchived`, `createdAt`
- `SubmissionsQueue`: `id`, `studentId`, `parentUserId`, `questId`, `questTitle`, `points`, `xp`, `status` ("PENDING", "APPROVED", "REJECTED"), `submittedAt`, `reviewedAt`, `notes`
- `RewardsCatalog`: `id`, `parentUserId`, `title`, `costCoins`, `icon`, `category`, `isArchived`, `createdAt`
- `RedemptionsQueue`: `id`, `studentId`, `parentUserId`, `rewardId`, `rewardTitle`, `costCoins`, `status` ("PENDING", "APPROVED", "REJECTED"), `requestedAt`, `reviewedAt`
- `ActivityLogs`: `id`, `userId`, `action`, `details`, `category`, `status`, `timestamp`

---

## Code Layout
- `google_apps_script_backend.js`: Production Google Apps Script backend code (doGet, database setup, sheet tables, API handlers, RBAC, email digest).
- `divyank_mission_control_google_apps_script_app.html`: Single-page frontend application containing:
  - `<head>`: Google Fonts (`Outfit`, `Figtree`), Tailwind CSS configuration with Zoptro tokens.
  - `<style>`: Global CSS rules (`border-radius: 0px !important`, `.rounded-none`, custom scrollbar).
  - `<body>`: Authentication modals, Student Portal UI, Parent HQ UI, Verification Queue UI, GK Arena, Study Sprints.
  - `<script>`: State management, `BrowserMockBackend`, `ZoptroApiClient`, UI controllers, audio effects.
- `tests/`: Automated test runner and test cases for Tiers 1-4 and Tier 5.
- `.agents/`: Coordination and audit metadata.
