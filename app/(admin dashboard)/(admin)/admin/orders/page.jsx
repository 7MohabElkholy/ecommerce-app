import { Suspense } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import OrdersClient from "./OrdersClient";
import Loading from "./loading";

async function getOrders(status) {
  // This should ideally use a server-only Supabase client for security
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error.message);
    // In a real app, you might want to throw the error
    // to be caught by an error boundary.
    return [];
  }
  return data;
}

async function getStatusCounts() {
  try {
    const { data, error } = await supabase
      .from("orders_status_counts") // This is a view for performance
      .select("*");
    if (error) throw error;

    const counts = (data || []).reduce((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {});
    return counts;
  } catch (err) {
    console.error("fetchStatusCounts error:", err.message);
    return {};
  }
}

export default async function OrdersPage({ searchParams }) {
  const status = searchParams?.status || "all";

  // Fetch data on the server based on searchParams
  const initialOrders = await getOrders(status);
  const initialStatusCounts = await getStatusCounts();

  return (
    <Suspense fallback={<Loading />}>
      <OrdersClient
        initialOrders={initialOrders}
        initialStatusCounts={initialStatusCounts}
        currentStatusFilter={status}
      />
    </Suspense>
  );
}
