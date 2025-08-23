"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "../../../../lib/supabaseClient";
import ProductDialog from "@/components/ProductDialog"; // We'll create this next

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (id, name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetch products error", error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("fetch categories error", error);
      setCategories([]);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const toggleProductSelection = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((prodId) => prodId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts((prev) =>
      prev.length === products.length ? [] : products.map((prod) => prod.id)
    );
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("حدث خطأ أثناء حذف المنتج");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categories?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="w-full p-6">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 mb-6 text-right">
        <div>
          <h2 className="font-[tajawal] text-2xl font-bold text-gray-800 mb-2">
            إدارة المنتجات
          </h2>
          <p className="font-[tajawal] text-gray-600 text-sm">
            إدارة وعرض جميع منتجات المتجر
          </p>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="...ابحث عن منتج"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-sm"
            />
            <FeatherIcon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 pb-6 text-gray-400"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-[tajawal] font-medium text-sm transition-colors duration-300 flex items-start gap-2"
          >
            <FeatherIcon name="plus" size={16} />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-right">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-right font-[tajawal] font-medium text-gray-700 text-sm">
                المنتج
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                السعر
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                التصنيف
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                الحالة
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                المميزات
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                تاريخ الإضافة
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                الإجراءات
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>

                {/* Product Info */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {product.thumbnail_url && (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 text-right">
                      <h4 className="font-[tajawal] font-medium text-gray-800 text-sm">
                        {product.title}
                      </h4>
                      <p className="font-[tajawal] text-gray-600 text-xs line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] font-bold text-blue-600 text-sm">
                    {product.price ? `${product.price} ر.س` : "—"}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] text-gray-600 text-sm">
                    {product.categories?.name || "بدون تصنيف"}
                  </span>
                </td>

                {/* Stock Status */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[tajawal] font-medium ${
                      product.in_stock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.in_stock ? "متوفر" : "نفذ"}
                  </span>
                </td>

                {/* Features */}
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    {product.is_new && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-[tajawal]">
                        جديد
                      </span>
                    )}
                    {product.is_hot && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-[tajawal]">
                        مميز
                      </span>
                    )}
                  </div>
                </td>

                {/* Created At */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] text-gray-600 text-sm">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString("ar-EG")
                      : "—"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <FeatherIcon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <FeatherIcon name="trash-2" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="font-[tajawal] text-sm text-gray-600">
          عرض {filteredProducts.length} من {products.length} منتج
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

      {/* Product Dialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={fetchProducts}
      />
    </div>
  );
}

export default ProductsTable;
