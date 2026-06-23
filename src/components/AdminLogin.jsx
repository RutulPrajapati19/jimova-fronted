import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.password)     e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      const { token, role, email, name } = res.data;
      if (role !== "ADMIN") {
        toast.error("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name || email.split("@")[0]);
      window.dispatchEvent(new Event("storage"));
      toast.success("Welcome back, Admin.");
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .al-root {
          min-height: 100vh;
          background: #FCFCFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        /* subtle grid texture */
        .al-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(#EBEBEB 1px, transparent 1px),
            linear-gradient(90deg, #EBEBEB 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        .al-wrap {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
        }

        /* ── BRAND ── */
        .al-brand {
          text-align: center;
          margin-bottom: 44px;
        }

        .al-logo {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: -0.5px;
          color: #111111;
          cursor: pointer;
          display: inline-block;
          margin-bottom: 24px;
          transition: opacity 0.2s;
        }
        .al-logo:hover { opacity: 0.75; }
        .al-logo em { color: #C5A059; font-style: italic; }

        .al-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .al-eyebrow-line { width: 24px; height: 1px; background: #C5A059; }
        .al-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #C5A059;
        }

        .al-title {
          font-family: 'Playfair Display', serif;
          font-size: 38px; font-weight: 400;
          color: #111111; margin: 0 0 10px;
          letter-spacing: -0.5px; line-height: 1.1;
        }
        .al-title em { color: #C5A059; font-style: italic; }

        .al-subtitle {
          font-size: 12px; font-weight: 300;
          color: #999999; letter-spacing: 0.3px;
          margin: 0;
        }

        /* ── CARD ── */
        .al-card {
          background: #FFFFFF;
          border: 1px solid #EBEBEB;
          padding: 48px 44px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }

        /* gold top rule */
        .al-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        /* ── FIELD ── */
        .al-field { margin-bottom: 24px; }
        .al-field:last-of-type { margin-bottom: 36px; }

        .al-label {
          display: block;
          font-size: 9px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #AAAAAA; margin-bottom: 10px;
        }

        .al-input-wrap {
          position: relative;
        }

        .al-input {
          width: 100%;
          padding: 15px 16px;
          border: 1px solid #EBEBEB;
          background: #FAFAFA;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #111111;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
          letter-spacing: 0.3px;
        }
        .al-input:focus {
          border-color: #C5A059;
          background: #FFFFFF;
        }
        .al-input.error { border-color: #CC4444; }
        .al-input.password-input { padding-right: 48px; letter-spacing: 2px; }
        .al-input.password-input::placeholder { letter-spacing: 1px; }

        .al-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #CCCCCC;
          display: flex; align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .al-eye:hover { color: #888888; }

        .al-error {
          font-size: 11px; color: #CC4444;
          margin-top: 6px; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── SUBMIT ── */
        .al-btn {
          width: 100%;
          padding: 17px 24px;
          background: #111111;
          color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          cursor: pointer;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }
        .al-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: #C5A059;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1);
          z-index: 0;
        }
        .al-btn:hover:not(:disabled)::after { transform: scaleX(1); }
        .al-btn:hover:not(:disabled) { color: #111111; border-color: #C5A059; }
        .al-btn span { position: relative; z-index: 1; }
        .al-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── FOOTER ── */
        .al-card-footer {
          border-top: 1px solid #EBEBEB;
          margin-top: 32px;
          padding-top: 24px;
          text-align: center;
        }

        .al-back {
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #AAAAAA; cursor: pointer;
          background: none; border: none;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .al-back:hover { color: #C5A059; }

        /* ── SECURITY BADGE ── */
        .al-badge {
          text-align: center;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .al-badge-line { width: 20px; height: 1px; background: #EBEBEB; }
        .al-badge-text {
          font-size: 9px; color: #CCCCCC;
          letter-spacing: 2px; text-transform: uppercase;
        }

        /* ── SPINNER ── */
        .al-spinner {
          display: inline-block;
          width: 12px; height: 12px;
          border: 1px solid rgba(255,255,255,0.4);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: al-spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes al-spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .al-card { padding: 36px 24px; }
          .al-title { font-size: 30px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ zIndex: 999999, marginTop: "20px" }} />

      <div className="al-root">
        <div className="al-wrap">

          {/* ── BRAND ── */}
          <div className="al-brand">
            <div className="al-logo" onClick={() => navigate("/")}>
              Jimova<em>.</em>
            </div>
            <div className="al-eyebrow">
              <span className="al-eyebrow-line" />
              <span className="al-eyebrow-text">Admin Access</span>
              <span className="al-eyebrow-line" />
            </div>
            <h1 className="al-title">Sign In<em>.</em></h1>
            <p className="al-subtitle">Restricted to authorised administrators only.</p>
          </div>

          {/* ── CARD ── */}
          <div className="al-card">
            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="al-field">
                <label className="al-label">Email Address</label>
                <div className="al-input-wrap">
                  <input
                    className={`al-input${errors.email ? " error" : ""}`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@jimova.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <div className="al-error">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="al-field">
                <label className="al-label">Password</label>
                <div className="al-input-wrap">
                  <input
                    className={`al-input password-input${errors.password ? " error" : ""}`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="al-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="al-error">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button className="al-btn" type="submit" disabled={loading}>
                <span>
                  {loading && <span className="al-spinner" />}
                  {loading ? "Authenticating..." : "Access Admin Panel"}
                </span>
              </button>
            </form>

            <div className="al-card-footer">
              <button className="al-back" onClick={() => navigate("/")}>
                ← Return to Store
              </button>
            </div>
          </div>

          {/* ── SECURITY BADGE ── */}
          <div className="al-badge">
            <span className="al-badge-line" />
            <span className="al-badge-text">✦ &nbsp; Secure Admin Portal &nbsp; ✦</span>
            <span className="al-badge-line" />
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminLogin;