"use client";

import { useEffect, useState, useTransition } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FeatherIcon from "@/components/FeatherIcon";

export default function AdminTable() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState(""); // "delete" or "toggleStatus"

  const supabase = createClientComponentClient();

  // Check user role on component mount
  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.role || null);
    };

    getUserRole();
  }, [supabase.auth]);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "getAdmins" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}`
        );
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setAdmins(result.data || []);
        setFilteredAdmins(result.data || []);

        // Calculate total pages
        const total = Math.ceil(result.data.length / itemsPerPage);
        setTotalPages(total || 1);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Failed to fetch admins: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      fetchAdmins();
    }
  }, [userRole]);

  // Update filtered admins when pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredAdmins(admins.slice(startIndex, endIndex));

    // Update total pages when admins or itemsPerPage changes
    const total = Math.ceil(admins.length / itemsPerPage);
    setTotalPages(total || 1);
  }, [currentPage, itemsPerPage, admins]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/actions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "createAdmin",
            email,
            password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          setEmail("");
          setPassword("");
          setSuccess("Admin created successfully!");
          await fetchAdmins();

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(result.error || "Failed to create admin");
        }
      } catch (e) {
        console.error("Create admin error:", e);
        setError("Failed to create admin: " + e.message);
      }
    });
  };

  // Handle delete admin
  const handleDeleteAdmin = async () => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteAdmin",
          userId: selectedAdmin.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Admin deleted successfully!");
        setShowDeleteConfirm(false);
        setSelectedAdmin(null);
        await fetchAdmins();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to delete admin");
      }
    } catch (e) {
      console.error("Delete admin error:", e);
      setError("Failed to delete admin: " + e.message);
    }
  };

  // Handle toggle admin status
  const handleToggleAdminStatus = async () => {
    setError("");
    setSuccess("");

    try {
      // Check if user is currently disabled
      const isCurrentlyDisabled =
        selectedAdmin.user_metadata?.disabled ||
        (selectedAdmin.banned_until &&
          new Date(selectedAdmin.banned_until) > new Date());

      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggleAdminStatus",
          userId: selectedAdmin.id,
          disabled: !isCurrentlyDisabled, // Toggle the status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Admin ${!isCurrentlyDisabled ? "disabled" : "enabled"} successfully!`
        );
        setShowStatusConfirm(false);
        setSelectedAdmin(null);
        await fetchAdmins();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to update admin status");
      }
    } catch (e) {
      console.error("Toggle admin status error:", e);
      setError("Failed to update admin status: " + e.message);
    }
  };

  // Check if an admin is disabled
  const isAdminDisabled = (admin) => {
    return (
      admin.user_metadata?.disabled ||
      (admin.banned_until && new Date(admin.banned_until) > new Date())
    );
  };

  // Open confirmation dialog
  const openConfirmationDialog = (admin, type) => {
    setSelectedAdmin(admin);
    setActionType(type);

    if (type === "delete") {
      setShowDeleteConfirm(true);
    } else if (type === "toggleStatus") {
      setShowStatusConfirm(true);
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FeatherIcon name="shield-off" size={32} className="text-red-500" />
          </div>
          <h1 className="font-[tajawal] text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h1>
          <p className="font-[tajawal] text-gray-600">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-6 mb-8">
          <div className="text-right">
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2">
              إدارة المشرفين
            </h1>
            <p className="font-[tajawal] text-gray-600">
              إدارة حسابات المشرفين في النظام
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FeatherIcon name="users" size={20} className="text-blue-500" />
              <span className="font-[tajawal] text-sm text-blue-700">
                {admins.length} مشرف في النظام
              </span>
            </div>
          </div>
        </div>

        {/* Add Admin Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-4 text-right">
            إضافة مشرف جديد
          </h2>

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-[tajawal] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <FeatherIcon name="user-plus" size={16} className="pb-6" />
                  إضافة مشرف
                </>
              )}
            </button>
          </form>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FeatherIcon
                name="alert-circle"
                size={20}
                className="text-red-500"
              />
              <div className="text-right">
                <p className="font-[tajawal] font-medium text-red-800">خطأ</p>
                <p className="font-[tajawal] text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FeatherIcon
                name="check-circle"
                size={20}
                className="text-green-500"
              />
              <div className="text-right">
                <p className="font-[tajawal] font-medium text-green-800">
                  تم بنجاح
                </p>
                <p className="font-[tajawal] text-green-700 text-sm">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls - Top */}
        {/* {admins.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-[tajawal] text-sm text-gray-600">عرض</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] transition-colors duration-200"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="font-[tajawal] text-sm text-gray-600">
                عناصر في الصفحة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )} */}

        {/* Admins Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-4 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                    الصلاحية
                  </th>
                  <th className="px-6 py-4 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-4 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => {
                    const isDisabled = isAdminDisabled(admin);
                    const isCurrentUser =
                      admin.id === supabase.auth.getUser()?.id;

                    return (
                      <tr
                        key={admin.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-end">
                            <span className="font-[tajawal] font-medium text-gray-800">
                              {admin.email}
                            </span>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FeatherIcon
                                name="user"
                                size={16}
                                className="text-blue-500 pb-6"
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-[tajawal] font-medium bg-blue-100 text-blue-700">
                            {admin.user_metadata?.role || "admin"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="font-[tajawal] text-gray-600 text-sm">
                            {admin.created_at
                              ? new Date(admin.created_at).toLocaleDateString(
                                  "ar-EG"
                                )
                              : "غير معروف"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[tajawal] font-medium ${
                              isDisabled
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            <FeatherIcon
                              name={isDisabled ? "x-circle" : "check-circle"}
                              size={12}
                              className="ml-1 pb-6 mr-1"
                            />
                            {isDisabled ? "معطل" : "مفعل"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {/* Toggle Status Button */}
                            <button
                              onClick={() =>
                                openConfirmationDialog(admin, "toggleStatus")
                              }
                              disabled={isCurrentUser}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                isDisabled ? "تفعيل الحساب" : "تعطيل الحساب"
                              }
                            >
                              <FeatherIcon
                                name={isDisabled ? "user-check" : "user-x"}
                                size={16}
                                className="pb-6"
                              />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() =>
                                openConfirmationDialog(admin, "delete")
                              }
                              disabled={isCurrentUser}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="حذف المشرف"
                            >
                              <FeatherIcon
                                name="trash-2"
                                size={16}
                                className="pb-6"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FeatherIcon
                          name="users"
                          size={48}
                          className="text-gray-300 mb-4"
                        />
                        <p className="font-[tajawal] text-gray-600 mb-2">
                          لا توجد حسابات مشرفين
                        </p>
                        <p className="font-[tajawal] text-gray-500 text-sm">
                          ابدأ بإضافة أول مشرف إلى النظام
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {admins.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
              <div className="font-[tajawal] text-sm text-gray-600">
                عرض {filteredAdmins.length} من {admins.length} مشرف
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="flex flex-col mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-right">
          <div className="flex items-center justify-end gap-3">
            <h3 className="font-[tajawal] font-medium text-yellow-800 mb-2">
              ملاحظة أمنية مهمة
            </h3>
            <FeatherIcon
              name="shield"
              size={24}
              color="#D97706"
              className="pb-8"
            />
          </div>
          <div className="text-right">
            <p className="font-[tajawal] text-yellow-700 text-sm">
              تأكد من منح صلاحية المشرف فقط للأشخاص الموثوقين. المشرفون لديهم
              صلاحية كاملة على النظام.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <FeatherIcon
                name="alert-triangle"
                size={24}
                className="text-red-500"
              />
              <h3 className="font-[tajawal] text-xl font-bold text-gray-800">
                تأكيد الحذف
              </h3>
            </div>

            <p className="font-[tajawal] text-gray-600 mb-6 text-right">
              هل أنت متأكد من أنك تريد حذف المشرف{" "}
              <strong>{selectedAdmin?.email}</strong>؟ هذا الإجراء لا يمكن
              التراجع عنه.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-[tajawal]"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-[tajawal]"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusConfirm && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <FeatherIcon
                name={isAdminDisabled(selectedAdmin) ? "user-check" : "user-x"}
                size={24}
                className="text-blue-500"
              />
              <h3 className="font-[tajawal] text-xl font-bold text-gray-800">
                {isAdminDisabled(selectedAdmin)
                  ? "تفعيل الحساب"
                  : "تعطيل الحساب"}
              </h3>
            </div>

            <p className="font-[tajawal] text-gray-600 mb-6 text-right">
              هل أنت متأكد من أنك تريد{" "}
              {isAdminDisabled(selectedAdmin) ? "تفعيل" : "تعطيل"} حساب المشرف{" "}
              <strong>{selectedAdmin.email}</strong>؟
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusConfirm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-[tajawal]"
              >
                إلغاء
              </button>
              <button
                onClick={handleToggleAdminStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-[tajawal]"
              >
                {isAdminDisabled(selectedAdmin) ? "تفعيل" : "تعطيل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
