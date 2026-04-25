import * as Yup from "yup";

class CategoryValidator {
  static createCategorySchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    displayOrder: Yup.number().optional(),
    categoryImageId: Yup.string().optional(),
    parentId: Yup.string().optional(),
    brandId: Yup.string().required("Brand is required")
  });
}

export default CategoryValidator;
