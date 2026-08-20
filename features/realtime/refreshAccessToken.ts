// features/realtime/refreshAccessToken.ts
"use client";

import {
  getRefreshToken,
  saveEncryptedToken,
  saveRefreshToken,
} from "@/helpers/encryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";

/**
 * Refreshes the stored access token for the socket's benefit.
 *
 * Deliberately standalone: importing the RTK Query baseQuery here would pull
 * this module into the existing `baseQuery → authSlice → authApiService`
 * import cycle and trip a TDZ error at load time. Persisting the new token is
 * all the socket needs — its `auth` callback re-reads storage on every
 * reconnection attempt.
 */
export async function refreshAccessTokenForSocket(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const envelope = await res.json();
    const data = envelope?.data || envelope;
    if (!data?.accessToken) return null;

    await saveEncryptedToken(data.accessToken);
    if (data.refreshToken) saveRefreshToken(data.refreshToken);

    return data.accessToken as string;
  } catch {
    return null;
  }
}
