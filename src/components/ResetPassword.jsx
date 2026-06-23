import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMatch    = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;
  const isWeak            = password.length > 0 && password.length < 6;
  const canSubmit         = password.length >= 6 && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`
      );
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => open ? (
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
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .rp-root {
          min-height: 100vh; background: #FCFCFC;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; font-family: 'Inter', sans-serif;
          position: relative;
        }
        .rp-root::before {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(#EBEBEB 1px, transparent 1px),
            linear-gradient(90deg, #EBEBEB 1px, transparent 1px);
          background-size: 48px 48px; opacity: 0.35;
          pointer-events: none; z-index: 0;
        }

        .rp-wrap { width: 100%; max-width: 440px; position: relative; z-index: 1; }

        .rp-brand {
          display: block; text-align: center; margin-bottom: 36px;
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 400;
          letter-spacing: -0.5px; color: #111111;
          cursor: pointer; transition: opacity 0.2s; text-decoration: none;
        }
        .rp-brand:hover { opacity: 0.7; }
        .rp-brand em { color: #C5A059; font-style: italic; }

        .rp-card {
          background: #FFFFFF; border: 1px solid #EBEBEB;
          padding: 48px 44px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .rp-card::before {
          content: ''; position: absolute; top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        .rp-eyebrow {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .rp-eyebrow-line { width: 20px; height: 1px; background: #C5A059; }
        .rp-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: #C5A059;
        }

        .rp-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px; font-weight: 400; color: #111111;
          margin: 0 0 12px; letter-spacing: -0.3px; line-height: 1.15;
        }
        .rp-title em { color: #C5A059; font-style: italic; }

        .rp-subtitle {
          font-size: 13px; font-weight: 300; color: #888888;
          line-height: 1.8; margin: 0 0 28px;
        }

        .rp-rule { border: none; border-top: 1px solid #EBEBEB; margin: 0 0 28px; }

        .rp-label {
          display: block; font-size: 9px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #AAAAAA; margin-bottom: 10px;
        }

        .rp-input-wrap {
          position: relative; margin-bottom: 8px;
        }

        .rp-input {
          width: 100%; padding: 15px 48px 15px 16px;
          border: 1px solid #EBEBEB; background: #FAFAFA;
          font-family: 'Inter', sans-serif; font-size: 14px; color: #111111;
          outline: none; transition: border-color 0.25s, background 0.25s;
          letter-spacing: 0.3px;
        }
        .rp-input:focus { border-color: #C5A059; background: #FFFFFF; }
        .rp-input.match   { border-color: #5A8F35; }
        .rp-input.mismatch { border-color: #CC4444; }
        .rp-input::placeholder { color: #CCCCCC; letter-spacing: 0; }

        .rp-eye {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #CCCCCC; display: flex; align-items: center;
          padding: 4px; transition: color 0.2s;
        }
        .rp-eye:hover { color: #888888; }

        .rp-hint {
          font-size: 11px; font-weight: 500;
          margin-bottom: 20px; display: flex; align-items: center; gap: 5px;
        }
        .rp-hint.ok   { color: #5A8F35; }
        .rp-hint.bad  { color: #CC4444; }
        .rp-hint.weak { color: #CC8800; }

        /* strength bar */
        .rp-strength {
          height: 2px; background: #EBEBEB; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .rp-strength-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .rp-field { margin-bottom: 4px; }

        .rp-btn {
          width: 100%; padding: 15px 24px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-bottom: 24px;
          transition: all 0.35s ease;
          position: relative; overflow: hidden;
        }
        .rp-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1); z-index: 0;
        }
        .rp-btn:hover:not(:disabled)::after { transform: scaleX(1); }
        .rp-btn:hover:not(:disabled) { color: #111111; border-color: #C5A059; }
        .rp-btn span { position: relative; z-index: 1; }
        .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .rp-spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 1px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; animation: rp-spin 0.8s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes rp-spin { to { transform: rotate(360deg); } }

        .rp-back {
          display: block; text-align: center;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #AAAAAA; text-decoration: none; transition: color 0.2s;
        }
        .rp-back:hover { color: #C5A059; }

        /* done / invalid states */
        .rp-icon {
          width: 72px; height: 72px; border-radius: 50%;
          border: 1px solid #EBEBEB; background: #FAFAFA;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          animation: rp-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .rp-icon.err { border-color: #FFDDDD; background: #FFF8F8; }
        @keyframes rp-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        @media (max-width: 480px) {
          .rp-card { padding: 36px 24px; }
          .rp-title { font-size: 26px; }
        }
      `}</style>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "20px" }} />

      <div className="rp-root">
        <div className="rp-wrap">

          <div className="rp-brand" onClick={() => navigate("/")}>
            Jimova<em>.</em>
          </div>

          <div className="rp-card">

            {/* ── NO TOKEN ── */}
            {!token && (
              <>
                <div className="rp-icon err">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#CC4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                <div className="rp-eyebrow">
                  <span className="rp-eyebrow-line" />
                  <span className="rp-eyebrow-text">Invalid Link</span>
                  <span className="rp-eyebrow-line" />
                </div>
                <h1 className="rp-title">Link broken<em>.</em></h1>
                <p className="rp-subtitle">This reset link is missing or expired. Please request a new one.</p>
                <hr className="rp-rule" />
                <Link to="/forgot-password">
                  <button className="rp-btn" style={{ marginBottom: 0 }}>
                    <span>Request New Link</span>
                  </button>
                </Link>
              </>
            )}

            {/* ── DONE ── */}
            {token && done && (
              <>
                <div className="rp-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="rp-eyebrow">
                  <span className="rp-eyebrow-line" />
                  <span className="rp-eyebrow-text">All Done</span>
                  <span className="rp-eyebrow-line" />
                </div>
                <h1 className="rp-title">Password updated<em>.</em></h1>
                <p className="rp-subtitle">Your password has been reset. Redirecting you to login…</p>
                <hr className="rp-rule" />
                <Link to="/login">
                  <button className="rp-btn" style={{ marginBottom: 0 }}>
                    <span>Go to Login</span>
                  </button>
                </Link>
              </>
            )}

            {/* ── FORM ── */}
            {token && !done && (
              <>
                <div className="rp-eyebrow">
                  <span className="rp-eyebrow-line" />
                  <span className="rp-eyebrow-text">Account</span>
                </div>
                <h1 className="rp-title">Set new password<em>.</em></h1>
                <p className="rp-subtitle">Choose a strong password for your Jimova account.</p>
                <hr className="rp-rule" />

                <form onSubmit={handleSubmit} noValidate>

                  {/* New password */}
                  <div className="rp-field">
                    <label className="rp-label">New Password</label>
                    <div className="rp-input-wrap">
                      <input
                        className="rp-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        autoFocus
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp-eye"
                        onClick={() => setShowPassword((p) => !p)}>
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="rp-strength">
                      <div className="rp-strength-fill" style={{
                        width: password.length < 6 ? "25%" : password.length < 10 ? "60%" : "100%",
                        background: password.length < 6 ? "#CC4444" : password.length < 10 ? "#CC8800" : "#5A8F35",
                      }} />
                    </div>
                  )}

                  {isWeak && (
                    <div className="rp-hint weak">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Too short — minimum 6 characters
                    </div>
                  )}

                  {/* Confirm password */}
                  <div className="rp-field" style={{ marginTop: isWeak ? 0 : 4 }}>
                    <label className="rp-label">Confirm New Password</label>
                    <div className="rp-input-wrap">
                      <input
                        className={`rp-input${passwordsMatch ? " match" : passwordsMismatch ? " mismatch" : ""}`}
                        type={showPassword ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {passwordsMismatch && (
                    <div className="rp-hint bad" style={{ marginBottom: 20 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Passwords do not match
                    </div>
                  )}
                  {passwordsMatch && (
                    <div className="rp-hint ok" style={{ marginBottom: 20 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Passwords match
                    </div>
                  )}
                  {!passwordsMatch && !passwordsMismatch && <div style={{ marginBottom: 20 }} />}

                  <button className="rp-btn" type="submit" disabled={!canSubmit}>
                    <span>
                      {loading && <span className="rp-spinner" />}
                      {loading ? "Resetting..." : "Reset Password"}
                    </span>
                  </button>
                </form>

                <Link to="/login" className="rp-back">← Back to Login</Link>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}