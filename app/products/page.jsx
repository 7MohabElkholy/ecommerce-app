"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import FilterButton from "@/components/FilterButton";
import SearchBar from "@/components/SearchBar";

// Mock product data with images
const mockProducts = [
  {
    id: 1,
    name: "ساعة ذكية",
    price: 299,
    category: "إلكترونيات",
    description: "ساعة ذكية بتقنيات حديثة",
    isNew: true,
    isHot: true,
    rating: 4.5,
  },
  {
    id: 2,
    name: "حقيبة جلدية",
    price: 199,
    category: "أزياء",
    description: "حقيبة جلدية عالية الجودة",
    isNew: true,
    isHot: false,
    rating: 4.2,
  },
  {
    id: 3,
    name: "هاتف محمول",
    price: 899,
    category: "إلكترونيات",
    description: "أحدث الهواتف الذكية",
    isNew: false,
    isHot: true,
    rating: 4.8,
  },
  {
    id: 4,
    name: "نظارات شمسية",
    price: 149,
    category: "أزياء",
    description: "نظارات شمسية أنيقة",
    isNew: true,
    isHot: false,
    rating: 4.1,
  },
  {
    id: 5,
    name: "سماعات لاسلكية",
    price: 129,
    category: "إلكترونيات",
    description: "سماعات عالية الجودة",
    isNew: false,
    isHot: true,
    rating: 4.6,
  },
  {
    id: 6,
    name: "حذاء رياضي",
    price: 249,
    category: "أزياء",
    description: "حذاء رياضي مريح",
    isNew: true,
    isHot: true,
    rating: 4.3,
  },
  {
    id: 7,
    name: "كاميرا رقمية",
    price: 599,
    category: "إلكترونيات",
    description: "كاميرا احترافية",
    isNew: false,
    isHot: false,
    rating: 4.7,
  },
  {
    id: 8,
    name: "محفظة جلدية",
    price: 79,
    category: "أزياء",
    description: "محفظة جلدية عملية",
    isNew: true,
    isHot: false,
    rating: 4.0,
  },
];

function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const filters = [
    "مخصص",
    "الأكثر مبيعاً",
    "الأعلى تقييماً",
    "ازياء",
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

  useEffect(() => {
    let filtered = mockProducts;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case "الاحدث":
        filtered = filtered.filter((product) => product.isNew);
        break;
      case "الأكثر مبيعاً":
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "الأعلى تقييماً":
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "ازياء":
        filtered = filtered.filter((product) => product.category === "أزياء");
        break;
      case "جديد":
        filtered = filtered.filter((product) => product.isNew);
        break;
      case "مخصص":
        filtered = filtered.filter((product) => product.isHot);
        break;
      case "السعر":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <section className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 gap-4">
        <h2 className="font-[tajawal] text-2xl md:text-3xl font-bold text-gray-800">
          جميع المنتجات
        </h2>
        <p className="font-[tajawal] text-base md:text-lg text-gray-600 text-center max-w-2xl">
          اكتشف جميع منتجاتنا المميزة والعروض الحصرية
        </p>

        {/* Search Bar */}

        {/* Filters */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
          <div className="">
            <SearchBar onSearch={handleSearch} />
          </div>
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
              <Card
                key={product.id}
                title={product.name}
                description={product.description}
                price={product.price}
                image={`https://picsum.photos/300/200?random=${product.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <FeatherIcon
                name="search"
                size={48}
                className="text-gray-400 mx-auto mb-4"
              />
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
