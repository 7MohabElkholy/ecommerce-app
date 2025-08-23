"use client";
import React, { useState, useEffect } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { supabase } from "../../../../lib/supabaseClient";
import CategoryDialog from "@/components/CategoryDialog"; // Import the dialog

function CategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 5; // how many per page
  const [totalCount, setTotalCount] = useState(0);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const fetchCategories = async () => {
    setLoading(true);

    // calculate range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("categories_with_counts")
      .select("*", { count: "exact" }) // 🔑 fetch count too
      .order("created_at", { ascending: false })
      .range(from, to);

    // 🔍 Search filtering
    if (searchQuery.trim() !== "") {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("fetch categories error", error);
      setCategories([]);
    } else {
      setCategories(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  // re-fetch on page/search change
  useEffect(() => {
    fetchCategories();
  }, [page, searchQuery]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleCategorySelection = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCategories((prev) =>
      prev.length === categories.length ? [] : categories.map((cat) => cat.id)
    );
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("حدث خطأ أثناء حذف التصنيف");
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.is_active ? "نشط" : "غير نشط").includes(
        searchQuery.toLowerCase()
      )
  );

  // if (loading)
  //   return (
  //     <div className="w-full p-6 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //     </div>
  //   );

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
              placeholder="...ابحث عن تصنيف"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-[tajawal] text-right text-sm"
            />
            <FeatherIcon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pb-6"
            />
          </div>

          {/* Add Category Button */}
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-[tajawal] font-medium text-sm transition-colors duration-300 flex items-start gap-2"
          >
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
                    checked={selectedCategories.length === categories.length}
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
                    منتج {category.products_count || 0}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[tajawal] font-medium ${
                      category.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {category.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>

                {/* Created At */}
                <td className="px-4 py-4 text-center">
                  <span className="font-[tajawal] text-gray-600 text-sm">
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "غير معروف"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <FeatherIcon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
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
          عرض {categories.length} من {totalCount} تصنيف
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            السابق
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                page === i + 1
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        category={editingCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}

export default CategoriesTable;
