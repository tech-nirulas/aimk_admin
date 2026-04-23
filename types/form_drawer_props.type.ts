import { ReactNode } from "react";

export interface FormDrawerProps {
  open: boolean;
  anchor: 'left' | 'right' | 'top' | 'bottom';
  drawerName: string;
  isEditing?: boolean;
  children?: ReactNode;
  width?: number;
  onClose?: () => void;
  dispatchFunctions?: Array<any>;
}