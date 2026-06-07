import { Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import masterRoutes from "./routes";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../components/layout/MainLayout";

const RouteWithHelmet = ({ element, name }) => (
  <>
    {name && (
      <Helmet>
        <title>{`ModFanArt - ${name}`}</title>
      </Helmet>
    )}
    {element}
  </>
);

const Router = () => {
  const protectedRoutes = masterRoutes.filter(r => r.isSidebarActive);
  const publicRoutes = masterRoutes.filter(r => !r.isSidebarActive);

  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      {publicRoutes.map(({ path, element, name }) => (
        <Route
          key={path}
          path={path}
          element={<RouteWithHelmet element={element} name={name} />}
        />
      ))}

      {/* ================= AUTH GUARD ================= */}
      <Route element={<PrivateRoute />}>
        
        {/* ================= LAYOUT WRAPPER ================= */}
        <Route element={<MainLayout />}>
          
          {/* protected pages */}
          {protectedRoutes.map(({ path, element, name }) => (
            <Route
              key={path}
              path={path}
              element={<RouteWithHelmet element={element} name={name} />}
            />
          ))}

          {/* default protected route */}
          <Route path="" element={<Navigate to="/" replace />} />

        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default Router;