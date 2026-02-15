import { useState } from "react";
import { Link } from "react-router-dom";
import { profileApi } from "@/api/profile.api";
import { useNotification } from "@/contexts/NotificationContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileApi.forgotPassword(email);
      setSent(true);
      showNotification("success", "Đã gửi link đặt lại mật khẩu đến email của bạn");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f3ef] px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nhập email của bạn để nhận link đặt lại mật khẩu.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>.
            Vui lòng kiểm tra hộp thư (và spam).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi link đặt lại"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-rose-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
