import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return <Outlet />; // Just pass through without any wrapper
};

export default AuthLayout;