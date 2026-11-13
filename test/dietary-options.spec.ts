import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  DIETARY_OPTIONS,
  getDietaryChipColor,
  resolveDietaryTags,
} from '../utils/dietary.ts';

// 1. Static component checks on DietarySection.tsx
const content = readFileSync(
  new URL('../components/ui/Product/sections/DietarySection.tsx', import.meta.url),
  'utf8',
);

assert.ok(content.includes('DIETARY_OPTIONS'), 'DietarySection must reference DIETARY_OPTIONS');
assert.ok(content.includes('resolveDietaryTags'), 'DietarySection must use resolveDietaryTags');
assert.ok(content.includes('getDietaryChipColor'), 'DietarySection must use getDietaryChipColor');

// 2. Unit tests for DIETARY_OPTIONS and colors
assert.ok(DIETARY_OPTIONS.includes('non_vegetarian'), 'DIETARY_OPTIONS must include non_vegetarian');
assert.ok(DIETARY_OPTIONS.includes('contains_egg'), 'DIETARY_OPTIONS must include contains_egg');
assert.ok(DIETARY_OPTIONS.includes('vegetarian'), 'DIETARY_OPTIONS must include vegetarian');
assert.strictEqual(getDietaryChipColor('non_vegetarian'), 'error');
assert.strictEqual(getDietaryChipColor('contains_egg'), 'warning');
assert.strictEqual(getDietaryChipColor('vegetarian'), 'success');
assert.strictEqual(getDietaryChipColor('vegan'), 'success');
assert.strictEqual(getDietaryChipColor('egg_free'), 'success');

// 3. Unit tests for resolveDietaryTags mutual exclusion
// When toggling non_vegetarian, automatically remove vegetarian and vegan
const tagsAfterNonVeg = resolveDietaryTags(['vegetarian', 'vegan', 'gluten_free'], 'non_vegetarian');
assert.ok(tagsAfterNonVeg.includes('non_vegetarian'), 'Must include non_vegetarian');
assert.strictEqual(tagsAfterNonVeg.includes('vegetarian'), false, 'Must have removed vegetarian');
assert.strictEqual(tagsAfterNonVeg.includes('vegan'), false, 'Must have removed vegan');
assert.ok(tagsAfterNonVeg.includes('gluten_free'), 'Must keep other tags intact');

// When toggling vegetarian, automatically remove non_vegetarian
const tagsAfterVeg = resolveDietaryTags(['non_vegetarian', 'dairy_free'], 'vegetarian');
assert.ok(tagsAfterVeg.includes('vegetarian'), 'Must include vegetarian');
assert.strictEqual(tagsAfterVeg.includes('non_vegetarian'), false, 'Must have removed non_vegetarian');
assert.ok(tagsAfterVeg.includes('dairy_free'), 'Must keep dairy_free intact');

// When toggling vegan, automatically remove non_vegetarian
const tagsAfterVegan = resolveDietaryTags(['non_vegetarian'], 'vegan');
assert.ok(tagsAfterVegan.includes('vegan'), 'Must include vegan');
assert.strictEqual(tagsAfterVegan.includes('non_vegetarian'), false, 'Must have removed non_vegetarian');

// When toggling contains_egg, automatically remove egg_free
const tagsAfterEgg = resolveDietaryTags(['egg_free', 'sugar_free'], 'contains_egg');
assert.ok(tagsAfterEgg.includes('contains_egg'), 'Must include contains_egg');
assert.strictEqual(tagsAfterEgg.includes('egg_free'), false, 'Must have removed egg_free');
assert.ok(tagsAfterEgg.includes('sugar_free'), 'Must keep sugar_free intact');

// When toggling egg_free, automatically remove contains_egg
const tagsAfterEggFree = resolveDietaryTags(['contains_egg'], 'egg_free');
assert.ok(tagsAfterEggFree.includes('egg_free'), 'Must include egg_free');
assert.strictEqual(tagsAfterEggFree.includes('contains_egg'), false, 'Must have removed contains_egg');

// Untoggling an existing tag removes it
const unselectedTags = resolveDietaryTags(['vegetarian', 'gluten_free'], 'vegetarian');
assert.strictEqual(unselectedTags.includes('vegetarian'), false, 'Untoggling must remove vegetarian');
assert.deepStrictEqual(unselectedTags, ['gluten_free']);

console.log('PASS: Admin dietary options and mutual exclusion tests passed cleanly');
