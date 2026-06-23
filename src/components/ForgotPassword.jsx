import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
    } catch {
      // always show success — don't leak whether email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .fp-root {
          min-height: 100vh;
          background: #FCFCFC;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .fp-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(#EBEBEB 1px, transparent 1px),
            linear-gradient(90deg, #EBEBEB 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        .fp-wrap { width: 100%; max-width: 440px; position: relative; z-index: 1; }

        .fp-brand {
          text-align: center; margin-bottom: 36px; cursor: pointer;
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 400;
          letter-spacing: -0.5px; color: #111111;
          display: block; transition: opacity 0.2s;
        }
        .fp-brand:hover { opacity: 0.7; }
        .fp-brand em { color: #C5A059; font-style: italic; }

        .fp-card {
          background: #FFFFFF;
          border: 1px solid #EBEBEB;
          padding: 48px 44px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .fp-card::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        .fp-eyebrow {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .fp-eyebrow-line { width: 20px; height: 1px; background: #C5A059; }
        .fp-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: #C5A059;
        }

        .fp-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px; font-weight: 400;
          color: #111111; margin: 0 0 12px;
          letter-spacing: -0.3px; line-height: 1.15;
        }
        .fp-title em { color: #C5A059; font-style: italic; }

        .fp-subtitle {
          font-size: 13px; font-weight: 300;
          color: #888888; line-height: 1.8; margin: 0 0 32px;
        }

        .fp-rule { border: none; border-top: 1px solid #EBEBEB; margin: 0 0 28px; }

        .fp-label {
          display: block; font-size: 9px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #AAAAAA; margin-bottom: 10px;
        }

        .fp-input {
          width: 100%; padding: 15px 16px;
          border: 1px solid #EBEBEB; background: #FAFAFA;
          font-family: 'Inter', sans-serif; font-size: 14px; color: #111111;
          outline: none; transition: border-color 0.25s, background 0.25s;
          margin-bottom: 24px;
        }
        .fp-input:focus { border-color: #C5A059; background: #FFFFFF; }
        .fp-input::placeholder { color: #CCCCCC; }

        .fp-btn {
          width: 100%; padding: 15px 24px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.35s ease;
          position: relative; overflow: hidden;
          margin-bottom: 24px;
        }
        .fp-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1); z-index: 0;
        }
        .fp-btn:hover:not(:disabled)::after { transform: scaleX(1); }
        .fp-btn:hover:not(:disabled) { color: #111111; border-color: #C5A059; }
        .fp-btn span { position: relative; z-index: 1; }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .fp-spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 1px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; animation: fp-spin 0.8s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes fp-spin { to { transform: rotate(360deg); } }

        .fp-back {
          display: block; text-align: center;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #AAAAAA; text-decoration: none;
          transition: color 0.2s;
        }
        .fp-back:hover { color: #C5A059; }

        /* sent state icon */
        .fp-sent-icon {
          width: 72px; height: 72px; border-radius: 50%;
          border: 1px solid #EBEBEB; background: #FAFAFA;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          animation: fp-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes fp-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .fp-sent-email { color: #111111; font-weight: 600; }

        @media (max-width: 480px) {
          .fp-card { padding: 36px 24px; }
          .fp-title { font-size: 26px; }
        }
      `}</style>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "20px" }} />

      <div className="fp-root">
        <div className="fp-wrap">

          <div className="fp-brand" onClick={() => navigate("/")}>
            Jimova<em>.</em>
          </div>

          <div className="fp-card">

            {!sent ? (
              <>
                <div className="fp-eyebrow">
                  <span className="fp-eyebrow-line" />
                  <span className="fp-eyebrow-text">Account</span>
                </div>
                <h1 className="fp-title">Forgot password<em>.</em></h1>
                <p className="fp-subtitle">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <hr className="fp-rule" />

                <form onSubmit={handleSubmit} noValidate>
                  <label className="fp-label">Email Address</label>
                  <input
                    className="fp-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoFocus
                    autoComplete="email"
                  />
                  <button className="fp-btn" type="submit" disabled={loading}>
                    <span>
                      {loading && <span className="fp-spinner" />}
                      {loading ? "Sending..." : "Send Reset Link"}
                    </span>
                  </button>
                </form>

                <Link to="/login" className="fp-back">← Back to Login</Link>
              </>
            ) : (
              <>
                <div className="fp-sent-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>

                <div className="fp-eyebrow">
                  <span className="fp-eyebrow-line" />
                  <span className="fp-eyebrow-text">Check your inbox</span>
                  <span className="fp-eyebrow-line" />
                </div>

                <h1 className="fp-title">Email sent<em>.</em></h1>
                <p className="fp-subtitle">
                  We sent a reset link to <span className="fp-sent-email">{email}</span>.
                  Check your spam folder if you don't see it within 2 minutes.
                </p>

                <hr className="fp-rule" />

                <Link to="/login">
                  <button className="fp-btn" style={{ marginBottom: 0 }}>
                    <span>Back to Login</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}