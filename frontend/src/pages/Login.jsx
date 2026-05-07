import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    userId: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!form.userId.trim()) {
      newErrors.userId = "아이디를 입력해주세요.";
      isValid = false;
    }

    if (!form.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: form.userId.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const loginUser = {
          userId: form.userId.trim(),
          isLogin: true,
        };

        sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        alert(data.message || "로그인 성공!");
        navigate("/");
      } else {
        alert(data.message || data.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f9faf9",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography
              component={Link}
              to="/"
              variant="h4"
              align="center"
              sx={{
                display: "block",
                fontWeight: 800,
                letterSpacing: 0.3,
                mb: 1.5,
                textDecoration: "none",
                color: "#1f2a1f",
              }}
            >
              🍃 NEARGARDEN
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              근린공원 서비스를 이용하려면 로그인해주세요.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="아이디"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  error={!!errors.userId}
                  helperText={errors.userId}
                />

                <TextField
                  fullWidth
                  label="비밀번호"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    mt: 1,
                    py: 1.3,
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  로그인
                </Button>
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ mt: 3, flexWrap: "wrap" }}
            >
              <MuiLink component={Link} to="/find-id" underline="hover">
                아이디 찾기
              </MuiLink>
              <Typography color="text.secondary">|</Typography>
              <MuiLink component={Link} to="/find-password" underline="hover">
                비밀번호 재설정
              </MuiLink>
              <Typography color="text.secondary">|</Typography>
              <MuiLink component={Link} to="/signup" underline="hover">
                회원가입
              </MuiLink>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
