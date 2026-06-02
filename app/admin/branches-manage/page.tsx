// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

export default function BranchesManagePage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({
    sheikh_name: "",
    username: "",
    password_hash: "",
    branch_password: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    const res = await fetch("/api/admin/branches");
    const data = await res.json();
    setBranches(data || []);
    setLoading(false);
  }

  function openEdit(branch) {
    setEditingBranch(branch);
    setForm({
      sheikh_name: branch.sheikh_name || "",
      username: branch.username || "",
      password_hash: "",
      branch_password: branch.branch_password || "",
    });
  }

  async function handleSave() {
    if (!editingBranch) return;
    if (!form.username.trim()) {
      alert("اسم المستخدم مطلوب");
      return;
    }

    const res = await fetch(`/api/admin/branches/${editingBranch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("✅ تم الحفظ بنجاح");
      setEditingBranch(null);
      fetchBranches();
    } else {
      alert("❌ حدث خطأ");
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-4xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-2">🌿 إدارة الفروع</h1>
        <p className="text-[#3A4B5F] text-sm mb-8">تعيين المشايخ وكلمات المرور للفروع</p>

        {loading ? (
          <p className="text-center text-[#3A4B5F]">جاري التحميل...</p>
        ) : branches.length === 0 ? (
          <p className="text-center text-[#3A4B5F]">لا توجد فروع بعد</p>
        ) : (
          <div className="space-y-4">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-2xl border border-[#B49450]/15 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍃</span>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-[#0A1628]">{branch.name}</h3>
                      <p className="text-[#3A4B5F] text-xs">
                        الشيخ: {branch.sheikh_name || "غير معين"} | 👤 {branch.username || "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(branch)}
                    className="bg-[#B49450] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#D4AF37] transition"
                  >
                    ⚙️ إعدادات
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-heading font-bold text-[#0A1628] mb-4">
              ⚙️ إعدادات {editingBranch.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم الشيخ</label>
                <input type="text" value={form.sheikh_name} onChange={(e) => setForm({ ...form, sheikh_name: e.target.value })} placeholder="فلان بن فلان" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">👤 اسم مستخدم الشيخ *</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="shuyukh" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">🔒 كلمة مرور الشيخ</label>
                <input type="password" value={form.password_hash} onChange={(e) => setForm({ ...form, password_hash: e.target.value })} placeholder="اترك فارغاً إذا لم ترد تغييرها" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">🔑 كلمة سر الفرع (للأفراد)</label>
                <input type="text" value={form.branch_password} onChange={(e) => setForm({ ...form, branch_password: e.target.value })} placeholder="shuyukh2020" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-[#4CAF50] text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">💾 حفظ</button>
              <button onClick={() => setEditingBranch(null)} className="flex-1 bg-gray-400 text-white py-3 rounded-xl font-bold hover:bg-gray-500 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}