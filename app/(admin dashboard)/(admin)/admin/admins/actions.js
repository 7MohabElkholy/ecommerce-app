"use server";

// import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

/**
 * Verifies that the current user is an authenticated admin.
 * Throws an error if not.
 */

async function verifyIsAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.user_metadata?.role !== "admin") {
    throw new Error("Not authorized");
  }

  console.log("Verified admin:", session.user.email);
}

export async function getAdmins() {
  await verifyIsAdmin();

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching admins:", error.message);
    return [];
  }

  console.log("Fetched admins:", admins);
  return data.users.filter((user) => user.user_metadata?.role === "admin");
}

export async function createAdmin(email, password) {
  await verifyIsAdmin();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm user's email
    user_metadata: { role: "admin" },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  console.log("Created new admin:", data.user.email);

  revalidatePath("/admin/admins");
  return { success: true, user: data.user };
}
