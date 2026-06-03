// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hasToken = document.cookie.includes("sulail_token");
    if (hasToken) {
      window.location.href = "/";
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!fullName.trim() || !password.trim()) {
      setMessage("❌ جميع الحقول مطلوبة");
      setLoading(false);
      return;
    }

    try {
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
        localStorage.setItem("sulail_user_name", data.user?.full_name || fullName.trim().split(" ")[0]);
        setMessage("✅ تم الدخول بنجاح");
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 600);
      }
    } catch {
      setMessage("❌ فشل الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0C1828] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#12243A] rounded-3xl shadow-2xl border border-[#D4AF3740] p-8">
        <div className="text-center mb-8">
          <span className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">✦</span>
          <h1 className="text-2xl font-heading font-bold text-white">تسجيل الدخول</h1>
          <p className="text-[#8A95A4] text-sm mt-1">مرحباً بعودتك إلى سليل</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-white mb-1">الاسم الثنائي</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="فلان بن فلان" className="w-full px-4 py-3.5 bg-[#1A3055] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#D4AF37] transition text-white placeholder:text-[#8A95A4]" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1">كلمة المرور</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-[#1A3055] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#D4AF37] transition pr-12 text-white placeholder:text-[#8A95A4]" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A4] hover:text-white transition text-lg">{showPassword ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {message && <p className={`text-sm text-center ${message.includes("✅") ? "text-green-500" : "text-red-400"}`}>{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#0C1828] py-3.5 rounded-2xl font-bold hover:bg-[#FFD700] transition disabled:opacity-50">{loading ? "⏳ جاري الدخول..." : "دخول"}</button>
        </form>
        <p className="text-center text-[#8A95A4] text-xs mt-6">
          ليس لديك حساب؟ <a href="/auth/register" className="text-[#D4AF37] hover:underline">إنشاء حساب</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C1828] flex items-center justify-center"><p className="text-white">⏳</p></div>}>
      <LoginForm />
    </Suspense>
  );
}