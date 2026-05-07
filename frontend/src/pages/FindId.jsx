import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FindId() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [emailSent, setEmailSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [userIds, setUserIds] = useState([]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("요청 시간이 초과되었습니다. 임시 코드를 재발급해주세요.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSendCode = async () => {
    setError("");
    setMessage("");
    setVerified(false);
    setUserIds([]);
    setCode("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/find-id/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "이메일 인증 요청에 실패했습니다.");
        return;
      }

      setEmailSent(true);
      setTimeLeft(300);
      setMessage("임시 코드가 이메일로 전송되었습니다.");
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setMessage("");
    setUserIds([]);

    if (!emailSent) {
      setError("먼저 임시 코드를 발급받아주세요.");
      return;
    }

    if (timeLeft <= 0) {
      setError("요청 시간이 초과되었습니다. 임시 코드를 재발급해주세요.");
      return;
    }

    if (!code.trim()) {
      setError("임시 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/find-id/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "임시 코드 검증에 실패했습니다.");
        return;
      }

      setVerified(true);
      setUserIds(data.userIds || []);
      setMessage("이메일 인증이 완료되었습니다.");
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
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
                color: "inherit",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                "&:hover": {
                  opacity: 0.75,
                },
              }}
            >
              🍃 NEARGARDEN
            </Typography>

            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              가입한 이메일로 본인 인증 후 아이디를 확인하세요.
            </Typography>

            <Stack spacing={2.2}>
              <TextField
                label="이메일"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={verified}
                error={!!error && !email.trim()}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleSendCode}
                disabled={verified}
                size="large"
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {emailSent ? "임시 코드 재발급" : "임시 코드 발송"}
              </Button>

              {emailSent && (
                <>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <TextField
                      label="임시 코드 입력"
                      fullWidth
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={verified}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        },
                      }}
                    />

                    <Button
                      variant="outlined"
                      onClick={handleSendCode}
                      disabled={verified}
                      sx={{
                        minWidth: { xs: "100%", sm: 110 },
                        height: 56,
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      재발급
                    </Button>
                  </Stack>

                  <Typography
                    align="right"
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: timeLeft <= 60 ? "error.main" : "text.secondary",
                      mt: -0.5,
                    }}
                  >
                    남은 시간 {formatTime(timeLeft)}
                  </Typography>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleVerifyCode}
                    disabled={verified}
                    size="large"
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    인증 확인
                  </Button>
                </>
              )}

              {message && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {verified && userIds.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={1.5}>
                    가입된 아이디 목록
                  </Typography>

                  <List sx={{ py: 0 }}>
                    {userIds.map((id, index) => (
                      <ListItem
                        key={index}
                        divider={index !== userIds.length - 1}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={id}
                          primaryTypographyProps={{
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {verified && userIds.length === 0 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  인증은 완료되었지만 해당 이메일에 연결된 아이디가 없습니다.
                </Alert>
              )}

              <Stack
                direction="row"
                justifyContent="center"
                spacing={2}
                sx={{ mt: 1 }}
              >
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  로그인
                </MuiLink>

                <Typography color="text.disabled">|</Typography>

                <MuiLink
                  component={Link}
                  to="/signup"
                  underline="hover"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  회원가입
                </MuiLink>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default FindId;
