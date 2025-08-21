import React from "react";
import Image from "next/image";
import logo from "../public/logo.svg"; // Adjust the path as necessary
import FeatherIcon from "@/components/FeatherIcon";

function Navbar() {
  return (
    <nav className="flex items-center py-2 bg-white shadow-md px-4 sticky top-0 z-50">
      <div className="flex items-center  gap-4 flex-1">
        <FeatherIcon name="heart" size={24} color="#000000" />
        <FeatherIcon name="shopping-cart" size={24} color="#000000" />
      </div>

      <ul className="flex gap-4 flex-1 justify-center">
        <li className="font-[tajawal]">الرئيسية</li>
        <li className="font-[tajawal]">المنتجات</li>
        <li className="font-[tajawal]">اتصل بنا</li>
        <li className="font-[tajawal]">عن المتجر</li>
      </ul>

      <div className="flex items-center justify-end gap-2 flex-1">
        <p className="font-[tajawal] font-bold">متجر الكتروني</p>
        <Image src={logo} width={48} height={48} />
      </div>
    </nav>
  );
}

export default Navbar;
