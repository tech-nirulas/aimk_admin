import FormDrawer from '@/components/ui/FormDrawer';
import { FormDrawerProps } from '@/types/form_drawer_props.type';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface FormDrawerContextValue {
  openDrawer: (props: Omit<FormDrawerProps, 'open' | 'onClose'>) => void;
  closeDrawer: () => void;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
}

const FormDrawerContext = createContext<FormDrawerContextValue>({
  openDrawer: () => { },
  closeDrawer: () => { },
  isEditing: false,
  setIsEditing: () => { },
});

export const useFormDrawer = () => useContext(FormDrawerContext);

interface FormDrawerProviderProps {
  children: ReactNode;
}

export const FormDrawerProvider: FC<FormDrawerProviderProps> = ({ children }) => {
  const [drawerProps, setDrawerProps] = useState<FormDrawerProps>({
    open: false,
    anchor: 'right',
    drawerName: '',
    isEditing: false,
    dispatchFunctions: [],
    children: null,
    width: 400,
    onClose: () =>
      setDrawerProps((prev) => ({
        ...prev,
        open: false,
      })),
  });

  const openDrawer = useCallback(
    (props: Omit<FormDrawerProps, 'open' | 'onClose'>) => {
      setDrawerProps({
        ...props,
        open: true,
        isEditing: props.isEditing || false,
        onClose: () =>
          setDrawerProps((prev) => ({
            ...prev,
            open: false,
            isEditing: false,
          })),
      });
    },
    [setDrawerProps]
  );

  const closeDrawer = useCallback(() => {
    setDrawerProps((prev) => ({
      ...prev,
      open: false,
    }));
  }, [setDrawerProps]);

  const setIsEditing = useCallback((value: boolean) => {
    setDrawerProps((prev) => ({
      ...prev,
      isEditing: value,
    }));
  }, [setDrawerProps]);

  return (
    <FormDrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
        isEditing: drawerProps.isEditing,
        setIsEditing,
      }}
    >
      {children}
      <FormDrawer {...drawerProps} />
    </FormDrawerContext.Provider>
  );
};
