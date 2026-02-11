import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo.svg";

type VerificationStatus = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("Đang xác minh email của bạn...");

  useEffect(() => {
    const token = searchParams.get("token");
    const statusParam = searchParams.get("status");
    const messageParam = searchParams.get("message");

    // Priority 1: Check if redirected from backend with status (after verification)
    if (statusParam === "success") {
      setStatus("success");
      setMessage(messageParam || "Email đã được xác minh thành công!");
      return;
    }

    if (statusParam === "error") {
      setStatus("error");
      setMessage(messageParam || "Xác minh email thất bại. Link có thể đã hết hạn.");
      return;
    }

    // Priority 2: If no status but has token, call API to verify
    if (token) {
      verifyEmail(token);
      return;
    }

    // Priority 3: No status and no token = invalid link
    setStatus("error");
    setMessage("Link xác minh không hợp lệ.");
  }, [searchParams]);

  async function verifyEmail(token: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3030"}/api/auth/verify-email?token=${encodeURIComponent(token)}`
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Email đã được xác minh thành công! Bạn có thể đăng nhập ngay.");
      } else {
        setStatus("error");
        setMessage(data.message || "Xác minh email thất bại. Link có thể đã hết hạn.");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      setStatus("error");
      setMessage("Có lỗi xảy ra khi xác minh email. Vui lòng thử lại.");
    }
  }

  function goToLogin() {
    navigate("/login");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_12%_10%,rgba(213,176,160,0.55)_0%,rgba(213,176,160,0.18)_45%,transparent_70%),radial-gradient(800px_520px_at_88%_18%,rgba(255,255,255,0.35)_0%,transparent_60%),linear-gradient(180deg,#f6efec_0%,#ead1c7_35%,#d5b0a0_100%)]" />
      <div className="pointer-events-none absolute -right-44 -top-44 h-[520px] w-[520px] rounded-full bg-white/30 blur-[1px]" />
      <div className="pointer-events-none absolute -left-56 -bottom-72 h-[680px] w-[680px] rounded-full bg-white/20 blur-[1px]" />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-6">
        <div className="w-[min(520px,calc(100vw-3rem))] overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="relative bg-[linear-gradient(135deg,#b98374_0%,#c9988a_35%,#d5b0a0_100%)]">
            <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(360px_280px_at_65%_30%,rgba(0,0,0,0.14),transparent_65%),radial-gradient(520px_360px_at_18%_72%,rgba(0,0,0,0.12),transparent_70%),radial-gradient(280px_220px_at_84%_76%,rgba(255,255,255,0.16),transparent_60%)]" />

            <div className="relative z-10 p-8">
              <div className="rounded-2xl border border-white/25 bg-white/20 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                {/* Logo and Title */}
                <div className="mb-6 flex flex-col items-center">
                  <img src={logo} alt="DressUp logo" className="h-20 w-auto mb-4" />
                  <h1 className="text-3xl font-extrabold text-white text-center">
                    Email Verification
                  </h1>
                </div>

                {/* Status Icon and Message */}
                <div className="text-center">
                  {status === "verifying" && (
                    <div className="mb-4">
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                    </div>
                  )}

                  {status === "success" && (
                    <div className="mb-4 text-6xl">✅</div>
                  )}

                  {status === "error" && (
                    <div className="mb-4 text-6xl">❌</div>
                  )}

                  <p
                    className={`text-base font-medium ${
                      status === "error" ? "text-red-100" : "text-white/90"
                    }`}
                  >
                    {message}
                  </p>

                  {status === "success" && (
                    <button
                      onClick={goToLogin}
                      className="mt-6 h-11 w-full rounded-xl px-6 font-extrabold tracking-wide text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] bg-[linear-gradient(180deg,#8f5f53_0%,#6e463e_100%)] cursor-pointer hover:brightness-[1.05] active:brightness-95"
                    >
                      Đi đến trang đăng nhập
                    </button>
                  )}

                  {status === "error" && (
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={goToLogin}
                        className="h-11 w-full rounded-xl px-6 font-extrabold tracking-wide text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] bg-[linear-gradient(180deg,#8f5f53_0%,#6e463e_100%)] cursor-pointer hover:brightness-[1.05] active:brightness-95"
                      >
                        Đi đến trang đăng nhập
                      </button>
                      <p className="text-xs text-white/70">
                        Nếu bạn cần link xác minh mới, vui lòng liên hệ support.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
