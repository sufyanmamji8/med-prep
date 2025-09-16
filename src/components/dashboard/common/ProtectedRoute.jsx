import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";

const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!userLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;


