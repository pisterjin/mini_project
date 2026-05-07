import React from "react";
import { Routes, Route } from "react-router-dom";
import Map from "./pages/Map";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindId from "./pages/FindId";
import FindPassword from "./pages/FindPassword";
// import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Map />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/find-id" element={<FindId />} />
      <Route path="/find-password" element={<FindPassword />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
    </Routes>
  );
}

export default App;
