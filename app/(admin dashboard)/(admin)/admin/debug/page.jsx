// app/admin/debug/page.js
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/debug");

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        setDebugInfo(data);
      } catch (e) {
        setError("Failed to fetch debug info: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        <p>Loading debug information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Session Information</h2>
        <pre className="bg-white p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo.session, null, 2)}
        </pre>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <pre className="bg-white p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo.user, null, 2)}
        </pre>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Cookies</h2>
        <pre className="bg-white p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo.cookies, null, 2)}
        </pre>
      </div>

      {debugInfo.sessionError && (
        <div className="mb-6 p-4 bg-red-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Session Error</h2>
          <p>{debugInfo.sessionError}</p>
        </div>
      )}

      <div className="p-4 bg-blue-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Next Steps</h2>
        <ul className="list-disc list-inside">
          <li>Check if the session exists</li>
          <li>Verify the user role is set to "admin" in user_metadata</li>
          <li>Ensure the auth cookie is being set properly</li>
          <li>Check your Supabase project settings and RLS policies</li>
        </ul>
      </div>
    </div>
  );
}
