import * as Yup from "yup";

class OutletValidator {
  static createOutletSchema = Yup.object({
    name: Yup.string().required("Outlet name is required").trim(),

    code: Yup.string().required("Outlet code is required").trim(),

    address: Yup.string().required("Address is required").trim(),

    city: Yup.string().required("City is required").trim(),

    state: Yup.string().required("State is required").trim(),

    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),

    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),

    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),

    // legalEntityId: Yup.string().required("Legal entity is required"),
    brands: Yup.array()
      .of(Yup.string())
      .min(1, "At least one brand is required"),

    // Optional fields
    pickupCutoffTime: Yup.string().nullable(),

    openingHours: Yup.mixed().nullable(),
    // Coordinates validation (important)
    coordinates: Yup.object({
      lat: Yup.number()
        .typeError("Latitude must be a number")
        .required("Latitude is required"),

      lng: Yup.number()
        .typeError("Longitude must be a number")
        .required("Longitude is required"),
    }).required("Coordinates are required"),
  });
}

export default OutletValidator;
