import { createClient } from "@/lib/supabase-server";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  const body = await request.json();
  const { full_name, tribe_name, email, password, role } = body;
  const supabase = await createClient();

  if (!full_name || !tribe_name || !email || !password) {
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

  // التحقق من فريدة الاسم
  const { data: existingUsers } = await supabase
    .from("users")
    .select("full_name");

  if (existingUsers) {
    const duplicate = existingUsers.find((u) => {
      const existing = normalize(u.full_name || "");
      const incoming = normalize(full_name);
      return existing === incoming;
    });

    if (duplicate) {
      return new Response(
        JSON.stringify({ error: "هذا الاسم موجود مسبقاً. اختر اسماً آخر أو أضف لقباً للتمييز." }),
        { status: 400 }
      );
    }
  }

  // التحقق من فريدة البريد
  const { data: existingEmail } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existingEmail) {
    return new Response(
      JSON.stringify({ error: "هذا البريد مسجل بالفعل" }),
      { status: 400 }
    );
  }

  // تشفير كلمة المرور
  const salt = await bcryptjs.genSalt(12);
  const hashedPassword = await bcryptjs.hash(password, salt);

  // إنشاء الحساب في Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
  }

  // إضافة المستخدم لجدول users
  if (authData.user) {
    const { error: insertError } = await supabase.from("users").upsert(
      {
        auth_id: authData.user.id,
        email: email,
        full_name: full_name,
        password_hash: hashedPassword,
        role_id: 2,
        is_active: true,
        meta: { tribe_name },
      },
      { onConflict: "auth_id" }
    );

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 400 });
    }
  }

  return new Response(
    JSON.stringify({ success: true, user: authData.user }),
    { status: 200 }
  );
}