import React from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../../components/auth/SignupForm";
import MainLayout from "../../layout/MainLayout";

const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-12">
      <SignupForm onLoginClick={() => navigate("/login")} />
    </div>
  );
};

export default SignupPage;
