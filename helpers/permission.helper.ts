/**
 * Check if the logged-in user has permission to access a specific route path.
 *
 * Rules:
 * 1. If user is super_admin or admin -> Full access to all modules.
 * 2. If path is '/admin' (Dashboard) -> Always allowed.
 * 3. Checks if user.role.roleModules contains a module with path matching target path.
 */
export function hasModuleAccess(user: any, path: string): boolean {
  if (!user) return false;

  const roleName = user.role?.name?.toLowerCase();
  if (roleName === 'super_admin' || roleName === 'admin' || roleName === 'superadmin') {
    return true;
  }

  // Dashboard root path is always accessible to logged-in admin users
  if (path === '/admin' || path === '/admin/') {
    return true;
  }

  const roleModules = user.role?.roleModules || [];
  if (!Array.isArray(roleModules) || roleModules.length === 0) {
    return false;
  }

  return roleModules.some((rm: any) => {
    if (rm.canView === false && rm.canAccess === false) return false;
    const modulePath = rm.module?.path;
    if (!modulePath) return false;

    // Exact match or sub-route prefix match (e.g. /admin/orders/123 matches /admin/orders)
    return path === modulePath || path.startsWith(`${modulePath}/`);
  });
}
