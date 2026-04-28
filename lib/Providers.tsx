// app/providers.tsx
"use client";

import { ModalProvider } from "@/lib/ModalProvider";
import ReduxProvider from "@/lib/ReduxProvider";
import ThemeRegistry from "@/lib/ThemeRegistry";
import { ToastProvider } from "@/lib/ToastProvider";
import { FormDrawerProvider } from "./FormDrawerProvider";
import { AuthProvider } from "./AuthProvider";
import { ConfirmDialogProvider } from "./DialogProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeRegistry>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ToastProvider>
            <AuthProvider>
              <FormDrawerProvider>
                <ModalProvider>
                  <ConfirmDialogProvider>
                    {children}
                  </ConfirmDialogProvider>
                </ModalProvider>
              </FormDrawerProvider>
            </AuthProvider>
          </ToastProvider>
        </LocalizationProvider>
      </ThemeRegistry>
    </ReduxProvider>
  );
}