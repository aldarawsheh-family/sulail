import { createClient } from "@/lib/supabase";

export async function POST(request) {
  const supabase = await createClient();
  try {
    const body = await request.json();
    const { name, slug, lineage_id, description } = body;
    if (!name || !slug || !lineage_id) return new Response(JSON.stringify({ error: "All fields required" }), { status: 400 });
    const { data, error } = await supabase.from("subclans").insert([{ name, slug, lineage_id, description }]).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}