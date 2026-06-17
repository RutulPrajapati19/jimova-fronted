import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  imageUrl: "",
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products?pageSize=200");
      setProducts(res.data.content || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Name, price and category are required");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity) || 0,
      categoryId: parseInt(form.categoryId),
      imageUrl: form.imageUrl || null,
    };
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/api/products", payload);
        toast.success("Product added!");
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setActiveTab("products");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || "",
    });
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }
        .admin-nav-tab {
          background: none; border: none; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer;
          padding: 8px 0; position: relative; transition: color 0.3s ease;
        }
        .admin-nav-tab::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          height: 1px; width: 0%; background: #C5A059;
          transition: width 0.3s ease;
        }
        .admin-nav-tab.active::after { width: 100%; }
        .admin-nav-tab.active { color: #111111 !important; }
        .admin-input {
          width: 100%; border: 1px solid #EAEAEA; border-radius: 0;
          padding: 14px 16px; font-size: 13px; color: #111111;
          background: #FAFAFA; outline: none; box-sizing: border-box;
          font-family: 'Inter', sans-serif; transition: border-color 0.3s ease;
          letter-spacing: 0.3px;
        }
        .admin-input:focus { border-color: #111111; background: #FFFFFF; }
        .admin-label {
          display: block; font-size: 10px; font-weight: 600; color: #999999;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
        }
        .admin-btn-primary {
          background: #111111; color: #FFFFFF; border: 1px solid #111111;
          padding: 14px 32px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer;
          transition: all 0.4s ease; border-radius: 0;
        }
        .admin-btn-primary:hover:not(:disabled) { background: transparent; color: #111111; }
        .admin-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-btn-ghost {
          background: transparent; color: #888888; border: 1px solid #EAEAEA;
          padding: 14px 24px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer;
          transition: all 0.3s ease; border-radius: 0;
        }
        .admin-btn-ghost:hover { border-color: #111111; color: #111111; }
        .admin-product-row { border-bottom: 1px solid #F5F5F5; transition: background 0.2s ease; }
        .admin-product-row:hover { background: #FAFAFA; }
        .admin-action-btn {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; padding: 6px 16px; border-radius: 0; cursor: pointer;
          transition: all 0.3s ease;
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ marginTop: "80px" }} />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        background: "rgba(252,252,252,0.97)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #EAEAEA", position: "sticky", top: 0,
        zIndex: 9999, padding: "0 6%", fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <span className="luxury-serif" style={{ fontSize: "24px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111" }}>
              Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginLeft: "10px", fontStyle: "normal", verticalAlign: "middle" }}>Admin</span>
            </span>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "32px" }}>
              <button
                className={`admin-nav-tab ${activeTab === "products" ? "active" : ""}`}
                style={{ color: activeTab === "products" ? "#111111" : "#999999" }}
                onClick={() => { setActiveTab("products"); setEditingId(null); setForm(EMPTY_FORM); }}
              >
                All Products
                <span style={{ marginLeft: "6px", color: "#C5A059" }}>({products.length})</span>
              </button>
              <button
                className={`admin-nav-tab ${activeTab === "add" ? "active" : ""}`}
                style={{ color: activeTab === "add" ? "#111111" : "#999999" }}
                onClick={() => { setActiveTab("add"); setEditingId(null); setForm(EMPTY_FORM); }}
              >
                {editingId ? "Edit Product" : "+ Add Product"}
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              onClick={() => navigate("/")}
              style={{ fontSize: "11px", fontWeight: "600", color: "#888888", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", transition: "color 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#888888"}
            >
              ← View Store
            </div>
            <div style={{ width: "1px", height: "16px", background: "#EAEAEA" }} />
            <button
              onClick={handleLogout}
              style={{ background: "none", border: "1px solid #EAEAEA", color: "#111111", padding: "8px 20px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.3s ease", borderRadius: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#111111"; e.currentTarget.style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#111111"; }}
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── PAGE BODY ────────────────────────────────────────────────────────── */}
      <div style={{ background: "#FCFCFC", minHeight: "100vh", padding: "60px 6% 120px", fontFamily: "'Inter', sans-serif" }}>

        {/* ── ADD / EDIT FORM ──────────────────────────────────────────────── */}
        {activeTab === "add" && (
          <>
            {/* Section header */}
            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ width: "24px", height: "1px", background: "#C5A059" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>
                  {editingId ? "Edit" : "New"}
                </span>
              </div>
              <h1 className="luxury-serif" style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: "400", color: "#111111", margin: 0, letterSpacing: "-0.5px" }}>
                {editingId ? "Update Product" : "Add Product"}<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </h1>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "48px", maxWidth: "860px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                <div>
                  <label className="admin-label">Product Name *</label>
                  <input className="admin-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sony WH-1000XM5" />
                </div>

                <div>
                  <label className="admin-label">Category *</label>
                  <select className="admin-input" name="categoryId" value={form.categoryId} onChange={handleChange}>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">Price (₹) *</label>
                  <input className="admin-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 29999" />
                </div>

                <div>
                  <label className="admin-label">Stock Quantity</label>
                  <input className="admin-input" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="e.g. 50" />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input" name="description" value={form.description} onChange={handleChange} placeholder="Short product description..." style={{ height: "100px", resize: "vertical" }} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="admin-label">
                    Image URL
                    <span style={{ fontWeight: 400, color: "#BBBBBB", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                      — Upload at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: "#C5A059" }}>cloudinary.com</a> then paste the URL here
                    </span>
                  </label>
                  <input className="admin-input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://res.cloudinary.com/dhapgfgcc/image/upload/..." />
                  {form.imageUrl && (
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, background: "#F8F8F8", padding: "16px", border: "1px solid #EAEAEA" }}>
                      <img src={form.imageUrl} alt="preview" style={{ width: 72, height: 72, objectFit: "contain" }} onError={(e) => (e.target.style.display = "none")} />
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px" }}>Image Preview</div>
                        <div style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>If blank, check the URL is correct</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #EAEAEA", margin: "40px 0 32px" }} />

              <div style={{ display: "flex", gap: "16px" }}>
                <button className="admin-btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Product" : "Add to Collection"}
                </button>
                {editingId && (
                  <button className="admin-btn-ghost" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setActiveTab("products"); }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── PRODUCT TABLE ─────────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <>
            {/* Section header */}
            <div style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "24px", height: "1px", background: "#C5A059" }} />
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Inventory</span>
                </div>
                <h1 className="luxury-serif" style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: "400", color: "#111111", margin: 0, letterSpacing: "-0.5px" }}>
                  All Products<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
                </h1>
              </div>

              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #EAEAEA", background: "#FFFFFF", padding: "4px 4px 4px 16px", minWidth: "300px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  style={{ border: "none", background: "transparent", outline: "none", padding: "10px 12px", fontSize: "12px", color: "#111", width: "100%", letterSpacing: "0.5px" }}
                  placeholder="Search products or categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "100px 20px", border: "1px dashed #E0E0E0", margin: "0" }}>
                  <h3 className="luxury-serif" style={{ fontSize: "24px", fontWeight: "400", color: "#111111" }}>No products found.</h3>
                  <p style={{ color: "#888888", fontSize: "13px", marginTop: "12px" }}>
                    Click <span style={{ color: "#C5A059", fontWeight: 600 }}>+ Add Product</span> to add your first product.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #EAEAEA" }}>
                        {["", "Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                          <th key={h} style={{ textAlign: "left", fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", padding: "16px 20px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.id} className="admin-product-row">
                          <td style={{ padding: "16px 20px", width: "60px" }}>
                            {p.imageUrl
                              ? <div style={{ width: 48, height: 48, background: "#F8F8F8", border: "1px solid #EAEAEA", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                  <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => (e.target.style.display = "none")} />
                                </div>
                              : <div style={{ width: 48, height: 48, background: "#F0F0F0", border: "1px solid #EAEAEA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                            }
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#111", marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#999", letterSpacing: "0.3px" }}>{p.description?.slice(0, 50)}{p.description?.length > 50 ? "…" : ""}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", textTransform: "uppercase", letterSpacing: "1.5px" }}>{p.categoryName}</span>
                          </td>
                          <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: 13, color: "#111", whiteSpace: "nowrap" }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: p.stockQuantity > 10 ? "#111111" : "#CC3333" }}>
                              {p.stockQuantity}
                              {p.stockQuantity <= 10 && <span style={{ fontSize: 9, fontWeight: 600, marginLeft: 4, color: "#CC3333", textTransform: "uppercase", letterSpacing: "1px" }}>Low</span>}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                className="admin-action-btn"
                                onClick={() => handleEdit(p)}
                                style={{ background: "transparent", border: "1px solid #111111", color: "#111111" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#111111"; e.currentTarget.style.color = "#FFFFFF"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111111"; }}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-action-btn"
                                onClick={() => handleDelete(p.id, p.name)}
                                style={{ background: "transparent", border: "1px solid #EAEAEA", color: "#CC3333" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#CC3333"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#EAEAEA"; }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Count footer */}
            <div style={{ marginTop: "24px", textAlign: "right", fontSize: "11px", color: "#BBBBBB", letterSpacing: "1px", textTransform: "uppercase" }}>
              Showing {filtered.length} of {products.length} products
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminPanel;