import React, { useMemo, useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebookF } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";

type Provider = "google" | "github" | "facebook";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function isValidEmail(email: string) {
  // basic email check (đủ dùng UI). Nếu dùng Zod thì thay bằng schema.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.roles?.includes("admin");
      const isStaff = user.roles?.includes("staff");
      const redirectPath = isAdmin ? "/admin" : isStaff ? "/staff" : "/home";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const canSubmit = useMemo(() => {
    return form.email.trim().length > 0 && form.password.length > 0 && !loading;
  }, [form.email, form.password, loading]);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(values: FormState): FormErrors {
    const next: FormErrors = {};
    if (!values.email.trim()) next.email = "Email là bắt buộc.";
    else if (!isValidEmail(values.email)) next.email = "Email không hợp lệ.";

    if (!values.password) next.password = "Mật khẩu là bắt buộc.";
    else if (values.password.length < 6)
      next.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    return next;
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);
      const userData = await login(form.email, form.password);

      // ✅ Role-based redirect: admin → /admin, staff → /staff, user → /home
      const isAdmin = userData.roles.includes("admin");
      const isStaff = userData.roles.includes("staff");
      const redirectPath = isAdmin ? "/admin" : isStaff ? "/staff" : "/home";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error(err);

      // Check for email not verified error
      const errorCode = err?.response?.data?.code;
      if (errorCode === "EMAIL_NOT_VERIFIED") {
        setErrors({
          password: "Email chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản."
        });
      } else {
        setErrors({ password: "Đăng nhập thất bại. Vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(_provider: Provider) {
    if (loading) return;

    try {
      setLoading(true);

      // TODO: OAuth flow
      // await authApi.loginWithProvider(provider)
      await new Promise((r) => setTimeout(r, 500));

      // ✅ Điều hướng sau social login
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    // ✅ Điều hướng forgot password
    navigate("/forgot-password");
  }

  function handleRegister() {
    // ✅ Điều hướng register
    navigate("/register");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background gradient (primary: #d5b0a0) */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_12%_10%,rgba(213,176,160,0.55)_0%,rgba(213,176,160,0.18)_45%,transparent_70%),radial-gradient(800px_520px_at_88%_18%,rgba(255,255,255,0.35)_0%,transparent_60%),linear-gradient(180deg,#f6efec_0%,#ead1c7_35%,#d5b0a0_100%)]" />

      {/* Big soft blobs */}
      <div className="pointer-events-none absolute -right-44 -top-44 h-[520px] w-[520px] rounded-full bg-white/30 blur-[1px]" />
      <div className="pointer-events-none absolute -left-56 -bottom-72 h-[680px] w-[680px] rounded-full bg-white/20 blur-[1px]" />

      {/* Stage card */}
      <div className="relative mx-auto grid min-h-screen w-full place-items-center p-6">
        <div className="relative h-[620px] w-[min(1040px,calc(100vw-3rem))] overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          {/* Stage gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#b98374_0%,#c9988a_35%,#d5b0a0_100%)]" />

          {/* Inner depth */}
          <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(360px_280px_at_65%_30%,rgba(0,0,0,0.14),transparent_65%),radial-gradient(520px_360px_at_18%_72%,rgba(0,0,0,0.12),transparent_70%),radial-gradient(280px_220px_at_84%_76%,rgba(255,255,255,0.16),transparent_60%)]" />

          {/* Decorative pills (left) */}
          <div className="absolute left-[10%] top-1/2 z-10 -translate-y-1/2 space-y-4 max-md:left-[6%] max-md:scale-90">
            <div className="h-7 w-[74px] -rotate-[28deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35))] shadow-[0_12px_24px_rgba(0,0,0,0.18)]" />
            <div className="h-7 w-[92px] -translate-x-[-8px] -rotate-[28deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35))] shadow-[0_12px_24px_rgba(0,0,0,0.18)]" />
            <div className="h-7 w-[64px] -translate-x-[-4px] -rotate-[28deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35))] shadow-[0_12px_24px_rgba(0,0,0,0.18)]" />
          </div>

          {/* Glass login card */}
          <div className="absolute left-1/2 top-1/2 z-20 w-[min(460px,calc(100%-4rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/25 bg-white/20 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            {/* Brand */}
            <div className="mb-6 text-center">
              <Logo size="lg" variant="light" />
              <h1 className="mt-3 text-2xl font-semibold text-white/90">
                Chào mừng trở lại
              </h1>
              <p className="mt-1 text-sm text-white/70">Đăng nhập vào tài khoản của bạn</p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="text-sm font-semibold text-white/90">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="username@gmail.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={[
                    "mt-1 h-11 w-full rounded-xl border bg-white/90 px-3 text-sm text-slate-800 placeholder:text-slate-500/70 outline-none",
                    "focus:ring-2 focus:ring-white/35",
                    errors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-white/30 focus:border-white/60",
                  ].join(" ")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-red-100">
                    {errors.email}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/90">
                  Mật khẩu
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={[
                    "mt-1 h-11 w-full rounded-xl border bg-white/90 px-3 text-sm text-slate-800 placeholder:text-slate-500/70 outline-none",
                    "focus:ring-2 focus:ring-white/35",
                    errors.password
                      ? "border-red-400 focus:border-red-400"
                      : "border-white/30 focus:border-white/60",
                  ].join(" ")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-red-100">
                    {errors.password}
                  </p>
                )}
              </label>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="cursor-pointer text-xs font-medium text-white/90 hover:text-white hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "mt-2 h-11 w-full rounded-xl font-extrabold tracking-wide text-white",
                  "shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
                  "bg-[linear-gradient(180deg,#8f5f53_0%,#6e463e_100%)]",
                  "cursor-pointer hover:brightness-[1.05] active:brightness-95",
                  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
                ].join(" ")}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/25" />
              <span className="text-xs text-white/85">hoặc tiếp tục với</span>
              <div className="h-px flex-1 bg-white/25" />
            </div>

            {/* Social */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                aria-label="Continue with Google"
                className="flex h-10 w-24 cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/90 shadow-[0_10px_22px_rgba(0,0,0,0.14)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FcGoogle className="text-xl" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={loading}
                aria-label="Continue with GitHub"
                className="flex h-10 w-24 cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/90 shadow-[0_10px_22px_rgba(0,0,0,0.14)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaGithub className="text-lg text-slate-800" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
                aria-label="Continue with Facebook"
                className="flex h-10 w-24 cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/90 shadow-[0_10px_22px_rgba(0,0,0,0.14)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaFacebookF className="text-lg text-[#1877F2]" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-white/90">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={handleRegister}
                className="cursor-pointer font-extrabold text-white hover:underline"
              >
                Đăng ký miễn phí
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
