import { createClient } from "@/lib/supabase";

function cleanName(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/ بن /g, " ")
    .replace(/ ابن /g, " ")
    .replace(/ إبن /g, " ")
    .replace(/ أبن /g, " ")
    .replace(/ ال/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { branchId } = await params;
    const body = await request.json();
    const input = (body.name || "").trim();
    const password = (body.password || "").trim();

    if (!input) {
      return new Response(JSON.stringify({ error: "الرجاء إدخال الاسم" }), { status: 400 });
    }

    const cleaned = cleanName(input);
    const parts = cleaned.split(" ").filter(Boolean);

    const { data: persons, error: personsError } = await supabase
      .from("persons")
      .select("id, first_name, father_name, family_name, full_name")
      .eq("branch_id", branchId);

    if (personsError) {
      return new Response(JSON.stringify({ error: "خطأ في البحث" }), { status: 500 });
    }

    if (!persons || persons.length === 0) {
      return new Response(JSON.stringify({ error: "لا يوجد أشخاص في هذا الفرع" }), { status: 401 });
    }

    const matched = persons.filter((p) => {
      const dbFirst = cleanName(p.first_name || "");
      const dbFather = cleanName(p.father_name || "");
      const dbFamily = cleanName(p.family_name || "");

      if (parts.length === 1) return dbFirst === parts[0];
      if (parts.length === 2) return dbFirst === parts[0] && dbFather === parts[1];
      return dbFirst === parts[0] && dbFather === parts[1] && dbFamily === parts[2];
    });

    if (matched.length === 0) {
      return new Response(JSON.stringify({ error: "الاسم غير موجود" }), { status: 401 });
    }

    if (matched.length > 1) {
      return new Response(
        JSON.stringify({
          ambiguous: true,
          message: "يوجد أكثر من شخص بهذا الاسم. الرجاء إدخال اسم الجد للتمييز.",
          count: matched.length,
        }),
        { status: 409 }
      );
    }

    if (!password) {
      return new Response(JSON.stringify({ error: "الرجاء إدخال كلمة سر الفرع" }), { status: 400 });
    }

    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("branch_password")
      .eq("id", branchId)
      .single();

    if (branchError || !branch) {
      return new Response(JSON.stringify({ error: "الفرع غير موجود" }), { status: 404 });
    }

    if (branch.branch_password !== password) {
      return new Response(JSON.stringify({ error: "كلمة سر الفرع غير صحيحة" }, { status: 401 }));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: "حدث خطأ في الخادم" }), { status: 500 });
  }
}