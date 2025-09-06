"use client";
import React, { useState, useEffect } from "react";
// import { supabase } from "../../lib/supabaseClient";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "@/app/lib/supabaseClient";
function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const statusOptions = [
    { value: "all", label: "جميع الطلبات", color: "gray" },
    { value: "new", label: "جديد", color: "blue" },
    { value: "confirmed", label: "تم التأكيد", color: "green" },
    { value: "preparing", label: "قيد التجهيز", color: "yellow" },
    { value: "shipped", label: "تم الشحن", color: "purple" },
    { value: "delivered", label: "تم التسليم", color: "green" },
    { value: "cancelled", label: "ملغي", color: "red" },
  ];

  const colorMap = {
    gray: "bg-gray-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };

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
      setFilteredOrders([]);
    } else {
      setOrders(data || []);
      setFilteredOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          order.order_number?.toString().includes(searchTerm) ||
          order.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer_phone?.includes(searchTerm) ||
          order.customer_city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  // Sorting functionality
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredOrders(sortedOrders);
    setSortConfig({ key, direction });
  };

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
      prev.length === filteredOrders.length
        ? []
        : filteredOrders.map((order) => order.id)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 text-right">
        <h1 className="font-[tajawal] text-2xl md:text-3xl font-bold text-gray-800">
          إدارة الطلبات
        </h1>
        <p className="font-[tajawal] text-gray-600 mt-2">
          قم بإدارة وتتبع حالة طلبات العملاء
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.slice(1).map((status, idx, arr) => {
          const total = arr.length;
          const cols = 4; // md:grid-cols-4
          const lastRowCount = total % cols === 0 ? cols : total % cols;
          const firstIndexOfLastRow = total - lastRowCount;

          let extraClasses = "";

          if (idx >= firstIndexOfLastRow) {
            // item is in the last row
            if (lastRowCount === 3) {
              extraClasses =
                idx === firstIndexOfLastRow ? "md:col-start-2" : "";
            }
            if (lastRowCount === 2) {
              extraClasses =
                idx === firstIndexOfLastRow
                  ? "md:col-start-3"
                  : "md:col-start-4";
            }
            if (lastRowCount === 1) {
              extraClasses = "md:col-start-4";
            }
          }

          return (
            <div
              key={status.value}
              className={`bg-white rounded-lg p-4 text-center shadow-sm ${extraClasses}`}
            >
              <div
                className={`w-3 h-3 ${
                  colorMap[status.color]
                } rounded-full mx-auto mb-2`}
              />
              <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                {orders.filter((o) => o.status === status.value).length}
              </p>
              <p className="font-[tajawal] text-sm text-gray-600">
                {status.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search Box */}
          <div className="w-full lg:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم العميل، أو المدينة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
              />
              <FeatherIcon
                name="search"
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex items-center justify-center"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-2/3 justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-3">
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
              <label className="font-[tajawal] text-sm font-medium text-gray-700">
                :التصفية حسب
              </label>
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
                  <option value="">...تغيير الحالة</option>
                  {statusOptions.slice(1).map((status) => (
                    <option key={status.value} value={status.value}>
                      تغيير إلى {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="font-[tajawal] text-red-500 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-300"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
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
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm cursor-pointer"
                  onClick={() => handleSort("order_number")}
                >
                  <div className="flex items-center justify-end gap-1">
                    رقم الطلب
                    <FeatherIcon
                      name={
                        sortConfig.key === "order_number"
                          ? sortConfig.direction === "ascending"
                            ? "chevron-up"
                            : "chevron-down"
                          : "chevrons-up"
                      }
                      size={14}
                      className="flex items-center justify-center"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm cursor-pointer"
                  onClick={() => handleSort("customer_name")}
                >
                  <div className="flex items-center justify-end gap-1">
                    العميل
                    <FeatherIcon
                      name={
                        sortConfig.key === "customer_name"
                          ? sortConfig.direction === "ascending"
                            ? "chevron-up"
                            : "chevron-down"
                          : "chevrons-up"
                      }
                      size={14}
                      className="flex items-center justify-center"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                  المنتجات
                </th>
                <th
                  className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm cursor-pointer"
                  onClick={() => handleSort("total_amount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    المبلغ
                    <FeatherIcon
                      name={
                        sortConfig.key === "total_amount"
                          ? sortConfig.direction === "ascending"
                            ? "chevron-up"
                            : "chevron-down"
                          : "chevrons-up"
                      }
                      size={14}
                      className="flex items-center justify-center"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                  الحالة
                </th>
                <th
                  className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center justify-end gap-1">
                    التاريخ
                    <FeatherIcon
                      name={
                        sortConfig.key === "created_at"
                          ? sortConfig.direction === "ascending"
                            ? "chevron-up"
                            : "chevron-down"
                          : "chevrons-up"
                      }
                      size={14}
                      className="flex items-center justify-center"
                    />
                  </div>
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
              className="text-gray-300 mx-auto mb-4 flex items-center justify-center"
            />
            <p className="font-[tajawal] text-gray-600">
              لا توجد طلبات{" "}
              {filterStatus !== "all"
                ? `بحالة ${getStatusLabel(filterStatus)}`
                : "حاليا"}
              {searchTerm && ` تطابق بحثك: "${searchTerm}"`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-[tajawal] text-sm"
              >
                مسح البحث
              </button>
            )}
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
    </div>
  );
}

export default OrdersDashboard;
