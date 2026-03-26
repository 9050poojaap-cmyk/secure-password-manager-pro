import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddPassword from "./pages/AddPassword";
import ShareRedeem from "./pages/ShareRedeem";
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/share/:token" element={<ShareRedeem />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/add"
        element={
          <Protected>
            <Layout>
              <AddPassword />
            </Layout>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

