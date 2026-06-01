import { createClient } from "@/lib/supabase";

export async function GET(request, { params }) {
  const supabase = await createClient();
  const { lineageId } = await params;
  const { data, error } = await supabase.from("lineages").select("*").eq("id", lineageId).single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { lineageId } = await params;
  const body = await request.json();
  const { data, error } = await supabase.from("lineages").update(body).eq("id", lineageId).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { lineageId } = await params;
  const { error } = await supabase.from("lineages").delete().eq("id", lineageId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}