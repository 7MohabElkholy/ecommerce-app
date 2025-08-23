"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import FilterButton from "@/components/FilterButton";
import SearchBar from "@/components/SearchBar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function ProductsPage() {
  const supabase = createClientComponentClient();

  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const filters = [
    "مخصص",
    "الأكثر مبيعاً",
    "الأعلى تقييماً",
    "السعر",
    "جديد",
    "الاحدث",
    "الكل",
  ];

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // 🔹 Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
        setFilteredProducts(data);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Apply search + filters
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case "الاحدث":
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "الأكثر مبيعاً":
        // If you have a "sales" column
        filtered = filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case "الأعلى تقييماً":
        // If you add a rating column later
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "جديد":
        filtered = filtered.filter((product) => product.is_new);
        break;
      case "مخصص":
        filtered = filtered.filter((product) => product.is_hot);
        break;
      case "السعر":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [activeFilter, searchQuery, products]);

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 gap-4">
        <h2 className="font-[tajawal] text-2xl md:text-3xl font-bold text-gray-800">
          جميع المنتجات
        </h2>
        <p className="font-[tajawal] text-base md:text-lg text-gray-600 text-center max-w-2xl">
          اكتشف جميع منتجاتنا المميزة والعروض الحصرية
        </p>

        {/* Search + Filters */}
        <div className="flex w-full flex-wrap justify-center items-center gap-3 mb-6">
          <SearchBar onSearch={handleSearch} />
          {filters.map((filter) => (
            <FilterButton
              key={filter}
              filterName={filter}
              isActive={activeFilter === filter}
              onClick={handleFilterClick}
            />
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto">
            {filteredProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <p className="font-[tajawal] text-gray-600 text-lg mb-4">
                لم نعثر على منتجات تطابق بحثك
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("الكل");
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-[tajawal] hover:bg-blue-600 transition-colors duration-300"
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductsPage;
