"use client";

import TableComponent from "@/components/common/DataTable";
import DeliveryFeeRuleForm from "@/components/ui/DeliveryFeeRule/DeliveryFeeRuleForm";
import {
  useDeleteDeliveryFeeRuleMutation,
  useGetDeliveryFeeRulesQuery,
  useUpdateDeliveryFeeRuleMutation,
} from "@/features/delivery-fee/deliveryFeeApiService";
import { clearSelectedRule, setSelectedRule } from "@/features/delivery-fee/deliveryFeeSlice";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Chip, IconButton, Paper, Switch, Typography } from "@mui/material";
import { useCallback, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";

const WINDOW_LABELS: Record<string, string> = {
  standard: "Standard",
  early_morning: "Early Morning (4–8am)",
  midnight: "Midnight (12–4am)",
};

export default function DeliveryFeeRulesPage() {
  const dispatch = useDispatch();
  const { openDrawer, setIsEditing } = useFormDrawer();
  const { openDialog } = useConfirmDialog();

  // The rule set is small (a handful of rows), so no search/filter/pagination —
  // the offers page pattern is kept but trimmed to what this screen needs.
  const { data, isLoading, refetch: handleRefresh } = useGetDeliveryFeeRulesQuery();
  const rules = Array.isArray(data) ? data : data?.data || [];

  const [updateRule] = useUpdateDeliveryFeeRuleMutation();
  const [deleteRule] = useDeleteDeliveryFeeRuleMutation();

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateRule({ id, isActive: !currentStatus });
  };

  const handleEdit = useCallback(
    (row: any) => {
      dispatch(setSelectedRule(row));
      setIsEditing(true);

      openDrawer({
        drawerName: "Edit Delivery Fee Rule",
        children: <DeliveryFeeRuleForm refetch={handleRefresh} />,
        dispatchFunctions: [clearSelectedRule],
        isEditing: true,
        width: 550,
        anchor: "right",
      });
    },
    [dispatch, setIsEditing, openDrawer, handleRefresh]
  );

  const handleCreate = () => {
    dispatch(clearSelectedRule());
    setIsEditing(false);

    openDrawer({
      drawerName: "Create Delivery Fee Rule",
      children: <DeliveryFeeRuleForm refetch={handleRefresh} />,
      dispatchFunctions: [clearSelectedRule],
      width: 550,
      anchor: "right",
    });
  };

  const handleDelete = useCallback(
    (row: any) => {
      openDialog("Are you sure you want to delete this delivery fee rule?", async () => {
        await deleteRule({ id: row.id });
      });
    },
    [deleteRule, openDialog]
  );

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Rule",
        flex: 1.4,
        renderCell: ({ row }: any) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {WINDOW_LABELS[row.deliveryWindow] || row.deliveryWindow}
            </Typography>
          </Box>
        ),
      },
      {
        field: "orderType",
        headerName: "Order Type",
        flex: 0.7,
        renderCell: ({ row }: any) => (
          <Chip label={row.orderType} size="small" variant="outlined" sx={{ fontWeight: 700, textTransform: "capitalize" }} />
        ),
      },
      {
        field: "minSubtotal",
        headerName: "Min Subtotal",
        flex: 0.7,
        renderCell: ({ row }: any) => (
          <Typography variant="body2">₹{Number(row.minSubtotal).toFixed(0)}</Typography>
        ),
      },
      {
        field: "fee",
        headerName: "Fee (incl.)",
        flex: 0.7,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: Number(row.fee) === 0 ? "#059669" : "#0F172A" }}>
            {Number(row.fee) === 0 ? "Free" : `₹${Number(row.fee).toFixed(2)}`}
          </Typography>
        ),
      },
      {
        field: "serviceChargePct",
        headerName: "Service Charge",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Typography variant="body2">{Number(row.serviceChargePct) > 0 ? `${Number(row.serviceChargePct)}% (in fee)` : "—"}</Typography>
        ),
      },
      {
        field: "priority",
        headerName: "Priority",
        flex: 0.6,
        renderCell: ({ row }: any) => <Typography variant="body2">{row.priority}</Typography>,
      },
      {
        field: "isActive",
        headerName: "Active",
        flex: 0.6,
        renderCell: ({ row }: any) => (
          <Switch
            checked={row.isActive}
            onChange={() => handleToggleActive(row.id, row.isActive)}
            color="primary"
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.5,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
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
          </Box>
        ),
      },
    ],
    [handleEdit, handleDelete, handleToggleActive]
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LocalShippingIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Delivery Fee Rules
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Control when and how delivery charges apply — changes take effect immediately
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            + Create Rule
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableComponent
          columns={columns}
          data={rules}
          currentPage={1}
          setCurrentPage={() => {}}
          pageSize={Math.max(rules.length, 1)}
          totalItems={rules.length}
          isLoading={isLoading}
          onPageChange={() => {}}
        />
      </Paper>
    </Box>
  );
}
