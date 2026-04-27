import * as Yup from "yup";

class BrandValidator {
  static createBrandSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    legalEntityId: Yup.string().required("Legal Entity is required"),
    isActive: Yup.boolean().required("Status is required"),
  });
}

export default BrandValidator;
