// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import TreeView from "@/components/TreeView";

export default function BranchTreeClient({ branch, persons: initialPersons, tribeId, clanId, lineageId, subclanId, isSuperAdmin, isBranchSheikh }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [grandfather, setGrandfather] = useState("");
  const [needGrandfather, setNeedGrandfather] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [persons, setPersons] = useState(initialPersons || []);
  const [editPerson, setEditPerson] = useState(null);
  const [addMode, setAddMode] = useState(null);
  const [newPerson, setNewPerson] = useState({
    full_name: "", display_name: "", birth_year: "", status: "حي أطال الله بعمره"
  });
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    if (isSuperAdmin || isBranchSheikh) {
      setIsAdmin(true);
      setAuthenticated(true);
    }
    setChecking(false);
  }, [isSuperAdmin, isBranchSheikh]);

  useEffect(() => {
    async function loadPersons() {
      const res = await fetch(`/api/persons?branchId=${branch?.id}`);
      const data = await res.json();
      setPersons(data || []);
    }
    if (branch?.id && authenticated) loadPersons();
  }, [branch?.id, authenticated]);

  async function handleLogin() {
    setError("");
    if (!name.trim()) { setError("الرجاء إدخال الاسم"); return; }
    if (!password.trim()) { setError("الرجاء إدخال كلمة سر الفرع"); return; }
    if (needGrandfather && !grandfather.trim()) { setError("الرجاء إدخال اسم الجد للتمييز"); return; }

    let fullNameToSend;
    if (needGrandfather) {
      fullNameToSend = `${name.trim()} بن ${grandfather.trim()}`;
    } else {
      fullNameToSend = name.trim();
    }

    try {
      const res = await fetch(`/api/branches/${branch.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullNameToSend, password: password.trim() }),
      });
      const data = await res.json();

      if (res.status === 409 && data.ambiguous) {
        setError("⚠️ " + data.message);
        setNeedGrandfather(true);
        return;
      }

      if (res.ok) {
        setAuthenticated(true);
      } else {
        setError(data.error || "بيانات غير صحيحة");
      }
    } catch {
      setError("فشل الاتصال بالخادم");
    }
  }

  function handleAdd(type, person) {
    setAddMode({ type, person });
    setNewPerson({ full_name: "", display_name: "", birth_year: "", status: "حي أطال الله بعمره" });
  }

  async function handleAddPerson() {
    const displayName = newPerson.display_name.trim();
    if (!displayName) return;
    const fullName = newPerson.full_name.trim() || displayName;
    let dataToInsert = {
      full_name: fullName,
      display_name: displayName,
      birth_year: newPerson.birth_year || "",
      status: newPerson.status || "حي أطال الله بعمره",
      branch_id: branch.id,
    };

    if (addMode?.type === "son") {
      const fatherFirstName = addMode.person.first_name || addMode.person.full_name;
      const fatherFatherName = addMode.person.father_name || "";
      dataToInsert.first_name = fullName;
      dataToInsert.father_name = fatherFirstName;
      dataToInsert.family_name = fatherFatherName;
      dataToInsert.full_name = `${fullName} بن ${fatherFirstName}${fatherFatherName ? ' بن ' + fatherFatherName : ''}`;
      dataToInsert.father_id = addMode.person.id;
    } else if (addMode?.type === "brother") {
      dataToInsert.first_name = fullName;
      dataToInsert.father_name = addMode.person.father_name || "";
      dataToInsert.family_name = addMode.person.family_name || "";
      dataToInsert.full_name = `${fullName} بن ${dataToInsert.father_name}${dataToInsert.family_name ? ' بن ' + dataToInsert.family_name : ''}`;
      dataToInsert.father_id = addMode.person.father_id || "";
    } else if (addMode?.type === "father") {
      const res = await fetch("/api/persons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName, display_name: displayName, first_name: fullName,
          birth_year: newPerson.birth_year || "", status: newPerson.status || "حي أطال الله بعمره",
          branch_id: branch.id,
        }),
      });
      const newFather = await res.json();
      if (newFather && newFather.id) {
        await fetch(`/api/persons/${addMode.person.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ father_id: newFather.id }),
        });
        setPersons(prev => prev.map(p => p.id === addMode.person.id ? { ...p, father_id: newFather.id } : p).concat(newFather));
      }
      setAddMode(null);
      setNewPerson({ full_name: "", display_name: "", birth_year: "", status: "حي أطال الله بعمره" });
      showToast("تمت الإضافة بنجاح");
      return;
    }

    const res = await fetch("/api/persons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToInsert),
    });
    const inserted = await res.json();
    if (inserted && inserted.id) {
      setPersons(prev => [...prev, inserted]);
      setAddMode(null);
      setNewPerson({ full_name: "", display_name: "", birth_year: "", status: "حي أطال الله بعمره" });
      showToast("تمت الإضافة بنجاح");
    }
  }

  async function handleEditPerson() {
    if (!editPerson) return;
    await fetch(`/api/persons/${editPerson.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPerson),
    });
    setPersons(prev => prev.map(p => p.id === editPerson.id ? editPerson : p));
    setEditPerson(null);
    showToast("تم التعديل بنجاح");
  }

  async function handleDeletePerson(personId) {
    setDeleteTarget(personId);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/persons/${deleteTarget}`, { method: "DELETE" });
    setPersons(prev => prev.filter(p => p.id !== deleteTarget));
    setDeleteTarget(null);
    showToast("تم الحذف بنجاح");
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <p className="text-white/50">⏳ جاري التحقق...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* رسالة التأكيد المنبثقة */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#4CAF50] text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-slideDown">
          ✅ {toast}
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A1628]/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border border-[#E53935]/30">
            <div className="bg-gradient-to-r from-[#E53935] to-[#C62828] px-6 py-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-2xl">🗑️</div>
              <h3 className="text-white font-heading font-bold text-lg">تأكيد الحذف</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#0A1628] text-sm mb-6">هل أنت متأكد من حذف هذا الشخص؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 bg-[#E53935] text-white py-3 rounded-2xl font-bold hover:bg-[#C62828] transition">🗑️ حذف</button>
                <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-[#F5F0E8] text-[#5D4037] py-3 rounded-2xl font-bold hover:bg-[#E8E0D0] transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!authenticated ? (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-[#1A2A4A] to-[#0A1628]">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#B49450]/20 p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">{branch.name}</h1>
            <p className="text-white/50 text-sm mb-6">هذا الفرع خاص. أدخل بياناتك للمتابعة</p>
            
            <input 
              type="text" 
              placeholder="الاسم الثنائي (فلان بن فلان)" 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                setNeedGrandfather(false);
                setGrandfather("");
              }} 
              className="w-full px-4 py-3.5 bg-white/10 border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition mb-4 text-white placeholder:text-white/30" 
            />
            
            {needGrandfather && (
              <input 
                type="text" 
                placeholder="اسم الجد (للتمييز)" 
                value={grandfather} 
                onChange={(e) => setGrandfather(e.target.value)} 
                className="w-full px-4 py-3.5 bg-white/10 border-2 border-[#B49450]/50 rounded-2xl text-right outline-none focus:border-[#B49450] transition mb-4 text-white placeholder:text-white/50" 
              />
            )}
            
            <input 
              type="password" 
              placeholder="كلمة سر الفرع" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3.5 bg-white/10 border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition mb-2 text-white placeholder:text-white/30" 
            />
            
            {error && <p className={`text-xs mb-3 ${error.includes("⚠️") ? "text-amber-400" : "text-red-400"}`}>{error}</p>}
            
            <button onClick={handleLogin} className="w-full bg-[#B49450] text-white py-3.5 rounded-2xl font-bold hover:bg-[#D4AF37] transition mt-2">🔓 دخول</button>
            <p className="text-white/20 text-[10px] mt-4">⚠️ للأفراد المسجلين فقط</p>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0A1628]/90 to-transparent px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}/subclans/${subclanId}`} className="text-white/50 hover:text-white text-sm transition">⬅ العودة للعشيرة</a>
              <span className="text-white/20">|</span>
              <h1 className="text-white font-heading font-bold text-lg">🍃 {branch.name}</h1>
              <span className="text-white/30 text-xs">• {persons.length} فرد</span>
            </div>
          </div>

          {/* نافذة الإضافة */}
          {addMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onMouseDown={(e) => { if (e.target === e.currentTarget) setAddMode(null); }}
            >
              <div className="absolute inset-0 bg-[#0A1628]/50 backdrop-blur-sm" onClick={() => setAddMode(null)} />
              
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border border-[#B49450]/30"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-[#B49450] to-[#D4AF37] px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    {addMode.type === "son" ? "👶" : addMode.type === "brother" ? "👬" : addMode.type === "father" ? "👆" : "🌳"}
                  </div>
                  <h3 className="text-white font-heading font-bold text-lg">
                    {addMode.type === "son" ? `إضافة ابن لـ ${addMode.person.display_name || addMode.person.full_name}` :
                     addMode.type === "brother" ? `إضافة أخ لـ ${addMode.person.display_name || addMode.person.full_name}` :
                     addMode.type === "father" ? `إضافة أب لـ ${addMode.person.display_name || addMode.person.full_name}` :
                     `إضافة جد الفرع`}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم العرض <span className="text-red-500">*</span></label>
                    <input 
                      placeholder="مثال: محمد" 
                      value={newPerson.display_name} 
                      onChange={(e) => setNewPerson({ ...newPerson, display_name: e.target.value })} 
                      className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition text-[#0A1628] placeholder:text-[#8A95A4]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">الاسم الكامل</label>
                    <input 
                      placeholder="اختياري - مثال: محمد بن أحمد" 
                      value={newPerson.full_name} 
                      onChange={(e) => setNewPerson({ ...newPerson, full_name: e.target.value })} 
                      className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition text-[#0A1628] placeholder:text-[#8A95A4]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1628] mb-1">سنة الميلاد</label>
                      <input 
                        placeholder="مثال: 1980" 
                        value={newPerson.birth_year} 
                        onChange={(e) => setNewPerson({ ...newPerson, birth_year: e.target.value })} 
                        className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition text-[#0A1628] placeholder:text-[#8A95A4]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1628] mb-1">الحالة</label>
                      <select 
                        value={newPerson.status} 
                        onChange={(e) => setNewPerson({ ...newPerson, status: e.target.value })} 
                        className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#B49450]/20 rounded-2xl text-right outline-none focus:border-[#B49450] transition text-[#0A1628]"
                      >
                        <option value="حي أطال الله بعمره">حي أطال الله بعمره</option>
                        <option value="انتقل إلى رحمة الله">انتقل إلى رحمة الله</option>
                        <option value="شهيد بإذن الله">شهيد بإذن الله</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={handleAddPerson} className="flex-1 bg-[#B49450] text-white py-3.5 rounded-2xl font-bold hover:bg-[#D4AF37] transition shadow-lg">💾 حفظ</button>
                  <button onClick={() => setAddMode(null)} className="flex-1 bg-[#F5F0E8] text-[#5D4037] py-3.5 rounded-2xl font-bold hover:bg-[#E8E0D0] transition">إلغاء</button>
                </div>
              </div>
            </div>
          )}

          {/* نافذة التعديل */}
          {editPerson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onMouseDown={(e) => { if (e.target === e.currentTarget) setEditPerson(null); }}
            >
              <div className="absolute inset-0 bg-[#0A1628]/50 backdrop-blur-sm" onClick={() => setEditPerson(null)} />
              
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border-2 border-[#D4AF37]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-[#1A3A5C] to-[#2B5F8E] px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-2xl">✏️</div>
                  <h3 className="text-white font-heading font-bold text-lg">تعديل: {editPerson.display_name || editPerson.full_name}</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم العرض <span className="text-red-500">*</span></label>
                    <input 
                      placeholder="اسم العرض" 
                      value={editPerson.display_name || ""} 
                      onChange={(e) => setEditPerson({ ...editPerson, display_name: e.target.value })} 
                      className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D4AF37]/30 rounded-2xl text-right outline-none focus:border-[#D4AF37] transition text-[#0A1628]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">الاسم الكامل</label>
                    <input 
                      placeholder="الاسم الكامل" 
                      value={editPerson.full_name || ""} 
                      onChange={(e) => setEditPerson({ ...editPerson, full_name: e.target.value })} 
                      className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D4AF37]/30 rounded-2xl text-right outline-none focus:border-[#D4AF37] transition text-[#0A1628]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1628] mb-1">سنة الميلاد</label>
                      <input 
                        placeholder="سنة الميلاد" 
                        value={editPerson.birth_year || ""} 
                        onChange={(e) => setEditPerson({ ...editPerson, birth_year: e.target.value })} 
                        className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D4AF37]/30 rounded-2xl text-right outline-none focus:border-[#D4AF37] transition text-[#0A1628]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1628] mb-1">الحالة</label>
                      <select 
                        value={editPerson.status || "حي أطال الله بعمره"} 
                        onChange={(e) => setEditPerson({ ...editPerson, status: e.target.value })} 
                        className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D4AF37]/30 rounded-2xl text-right outline-none focus:border-[#D4AF37] transition text-[#0A1628]"
                      >
                        <option value="حي أطال الله بعمره">حي أطال الله بعمره</option>
                        <option value="انتقل إلى رحمة الله">انتقل إلى رحمة الله</option>
                        <option value="شهيد بإذن الله">شهيد بإذن الله</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={handleEditPerson} className="flex-1 bg-[#2B5F8E] text-white py-3.5 rounded-2xl font-bold hover:bg-[#1A3A5C] transition shadow-lg">💾 حفظ التعديل</button>
                  <button onClick={() => setEditPerson(null)} className="flex-1 bg-[#F5F0E8] text-[#5D4037] py-3.5 rounded-2xl font-bold hover:bg-[#E8E0D0] transition">إلغاء</button>
                </div>
              </div>
            </div>
          )}

          <TreeView
            key={persons.length}
            persons={persons}
            isAdmin={isAdmin}
            onEdit={setEditPerson}
            onDelete={handleDeletePerson}
            onAdd={handleAdd}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </main>
  );
}