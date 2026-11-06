"use client";

import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

export interface ModalProps {
  open: boolean;
  title?: string;
  modalName?: string;
  hideHeader?: boolean;
  content?: ReactNode;
  children?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  fullWidth?: boolean;
  isEditing?: boolean;
  dispatchFunctions?: Array<any>;
  disableBackdropClick?: boolean;
  onClose?: () => void;
}

export interface ModalContextValue {
  openModal: (props: Omit<ModalProps, 'open' | 'onClose'>) => void;
  closeModal: () => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
  isEditing: false,
  setIsEditing: () => {},
});

export const useModal = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [modalProps, setModalProps] = useState<ModalProps>({
    open: false,
    title: '',
    modalName: '',
    hideHeader: false,
    content: null,
    children: null,
    maxWidth: 'lg',
    fullScreen: false,
    fullWidth: true,
    isEditing: false,
    dispatchFunctions: [],
    disableBackdropClick: false,
  });

  const handleClose = useCallback(() => {
    if (modalProps.dispatchFunctions && modalProps.dispatchFunctions.length > 0) {
      modalProps.dispatchFunctions.forEach((func) => {
        if (typeof func === 'function') {
          dispatch(func());
        }
      });
    }

    setModalProps((prev) => ({
      ...prev,
      open: false,
      isEditing: false,
    }));

    if (modalProps.onClose) {
      modalProps.onClose();
    }
  }, [dispatch, modalProps]);

  const openModal = useCallback(
    (props: Omit<ModalProps, 'open' | 'onClose'>) => {
      setModalProps({
        maxWidth: 'lg',
        fullWidth: true,
        fullScreen: false,
        hideHeader: false,
        isEditing: false,
        dispatchFunctions: [],
        disableBackdropClick: false,
        ...props,
        open: true,
        onClose: () => handleClose(),
      });
    },
    [handleClose]
  );

  const closeModal = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const setIsEditing = useCallback((value: boolean) => {
    setModalProps((prev) => ({
      ...prev,
      isEditing: value,
    }));
  }, []);

  const displayTitle = modalProps.title || modalProps.modalName;

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        isEditing: Boolean(modalProps.isEditing),
        setIsEditing,
      }}
    >
      {children}
      <Dialog
        open={modalProps.open}
        onClose={(_event, reason) => {
          if (modalProps.disableBackdropClick && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
            return;
          }
          handleClose();
        }}
        maxWidth={modalProps.maxWidth || 'lg'}
        fullScreen={modalProps.fullScreen}
        fullWidth={modalProps.fullWidth ?? true}
        slotProps={{
          paper: {
            sx: {
              height: modalProps.fullScreen ? '100%' : '90vh',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: modalProps.fullScreen ? 0 : 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {!modalProps.hideHeader && displayTitle && (
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              px: 3,
              borderBottom: 1,
              borderColor: 'divider',
              fontWeight: 700,
            }}
          >
            {displayTitle}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        )}
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {modalProps.children || modalProps.content}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
};
