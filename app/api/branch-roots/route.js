import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return new Response(JSON.stringify({ error: "branchId مطلوب" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("branch_roots")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("GET ERROR:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify(data || []));
  } catch (e) {
    console.error("GET CATCH:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { branch_id, person_id, story, label } = body;

    console.log("POST BODY:", { branch_id, person_id, story, label });

    if (!branch_id || !person_id) {
      return new Response(JSON.stringify({ error: "branch_id و person_id مطلوبان" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("branch_roots")
      .insert({ branch_id, person_id, story: story || "", label: label || "" })
      .select()
      .single();

    if (error) {
      console.error("POST ERROR:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (e) {
    console.error("POST CATCH:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, story, label } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "id مطلوب" }), { status: 400 });
    }

    const updateData = {};
    if (story !== undefined) updateData.story = story;
    if (label !== undefined) updateData.label = label;

    const { data, error } = await supabase
      .from("branch_roots")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT ERROR:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify(data));
  } catch (e) {
    console.error("PUT CATCH:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}