import { createClient } from "@/lib/supabase";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const tribeId = searchParams.get("tribeId");
  const { data, error } = await supabase.from("clans").select("*").eq("tribe_id", tribeId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase.from("clans").insert(body).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}