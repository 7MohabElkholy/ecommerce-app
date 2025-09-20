// components/Hero.jsx
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Hero() {
  const supabase = createServerComponentClient({ cookies });

  const { data: hero } = await supabase
    .from("hero")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!hero) return null;

  return (
    <header className="relative w-full">
      <div className="relative w-full h-64 md:h-80 lg:h-96">
        <Image
          src={hero.image_url}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="absolute inset-0 flex justify-end items-center p-4 md:p-8 lg:p-12">
        <div className="max-w-md md:max-w-lg bg-black/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-right">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-[tajawal] font-bold mb-4 text-white">
            {hero.title}
          </h1>
          <p className="text-base md:text-lg lg:text-xl mb-6 font-[tajawal] text-white">
            {hero.description}
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 md:px-8 md:py-3 rounded-lg text-base font-medium font-[tajawal] text-white transition-colors duration-300">
            {hero.button_text}
          </button>
        </div>
      </div>
    </header>
  );
}
