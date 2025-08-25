"use client";
import React, { useState, useEffect, useRef } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "../app/lib/supabaseClient";

const arabicToSlug = (text) => {
  if (!text) return "";

  const arabicMap = {
    ء: "a",
    أ: "a",
    آ: "a",
    إ: "i",
    ئ: "e",
    ا: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "th",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ى: "a",
    ي: "y",
    ة: "h",
    " ": "-",
    _: "-",
    ".": "",
    "،": "",
    "؛": "",
    ":": "",
    "!": "",
    "؟": "",
    "(": "",
    ")": "",
    "[": "",
    "]": "",
    "{": "",
    "}": "",
    "/": "",
    "\\": "",
    "'": "",
    '"': "",
    "`": "",
    "~": "",
    "@": "",
    "#": "",
    $: "",
    "%": "",
    "^": "",
    "&": "",
    "*": "",
    "+": "",
    "=": "",
    "|": "",
    "<": "",
    ">": "",
    "؛": "",
    "،": "",
    "؟": "",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return text
    .split("")
    .map((char) => arabicMap[char] || char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/\-{2,}/g, "-")
    .replace(/^\-+/, "")
    .replace(/\-+$/, "");
};

function ProductDialog({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    slug: "",
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
        slug: product.slug || "",
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
        slug: "",
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Generate slug when title changes for new products
  useEffect(() => {
    if (formData.title && !product) {
      const generatedSlug = arabicToSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, product]);

  // Upload image to Supabase Storage
  const uploadImage = async (file, isThumbnail = false) => {
    try {
      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      if (isThumbnail) {
        handleInputChange("thumbnail_url", publicUrl);
      } else {
        // Add to gallery
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, publicUrl],
        }));
      }

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors({ submit: `فشل في رفع الصورة: ${error.message}` });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle thumbnail image upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setErrors({ submit: "الملف يجب أن يكون صورة" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrors({ submit: "حجم الصورة يجب أن يكون أقل من 5MB" });
      return;
    }

    await uploadImage(file, true);
  };

  // Handle gallery images upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setErrors({ submit: "جميع الملفات يجب أن تكون صور" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ submit: "حجم كل صورة يجب أن يكون أقل من 5MB" });
        return;
      }
    }

    // Upload each file
    for (const file of files) {
      await uploadImage(file, false);
    }
  };

  // Remove image from gallery
  const removeGalleryImage = async (index, imageUrl) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
      }

      // Remove from local state
      setFormData((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  // Remove thumbnail image
  const removeThumbnail = async () => {
    if (!formData.thumbnail_url) return;

    try {
      // Extract file path from URL
      const urlParts = formData.thumbnail_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting thumbnail:", error);
      }

      // Remove from local state
      handleInputChange("thumbnail_url", "");
    } catch (error) {
      console.error("Error removing thumbnail:", error);
    }
  };

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

    if (!formData.slug.trim()) {
      newErrors.slug = "الرابط SEO مطلوب";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "الرابط يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطات فقط";
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
        slug: formData.slug.trim(),
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
      if (error.code === "23505") {
        setErrors({
          submit: "هذا الرابط (slug) مستخدم بالفعل، يرجى اختيار رابط آخر",
        });
      } else {
        setErrors({ submit: error.message });
      }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute left-0 right-0 top-0 bg-black opacity-30 w-dvw h-dvh"></div>

      <div className="fixed bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Thumbnail Image Upload */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              صورة المصغرة *
            </label>
            <div className="space-y-3">
              {formData.thumbnail_url ? (
                <div className="relative">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <FeatherIcon name="trash-2" size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FeatherIcon
                    name="upload"
                    size={32}
                    className="text-gray-400 mx-auto mb-2"
                  />
                  <p className="font-[tajawal] text-gray-500 text-sm">
                    انقر لرفع صورة المصغرة
                  </p>
                  <p className="font-[tajawal] text-gray-400 text-xs">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Gallery Images Upload */}
          <div>
            <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
              معرض الصور
            </label>
            <div className="space-y-3">
              {/* Gallery images grid */}
              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.gallery.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index, url)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <FeatherIcon name="x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                onClick={() => galleryInputRef.current?.click()}
              >
                <FeatherIcon
                  name="image"
                  size={24}
                  className="text-gray-400 mx-auto mb-2"
                />
                <p className="font-[tajawal] text-gray-500 text-sm">
                  انقر لرفع صور للمعرض (يمكنك رفع عدة صور مرة واحدة)
                </p>
                <p className="font-[tajawal] text-gray-400 text-xs">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
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
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    formData.in_stock ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) =>
                      handleInputChange("in_stock", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      formData.in_stock ? "translate-x-6" : "translate-x-0"
                    }`}
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
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    formData.is_hot ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_hot}
                    onChange={(e) =>
                      handleInputChange("is_hot", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      formData.is_hot ? "translate-x-6" : "translate-x-0"
                    }`}
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
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    formData.is_new ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      handleInputChange("is_new", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      formData.is_new ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Uploading Indicator */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-[tajawal] text-blue-700 text-sm">
                  جاري رفع الصور...
                </span>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

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
              disabled={loading || uploading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-[tajawal] font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-start justify-center gap-2"
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
