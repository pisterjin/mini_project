import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function MainHeader({
  searchKeyword = "",
  onChangeSearch,
  onSearch,
}) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#222",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px",
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* 로고 영역 */}
        <Box sx={{ minWidth: 180 }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.3,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.7,
              },
            }}
          >
            🍃 NEARGARDEN
          </Typography>
        </Box>

        {/* 검색 영역 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 620,
              display: "flex",
              alignItems: "stretch",
              border: "1px solid",
              borderColor: "#dcdcdc",
              borderRadius: 3,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <TextField
              fullWidth
              placeholder="공원명 또는 지역을 검색하세요"
              value={searchKeyword}
              onChange={onChangeSearch}
              variant="outlined"
              size="small"
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearch) {
                  onSearch();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: 0,
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  px: 2,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={onSearch}
              sx={{
                minWidth: 96,
                height: 44,
                borderRadius: 0,
                boxShadow: "none",
                fontWeight: 700,
                px: 3,
                whiteSpace: "nowrap",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              검색
            </Button>
          </Box>
        </Box>

        {/* 로그인 영역 */}
        <Box
          sx={{
            minWidth: 180,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            component={Link}
            to="/login"
            sx={{
              borderRadius: 2,
              px: 2.5,
              height: 40,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            로그인
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
