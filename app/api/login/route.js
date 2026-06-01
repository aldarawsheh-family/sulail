import { createClient } from "@/lib/supabase-server";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sulail-secret-key-change-me");

export async function POST(request) {
  const body = await request.json();
  const { full_name, password } = body;
  const supabase = await createClient();

  if (!full_name || !password) {
    return new Response(JSON.stringify({ error: "جميع الحقول مطلوبة" }), { status: 400 });
  }

  function normalize(text) {
    return text
      .replace(/\s+/g, " ")
      .replace(/[أإآ]/g, "ا")
      .replace(/\bال/g, "")
      .trim()
      .toLowerCase();
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, password_hash, role_id, is_active, branch_id");

  if (!users || users.length === 0) {
    return new Response(JSON.stringify({ error: "لا يوجد مستخدمون مسجلون" }), { status: 400 });
  }

  const matchedUsers = users.filter((u) => {
    const normalized = normalize(u.full_name || "");
    const incoming = normalize(full_name);
    return normalized === incoming;
  });

  if (matchedUsers.length > 1) {
    return new Response(
      JSON.stringify({
        ambiguous: true,
        message: "يوجد أكثر من شخص بهذا الاسم. الرجاء إدخال اسم الجد للتمييز.",
        count: matchedUsers.length,
      }),
      { status: 409 }
    );
  }

  if (matchedUsers.length === 0) {
    return new Response(JSON.stringify({ error: "الاسم غير موجود" }), { status: 400 });
  }

  const user = matchedUsers[0];

  const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return new Response(JSON.stringify({ error: "كلمة المرور غير صحيحة" }), { status: 400 });
  }

  if (!user.is_active) {
    return new Response(JSON.stringify({ error: "الحساب معطل. تواصل مع الدعم." }), { status: 400 });
  }

  // إنشاء JWT
  const token = await new SignJWT({
    id: user.id,
    full_name: user.full_name,
    role_id: user.role_id,
    branch_id: user.branch_id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const userName = user.full_name || full_name.trim().split(" ")[0];

  const response = new Response(
    JSON.stringify({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        branch_id: user.branch_id,
      },
    }),
    {
      status: 200,
      headers: {
        "Set-Cookie": [
          `sulail_token=${token}; Path=/; Max-Age=86400; SameSite=None; Secure; HttpOnly`,
          `sulail_user_name=${encodeURIComponent(userName)}; Path=/; Max-Age=86400; SameSite=None; Secure`,
        ].join(", "),
      },
    }
  );

  return response;
}