// utils/paymentStatus.ts
//
// SOURCE OF TRUTH: the Prisma `PaymentStatus` enum in
// aimk_backend/prisma/schema/payment.prisma.

export type PaymentStatusValue =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface PaymentStatusConfig {
  value: PaymentStatusValue;
  label: string;
  bg: string;
  color: string;
}

export const PAYMENT_STATUSES: PaymentStatusConfig[] = [
  { value: "PENDING", label: "Pending", bg: "#FEF3C7", color: "#D97706" },
  { value: "AUTHORIZED", label: "Authorized", bg: "#DBEAFE", color: "#2563EB" },
  { value: "CAPTURED", label: "Captured", bg: "#D1FAE5", color: "#059669" },
  { value: "FAILED", label: "Failed", bg: "#FEE2E2", color: "#DC2626" },
  { value: "REFUNDED", label: "Refunded", bg: "#FEE2E2", color: "#DC2626" },
  { value: "PARTIALLY_REFUNDED", label: "Partially Refunded", bg: "#FFEDD5", color: "#C2410C" },
];

const BY_VALUE = new Map(PAYMENT_STATUSES.map((s) => [s.value, s]));

const FALLBACK: PaymentStatusConfig = {
  value: "PENDING",
  label: "Unknown",
  bg: "#F1F5F9",
  color: "#334155",
};

export function getPaymentStatusConfig(status?: string | null): PaymentStatusConfig {
  if (!status) return FALLBACK;
  const key = String(status).toUpperCase();
  return BY_VALUE.get(key as PaymentStatusValue) ?? { ...FALLBACK, label: key.replace(/_/g, " ") };
}

/** COD payments sit at PENDING until an admin records the cash. */
export function isCollectable(status?: string | null): boolean {
  const key = String(status ?? "").toUpperCase();
  return key !== "CAPTURED" && key !== "REFUNDED" && key !== "PARTIALLY_REFUNDED";
}
