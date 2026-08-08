"use client";
import React from 'react';
import { ProtectedComponent as PackageProtectedComponent, Permission } from '@aimk/permissions';
import { useSelector } from 'react-redux';

export interface ProtectedComponentProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedComponent({
  permission,
  fallback = null,
  children,
}: ProtectedComponentProps) {
  const permissions = useSelector((state: any) => state.authReducer?.permissions) || [];

  return (
    <PackageProtectedComponent
      permission={permission}
      userPermissions={permissions}
      fallback={fallback}
    >
      {children}
    </PackageProtectedComponent>
  );
}
