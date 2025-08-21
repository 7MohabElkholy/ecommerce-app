import React from "react";
import Image from "next/image";
import heroImage from "@/public/hero-bg.jpg"; // Your image path

function Hero() {
  return (
    <header className="relative w-full">
      {/* Full-width container with responsive height */}
      <div className="relative w-full h-100 aspect-video">
        {/* Adjust aspect ratio as needed */}
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {/* Black overlay (semi-transparent) */}
      <div className="absolute inset-0 bg-black/30"></div>{" "}
      {/* Adjust opacity (30%) */}
      {/* Text container - positioned top-right */}
      <div className="text-right absolute inset-0 flex justify-end items-start p-4 md:p-8">
        {/* Text box with slight padding and max-width */}
        <div className="">
          {/* Added backdrop blur */}
          <h1 className="text-4xl md:text-3xl font-[tajawal] font-bold mb-4 text-white">
            !استمتع بأفضل العروض المميزة
          </h1>
          <p className="text-lg md:text-xl mb-6 font-[tajawal] text-white">
            اكتشف أحدث المنتجات بأسعار تنافسية
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 md:px-8 md:py-3 rounded-lg text-lg font-medium font-[tajawal] text-white">
            تسوق الآن
          </button>
        </div>
      </div>
    </header>
  );
}

export default Hero;
