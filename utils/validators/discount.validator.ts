import * as Yup from "yup";

class DiscountValidator {
  static createDiscountSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),

    type: Yup.string().required("Discount Type is required"),
    value: Yup.number().required("Discount Value is required"),

    discountOnAll: Yup.boolean(),

    products: Yup.array().of(Yup.string()),
    brands: Yup.array().of(Yup.string()),
    categories: Yup.array()
      .of(Yup.string()),

    excludedProducts: Yup.array().of(Yup.string()),
    excludedBrands: Yup.array().of(Yup.string()),
    excludedCategories: Yup.array().of(Yup.string()),

    startsAt: Yup.date().required("Start Date is required"),
    endsAt: Yup.date().required("End Date is required"),
    isActive: Yup.boolean().required("Status is required"),

    priority: Yup.number().required("Priority is required"),
  });
}

export default DiscountValidator;
