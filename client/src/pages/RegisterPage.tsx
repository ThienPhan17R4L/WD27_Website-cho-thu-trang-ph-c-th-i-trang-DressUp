import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from '@/assets/logo.svg';

type Gender = "male" | "female" | "other";

type RegisterPayload = {
	email: string;
	phone: string;
	password: string;

	fullName: string;
	dob?: string;
	gender?: Gender;

	address: {
		receiverName: string;
		receiverPhone: string;

		line1: string;
		ward: string;
		district: string;
		province: string;
		country: string;
		postalCode?: string;
	};

	identity?: {
		idNumber: string;
	};
};

type Errors = Record<string, string | undefined>;

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidVNPhone(phone: string) {
	const p = phone.trim();
	return /^(0\d{9,10}|\+84\d{9,10})$/.test(p);
}

export default function RegisterPage() {
	const navigate = useNavigate();

	const [form, setForm] = useState<RegisterPayload>({
		email: "",
		phone: "",
		password: "",

		fullName: "",
		dob: "",
		gender: "other",

		address: {
			receiverName: "",
			receiverPhone: "",
			line1: "",
			ward: "",
			district: "",
			province: "",
			country: "VN",
			postalCode: "",
		},
		identity: undefined,
	});

	const [confirmPassword, setConfirmPassword] = useState("");
	const [hasIdentity, setHasIdentity] = useState(false);

	const [errors, setErrors] = useState<Errors>({});
	const [loading, setLoading] = useState(false);

	const canSubmit = useMemo(() => {
		const requiredOk =
			form.email.trim() &&
			form.phone.trim() &&
			form.password &&
			confirmPassword &&
			form.fullName.trim() &&
			form.address.receiverName.trim() &&
			form.address.receiverPhone.trim() &&
			form.address.line1.trim() &&
			form.address.ward.trim() &&
			form.address.district.trim() &&
			form.address.province.trim() &&
			form.address.country.trim();

		return Boolean(requiredOk) && !loading;
	}, [form, confirmPassword, loading]);

	function setField(path: string, value: any) {
		setForm((prev) => {
			const next: any = structuredClone(prev);
			const parts = path.split(".");
			let cur = next;
			for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
			cur[parts[parts.length - 1]] = value;
			return next;
		});

		setErrors((prev) => ({ ...prev, [path]: undefined }));
	}

	function validate(values: RegisterPayload): Errors {
		const e: Errors = {};

		if (!values.email.trim()) e["email"] = "Email is required.";
		else if (!isValidEmail(values.email)) e["email"] = "Email is not valid.";

		if (!values.phone.trim()) e["phone"] = "Phone is required.";
		else if (!isValidVNPhone(values.phone))
			e["phone"] = "Phone format is not valid (VN).";

		if (!values.password) e["password"] = "Password is required.";
		else if (values.password.length < 6)
			e["password"] = "Password must be at least 6 characters.";

		if (!confirmPassword) e["confirmPassword"] = "Confirm password is required.";
		else if (confirmPassword !== values.password)
			e["confirmPassword"] = "Passwords do not match.";

		if (!values.fullName.trim()) e["fullName"] = "Full name is required.";

		if (!values.address.receiverName.trim())
			e["address.receiverName"] = "Receiver name is required.";

		if (!values.address.receiverPhone.trim())
			e["address.receiverPhone"] = "Receiver phone is required.";
		else if (!isValidVNPhone(values.address.receiverPhone))
			e["address.receiverPhone"] = "Receiver phone format is not valid (VN).";

		if (!values.address.line1.trim()) e["address.line1"] = "Line1 is required.";
		if (!values.address.ward.trim()) e["address.ward"] = "Ward is required.";
		if (!values.address.district.trim())
			e["address.district"] = "District is required.";
		if (!values.address.province.trim())
			e["address.province"] = "Province is required.";
		if (!values.address.country.trim())
			e["address.country"] = "Country is required.";

		if (hasIdentity) {
			const id = values.identity?.idNumber?.trim() ?? "";
			if (!id) e["identity.idNumber"] = "ID Number is required when enabled.";
		}

		return e;
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const values: RegisterPayload = {
			...form,
			identity: hasIdentity
				? { idNumber: form.identity?.idNumber?.trim() ?? "" }
				: undefined,
			dob: form.dob?.trim() ? form.dob : undefined,
			address: {
				...form.address,
				postalCode: form.address.postalCode?.trim()
					? form.address.postalCode
					: undefined,
			},
		};

		const nextErrors = validate(values);
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		try {
			setLoading(true);
			// TODO: await authApi.register(values)
			await new Promise((r) => setTimeout(r, 900));
			navigate("/login", { replace: true });
		} catch (err) {
			console.error(err);
			setErrors({ email: "Register failed. Please try again." });
		} finally {
			setLoading(false);
		}
	}

	function goLogin() {
		navigate("/login");
	}

	// UI helpers
	const inputBase =
		"mt-1 h-11 w-full rounded-xl border bg-white/90 px-3 text-sm text-slate-800 placeholder:text-slate-500/70 outline-none focus:ring-2 focus:ring-white/35";
	const labelBase = "text-sm font-semibold text-white/90";
	const errText = "mt-1 text-xs font-medium text-red-100";

	function fieldClass(path: string) {
		return [
			inputBase,
			errors[path]
				? "border-red-400 focus:border-red-400"
				: "border-white/30 focus:border-white/60",
		].join(" ");
	}

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_12%_10%,rgba(213,176,160,0.55)_0%,rgba(213,176,160,0.18)_45%,transparent_70%),radial-gradient(800px_520px_at_88%_18%,rgba(255,255,255,0.35)_0%,transparent_60%),linear-gradient(180deg,#f6efec_0%,#ead1c7_35%,#d5b0a0_100%)]" />
			<div className="pointer-events-none absolute -right-44 -top-44 h-[520px] w-[520px] rounded-full bg-white/30 blur-[1px]" />
			<div className="pointer-events-none absolute -left-56 -bottom-72 h-[680px] w-[680px] rounded-full bg-white/20 blur-[1px]" />

			{/* IMPORTANT: allow page scroll */}
			<div className="relative mx-auto min-h-screen w-full p-6">
				{/* Stage: min height, not fixed height */}
				<div className="mx-auto w-[min(1120px,calc(100vw-3rem))] overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
					<div className="relative bg-[linear-gradient(135deg,#b98374_0%,#c9988a_35%,#d5b0a0_100%)]">
						<div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(360px_280px_at_65%_30%,rgba(0,0,0,0.14),transparent_65%),radial-gradient(520px_360px_at_18%_72%,rgba(0,0,0,0.12),transparent_70%),radial-gradient(280px_220px_at_84%_76%,rgba(255,255,255,0.16),transparent_60%)]" />

						{/* Header bar */}
						<div className="relative z-10 flex flex-col gap-4 border-b border-white/15 p-6 md:flex-row md:items-end md:justify-between">
							<div>
								<div className="mb-4 flex items-center gap-3">
									<img
										src={logo}
										alt="DressUp logo"
										className="h-24 w-auto"
									/>
									<h1 className="text-4xl font-extrabold leading-none text-white">
										Register
									</h1>
								</div>
								<p className="mt-2 text-sm text-white/80">
									Create your account and set a default address for rentals.
								</p>
							</div>

							<button
								type="button"
								onClick={goLogin}
								className="cursor-pointer rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
							>
								Back to Login
							</button>
						</div>

						{/* Content area (scroll inside if screen is short) */}
						<div className="relative z-10 p-6">
							<div className="rounded-2xl border border-white/25 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
								<form onSubmit={handleSubmit} noValidate className="space-y-5">
									{/* AUTH */}
									<section className="rounded-2xl border border-white/20 bg-white/10 p-4">
										<h2 className="text-sm font-extrabold tracking-wide text-white/90">
											AUTH
										</h2>

										<div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
											<label className="block">
												<span className={labelBase}>Email *</span>
												<input
													type="email"
													autoComplete="email"
													value={form.email}
													onChange={(e) => setField("email", e.target.value)}
													placeholder="username@gmail.com"
													className={fieldClass("email")}
												/>
												{errors["email"] && (
													<p className={errText}>{errors["email"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Phone *</span>
												<input
													type="tel"
													autoComplete="tel"
													value={form.phone}
													onChange={(e) => setField("phone", e.target.value)}
													placeholder="0xxxxxxxxx or +84xxxxxxxxx"
													className={fieldClass("phone")}
												/>
												{errors["phone"] && (
													<p className={errText}>{errors["phone"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Password *</span>
												<input
													type="password"
													autoComplete="new-password"
													value={form.password}
													onChange={(e) => setField("password", e.target.value)}
													placeholder="Password"
													className={fieldClass("password")}
												/>
												{errors["password"] && (
													<p className={errText}>{errors["password"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Confirm Password *</span>
												<input
													type="password"
													autoComplete="new-password"
													value={confirmPassword}
													onChange={(e) => {
														setConfirmPassword(e.target.value);
														setErrors((p) => ({ ...p, confirmPassword: undefined }));
													}}
													placeholder="Confirm password"
													className={[
														inputBase,
														errors["confirmPassword"]
															? "border-red-400 focus:border-red-400"
															: "border-white/30 focus:border-white/60",
													].join(" ")}
												/>
												{errors["confirmPassword"] && (
													<p className={errText}>{errors["confirmPassword"]}</p>
												)}
											</label>
										</div>
									</section>

									{/* PROFILE */}
									<section className="rounded-2xl border border-white/20 bg-white/10 p-4">
										<h2 className="text-sm font-extrabold tracking-wide text-white/90">
											PROFILE
										</h2>

										<div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
											<label className="block md:col-span-2">
												<span className={labelBase}>Full name *</span>
												<input
													type="text"
													value={form.fullName}
													onChange={(e) => setField("fullName", e.target.value)}
													placeholder="Nguyen Van A"
													className={fieldClass("fullName")}
												/>
												{errors["fullName"] && (
													<p className={errText}>{errors["fullName"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Date of birth</span>
												<input
													type="date"
													value={form.dob ?? ""}
													onChange={(e) => setField("dob", e.target.value)}
													className={inputBase + " border-white/30 focus:border-white/60"}
												/>
											</label>

											<label className="block">
												<span className={labelBase}>Gender</span>
												<select
													value={form.gender ?? "other"}
													onChange={(e) =>
														setField("gender", e.target.value as Gender)
													}
													className={inputBase + " border-white/30 focus:border-white/60"}
												>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="other">Other</option>
												</select>
											</label>
										</div>
									</section>

									{/* ADDRESS */}
									<section className="rounded-2xl border border-white/20 bg-white/10 p-4">
										<h2 className="text-sm font-extrabold tracking-wide text-white/90">
											ADDRESS
										</h2>

										<div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
											<label className="block">
												<span className={labelBase}>Receiver name *</span>
												<input
													type="text"
													value={form.address.receiverName}
													onChange={(e) =>
														setField("address.receiverName", e.target.value)
													}
													placeholder="Receiver name"
													className={fieldClass("address.receiverName")}
												/>
												{errors["address.receiverName"] && (
													<p className={errText}>
														{errors["address.receiverName"]}
													</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Receiver phone *</span>
												<input
													type="tel"
													value={form.address.receiverPhone}
													onChange={(e) =>
														setField("address.receiverPhone", e.target.value)
													}
													placeholder="0xxxxxxxxx or +84xxxxxxxxx"
													className={fieldClass("address.receiverPhone")}
												/>
												{errors["address.receiverPhone"] && (
													<p className={errText}>
														{errors["address.receiverPhone"]}
													</p>
												)}
											</label>

											<label className="block md:col-span-2">
												<span className={labelBase}>Line1 *</span>
												<input
													type="text"
													value={form.address.line1}
													onChange={(e) => setField("address.line1", e.target.value)}
													placeholder="123 Nguyen Trai"
													className={fieldClass("address.line1")}
												/>
												{errors["address.line1"] && (
													<p className={errText}>{errors["address.line1"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Ward *</span>
												<input
													type="text"
													value={form.address.ward}
													onChange={(e) => setField("address.ward", e.target.value)}
													placeholder="Ward"
													className={fieldClass("address.ward")}
												/>
												{errors["address.ward"] && (
													<p className={errText}>{errors["address.ward"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>District *</span>
												<input
													type="text"
													value={form.address.district}
													onChange={(e) =>
														setField("address.district", e.target.value)
													}
													placeholder="District"
													className={fieldClass("address.district")}
												/>
												{errors["address.district"] && (
													<p className={errText}>{errors["address.district"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Province *</span>
												<input
													type="text"
													value={form.address.province}
													onChange={(e) =>
														setField("address.province", e.target.value)
													}
													placeholder="Ho Chi Minh"
													className={fieldClass("address.province")}
												/>
												{errors["address.province"] && (
													<p className={errText}>{errors["address.province"]}</p>
												)}
											</label>

											<label className="block">
												<span className={labelBase}>Country *</span>
												<input
													type="text"
													value={form.address.country}
													onChange={(e) =>
														setField("address.country", e.target.value)
													}
													placeholder="VN"
													className={fieldClass("address.country")}
												/>
												{errors["address.country"] && (
													<p className={errText}>{errors["address.country"]}</p>
												)}
											</label>

											<label className="block md:col-span-2">
												<span className={labelBase}>Postal code</span>
												<input
													type="text"
													value={form.address.postalCode ?? ""}
													onChange={(e) =>
														setField("address.postalCode", e.target.value)
													}
													placeholder="Optional"
													className={inputBase + " border-white/30 focus:border-white/60"}
												/>
											</label>
										</div>
									</section>

									{/* OPTIONAL KYC */}
									<section className="rounded-2xl border border-white/20 bg-white/10 p-4">
										<div className="flex items-center justify-between gap-3">
											<h2 className="text-sm font-extrabold tracking-wide text-white/90">
												OPTIONAL KYC
											</h2>

											<label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
												<input
													type="checkbox"
													checked={hasIdentity}
													onChange={(e) => {
														const checked = e.target.checked;
														setHasIdentity(checked);
														setErrors((p) => ({ ...p, "identity.idNumber": undefined }));
														setForm((prev) => ({
															...prev,
															identity: checked
																? { idNumber: prev.identity?.idNumber ?? "" }
																: undefined,
														}));
													}}
													className="h-4 w-4 cursor-pointer accent-[#6e463e]"
												/>
												Add ID number
											</label>
										</div>

										{hasIdentity && (
											<div className="mt-3">
												<label className="block">
													<span className={labelBase}>ID Number *</span>
													<input
														type="text"
														value={form.identity?.idNumber ?? ""}
														onChange={(e) =>
															setField("identity.idNumber", e.target.value)
														}
														placeholder="CCCD / Passport"
														className={fieldClass("identity.idNumber")}
													/>
													{errors["identity.idNumber"] && (
														<p className={errText}>{errors["identity.idNumber"]}</p>
													)}
												</label>
											</div>
										)}
									</section>

									{/* Actions */}
									<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
										<p className="text-xs text-white/80">
											Status defaults to <b>pending</b> until verification.
										</p>

										<button
											type="submit"
											disabled={!canSubmit}
											className={[
												"h-11 rounded-xl px-6 font-extrabold tracking-wide text-white",
												"shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
												"bg-[linear-gradient(180deg,#8f5f53_0%,#6e463e_100%)]",
												"cursor-pointer hover:brightness-[1.05] active:brightness-95",
												"disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
											].join(" ")}
										>
											{loading ? "Creating..." : "Create account"}
										</button>
									</div>
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
