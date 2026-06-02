// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie.includes("sulail_token");
    if (token) {
      setAlreadyLoggedIn(true);
      router.push("/");
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!fullName.trim() || !password.trim()) {
      setMessage("❌ جميع الحقول مطلوبة");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName.trim(), password: password.trim() }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage("❌ " + data.error);
      setLoading(false);
      return;
    }

    if (data.success) {
      const userName = data.user?.full_name || fullName.trim().split(" ")[0];
      localStorage.setItem("sulail_user_name", userName);
      setMessage("✅ تم الدخول بنجاح");
      setTimeout(() => {
        router.push("/");
        window.dispatchEvent(new Event("userUpdated"));
      }, 800);
    }
  }

  if (alreadyLoggedIn) return null;

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#B49450]/20 p-8">
        <div className="text-center mb-8">
          <span className="w-14 h-14 bg-gradient-to-br from-[#4A90D9] to-[#2B5F8E] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">✦</span>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">تسجيل الدخول</h1>
          <p className="text-[#8A95A4] text-sm mt-1">مرحباً بعودتك إلى سليل</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">الاسم الثنائي</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="فلان بن فلان" className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#4A90D9] transition" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">كلمة المرور</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#4A90D9] transition pr-12" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A4] hover:text-[#0A1628] transition text-lg">{showPassword ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {message && <p className={`text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#4A90D9] text-white py-3.5 rounded-2xl font-bold hover:bg-[#2B5F8E] transition disabled:opacity-50">{loading ? "⏳ جاري الدخول..." : "دخول"}</button>
        </form>
        <p className="text-center text-[#8A95A4] text-xs mt-6">
          ليس لديك حساب؟ <a href="/auth/register" className="text-[#4A90D9] hover:underline">إنشاء حساب</a>
        </p>
      </div>
    </main>
  );
}