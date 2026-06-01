import { createClient } from "@/lib/supabase";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const subclanId = searchParams.get("subclanId");
  const lineageId = searchParams.get("lineageId");
  const independent = searchParams.get("independent");

  let query = supabase.from("branches").select("*");

  if (independent === "true") {
    query = query.is("subclan_id", null);
  } else if (subclanId) {
    query = query.eq("subclan_id", subclanId);
  } else if (lineageId) {
    query = query.is("subclan_id", null);
  }

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase.from("branches").insert(body).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}