"use client";
import React, { useState, useEffect, useMemo } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "@/app/lib/supabaseClient";

export default function OrdersDashboard() {
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
  const [statusCounts, setStatusCounts] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingOrder, setEditingOrder] = useState(null);
  const [whatsappQueue, setWhatsappQueue] = useState([]);
  const [showQueue, setShowQueue] = useState(false);

  const statusOptions = [
    {
      value: "all",
      label: "جميع الطلبات",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },
    {
      value: "new",
      label: "جديد",
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      value: "confirmed",
      label: "تم التأكيد",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      value: "preparing",
      label: "قيد التجهيز",
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    {
      value: "shipped",
      label: "تم الشحن",
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      value: "delivered",
      label: "تم التسليم",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      value: "cancelled",
      label: "ملغي",
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
  ];

  const fetchStatusCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("orders_status_counts")
        .select("*");
      if (error) throw error;

      const counts = (data || []).reduce((acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {});
      setStatusCounts(counts);
    } catch (err) {
      console.error("fetchStatusCounts error:", err);
      setStatusCounts({});
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") query = query.eq("status", filterStatus);

      const { data, error } = await query;
      if (error) throw error;

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, [filterStatus]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          (order.order_number?.toString() || "").includes(searchTerm) ||
          (order.customer_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.customer_phone || "").includes(searchTerm) ||
          (order.customer_city || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders((prev) =>
      prev.filter((id) => orders.some((o) => o.id === id))
    );
  }, [filteredOrders, orders]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sorted = [...filteredOrders].sort((a, b) => {
      const av = a?.[key] ?? "";
      const bv = b?.[key] ?? "";

      if (av < bv) return direction === "ascending" ? -1 : 1;
      if (av > bv) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredOrders(sorted);
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

      await fetchOrders();
      await fetchStatusCounts();
    } catch (err) {
      console.error("Error updating order status:", err);
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
      await fetchOrders();
      await fetchStatusCounts();
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
    const visibleIds = paginatedOrders.map((o) => o.id);
    const allVisibleSelected = visibleIds.every((id) =>
      selectedOrders.includes(id)
    );

    if (allVisibleSelected) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedOrders((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const getStatusConfig = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const goToPage = (n) => {
    const page = Math.max(1, Math.min(n, totalPages));
    setCurrentPage(page);
  };

  // WhatsApp functionality
  const addToWhatsAppQueue = (order) => {
    const statusConfig = getStatusConfig(order.status);
    const message = `مرحباً ${order.customer_name}، طلبك #${order.order_number} أصبح الآن: ${statusConfig.label}. شكراً لثقتك بنا!`;

    const newItem = {
      id: Date.now(),
      phone: order.customer_phone,
      message: message,
      sent: false,
      orderNumber: order.order_number,
      customerName: order.customer_name,
    };

    setWhatsappQueue((prev) => [...prev, newItem]);
  };

  const sendWhatsAppMessage = (item) => {
    const url = `https://wa.me/${item.phone}?text=${encodeURIComponent(
      item.message
    )}`;
    window.open(url, "_blank");

    setWhatsappQueue((prev) =>
      prev.map((queueItem) =>
        queueItem.id === item.id ? { ...queueItem, sent: true } : queueItem
      )
    );
  };

  const clearWhatsAppQueue = () => {
    setWhatsappQueue([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-6 mb-8">
          <div className="text-right">
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2">
              إدارة الطلبات
            </h1>
            <p className="font-[tajawal] text-gray-600">
              قم بإدارة وتتبع حالة طلبات العملاء
            </p>
          </div>

          {/* WhatsApp Queue Button */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-[tajawal] font-medium transition-colors duration-300"
          >
            <FeatherIcon name="message-circle" size={16} />
            طابور الواتساب ({whatsappQueue.length})
          </button>
        </div>

        {/* WhatsApp Queue Modal */}
        {showQueue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
                  طابور رسائل الواتساب
                </h2>
                <button
                  onClick={() => setShowQueue(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FeatherIcon name="x" size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {whatsappQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <FeatherIcon
                      name="message-circle"
                      size={48}
                      className="text-gray-300 mx-auto mb-4"
                    />
                    <p className="font-[tajawal] text-gray-600">
                      لا توجد رسائل في الطابور
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {whatsappQueue.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.sent
                            ? "bg-green-50 border-green-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-[tajawal] font-medium text-gray-800">
                            #{item.orderNumber} - {item.customerName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-[tajawal] ${
                              item.sent
                                ? "bg-green-200 text-green-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {item.sent ? "تم الإرسال" : "في الانتظار"}
                          </span>
                        </div>
                        <p className="font-[tajawal] text-sm text-gray-600 mb-3">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2">
                          {!item.sent && (
                            <button
                              onClick={() => sendWhatsAppMessage(item)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-[tajawal] transition-colors duration-200"
                            >
                              إرسال الآن
                            </button>
                          )}
                          <span className="font-[tajawal] text-xs text-gray-500">
                            {item.phone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <button
                  onClick={clearWhatsAppQueue}
                  className="text-red-500 hover:text-red-700 font-[tajawal] text-sm transition-colors duration-200"
                >
                  مسح الكل
                </button>
                <button
                  onClick={() => setShowQueue(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-[tajawal] font-medium transition-colors duration-200"
                >
                  تم
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statusOptions.slice(1).map((status) => {
            const count = statusCounts[status.value] || 0;
            return (
              <div
                key={status.value}
                className="bg-white rounded-2xl shadow-sm p-6 text-center"
              >
                <div
                  className={`w-4 h-4 ${status.bgColor} rounded-full mx-auto mb-3`}
                ></div>
                <p className="font-[tajawal] text-2xl font-bold text-gray-800 mb-1">
                  {count}
                </p>
                <p className={`font-[tajawal] text-sm ${status.textColor}`}>
                  {status.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-4">
            {/* Left Side - Search */}
            <div className="w-full lg:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب، اسم العميل، أو المدينة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
                />
                <FeatherIcon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Right Side - Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-2/3 justify-end">
              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <label className="font-[tajawal] text-sm font-medium text-gray-700">
                  التصفية حسب:
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
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right"
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
                    className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-[tajawal] transition-colors duration-200"
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
                        paginatedOrders.length > 0 &&
                        paginatedOrders.every((o) =>
                          selectedOrders.includes(o.id)
                        )
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  {[
                    { key: "order_number", label: "رقم الطلب" },
                    { key: "customer_name", label: "العميل" },
                    { key: "items", label: "المنتجات" },
                    { key: "total_amount", label: "المبلغ" },
                    { key: "status", label: "الحالة" },
                    { key: "created_at", label: "التاريخ" },
                    { key: "actions", label: "الإجراءات" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-right font-[tajawal] font-medium text-gray-700 text-sm cursor-pointer"
                      onClick={() =>
                        column.key !== "items" &&
                        column.key !== "actions" &&
                        column.key !== "status" &&
                        handleSort(column.key)
                      }
                    >
                      <div className="flex items-center justify-end gap-2">
                        {column.label}
                        {column.key !== "items" &&
                          column.key !== "actions" &&
                          column.key !== "status" && (
                            <FeatherIcon
                              name={
                                sortConfig.key === column.key
                                  ? sortConfig.direction === "ascending"
                                    ? "chevron-up"
                                    : "chevron-down"
                                  : "chevrons-up"
                              }
                              size={14}
                              className="text-gray-400"
                            />
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-[tajawal] font-medium text-blue-600 text-sm">
                          #{order.order_number}
                        </span>
                      </td>

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

                      <td className="px-6 py-4">
                        <span className="font-[tajawal] font-bold text-gray-800">
                          {order.total_amount?.toLocaleString()} ر.س
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-[tajawal] font-medium border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          {statusOptions.slice(1).map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-[tajawal] text-gray-600 text-sm">
                          {new Date(order.created_at).toLocaleDateString(
                            "ar-EG"
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="عرض التفاصيل"
                          >
                            <FeatherIcon name="eye" size={16} />
                          </button>
                          <button
                            onClick={() => addToWhatsAppQueue(order)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="إرسال عبر واتساب"
                          >
                            <FeatherIcon name="message-circle" size={16} />
                          </button>
                          <button
                            onClick={() =>
                              window.open(`tel:${order.customer_phone}`)
                            }
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="الاتصال"
                          >
                            <FeatherIcon name="phone" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <p className="font-[tajawal] text-gray-600 mb-4">
                لا توجد طلبات{" "}
                {filterStatus !== "all"
                  ? `بحالة ${getStatusConfig(filterStatus).label}`
                  : "حاليا"}
                {searchTerm && ` تطابق بحثك: \"${searchTerm}\"`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-[tajawal] text-sm transition-colors duration-200"
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
                عرض {paginatedOrders.length} من {filteredOrders.length} طلب
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  السابق
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        pageNum === currentPage
                          ? "bg-blue-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">...</span>
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  التالي
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} لكل صفحة
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="font-[tajawal] font-semibold text-gray-800">
                      معلومات العميل
                    </h3>
                    <p>
                      <strong>الاسم:</strong> {editingOrder.customer_name}
                    </p>
                    <p>
                      <strong>الهاتف:</strong> {editingOrder.customer_phone}
                    </p>
                    <p>
                      <strong>البريد:</strong> {editingOrder.customer_email}
                    </p>
                    <p>
                      <strong>المدينة:</strong> {editingOrder.customer_city}
                    </p>
                    <p>
                      <strong>العنوان:</strong> {editingOrder.customer_address}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-[tajawal] font-semibold text-gray-800">
                      معلومات الطلب
                    </h3>
                    <p>
                      <strong>الحالة:</strong>{" "}
                      <span
                        className={
                          getStatusConfig(editingOrder.status).textColor
                        }
                      >
                        {getStatusConfig(editingOrder.status).label}
                      </span>
                    </p>
                    <p>
                      <strong>طريقة الدفع:</strong>{" "}
                      {editingOrder.payment_method === "cod"
                        ? "الدفع عند الاستلام"
                        : editingOrder.payment_method}
                    </p>
                    <p>
                      <strong>المجموع:</strong>{" "}
                      {editingOrder.total_amount?.toLocaleString()} ر.س
                    </p>
                    <p>
                      <strong>تاريخ الطلب:</strong>{" "}
                      {new Date(editingOrder.created_at).toLocaleDateString(
                        "ar-EG"
                      )}
                    </p>
                    {editingOrder.completed_at && (
                      <p>
                        <strong>تاريخ التسليم:</strong>{" "}
                        {new Date(editingOrder.completed_at).toLocaleDateString(
                          "ar-EG"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-[tajawal] font-semibold text-gray-800 mb-4">
                    المنتجات
                  </h3>
                  <div className="space-y-3">
                    {editingOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.thumbnail_url && (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="text-right">
                            <p className="font-[tajawal] font-medium">
                              {item.title}
                            </p>
                            <p className="font-[tajawal] text-sm text-gray-600">
                              الكمية: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-[tajawal] font-bold">
                          {item.price?.toLocaleString()} ر.س
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {editingOrder.customer_notes && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="font-[tajawal] font-semibold text-gray-800 mb-2">
                      ملاحظات العميل
                    </h3>
                    <p className="font-[tajawal] text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {editingOrder.customer_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
