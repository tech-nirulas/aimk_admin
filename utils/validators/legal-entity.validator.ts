import * as Yup from "yup";

class LegalEntityValidator {
  static createLegalEntitySchema = Yup.object({
    name: Yup.string().required(),
    legalName: Yup.string().required(),
    gstin: Yup.string().required(),
    pan: Yup.string().required(),
    address: Yup.string().required(),
    city: Yup.string().required(),
    state: Yup.string().required(),
    pincode: Yup.string().required(),
    contactEmail: Yup.string().required(),
    contactPhone: Yup.string().required(),
    isDefault: Yup.boolean().required(),
    bankAccountName: Yup.string().required(),
    bankIfsc: Yup.string().required(),
    commissionRate: Yup.number().required(),
  });
}

export default LegalEntityValidator;
