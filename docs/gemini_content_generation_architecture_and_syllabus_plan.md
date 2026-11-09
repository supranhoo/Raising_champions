# Zoptro Educational Focus & Multi-Child Mission Control Platform
## Architecture & Implementation Blueprint: Gemini API Content Generation Build System, Zero-Cost CBSE/NCERT Class 1-10 Syllabus Pipeline, & Closed-Loop Response Tracking

**Document Version**: 1.0.0 (Production Authoritative)  
**Publication Date**: 2026-11-07  
**Author / Engineering Authority**: Zoptro Core Systems & Architecture Group (`m1_worker_1`)  
**Target File**: `docs/gemini_content_generation_architecture_and_syllabus_plan.md`  
**Classification**: Engineering Specification & Implementation Standard  

---

## Table of Contents
1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [Section 1: End-to-End Gemini API Data Generation Pipeline Architecture](#2-section-1-end-to-end-gemini-api-data-generation-pipeline-architecture)
   - [1.1 6-Stage Transaction Lifecycle](#11-6-stage-transaction-lifecycle)
   - [1.2 Model Selection, Endpoint Topology & Parameters](#12-model-selection-endpoint-topology--parameters)
   - [1.3 Prompt Engineering Architecture & System Instruction Formulation](#13-prompt-engineering-architecture--system-instruction-formulation)
   - [1.4 Dual-Mode Execution Model: Google Apps Script Backend vs BrowserMockBackend](#14-dual-mode-execution-model-google-apps-script-backend-vs-browsermockbackend)
     - [1.4.1 Production Google Apps Script Backend (google_apps_script_backend.js)](#141-production-google-apps-script-backend-google_apps_script_backendjs)
     - [1.4.2 Standalone Offline Browser Mock (BrowserMockBackend)](#142-standalone-offline-browser-mock-browsermockbackend)
     - [1.4.3 Unified Client Dispatcher (ZoptroApiClient.call)](#143-unified-client-dispatcher-zoptroapiclientcall)
     - [1.4.4 Interface Contract 2: Quota Status Query (getGeminiQuotaStatus)](#144-interface-contract-2-quota-status-query-getgeminiquotastatus)
   - [1.5 Structured Output Enforcement & Defensive Candidate Sanitization](#15-structured-output-enforcement--defensive-candidate-sanitization)
   - [1.6 Multi-Tier Token Quota & Budgeting System (15 RPM, 1M TPM, 1,500 RPD)](#16-multi-tier-token-quota--budgeting-system-15-rpm-1m-tpm-1500-rpd)
     - [1.6.4 True Sliding-Window Rate Limiting Engine & Concurrency Locking (15 RPM & 1,500 RPD)](#164-true-sliding-window-rate-limiting-engine--concurrency-locking-15-rpm--1500-rpd)
   - [1.7 Deterministic SHA-256 Deduplication Caching (0 Token Burn)](#17-deterministic-sha-256-deduplication-caching-0-token-burn)
   - [1.8 Direct Storage Ingestion Bridge into Table 11 CurriculumQuizzes](#18-direct-storage-ingestion-bridge-into-table-11-curriculumquizzes)
3. [Section 2: Zero-Cost CBSE / NCERT (Class 1 to 10) Syllabus Sourcing Plan & Curriculum Taxonomy](#3-section-2-zero-cost-cbse--ncert-class-1-to-10-syllabus-sourcing-plan--curriculum-taxonomy)
   - [2.1 Authoritative Public Repositories & Statutory Clearance](#21-authoritative-public-repositories--statutory-clearance)
   - [2.2 Extraction Methods & Permanent Expense-Free Long-Term Strategy](#22-extraction-methods--permanent-expense-free-long-term-strategy)
   - [2.3 Exhaustive Hierarchical Curriculum Taxonomy (Classes 1 to 10)](#23-exhaustive-hierarchical-curriculum-taxonomy-classes-1-to-10)
     - [2.3.1 Stage 1: Foundational Stage (Classes 1 & 2)](#231-stage-1-foundational-stage-classes-1--2)
     - [2.3.2 Stage 2: Preparatory Stage (Classes 3 to 5)](#232-stage-2-preparatory-stage-classes-3-to-5)
     - [2.3.3 Stage 3: Middle Stage (Classes 6 to 8)](#233-stage-3-middle-stage-classes-6-to-8)
     - [2.3.4 Stage 4: Secondary Stage (Classes 9 & 10 — CBSE Board Core)](#234-stage-4-secondary-stage-classes-9--10--cbse-board-core)
   - [2.4 Application Integration & Cascading Selectors Architecture](#24-application-integration--cascading-selectors-architecture)
   - [2.5 Long-Term Maintenance & Verification Protocol](#25-long-term-maintenance--verification-protocol)
4. [Section 3: Closed-Loop Exam Preparation Content Workflow & Response Tracking Architecture](#4-section-3-closed-loop-exam-preparation-content-workflow--response-tracking-architecture)
   - [3.1 Pedagogical Foundations & Cognitive Alignment](#31-pedagogical-foundations--cognitive-alignment)
   - [3.2 Operational Admin Studio Workflow in #view-admin](#32-operational-admin-studio-workflow-in-view-admin)
   - [3.3 Downstream Student Execution & Response Telemetry Pipeline](#33-downstream-student-execution--response-telemetry-pipeline)
   - [3.4 Parent HQ Answer Sheet Drilldown & Forensic Audit](#34-parent-hq-answer-sheet-drilldown--forensic-audit)
   - [3.5 Closed-Loop Adaptive Feedback & Remediation Engine](#35-closed-loop-adaptive-feedback--remediation-engine)
5. [Architectural Invariants, Security Mitigations, & Brand Discipline](#5-architectural-invariants-security-mitigations--brand-discipline)
   - [5.1 Visual Brand Expression & Geometry Compliance (0px Universal Radius)](#51-visual-brand-expression--geometry-compliance-0px-universal-radius)
   - [5.2 Formula & CSV Injection Mitigation (CWE-1236)](#52-formula--csv-injection-mitigation-cwe-1236)
   - [5.3 Multi-Row Concurrency Locking (withScriptLock & Rate Limiting Locks)](#53-multi-row-concurrency-locking-withscriptlock--rate-limiting-locks)
   - [5.4 Strict DOM Element ID Resolution Invariant (M6-REG-01)](#54-strict-dom-element-id-resolution-invariant-m6-reg-01)
6. [Verification Commands & Regression Test Harness](#6-verification-commands--regression-test-harness)
   - [6.1 Master Test Suite Execution](#61-master-test-suite-execution)
   - [6.2 Question-Level Tracking & Bulk Ingestion Verification](#62-question-level-tracking--bulk-ingestion-verification)
   - [6.3 Adversarial Stress & Architectural Invariant Suites (Challengers 1 & 2)](#63-adversarial-stress--architectural-invariant-suites-challengers-1--2)
   - [6.4 Brand Discipline & DOM Invariant Verification](#64-brand-discipline--dom-invariant-verification)
   - [6.5 Invalidation Conditions](#65-invalidation-conditions)
7. [Implementation Milestone Roadmap (Milestones 2 to 5)](#7-implementation-milestone-roadmap-milestones-2-to-5)

---

## 1. Executive Summary & System Overview

### 1.1 Context & Core Problem Statement
The **Zoptro Educational Focus & Multi-Child Mission Control Platform** delivers an integrated learning operating system tailored for Indian school education (Classes 1 through 10) aligned with the **National Education Policy 2020 (NEP 2020)** and the **National Curriculum Framework (NCF-SE / NCF-FS)**. A central operational bottleneck in scaling personalized education is the continuous creation of syllabus-accurate, pedagogically rigorous assessment items without incurring recurring software licensing fees, API token exhaustion, or unvetted content ingestion.

This document establishes the authoritative technical blueprint for:
1. **Zero-Cost LLM Content Generation Pipeline**: Utilizing the Google AI Studio Free Tier (Gemini 1.5 Flash and Gemini 2.0 Flash) with multi-tier quota management, sliding-window rate limiting, and cryptographic deduplication caching to guarantee $0.00 operational cost.
2. **Dual-Mode Architectural Parity**: Delivering 100% contract parity between the server-side Google Apps Script backend (`google_apps_script_backend.js`) and the client-side `BrowserMockBackend` within the standalone SPA (`divyank_mission_control_google_apps_script_app.html`).
3. **Zero-Cost CBSE/NCERT Class 1-10 Sourcing Plan**: Extracting official curriculum outlines and learning outcomes from sovereign Indian Digital Public Goods (NCERT Open Textbooks, ePathshala, DIKSHA Sunbird APIs, NDEAR, data.gov.in) under statutory copyright exemptions, compiled into an immutable, zero-latency static manifest.
4. **Closed-Loop Educational Architecture**: Connecting administrator generation, interactive preview, and bulk storage (Table 11 `CurriculumQuizzes`) directly to adaptive student practice sessions, granular choice telemetry (Table 14 `StudentQuestionResponses`), and forensic parental drilldown (`getStudentAnswerSheet`).

```
========================================================================================================================
                          ZOPTRO CLOSED-LOOP EDUCATIONAL OPERATING SYSTEM
========================================================================================================================

 [CBSE / NCERT OER Repositories]  ──>  [Static Manifest Compiler]  ──>  [Curriculum Taxonomy Manifest (~140 KB)]
 (NCERT, DIKSHA, ePathshala, NDEAR)                                                    │
                                                                                       ▼
 [Admin Generation Studio (#view-admin)] ◄──────────────────────────────── [Cascading Class 1-10 Selectors]
   │ (Admin selects Grade, Subject, Chapter, Topic, Bloom's Level, Quantity)
   ▼
 [Dual-Mode Client Dispatcher: ZoptroApiClient.call]
   ├───────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
   ▼                                                       ▼                                                        ▼
 [Google Apps Script Backend]                            [BrowserMockBackend (Offline)]                           [SHA-256 Deduplication Cache]
 • PropertiesService Key Storage                         • LocalStorage Mock Key Storage                          • Fingerprint check
 • UrlFetchApp (muteHttpExceptions: true)                • Generative Template Synthesizer                        • Cache Hit = 0 Token Burn
 • Sliding-Window Rate Limiter (15 RPM / 1.5K RPD)       • Local Rate Limiter & Token Meter                       • Cache Miss = AI Dispatch
 • Google Sheets Relational Persistence                  • In-Memory ActivityLogs                                 └────────────┬───────────┘
   └───────────────────────────┬───────────────────────────┴───────────────────────────────────────────────────────────────────┘
                               │
                               ▼
               [Structured JSON Output & Sanitization]
               • responseMimeType: "application/json"
               • responseSchema: OpenAPI 3.0 Array of Objects
               • Markdown Fence Stripping & Control Char Scrubbing
               • Formula Injection Neutralization (CWE-1236)
                               │
                               ▼
               [Interactive Admin Staging Deck]
               • Inline Stem / Option / Hint / Explanation Editing
               • Single-Item Discard & Count Recalculation
               • Human-in-the-Loop Verification Gate
                               │
                               ▼
               [bulkUploadContentBatch Bridge]
               • withScriptLock Concurrency Control (10,000ms)
               • Ingestion into Table 11 CurriculumQuizzes
                               │
                               ▼
               [Downstream Student Practice Engine]
               • getContentByGrade & getNextPersonalizedCurriculum
               • Granular Response Telemetry to Table 14 StudentQuestionResponses
                               │
                               ▼
               [Parent HQ Answer Sheet & Adaptive Feedback Loop]
               • getStudentAnswerSheet Forensic Inspection
               • Adaptive Pacing (REINFORCEMENT_REVIEW vs NEXT_TOPIC)
               • Deficit Telemetry Fed Back to Admin Generation Deck
========================================================================================================================
```

---

## 2. Section 1: End-to-End Gemini API Data Generation Pipeline Architecture

### 1.1 6-Stage Transaction Lifecycle
The content generation pipeline transforms administrator curriculum selections into classroom-ready, schema-validated questions through six deterministic stages:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: Admin Parameter Configuration & Curriculum Resolution                                          │
│ Administrator selects Grade (1-10), Subject, Chapter, Topic, Bloom's Level, Question Type, Quantity     │
└────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │
┌────────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ STAGE 2: Deduplication Check & Fingerprint Resolution                                                   │
│ Computes SHA-256 hash: sha256(["gemini",model,grade,subject,chapter,topic,type,qty,diff,bloom].join("::"))│
│ If cache entry exists in ScriptCache/localStorage and !forceRefresh, return cached data (0 token burn). │
└────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │ (Cache Miss)
┌────────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ STAGE 3: Multi-Tier Quota & Rate Limit Verification                                                     │
│ Verify sliding 60-second window (<15 RPM) and daily UTC counter (<1,500 RPD).                           │
│ If exceeded, return actionable 429 response with exact retryAfterSeconds.                              │
└────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │ (Within Limits)
┌────────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ STAGE 4: Prompt Compilation & API Dispatch (Dual-Mode)                                                  │
│ GAS: Dispatches via UrlFetchApp.fetch with muteHttpExceptions: true and API key from PropertiesService.  │
│ Browser: Dispatches via BrowserMockBackend generative simulation or browser fetch.                     │
└────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │
┌────────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ STAGE 5: Structured Output Validation & Candidate Sanitization                                          │
│ Validates response against OpenAPI JSON Schema; strips markdown code fences; verifies array length;      │
│ normalizes 4 options; validates correctOptionIndex [0..3]; neutralizes formula injection (CWE-1236).    │
└────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │
┌────────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ STAGE 6: Staging Deck Inspection & Direct Storage Commitment                                            │
│ Items rendered into inspection card deck. Admin edits/discards items. One-click commit calls             │
│ bulkUploadContentBatch, appending records atomically to Table 11 CurriculumQuizzes.                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Model Selection, Endpoint Topology & Parameters
The build system targets the Google AI Studio Free Tier REST API:
- **Default Production Model**: `gemini-1.5-flash`
  - Context Window: 1,048,576 tokens
  - Free Tier Rate Limits: 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), 1,500 Requests Per Day (RPD)
  - Latency: ~1.8–3.5s for 5 assessment items
  - Cost: Permanently $0.00 / Free of charge
- **Advanced / Low-Latency Model**: `gemini-2.0-flash`
  - Context Window: 1,048,576 tokens
  - Free Tier Rate Limits: 15 RPM, 4,000,000 TPM, 1,500 RPD
  - Latency: ~0.9–2.2s for 5 assessment items
  - Cost: Permanently $0.00 / Free of charge
- **HTTP Endpoint Topology**:
  ```http
  POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
  Content-Type: application/json
  ```
- **Hyperparameter Optimization**:
  - `temperature: 0.2`: Low temperature suppresses hallucination, ensures syllabus adherence, and enforces strict adherence to textbook terminology.
  - `topP: 0.95`, `topK: 40`: Provides adequate lexical variety across distractors while retaining factual precision.
  - `maxOutputTokens: 8192`: Upgraded from 4096 to provide robust headroom for maximum generation batches (quantity = 20) with in-depth pedagogical explanations and distractor rationale, eliminating truncation risk (MAX_TOKENS finish reason).

---

### 1.3 Prompt Engineering Architecture & System Instruction Formulation

#### 1.3.1 System Instruction (`system_instruction`)
```text
You are an expert CBSE/NCERT curriculum designer, psychometrician, and master educator for Indian school students (Class 1 to Class 10).
Your mission is to generate high-quality, syllabus-accurate, pedagogically rigorous assessment questions.

Strict Pedagogical Principles:
1. CURRICULUM FIDELITY: Strictly adhere to the NCERT/CBSE syllabus for the designated Grade and Subject.
2. COGNITIVE CALIBRATION: Calibrate vocabulary, complexity, and reading level to the child's exact age and Grade.
3. BLOOM'S TAXONOMY ALIGNMENT: Questions must explicitly reflect the requested cognitive domain (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).
4. DISTRACTOR INTEGRITY (for MCQs):
   - Provide exactly 4 options: A, B, C, D (indices 0, 1, 2, 3).
   - Exactly ONE option is correct.
   - The three distractors must be plausible, developmentally relevant misconceptions, not obviously absurd or trivial.
   - Avoid "All of the above" or "None of the above".
   - Options must be mutually exclusive and comparable in length.
5. PEDAGOGICAL HINTS & EXPLANATIONS:
   - "hint": A supportive, non-revealing clue encouraging critical thinking and metacognitive recall.
   - "explanation": A thorough, crystal-clear conceptual explanation detailing WHY the correct option is right and WHY the specific misconceptions in the distractors are incorrect.
6. ZERO FORMULA INJECTION: Never output leading arithmetic operators (=, +, -, @) that could trigger spreadsheet formula execution.
7. STRUCTURED JSON COMPLIANCE: Return ONLY a valid JSON array matching the declared responseSchema.
```

#### 1.3.2 User Prompt Compilation Function
```javascript
function compileGeminiUserPrompt(params) {
  const gradeClass = params.gradeClass || "Class 3";
  const subject = params.subject || "General Science";
  const chapter = params.chapter || "General";
  const topic = params.topic || "Core Concepts";
  const questionType = params.questionType || "MCQ";
  const quantity = Math.min(Math.max(Number(params.quantity) || 5, 1), 20);
  const difficulty = params.difficulty || "Medium";
  const bloomLevel = params.bloomLevel || "Applying";

  return [
    `Target Assessment Specifications:`,
    `- Educational Board: CBSE / NCERT (National Curriculum Framework)`,
    `- Grade / Level: ${gradeClass}`,
    `- Subject: ${subject}`,
    `- Chapter: ${chapter}`,
    `- Specific Topic: ${topic}`,
    `- Question Type: ${questionType}`,
    `- Number of Items to Generate: ${quantity}`,
    `- Target Difficulty: ${difficulty}`,
    `- Cognitive Level (Bloom's Revised): ${bloomLevel}`,
    ``,
    `Requirements:`,
    `Generate exactly ${quantity} high-yield, classroom-ready assessment items.`,
    `Ensure each item includes a descriptive title, unambiguous questionText, exactly 4 clear options for MCQs, the 0-based integer correctOptionIndex, a thought-provoking hint, and a comprehensive educational explanation.`,
    `All items must be structured according to the supplied responseSchema.`
  ].join("\n");
}
```

---

### 1.4 Dual-Mode Execution Model: Google Apps Script Backend vs BrowserMockBackend

#### 1.4.1 Production Google Apps Script Backend (`google_apps_script_backend.js`)
In Google Apps Script, network requests must utilize the native `UrlFetchApp` service. By default, `UrlFetchApp.fetch` throws an unhandled script exception whenever an HTTP error status code ($\ge 400$) is returned, crashing the transaction and preventing inspection of the response body.

Setting `muteHttpExceptions: true` is an absolute architectural requirement. It allows the backend to intercept HTTP 400 (malformed schema), HTTP 403 (invalid API key), HTTP 429 (rate limit or daily quota breach), and HTTP 500/503 (model overload), returning structured error payloads to the client without terminating the script.

API keys are retrieved strictly on the server via `PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY")`, ensuring credentials never leak to the client browser.

```javascript
function executeGeminiApiCall(model, apiKey, payloadJson) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(apiKey);

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payloadJson),
    muteHttpExceptions: true, // MANDATORY: Captures 4xx/5xx responses safely
    validateHttpsCertificates: true
  };

  const startTime = Date.now();
  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (netErr) {
    return {
      success: false,
      statusCode: 0,
      error: "NETWORK_FAILURE: " + netErr.message,
      durationMs: Date.now() - startTime
    };
  }

  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();
  const durationMs = Date.now() - startTime;

  return {
    success: statusCode >= 200 && statusCode < 300,
    statusCode: statusCode,
    bodyText: responseText,
    durationMs: durationMs
  };
}
```

#### 1.4.2 Standalone Offline Browser Mock (`BrowserMockBackend`)
In `divyank_mission_control_google_apps_script_app.html`, `BrowserMockBackend` replicates 100% of the GAS backend interface. When the app runs offline or in local development:
1. **Live Passthrough**: If `localStorage.getItem("zoptro_gemini_api_key")` is set, `BrowserMockBackend` executes a client-side `fetch()` directly to Google AI Studio.
2. **Generative Simulation**: If offline or no key is present, `BrowserMockBackend` utilizes an embedded curriculum template synthesizer, generating realistic assessment items, computing simulated tokens ($\approx 1\text{ token per } 4\text{ characters}$), enforcing rate limits (15 RPM, 1,500 RPD), and persisting records to `localStorage`.

```javascript
/**
 * Canonical SHA-256 fingerprint formula for Gemini deduplication caching.
 * Identical across GAS Backend and BrowserMockBackend.
 * Joined by double-colon "::" to eliminate delimiter injection collisions.
 */
function computeGeminiRequestFingerprint(payload) {
  const p = payload || {};
  const model = p.model || "gemini-1.5-flash";
  const grade = p.gradeClass || p.grade || "Class 3";
  const subject = p.subject || "General Science";
  const chapter = p.chapter || "General";
  const topic = p.topic || "Core Concepts";
  const questionType = p.questionType || "MCQ";
  const quantity = String(Math.min(Math.max(Number(p.quantity) || 5, 1), 20));
  const difficulty = p.difficulty || "Medium";
  const bloomLevel = p.bloomLevel || "Applying";

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

BrowserMockBackend.generateCurriculumQuestionsWithGemini = function(payload) {
  const p = payload || {};
  const adminUserId = p.adminUserId ? String(p.adminUserId) : "";
  const adminCheck = (typeof this.assertAdmin === "function")
    ? this.assertAdmin(adminUserId)
    : (typeof this._assertAdmin === "function" ? this._assertAdmin(adminUserId) : { success: true });
  if (!adminCheck.success) return adminCheck;

  const model = p.model || "gemini-1.5-flash";

  // 1. Sliding-Window Rate Limiting Verification (15 RPM / 1,500 RPD)
  const rateLimitCheck = this._checkMockRateLimits(false, model);
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: rateLimitCheck.error,
      rateLimits: rateLimitCheck
    };
  }

  // 2. Canonical Deduplication Cache Check
  const fingerprint = computeGeminiRequestFingerprint(p);
  const cacheKey = "zoptro_cache_" + fingerprint;

  if (!p.forceRefresh) {
    const cached = this._getCacheItem(cacheKey);
    if (cached) {
      return {
        success: true,
        cached: true,
        items: cached.items,
        tokenUsage: {
          promptTokens: 0,
          candidateTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0.0000
        },
        rateLimits: rateLimitCheck
      };
    }
  }

  // 3. Consume 1 Rate Limit Token for Active Generation
  const activeRateLimits = this._checkMockRateLimits(true, model);

  // 4. Synthesize questions from curriculum taxonomy
  const items = this._synthesizeCurriculumQuestions(p);
  const promptTokens = Math.ceil(JSON.stringify(p).length / 4);
  const candidateTokens = Math.ceil(JSON.stringify(items).length / 4);
  const totalTokens = promptTokens + candidateTokens;

  // 5. Commit to Local Deduplication Cache (6-hour TTL)
  this._setCacheItem(cacheKey, {
    items: items,
    model: model,
    promptTokens: promptTokens,
    candidateTokens: candidateTokens
  }, 21600000);

  // 6. Record Metered Token Log in localStorage
  this._recordMockTokenLog({
    adminUserId: adminUserId,
    model: model,
    promptTokens: promptTokens,
    candidateTokens: candidateTokens,
    totalTokens: totalTokens,
    itemCount: items.length,
    isCached: false,
    gradeClass: p.gradeClass || p.grade || "Class 3",
    subject: p.subject || "General Science",
    chapter: p.chapter || "General",
    topic: p.topic || "Core Concepts",
    questionType: p.questionType || "MCQ",
    difficulty: p.difficulty || "Medium"
  });

  return {
    success: true,
    cached: false,
    items: items,
    tokenUsage: {
      promptTokens: promptTokens,
      candidateTokens: candidateTokens,
      totalTokens: totalTokens,
      estimatedCostUsd: 0.0000
    },
    rateLimits: activeRateLimits
  };
};

/**
 * 1. Mock Rate Limiter Helper: Sliding 60-second window (15 RPM) & Daily UTC (1,500 RPD).
 * Supports invocation as _checkMockRateLimits(consume, model) or _checkMockRateLimits(model).
 */
BrowserMockBackend._checkMockRateLimits = function(consume, model) {
  let shouldConsume = false;
  let selectedModel = "gemini-1.5-flash";

  if (typeof consume === "boolean") {
    shouldConsume = consume;
    if (typeof model === "string") selectedModel = model;
  } else if (typeof consume === "string") {
    selectedModel = consume;
    if (typeof model === "boolean") shouldConsume = model;
  }

  const modelSafeKey = selectedModel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const now = Date.now();
  const windowStart = now - 60000;
  const rpmLimit = 15;
  const rpdLimit = 1500;

  const timestampsKey = "zoptro_mock_gemini_rpm_timestamps_" + modelSafeKey;
  const rpdKey = "zoptro_mock_gemini_rpd_counter_" + modelSafeKey;

  // Fallback storage accessor
  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // Evaluate sliding 60-second RPM timestamps
  let rpmTimestamps = [];
  try {
    const rawRpm = storage.getItem(timestampsKey) || storage.getItem("zoptro_mock_gemini_rpm_timestamps");
    rpmTimestamps = rawRpm ? JSON.parse(rawRpm) : [];
    if (!Array.isArray(rpmTimestamps)) rpmTimestamps = [];
  } catch (e) {
    rpmTimestamps = [];
  }
  rpmTimestamps = rpmTimestamps.filter(function(t) { return typeof t === "number" && t > windowStart; });
  rpmTimestamps.sort(function(a, b) { return a - b; });
  const rpmCurrent = rpmTimestamps.length;
  const rpmRemaining = Math.max(0, rpmLimit - rpmCurrent);

  // Evaluate UTC daily request counter
  const todayUtc = new Date(now).toISOString().substring(0, 10);
  let rpdData = { date: todayUtc, count: 0 };
  try {
    const rawRpd = storage.getItem(rpdKey) || storage.getItem("zoptro_mock_gemini_rpd_counter");
    if (rawRpd) {
      const parsed = JSON.parse(rawRpd);
      if (parsed && parsed.date === todayUtc) {
        rpdData = parsed;
      }
    }
  } catch (e) {
    rpdData = { date: todayUtc, count: 0 };
  }
  const rpdCurrent = Number(rpdData.count) || 0;
  const rpdRemaining = Math.max(0, rpdLimit - rpdCurrent);

  if (rpdCurrent >= rpdLimit) {
    const secondsUntilMidnightUtc = Math.max(1, 86400 - (Math.floor(now / 1000) % 86400));
    return {
      allowed: false,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmCurrent,
      rpmRemaining: 0,
      rpdLimit: rpdLimit,
      rpdCurrent: rpdCurrent,
      rpdRemaining: 0,
      retryAfterSeconds: secondsUntilMidnightUtc,
      error: "DAILY_QUOTA_EXCEEDED: Free tier limit of 1,500 requests per day reached for " + selectedModel + ". Resets at UTC 00:00:00."
    };
  }

  if (rpmCurrent >= rpmLimit) {
    const oldestTimestamp = rpmTimestamps[0] || windowStart;
    const retryAfterMs = (oldestTimestamp + 60000) - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      allowed: false,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmCurrent,
      rpmRemaining: 0,
      rpdLimit: rpdLimit,
      rpdCurrent: rpdCurrent,
      rpdRemaining: rpdRemaining,
      retryAfterSeconds: retryAfterSeconds,
      error: "RATE_LIMIT_EXCEEDED: Free tier limit (15 RPM) reached for " + selectedModel + ". Please throttle requests."
    };
  }

  if (shouldConsume) {
    rpmTimestamps.push(now);
    storage.setItem(timestampsKey, JSON.stringify(rpmTimestamps));
    storage.setItem("zoptro_mock_gemini_rpm_timestamps", JSON.stringify(rpmTimestamps));

    rpdData.count = rpdCurrent + 1;
    rpdData.date = todayUtc;
    storage.setItem(rpdKey, JSON.stringify(rpdData));
    storage.setItem("zoptro_mock_gemini_rpd_counter", JSON.stringify(rpdData));

    return {
      allowed: true,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmTimestamps.length,
      rpmRemaining: Math.max(0, rpmLimit - rpmTimestamps.length),
      rpdLimit: rpdLimit,
      rpdCurrent: rpdData.count,
      rpdRemaining: Math.max(0, rpdLimit - rpdData.count),
      retryAfterSeconds: 0
    };
  }

  return {
    allowed: true,
    rpmLimit: rpmLimit,
    rpmCurrent: rpmCurrent,
    rpmRemaining: rpmRemaining,
    rpdLimit: rpdLimit,
    rpdCurrent: rpdCurrent,
    rpdRemaining: rpdRemaining,
    retryAfterSeconds: 0
  };
};

/**
 * 2. Mock Deduplication Cache Retrieval Helper
 */
BrowserMockBackend._getCacheItem = function(key) {
  if (!key) return null;
  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let cacheMap = {};
  try {
    const raw = storage.getItem("zoptro_gemini_cache");
    cacheMap = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return null;
  }

  const entry = cacheMap[key];
  if (!entry) return null;

  const now = Date.now();
  const ttlMs = Number(entry.ttlMs) || 21600000;
  if (now - Number(entry.timestamp) > ttlMs) {
    delete cacheMap[key];
    try {
      storage.setItem("zoptro_gemini_cache", JSON.stringify(cacheMap));
    } catch (e) {}
    return null;
  }

  try {
    const currentHits = parseInt(storage.getItem("zoptro_mock_gemini_cache_hits") || "0", 10);
    storage.setItem("zoptro_mock_gemini_cache_hits", String(currentHits + 1));
  } catch (e) {}

  return entry;
};

/**
 * 3. Mock Deduplication Cache Persistence Helper (Capacity cap: 200 items)
 */
BrowserMockBackend._setCacheItem = function(key, data, ttlMs) {
  if (!key || !data || !Array.isArray(data.items)) return false;
  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let effectiveTtlMs = 21600000;
  if (typeof ttlMs === "number" && ttlMs > 0) {
    effectiveTtlMs = ttlMs > 86400 ? ttlMs : ttlMs * 1000;
  }

  let cacheMap = {};
  try {
    const raw = storage.getItem("zoptro_gemini_cache");
    cacheMap = raw ? JSON.parse(raw) : {};
  } catch (e) {
    cacheMap = {};
  }

  const now = Date.now();
  const keys = Object.keys(cacheMap);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const item = cacheMap[k];
    if (!item || (now - Number(item.timestamp)) > (Number(item.ttlMs) || effectiveTtlMs)) {
      delete cacheMap[k];
    }
  }

  const remainingKeys = Object.keys(cacheMap);
  if (remainingKeys.length >= 200) {
    remainingKeys.sort(function(a, b) { return (cacheMap[a].timestamp || 0) - (cacheMap[b].timestamp || 0); });
    for (let j = 0; j < 20; j++) {
      delete cacheMap[remainingKeys[j]];
    }
  }

  cacheMap[key] = {
    fingerprint: key,
    timestamp: now,
    ttlMs: effectiveTtlMs,
    model: data.model || "gemini-1.5-flash",
    items: data.items,
    promptTokens: data.promptTokens || 0,
    candidateTokens: data.candidateTokens || 0,
    totalTokens: (data.promptTokens || 0) + (data.candidateTokens || 0)
  };

  try {
    storage.setItem("zoptro_gemini_cache", JSON.stringify(cacheMap));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 4. Mock Pedagogical Question Synthesis Helper
 */
BrowserMockBackend._synthesizeCurriculumQuestions = function(payload) {
  const p = payload || {};
  const grade = p.gradeClass || p.grade || "Class 3";
  const subject = p.subject || "General Science";
  const chapter = p.chapter || "Unit 1";
  const topic = p.topic || "Core Concept";
  const questionType = p.questionType || "MCQ";
  const quantity = Math.max(1, Math.min(20, Number(p.quantity) || 5));
  const difficulty = p.difficulty || "Medium";
  const bloomLevel = p.bloomLevel || "Applying";

  const items = [];
  const now = Date.now();

  for (let idx = 0; idx < quantity; idx++) {
    const itemId = "cur_mock_" + now + "_" + (idx + 1);
    const itemNumber = idx + 1;
    let title = subject + " " + grade + ": " + topic + " (Q" + itemNumber + ")";
    let questionText = "";
    let options = [];
    let correctOptionIndex = 0;
    let hint = "";
    let explanation = "";

    if (questionType === "TRUE_FALSE") {
      questionText = "In " + grade + " " + subject + " (" + chapter + "), " + topic + " directly governs observed experimental behavior under standard conditions.";
      options = ["True", "False"];
      correctOptionIndex = (itemNumber % 2 === 1) ? 0 : 1;
      hint = "Consider the baseline definition of " + topic + " in " + chapter + ".";
      explanation = "According to CBSE " + grade + " " + subject + " guidelines, this statement is " + options[correctOptionIndex] + " because " + topic + " defines this principle.";
    } else if (questionType === "SHORT_ANSWER") {
      questionText = "Explain the fundamental significance of " + topic + " in " + chapter + " (" + grade + " " + subject + ").";
      options = [];
      correctOptionIndex = -1;
      hint = "Identify at least two core characteristics of " + topic + ".";
      explanation = topic + " is essential in " + chapter + " because it establishes the relationship between fundamental properties and observable behaviors.";
    } else if (questionType === "FILL_IN_BLANK") {
      questionText = "In the study of " + chapter + ", the primary mechanism of " + topic + " is classified as a _______ process.";
      options = ["Fundamental", "Secondary", "Synthetic", "Variable"];
      correctOptionIndex = 0;
      hint = "Recall the standard taxonomy classification from NCERT " + grade + " " + subject + ".";
      explanation = "Fundamental is the verified textbook terminology for " + topic + ".";
    } else if (questionType === "NUMERICAL") {
      const valA = 5 * (idx + 2);
      const valB = 3 * (idx + 1);
      const answer = valA + valB;
      questionText = "In an experiment regarding " + topic + " (" + chapter + "), component A produces " + valA + " units and component B produces " + valB + " units. Compute the combined output.";
      options = [
        String(answer) + " units",
        String(answer - 5) + " units",
        String(answer + 10) + " units",
        String(valA * 2) + " units"
      ];
      correctOptionIndex = 0;
      hint = "Sum the individual component values directly.";
      explanation = "Total combined output = " + valA + " + " + valB + " = " + answer + " units.";
    } else {
      // Default: MCQ (Exactly 4 options)
      questionText = "Which statement correctly describes " + topic + " within CBSE " + grade + " " + subject + " (" + chapter + ")?";
      options = [
        "It represents the validated scientific principle governing " + topic + " under standard conditions.",
        "It directly contradicts observable behavior in standard experimental procedures.",
        "It applies only when " + topic + " is completely absent from the system.",
        "It is an obsolete hypothesis discarded in contemporary NCERT curricula."
      ];
      correctOptionIndex = 0;
      hint = "Recall the primary rule discussed in NCERT " + grade + " " + subject + ", Chapter: " + chapter + ".";
      explanation = "Option A is correct because " + topic + " represents the established standard across " + grade + " CBSE curriculum blueprints.";
    }

    items.push({
      id: itemId,
      grade: grade,
      subject: subject,
      chapter: chapter,
      topic: topic,
      title: title,
      questionText: questionText,
      options: options,
      optionsJson: JSON.stringify(options),
      correctOptionIndex: correctOptionIndex,
      hint: hint,
      explanation: explanation,
      bloomLevel: bloomLevel,
      difficulty: difficulty,
      examCategory: "CBSE"
    });
  }

  return items;
};

/**
 * 5. Mock Metered Token Log Helper (Capacity cap: 1,000 records)
 */
BrowserMockBackend._recordMockTokenLog = function(entry) {
  const now = new Date().toISOString();
  const id = "tok_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const logRecord = {
    id: id,
    timestamp: now,
    adminUserId: entry.adminUserId || "",
    model: entry.model || "gemini-1.5-flash",
    promptTokens: Number(entry.promptTokens || 0),
    candidateTokens: Number(entry.candidateTokens || 0),
    totalTokens: Number(entry.totalTokens || 0),
    estimatedCostUsd: 0.0000,
    itemCount: Number(entry.itemCount || 0),
    isCached: Boolean(entry.isCached),
    gradeClass: entry.gradeClass || "",
    subject: entry.subject || "",
    chapter: entry.chapter || "",
    topic: entry.topic || "",
    questionType: entry.questionType || "MCQ",
    difficulty: entry.difficulty || "Medium"
  };

  let logs = [];
  try {
    const raw = storage.getItem("zoptro_gemini_token_logs");
    logs = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(logs)) logs = [];
  } catch (e) {
    logs = [];
  }

  logs.push(logRecord);

  if (logs.length > 1000) {
    logs = logs.slice(logs.length - 1000);
  }

  try {
    storage.setItem("zoptro_gemini_token_logs", JSON.stringify(logs));
  } catch (e) {}

  return logRecord;
};
```

#### 1.4.3 Unified Client Dispatcher (`ZoptroApiClient.call`)
The client SPA invokes `ZoptroApiClient` methods, which transparently route through `google.script.run` in GAS or dispatch directly to `BrowserMockBackend` in offline browser environments:

```javascript
ZoptroApiClient.generateCurriculumQuestionsWithGemini = function(payload) {
  return this.call("generateCurriculumQuestionsWithGemini", payload);
};

ZoptroApiClient.getGeminiQuotaStatus = function(payload) {
  return this.call("getGeminiQuotaStatus", payload);
};
```

#### 1.4.4 Interface Contract 2: Quota Status Query (`getGeminiQuotaStatus`)

To satisfy Requirement R3 and power the Admin Studio Quota HUD Banner (`#aiGenTokenStatsBanner`), the platform provides a dedicated quota inspection endpoint. Both the Google Apps Script backend and `BrowserMockBackend` implement this contract with full schema parity.

##### 1. TypeScript Contract Signatures
```typescript
interface QuotaStatusPayload {
  adminUserId: string;
}

interface QuotaStatusResponse {
  success: boolean;
  model: string;              // "gemini-1.5-flash"
  rpmLimit: number;           // 15
  rpmCurrent: number;         // Requests consumed in current 60s sliding window
  rpmRemaining: number;       // Math.max(0, rpmLimit - rpmCurrent)
  rpdLimit: number;           // 1500
  rpdCurrent: number;         // Requests consumed today (UTC)
  rpdRemaining: number;       // Math.max(0, rpdLimit - rpdCurrent)
  totalTokensLogged: number;  // Lifetime cumulative tokens recorded in GeminiTokenLogs
  totalCallsLogged: number;   // Lifetime cumulative generation API calls recorded
  cacheHitCount: number;      // Lifetime cumulative deduplication cache hits
  error?: string;
  code?: number;
}
```

##### 2. Google Apps Script Backend Implementation (`google_apps_script_backend.js`)
```javascript
/**
 * Interface Contract 2: Inspects current Gemini API quota telemetry,
 * rate limit window counters (RPM/RPD), cumulative token consumption,
 * and cache hit statistics.
 *
 * Guarded by assertAdmin(adminUserId).
 *
 * @param {Object} payload - { adminUserId: string }
 * @return {QuotaStatusResponse}
 */
function getGeminiQuotaStatus(payload) {
  const adminUserId = payload && payload.adminUserId ? String(payload.adminUserId) : "";
  const adminCheck = assertAdmin(adminUserId);
  if (!adminCheck.success) {
    return adminCheck;
  }

  const defaultModel = "gemini-1.5-flash";
  const modelSafeKey = defaultModel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const rpmLimit = 15;
  const rpdLimit = 1500;
  const now = Date.now();
  const todayUtc = new Date(now).toISOString().substring(0, 10);
  const rpdKey = "gemini_rpd_" + modelSafeKey + "_" + todayUtc;
  const timestampsKey = "gemini_rpm_timestamps_" + modelSafeKey;

  const cache = (typeof CacheService !== "undefined" && CacheService && CacheService.getScriptCache)
    ? CacheService.getScriptCache()
    : null;

  // 1. Sliding 60-Second Window RPM Telemetry (Non-mutating read & prune)
  let rpmCurrent = 0;
  if (cache) {
    try {
      const rawTs = cache.get(timestampsKey);
      if (rawTs) {
        const parsed = JSON.parse(rawTs);
        if (Array.isArray(parsed)) {
          const windowStart = now - 60000;
          const active = parsed.filter(function(ts) { return typeof ts === "number" && ts > windowStart; });
          rpmCurrent = active.length;
        }
      }
    } catch (e) {
      rpmCurrent = 0;
    }
  }
  const rpmRemaining = Math.max(0, rpmLimit - rpmCurrent);

  // 2. Daily RPD Telemetry
  const dailyRaw = cache ? cache.get(rpdKey) : null;
  const rpdCurrent = dailyRaw ? parseInt(dailyRaw, 10) : 0;
  const rpdRemaining = Math.max(0, rpdLimit - rpdCurrent);

  // 3. Cumulative Token & Call Telemetry from Table 15 GeminiTokenLogs
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
        if (row.isCached === true || String(row.isCached).toLowerCase() === "true" || Number(row.totalTokens) === 0) {
          cacheHitCount++;
        }
      }
    }
  } catch (sheetErr) {
    // If Table 15 not yet initialized, defaults remain 0
  }

  // 4. Fallback check for CacheService / ScriptProperties hit counter
  if (typeof PropertiesService !== "undefined" && PropertiesService && PropertiesService.getScriptProperties) {
    try {
      const props = PropertiesService.getScriptProperties();
      const propHits = props.getProperty("gemini_cache_hits_count");
      if (propHits) {
        cacheHitCount = Math.max(cacheHitCount, parseInt(propHits, 10) || 0);
      }
    } catch (propErr) {}
  }

  return {
    success: true,
    model: defaultModel,
    rpmLimit: rpmLimit,
    rpmCurrent: rpmCurrent,
    rpmRemaining: rpmRemaining,
    rpdLimit: rpdLimit,
    rpdCurrent: rpdCurrent,
    rpdRemaining: rpdRemaining,
    totalTokensLogged: totalTokensLogged,
    totalCallsLogged: totalCallsLogged,
    cacheHitCount: cacheHitCount
  };
}
```

##### 3. BrowserMockBackend Implementation (`divyank_mission_control_google_apps_script_app.html`)
```javascript
/**
 * BrowserMockBackend.getGeminiQuotaStatus: Simulates real-time telemetry
 * for the Admin AI Content Generation Studio Quota HUD Banner (#aiGenTokenStatsBanner).
 *
 * @param {Object} payload - { adminUserId: string }
 * @return {QuotaStatusResponse}
 */
BrowserMockBackend.getGeminiQuotaStatus = function(payload) {
  const p = payload || {};
  const adminUserId = p.adminUserId ? String(p.adminUserId) : "";
  const adminCheck = (typeof this.assertAdmin === "function")
    ? this.assertAdmin(adminUserId)
    : (typeof this._assertAdmin === "function" ? this._assertAdmin(adminUserId) : { success: true });
  if (!adminCheck.success) {
    return adminCheck;
  }

  const model = p.model || "gemini-1.5-flash";

  // Read rate limit telemetry without consuming quota tokens
  const rateLimitStatus = this._checkMockRateLimits(false, model);

  // Retrieve cumulative logs and cache statistics from storage
  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let logs = [];
  try {
    const rawLogs = storage.getItem("zoptro_gemini_token_logs");
    logs = rawLogs ? JSON.parse(rawLogs) : [];
    if (!Array.isArray(logs)) logs = [];
  } catch (e) {
    logs = [];
  }

  let totalTokensLogged = 0;
  let totalCallsLogged = logs.length;
  let cacheHitCount = 0;

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    totalTokensLogged += Number(entry.totalTokens || 0);
    if (entry.isCached === true || entry.isCached === "true" || Number(entry.totalTokens) === 0) {
      cacheHitCount++;
    }
  }

  const rawHits = storage.getItem("zoptro_mock_gemini_cache_hits");
  if (rawHits) {
    cacheHitCount = Math.max(cacheHitCount, parseInt(rawHits, 10) || 0);
  }

  return {
    success: true,
    model: model,
    rpmLimit: rateLimitStatus.rpmLimit,
    rpmCurrent: rateLimitStatus.rpmCurrent,
    rpmRemaining: rateLimitStatus.rpmRemaining,
    rpdLimit: rateLimitStatus.rpdLimit,
    rpdCurrent: rateLimitStatus.rpdCurrent,
    rpdRemaining: rateLimitStatus.rpdRemaining,
    totalTokensLogged: totalTokensLogged,
    totalCallsLogged: totalCallsLogged,
    cacheHitCount: cacheHitCount
  };
};
```

##### 4. LocalStorage Telemetry & Rate Limiting Schemas

| Storage Key | Type | Description | Eviction & Lifecycle Policy |
|---|---|---|---|
| `zoptro_gemini_token_logs` | `Array<Object>` | JSON array of metered API invocation records matching Table 15 `GeminiTokenLogs` schema. | Capped at most recent 1,000 entries; oldest pruned automatically. |
| `zoptro_gemini_cache` | `Record<string, Object>` | Key-value dictionary of SHA-256 fingerprints mapping to cached question sets and token metadata. | 6-hour TTL (`21,600,000ms`); LRU pruned when dictionary exceeds 200 items. |
| `zoptro_mock_gemini_rpm_timestamps_<model>` | `Array<number>` | Array of epoch millisecond timestamps within the active 60-second window for the model. | Filtered automatically; timestamps older than 60s discarded on every check. |
| `zoptro_mock_gemini_rpd_counter_<model>` | `Object` (`{ date, count }`) | Tracks daily request count against UTC date (`"YYYY-MM-DD"`). | Resets automatically to 0 when `date !== todayUtc`. |
| `zoptro_mock_gemini_cache_hits` | `string` (`number`) | Monotonically increasing counter recording cumulative cache hits. | Persists across sessions; incremented on every `_getCacheItem` hit. |

###### LocalStorage Schema 1: `zoptro_gemini_token_logs` Record Structure
```json
{
  "id": "tok_1731002345123_4821",
  "timestamp": "2026-11-07T18:45:00.123Z",
  "adminUserId": "u_adm_demo",
  "model": "gemini-1.5-flash",
  "promptTokens": 412,
  "candidateTokens": 685,
  "totalTokens": 1097,
  "estimatedCostUsd": 0.0000,
  "itemCount": 5,
  "isCached": false,
  "gradeClass": "Class 6",
  "subject": "Mathematics",
  "chapter": "Fractions and Decimals",
  "topic": "Equivalent Fractions",
  "questionType": "MCQ",
  "difficulty": "Medium"
}
```

###### LocalStorage Schema 2: `zoptro_gemini_cache` Entry Structure
```json
{
  "a3f12c9b4e87d10e58...": {
    "fingerprint": "a3f12c9b4e87d10e58...",
    "timestamp": 1731002345123,
    "ttlMs": 21600000,
    "model": "gemini-1.5-flash",
    "items": [
      {
        "id": "cur_mock_1731002345123_1",
        "grade": "Class 6",
        "subject": "Mathematics",
        "chapter": "Fractions and Decimals",
        "topic": "Equivalent Fractions",
        "title": "Mathematics Class 6: Equivalent Fractions (Q1)",
        "questionText": "Which statement correctly describes Equivalent Fractions in Class 6 Mathematics?",
        "options": [
          "Fractions that represent the same value even though they have different numerators and denominators.",
          "Fractions that always have 0 as the denominator.",
          "Fractions whose numerators are strictly prime numbers.",
          "Fractions that cannot be simplified under any circumstance."
        ],
        "optionsJson": "[\"Fractions that represent the same value...\",...]",
        "correctOptionIndex": 0,
        "hint": "Recall the definition from NCERT Class 6 Mathematics Chapter 2.",
        "explanation": "Option A is correct because equivalent fractions represent identical proportions.",
        "bloomLevel": "Applying",
        "difficulty": "Medium",
        "examCategory": "CBSE"
      }
    ],
    "promptTokens": 412,
    "candidateTokens": 685,
    "totalTokens": 1097
  }
}
```

---

### 1.5 Structured Output Enforcement & Defensive Candidate Sanitization

#### 1.5.1 Google AI Studio Structured Outputs API
Gemini 1.5 and 2.0 Flash support native structured outputs via two properties within `generationConfig`:
- `responseMimeType: "application/json"`: Constrains model token sampling strictly to valid JSON tokens.
- `responseSchema`: An OpenAPI 3.0-compliant schema defining exact properties, data types, and required fields.

```json
{
  "generationConfig": {
    "temperature": 0.2,
    "topP": 0.95,
    "topK": 40,
    "maxOutputTokens": 8192,
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "ARRAY",
      "description": "List of curriculum assessment questions matching CBSE standards.",
      "items": {
        "type": "OBJECT",
        "properties": {
          "title": { "type": "STRING", "description": "Descriptive topic-aligned heading." },
          "questionText": { "type": "STRING", "description": "Clear question prompt." },
          "options": {
            "type": "ARRAY",
            "description": "Exactly 4 distinct, mutually exclusive answer choices.",
            "items": { "type": "STRING" }
          },
          "correctOptionIndex": { "type": "INTEGER", "description": "0-based index of correct option (0, 1, 2, or 3)." },
          "hint": { "type": "STRING", "description": "Pedagogical clue that assists recall without revealing the answer." },
          "explanation": { "type": "STRING", "description": "Comprehensive explanation of correct solution and distractor analysis." },
          "bloomLevel": { "type": "STRING", "description": "Remembering, Understanding, Applying, Analyzing, Evaluating, or Creating." },
          "difficulty": { "type": "STRING", "description": "Easy, Medium, or Hard." }
        },
        "required": ["title", "questionText", "options", "correctOptionIndex", "hint", "explanation"]
      }
    }
  }
}
```

#### 1.5.2 Defensive Parsing, Fence Stripping, and Sanitization Pipeline
Even with structured outputs enabled, defensive handling is mandatory:
1. **Decode & Extract Candidate**: Parse HTTP body and extract `candidates[0].content.parts[0].text`.
2. **Finish Reason Check**: Verify `finishReason === "STOP"`. Flag `SAFETY` or `MAX_TOKENS` blocks.
3. **Markdown Fence Stripping**: Strip leading ````json` and trailing ```` ` or BOM tokens.
4. **Structural Normalization**: If the model wrapped the array in `{ "items": [...] }` or `{ "questions": [...] }`, extract the inner array.
5. **Field Normalization**: Enforce exactly 4 options for MCQs (pad or slice if necessary); clamp `correctOptionIndex` to integer `[0..3]`.
6. **Formula Injection Neutralization (CWE-1236)**: Every string field is sanitized via `sanitizeSheetCellValue(val)` before spreadsheet persistence, prefixing dangerous leading characters (`=`, `+`, `-`, `@`) with a single quote (`'`).

```javascript
function stripMarkdownFences(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "");
  clean = clean.replace(/\s*```\s*$/, "");
  clean = clean.replace(/^\uFEFF/, "");
  return clean.trim();
}
```

---

### 1.6 Multi-Tier Token Quota & Budgeting System (15 RPM, 1M TPM, 1,500 RPD)

#### 1.6.1 Free Tier Quota Calibration
| Metric | Gemini 1.5 Flash | Gemini 2.0 Flash | Protection Target |
| :--- | :--- | :--- | :--- |
| **Requests Per Minute (RPM)** | 15 RPM | 15 RPM | Hard cap at 15 RPM (Sliding 60s Window) |
| **Tokens Per Minute (TPM)** | 1,000,000 TPM | 4,000,000 TPM | ~5,000 tokens/request $\ll$ 1M TPM limit |
| **Requests Per Day (RPD)** | 1,500 RPD | 1,500 RPD | Daily reset at UTC 00:00:00, cap at 1,500 |
| **Context Window** | 1,048,576 tokens | 1,048,576 tokens | Standard generation payload $\approx$ 1,200 tokens |
| **Monetary Cost** | $0.00 / Free | $0.00 / Free | Permanently $0.00 |

#### 1.6.2 Usage Metadata Extraction & Metering
Every Gemini response returns a top-level `usageMetadata` object containing exact token counts:
```javascript
function extractTokenUsage(responseObj) {
  const usage = responseObj && responseObj.usageMetadata ? responseObj.usageMetadata : {};
  const promptTokens = Number(usage.promptTokenCount) || 0;
  const candidateTokens = Number(usage.candidatesTokenCount) || 0;
  const totalTokens = Number(usage.totalTokenCount) || (promptTokens + candidateTokens);

  return {
    promptTokens: promptTokens,
    candidateTokens: candidateTokens,
    totalTokens: totalTokens,
    estimatedCostUsd: 0.0000 // Free Tier
  };
}
```

#### 1.6.3 Persistent Logging in `GeminiTokenLogs` Relational Schema
All generation events are permanently logged in the spreadsheet tab `GeminiTokenLogs` (and simulated in `localStorage` under `zoptro_mock_gemini_token_logs`):
```javascript
SCHEMAS.GeminiTokenLogs = [
  "id",               // Unique log ID: "tok_" + Date.now() + "_" + index
  "timestamp",        // ISO 8601 UTC timestamp
  "adminUserId",      // Administrator ID
  "model",            // "gemini-1.5-flash" or "gemini-2.0-flash"
  "grade",            // e.g. "Class 6"
  "subject",          // e.g. "Mathematics"
  "chapter",          // e.g. "Fractions"
  "topic",            // e.g. "Equivalent Fractions"
  "quantity",         // Number of questions requested
  "promptTokens",     // Prompt token count
  "candidateTokens",  // Generated token count
  "totalTokens",      // Total tokens consumed
  "cached",           // Boolean (true if served from deduplication cache)
  "durationMs",       // API response time in milliseconds
  "status"            // "SUCCESS", "RATE_LIMITED", "ERROR"
];
```

#### 1.6.4 True Sliding-Window Rate Limiting Engine & Concurrency Locking (15 RPM & 1,500 RPD)

##### 1.6.4.1 Flaw Analysis: Fixed Tumbling Windows vs True Sliding Windows
A naive minute-bucketing rate limiter (`Math.floor(now / 60000)`) partitions time into discrete 60-second calendar intervals. Under this tumbling-window model, an administrator issuing 15 requests at second 59 of Minute $N$ and another 15 requests at second 01 of Minute $N+1$ causes all 30 requests to succeed, because the counter resets to zero at the minute boundary. This permits a 30-request burst within a 2-second span, immediately violating Google AI Studio's 15 RPM rate limit and triggering production `HTTP 429 Too Many Requests (RESOURCE_EXHAUSTED)` rejections.

To strictly enforce $\le 15$ requests in *any* arbitrary 60-second rolling window across minute boundaries, the rate limiter implements a **True Sliding-Timestamp Array Algorithm**. Rather than incrementing a single integer counter, the system maintains a rolling array of epoch millisecond timestamps representing each successful dispatch. Whenever a new request arrives:
1. Timestamps older than $T_{\text{now}} - 60{,}000\text{ms}$ are evicted.
2. The remaining active timestamps are counted.
3. If the count reaches 15, the request is throttled, and the exact wait time until the oldest timestamp expires is calculated and returned via `retryAfterSeconds = Math.max(1, Math.ceil((oldestTs + 60000 - now) / 1000))`.
4. If the count is below 15, the current timestamp $T_{\text{now}}$ is recorded, the array is saved back to `CacheService`, and the request proceeds.

##### 1.6.4.2 Concurrency Safety via `LockService.getScriptLock()`
In Google Apps Script, `CacheService` operations (`get` and `put`) are non-atomic. When concurrent generation requests occur (e.g., multi-tab administrator actions or parallel student assignments), simultaneous invocations can interleave read-modify-write sequences, leading to lost updates and quota overruns.

To guarantee thread safety, the rate limiter wraps all `CacheService` reads, timestamp pruning, quota evaluations, and cache writes inside an exclusive script lock acquired via `LockService.getScriptLock().tryLock(3000)`. If lock acquisition times out due to intense contention, the request is safely rejected with `retryAfterSeconds: 2`, preventing race conditions and ensuring that rate-limit state is strictly linearizable.

##### 1.6.4.3 Production Google Apps Script Implementation (`checkAndIncrementRateLimit`)
```javascript
/**
 * Sliding-Window Rate Limiter & Daily Quota Guard with Concurrency Locking.
 * Strictly enforces <= 15 RPM across any rolling 60-second window and <= 1,500 RPD.
 *
 * @param {string} [model="gemini-1.5-flash"] - Model identifier for quota isolation.
 * @returns {{
 *   allowed: boolean,
 *   error?: string,
 *   retryAfterSeconds?: number,
 *   rpmRemaining: number,
 *   dailyRemaining: number
 * }} Rate limiting decision object.
 */
function checkAndIncrementRateLimit(model) {
  const selectedModel = model ? String(model) : "gemini-1.5-flash";
  const modelSafeKey = selectedModel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const lock = LockService.getScriptLock();
  
  // 1. Acquire Script Lock to guarantee atomic read-modify-write across concurrent executions
  const acquired = lock.tryLock(3000);
  if (!acquired) {
    return {
      allowed: false,
      error: "RATE_LIMIT_LOCK_TIMEOUT: High concurrency detected on rate limiter. Please retry momentarily.",
      retryAfterSeconds: 2,
      rpmRemaining: 0,
      dailyRemaining: 0
    };
  }

  try {
    const cache = CacheService.getScriptCache();
    const now = Date.now();
    const todayUtc = new Date(now).toISOString().substring(0, 10);
    const rpdKey = "gemini_rpd_" + modelSafeKey + "_" + todayUtc;
    const timestampsKey = "gemini_rpm_timestamps_" + modelSafeKey;

    const rpdLimit = 1500;
    const rpmLimit = 15;

    // 2. Daily Quota Check (1,500 RPD reset at UTC 00:00:00)
    const dailyRaw = cache.get(rpdKey);
    const dailyCount = dailyRaw ? parseInt(dailyRaw, 10) : 0;
    if (dailyCount >= rpdLimit) {
      const secondsUntilUtcMidnight = 86400 - (Math.floor(now / 1000) % 86400);
      return {
        allowed: false,
        error: "DAILY_QUOTA_EXCEEDED: Free tier limit of 1,500 requests per day reached for " + selectedModel + ". Resets at UTC 00:00:00.",
        retryAfterSeconds: Math.max(1, secondsUntilUtcMidnight),
        rpmRemaining: 0,
        dailyRemaining: 0
      };
    }

    // 3. Sliding 60-Second Window Check (15 RPM)
    const timestampsRaw = cache.get(timestampsKey);
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

    // Evict timestamps older than 60,000ms
    const windowStart = now - 60000;
    timestamps = timestamps.filter(function(ts) {
      return typeof ts === "number" && !isNaN(ts) && ts > windowStart;
    });

    // Ensure chronological order
    timestamps.sort(function(a, b) { return a - b; });

    // Check if sliding window threshold is reached
    if (timestamps.length >= rpmLimit) {
      const oldestTs = timestamps[0];
      const retryAfterMs = (oldestTs + 60000) - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      return {
        allowed: false,
        error: "RATE_LIMIT_EXCEEDED: Free tier limit of 15 requests per minute reached for " + selectedModel + ". Please throttle requests.",
        retryAfterSeconds: retryAfterSeconds,
        rpmRemaining: 0,
        dailyRemaining: Math.max(0, rpdLimit - dailyCount)
      };
    }

    // 4. Record new dispatch timestamp & atomically increment counters
    timestamps.push(now);
    cache.put(timestampsKey, JSON.stringify(timestamps), 120); // 120s TTL (exceeds 60s sliding window)
    cache.put(rpdKey, String(dailyCount + 1), 86400);          // 24h TTL

    return {
      allowed: true,
      rpmRemaining: rpmLimit - timestamps.length,
      dailyRemaining: rpdLimit - (dailyCount + 1)
    };
  } finally {
    // Always release lock in finally block to prevent deadlocks
    lock.releaseLock();
  }
}
```

##### 1.6.4.4 BrowserMockBackend Parity Implementation (`_checkMockRateLimits`)
To maintain 100% offline simulation parity, `BrowserMockBackend` mirrors this sliding timestamp array in `localStorage`:
```javascript
BrowserMockBackend._checkMockRateLimits = function(consume, model) {
  let shouldConsume = false;
  let selectedModel = "gemini-1.5-flash";

  if (typeof consume === "boolean") {
    shouldConsume = consume;
    if (typeof model === "string") selectedModel = model;
  } else if (typeof consume === "string") {
    selectedModel = consume;
    if (typeof model === "boolean") shouldConsume = model;
  }

  const modelSafeKey = selectedModel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const now = Date.now();
  const windowStart = now - 60000;
  const rpmLimit = 15;
  const rpdLimit = 1500;

  const timestampsKey = "zoptro_mock_gemini_rpm_timestamps_" + modelSafeKey;
  const rpdKey = "zoptro_mock_gemini_rpd_counter_" + modelSafeKey;

  const storage = (typeof _zoptroStorage !== "undefined" && _zoptroStorage) ? _zoptroStorage : {
    getItem: function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let rpmTimestamps = [];
  try {
    const rawRpm = storage.getItem(timestampsKey) || storage.getItem("zoptro_mock_gemini_rpm_timestamps");
    rpmTimestamps = rawRpm ? JSON.parse(rawRpm) : [];
    if (!Array.isArray(rpmTimestamps)) rpmTimestamps = [];
  } catch (e) {
    rpmTimestamps = [];
  }
  rpmTimestamps = rpmTimestamps.filter(function(ts) { return typeof ts === "number" && !isNaN(ts) && ts > windowStart; });
  rpmTimestamps.sort(function(a, b) { return a - b; });

  const todayUtc = new Date(now).toISOString().substring(0, 10);
  let rpdData = { date: todayUtc, count: 0 };
  try {
    const rawRpd = storage.getItem(rpdKey) || storage.getItem("zoptro_mock_gemini_rpd_counter");
    if (rawRpd) {
      const parsed = JSON.parse(rawRpd);
      if (parsed && parsed.date === todayUtc) {
        rpdData = parsed;
      }
    }
  } catch (e) {
    rpdData = { date: todayUtc, count: 0 };
  }

  if (rpdData.count >= rpdLimit) {
    const secondsUntilMidnightUtc = Math.max(1, 86400 - (Math.floor(now / 1000) % 86400));
    return {
      allowed: false,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmTimestamps.length,
      rpmRemaining: 0,
      rpdLimit: rpdLimit,
      rpdCurrent: rpdData.count,
      rpdRemaining: 0,
      retryAfterSeconds: secondsUntilMidnightUtc,
      error: "DAILY_QUOTA_EXCEEDED: Free tier limit of 1,500 requests per day reached for " + selectedModel + ". Resets at UTC 00:00:00."
    };
  }

  if (rpmTimestamps.length >= rpmLimit) {
    const oldestTs = rpmTimestamps[0];
    const retryAfterMs = (oldestTs + 60000) - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      allowed: false,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmTimestamps.length,
      rpmRemaining: 0,
      rpdLimit: rpdLimit,
      rpdCurrent: rpdData.count,
      rpdRemaining: Math.max(0, rpdLimit - rpdData.count),
      retryAfterSeconds: retryAfterSeconds,
      error: "RATE_LIMIT_EXCEEDED: Free tier limit (15 RPM) reached for " + selectedModel + ". Please throttle requests."
    };
  }

  if (shouldConsume) {
    rpmTimestamps.push(now);
    storage.setItem(timestampsKey, JSON.stringify(rpmTimestamps));
    storage.setItem("zoptro_mock_gemini_rpm_timestamps", JSON.stringify(rpmTimestamps));

    rpdData.count = (Number(rpdData.count) || 0) + 1;
    rpdData.date = todayUtc;
    storage.setItem(rpdKey, JSON.stringify(rpdData));
    storage.setItem("zoptro_mock_gemini_rpd_counter", JSON.stringify(rpdData));

    return {
      allowed: true,
      rpmLimit: rpmLimit,
      rpmCurrent: rpmTimestamps.length,
      rpmRemaining: Math.max(0, rpmLimit - rpmTimestamps.length),
      rpdLimit: rpdLimit,
      rpdCurrent: rpdData.count,
      rpdRemaining: Math.max(0, rpdLimit - rpdData.count),
      retryAfterSeconds: 0
    };
  }

  return {
    allowed: true,
    rpmLimit: rpmLimit,
    rpmCurrent: rpmTimestamps.length,
    rpmRemaining: Math.max(0, rpmLimit - rpmTimestamps.length),
    rpdLimit: rpdLimit,
    rpdCurrent: Number(rpdData.count) || 0,
    rpdRemaining: Math.max(0, rpdLimit - (Number(rpdData.count) || 0)),
    retryAfterSeconds: 0
  };
};
```

---

### 1.7 Deterministic SHA-256 Deduplication Caching (0 Token Burn)
To prevent redundant API invocations and token burn, identical requests are cached using a unified canonical 10-tuple fingerprint:
$$\text{fingerprint} = \text{sha256}([\text{"gemini"}, \text{model}, \text{grade}, \text{subject}, \text{chapter}, \text{topic}, \text{questionType}, \text{quantity}, \text{difficulty}, \text{bloomLevel}].\text{join}(\text{"::"}))$$

#### 1.7.1 Canonical Fingerprint Normalization Specification
The pre-hash string is formed by joining exactly 10 normalized parameters with the double-colon delimiter `"::"`:

| Index | Component | Field in Payload | Fallback / Normalization | Rationale & Isolation Guarantee |
| :---: | :--- | :--- | :--- | :--- |
| **0** | `namespace` | Constant | `"gemini"` | Platform namespace isolation; prevents collision with user or system cache keys |
| **1** | `model` | `payload.model` | `"gemini-1.5-flash"` | Isolates model variants (`gemini-1.5-flash` vs `gemini-2.0-flash`) |
| **2** | `grade` | `payload.gradeClass \|\| payload.grade` | `"Class 3"` | Isolates grades (e.g. Class 3 vs Class 10) |
| **3** | `subject` | `payload.subject` | `"General Science"` | Isolates subjects (e.g. Mathematics vs Science) |
| **4** | `chapter` | `payload.chapter` | `"General"` | Isolates curriculum chapters |
| **5** | `topic` | `payload.topic` | `"Core Concepts"` | Isolates specific curriculum subtopics |
| **6** | `questionType`| `payload.questionType` | `"MCQ"` | Isolates assessment modalities (`MCQ`, `SHORT_ANSWER`, `TRUE_FALSE`, `NUMERICAL`) |
| **7** | `quantity` | `payload.quantity` | `String(clamp(qty, 1, 20))` | Clamps integer to `1..20`; prevents cache reuse when batch size differs |
| **8** | `difficulty` | `payload.difficulty` | `"Medium"` | Isolates challenge tiers (`Easy`, `Medium`, `Hard`) |
| **9** | `bloomLevel` | `payload.bloomLevel` | `"Applying"` | Isolates cognitive depths (`Remembering`, `Understanding`, `Applying`, `Analyzing`, `Evaluating`, `Creating`) |

#### 1.7.2 Delimiter Security & Collision Elimination
- **Double-Colon Delimiter (`::`)**: Using `"::"` prevents delimiter injection or parsing ambiguity when topic or chapter strings contain single colons (e.g., `"Ratio: Direct Proportion"` or `"Chapter 5: Water"`).
- **Cognitive & Challenge Tier Isolation**: Incorporating `bloomLevel` and `difficulty` guarantees **zero semantic cache collisions**. An administrator requesting a factual recall quiz (`Remembering` / `Easy`) will never collide with an evaluative challenge quiz (`Evaluating` / `Hard`) on the exact same topic.
- **Dual-Mode Parity**: Both `google_apps_script_backend.js` and `BrowserMockBackend` in `divyank_mission_control_google_apps_script_app.html` execute the exact same canonical normalization logic, generating byte-for-byte identical 64-character hexadecimal SHA-256 digests.

#### 1.7.3 Storage Key Structure & Lifecycle Properties
Implemented using the RFC 6234-compliant pure JS `sha256()` function in `google_apps_script_backend.js` (lines 148–180):
- **Cache Storage Key**: `"gemini_cache_" + fingerprint` in GAS `CacheService`; `"zoptro_cache_" + fingerprint` in Browser `localStorage`. Total key length is 77 characters, safely within the 250-character limit of GAS `CacheService`.
- **Cache TTL**: 21,600 seconds (6 hours) in `ScriptCache`.
- **Cache Hit Outcome**: Returns cached questions instantly (<15ms), flags `cached: true`, records `promptTokens: 0`, `candidateTokens: 0`, `totalTokens: 0`.
- **Token Burn**: **0 tokens**.
- **Force Refresh Switch**: Administrators can check "Force Fresh Generation" (`forceRefresh: true`), bypassing the cache when new variations are explicitly desired.

```javascript
function computeGeminiCacheFingerprint(payload) {
  const p = payload || {};
  const model = p.model || "gemini-1.5-flash";
  const grade = p.gradeClass || p.grade || "Class 3";
  const subject = p.subject || "General Science";
  const chapter = p.chapter || "General";
  const topic = p.topic || "Core Concepts";
  const questionType = p.questionType || "MCQ";
  const quantity = String(Math.min(Math.max(Number(p.quantity) || 5, 1), 20));
  const difficulty = p.difficulty || "Medium";
  const bloomLevel = p.bloomLevel || "Applying";

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
```

---

### 1.8 Direct Storage Ingestion Bridge into Table 11 `CurriculumQuizzes`
The output of the generation pipeline bridges directly into the existing `bulkUploadContentBatch` endpoint:

```javascript
function transformGeneratedItemsForBulkUpload(adminUserId, generationResult, params) {
  const items = generationResult.items.map(function(item, idx) {
    return {
      id: "curr_" + Date.now() + "_" + (idx + 1),
      grade: params.gradeClass || "Class 3",
      subject: params.subject || "General Science",
      examCategory: "CBSE",
      title: item.title || (params.chapter + " - " + params.topic),
      questionText: item.questionText,
      options: item.options,
      optionsJson: JSON.stringify(item.options),
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
```

---

## 3. Section 2: Zero-Cost CBSE / NCERT (Class 1 to 10) Syllabus Sourcing Plan & Curriculum Taxonomy

### 2.1 Authoritative Public Repositories & Statutory Clearance

#### 2.1.1 Authoritative Public Source Inventory
| Repository | Primary Access Method | Data Obtained | Cost / Auth |
| :--- | :--- | :--- | :--- |
| **NCERT Open Textbooks** | `https://ncert.nic.in/textbook.php` | Complete Tables of Contents, rationalized chapter titles, official textbook codenames (*Joyful Mathematics*, *Ganita Prakash*, *Curiosity*, etc.) | ₹0.00 / Public Domain |
| **ePathshala Portal & API** | `https://epathshala.nic.in` | Structured chapter indices, learning outcomes, bilingual English/Hindi title mappings | ₹0.00 / Public MoE Portal |
| **DIKSHA Framework API** | `GET https://diksha.gov.in/api/framework/v1/read/ncert_k-12` | Machine-readable JSON tree: Boards, Mediums, GradeLevels (Class 1-10), Subjects, and hierarchical Topic nodes | ₹0.00 / Sunbird Open DPI API |
| **NDEAR Specifications** | `https://ndear.gov.in` | Competency-based education (CBE) schema definitions, micro-skill ontologies, and learning outcome identifiers | ₹0.00 / Open Architectural Standard |
| **Open Government Data (OGD)** | `https://data.gov.in` | Master school subject registers and Ministry of Education curriculum census datasets | ₹0.00 / Open Government License India |

#### 2.1.2 Statutory Legal Clearance
Under **Section 52(1)(q)(iv) of the Indian Copyright Act, 1957**, reproduction or publication of any matter published in any official gazette or report/curriculum of a government-appointed committee, board, or educational authority does not constitute copyright infringement. National curriculum frameworks and syllabi published by NCERT and CBSE are statutory guidelines placed in the public domain for universal educational use.

---

### 2.2 Extraction Methods & Permanent Expense-Free Long-Term Strategy

#### 2.2.1 The Anti-Pattern of Runtime Scraping
Attempting to fetch data in real time from government servers during user interactions introduces severe failure points:
- Government servers experience heavy latency (1,000–8,000ms) or downtime during exam results seasons.
- Google Apps Script limits consumer accounts to 20,000 `UrlFetchApp` calls/day.
- Direct browser `fetch()` calls to `diksha.gov.in` are blocked by CORS policies.

#### 2.2.2 Static Pre-Compilation Architecture
Zoptro adopts a **Static Manifest Extraction & Bundling Strategy**:
1. **One-Time Pre-Compilation**: A Node.js extraction script (`scripts/extract_cbse_taxonomy.js`) queries the DIKSHA framework endpoint (`https://diksha.gov.in/api/framework/v1/read/ncert_k-12`), merges chapter metadata from NCERT official syllabi, and validates structural integrity.
2. **Immutable Manifest Artifact**: Stored as `cbse_ncert_taxonomy_manifest.json` (~140 KB), featuring a cryptographic SHA-256 integrity hash.
3. **Application Bundling**:
   - In `divyank_mission_control_google_apps_script_app.html`, bundled as `window.ZOPTRO_CURRICULUM_TAXONOMY`.
   - In `google_apps_script_backend.js`, embedded as `CURRICULUM_TAXONOMY` to validate incoming requests.
   - In `BrowserMockBackend`, directly populates dropdowns and offline simulators.
4. **Zero Runtime Maintenance**: NCERT curriculum revisions occur once every 3 to 5 years (under NCF cycles). When updates occur, running `npm run sync:taxonomy` refreshes the manifest.

#### 2.2.3 TypeScript Manifest Schema
```typescript
interface CurriculumTaxonomyManifest {
  schemaVersion: "2.0.0";
  lastSynchronized: string; // ISO 8601 UTC
  integrityHash: string;    // SHA-256
  framework: "NCF-SE-2023 / NCF-FS-2022";
  board: "CBSE / NCERT";
  stages: {
    Foundational: { name: "Foundational Stage"; grades: ["Class 1", "Class 2"]; focus: "Play-based numeracy & literacy" };
    Preparatory:  { name: "Preparatory Stage";  grades: ["Class 3", "Class 4", "Class 5"]; focus: "Foundational disciplines & activity learning" };
    Middle:       { name: "Middle Stage";       grades: ["Class 6", "Class 7", "Class 8"]; focus: "Subject-specific concepts & experimentation" };
    Secondary:    { name: "Secondary Stage";    grades: ["Class 9", "Class 10"]; focus: "Rigorous analytical depth & board examination prep" };
  };
  grades: {
    [gradeKey: string]: {
      stage: "Foundational" | "Preparatory" | "Middle" | "Secondary";
      subjects: {
        [subjectKey: string]: {
          textbookTitle: string;
          textbookCode?: string;
          chapters: Array<{
            chapterNumber: number;
            title: string;
            topics: Array<{
              id: string;
              name: string;
              defaultBloomLevel: "Remembering" | "Understanding" | "Applying" | "Analyzing" | "Evaluating" | "Creating";
              defaultDifficulty: "Easy" | "Medium" | "Hard";
            }>;
          }>;
        };
      };
    };
  };
}
```

---

### 2.3 Exhaustive Hierarchical Curriculum Taxonomy (Classes 1 to 10)

The curriculum is structured across the four developmental stages defined by NEP 2020:

```
┌────────────────────────────────────────────────────────────────────────┐
│                    NEP 2020 5+3+3+4 CURRICULUM STAGES                  │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Stage             │ Classes           │ Primary Pedagogical Focus      │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Foundational      │ Class 1 & 2       │ Play-based numeracy, phonics   │
│ Preparatory       │ Class 3, 4, 5     │ Discovery, foundational skills │
│ Middle            │ Class 6, 7, 8     │ Conceptual abstract reasoning  │
│ Secondary         │ Class 9 & 10      │ Board exam rigor, HOTS, proofs │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

#### 2.3.1 Stage 1: Foundational Stage (Classes 1 & 2)

##### CLASS 1
*Pedagogical Objective*: Sensory discovery, spatial orientation, cardinal numbers up to 99, phonemic awareness, and environmental observation.
1. **Mathematics (*Joyful Mathematics*)**:
   - **Ch 1: Finding Furry Friends**: Spatial Relationships; Pre-Number Concepts; Inside vs. Outside; Top vs. Bottom; On vs. Under; Near vs. Far.
   - **Ch 2: What is Long? What is Round?**: 2D and 3D Shapes Identification; Rolling and Sliding Objects; Tracing Everyday Objects.
   - **Ch 3: Mango Treat**: Numbers 1 to 9; One-to-One Correspondence; Counting and Cardinality; More vs. Less.
   - **Ch 4: Making Ten**: Concept of Zero; Making 10; Ten-Frames; Decomposing Numbers into Pairs.
   - **Ch 5: How Many?**: Addition of Single Digits (Sum $\le 9$); Subtraction as Taking Away; Picture Story Problems.
   - **Ch 6: Vegetable Farm**: Non-Standard Units of Length (Handspan, Fingers); Comparing Weights (Heavier vs. Lighter).
   - **Ch 7: Lina's Family**: Data Handling; Sorting Objects by Attribute; Tallying and Grouping.
   - **Ch 8: Fun with Numbers**: Numbers 10 to 99; Grouping in Tens and Ones; Number Line Sequences; Comparing 2-Digit Numbers.
   - **Ch 9: Utsav**: Patterns in Shapes; Repeating Patterns in Daily Life; Colour and Movement Sequences.
   - **Ch 10: How do I Spend My Day?**: Sequence of Events; Morning, Afternoon, Evening, Night; Days of the Week.
   - **Ch 11: How Many Times?**: Skip Counting by 2s and 5s; Repeated Addition Readiness.
   - **Ch 12: How Much Can We Spend?**: Indian Currency Coins (₹1, ₹2, ₹5, ₹10); Currency Notes (₹10, ₹20); Simple Cash Transactions.
2. **English (*Mridang*)**:
   - **Unit 1: My Family and Me**: Self-Identity; Family Members; Greetings; Phonic Sounds /a/, /b/, /c/.
   - **Unit 2: Life Around Us**: Nature and Plants; Colors; Simple Describing Words; Sight Words.
   - **Unit 3: Food and Water**: Healthy Food vs. Junk Food; Rhyme Recitation; Action Verbs.
   - **Unit 4: Seasons**: Summer, Rainy, Winter Seasons; Weather Vocabulary; Story Sequencing.
   - **Unit 5: Animals and Birds**: Animal Sounds; Habitats; Care for Living Creatures; CVC Word Blending.
3. **Hindi (*Sarangi*)**:
   - **Unit 1: Parivar**: Mera Ghar; Parivar ke Sadasya; Varna Mala Parichay (Swar aur Vyanjan).
   - **Unit 2: Rang hi Rang**: Prakriti ke Rang; Matra Parichay (Aa, I, Ee); Bal Geet.
   - **Unit 3: Hum aur Hamari Duniya**: Aas-Paas ke Pashu-Pakshi; Miljulkar Rahna; Samvad.
   - **Unit 4: Chanda Mama**: Kahanian; Bal Kavita; Chitra Dekhkar Kahani Banana.

##### CLASS 2
*Pedagogical Objective*: Two-digit arithmetic operations, standard measurement readiness, geometric attributes, reading fluency, and environmental appreciation.
1. **Mathematics (*Joyful Mathematics*)**:
   - **Ch 1: A Day at the Beach**: 2D and 3D Shapes; Spatial Awareness; Symmetry in Nature.
   - **Ch 2: Shapes Around Us**: Edges and Corners; Flat vs. Curved Surfaces; Tangrams and Tiling.
   - **Ch 3: Fun with Numbers**: Numbers up to 100; Place Value (Tens and Ones); Expanded Form; Ascending & Descending Order.
   - **Ch 4: Shadow Story**: Length and Height; Shadows and Light Direction; Comparing Heights with Handspans and Paces.
   - **Ch 5: Playing with Lines**: Standing Lines, Sleeping Lines, Slanting Lines; Curved Lines; Drawing Geometric Figures.
   - **Ch 6: Decoration for Festival**: Addition with Regrouping (Carry-over); Subtraction with Borrowing; Word Problems.
   - **Ch 7: Rani's Gift**: Weight and Capacity; Heavy vs. Light; Estimating Liquid Volumes using Cups and Bowls.
   - **Ch 8: Grouping and Sharing**: Equal Grouping; Equal Sharing; Division Readiness; Word Scenarios.
   - **Ch 9: Which Season is It?**: Reading the Calendar; Months of the Year; Indian Seasons; Time on the Clock (Hours).
   - **Ch 10: Fun at the Fair**: Money Combinations; Making ₹50 and ₹100 using smaller denominations; Shopping Calculations.
   - **Ch 11: Data Handling**: Pictographs; Reading Frequency Charts; Organizing Class Survey Data.
2. **English (*Mridang*)**:
   - **Unit 1: Fun with Friends**: Friendship; Sharing; Common Nouns; Short Vowel Phonics.
   - **Unit 2: Welcome to My World**: Home and School Life; Polite Expressions; Simple Present Tense.
   - **Unit 3: Going Places**: Means of Transport; Road Safety; Prepositions (in, on, under, behind).
   - **Unit 4: Life Around Us**: Trees, Insects, and Weather; Animal Homes; Plural Nouns (-s, -es).
   - **Unit 5: Harmony**: Working Together; Cultural Festivals; Moral Understanding.
3. **Hindi (*Sarangi*)**:
   - **Unit 1: Parivar aur Pados**: Hamara Pados; Samyukt Parivar; Varna Sanyog.
   - **Unit 2: Tyohar aur Utsav**: Desh ke Pramukh Tyohar; Lok Sanskriti; Matra Abhyas.
   - **Unit 3: Prakriti ki God Mein**: Ritu Parivartan; Ped-Paudhe; Vriksharopan ka Mahatva.
   - **Unit 4: Khel Kud**: Paramparik Khel; Swasthya aur Poshan; Kahani Lekhan.

---

#### 2.3.2 Stage 2: Preparatory Stage (Classes 3 to 5)

##### CLASS 3
*Pedagogical Objective*: Formal 3-digit operations, introduction to fractions, environmental systems, biological interdependence, and linguistic structure.
1. **Mathematics (*Maths Mela* / *Math-Magic*)**:
   - **Ch 1: What's in a Name?**: 3-Digit Numbers (100 to 999); Place Value and Face Value; Number Names.
   - **Ch 2: Toy Joy**: 3-Digit Addition and Subtraction with Regrouping; Mental Math Strategies.
   - **Ch 3: Double Century**: Estimation of Sums and Differences; Skip Counting on the Number Line.
   - **Ch 4: Vacation with Nani Ma**: 2D Geometric Shapes; Vertex and Side Properties; Tangram Puzzles.
   - **Ch 5: Fun with Shapes**: Tessellations and Tiling Patterns; Mirror Symmetry; Paper Folding Shapes.
   - **Ch 6: House of Hundreds**: Place Value Breakdown; Building Numbers; Decomposing Hundreds.
   - **Ch 7: Raksha Bandhan**: Metric Measurement of Length: Centimetres (cm) and Metres (m); Ruler Reading.
   - **Ch 8: Fair Share**: Introduction to Fractions; Equal Parts of a Whole; Concept of Half ($1/2$) and Quarter ($1/4$).
   - **Ch 9: House of Multiplication**: Multiplication as Repeated Addition; Arrays; Times Tables 2 to 10.
   - **Ch 10: Fun with Patterns**: Growing and Shrinking Patterns; Number Sequences; Odd and Even Numbers.
   - **Ch 11: Clean Up Day**: Data Representation; Tally Marks; Simple Bar Charts.
2. **Environmental Studies / Science (*Our Wondrous World* / *Looking Around*)**:
   - **Ch 1: Family and Friends**: Relationships; Family Diversity; Differently-Abled Persons (Braille, Sign Language).
   - **Ch 2: Plants Around Us**: Types of Plants (Herbs, Shrubs, Trees, Climbers); Leaf Patterns; Medicinal Plants.
   - **Ch 3: Animal World**: Animal Habitats; Herbivores, Carnivores, Omnivores; Birds, Beaks, and Nests.
   - **Ch 4: Water: The Elixir of Life**: Sources of Water; States of Water; Clean Water & Storage; Conservation.
   - **Ch 5: Food We Eat**: Plant and Animal Food; Nutritional Basics; Cooking Methods; Regional Cuisines of India.
   - **Ch 6: Shelter and Community**: Types of Houses (Kutcha, Pucca, Stilt, Igloo, Houseboat); Sanitation; Community Helpers.
   - **Ch 7: Travel and Transport**: Modes of Transport; Evolution of the Wheel; Directions and Simple Landmark Maps.
   - **Ch 8: Things We Make and Do**: Traditional Crafts; Clay Pottery; Handloom Weaving; Tool Making.
3. **English (*Santoor* / *Marigold*)**: Nouns (Common, Proper, Collective); Verbs; Adjectives; Comprehension.
4. **Hindi (*Veena* / *Rimjhim*)**: Kakku; Shekhibaz Makkhi; Chand Wali Amma; Sangya, Sarvanam, Kriya, Vilom Shabd.

##### CLASS 4
*Pedagogical Objective*: Multi-digit operations, standard metric conversions, architectural geometry, social ecology, and cultural diversity.
1. **Mathematics (*Math-Magic*)**:
   - **Ch 1: Building with Bricks**: Brick Patterns; Floor & Arch Designs; 3D Perspective Drawings of Cuboids.
   - **Ch 2: Long and Short**: Metric Conversions (mm, cm, m, km); Height Measurement; Sports Distance Word Problems.
   - **Ch 3: A Trip to Bhopal**: Multi-step Word Problems; Time, Speed, Distance Intuition; Fuel Calculations.
   - **Ch 4: Tick-Tick-Tick**: 12-Hour vs. 24-Hour Clocks; Elapsed Time; Timelines and Expiry Dates.
   - **Ch 5: The Way The World Looks**: Top View, Front View, Side View; Spatial Mapping and Route Navigation.
   - **Ch 6: The Junk Seller**: Rate Charts; Currency Calculations; Multiplication Algorithms; Profit & Loss.
   - **Ch 7: Jugs and Mugs**: Capacity: Litres (L) and Millilitres (mL); Volume Estimation; Conservation of Liquid.
   - **Ch 8: Carts and Wheels**: Geometry of Circles: Center, Radius, Diameter; Compass Construction.
   - **Ch 9: Halves and Quarters**: Fractions of Collections and Regions; Equivalent Fractions ($1/2 = 2/4 = 4/8$).
   - **Ch 10: Play with Patterns**: Number Puzzles; Magic Squares; Floor Patterns and Rotational Tessellations.
   - **Ch 11: Tables and Shares**: Division as Equal Distribution; Long Division with Remainders; Grouping Problems.
   - **Ch 12: How Heavy? How Light?**: Weight: Kilograms (kg) and Grams (g); Balance Scales and Weights.
   - **Ch 13: Field and Fences**: Perimeter of Polygons; Measuring Boundaries of Irregular Shapes.
   - **Ch 14: Smart Charts**: Chapati Charts (Pie Charts); Frequency Tables; Interpreting Bar Graphs.
2. **Environmental Studies (*Looking Around*)**:
   - **Units 1 to 5**: Going to School (Bridges, Trolleys); Ear to Ear (Animal Ears, Skin Patterns); A Day with Nandu (Elephant Herds); The Story of Amrita (Bishnoi Community, Khejadli Trees); Anita and the Honeybees (Apiculture).
   - **Units 6 to 10**: Omana's Journey (Train Travel, Rail Maps); From the Window (Bridges, Tunnels); Reaching Grandmother's House (Ferries, Coastal Ecosystems); Changing Families (Migrations); Hu Tu Tu (Kabaddi, Sports Ethics).
   - **Units 11 to 15**: Valley of Flowers (Flora, Madhubani Art); Changing Times (Post-Partition Housing); A River's Tale (River Pollution); Basva's Farm (Agriculture Cycle); From Market to Home (Perishable vs Non-Perishable Food).
   - **Units 16 to 20**: A Busy Month (Bird Anatomy, Beaks and Claws); Nandita in Mumbai (Urbanization, Slums); Too Much Water, Too Little Water (Waterborne Diseases, ORS); Abdul in the Garden (Roots: Taproot vs Fibrous); Eating Together (Bihu Festival, Mid-Day Meal).
   - **Units 21 to 27**: Food and Fun (Gurudwara Langar); The World in My Home (Gender Equality); Pochampalli (Ikat Handloom Weaving); Home and Abroad (Abu Dhabi vs Kerala, Currency); Spicy Riddles (Spices of India); Defence Officer Wahida (Naval Service); Chuskit Goes to School (Inclusion, Wheelchair Accessibility).
3. **English (*Marigold*)** & **Hindi (*Rimjhim*)**: Sentence construction, tenses, subject-verb agreement, letter writing.

##### CLASS 5
*Pedagogical Objective*: Large numbers up to 1 crore, decimal notation, spatial geometry, scientific method, biodiversity, and resource conservation.
1. **Mathematics (*Math-Magic*)**:
   - **Ch 1: The Fish Tale**: Large Numbers (Lakhs and Crores); Commercial Calculations; Speed, Distance, Time.
   - **Ch 2: Shapes and Angles**: Acute, Right, Obtuse Angles; Angles in Clock Hands; Protractors and Degree Clocks.
   - **Ch 3: How Many Squares?**: Area and Perimeter using Grid Squares; Area of Triangles; Irregular Shapes.
   - **Ch 4: Parts and Wholes**: Fractions of Geometrical Figures; Mixed Numbers; Fraction Strips; Word Problems.
   - **Ch 5: Does it Look the Same?**: Rotational Symmetry ($1/2, 1/3, 1/4, 1/6$ turns); Mirror Lines.
   - **Ch 6: Be My Multiple, I'll be Your Factor**: Factors and Multiples; Prime and Composite Numbers; HCF and LCM.
   - **Ch 7: Can You See the Pattern?**: Number Patterns; Magic Hexagons; Palindromic Numbers; Calendar Tricks.
   - **Ch 8: Mapping Your Way**: Scale on Maps ($1\text{ cm} = 100\text{ km}$); Reading Layouts; Directions.
   - **Ch 9: Boxes and Sketches**: 2D Nets of 3D Shapes (Cube, Cylinder, Cone); Isometric Drawings; Floor Plans.
   - **Ch 10: Tenths and Hundredths**: Decimals Representation; Fractions to Decimals; Metric Decimals.
   - **Ch 11: Area and its Boundary**: Formulas for Perimeter and Area of Rectangles and Squares.
   - **Ch 12: Smart Charts**: Tally Marks; Bar Graphs; Family Trees; Interpreting Trends.
   - **Ch 13: Ways to Multiply and Divide**: Multi-digit Multiplication (Box Method, Standard); Division with Remainders.
   - **Ch 14: How Big? How Heavy?**: Volume of Cubes and Cuboids ($V = l \times b \times h$); Displacement Method.
2. **Environmental Studies (*Looking Around*)**:
   - **Units 1 to 5**: Super Senses (Animal Senses, Poaching); A Snake Charmer's Story (Kalbeliyas, Anti-Venom); From Tasting to Digesting (Digestion, Dr. Beaumont); Mangoes Round the Year (Food Preservation); Seeds and Seeds (Seed Dispersal).
   - **Units 6 to 10**: Every Drop Counts (Stepwells/Bawris, Rainwater Harvesting); Experiments with Water (Density, Dead Sea, Salt Satyagraha); A Treat for Mosquitoes (Malaria, Ronald Ross, Anemia); Up You Go! (Mountaineering, Bachendri Pal); Walls Tell Stories (Golconda Fort, Archeology).
   - **Units 11 to 15**: Sunita in Space (Weightlessness, Orbits); What if it Finishes...? (Petroleum Formation, Renewables); A Shelter so High! (Changpa Tribe, Ladakh, Pashmina Goats); When the Earth Shook! (Bhuj Earthquake 2001); Blow Hot, Blow Cold (Breathing, Stethoscope).
   - **Units 16 to 22**: Who will do this Work? (Dignity of Labour, Manual Scavenging Abolition); Across the Wall (Gender Barriers); No Place for Us? (Dams, Tribal Displacement); A Seed Tells a Farmer's Story (Traditional vs Chemical Farming); Whose Forests? (Jharkhand Forest Rights Act, Suryamani); Like Father, Like Daughter (Gregor Mendel Genetics Basics); On the Move Again (Sugarcane Migration, Debt Cycles).

---

#### 2.3.3 Stage 3: Middle Stage (Classes 6 to 8)

##### CLASS 6
*Pedagogical Objective*: Transition to rigorous discipline-specific inquiry; integers, rational arithmetic, scientific experimentation, human pre-history, and local governance.
1. **Mathematics (*Ganita Prakash* / NCERT Standard)**:
   - **Ch 1: Patterns in Mathematics**: Numerical Sequences; Visual Patterns; Inductive Reasoning.
   - **Ch 2: Lines and Angles**: Points, Lines, Rays, Segments; Parallel Lines; Acute, Right, Obtuse, Straight, Reflex Angles.
   - **Ch 3: Number Play**: BODMAS Rule; Divisibility Rules (2, 3, 4, 5, 6, 8, 9, 10, 11); Prime Factorization; HCF & LCM.
   - **Ch 4: Data Handling and Presentation**: Organizing Data; Tally Charts; Pictographs; Bar Graphs.
   - **Ch 5: Prime Time**: Prime vs Composite; Twin Primes; Co-Primes; Factor Trees.
   - **Ch 6: Perimeter and Area**: Perimeter of Polygons; Area of Rectangles and Squares; Irregular Shapes.
   - **Ch 7: Fractions**: Proper, Improper, Mixed Fractions; Number Line Fractions; Equivalent Fractions; Operations.
   - **Ch 8: Playing with Constructions**: Ruler and Compass: Perpendicular Bisector, Angle Bisector, Angles ($60^\circ, 90^\circ, 120^\circ$).
   - **Ch 9: Symmetry**: Line of Symmetry; Reflectional Symmetry; Mirror Images.
   - **Ch 10: The Other Side of Zero**: Integers; Positive and Negative Numbers; Number Line Operations; Absolute Value.
2. **Science (*Curiosity* / NCERT Standard)**:
   - **Ch 1: The Wonderful World of Science**: Scientific Method; Hypothesis Testing; Measurement.
   - **Ch 2: Diversity in the Living World**: Classification of Organisms; Habitats (Terrestrial, Aquatic); Adaptations.
   - **Ch 3: Mindful Eating**: Nutrients (Carbs, Proteins, Fats, Vitamins, Minerals, Fibre, Water); Deficiency Diseases; Balanced Diet.
   - **Ch 4: Exploring Magnets**: Magnetic Materials; Poles of a Magnet; Attraction & Repulsion; Magnetic Compass.
   - **Ch 5: Measurement of Length and Motion**: SI Units; Measuring Curved Lines; Motion Types (Rectilinear, Circular, Periodic).
   - **Ch 6: Materials Around Us**: Properties: Lustre, Hardness, Solubility, Density, Transparency (Transparent, Translucent, Opaque).
   - **Ch 7: Temperature and Its Measurement**: Temperature; Clinical vs Laboratory Thermometer; Celsius Scale.
   - **Ch 8: States of Water**: Evaporation, Condensation, Transpiration; Water Cycle; Cloud Formation; Floods & Droughts.
   - **Ch 9: Methods of Separation**: Handpicking, Threshing, Winnowing, Sieving; Sedimentation, Decantation, Filtration; Evaporation.
   - **Ch 10: Living Creatures: Characteristics**: Cellular Nature; Respiration; Stimuli Response; Excretion; Reproduction.
   - **Ch 11: Nature's Treasures**: Forests, Soil, Water, Air, Minerals; Renewable vs Non-Renewable Resources.
   - **Ch 12: Beyond Earth**: Solar System; Planets and Satellites; Phases of Moon; Constellations.
3. **Social Science (*Exploring Society: India and Beyond*)**:
   - Locating Places on Earth (Latitudes, Longitudes, Time Zones); Oceans & Continents; Landforms and Life; India Physical Divisions; Roots of Indian Culture (Harappan Civilization, Vedic Period); Governance and Democracy (Panchayati Raj, Municipalities).

##### CLASS 7
*Pedagogical Objective*: Algebraic thinking, geometrical proofs, physiological processes in organisms, heat energy, medieval history, and dynamic environmental systems.
1. **Mathematics**:
   - **Ch 1: Integers**: Operations on Integers; Properties (Closure, Commutative, Associative, Distributive); Word Problems.
   - **Ch 2: Fractions and Decimals**: Multiplication and Division of Fractions & Decimals; Metric Applications.
   - **Ch 3: Data Handling**: Mean, Median, Mode; Range; Double Bar Graphs; Probability Basics.
   - **Ch 4: Simple Equations**: Setting up Equations; Solving Linear Equations by Balancing & Transposition.
   - **Ch 5: Lines and Angles**: Complementary & Supplementary Angles; Adjacent Angles; Linear Pair; Transversal on Parallel Lines.
   - **Ch 6: The Triangle and its Properties**: Medians, Altitudes; Exterior Angle Property; Angle Sum Property; Pythagoras Theorem.
   - **Ch 7: Comparing Quantities**: Ratios, Percentages; Profit and Loss Percentage; Simple Interest ($SI = \frac{P \times R \times T}{100}$).
   - **Ch 8: Rational Numbers**: Definition; Number Line Representation; Operations on Rational Numbers.
   - **Ch 9: Perimeter and Area**: Area of Parallelogram and Triangle; Circumference and Area of Circle ($\pi r^2$, $2\pi r$).
   - **Ch 10: Algebraic Expressions**: Terms, Coefficients, Like/Unlike Terms; Monomials, Binomials; Addition & Subtraction.
   - **Ch 11: Exponents and Powers**: Laws of Exponents ($a^m \cdot a^n = a^{m+n}$, $(a^m)^n = a^{mn}$); Scientific Notation.
   - **Ch 12: Symmetry**: Line Symmetry; Rotational Symmetry; Angle & Order of Symmetry.
   - **Ch 13: Visualising Solid Shapes**: 2D Nets; Faces, Edges, Vertices; Euler's Formula ($F + V - E = 2$).
2. **Science**:
   - **Ch 1: Nutrition in Plants**: Autotrophic vs Heterotrophic; Photosynthesis; Stomata; Parasites; Insectivorous Plants.
   - **Ch 2: Nutrition in Animals**: Digestive System (Mouth, Stomach, Small Intestine, Liver, Pancreas); Ruminants; Amoeba.
   - **Ch 3: Heat**: Heat vs Temperature; Conduction, Convection, Radiation; Conductors & Insulators; Sea Breeze/Land Breeze.
   - **Ch 4: Acids, Bases and Salts**: Indicators (Litmus, Turmeric); Properties; Neutralisation in Daily Life.
   - **Ch 5: Physical and Chemical Changes**: Rusting of Iron; Galvanisation; Crystallisation; Magnesium Ribbon.
   - **Ch 6: Respiration in Organisms**: Aerobic vs Anaerobic; Breathing Mechanism; Respiration in Animals & Plants.
   - **Ch 7: Transportation in Animals and Plants**: Circulatory System (Blood, Heart, Vessels); Excretory System; Xylem & Phloem.
   - **Ch 8: Reproduction in Plants**: Asexual (Vegetative, Budding, Spores); Sexual (Flower Anatomy, Pollination, Fertilisation).
   - **Ch 9: Motion and Time**: Uniform vs Non-Uniform; Speed Formula; Simple Pendulum (Time Period); Distance-Time Graphs.
   - **Ch 10: Electric Current and its Effects**: Circuit Symbols; Heating Effect (Fuse, Heaters); Magnetic Effect (Electromagnets).
   - **Ch 11: Light**: Reflection; Plane Mirror Images; Spherical Mirrors (Concave/Convex); Lenses; Dispersion (Prism).
   - **Ch 12: Forests: Our Lifeline**: Forest Profile (Canopy, Understorey); Food Web; Decomposers & Humus.
   - **Ch 13: Wastewater Story**: Sewage; Wastewater Treatment Plant (WWTP) Stages; Sanitation.
3. **Social Science**:
   - History (*Our Pasts II*): New Kings (Cholas), Delhi Sultanate, Mughal Empire, Tribes & Nomads, Bhakti/Sufi, 18th Century Formations.
   - Geography (*Our Environment*): Earth's Interior, Plate Tectonics, Atmosphere Layers, Ocean Currents, Amazon & Ganga-Brahmaputra.
   - Civics (*Social and Political Life II*): Equality (Article 15), Role of Government in Health, State Government, Gender, Media, Markets.

##### CLASS 8
*Pedagogical Objective*: Polynomial factorization, linear equations, cellular biology, chemical effects of electricity, modern colonial history, and constitutional governance.
1. **Mathematics**:
   - **Ch 1: Rational Numbers**: Closure, Commutativity, Associativity, Distributivity; Additive & Multiplicative Inverses.
   - **Ch 2: Linear Equations in One Variable**: Equations with Variable on Both Sides; Modeling Word Problems.
   - **Ch 3: Understanding Quadrilaterals**: Polygon Angle Sum ($360^\circ$); Parallelograms, Rhombuses, Rectangles, Squares, Kites.
   - **Ch 4: Data Handling**: Histograms; Pie Charts / Circle Graphs; Probability of Single Events.
   - **Ch 5: Square and Square Roots**: Properties; Pythagorean Triplets; Finding Roots by Factorization and Long Division.
   - **Ch 6: Cube and Cube Roots**: Cube Numbers; Finding Cube Roots by Prime Factorization.
   - **Ch 7: Comparing Quantities**: Discounts; Goods and Services Tax (GST); Compound Interest ($A = P(1 + r/100)^n$).
   - **Ch 8: Algebraic Expressions and Identities**: Polynomial Multiplication; Identities: $(a \pm b)^2$, $a^2-b^2$, $(x+a)(x+b)$.
   - **Ch 9: Mensuration**: Area of Trapezium, Rhombus, General Quadrilateral; Surface Area & Volume of Cubes, Cuboids, Cylinders.
   - **Ch 10: Exponents and Powers**: Negative Exponents; Laws of Exponents; Small Numbers in Scientific Notation ($a \times 10^{-n}$).
   - **Ch 11: Direct and Inverse Proportions**: Direct ($x/y = k$) vs Inverse ($x \cdot y = k$); Work, Time, Speed Problems.
   - **Ch 12: Factorisation**: Common Factors; Regrouping; Identities; Splitting Middle Term; Polynomial Division.
   - **Ch 13: Introduction to Graphs**: Cartesian Coordinates $(x, y)$; Plotting Linear Graphs; Dependent/Independent Variables.
2. **Science**:
   - **Ch 1: Crop Production and Management**: Agricultural Practices: Sowing, Manures/Fertilizers, Irrigation (Drip/Sprinkler), Harvesting.
   - **Ch 2: Microorganisms: Friend and Foe**: Bacteria, Fungi, Protozoa, Viruses; Fermentation; Vaccines; Nitrogen Cycle; Food Preservation.
   - **Ch 3: Coal and Petroleum**: Destructive Distillation of Coal; Fractional Distillation of Petroleum; Petrochemicals.
   - **Ch 4: Combustion and Flame**: Ignition Temperature; Fire Extinguishers; Types of Combustion; Flame Zones; Calorific Value.
   - **Ch 5: Conservation of Plants and Animals**: Biosphere Reserves, National Parks, Sanctuaries; Red Data Book; Reforestation.
   - **Ch 6: Reproduction in Animals**: Sexual Reproduction (Systems, Fertilisation, Embryo); Metamorphosis; Binary Fission; Budding; Cloning.
   - **Ch 7: Reaching the Age of Adolescence**: Puberty; Hormones (Endocrine Glands); Sex Determination (XX vs XY); Health.
   - **Ch 8: Force and Pressure**: Contact vs Non-Contact Forces; Pressure ($P = F/A$); Liquid & Atmospheric Pressure.
   - **Ch 9: Friction**: Factors Affecting Friction; Static, Sliding, Rolling; Friction as Necessary Evil; Streamlining.
   - **Ch 10: Sound**: Vibration; Medium Required; Human Ear Anatomy; Amplitude, Frequency, Pitch, Loudness; Noise Pollution.
   - **Ch 11: Chemical Effects of Electric Current**: Electrolytes; Electrolysis; Electroplating Principles and Applications.
   - **Ch 12: Some Natural Phenomena**: Static Charges; Lightning Conductors; Earthquakes (Richter Scale, Seismograph).
   - **Ch 13: Light**: Laws of Reflection; Multiple Images; Kaleidoscope; Human Eye (Cornea, Iris, Lens, Retina); Braille.
3. **Social Science**:
   - History (*Our Pasts III*): East India Company Expansion, 1857 Revolt, Colonialism, Education, Women & Caste Reforms, National Movement (1870-1947).
   - Geography (*Resources and Development*): Resources, Land, Soil, Water, Minerals & Power, Agriculture, Industries, Human Resources.
   - Civics (*Social and Political Life III*): Indian Constitution, Secularism, Parliament, Judiciary, Criminal Justice System.

---

#### 2.3.4 Stage 4: Secondary Stage (Classes 9 & 10 — CBSE Board Core)

##### CLASS 9
*Pedagogical Objective*: Formal mathematical proofs, Newtonian mechanics, atomic theory, cellular pathology, modern global history, and constitutional mechanics.
1. **Mathematics**:
   - **Ch 1: Number Systems**: Real Numbers; Irrational Numbers; Rationalisation of Surds ($\frac{1}{\sqrt{a} \pm \sqrt{b}}$); Real Exponents.
   - **Ch 2: Polynomials**: Zeroes; Remainder & Factor Theorems; Factorisation of Cubics; Identities: $(x+y+z)^2$, $(x \pm y)^3$, $x^3+y^3+z^3-3xyz$.
   - **Ch 3: Coordinate Geometry**: Cartesian Plane; Origin, Axes, Quadrants; Abscissa and Ordinate.
   - **Ch 4: Linear Equations in Two Variables**: Standard Form $ax + by + c = 0$; Solution Space; Graphing Linear Equations.
   - **Ch 5: Introduction to Euclid's Geometry**: Axioms and Postulates; Euclid's 5 Postulates; Equivalent Versions.
   - **Ch 6: Lines and Angles**: Intersecting Lines; Linear Pair; Vertically Opposite Angles; Parallel Lines with Transversal; Angle Sum Property.
   - **Ch 7: Triangles**: Congruence Criteria (SAS, ASA, AAS, SSS, RHS); Isosceles Triangle Properties; Inequalities.
   - **Ch 8: Quadrilaterals**: Parallelogram Properties; Mid-Point Theorem and its Converse.
   - **Ch 9: Circles**: Chords; Perpendicular from Center; Equal Chords; Inscribed Angles; Cyclic Quadrilaterals.
   - **Ch 10: Heron's Formula**: Triangle Area ($s = \frac{a+b+c}{2}$, $A = \sqrt{s(s-a)(s-b)(s-c)}$); Quadrilateral Applications.
   - **Ch 11: Surface Areas and Volumes**: Cones, Spheres, Hemispheres.
   - **Ch 12: Statistics**: Graphical Representation: Bar Graphs, Histograms (Uniform/Varying Widths), Frequency Polygons.
2. **Science**:
   - **Chemistry**:
     - **Ch 1: Matter in Our Surroundings**: States of Matter; Phase Changes (Latent Heat, Sublimation); Evaporative Cooling.
     - **Ch 2: Is Matter Around Us Pure?**: Mixtures vs Compounds; Solutions, Suspensions, Colloids; Tyndall Effect; Concentration.
     - **Ch 3: Atoms and Molecules**: Laws of Chemical Combination; Dalton's Theory; Molecular Mass; Chemical Formulae; Mole Concept.
     - **Ch 4: Structure of the Atom**: Thomson, Rutherford, Bohr Models; Valency; Atomic/Mass Numbers; Isotopes & Isobars.
   - **Biology**:
     - **Ch 5: The Fundamental Unit of Life**: Cell Discovery; Plasma Membrane (Osmosis/Diffusion); Nucleus; Organelles (Mitochondria, Golgi, Lysosomes, Plastids); Mitosis vs Meiosis.
     - **Ch 6: Tissues**: Plant (Meristematic, Permanent: Xylem/Phloem); Animal (Epithelial, Connective, Muscular, Nervous).
     - **Ch 12: Improvement in Food Resources**: Crop Variety Improvement; Manures/Fertilizers; Animal Husbandry (Cattle, Poultry, Fish, Bees).
   - **Physics**:
     - **Ch 7: Motion**: Distance, Displacement, Speed, Velocity; Equations of Motion ($v = u + at$, $s = ut + \frac{1}{2}at^2$, $v^2 - u^2 = 2as$).
     - **Ch 8: Force and Laws of Motion**: Newton's 3 Laws of Motion; Inertia, Momentum ($p=mv$); Force ($F=ma$); Momentum Conservation.
     - **Ch 9: Gravitation**: Universal Law of Gravitation ($F = G\frac{m_1m_2}{d^2}$); Free Fall; Acceleration ($g$); Mass vs Weight; Archimedes' Principle.
     - **Ch 10: Work and Energy**: Work Done ($W = F \cdot s$); Kinetic Energy ($\frac{1}{2}mv^2$); Potential Energy ($mgh$); Energy Conservation; Power.
     - **Ch 11: Sound**: Wave Parameters ($\lambda, \nu, T, A$); Speed ($v = \nu \lambda$); Reflection (Echo, Reverberation); Ultrasound; Ear Anatomy.
3. **Social Science**:
   - History (*India & Contemporary World I*): French Revolution, Russian Revolution, Nazism & Hitler, Forest Society, Pastoralists.
   - Geography (*Contemporary India I*): Size & Location, Physical Features, Drainage (Himalayan/Peninsular Rivers), Climate (Monsoon), Population.
   - Political Science (*Democratic Politics I*): What is Democracy?, Constitutional Design, Electoral Politics, Institutions, Democratic Rights.
   - Economics: Story of Village Palampur, People as Resource, Poverty as a Challenge, Food Security in India.

##### CLASS 10 (Target CBSE Board Examination Class)
*Pedagogical Objective*: Mastery of CBSE Board Examination blueprints, rigorous problem solving, multi-step proofs, chemical synthesis, genetics, electromagnetism, and democratic institutions.
1. **Mathematics**:
   - **Ch 1: Real Numbers**: Fundamental Theorem of Arithmetic (HCF & LCM); Proofs of Irrationality ($\sqrt{2}, \sqrt{3}, \sqrt{5}$); Terminating Decimals ($q = 2^n5^m$).
   - **Ch 2: Polynomials**: Geometric Zeroes; Relationship between Zeroes and Coefficients ($\alpha + \beta = -b/a$, $\alpha \beta = c/a$).
   - **Ch 3: Pair of Linear Equations in Two Variables**: Graphical Solutions; Consistency Criteria ($\frac{a_1}{a_2} \neq \frac{b_1}{b_2}$, etc.); Substitution & Elimination Methods; Word Problems.
   - **Ch 4: Quadratic Equations**: Standard Form $ax^2 + bx + c = 0$; Factorization; Quadratic Formula ($x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$); Discriminant ($D = b^2-4ac$) Nature of Roots.
   - **Ch 5: Arithmetic Progressions**: General Term ($a_n = a + (n-1)d$); Sum of $n$ Terms ($S_n = \frac{n}{2}[2a + (n-1)d]$); Applications.
   - **Ch 6: Triangles**: Similar Figures; Basic Proportionality Theorem (Thales' Theorem) and Converse; Similarity Criteria (AAA, SAS, SSS); Proofs.
   - **Ch 7: Coordinate Geometry**: Distance Formula ($d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$); Section Formula ($(x,y) = (\frac{m_1x_2+m_2x_1}{m_1+m_2}, \frac{m_1y_2+m_2y_1}{m_1+m_2})$); Midpoint Formula.
   - **Ch 8: Introduction to Trigonometry**: Trigonometric Ratios ($\sin, \cos, \tan, \cot, \sec, \text{cosec}$); Specific Angles ($0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ$); Identities: $\sin^2\theta + \cos^2\theta = 1$, $1 + \tan^2\theta = \sec^2\theta$, $1 + \cot^2\theta = \text{cosec}^2\theta$.
   - **Ch 9: Some Applications of Trigonometry**: Heights and Distances; Line of Sight; Angles of Elevation & Depression; Multi-Triangle Scenarios.
   - **Ch 10: Circles**: Tangent Theorems (Perpendicular to Radius; Tangents from External Point Equal); Inscribed Figures.
   - **Ch 11: Areas Related to Circles**: Sector Area ($\frac{\theta}{360}\pi r^2$); Arc Length ($\frac{\theta}{360}2\pi r$); Segment Area; Combinations of Figures.
   - **Ch 12: Surface Areas and Volumes**: Surface Area and Volume of Combinations: Cubes, Cuboids, Spheres, Cones, Cylinders; Shape Conversions.
   - **Ch 13: Statistics**: Mean (Direct, Assumed Mean, Step Deviation); Mode; Median; Empirical Formula ($3\text{ Median} = \text{Mode} + 2\text{ Mean}$).
   - **Ch 14: Probability**: Classical Probability ($P(E) = \frac{n(E)}{n(S)}$); Complementary Events ($P(E) + P(\bar{E}) = 1$); Cards, Coins, Dice.
2. **Science**:
   - **Chemistry**:
     - **Ch 1: Chemical Reactions and Equations**: Balancing Equations; Types (Combination, Decomposition, Displacement, Double Displacement, Redox); Corrosion & Rancidity.
     - **Ch 2: Acids, Bases and Salts**: Properties; Neutralisation; pH Scale; Common Salts (NaOH Chlor-Alkali, Bleaching Powder, Baking Soda, Washing Soda, Plaster of Paris).
     - **Ch 3: Metals and Non-metals**: Physical/Chemical Properties; Reactivity Series; Ionic Compounds; Metallurgy (Roasting, Calcination, Refining); Alloys.
     - **Ch 4: Carbon and its Compounds**: Covalent Bonding; Catenation & Tetravalency; Homologous Series; Functional Groups; Reactions (Combustion, Oxidation, Addition, Substitution); Ethanol & Ethanoic Acid; Soaps & Micelles.
   - **Biology**:
     - **Ch 5: Life Processes**: Autotrophic (Photosynthesis) & Heterotrophic Nutrition; Human Digestive Canal; Respiration (Aerobic vs Anaerobic, ATP); Double Circulation; Excretion (Nephron & Dialysis).
     - **Ch 6: Control and Coordination**: Nervous System (Neuron, Synapse, Reflex Arc); Human Brain Anatomy; Plant Tropisms & Hormones (Auxin, Cytokinin, ABA); Animal Endocrine Glands.
     - **Ch 7: How do Organisms Reproduce?**: Asexual (Fission, Budding, Spores, Regeneration, Vegetative); Plant Reproduction (Pollination, Fertilisation); Human Reproductive Systems; Menstrual Cycle; Contraception & STIs.
     - **Ch 8: Heredity**: Mendel's Laws; Monohybrid (3:1) & Dihybrid (9:3:3:1) Crosses; Sex Determination in Humans (XX vs XY).
   - **Physics**:
     - **Ch 9: Light - Reflection and Refraction**: Spherical Mirrors; Ray Diagrams; Mirror Formula ($\frac{1}{v} + \frac{1}{u} = \frac{1}{f}$); Magnification ($m = -v/u$); Refraction & Snell's Law; Refractive Index; Lens Formula ($\frac{1}{v} - \frac{1}{u} = \frac{1}{f}$); Power of Lens ($P = 1/f$).
     - **Ch 10: The Human Eye and Colourful World**: Eye Anatomy; Power of Accommodation; Vision Defects (Myopia, Hypermetropia, Presbyopia); Prism Dispersion (VIBGYOR); Rainbow; Atmospheric Refraction; Scattering (Tyndall Effect).
     - **Ch 11: Electricity**: Current ($I = Q/t$); Potential Difference ($V = W/Q$); Ohm's Law ($V = IR$); Resistance & Resistivity ($\rho$); Series and Parallel Resistors; Joule's Heating ($H = I^2Rt$); Electric Power ($P = VI$).
     - **Ch 12: Magnetic Effects of Electric Current**: Magnetic Field Lines; Straight Wire, Loop, Solenoid; Fleming's Left-Hand Rule; Electric Motor; Electromagnetic Induction; Domestic Circuits (Live, Neutral, Earth, Fuse).
     - **Ch 13: Our Environment**: Ecosystems; Food Chains/Webs; 10% Energy Law; Biomagnification; Ozone Depletion (CFCs); Waste Management.
3. **Social Science**:
   - History (*India and Contemporary World II*): Rise of Nationalism in Europe, Nationalism in India, Making of a Global World, Age of Industrialisation, Print Culture.
   - Geography (*Contemporary India II*): Resources & Development, Forests & Wildlife, Water Resources (Dams/Rainwater Harvesting), Agriculture, Minerals & Energy, Manufacturing Industries, Lifelines of National Economy.
   - Political Science (*Democratic Politics II*): Power Sharing (Belgium vs Sri Lanka), Federalism (Decentralisation), Gender/Religion/Caste, Political Parties, Outcomes of Democracy.
   - Economics (*Understanding Economic Development*): Development (HDI, Per Capita), Sectors of Indian Economy (GDP, MGNREGA), Money & Credit (RBI, SHGs), Globalisation (MNCs, WTO).

---

### 2.4 Application Integration & Cascading Selectors Architecture
In `divyank_mission_control_google_apps_script_app.html`, the Admin Generation studio (`#adminAiGenerateContainer`) implements a 4-level cascading selector wire-up backed by `window.ZOPTRO_CURRICULUM_TAXONOMY`:
1. **Grade Selection (`#geminiGradeSelect`)**: Populates Classes 1 to 10 with developmental stage labels.
2. **Subject Selection (`#geminiSubjectSelect`)**: Filtered strictly by chosen Grade, displaying official NCERT textbook titles.
3. **Chapter Selection (`#geminiChapterSelect`)**: Dynamically filtered by chosen Subject.
4. **Topic Selection (`#geminiTopicSelect`)**: Dynamically filtered by chosen Chapter. Automatically sets suggested Bloom cognitive level and default difficulty in `#geminiBloomSelect` and `#geminiDifficultySelect`.

---

### 2.5 Long-Term Maintenance & Verification Protocol
A lightweight Node.js script (`scripts/verify_curriculum_taxonomy.js`) verifies manifest integrity:
- Confirms exactly 10 grades (Class 1 to 10).
- Verifies every subject contains non-empty chapters and topics.
- Computes and verifies the cryptographic SHA-256 integrity hash.
- Zero runtime external network dependencies.

---

## 4. Section 3: Closed-Loop Exam Preparation Content Workflow & Response Tracking Architecture

### 3.1 Pedagogical Foundations & Cognitive Alignment

#### 3.1.1 Bloom's Revised Taxonomy x CBSE Examination Blueprint
Under CBSE guidelines, assessments are partitioned into Competency-Based (50%), Select Response (20%), and Constructive Response (30%). Zoptro automates the delivery, autograding, and granular response tracking for the 70% objective segment:

| Bloom Level | Cognitive Verbs | CBSE Item Archetype | Target Grades | Structure & Distractor Engineering |
| :--- | :--- | :--- | :--- | :--- |
| **1: Remembering** | Recall, identify, define, list, state | **Factual Recall MCQ** | Classes 1 to 10 | Direct stem testing statutory laws, SI units, definitions. Distractors are plausible near-misses or inverted terms. |
| **2: Understanding** | Explain, classify, compare, interpret | **Conceptual MCQ / Basic A-R** | Classes 3 to 10 | Requires explaining *why* a phenomenon occurs or categorizing concepts. Distractors confuse correlation with causation. |
| **3: Applying** | Calculate, solve, execute, demonstrate | **Numerical Problem MCQ** | Classes 4 to 10 | Mathematical or procedural execution (e.g. lens formula, Ohm's law). Distractors model step errors (sign slip, unit conversion). |
| **4: Analyzing** | Differentiate, organize, deconstruct | **CBSE Assertion-Reasoning (A-R)** | Classes 6 to 10 | 2 statements: Assertion (A) and Reason (R). 4 statutory options: (a) Both true + correct expl; (b) Both true + NOT expl; (c) A true, R false; (d) A false, R true. |
| **5: Evaluating** | Critique, justify, verify, judge | **Experimental Validation MCQ** | Classes 6 to 10 | Stimulus presents experimental apparatus or data table. Student critiques method. Distractors accept flawed controls. |
| **6: Creating** | Synthesize, formulate, integrate | **Competency Case Question Sub-item** | Classes 8 to 10 | Real-world multi-disciplinary scenario combining concepts to formulate a composite prediction. |

#### 3.1.2 Diagnostic Distractor Engineering
Incorrect options in Zoptro are not random; they are **Diagnostic Distractors**:
- *Formula Inversion Trap*: Forgetting reciprocals ($R_p = R_1 + R_2$ instead of $1/R_1 + 1/R_2$).
- *Sign Convention Inversion*: Reversing signs in mirror equations (e.g. using $+v$ instead of $-v$).
- *Causality vs Correlation*: In Assertion-Reasoning, accepting a fact that is true in nature but does not causally explain the assertion.

When a student selects a specific distractor, Table 14 captures `studentChoiceIndex`. In Parent HQ, the system explains the underlying misconception and prescribes corrective action.

---

### 3.2 Operational Admin Studio Workflow in `#view-admin`
The content generation workflow is situated directly within `#view-admin` in `divyank_mission_control_google_apps_script_app.html`:
1. **Navigation Access**: 7th Admin Tab button `#adminTabBtnAiGenerate` activates `#adminAiGenerateContainer`.
2. **Quota HUD Banner (`#aiGenTokenStatsBanner`)**: Real-time telemetry displaying Cache Hit/Miss status, Prompt Tokens, Candidate Tokens, Total Tokens, Session Cumulative, and remaining RPM / Daily RPD counters.
3. **Interactive Inspection Deck (`#aiGenPreviewContainer`)**:
   - Renders generated questions into individual inspection cards.
   - Inline Editing: Administrators can modify title, stem, options, hint, or explanation.
   - Discard Control: Single-item discard removes flawed items and updates the commit batch counter.
4. **Direct Storage Commitment**:
   - Clicking `[🚀 Commit Verified Items to Database]` dispatches `ZoptroApiClient.bulkUploadContentBatch({ adminUserId, contentType: 'CurriculumQuizzes', items })`.
   - Acquires `withScriptLock(10000)`, writes records atomically to Table 11 `CurriculumQuizzes`, and logs `BULK_UPLOAD` to Table 6 `ActivityLogs`.
   - Triggers confirmation toast and switches view to `#adminTabBtnQuizzes`.

---

### 3.3 Downstream Student Execution & Response Telemetry Pipeline
1. **Dynamic Delivery**:
   - Student practice sessions call `getContentByGrade` and `getNextPersonalizedCurriculum`.
   - Enforces strict grade isolation based on `student.gradeClass` (Class 3 students never receive Class 10 questions).
   - Sequenced by `orderIndex`, moving from foundational recall to high-order case questions.
2. **Granular Response Logging (Table 14 `StudentQuestionResponses`)**:
   - Client records student choice, correctness, points earned, and latency in seconds.
   - Atomically appended to Table 14 across 17 relational fields:
     `id` | `completionId` | `studentId` | `grade` | `contentType` | `contentId` | `questionId` | `questionText` | `optionsJson` | `studentChoiceIndex` | `studentChoiceText` | `correctOptionIndex` | `isCorrect` | `pointsEarned` | `explanation` | `timeSpentSeconds` | `answeredAt`.

---

### 3.4 Parent HQ Answer Sheet Drilldown & Forensic Audit
1. **Parent-Child RBAC Isolation**:
   - Verified via `assertParentPairing(callerId, studentId)`. Prevents unauthorized parents or siblings from viewing records.
2. **Parent Answer Sheet Modal (`#modal-parent-answersheet`)**:
   - Child selector dropdown (`#answerSheetChildSelect`) allows switching between children.
   - Session selector and aggregate performance strip (Total Questions, Accuracy %, Total Points).
   - Question Cards render 90° square-bordered diagnostic tiles highlighting student choices in red/green and presenting the full `💡 Pedagogical Strategy & Explanation`.

---

### 3.5 Closed-Loop Adaptive Feedback & Remediation Engine
1. **Adaptive Pacing Decision Matrix**:
   - If accuracy on a topic/chapter $< 60\%$: Triggers `REINFORCEMENT_REVIEW`, withholding advanced items and serving Bloom Level 1/2 review items.
   - If accuracy $\ge 60\%$: Advances to `NEXT_TOPIC`, escalating to Bloom Levels 3, 4, and 5.
   - If all grade content is completed: Triggers `MASTERY_CELEBRATION` and unlocks the next grade level.
2. **Closing the Pedagogical Loop**:
   - When recurring student failure patterns are identified, an **Academic Need Alert** is exposed to the Admin Studio.
   - Administrators can trigger one-click targeted generation to generate customized remediation quizzes, which are committed to Table 11 and routed immediately into the student's next practice session.

---

## 5. Architectural Invariants, Security Mitigations, & Brand Discipline

### 5.1 Visual Brand Expression & Geometry Compliance (0px Universal Radius)
All UI elements across the Admin Generator studio, preview cards, quiz runner, and parent answer sheet modal adhere strictly to the Zoptro Design System:
- **Geometry**: Universal 0px border-radius (`* { border-radius: 0px !important; }`, Tailwind `rounded-none`, 0 occurrences of standard rounded classes).
- **Typography**: `Outfit` display font for headings, counters, and modal titles; `Figtree` body font for form fields, question text, and option cards.
- **Palette**:
  - Authority Blue (`#09293D`): Primary brand foundation, headers, navigation.
  - Clarity Ivory (`#F4F2EA`): Main canvas, card surfaces, neutral backgrounds.
  - Grounded Olive (`#666D57`): Status badges, correct answer indicators, verified progress.
  - Progress Orange (`#F65800`): Primary action buttons, commit CTAs, incorrect choice borders.
- **Aesthetic Tone**: Clean military mission-control aesthetic; absolute eradication of cyber gradients and glowing neon shadows.

### 5.2 Formula & CSV Injection Mitigation (CWE-1236)
All user and AI-generated string values stored in Google Sheets are passed through `sanitizeSheetCellValue(val)` before persistence. If a string starts with `=`, `+`, `-`, `@`, `\t`, or `\r`, it is prefixed with a single quote (`'`), preventing malicious spreadsheet formula execution.

### 5.3 Multi-Row Concurrency Locking (`withScriptLock` & Rate Limiting Locks)
All database write transactions in Google Apps Script are wrapped in `withScriptLock(callback, 10000)`, preventing sheet row collisions and index corruption during concurrent multi-user operations.

Furthermore, rate limiting and quota state mutations in `checkAndIncrementRateLimit` are explicitly protected by `LockService.getScriptLock()` with a 3,000ms acquisition timeout (`tryLock(3000)`). This eliminates read-modify-write race conditions across simultaneous Apps Script executions, ensuring that sliding timestamp arrays and daily RPD counters are modified atomically without lost updates or quota breeches.

### 5.4 Strict DOM Element ID Resolution Invariant (`M6-REG-01`)
100% of DOM element IDs queried by JavaScript controllers exist as genuine HTML elements in the markup. No script may query an ID that is not defined in the DOM.

---

## 6. Verification Commands & Regression Test Harness

### 6.1 Master Test Suite Execution
Execute the master opaque-box test runner:
```powershell
node tests/run_tests.js
```
- **Verification Target**: 100% pass threshold across all 7 active tiers (296/296 tests passing in <500ms).

### 6.2 Question-Level Tracking & Bulk Ingestion Verification
Execute the question tracking and bulk ingestion test harness:
```powershell
node tests/test_question_level_tracking.js
```
- **Verification Target**: 15/15 tests passing, verifying:
  - Table 14 (`StudentQuestionResponses`) 17-column relational schema (`T1.1`).
  - `recordQuestionResponses` granular ingestion (`T1.3`).
  - Parent Answer Sheet drilldown and strict RBAC isolation (`T2.1`, `T2.2`, `T2.3`).
  - Dynamic adaptive pacing via `getNextPersonalizedCurriculum` (`T3.1`).
  - Admin bulk ingestion via `bulkUploadContentBatch` (`T4.1`, `T4.2`).
  - Frontend DOM elements and 0px brand geometry (`T5.1`–`T5.6`).

### 6.3 Adversarial Stress & Architectural Invariant Suites (Challengers 1 & 2)
Execute the adversarial architecture and dual-mode parity stress test suites:
```powershell
node tests/test_challenger1_m1_architecture_stress.js
node tests/test_challenger2_m1_parity_security_stress.js
```
- **Verification Target**:
  - Challenger 1: Sliding window vs fixed window boundary burst, Bloom's cognitive taxonomy isolation in deduplication fingerprints, maxOutputTokens 8192 capacity analysis, GAS 360-second execution profiling, and 10-grade syllabus taxonomy coverage.
  - Challenger 2: Table 11/14 column schema alignment, `optionsJson` serialization integrity, formula injection neutralization (CWE-1236), dual-mode parity, Interface Contract 2 (`getGeminiQuotaStatus`), and brand design invariants.

### 6.4 Brand Discipline & DOM Invariant Verification
Execute brand and DOM invariant test suites:
```powershell
node tests/test_brand_m2.js
node tests/test_milestone6_landing_page.js
```
- **Verification Target**: 0 rounded class violations; 100% of DOM IDs queried in JS resolve in HTML markup (`M6-REG-01`).

### 6.5 Invalidation Conditions
The architectural blueprint is invalidated if:
1. Any proposed UI introduces non-zero border radius classes (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`).
2. Script queries reference an element ID that does not exist in the HTML markup.
3. Content generation commits directly to storage without routing through `bulkUploadContentBatch` and `withScriptLock`.
4. Downstream response tracking omits any of the 17 relational fields defined in Table 14.

---

## 7. Implementation Milestone Roadmap (Milestones 2 to 5)

| Milestone | Target Scope | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | Architectural Blueprint & Syllabus Plan | Authoritative specification document (`docs/gemini_content_generation_architecture_and_syllabus_plan.md`) | **COMPLETED** |
| **Milestone 2** | Backend Gemini Pipeline & Token Quota System | Implementation in `google_apps_script_backend.js`: `generateCurriculumQuestionsWithGemini`, `UrlFetchApp` with `muteHttpExceptions: true`, `usageMetadata` token tracking, `GeminiTokenLogs`, sliding 15 RPM / 1.5K RPD rate limiter, SHA-256 deduplication cache, and `bulkUploadContentBatch` bridge | **PLANNED** |
| **Milestone 3** | Frontend Admin UI & BrowserMockBackend Parity | Implementation in `divyank_mission_control_google_apps_script_app.html`: Admin studio UI (`#adminTabBtnAiGenerate`, `#adminAiGenerateContainer`), parameter controls, token stats banner, preview deck, commit action, `BrowserMockBackend` offline parity, and brand guidelines compliance | **PLANNED** |
| **Milestone 4** | Automated Test Verification Suite (Tier 8) | Implementation in `tests/test_gemini_content_generation.js` and `tests/run_tests.js`: $\ge 30$ tests covering payload formatting, response parsing, token counting, quota management, rate limiting, bulk ingestion, dual-mode parity, and 100% pass rate across $\ge 326$ tests | **PLANNED** |
| **Milestone 5** | Final Verification & Adversarial Coverage Hardening | Run master test runner `node tests/run_tests.js` ensuring 100% pass rate across all 8 tiers, adversarial verification, and forensic audit | **PLANNED** |

---
*End of Blueprint Document — Zoptro Educational Focus & Multi-Child Mission Control Platform*
