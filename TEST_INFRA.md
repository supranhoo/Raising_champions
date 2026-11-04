# E2E Test Infra: Zoptro Dual-User Web Application

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` and user-facing specifications without dependence on internal implementation details.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Progressive testability: Verification mechanism exercises API endpoints, state persistence, DOM contract rules, and user interaction flows.

## Feature Inventory & Test Coverage
| # | Feature | Source (Requirement) | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Pairwise) |
|---|---------|----------------------|:----------------:|:-----------------:|:-----------------:|
| 1 | Brand Color Palette Tokens | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Brand Typography System (Outfit & Figtree) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Strict 90° Geometry (0px border-radius) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Google Sheets 6-Table Relational Schema | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 5 | Dual-Mode API Client & Browser Mock | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 6 | Server-Side RBAC & Governance | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Parent Registration & Pairing Code | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Student Registration & Code Validation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | PIN/Password Auth & Session Persistence | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 10 | PIN-Guarded Role Switching | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 11 | Student Focus Dashboard (Quests & Wallet)| ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | Quest Submission to Verification Queue | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 13 | Interactive GK Arena & Study Sprints | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 14 | Rewards Catalog & Redemption Requests | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 15 | Parent HQ Verification Queue (1-Click) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 16 | Parent Habit & Quest Management | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 17 | Parent Security & Account Controls | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 18 | Analytics & Email Digest Trigger | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 19 | Real-Time Feedback (Brand Styled) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- **Runner**: Node.js automated test runner (`tests/run_tests.js`) executing against headless JSDOM / browser mock environment.
- **Pass/Fail Semantics**: Exit code 0 on all tests passing, non-zero exit code on any failure, with detailed tier-by-tier reporting.
- **Directory Layout**:
  - `tests/tier1_feature_coverage.test.js`
  - `tests/tier2_boundary_corner.test.js`
  - `tests/tier3_pairwise_combinations.test.js`
  - `tests/tier4_real_world_scenarios.test.js`
  - `tests/tier5_adversarial_hardening.test.js`
  - `tests/run_tests.js`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Complete Family Onboarding Flow | Parent Signup -> 6-char code -> Student Signup with code -> Initial Balance check | High |
| 2 | End-to-End Daily Quest Lifecycle | Student completes Math quest -> enters Pending state (0 coins added) -> Parent logs in with PIN -> 1-click approves with bonus -> Student wallet updates | High |
| 3 | Reward Redemption Lifecycle | Student earns coins -> browses catalog -> submits redemption -> Parent rejects with reason -> coins refunded to student wallet | High |
| 4 | Offline / Browser Refresh Persistence | User performs multiple actions in standalone mode -> page reloads -> all state, logs, and queue items remain intact | High |
| 5 | Unauthorized Student Governance Attempt | Student session attempts to directly invoke parent API endpoints or bypass PIN lock -> rejected with authorization error | High |
| 6 | Habit Modification & Real-Time Sync | Parent adds new custom quest, archives obsolete quest, edits coin value -> Student portal updates and reflects changes | High |

## Coverage Thresholds
- Total features: 19
- Tier 1: ≥5 per feature (≥95 tests)
- Tier 2: ≥5 per feature (≥95 tests)
- Tier 3: Pairwise combinations across major feature interactions (≥19 tests)
- Tier 4: Realistic end-to-end user scenarios (≥6 scenarios)
- Total planned minimum test count: ≥215 tests
