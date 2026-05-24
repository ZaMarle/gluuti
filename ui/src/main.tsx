import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App.tsx';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#212121', paper: '#2f2f2f' },
    primary: { main: '#10a37f' },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    text: { primary: '#ececec', secondary: '#8e8ea0' },
    divider: '#404040',
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid #404040' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#8e8ea0',
          fontWeight: 700,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderColor: '#404040',
        },
        root: { borderColor: '#404040' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#404040' },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { borderColor: '#404040' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundImage: 'none', bgcolor: '#2f2f2f', border: '1px solid #404040' },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
