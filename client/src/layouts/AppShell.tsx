import React, { useMemo } from "react";
import { Outlet, To, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";

const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = useMemo(() => {
    const p = location.pathname;
    if (p === "/home" || p === "/") return "/home";
    if (p.startsWith("/categories")) return "/categories";
    if (p.startsWith("/products")) return "/products";
    if (p.startsWith("/rent")) return "/rent";
    if (p.startsWith("/occasions")) return "/occasions";
    if (p.startsWith("/whats-new")) return "/whats-new";
    if (p.startsWith("/features")) return "/features";
    if (p.startsWith("/contacts")) return "/contacts";
    return "";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "#f7f3ef" }}>
      <Header
        activePath={activePath}
        cartCount={0}
        user={user ?? null}
        onNavigate={(href: To) => navigate(href)}
        onLogout={handleLogout}
      />

      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
