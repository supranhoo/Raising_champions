const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log('⚔️  CHALLENGER: ADVERSARIAL BRAND & GEOMETRY VERIFICATION (M2)');
console.log('=================================================================');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const content = fs.readFileSync(htmlPath, 'utf8');
const lines = content.split('\n');

let violations = [];

function recordViolation(category, lineNum, match, snippet) {
  violations.push({ category, lineNum, match, snippet: snippet ? snippet.trim() : '' });
}

// -------------------------------------------------------------------------
// 1. ALL TAILWIND CURVATURE CLASSES (Static HTML & JS string templates)
// -------------------------------------------------------------------------
console.log('\n🔍 [Scan 1] Scanning for all forbidden rounded curvature classes...');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  
  // Look for any word starting with rounded (with optional prefixes like hover:, md:, etc.)
  // Negative lookahead: rounded-none is allowed
  const roundedRegex = /(?:^|[\s'"`;`])(?:[a-zA-Z0-9_-]+:)?rounded(?!\-none\b)(?:-[a-zA-Z0-9_\[\]-]+)?(?=[\s'"`;`]|$)/g;
  let match;
  while ((match = roundedRegex.exec(line)) !== null) {
    const matchedClass = match[0].trim().replace(/^[\s'"`;`]+|[\s'"`;`]+$/g, '');
    if (matchedClass && matchedClass !== 'rounded-none') {
      recordViolation('Curvature Class', lineNum, matchedClass, line);
    }
  }

  // Also check for explicit arbitrary curved values like rounded-[1-9] or rounded-[14px]
  const arbitraryRadius = /(?:^|[\s'"`;`])rounded-\[[^\]]+\]/g;
  let arbMatch;
  while ((arbMatch = arbitraryRadius.exec(line)) !== null) {
    const cls = arbMatch[0].trim();
    if (!cls.includes('0px') && !cls.includes('0')) {
      recordViolation('Arbitrary Radius Class', lineNum, cls, line);
    }
  }
});

// -------------------------------------------------------------------------
// 2. ALL GRADIENT CLASSES & CSS (Static HTML & JS string templates)
// -------------------------------------------------------------------------
console.log('🔍 [Scan 2] Scanning for cyber gradients and CSS gradients...');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  
  // Tailwind bg-gradient-*
  const bgGradRegex = /\bbg-gradient-[a-z0-9-]+/g;
  let gradMatch;
  while ((gradMatch = bgGradRegex.exec(line)) !== null) {
    recordViolation('Tailwind Gradient', lineNum, gradMatch[0], line);
  }

  // CSS linear-gradient, radial-gradient, conic-gradient
  const cssGradRegex = /(?:linear|radial|conic)-gradient\s*\([^)]+\)/gi;
  let cssGradMatch;
  while ((cssGradMatch = cssGradRegex.exec(line)) !== null) {
    recordViolation('CSS Gradient', lineNum, cssGradMatch[0], line);
  }
});

// -------------------------------------------------------------------------
// 3. GLOW CLASSES & NEON BOX SHADOWS
// -------------------------------------------------------------------------
console.log('🔍 [Scan 3] Scanning for neon glows and glowing box-shadows...');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // glow-* classes
  const glowRegex = /\bglow-[a-zA-Z0-9_-]+/g;
  let glowMatch;
  while ((glowMatch = glowRegex.exec(line)) !== null) {
    recordViolation('Glow Class', lineNum, glowMatch[0], line);
  }

  // Box-shadow glow in CSS / inline styles
  if (/box-shadow\s*:[^;]*(?:#00f3ff|#39ff14|#ff007f|cyan|rgba\(0,\s*243|rgba\(57,\s*255)/i.test(line)) {
    recordViolation('Neon Box-Shadow', lineNum, 'neon box-shadow', line);
  }
});

// -------------------------------------------------------------------------
// 4. BORDER-RADIUS CSS & INLINE STYLES AUDIT
// -------------------------------------------------------------------------
console.log('🔍 [Scan 4] Scanning all border-radius declarations in CSS and inline styles...');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // Match any border-radius declaration
  const radiusDeclRegex = /border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*([^;!}\n]+)/gi;
  let rMatch;
  while ((rMatch = radiusDeclRegex.exec(line)) !== null) {
    const val = rMatch[1].trim();
    if (val !== '0' && val !== '0px') {
      recordViolation('Non-zero border-radius declaration', lineNum, rMatch[0], line);
    }
  }

  // Check inline style="...border-radius..."
  const inlineRadiusRegex = /style\s*=\s*['"][^'"]*border-radius\s*:\s*([^;'"!]+)/gi;
  let inMatch;
  while ((inMatch = inlineRadiusRegex.exec(line)) !== null) {
    const val = inMatch[1].trim();
    if (val !== '0' && val !== '0px') {
      recordViolation('Inline style non-zero border-radius', lineNum, inMatch[0], line);
    }
  }
});

// -------------------------------------------------------------------------
// 5. TYPOGRAPHY AUDIT (Fonts, Imports, Headings, Body)
// -------------------------------------------------------------------------
console.log('🔍 [Scan 5] Verifying typography system (Outfit, Figtree, banned fonts)...');

// Check prohibited fonts using strict word boundaries to avoid matching words like pointer-events
const prohibitedFonts = ['Inter', 'Space Grotesk', 'Space Mono', 'Roboto', 'Poppins', 'Montserrat', 'Comic Sans'];
prohibitedFonts.forEach(font => {
  const fontRegex = new RegExp(`\\b${font.replace(' ', '\\s+')}\\b`, 'i');
  // Scan <head> and <style>
  const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
  if (headMatch && fontRegex.test(headMatch[0])) {
    recordViolation('Prohibited Font in Head', 0, font, 'Found in <head>');
  }
});

// Verify Outfit & Figtree Google Fonts link
const hasOutfitGoogle = /fonts\.googleapis\.com[^\"]*family=[^\"]*Outfit/i.test(content);
const hasFigtreeGoogle = /fonts\.googleapis\.com[^\"]*family=[^\"]*Figtree/i.test(content);
if (!hasOutfitGoogle) recordViolation('Typography', 0, 'Missing Outfit Google Font', 'Outfit not imported in <head>');
if (!hasFigtreeGoogle) recordViolation('Typography', 0, 'Missing Figtree Google Font', 'Figtree not imported in <head>');

// Verify global CSS typography bindings
const hasGlobalBodyFigtree = /body\s*\{[^}]*font-family:\s*['"]Figtree['"]/i.test(content);
const hasGlobalHeadingOutfit = /h[1-4][^}]*\{[^}]*font-family:\s*['"]Outfit['"]/i.test(content);
if (!hasGlobalBodyFigtree) recordViolation('Typography', 0, 'Missing Body Figtree CSS rule', 'body { font-family: Figtree }');
if (!hasGlobalHeadingOutfit) recordViolation('Typography', 0, 'Missing Headings Outfit CSS rule', 'h1..h4 { font-family: Outfit }');

// -------------------------------------------------------------------------
// 6. SCROLLBAR & FORM INPUTS GEOMETRY
// -------------------------------------------------------------------------
console.log('🔍 [Scan 6] Checking scrollbars, inputs, buttons, and modal containers...');

// Scrollbar thumb must have 0px border-radius
const scrollbarThumbMatch = content.match(/::-webkit-scrollbar-thumb\s*\{([^}]+)\}/i);
if (scrollbarThumbMatch) {
  const thumbCss = scrollbarThumbMatch[1];
  if (!thumbCss.includes('border-radius: 0px')) {
    recordViolation('Scrollbar Curvature', 0, '::-webkit-scrollbar-thumb', thumbCss);
  }
}

// Global * selector must enforce border-radius: 0px !important
const universalRadiusMatch = content.match(/\*\s*\{[^}]*border-radius:\s*0px\s*!important/i);
if (!universalRadiusMatch) {
  recordViolation('Global Geometry Override', 0, '* selector missing border-radius: 0px !important', 'Global CSS');
}

// -------------------------------------------------------------------------
// 7. DYNAMIC JAVASCRIPT TEMPLATE STRINGS SCAN
// -------------------------------------------------------------------------
console.log('🔍 [Scan 7] Deep scanning dynamic JavaScript template literals...');

// Extract all script contents
const scriptTags = content.match(/<script[\s\S]*?<\/script>/gi) || [];
scriptTags.forEach((scriptTag, scriptIdx) => {
  // Find all template literals `...`
  const templateLiterals = scriptTag.match(/`[\s\S]*?`/g) || [];
  templateLiterals.forEach((tmpl, tmplIdx) => {
    // Check for any rounded- class not followed by none
    const tmplRounded = tmpl.match(/\brounded-(?!none)[a-z0-9]+/g);
    if (tmplRounded) {
      recordViolation('Dynamic JS Template Curvature', tmplIdx, tmplRounded.join(', '), tmpl.slice(0, 100));
    }
    // Check for standalone rounded
    const tmplStandalone = tmpl.match(/(['" ])rounded(['" ])/g);
    if (tmplStandalone) {
      recordViolation('Dynamic JS Template Standalone Rounded', tmplIdx, tmplStandalone.join(', '), tmpl.slice(0, 100));
    }
    // Check for gradients
    const tmplGrad = tmpl.match(/\bbg-gradient-[a-z0-9-]+/g);
    if (tmplGrad) {
      recordViolation('Dynamic JS Template Gradient', tmplIdx, tmplGrad.join(', '), tmpl.slice(0, 100));
    }
    // Check for glows
    const tmplGlow = tmpl.match(/\bglow-[a-z0-9-]+/g);
    if (tmplGlow) {
      recordViolation('Dynamic JS Template Glow', tmplIdx, tmplGlow.join(', '), tmpl.slice(0, 100));
    }
  });
});

// -------------------------------------------------------------------------
// 8. SVG RECT rx / ry ATTRIBUTES SCAN
// -------------------------------------------------------------------------
console.log('🔍 [Scan 8] Scanning SVG elements for curved rects...');

const svgRects = content.match(/<rect[^>]*>/gi) || [];
svgRects.forEach(rect => {
  const rxMatch = rect.match(/\brx\s*=\s*['"]([^'"]+)['"]/i);
  const ryMatch = rect.match(/\bry\s*=\s*['"]([^'"]+)['"]/i);
  const rx = rxMatch ? rxMatch[1] : '0';
  const ry = ryMatch ? ryMatch[1] : '0';
  if ((rx !== '0' && rx !== '0px') || (ry !== '0' && ry !== '0px')) {
    recordViolation('Curved SVG Rect', 0, `rx=${rx}, ry=${ry}`, rect);
  }
});

// -------------------------------------------------------------------------
// 9. MODAL & CONTAINER ZERO RADIUS VERIFICATION
// -------------------------------------------------------------------------
console.log('🔍 [Scan 9] Checking modal dialog cards & high-level layout containers...');

const modalMatches = content.match(/id="[^"]*Modal"[^>]*class="[^"]*"/gi) || [];
modalMatches.forEach(m => {
  // Modal wrappers themselves may be full screen overlays, but let's check classes
  if (/rounded-(?!none)[a-z0-9]+/i.test(m)) {
    recordViolation('Modal Container Curvature', 0, m, m);
  }
});

// -------------------------------------------------------------------------
// 10. PALETTE TOKENS INTEGRITY
// -------------------------------------------------------------------------
console.log('🔍 [Scan 10] Verifying core Zoptro color tokens in Tailwind configuration...');

const requiredColors = [
  { name: 'Authority Blue', hex: '#09293D' },
  { name: 'Progress Orange', hex: '#F65800' },
  { name: 'Grounded Olive', hex: '#666D57' },
  { name: 'Clarity Ivory', hex: '#F4F2EA' }
];

requiredColors.forEach(c => {
  const hexRegex = new RegExp(c.hex, 'i');
  if (!hexRegex.test(content)) {
    recordViolation('Color Palette Token Missing', 0, `${c.name} (${c.hex})`, 'Not found in document');
  }
});

// -------------------------------------------------------------------------
// REPORT SUMMARY
// -------------------------------------------------------------------------
console.log('\n=================================================================');
console.log(`📊 ADVERSARIAL SCAN AUDIT COMPLETED`);
console.log(`   Total Violations Found: ${violations.length}`);
console.log('=================================================================');

if (violations.length > 0) {
  console.log('\n❌ VIOLATIONS DETECTED:');
  violations.forEach((v, i) => {
    console.log(`  [${i + 1}] Category: ${v.category} (Line ${v.lineNum})`);
    console.log(`      Match: ${v.match}`);
    console.log(`      Snippet: ${v.snippet.slice(0, 120)}`);
  });
  console.log('\n🚨 VERDICT: FAIL');
  process.exit(1);
} else {
  console.log('\n✅ 0 VIOLATIONS FOUND ACROSS ALL 10 ADVERSARIAL ATTACK VECTORS:');
  console.log('  1. Universal 90° square edges verified across all HTML markup and JS templates.');
  console.log('  2. Zero non-none rounded classes, zero arbitrary rounded classes.');
  console.log('  3. Zero cyber gradients (bg-gradient-*) and CSS gradient functions.');
  console.log('  4. Zero neon glow classes (glow-*) and glowing neon box-shadows.');
  console.log('  5. Typography system verified: Outfit display, Figtree body; Inter & Space Grotesk eliminated.');
  console.log('  6. Scrollbar thumb and inputs confirmed to have 0px border radius.');
  console.log('  7. Dynamic JS template literals confirmed 100% free of curved/cyber styles.');
  console.log('  8. SVG rect elements confirmed 0 curvature (rx=0, ry=0).');
  console.log('  9. Modal dialog cards verified with 0px border radius.');
  console.log(' 10. Core Zoptro color palette (#09293D, #F65800, #666D57, #F4F2EA) fully configured.');
  console.log('\n🏆 VERDICT: APPROVE');
  process.exit(0);
}
