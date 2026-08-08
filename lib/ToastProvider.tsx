"use client";

import { Alert, AlertColor, Slide, Snackbar } from '@mui/material';
import React, { createContext, ReactNode, useState } from 'react';

interface ToastContextType {
  showToast: (message: string, type: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showToast = (msg: string, type: AlertColor) => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const showSuccess = (msg: string) => showToast(msg, 'success');
  const showError = (msg: string) => showToast(msg, 'error');
  const showInfo = (msg: string) => showToast(msg, 'info');
  const showWarning = (msg: string) => showToast(msg, 'warning');

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: 'up' } }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="standard"
          elevation={4}
          sx={{
            borderRadius: '12px',
            padding: '12px 18px',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: 3,
            minWidth: '300px',
            maxWidth: '90vw',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
