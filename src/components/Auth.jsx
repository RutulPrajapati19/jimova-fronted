import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    console.log("🔵 Sending request to:", `${baseUrl}${endpoint}`);
    console.log("🔵 Form data:", { email: formData.email, password: "***" });

    try {
      const response = await axios.post(`${baseUrl}${endpoint}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      // ✦ DEBUG: Log full response so we can see the token field name ✦
      console.log("✅ Full response.data:", response.data);
      console.log("✅ All keys in response:", Object.keys(response.data));

      // ✦ FIX: Try all common token field names ✦
      const token =
        response.data.token ||
        response.data.jwt ||
        response.data.accessToken ||
        response.data.jwtToken ||
        response.data.access_token ||
        response.data.authToken ||
        null;

      console.log("✅ Extracted token:", token ? "FOUND ✓" : "NOT FOUND ✗");

      if (!token) {
        console.error("❌ Could not find token in response. Keys were:", Object.keys(response.data));
        toast.error("Login succeeded but no token received. Check console for details.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userRole", response.data.role);

      const nameToSave = !isLogin
        ? formData.name
        : response.data.name || response.data.username || formData.email.split('@')[0];
      localStorage.setItem("userName", nameToSave);

      console.log("✅ Token saved to localStorage:", token.substring(0, 20) + "...");

      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      window.dispatchEvent(new Event("storage"));

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error("❌ Auth Error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Status:", error.response?.status);

      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Authentication failed");
        setErrors(error.response.data.errors || {});
      } else if (error.code === "ERR_NETWORK" || !error.response) {
        toast.error("Cannot reach server. Is your backend running at " + baseUrl + "?");
      } else {
        toast.error("Network error. Please check your backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }

          .luxury-input { transition: all 0.4s ease; }
          .luxury-input:focus { border-color: #111111 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: #FFFFFF !important; }

          .luxury-btn { transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); position: relative; z-index: 1; overflow: hidden; }
          .luxury-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background-color: transparent; border: 1px solid #111111; z-index: -1; transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
          .luxury-btn:hover:not(:disabled)::after { transform: translateY(0); }
          .luxury-btn:hover:not(:disabled) { color: #111111 !important; background: transparent !important; }
          .luxury-btn:active:not(:disabled) { transform: scale(0.98); }
        `}
      </style>

      <div style={{
        padding: "100px 6% 120px",
        background: "#FCFCFC",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "flex",
        alignItems: "center"
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8">

              <div style={{ marginBottom: "48px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>
                    {isLogin ? "Authentication" : "Membership"}
                  </span>
                  <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
                </div>

                <h1 className="luxury-serif" style={{ fontSize: "44px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0, lineHeight: "1.1" }}>
                  {isLogin ? "Welcome Back" : "Create Account"}<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
                </h1>
                <p style={{ marginTop: "16px", color: "#666666", fontSize: "14px", fontWeight: "400", letterSpacing: "0.5px", margin: 0 }}>
                  {isLogin ? "Enter your details to access your curated collection." : "Join us to discover the absolute modern standard of luxury."}
                </p>
              </div>

              <div style={{ background: "#FFFFFF", borderRadius: "0px", padding: "48px 40px", border: "1px solid #EAEAEA", boxShadow: "0 20px 40px rgba(0,0,0,0.03)" }}>
                <form className="row g-4" noValidate onSubmit={submitHandler}>
                  {!isLogin && (
                    <div className="col-12">
                      <label style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>Full Name</label>
                      <input type="text" name="name" className="luxury-input" placeholder="John Doe" value={formData.name} onChange={handleInputChange}
                        style={{ width: "100%", padding: "16px", borderRadius: "0px", border: `1px solid ${errors.name ? '#D32F2F' : '#EAEAEA'}`, background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none" }} />
                      {errors.name && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.name}</div>}
                    </div>
                  )}

                  <div className="col-12">
                    <label style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>Email Address</label>
                    <input type="email" name="email" className="luxury-input" placeholder="name@example.com" value={formData.email} onChange={handleInputChange}
                      style={{ width: "100%", padding: "16px", borderRadius: "0px", border: `1px solid ${errors.email ? '#D32F2F' : '#EAEAEA'}`, background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none" }} />
                    {errors.email && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.email}</div>}
                  </div>

                  <div className="col-12">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                      <label style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", margin: 0, display: "block" }}>Password</label>
                      {isLogin && (
                        <span style={{ fontSize: "11px", fontWeight: "600", color: "#C5A059", cursor: "pointer", transition: "color 0.3s ease" }}
                          onMouseEnter={(e) => e.target.style.color = "#111111"}
                          onMouseLeave={(e) => e.target.style.color = "#C5A059"}>
                          Forgot Password?
                        </span>
                      )}
                    </div>
                    <input type="password" name="password" className="luxury-input" placeholder="••••••••" value={formData.password} onChange={handleInputChange}
                      style={{ width: "100%", padding: "16px", borderRadius: "0px", border: `1px solid ${errors.password ? '#D32F2F' : '#EAEAEA'}`, background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none", letterSpacing: "2px" }} />
                    {errors.password && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.password}</div>}
                  </div>

                  <div className="col-12" style={{ marginTop: "40px" }}>
                    {loading ? (
                      <button type="button" disabled style={{ width: "100%", padding: "18px", borderRadius: "0px", border: "1px solid #EAEAEA", background: "#FAFAFA", color: "#999999", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: "14px", height: "14px" }}></span>
                        Authenticating...
                      </button>
                    ) : (
                      <button type="submit" className="luxury-btn" style={{ width: "100%", padding: "18px", borderRadius: "0px", border: "1px solid #111111", background: "#111111", color: "#FFFFFF", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer" }}>
                        {isLogin ? "Sign In" : "Create Account"}
                      </button>
                    )}
                  </div>
                </form>

                <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "32px", borderTop: "1px solid #EAEAEA" }}>
                  <p style={{ fontSize: "12px", color: "#888888", margin: 0, fontWeight: "500", letterSpacing: "0.5px" }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span onClick={toggleAuthMode}
                      style={{ color: "#111111", fontWeight: "600", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px", marginLeft: "4px", borderBottom: "1px solid #111111", paddingBottom: "2px", transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => { e.target.style.color = "#C5A059"; e.target.style.borderColor = "#C5A059"; }}
                      onMouseLeave={(e) => { e.target.style.color = "#111111"; e.target.style.borderColor = "#111111"; }}>
                      {isLogin ? "Sign Up" : "Log In"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
    </>
  );
};

export default Auth;