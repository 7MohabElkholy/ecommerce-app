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

  const handleLogin = async (e) => {
    e.preventDefault();

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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-gray-800 placeholder-gray-400 transition-colors duration-300"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-gray-800 placeholder-gray-400 transition-colors duration-300"
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
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-[tajawal] font-medium hover:bg-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
