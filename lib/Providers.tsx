// app/providers.tsx
"use client";

import { ModalProvider } from "@/lib/ModalProvider";
import ReduxProvider from "@/lib/ReduxProvider";
import ThemeRegistry from "@/lib/ThemeRegistry";
import { ToastProvider } from "@/lib/ToastProvider";
import { FormDrawerProvider } from "./FormDrawerProvider";
import { AuthProvider } from "./AuthProvider";
import { ConfirmDialogProvider } from "./DialogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeRegistry>
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
      </ThemeRegistry>
    </ReduxProvider>
  );
}