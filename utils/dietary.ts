export const DIETARY_OPTIONS = [
  "vegetarian",
  "non_vegetarian",
  "contains_egg",
  "vegan",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "sugar_free",
  "egg_free",
  "halal",
  "kosher",
];

export const getDietaryChipColor = (
  opt: string,
): "success" | "error" | "warning" | "default" => {
  if (opt === "non_vegetarian") return "error";
  if (opt === "contains_egg") return "warning";
  if (opt === "vegetarian" || opt === "vegan" || opt === "egg_free") return "success";
  return "success";
};

/**
 * Resolves mutual exclusions between dietary lifestyle tags:
 * - When toggling `non_vegetarian`, automatically remove `vegetarian`, `vegan`, and `contains_egg`.
 * - When toggling `vegetarian`, automatically remove `non_vegetarian` and `contains_egg`.
 * - When toggling `vegan`, automatically remove `non_vegetarian` and `contains_egg`.
 * - When toggling `contains_egg`, automatically remove `vegetarian`, `vegan`, `non_vegetarian`, and `egg_free`.
 * - When toggling `egg_free`, automatically remove `contains_egg`.
 */
export function resolveDietaryTags(currentTags: string[], tagToToggle: string): string[] {
  if (currentTags.includes(tagToToggle)) {
    return currentTags.filter((t) => t !== tagToToggle);
  }

  let next = [...currentTags, tagToToggle];
  if (tagToToggle === "non_vegetarian") {
    next = next.filter((t) => t !== "vegetarian" && t !== "vegan" && t !== "contains_egg");
  } else if (tagToToggle === "vegetarian" || tagToToggle === "vegan") {
    next = next.filter((t) => t !== "non_vegetarian" && t !== "contains_egg");
  } else if (tagToToggle === "contains_egg") {
    next = next.filter((t) => t !== "vegetarian" && t !== "vegan" && t !== "non_vegetarian" && t !== "egg_free");
  } else if (tagToToggle === "egg_free") {
    next = next.filter((t) => t !== "contains_egg");
  }

  return next;
}
