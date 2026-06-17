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
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, role, email, name } = response.data;

      // Block non-admin users
      if (role !== "ADMIN") {
        toast.error("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name || email.split("@")[0]);
      window.dispatchEvent(new Event("storage"));

      toast.success("Welcome back, Admin.");
      setTimeout(() => navigate("/admin"), 1200);

    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }
        .admin-login-input {
          width: 100%; padding: 16px; border: 1px solid #EAEAEA;
          background: #FAFAFA; font-size: 14px; color: #111111;
          outline: none; border-radius: 0; box-sizing: border-box;
          transition: all 0.3s ease; font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
        }
        .admin-login-input:focus { border-color: #111111; background: #FFFFFF; }
        .admin-login-btn {
          width: 100%; padding: 18px; border: 1px solid #111111;
          background: #111111; color: #FFFFFF; font-size: 12px;
          font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;
          cursor: pointer; border-radius: 0; transition: all 0.4s ease;
          font-family: 'Inter', sans-serif;
        }
        .admin-login-btn:hover:not(:disabled) { background: transparent; color: #111111; }
        .admin-login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar style={{ marginTop: "20px" }} />

      <div style={{
        minHeight: "100vh", background: "#FCFCFC",
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "inline-block", marginBottom: "32px" }}>
              <span className="luxury-serif" style={{ fontSize: "32px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111" }}>
                Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </span>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <span style={{ width: "24px", height: "1px", background: "#C5A059" }} />
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Admin Access</span>
              <span style={{ width: "24px", height: "1px", background: "#C5A059" }} />
            </div>

            <h1 className="luxury-serif" style={{ fontSize: "40px", fontWeight: "400", color: "#111111", margin: 0, letterSpacing: "-0.5px" }}>
              Sign In<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </h1>
            <p style={{ color: "#888888", fontSize: "13px", marginTop: "12px", letterSpacing: "0.3px" }}>
              Restricted to authorised administrators only.
            </p>
          </div>

          {/* Form */}
          <div style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "48px 40px", boxShadow: "0 20px 40px rgba(0,0,0,0.03)" }}>
            <form onSubmit={handleSubmit} noValidate>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                  Email Address
                </label>
                <input
                  className="admin-login-input"
                  type="email" name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@jimova.com"
                  style={{ borderColor: errors.email ? "#CC3333" : "#EAEAEA" }}
                />
                {errors.email && <div style={{ color: "#CC3333", fontSize: "11px", marginTop: "6px", fontWeight: "500" }}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: "40px" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                  Password
                </label>
                <input
                  className="admin-login-input"
                  type="password" name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ borderColor: errors.password ? "#CC3333" : "#EAEAEA", letterSpacing: "2px" }}
                />
                {errors.password && <div style={{ color: "#CC3333", fontSize: "11px", marginTop: "6px", fontWeight: "500" }}>{errors.password}</div>}
              </div>

              <button className="admin-login-btn" type="submit" disabled={loading}>
                {loading ? "Authenticating..." : "Access Admin Panel"}
              </button>
            </form>

            <div style={{ borderTop: "1px solid #EAEAEA", marginTop: "32px", paddingTop: "24px", textAlign: "center" }}>
              <span
                onClick={() => navigate("/")}
                style={{ fontSize: "11px", color: "#888888", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", transition: "color 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#888888"}
              >
                ← Return to Store
              </span>
            </div>
          </div>

          {/* Security note */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span style={{ fontSize: "10px", color: "#CCCCCC", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              ✦ &nbsp; Secure Admin Portal &nbsp; ✦
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;