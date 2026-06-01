import { createClient } from "@/lib/supabase";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const clanId = searchParams.get("clanId");
  const tribeId = searchParams.get("tribeId");
  const independent = searchParams.get("independent");

  let query = supabase.from("lineages").select("*");

  if (independent === "true") {
    query = query.is("clan_id", null);
  } else if (clanId) {
    query = query.eq("clan_id", clanId);
  } else if (tribeId) {
    query = query.is("clan_id", null);
  }

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase.from("lineages").insert(body).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}