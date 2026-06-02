import { createClient } from "@/lib/supabase-server";
import bcryptjs from "bcryptjs";

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

  const user = users.find((u) => {
    const normalized = normalize(u.full_name || "");
    const incoming = normalize(full_name);
    return normalized === incoming;
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "الاسم غير موجود" }), { status: 400 });
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return new Response(JSON.stringify({ error: "كلمة المرور غير صحيحة" }), { status: 400 });
  }

  if (!user.is_active) {
    return new Response(JSON.stringify({ error: "الحساب معطل. تواصل مع الدعم." }), { status: 400 });
  }

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
          `sulail_user_name=${encodeURIComponent(userName)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`,
          `sulail_user_role=${user.role_id}; Path=/; Max-Age=86400; SameSite=Lax; Secure`,
          `sulail_branch_id=${user.branch_id || ""}; Path=/; Max-Age=86400; SameSite=Lax; Secure`
        ].join(", "),
      },
    }
  );

  return response;
}