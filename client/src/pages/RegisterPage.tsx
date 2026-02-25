import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "@/api/auth";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/common/Logo";

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidVNPhone(phone: string) {
	const p = phone.trim();
	return /^(0\d{9,10}|\+84\d{9,10})$/.test(p);
}

export default function RegisterPage() {
	const navigate = useNavigate();
	const { showNotification } = useNotification();
	const { user, isAuthenticated } = useAuth();

	const [form, setForm] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		fullName: "",
		phone: "",
	});

	const [loading, setLoading] = useState(false);

	// Auto-redirect if already logged in
	useEffect(() => {
		if (isAuthenticated && user) {
			const isAdmin = user.roles?.includes("admin");
			const redirectPath = isAdmin ? "/admin" : "/home";
			navigate(redirectPath, { replace: true });
		}
	}, [isAuthenticated, user, navigate]);

	function handleChange(field: string, value: string) {
		setForm(prev => ({ ...prev, [field]: value }));
	}

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		// Validation
		if (!form.email.trim()) {
			showNotification("error", "Email là bắt buộc");
			return;
		}
		if (!isValidEmail(form.email)) {
			showNotification("error", "Email không hợp lệ");
			return;
		}

		if (!form.password) {
			showNotification("error", "Mật khẩu là bắt buộc");
			return;
		}
		if (form.password.length < 8) {
			showNotification("error", "Mật khẩu phải có ít nhất 8 ký tự");
			return;
		}

		if (!form.confirmPassword) {
			showNotification("error", "Vui lòng xác nhận mật khẩu");
			return;
		}
		if (form.confirmPassword !== form.password) {
			showNotification("error", "Mật khẩu xác nhận không khớp");
			return;
		}

		if (!form.fullName.trim()) {
			showNotification("error", "Họ tên là bắt buộc");
			return;
		}

		// Phone is optional but validate if provided
		if (form.phone.trim() && !isValidVNPhone(form.phone)) {
			showNotification("error", "Số điện thoại không hợp lệ (VD: 0912345678)");
			return;
		}

		try {
			setLoading(true);

			const payload = {
				email: form.email.trim(),
				password: form.password,
				fullName: form.fullName.trim(),
				phone: form.phone.trim() || undefined,
			};

			const response = await authApi.register(payload);

			// Check if email verification is required
			if (response.requiresEmailVerification) {
				showNotification(
					"info",
					"Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
				);
				// Stay on register page or show a verification pending page
				// User cannot login until they verify their email
			} else {
				showNotification("success", "Đăng ký thành công! Bạn có thể đăng nhập ngay.");
				navigate("/login", { replace: true });
			}
		} catch (err: any) {
			console.error("Register error:", err);
			const message = err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
			showNotification("error", message);
		} finally {
			setLoading(false);
		}
	}

	function goLogin() {
		navigate("/login");
	}

	// UI helpers
	const inputBase =
		"mt-1 h-11 w-full rounded-xl border border-white/30 bg-white/90 px-3 text-sm text-slate-800 placeholder:text-slate-500/70 outline-none focus:ring-2 focus:ring-white/35 focus:border-white/60";
	const labelBase = "text-sm font-semibold text-white/90";

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_12%_10%,rgba(213,176,160,0.55)_0%,rgba(213,176,160,0.18)_45%,transparent_70%),radial-gradient(800px_520px_at_88%_18%,rgba(255,255,255,0.35)_0%,transparent_60%),linear-gradient(180deg,#f6efec_0%,#ead1c7_35%,#d5b0a0_100%)]" />
			<div className="pointer-events-none absolute -right-44 -top-44 h-[520px] w-[520px] rounded-full bg-white/30 blur-[1px]" />
			<div className="pointer-events-none absolute -left-56 -bottom-72 h-[680px] w-[680px] rounded-full bg-white/20 blur-[1px]" />

			<div className="relative mx-auto flex min-h-screen items-center justify-center p-6">
				<div className="w-[min(580px,calc(100vw-3rem))] overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
					<div className="relative bg-[linear-gradient(135deg,#b98374_0%,#c9988a_35%,#d5b0a0_100%)]">
						<div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(360px_280px_at_65%_30%,rgba(0,0,0,0.14),transparent_65%),radial-gradient(520px_360px_at_18%_72%,rgba(0,0,0,0.12),transparent_70%),radial-gradient(280px_220px_at_84%_76%,rgba(255,255,255,0.16),transparent_60%)]" />

						{/* Header bar */}
						<div className="relative z-10 border-b border-white/15 p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex-1" />
								<button
									type="button"
									onClick={goLogin}
									className="cursor-pointer rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
								>
									Quay lại Đăng nhập
								</button>
							</div>
							<div className="text-center">
								<Logo size="lg" variant="light" />
								<h1 className="mt-3 text-2xl font-semibold text-white/90">
									Tạo tài khoản
								</h1>
								<p className="mt-1 text-sm text-white/70">
									Bắt đầu thuê thời trang ngay hôm nay
								</p>
							</div>
						</div>

						{/* Content area */}
						<div className="relative z-10 p-6">
							<div className="rounded-2xl border border-white/25 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
								<form onSubmit={handleSubmit} noValidate className="space-y-5">
									{/* Email */}
									<label className="block">
										<span className={labelBase}>Email *</span>
										<input
											type="email"
											autoComplete="email"
											value={form.email}
											onChange={(e) => handleChange("email", e.target.value)}
											placeholder="username@gmail.com"
											className={inputBase}
											required
										/>
									</label>

									{/* Full Name */}
									<label className="block">
										<span className={labelBase}>Họ và tên *</span>
										<input
											type="text"
											autoComplete="name"
											value={form.fullName}
											onChange={(e) => handleChange("fullName", e.target.value)}
											placeholder="Nguyễn Văn A"
											className={inputBase}
											required
										/>
									</label>

									{/* Phone */}
									<label className="block">
										<span className={labelBase}>Số điện thoại</span>
										<input
											type="tel"
											autoComplete="tel"
											value={form.phone}
											onChange={(e) => handleChange("phone", e.target.value)}
											placeholder="0912345678 hoặc +84912345678"
											className={inputBase}
										/>
										<p className="mt-1 text-xs text-white/70">Tùy chọn - có thể thêm sau</p>
									</label>

									{/* Password */}
									<label className="block">
										<span className={labelBase}>Mật khẩu *</span>
										<input
											type="password"
											autoComplete="new-password"
											value={form.password}
											onChange={(e) => handleChange("password", e.target.value)}
											placeholder="Ít nhất 8 ký tự"
											className={inputBase}
											required
										/>
									</label>

									{/* Confirm Password */}
									<label className="block">
										<span className={labelBase}>Xác nhận mật khẩu *</span>
										<input
											type="password"
											autoComplete="new-password"
											value={form.confirmPassword}
											onChange={(e) => handleChange("confirmPassword", e.target.value)}
											placeholder="Nhập lại mật khẩu"
											className={inputBase}
											required
										/>
									</label>

									{/* Submit Button */}
									<div className="pt-2">
										<button
											type="submit"
											disabled={loading}
											className={[
												"h-11 w-full rounded-xl px-6 font-extrabold tracking-wide text-white",
												"shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
												"bg-[linear-gradient(180deg,#8f5f53_0%,#6e463e_100%)]",
												"cursor-pointer hover:brightness-[1.05] active:brightness-95",
												"disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
											].join(" ")}
										>
											{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
										</button>
									</div>

									<p className="text-center text-xs text-white/80">
										Đã có tài khoản?{" "}
										<button
											type="button"
											onClick={goLogin}
											className="font-semibold underline hover:text-white"
										>
											Đăng nhập ngay
										</button>
									</p>
								</form>
							</div>

							{/* Bottom padding for safe scroll */}
							<div className="h-6" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
