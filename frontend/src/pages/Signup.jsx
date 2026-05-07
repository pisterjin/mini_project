import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

// =========================
// [임시 테스트용 데이터]
// 현재 백엔드 API가 완전히 연결되기 전까지
// 프론트에서 중복 여부를 흉내내기 위한 임시 배열
// 추후 실제 DB/API 연결 시 제거 가능
// =========================
const EXISTING_IDS = ["admin", "testuser", "hello123"];
const EXISTING_EMAILS = ["test@gmail.com", "admin@naver.com", "user@daum.net"];

// =========================
// [유효성 검사 정규식]
// 상세 메시지는 validateForm에서 분리해서 처리하고,
// 아래 정규식은 최종 검사용으로 유지
// =========================
const ID_REGEX = /^[A-Za-z0-9]{8,12}$/;
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
const NAME_REGEX = /^[가-힣a-zA-Z]+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const CODE_REGEX = /^\d{6}$/;

// =========================
// [이메일 인증코드 만료 시간]
// 300초 = 5분
// =========================
const EMAIL_EXPIRE_TIME = 300;

// =========================
// [초기 폼 상태]
// emailCode: 이메일 인증 입력칸 값
// =========================
const INITIAL_FORM = {
  userid: "",
  password: "",
  password2: "",
  name: "",
  phone1: "",
  phone2: "",
  phone3: "",
  telecomProvider: "",
  gender: "",
  emailId: "",
  emailDomain: "",
  emailCode: "",
  year: "",
  month: "",
  day: "",
};

function Signup() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // =========================
  // [생년월일 select 옵션]
  // =========================
  const years = useMemo(
    () => Array.from({ length: 101 }, (_, i) => currentYear - i),
    [currentYear],
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  // =========================
  // [기본 상태값]
  // =========================
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // =========================
  // [검증/인증 상태]
  // idChecked: 아이디 중복확인 완료 여부
  // emailChecked: 이메일 중복확인 + 인증코드 발송까지 진행 여부
  // emailVerified: 이메일 인증코드 검증 완료 여부
  // =========================
  const [idChecked, setIdChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // =========================
  // [안내 메시지 상태]
  // =========================
  const [idMsg, setIdMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailCodeMsg, setEmailCodeMsg] = useState("");

  // =========================
  // [UI 상태]
  // =========================
  const [domainReadOnly, setDomainReadOnly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================
  // [이메일 인증 UI 상태]
  // =========================
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // =========================
  // [임시 프론트 테스트용 인증 데이터]
  // =========================
  const [sentEmailCode, setSentEmailCode] = useState("");
  const [codeExpireAt, setCodeExpireAt] = useState(null);

  // 조합된 전체 이메일
  const email = `${form.emailId.trim()}@${form.emailDomain.trim()}`;

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFieldError = (name) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // [아이디 중복확인 초기화]
  // =========================
  const resetIdCheck = () => {
    setIdChecked(false);
    setIdMsg("");
  };

  // =========================
  // [이메일 인증 관련 상태 전체 초기화]
  // =========================
  const resetEmailVerificationAll = () => {
    setEmailChecked(false);
    setEmailVerified(false);
    setEmailMsg("");
    setEmailCodeMsg("");
    setEmailCodeSent(false);
    setShowResendButton(false);
    setTimeLeft(0);
    setSentEmailCode("");
    setCodeExpireAt(null);
    updateForm("emailCode", "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    updateForm(name, value);
    clearFieldError(name);

    if (name === "userid") resetIdCheck();

    if (name === "emailId" || name === "emailDomain") {
      resetEmailVerificationAll();
    }

    if (name === "year" || name === "month" || name === "day") {
      clearFieldError("birth");
    }

    if (name === "gender") {
      clearFieldError("gender");
    }
  };

  // 숫자만 입력되도록 처리
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, "");
    updateForm(name, onlyNumber);
    clearFieldError("phone1");
  };

  // 인증코드 6자리 숫자만 허용
  const handleCodeChange = (e) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    updateForm("emailCode", onlyNumber);
    clearFieldError("emailCode");
    setEmailCodeMsg("");
  };

  // 이메일 도메인 select 선택 처리
  const handleDomainSelect = (e) => {
    const selectedDomain = e.target.value;

    if (selectedDomain) {
      updateForm("emailDomain", selectedDomain);
      setDomainReadOnly(true);
    } else {
      updateForm("emailDomain", "");
      setDomainReadOnly(false);
    }

    resetEmailVerificationAll();
    clearFieldError("emailId");
    clearFieldError("emailDomain");
  };

  // =========================
  // [임시 인증코드 생성 함수]
  // =========================
  const generateSixDigitCode = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  // 남은 시간을 mm:ss 형식으로 포맷
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // =========================
  // [이메일 인증 타이머]
  // =========================
  useEffect(() => {
    if (!emailCodeSent || !codeExpireAt) return;

    const timer = setInterval(() => {
      const remain = Math.max(
        0,
        Math.floor((codeExpireAt - Date.now()) / 1000),
      );

      setTimeLeft(remain);

      if (remain <= 0) {
        clearInterval(timer);
        setEmailCodeSent(false);
        setShowResendButton(true);
        setEmailVerified(false);
        setEmailCodeMsg("인증코드가 만료되었습니다. 재발송해주세요.");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [emailCodeSent, codeExpireAt]);

  // =========================
  // [아이디 중복확인]
  // 네가 원한 방식대로 길이/형식을 나눠서 검사
  // =========================
  const checkDuplicateId = async () => {
    const userid = form.userid.trim();

    if (!userid) {
      setErrors((prev) => ({
        ...prev,
        userid: "아이디를 입력하세요.",
      }));
      setIdChecked(false);
      setIdMsg("");
      return;
    } else if (userid.length < 8) {
      setErrors((prev) => ({
        ...prev,
        userid: "아이디는 8자 이상이어야 합니다.",
      }));
      setIdChecked(false);
      setIdMsg("");
      return;
    } else if (userid.length > 12) {
      setErrors((prev) => ({
        ...prev,
        userid: "아이디는 12자 이하여야 합니다.",
      }));
      setIdChecked(false);
      setIdMsg("");
      return;
    } else if (!/^[A-Za-z0-9]+$/.test(userid)) {
      setErrors((prev) => ({
        ...prev,
        userid: "아이디는 영문과 숫자만 입력 가능합니다.",
      }));
      setIdChecked(false);
      setIdMsg("");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/check-username/${userid}`,
      );
      const data = await response.json();

      if (data.isDuplicate) {
        setIdMsg("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        setIdMsg("사용 가능한 아이디입니다.");
        setIdChecked(true);
      }
    } catch (err) {
      console.error("아이디 중복확인 오류:", err);
      setIdMsg("서버 오류가 발생했습니다.");
      setIdChecked(false);
    }
  };

  // =========================
  // [이메일 인증코드 발송]
  // =========================
  const sendEmailCode = async () => {
    if (!form.emailId.trim()) {
      setErrors((prev) => ({
        ...prev,
        emailId: "이메일 아이디를 입력하세요.",
      }));
      setEmailChecked(false);
      setEmailVerified(false);
      setEmailMsg("");
      return;
    }

    if (!form.emailDomain.trim()) {
      setErrors((prev) => ({
        ...prev,
        emailDomain: "도메인을 입력하세요.",
      }));
      setEmailChecked(false);
      setEmailVerified(false);
      setEmailMsg("");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrors((prev) => ({
        ...prev,
        emailId: "올바른 이메일 형식이 아닙니다.",
      }));
      setEmailChecked(false);
      setEmailVerified(false);
      setEmailMsg("");
      return;
    }

    // =========================
    // [현재 임시 방식]
    // 프론트 배열로 이메일 중복 여부 확인
    // =========================
    if (EXISTING_EMAILS.includes(email)) {
      setEmailMsg("이미 가입된 이메일입니다.");
      setEmailChecked(false);
      setEmailVerified(false);
      return;
    }

    try {
      // =========================
      // [현재 임시 방식]
      // 프론트에서 인증코드 생성 및 만료시간 설정
      // =========================
      const code = generateSixDigitCode();
      const expireAt = Date.now() + EMAIL_EXPIRE_TIME * 1000;

      setSentEmailCode(code);
      setCodeExpireAt(expireAt);
      setTimeLeft(EMAIL_EXPIRE_TIME);
      setEmailCodeSent(true);
      setShowResendButton(false);
      setEmailChecked(true);
      setEmailVerified(false);
      updateForm("emailCode", "");
      clearFieldError("emailCode");
      setEmailMsg("인증코드가 이메일로 전송되었습니다.");
      setEmailCodeMsg("");

      // 현재는 실제 메일 전송 대신 콘솔에 출력
      console.log("임시 이메일 인증코드:", code);

      /*
      // TODO: 실제 이메일 인증코드 발송 API 연결
      const response = await fetch("http://localhost:5000/send-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(EMAIL_EXPIRE_TIME);
        setEmailCodeSent(true);
        setShowResendButton(false);
        setEmailChecked(true);
        setEmailVerified(false);
        updateForm("emailCode", "");
        clearFieldError("emailCode");
        setEmailMsg(data.message || "인증코드가 이메일로 전송되었습니다.");
        setEmailCodeMsg("");
      } else {
        setEmailChecked(false);
        setEmailVerified(false);
        setEmailMsg(data.message || data.error || "인증코드 전송에 실패했습니다.");
      }
      */
    } catch (error) {
      console.error("이메일 인증코드 전송 오류:", error);
      setEmailChecked(false);
      setEmailVerified(false);
      setEmailMsg("서버와 연결할 수 없습니다.");
    }
  };

  // =========================
  // [이메일 인증코드 검증]
  // =========================
  const verifyEmailCode = async () => {
    if (!form.emailCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        emailCode: "인증코드를 입력하세요.",
      }));
      return;
    }

    if (!CODE_REGEX.test(form.emailCode.trim())) {
      setErrors((prev) => ({
        ...prev,
        emailCode: "인증코드는 6자리 숫자입니다.",
      }));
      return;
    }

    if (!codeExpireAt || Date.now() > codeExpireAt) {
      setEmailVerified(false);
      setEmailCodeMsg("인증코드가 만료되었습니다. 재발송해주세요.");
      setEmailCodeSent(false);
      setShowResendButton(true);
      return;
    }

    try {
      // =========================
      // [현재 임시 방식]
      // 프론트에서 코드 비교
      // =========================
      if (form.emailCode.trim() === sentEmailCode) {
        setEmailVerified(true);
        setEmailCodeSent(false);
        setShowResendButton(false);
        setEmailMsg("이메일 인증이 완료되었습니다.");
        setEmailCodeMsg("이메일 인증이 완료되었습니다.");
      } else {
        setEmailVerified(false);
        setEmailCodeMsg("인증코드가 일치하지 않습니다.");
      }

      /*
      // TODO: 실제 이메일 인증코드 검증 API 연결
      const response = await fetch("http://localhost:5000/verify-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: form.emailCode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        setEmailCodeSent(false);
        setShowResendButton(false);
        setEmailMsg("이메일 인증이 완료되었습니다.");
        setEmailCodeMsg(data.message || "이메일 인증이 완료되었습니다.");
      } else {
        setEmailVerified(false);
        setEmailCodeMsg(data.message || data.error || "인증에 실패했습니다.");
      }
      */
    } catch (error) {
      console.error("이메일 인증 확인 오류:", error);
      setEmailVerified(false);
      setEmailCodeMsg("서버와 연결할 수 없습니다.");
    }
  };

  // =========================
  // [전체 폼 검증]
  // 회원가입 버튼 클릭 시 최종 검사
  // 네가 원한 방식대로 길이/형식 분리
  // =========================
  const validateForm = () => {
    const newErrors = {};

    const id = form.userid.trim();
    const pw = form.password;
    const pw2 = form.password2;
    const username = form.name.trim();

    const phone1 = form.phone1.trim();
    const phone2 = form.phone2.trim();
    const phone3 = form.phone3.trim();

    // 아이디 검사
    if (!id) {
      newErrors.userid = "아이디를 입력하세요.";
    } else if (id.length < 8) {
      newErrors.userid = "아이디는 8자 이상이어야 합니다.";
    } else if (id.length > 12) {
      newErrors.userid = "아이디는 12자 이하여야 합니다.";
    } else if (!/^[A-Za-z0-9]+$/.test(id)) {
      newErrors.userid = "아이디는 영문과 숫자만 입력 가능합니다.";
    } else if (!idChecked) {
      newErrors.userid = "아이디 중복확인을 해주세요.";
    }

    // 비밀번호 검사
    if (!pw) {
      newErrors.password = "비밀번호를 입력하세요.";
    } else if (pw.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    } else if (pw.length > 20) {
      newErrors.password = "비밀번호는 20자 이하여야 합니다.";
    } else if (!/(?=.*[a-z])/.test(pw)) {
      newErrors.password = "비밀번호에 소문자를 포함해주세요.";
    } else if (!/(?=.*[A-Z])/.test(pw)) {
      newErrors.password = "비밀번호에 대문자를 포함해주세요.";
    } else if (!/(?=.*\d)/.test(pw)) {
      newErrors.password = "비밀번호에 숫자를 포함해주세요.";
    } else if (!/(?=.*[!@#$%^&*])/.test(pw)) {
      newErrors.password = "비밀번호에 특수문자를 포함해주세요.";
    }

    // 비밀번호 확인
    if (!pw2) {
      newErrors.password2 = "비밀번호 확인을 입력하세요.";
    } else if (pw !== pw2) {
      newErrors.password2 = "비밀번호가 일치하지 않습니다.";
    }

    // 이름 검사
    if (!username) {
      newErrors.name = "이름을 입력하세요.";
    } else if (!NAME_REGEX.test(username)) {
      newErrors.name = "이름은 한글 또는 영문만 입력 가능합니다.";
    }

    // 휴대폰 번호 검사
    if (!phone1 || !phone2 || !phone3) {
      newErrors.phone1 = "휴대폰 번호를 입력하세요.";
    } else if (
      phone1.length !== 3 ||
      phone2.length !== 4 ||
      phone3.length !== 4
    ) {
      newErrors.phone1 = "휴대폰 번호를 정확히 입력하세요.";
    }

    // 통신사 검사
    if (!form.telecomProvider) {
      newErrors.telecomProvider = "통신사를 선택하세요.";
    }

    // 성별 검사
    if (!form.gender) {
      newErrors.gender = "성별을 선택하세요.";
    }

    // 생년월일 검사
    if (!form.year || !form.month || !form.day) {
      newErrors.birth = "생년월일을 선택하세요.";
    }

    // 이메일 검사
    if (!form.emailId.trim()) {
      newErrors.emailId = "이메일 아이디를 입력하세요.";
    }

    if (!form.emailDomain.trim()) {
      newErrors.emailDomain = "도메인을 입력하세요.";
    }

    if (form.emailId.trim() && form.emailDomain.trim()) {
      if (!EMAIL_REGEX.test(email)) {
        newErrors.emailId = "올바른 이메일 형식이 아닙니다.";
      } else if (!emailChecked) {
        newErrors.emailId = "이메일 확인을 진행해주세요.";
      } else if (!emailVerified) {
        newErrors.emailCode = "이메일 인증을 완료해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // [회원가입 제출]
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    const payload = {
      username: form.userid.trim(),
      password: form.password,
      full_name: form.name.trim(),
      email: `${form.emailId.trim()}@${form.emailDomain.trim()}`,
      gender: form.gender === "male" ? "남" : "녀",
      birth_date: `${form.year}-${String(form.month).padStart(2, "0")}-${String(
        form.day,
      ).padStart(2, "0")}`,
      phone_number: `${form.phone1}-${form.phone2}-${form.phone3}`,
      telecom_provider: form.telecomProvider,
      social_provider: "local",
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "회원가입이 완료되었습니다.");
        setForm(INITIAL_FORM);
        setErrors({});
        setIdChecked(false);
        setEmailChecked(false);
        setEmailVerified(false);
        setIdMsg("");
        setEmailMsg("");
        setEmailCodeMsg("");
        setDomainReadOnly(false);
        setEmailCodeSent(false);
        setShowResendButton(false);
        setTimeLeft(0);
        setSentEmailCode("");
        setCodeExpireAt(null);
        navigate("/login");
      } else {
        alert(data.message || data.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f6f8f6",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.5, md: 2 },
        overflow: "hidden",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1100,
          height: "calc(100vh - 24px)",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "#e6ebe6",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            height: "100%",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(180deg, #edf7ee 0%, #f8fbf8 100%)",
              borderRight: { xs: "none", md: "1px solid #e6ebe6" },
              borderBottom: { xs: "1px solid #e6ebe6", md: "none" },
              p: { xs: 2.5, md: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              component={Link}
              to="/"
              variant="h4"
              sx={{
                textDecoration: "none",
                color: "#1f2a1f",
                fontWeight: 800,
                letterSpacing: 0.3,
                mb: 2,
                "&:hover": {
                  opacity: 0.75,
                },
              }}
            >
              🍃 NEARGARDEN
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1.4,
                color: "#1f2a1f",
                mb: 1.5,
              }}
            >
              공원과 더 가까워지는
              <br />
              간단한 시작
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              회원가입 후 주변 공원 탐색,
              <br />
              위치 기반 검색,
              <br />
              다양한 공원 정보 확인이 가능해져요.
            </Typography>
          </Box>

          <CardContent
            sx={{
              p: { xs: 2, md: 3 },
              height: "100%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              회원가입
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              아래 정보를 입력하고 계정을 만들어보세요.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                flex: 1,
              }}
            >
              <input type="hidden" name="social_provider" value="local" />

              <Box sx={{ flex: 1 }}>
                <Stack spacing={1.2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 120px" },
                      gap: 1,
                      alignItems: "start",
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="아이디"
                      name="userid"
                      value={form.userid}
                      onChange={handleChange}
                      placeholder="영문/숫자 8~12자"
                      error={!!errors.userid || (!!idMsg && !idChecked)}
                      helperText={errors.userid || idMsg || " "}
                    />
                    <Button
                      type="button"
                      variant="contained"
                      onClick={checkDuplicateId}
                      sx={{
                        height: 40,
                        borderRadius: 2,
                        boxShadow: "none",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      중복확인
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="비밀번호"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || " "}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="비밀번호 확인"
                      name="password2"
                      type={showPassword2 ? "text" : "password"}
                      value={form.password2}
                      onChange={handleChange}
                      error={!!errors.password2}
                      helperText={errors.password2 || " "}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword2((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword2 ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="이름"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name || " "}
                  />

                  <Divider sx={{ my: 0.25 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.9fr" },
                      gap: 1.2,
                      alignItems: "start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 0.75,
                          fontWeight: 700,
                          color: errors.birth ? "error.main" : "text.primary",
                        }}
                      >
                        생년월일
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 1,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="년도"
                          name="year"
                          value={form.year}
                          onChange={handleChange}
                          error={!!errors.birth}
                        >
                          <MenuItem value="">선택</MenuItem>
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="월"
                          name="month"
                          value={form.month}
                          onChange={handleChange}
                          error={!!errors.birth}
                        >
                          <MenuItem value="">선택</MenuItem>
                          {months.map((month) => (
                            <MenuItem key={month} value={month}>
                              {month}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="일"
                          name="day"
                          value={form.day}
                          onChange={handleChange}
                          error={!!errors.birth}
                        >
                          <MenuItem value="">선택</MenuItem>
                          {days.map((day) => (
                            <MenuItem key={day} value={day}>
                              {day}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 0.4, minHeight: 18 }}
                      >
                        {errors.birth || " "}
                      </Typography>
                    </Box>

                    <FormControl error={!!errors.gender}>
                      <FormLabel sx={{ fontWeight: 700, mb: 0.25 }}>
                        성별
                      </FormLabel>
                      <RadioGroup
                        row
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="male"
                          control={<Radio size="small" />}
                          label="남자"
                        />
                        <FormControlLabel
                          value="female"
                          control={<Radio size="small" />}
                          label="여자"
                        />
                      </RadioGroup>
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ minHeight: 18 }}
                      >
                        {errors.gender || " "}
                      </Typography>
                    </FormControl>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
                      gap: 1.2,
                      alignItems: "start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 0.75, fontWeight: 700 }}
                      >
                        휴대폰 번호
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 12px 1fr 12px 1fr",
                          alignItems: "center",
                          gap: 0.4,
                        }}
                      >
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="010"
                          name="phone1"
                          value={form.phone1}
                          onChange={handleNumberChange}
                          inputProps={{ maxLength: 3 }}
                          error={!!errors.phone1}
                        />
                        <Typography textAlign="center">-</Typography>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="1234"
                          name="phone2"
                          value={form.phone2}
                          onChange={handleNumberChange}
                          inputProps={{ maxLength: 4 }}
                          error={!!errors.phone1}
                        />
                        <Typography textAlign="center">-</Typography>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="5678"
                          name="phone3"
                          value={form.phone3}
                          onChange={handleNumberChange}
                          inputProps={{ maxLength: 4 }}
                          error={!!errors.phone1}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 0.4, minHeight: 18 }}
                      >
                        {errors.phone1 || " "}
                      </Typography>
                    </Box>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="통신사"
                      name="telecomProvider"
                      value={form.telecomProvider}
                      onChange={handleChange}
                      error={!!errors.telecomProvider}
                      helperText={errors.telecomProvider || " "}
                      sx={{ mt: { xs: 0, lg: 3.1 } }}
                    >
                      <MenuItem value="">선택</MenuItem>
                      <MenuItem value="SKT">SKT</MenuItem>
                      <MenuItem value="KT">KT</MenuItem>
                      <MenuItem value="LGU+">LGU+</MenuItem>
                      <MenuItem value="알뜰폰">알뜰폰</MenuItem>
                    </TextField>
                  </Box>

                  <Divider sx={{ my: 0.25 }} />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 0.75, fontWeight: 700 }}
                    >
                      이메일
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 120px" },
                        gap: 1,
                        alignItems: "start",
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="이메일 아이디"
                        name="emailId"
                        value={form.emailId}
                        onChange={handleChange}
                        placeholder="example"
                        error={!!errors.emailId}
                        helperText={errors.emailId || " "}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="도메인"
                        name="emailDomain"
                        value={form.emailDomain}
                        onChange={handleChange}
                        placeholder="domain.com"
                        error={!!errors.emailDomain}
                        helperText={errors.emailDomain || " "}
                        InputProps={{ readOnly: domainReadOnly }}
                      />

                      <Button
                        type="button"
                        variant="outlined"
                        onClick={sendEmailCode}
                        sx={{
                          height: 40,
                          borderRadius: 2,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        이메일 확인
                      </Button>
                    </Box>

                    <Box
                      sx={{
                        mt: 0.4,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 120px" },
                        gap: 1,
                        alignItems: "start",
                      }}
                    >
                      <TextField
                        select
                        size="small"
                        label="도메인 선택"
                        defaultValue=""
                        onChange={handleDomainSelect}
                      >
                        <MenuItem value="">직접입력</MenuItem>
                        <MenuItem value="gmail.com">gmail.com</MenuItem>
                        <MenuItem value="naver.com">naver.com</MenuItem>
                        <MenuItem value="daum.net">daum.net</MenuItem>
                      </TextField>

                      <Box sx={{ minHeight: 40 }} />
                    </Box>

                    <Box
                      sx={{
                        mt: 0.8,
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "1fr 72px 110px",
                        },
                        gap: 1,
                        alignItems: "start",
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="인증코드"
                        name="emailCode"
                        value={form.emailCode}
                        onChange={handleCodeChange}
                        placeholder="6자리 숫자 입력"
                        disabled={
                          !emailCodeSent && !showResendButton && !emailVerified
                        }
                        error={!!errors.emailCode}
                        helperText={errors.emailCode || " "}
                      />

                      <Box
                        sx={{
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "error.main",
                            visibility:
                              emailCodeSent && !emailVerified && timeLeft > 0
                                ? "visible"
                                : "hidden",
                          }}
                        >
                          {emailCodeSent && !emailVerified && timeLeft > 0
                            ? formatTime(timeLeft)
                            : "00:00"}
                        </Typography>
                      </Box>

                      {showResendButton && !emailVerified ? (
                        <Button
                          type="button"
                          variant="outlined"
                          color="warning"
                          onClick={sendEmailCode}
                          sx={{
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          재발송
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="contained"
                          onClick={verifyEmailCode}
                          disabled={!emailCodeSent || emailVerified}
                          sx={{
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            boxShadow: "none",
                            "&:hover": {
                              boxShadow: "none",
                            },
                          }}
                        >
                          인증확인
                        </Button>
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.6,
                        minHeight: 20,
                        color: emailVerified
                          ? "success.main"
                          : emailCodeMsg
                            ? "error.main"
                            : "text.secondary",
                      }}
                    >
                      {emailVerified
                        ? "이메일 인증이 완료되었습니다."
                        : emailCodeMsg || emailMsg || " "}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  mt: 1.5,
                  pt: 1.2,
                  pb: 0.4,
                  bgcolor: "#fff",
                  borderTop: "1px solid #e6ebe6",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 1.1,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}
                >
                  {isSubmitting ? "가입 중..." : "회원가입"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}

export default Signup;
