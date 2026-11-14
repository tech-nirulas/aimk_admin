"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FaSearch } from "react-icons/fa";

import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import { useAssignProductsToVariantMasterMutation } from "@/features/variant-master/variantMasterApiService";
import { LinkedProductVariant, VariantMaster } from "@/interfaces/variant-master.interface";
import { useToast } from "@/hooks/useToast";

interface AttachProductsModalProps {
  open: boolean;
  onClose: () => void;
  master: VariantMaster;
  existingLinkedProducts: LinkedProductVariant[];
}

type PricingStrategy = "BASE_PRICE" | "FIXED_PRICE" | "CUSTOM";

export default function AttachProductsModal({
  open,
  onClose,
  master,
  existingLinkedProducts,
}: AttachProductsModalProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>("BASE_PRICE");
  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});
  const [makeDefault, setMakeDefault] = useState(false);

  const { data: productsData, isLoading: isProductsLoading } = useGetAllProductsQuery({
    isActive: true,
  });
  const { data: brandsData } = useGetAllBrandsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const [assignProducts, { isLoading: isAssigning }] =
    useAssignProductsToVariantMasterMutation();

  const existingProductIds = useMemo(
    () => new Set(existingLinkedProducts.map((p) => p.productId)),
    [existingLinkedProducts]
  );

  const allProducts = productsData?.data || [];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p: any) => {
      if (selectedBrand && p.brandId !== selectedBrand) return false;
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }
      return true;
    });
  }, [allProducts, selectedBrand, selectedCategory, search]);

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedProductIds.size >= filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p: any) => p.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedProductIds.size === 0) return;

    try {
      const assignments = Array.from(selectedProductIds).map((prodId) => {
        const product = allProducts.find((p: any) => p.id === prodId);
        let price: number | undefined;

        if (pricingStrategy === "FIXED_PRICE") {
          price = fixedPrice ? Number(fixedPrice) : Number(product?.basePrice || 0);
        } else if (pricingStrategy === "CUSTOM") {
          price = customPrices[prodId]
            ? Number(customPrices[prodId])
            : Number(product?.basePrice || 0);
        } else {
          // BASE_PRICE
          price = Number(product?.basePrice || 0);
        }

        return {
          productId: prodId,
          price,
          isDefault: makeDefault,
          inStock: true,
        };
      });

      await assignProducts({
        id: master.id,
        body: { assignments },
      }).unwrap();

      showToast(
        `Successfully attached ${assignments.length} product(s) to "${master.name}"`,
        "success"
      );
      setSelectedProductIds(new Set());
      setFixedPrice("");
      setCustomPrices({});
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to attach products", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Attach Products to Variant: {master.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Category: {master.category} {master.defaultWeight ? `• ${master.defaultWeight}${master.defaultWeightUnit || "g"}` : ""} • Code: {master.code}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Filters bar */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <FaSearch className="mr-2 text-gray-400" />,
              },
            }}
            sx={{ flex: 1, minWidth: 220 }}
          />

          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Filter Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Filter Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoriesData?.data?.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Filter Brand</InputLabel>
            <Select
              value={selectedBrand}
              label="Filter Brand"
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <MenuItem value="">All Brands</MenuItem>
              {brandsData?.data?.map((b: any) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Pricing Strategy Selector */}
        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
            Select Pricing Strategy for Attached Products:
          </Typography>
          <RadioGroup
            row
            value={pricingStrategy}
            onChange={(e) => setPricingStrategy(e.target.value as PricingStrategy)}
          >
            <FormControlLabel
              value="BASE_PRICE"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Use Product Base Price</Typography>}
            />
            <FormControlLabel
              value="FIXED_PRICE"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Fixed Price for All Selected</Typography>}
            />
            <FormControlLabel
              value="CUSTOM"
              control={<Radio size="small" />}
              label={<Typography variant="body2">Custom Price Per Product</Typography>}
            />
          </RadioGroup>

          {pricingStrategy === "FIXED_PRICE" && (
            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                size="small"
                type="number"
                label="Fixed Variant Selling Price (₹) *"
                placeholder="e.g. 550"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                sx={{ width: 280 }}
              />
              <Typography variant="caption" color="text.secondary">
                All selected products will be given this selling price for the {master.name} variant.
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Make {master.name} the default selected size on the storefront for these products
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* Product selection list */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Choose Products ({selectedProductIds.size} selected of {filteredProducts.length})
            </Typography>
            <Button size="small" onClick={handleSelectAllFiltered}>
              {selectedProductIds.size >= filteredProducts.length && filteredProducts.length > 0
                ? "Deselect All"
                : "Select All Filtered"}
            </Button>
          </Box>

          {isProductsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Alert severity="info">No products found matching your filters.</Alert>
          ) : (
            <TableContainer sx={{ maxHeight: 360, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        indeterminate={
                          selectedProductIds.size > 0 &&
                          selectedProductIds.size < filteredProducts.length
                        }
                        checked={
                          filteredProducts.length > 0 &&
                          selectedProductIds.size >= filteredProducts.length
                        }
                        onChange={handleSelectAllFiltered}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Base Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    {pricingStrategy === "CUSTOM" && (
                      <TableCell sx={{ fontWeight: 600, width: 140 }}>Custom Price (₹)</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((prod: any) => {
                    const isSelected = selectedProductIds.has(prod.id);
                    const isAlreadyLinked = existingProductIds.has(prod.id);

                    return (
                      <TableRow
                        key={prod.id}
                        hover
                        selected={isSelected}
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleToggleProduct(prod.id)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleProduct(prod.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {prod.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {prod.sku || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {prod.category?.name || "Uncategorized"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₹{Number(prod.basePrice || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isAlreadyLinked ? (
                            <Chip size="small" label="Already Linked" color="info" variant="outlined" />
                          ) : (
                            <Chip size="small" label="Not Linked" variant="outlined" />
                          )}
                        </TableCell>
                        {pricingStrategy === "CUSTOM" && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <TextField
                              size="small"
                              type="number"
                              disabled={!isSelected}
                              placeholder={`₹${prod.basePrice || 0}`}
                              value={customPrices[prod.id] || ""}
                              onChange={(e) =>
                                setCustomPrices({ ...customPrices, [prod.id]: e.target.value })
                              }
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={selectedProductIds.size === 0 || isAssigning}
          startIcon={isAssigning ? <CircularProgress size={16} /> : null}
        >
          Attach {selectedProductIds.size} Product(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
