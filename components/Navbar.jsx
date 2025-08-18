import React from "react";
import Image from "next/image";
import logo from "../public/logo.svg"; // Adjust the path as necessary

function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <p className="font-[tajawal] font-bold">متجر الكتروني</p>
        <Image src={logo} width={48} height={48} />
      </div>

      <ul className="flex gap-4">
        <li className="font-[tajawal]">الرئيسية</li>
        <li className="font-[tajawal]">المنتجات</li>
        <li className="font-[tajawal]">اتصل بنا</li>
        <li className="font-[tajawal]">عن المتجر</li>
      </ul>
    </nav>
  );
}

export default Navbar;
