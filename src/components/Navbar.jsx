import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const [input, setInput]                       = useState("");
  const [showNoResults, setShowNoResults]       = useState(false);
  const [isLoggedIn, setIsLoggedIn]             = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu]     = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const [userDetails, setUserDetails] = useState({ name: "", email: "", role: "CUSTOMER", mobile: "" });
  const [isEditing, setIsEditing]     = useState(false);
  const [editName, setEditName]       = useState("");
  const [editMobile, setEditMobile]   = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();
  const baseUrl  = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        const d = {
          name:   localStorage.getItem("userName")   || "Jimova Member",
          email:  localStorage.getItem("userEmail")  || "",
          role:   localStorage.getItem("userRole")   || "CUSTOMER",
          mobile: localStorage.getItem("userMobile") || "",
        };
        setUserDetails(d);
        setEditName(d.name);
        setEditMobile(d.mobile);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showMobileMenu]);

  const handleLogout = () => {
    setShowProfileModal(false);
    setShowMobileMenu(false);
    toast.info("Securely logged out.");
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event("storage"));
      setIsLoggedIn(false);
      navigate("/login");
    }, 1200);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { toast.error("Name cannot be empty."); return; }
    if (editMobile && !/^\d{10}$/.test(editMobile.trim())) { toast.error("Enter a valid 10-digit mobile number."); return; }
    setEditLoading(true);
    try {
      await api.put(`${baseUrl}/api/users/profile`, { name: editName.trim(), mobile: editMobile.trim() });
    } catch (err) {
      console.warn("Profile API not available:", err?.response?.status);
    } finally {
      localStorage.setItem("userName",   editName.trim());
      localStorage.setItem("userMobile", editMobile.trim());
      setUserDetails(prev => ({ ...prev, name: editName.trim(), mobile: editMobile.trim() }));
      setIsEditing(false);
      setEditLoading(false);
      toast.success("Profile updated.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowNoResults(false);
    try {
      const res = await axios.get(`${baseUrl}/api/products?keyword=${encodeURIComponent(input.trim())}&pageSize=100`);
      const results = res.data.content || res.data;
      if (results.length === 0) setShowNoResults(true);
      else {
        setShowMobileMenu(false);
        setShowMobileSearch(false);
        navigate("/search-results", { state: { searchData: results } });
      }
    } catch {
      setShowNoResults(true);
    }
  };

  useEffect(() => {
    if (!showProfileModal) return;
    const handler = (e) => {
      if (!e.target.closest("#jm-profile-modal") && !e.target.closest("#jm-profile-trigger")) {
        setShowProfileModal(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileModal]);

  const navTo = (path) => { navigate(path); setShowMobileMenu(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600&family=Inter:wght@300;400;500;600;700&display=swap');

        .jm-nav-link {
          font-size: 10px; font-weight: 700; color: #111111;
          text-transform: uppercase; letter-spacing: 1.5px;
          cursor: pointer; padding: 8px 4px; position: relative;
          transition: color 0.3s ease;
        }
        .jm-nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 50%;
          width: 0; height: 1px; background: #C5A059;
          transition: width 0.3s ease, left 0.3s ease;
        }
        .jm-nav-link:hover { color: #C5A059; }
        .jm-nav-link:hover::after { width: 100%; left: 0; }

        .jm-icon-btn {
          background: none; border: none; cursor: pointer;
          color: #111111; padding: 8px; transition: color 0.3s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .jm-icon-btn:hover { color: #C5A059; }

        .jm-search-wrap { display: flex; align-items: center; background: transparent; border: 1px solid #E4E4E4; transition: border-color 0.3s ease; }
        .jm-search-wrap:focus-within { border-color: #111111; }
        .jm-search-input { border: none; background: transparent; outline: none; flex: 1; padding: 9px 12px; font-size: 12px; color: #111111; font-family: 'Inter', sans-serif; letter-spacing: 0.3px; }
        .jm-search-input::placeholder { color: #AAAAAA; }
        .jm-search-btn {
          background: #111111; color: #FFFFFF; border: none;
          padding: 9px 18px; font-size: 10px; font-weight: 700;
          cursor: pointer; text-transform: uppercase; letter-spacing: 1.5px;
          transition: background 0.3s ease; white-space: nowrap;
        }
        .jm-search-btn:hover { background: #C5A059; }

        .jm-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
        .jm-hamburger span { display: block; width: 22px; height: 1.5px; background: #111111; transition: all 0.3s ease; transform-origin: center; }
        .jm-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .jm-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .jm-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .jm-mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          z-index: 9997; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .jm-mobile-overlay.open { opacity: 1; pointer-events: auto; }

        .jm-mobile-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 85vw);
          background: #FFFFFF; z-index: 9998;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.25,1,0.5,1);
          display: flex; flex-direction: column;
          overflow-y: auto;
        }
        .jm-mobile-menu.open { transform: translateX(0); }

        .jm-profile-input {
          border: 1px solid #E8E8E8; background: #FAFAFA;
          padding: 10px 12px; font-size: 13px; color: #111;
          outline: none; width: 100%; transition: border-color 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        .jm-profile-input:focus { border-color: #C5A059; background: #FFFFFF; }

        @media (max-width: 768px) {
          .jm-desktop-search { display: none !important; }
          .jm-desktop-links  { display: none !important; }
          .jm-hamburger      { display: flex !important; }
        }
        @media (min-width: 769px) {
          .jm-hamburger { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: scrolled ? "rgba(252,252,252,0.98)" : "rgba(252,252,252,0.96)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #EAEAEA",
        position: "sticky", top: 0, zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
        transition: "box-shadow 0.3s ease",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.04)" : "none",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: "24px", height: "64px" }}>

          {/* LOGO */}
          <div onClick={() => navTo("/")} style={{ cursor: "pointer", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111" }}>
              Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </span>
          </div>

          {/* DESKTOP SEARCH */}
          <form className="jm-desktop-search" style={{ flex: 1, maxWidth: "480px" }} onSubmit={handleSearch}>
            <div className="jm-search-wrap">
              <svg style={{ marginLeft: "12px", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="jm-search-input" type="search" placeholder="Search curations…" value={input} onChange={e => { setInput(e.target.value); setShowNoResults(false); }} />
              <button className="jm-search-btn" type="submit">Search</button>
            </div>
          </form>

          {/* DESKTOP LINKS */}
          <div className="jm-desktop-links" style={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
            <span className="jm-nav-link" onClick={() => navTo("/")}>Home</span>
            <span className="jm-nav-link" onClick={() => navTo("/orders")}>Orders</span>
            <div style={{ width: "1px", height: "14px", background: "#E0E0E0" }} />

            {/* PROFILE */}
            <button id="jm-profile-trigger" className="jm-icon-btn" onClick={() => { setShowProfileModal(v => !v); setIsEditing(false); }} title="Account">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {/* CART */}
            <button className="jm-icon-btn" onClick={() => navTo("/cart")} title="Bag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px" }}>Bag</span>
            </button>
          </div>

          {/* MOBILE RIGHT */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Mobile search toggle */}
            <button className="jm-icon-btn jm-hamburger" style={{ flexDirection: "row", gap: 0 }} onClick={() => setShowMobileSearch(v => !v)} title="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            {/* Hamburger */}
            <button className={`jm-hamburger ${showMobileMenu ? "open" : ""}`} onClick={() => setShowMobileMenu(v => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        {showMobileSearch && (
          <div style={{ padding: "0 24px 12px", borderTop: "1px solid #F0F0F0" }}>
            <form onSubmit={handleSearch}>
              <div className="jm-search-wrap">
                <svg style={{ marginLeft: "12px", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="jm-search-input" type="search" placeholder="Search curations…" value={input} onChange={e => { setInput(e.target.value); setShowNoResults(false); }} autoFocus />
                <button className="jm-search-btn" type="submit">Go</button>
              </div>
            </form>
          </div>
        )}

        {/* PROFILE MODAL (desktop) */}
        {showProfileModal && (
          <div id="jm-profile-modal" style={{
            position: "absolute", top: "100%", right: "24px", marginTop: "8px",
            background: "#FFFFFF", border: "1px solid #EBEBEB",
            padding: "28px", width: "340px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.08)", zIndex: 99999,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#111" }}>
                Account<span style={{ color: "#C5A059" }}>.</span>
              </span>
              <button onClick={() => { setShowProfileModal(false); setIsEditing(false); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#BBBBBB", lineHeight: 1, padding: "0 4px" }}>&times;</button>
            </div>

            {!isLoggedIn ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>Sign in to access your account.</p>
                <button onClick={() => { navTo("/login"); setShowProfileModal(false); }} style={{ background: "#111", color: "#fff", border: "none", padding: "13px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Sign In</button>
              </div>
            ) : !isEditing ? (
              <>
                {[
                  { label: "Full Name", value: userDetails.name, size: "15px", weight: "500", color: "#111" },
                  { label: "Email Address", value: userDetails.email, size: "13px", weight: "400", color: "#666" },
                  ...(userDetails.mobile ? [{ label: "Mobile", value: userDetails.mobile, size: "13px", weight: "400", color: "#666" }] : []),
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>{f.label}</div>
                    <div style={{ fontSize: f.size, fontWeight: f.weight, color: f.color }}>{f.value}</div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
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
                  <button onClick={() => setIsEditing(true)} style={{ background: "transparent", color: "#111", border: "1px solid #DDD", padding: "12px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#C5A059"; e.currentTarget.style.color = "#C5A059"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#DDD"; e.currentTarget.style.color = "#111"; }}>
                    Edit Profile
                  </button>
                  <button onClick={handleLogout} style={{ background: "#111", color: "#FFF", border: "none", padding: "12px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "background 0.3s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#C5A059"}
                    onMouseLeave={e => e.currentTarget.style.background = "#111"}>
                    Secure Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {[
                  { label: "Full Name", value: editName, setter: setEditName, type: "text", placeholder: "Your full name", note: null, readonly: false },
                  { label: "Email Address", value: userDetails.email, setter: null, type: "text", placeholder: "", note: "Email cannot be changed.", readonly: true },
                  { label: "Mobile Number", value: editMobile, setter: v => setEditMobile(v.replace(/\D/g,"").slice(0,10)), type: "tel", placeholder: "10-digit mobile", note: null, readonly: false },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>{f.label}</div>
                    {f.readonly
                      ? <div style={{ fontSize: "12px", color: "#AAAAAA", padding: "10px 12px", background: "#F5F5F5", border: "1px solid #EBEBEB" }}>{f.value}</div>
                      : <input className="jm-profile-input" type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} />
                    }
                    {f.note && <div style={{ fontSize: "9px", color: "#BBBBBB", marginTop: "4px" }}>{f.note}</div>}
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                  <button onClick={handleSaveProfile} disabled={editLoading} style={{ background: "#111", color: "#FFF", border: "1px solid #111", padding: "12px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", cursor: editLoading ? "not-allowed" : "pointer", opacity: editLoading ? 0.5 : 1, transition: "all 0.3s ease" }}>
                    {editLoading ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditName(userDetails.name); setEditMobile(userDetails.mobile); setIsEditing(false); }} style={{ background: "transparent", color: "#999", border: "1px solid #E8E8E8", padding: "12px 0", width: "100%", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* NO RESULTS */}
        {showNoResults && (
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px", background: "#111111", color: "#FFFFFF", padding: "11px 28px", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999 }}>
            <span style={{ color: "#C5A059" }}>✦</span> No curations found.
          </div>
        )}
      </nav>

      {/* MOBILE OVERLAY */}
      <div className={`jm-mobile-overlay ${showMobileMenu ? "open" : ""}`} onClick={() => setShowMobileMenu(false)} />

      {/* MOBILE SLIDE MENU */}
      <div className={`jm-mobile-menu ${showMobileMenu ? "open" : ""}`}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #F0F0F0" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#111" }}>
            Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          </span>
          <button className="jm-icon-btn" onClick={() => setShowMobileMenu(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* User info */}
        {isLoggedIn && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>{userDetails.role}</div>
            <div style={{ fontSize: "16px", fontWeight: "500", color: "#111", marginBottom: "2px" }}>{userDetails.name}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>{userDetails.email}</div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ padding: "16px 0" }}>
          {[
            { label: "Home", path: "/" },
            { label: "Orders", path: "/orders" },
            { label: "Bag", path: "/cart" },
          ].map((item, i) => (
            <div key={i} onClick={() => navTo(item.path)} style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: "#111", cursor: "pointer", borderBottom: "1px solid #F8F8F8", transition: "all 0.2s ease", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F8F8F8"; e.currentTarget.style.color = "#C5A059"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111"; }}>
              {item.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid #F0F0F0" }}>
          {isLoggedIn ? (
            <button onClick={handleLogout} style={{ background: "#111", color: "#FFF", border: "none", padding: "14px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
              Secure Log Out
            </button>
          ) : (
            <button onClick={() => navTo("/login")} style={{ background: "#111", color: "#FFF", border: "none", padding: "14px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
              Sign In
            </button>
          )}
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "9px", color: "#CCCCCC", letterSpacing: "2px", textTransform: "uppercase" }}>© 2026 Jimova</div>
        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default Navbar;