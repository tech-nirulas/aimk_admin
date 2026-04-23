import * as Yup from "yup";

class CategoryValidator {
  static createCategorySchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    displayOrder: Yup.number().optional(),
    categoryImageId: Yup.string().optional(),
    typicalConsumption: Yup.string().optional(),
    preparationTime: Yup.string().optional(),
    defaultGstRate: Yup.number().optional(),

  });
}

export default CategoryValidator;
