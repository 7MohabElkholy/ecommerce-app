"use client";
import { supabase } from "../app/lib/supabaseClient";

import React from "react";

function Sidebar() {
  // Add this to your admin dashboard component
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // show UI feedback if you want
        return;
      }
      // Force full reload so middleware observes signed-out cookies
      window.location.href = "/login";
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <ul>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">
          Dashboard
        </li>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">
          Users
        </li>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">
          Settings
        </li>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">
          Reports
        </li>
      </ul>
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
