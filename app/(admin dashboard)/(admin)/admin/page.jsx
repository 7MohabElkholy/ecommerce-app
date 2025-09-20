"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FeatherIcon from "@/components/FeatherIcon";

function HeroForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    button_text: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("hero")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setForm(data);
    };
    fetchHero();
  }, [supabase]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("website-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("website-images").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(`فشل في رفع الصورة: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setMessage("الملف يجب أن يكون صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    await uploadImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // First check if a record exists
      const { data: existingData } = await supabase
        .from("hero")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      let error;

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("hero")
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase.from("hero").insert([
          {
            ...form,
            updated_at: new Date().toISOString(),
          },
        ]);

        error = insertError;
      }

      if (error) throw error;

      setMessage("تم تحديث قسم البطل بنجاح!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FeatherIcon name="image" size={20} className="text-blue-500" />
        </div>
        <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
          قسم البطل الرئيسي
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            العنوان الرئيسي
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="أدخل العنوان الرئيسي"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            الوصف
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="أدخل وصف القسم"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            نص الزر
          </label>
          <input
            name="button_text"
            value={form.button_text}
            onChange={handleChange}
            placeholder="نص زر الدعوة للإجراء"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            صورة البطل
          </label>

          {/* Image preview */}
          {form.image_url && (
            <div className="mb-3">
              <img
                src={form.image_url}
                alt="Hero preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* File upload */}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="hero-image-upload"
            />
            <label
              htmlFor="hero-image-upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
            >
              <FeatherIcon
                name="upload"
                size={24}
                className="text-gray-400 mx-auto mb-2"
              />
              <p className="font-[tajawal] text-gray-600 text-sm">
                {uploading ? "جاري رفع الصورة..." : "انقر لرفع صورة البطل"}
              </p>
              <p className="font-[tajawal] text-gray-400 text-xs">
                PNG, JPG, GIF up to 5MB
              </p>
            </label>

            {/* Or URL input as fallback */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="أو أدخل رابط الصورة مباشرة"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
                />
              </div>
              <span className="font-[tajawal] text-gray-500 text-sm">أو</span>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-[tajawal] text-right ${
              message.includes("خطأ") || message.includes("فشل")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <FeatherIcon name="save" size={16} />
              حفظ التغييرات
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function BannerForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    button_text: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("banner")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setForm(data);
    };
    fetchBanner();
  }, [supabase]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `banner/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("website-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("website-images").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(`فشل في رفع الصورة: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setMessage("الملف يجب أن يكون صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    await uploadImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // First check if a record exists
      const { data: existingData } = await supabase
        .from("banner")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      let error;

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("banner")
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase.from("banner").insert([
          {
            ...form,
            updated_at: new Date().toISOString(),
          },
        ]);

        error = insertError;
      }

      if (error) throw error;

      setMessage("تم تحديث البانر بنجاح!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <FeatherIcon name="layers" size={20} className="text-green-500" />
        </div>
        <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
          قسم البانر
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            عنوان البانر
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="أدخل عنوان البانر"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            وصف البانر
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="أدخل وصف البانر"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            نص زر البانر
          </label>
          <input
            name="button_text"
            value={form.button_text}
            onChange={handleChange}
            placeholder="نص زر البانر"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
          />
        </div>

        <div>
          <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right mb-2">
            صورة البانر
          </label>

          {/* Image preview */}
          {form.image_url && (
            <div className="mb-3">
              <img
                src={form.image_url}
                alt="Banner preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* File upload */}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="banner-image-upload"
            />
            <label
              htmlFor="banner-image-upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors duration-200"
            >
              <FeatherIcon
                name="upload"
                size={24}
                className="text-gray-400 mx-auto mb-2"
              />
              <p className="font-[tajawal] text-gray-600 text-sm">
                {uploading ? "جاري رفع الصورة..." : "انقر لرفع صورة البانر"}
              </p>
              <p className="font-[tajawal] text-gray-400 text-xs">
                PNG, JPG, GIF up to 5MB
              </p>
            </label>

            {/* Or URL input as fallback */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="أو أدخل رابط الصورة مباشرة"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right transition-colors duration-200"
                />
              </div>
              <span className="font-[tajawal] text-gray-500 text-sm">أو</span>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-[tajawal] text-right ${
              message.includes("خطأ") || message.includes("فشل")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <FeatherIcon name="save" size={16} />
              حفظ البانر
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row-reverse justify-between items-start lg:items-center gap-6 mb-8">
          <div className="text-right">
            <h1 className="font-[tajawal] text-3xl font-bold text-gray-800 mb-2">
              لوحة تحكم المحتوى
            </h1>
            <p className="font-[tajawal] text-gray-600">
              إدارة المحتوى الرئيسي للمتجر والعروض الترويجية
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FeatherIcon name="info" size={20} className="text-blue-500" />
              <span className="font-[tajawal] text-sm text-blue-700">
                التغييرات التي تجريها تظهر مباشرة في المتجر
              </span>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeroForm />
          <BannerForm />
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FeatherIcon name="eye" size={20} className="text-blue-500" />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  12.5K
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  مشاهدة الصفحة
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FeatherIcon
                  name="mouse-pointer"
                  size={20}
                  className="text-green-500"
                />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  8.2%
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  معدل التحويل
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FeatherIcon
                  name="trending-up"
                  size={20}
                  className="text-purple-500"
                />
              </div>
              <div className="text-right">
                <p className="font-[tajawal] text-2xl font-bold text-gray-800">
                  +24%
                </p>
                <p className="font-[tajawal] text-sm text-gray-600">
                  نمو المبيعات
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <FeatherIcon
              name="help-circle"
              size={20}
              className="text-yellow-600 mt-0.5"
            />
            <div className="text-right">
              <h3 className="font-[tajawal] font-medium text-yellow-800 mb-2">
                نصائح للمحتوى
              </h3>
              <ul className="font-[tajawal] text-yellow-700 text-sm space-y-1">
                <li>• استخدم صور عالية الجودة بدقة 1920x1080px</li>
                <li>• اجعل العناوين واضحة وجذابة</li>
                <li>
                  • استخدم نصوص أزرار واضحة مثل "تسوق الآن" أو "اكتشف العروض"
                </li>
                <li>• تأكد من أن الروابط تعمل بشكل صحيح</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
