import { createClient } from "@/lib/supabase";

export async function GET(request, { params }) {
  const supabase = await createClient();
  const { branchId } = await params;
  const { data, error } = await supabase.from("branches").select("*").eq("id", branchId).single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { branchId } = await params;
  const body = await request.json();
  const { sheikh_name, username, password_hash, branch_password } = body;

  const updateData = {};
  if (sheikh_name !== undefined) updateData.sheikh_name = sheikh_name;
  if (username !== undefined) updateData.username = username;
  if (password_hash) updateData.password_hash = password_hash;
  if (branch_password !== undefined) updateData.branch_password = branch_password;

  const { error } = await supabase.from("branches").update(updateData).eq("id", branchId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}