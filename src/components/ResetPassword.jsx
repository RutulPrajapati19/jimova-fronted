import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap'); .luxury-serif { font-family: 'Playfair Display', serif; }`}</style>
        <div style={{ padding: "100px 6%", background: "#FCFCFC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "60px 48px", textAlign: "center", maxWidth: 480, width: "100%" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h4 className="luxury-serif" style={{ fontSize: 28, fontWeight: 400, color: "#111111", marginBottom: 12 }}>Invalid reset link</h4>
            <p style={{ fontSize: 14, color: "#666666", marginBottom: 32 }}>This link is missing or broken. Please request a new one.</p>
            <Link to="/forgot-password" style={{ display: "inline-block", padding: "14px 32px", background: "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", textDecoration: "none" }}>
              Request new link
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      toast.success("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || "Link expired or invalid. Please request a new one.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

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
              Set new password<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </h1>
            <p style={{ fontSize: 14, color: "#666666", marginTop: 12, lineHeight: 1.7 }}>
              Choose a strong password for your Jimova account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                New password
              </label>
              <div style={{ display: "flex", border: "1px solid #EAEAEA", background: "#FAFAFA" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  autoFocus
                  style={{ flex: 1, padding: "12px 16px", border: "none", fontSize: 14, outline: "none", fontFamily: "inherit", background: "transparent" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ padding: "12px 16px", border: "none", background: "transparent", fontSize: 12, color: "#999999", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                Confirm new password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${passwordsMismatch ? "#E24B4A" : passwordsMatch ? "#639922" : "#EAEAEA"}`, borderRadius: 0, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAFA" }}
              />
              {passwordsMismatch && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 6 }}>Passwords do not match</div>}
              {passwordsMatch && <div style={{ fontSize: 12, color: "#639922", marginTop: 6 }}>✓ Passwords match</div>}
            </div>

            <button
              type="submit"
              disabled={loading || passwordsMismatch || password.length < 6}
              style={{ width: "100%", padding: "14px 32px", background: (loading || passwordsMismatch || password.length < 6) ? "#CCCCCC" : "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", border: "none", cursor: (loading || passwordsMismatch || password.length < 6) ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link to="/login" style={{ fontSize: 13, color: "#999999", textDecoration: "none" }}>← Back to login</Link>
          </div>
        </div>
      </div>
    </>
  );
}