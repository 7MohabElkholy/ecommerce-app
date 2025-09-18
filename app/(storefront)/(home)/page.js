// pages/index.js
import Card from "@/components/Card";
import Hero from "@/components/Hero";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";
import { supabase } from "@/app/lib/supabaseClient";

/**
 * The home page for the storefront.
 *
 * This component displays the main landing page, including a hero section,
 * a list of featured products, and a promotional section.
 *
 * @returns {Promise<React.ReactElement>} A promise that resolves to the home page component.
 */
export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_hot", true);

  if (error) {
    console.error("Error fetching products:", error.message);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />

      <section className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 gap-4">
        <h2 className="font-[tajawal] text-2xl md:text-3xl font-bold text-gray-800">
          العروض المميزة
        </h2>
        <p className="font-[tajawal] text-base md:text-lg text-gray-600 text-center max-w-2xl">
          اكتشف افضل العروض على احدث المنتجات
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto mt-6">
          {products?.length > 0 ? (
            products.map((product) => (
              <Card key={product.id} product={product} />
            ))
          ) : (
            <p className="font-[tajawal] text-gray-600 text-center col-span-full">
              لا توجد عروض مميزة حالياً
            </p>
          )}
        </div>
      </section>

      <section className="my-8 md:my-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-500 items-center text-right rounded-2xl overflow-hidden max-w-6xl mx-auto shadow-lg">
          <div className="relative h-48 md:h-full">
            <Image
              src={placeholder}
              alt="Placeholder"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col p-6 md:p-8 items-end">
            <h2 className="font-[tajawal] text-xl md:text-2xl font-bold mb-3 text-white">
              عروض خاصة
            </h2>
            <p className="font-[tajawal] text-base md:text-lg mb-4 text-white">
              ! لا تفوت الفرصة، تسوق الآن واستفد من العروض الحصرية
            </p>
            <button className="bg-white hover:bg-gray-100 px-4 py-2 md:px-6 md:py-2 rounded-lg text-base font-medium font-[tajawal] text-gray-800 transition-colors duration-300">
              تسوق الآن
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
