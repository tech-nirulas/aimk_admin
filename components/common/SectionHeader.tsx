import { Box, Typography, useTheme } from "@mui/material";

const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.main,
        px: 2,
        py: 0.75,
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
};

export default SectionHeader;