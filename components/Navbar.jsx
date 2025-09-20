import React from "react";
import Image from "next/image";
import logo from "../public/logo.svg"; // Adjust the path as necessary
import FeatherIcon from "@/components/FeatherIcon";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="flex items-center py-2 bg-white shadow-md px-4 sticky top-0 z-50">
      <div className="flex items-center  gap-4 flex-1">
        <FeatherIcon name="heart" size={24} color="#000000" />
        <Link href="/cart" className="flex items-center justify-center">
          <FeatherIcon name="shopping-cart" size={24} color="#000000" />
        </Link>
      </div>

      <ul className="flex flex-row-reverse gap-4 flex-1 justify-center">
        <Link href="/" className="font-[tajawal]">
          الرئيسية
        </Link>
        <Link href="/products" className="font-[tajawal]">
          المنتجات
        </Link>
        <Link href="/" className="font-[tajawal]">
          عن المتجر
        </Link>
        <Link href="/" className="font-[tajawal]">
          اتصل بنا
        </Link>
      </ul>

      <div className="flex items-center justify-end gap-2 flex-1">
        <p className="font-[tajawal] font-bold text-blue-500">متجر</p>
        <Image alt="the logo of the store" src={logo} width={36} height={36} />
      </div>
    </nav>
  );
}

export default Navbar;
