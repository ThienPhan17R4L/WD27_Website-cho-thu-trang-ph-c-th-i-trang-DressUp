import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { profileApi } from "@/api/profile.api";
import { useNotification } from "@/contexts/NotificationContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showNotification("error", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      showNotification("error", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await profileApi.resetPassword(token, password);
      setDone(true);
      showNotification("success", "Đặt lại mật khẩu thành công");
    } catch (err: any) {
      showNotification("error", err.message || "Token không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ef] px-4">
        <div className="text-center">
          <p className="text-slate-600">Link không hợp lệ.</p>
          <Link to="/forgot-password" className="mt-2 text-sm text-rose-600 hover:underline">
            Yêu cầu link mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f3ef] px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Đặt lại mật khẩu</h1>

        {done ? (
          <div className="mt-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              Mật khẩu đã được đặt lại thành công.
            </div>
            <Link
              to="/login"
              className="mt-4 block text-center text-sm text-rose-600 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
