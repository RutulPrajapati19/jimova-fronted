import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderSuccess = () => {
  const [status, setStatus] = useState("processing");
  const navigate = useNavigate();
  const { clearCart } = useContext(AppContext);
  const hasRun = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const confirmOrderInDatabase = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setStatus("error"); return; }
      try {
        await axios.post(`${baseUrl}/api/orders/confirm`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleSuccess();
      } catch (error) {
        const backendMessage = error.response?.data?.error || "";
        if (error.response?.status === 400 && backendMessage.toLowerCase().includes("empty")) {
          handleSuccess();
        } else {
          setStatus("error");
          toast.error(`Order error: ${backendMessage || "Unknown error"}`);
        }
      }
    };
    confirmOrderInDatabase();
  }, [baseUrl]);

  const handleSuccess = () => {
    setStatus("success");
    clearCart();
    toast.success("Receipt sent to your email.");
  };

  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) { navigate("/orders"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .os-root {
          min-height: 100vh;
          background: #FCFCFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }

        .os-card {
          width: 100%;
          max-width: 520px;
          background: #FFFFFF;
          border: 1px solid #EBEBEB;
          padding: 64px 52px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 48px rgba(0,0,0,0.04);
        }

        /* gold top accent — same as AdminLogin card */
        .os-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        /* ── PROCESSING ── */
        .os-ring {
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 1px solid #EBEBEB;
          border-top-color: #C5A059;
          animation: os-spin 1.1s linear infinite;
          margin: 0 auto 32px;
        }
        @keyframes os-spin { to { transform: rotate(360deg); } }

        /* ── SUCCESS ICON ── */
        .os-check-wrap {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 1px solid #EBEBEB;
          background: #FAFAFA;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
          animation: os-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes os-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* ── ERROR ICON ── */
        .os-error-wrap {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 1px solid #FFDDDD;
          background: #FFF8F8;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
        }

        /* ── EYEBROW ── */
        .os-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .os-eyebrow-line { width: 20px; height: 1px; background: #C5A059; }
        .os-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #C5A059;
        }

        /* ── TITLE ── */
        .os-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px; font-weight: 400;
          color: #111111; margin: 0 0 14px;
          line-height: 1.15; letter-spacing: -0.3px;
        }
        .os-title em { color: #C5A059; font-style: italic; }

        /* ── SUBTITLE ── */
        .os-subtitle {
          font-size: 13px; font-weight: 300;
          color: #888888; line-height: 1.8;
          margin: 0 0 36px;
        }

        /* ── DIVIDER ── */
        .os-rule {
          border: none;
          border-top: 1px solid #EBEBEB;
          margin: 0 0 28px;
        }

        /* ── DETAIL ROWS ── */
        .os-details {
          display: flex; flex-direction: column;
          gap: 1px; margin-bottom: 32px;
          text-align: left;
        }

        .os-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 16px;
          background: #FAFAFA;
          border: 1px solid #EBEBEB;
        }

        .os-detail-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #AAAAAA;
        }

        .os-detail-value {
          font-size: 13px; font-weight: 500;
          color: #111111;
        }
        .os-detail-value.gold { color: #C5A059; }

        /* ── BUTTONS ── */
        .os-btn {
          display: block; width: 100%;
          padding: 15px 24px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-bottom: 10px;
          transition: all 0.35s ease;
          position: relative; overflow: hidden;
        }
        .os-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: #C5A059;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1);
          z-index: 0;
        }
        .os-btn:hover::after { transform: scaleX(1); }
        .os-btn:hover { color: #111111; border-color: #C5A059; }
        .os-btn span { position: relative; z-index: 1; }

        .os-btn-ghost {
          display: block; width: 100%;
          padding: 14px 24px;
          background: transparent; color: #888888;
          border: 1px solid #EBEBEB;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .os-btn-ghost:hover { border-color: #111111; color: #111111; }

        /* ── COUNTDOWN ── */
        .os-countdown {
          margin-top: 20px;
          font-size: 11px; color: #CCCCCC;
          letter-spacing: 1px;
        }
        .os-countdown strong { color: #C5A059; }

        @media (max-width: 560px) {
          .os-card { padding: 48px 24px; }
          .os-title { font-size: 26px; }
        }
      `}</style>

      <div className="os-root">
        <div className="os-card">

          {/* ── PROCESSING ── */}
          {status === "processing" && (
            <>
              <div className="os-ring" />
              <div className="os-eyebrow">
                <span className="os-eyebrow-line" />
                <span className="os-eyebrow-text">Securing Transaction</span>
                <span className="os-eyebrow-line" />
              </div>
              <h1 className="os-title">
                Finalizing your order<em>.</em>
              </h1>
              <p className="os-subtitle">
                Please keep this window open while we verify your payment and lock in your order.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <>
              <div className="os-check-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="os-eyebrow">
                <span className="os-eyebrow-line" />
                <span className="os-eyebrow-text">Order Confirmed</span>
                <span className="os-eyebrow-line" />
              </div>
              <h1 className="os-title">Beautifully done<em>.</em></h1>
              <p className="os-subtitle">
                Your selection has been secured. A receipt has been dispatched to your registered email address.
              </p>

              <hr className="os-rule" />

              <div className="os-details">
                <div className="os-detail-row">
                  <span className="os-detail-label">Status</span>
                  <span className="os-detail-value gold">Confirmed</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Receipt</span>
                  <span className="os-detail-value">Sent to email</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Next</span>
                  <span className="os-detail-value">Order History</span>
                </div>
              </div>

              <button className="os-btn" onClick={() => navigate("/orders")}>
                <span>View My Orders</span>
              </button>
              <button className="os-btn-ghost" onClick={() => navigate("/")}>
                Continue Shopping
              </button>

              <p className="os-countdown">
                Redirecting in <strong>{countdown}s</strong>
              </p>
            </>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              <div className="os-error-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#CC4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <div className="os-eyebrow">
                <span className="os-eyebrow-line" />
                <span className="os-eyebrow-text">Action Required</span>
                <span className="os-eyebrow-line" />
              </div>
              <h1 className="os-title">Something went wrong<em>.</em></h1>
              <p className="os-subtitle">
                Your payment was processed, but we could not finalize your order.
                Please contact support with your payment reference.
              </p>

              <hr className="os-rule" />

              <button className="os-btn" onClick={() => navigate("/orders")}>
                <span>Check Order History</span>
              </button>
              <button className="os-btn-ghost" onClick={() => navigate("/")}>
                Return Home
              </button>
            </>
          )}

        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default OrderSuccess;