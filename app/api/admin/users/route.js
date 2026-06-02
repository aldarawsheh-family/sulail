import { createClient } from "@/lib/supabase";
import bcryptjs from "bcryptjs";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  return new Response(JSON.stringify(data || []));
}

export async function PUT(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, email, role_id, is_active, full_name, meta, password_hash, branch_id } = body;

  // تشفير كلمة المرور إذا وُجدت
  let hashedPassword = null;
  if (password_hash && password_hash.trim() !== "") {
    const salt = await bcryptjs.genSalt(12);
    hashedPassword = await bcryptjs.hash(password_hash, salt);
  }

  if (email && full_name) {
    const updateData = { full_name, meta };
    if (hashedPassword) updateData.password_hash = hashedPassword;
    if (branch_id !== undefined) updateData.branch_id = branch_id || null;
    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("email", email);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    return new Response(JSON.stringify({ success: true }));
  }

  if (id) {
    const update = {};
    if (role_id !== undefined) update.role_id = role_id;
    if (is_active !== undefined) update.is_active = is_active;
    if (full_name) update.full_name = full_name;
    if (hashedPassword) update.password_hash = hashedPassword;
    if (branch_id !== undefined) update.branch_id = branch_id || null;
    const { error } = await supabase.from("users").update(update).eq("id", id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(JSON.stringify({ error: "Missing id or email" }), { status: 400 });
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true }));
}