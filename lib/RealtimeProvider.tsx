// lib/RealtimeProvider.tsx
"use client";

import {
  applyOrderCreated,
  applyOrderUpdated,
  applyPaymentCreated,
  applyPaymentUpdated,
  resyncAfterReconnect,
} from "@/features/realtime/realtimeCache";
import { refreshAccessTokenForSocket } from "@/features/realtime/refreshAccessToken";
import {
  createEventDeduper,
  REALTIME_ERROR_EVENT,
  REALTIME_EVENTS,
  REALTIME_READY_EVENT,
  RealtimeEnvelope,
  RealtimeErrorPayload,
  RealtimeReadyPayload,
} from "@/features/realtime/realtimeEvents";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "@/features/realtime/socketClient";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector, type RootState } from "./store";

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unauthorized";

interface RealtimeContextValue {
  status: RealtimeStatus;
  isConnected: boolean;
  /** Rooms this admin's permissions granted, e.g. ["admin:orders"]. */
  rooms: string[];
  /** Timestamp of the most recent applied event, for "live" indicators. */
  lastEventAt: number | null;
  errorMessage: string | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "idle",
  isConnected: false,
  rooms: [],
  lastEventAt: null,
  errorMessage: null,
});

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Auth failures that are worth retrying with a refreshed access token.
 * Access tokens live 15 minutes, so `TOKEN_EXPIRED` is routine, not an edge case.
 */
const RETRYABLE_AUTH_CODES = new Set([
  "MISSING_TOKEN",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "TOKEN_INVALIDATED",
  "PERMISSION_STALE",
  "HANDSHAKE_FAILED",
]);

/** Failures where reconnecting with any token would be rejected all the same. */
const FATAL_AUTH_CODES = new Set([
  "FORBIDDEN",
  "ACCOUNT_DISABLED",
  "USER_NOT_FOUND",
  "ROLE_NOT_FOUND",
]);

const MANUAL_RETRY_BASE_MS = 1000;
const MANUAL_RETRY_MAX_MS = 15000;

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const isAuthenticated = useAppSelector(
    (state: any) => state.authReducer?.isAuthenticated ?? false,
  );

  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [rooms, setRooms] = useState<string[]>([]);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deduper = useRef(createEventDeduper());
  const lastErrorCode = useRef<string | null>(null);
  const hasConnectedBefore = useRef(false);
  const manualRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualRetryAttempts = useRef(0);

  const clearManualRetry = useCallback(() => {
    if (manualRetryTimer.current) {
      clearTimeout(manualRetryTimer.current);
      manualRetryTimer.current = null;
    }
  }, []);

  /**
   * The server closes the socket when the access token expires. socket.io does
   * not auto-reconnect after a server-initiated disconnect, so refresh the
   * token and reconnect manually with exponential backoff.
   */
  const scheduleManualReconnect = useCallback(() => {
    clearManualRetry();
    const attempt = manualRetryAttempts.current++;
    const delay = Math.min(
      MANUAL_RETRY_BASE_MS * 2 ** attempt,
      MANUAL_RETRY_MAX_MS,
    );

    manualRetryTimer.current = setTimeout(async () => {
      // Refresh first: the server closes the socket at token expiry, and the
      // reconnect handshake re-reads the token from storage.
      await refreshAccessTokenForSocket();
      connectSocket();
    }, delay);
  }, [clearManualRetry]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearManualRetry();
      deduper.current.reset();
      hasConnectedBefore.current = false;
      manualRetryAttempts.current = 0;
      disconnectSocket();
      setStatus("idle");
      setRooms([]);
      setErrorMessage(null);
      return;
    }

    const socket = getSocket();
    setStatus("connecting");

    const handleConnect = () => {
      lastErrorCode.current = null;
      manualRetryAttempts.current = 0;
      clearManualRetry();
      setStatus("connected");
      setErrorMessage(null);

      // Only after a *re*connect: events may have been missed while offline,
      // so let RTK Query refetch the queries that are actually mounted.
      if (hasConnectedBefore.current) {
        resyncAfterReconnect(dispatch);
      }
      hasConnectedBefore.current = true;
    };

    const handleReady = (payload: RealtimeReadyPayload) => {
      setRooms(payload?.rooms ?? []);
    };

    const handleDisconnect = (reason: string) => {
      setRooms([]);
      if (reason === "io server disconnect") {
        // Server closed it (usually an expired token).
        const code = lastErrorCode.current;
        if (code && FATAL_AUTH_CODES.has(code)) {
          setStatus("unauthorized");
          return;
        }
        setStatus("reconnecting");
        scheduleManualReconnect();
        return;
      }
      if (reason === "io client disconnect") {
        setStatus("disconnected");
        return;
      }
      // Transport-level drop — socket.io reconnects on its own.
      setStatus("reconnecting");
    };

    const handleConnectError = () => {
      // Server unreachable. REST keeps working; socket.io keeps retrying.
      setStatus("reconnecting");
    };

    const handleRealtimeError = (payload: RealtimeErrorPayload) => {
      lastErrorCode.current = payload?.code ?? null;
      setErrorMessage(payload?.message ?? "Realtime connection rejected");
      if (payload?.code && FATAL_AUTH_CODES.has(payload.code)) {
        setStatus("unauthorized");
      } else if (payload?.code && RETRYABLE_AUTH_CODES.has(payload.code)) {
        setStatus("reconnecting");
      }
    };

    const markEvent = () => setLastEventAt(Date.now());

    const handleOrderCreated = (envelope: RealtimeEnvelope) => {
      if (!deduper.current.accept(envelope?.eventId)) return;
      applyOrderCreated(dispatch, store.getState(), envelope.data);
      markEvent();
    };

    const handleOrderUpdated = (envelope: RealtimeEnvelope) => {
      if (!deduper.current.accept(envelope?.eventId)) return;
      applyOrderUpdated(
        dispatch,
        store.getState(),
        envelope.data,
        envelope.meta,
      );
      markEvent();
    };

    const handlePaymentCreated = (envelope: RealtimeEnvelope) => {
      if (!deduper.current.accept(envelope?.eventId)) return;
      applyPaymentCreated(dispatch, store.getState(), envelope.data);
      markEvent();
    };

    const handlePaymentUpdated = (envelope: RealtimeEnvelope) => {
      if (!deduper.current.accept(envelope?.eventId)) return;
      applyPaymentUpdated(
        dispatch,
        store.getState(),
        envelope.data,
        envelope.meta,
      );
      markEvent();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on(REALTIME_READY_EVENT, handleReady);
    socket.on(REALTIME_ERROR_EVENT, handleRealtimeError);
    socket.on(REALTIME_EVENTS.ORDER_CREATED, handleOrderCreated);
    socket.on(REALTIME_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    socket.on(REALTIME_EVENTS.PAYMENT_CREATED, handlePaymentCreated);
    socket.on(REALTIME_EVENTS.PAYMENT_UPDATED, handlePaymentUpdated);

    connectSocket();

    return () => {
      clearManualRetry();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off(REALTIME_READY_EVENT, handleReady);
      socket.off(REALTIME_ERROR_EVENT, handleRealtimeError);
      socket.off(REALTIME_EVENTS.ORDER_CREATED, handleOrderCreated);
      socket.off(REALTIME_EVENTS.ORDER_UPDATED, handleOrderUpdated);
      socket.off(REALTIME_EVENTS.PAYMENT_CREATED, handlePaymentCreated);
      socket.off(REALTIME_EVENTS.PAYMENT_UPDATED, handlePaymentUpdated);
      socket.disconnect();
    };
  }, [
    isAuthenticated,
    dispatch,
    store,
    clearManualRetry,
    scheduleManualReconnect,
  ]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      isConnected: status === "connected",
      rooms,
      lastEventAt,
      errorMessage,
    }),
    [status, rooms, lastEventAt, errorMessage],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
