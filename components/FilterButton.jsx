"use client";
import React from "react";
import FeatherIcon from "./FeatherIcon";

const filterIcons = {
  الكل: "grid",
  الاحدث: "clock",
  "الأكثر مبيعاً": "trending-up",
  "الأعلى تقييماً": "award",
  ازياء: "shopping-bag",
  جديد: "zap",
  مخصص: "filter",
  السعر: "dollar-sign",
};

function FilterButton({ filterName, isActive = false, onClick }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium font-[tajawal] transition-colors duration-300 flex items-start gap-2 ${
        isActive
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
      }`}
      onClick={() => onClick(filterName)}
    >
      <FeatherIcon
        name={filterIcons[filterName] || "filter"}
        size={16}
        color={isActive ? "#ffffff" : "#374151"}
      />
      {filterName}
    </button>
  );
}

export default FilterButton;
