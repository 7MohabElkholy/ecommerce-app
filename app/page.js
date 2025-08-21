import Card from "@/components/Card";
import Hero from "@/components/Hero";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="">
      <Hero />

      <section className="flex flex-col items-center justify-center p-8 gap-2">
        <h2 className="font-[tajawal] text-2xl font-bold">العروض المميزة</h2>
        <p className="font-[tajawal] text-lg">
          اكتشف افضل العروض على احدث المنتجات
        </p>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </section>
      </section>

      <section className="grid grid-cols-2 mx-8 bg-blue-500 items-start text-right rounded-2xl">
        <Image
          src={placeholder}
          alt="Placeholder"
          width={500}
          height={300}
          className="w-full object-cover h-full max-h-64 rounded-l-2xl"
        />

        <div className="flex flex-col p-6 items-end">
          <h2 className="font-[tajawal] text-xl font-bold mb-2 text-white">
            عروض خاصة
          </h2>
          <p className="font-[tajawal] text-lg mb-6 text-white">
            ! لا تفوت الفرصة، تسوق الآن واستفد من العروض الحصرية
          </p>
          <button className="bg-white hover:bg-gray-100 px-6 py-2 md:px-8 md:py-3 rounded-lg text-lg font-medium font-[tajawal] text-black">
            تسوق الآن
          </button>
        </div>
      </section>
    </div>
  );
}
