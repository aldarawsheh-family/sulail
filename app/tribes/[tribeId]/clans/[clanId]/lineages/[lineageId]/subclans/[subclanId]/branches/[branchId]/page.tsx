// @ts-nocheck
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import BranchTreeClient from "./BranchTreeClient";

async function getBranch(branchId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("branches").select("*").eq("id", branchId).single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export default async function BranchPage({ params }: { params: Promise<{ tribeId: string; clanId: string; lineageId: string; subclanId: string; branchId: string }> }) {
  const { tribeId, clanId, lineageId, subclanId, branchId } = await params;
  const branch = await getBranch(branchId);

  const headersList = await headers();
  const userRole = headersList.get("x-user-role");
  const userBranchId = headersList.get("x-user-branch-id");

  const isSuperAdmin = userRole === "5" || userRole === "5";
  const isBranchSheikh = userBranchId && userBranchId !== "null" && userBranchId !== "" && userBranchId === branchId;

  if (!branch) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-2">الفرع غير موجود</h1>
          <Link href="/" className="bg-[#B49450] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D4AF37] transition">⬅ العودة للرئيسية</Link>
        </div>
      </main>
    );
  }

  return (
    <BranchTreeClient
      branch={branch}
      persons={[]}
      tribeId={tribeId}
      clanId={clanId}
      lineageId={lineageId}
      subclanId={subclanId}
      isSuperAdmin={isSuperAdmin}
      isBranchSheikh={isBranchSheikh}
    />
  );
}