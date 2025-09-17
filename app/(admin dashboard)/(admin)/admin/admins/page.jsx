// app/admin/admins/page.js
"use client";

import { useEffect, useState, useTransition } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminTable() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const supabase = createClientComponentClient();

  // Check user role on component mount
  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.role || null);
    };

    getUserRole();
  }, [supabase.auth]);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "getAdmins" }),
      });

      // Check if response is OK before parsing as JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}`
        );
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setAdmins(result.data || []);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Failed to fetch admins: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      fetchAdmins();
    }
  }, [userRole]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/actions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "createAdmin",
            email,
            password,
          }),
        });

        // Check if response is OK before parsing as JSON
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          setEmail("");
          setPassword("");
          await fetchAdmins();
        } else {
          setError(result.error || "Failed to create admin");
        }
      } catch (e) {
        console.error("Create admin error:", e);
        setError("Failed to create admin: " + e.message);
      }
    });
  };

  if (userRole !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Access Denied</p>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
        <p>Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>

      <form onSubmit={handleAddAdmin} className="mb-6 flex gap-4 items-center">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          className="border p-2 rounded disabled:opacity-50 flex-1"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
          className="border p-2 rounded disabled:opacity-50 flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding..." : "Add Admin"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Admins Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Created At</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{admin.email}</td>
                  <td className="border px-4 py-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {admin.user_metadata?.role || "admin"}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    {admin.created_at
                      ? new Date(admin.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center">
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
