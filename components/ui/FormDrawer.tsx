import { useFormDrawer } from '@/lib/FormDrawerProvider';
import { FormDrawerProps } from '@/types/form_drawer_props.type';
import { ExitToApp } from '@mui/icons-material';
import { IconButton, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

const FormDrawer: FC<FormDrawerProps> = ({
  anchor,
  open,
  onClose,
  width,
  isEditing,
  dispatchFunctions,
  drawerName,
  children,
}) => {

  const theme = useTheme();
  const dispatch = useDispatch();
  const { setIsEditing } = useFormDrawer();

  const handleCloseFn = () => {
    if (isEditing) {
      dispatchFunctions?.map((func) => {
        dispatch(func())
      })
      setIsEditing(false);
    }
    onClose!();
  }

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={handleCloseFn}
      sx={{
        '& .MuiDrawer-paper': {
          overflowY: 'visible', // Changed from 'visible' to 'hidden'
          bottom: 0,
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          width: width,
          backgroundColor: theme.palette.background.default,
          height: "100%",
          display: 'flex',
          flexDirection: 'column'
        }}
        role="presentation"
      >
        {/* Fixed Header */}
        <Box className="flex justify-between items-center p-4 pl-10 shadow-md" sx={{ flexShrink: 0 }}>
          <Typography variant="h2">
            {drawerName}
          </Typography>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {children}
        </Box>

        {/* Close Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: '8px',
            left: '-22px',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            fontSize: '14px',
            border: '1px solid transparent',
            '&:hover': {
              border: `1px solid ${theme.palette.primary.main}`,
              backgroundColor: 'white',
              color: theme.palette.primary.main,
            },
          }}
          onClick={handleCloseFn}
        >
          <ExitToApp />
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default FormDrawer;