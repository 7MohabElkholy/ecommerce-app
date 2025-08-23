"use client";
import React, { useState } from "react";
import FeatherIcon from "@/components/FeatherIcon";

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: "إلكترونيات",
    products: 42,
    status: "نشط",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "أزياء",
    products: 28,
    status: "نشط",
    createdAt: "2024-01-10",
  },
  { id: 3, name: "منزل", products: 15, status: "نشط", createdAt: "2024-01-08" },
  {
    id: 4,
    name: "رياضة",
    products: 19,
    status: "معلق",
    createdAt: "2024-01-05",
  },
  { id: 5, name: "جمال", products: 23, status: "نشط", createdAt: "2024-01-03" },
  {
    id: 6,
    name: "أطفال",
    products: 31,
    status: "نشط",
    createdAt: "2023-12-28",
  },
  { id: 7, name: "كتب", products: 8, status: "معلق", createdAt: "2023-12-25" },
];

function CategoriesTable() {
  const [selectedCategories, setSelectedCategories] = useState([]); // no <number[]>
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategorySelection = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCategories((prev) =>
      prev.length === mockCategories.length
        ? []
        : mockCategories.map((cat) => cat.id)
    );
  };

  const filteredCategories = mockCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full p-6">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 mb-6 text-right">
        <div>
          <h2 className="font-[tajawal] text-2xl font-bold text-gray-800 mb-2">
            إدارة التصنيفات
          </h2>
          <p className="font-[tajawal] text-gray-600 text-sm">
            إدارة وتنظيم تصنيفات المنتجات في المتجر
          </p>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن تصنيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-sm"
            />
            <FeatherIcon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Add Category Button */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-[tajawal] font-medium text-sm transition-colors duration-300 flex items-start gap-2">
            <FeatherIcon name="plus" size={16} />
            إضافة تصنيف
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-right">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedCategories.length === mockCategories.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-[tajawal] font-medium text-gray-700 text-sm">
                اسم التصنيف
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                عدد المنتجات
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                الحالة
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                تاريخ الإضافة
              </th>
              <th className="px-4 py-3 text-center font-[tajawal] font-medium text-gray-700 text-sm">
                الإجراءات
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredCategories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategorySelection(category.id)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>

                {/* Category Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 pb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FeatherIcon
                        name="folder"
                        size={16}
                        className="text-blue-500"
                      />
                    </div>
                    <span className="font-[tajawal] font-medium text-gray-800">
                      {category.name}
                    </span>
                  </div>
                </td>

                {/* Products Count */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] text-gray-600 text-sm">
                    {category.products} منتج
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[tajawal] font-medium ${
                      category.status === "نشط"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {category.status}
                  </span>
                </td>

                {/* Created At */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] text-gray-600 text-sm">
                    {category.createdAt}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <FeatherIcon name="edit" size={16} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <FeatherIcon name="trash-2" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="font-[tajawal] text-sm text-gray-600">
          عرض {filteredCategories.length} من {mockCategories.length} تصنيف
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            السابق
          </button>
          <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            1
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            2
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoriesTable;
