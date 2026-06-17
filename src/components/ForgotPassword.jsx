import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSent(true);
    } catch {
      setSent(true); // always show success — don't leak if email exists
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap'); .luxury-serif { font-family: 'Playfair Display', serif; }`}</style>
        <div style={{ padding: "100px 6% 120px", background: "#FCFCFC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "60px 48px", textAlign: "center", maxWidth: 480, width: "100%" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h4 className="luxury-serif" style={{ fontSize: 28, fontWeight: 400, color: "#111111", marginBottom: 12 }}>Check your inbox</h4>
            <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.7, marginBottom: 32 }}>
              We sent a reset link to <strong>{email}</strong>.<br />
              Check your spam folder if you don't see it within 2 minutes.
            </p>
            <Link to="/login" style={{ display: "inline-block", padding: "14px 32px", background: "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", textDecoration: "none" }}>
              Back to login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap'); .luxury-serif { font-family: 'Playfair Display', serif; }`}</style>
      <div style={{ padding: "100px 6% 120px", background: "#FCFCFC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "48px", maxWidth: 480, width: "100%" }}>

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Account</span>
            </div>
            <h1 className="luxury-serif" style={{ fontSize: 36, fontWeight: 400, color: "#111111", margin: 0 }}>
              Forgot password<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </h1>
            <p style={{ fontSize: 14, color: "#666666", marginTop: 12, lineHeight: 1.7 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #EAEAEA", borderRadius: 0, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAFA" }}
                onFocus={e => e.target.style.borderColor = "#C5A059"}
                onBlur={e => e.target.style.borderColor = "#EAEAEA"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px 32px", background: loading ? "#666" : "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link to="/login" style={{ fontSize: 13, color: "#999999", textDecoration: "none" }}>
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}