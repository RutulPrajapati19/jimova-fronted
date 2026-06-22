import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/user/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, mobile: res.data.mobile || "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put("/api/user/profile", form);
      setProfile(res.data);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: profile.name, mobile: profile.mobile || "" });
    setEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return "J";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

        .pp-root {
          min-height: 100vh;
          background: #0A0A0A;
          padding: 100px 20px 60px;
          font-family: 'Inter', sans-serif;
        }

        .pp-container {
          max-width: 680px;
          margin: 0 auto;
        }

        /* ── PAGE HEADER ── */
        .pp-header {
          margin-bottom: 48px;
        }

        .pp-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #C5A059;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .pp-eyebrow::before {
          content: '';
          width: 24px;
          height: 1px;
          background: #C5A059;
        }

        .pp-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #F5F5F0;
          margin: 0;
          line-height: 1.15;
        }

        .pp-title span { color: #C5A059; }

        /* ── AVATAR CARD ── */
        .pp-avatar-card {
          background: #111111;
          border: 1px solid #1E1E1E;
          padding: 36px 40px;
          display: flex;
          align-items: center;
          gap: 28px;
          margin-bottom: 2px;
          position: relative;
          overflow: hidden;
        }

        .pp-avatar-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        .pp-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid #C5A059;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #C5A059;
          flex-shrink: 0;
        }

        .pp-avatar-info {
          flex: 1;
          min-width: 0;
        }

        .pp-avatar-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #F5F5F0;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pp-avatar-email {
          font-size: 13px;
          color: #555555;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #C5A059;
          border: 1px solid rgba(197, 160, 89, 0.3);
          padding: 5px 12px;
          flex-shrink: 0;
        }

        /* ── FIELD CARD ── */
        .pp-card {
          background: #111111;
          border: 1px solid #1E1E1E;
          border-top: none;
          margin-bottom: 2px;
          transition: border-color 0.2s;
        }

        .pp-card:last-of-type {
          margin-bottom: 0;
        }

        .pp-field {
          padding: 24px 40px;
          border-bottom: 1px solid #1A1A1A;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .pp-field:last-child {
          border-bottom: none;
        }

        .pp-field-icon {
          width: 36px;
          height: 36px;
          background: #0D0D0D;
          border: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pp-field-body {
          flex: 1;
          min-width: 0;
        }

        .pp-field-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #444444;
          margin-bottom: 4px;
          display: block;
        }

        .pp-field-value {
          font-size: 15px;
          color: #CCCCCC;
          margin: 0;
          font-weight: 400;
        }

        .pp-field-note {
          font-size: 11px;
          color: #333333;
          margin: 4px 0 0;
          letter-spacing: 0.5px;
        }

        .pp-input {
          width: 100%;
          background: #0A0A0A;
          border: 1px solid #2A2A2A;
          color: #F5F5F0;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .pp-input:focus {
          border-color: #C5A059;
        }

        .pp-input::placeholder {
          color: #333333;
        }

        /* ── ACTIONS ── */
        .pp-actions {
          background: #111111;
          border: 1px solid #1E1E1E;
          border-top: none;
          padding: 28px 40px;
          display: flex;
          gap: 12px;
        }

        .pp-btn-primary {
          flex: 1;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid #C5A059;
          color: #C5A059;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
        }

        .pp-btn-primary:hover:not(:disabled) {
          background: #C5A059;
          color: #0A0A0A;
        }

        .pp-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pp-btn-secondary {
          padding: 14px 24px;
          background: transparent;
          border: 1px solid #222222;
          color: #555555;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
        }

        .pp-btn-secondary:hover {
          border-color: #444444;
          color: #AAAAAA;
        }

        /* ── QUICK LINKS ── */
        .pp-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-top: 2px;
        }

        .pp-link-card {
          background: #111111;
          border: 1px solid #1E1E1E;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
          text-decoration: none;
        }

        .pp-link-card:hover {
          border-color: #2A2A2A;
        }

        .pp-link-card:hover .pp-link-arrow {
          transform: translateX(4px);
          color: #C5A059;
        }

        .pp-link-text {
          flex: 1;
        }

        .pp-link-title {
          font-size: 13px;
          font-weight: 500;
          color: #CCCCCC;
          margin: 0 0 2px;
        }

        .pp-link-sub {
          font-size: 11px;
          color: #444444;
          margin: 0;
        }

        .pp-link-arrow {
          color: #333333;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        /* ── LOADING ── */
        .pp-loading {
          min-height: 100vh;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pp-loading-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #1E1E1E;
          border-top-color: #C5A059;
          animation: pp-spin 1s linear infinite;
        }

        @keyframes pp-spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .pp-root { padding: 80px 16px 40px; }
          .pp-avatar-card { flex-wrap: wrap; gap: 16px; padding: 24px 20px; }
          .pp-badge { align-self: flex-start; }
          .pp-field { padding: 20px 20px; flex-direction: column; align-items: flex-start; gap: 12px; }
          .pp-field-icon { display: none; }
          .pp-actions { flex-direction: column; padding: 20px 20px; }
          .pp-links { grid-template-columns: 1fr; }
          .pp-title { font-size: 28px; }
        }
      `}</style>

      {loading ? (
        <div className="pp-loading">
          <div className="pp-loading-ring" />
        </div>
      ) : (
        <div className="pp-root">
          <div className="pp-container">

            {/* ── HEADER ── */}
            <div className="pp-header">
              <div className="pp-eyebrow">Account</div>
              <h1 className="pp-title">
                My Profile<span>.</span>
              </h1>
            </div>

            {/* ── AVATAR CARD ── */}
            <div className="pp-avatar-card">
              <div className="pp-avatar">{getInitials(profile.name)}</div>
              <div className="pp-avatar-info">
                <p className="pp-avatar-name">{profile.name}</p>
                <p className="pp-avatar-email">{profile.email}</p>
              </div>
              <div className="pp-badge">
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" fill="#C5A059" />
                </svg>
                Member
              </div>
            </div>

            {/* ── FIELDS ── */}
            <div className="pp-card">
              {/* Name */}
              <div className="pp-field">
                <div className="pp-field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="pp-field-body">
                  <span className="pp-field-label">Full Name</span>
                  {editing ? (
                    <input
                      className="pp-input"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="pp-field-value">{profile.name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="pp-field">
                <div className="pp-field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="pp-field-body">
                  <span className="pp-field-label">Email Address</span>
                  <p className="pp-field-value">{profile.email}</p>
                  <p className="pp-field-note">Email address cannot be changed</p>
                </div>
              </div>

              {/* Mobile */}
              <div className="pp-field">
                <div className="pp-field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={editing ? "#C5A059" : "#555555"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div className="pp-field-body">
                  <span className="pp-field-label">Mobile Number</span>
                  {editing ? (
                    <input
                      className="pp-input"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  ) : (
                    <p className="pp-field-value">
                      {profile.mobile || (
                        <span style={{ color: "#333333", fontStyle: "italic" }}>Not set</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── ACTIONS ── */}
            <div className="pp-actions">
              {editing ? (
                <>
                  <button className="pp-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="pp-btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="pp-btn-primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {/* ── QUICK LINKS ── */}
            <div className="pp-links">
              <div className="pp-link-card" onClick={() => navigate("/orders")}>
                <div style={{ width: 36, height: 36, background: "#0D0D0D", border: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className="pp-link-text">
                  <p className="pp-link-title">My Orders</p>
                  <p className="pp-link-sub">View order history</p>
                </div>
                <svg className="pp-link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              <div className="pp-link-card" onClick={() => navigate("/")}>
                <div style={{ width: 36, height: 36, background: "#0D0D0D", border: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="pp-link-text">
                  <p className="pp-link-title">Shop Now</p>
                  <p className="pp-link-sub">Browse collection</p>
                </div>
                <svg className="pp-link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        style={{ zIndex: 999999, marginTop: "80px" }}
      />
    </>
  );
};

export default ProfilePage;