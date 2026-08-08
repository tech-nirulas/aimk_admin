"use client";
import { useSelector } from 'react-redux';
import { usePermission as usePackagePermission, Permission } from '@aimk/permissions';
import { RootState } from '@/store/store';

export function usePermission() {
  const permissions = useSelector((state: RootState) => (state as any).authReducer?.permissions) || [];
  const { can, isSuperAdmin } = usePackagePermission(permissions as any);

  return {
    can,
    permissions,
    isSuperAdmin,
    hasPermission: (permission: Permission) => can(permission),
  };
}
