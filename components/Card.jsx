import React from "react";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";

function Card(props) {
  return (
    <div className="flex flex-col shadow-md rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white min-w-[250px]">
      <Image
        src={props.image || placeholder}
        alt={props.title || "Product Image"}
        width={360}
        height={260}
        className="w-full h-48 object-cover"
      />

      <div className="flex flex-col text-right p-4">
        <p className="font-[tajawal] font-bold mb-0.5">اسم المنتج</p>
        <p className="font-[tajawal] text-sm text-gray-500 mb-3">وصف المنتج</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium font-[tajawal]">
          ! إشترة الآن
        </button>
      </div>
    </div>
  );
}

export default Card;
