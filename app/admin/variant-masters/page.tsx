"use client";

import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from "@mui/material";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import { Link as LinkIcon } from "@mui/icons-material";

import TableComponent from "@/components/common/DataTable";
import { ProtectedComponent } from "@/components/common/ProtectedComponent";
import { UnauthorizedAccess } from "@/components/common/UnauthorizedAccess";
import VariantMasterForm from "@/components/ui/VariantMaster/VariantMasterForm";
import VariantMasterProductsDrawer from "@/components/ui/VariantMaster/VariantMasterProductsDrawer";
import {
  useDeleteVariantMasterMutation,
  useGetVariantMastersQuery,
  useUpdateVariantMasterMutation,
} from "@/features/variant-master/variantMasterApiService";
import {
  clearSelectedMaster,
  setSelectedMaster,
} from "@/features/variant-master/variantMasterSlice";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { usePermission } from "@/hooks/usePermission";
import { VariantCategory, VariantMaster } from "@/interfaces/variant-master.interface";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { PERMISSIONS } from "@aimk/permissions";
import { useToast } from "@/hooks/useToast";

export default function VariantMastersPage() {
  const dispatch = useDispatch();
  const { openDrawer, setIsEditing } = useFormDrawer();
  const { can } = usePermission();
  const { openDialog } = useConfirmDialog();
  const { showToast } = useToast();

  const canCreate = can(PERMISSIONS.VARIANT.CREATE) || can(PERMISSIONS.PRODUCT.CREATE);
  const canUpdate = can(PERMISSIONS.VARIANT.UPDATE) || can(PERMISSIONS.PRODUCT.UPDATE);
  const canDelete = can(PERMISSIONS.VARIANT.DELETE) || can(PERMISSIONS.PRODUCT.DELETE);

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [managingMaster, setManagingMaster] = useState<VariantMaster | null>(null);

  const { data: brandsData } = useGetAllBrandsQuery();
  const { data: mastersData, isLoading } = useGetVariantMastersQuery({
    brandId: brandId || undefined,
    category: (categoryFilter as VariantCategory) || undefined,
  });

  const [deleteMaster] = useDeleteVariantMasterMutation();
  const [updateMaster] = useUpdateVariantMasterMutation();

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleEdit = useCallback(
    (row: VariantMaster) => {
      dispatch(setSelectedMaster(row));
      setIsEditing(true);

      openDrawer({
        drawerName: `Edit Variant Master: ${row.name}`,
        children: <VariantMasterForm />,
        dispatchFunctions: [clearSelectedMaster],
        isEditing: true,
        width: 600,
        anchor: "right",
      });
    },
    [dispatch, setIsEditing, openDrawer]
  );

  const handleCreate = () => {
    dispatch(clearSelectedMaster());
    setIsEditing(false);

    openDrawer({
      drawerName: "New Variant Master",
      children: <VariantMasterForm />,
      dispatchFunctions: [clearSelectedMaster],
      isEditing: false,
      width: 600,
      anchor: "right",
    });
  };

  const handleDelete = useCallback(
    (row: VariantMaster) => {
      const linkedCount = row._count?.productVariants || 0;
      if (linkedCount > 0) {
        showToast(
          `Cannot delete "${row.name}" because ${linkedCount} product(s) are currently running it. Detach them first or deactivate this master.`,
          "error"
        );
        return;
      }

      openDialog(
        `Are you sure you want to delete the variant master "${row.name}"? This action cannot be undone.`,
        async () => {
          try {
            await deleteMaster({ id: row.id }).unwrap();
            showToast("Variant master deleted successfully", "success");
          } catch (err: any) {
            showToast(err?.data?.message || "Failed to delete variant master", "error");
          }
        }
      );
    },
    [deleteMaster, openDialog, showToast]
  );

  const handleToggleActive = useCallback(
    async (row: VariantMaster, checked: boolean) => {
      try {
        await updateMaster({
          id: row.id,
          body: { isActive: checked },
        }).unwrap();
        showToast(
          `Variant master "${row.name}" marked as ${checked ? "Active" : "Inactive"}`,
          "info"
        );
      } catch (err: any) {
        showToast(err?.data?.message || "Failed to toggle status", "error");
      }
    },
    [updateMaster, showToast]
  );

  const allMasters = mastersData?.data || [];

  // Filtered list
  const filteredData = useMemo(() => {
    let list = allMasters;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allMasters, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  // KPI calculations
  const totalMasters = allMasters.length;
  const activeMasters = allMasters.filter((m) => m.isActive).length;
  const totalLinkedProducts = allMasters.reduce(
    (acc, m) => acc + (m._count?.productVariants || 0),
    0
  );

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Variant Name & Code",
        flex: 1.5,
        renderCell: ({ row }: { row: VariantMaster }) => (
          <div>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <div className="flex gap-1.5 items-center mt-0.5">
              <Chip size="small" label={row.code} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
              {row.brand && (
                <Typography variant="caption" color="text.secondary">
                  • {row.brand.name}
                </Typography>
              )}
            </div>
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category & Measure",
        flex: 1.2,
        renderCell: ({ row }: { row: VariantMaster }) => (
          <div>
            <Chip
              size="small"
              label={row.category}
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
            />
            {row.defaultWeight !== null && row.defaultWeight !== undefined && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                {row.defaultWeight} {row.defaultWeightUnit || "g"}
              </Typography>
            )}
          </div>
        ),
      },
      {
        field: "productsCount",
        headerName: "Linked Products",
        flex: 1.2,
        renderCell: ({ row }: { row: VariantMaster }) => {
          const count = row._count?.productVariants || 0;
          return (
            <Button
              size="small"
              variant={count > 0 ? "contained" : "outlined"}
              color={count > 0 ? "primary" : "inherit"}
              startIcon={<LinkIcon sx={{ "&&": { fontSize: 14 } }} />}
              onClick={() => setManagingMaster(row)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 4,
                py: 0.25,
                px: 1.5,
                fontSize: "0.78rem",
              }}
            >
              {count} Product(s) Running
            </Button>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        renderCell: ({ row }: { row: VariantMaster }) => (
          <Tooltip title={row.isActive ? "Active on catalog" : "Inactive"}>
            <Switch
              size="small"
              checked={Boolean(row.isActive)}
              disabled={!canUpdate}
              onChange={(e) => handleToggleActive(row, e.target.checked)}
            />
          </Tooltip>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        renderCell: ({ row }: { row: VariantMaster }) => (
          <div className="flex gap-2 items-center justify-start h-full">
            <Button
              size="small"
              variant="text"
              onClick={() => setManagingMaster(row)}
              sx={{ textTransform: "none", minWidth: "auto", px: 1 }}
            >
              Manage
            </Button>
            {canUpdate && (
              <IconButton size="small" onClick={() => handleEdit(row)} title="Edit Master">
                <FaEdit className="text-blue-600 hover:text-blue-800" size={16} />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size="small" onClick={() => handleDelete(row)} title="Delete Master">
                <FaTrash className="text-red-600 hover:text-red-800" size={14} />
              </IconButton>
            )}
          </div>
        ),
      },
    ],
    [canUpdate, canDelete, handleEdit, handleDelete, handleToggleActive]
  );

  return (
    <ProtectedComponent permission={PERMISSIONS.PRODUCT.READ} fallback={<UnauthorizedAccess />}>
      <Box className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Variant Masters Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create standardized portion sizes (500g, 1kg, 2kg, Single Scoop) and attach them directly to products across the store.
            </Typography>
          </div>
          {canCreate && (
            <Button variant="contained" onClick={handleCreate}>
              + New Variant Master
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL VARIANT MASTERS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {totalMasters}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ACTIVE MASTERS
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {activeMasters}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PRODUCTS RUNNING VARIANTS
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {totalLinkedProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Bar */}
        <Paper className="mb-4 p-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                fullWidth
                onChange={handleSearchChange}
                placeholder="Search variant name or code..."
                slotProps={{
                  input: {
                    startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                  },
                }}
              />
            </div>

            <FormControl size="small" className="w-52">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="WEIGHT">Weight</MenuItem>
                <MenuItem value="PORTION">Portion</MenuItem>
                <MenuItem value="PACK_SIZE">Pack Size</MenuItem>
                <MenuItem value="SCOOP">Scoop</MenuItem>
                <MenuItem value="VOLUME">Volume</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" className="w-56">
              <InputLabel>Brand Scope</InputLabel>
              <Select
                value={brandId}
                label="Brand Scope"
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Brands (Global)</MenuItem>
                {brandsData?.data?.map((b: any) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" className="w-28">
              <InputLabel>Per Page</InputLabel>
              <Select
                value={limit}
                label="Per Page"
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Paper>

        {/* Data Table */}
        <TableComponent
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          totalItems={filteredData.length}
          currentPage={page}
          pageSize={limit}
          setCurrentPage={setPage}
        />

        {/* Manage Products Drawer */}
        {managingMaster && (
          <VariantMasterProductsDrawer
            open={Boolean(managingMaster)}
            onClose={() => setManagingMaster(null)}
            master={managingMaster}
          />
        )}
      </Box>
    </ProtectedComponent>
  );
}
