"use client";
import React, { useState } from "react";
import FeatherIcon from "./FeatherIcon";

function SearchBar({ onSearch, placeholder = "...ابحث عن المنتجات" }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-row-reverse px-4 py-2 justify-between items-center w-full max-w-md rounded-lg border border-gray-200 focus:border-blue-500"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="outline-none text-right font-[tajawal] text-gray-800 placeholder-gray-500"
      />
      <button
        type="submit"
        className=" text-gray-400 hover:text-blue-600 transition-colors"
      >
        <FeatherIcon name="search" size={20} />
      </button>
    </form>
  );
}

export default SearchBar;
