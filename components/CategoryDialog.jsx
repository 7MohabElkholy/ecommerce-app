"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "../app/lib/supabaseClient";

function CategoryDialog({ isOpen, onClose, category = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        is_active: category.is_active ?? true,
        description: category.slug || "",
      });
    } else {
      setFormData({
        name: "",
        is_active: true,
        description: "",
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم التصنيف مطلوب";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "اسم التصنيف يجب أن يكون على الأقل حرفين";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name.trim(),
            is_active: formData.is_active,
            slug: formData.description.trim() || null,
            created_at: new Date().toISOString(),
          })
          .eq("id", category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert([
          {
            name: formData.name.trim(),
            is_active: formData.is_active,
            slug: formData.description.trim() || null,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute left-0 right-0 top-0 bg-black opacity-30 w-dvw h-dvh"></div>

      <div className="fixed bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
            {category ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
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
          {/* Name Field */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              اسم التصنيف *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200 ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="أدخل اسم التصنيف"
            />
            {errors.name && (
              <p className="font-[tajawal] text-red-500 text-xs mt-1 text-right">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
              placeholder="أدخل وصف التصنيف"
            />
          </div>

          {/* Status Field */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              الحالة
            </label>
            <label className="flex items-center gap-3 justify-end cursor-pointer">
              <span className="font-[tajawal] text-gray-700">
                {formData.is_active ? "نشط" : "غير نشط"}
              </span>

              {/* Toggle switch */}
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="sr-only"
                />

                {/* Background */}
                <div
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    formData.is_active ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />

                {/* Circle */}
                <div
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    formData.is_active ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
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
          <div className="flex items-center gap-3 pt-4">
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
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-[tajawal] font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-start justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {category ? "جاري التحديث..." : "جاري الإضافة..."}
                </>
              ) : (
                <>
                  <FeatherIcon name={category ? "edit" : "plus"} size={16} />
                  {category ? "تحديث" : "إضافة"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryDialog;
