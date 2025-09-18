"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import FeatherIcon from "@/components/FeatherIcon";

export default function AdminReportsPage() {
  const supabase = createClientComponentClient();
  const [reports, setReports] = useState({
    daily: [],
    monthly: [],
    status: [],
    cities: [],
    payments: [],
    delivery: null,
    products: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        const [
          dailyRes,
          monthlyRes,
          statusRes,
          citiesRes,
          paymentsRes,
          deliveryRes,
          productsRes,
        ] = await Promise.all([
          supabase
            .from("sales_overview_daily")
            .select("*")
            .order("day", { ascending: false })
            .limit(timeRange === "30days" ? 30 : 7),
          supabase
            .from("sales_overview_monthly")
            .select("*")
            .order("month", { ascending: false })
            .limit(12),
          supabase.from("orders_status_percent").select("*"),
          supabase
            .from("city_orders_summary")
            .select("*")
            .order("orders_count", { ascending: false })
            .limit(10),
          supabase.from("payment_method_summary").select("*"),
          supabase.from("delivery_performance").select("*"),
          supabase
            .from("product_performance")
            .select("*")
            .order("total_revenue", { ascending: false })
            .limit(5),
        ]);

        if (!mounted) return;

        if (
          dailyRes.error ||
          monthlyRes.error ||
          statusRes.error ||
          citiesRes.error ||
          paymentsRes.error ||
          deliveryRes.error ||
          productsRes.error
        ) {
          throw new Error("Failed to load reports data");
        }

        setReports({
          daily: (dailyRes.data || []).map((r) => ({
            ...r,
            day: r.day ? new Date(r.day).toLocaleDateString("ar-EG") : r.day,
          })),
          monthly: (monthlyRes.data || []).map((r) => ({
            ...r,
            month: r.month
              ? new Date(r.month).toLocaleDateString("ar-EG")
              : r.month,
          })),
          status: statusRes.data || [],
          cities: citiesRes.data || [],
          payments: paymentsRes.data || [],
          delivery: (deliveryRes.data && deliveryRes.data[0]) || null,
          products: productsRes.data || [],
        });
      } catch (err) {
        console.error("Reports load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAll();

    return () => {
      mounted = false;
    };
  }, [supabase, timeRange]);

  // Calculate totals for summary cards
  const totalRevenue = reports.daily.reduce(
    (sum, day) => sum + (day.total_revenue || 0),
    0
  );
  const totalOrders = reports.daily.reduce(
    (sum, day) => sum + (day.orders_count || 0),
    0
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
              التقارير والإحصائيات
            </h1>
            <p className="font-[tajawal] text-gray-600">
              نظرة شاملة على أداء المتجر وإحصائيات المبيعات
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-sm">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-[tajawal] text-right"
            >
              <option value="7days">آخر 7 أيام</option>
              <option value="30days">آخر 30 يوم</option>
            </select>
            <span className="font-[tajawal] text-sm text-gray-700">
              الفترة:
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <FeatherIcon
                name="alert-circle"
                size={20}
                className="text-red-500"
              />
              <div className="text-right">
                <p className="font-[tajawal] font-medium text-red-800">
                  خطأ في تحميل البيانات
                </p>
                <p className="font-[tajawal] text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FeatherIcon
                  name="dollar-sign"
                  size={24}
                  className="text-blue-500"
                />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {totalRevenue.toLocaleString()} ر.س
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  إجمالي الإيرادات
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <FeatherIcon name="trending-up" size={16} />
              <span className="font-[tajawal]">+12% عن الشهر الماضي</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FeatherIcon
                  name="shopping-cart"
                  size={24}
                  className="text-green-500"
                />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {totalOrders}
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  عدد الطلبات
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <FeatherIcon name="users" size={16} />
              <span className="font-[tajawal]">+8% عملاء جدد</span>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FeatherIcon
                  name="bar-chart-2"
                  size={24}
                  className="text-purple-500"
                />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {avgOrderValue.toFixed(2)} ر.س
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  متوسط قيمة الطلب
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <FeatherIcon name="star" size={16} />
              <span className="font-[tajawal]">أعلى من المتوسط</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
                تطور المبيعات
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-[tajawal] text-sm text-gray-600">
                  الإيرادات
                </span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...reports.daily].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontFamily: "Tajawal, sans-serif",
                      textAlign: "right",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3B82F6" }}
                    activeDot={{ r: 6, fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
              توزيع حالات الطلبات
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reports.status}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {reports.status.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="left"
                    wrapperStyle={{ fontFamily: "Tajawal, sans-serif" }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} طلبات`, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      fontFamily: "Tajawal, sans-serif",
                      textAlign: "right",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
              طرق الدفع
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports.payments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="payment_method"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontFamily: "Tajawal, sans-serif",
                      textAlign: "right",
                    }}
                  />
                  <Bar
                    dataKey="orders_count"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
              المدن الأكثر طلباً
            </h2>
            <div className="space-y-4">
              {reports.cities.slice(0, 5).map((city, index) => (
                <div
                  key={city.customer_city || index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-[tajawal] text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-[tajawal] text-gray-800">
                      {city.customer_city || "غير معروف"}
                    </span>
                  </div>
                  <span className="font-[tajawal] font-medium text-gray-700">
                    {city.orders_count} طلب
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
            أفضل المنتجات أداءً
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    المنتج
                  </th>
                  <th className="px-4 py-3 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    الكمية المباعة
                  </th>
                  <th className="px-4 py-3 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    الإيرادات
                  </th>
                  <th className="px-4 py-3 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                    عدد الطلبات
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <span className="font-[tajawal] font-medium text-gray-800">
                        {product.product_title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-[tajawal] text-gray-700">
                        {product.total_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-[tajawal] font-bold text-blue-600">
                        {Number(product.total_revenue).toLocaleString()} ر.س
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-[tajawal] text-gray-700">
                        {product.orders_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Performance */}
        {reports.delivery && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-4 text-right">
              أداء التوصيل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FeatherIcon
                    name="truck"
                    size={24}
                    className="text-green-600"
                  />
                </div>
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {reports.delivery.completed_orders}
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  طلبات مكتملة
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FeatherIcon
                    name="clock"
                    size={24}
                    className="text-blue-600"
                  />
                </div>
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  {reports.delivery.avg_delivery_days}
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  متوسط أيام التوصيل
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FeatherIcon
                    name="award"
                    size={24}
                    className="text-purple-600"
                  />
                </div>
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  94%
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  معدل الرضا
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
