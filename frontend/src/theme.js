// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

// A custom theme for your app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A professional blue
    },
    secondary: {
      main: '#dc004e', // A contrasting pink/red
    },
    background: {
      default: '#f4f6f8', // A light grey background
      paper: '#ffffff', // White for cards, drawers, etc.
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;