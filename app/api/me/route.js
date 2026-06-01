import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userName = cookieStore.get("sulail_user_name")?.value;

  if (!userName) {
    return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401 });
  }

  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("*");

  const user = users?.find((u) => {
    const normalized = (u.full_name || "").replace(/\s+/g, " ").replace(/[أإآ]/g, "ا").replace(/\bال/g, "").trim().toLowerCase();
    const incoming = decodeURIComponent(userName).replace(/\s+/g, " ").replace(/[أإآ]/g, "ا").replace(/\bال/g, "").trim().toLowerCase();
    return normalized === incoming;
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "مستخدم غير موجود" }), { status: 401 });
  }

  console.log("🔍 user.role_id:", user.role_id);

  let role = { name: "member", level: 0 };
  if (user.role_id) {
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("name, level")
      .eq("id", user.role_id)
      .single();
    
    console.log("🔍 roleData:", roleData);
    console.log("🔍 roleError:", roleError);
    
    if (roleData) role = roleData;
  }

  return new Response(JSON.stringify({
    id: user.id,
    full_name: user.full_name,
    role: role.name,
    level: role.level,
    branch_id: user.branch_id,
  }), { status: 200 });
}