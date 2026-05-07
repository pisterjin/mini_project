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
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const ID_REGEX = /^[A-Za-z0-9]{8,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_REGEX = /^\d{6}$/;
const EXPIRE_TIME = 300; // 5분 = 300초

export default function FindPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    email: "",
    code: "",
  });

  const [errors, setErrors] = useState({
    userId: "",
    email: "",
    code: "",
  });

  const [alertInfo, setAlertInfo] = useState({
    type: "",
    message: "",
  });

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [matchedIds, setMatchedIds] = useState([]);

  // 실제 서버에서는 state에 인증코드 저장하면 안 됨
  // 지금은 화면 테스트용 mock 데이터
  const [mockServerCode, setMockServerCode] = useState("");

  useEffect(() => {
    let timer = null;

    if (isCodeSent && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }

    if (isCodeSent && remainingTime === 0) {
      setAlertInfo({
        type: "error",
        message: "요청 시간이 초과되었습니다. 임시 코드를 재발급해주세요.",
      });
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCodeSent, remainingTime]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const clearAlert = () => {
    setAlertInfo({ type: "", message: "" });
  };

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

    clearAlert();
  };

  const validateUserInfo = () => {
    const newErrors = {
      userId: "",
      email: "",
      code: "",
    };
    let isValid = true;

    if (!form.userId.trim()) {
      newErrors.userId = "아이디를 입력해주세요.";
      isValid = false;
    } else if (!ID_REGEX.test(form.userId.trim())) {
      newErrors.userId = "아이디는 영문/숫자 8~12자로 입력해주세요.";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
      isValid = false;
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
      isValid = false;
    }

    setErrors((prev) => ({
      ...prev,
      userId: newErrors.userId,
      email: newErrors.email,
    }));

    return isValid;
  };

  const validateCodeInput = () => {
    const newErrors = {
      ...errors,
      code: "",
    };
    let isValid = true;

    if (!form.code.trim()) {
      newErrors.code = "임시 코드를 입력해주세요.";
      isValid = false;
    } else if (!CODE_REGEX.test(form.code.trim())) {
      newErrors.code = "임시 코드는 6자리 숫자여야 합니다.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const generateMockCode = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const handleSendCode = async () => {
    clearAlert();
    setIsVerified(false);
    setMatchedIds([]);

    if (!validateUserInfo()) return;

    try {
      // ===== mock 처리 =====
      if (form.userId.trim() === "unknown") {
        throw new Error("입력하신 아이디가 존재하지 않습니다.");
      }

      if (form.email.trim() === "none@none.com") {
        throw new Error("입력하신 이메일이 존재하지 않습니다.");
      }

      if (
        form.userId.trim() === "testuser" &&
        form.email.trim() !== "test@gmail.com"
      ) {
        throw new Error("입력하신 아이디와 이메일 정보가 일치하지 않습니다.");
      }

      const newCode = generateMockCode();
      setMockServerCode(newCode);

      console.log("테스트용 인증코드:", newCode);

      setIsCodeSent(true);
      setRemainingTime(EXPIRE_TIME);
      setForm((prev) => ({
        ...prev,
        code: "",
      }));

      setAlertInfo({
        type: "success",
        message: "임시 코드가 이메일로 전송되었습니다.",
      });
    } catch (error) {
      setAlertInfo({
        type: "error",
        message: error.message || "임시 코드 전송에 실패했습니다.",
      });
    }
  };

  const handleResendCode = async () => {
    clearAlert();

    if (!validateUserInfo()) return;

    try {
      const newCode = generateMockCode();
      setMockServerCode(newCode);

      console.log("재발급 테스트용 인증코드:", newCode);

      setRemainingTime(EXPIRE_TIME);
      setForm((prev) => ({
        ...prev,
        code: "",
      }));
      setIsVerified(false);
      setMatchedIds([]);

      setAlertInfo({
        type: "success",
        message: "임시 코드가 재발급되었습니다.",
      });
    } catch (error) {
      setAlertInfo({
        type: "error",
        message: error.message || "임시 코드 재발급에 실패했습니다.",
      });
    }
  };

  const handleVerifyCode = async () => {
    clearAlert();

    if (!validateCodeInput()) return;

    if (remainingTime <= 0) {
      setAlertInfo({
        type: "error",
        message: "요청 시간이 초과되었습니다. 임시 코드를 재발급해주세요.",
      });
      return;
    }

    try {
      if (form.code.trim() !== mockServerCode) {
        throw new Error("임시 코드가 일치하지 않습니다.");
      }

      const mockIds = [form.userId.trim()];
      setMatchedIds(mockIds);
      setIsVerified(true);

      setAlertInfo({
        type: "success",
        message: "이메일 인증이 완료되었습니다.",
      });
    } catch (error) {
      setAlertInfo({
        type: "error",
        message: error.message || "임시 코드 인증에 실패했습니다.",
      });
    }
  };

  const handleMoveResetPassword = () => {
    navigate("/reset-password");
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
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              가입 시 등록한 아이디와 이메일로 본인 확인 후 비밀번호를
              재설정해주세요.
            </Typography>

            <Stack spacing={3}>
              <Divider />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="아이디"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  error={!!errors.userId}
                  helperText={errors.userId}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="이메일"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSendCode}
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
                  임시 코드 전송
                </Button>
              </Stack>

              {isCodeSent && (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="임시 코드 입력"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      error={!!errors.code}
                      helperText={errors.code}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        },
                      }}
                    />

                    <Button
                      variant="outlined"
                      onClick={handleResendCode}
                      sx={{
                        minWidth: 96,
                        height: 56,
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                        fontWeight: 700,
                      }}
                    >
                      재발급
                    </Button>

                    <Box
                      sx={{
                        minWidth: 78,
                        height: 56,
                        px: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatTime(remainingTime)}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleVerifyCode}
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
                </Stack>
              )}

              {alertInfo.message && (
                <Alert severity={alertInfo.type || "info"}>
                  {alertInfo.message}
                </Alert>
              )}

              {isVerified && (
                <Box
                  sx={{
                    mt: 1,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#f8f9fb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    인증된 이메일에 해당하는 아이디
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {matchedIds.map((id, index) => (
                      <Box
                        key={`${id}-${index}`}
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: 2,
                          bgcolor: "#fff",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography variant="body1">{id}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "none",
                      },
                    }}
                    onClick={handleMoveResetPassword}
                  >
                    비밀번호 재설정하기
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
