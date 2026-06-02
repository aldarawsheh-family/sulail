import { createClient } from "@/lib/supabase";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const lineageId = searchParams.get("lineageId");
  const clanId = searchParams.get("clanId");
  const independent = searchParams.get("independent");

  let query = supabase.from("subclans").select("*");

  if (independent === "true") {
    query = query.is("lineage_id", null);
  } else if (lineageId) {
    query = query.eq("lineage_id", lineageId);
  } else if (clanId) {
    query = query.is("lineage_id", null);
  }

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase.from("subclans").insert(body).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}