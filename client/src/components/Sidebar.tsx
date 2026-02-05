import { NavLink } from "react-router-dom";

function IconOverview() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 3a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21a2 2 0 0 0 2 0l7-3.27A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M20.59 13.41 11 3.83a2 2 0 0 0-2.83 0L3.41 9.59a2 2 0 0 0 0 2.83l9.59 9.59a2 2 0 0 0 2.83 0l4.76-4.76a2 2 0 0 0 0-2.83z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside className={[
      "flex h-screen flex-col bg-slate-900 text-slate-100",
      collapsed ? "w-20" : "w-64",
    ].join(" ")}
    >
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-8 w-8 rounded bg-rose-500" />
        {!collapsed && <div className="text-lg font-semibold">Volt React</div>}
      </div>

      <nav className="mt-4 flex-1 px-2">
        <ul className="space-y-1">
          <li>
            <NavLink to="/admin" end className={({ isActive }) => [
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-slate-800",
              isActive ? "bg-slate-800" : "",
            ].join(' ')}>
              <IconOverview />
              {!collapsed && <span>Overview</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/products" className={({ isActive }) => [
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-slate-800",
              isActive ? "bg-slate-800" : "",
            ].join(' ')}>
              <IconBox />
              {!collapsed && <span>Quản lý sản phẩm</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/categories" className={({ isActive }) => [
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-slate-800",
              isActive ? "bg-slate-800" : "",
            ].join(' ')}>
              <IconTag />
              {!collapsed && <span>Quản lý danh mục</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => [
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-slate-800",
              isActive ? "bg-slate-800" : "",
            ].join(' ')}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {!collapsed && <span>Quản lý đơn hàng</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 text-xs text-slate-400">Version 1.0</div>
    </aside>
  );
}
