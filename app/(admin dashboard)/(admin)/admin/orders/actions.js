// c:/Users/MohabElkholy/ecommerce-app/app/(admin dashboard)/(admin)/admin/orders/actions.js
"use server";

import { supabase } from "@/app/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId, newStatus) {
  try {
    const updateData = { status: newStatus };
    if (newStatus === "delivered") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to update order status in database.");
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    console.error("Error in updateOrderStatus action:", err);
    return { success: false, error: "حدث خطأ أثناء تحديث حالة الطلب" };
  }
}

export async function bulkUpdateStatus(selectedOrders, newStatus) {
  if (!selectedOrders || selectedOrders.length === 0) {
    return { success: false, error: "No orders selected." };
  }
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        ...(newStatus === "delivered" && {
          completed_at: new Date().toISOString(),
        }),
      })
      .in("id", selectedOrders);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to bulk update orders in database.");
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error in bulkUpdateStatus action:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث الطلبات" };
  }
}
