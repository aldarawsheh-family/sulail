// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = "sulail_token=; Path=/; Max-Age=0; SameSite=Lax; Secure";
    document.cookie = "sulail_user_name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
    localStorage.removeItem("sulail_user_name");
    localStorage.removeItem("sulail_user_role");
    localStorage.removeItem("sulail_branch_id");
    setTimeout(() => {
      router.push("/");
      window.dispatchEvent(new Event("userUpdated"));
    }, 500);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0A0F14] flex items-center justify-center">
      <p className="text-white/50 text-lg">👋 جاري تسجيل الخروج...</p>
    </main>
  );
}