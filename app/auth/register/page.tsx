"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!fullName.trim() || !tribeName.trim() || !email.trim() || !password.trim()) {
      setMessage("❌ جميع الحقول مطلوبة");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        tribe_name: tribeName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: "member",
      }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage("❌ " + data.error);
    } else {
      setMessage("✅ تم إنشاء الحساب بنجاح!");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#B49450]/20 p-8">
        <div className="text-center mb-8">
          <span className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">✦</span>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">إنشاء حساب</h1>
          <p className="text-[#8A95A4] text-sm mt-1">انضم إلى سليل</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">الاسم الثنائي</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="فلان بن فلان"
              className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#B49450] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">القبيلة</label>
            <input
              type="text"
              value={tribeName}
              onChange={(e) => setTribeName(e.target.value)}
              placeholder="اكتب اسم القبيلة"
              className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#B49450] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#B49450] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-[#F5F0E8] rounded-2xl text-right outline-none border-2 border-transparent focus:border-[#B49450] transition pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A4] hover:text-[#0A1628] transition text-lg"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B49450] text-white py-3.5 rounded-2xl font-bold hover:bg-[#D4AF37] transition disabled:opacity-50"
          >
            {loading ? "⏳ جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-center text-[#8A95A4] text-xs mt-6">
          لديك حساب؟{" "}
          <a href="/auth/login" className="text-[#B49450] hover:underline">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </main>
  );
}