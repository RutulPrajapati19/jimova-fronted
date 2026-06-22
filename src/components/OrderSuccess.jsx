import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";

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
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await axios.post(
          `${baseUrl}/api/orders/confirm`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        handleSuccess();
      } catch (error) {
        const backendMessage = error.response?.data?.error || "";
        if (
          error.response?.status === 400 &&
          backendMessage.toLowerCase().includes("empty")
        ) {
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
    if (countdown === 0) {
      navigate("/orders");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

        .os-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }

        .os-card {
          width: 100%;
          max-width: 540px;
          background: #111111;
          border: 1px solid #222222;
          padding: 64px 52px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .os-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        /* PROCESSING STATE */
        .os-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid #1E1E1E;
          border-top-color: #C5A059;
          animation: os-spin 1.1s linear infinite;
          margin: 0 auto 36px;
        }
        @keyframes os-spin { to { transform: rotate(360deg); } }

        /* SUCCESS STATE */
        .os-check-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid #C5A059;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 36px;
          animation: os-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes os-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* ERROR STATE */
        .os-error-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid #8B2020;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 36px;
        }

        .os-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #C5A059;
          margin-bottom: 16px;
          display: block;
        }

        .os-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #F5F5F0;
          margin: 0 0 16px;
          line-height: 1.2;
        }

        .os-subtitle {
          font-size: 13px;
          color: #666666;
          line-height: 1.8;
          margin: 0 0 40px;
          font-weight: 300;
        }

        .os-divider {
          width: 40px;
          height: 1px;
          background: #C5A059;
          margin: 0 auto 40px;
          opacity: 0.5;
        }

        .os-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
        }

        .os-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #0D0D0D;
          border: 1px solid #1A1A1A;
        }

        .os-detail-label {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #444444;
        }

        .os-detail-value {
          font-size: 13px;
          color: #AAAAAA;
          font-weight: 400;
        }

        .os-detail-value.gold {
          color: #C5A059;
        }

        .os-btn {
          display: inline-block;
          width: 100%;
          padding: 16px 32px;
          background: transparent;
          border: 1px solid #C5A059;
          color: #C5A059;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }

        .os-btn:hover {
          background: #C5A059;
          color: #0A0A0A;
        }

        .os-btn-ghost {
          display: inline-block;
          width: 100%;
          padding: 16px 32px;
          background: transparent;
          border: 1px solid #222222;
          color: #666666;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }
        .os-btn-ghost:hover {
          border-color: #444444;
          color: #AAAAAA;
        }

        .os-countdown {
          margin-top: 24px;
          font-size: 11px;
          color: #333333;
          letter-spacing: 1px;
        }

        .os-countdown span {
          color: #C5A059;
        }

        .os-shimmer {
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(105deg, transparent 40%, rgba(197,160,89,0.04) 50%, transparent 60%);
          animation: os-shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes os-shimmer {
          0% { left: -60%; }
          100% { left: 120%; }
        }

        @media (max-width: 560px) {
          .os-card { padding: 48px 28px; }
          .os-title { font-size: 26px; }
        }
      `}</style>

      <div className="os-root">
        <div className="os-card">
          <div className="os-shimmer" />

          {/* ── PROCESSING ── */}
          {status === "processing" && (
            <>
              <div className="os-ring" />
              <span className="os-eyebrow">Securing Transaction</span>
              <h1 className="os-title">
                Finalizing your order
                <span style={{ color: "#C5A059" }}>.</span>
              </h1>
              <p className="os-subtitle">
                Please keep this window open while we verify your payment
                and lock in your curation.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <>
              <div className="os-check-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span className="os-eyebrow">Order Confirmed</span>
              <h1 className="os-title">
                Beautifully done
                <span style={{ color: "#C5A059" }}>.</span>
              </h1>
              <p className="os-subtitle">
                Your selection has been secured. A receipt has been dispatched
                to your registered email address.
              </p>

              <div className="os-divider" />

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
                View My Orders
              </button>
              <button className="os-btn-ghost" onClick={() => navigate("/")}>
                Continue Shopping
              </button>

              <p className="os-countdown">
                Redirecting in <span>{countdown}s</span>
              </p>
            </>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              <div className="os-error-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="#8B2020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <span className="os-eyebrow">Action Required</span>
              <h1 className="os-title">
                Something went wrong
                <span style={{ color: "#C5A059" }}>.</span>
              </h1>
              <p className="os-subtitle">
                Your payment was processed, but we could not finalize your order.
                Please contact support with your payment reference.
              </p>

              <div className="os-divider" />

              <button className="os-btn" onClick={() => navigate("/orders")}>
                Check Order History
              </button>
              <button className="os-btn-ghost" onClick={() => navigate("/")}>
                Return Home
              </button>
            </>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        style={{ zIndex: 999999, marginTop: "80px" }}
      />
    </>
  );
};

export default OrderSuccess;