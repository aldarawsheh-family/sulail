// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [changes, setChanges] = useState<Record<string, { role_id?: number; is_active?: boolean; password_hash?: string; branch_id?: string | null; full_name?: string }>>({});

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data || []);
    setLoading(false);
  }

  async function fetchBranches() {
    const res = await fetch("/api/branches");
    const data = await res.json();
    setBranches(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  function updateChange(userId: string, field: string, value: any) {
    setChanges((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  }

  async function saveAll() {
    for (const [userId, change] of Object.entries(changes)) {
      if (Object.keys(change).length > 0) {
        await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, ...change }),
        });
      }
    }
    setMessage("✅ تم حفظ جميع التغييرات");
    fetchUsers();
  }

  async function deleteUser(userId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
    setMessage("🗑️ تم حذف المستخدم");
    fetchUsers();
  }

  const hasChanges = Object.values(changes).some((c) => Object.keys(c).length > 0);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">👥 إدارة المستخدمين</h1>
          <a href="/admin" className="text-[#B49450] text-sm hover:underline">⬅ العودة للوحة التحكم</a>
        </div>
        {message && <p className="text-sm text-center text-[#B49450] mb-4">{message}</p>}

        {loading ? <p className="text-center text-[#3A4B5F]">جاري التحميل...</p> :
         users.length === 0 ? <p className="text-center text-[#3A4B5F]">لا يوجد مستخدمون</p> :
         <>
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F0E8]"><tr><th className="p-4 text-right">الاسم</th><th className="p-4 text-right">البريد</th><th className="p-4 text-right">الدور</th><th className="p-4 text-right">الفرع</th><th className="p-4 text-right">الحالة</th><th className="p-4 text-right">كلمة المرور</th><th className="p-4 text-right">حذف</th></tr></thead>
              <tbody className="divide-y">
                {users.map((user: any) => {
                  const currentRole = changes[user.id]?.role_id ?? user.role_id;
                  const currentActive = changes[user.id]?.is_active ?? user.is_active;
                  const currentBranch = changes[user.id]?.branch_id !== undefined ? changes[user.id].branch_id : user.branch_id ?? "";
                  return (
                    <tr key={user.id} className="hover:bg-[#F5F0E8]/50">
                      <td className="p-4">
                        <input
                          type="text"
                          value={changes[user.id]?.full_name !== undefined ? changes[user.id].full_name : user.full_name || ""}
                          onChange={(e) => updateChange(user.id, "full_name", e.target.value)}
                          className="bg-[#F5F0E8] border border-[#B49450]/20 rounded-lg px-3 py-1.5 text-xs outline-none w-28"
                        />
                      </td>
                      <td className="p-4 text-xs">{user.email}</td>
                      <td className="p-4">
                        <select value={currentRole} onChange={(e) => updateChange(user.id, "role_id", Number(e.target.value))} className="bg-[#F5F0E8] border border-[#B49450]/20 rounded-lg px-3 py-1.5 text-xs outline-none">
                          <option value={1}>زائر</option><option value={2}>عضو</option><option value={3}>شيخ فرع</option><option value={4}>شيخ قبيلة</option><option value={5}>سوبر أدمن</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select value={currentBranch} onChange={(e) => updateChange(user.id, "branch_id", e.target.value || null)} className="bg-[#F5F0E8] border border-[#B49450]/20 rounded-lg px-3 py-1.5 text-xs outline-none">
                          <option value="">—</option>
                          {branches.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <button onClick={() => updateChange(user.id, "is_active", !currentActive)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${currentActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                          {currentActive ? "✅ نشط" : "❌ معطل"}
                        </button>
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="جديدة"
                          value={changes[user.id]?.password_hash || ""}
                          onChange={(e) => updateChange(user.id, "password_hash", e.target.value)}
                          className="bg-[#F5F0E8] border border-[#B49450]/20 rounded-lg px-3 py-1.5 text-xs outline-none w-24"
                        />
                      </td>
                      <td className="p-4">
                        <button onClick={() => deleteUser(user.id)} className="text-red-500 text-xs hover:underline">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#B49450]/20 p-4 flex justify-center z-50 shadow-2xl">
              <button onClick={saveAll} className="bg-[#B49450] text-white px-10 py-3 rounded-full font-bold hover:bg-[#D4AF37] transition shadow-lg">
                💾 حفظ جميع التغييرات
              </button>
            </div>
          )}
         </>}
      </div>
    </main>
  );
}