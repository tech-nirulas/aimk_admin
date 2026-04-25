import * as Yup from "yup";

class ProductValidator {
  static createProductSchema = Yup.object({
    // Basic
    name: Yup.string()
      .required("Product name is required")
      .min(2, "Name must be at least 2 characters"),
    shortDescription: Yup.string()
      .required("Short description is required")
      .max(200, "Max 200 characters"),
    description: Yup.string(),
    code: Yup.string().max(5, "Max 5 characters"),
    categoryId: Yup.string().required("Category is required"),
    brandId: Yup.string().required("Brand is required"),

    // Pricing & Units
    baseUnit: Yup.string().required("Base unit is required"),
    basePrice: Yup.number()
      .required("Base price is required")
      .min(0, "Price cannot be negative"),
    availableUnits: Yup.object().default({}), // ✅ Changed from number to object

    hsnCode: Yup.string().nullable(),
    gstRate: Yup.number().min(0, "GST rate cannot be negative").default(5),

    // Inventory
    inStock: Yup.boolean().default(true),
    stockQuantity: Yup.number()
      .transform((v, o) => (o === "" ? undefined : v))
      .min(0, "Stock cannot be negative")
      .default(0),
    lowStockThreshold: Yup.number()
      .transform((v, o) => (o === "" ? undefined : v))
      .min(0)
      .default(5),
    preorderEnabled: Yup.boolean().default(false),
    preorderLeadDays: Yup.number()
      .transform((v, o) => (o === "" ? null : v))
      .min(1)
      .nullable(),

    // Bakery specs
    weight: Yup.number().transform((v, o) => o === '' ? null : v).min(0).nullable(),
    weightUnit: Yup.string().default("g"),
    piecesPerPack: Yup.number().transform((v, o) => o === '' ? null : v).min(0).nullable(),
    shelfLife: Yup.number().transform((v, o) => o === '' ? null : v).min(0).nullable(),
    storageInstructions: Yup.string(),

    // Dietary & Allergens
    dietaryTags: Yup.array().of(Yup.string()).default([]),
    allergenInfo: Yup.object({
      contains: Yup.array().of(Yup.string()).default([]),
      mayContain: Yup.array().of(Yup.string()).default([]),
    }).default({ contains: [], mayContain: [] }),
    nutritionalInfo: Yup.object({
      calories: Yup.string(),
      protein: Yup.string(),
      saturatedFat: Yup.string(),
      carbs: Yup.string(),
      fat: Yup.string(),
      fiber: Yup.string(),
      sugar: Yup.string(),
      sodium: Yup.string(),
    }).default({}),

    // Media
    mainImageId: Yup.string().nullable(),
    thumbnailId: Yup.string().nullable(),
    gallery: Yup.array().of(Yup.string()).default([]),
    _mainImageUrl: Yup.string().nullable(),
    _thumbnailUrl: Yup.string().nullable(),
    // Metadata
    featured: Yup.boolean().default(false),
    bestSeller: Yup.boolean().default(false),
    newArrival: Yup.boolean().default(false),

    // Seasonal
    isSeasonal: Yup.boolean().default(false),
    availableFrom: Yup.string().nullable(),
    availableUntil: Yup.string().nullable(),
    maxPerOrder: Yup.number()
      .transform((v, o) => (o === "" ? null : v))
      .min(1)
      .nullable(),

    // SEO
    seoTitle: Yup.string(),
    seoDescription: Yup.string(),
  });
}

export default ProductValidator;
