// components/Card.jsx
import React from "react";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";

function Card(props) {
  return (
    <div className="flex flex-col shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white min-w-[250px] h-full">
      <div className="relative w-full h-48">
        <Image
          src={props.image || placeholder}
          alt={props.title || "Product Image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <div className="flex flex-col text-right p-4 flex-grow justify-between">
        <div>
          <p className="font-[tajawal] font-bold text-base mb-1 text-gray-800">
            اسم المنتج
          </p>
          <p className="font-[tajawal] text-sm text-gray-600 mb-3">
            وصف المنتج
          </p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium font-[tajawal] transition-colors duration-300 mt-auto">
          ! إشترة الآن
        </button>
      </div>
    </div>
  );
}

export default Card;
