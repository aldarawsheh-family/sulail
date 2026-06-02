"use client";

import { useState } from "react";

export default function SheikhRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [clanName, setClanName] = useState("");
  const [lineageName, setLineageName] = useState("");
  const [subclanName, setSubclanName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        meta: { tribeName, clanName, lineageName, subclanName, branchName },
      }),
    });
    const data = await res.json();

    if (data.error) {
      setMessage("❌ " + data.error);
    } else {
      setMessage("✅ تم تقديم الطلب! سنراجعه قريباً.");
      setTimeout(() => { window.location.href = "/"; }, 2000);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-[#B49450]/20 p-8">
        <div className="text-center mb-8">
          <span className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">✦</span>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">تسجيل شيخ فرع</h1>
          <p className="text-[#8A95A4] text-sm mt-1">املأ بياناتك وسنراجع طلبك</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="الاسم الثلاثي *" value={fullName} onChange={setFullName} placeholder="فلان بن فلان بن فلان" required />
          <Input label="اسم القبيلة *" value={tribeName} onChange={setTribeName} placeholder="عنزة" required />
          <Input label="اسم البطن" value={clanName} onChange={setClanName} placeholder="بشر (اختياري)" />
          <Input label="اسم الفخذ" value={lineageName} onChange={setLineageName} placeholder="الجبل (اختياري)" />
          <Input label="اسم العشيرة" value={subclanName} onChange={setSubclanName} placeholder="الدرواشة (اختياري)" />
          <Input label="اسم الفرع *" value={branchName} onChange={setBranchName} placeholder="الشيوخ" required />
          <Input label="البريد الإلكتروني *" value={email} onChange={setEmail} type="email" placeholder="example@mail.com" required />
          <Input label="كلمة المرور *" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />

          {message && <p className="text-sm text-center text-[#B49450]">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#B49450] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4AF37] transition disabled:opacity-50">
            {loading ? "⏳ جاري التقديم..." : "تقديم الطلب"}
          </button>
        </form>

        <p className="text-center text-[#8A95A4] text-xs mt-6">
          لديك حساب؟ <a href="/auth/login" className="text-[#B49450] hover:underline">تسجيل الدخول</a>
        </p>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#0A1628] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border-2 border-transparent focus:border-[#B49450] transition" />
    </div>
  );
}