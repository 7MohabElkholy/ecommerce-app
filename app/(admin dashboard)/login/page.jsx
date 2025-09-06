"use client";
import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import FeatherIcon from "@/components/FeatherIcon";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setErrorMsg(""); // Clear previous errors

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("بيانات الدخول غير صحيحة");
        return;
      }

      if (data.user?.user_metadata?.role !== "admin") {
        setErrorMsg("هذا الحساب غير مصرح له بالدخول");
        await supabase.auth.signOut();
        return;
      }

      // Force full reload so middleware reads cookies and user is recognized
      window.location.href = "/admin";
    } catch (error) {
      setErrorMsg("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false); // Stop loading in any case
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="font-[tajawal] text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              تسجيل دخول المشرفين
            </h1>
            <p className="font-[tajawal] text-gray-600 text-sm">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  disabled={isLoading} // Disable during loading
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-gray-800 placeholder-gray-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <FeatherIcon
                  name="mail"
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-[tajawal] text-sm font-medium text-gray-700 block text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading} // Disable during loading
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-gray-800 placeholder-gray-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <FeatherIcon
                  name="lock"
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 font-[tajawal] text-sm text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading} // Disable during loading
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-[tajawal] font-medium hover:bg-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  {/* Loading spinner */}
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري التسجيل...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
