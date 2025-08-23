"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import FilterButton from "@/components/FilterButton";
import SearchBar from "@/components/SearchBar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function ProductsPage() {
  const supabase = createClientComponentClient();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCategoryOverlay, setShowCategoryOverlay] = useState(false);

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
    if (filterName === "مخصص") {
      setShowCategoryOverlay(true);
      return;
    }

    setActiveFilter(filterName);
    setSelectedCategories([]); // Reset category selection when other filters are chosen
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Fetch products from Supabase on mount
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

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // Apply search + filters
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter if categories are selected
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category_id)
      );
    }

    switch (activeFilter) {
      case "الاحدث":
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "الأكثر مبيعاً":
        filtered = filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case "الأعلى تقييماً":
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "جديد":
        filtered = filtered.filter((product) => product.is_new);
        break;
      case "السعر":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [activeFilter, searchQuery, products, selectedCategories]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Apply category filter and close overlay
  const applyCategoryFilter = () => {
    setActiveFilter("مخصص");
    setShowCategoryOverlay(false);
  };

  // Clear all selected categories
  const clearCategories = () => {
    setSelectedCategories([]);
    setActiveFilter("الكل");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Category Selection Overlay */}
      {showCategoryOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="font-[tajawal] text-xl font-bold text-gray-800 mb-4 text-right">
              اختر الفئات
            </h3>

            <div className="max-h-80 overflow-y-auto mb-4">
              {categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        selectedCategories.includes(category.id)
                          ? "bg-blue-100 border border-blue-300"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span className="font-[tajawal] text-gray-800">
                        {category.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="h-4 w-4 text-blue-500 rounded"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-[tajawal] text-gray-600 text-center py-4">
                  لا توجد فئات متاحة
                </p>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={clearCategories}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-[tajawal] hover:bg-gray-300 transition-colors duration-300"
              >
                إلغاء الكل
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryOverlay(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-[tajawal] hover:bg-gray-600 transition-colors duration-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={applyCategoryFilter}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-[tajawal] hover:bg-blue-600 transition-colors duration-300"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              isActive={
                activeFilter === filter ||
                (filter === "مخصص" && selectedCategories.length > 0)
              }
              onClick={handleFilterClick}
            />
          ))}
        </div>

        {/* Selected categories indicator */}
        {selectedCategories.length > 0 && (
          <div className="w-full max-w-6xl mx-auto mb-4 flex flex-wrap gap-2">
            <span className="font-[tajawal] text-gray-700">
              الفئات المحددة:
            </span>
            {selectedCategories.map((catId) => {
              const category = categories.find((c) => c.id === catId);
              return category ? (
                <span
                  key={catId}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-[tajawal]"
                >
                  {category.name}
                </span>
              ) : null;
            })}
            <button
              onClick={clearCategories}
              className="text-red-500 text-sm font-[tajawal] hover:underline"
            >
              إلغاء التخصيص
            </button>
          </div>
        )}

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
                  setSelectedCategories([]);
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
