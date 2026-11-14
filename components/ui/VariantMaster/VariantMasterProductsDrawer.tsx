"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { FaPlus, FaSearch } from "react-icons/fa";

import {
  useDetachProductFromVariantMasterMutation,
  useGetVariantMasterProductsQuery,
  useUpdateVariantMasterProductMutation,
} from "@/features/variant-master/variantMasterApiService";
import { LinkedProductVariant, VariantMaster } from "@/interfaces/variant-master.interface";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/lib/DialogProvider";
import AttachProductsModal from "./AttachProductsModal";

interface VariantMasterProductsDrawerProps {
  open: boolean;
  onClose: () => void;
  master: VariantMaster | null;
}

export default function VariantMasterProductsDrawer({
  open,
  onClose,
  master,
}: VariantMasterProductsDrawerProps) {
  const { showToast } = useToast();
  const { openDialog } = useConfirmDialog();

  const [search, setSearch] = useState("");
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [editingRows, setEditingRows] = useState<
    Record<string, { price: string; compareAtPrice: string }>
  >({});

  const { data, isLoading } = useGetVariantMasterProductsQuery(
    { id: master?.id || "" },
    { skip: !master?.id || !open }
  );

  const [updateProductVariant, { isLoading: isUpdating }] =
    useUpdateVariantMasterProductMutation();
  const [detachProductVariant] = useDetachProductFromVariantMasterMutation();

  const linkedProducts = data?.data || [];

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return linkedProducts;
    const q = search.toLowerCase();
    return linkedProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productSku?.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }, [linkedProducts, search]);

  if (!master) return null;

  const handlePriceChange = (variantId: string, field: "price" | "compareAtPrice", val: string) => {
    setEditingRows((prev) => ({
      ...prev,
      [variantId]: {
        price: prev[variantId]?.price ?? String(linkedProducts.find((p) => p.productVariantId === variantId)?.price ?? 0),
        compareAtPrice: prev[variantId]?.compareAtPrice ?? String(linkedProducts.find((p) => p.productVariantId === variantId)?.compareAtPrice ?? ""),
        [field]: val,
      },
    }));
  };

  const handleSaveRow = async (item: LinkedProductVariant) => {
    const edit = editingRows[item.productVariantId];
    const newPrice = edit?.price ? Number(edit.price) : item.price;
    const newCompareAt = edit?.compareAtPrice ? Number(edit.compareAtPrice) : (item.compareAtPrice ?? undefined);

    try {
      await updateProductVariant({
        id: master.id,
        productVariantId: item.productVariantId,
        body: {
          price: newPrice,
          compareAtPrice: newCompareAt,
        },
      }).unwrap();

      showToast(`Updated pricing for "${item.productName}"`, "success");
      setEditingRows((prev) => {
        const next = { ...prev };
        delete next[item.productVariantId];
        return next;
      });
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update pricing", "error");
    }
  };

  const handleToggleDefault = async (item: LinkedProductVariant, nextVal: boolean) => {
    try {
      await updateProductVariant({
        id: master.id,
        productVariantId: item.productVariantId,
        body: { isDefault: nextVal },
      }).unwrap();
      showToast(
        nextVal
          ? `"${master.name}" is now the default size for ${item.productName}`
          : `Removed default status`,
        "info"
      );
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update default status", "error");
    }
  };

  const handleToggleStock = async (item: LinkedProductVariant, nextVal: boolean) => {
    try {
      await updateProductVariant({
        id: master.id,
        productVariantId: item.productVariantId,
        body: { inStock: nextVal },
      }).unwrap();
      showToast(
        nextVal ? `Marked in stock` : `Marked out of stock for this size`,
        "info"
      );
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update stock status", "error");
    }
  };

  const handleDetach = (item: LinkedProductVariant) => {
    openDialog(
      `Are you sure you want to detach the "${master.name}" variant from "${item.productName}"? Customers will no longer be able to select this size for this product.`,
      async () => {
        try {
          await detachProductVariant({
            id: master.id,
            productVariantId: item.productVariantId,
          }).unwrap();
          showToast(`Detached variant from "${item.productName}"`, "success");
        } catch (err: any) {
          showToast(err?.data?.message || "Failed to detach variant", "error");
        }
      }
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: { xs: "100%", md: 850 }, p: 3 },
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {master.name}
              </Typography>
              <Chip
                label={`${linkedProducts.length} Product(s) Running`}
                color="primary"
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Code: <code>{master.code}</code> • Category: {master.category}{" "}
              {master.defaultWeight ? `• Weight: ${master.defaultWeight}${master.defaultWeightUnit || "g"}` : ""}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Toolbar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search linked products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <FaSearch className="mr-2 text-gray-400" />,
              },
            }}
            sx={{ flex: 1, maxWidth: 350 }}
          />

          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => setAttachModalOpen(true)}
          >
            + Attach to Products
          </Button>
        </Box>

        {/* Products Table */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {linkedProducts.length === 0
              ? `No products are currently running the "${master.name}" variant. Click "+ Attach to Products" above to attach this variant to cakes or catalog items.`
              : `No products match your search "${search}".`}
          </Alert>
        ) : (
          <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Base Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 130 }}>Selling Price (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 130 }}>MRP / Strike (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Default</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>In Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((item) => {
                  const editState = editingRows[item.productVariantId];
                  const hasUnsavedChanges = Boolean(editState);

                  return (
                    <TableRow key={item.productVariantId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.productSku} • {item.category?.name || "General"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          ₹{item.productBasePrice}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={editState?.price ?? item.price}
                          onChange={(e) =>
                            handlePriceChange(item.productVariantId, "price", e.target.value)
                          }
                          sx={{ width: 110 }}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          placeholder="Optional"
                          value={editState?.compareAtPrice ?? (item.compareAtPrice || "")}
                          onChange={(e) =>
                            handlePriceChange(item.productVariantId, "compareAtPrice", e.target.value)
                          }
                          sx={{ width: 110 }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <Tooltip title={item.isDefault ? "Default storefront size" : "Make default size"}>
                          <Switch
                            size="small"
                            checked={item.isDefault}
                            onChange={(e) => handleToggleDefault(item, e.target.checked)}
                          />
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <Tooltip title={item.inStock ? "Available to order" : "Out of stock"}>
                          <Switch
                            size="small"
                            checked={item.inStock}
                            onChange={(e) => handleToggleStock(item, e.target.checked)}
                            color="success"
                          />
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                          {hasUnsavedChanges && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSaveRow(item)}
                              title="Save Price Changes"
                              disabled={isUpdating}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDetach(item)}
                            title="Detach Variant from Product"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Drawer>

      {attachModalOpen && (
        <AttachProductsModal
          open={attachModalOpen}
          onClose={() => setAttachModalOpen(false)}
          master={master}
          existingLinkedProducts={linkedProducts}
        />
      )}
    </>
  );
}
