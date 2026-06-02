import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tribes").select("*");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}