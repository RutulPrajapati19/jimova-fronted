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
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/api/products/${id}`); toast.success("Product removed"); fetchProducts(); }
    catch (err) { toast.error(err.response?.data?.error || "Delete failed"); }
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); };
  const switchTab = (tab) => { setActiveTab(tab); setMenuOpen(false); if (tab === "products") { setEditingId(null); setForm(EMPTY_FORM); } };
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.categoryName || "").toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stockQuantity <= 10).length;

  return (
    <div style={{ minHeight: "100vh", background: "#FCFCFC", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        .ap-nav-btn { background: none; border: none; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; padding: 8px 0; transition: color 0.2s; }
        .ap-nav-btn:hover { color: #C5A059 !important; }

        .ap-logout { background: transparent; border: 1px solid #EAEAEA; color: #AAAAAA; padding: 7px 18px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-logout:hover { border-color: #111; color: #111; }

        .ap-add-btn { background: #111; border: 1px solid #111; color: #FFF; padding: 13px 32px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; }
        .ap-add-btn:hover { background: #C5A059; border-color: #C5A059; color: #111; }

        .ap-table-row { border-bottom: 1px solid #F8F8F8; transition: background 0.15s; }
        .ap-table-row:hover { background: #FAFAFA !important; }
        .ap-table-row:last-child { border-bottom: none; }

        .ap-edit-btn { background: transparent; border: 1px solid #EBEBEB; color: #666; padding: 6px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-edit-btn:hover { border-color: #C5A059; color: #C5A059; background: #FFFDF7; }

        .ap-del-btn { background: transparent; border: 1px solid #EBEBEB; color: #CCCCCC; padding: 6px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-del-btn:hover { border-color: #CC3333; color: #CC3333; background: #FFF8F8; }

        .ap-input { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 12px 14px; outline: none; transition: border-color 0.2s, background 0.2s; }
        .ap-input:focus { border-color: #C5A059; background: #FFFFFF; }
        .ap-input::placeholder { color: #CCCCCC; }

        .ap-select { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 12px 14px; outline: none; transition: border-color 0.2s; appearance: none; cursor: pointer; }
        .ap-select:focus { border-color: #C5A059; background: #FFFFFF; }

        .ap-textarea { width: 100%; background: #FAFAFA; border: 1px solid #EBEBEB; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; padding: 12px 14px; outline: none; resize: vertical; height: 100px; transition: border-color 0.2s; }
        .ap-textarea:focus { border-color: #C5A059; background: #FFFFFF; }
        .ap-textarea::placeholder { color: #CCCCCC; }

        .ap-submit { background: #111; border: 1px solid #111; color: #FFF; padding: 13px 32px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; }
        .ap-submit:hover:not(:disabled) { background: #C5A059; border-color: #C5A059; color: #111; }
        .ap-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .ap-cancel { background: transparent; border: 1px solid #EBEBEB; color: #AAAAAA; padding: 13px 24px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .ap-cancel:hover { border-color: #111; color: #111; }

        .ap-search-wrap { display: flex; align-items: center; background: #FFFFFF; border: 1px solid #EBEBEB; padding: 0 16px; gap: 10px; margin-bottom: 2px; transition: border-color 0.2s; }
        .ap-search-wrap:focus-within { border-color: #111; }
        .ap-search { flex: 1; background: transparent; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; color: #111; padding: 14px 0; }
        .ap-search::placeholder { color: #CCCCCC; }

        .ap-stat-card { background: #FFFFFF; border: 1px solid #EBEBEB; padding: 20px 24px; transition: border-color 0.2s, box-shadow 0.2s; }
        .ap-stat-card:hover { border-color: #C5A059; box-shadow: 0 4px 16px rgba(197,160,89,0.08); }

        @media (max-width: 768px) {
          .ap-desktop-nav { display: none !important; }
          .ap-hamburger { display: flex !important; }
          .ap-form-grid { grid-template-columns: 1fr !important; }
          .ap-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .ap-body { padding: 40px 16px 80px !important; }
        }
        @media (max-width: 480px) {
          .ap-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ zIndex: 999999, marginTop: "80px" }} />

      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.2)" }} onClick={() => setMenuOpen(false)}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "min(300px, 90vw)", height: "100%", background: "#FFFFFF", borderLeft: "1px solid #EAEAEA", padding: "80px 28px 40px", display: "flex", flexDirection: "column", gap: "4px" }} onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 20, right: 20, background: "none", border: "1px solid #EAEAEA", color: "#AAAAAA", width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMenuOpen(false)}>×</button>
            {[{ label: `All Products (${products.length})`, tab: "products" }, { label: editingId ? "Edit Product" : "+ Add Product", tab: "add" }].map(item => (
              <button key={item.tab} onClick={() => switchTab(item.tab)} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: activeTab === item.tab ? "#C5A059" : "#AAAAAA", cursor: "pointer", padding: "16px 0", textAlign: "left", borderBottom: "1px solid #F5F5F5" }}>{item.label}</button>
            ))}
            <button onClick={() => { navigate("/"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#AAAAAA", cursor: "pointer", padding: "16px 0", textAlign: "left", borderBottom: "1px solid #F5F5F5" }}>← View Store</button>
            <button onClick={handleLogout} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#CC3333", cursor: "pointer", padding: "16px 0", textAlign: "left", marginTop: "auto" }}>Log Out</button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 9999, background: "rgba(252,252,252,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #EAEAEA", padding: "0 5%", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "400", color: "#111", cursor: "pointer", flexShrink: 0 }} onClick={() => navigate("/")}>
          Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginLeft: "10px", border: "1px solid rgba(197,160,89,0.4)", padding: "2px 8px", verticalAlign: "middle" }}>Admin</span>
        </div>

        <div className="ap-desktop-nav" style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[{ label: `All Products (${products.length})`, tab: "products" }, { label: editingId ? "Edit Product" : "+ Add Product", tab: "add" }].map(item => (
            <button key={item.tab} className="ap-nav-btn" onClick={() => switchTab(item.tab)} style={{ color: activeTab === item.tab ? "#111" : "#AAAAAA", borderBottom: activeTab === item.tab ? "1px solid #C5A059" : "1px solid transparent" }}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="ap-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button className="ap-nav-btn" style={{ color: "#AAAAAA" }} onClick={() => navigate("/")}>← View Store</button>
          <div style={{ width: 1, height: 14, background: "#EAEAEA" }} />
          <button className="ap-logout" onClick={handleLogout}>Log Out</button>
        </div>

        <button className="ap-hamburger" style={{ display: "none", flexDirection: "column", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "4px" }} onClick={() => setMenuOpen(true)}>
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#111" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#111" }} />
        </button>
      </nav>

      <div className="ap-body" style={{ padding: "56px 5% 100px" }}>

        {/* Add/Edit Form */}
        {activeTab === "add" && (
          <div>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#C5A059", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "20px", height: "1px", background: "#C5A059", display: "inline-block" }} />
                {editingId ? "Edit Product" : "New Product"}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: "400", color: "#111", margin: 0 }}>
                {editingId ? "Update Product" : "Add to Collection"}<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </h1>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "48px", maxWidth: "900px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "2px", background: "linear-gradient(90deg, transparent, #C5A059, transparent)" }} />

              <div className="ap-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Product Name *</label>
                  <input className="ap-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sony WH-1000XM5" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Category *</label>
                  <select className="ap-select" name="categoryId" value={form.categoryId} onChange={handleChange}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Price (₹) *</label>
                  <input className="ap-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 29999" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Stock Quantity</label>
                  <input className="ap-input" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="e.g. 50" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Description</label>
                  <textarea className="ap-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Short product description..." />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>
                    Image URL <span style={{ fontWeight: 400, color: "#CCCCCC", textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>— upload at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: "#C5A059" }}>cloudinary.com</a> then paste URL</span>
                  </label>
                  <input className="ap-input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://res.cloudinary.com/..." />
                  {form.imageUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FAFAFA", border: "1px solid #EBEBEB", padding: "14px", marginTop: "12px" }}>
                      <img src={form.imageUrl} alt="preview" style={{ width: "56px", height: "56px", objectFit: "contain", border: "1px solid #EBEBEB" }} onError={e => e.target.style.display = "none"} />
                      <div style={{ fontSize: 11, color: "#AAAAAA" }}>Preview — if blank, URL may be incorrect</div>
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #EBEBEB", margin: "32px 0 28px" }} />

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="ap-submit" onClick={handleSubmit} disabled={loading}>{loading ? "Saving…" : editingId ? "Update Product" : "Add to Collection"}</button>
                {editingId && <button className="ap-cancel" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setActiveTab("products"); }}>Cancel</button>}
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#C5A059", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "20px", height: "1px", background: "#C5A059", display: "inline-block" }} />
                  Inventory
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: "400", color: "#111", margin: 0 }}>All Products<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span></h1>
              </div>
              <button className="ap-add-btn" onClick={() => switchTab("add")}>+ Add Product</button>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "36px" }}>
              {[
                { label: "Total Products", value: products.length, color: "#C5A059" },
                { label: "Categories", value: categories.length, color: "#111" },
                { label: "Low Stock", value: lowStock, color: lowStock > 0 ? "#CC3333" : "#111" }
              ].map((s, i) => (
                <div key={i} className="ap-stat-card">
                  <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "8px" }}>{s.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="ap-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="ap-search" placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#CCCCCC", cursor: "pointer", fontSize: 16, padding: 4 }}>×</button>}
            </div>

            {/* Table */}
            <div style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", overflowX: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "80px 20px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#111", marginBottom: "10px" }}>{search ? "No results found." : "No products yet."}</div>
                  <div style={{ fontSize: "13px", color: "#AAAAAA" }}>{search ? `No products match "${search}"` : "Click + Add Product to build your collection."}</div>
                </div>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                        {["", "Product", "Category", "Price", "Stock", "Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", fontSize: "9px", fontWeight: "700", color: "#AAAAAA", textTransform: "uppercase", letterSpacing: "1.5px", padding: "14px 20px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} className="ap-table-row">
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ width: "44px", height: "44px", background: "#F5F5F5", border: "1px solid #EBEBEB", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 18 }}>📦</span>}
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: "#111", marginBottom: "3px" }}>{p.name}</div>
                            <div style={{ fontSize: "11px", color: "#AAAAAA" }}>{p.description?.slice(0, 48)}{p.description?.length > 48 ? "…" : ""}</div>
                          </td>
                          <td style={{ padding: "14px 20px" }}><span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#C5A059" }}>{p.categoryName}</span></td>
                          <td style={{ padding: "14px 20px" }}><span style={{ fontSize: "13px", fontWeight: "600", color: "#111", whiteSpace: "nowrap" }}>₹{Number(p.price).toLocaleString("en-IN")}</span></td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: p.stockQuantity > 10 ? "#111" : "#CC3333" }}>
                              {p.stockQuantity}
                              {p.stockQuantity <= 10 && <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginLeft: "5px", color: "#CC3333" }}>Low</span>}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button className="ap-edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                              <button className="ap-del-btn" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: "14px 20px", borderTop: "1px solid #F0F0F0", fontSize: "10px", color: "#AAAAAA", letterSpacing: "1px", textTransform: "uppercase", textAlign: "right" }}>
                    Showing {filtered.length} of {products.length} products
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;