import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { action, email, password, userId, disabled } = await request.json();

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Session error:", sessionError);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user?.user_metadata?.role !== "admin") {
      console.error("User is not admin:", session.user);
      return NextResponse.json(
        { error: "Not authorized. Admin access required." },
        { status: 403 }
      );
    }

    // Create service role client for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (action === "getAdmins") {
      const { data: users, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (usersError) {
        console.error("Error fetching users:", usersError.message);
        return NextResponse.json(
          { error: usersError.message },
          { status: 500 }
        );
      }

      // Filter for admins
      const admins = users.users.filter(
        (user) => user.user_metadata?.role === "admin"
      );

      return NextResponse.json({ data: admins });
    }

    if (action === "createAdmin") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "admin" },
      });

      if (error) {
        console.error("Error creating admin:", error.message);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    // New action: Delete admin
    if (action === "deleteAdmin") {
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      // Prevent self-deletion
      if (userId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot delete your own account" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        console.error("Error deleting admin:", error.message);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Admin deleted successfully",
      });
    }

    // New action: Toggle admin status - using banned_until to disable
    if (action === "toggleAdminStatus") {
      if (!userId || disabled === undefined) {
        return NextResponse.json(
          { error: "User ID and status are required" },
          { status: 400 }
        );
      }

      // Prevent self-deactivation
      if (userId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot disable your own account" },
          { status: 400 }
        );
      }

      // Use banned_until to disable the account
      // If disabling, set banned_until to a far future date
      // If enabling, set banned_until to null
      const banDate = disabled ? "2038-01-19T03:14:07Z" : null;

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          banned_until: banDate,
          user_metadata: {
            role: "admin",
            disabled: disabled,
          },
        }
      );

      if (error) {
        console.error("Error updating admin status:", error.message);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: data.user,
        message: `Admin ${disabled ? "disabled" : "enabled"} successfully`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Server error:", error.message);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
