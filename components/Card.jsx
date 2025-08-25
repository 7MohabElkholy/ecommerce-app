import React from "react";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";
import FeatherIcon from "./FeatherIcon";
import Link from "next/link";

function Card({ product }) {
  return (
    <div className="flex flex-col shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white min-w-[250px] h-full">
      <div className="relative w-full h-48">
        <Image
          src={product.thumbnail_url || placeholder}
          alt={product.title || "Product Image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <div className="flex flex-col text-right p-4 flex-grow justify-between">
        <div>
          <h3 className="font-[tajawal] font-bold text-base mb-2 text-gray-800">
            {product.title || "اسم المنتج"}
          </h3>
          <p className="font-[tajawal] text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description || "وصف المنتج"}
          </p>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium font-[tajawal] transition-colors duration-300"
        >
          إشترِ الآن
        </Link>
      </div>
    </div>
  );
}

export default Card;
