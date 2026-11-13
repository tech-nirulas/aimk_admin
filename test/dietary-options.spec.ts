import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const content = readFileSync(
  new URL('../components/ui/Product/sections/DietarySection.tsx', import.meta.url),
  'utf8',
);

assert.ok(content.includes('"non_vegetarian"'), 'DIETARY_OPTIONS must include non_vegetarian');
assert.ok(content.includes('"contains_egg"'), 'DIETARY_OPTIONS must include contains_egg');
assert.ok(
  content.includes('"error"') && content.includes('"warning"') && content.includes('"success"'),
  'DietarySection must handle error, warning, and success chip colors',
);
console.log('PASS: Admin dietary options test');
