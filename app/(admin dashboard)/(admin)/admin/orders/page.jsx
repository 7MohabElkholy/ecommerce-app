"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function OrderManagementDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const supabase = createClientComponentClient();

  const statusOptions = [
    { value: "all", label: "جميع الطلبات", color: "gray" },
    { value: "new", label: "جديد", color: "blue" },
    { value: "confirmed", label: "تم التأكيد", color: "green" },
    { value: "preparing", label: "قيد التجهيز", color: "yellow" },
    { value: "shipped", label: "تم الشحن", color: "purple" },
    { value: "delivered", label: "تم التسليم", color: "green" },
    { value: "cancelled", label: "ملغي", color: "red" },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus };

      if (newStatus === "delivered") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("حدث خطأ أثناء تحديث حالة الطلب");
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedOrders.length === 0) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          ...(newStatus === "delivered" && {
            completed_at: new Date().toISOString(),
          }),
        })
        .in("id", selectedOrders);

      if (error) throw error;

      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error bulk updating orders:", error);
      alert("حدث خطأ أثناء تحديث الطلبات");
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedOrders((prev) =>
      prev.length === orders.length ? [] : orders.map((order) => order.id)
    );
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find((opt) => opt.value === status);
    return statusObj?.color || "gray";
  };

  const getStatusLabel = (status) => {
    const statusObj = statusOptions.find((opt) => opt.value === status);
    return statusObj?.label || status;
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2">
              إدارة الطلبات
            </h1>
            <p className="font-[tajawal] text-gray-600">
              إدارة وتتبع جميع طلبات المتجر
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusOptions.slice(1).map((status) => (
              <div
                key={status.value}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <div
                  className={`w-3 h-3 bg-${status.color}-500 rounded-full mx-auto mb-2`}
                ></div>
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {orders.filter((o) => o.status === status.value).length}
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  {status.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <label className="font-[tajawal] text-sm font-medium text-gray-700">
                التصفية حسب:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-[tajawal] text-sm text-gray-600">
                  {selectedOrders.length} طلب محدد
                </span>
                <select
                  onChange={(e) => bulkUpdateStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
                >
                  <option value="">تغيير الحالة...</option>
                  {statusOptions.slice(1).map((status) => (
                    <option key={status.value} value={status.value}>
                      تغيير إلى {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-right">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === orders.length &&
                        orders.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    المنتجات
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    المبلغ
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    التاريخ
                  </th>
                  <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    {/* Order Number */}
                    <td className="px-6 py-4">
                      <span className="font-[tajawal] font-medium text-blue-600 text-sm">
                        #{order.order_number}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className="font-[tajawal] font-medium text-gray-800 text-sm">
                          {order.customer_name}
                        </p>
                        <p className="font-[tajawal] text-gray-600 text-xs">
                          {order.customer_phone}
                        </p>
                        <p className="font-[tajawal] text-gray-600 text-xs">
                          {order.customer_city}
                        </p>
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className="font-[tajawal] text-gray-800 text-sm">
                          {order.items?.length} منتج
                        </p>
                        <p className="font-[tajawal] text-gray-600 text-xs">
                          {order.items?.[0]?.title}
                          {order.items?.length > 1 &&
                            ` + ${order.items.length - 1} أكثر`}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-[tajawal] font-bold text-gray-800">
                        {order.total_amount?.toLocaleString()} ر.س
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-[tajawal] font-medium border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
                          ${
                            order.status === "new"
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }
                          ${
                            order.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                          ${
                            order.status === "preparing"
                              ? "bg-yellow-100 text-yellow-700"
                              : ""
                          }
                          ${
                            order.status === "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : ""
                          }
                          ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                          ${
                            order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : ""
                          }
                        `}
                      >
                        {statusOptions.slice(1).map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="font-[tajawal] text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <FeatherIcon name="eye" size={16} />
                        </button>
                        <button
                          onClick={() =>
                            window.open(`tel:${order.customer_phone}`)
                          }
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        >
                          <FeatherIcon name="phone" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FeatherIcon
                name="package"
                size={48}
                className="text-gray-300 mx-auto mb-4"
              />
              <p className="font-[tajawal] text-gray-600">
                لا توجد طلبات{" "}
                {filterStatus !== "all"
                  ? `بحالة ${getStatusLabel(filterStatus)}`
                  : "حاليا"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
              <div className="font-[tajawal] text-sm text-gray-600">
                عرض {filteredOrders.length} من {orders.length} طلب
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                  السابق
                </button>
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal (You can implement this) */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
                  تفاصيل الطلب #{editingOrder.order_number}
                </h2>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FeatherIcon name="x" size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Order details implementation */}
                <p className="font-[tajawal] text-gray-600">
                  تفاصيل الطلب هنا...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManagementDashboard;
