import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";

/**
 * Downloads the CSV export of an entity's admin list (all rows matching the
 * current filters, generated server-side) via GET /export/<entity>.
 */
export async function exportCsv(
  entity: string,
  query: Record<string, any> = {},
): Promise<void> {
  const token = await getDecryptedToken();

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }

  const response = await fetch(`${API_BASE_URL}/export/${entity}?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Session expired — please log in again.");
    if (response.status === 403) throw new Error("You don't have permission to export this data.");
    throw new Error(`Export failed (HTTP ${response.status}).`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
