"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * The checkout page.
 *
 * This component provides a form for users to enter their shipping and payment
 * information to complete their order. It also displays a summary of the order
 * and handles order submission.
 *
 * @returns {React.ReactElement} The checkout page component.
 */
function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load cart from localStorage
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(cartData);
  }, []);

  /**
   * Calculates the subtotal of all items in the cart.
   *
   * @returns {number} The subtotal of the cart.
   */
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /**
   * Calculates the total price of the order, including shipping.
   *
   * @returns {number} The total price of the order.
   */
  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = subtotal > 0 ? 15 : 0;
    return subtotal + shipping;
  };

  /**
   * Validates the checkout form.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "الاسم الكامل مطلوب";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    }

    if (!formData.city.trim()) {
      newErrors.city = "المدينة مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles changes to the form inputs.
   *
   * @param {string} field - The name of the form field.
   * @param {string} value - The new value of the form field.
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /**
   * Generates a unique order number.
   *
   * @returns {string} A unique order number.
   */
  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;
  };

  /**
   * Handles the checkout form submission.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cart.length === 0) {
      alert("سلة التسوق فارغة");
      return;
    }

    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();
      const orderData = {
        order_number: orderNumber,
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email,
        customer_address: formData.address,
        customer_city: formData.city,
        customer_notes: formData.notes,
        payment_method: formData.paymentMethod,
        status: "new",
        total_amount: getTotal(),
        subtotal: getSubtotal(),
        shipping_fee: 15,
        items: cart,
      };

      // Insert order into Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Clear cart on success
      localStorage.setItem("cart", "[]");
      setOrderNumber(orderNumber);
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FeatherIcon
              name="check"
              color="green"
              size={32}
              className="text-green-600 flex items-center justify-center"
            />
          </div>

          <h1 className="font-[tajawal] text-2xl font-bold text-gray-800 mb-3">
            ! تم تأكيد الطلب بنجاح
          </h1>

          <p className="font-[tajawal] text-gray-600 mb-4">
            شكراً لثقتك بنا. تم استلام طلبك وسيتم التجهيز للشحن قريباً.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-[tajawal] text-sm text-gray-600 mb-1">
              رقم الطلب
            </p>
            <p className="font-[tajawal] font-bold text-blue-600 text-lg">
              {orderNumber}
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-[tajawal] text-sm text-gray-600">
              طريقة الدفع: الدفع عند الاستلام
            </p>
            <p className="font-[tajawal] text-sm text-gray-600">
              المبلغ الإجمالي: {getTotal()?.toLocaleString()} ر.س
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push("/products")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-[tajawal] font-medium transition-colors duration-200"
            >
              مواصلة التسوق
            </button>
            {/* <button
              onClick={() => router.push("/orders")}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-[tajawal] font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              تتبع الطلب
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2 text-right">
              اتمام الطلب
            </h1>
            <p className="font-[tajawal] text-gray-600">
              أكمل معلوماتك لتأكيد الطلب
            </p>
          </div>

          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-[tajawal] text-sm transition-colors duration-200"
          >
            <FeatherIcon name="arrow-left" size={16} />
            العودة إلى السلة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
                معلومات العميل
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                        errors.fullName ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="أدخل الاسم الكامل"
                    />
                    {errors.fullName && (
                      <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                      (الواتس اب) رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                        errors.phone ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="01XXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                      المدينة *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                        errors.city ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="">اختر المدينة</option>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="مكة">مكة</option>
                      <option value="المدينة">المدينة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="الخبر">الخبر</option>
                      <option value="الطائف">الطائف</option>
                      <option value="تبوك">تبوك</option>
                      <option value="أبها">أبها</option>
                      <option value="حائل">حائل</option>
                    </select>
                    {errors.city && (
                      <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                      العنوان الكامل *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                        errors.address ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="الحي، الشارع، رقم المنزل"
                    />
                    {errors.address && (
                      <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
                    placeholder="ملاحظات حول العنوان أو وقت التوصيل"
                  />
                </div>

                {/* Payment Method */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-[tajawal] text-lg font-semibold text-gray-800 mb-4 text-right">
                    طريقة الدفع
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FeatherIcon
                            name="dollar-sign"
                            size={20}
                            className="text-blue-600"
                          />
                        </div>
                        <div className="text-right">
                          <p className="font-[tajawal] font-medium text-gray-800">
                            الدفع عند الاستلام
                          </p>
                          <p className="font-[tajawal] text-sm text-gray-600">
                            الدفع نقداً عند استلام الطلب
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <FeatherIcon
                          name="check"
                          color="white"
                          size={14}
                          className="text-white flex items-center justify-center pt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري تأكيد الطلب...
                    </>
                  ) : (
                    <>
                      <FeatherIcon
                        name="check-circle"
                        size={18}
                        className="flex items-center justify-center pt-1"
                      />
                      تأكيد الطلب
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
                ملخص الطلب
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-[tajawal] text-sm text-gray-600">
                        {item.quantity} ×
                      </span>
                      <span className="font-[tajawal] text-sm text-gray-800 max-w-[120px] truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="font-[tajawal] text-sm text-gray-800">
                      {(item.price * item.quantity)?.toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-[tajawal] text-gray-600">المجموع</span>
                  <span className="font-[tajawal] text-gray-800">
                    {getSubtotal()?.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-[tajawal] text-gray-600">الشحن</span>
                  <span className="font-[tajawal] text-gray-800">
                    {getSubtotal() > 0 ? "15.00 ج.م" : "مجاني"}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-[tajawal] font-bold text-gray-800">
                      الإجمالي
                    </span>
                    <span className="font-[tajawal] font-bold text-blue-600 text-lg">
                      {getTotal()?.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <FeatherIcon
                    name="shield"
                    size={16}
                    className="text-green-500 flex items-center justify-center"
                  />
                  <span className="font-[tajawal] text-xs">
                    معلوماتك محمية وآمنة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
