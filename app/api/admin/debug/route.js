// app/api/admin/debug/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get session and user info
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Get user details if session exists
    let userDetails = null;
    if (session) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      userDetails = user;
    }

    return NextResponse.json({
      success: true,
      session: session,
      user: userDetails,
      sessionError: sessionError?.message,
      cookies: cookies()
        .getAll()
        .map((cookie) => ({
          name: cookie.name,
          value:
            cookie.value.length > 50
              ? cookie.value.substring(0, 50) + "..."
              : cookie.value,
        })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
