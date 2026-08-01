"use client";

import {
  useCreateBatchMutation,
  useUpdateBatchMutation,
} from "@/features/inventory/inventoryApiService";
import { useGetAllOutletsQuery } from "@/features/outlets/outletsApiService";
import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const batchSchema = Yup.object({
  productId: Yup.string().required("Product is required"),
  outletId: Yup.string().required("Outlet location is required"),
  quantity: Yup.number().min(0, "Quantity cannot be negative").required("Quantity is required"),
  producedAt: Yup.date().required("Production date is required"),
  expiresAt: Yup.date()
    .min(Yup.ref("producedAt"), "Expiry date must be after production date")
    .required("Expiry date is required"),
  storageLocation: Yup.string().optional(),
  status: Yup.string().required("Status is required"),
});

import { InventoryBatch } from "@/interfaces/inventory.interface";

export default function BatchForm({
  initialData,
  refetch,
}: {
  initialData?: InventoryBatch | null;
  refetch?: () => void;
}) {
  const { closeDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const isEditing = Boolean(initialData?.id);

  const { data: productsData } = useGetAllProductsQuery({});
  const { data: outletsData } = useGetAllOutletsQuery({});
  const [createBatch, { isLoading: isCreating }] = useCreateBatchMutation();
  const [updateBatch, { isLoading: isUpdating }] = useUpdateBatchMutation();

  const isLoading = isCreating || isUpdating;

  const products = productsData?.data || [];
  const outlets = Array.isArray(outletsData)
    ? outletsData
    : Array.isArray(outletsData?.data)
    ? outletsData.data
    : [];

  const formik = useFormik({
    initialValues: {
      productId: initialData?.productId || initialData?.product?.id || "",
      outletId: initialData?.outletId || initialData?.outlet?.id || "",
      quantity: initialData?.quantity !== undefined ? initialData.quantity : 10,
      producedAt: initialData?.producedAt
        ? new Date(initialData.producedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      expiresAt: initialData?.expiresAt
        ? new Date(initialData.expiresAt).toISOString().split("T")[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      storageLocation: initialData?.storageLocation || "",
      status: initialData?.status || "in_stock",
    },
    enableReinitialize: true,
    validationSchema: batchSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          await updateBatch({ id: initialData.id, ...values }).unwrap();
          showSuccess("Inventory batch updated successfully!");
        } else {
          await createBatch(values).unwrap();
          showSuccess("Inventory batch created successfully!");
        }
        refetch?.();
        closeDrawer();
      } catch (err: any) {
        showError(err?.data?.message || "Failed to save batch");
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={formik.touched.productId && Boolean(formik.errors.productId)}>
            <InputLabel id="product-select-label">Select Product</InputLabel>
            <Select
              labelId="product-select-label"
              name="productId"
              value={formik.values.productId}
              label="Select Product"
              onChange={formik.handleChange}
              disabled={isEditing}
            >
              {products.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} {p.sku ? `(SKU: ${p.sku})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={formik.touched.outletId && Boolean(formik.errors.outletId)}>
            <InputLabel id="outlet-select-label">Outlet Location</InputLabel>
            <Select
              labelId="outlet-select-label"
              name="outletId"
              value={formik.values.outletId}
              label="Outlet Location"
              onChange={formik.handleChange}
              disabled={isEditing}
            >
              {outlets.map((o: any) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.name} ({o.city})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            name="quantity"
            label="Batch Quantity"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            error={formik.touched.quantity && Boolean(formik.errors.quantity)}
            helperText={formik.touched.quantity && formik.errors.quantity}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
            >
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="selling">Selling (Active)</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="used">Used / Depleted</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            name="producedAt"
            label="Production Date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.producedAt}
            onChange={formik.handleChange}
            error={formik.touched.producedAt && Boolean(formik.errors.producedAt)}
            helperText={formik.touched.producedAt && (formik.errors.producedAt as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            name="expiresAt"
            label="Expiry Date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.expiresAt}
            onChange={formik.handleChange}
            error={formik.touched.expiresAt && Boolean(formik.errors.expiresAt)}
            helperText={formik.touched.expiresAt && (formik.errors.expiresAt as string)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            name="storageLocation"
            label="Storage Location (e.g. Freezer A-2 / Shelf B)"
            value={formik.values.storageLocation}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : isEditing ? "Update Batch" : "Create Batch"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
