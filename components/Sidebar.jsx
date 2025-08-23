"use client";
import { supabase } from "../app/lib/supabaseClient";
import React from "react";
import { usePathname } from "next/navigation";
import FeatherIcon from "@/components/FeatherIcon";

function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return;
      }
      window.location.href = "/login";
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  const menuItems = [
    {
      name: "الرئيسية",
      href: "/admin",
      icon: "home",
    },
    {
      name: "إدارة التصنيفات",
      href: "/admin/products",
      icon: "grid",
    },
    {
      name: "الطلبات",
      href: "/admin/orders",
      icon: "shopping-cart",
    },
    {
      name: "المشرفين",
      href: "/admin/admins",
      icon: "users",
    },
    {
      name: "الإحصائيات",
      href: "/admin/analytics",
      icon: "bar-chart-2",
    },
    {
      name: "الإعدادات",
      href: "/admin/settings",
      icon: "settings",
    },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 h-screen bg-white border-l border-gray-200 p-6 flex flex-col  right-0 fixed z-10">
      {/* Header */}
      <div className="mb-8 flex flex-col text-right">
        <div className="flex items-center gap-3 mb-2 justify-end">
          <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
            لوحة التحكم
          </h2>
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <FeatherIcon name="shield" size={20} color="white" />
          </div>
        </div>
        <p className="font-[tajawal] text-sm text-gray-500">
          إدارة المتجر الإلكتروني
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 font-[tajawal] p-3 rounded-lg transition-colors duration-300 ${
                    active
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <FeatherIcon
                    name={item.icon}
                    size={18}
                    className={active ? "text-blue-500" : "text-gray-400"}
                  />
                  <span className="flex-1 text-right">{item.name}</span>
                  {active && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 pb-2 bg-gray-300 rounded-full flex items-center justify-center">
            <FeatherIcon name="user" size={16} className="text-gray-600" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-[tajawal] text-sm font-medium text-gray-800">
              المشرف
            </p>
            <p className="font-[tajawal] text-xs text-gray-500">Admin User</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 font-[tajawal] text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300"
        >
          <FeatherIcon name="log-out" size={18} className="text-red-500" />
          <span className="flex-1 text-right">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
