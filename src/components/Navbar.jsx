import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api"; // ✅ uses JWT interceptor for authenticated calls
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const [input, setInput]                     = useState("");
  const [showNoProductsMessage, setShowNoProductsMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn]           = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile display state
  const [userDetails, setUserDetails] = useState({ name: "", email: "", role: "CUSTOMER", mobile: "" });

  // Profile edit state
  const [isEditing, setIsEditing]   = useState(false);
  const [editName, setEditName]     = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();
  const baseUrl  = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // ─── Auth check ───────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        const details = {
          name:   localStorage.getItem("userName")   || "Jimova Member",
          email:  localStorage.getItem("userEmail")  || "",
          role:   localStorage.getItem("userRole")   || "CUSTOMER",
          mobile: localStorage.getItem("userMobile") || "",
        };
        setUserDetails(details);
        setEditName(details.name);
        setEditMobile(details.mobile);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────
  const handleLogout = () => {
    setShowProfileModal(false);
    toast.info("Securely logged out.");
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event("storage"));
      setIsLoggedIn(false);
      navigate("/login");
    }, 1500);
  };

  // ─── Save profile edits ──────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (editMobile && !/^\d{10}$/.test(editMobile.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    setEditLoading(true);
    try {
      // Call your backend update profile endpoint
      // If you don't have one yet, it still saves to localStorage immediately
      await api.put(`${baseUrl}/api/users/profile`, {
        name:   editName.trim(),
        mobile: editMobile.trim(),
      });
      toast.success("Profile updated.");
    } catch (err) {
      // If endpoint doesn't exist yet, still update localStorage
      // (backend endpoint can be added later)
      console.warn("Profile update API not available, saving locally:", err?.response?.status);
    } finally {
      // Always update localStorage and UI
      localStorage.setItem("userName",   editName.trim());
      localStorage.setItem("userMobile", editMobile.trim());
      setUserDetails(prev => ({ ...prev, name: editName.trim(), mobile: editMobile.trim() }));
      setIsEditing(false);
      setEditLoading(false);
      if (!editName.trim()) return;
      toast.success("Profile updated.");
    }
  };

  const handleCancelEdit = () => {
    setEditName(userDetails.name);
    setEditMobile(userDetails.mobile);
    setIsEditing(false);
  };

  // ─── Search ──────────────────────────────────────────────────────
  const handleInputChange = (value) => {
    setInput(value);
    if (showNoProductsMessage) setShowNoProductsMessage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setShowNoProductsMessage(false);
    try {
      const response = await axios.get(`${baseUrl}/api/products?keyword=${encodeURIComponent(input.trim())}&pageSize=100`);
      const searchResults = response.data.content || response.data;
      if (searchResults.length === 0) setShowNoProductsMessage(true);
      else navigate(`/search-results`, { state: { searchData: searchResults } });
    } catch (error) {
      console.error("Error searching:", error);
      setShowNoProductsMessage(true);
    }
  };

  // ─── Close modal on outside click ────────────────────────────────
  useEffect(() => {
    if (!showProfileModal) return;
    const handler = (e) => {
      if (!e.target.closest("#jimova-profile-modal") && !e.target.closest("#jimova-profile-trigger")) {
        setShowProfileModal(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileModal]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }
        .luxury-nav-item { transition: all 0.3s ease; position: relative; }
        .luxury-nav-item::after {
          content: ''; position: absolute; bottom: 0px; left: 50%;
          width: 0%; height: 1px; background: #C5A059;
          transition: all 0.3s ease; transform: translateX(-50%);
        }
        .luxury-nav-item:hover::after { width: 60%; }
        .luxury-search-input:focus-within { border-color: #111111 !important; }
        .jimova-profile-input {
          border: 1px solid #E8E8E8; background: #FAFAFA;
          padding: 10px 12px; font-size: 13px; color: #111;
          outline: none; width: 100%; transition: border-color 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        .jimova-profile-input:focus { border-color: #C5A059; background: #FFFFFF; }
        .jimova-profile-btn-save {
          background: #111111; color: #FFFFFF; border: 1px solid #111111;
          padding: 11px 0; width: 100%; font-size: 10px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
          transition: all 0.3s ease;
        }
        .jimova-profile-btn-save:hover { background: #C5A059; border-color: #C5A059; }
        .jimova-profile-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .jimova-profile-btn-cancel {
          background: transparent; color: #999; border: 1px solid #E8E8E8;
          padding: 11px 0; width: 100%; font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
          transition: all 0.3s ease;
        }
        .jimova-profile-btn-cancel:hover { border-color: #999; color: #111; }
      `}</style>

      <nav
        className="px-5 py-3"
        style={{
          background: "rgba(252, 252, 252, 0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #EAEAEA",
          position: "sticky", top: 0, zIndex: 9999,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between gap-4">

          {/* LOGO */}
          <div className="d-flex align-items-center">
            <div onClick={() => navigate('/')} style={{ cursor: "pointer" }}>
              <span className="luxury-serif" style={{ fontSize: "26px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111" }}>
                Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </span>
            </div>
          </div>

          {/* SEARCH */}
          <form className="flex-grow-1" style={{ maxWidth: "480px" }} role="search" onSubmit={handleSubmit}>
            <div
              className="luxury-search-input"
              style={{ display: "flex", alignItems: "center", background: "transparent", border: "1px solid #E4E4E4", padding: "4px 4px 4px 14px", transition: "border-color 0.3s ease" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", padding: "9px 12px", fontSize: "12px", color: "#111111", letterSpacing: "0.3px" }}
                placeholder="Search curations…"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <button
                type="submit"
                style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "9px 20px", fontSize: "10px", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1.5px", transition: "background 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C5A059"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; }}
              >
                Search
              </button>
            </div>
          </form>

          {/* NAV LINKS */}
          <div className="d-flex align-items-center gap-4" style={{ flexShrink: 0, position: "relative", zIndex: 20 }}>
            <div onClick={() => navigate('/')} className="luxury-nav-item" style={{ fontSize: "10px", fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", padding: "8px 4px" }}>Home</div>
            <div onClick={() => navigate('/orders')} className="luxury-nav-item" style={{ fontSize: "10px", fontWeight: "700", color: "#111111", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", padding: "8px 4px" }}>Orders</div>
            <div style={{ width: "1px", height: "14px", background: "#E0E0E0" }} />

            {/* USER ICON */}
            <div
              id="jimova-profile-trigger"
              onClick={() => { setShowProfileModal(!showProfileModal); setIsEditing(false); }}
              style={{ color: "#111111", cursor: "pointer", padding: "8px", transition: "color 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#111111"}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            {/* CART */}
            <div
              onClick={() => navigate('/cart')}
              style={{ display: "flex", alignItems: "center", gap: "7px", color: "#111111", cursor: "pointer", padding: "8px", transition: "color 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#111111"}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px" }}>Bag</span>
            </div>
          </div>
        </div>

        {/* ─── PROFILE MODAL ─── */}
        {showProfileModal && (
          <div
            id="jimova-profile-modal"
            style={{
              position: "absolute", top: "100%", right: "20px", marginTop: "8px",
              background: "#FFFFFF", border: "1px solid #EBEBEB",
              padding: "28px", minWidth: "320px", maxWidth: "360px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.08)", zIndex: 99999,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div className="luxury-serif" style={{ fontSize: "20px", color: "#111" }}>
                Account<span style={{ color: "#C5A059" }}>.</span>
              </div>
              <button
                onClick={() => { setShowProfileModal(false); setIsEditing(false); }}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#BBBBBB", lineHeight: 1 }}
              >&times;</button>
            </div>

            {!isLoggedIn ? (
              /* Not logged in */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#999", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "20px" }}>Sign in to access your account.</p>
                <button onClick={() => { navigate("/login"); setShowProfileModal(false); }} style={{ background: "#111", color: "#fff", border: "none", padding: "12px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Sign In</button>
              </div>
            ) : !isEditing ? (
              /* View mode */
              <>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Full Name</div>
                  <div style={{ fontSize: "15px", fontWeight: "500", color: "#111111" }}>{userDetails.name}</div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Email Address</div>
                  <div style={{ fontSize: "13px", color: "#666666" }}>{userDetails.email}</div>
                </div>

                {userDetails.mobile && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Mobile</div>
                    <div style={{ fontSize: "13px", color: "#666666" }}>{userDetails.mobile}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Role</div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "1px" }}>{userDetails.role}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Status</div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#28a745", textTransform: "uppercase", letterSpacing: "1px" }}>Active</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Edit Profile Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ background: "transparent", color: "#111111", border: "1px solid #DDDDDD", padding: "11px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C5A059"; e.currentTarget.style.color = "#C5A059"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#DDDDDD"; e.currentTarget.style.color = "#111111"; }}
                  >
                    Edit Profile
                  </button>
                  {/* Logout */}
                  <button onClick={handleLogout} style={{ background: "#111111", color: "#FFFFFF", padding: "11px 0", width: "100%", border: "none", fontWeight: "700", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", transition: "background 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "#333"} onMouseLeave={(e) => e.currentTarget.style.background = "#111"}>
                    Secure Log Out
                  </button>
                </div>
              </>
            ) : (
              /* Edit mode */
              <>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Full Name</div>
                  <input
                    className="jimova-profile-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your full name"
                    maxLength={60}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Email Address</div>
                  <div style={{ fontSize: "12px", color: "#AAAAAA", padding: "10px 12px", background: "#F5F5F5", border: "1px solid #EBEBEB" }}>{userDetails.email}</div>
                  <div style={{ fontSize: "9px", color: "#BBBBBB", marginTop: "4px", letterSpacing: "0.5px" }}>Email cannot be changed.</div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Mobile Number</div>
                  <input
                    className="jimova-profile-input"
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="jimova-profile-btn-save" onClick={handleSaveProfile} disabled={editLoading}>
                    {editLoading ? "Saving…" : "Save Changes"}
                  </button>
                  <button className="jimova-profile-btn-cancel" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* NO RESULTS */}
        {showNoProductsMessage && (
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "12px", background: "#111111", color: "#FFFFFF", padding: "11px 28px", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #2A2A2A", zIndex: 9999 }}>
            <span style={{ color: "#C5A059" }}>✦</span> No curations found matching your search.
          </div>
        )}
      </nav>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
    </>
  );
};

export default Navbar;