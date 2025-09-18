"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { useRouter } from "next/navigation";

/**
 * The shopping cart page.
 *
 * This component displays the items in the user's shopping cart, allowing them
 * to update quantities, remove items, and proceed to checkout.
 *
 * @returns {React.ReactElement} The cart page component.
 */
function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(cartData);
    setLoading(false);
  }, []);

  /**
   * Updates the quantity of an item in the cart.
   *
   * @param {number} id - The ID of the item to update.
   * @param {number} newQuantity - The new quantity for the item.
   */
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const cartItemMaxQuantity =
      cart.find((item) => item.id === id)?.maxQuantity || 2;

    if (newQuantity > cartItemMaxQuantity) {
      alert("الكمية المطلوبة غير متوفرة في المخزون");
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  /**
   * Removes an item from the cart.
   *
   * @param {number} id - The ID of the item to remove.
   */
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  /**
   * Clears all items from the cart.
   */
  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", "[]");
  };

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
    const shipping = subtotal > 0 ? 15 : 0; // Free shipping over certain amount?
    return subtotal + shipping;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-right flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2">
              سلة التسوق
            </h1>
            <p className="font-[tajawal] text-gray-600">
              راجع مشترياتك وأكمل عملية الشراء
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-[tajawal] text-sm transition-colors duration-200"
            >
              <FeatherIcon
                name="trash-2"
                size={16}
                className="flex items-center justify-center"
              />
              إفراغ السلة
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <FeatherIcon
              name="shopping-cart"
              size={64}
              className="text-gray-300 mx-auto mb-4 flex items-center justify-center"
            />
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-3">
              سلة التسوق فارغة
            </h2>
            <p className="font-[tajawal] text-gray-600 mb-6">
              لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-[tajawal] font-medium transition-colors duration-300 inline-flex items-center gap-2"
            >
              <FeatherIcon
                name="arrow-left"
                size={16}
                className="flex items-center justify-center"
              />
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.thumbnail_url || "/placeholder-image.jpg"}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-right">
                        <h3 className="font-[tajawal] font-semibold text-gray-800 text-sm mb-1">
                          اسم المنتج: {item.title}
                        </h3>
                        <p className="font-[tajawal] text-blue-600 font-bold text-sm mb-2">
                          سعر المنتج: {item.price?.toLocaleString()} ج.م
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <FeatherIcon name="minus" size={14} />
                            </button>
                            <span className="px-3 font-[tajawal] font-medium text-gray-800 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <FeatherIcon name="plus" size={14} />
                            </button>
                          </div>

                          <span className="font-[tajawal] text-sm text-gray-600">
                            الكمية
                          </span>
                        </div>
                      </div>

                      {/* Total Price & Remove */}
                      <div className="flex flex-col items-end gap-2">
                        {/* <p className="font-[tajawal] font-bold text-gray-800">
                          {(item.price * item.quantity)?.toLocaleString()} ر.س
                        </p> */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <FeatherIcon name="trash-2" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-[tajawal] text-gray-600">
                      عدد المنتجات: {cart.length}
                    </span>
                    <span className="font-[tajawal] font-bold text-gray-800">
                      المجموع: {getSubtotal()?.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
                  ملخص الطلب
                </h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="font-[tajawal] text-gray-600">
                      المجموع
                    </span>
                    <span className="font-[tajawal] text-gray-800">
                      {getSubtotal()?.toLocaleString()} ج.م
                    </span>
                  </div>

                  {/* Shipping */}
                  {/* <div className="flex justify-between items-center">
                    <span className="font-[tajawal] text-gray-600">الشحن</span>
                    <span className="font-[tajawal] text-gray-800">
                      {getSubtotal() > 0 ? "15.00 ر.س" : "مجاني"}
                    </span>
                  </div> */}

                  {/* Discount */}
                  {/* <div className="flex justify-between items-center">
                    <span className="font-[tajawal] text-gray-600">الخصم</span>
                    <span className="font-[tajawal] text-green-600">
                      0.00 ر.س
                    </span>
                  </div> */}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-[tajawal] font-bold text-gray-800">
                      الإجمالي
                    </span>
                    <span className="font-[tajawal] font-bold text-blue-600 text-lg">
                      {getTotal()?.toLocaleString()} ج.م
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
                  >
                    <FeatherIcon
                      name="dollar-sign"
                      size={18}
                      className="flex items-center justify-center"
                    />
                    اتمام الشراء
                  </button>

                  {/* Continue Shopping */}
                  <button
                    onClick={() => router.push("/products")}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-[tajawal] font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <FeatherIcon
                      name="arrow-left"
                      size={16}
                      className="flex items-center justify-center"
                    />
                    مواصلة التسوق
                  </button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-around flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <FeatherIcon
                      name="package"
                      size={16}
                      className="text-green-500 flex items-center justify-center"
                    />
                    <span className="font-[tajawal] text-xs">
                      الدفع عند الإستلام
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <FeatherIcon
                      name="send"
                      size={16}
                      className="text-green-500 flex items-center justify-center"
                    />
                    <span className="font-[tajawal] text-xs">
                      التواصل على الواتساب
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recently Viewed (Optional) */}
        {cart.length > 0 && (
          <div className="mt-12">
            <h2 className="font-[tajawal] text-xl font-bold text-gray-800 mb-6 text-right">
              قد يعجبك أيضاً
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Placeholder for recommended products */}
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <FeatherIcon
                  name="package"
                  size={32}
                  className="text-gray-300 mx-auto mb-2"
                />
                <p className="font-[tajawal] text-gray-500 text-sm">
                  منتجات مقترحة
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
