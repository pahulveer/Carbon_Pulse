import assert from 'node:assert';

console.log('Testing live dev server on http://localhost:5173...');

const res = await fetch('http://localhost:5173/');
assert.strictEqual(res.status, 200, 'Dev server should return 200 OK');
const html = await res.text();

// Check SEO & HTML Structure
assert.ok(html.includes('<title>CARBON//PULSE — Personal Climate Analytics Command Center</title>'), 'Title must match');
assert.ok(html.includes('<meta name="description"'), 'Meta description must exist');
assert.ok(html.includes('id="root"'), 'Root element must exist');
assert.ok(html.includes('/src/main.tsx'), 'Script entry must point to main.tsx');

console.log('✓ Dev server responded with 200 OK and valid semantic HTML/SEO headers.');

// Check that entry point transpilation works
const mainRes = await fetch('http://localhost:5173/src/main.tsx');
assert.strictEqual(mainRes.status, 200, 'main.tsx must be served with 200 OK');
const mainJs = await mainRes.text();
assert.ok(mainJs.includes('createRoot'), 'main.tsx must initialize React root');
console.log('✓ Vite transpiler dynamically serves React 19 application without syntax errors.');

// Check that CSS is served
const cssRes = await fetch('http://localhost:5173/src/index.css');
assert.strictEqual(cssRes.status, 200, 'index.css must be served with 200 OK');
const css = await cssRes.text();
assert.ok(css.includes('--emerald-400'), 'CSS variables must be present');
assert.ok(css.includes('color-scheme: dark;'), 'Dark mode color scheme must be defined');
console.log('✓ High-performance Obsidian design tokens and CSS served cleanly.');

console.log('\n========================================================');
console.log('LIVE SERVER & RUNTIME INTEGRATION TEST PASSED (100% OK)');
console.log('========================================================');
