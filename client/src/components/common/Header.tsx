import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "./Container";
import { BrandLogo } from "./BrandLogo";
import { User } from "@/types/auth";

type NavItem = { label: string; href: string };

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16.6 16.6 21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 8.5V7.2A5 5 0 0 1 12 2.2a5 5 0 0 1 5 5V8.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5.3 8.5h13.4c.7 0 1.2.6 1.2 1.2l-1 11.3c-.1.7-.6 1.2-1.3 1.2H6.4c-.7 0-1.2-.5-1.3-1.2l-1-11.3c0-.6.5-1.2 1.2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavLink({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative px-3 py-6 text-[12px] font-semibold tracking-[0.14em] uppercase",
        "transition-colors",
        active ? "text-rose-300" : "text-slate-800 hover:text-rose-300",
      ].join(" ")}
    >
      {children}
      {active && (
        <span className="pointer-events-none w-full absolute left-1/2 top-full -translate-x-1/2">
          <hr className="relative w-full bg-white shadow-[0_-1px_0_0_rgba(226,232,240,1)]" />
          {/* <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <span className="block h-3 w-3 rotate-45 bg-white shadow-[-1px_-1px_0_0_rgba(226,232,240,1)]" />
          </span> */}
        </span>
      )}
    </button>
  );
}

function IconButton({
  "aria-label": ariaLabel,
  onClick,
  children,
}: {
  "aria-label": string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md",
        "text-slate-700 transition-colors",
        "hover:text-rose-300 hover:bg-transparent",
        "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function useClickOutside(
  refs: Array<React.RefObject<HTMLElement | null>>,
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = refs.some((r) => r.current && r.current.contains(target));
      if (!inside) onOutside();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOutside();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [enabled, onOutside, refs]);
}

export function Header({
  activePath = "/",
  cartCount = 0,
  user = null,
  onNavigate,
  onLogout,
  onOpenCart,
  onOpenSearch,
}: {
  activePath?: string;
  cartCount?: number;
  user?: User | null;
  onNavigate: (href: string) => void;
  onLogout?: () => void;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
}) {
  const nav: NavItem[] = useMemo(
    () => [
      { label: "Trang chủ", href: "/home" },
      { label: "Danh mục", href: "/categories" },
      { label: "Sản phẩm", href: "/products" },
    ],
    []
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  // --- user dropdown ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside([userBtnRef, userMenuRef], () => setUserMenuOpen(false), userMenuOpen);

  const userActions = useMemo(
    () => [
      { label: "Hồ sơ", href: "/profile" },
      { label: "Đơn hàng", href: "/orders" },
      { label: "Đang thuê", href: "/rentals/active" },
    ],
    []
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-white">
      <div className="w-full border-b border-slate-200">
        <Container>
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Left */}
            <div className="shrink-0">
              <button type="button" onClick={() => onNavigate("/")} aria-label="Home">
                <BrandLogo />
              </button>
            </div>

            {/* Center */}
            <nav className="hidden flex-1 items-stretch justify-center lg:flex">
              <div className="flex items-stretch gap-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.href}
                    active={item.href === activePath}
                    onClick={() => {
                      onNavigate(item.href);
                      setMobileOpen(false);
                    }}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-4">
              {/* USER AREA */}
              {user ? (
                <div className="relative">
                  <button
                    ref={userBtnRef}
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={[
                      "inline-flex items-center gap-2 rounded-md px-2 py-1",
                      "text-[12px] font-semibold tracking-[0.14em] uppercase text-slate-800",
                      "transition-colors hover:text-rose-300",
                      "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2",
                    ].join(" ")}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    {user.fullName}
                    <span
                      className={[
                        "inline-block h-2 w-2 rotate-45 border-r-2 border-b-2",
                        userMenuOpen ? "border-rose-300" : "border-slate-400",
                      ].join(" ")}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      ref={userMenuRef}
                      role="menu"
                      className={[
                        "absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl",
                        "border border-slate-200 bg-white shadow-lg",
                      ].join(" ")}
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {user.fullName}
                        </div>
                        {user.email ? (
                          <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">{user.email}</div>
                        ) : null}
                      </div>

                      <div className="py-2">
                        {userActions.map((a) => (
                          <button
                            key={a.href}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setUserMenuOpen(false);
                              onNavigate(a.href);
                            }}
                            className={[
                              "w-full text-left px-4 py-2.5 text-sm",
                              "text-slate-700 hover:bg-rose-50 hover:text-rose-700",
                            ].join(" ")}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout?.();
                          }}
                          className={[
                            "w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold",
                            "text-rose-700 hover:bg-rose-50",
                          ].join(" ")}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate("/login")}
                  className={[
                    "hidden text-[12px] font-semibold tracking-[0.14em] uppercase lg:block",
                    "text-slate-800 transition-colors hover:text-rose-300",
                    "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2",
                  ].join(" ")}
                >
                  Đăng nhập
                </button>
              )}

              <IconButton aria-label="Cart" onClick={onOpenCart ?? (() => onNavigate(user ? "/cart" : "/login"))}>
                <IconBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-300 px-1 text-[11px] font-semibold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </IconButton>

              <IconButton aria-label="Search" onClick={onOpenSearch ?? (() => onNavigate("/products"))}>
                <IconSearch className="h-5 w-5" />
              </IconButton>

              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileOpen((v) => !v)}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-md lg:hidden",
                  "text-slate-700 transition-colors hover:text-rose-300",
                  "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2",
                ].join(" ")}
              >
                <span className="block h-0.5 w-5 bg-current" />
                <span className="mt-1.5 block h-0.5 w-5 bg-current" />
                <span className="mt-1.5 block h-0.5 w-5 bg-current" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile drawer (giữ logic cũ) */}
      {mobileOpen && (
        <div className="w-full border-b border-slate-200 bg-white lg:hidden">
          <Container>
            <div className="py-3">
              <div className="mt-2 grid">
                {nav.map((item) => {
                  const active = item.href === activePath;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        onNavigate(item.href);
                        setMobileOpen(false);
                      }}
                      className={[
                        "text-left rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-rose-50 text-rose-700"
                          : "text-slate-700 hover:bg-rose-50 hover:text-rose-700",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* User actions on mobile (optional) */}
              {user ? (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="px-3 text-xs font-semibold tracking-[0.18em] uppercase text-slate-400">
                    Tài khoản
                  </div>

                  <div className="mt-2 grid">
                    {userActions.map((a) => (
                      <button
                        key={a.href}
                        type="button"
                        onClick={() => {
                          onNavigate(a.href);
                          setMobileOpen(false);
                        }}
                        className="text-left rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                      >
                        {a.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onLogout?.();
                      }}
                      className="text-left rounded-md px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
