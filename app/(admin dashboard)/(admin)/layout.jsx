// app/admin/layout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

/**
 * The layout for the admin dashboard.
 *
 * This component handles authentication for the admin section, ensuring that only
 * authorized admin users can access the dashboard. It displays a loading spinner
 * while checking the user's authentication status and redirects to the login page
 * if the user is not an admin.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered.
 * @returns {React.ReactElement} The admin layout component.
 */
export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user || user.user_metadata?.role !== "admin") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="grid grid-cols-[1fr_256px] min-h-screen">
      {children}
      <Sidebar />
    </main>
  );
}
