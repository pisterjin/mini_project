import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5FAF6F", // 부드러운 공원 초록
      light: "#8DCC98",
      dark: "#4A9660",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#A7D7A9", // 연한 잔디색
      light: "#D7EFD8",
      dark: "#7FBE83",
      contrastText: "#2F5D34",
    },
    success: {
      main: "#4CAF50",
    },
    warning: {
      main: "#F4B942",
    },
    error: {
      main: "#E57373",
    },
    background: {
      default: "#F7FBF6", // 전체 배경
      paper: "#FFFFFF", // 카드 배경
    },
    text: {
      primary: "#2F3A30",
      secondary: "#6B7A6D",
    },
  },

  typography: {
    fontFamily: `"Noto Sans KR", "Roboto", "Arial", sans-serif`,
    h4: {
      fontWeight: 700,
      color: "#3F6B46",
    },
    h6: {
      fontWeight: 600,
      color: "#4A5F4D",
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7FBF6",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: "0 12px 30px rgba(95, 175, 111, 0.10)",
          border: "1px solid rgba(167, 215, 169, 0.35)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingTop: 11,
          paddingBottom: 11,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "none",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FCFEFC",
          borderRadius: 14,
          "& fieldset": {
            borderColor: "#D7E7D8",
          },
          "&:hover fieldset": {
            borderColor: "#9BCB9F",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#5FAF6F",
            borderWidth: 2,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6B7A6D",
          "&.Mui-focused": {
            color: "#5FAF6F",
          },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#55685A",
          "&.Mui-focused": {
            color: "#5FAF6F",
          },
        },
      },
    },
  },
});

export default theme;
