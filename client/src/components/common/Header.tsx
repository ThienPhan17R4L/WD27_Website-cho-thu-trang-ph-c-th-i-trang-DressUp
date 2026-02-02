import { useMemo, useState } from "react";
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
  href,
}: {
  active?: boolean;
  children: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={[
        "relative px-3 py-6 text-[12px] font-semibold tracking-[0.14em] uppercase",
        "transition-colors",
        active
          ? "text-rose-300"
          : "text-slate-800 hover:text-rose-300",
      ].join(" ")}
    >
      {children}

      {/* Active tab */}
      {active && (
        <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2">
          <span className="relative block h-6 w-44 bg-white shadow-[0_-1px_0_0_rgba(226,232,240,1)]" />
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <span className="block h-3 w-3 rotate-45 bg-white shadow-[-1px_-1px_0_0_rgba(226,232,240,1)]" />
          </span>
        </span>
      )}
    </a>
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

export function Header({
  activePath = "/",
  cartCount = 0,
  user = null
}: {
  activePath?: string;
  cartCount?: number;
  user?: User | null
}) {
  const nav: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Rent a dress", href: "/rent" },
      { label: "Find a dress", href: "/find" },
      { label: "Occasions", href: "/occasions" },
      { label: "Whats new", href: "/whats-new" },
      { label: "Features", href: "/features" },
      { label: "Contacts", href: "/contacts" },
    ],
    []
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // full width header wrapper
    <header className="w-full bg-white">
      {/* full width border */}
      <div className="w-full border-b border-slate-200">
        <Container>
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Left: Logo */}
            <div className="shrink-0">
              <BrandLogo />
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden flex-1 items-stretch justify-center lg:flex">
              <div className="flex items-stretch gap-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    active={item.href === activePath}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <a
                  href="/account"
                  className="text-[11px] uppercase tracking-[0.14em] text-slate-500 hover:text-rose-300"
                >
                  <span className={[
                    "text-[12px] font-semibold tracking-[0.14em] uppercase text-slate-800",
                    "hover:text-rose-300 hover:bg-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2",
                  ].join(" ")}>
                    {user.fullName}
                  </span>
                </a>
              ) : (
                <a
                  href="/login"
                  className={[
                    "hidden text-[12px] font-semibold tracking-[0.14em] uppercase lg:block",
                    "text-slate-800 transition-colors hover:text-rose-300",
                    "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2"
                  ].join(" ")}
                >
                  Sign in
                </a>
              )}

              <IconButton
                aria-label="Cart"
                onClick={() => (window.location.href = "/cart")}
              >
                <IconBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-300 px-1 text-[11px] font-semibold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </IconButton>

              <IconButton
                aria-label="Search"
                onClick={() => (window.location.href = "/search")}
              >
                <IconSearch className="h-5 w-5" />
              </IconButton>

              {/* Mobile menu button */}
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="w-full border-b border-slate-200 bg-white lg:hidden">
          <Container>
            <div className="py-3">
              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-slate-800">
                    {user.fullName}
                  </span>

                  <a
                    href="/account"
                    className="text-[11px] uppercase tracking-[0.14em] text-slate-500 hover:text-rose-300"
                  >
                    Account
                  </a>
                </div>
              ) : (
                <a
                  href="/login"
                  className={[
                    "hidden text-[12px] font-semibold tracking-[0.14em] uppercase lg:block",
                    "text-slate-800 transition-colors hover:text-rose-300",
                  ].join(" ")}
                >
                  Sign in
                </a>
              )}
              <div className="mt-2 grid">
                {nav.map((item) => {
                  const active = item.href === activePath;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-rose-50 text-rose-700"
                          : "text-slate-700 hover:bg-rose-50 hover:text-rose-700",
                      ].join(" ")}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
