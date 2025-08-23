"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "../app/lib/supabaseClient";

function ProductDialog({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    thumbnail_url: "",
    gallery: [],
    in_stock: true,
    is_hot: false,
    is_new: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        category_id: product.category_id || "",
        thumbnail_url: product.thumbnail_url || "",
        gallery: product.gallery || [],
        in_stock: product.in_stock ?? true,
        is_hot: product.is_hot || false,
        is_new: product.is_new || false,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        category_id: "",
        thumbnail_url: "",
        gallery: [],
        in_stock: true,
        is_hot: false,
        is_new: false,
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "اسم المنتج مطلوب";
    }

    if (!formData.description.trim()) {
      newErrors.description = "وصف المنتج مطلوب";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "السعر يجب أن يكون أكبر من الصفر";
    }

    if (!formData.category_id) {
      newErrors.category_id = "التصنيف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        gallery: formData.gallery.filter((url) => url.trim()),
        in_stock: formData.in_stock,
        is_hot: formData.is_hot,
        is_new: formData.is_new,
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ""],
    }));
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const updateGalleryImage = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((url, i) => (i === index ? value : url)),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
            {product ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FeatherIcon name="x" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              اسم المنتج *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                errors.title ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="أدخل اسم المنتج"
            />
            {errors.title && (
              <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              وصف المنتج *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="أدخل وصف المنتج"
            />
            {errors.description && (
              <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                {errors.description}
              </p>
            )}
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Field */}
            <div>
              <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                السعر (ر.س) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                  errors.price ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                  {errors.price}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
                التصنيف *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  handleInputChange("category_id", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                  errors.category_id ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                  {errors.category_id}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              صورة المصغرة (URL)
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) =>
                handleInputChange("thumbnail_url", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              معرض الصور
            </label>
            <div className="space-y-2">
              {formData.gallery.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateGalleryImage(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <FeatherIcon name="trash-2" size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGalleryImage}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-[tajawal] text-sm mt-2"
              >
                <FeatherIcon name="plus" size={16} />
                إضافة صورة أخرى
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Stock Toggle */}
            <div>
              <label className="flex items-center gap-3 justify-end cursor-pointer">
                <span className="font-[tajawal] text-gray-700 text-sm">
                  {formData.in_stock ? "متوفر" : "نفذ"}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) =>
                      handleInputChange("in_stock", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.in_stock ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 transform transition-transform duration-200 ${
                      formData.in_stock
                        ? "translate-x-6 right-0.5"
                        : "translate-x-0 right-0.5"
                    } w-5 h-5 bg-white rounded-full`}
                  />
                </div>
              </label>
            </div>

            {/* Hot Toggle */}
            <div>
              <label className="flex items-center gap-3 justify-end cursor-pointer">
                <span className="font-[tajawal] text-gray-700 text-sm">
                  {formData.is_hot ? "مميز" : "عادي"}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_hot}
                    onChange={(e) =>
                      handleInputChange("is_hot", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.is_hot ? "bg-red-500" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 transform transition-transform duration-200 ${
                      formData.is_hot
                        ? "translate-x-6 right-0.5"
                        : "translate-x-0 right-0.5"
                    } w-5 h-5 bg-white rounded-full`}
                  />
                </div>
              </label>
            </div>

            {/* New Toggle */}
            <div>
              <label className="flex items-center gap-3 justify-end cursor-pointer">
                <span className="font-[tajawal] text-gray-700 text-sm">
                  {formData.is_new ? "جديد" : "قديم"}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      handleInputChange("is_new", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.is_new ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 transform transition-transform duration-200 ${
                      formData.is_new
                        ? "translate-x-6 right-0.5"
                        : "translate-x-0 right-0.5"
                    } w-5 h-5 bg-white rounded-full`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-[tajawal] text-red-700 text-sm text-right">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-[tajawal] font-medium hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-[tajawal] font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {product ? "جاري التحديث..." : "جاري الإضافة..."}
                </>
              ) : (
                <>
                  <FeatherIcon name={product ? "edit" : "plus"} size={16} />
                  {product ? "تحديث" : "إضافة"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductDialog;
