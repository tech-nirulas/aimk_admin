import React, { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';

interface ConfirmDialogContextValue {
  openDialog: (message: string, onConfirm: () => Promise<void> | void) => void;
  closeDialog: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue>({
  openDialog: () => {},
  closeDialog: () => {},
});

export const useConfirmDialog = () => useContext(ConfirmDialogContext);

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export const ConfirmDialogProvider: FC<ConfirmDialogProviderProps> = ({ children }) => {
  const [dialogProps, setDialogProps] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    message: '',
    onConfirm: async () => {},
  });

  const [loading, setLoading] = useState(false);

  const openDialog = useCallback((message: string, onConfirm: () => Promise<void> | void) => {
    setDialogProps({
      open: true,
      message,
      onConfirm,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogProps((prev) => ({ ...prev, open: false }));
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await dialogProps.onConfirm();
    } finally {
      setLoading(false);
      closeDialog();
    }
  }, [dialogProps, closeDialog]);

  return (
    <ConfirmDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog open={dialogProps.open} onClose={closeDialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>{dialogProps.message}</DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} variant='contained' color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant='contained' color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} color='primary' /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};
