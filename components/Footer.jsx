import React from "react";
import logo from "../public/logo.svg"; // Adjust the path as necessary
import Image from "next/image";

import FeatherIcon from "@/components/FeatherIcon";

function Footer() {
  return (
    <footer className="flex items-center justify-between bg-gray-100 p-8 mt-8">
      <div className="flex flex-col items-end justify-center">
        <div className="flex items-center gap-2 mb-4">
          <p className="font-[tajawal]">+201551152503</p>
          <FeatherIcon name="phone" size={24} color="#000000" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <p className="font-[tajawal]">7mohabelkholy@gmail.com</p>
          <FeatherIcon name="mail" size={24} color="#000000" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <p className="font-[tajawal]">مصر \ البحيرة \ دمنهور</p>
          <FeatherIcon name="map-pin" size={24} color="#000000" />
        </div>
      </div>

      <ul className="flex flex-col gap-2 items-center justify-center">
        <li className="font-[tajawal]">الرئيسية</li>
        <li className="font-[tajawal]">المنتجات</li>
        <li className="font-[tajawal]">اتصل بنا</li>
        <li className="font-[tajawal]">عن المتجر</li>
      </ul>

      <div className="flex flex-col items-center gap-2">
        <Image src={logo} width={48} height={48} />
        <p className="font-[tajawal] font-bold">متجر الكتروني</p>
      </div>
    </footer>
  );
}

export default Footer;
