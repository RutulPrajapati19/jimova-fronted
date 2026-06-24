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
  const navigate  = useNavigate();
  const baseUrl   = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

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
    setEditLoading(true);
    try {
      await api.put("/api/user/profile", { name: editName.trim(), mobile: editMobile.trim() });
    } catch (err) {
      console.warn("Profile API:", err?.response?.status);
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
      if (!results.length) { setShowNoResults(true); return; }
      setShowMobileMenu(false);
      setShowMobileSearch(false);
      navigate("/search-results", { state: { searchData: results } });
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

  useEffect(() => {
    if (!showNoResults) return;
    const t = setTimeout(() => setShowNoResults(false), 3000);
    return () => clearTimeout(t);
  }, [showNoResults]);

  const navTo = (path) => { navigate(path); setShowMobileMenu(false); setShowProfileModal(false); };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "J";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600&family=Inter:wght@300;400;500;600;700&display=swap');

        .jm-nav-link {
          font-size: 10px; font-weight: 700; color: #111111;
          text-transform: uppercase; letter-spacing: 1.5px;
          cursor: pointer; padding: 8px 4px; position: relative;
          transition: color 0.25s ease; white-space: nowrap;
        }
        .jm-nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 50%;
          width: 0; height: 1px; background: #C5A059;
          transition: width 0.25s ease, left 0.25s ease;
        }
        .jm-nav-link:hover { color: #C5A059; }
        .jm-nav-link:hover::after { width: 100%; left: 0; }

        .jm-icon-btn {
          background: none; border: none; cursor: pointer;
          color: #111111; padding: 8px;
          transition: color 0.25s ease;
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
        }
        .jm-icon-btn:hover { color: #C5A059; }

        .jm-search-wrap {
          display: flex; align-items: center;
          background: #FAFAFA; border: 1px solid #E8E8E8;
          transition: border-color 0.25s ease;
        }
        .jm-search-wrap:focus-within { border-color: #C5A059; background: #FFFFFF; }

        .jm-search-input {
          border: none; background: transparent; outline: none;
          flex: 1; padding: 10px 12px; font-size: 12px;
          color: #111111; font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
        }
        .jm-search-input::placeholder { color: #BBBBBB; }

        .jm-search-btn {
          background: #111111; color: #FFFFFF; border: none;
          padding: 10px 20px; font-size: 9px; font-weight: 700;
          cursor: pointer; text-transform: uppercase; letter-spacing: 1.5px;
          transition: background 0.25s ease; white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .jm-search-btn:hover { background: #C5A059; }

        /* hamburger */
        .jm-hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px; background: none; border: none;
        }
        .jm-hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #111111; transition: all 0.3s ease; transform-origin: center;
        }
        .jm-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .jm-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .jm-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* mobile overlay */
        .jm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.25);
          z-index: 9997; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease; backdrop-filter: blur(2px);
        }
        .jm-overlay.open { opacity: 1; pointer-events: auto; }

        /* mobile panel */
        .jm-mobile-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(300px, 85vw);
          background: #FFFFFF; z-index: 9998;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.25,1,0.5,1);
          display: flex; flex-direction: column;
          border-left: 1px solid #EBEBEB;
        }
        .jm-mobile-panel.open { transform: translateX(0); }

        /* profile input */
        .jm-profile-input {
          border: 1px solid #EBEBEB; background: #FAFAFA;
          padding: 11px 14px; font-size: 13px; color: #111;
          outline: none; width: 100%;
          transition: border-color 0.25s, background 0.25s;
          font-family: 'Inter', sans-serif;
        }
        .jm-profile-input:focus { border-color: #C5A059; background: #FFFFFF; }

        /* profile modal */
        .jm-profile-modal {
          position: absolute; top: calc(100% + 8px); right: 24px;
          background: #FFFFFF; border: 1px solid #EBEBEB;
          width: 320px; z-index: 99999;
          box-shadow: 0 24px 56px rgba(0,0,0,0.08);
          animation: jm-modal-in 0.2s ease;
        }
        @keyframes jm-modal-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* gold top accent */
        .jm-profile-modal::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        .jm-profile-modal-inner { padding: 28px; }

        .jm-profile-btn {
          width: 100%; padding: 12px; border: none;
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.25s ease;
        }

        /* no results toast */
        .jm-no-results {
          position: absolute; top: calc(100% + 8px); left: 50%;
          transform: translateX(-50%);
          background: #111111; color: #FFFFFF;
          padding: 11px 24px; font-size: 10px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          display: flex; align-items: center; gap: 10px;
          white-space: nowrap; z-index: 99999;
          animation: jm-modal-in 0.2s ease;
        }

        @media (max-width: 768px) {
          .jm-desktop-only { display: none !important; }
          .jm-mobile-only  { display: flex !important; }
          .jm-hamburger    { display: flex !important; }
        }
        @media (min-width: 769px) {
          .jm-mobile-only { display: none !important; }
          .jm-hamburger   { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "rgba(252,252,252,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #EBEBEB",
        position: "sticky", top: 0, zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.05)" : "none",
        transition: "box-shadow 0.3s ease",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", gap: "24px" }}>

          {/* LOGO */}
          <div onClick={() => navTo("/")} style={{ cursor: "pointer", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111" }}>
              Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </span>
          </div>

          {/* DESKTOP SEARCH */}
          <form className="jm-desktop-only" style={{ flex: 1, maxWidth: "460px" }} onSubmit={handleSearch}>
            <div className="jm-search-wrap">
              <svg style={{ marginLeft: "12px", flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="jm-search-input" type="search" placeholder="Search curations…"
                value={input} onChange={e => { setInput(e.target.value); setShowNoResults(false); }} />
              <button className="jm-search-btn" type="submit">Search</button>
            </div>
          </form>

          {/* DESKTOP NAV LINKS */}
          <div className="jm-desktop-only" style={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
            <span className="jm-nav-link" onClick={() => navTo("/")}>Home</span>
            <span className="jm-nav-link" onClick={() => navTo("/orders")}>Orders</span>

            <div style={{ width: "1px", height: "14px", background: "#E8E8E8" }} />

            {/* PROFILE TRIGGER */}
            {isLoggedIn ? (
              <button
                id="jm-profile-trigger"
                onClick={() => { setShowProfileModal(v => !v); setIsEditing(false); }}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: "#111111", color: "#C5A059",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display', serif", fontSize: "12px", fontWeight: "700",
                  flexShrink: 0,
                }}>
                  {getInitials(userDetails.name)}
                </div>
              </button>
            ) : (
              <span className="jm-nav-link" onClick={() => navTo("/login")}>Sign In</span>
            )}

            {/* BAG */}
            <button className="jm-icon-btn" onClick={() => navTo("/cart")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px" }}>Bag</span>
            </button>
          </div>

          {/* MOBILE RIGHT */}
          <div className="jm-mobile-only" style={{ marginLeft: "auto", alignItems: "center", gap: "4px" }}>
            <button className="jm-icon-btn" onClick={() => setShowMobileSearch(v => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button className={`jm-hamburger ${showMobileMenu ? "open" : ""}`} onClick={() => setShowMobileMenu(v => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

        </div>

        {/* MOBILE SEARCH BAR */}
        {showMobileSearch && (
          <div style={{ padding: "12px 24px 14px", borderTop: "1px solid #F0F0F0", background: "#FCFCFC" }}>
            <form onSubmit={handleSearch}>
              <div className="jm-search-wrap">
                <svg style={{ marginLeft: "12px", flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="jm-search-input" type="search" placeholder="Search curations…"
                  value={input} onChange={e => { setInput(e.target.value); setShowNoResults(false); }} autoFocus />
                <button className="jm-search-btn" type="submit">Go</button>
              </div>
            </form>
          </div>
        )}

        {/* PROFILE MODAL */}
        {showProfileModal && (
          <div id="jm-profile-modal" className="jm-profile-modal">
            <div className="jm-profile-modal-inner">
              {/* Modal header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#111111" }}>
                  Account<span style={{ color: "#C5A059" }}>.</span>
                </span>
                <button onClick={() => { setShowProfileModal(false); setIsEditing(false); }}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#CCCCCC", lineHeight: 1, padding: "2px 4px" }}>
                  &times;
                </button>
              </div>

              {!isLoggedIn ? (
                <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                  <p style={{ color: "#AAAAAA", fontSize: "12px", marginBottom: "20px", lineHeight: 1.6 }}>
                    Sign in to access your account and orders.
                  </p>
                  <button className="jm-profile-btn" onClick={() => { navTo("/login"); setShowProfileModal(false); }}
                    style={{ background: "#111111", color: "#FFFFFF" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#C5A059"}
                    onMouseLeave={e => e.currentTarget.style.background = "#111111"}>
                    Sign In
                  </button>
                </div>
              ) : !isEditing ? (
                <>
                  {/* Avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", padding: "16px", background: "#FAFAFA", border: "1px solid #EBEBEB" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#111111", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>
                      {getInitials(userDetails.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111111", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userDetails.name}</div>
                      <div style={{ fontSize: "11px", color: "#AAAAAA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userDetails.email}</div>
                    </div>
                  </div>

                  {/* Role + Status */}
                  <div style={{ display: "flex", gap: "1px", marginBottom: "20px" }}>
                    {[
                      { label: "Role", value: userDetails.role, color: "#C5A059" },
                      { label: "Status", value: "Active", color: "#5A8F35" },
                    ].map((f, i) => (
                      <div key={i} style={{ flex: 1, padding: "12px 14px", background: "#FAFAFA", border: "1px solid #EBEBEB" }}>
                        <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>{f.label}</div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: f.color, textTransform: "uppercase", letterSpacing: "1px" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button className="jm-profile-btn" onClick={() => setIsEditing(true)}
                      style={{ background: "transparent", color: "#111111", border: "1px solid #EBEBEB" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C5A059"; e.currentTarget.style.color = "#C5A059"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#EBEBEB"; e.currentTarget.style.color = "#111111"; }}>
                      Edit Profile
                    </button>
                    <button className="jm-profile-btn" onClick={() => { navTo("/orders"); setShowProfileModal(false); }}
                      style={{ background: "transparent", color: "#888888", border: "1px solid #EBEBEB" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#AAAAAA"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#EBEBEB"}>
                      View Orders
                    </button>
                    <button className="jm-profile-btn" onClick={handleLogout}
                      style={{ background: "#111111", color: "#FFFFFF", border: "1px solid #111111" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#C5A059"; e.currentTarget.style.borderColor = "#C5A059"; e.currentTarget.style.color = "#111111"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#111111"; e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#FFFFFF"; }}>
                      Secure Log Out
                    </button>
                  </div>
                </>
              ) : (
                /* Edit form */
                <>
                  {[
                    { label: "Full Name", value: editName, setter: setEditName, type: "text", placeholder: "Your full name", readonly: false },
                    { label: "Email", value: userDetails.email, type: "text", readonly: true, note: "Cannot be changed" },
                    { label: "Mobile", value: editMobile, setter: v => setEditMobile(v.replace(/\D/g,"").slice(0,10)), type: "tel", placeholder: "10-digit number", readonly: false },
                  ].map((f, i) => (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "#AAAAAA", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
                        {f.label}
                        {f.note && <span style={{ fontWeight: 400, marginLeft: 6, textTransform: "none", letterSpacing: 0, color: "#CCCCCC" }}>— {f.note}</span>}
                      </div>
                      {f.readonly
                        ? <div style={{ fontSize: "13px", color: "#AAAAAA", padding: "11px 14px", background: "#F5F5F5", border: "1px solid #EBEBEB" }}>{f.value}</div>
                        : <input className="jm-profile-input" type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} />
                      }
                    </div>
                  ))}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <button className="jm-profile-btn" onClick={handleSaveProfile} disabled={editLoading}
                      style={{ background: "#111111", color: "#FFFFFF", border: "none", opacity: editLoading ? 0.5 : 1 }}>
                      {editLoading ? "Saving…" : "Save Changes"}
                    </button>
                    <button className="jm-profile-btn" onClick={() => { setEditName(userDetails.name); setEditMobile(userDetails.mobile); setIsEditing(false); }}
                      style={{ background: "transparent", color: "#888888", border: "1px solid #EBEBEB" }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* NO RESULTS */}
        {showNoResults && (
          <div className="jm-no-results">
            <span style={{ color: "#C5A059" }}>✦</span>
            No curations found for that search.
          </div>
        )}
      </nav>

      {/* MOBILE OVERLAY */}
      <div className={`jm-overlay ${showMobileMenu ? "open" : ""}`} onClick={() => setShowMobileMenu(false)} />

      {/* MOBILE PANEL */}
      <div className={`jm-mobile-panel ${showMobileMenu ? "open" : ""}`}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#111111" }}>
            Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          </span>
          <button className="jm-icon-btn" onClick={() => setShowMobileMenu(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* User info */}
        {isLoggedIn && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", background: "#FAFAFA", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#111111", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                {getInitials(userDetails.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "9px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2px" }}>{userDetails.role}</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userDetails.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {[
            { label: "Home", path: "/", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
            { label: "My Orders", path: "/orders", icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" },
            { label: "My Bag", path: "/cart", icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" },
          ].map((item, i) => (
            <div key={i} onClick={() => navTo(item.path)}
              style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: "#111111", cursor: "pointer", borderBottom: "1px solid #F5F5F5", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FAFAFA"; e.currentTarget.style.color = "#C5A059"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111111"; }}>
              {item.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #F0F0F0", flexShrink: 0 }}>
          {isLoggedIn ? (
            <button onClick={handleLogout}
              style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "15px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background 0.25s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#C5A059"}
              onMouseLeave={e => e.currentTarget.style.background = "#111111"}>
              Secure Log Out
            </button>
          ) : (
            <button onClick={() => navTo("/login")}
              style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "15px 0", width: "100%", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Sign In
            </button>
          )}
          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "9px", color: "#CCCCCC", letterSpacing: "2px", textTransform: "uppercase" }}>
            © 2026 Jimova
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default Navbar;