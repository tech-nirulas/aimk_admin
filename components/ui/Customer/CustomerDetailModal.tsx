"use client";

import {
  useGetCustomerByIdQuery,
  useUpdateCustomerLoyaltyMutation,
} from "@/features/customers/customerApiService";
import { Customer, CustomerAddress, CustomerOrder } from "@/interfaces/customer.interface";
import { useToast } from "@/hooks/useToast";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function CustomerDetailModal({
  open,
  onClose,
  customerId,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
}) {
  const { showSuccess, showError } = useToast();

  const { data: customer, isLoading } = useGetCustomerByIdQuery(customerId, {
    skip: !customerId || !open,
  });

  const [updateLoyalty, { isLoading: isSavingLoyalty }] = useUpdateCustomerLoyaltyMutation();
  const [pointsInput, setPointsInput] = useState<number>(0);

  useEffect(() => {
    if (customer?.loyaltyPoints !== undefined) {
      setPointsInput(customer.loyaltyPoints);
    }
  }, [customer]);

  const handleSaveLoyalty = async () => {
    try {
      await updateLoyalty({ id: customerId, loyaltyPoints: Number(pointsInput) || 0 }).unwrap();
      showSuccess("Loyalty points updated!");
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update points");
    }
  };

  if (!customerId) return null;

  const user = customer?.user || {};
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
        <PersonIcon color="primary" />
        Customer Profile — {name}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Header info */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: "1.5rem", fontWeight: 800 }}>
                    {name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email || "No Email"} • {user.phone || "No Phone"}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<EmojiEventsIcon />}
                  label={`${customer?.loyaltyPoints || 0} Loyalty Points`}
                  color="warning"
                  sx={{ fontWeight: 800, px: 1, py: 2 }}
                />
              </Paper>
            </Grid>

            {/* Loyalty points adjustment */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <EmojiEventsIcon color="warning" fontSize="small" />
                  Adjust Loyalty Points Balance
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    type="number"
                    size="small"
                    label="Points Balance"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(Number(e.target.value))}
                    sx={{ width: 200 }}
                  />
                  <Button variant="contained" color="warning" onClick={handleSaveLoyalty} disabled={isSavingLoyalty}>
                    {isSavingLoyalty ? <CircularProgress size={20} /> : "Update Points"}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Saved Delivery Addresses */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon color="primary" fontSize="small" />
                Saved Delivery Addresses ({customer?.addresses?.length || 0})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 220, overflow: "auto" }}>
                {customer?.addresses && customer.addresses.length > 0 ? (
                        customer.addresses.map((addr: CustomerAddress) => (
                          <Box key={addr.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #F1F5F9" }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {addr.tag || "Address"} {addr.isDefault && <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {addr.street}, {addr.city} ({addr.pincode})
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No addresses saved yet.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Recent Orders Timeline */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <ShoppingBagIcon color="primary" fontSize="small" />
                      Recent Orders ({customer?.orders?.length || 0})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 220, overflow: "auto" }}>
                      {customer?.orders && customer.orders.length > 0 ? (
                        customer.orders.map((ord: CustomerOrder) => (
                    <Box key={ord.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
                          Order #{ord.orderNumber || ord.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethod || "COD"}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          ₹{Number(ord.totalAmount || 0).toLocaleString("en-IN")}
                        </Typography>
                        <Chip label={ord.status} size="small" sx={{ textTransform: "capitalize", fontSize: "0.7rem", height: 20 }} />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No order history available.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
