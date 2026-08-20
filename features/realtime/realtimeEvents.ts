// features/realtime/realtimeEvents.ts
//
// Mirror of `src/modules/realtime/realtime.constants.ts` in aimk_backend.
// Keep both files in sync when adding an event.

export const REALTIME_NAMESPACE = "/realtime";

/** Permission-scoped rooms the backend assigns at handshake time. */
export const REALTIME_ROOMS = {
  ORDERS: "admin:orders",
  PAYMENTS: "admin:payments",
} as const;

export const REALTIME_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_UPDATED: "ORDER_UPDATED",
  PAYMENT_CREATED: "PAYMENT_CREATED",
  PAYMENT_UPDATED: "PAYMENT_UPDATED",
} as const;

export const REALTIME_READY_EVENT = "REALTIME_READY";
export const REALTIME_ERROR_EVENT = "REALTIME_ERROR";

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export interface RealtimeEnvelopeMeta {
  /** Status the record held before this change (its own status field). */
  previousStatus?: string | null;
  previousPaymentStatus?: string | null;
  source?: string;
}

export interface RealtimeEnvelope<TData = any> {
  eventId: string;
  event: RealtimeEventName;
  emittedAt: string;
  data: TData;
  meta?: RealtimeEnvelopeMeta;
}

export interface RealtimeReadyPayload {
  userId: string;
  rooms: string[];
  serverTime: string;
}

export interface RealtimeErrorPayload {
  code: string;
  message: string;
}

/**
 * Guards against the same state change being applied twice — socket.io can
 * redeliver on a flaky link, and two backend paths (the Razorpay webhook and
 * the frontend verify-payment callback) can describe the same transition.
 */
export function createEventDeduper(capacity = 500) {
  const seen = new Set<string>();
  const order: string[] = [];

  return {
    /** Returns true the first time an id is seen, false for repeats. */
    accept(eventId: string | undefined): boolean {
      if (!eventId) return true; // nothing to dedupe on — let it through
      if (seen.has(eventId)) return false;
      seen.add(eventId);
      order.push(eventId);
      if (order.length > capacity) {
        const evicted = order.shift();
        if (evicted) seen.delete(evicted);
      }
      return true;
    },
    reset() {
      seen.clear();
      order.length = 0;
    },
  };
}
