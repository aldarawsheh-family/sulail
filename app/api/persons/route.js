import { createClient } from "@/lib/supabase";

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId");

  if (branchId) {
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .eq("branch_id", branchId)
      .order("display_name");
    if (error) return new Response(JSON.stringify([]));
    return new Response(JSON.stringify(data || []));
  }

  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .order("display_name");
  if (error) return new Response(JSON.stringify([]));
  return new Response(JSON.stringify(data || []));
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // إذا لم يُرسل public_id، نولّده تلقائياً
    if (!body.public_id && body.branch_id) {
      const { data: maxPerson } = await supabase
        .from("persons")
        .select("public_id")
        .eq("branch_id", body.branch_id)
        .not("public_id", "is", null)
        .order("public_id", { ascending: false })
        .limit(1);

      let nextNum = 1;
      if (maxPerson && maxPerson.length > 0) {
        const lastId = maxPerson[0].public_id;
        const numMatch = lastId.match(/BR-(\d+)/);
        if (numMatch) {
          nextNum = parseInt(numMatch[1], 10) + 1;
        }
      }

      body.public_id = `BR-${String(nextNum).padStart(3, "0")}`;
    }

    const { data, error } = await supabase
      .from("persons")
      .insert(body)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 201 });

  } catch (e) {
    return new Response(JSON.stringify({ error: "حدث خطأ في الخادم" }), { status: 500 });
  }
}