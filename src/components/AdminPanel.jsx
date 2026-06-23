import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_FORM = { name: "", description: "", price: "", stockQuantity: "", categoryId: "", imageUrl: "" };

const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { fetchCategories(); fetchProducts(); }, []);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchCategories = async () => {
    try { const res = await api.get("/api/categories"); setCategories(res.data); }
    catch { toast.error("Failed to load categories"); }
  };

  const fetchProducts = async () => {
    try { const res = await api.get("/api/products?pageSize=200"); setProducts(res.data.content || []); }
    catch { toast.error("Failed to load products"); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) { toast.error("Name, price and category are required"); return; }
    const payload = { name: form.name, description: form.description, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) || 0, categoryId: parseInt(form.categoryId), imageUrl: form.imageUrl || null };
    setLoading(true);
    try {
      if (editingId) { await api.put(`/api/products/${editingId}`, payload); toast.success("Product updated"); }
      else { await api.post("/api/products", payload); toast.success("Product added"); }
      setForm(EMPTY_FORM); setEditingId(null); setActiveTab("products"); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.error || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", price: p.price, stockQuantity: p.stockQuantity, categoryId: p.categoryId, imageUrl: p.imageUrl || "" });
    setActiveTab("add"); setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/api/products/${id}`); toast.success("Product removed"); fetchProducts(); }
    catch (err) { toast.error(err.response?.data?.error || "Delete failed"); }
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); };
  const switchTab = (tab) => { setActiveTab(tab); setMenuOpen(false); if (tab === "products") { setEditingId(null); setForm(EMPTY_FORM); } };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.categoryName || "").toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stockQuantity <= 10).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .ap-root { min-height: 100vh; background: #FCFCFC; font-family: 'Inter', sans-serif; }

        .ap-nav {
          position: sticky; top: 0; z-index: 9999;
          background: rgba(252,252,252,0.97); backdrop-filter: blur(20px);
          border-bottom: 1px solid #EAEAEA; padding: 0 5%;
          height: 64px; display: flex; align-items: center;
          justify-content: space-between; gap: 24px;
        }

        .ap-brand { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: #111; white-space: nowrap; flex-shrink: 0; cursor: pointer; }
        .ap-brand-gold { color: #C5A059; font-style: italic; }
        .ap-brand-badge { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #C5A059; text-transform: uppercase; letter-spacing: 2px; margin-left: 10px; border: 1px solid rgba(197,160,89,0.4); padding: 2px 7px; vertical-align: middle; }

        .ap-nav-tabs { display: flex; gap: 28px; align-items: center; }
        .ap-tab { background: none; border: none; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #AAAAAA; cursor: pointer; padding: 8px 0; position: relative; transition: color 0.2s; white-space: nowrap; }
        .ap-tab::after { content: ''; position: absolute; bottom: 0; left: 0; height: 1px; width: 0; background: #C5A059; transition: width 0.25s ease; }
        .ap-tab.active { color: #111; }
        .ap-tab.active::after { width: 100%; }
        .ap-tab:hover { color: #555; }
        .ap-tab-count { margin-left: 5px; color: #C5A059; }

        .ap-nav-right { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
        .ap-nav-link { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #AAAAAA; cursor: pointer; transition: color 0.2s; white-space: nowrap; background: none; border: none; font-family: 'Inter', sans-serif; }
        .ap-nav-link:hover { color: #C5A059; }
        .ap-logout-btn { background: transparent; border: 1px solid #EAEAEA; color: #999; padding: 7px 18px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-logout-btn:hover { border-color: #111; color: #111; }

        .ap-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .ap-hamburger span { display: block; width: 22px; height: 1.5px; background: #999; transition: all 0.2s; }

        .ap-mobile-overlay { display: none; position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.2); }
        .ap-mobile-overlay.open { display: block; }
        .ap-mobile-panel { position: absolute; top: 0; right: 0; width: min(300px, 90vw); height: 100%; background: #FFFFFF; border-left: 1px solid #EAEAEA; padding: 80px 28px 40px; display: flex; flex-direction: column; gap: 4px; }
        .ap-mobile-close { position: absolute; top: 20px; right: 20px; background: none; border: 1px solid #EAEAEA; color: #999; width: 36px; height: 36px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }
        .ap-mobile-tab { background: none; border: none; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #AAAAAA; cursor: pointer; padding: 14px 0; text-align: left; border-bottom: 1px solid #F5F5F5; transition: color 0.2s; }
        .ap-mobile-tab.active { color: #C5A059; }
        .ap-mobile-tab:hover { color: #111; }

        .ap-body { padding: 56px 5% 100px; }

        .ap-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .ap-eyebrow::before { content: ''; width: 20px; height: 1px; background: #C5A059; }
        .ap-page-title { font-family: 'Playfair Display', serif; font-size: clamp(28px,4vw,42px); font-weight: 400; color: #111; margin: 0; line-height: 1.15; }
        .ap-page-title-gold { color: #C5A059; font-style: italic; }

        .ap-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 36px; }
        .ap-stat { background: #FFFFFF; border: 1px solid #EBEBEB; padding: 24px 28px; transition: border-color 0.3s ease; }
        .ap-stat:hover { border-color: #C5A059; }
        .ap-stat-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #AAAAAA; margin-bottom: 10px; }
        .ap-stat-value { font-family: 'Playfair Display', serif; font-size: 32px; color: #111; }
        .ap-stat-value.gold { color: #C5A059; }
        .ap-stat-value.red { color: #CC3333; }

        .ap-search-wrap { display: flex; align-items: center; background: #FFFFFF; border: 1px solid #EBEBEB; padding: 0 16px; gap: 10px; margin-bottom: 2px; transition: border-color 0.2s; }
        .ap-search-wrap:focus-within { border-color: #111; }
        .ap-search { flex: 1; background: transparent; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; color: #111; padding: 14px 0; letter-spacing: 0.3px; }
        .ap-search::placeholder { color: #CCCCCC; }

        .ap-table-wrap { background: #FFFFFF; border: 1px solid #EBEBEB; overflow-x: auto; }
        .ap-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .ap-table thead tr { border-bottom: 1px solid #F0F0F0; }
        .ap-table th { text-align: left; font-size: 9px; font-weight: 700; color: #AAAAAA; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 20px; }
        .ap-table tbody tr { border-bottom: 1px solid #F8F8F8; transition: background 0.15s; }
        .ap-table tbody tr:last-child { border-bottom: none; }
        .ap-table tbody tr:hover { background: #FAFAFA; }
        .ap-table td { padding: 16px 20px; vertical-align: middle; }

        .ap-product-thumb { width: 48px; height: 48px; background: #F5F5F5; border: 1px solid #EBEBEB; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .ap-product-thumb img { width: 100%; height: 100%; object-fit: contain; }
        .ap-product-name { font-size: 13px; font-weight: 500; color: #111; margin-bottom: 3px; }
        .ap-product-desc { font-size: 11px; color: #AAAAAA; }
        .ap-category-tag { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #C5A059; }
        .ap-price { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; }
        .ap-stock { font-size: 13px; font-weight: 700; }

        .ap-edit-btn { background: transparent; border: 1px solid #EBEBEB; color: #999; padding: 6px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-edit-btn:hover { border-color: #C5A059; color: #C5A059; }
        .ap-del-btn { background: transparent; border: 1px solid #EBEBEB; color: #CCCCCC; padding: 6px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-del-btn:hover { border-color: #CC3333; color: #CC3333; }

        .ap-table-footer { padding: 14px 20px; border-top: 1px solid #F0F0F0; font-size: 10px; color: #AAAAAA; letter-spacing: 1px; text-transform: uppercase; text-align: right; }

        .ap-empty { padding: 80px 20px; text-align: center; }
        .ap-empty h3 { font-family: 'Playfair Display', serif; font-size: 22px; color: #111; font-weight: 400; margin: 0 0 10px; }
        .ap-empty p { font-size: 13px; color: #AAAAAA; margin: 0; }

        .ap-form-card { background: #FFFFFF; border: 1px solid #EBEBEB; padding: 48px; max-width: 900px; position: relative; overflow: hidden; }
        .ap-form-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #C5A059, transparent); }

        .ap-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ap-field-label { display: block; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #AAAAAA; margin-bottom: 10px; }

        .ap-input { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 13px 16px; outline: none; transition: border-color 0.2s; }
        .ap-input:focus { border-color: #111; background: #FFFFFF; }
        .ap-input::placeholder { color: #CCCCCC; }

        .ap-select { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 13px 16px; outline: none; cursor: pointer; transition: border-color 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-color: #FAFAFA; }
        .ap-select:focus { border-color: #111; background-color: #FFFFFF; }
        .ap-select option { background: #FFFFFF; color: #111; }

        .ap-textarea { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 13px 16px; outline: none; resize: vertical; height: 100px; transition: border-color 0.2s; }
        .ap-textarea:focus { border-color: #111; background: #FFFFFF; }
        .ap-textarea::placeholder { color: #CCCCCC; }

        .ap-img-preview { display: flex; align-items: center; gap: 16px; background: #F5F5F5; border: 1px solid #EBEBEB; padding: 16px; margin-top: 12px; }
        .ap-img-preview img { width: 64px; height: 64px; object-fit: contain; border: 1px solid #EBEBEB; background: #FFFFFF; }
        .ap-img-preview-label { font-size: 11px; color: #AAAAAA; letter-spacing: 0.5px; }

        .ap-form-divider { border: none; border-top: 1px solid #EBEBEB; margin: 36px 0 30px; }

        .ap-submit-btn { background: #111; border: 1px solid #111; color: #FFF; padding: 14px 36px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s ease; }
        .ap-submit-btn:hover:not(:disabled) { background: #C5A059; border-color: #C5A059; color: #111; }
        .ap-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .ap-cancel-btn { background: transparent; border: 1px solid #EBEBEB; color: #AAAAAA; padding: 14px 28px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-cancel-btn:hover { border-color: #999; color: #111; }

        @media (max-width: 768px) {
          .ap-nav-tabs { display: none; }
          .ap-nav-right { display: none; }
          .ap-hamburger { display: flex; }
          .ap-stats { grid-template-columns: 1fr 1fr; }
          .ap-form-grid { grid-template-columns: 1fr; }
          .ap-form-card { padding: 28px 20px; }
          .ap-body { padding: 40px 16px 80px; }
        }
        @media (max-width: 480px) { .ap-stats { grid-template-columns: 1fr; } }
      `}</style>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ zIndex: 999999, marginTop: "80px" }} />

      {/* Mobile overlay */}
      <div className={`ap-mobile-overlay${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
        <div className="ap-mobile-panel" onClick={e => e.stopPropagation()}>
          <button className="ap-mobile-close" onClick={() => setMenuOpen(false)}>×</button>
          <button className={`ap-mobile-tab${activeTab === "products" ? " active" : ""}`} onClick={() => switchTab("products")}>All Products <span style={{ color: "#C5A059" }}>({products.length})</span></button>
          <button className={`ap-mobile-tab${activeTab === "add" ? " active" : ""}`} onClick={() => switchTab("add")}>{editingId ? "Edit Product" : "+ Add Product"}</button>
          <button className="ap-mobile-tab" onClick={() => { navigate("/"); setMenuOpen(false); }}>← View Store</button>
          <button className="ap-mobile-tab" style={{ color: "#CC3333", marginTop: "auto" }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="ap-root">
        {/* Navbar */}
        <nav className="ap-nav">
          <div className="ap-brand" onClick={() => navigate("/")}>
            Jimova<span className="ap-brand-gold">.</span>
            <span className="ap-brand-badge">Admin</span>
          </div>
          <div className="ap-nav-tabs">
            <button className={`ap-tab${activeTab === "products" ? " active" : ""}`} onClick={() => switchTab("products")}>All Products <span className="ap-tab-count">({products.length})</span></button>
            <button className={`ap-tab${activeTab === "add" ? " active" : ""}`} onClick={() => switchTab("add")}>{editingId ? "Edit Product" : "+ Add Product"}</button>
          </div>
          <div className="ap-nav-right">
            <button className="ap-nav-link" onClick={() => navigate("/")}>← View Store</button>
            <div style={{ width: 1, height: 16, background: "#EBEBEB" }} />
            <button className="ap-logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
          <button className="ap-hamburger" onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
        </nav>

        <div className="ap-body">

          {/* Add / Edit Form */}
          {activeTab === "add" && (
            <>
              <div style={{ marginBottom: "40px" }}>
                <div className="ap-eyebrow">{editingId ? "Edit Product" : "New Product"}</div>
                <h1 className="ap-page-title">{editingId ? "Update Product" : "Add to Collection"}<span className="ap-page-title-gold">.</span></h1>
              </div>
              <div className="ap-form-card">
                <div className="ap-form-grid">
                  <div>
                    <label className="ap-field-label">Product Name *</label>
                    <input className="ap-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sony WH-1000XM5" />
                  </div>
                  <div>
                    <label className="ap-field-label">Category *</label>
                    <select className="ap-select" name="categoryId" value={form.categoryId} onChange={handleChange}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="ap-field-label">Price (₹) *</label>
                    <input className="ap-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 29999" />
                  </div>
                  <div>
                    <label className="ap-field-label">Stock Quantity</label>
                    <input className="ap-input" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="e.g. 50" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="ap-field-label">Description</label>
                    <textarea className="ap-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Short product description..." />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="ap-field-label">Image URL <span style={{ fontWeight: 400, color: "#CCCCCC", textTransform: "none", letterSpacing: 0 }}>— Upload at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: "#C5A059" }}>cloudinary.com</a> then paste URL</span></label>
                    <input className="ap-input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://res.cloudinary.com/..." />
                    {form.imageUrl && (
                      <div className="ap-img-preview">
                        <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display = "none"} />
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#AAAAAA", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Preview</div>
                          <div className="ap-img-preview-label">If blank, the URL may be incorrect</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="ap-form-divider" />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="ap-submit-btn" onClick={handleSubmit} disabled={loading}>{loading ? "Saving…" : editingId ? "Update Product" : "Add to Collection"}</button>
                  {editingId && <button className="ap-cancel-btn" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setActiveTab("products"); }}>Cancel</button>}
                </div>
              </div>
            </>
          )}

          {/* Product Table */}
          {activeTab === "products" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
                <div>
                  <div className="ap-eyebrow">Inventory</div>
                  <h1 className="ap-page-title">All Products<span className="ap-page-title-gold">.</span></h1>
                </div>
                <button className="ap-submit-btn" onClick={() => switchTab("add")}>+ Add Product</button>
              </div>

              <div className="ap-stats">
                <div className="ap-stat">
                  <div className="ap-stat-label">Total Products</div>
                  <div className="ap-stat-value gold">{products.length}</div>
                </div>
                <div className="ap-stat">
                  <div className="ap-stat-label">Categories</div>
                  <div className="ap-stat-value">{categories.length}</div>
                </div>
                <div className="ap-stat">
                  <div className="ap-stat-label">Low Stock</div>
                  <div className={`ap-stat-value${lowStock > 0 ? " red" : ""}`}>{lowStock}</div>
                </div>
              </div>

              <div className="ap-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="ap-search" placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#CCCCCC", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>}
              </div>

              <div className="ap-table-wrap">
                {filtered.length === 0 ? (
                  <div className="ap-empty">
                    <h3>{search ? "No results found." : "No products yet."}</h3>
                    <p>{search ? `No products match "${search}"` : "Click + Add Product to build your collection."}</p>
                  </div>
                ) : (
                  <>
                    <table className="ap-table">
                      <thead>
                        <tr>{["", "Product", "Category", "Price", "Stock", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filtered.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div className="ap-product-thumb">
                                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 18 }}>📦</span>}
                              </div>
                            </td>
                            <td>
                              <div className="ap-product-name">{p.name}</div>
                              <div className="ap-product-desc">{p.description?.slice(0, 48)}{p.description?.length > 48 ? "…" : ""}</div>
                            </td>
                            <td><span className="ap-category-tag">{p.categoryName}</span></td>
                            <td><span className="ap-price">₹{Number(p.price).toLocaleString("en-IN")}</span></td>
                            <td>
                              <span className="ap-stock" style={{ color: p.stockQuantity > 10 ? "#111" : "#CC3333" }}>
                                {p.stockQuantity}
                                {p.stockQuantity <= 10 && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginLeft: 5, color: "#CC3333" }}>Low</span>}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button className="ap-edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                                <button className="ap-del-btn" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="ap-table-footer">Showing {filtered.length} of {products.length} products</div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPanel;