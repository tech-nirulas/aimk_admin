"use client";

import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";

import TableComponent from "@/components/common/DataTable";
import { ProtectedComponent } from "@/components/common/ProtectedComponent";
import { UnauthorizedAccess } from "@/components/common/UnauthorizedAccess";
import ModifierGroupForm from "@/components/ui/Modifier/ModifierGroupForm";
import {
  useDeleteModifierMutation,
  useGetModifiersQuery,
} from "@/features/modifiers/modifierApiService";
import {
  clearSelectedModifier,
  setSelectedModifier,
} from "@/features/modifiers/modifierSlice";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { usePermission } from "@/hooks/usePermission";
import { ModifierGroup } from "@/interfaces/modifier.interface";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { PERMISSIONS } from "@aimk/permissions";

export default function ModifiersPage() {
  const dispatch = useDispatch();
  const { openDrawer, setIsEditing } = useFormDrawer();
  const { can } = usePermission();

  const canCreate = can(PERMISSIONS.PRODUCT.CREATE);
  const canUpdate = can(PERMISSIONS.PRODUCT.UPDATE);
  const canDelete = can(PERMISSIONS.PRODUCT.DELETE);

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { openDialog } = useConfirmDialog();

  const { data: brandsData } = useGetAllBrandsQuery();
  const { data: modifiersData, isLoading } = useGetModifiersQuery({
    brandId: brandId || undefined,
  });

  const [deleteModifier] = useDeleteModifierMutation();

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
    (row: ModifierGroup) => {
      dispatch(setSelectedModifier(row));
      setIsEditing(true);

      openDrawer({
        drawerName: `Edit Modifier Group: ${row.name}`,
        children: <ModifierGroupForm />,
        dispatchFunctions: [clearSelectedModifier],
        isEditing: true,
        width: 600,
        anchor: "right",
      });
    },
    [dispatch, setIsEditing, openDrawer]
  );

  const handleCreate = () => {
    dispatch(clearSelectedModifier());
    setIsEditing(false);

    openDrawer({
      drawerName: "New Modifier Group",
      children: <ModifierGroupForm />,
      dispatchFunctions: [clearSelectedModifier],
      isEditing: false,
      width: 600,
      anchor: "right",
    });
  };

  const handleDelete = useCallback(
    (row: ModifierGroup) => {
      openDialog(
        `Are you sure you want to delete modifier group "${row.name}"? This will detach it from any associated products.`,
        async () => {
          await deleteModifier({ id: row.id });
        }
      );
    },
    [deleteModifier, openDialog]
  );

  // Client-side filtering on returned modifier groups
  const filteredData = useMemo(() => {
    let list = modifiersData?.data || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.displayName.toLowerCase().includes(q) ||
          m.options?.some((o) => o.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [modifiersData, search]);

  // Paginated slice for TableComponent
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Internal Name",
        flex: 1.2,
        renderCell: ({ row }: { row: ModifierGroup }) => (
          <div>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Title: &quot;{row.displayName}&quot;
            </Typography>
          </div>
        ),
      },
      {
        field: "rule",
        headerName: "Selection Rule",
        flex: 1,
        renderCell: ({ row }: { row: ModifierGroup }) => {
          const isSingle = row.maxSelections === 1;
          const isReq = row.isRequired || row.minSelections > 0;
          return (
            <div className="flex flex-col gap-1 items-start">
              <div className="flex gap-1 items-center">
                <Chip
                  size="small"
                  label={isReq ? "Required" : "Optional"}
                  color={isReq ? "error" : "default"}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={isSingle ? "Single Choice" : `Up to ${row.maxSelections}`}
                  color="primary"
                  variant="outlined"
                />
              </div>
              <Typography variant="caption" color="text.secondary">
                Min: {row.minSelections} | Max: {row.maxSelections}
              </Typography>
            </div>
          );
        },
      },
      {
        field: "options",
        headerName: "Options / Add-ons",
        flex: 2,
        renderCell: ({ row }: { row: ModifierGroup }) => (
          <div className="flex flex-wrap gap-1 items-center py-1">
            {row.options?.slice(0, 4).map((opt) => (
              <Chip
                key={opt.id || opt.name}
                size="small"
                label={`${opt.name} ${Number(opt.price) > 0 ? `(+₹${opt.price})` : "(Free)"}`}
                color={opt.inStock ? "default" : "secondary"}
                variant={opt.isDefault ? "filled" : "outlined"}
              />
            ))}
            {(row.options?.length || 0) > 4 && (
              <Chip
                size="small"
                label={`+${(row.options?.length || 0) - 4} more`}
                variant="outlined"
              />
            )}
          </div>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.5,
        renderCell: ({ row }: { row: ModifierGroup }) => (
          <div className="flex gap-2 items-center justify-start h-full">
            {canUpdate && (
              <FaEdit
                className="cursor-pointer text-blue-600 hover:text-blue-800"
                size={18}
                onClick={() => handleEdit(row)}
                title="Edit Group"
              />
            )}
            {canDelete && (
              <FaTrash
                className="cursor-pointer text-red-600 hover:text-red-800"
                size={16}
                onClick={() => handleDelete(row)}
                title="Delete Group"
              />
            )}
          </div>
        ),
      },
    ],
    [canUpdate, canDelete, handleEdit, handleDelete]
  );

  return (
    <ProtectedComponent permission={PERMISSIONS.PRODUCT.READ} fallback={<UnauthorizedAccess />}>
      <Box className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h2">Modifiers &amp; Add-ons</Typography>
            <Typography variant="body2" color="text.secondary">
              Create reusable modifier groups (toppings, dips, crusts, eggless options) and attach them to products.
            </Typography>
          </div>
          {canCreate && (
            <Button variant="contained" onClick={handleCreate}>
              + New Modifier Group
            </Button>
          )}
        </div>

        {/* Filters */}
        <Paper className="mb-4 p-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                fullWidth
                onChange={handleSearchChange}
                placeholder="Search modifiers or options..."
                slotProps={{
                  input: {
                    startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                  },
                }}
              />
            </div>

            <FormControl size="small" className="w-56">
              <InputLabel>Brand</InputLabel>
              <Select
                value={brandId}
                label="Brand"
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
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Paper>

        {/* Table Component */}
        <TableComponent
          columns={columns}
          data={paginatedData}
          currentPage={page}
          setCurrentPage={setPage}
          pageSize={limit}
          totalItems={filteredData.length}
          isLoading={isLoading}
          onPageChange={(newPage, newLimit) => {
            setPage(newPage);
            if (newLimit !== limit) setLimit(newLimit);
          }}
        />

        {/* Pagination Info */}
        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
            <div>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, filteredData.length)} of {filteredData.length} entries
            </div>
            <div>
              Page {page} of {Math.ceil(filteredData.length / limit) || 1}
            </div>
          </div>
        )}
      </Box>
    </ProtectedComponent>
  );
}
