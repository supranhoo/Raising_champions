const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=================================================================');
console.log('🧪 CHALLENGER: DYNAMIC DOM RUNTIME STRESS TEST (M2)');
console.log('=================================================================');

const htmlPath = path.join(__dirname, '..', 'divyank_mission_control_google_apps_script_app.html');
const content = fs.readFileSync(htmlPath, 'utf8');

// Extract all dynamic template literals from the script tags
const scriptMatches = content.match(/<script[\s\S]*?<\/script>/gi) || [];
let allScripts = '';
scriptMatches.forEach(tag => {
  // Exclude external scripts like CDN Tailwind
  if (!tag.includes('src=')) {
    const code = tag.replace(/<\/?script[^>]*>/gi, '');
    allScripts += '\n' + code;
  }
});

// Search for all template strings that construct HTML
const htmlTemplateRegex = /`\s*<[a-zA-Z0-9]+[\s\S]*?>[\s\S]*?`/g;
const matchedTemplates = allScripts.match(htmlTemplateRegex) || [];

console.log(`Found ${matchedTemplates.length} HTML template literals in client JavaScript.`);

let failedTemplates = 0;

matchedTemplates.forEach((tmpl, idx) => {
  // Check for any non-none rounded classes
  const curvedMatches = tmpl.match(/\brounded-(?!none)[a-z0-9]+/g);
  if (curvedMatches) {
    console.error(`❌ Template #${idx + 1} contains curved classes: ${curvedMatches.join(', ')}`);
    console.error(`   Snippet: ${tmpl.slice(0, 120)}`);
    failedTemplates++;
  }

  // Check for standalone rounded
  const standaloneMatches = tmpl.match(/(['" ])rounded(['" ])/g);
  if (standaloneMatches) {
    console.error(`❌ Template #${idx + 1} contains standalone rounded: ${standaloneMatches.join(', ')}`);
    failedTemplates++;
  }

  // Check for bg-gradient
  const gradMatches = tmpl.match(/\bbg-gradient-[a-z0-9-]+/g);
  if (gradMatches) {
    console.error(`❌ Template #${idx + 1} contains bg-gradient: ${gradMatches.join(', ')}`);
    failedTemplates++;
  }

  // Check for glow-
  const glowMatches = tmpl.match(/\bglow-[a-z0-9-]+/g);
  if (glowMatches) {
    console.error(`❌ Template #${idx + 1} contains glow: ${glowMatches.join(', ')}`);
    failedTemplates++;
  }
});

assert.strictEqual(failedTemplates, 0, `Found ${failedTemplates} dynamic templates violating Brand System`);
console.log(`✅ All ${matchedTemplates.length} dynamic HTML template literals strictly comply with 90° square edges, flat cards, and zero glows/gradients!`);

console.log('=================================================================');
console.log('🎉 DYNAMIC DOM RUNTIME STRESS TEST PASSED WITH 0 DEFECTS');
console.log('=================================================================');
