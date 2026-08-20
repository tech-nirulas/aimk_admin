// features/realtime/socketClient.ts
"use client";

import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { io, Socket } from "socket.io-client";
import { REALTIME_NAMESPACE } from "./realtimeEvents";

let socket: Socket | null = null;

/**
 * Single shared connection for the whole admin panel.
 *
 * The auth token is supplied through a callback rather than a fixed value, so
 * socket.io re-reads it on every reconnection attempt. That means a token
 * refreshed by `baseQueryWithReauth`/`AuthProvider` is picked up automatically
 * on the next reconnect, and a socket the server closed at token expiry comes
 * straight back with a valid token.
 */
export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(`${API_BASE_URL}${REALTIME_NAMESPACE}`, {
    // Manual — RealtimeProvider connects only once the admin is authenticated.
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
    timeout: 10000,
    auth: (cb: (data: Record<string, unknown>) => void) => {
      getDecryptedToken()
        .then((token) => cb({ token: token ?? null }))
        .catch(() => cb({ token: null }));
    },
  });

  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

/** Fully tears the connection down — used on logout. */
export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
