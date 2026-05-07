// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { Link, useNavigate } from "react-router-dom";

// export default function ResetPassword() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     userId: "",
//     oldPassword: "",
//     newPassword: "",
//     newPasswordConfirm: "",
//   });

//   const [errors, setErrors] = useState({
//     userId: "",
//     oldPassword: "",
//     newPassword: "",
//     newPasswordConfirm: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       [name]: "",
//     }));
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!form.userId.trim()) {
//       newErrors.userId = "아이디를 입력해주세요.";
//     }

//     if (!form.oldPassword.trim()) {
//       newErrors.oldPassword = "현재 비밀번호를 입력해주세요.";
//     }

//     if (!form.newPassword.trim()) {
//       newErrors.newPassword = "새 비밀번호를 입력해주세요.";
//     } else if (form.newPassword.length < 8) {
//       newErrors.newPassword = "새 비밀번호는 8자 이상이어야 합니다.";
//     }

//     if (!form.newPasswordConfirm.trim()) {
//       newErrors.newPasswordConfirm = "새 비밀번호 확인을 입력해주세요.";
//     } else if (form.newPassword !== form.newPasswordConfirm) {
//       newErrors.newPasswordConfirm = "새 비밀번호가 일치하지 않습니다.";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     try {
//       const response = await fetch("http://localhost:5000/reset-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: form.userId.trim(),
//           old_password: form.oldPassword,
//           new_password: form.newPassword,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message || "비밀번호가 변경되었습니다.");
//         navigate("/login");
//       } else {
//         alert(data.detail || data.message || "비밀번호 변경에 실패했습니다.");
//       }
//     } catch (error) {
//       console.error("비밀번호 변경 오류:", error);
//       alert("서버와 연결할 수 없습니다.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         backgroundColor: "#f9faf9",
//         px: 2,
//       }}
//     >
//       <Container maxWidth="sm">
//         <Card
//           elevation={0}
//           sx={{
//             borderRadius: 4,
//             border: "1px solid",
//             borderColor: "divider",
//             backgroundColor: "#ffffff",
//           }}
//         >
//           <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
//             <Typography
//               component={Link}
//               to="/"
//               variant="h4"
//               align="center"
//               sx={{
//                 display: "block",
//                 fontWeight: 800,
//                 letterSpacing: 0.3,
//                 mb: 1.5,
//                 textDecoration: "none",
//                 color: "inherit",
//                 cursor: "pointer",
//                 transition: "opacity 0.2s ease",
//                 "&:hover": { opacity: 0.75 },
//               }}
//             >
//               🍃 NEARGARDEN
//             </Typography>

//             <Typography
//               variant="body1"
//               align="center"
//               color="text.secondary"
//               sx={{ mb: 4 }}
//             >
//               비밀번호를 재설정해주세요.
//             </Typography>

//             <Box component="form" onSubmit={handleSubmit}>
//               <Stack spacing={2}>
//                 <TextField
//                   fullWidth
//                   label="아이디"
//                   name="userId"
//                   value={form.userId}
//                   onChange={handleChange}
//                   error={!!errors.userId}
//                   helperText={errors.userId}
//                 />

//                 <TextField
//                   fullWidth
//                   label="현재 비밀번호"
//                   name="oldPassword"
//                   type="password"
//                   value={form.oldPassword}
//                   onChange={handleChange}
//                   error={!!errors.oldPassword}
//                   helperText={errors.oldPassword}
//                 />

//                 <TextField
//                   fullWidth
//                   label="새 비밀번호"
//                   name="newPassword"
//                   type="password"
//                   value={form.newPassword}
//                   onChange={handleChange}
//                   error={!!errors.newPassword}
//                   helperText={errors.newPassword}
//                 />

//                 <TextField
//                   fullWidth
//                   label="새 비밀번호 확인"
//                   name="newPasswordConfirm"
//                   type="password"
//                   value={form.newPasswordConfirm}
//                   onChange={handleChange}
//                   error={!!errors.newPasswordConfirm}
//                   helperText={errors.newPasswordConfirm}
//                 />

//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   size="large"
//                   sx={{
//                     mt: 1,
//                     py: 1.4,
//                     borderRadius: 2,
//                     fontWeight: 700,
//                     boxShadow: "none",
//                     "&:hover": { boxShadow: "none" },
//                   }}
//                 >
//                   비밀번호 변경
//                 </Button>
//               </Stack>
//             </Box>
//           </CardContent>
//         </Card>
//       </Container>
//     </Box>
//   );
// }
