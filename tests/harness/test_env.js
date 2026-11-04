/**
 * =========================================================================
 * ZOPTRO E2E TEST HARNESS - ENVIRONMENT & ASSERTION UTILITIES
 * =========================================================================
 * Provides:
 * - Pure Node.js test runner harness (describe, it, test, beforeEach, afterEach)
 * - Structured test result aggregation and tier-based reporting
 * - Mock DOM / HTML inspection helpers for Brand & Geometry validation
 * - In-memory persistent LocalStorage simulation
 * - Standard assertion helpers
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

// -------------------------------------------------------------------------
// Global Test Suite Registry & State
// -------------------------------------------------------------------------
class TestRegistry {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.currentBeforeEach = [];
    this.currentAfterEach = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0
    };
  }

  describe(name, fn) {
    const parentSuite = this.currentSuite;
    const suite = {
      name,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      parent: parentSuite
    };
    this.suites.push(suite);
    this.currentSuite = suite;

    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  _collectHooks(suite, hookName, reverse = false) {
    const hooks = [];
    let curr = suite;
    while (curr) {
      if (curr[hookName] && curr[hookName].length > 0) {
        if (reverse) {
          hooks.push(...curr[hookName]);
        } else {
          hooks.unshift(...curr[hookName]);
        }
      }
      curr = curr.parent;
    }
    return hooks;
  }

  test(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }
    this.currentSuite.tests.push({
      name,
      fn,
      suiteName: this.currentSuite.name,
      beforeEachHooks: this._collectHooks(this.currentSuite, 'beforeEachHooks', false),
      afterEachHooks: this._collectHooks(this.currentSuite, 'afterEachHooks', true)
    });
    this.stats.total++;
  }

  async run(options = {}) {
    const startTime = Date.now();
    const results = [];
    const verbose = options.verbose ?? true;

    for (const suite of this.suites) {
      if (suite.tests.length === 0) continue;
      if (verbose) {
        console.log(`\n  \x1b[1m\x1b[36m${suite.name}\x1b[0m`);
      }

      for (const test of suite.tests) {
        const testStartTime = Date.now();
        let error = null;

        try {
          // Execute beforeEach hooks
          for (const hook of test.beforeEachHooks) {
            await hook();
          }

          // Execute test
          await test.fn();

          // Execute afterEach hooks
          for (const hook of test.afterEachHooks) {
            await hook();
          }

          this.stats.passed++;
          const duration = Date.now() - testStartTime;
          if (verbose) {
            console.log(`    \x1b[32m✔\x1b[0m \x1b[90m${test.name}\x1b[0m \x1b[33m(${duration}ms)\x1b[0m`);
          }
          results.push({ name: test.name, suite: suite.name, status: 'PASSED', duration });
        } catch (err) {
          this.stats.failed++;
          const duration = Date.now() - testStartTime;
          error = err;
          if (verbose) {
            console.log(`    \x1b[31m✖\x1b[0m \x1b[1m\x1b[31m${test.name}\x1b[0m \x1b[33m(${duration}ms)\x1b[0m`);
            console.log(`      \x1b[31m${err.message}\x1b[0m`);
            if (options.debug && err.stack) {
              console.log(`      \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n      ')}\x1b[0m`);
            }
          }
          results.push({ name: test.name, suite: suite.name, status: 'FAILED', duration, error: err.message });
        }
      }
    }

    this.stats.durationMs = Date.now() - startTime;
    return {
      stats: { ...this.stats },
      results
    };
  }

  reset() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 };
  }
}

// -------------------------------------------------------------------------
// In-Memory LocalStorage Mock
// -------------------------------------------------------------------------
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    const val = this.store.get(String(key));
    return val !== undefined ? val : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

// -------------------------------------------------------------------------
// HTML & DOM Inspection Utilities (Static Analysis for Brand & 90° Geometry)
// -------------------------------------------------------------------------
class DomInspector {
  constructor(htmlContent) {
    this.html = htmlContent || '';
  }

  static fromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return new DomInspector(content);
  }

  hasText(pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(this.html);
    }
    return this.html.includes(pattern);
  }

  countMatches(pattern) {
    if (typeof pattern === 'string') {
      let count = 0;
      let pos = 0;
      while ((pos = this.html.indexOf(pattern, pos)) !== -1) {
        count++;
        pos += pattern.length;
      }
      return count;
    }
    const matches = this.html.match(new RegExp(pattern, 'g'));
    return matches ? matches.length : 0;
  }

  extractHead() {
    const match = this.html.match(/<head[\s\S]*?<\/head>/i);
    return match ? match[0] : '';
  }

  extractStyles() {
    const styleMatches = this.html.match(/<style[\s\S]*?<\/style>/gi) || [];
    return styleMatches.join('\n');
  }

  extractTailwindConfig() {
    const match = this.html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\n\s*\};?)/i);
    if (!match) return null;
    try {
      // Clean trailing semicolon if present
      let rawObj = match[1].trim().replace(/;$/, '');
      // Evaluate in safe VM
      const fn = new Function(`return (${rawObj});`);
      return fn();
    } catch {
      return null;
    }
  }

  findTagsWithClass(className) {
    const regex = new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, 'gi');
    return this.html.match(regex) || [];
  }

  checkBrandColors() {
    // Primary palette
    const colors = {
      authorityBlue: /#09293D/i.test(this.html),
      clarityIvory: /#F4F2EA/i.test(this.html),
      groundedOlive: /#666D57/i.test(this.html),
      progressOrange: /#F65800/i.test(this.html)
    };
    return colors;
  }

  checkTypography() {
    return {
      hasOutfitFont: /Outfit/i.test(this.html),
      hasFigtreeFont: /Figtree/i.test(this.html),
      hasGoogleFontLink: /fonts\.googleapis\.com[\s\S]*?(Outfit|Figtree)/i.test(this.html)
    };
  }

  checkZeroBorderRadius() {
    const styles = this.extractStyles();
    return {
      hasZeroBorderRadiusCss: /border-radius:\s*0(px)?\s*!important/i.test(styles),
      hasRoundedNoneInTailwind: /rounded-none/i.test(this.html)
    };
  }

  checkNoForbiddenNeonGlows() {
    // Check for glow classes or cyber neon styles
    const neonGlowMatches = this.html.match(/\bglow-(cyan|neon|gold)\b/gi) || [];
    return {
      hasNoNeonGlows: neonGlowMatches.length === 0,
      forbiddenMatches: neonGlowMatches
    };
  }
}

// -------------------------------------------------------------------------
// Module Exports
// -------------------------------------------------------------------------
const registry = new TestRegistry();

module.exports = {
  describe: (name, fn) => registry.describe(name, fn),
  test: (name, fn) => registry.test(name, fn),
  it: (name, fn) => registry.test(name, fn),
  beforeEach: (fn) => registry.beforeEach(fn),
  afterEach: (fn) => registry.afterEach(fn),
  registry,
  assert,
  MockLocalStorage,
  DomInspector
};
