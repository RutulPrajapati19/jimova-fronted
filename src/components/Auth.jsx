import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
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
    try {
      const response = await axios.post(`${baseUrl}${endpoint}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      const token =
        response.data.token || response.data.jwt || response.data.accessToken ||
        response.data.jwtToken || response.data.access_token || response.data.authToken || null;
      if (!token) {
        toast.error("Login succeeded but no token received.");
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
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      if (error.response?.data) {
        toast.error(error.response.data.message || "Authentication failed");
        setErrors(error.response.data.errors || {});
      } else if (error.code === "ERR_NETWORK" || !error.response) {
        toast.error("Cannot reach server. Is your backend running?");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .auth-root {
          min-height: 100vh;
          background: #FCFCFC;
          display: flex; align-items: center; justify-content: center;
          padding: 60px 20px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .auth-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(#EBEBEB 1px, transparent 1px),
            linear-gradient(90deg, #EBEBEB 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.35; pointer-events: none; z-index: 0;
        }

        .auth-wrap { width: 100%; max-width: 460px; position: relative; z-index: 1; }

        /* brand */
        .auth-brand {
          text-align: center; margin-bottom: 40px;
        }
        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 400;
          letter-spacing: -0.5px; color: #111111;
          cursor: pointer; display: inline-block;
          margin-bottom: 20px; transition: opacity 0.2s;
          text-decoration: none;
        }
        .auth-logo:hover { opacity: 0.7; }
        .auth-logo em { color: #C5A059; font-style: italic; }

        .auth-eyebrow {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 14px;
        }
        .auth-eyebrow-line { width: 20px; height: 1px; background: #C5A059; }
        .auth-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: #C5A059;
        }

        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 400;
          color: #111111; margin: 0 0 10px;
          letter-spacing: -0.5px; line-height: 1.1;
        }
        .auth-title em { color: #C5A059; font-style: italic; }

        .auth-sub {
          font-size: 13px; font-weight: 300;
          color: #888888; margin: 0; line-height: 1.6;
        }

        /* card */
        .auth-card {
          background: #FFFFFF; border: 1px solid #EBEBEB;
          padding: 48px 44px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .auth-card::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        /* fields */
        .auth-label {
          display: block; font-size: 9px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #AAAAAA; margin-bottom: 10px;
        }

        .auth-label-row {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 10px;
        }

        .auth-forgot {
          font-size: 10px; font-weight: 600;
          color: #C5A059; text-decoration: none;
          letter-spacing: 0.5px;
          transition: color 0.2s;
        }
        .auth-forgot:hover { color: #111111; }

        .auth-field { margin-bottom: 20px; }
        .auth-field:last-of-type { margin-bottom: 0; }

        .auth-input-wrap { position: relative; }

        .auth-input {
          width: 100%; padding: 15px 16px;
          border: 1px solid #EBEBEB; background: #FAFAFA;
          font-family: 'Inter', sans-serif; font-size: 14px; color: #111111;
          outline: none; transition: border-color 0.25s, background 0.25s;
          letter-spacing: 0.3px;
        }
        .auth-input:focus { border-color: #C5A059; background: #FFFFFF; }
        .auth-input.error { border-color: #D32F2F; }
        .auth-input.password { padding-right: 48px; letter-spacing: 2px; }
        .auth-input.password::placeholder { letter-spacing: 0; }

        .auth-eye {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #CCCCCC; display: flex; align-items: center;
          padding: 4px; transition: color 0.2s;
        }
        .auth-eye:hover { color: #888888; }

        .auth-error {
          color: #D32F2F; font-size: 11px;
          margin-top: 6px; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }

        /* submit */
        .auth-btn {
          width: 100%; padding: 16px 24px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-top: 32px;
          transition: all 0.35s ease;
          position: relative; overflow: hidden;
        }
        .auth-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1); z-index: 0;
        }
        .auth-btn:hover:not(:disabled)::after { transform: scaleX(1); }
        .auth-btn:hover:not(:disabled) { color: #111111; border-color: #C5A059; }
        .auth-btn span { position: relative; z-index: 1; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 1px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; animation: auth-spin 0.8s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes auth-spin { to { transform: rotate(360deg); } }

        /* footer */
        .auth-card-footer {
          border-top: 1px solid #EBEBEB;
          margin-top: 28px; padding-top: 24px;
          text-align: center;
        }
        .auth-card-footer p {
          font-size: 12px; color: #888888; margin: 0; font-weight: 400;
        }
        .auth-toggle {
          color: #111111; font-weight: 700;
          cursor: pointer; text-transform: uppercase;
          letter-spacing: 1px; font-size: 11px;
          margin-left: 6px;
          border-bottom: 1px solid #111111;
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .auth-toggle:hover { color: #C5A059; border-color: #C5A059; }

        @media (max-width: 480px) {
          .auth-card { padding: 36px 24px; }
          .auth-title { font-size: 28px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-wrap">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-logo" onClick={() => navigate("/")}>
              Jimova<em>.</em>
            </div>
            <div className="auth-eyebrow">
              <span className="auth-eyebrow-line" />
              <span className="auth-eyebrow-text">{isLogin ? "Authentication" : "Membership"}</span>
              <span className="auth-eyebrow-line" />
            </div>
            <h1 className="auth-title">
              {isLogin ? "Welcome Back" : "Create Account"}<em>.</em>
            </h1>
            <p className="auth-sub">
              {isLogin
                ? "Enter your details to access your curated collection."
                : "Join us to discover the absolute modern standard of luxury."}
            </p>
          </div>

          {/* Card */}
          <div className="auth-card">
            <form noValidate onSubmit={submitHandler}>

              {/* Name (register only) */}
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <input
                    className={`auth-input${errors.name ? " error" : ""}`}
                    type="text" name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoComplete="name"
                  />
                  {errors.name && <div className="auth-error">{errors.name}</div>}
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input
                  className={`auth-input${errors.email ? " error" : ""}`}
                  type="email" name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
                {errors.email && <div className="auth-error">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" style={{ margin: 0 }}>Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="auth-forgot">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <input
                    className={`auth-input password${errors.password ? " error" : ""}`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button" className="auth-eye"
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
                {errors.password && <div className="auth-error">{errors.password}</div>}
              </div>

              {/* Submit */}
              <button className="auth-btn" type="submit" disabled={loading}>
                <span>
                  {loading && <span className="auth-spinner" />}
                  {loading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
                </span>
              </button>
            </form>

            <div className="auth-card-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span className="auth-toggle" onClick={toggleAuthMode}>
                  {isLogin ? "Sign Up" : "Log In"}
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
    </>
  );
};

export default Auth;