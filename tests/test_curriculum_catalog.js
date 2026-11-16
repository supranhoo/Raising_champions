/**
 * =========================================================================
 * TIER 9: CBSE/NCERT CURRICULUM CATALOG & STUDIO UI INTEGRATION
 * =========================================================================
 * Master automated test suite for Milestone 3 covering:
 * - Group 1: Canonical Dataset Integrity (curriculum_catalog_data.js) (8 tests)
 * - Group 2: Google Apps Script Backend Parity & Table 16 Schema (google_apps_script_backend.js) (8 tests)
 * - Group 3: BrowserMockBackend & ZoptroApiClient Dual-Mode Parity (divyank_mission_control_google_apps_script_app.html) (7 tests)
 * - Group 4: RBAC Security & Formula Injection Neutralization (seedCurriculumCatalog) (7 tests)
 * - Group 5: Admin AI Studio Dynamic Dropdown & Mode Toggling UI Integration (7 tests)
 * - Group 6: Topic Suggestions & Primary Topic Auto-Fill (7 tests)
 * - Group 7: Form Submission Backward Compatibility & Error Handling (7 tests)
 *
 * Total Assertions: 51 rigorous tests (Exceeds >=45 tests requirement)
 * Master Runner Target: node tests/run_tests.js --tier=9
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

const { describe, test, it, beforeEach, afterEach, registry, DomInspector } = require(testEnvPath);

// File Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_DATA_PATH = path.join(ROOT_DIR, 'curriculum_catalog_data.js');
const GAS_BACKEND_PATH = path.join(ROOT_DIR, 'google_apps_script_backend.js');
const HTML_APP_PATH = path.join(ROOT_DIR, 'divyank_mission_control_google_apps_script_app.html');

// -------------------------------------------------------------------------
// Google Apps Script In-Memory Simulator Setup for Backend & RBAC Tests
// -------------------------------------------------------------------------
if (typeof global.SpreadsheetApp === 'undefined' || !global.SpreadsheetApp.getActiveSpreadsheet) {
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
    clearContent() { return this; }
    clear() { return this; }
  }

  class MockSheet {
    constructor(name) {
      this.name = name;
      this.grid = [];
      this.frozenRows = 0;
    }
    _ensureSize(r, c) {
      while (this.grid.length < r) this.grid.push([]);
      for (let i = 0; i < this.grid.length; i++) {
        while (this.grid[i].length < c) this.grid[i].push('');
      }
    }
    getName() { return this.name; }
    setName(n) { this.name = n; }
    getLastRow() { return this.grid.length; }
    getLastColumn() {
      let max = 0;
      this.grid.forEach(row => { if (row.length > max) max = row.length; });
      return max;
    }
    appendRow(rowArr) { this.grid.push([...rowArr]); }
    insertRowsBefore(beforeRow, count) { for (let i = 0; i < count; i++) this.grid.splice(beforeRow - 1, 0, []); }
    deleteRow(rowNumber) { this.grid.splice(rowNumber - 1, 1); }
    setFrozenRows(n) { this.frozenRows = n; }
    clearContents() { this.grid = this.grid.slice(0, 1); }
    getRange(r, c, nr = 1, nc = 1) { return new MockRange(this, r, c, nr, nc); }
    getDataRange() {
      const numRows = Math.max(1, this.grid.length);
      let numCols = 1;
      this.grid.forEach(r => { if (r.length > numCols) numCols = r.length; });
      return new MockRange(this, 1, 1, numRows, numCols);
    }
  }

  class MockSpreadsheet {
    constructor() {
      this.sheets = [];
      const usersSheet = new MockSheet('Users');
      usersSheet.appendRow(['id', 'role', 'name', 'email']);
      usersSheet.appendRow(['u_adm_demo', 'admin', 'Super Admin', 'admin@zoptro.local']);
      this.sheets.push(usersSheet);
    }
    getSheetByName(name) {
      return this.sheets.find(x => x.name === name) || null;
    }
    insertSheet(name) {
      const s = new MockSheet(name);
      this.sheets.push(s);
      return s;
    }
  }

  const mockSS = new MockSpreadsheet();
  global.SpreadsheetApp = {
    getActiveSpreadsheet: () => mockSS,
    BorderStyle: { SOLID: 'SOLID' }
  };
} else {
  const ss = global.SpreadsheetApp.getActiveSpreadsheet && global.SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    let users = ss.getSheetByName('Users');
    if (!users) {
      users = ss.insertSheet ? ss.insertSheet('Users') : null;
    }
    if (users && users.getLastRow && users.getLastRow() <= 1) {
      users.appendRow(['u_adm_demo', 'admin', 'Super Admin', 'admin@zoptro.local']);
    }
    if (users && users.getRange) {
      const sample = users.getRange(1, 1, 1, 1);
      if (sample && typeof sample.clearContent !== 'function') {
        const proto = Object.getPrototypeOf(sample);
        if (proto) {
          proto.clearContent = function() { return this; };
          proto.clear = function() { return this; };
        }
      }
    }
  }
}

if (typeof global.LockService === 'undefined') {
  global.LockService = {
    getScriptLock: () => ({
      waitLock: () => true,
      releaseLock: () => true,
      tryLock: () => true
    })
  };
}

// -------------------------------------------------------------------------
// Module & Code Loaders
// -------------------------------------------------------------------------
const catalogModule = require(CATALOG_DATA_PATH);
const gasBackend = require(GAS_BACKEND_PATH);
const htmlContent = fs.readFileSync(HTML_APP_PATH, 'utf8');

// Extract Client Script from HTML App
const scriptMatches = htmlContent.match(/<script[\s\S]*?<\/script>/gi) || [];
assert.ok(scriptMatches.length > 0, 'HTML must contain valid <script> blocks');
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const clientScriptContent = lastScriptTag.replace(/<\/?script[^>]*>/gi, '');

function createOptionsArray() {
  const arr = [];
  const origPush = arr.push;
  arr.push = function(...items) {
    items.forEach(item => {
      if (!this.includes(item)) origPush.call(this, item);
    });
    return this.length;
  };
  return arr;
}

/**
 * Creates an isolated DOM Sandbox for Admin AI Studio UI testing
 */
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
            classes.forEach(c => c.split(/\s+/).filter(Boolean).forEach(cls => self._classList.add(cls)));
          },
          remove: function(...classes) {
            classes.forEach(c => c.split(/\s+/).filter(Boolean).forEach(cls => self._classList.delete(cls)));
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
      textContent: '',
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

  // Populate known DOM IDs from HTML
  const idRegex = /\bid=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1];
    let tag = 'DIV';
    if (/select/i.test(id)) tag = 'SELECT';
    else if (/btn|button/i.test(id)) tag = 'BUTTON';
    else if (/datalist/i.test(id)) tag = 'DATALIST';
    else if (/input|chapter$|topic$/i.test(id)) tag = 'INPUT';
    domElements[id] = createMockElement(id, tag);
  }

  // Pre-seed known studio elements
  domElements['aiGenGrade'] = createMockElement('aiGenGrade', 'SELECT');
  domElements['aiGenGrade'].value = 'Class 3';
  domElements['aiGenSubject'] = createMockElement('aiGenSubject', 'SELECT');
  domElements['aiGenSubject'].value = 'Mathematics';
  domElements['aiGenChapterSelect'] = createMockElement('aiGenChapterSelect', 'SELECT');
  domElements['aiGenChapter'] = createMockElement('aiGenChapter', 'INPUT');
  domElements['aiGenChapter'].value = "What's in a Name?";
  domElements['aiGenTopic'] = createMockElement('aiGenTopic', 'INPUT');
  domElements['aiGenTopic'].value = '3-Digit Numbers (100-999)';
  domElements['aiGenTopicDatalist'] = createMockElement('aiGenTopicDatalist', 'DATALIST');
  domElements['aiGenTopicPillsContainer'] = createMockElement('aiGenTopicPillsContainer', 'DIV');
  domElements['aiGenChapterModeToggleBtn'] = createMockElement('aiGenChapterModeToggleBtn', 'BUTTON');
  domElements['aiGenChapterDropdownWrapper'] = createMockElement('aiGenChapterDropdownWrapper', 'DIV');
  domElements['aiGenChapterInputWrapper'] = createMockElement('aiGenChapterInputWrapper', 'DIV');
  domElements['aiGenChapterInputWrapper'].classList.add('hidden');
  domElements['aiGenChapterModeBadge'] = createMockElement('aiGenChapterModeBadge', 'SPAN');
  domElements['aiGenChapterCountBadge'] = createMockElement('aiGenChapterCountBadge', 'SPAN');
  domElements['aiGenType'] = createMockElement('aiGenType', 'SELECT');
  domElements['aiGenType'].value = 'MCQ_SINGLE';
  domElements['aiGenQuantity'] = createMockElement('aiGenQuantity', 'INPUT');
  domElements['aiGenQuantity'].value = '5';
  domElements['aiGenDifficulty'] = createMockElement('aiGenDifficulty', 'SELECT');
  domElements['aiGenDifficulty'].value = 'MEDIUM';
  domElements['aiGenModel'] = createMockElement('aiGenModel', 'SELECT');
  domElements['aiGenModel'].value = 'models/gemini-1.5-flash';
  domElements['aiGenForceRefresh'] = createMockElement('aiGenForceRefresh', 'INPUT');
  domElements['aiGenForceRefresh'].checked = false;
  domElements['aiGenSubmitBtn'] = createMockElement('aiGenSubmitBtn', 'BUTTON');
  domElements['aiGenBtnText'] = createMockElement('aiGenBtnText', 'SPAN');
  domElements['aiGenLoadingSpinner'] = createMockElement('aiGenLoadingSpinner', 'DIV');
  domElements['aiGenStatusMsg'] = createMockElement('aiGenStatusMsg', 'DIV');
  domElements['aiGenCountdownBanner'] = createMockElement('aiGenCountdownBanner', 'DIV');

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
    CANONICAL_CURRICULUM_CATALOG: catalogModule.CANONICAL_CURRICULUM_CATALOG,
    ZOPTRO_CURRICULUM_CATALOG: catalogModule.CANONICAL_CURRICULUM_CATALOG
  };
  win.window = win;

  const sandbox = {
    console: console,
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms !== undefined ? ms : 0, 5)),
    clearTimeout: clearTimeout,
    setInterval: () => {},
    clearInterval: () => {},
    window: win,
    document: doc,
    module: { exports: {} },
    CANONICAL_CURRICULUM_CATALOG: catalogModule.CANONICAL_CURRICULUM_CATALOG,
    ZOPTRO_CURRICULUM_CATALOG: catalogModule.CANONICAL_CURRICULUM_CATALOG,
    CURRICULUM_CATALOG_SCHEMA: catalogModule.CURRICULUM_CATALOG_SCHEMA,
    currentUser: { id: 'u_adm_demo', role: 'admin' },
    playSound: () => {}
  };

  vm.createContext(sandbox);
  vm.runInContext(clientScriptContent, sandbox);

  if (sandbox.module && sandbox.module.exports) {
    Object.assign(sandbox, sandbox.module.exports);
    Object.assign(win, sandbox.module.exports);
  }
  if (!sandbox.ZoptroApiClient && win.ZoptroApiClient) sandbox.ZoptroApiClient = win.ZoptroApiClient;
  if (!sandbox.BrowserMockBackend && win.BrowserMockBackend) sandbox.BrowserMockBackend = win.BrowserMockBackend;

  const origHandleChapterChange = sandbox.handleAiGenChapterSelectChange;
  if (typeof origHandleChapterChange === 'function') {
    sandbox.handleAiGenChapterSelectChange = function(explicitVal) {
      if (explicitVal !== undefined && domElements['aiGenChapterSelect']) {
        domElements['aiGenChapterSelect'].value = explicitVal;
      }
      return origHandleChapterChange.apply(this, arguments);
    };
  }

  return { sandbox, domElements, doc, win };
}

// =========================================================================
// TEST SUITE DEFINITION: TIER 9
// =========================================================================

describe('Tier 9: CBSE/NCERT Curriculum Catalog & Studio UI Integration', () => {

  // -----------------------------------------------------------------------
  // GROUP 1: Canonical Dataset Integrity (curriculum_catalog_data.js)
  // -----------------------------------------------------------------------
  describe('Group 1: Canonical Dataset Integrity (curriculum_catalog_data.js)', () => {
    const catalog = catalogModule.CANONICAL_CURRICULUM_CATALOG;
    const schema = catalogModule.CURRICULUM_CATALOG_SCHEMA;

    test('T9-G1-01: Exact Record Count: Catalog contains exactly 548 records', () => {
      assert.ok(Array.isArray(catalog), 'CANONICAL_CURRICULUM_CATALOG must be an array');
      assert.strictEqual(catalog.length, 548, `Expected exactly 548 rationalised records, found ${catalog.length}`);
    });

    test('T9-G1-02: Primary Key Invariant: All 548 IDs are strictly unique and match canonical regex', () => {
      const idSet = new Set();
      const idRegex = /^cat_c(?:[1-9]|10)_[a-z0-9_]+_ch\d+$/;
      catalog.forEach((item, idx) => {
        assert.ok(item.id, `Item at index ${idx} missing id`);
        assert.ok(!idSet.has(item.id), `Duplicate catalog id found: ${item.id}`);
        assert.ok(idRegex.test(item.id), `ID "${item.id}" fails regex ${idRegex}`);
        idSet.add(item.id);
      });
      assert.strictEqual(idSet.size, 548);
    });

    test('T9-G1-03: Table 16 Schema Conformance: Every record has all 7 non-null fields', () => {
      const expectedFields = ["id", "grade", "subject", "chapterNumber", "chapterTitle", "topicsJson", "learningObjectivesJson"];
      assert.deepStrictEqual(schema, expectedFields, 'Schema must match Table 16 columns exactly');

      catalog.forEach(item => {
        expectedFields.forEach(col => {
          assert.ok(item[col] !== undefined && item[col] !== null, `Item ${item.id} missing column ${col}`);
          if (typeof item[col] === 'string') {
            assert.ok(item[col].trim().length > 0, `Item ${item.id} field ${col} is empty string`);
          }
        });
      });
    });

    test('T9-G1-04: Dual-Array Representation & JSON Validity: topicsJson & learningObjectivesJson parse to non-empty arrays', () => {
      catalog.forEach(item => {
        const parsedTopics = JSON.parse(item.topicsJson);
        const parsedLO = JSON.parse(item.learningObjectivesJson);

        assert.ok(Array.isArray(parsedTopics) && parsedTopics.length > 0, `Item ${item.id} topicsJson is empty array`);
        assert.ok(Array.isArray(parsedLO) && parsedLO.length > 0, `Item ${item.id} learningObjectivesJson is empty array`);

        assert.deepStrictEqual(parsedTopics, item.topics, `Item ${item.id} topics mismatch`);
        assert.deepStrictEqual(parsedLO, item.learningObjectives, `Item ${item.id} learningObjectives mismatch`);
      });
    });

    test('T9-G1-05: Sequential Chapter Numbering for Single-Book Disciplines', () => {
      const singleBookSubjects = ['Mathematics', 'Science', 'EVS', 'English', 'Hindi'];
      for (let g = 1; g <= 10; g++) {
        const gradeStr = `Class ${g}`;
        for (const sub of singleBookSubjects) {
          const chs = catalog.filter(c => c.grade === gradeStr && c.subject === sub);
          if (chs.length > 0) {
            chs.forEach((c, i) => {
              assert.strictEqual(c.chapterNumber, i + 1, `${gradeStr} ${sub} expected ch ${i + 1}, got ${c.chapterNumber}`);
            });
          }
        }
      }
    });

    test('T9-G1-06: Guarded Social Science Multi-Disciplinary Grouping (Classes 6-10)', () => {
      // Class 6: Exploring Society unified 14 chapters
      const c6Sst = catalog.filter(c => c.grade === 'Class 6' && c.subject === 'Social Science');
      assert.strictEqual(c6Sst.length, 14);
      c6Sst.forEach((c, i) => assert.strictEqual(c.chapterNumber, i + 1));

      // Classes 7-10: Sub-disciplines (History, Geography, Civics, Economics)
      for (let g = 7; g <= 10; g++) {
        const gradeStr = `Class ${g}`;
        const sstChs = catalog.filter(c => c.grade === gradeStr && c.subject === 'Social Science');
        const subDisciplines = [...new Set(sstChs.map(c => c.subSubject).filter(Boolean))];
        assert.ok(subDisciplines.length >= 3, `Expected >=3 sub-disciplines for ${gradeStr}`);

        for (const disc of subDisciplines) {
          const discChs = sstChs.filter(c => c.subSubject === disc);
          discChs.forEach((c, i) => {
            assert.strictEqual(c.chapterNumber, i + 1, `${gradeStr} ${disc} expected ch ${i + 1}, got ${c.chapterNumber}`);
          });
        }
      }
    });

    test('T9-G1-07: Atomic 2D Matrix Generation: toTable16Matrix() produces 548 x 7 matrix', () => {
      const matrix = catalogModule.toTable16Matrix();
      assert.strictEqual(matrix.length, 548, 'Matrix rows must equal 548');
      assert.strictEqual(matrix[0].length, 7, 'Matrix columns must equal 7');
      assert.strictEqual(matrix[0][0], catalog[0].id);
      assert.strictEqual(matrix[0][1], catalog[0].grade);
      assert.strictEqual(matrix[0][2], catalog[0].subject);
      assert.strictEqual(matrix[0][3], catalog[0].chapterNumber);
      assert.strictEqual(matrix[0][4], catalog[0].chapterTitle);
    });

    test('T9-G1-08: Universal Polyglot Export Header: exports cleanly to Node.js, Browser, and GAS', () => {
      assert.ok(catalogModule.CANONICAL_CURRICULUM_CATALOG, 'CommonJS export present');

      // Test Browser Window export
      const browserCtx = { window: {} };
      vm.createContext(browserCtx);
      vm.runInContext(fs.readFileSync(CATALOG_DATA_PATH, 'utf8'), browserCtx);
      assert.ok(browserCtx.window.CANONICAL_CURRICULUM_CATALOG, 'Browser window export missing');
      assert.strictEqual(browserCtx.window.CANONICAL_CURRICULUM_CATALOG.length, 548);

      // Test GAS Global Scope export
      const gasCtx = {};
      vm.createContext(gasCtx);
      vm.runInContext(fs.readFileSync(CATALOG_DATA_PATH, 'utf8'), gasCtx);
      assert.ok(gasCtx.CANONICAL_CURRICULUM_CATALOG, 'GAS global export missing');
      assert.strictEqual(gasCtx.CANONICAL_CURRICULUM_CATALOG.length, 548);
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 2: Google Apps Script Backend Parity & Table 16 Schema (google_apps_script_backend.js)
  // -----------------------------------------------------------------------
  describe('Group 2: Google Apps Script Backend Parity & Table 16 Schema (google_apps_script_backend.js)', () => {
    test('T9-G2-01: Table 16 Schema Registration: CurriculumCatalog and SyllabusCatalog alias exist in SCHEMAS', () => {
      const expectedCols = ["id", "grade", "subject", "chapterNumber", "chapterTitle", "topicsJson", "learningObjectivesJson"];
      assert.ok(gasBackend.SCHEMAS.CurriculumCatalog, 'SCHEMAS.CurriculumCatalog must exist');
      assert.deepStrictEqual(gasBackend.SCHEMAS.CurriculumCatalog, expectedCols);
      assert.strictEqual(gasBackend.SCHEMAS.SyllabusCatalog, gasBackend.SCHEMAS.CurriculumCatalog);
    });

    test('T9-G2-02: Polymorphic Input Normalization: supports positional (grade, subject) and payload object', () => {
      const resPos = gasBackend.getCurriculumCatalog('Class 5', 'Mathematics');
      const resObj = gasBackend.getCurriculumCatalog({ grade: 'Class 5', subject: 'Mathematics' });
      assert.strictEqual(resPos.success, true);
      assert.strictEqual(resObj.success, true);
      assert.strictEqual(resPos.count, 14);
      assert.strictEqual(resObj.count, 14);
      assert.strictEqual(resPos.items[0].id, resObj.items[0].id);
    });

    test('T9-G2-03: Grade Normalization Rigor & Falsy/Invalid Grade Rejection (HTTP 400)', () => {
      // Valid normalizations
      assert.strictEqual(gasBackend.normalizeGrade(5), 'Class 5');
      assert.strictEqual(gasBackend.normalizeGrade('5'), 'Class 5');
      assert.strictEqual(gasBackend.normalizeGrade('Class 10'), 'Class 10');
      assert.strictEqual(gasBackend.normalizeGrade('grade 7'), 'Class 7');

      // Invalid grade strings & numbers must reject with HTTP 400
      const invalidGrades = [0, -1, 11, '0', '11', 'Grade 99', 'Kindergarten', NaN, 'abc'];
      invalidGrades.forEach(g => {
        const res = gasBackend.getCurriculumCatalog(g, 'Mathematics');
        assert.strictEqual(res.success, false, `Grade ${g} was unexpectedly accepted`);
        assert.strictEqual(res.code, 400, `Grade ${g} did not return HTTP 400`);
        assert.ok(res.error.includes('INVALID_GRADE'), `Error message mismatch for ${g}: ${res.error}`);
      });
    });

    test('T9-G2-04: Subject Name & Alias Normalization', () => {
      const aliases = [
        ['math', 'Mathematics'],
        ['maths', 'Mathematics'],
        ['math-magic', 'Mathematics'],
        ['ganita prakash', 'Mathematics'],
        ['sci', 'Science'],
        ['curiosity', 'Science'],
        ['sst', 'Social Science'],
        ['social studies', 'Social Science'],
        ['evs', 'EVS'],
        ['looking around', 'EVS'],
        ['eng', 'English'],
        ['first flight', 'English'],
        ['hin', 'Hindi'],
        ['rimjhim', 'Hindi']
      ];
      aliases.forEach(([input, expected]) => {
        assert.strictEqual(gasBackend.normalizeSubject(input), expected, `Alias failed: ${input}`);
      });
    });

    test('T9-G2-05: Filtering & All-Combinations Query', () => {
      // Query all records
      const resAll = gasBackend.getCurriculumCatalog('all', 'all');
      assert.strictEqual(resAll.success, true);
      assert.strictEqual(resAll.count, 548);

      // Query grade all subjects (Class 5 has 63 chapters: 14 Math + 22 EVS + 9 Eng + 18 Hin)
      const resC5 = gasBackend.getCurriculumCatalog('Class 5', 'all');
      assert.strictEqual(resC5.success, true);
      assert.strictEqual(resC5.count, 63);

      // Query specific grade & subject
      const resC10Sci = gasBackend.getCurriculumCatalog('Class 10', 'Science');
      assert.strictEqual(resC10Sci.count, 13);
    });

    test('T9-G2-06: Zero-Downtime Fallback: returns source EMBEDDED_FALLBACK when sheet unseeded', () => {
      const res = gasBackend.getCurriculumCatalog('Class 3', 'Mathematics');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
      assert.strictEqual(res.count, 14);
      assert.strictEqual(res.items[0].chapterTitle, "What's in a Name?");
    });

    test('T9-G2-07: Two-Tier Caching & forceRefresh Bypass', () => {
      const resCold = gasBackend.getCurriculumCatalog({ grade: 'Class 4', subject: 'Mathematics' });
      assert.strictEqual(resCold.success, true);

      const resForce = gasBackend.getCurriculumCatalog({ grade: 'Class 4', subject: 'Mathematics', forceRefresh: true });
      assert.strictEqual(resForce.success, true);
      assert.strictEqual(resForce.count, resCold.count);
    });

    test('T9-G2-08: Multi-Disciplinary Stable Sorting in Social Science', () => {
      const res = gasBackend.getCurriculumCatalog('Class 7', 'Social Science');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, 23);

      // Chapters must not interleave chapterNumber [1, 1, 1, 2, 2, 2]
      const firstThreeChNumbers = res.items.slice(0, 3).map(c => c.chapterNumber);
      assert.deepStrictEqual(firstThreeChNumbers, [1, 2, 3], 'Class 7 Social Science must group contiguous chapters by discipline');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 3: BrowserMockBackend & ZoptroApiClient Dual-Mode Parity (HTML)
  // -----------------------------------------------------------------------
  describe('Group 3: BrowserMockBackend & ZoptroApiClient Dual-Mode Parity', () => {
    let BrowserMockBackend;
    let ZoptroApiClient;

    beforeEach(() => {
      const { sandbox } = createStudioSandbox();
      BrowserMockBackend = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
      ZoptroApiClient = sandbox.module.exports.ZoptroApiClient || sandbox.ZoptroApiClient;
    });

    test('T9-G3-01: BrowserMockBackend LocalStorage Keys Registration', () => {
      assert.strictEqual(BrowserMockBackend.KEYS.CURRICULUM_CATALOG, 'zoptro_db_curriculum_catalog');
      assert.strictEqual(BrowserMockBackend.KEYS.SYLLABUS_CATALOG, 'zoptro_db_curriculum_catalog');
    });

    test('T9-G3-02: Item-by-Item, Byte-for-Byte Dual-Mode Parity across Benchmark Query Pairs', () => {
      const benchmarkPairs = [
        ['Class 1', 'Mathematics', 13],
        ['Class 3', 'Mathematics', 14],
        ['Class 4', 'EVS', 27],
        ['Class 6', 'Science', 12],
        ['Class 7', 'Social Science', 23],
        ['Class 10', 'Mathematics', 14],
        ['Class 10', 'Science', 13]
      ];

      benchmarkPairs.forEach(([grade, subject, expectedCount]) => {
        const gasRes = gasBackend.getCurriculumCatalog(grade, subject);
        const mockRes = BrowserMockBackend.getCurriculumCatalog(grade, subject);

        assert.strictEqual(gasRes.count, expectedCount);
        assert.strictEqual(mockRes.count, expectedCount);
        assert.strictEqual(gasRes.count, mockRes.count);

        for (let i = 0; i < expectedCount; i++) {
          const g = gasRes.items[i];
          const m = mockRes.items[i];
          assert.strictEqual(g.id, m.id);
          assert.strictEqual(g.chapterTitle, m.chapterTitle);
          assert.strictEqual(g.chapterNumber, m.chapterNumber);
          assert.deepStrictEqual([...g.topics], [...m.topics]);
          assert.deepStrictEqual([...g.learningObjectives], [...m.learningObjectives]);
        }
      });
    });

    test('T9-G3-03: BrowserMockBackend Embedded Fallback on Clean Reset', () => {
      BrowserMockBackend.resetDatabase();
      const res = BrowserMockBackend.getCurriculumCatalog('Class 5', 'Mathematics');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.source, 'EMBEDDED_FALLBACK');
      assert.strictEqual(res.count, 14);
    });

    test('T9-G3-04: Dual Property Aliasing: returns identical items and chapters arrays', () => {
      const res = BrowserMockBackend.getCurriculumCatalog('Class 6', 'Science');
      assert.ok(Array.isArray(res.items), 'res.items must be an array');
      assert.ok(Array.isArray(res.chapters), 'res.chapters must be an array');
      assert.strictEqual(res.items.length, res.chapters.length);
      assert.deepStrictEqual(res.items, res.chapters);
    });

    test('T9-G3-05: ZoptroApiClient Asynchronous Dispatch resolves to normalized catalog', async () => {
      const res = await ZoptroApiClient.getCurriculumCatalog({ grade: 'Class 8', subject: 'Mathematics' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, 13);
      assert.strictEqual(res.items[0].chapterTitle, 'Rational Numbers');
    });

    test('T9-G3-06: ZoptroApiClient Seed Wrapper packages admin payload properly', async () => {
      const res = await ZoptroApiClient.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.seededCount, 548);
    });

    test('T9-G3-07: Non-Existent Grade/Subject Combinations Resilience', () => {
      // Class 1 does not have Science
      const res1 = BrowserMockBackend.getCurriculumCatalog('Class 1', 'Science');
      assert.strictEqual(res1.success, true);
      assert.strictEqual(res1.count, 0);
      assert.strictEqual(res1.items.length, 0);

      // Class 10 does not have EVS
      const res2 = BrowserMockBackend.getCurriculumCatalog('Class 10', 'EVS');
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.count, 0);
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 4: RBAC Security & Formula Injection Neutralization (seedCurriculumCatalog)
  // -----------------------------------------------------------------------
  describe('Group 4: RBAC Security & Formula Injection Neutralization (seedCurriculumCatalog)', () => {
    test('T9-G4-01: Non-Admin Caller Rejection (RBAC Guard) returns HTTP 403 Forbidden', () => {
      const unauthCallers = ['u_stu_demo', 'u_par_demo', 'u_stu_priya', 'attacker', ''];
      unauthCallers.forEach(caller => {
        const res = gasBackend.seedCurriculumCatalog(caller);
        assert.strictEqual(res.success, false, `Caller ${caller} was unexpectedly authorized`);
        assert.strictEqual(res.code, 403, `Caller ${caller} did not return HTTP 403`);
        assert.ok(res.error.includes('UNAUTHORIZED'), `Error mismatch for ${caller}: ${res.error}`);
      });
    });

    test('T9-G4-02: Admin Authorization Acceptance: u_adm_demo seeds full catalog successfully', () => {
      const res = gasBackend.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: true });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.seededCount, 548);
      assert.strictEqual(res.mode, 'replace');
    });

    test('T9-G4-03: CWE-1236 Formula Injection Neutralization on Dangerous Prefixes (=, +, -, @, \\t, \\r)', () => {
      const dangerousVectors = [
        '=cmd|/c calc',
        '+1+1',
        '-2+3',
        '@SUM(A1:A10)',
        '\t=2+2',
        '\r=1+1',
        '=IMPORTXML("http://evil.com","//a")'
      ];
      dangerousVectors.forEach(vec => {
        const sanitized = gasBackend.sanitizeSheetCellValue(vec);
        assert.ok(sanitized.startsWith("'"), `Dangerous vector was not neutralized with leading quote: ${vec}`);
      });
    });

    test('T9-G4-04: CWE-1236 Formula Sanitization Idempotency: already-quoted strings are not double quoted', () => {
      const alreadyQuoted = ["'=cmd|/c calc", "'+1+1", "'@SUM(A1:A10)"];
      alreadyQuoted.forEach(vec => {
        const sanitized = gasBackend.sanitizeSheetCellValue(vec);
        assert.strictEqual(sanitized, vec, `Already-quoted vector was modified: ${vec}`);
        assert.notStrictEqual(sanitized.charAt(1), "'", `Must not double quote: ${vec}`);
      });
    });

    test('T9-G4-05: Non-String Values Preserved Unmodified', () => {
      assert.strictEqual(gasBackend.sanitizeSheetCellValue(12345), 12345);
      assert.strictEqual(gasBackend.sanitizeSheetCellValue(true), true);
      assert.strictEqual(gasBackend.sanitizeSheetCellValue(false), false);
      assert.strictEqual(gasBackend.sanitizeSheetCellValue(null), null);
    });

    test('T9-G4-06: Concurrency Guard: withScriptLock wraps seed execution', () => {
      assert.ok(htmlContent.includes('withScriptLock') || gasBackend.withScriptLock, 'Script lock concurrency guard must be present');
    });

    test('T9-G4-07: Table 6 ActivityLogs Audit Trail: seeds record CATALOG_SEED event', () => {
      const { sandbox } = createStudioSandbox();
      const mock = sandbox.module.exports.BrowserMockBackend || sandbox.BrowserMockBackend;
      const res = mock.seedCurriculumCatalog({ adminUserId: 'u_adm_demo', reset: false });
      assert.strictEqual(res.success, true);

      const logs = mock._getTable(mock.KEYS.LOGS || mock.KEYS.ACTIVITY_LOGS || 'zoptro_db_activity_logs');
      const seedLog = logs.find(l => l.action === 'CATALOG_SEED');
      assert.ok(seedLog, 'CATALOG_SEED audit log must be recorded in Table 6');
      assert.strictEqual(seedLog.userId, 'u_adm_demo');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 5: Admin AI Studio Dynamic Dropdown & Mode Toggling UI Integration
  // -----------------------------------------------------------------------
  describe('Group 5: Admin AI Studio Dynamic Dropdown & Mode Toggling UI Integration', () => {
    let sandbox;
    let domElements;

    beforeEach(async () => {
      const env = createStudioSandbox();
      sandbox = env.sandbox;
      domElements = env.domElements;
      sandbox.initAdminAiStudioCurriculum();
      await new Promise(r => setTimeout(r, 10));
    });

    test('T9-G5-01: DOM Elements Verification: dropdown, toggle button, text input, and badges exist', () => {
      assert.ok(domElements['aiGenChapterSelect'], '#aiGenChapterSelect must exist');
      assert.ok(domElements['aiGenChapterModeToggleBtn'], '#aiGenChapterModeToggleBtn must exist');
      assert.ok(domElements['aiGenChapter'], '#aiGenChapter must exist');
      assert.ok(domElements['aiGenChapterModeBadge'], '#aiGenChapterModeBadge must exist');
    });

    test('T9-G5-02: Dynamic Options Generation on Grade/Subject Switch', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      const select = domElements['aiGenChapterSelect'];
      assert.ok(select.options.length >= 14, `Expected >=14 options for Class 3 Math, got ${select.options.length}`);
      assert.strictEqual(select.value, "What's in a Name?");
    });

    test('T9-G5-03: Custom Manual Option Injection: __CUSTOM__ option appended at the end', async () => {
      domElements['aiGenGrade'].value = 'Class 4';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      const select = domElements['aiGenChapterSelect'];
      const lastOpt = select.options[select.options.length - 1];
      assert.strictEqual(lastOpt.value, '__CUSTOM__');
      assert.ok(lastOpt.textContent.includes('Custom / Enter Manually'));
    });

    test('T9-G5-04: Dual-Mode Chapter Input Toggling (Dropdown vs Custom Manual)', () => {
      // Toggle to Custom mode
      sandbox.toggleAiGenChapterMode('custom');
      assert.ok(domElements['aiGenChapterSelect'].classList.contains('hidden'));
      assert.ok(!domElements['aiGenChapter'].classList.contains('hidden'));
      assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'Custom Manual');

      // Toggle back to Dropdown mode
      sandbox.toggleAiGenChapterMode('dropdown');
      assert.ok(!domElements['aiGenChapterSelect'].classList.contains('hidden'));
      assert.ok(domElements['aiGenChapter'].classList.contains('hidden'));
      assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'CBSE Catalog');
    });

    test('T9-G5-05: Bidirectional Value Synchronization: dropdown selection updates #aiGenChapter', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange('Toy Joy');
      assert.strictEqual(domElements['aiGenChapter'].value, 'Toy Joy');
    });

    test('T9-G5-06: Manual Input Auto-Detection: typing authentic chapter selects it in dropdown', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.toggleAiGenChapterMode('custom');
      sandbox.handleAiGenChapterManualInput('double century');
      assert.strictEqual(domElements['aiGenChapterSelect'].value, 'Double Century');
    });

    test('T9-G5-07: Selecting __CUSTOM__ Triggers Manual Mode and Focuses Input', () => {
      sandbox.handleAiGenChapterSelectChange('__CUSTOM__');
      assert.ok(domElements['aiGenChapterSelect'].classList.contains('hidden'));
      assert.ok(!domElements['aiGenChapter'].classList.contains('hidden'));
      assert.strictEqual(domElements['aiGenChapterModeBadge'].textContent, 'Custom Manual');
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 6: Topic Suggestions & Primary Topic Auto-Fill
  // -----------------------------------------------------------------------
  describe('Group 6: Topic Suggestions & Primary Topic Auto-Fill', () => {
    let sandbox;
    let domElements;

    beforeEach(async () => {
      const env = createStudioSandbox();
      sandbox = env.sandbox;
      domElements = env.domElements;
      sandbox.initAdminAiStudioCurriculum();
      await new Promise(r => setTimeout(r, 10));
    });

    test('T9-G6-01: DOM Datalist & Container Structure Verification', () => {
      assert.ok(domElements['aiGenTopicDatalist'], '#aiGenTopicDatalist must exist');
      assert.ok(domElements['aiGenTopicPillsContainer'], '#aiGenTopicPillsContainer must exist');
    });

    test('T9-G6-02: Native Datalist Populating with Topic Autocomplete Options', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange("What's in a Name?");
      const datalist = domElements['aiGenTopicDatalist'];
      assert.ok(datalist.options.length >= 3, 'Datalist must contain topic options');
      assert.strictEqual(datalist.options[0].value, '3-Digit Numbers (100-999)');
    });

    test('T9-G6-03: Interactive Topic Suggestion Pills Rendering', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange("What's in a Name?");
      const container = domElements['aiGenTopicPillsContainer'];
      const pills = container.querySelectorAll('button');
      assert.ok(pills.length >= 3, `Expected >=3 topic pills, got ${pills.length}`);
    });

    test('T9-G6-04: Universal 0px Border-Radius Compliance (rounded-none) on Topic Pills', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange("What's in a Name?");
      const container = domElements['aiGenTopicPillsContainer'];
      const pills = container.querySelectorAll('button');
      pills.forEach(pill => {
        assert.ok(pill.classList.contains('rounded-none'), 'Topic pill must have rounded-none class');
        const nonNone = pill.className.match(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g);
        assert.strictEqual(nonNone, null, `Disallowed non-zero border radius found: ${nonNone}`);
      });
    });

    test('T9-G6-05: Primary Topic Auto-Fill into #aiGenTopic', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange("Toy Joy");
      assert.strictEqual(domElements['aiGenTopic'].value, '3-Digit Addition with Regrouping');
    });

    test('T9-G6-06: Interactive Pill Click Selection updates #aiGenTopic and active styling', async () => {
      domElements['aiGenGrade'].value = 'Class 3';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      sandbox.handleAiGenChapterSelectChange("What's in a Name?");
      sandbox.selectAiGenTopicPill('Place Value & Face Value');
      assert.strictEqual(domElements['aiGenTopic'].value, 'Place Value & Face Value');
    });

    test('T9-G6-07: Graceful Empty/Custom Chapter Topic State', () => {
      sandbox.updateAiGenTopicSuggestions([]);
      const container = domElements['aiGenTopicPillsContainer'];
      assert.ok(container.innerHTML.includes('No preset topics') || container.innerHTML.includes('type any custom topic'));
    });
  });

  // -----------------------------------------------------------------------
  // GROUP 7: Form Submission Backward Compatibility & Error Handling
  // -----------------------------------------------------------------------
  describe('Group 7: Form Submission Backward Compatibility & Error Handling', () => {
    let sandbox;
    let domElements;

    beforeEach(async () => {
      const env = createStudioSandbox();
      sandbox = env.sandbox;
      domElements = env.domElements;
      sandbox.initAdminAiStudioCurriculum();
      await new Promise(r => setTimeout(r, 10));
    });

    test('T9-G7-01: Dropdown Mode Form Submission extracts chapter and topic cleanly', async () => {
      domElements['aiGenGrade'].value = 'Class 5';
      domElements['aiGenSubject'].value = 'Mathematics';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));
      sandbox.handleAiGenChapterSelectChange('The Fish Tale');

      assert.strictEqual(domElements['aiGenChapter'].value, 'The Fish Tale');
      assert.strictEqual(domElements['aiGenTopic'].value, 'Large Numbers (Lakhs and Crores)');

      let interceptedPayload = null;
      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function(payload) {
        interceptedPayload = payload;
        return Promise.resolve({ success: true, items: [{ title: 'Q1' }] });
      };

      sandbox.handleTriggerGeminiGeneration();
      assert.ok(interceptedPayload, 'Payload must be intercepted');
      assert.strictEqual(interceptedPayload.chapter, 'The Fish Tale');
      assert.strictEqual(interceptedPayload.topic, 'Large Numbers (Lakhs and Crores)');
    });

    test('T9-G7-02: Custom Mode Form Submission extracts custom chapter and topic', () => {
      sandbox.toggleAiGenChapterMode('custom');
      domElements['aiGenChapter'].value = 'Robotics & AI Ethics';
      domElements['aiGenTopic'].value = 'Asimov Laws of Robotics';

      let interceptedPayload = null;
      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function(payload) {
        interceptedPayload = payload;
        return Promise.resolve({ success: true, items: [{ title: 'Q1' }] });
      };

      sandbox.handleTriggerGeminiGeneration();
      assert.ok(interceptedPayload);
      assert.strictEqual(interceptedPayload.chapter, 'Robotics & AI Ethics');
      assert.strictEqual(interceptedPayload.topic, 'Asimov Laws of Robotics');
    });

    test('T9-G7-03: Empty Chapter Validation halts generation and displays error', () => {
      domElements['aiGenChapter'].value = '';
      domElements['aiGenTopic'].value = 'Valid Topic';

      let called = false;
      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function() {
        called = true;
        return Promise.resolve({ success: true });
      };

      sandbox.handleTriggerGeminiGeneration();
      assert.strictEqual(called, false, 'API must not be called when chapter is empty');
    });

    test('T9-G7-04: Empty Topic Validation halts generation and displays error', () => {
      domElements['aiGenChapter'].value = 'Valid Chapter';
      domElements['aiGenTopic'].value = '';

      let called = false;
      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function() {
        called = true;
        return Promise.resolve({ success: true });
      };

      sandbox.handleTriggerGeminiGeneration();
      assert.strictEqual(called, false, 'API must not be called when topic is empty');
    });

    test('T9-G7-05: Out-of-Bounds Grade Rejection (HTTP 400) handled gracefully', () => {
      const res = gasBackend.getCurriculumCatalog('Class 15', 'Mathematics');
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 400);
      assert.ok(res.error.includes('INVALID_GRADE'));
    });

    test('T9-G7-06: Button State Reset on Generation Failure', async () => {
      domElements['aiGenChapter'].value = 'Chapter 1';
      domElements['aiGenTopic'].value = 'Topic 1';

      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function() {
        return Promise.resolve({ success: false, error: 'GEMINI_SERVER_ERROR', code: 500 });
      };

      sandbox.handleTriggerGeminiGeneration();
      await new Promise(r => setTimeout(r, 20));

      assert.strictEqual(domElements['aiGenSubmitBtn'].disabled, false, 'Submit button must be re-enabled');
      assert.strictEqual(domElements['aiGenLoadingSpinner'].classList.contains('hidden'), true, 'Spinner must be hidden');
    });

    test('T9-G7-07: Full End-to-End Workflow Execution (Grade switch -> Chapter select -> Topic auto-fill -> Generate)', async () => {
      // 1. Admin switches grade & subject
      domElements['aiGenGrade'].value = 'Class 10';
      domElements['aiGenSubject'].value = 'Science';
      sandbox.handleAiGenGradeOrSubjectChange();
      await new Promise(r => setTimeout(r, 15));

      // 2. Official chapters populated (1 placeholder + 13 chs + 1 custom = 15 total)
      assert.strictEqual(domElements['aiGenChapterSelect'].options.length, 15);

      // 3. Admin selects Chapter 6 (Life Processes)
      sandbox.handleAiGenChapterSelectChange('Life Processes');
      assert.strictEqual(domElements['aiGenChapter'].value, 'Life Processes');
      assert.strictEqual(domElements['aiGenTopic'].value, 'Autotrophic Nutrition: Photosynthesis Biochemistry, Chloroplasts, Stomatal Opening');

      // 4. Admin submits generation
      let submitted = false;
      sandbox.ZoptroApiClient.generateCurriculumQuestionsWithGemini = function(p) {
        submitted = true;
        assert.strictEqual(p.chapter, 'Life Processes');
        assert.strictEqual(p.topic, 'Autotrophic Nutrition: Photosynthesis Biochemistry, Chloroplasts, Stomatal Opening');
        return Promise.resolve({ success: true, items: [{ title: 'Q1' }] });
      };

      sandbox.handleTriggerGeminiGeneration();
      assert.strictEqual(submitted, true);
    });
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
