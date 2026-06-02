// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LEVELS = [
  { key: "tribes", label: "🦅 قبائل", parent: null },
  { key: "clans", label: "🌿 بطون", parent: "tribes" },
  { key: "lineages", label: "🌱 أفخاذ", parent: "clans" },
  { key: "subclans", label: "🍂 عشائر", parent: "lineages" },
  { key: "branches", label: "🍃 فروع", parent: "subclans" },
];

function getParentApiParam(parentLevel) {
  if (parentLevel === "tribes") return "tribeId";
  if (parentLevel === "clans") return "clanId";
  if (parentLevel === "lineages") return "lineageId";
  return "subclanId";
}

function getParentDbColumn(parentLevel) {
  if (parentLevel === "tribes") return "tribe_id";
  if (parentLevel === "clans") return "clan_id";
  if (parentLevel === "lineages") return "lineage_id";
  return "subclan_id";
}

export default function SmartManagerPage() {
  const [activeTab, setActiveTab] = useState("tribes");
  const [items, setItems] = useState([]);
  const [independentItems, setIndependentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showMove, setShowMove] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", parent_type: "", parent_id: "",
    sheikh_name: "", username: "", password_hash: "", branch_password: "",
  });

  const [filters, setFilters] = useState({});
  const [tribesList, setTribesList] = useState([]);
  const [clansList, setClansList] = useState([]);
  const [lineagesList, setLineagesList] = useState([]);
  const [subclansList, setSubclansList] = useState([]);
  const [allParents, setAllParents] = useState([]);

  const [moveFilters, setMoveFilters] = useState({});
  const [moveTribesList, setMoveTribesList] = useState([]);
  const [moveClansList, setMoveClansList] = useState([]);
  const [moveLineagesList, setMoveLineagesList] = useState([]);
  const [moveSubclansList, setMoveSubclansList] = useState([]);

  const currentLevel = LEVELS.find(l => l.key === activeTab);
  const parentChain = LEVELS.filter(l => {
    const currentIndex = LEVELS.findIndex(x => x.key === activeTab);
    const levelIndex = LEVELS.findIndex(x => x.key === l.key);
    return levelIndex < currentIndex;
  });

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    setFilters({});
    setClansList([]);
    setLineagesList([]);
    setSubclansList([]);
    setItems([]);
    setIndependentItems([]);
    if (activeTab === "tribes") fetchItems();
    if (parentChain.length > 0) {
      loadList("tribes", setTribesList);
    }
    fetchAllParents();
  }, [activeTab]);

  async function fetchAllParents() {
    const all = [];
    for (const l of LEVELS) {
      if (l.key === activeTab) break;
      try {
        const res = await fetch(`/api/${l.key}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          all.push({ type: l.key, label: l.label, items: data });
        }
      } catch {}
    }
    setAllParents(all);
  }

  async function loadList(levelKey, setter, parentParam = null) {
    try {
      let url = `/api/${levelKey}`;
      if (parentParam) url += `?${parentParam}`;
      const res = await fetch(url);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch {
      setter([]);
    }
  }

  async function loadIndependent(levelKey) {
    try {
      let url = `/api/${levelKey}?independent=true`;
      const res = await fetch(url);
      const data = await res.json();
      setIndependentItems(Array.isArray(data) ? data : []);
    } catch {
      setIndependentItems([]);
    }
  }

  function handleFilterChange(levelKey, value) {
    const newFilters = { ...filters };
    newFilters[levelKey] = value;
    
    const chainKeys = parentChain.map(l => l.key);
    const startIndex = chainKeys.indexOf(levelKey);
    for (let i = startIndex + 1; i < chainKeys.length; i++) {
      delete newFilters[chainKeys[i]];
    }
    
    setFilters(newFilters);
    setClansList([]);
    setLineagesList([]);
    setSubclansList([]);
    setItems([]);
    setIndependentItems([]);

    if (!value) return;

    if (levelKey === "tribes") {
      loadList("clans", setClansList, `tribeId=${value}`);
      loadIndependent("lineages");
    } else if (levelKey === "clans") {
      loadList("lineages", setLineagesList, `clanId=${value}`);
      loadIndependent("subclans");
    } else if (levelKey === "lineages") {
      loadList("subclans", setSubclansList, `lineageId=${value}`);
      
    }

    const isLast = chainKeys.indexOf(levelKey) === chainKeys.length - 1;
    if (isLast && value) loadItems(value);
  }

  async function loadItems(parentId) {
    setLoading(true);
    try {
      const lastParent = parentChain[parentChain.length - 1];
      const param = getParentApiParam(lastParent.key);
      const url = `/api/${activeTab}?${param}=${parentId}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/${activeTab}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditingItem(null);
    setForm({ name: "", description: "", parent_type: "", parent_id: "", sheikh_name: "", username: "", password_hash: "", branch_password: "" });
    setShowAdd(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      parent_type: "",
      parent_id: "",
      sheikh_name: item.sheikh_name || "",
      username: item.username || "",
      password_hash: "",
      branch_password: item.branch_password || "",
    });
    setShowAdd(true);
  }

  function confirmDelete(itemId) {
    setDeleteTarget(itemId);
  }

  async function executeDelete() {
    const itemId = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/${activeTab}/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("🗑️ تم الحذف بنجاح");
        setTimeout(() => { window.location.reload(); }, 500);
      } else {
        const err = await res.json();
        showToast("❌ " + (err.error || "حدث خطأ"), "error");
      }
    } catch {
      showToast("❌ فشل الاتصال بالخادم", "error");
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast("الاسم مطلوب", "error"); return; }

    const slug = form.name.trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();
    const body = { name: form.name.trim(), slug, description: form.description };

    if (activeTab === "branches") {
      body.sheikh_name = form.sheikh_name;
      body.username = form.username;
      if (form.password_hash) body.password_hash = form.password_hash;
      if (form.branch_password) body.branch_password = form.branch_password;
    }

    if (parentChain.length > 0) {
      const lastParent = parentChain[parentChain.length - 1];
      const lastValue = filters[lastParent.key];
      if (lastValue) {
        const column = getParentDbColumn(lastParent.key);
        body[column] = lastValue;
        
        if (lastParent.key === "tribes" && (activeTab === "lineages" || activeTab === "subclans")) {
          body.tribe_id = lastValue;
        }
      }
    }

    const url = editingItem ? `/api/${activeTab}/${editingItem.id}` : `/api/${activeTab}`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        showToast(editingItem ? "✅ تم التعديل بنجاح" : "✅ تمت الإضافة بنجاح");
        setTimeout(() => { window.location.reload(); }, 500);
      } else {
        const err = await res.json();
        showToast("❌ " + (err.error || "حدث خطأ"), "error");
      }
    } catch {
      showToast("❌ فشل الاتصال بالخادم", "error");
    }
  }

  function openMove(item) {
    setShowMove(item);
    setMoveFilters({});
    setMoveClansList([]);
    setMoveLineagesList([]);
    setMoveSubclansList([]);
    loadList("tribes", setMoveTribesList);
  }

  function handleMoveFilterChange(levelKey, value) {
    const newFilters = { ...moveFilters };
    
    if (value === "__independent__") {
      newFilters[levelKey] = "__independent__";
      setMoveFilters(newFilters);
      setMoveClansList([]);
      setMoveLineagesList([]);
      setMoveSubclansList([]);
      return;
    }
    
    newFilters[levelKey] = value;
    
    const chainKeys = ["tribes", "clans", "lineages", "subclans"];
    const startIndex = chainKeys.indexOf(levelKey);
    for (let i = startIndex + 1; i < chainKeys.length; i++) {
      delete newFilters[chainKeys[i]];
    }
    
    setMoveFilters(newFilters);
    setMoveClansList([]);
    setMoveLineagesList([]);
    setMoveSubclansList([]);

    if (!value) return;

    if (levelKey === "tribes") {
      loadList("clans", setMoveClansList, `tribeId=${value}`);
    } else if (levelKey === "clans") {
      loadList("lineages", setMoveLineagesList, `clanId=${value}`);
    } else if (levelKey === "lineages") {
      loadList("subclans", setMoveSubclansList, `lineageId=${value}`);
    }
  }

  function executeMove() {
    const item = showMove;
    if (!item) return;

    const body = {};
    
    if (activeTab === "clans") {
      body.tribe_id = null;
    } else if (activeTab === "lineages") {
      body.clan_id = null;
      body.tribe_id = null;
    } else if (activeTab === "subclans") {
      body.lineage_id = null;
      body.tribe_id = null;
    } else if (activeTab === "branches") {
      body.subclan_id = null;
    }

    if (moveFilters.subclans && moveFilters.subclans !== "__independent__") {
      body.subclan_id = moveFilters.subclans;
    } else if (moveFilters.lineages && moveFilters.lineages !== "__independent__") {
      body.lineage_id = moveFilters.lineages;
    } else if (moveFilters.clans && moveFilters.clans !== "__independent__") {
      body.clan_id = moveFilters.clans;
    } else if (moveFilters.tribes && moveFilters.tribes !== "__independent__") {
      if (activeTab === "clans") body.tribe_id = moveFilters.tribes;
      if (activeTab === "lineages") body.tribe_id = moveFilters.tribes;
      if (activeTab === "subclans") body.tribe_id = moveFilters.tribes;
    }

    if (moveFilters.lineages === "__independent__" && moveFilters.clans) {
      const clan = moveClansList.find(c => c.id === moveFilters.clans);
      if (clan) body.tribe_id = clan.tribe_id;
    }
    if (moveFilters.clans === "__independent__" && moveFilters.tribes && moveFilters.tribes !== "__independent__") {
      if (activeTab === "lineages") body.tribe_id = moveFilters.tribes;
    }
    if (moveFilters.tribes === "__independent__") {
      if (activeTab === "clans") body.tribe_id = null;
    }

    fetch(`/api/${activeTab}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(res => {
        if (res.ok) {
          showToast("🚚 تم النقل بنجاح");
          setTimeout(() => { window.location.reload(); }, 500);
        } else {
          res.json().then(err => showToast("❌ " + (err.error || "حدث خطأ"), "error"));
        }
      })
      .catch(() => showToast("❌ فشل الاتصال بالخادم", "error"));
  }

  function getParentLabel(item) {
    for (const p of parentChain) {
      const column = getParentDbColumn(p.key);
      const parentId = item[column];
      let list;
      if (p.key === "tribes") list = tribesList;
      else if (p.key === "clans") list = clansList;
      else if (p.key === "lineages") list = lineagesList;
      else list = subclansList;
      const found = list.find(i => i.id === parentId);
      if (found) return `${p.label} ${found.name}`;
    }
    return "—";
  }

  const independentLabel = 
    activeTab === "lineages" ? "🌱 أفخاذ مستقلة" :
    activeTab === "subclans" ? "🍂 عشائر مستقلة" :
    activeTab === "branches" ? "🍃 فروع مستقلة" : "";

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold"
          style={{ background: toast.type === "error" ? "#FEE2E2" : "#DCFCE7", color: toast.type === "error" ? "#991B1B" : "#166534" }}>
          {toast.message}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-heading font-bold text-[#0A1628] mb-2">تأكيد الحذف</h3>
            <p className="text-[#5A6B7F] text-sm mb-6">هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={executeDelete} className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-bold hover:bg-red-600 transition">🗑️ حذف</button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-gray-400 text-white py-3 rounded-xl font-bold hover:bg-gray-500 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="bg-[#F5F0E8] text-[#0A1628] px-3 py-2 rounded-xl text-sm hover:bg-[#B49450]/10 transition">
              ⬅ رجوع
            </Link>
            <h1 className="text-2xl font-heading font-bold text-[#0A1628]">🛡️ إدارة المنصة</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {LEVELS.map(l => (
            <button
              key={l.key}
              onClick={() => setActiveTab(l.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
                activeTab === l.key
                  ? "bg-[#B49450] text-white shadow-lg"
                  : "bg-white text-[#3A4B5F] hover:bg-[#B49450]/10 border border-[#B49450]/15"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {parentChain.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {parentChain.map((level) => {
              let list, value, onChange, disabled;
              
              if (level.key === "tribes") {
                list = tribesList;
                value = filters.tribes || "";
                onChange = (e) => handleFilterChange("tribes", e.target.value);
                disabled = false;
              } else if (level.key === "clans") {
                list = clansList;
                value = filters.clans || "";
                onChange = (e) => handleFilterChange("clans", e.target.value);
                disabled = !filters.tribes;
              } else if (level.key === "lineages") {
                list = lineagesList;
                value = filters.lineages || "";
                onChange = (e) => handleFilterChange("lineages", e.target.value);
                disabled = !filters.clans;
              } else {
                list = subclansList;
                value = filters.subclans || "";
                onChange = (e) => handleFilterChange("subclans", e.target.value);
                disabled = !filters.lineages;
              }

              return (
                <select
                  key={level.key}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  className="px-4 py-3 bg-white rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm disabled:opacity-50"
                >
                  <option value="">-- اختر {level.label} --</option>
                  {list.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              );
            })}
          </div>
        )}

        <button
          onClick={openAdd}
          className="bg-[#4CAF50] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-600 transition mb-6 shadow-lg"
        >
          ➕ إضافة {currentLevel?.label}
        </button>

        {independentItems.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-heading font-bold text-[#B49450] mb-4">{independentLabel}</h2>
            <div className="space-y-3">
              {independentItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-[#B49450]/15 p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{independentLabel.slice(0, 2)}</span>
                    <div>
                      <h3 className="font-heading font-bold text-[#0A1628]">{item.name}</h3>
                      <p className="text-[#3A4B5F] text-[10px]">
                        {item.description && ` • ${item.description}`}
                        {item.sheikh_name && ` • الشيخ: ${item.sheikh_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="bg-[#2196F3] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition">✏️ تعديل</button>
                    <button onClick={() => openMove(item)} className="bg-[#FF9800] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-600 transition">🚚 نقل</button>
                    <button onClick={() => confirmDelete(item.id)} className="bg-[#E53935] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-600 transition">🗑️ حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-[#3A4B5F]">⏳ جاري التحميل...</p>
        ) : items.length === 0 && independentItems.length === 0 ? (
          <p className="text-center text-[#3A4B5F]">لا توجد عناصر بعد</p>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#B49450]/15 p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentLevel?.label.slice(0, 2)}</span>
                  <div>
                    <h3 className="font-heading font-bold text-[#0A1628]">{item.name}</h3>
                    <p className="text-[#3A4B5F] text-[10px]">
                      {activeTab !== "tribes" && `يتبع: ${getParentLabel(item)}`}
                      {item.description && ` • ${item.description}`}
                      {item.sheikh_name && ` • الشيخ: ${item.sheikh_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="bg-[#2196F3] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition">✏️ تعديل</button>
                  {activeTab !== "tribes" && (
                    <button onClick={() => openMove(item)} className="bg-[#FF9800] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-600 transition">🚚 نقل</button>
                  )}
                  <button onClick={() => confirmDelete(item.id)} className="bg-[#E53935] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-600 transition">🗑️ حذف</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-[#0A1628]">
                {editingItem ? "✏️ تعديل" : "➕ إضافة"} {currentLevel?.label}
              </h2>
              <button onClick={() => { setShowAdd(false); setEditingItem(null); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">الاسم *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-1">الوصف</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف مختصر" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
              </div>

              {activeTab === "branches" && (
                <>
                  <div className="border-t border-[#B49450]/10 pt-4 mt-4">
                    <p className="text-xs text-[#B49450] font-bold mb-3">─ معلومات الشيخ ─</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم الشيخ</label>
                    <input type="text" value={form.sheikh_name} onChange={(e) => setForm({ ...form, sheikh_name: e.target.value })} placeholder="فلان بن فلان" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">👤 اسم مستخدم الشيخ</label>
                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="shuyukh" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">🔒 كلمة مرور الشيخ</label>
                    <input type="password" value={form.password_hash} onChange={(e) => setForm({ ...form, password_hash: e.target.value })} placeholder="اترك فارغاً إذا لم ترد تغييرها" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1628] mb-1">🔑 كلمة سر الفرع (للأفراد)</label>
                    <input type="text" value={form.branch_password} onChange={(e) => setForm({ ...form, branch_password: e.target.value })} placeholder="shuyukh2020" className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm" />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-[#4CAF50] text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">💾 حفظ</button>
              <button onClick={() => { setShowAdd(false); setEditingItem(null); }} className="flex-1 bg-gray-400 text-white py-3 rounded-xl font-bold hover:bg-gray-500 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showMove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-[#0A1628]">🚚 نقل: {showMove.name}</h2>
              <button onClick={() => setShowMove(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            <p className="text-sm text-[#5A6B7F] mb-4">اختر الموقع الجديد. يمكنك اختيار "مستقل" ليكون تابعاً مباشرة للمستوى الذي يسبقه.</p>

            <div className="mb-3">
              <label className="block text-xs font-bold text-[#0A1628] mb-1">🦅 القبيلة</label>
              <select
                value={moveFilters.tribes || ""}
                onChange={(e) => handleMoveFilterChange("tribes", e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm"
              >
                <option value="">-- اختر قبيلة --</option>
                <option value="__independent__">📌 مستقل (تحت القبيلة الأم مباشرة)</option>
                {moveTribesList.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {moveFilters.tribes && moveFilters.tribes !== "__independent__" && (
              <div className="mb-3">
                <label className="block text-xs font-bold text-[#0A1628] mb-1">🌿 البطن</label>
                <select
                  value={moveFilters.clans || ""}
                  onChange={(e) => handleMoveFilterChange("clans", e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm"
                >
                  <option value="">-- اختر بطن --</option>
                  <option value="__independent__">📌 مستقل داخل القبيلة</option>
                  {moveClansList.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            {moveFilters.clans && moveFilters.clans !== "__independent__" && (
              <div className="mb-3">
                <label className="block text-xs font-bold text-[#0A1628] mb-1">🌱 الفخذ</label>
                <select
                  value={moveFilters.lineages || ""}
                  onChange={(e) => handleMoveFilterChange("lineages", e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm"
                >
                  <option value="">-- اختر فخذ --</option>
                  <option value="__independent__">📌 مستقل داخل البطن</option>
                  {moveLineagesList.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            {moveFilters.lineages && moveFilters.lineages !== "__independent__" && (
              <div className="mb-3">
                <label className="block text-xs font-bold text-[#0A1628] mb-1">🍂 العشيرة</label>
                <select
                  value={moveFilters.subclans || ""}
                  onChange={(e) => handleMoveFilterChange("subclans", e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-right outline-none border border-[#B49450]/20 focus:border-[#B49450] text-sm"
                >
                  <option value="">-- اختر عشيرة --</option>
                  <option value="__independent__">📌 مستقل داخل الفخذ</option>
                  {moveSubclansList.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={executeMove} className="flex-1 bg-[#FF9800] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition">🚚 تأكيد النقل</button>
              <button onClick={() => setShowMove(null)} className="flex-1 bg-gray-400 text-white py-3 rounded-xl font-bold hover:bg-gray-500 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}