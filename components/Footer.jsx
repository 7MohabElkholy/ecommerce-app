// components/Footer.jsx
import React from "react";
import logo from "../public/logo.svg";
import Image from "next/image";
import FeatherIcon from "@/components/FeatherIcon";

function Footer() {
  return (
    <footer className="bg-gray-100 py-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 items-center md:grid-cols-3 gap-6 md:gap-8">
        <div className="flex flex-col items-end md:items-center order-3 md:order-1">
          <div className="flex items-center gap-2 mb-3">
            <Image src={logo} width={40} height={40} alt="Logo" />
            <p className="font-[tajawal] font-bold text-base text-blue-500">
              متجر
            </p>
          </div>
          <p className="font-[tajawal] text-gray-600 text-right md:text-center text-sm">
            متجرنا يقدم أفضل المنتجات بأفضل الأسعار
          </p>
        </div>

        <div className="order-2 md:order-2">
          <h3 className="font-[tajawal] font-bold text-base mb-3 text-center">
            روابط سريعة
          </h3>
          <ul className="flex flex-col gap-2 items-end md:items-center">
            <li className="font-[tajawal] text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
              الرئيسية
            </li>
            <li className="font-[tajawal] text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
              المنتجات
            </li>
            <li className="font-[tajawal] text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
              اتصل بنا
            </li>
            <li className="font-[tajawal] text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
              عن المتجر
            </li>
          </ul>
        </div>

        <div className="order-1 md:order-3">
          <h3 className="font-[tajawal] font-bold text-base mb-3 text-right">
            معلومات التواصل
          </h3>
          <div className="flex flex-col gap-3 items-end">
            <div className="flex items-center gap-2">
              <p className="font-[tajawal] text-gray-600 text-sm">
                +201551152503
              </p>
              <FeatherIcon name="phone" size={18} className="text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-[tajawal] text-gray-600 text-sm">
                7mohabelkholy@gmail.com
              </p>
              <FeatherIcon name="mail" size={18} className="text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-[tajawal] text-gray-600 text-sm">
                مصر \ البحيرة \ دمنهور
              </p>
              <FeatherIcon name="map-pin" size={18} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-gray-200 mt-6 pt-6 text-center">
        <p className="font-[tajawal] text-gray-500 text-sm">
          © {new Date().getFullYear()} متجر الكتروني. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
