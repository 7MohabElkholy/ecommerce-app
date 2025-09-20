// pages/index.js
import Card from "@/components/Card";
import Hero from "@/components/Hero";
import { supabase } from "@/app/lib/supabaseClient";
import BannerAd from "@/components/BannerAd";

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

      <BannerAd />
    </div>
  );
}
