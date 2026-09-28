import { canAccess, getModuleByPath, type AnyPermission } from "@aimk/permissions";

/**
 * Route gate for the admin panel. Uses the same MODULE_REGISTRY and canAccess() as the sidebar, so
 * a module can never be visible in one and hidden in the other.
 *
 * The backend PermissionGuard remains the real security boundary; this is a UX affordance that
 * avoids rendering a page the user cannot use.
 */
export function hasModuleAccess(
  userPermissions: AnyPermission[] | undefined,
  path: string
): boolean {
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  if (permissions.length === 0) return false;

  // Unrouted admin pages fall back to the '/admin' root module, so a new page is reachable
  // rather than silently 403-ing until someone adds it to the registry.
  const module = getModuleByPath(path);
  if (!module) return true;

  return canAccess(permissions, module.requiredPermission);
}
