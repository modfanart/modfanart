import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { canOpenPath } from "./apps";

const Spinner = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

// The workspace is for staff only. Any Firebase account used to be able to
// sign in and see the whole workspace (with every API call failing 403).
const PrivateRoute = () => {
  const { user, loading, isStaff, can } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isStaff) return <Navigate to="/no-access" replace state={{ reason: "not_staff" }} />;
  if (!canOpenPath(location.pathname, can)) {
    return <Navigate to="/no-access" replace state={{ reason: "missing_permission", from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;
