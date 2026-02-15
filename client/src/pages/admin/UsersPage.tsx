import { useState } from "react";
import { Container } from "@/components/common/Container";
import { useAdminUsers, useCreateStaff, useUpdateUserRoles, useBlockUser, useUnblockUser } from "@/hooks/useAdminUsers";
import { useNotification } from "@/contexts/NotificationContext";
import { PaginationBar } from "@/components/common/PaginationBar";

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "user", label: "Khách hàng" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: "Hoạt động", cls: "bg-green-100 text-green-700" },
  blocked: { text: "Đã khoá", cls: "bg-red-100 text-red-600" },
  pending: { text: "Chờ xác thực", cls: "bg-yellow-100 text-yellow-700" },
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const { showNotification } = useNotification();

  const { data, isLoading } = useAdminUsers({ page, limit: 20, search: search || undefined, role: role || undefined });
  const createStaff = useCreateStaff();
  const updateRoles = useUpdateUserRoles();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  // Create Staff modal
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ email: "", password: "", fullName: "", phone: "" });

  // Edit Roles modal
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Block Reason modal
  const [blockTarget, setBlockTarget] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");

  const handleCreateStaff = async () => {
    try {
      await createStaff.mutateAsync({
        email: staffForm.email,
        password: staffForm.password,
        fullName: staffForm.fullName,
        phone: staffForm.phone || undefined,
      });
      showNotification("success", "Tạo tài khoản staff thành công");
      setShowCreateStaff(false);
      setStaffForm({ email: "", password: "", fullName: "", phone: "" });
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;
    try {
      await updateRoles.mutateAsync({ id: editingUser._id || editingUser.id, roles: selectedRoles });
      showNotification("success", "Cập nhật vai trò thành công");
      setEditingUser(null);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const openBlockModal = (u: any) => {
    const roles: string[] = u.roles || [];
    const isStaff = roles.includes("staff");
    if (isStaff) {
      // Staff can be blocked directly
      handleBlockConfirm(u._id || u.id);
    } else {
      // User requires reason
      setBlockTarget(u);
      setBlockReason("");
    }
  };

  const handleBlockConfirm = async (id?: string, reason?: string) => {
    const userId = id || blockTarget?._id || blockTarget?.id;
    if (!userId) return;
    try {
      await blockUser.mutateAsync({ id: userId, reason });
      showNotification("success", "Đã khoá tài khoản");
      setBlockTarget(null);
      setBlockReason("");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockUser.mutateAsync(id);
      showNotification("success", "Đã mở khoá tài khoản");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Quản lý người dùng</h1>
            <button
              onClick={() => setShowCreateStaff(true)}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
            >
              + Tạo tài khoản Staff
            </button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm email, tên..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Họ tên</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Lý do khoá</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u: any) => {
                    const status = STATUS_LABEL[u.status] || STATUS_LABEL.active;
                    const isBlocked = u.status === "blocked";
                    return (
                      <tr key={u._id || u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{u.email}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {(u.roles || []).map((r: string) => (
                              <span
                                key={r}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  r === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : r === "staff"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                          {u.blockReason || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setSelectedRoles(u.roles || ["user"]);
                              }}
                              className="text-xs text-rose-600 hover:underline"
                            >
                              Vai trò
                            </button>
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblock(u._id || u.id)}
                                className="text-xs text-green-600 hover:underline"
                              >
                                Mở khoá
                              </button>
                            ) : (
                              <button
                                onClick={() => openBlockModal(u)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Khoá
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>

      {/* Create Staff Modal */}
      {showCreateStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Tạo tài khoản Staff</h3>
              <button onClick={() => setShowCreateStaff(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  placeholder="staff@dressup.vn"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  placeholder="0901234567"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateStaff(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateStaff}
                disabled={createStaff.isPending || !staffForm.email || !staffForm.password || !staffForm.fullName}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {createStaff.isPending ? "Đang tạo..." : "Tạo Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Cập nhật vai trò: {editingUser.fullName}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-4 space-y-2">
              {["user", "staff", "admin"].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r)}
                    onChange={(e) => {
                      setSelectedRoles(
                        e.target.checked
                          ? [...selectedRoles, r]
                          : selectedRoles.filter((x) => x !== r)
                      );
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleRoleSave}
                disabled={updateRoles.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Reason Modal */}
      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Khoá tài khoản: {blockTarget.fullName}</h3>
              <button onClick={() => setBlockTarget(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Bạn cần nhập lý do khi khoá tài khoản người dùng (bắt buộc).
            </p>
            <div className="mt-3">
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                placeholder="Nhập lý do khoá tài khoản..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setBlockTarget(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleBlockConfirm(undefined, blockReason)}
                disabled={blockUser.isPending || !blockReason.trim()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {blockUser.isPending ? "Đang khoá..." : "Xác nhận khoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
