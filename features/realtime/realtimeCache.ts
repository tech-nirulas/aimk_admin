// features/realtime/realtimeCache.ts
//
// Applies socket events directly to the RTK Query caches that back the admin
// Orders and Payments grids. No refetching: the event carries the same record
// shape the REST endpoints return, so it is written straight into the cache.

import { orderApiService } from "@/features/order/orderApiService";
import { paymentApiService } from "@/features/payments/paymentApiService";
import type { AppDispatch, RootState } from "@/lib/store";
import { RealtimeEnvelopeMeta } from "./realtimeEvents";

/** Envelope shape of every list response after the backend ResponseInterceptor. */
interface ListEnvelope<T = any> {
  data?: T[];
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

interface ListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ListSpec<TRecord> {
  /** Sort field the server orders by when the grid is in its default view. */
  defaultSortBy: string;
  /** Mirrors the server-side `where` clause for this endpoint. */
  matches: (record: TRecord, args: ListArgs) => boolean;
}

// ── Server-filter mirrors ──────────────────────────────────────────────────
function includesCI(value: unknown, needle: string): boolean {
  return typeof value === "string" && value.toLowerCase().includes(needle);
}

/** Mirrors `OrderService.findAllAdmin`'s status filter and search OR-clause. */
const ORDER_LIST_SPEC: ListSpec<any> = {
  defaultSortBy: "placedAt",
  matches: (order, args) => {
    if (args?.status && order?.status !== args.status) return false;
    if (args?.search) {
      const q = args.search.toLowerCase();
      const user = order?.customer?.user ?? {};
      const hit =
        includesCI(order?.orderNumber, q) ||
        includesCI(user.firstName, q) ||
        includesCI(user.lastName, q) ||
        includesCI(user.email, q);
      if (!hit) return false;
    }
    return true;
  },
};

/** Mirrors `PaymentService.findAll`'s status filter and search OR-clause. */
const PAYMENT_LIST_SPEC: ListSpec<any> = {
  defaultSortBy: "createdAt",
  matches: (payment, args) => {
    if (args?.status && payment?.status !== args.status) return false;
    if (args?.search) {
      const q = args.search.toLowerCase();
      const hit =
        includesCI(payment?.razorpayPaymentId, q) ||
        includesCI(payment?.razorpayOrderId, q) ||
        includesCI(payment?.order?.orderNumber, q);
      if (!hit) return false;
    }
    return true;
  },
};

// ── Generic draft mutations ────────────────────────────────────────────────
function bumpTotals(draft: ListEnvelope, delta: number) {
  if (!draft.meta) return;
  const total = Math.max(0, (draft.meta.totalItems ?? 0) + delta);
  draft.meta.totalItems = total;
  const limit = draft.meta.limit ?? 10;
  draft.meta.totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
}

/**
 * A new record only belongs at the top of a cached page when that page is the
 * first one and the grid is on its default newest-first sort. Otherwise the
 * record lives on some other page — the total is still corrected so pagination
 * stays honest, but no row is spliced in where it does not belong.
 */
function isNewestFirstFirstPage(args: ListArgs, spec: ListSpec<any>): boolean {
  const page = args?.page ?? 1;
  const sortBy = args?.sortBy ?? spec.defaultSortBy;
  const sortOrder = args?.sortOrder ?? "desc";
  return page === 1 && sortBy === spec.defaultSortBy && sortOrder === "desc";
}

function insertAtTop(draft: ListEnvelope, record: any, args: ListArgs) {
  draft.data!.unshift(record);
  const limit = args?.limit ?? draft.meta?.limit;
  if (limit && draft.data!.length > limit) {
    draft.data!.length = limit;
  }
}

function applyCreated(
  draft: ListEnvelope,
  record: any,
  args: ListArgs,
  spec: ListSpec<any>,
) {
  if (!Array.isArray(draft?.data) || !record?.id) return;
  // Idempotent: a redelivered create can never duplicate a row.
  if (draft.data.some((r: any) => r?.id === record.id)) return;
  if (!spec.matches(record, args)) return;

  bumpTotals(draft, 1);
  if (isNewestFirstFirstPage(args, spec)) insertAtTop(draft, record, args);
}

function applyUpdated(
  draft: ListEnvelope,
  record: any,
  args: ListArgs,
  spec: ListSpec<any>,
  meta?: RealtimeEnvelopeMeta,
) {
  if (!Array.isArray(draft?.data) || !record?.id) return;

  const index = draft.data.findIndex((r: any) => r?.id === record.id);
  const matches = spec.matches(record, args);

  if (index >= 0) {
    if (matches) {
      draft.data[index] = record;
    } else {
      // The change pushed it out of this filtered view (e.g. pending → confirmed
      // while the grid is filtered to pending).
      draft.data.splice(index, 1);
      bumpTotals(draft, -1);
    }
    return;
  }

  // Not on this cached page. Inserting blindly here would double-count a record
  // that already sits on another page, so only act when the record provably
  // just entered this filtered set: the view has a status filter, the record
  // now matches it, and its previous status did not.
  if (!matches || !args?.status) return;
  const previousStatus = meta?.previousStatus;
  const justEnteredFilter =
    previousStatus !== undefined &&
    previousStatus !== null &&
    previousStatus !== args.status &&
    record.status === args.status;
  if (!justEnteredFilter) return;

  bumpTotals(draft, 1);
  if (isNewestFirstFirstPage(args, spec)) insertAtTop(draft, record, args);
}

// ── Public entry points ────────────────────────────────────────────────────
export function applyOrderCreated(
  dispatch: AppDispatch,
  state: RootState,
  order: any,
) {
  const cachedArgs = orderApiService.util.selectCachedArgsForQuery(
    state as any,
    "getAllAdminOrders",
  );

  for (const args of cachedArgs) {
    dispatch(
      orderApiService.util.updateQueryData(
        "getAllAdminOrders" as never,
        args as never,
        ((draft: ListEnvelope) =>
          applyCreated(draft, order, args as ListArgs, ORDER_LIST_SPEC)) as never,
      ),
    );
  }
}

export function applyOrderUpdated(
  dispatch: AppDispatch,
  state: RootState,
  order: any,
  meta?: RealtimeEnvelopeMeta,
) {
  const cachedArgs = orderApiService.util.selectCachedArgsForQuery(
    state as any,
    "getAllAdminOrders",
  );

  for (const args of cachedArgs) {
    dispatch(
      orderApiService.util.updateQueryData(
        "getAllAdminOrders" as never,
        args as never,
        ((draft: ListEnvelope) =>
          applyUpdated(
            draft,
            order,
            args as ListArgs,
            ORDER_LIST_SPEC,
            meta,
          )) as never,
      ),
    );
  }

  // Keep an open order-detail page live too.
  const detailArgs = orderApiService.util.selectCachedArgsForQuery(
    state as any,
    "getAdminOrder",
  );
  for (const args of detailArgs) {
    if ((args as { id?: string })?.id !== order?.id) continue;
    dispatch(
      orderApiService.util.updateQueryData(
        "getAdminOrder" as never,
        args as never,
        ((draft: { data?: any }) => {
          if (draft && "data" in draft) draft.data = order;
        }) as never,
      ),
    );
  }
}

export function applyPaymentCreated(
  dispatch: AppDispatch,
  state: RootState,
  payment: any,
) {
  const cachedArgs = paymentApiService.util.selectCachedArgsForQuery(
    state as any,
    "getPayments",
  );

  for (const args of cachedArgs) {
    dispatch(
      paymentApiService.util.updateQueryData(
        "getPayments" as never,
        args as never,
        ((draft: ListEnvelope) =>
          applyCreated(
            draft,
            payment,
            args as ListArgs,
            PAYMENT_LIST_SPEC,
          )) as never,
      ),
    );
  }
}

export function applyPaymentUpdated(
  dispatch: AppDispatch,
  state: RootState,
  payment: any,
  meta?: RealtimeEnvelopeMeta,
) {
  const cachedArgs = paymentApiService.util.selectCachedArgsForQuery(
    state as any,
    "getPayments",
  );

  for (const args of cachedArgs) {
    dispatch(
      paymentApiService.util.updateQueryData(
        "getPayments" as never,
        args as never,
        ((draft: ListEnvelope) =>
          applyUpdated(
            draft,
            payment,
            args as ListArgs,
            PAYMENT_LIST_SPEC,
            meta,
          )) as never,
      ),
    );
  }

  const detailArgs = paymentApiService.util.selectCachedArgsForQuery(
    state as any,
    "getPayment",
  );
  for (const args of detailArgs) {
    if ((args as { id?: string })?.id !== payment?.id) continue;
    dispatch(
      paymentApiService.util.updateQueryData(
        "getPayment" as never,
        args as never,
        ((draft: { data?: any }) => {
          if (draft && "data" in draft) draft.data = payment;
        }) as never,
      ),
    );
  }
}

/**
 * Gap recovery. After a disconnect the client may have missed events, so the
 * caches are invalidated once on reconnect — RTK Query then refetches only the
 * queries a mounted component is actually subscribed to. This is the single
 * place a refetch is intentional.
 */
export function resyncAfterReconnect(dispatch: AppDispatch) {
  dispatch(orderApiService.util.invalidateTags(["Order"]));
  dispatch(paymentApiService.util.invalidateTags(["Payment"]));
}
