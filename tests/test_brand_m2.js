const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const content = fs.readFileSync(htmlPath, 'utf8');
const lines = content.split('\n');

console.log('=================================================================');
console.log('🎨 MILESTONE 2: ZOPTRO BRAND SYSTEM & GEOMETRY VERIFICATION');
console.log('=================================================================');

// 1. Google Fonts Outfit and Figtree
const hasOutfit = /family=Outfit/i.test(content);
const hasFigtree = /family=Figtree/i.test(content);
const hasInter = /fonts\.googleapis\.com[^\"]*family=[^\"]*Inter/i.test(content);
const hasSpaceGrotesk = /Space Grotesk/i.test(content);

assert.ok(hasOutfit, 'Google Fonts Outfit must be imported for headings/display');
assert.ok(hasFigtree, 'Google Fonts Figtree must be imported for body/UI');
assert.strictEqual(hasInter, false, 'Inter font must be completely eliminated');
assert.strictEqual(hasSpaceGrotesk, false, 'Space Grotesk font must be completely eliminated');
console.log('  ✅ PASS: Google Fonts Outfit (display) and Figtree (body) active, Inter/Space Grotesk eliminated');

// 2. Tailwind Configuration Verification
const hasTailwindFontFamily = /fontFamily\s*:\s*\{[^}]*display\s*:\s*\[['"]Outfit['"]/i.test(content) &&
                              /fontFamily\s*:\s*\{[^}]*sans\s*:\s*\[['"]Figtree['"]/i.test(content);
assert.ok(hasTailwindFontFamily, 'Tailwind config must define display: [Outfit] and sans: [Figtree]');

const hasTailwindZeroRadius = /borderRadius\s*:\s*\{[^}]*DEFAULT\s*:\s*['"]0px['"]/i.test(content);
assert.ok(hasTailwindZeroRadius, 'Tailwind config must enforce borderRadius: 0px');

const hasTailwindBrandPalette = /['"]#09293D['"]/i.test(content) && // Authority Blue
                                /['"]#F65800['"]/i.test(content) && // Progress Orange
                                /['"]#666D57['"]/i.test(content) && // Grounded Olive
                                /['"]#F4F2EA['"]/i.test(content);   // Clarity Ivory
assert.ok(hasTailwindBrandPalette, 'Tailwind config must define full Zoptro brand palette (#09293D, #F65800, #666D57, #F4F2EA)');
console.log('  ✅ PASS: Tailwind typography, borderRadius (0px), and Zoptro palette configured');

// 3. Universal 0px border radius in Global CSS
const hasGlobalZeroRadius = /\*\s*\{[^}]*border-radius:\s*0px\s*!important/i.test(content);
assert.ok(hasGlobalZeroRadius, 'Global CSS must enforce * { border-radius: 0px !important; }');
console.log('  ✅ PASS: Global CSS enforces * { border-radius: 0px !important; }');

// 4. Rounded and Curvature Classes Audit
const nonNoneRounded = [];
const standaloneRounded = [];
const gradientClasses = [];
const glowClasses = [];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const rMatches = line.match(/\brounded-(?!none)[a-z0-9]+/g);
  if (rMatches) {
    nonNoneRounded.push({ line: lineNum, matches: rMatches, text: line.trim() });
  }
  const sMatches = line.match(/(['" ])rounded(['" ])/g);
  if (sMatches) {
    standaloneRounded.push({ line: lineNum, matches: sMatches, text: line.trim() });
  }
  const gMatches = line.match(/\bbg-gradient-[a-z0-9-]+/g);
  if (gMatches) {
    gradientClasses.push({ line: lineNum, matches: gMatches, text: line.trim() });
  }
  const glowMatches = line.match(/\bglow-(cyan|neon|gold)/g);
  if (glowMatches) {
    glowClasses.push({ line: lineNum, matches: glowMatches, text: line.trim() });
  }
});

assert.strictEqual(nonNoneRounded.length, 0, `Forbidden non-none rounded classes found: ${nonNoneRounded.length}`);
assert.strictEqual(standaloneRounded.length, 0, `Forbidden standalone rounded classes found: ${standaloneRounded.length}`);
assert.strictEqual(gradientClasses.length, 0, `Forbidden cyber gradients found: ${gradientClasses.length}`);
assert.strictEqual(glowClasses.length, 0, `Forbidden neon glow classes found: ${glowClasses.length}`);

console.log('  ✅ PASS: Universal 90° square edges verified (0 non-none rounded classes, only rounded-none)');
console.log('  ✅ PASS: Eradicated all cyber gradients (0 bg-gradient-*) and neon glows (0 glow-*)');
console.log('  ✅ PASS: 100% Brand compliance verified!');
console.log('=================================================================');
console.log('🎉 ALL MILESTONE 2 BRAND SYSTEM INVARIANTS SATISFIED (0 VIOLATIONS)');
console.log('=================================================================');
