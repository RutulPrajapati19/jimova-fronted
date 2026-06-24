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
      <div style={{ color: "red", fontSize: "20px", padding: "20px" }}>ADMIN PANEL LOADED</div>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ zIndex: 999999, marginTop: "80px" }} />

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 9999, background: "rgba(252,252,252,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #EAEAEA", padding: "0 5%", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "400", color: "#111", cursor: "pointer" }} onClick={() => navigate("/")}>
          Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginLeft: "10px", border: "1px solid rgba(197,160,89,0.4)", padding: "2px 8px", verticalAlign: "middle" }}>Admin</span>
        </div>

        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {["products", "add"].map(tab => (
            <button key={tab} onClick={() => switchTab(tab)} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: activeTab === tab ? "#111" : "#AAAAAA", cursor: "pointer", padding: "8px 0", borderBottom: activeTab === tab ? "1px solid #C5A059" : "1px solid transparent", transition: "all 0.2s" }}>
              {tab === "products" ? `All Products (${products.length})` : editingId ? "Edit Product" : "+ Add Product"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#AAAAAA", cursor: "pointer", transition: "color 0.2s" }}>← View Store</button>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #EAEAEA", color: "#AAAAAA", padding: "7px 18px", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}>Log Out</button>
        </div>
      </nav>

      <div style={{ padding: "56px 5% 100px" }}>

        {/* Add/Edit Form */}
        {activeTab === "add" && (
          <div>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#C5A059", marginBottom: "12px" }}>{editingId ? "Edit Product" : "New Product"}</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: "400", color: "#111", margin: 0 }}>{editingId ? "Update Product" : "Add to Collection"}<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span></h1>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "48px", maxWidth: "900px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "2px", background: "linear-gradient(90deg, transparent, #C5A059, transparent)" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sony WH-1000XM5" style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Category *</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none" }}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Price (₹) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 29999" style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Stock Quantity</label>
                  <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="e.g. 50" style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short product description..." style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none", resize: "vertical", height: "100px" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "10px" }}>
                    Image URL <span style={{ fontWeight: 400, color: "#CCCCCC", textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>— upload at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: "#C5A059" }}>cloudinary.com</a> then paste URL</span>
                  </label>
                  <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://res.cloudinary.com/..." style={{ width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: "13px", padding: "12px 14px", outline: "none" }} />
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
                <button onClick={handleSubmit} disabled={loading} style={{ background: "#111", border: "1px solid #111", color: "#FFF", padding: "13px 32px", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", opacity: loading ? 0.4 : 1 }}>
                  {loading ? "Saving…" : editingId ? "Update Product" : "Add to Collection"}
                </button>
                {editingId && (
                  <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setActiveTab("products"); }} style={{ background: "transparent", border: "1px solid #EBEBEB", color: "#AAAAAA", padding: "13px 24px", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Cancel</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#C5A059", marginBottom: "12px" }}>Inventory</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: "400", color: "#111", margin: 0 }}>All Products<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span></h1>
              </div>
              <button onClick={() => switchTab("add")} style={{ background: "#111", border: "1px solid #111", color: "#FFF", padding: "13px 32px", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>+ Add Product</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "36px" }}>
              {[{ label: "Total Products", value: products.length, color: "#C5A059" }, { label: "Categories", value: categories.length, color: "#111" }, { label: "Low Stock", value: lowStock, color: lowStock > 0 ? "#CC3333" : "#111" }].map((s, i) => (
                <div key={i} style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "20px 24px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#AAAAAA", marginBottom: "8px" }}>{s.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "0 16px", gap: "10px", marginBottom: "2px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#111", padding: "14px 0" }} />
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
                      <tr key={p.id} style={{ borderBottom: "1px solid #F8F8F8" }}>
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
                        <td style={{ padding: "14px 20px" }}><span style={{ fontSize: "13px", fontWeight: "700", color: p.stockQuantity > 10 ? "#111" : "#CC3333" }}>{p.stockQuantity}{p.stockQuantity <= 10 && <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginLeft: "5px", color: "#CC3333" }}>Low</span>}</span></td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleEdit(p)} style={{ background: "transparent", border: "1px solid #EBEBEB", color: "#666", padding: "6px 14px", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Edit</button>
                            <button onClick={() => handleDelete(p.id, p.name)} style={{ background: "transparent", border: "1px solid #EBEBEB", color: "#CCCCCC", padding: "6px 14px", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ padding: "14px 20px", borderTop: "1px solid #F0F0F0", fontSize: "10px", color: "#AAAAAA", letterSpacing: "1px", textTransform: "uppercase", textAlign: "right" }}>
                Showing {filtered.length} of {products.length} products
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;