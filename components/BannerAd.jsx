// components/BannerAd.jsx
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function BannerAd() {
  const supabase = createServerComponentClient({ cookies });

  const { data: banner } = await supabase
    .from("banner")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!banner) return null;

  return (
    <section className="my-8 md:my-12 px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-500 items-center text-right rounded-2xl overflow-hidden max-w-6xl mx-auto shadow-lg">
        <div className="relative h-48 md:h-full">
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col p-6 md:p-8 items-end">
          <h2 className="font-[tajawal] text-xl md:text-2xl font-bold mb-3 text-white">
            {banner.title}
          </h2>
          <p className="font-[tajawal] text-base md:text-lg mb-4 text-white">
            {banner.description}
          </p>
          <button className="bg-white hover:bg-gray-100 px-4 py-2 md:px-6 md:py-2 rounded-lg text-base font-medium font-[tajawal] text-gray-800 transition-colors duration-300">
            {banner.button_text}
          </button>
        </div>
      </div>
    </section>
  );
}
