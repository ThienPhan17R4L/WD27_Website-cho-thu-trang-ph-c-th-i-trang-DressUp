import { NavLink } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

type MenuItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
};

const ICON_CLASS = "h-5 w-5";

const ADMIN_MENU: MenuItem[] = [
  {
    to: "/admin", label: "Tổng quan", end: true,
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /></svg>,
  },
  {
    to: "/admin/products", label: "Sản phẩm",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 3a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21a2 2 0 0 0 2 0l7-3.27A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    to: "/admin/categories", label: "Danh mục",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41 11 3.83a2 2 0 0 0-2.83 0L3.41 9.59a2 2 0 0 0 0 2.83l9.59 9.59a2 2 0 0 0 2.83 0l4.76-4.76a2 2 0 0 0 0-2.83z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    to: "/admin/orders", label: "Đơn hàng",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    to: "/admin/users", label: "Người dùng",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    to: "/admin/inventory", label: "Tồn kho",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    to: "/admin/returns", label: "Trả hàng",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M9 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 20v-7a4 4 0 0 0-4-4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    to: "/admin/coupons", label: "Mã giảm giá",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    to: "/admin/audit-logs", label: "Nhật ký",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
];

const STAFF_MENU: MenuItem[] = [
  {
    to: "/staff", label: "Tổng quan", end: true,
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" /></svg>,
  },
  {
    to: "/staff/orders", label: "Đơn hàng",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    to: "/staff/inventory", label: "Tồn kho",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    to: "/staff/returns", label: "Trả hàng",
    icon: <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none"><path d="M9 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 20v-7a4 4 0 0 0-4-4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
];

export default function Sidebar({ collapsed = false, role = "admin" }: { collapsed?: boolean; role?: "admin" | "staff" }) {
  const menu = role === "staff" ? STAFF_MENU : ADMIN_MENU;

  return (
    <aside
      className={[
        "flex h-screen flex-col transition-all duration-200 border-r",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
      style={{ background: "#faf8f6", borderColor: "rgba(213, 176, 160, 0.15)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 border-b" style={{ borderColor: "rgba(213, 176, 160, 0.15)" }}>
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <Logo size="md" variant="dark" />
            <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#9b8f8a" }}>
              {role === "staff" ? "Staff Panel" : "Admin Panel"}
            </div>
          </div>
        ) : (
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-serif shrink-0"
            style={{ background: "rgb(213, 176, 160)" }}
          >
            y
          </div>
        )}
      </div>

      <nav className="mt-2 flex-1 px-3">
        <ul className="space-y-0.5">
          {menu.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all font-medium",
                    isActive
                      ? "text-white"
                      : "hover:text-[rgb(90,64,56)]",
                  ].join(" ")
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "rgb(213, 176, 160)", color: "#fff" }
                    : { background: "transparent", color: "#9b8f8a" }
                }
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLAnchorElement;
                  if (!target.getAttribute("aria-current")) {
                    target.style.background = "rgba(213, 176, 160, 0.08)";
                    target.style.color = "rgb(90,64,56)";
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLAnchorElement;
                  if (!target.getAttribute("aria-current")) {
                    target.style.background = "transparent";
                    target.style.color = "#9b8f8a";
                  }
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 text-xs border-t" style={{ color: "#c8b8b0", borderColor: "rgba(213, 176, 160, 0.1)" }}>
        DressUp v1.0
      </div>
    </aside>
  );
}
