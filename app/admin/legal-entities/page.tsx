"use client";

import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography, debounce } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";

import {
  useDeleteLegalEntityMutation,
  useGetAllLegalEntitiesQuery,
} from "@/features/legal-entity/legalEntitiesApiService";

import {
  clearSelectedLegalEntity,
  setSelectedLegalEntity
} from "@/features/legal-entity/legalEntitiesSlice";

import TableComponent from "@/components/common/DataTable";
import CategoryForm from "@/components/ui/Category/CategoryForm";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { LegalEntity } from "@/interfaces/legal-entity.interface";
import LegalEntityForm from "@/components/ui/LegalEntity/LegalEntityForm";

export default function LegalEntitiesPage() {
  const dispatch = useDispatch();
  const { openDrawer, setIsEditing } = useFormDrawer();

  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { openDialog } = useConfirmDialog();

  // Fetch data with pagination
  const { data, isLoading } = useGetAllLegalEntitiesQuery({
    page,
    limit,
    search: search || undefined,
    isActive: isActive ? isActive === "true" : undefined,
    sortBy,
    sortOrder,
  });

  const [deleteLegalEntity] = useDeleteLegalEntityMutation();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
      setPage(1); // Reset to first page when searching
    }, 500),
    [setSearch, setPage]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (field: string, value: any) => {
    if (field === "isActive") setIsActive(value);
    if (field === "limit") setLimit(value);
    if (field === "sortBy") setSortBy(value);
    if (field === "sortOrder") setSortOrder(value);
    setPage(1); // Reset to first page when changing filters
  };

  const handleClearFilters = () => {
    setSearch("");
    setIsActive("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const handleEdit = useCallback((row: unknown) => {
    dispatch(setSelectedLegalEntity(row));
    setIsEditing(true);

    openDrawer({
      drawerName: "Edit Legal Entity",
      children: <LegalEntityForm />,
      dispatchFunctions: [clearSelectedLegalEntity],
      isEditing: true,
      width: 500,
      anchor: "right"
    });
  }, [dispatch, setIsEditing, openDrawer]);

  const handleCreate = () => {
    openDrawer({
      drawerName: "Create Legal Entity",
      children: <LegalEntityForm />,
      width: 500,
      anchor: "right"
    });
  };

  const handleDelete = useCallback(async (row: any) => {
    openDialog("Are you sure you want to delete this legal entity?", async () => await deleteLegalEntity({ id: row.id }))
  }, [deleteLegalEntity, openDialog]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const columns = useMemo(() => [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ row }: { row: LegalEntity }) => (
        <p className="truncate font-medium">{row.name}</p>
      )
    },
    { field: "slug", headerName: "Slug", flex: 1 },
    {
      field: "gstin",
      headerName: "GST-IN",
      flex: 2,
      renderCell: ({ row }: { row: LegalEntity }) => (
        <p className="truncate">{row.gstin || "-"}</p>
      )
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.5,
      renderCell: ({ row }: { row: LegalEntity }) => (
        <Switch checked={row.isActive} disabled />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ row }: { row: LegalEntity }) => (
        <p>{new Date(row.createdAt).toLocaleDateString()}</p>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: ({ row }: { row: LegalEntity }) => (
        <div className="flex gap-2 items-center justify-start h-full">
          <FaEdit
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            size={18}
            onClick={() => handleEdit(row)}
          />
          <FaTrash
            className="cursor-pointer text-red-600 hover:text-red-800"
            size={16}
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ], [handleDelete, handleEdit]);

  return (
    <Box className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h2">Legal Entities</Typography>
        <Button variant="contained" onClick={handleCreate}>
          + New Legal Entity
        </Button>
      </div>

      {/* Filters Section */}
      <Paper className="mb-4 p-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-50">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              onChange={handleSearchChange}
              placeholder="Search by name or description..."
              InputProps={{
                startAdornment: <FaSearch className="mr-2 text-gray-400" />,
              }}
            />
          </div>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={isActive}
              label="Status"
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={limit}
              label="Items per page"
              onChange={(e) => handleFilterChange("limit", e.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </Paper>

      {/* Table Component */}
      <TableComponent
        columns={columns}
        data={data?.data || []}
        currentPage={page}
        setCurrentPage={setPage}
        pageSize={limit}
        totalItems={data?.meta?.totalItems || 0}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />

      {/* Pagination Info */}
      {data?.meta && data.meta.totalItems > 0 && (
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <div>
            Showing {(data.meta.page - 1) * data.meta.limit + 1} to{" "}
            {Math.min(data.meta.page * data.meta.limit, data.meta.totalItems)} of{" "}
            {data.meta.totalItems} entries
          </div>
          <div>
            Page {data.meta.page} of {data.meta.totalPages}
          </div>
        </div>
      )}
    </Box>
  );
}