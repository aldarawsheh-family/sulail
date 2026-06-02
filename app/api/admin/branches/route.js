import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("branches").select("*").order("name");
  if (error) return new Response(JSON.stringify([]));
  return new Response(JSON.stringify(data || []));
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, slug, subclan_id, description } = body;
    if (!name || !slug || !subclan_id) return new Response(JSON.stringify({ error: "All fields required" }), { status: 400 });
    const { data, error } = await supabase.from("branches").insert([{ name, slug, subclan_id, description }]).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}