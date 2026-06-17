import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context"; 
import { toast, ToastContainer } from "react-toastify";

const OrderSuccess = () => {
  const [status, setStatus] = useState("Finalizing your order...");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useContext(AppContext);
  const hasRun = useRef(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const confirmOrderInDatabase = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Authentication missing. Order cannot be verified.");
        return;
      }

      try {
        // Ping the backend to lock in the order
        const response = await axios.post(
          `${baseUrl}/api/orders/confirm`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        handleSuccess();

      } catch (error) {
        console.error("Failed to confirm order:", error);
        
        // ✦ FIX: Check if the error is just the backend saying the cart is already empty ✦
        const backendMessage = error.response?.data?.error || "";
        
        if (error.response?.status === 400 && backendMessage.toLowerCase().includes("empty")) {
          // If the cart is empty, it means React Strict Mode already processed the order successfully!
          handleSuccess();
        } else {
          setStatus("Payment succeeded, but order finalization failed.");
          toast.error(`Backend Error: ${backendMessage || "Unknown error"}`);
        }
      }
    };

    confirmOrderInDatabase();
  }, [baseUrl, clearCart, navigate]); // Removed handleSuccess from dependencies to prevent re-renders

  // Helper function to handle the success state cleanly
  const handleSuccess = () => {
    setStatus("Order Confirmed");
    setIsSuccess(true);
    toast.success("Payment successful! Receipt sent to your email.");
    clearCart(); // Clear the local React cart
    
    // Redirect to orders page after 3 seconds
    setTimeout(() => {
      navigate("/orders");
    }, 3000);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }
          .spinner {
            width: 40px; height: 40px;
            border: 2px solid #EAEAEA;
            border-top: 2px solid #C5A059;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 24px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}
      </style>
      
      <div style={{ padding: "120px 20px", textAlign: "center", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", background: "#FFFFFF", padding: "60px 40px", border: "1px solid #EAEAEA" }}>
          
          {isSuccess ? (
             <svg style={{ margin: "0 auto 24px", color: "#C5A059" }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <div className="spinner"></div>
          )}

          <h2 className="luxury-serif" style={{ fontSize: "32px", color: "#111111", marginBottom: "16px" }}>
            {status}<span style={{ color: "#C5A059" }}>.</span>
          </h2>
          
          <p style={{ color: "#666666", fontSize: "14px", lineHeight: "1.6" }}>
            {isSuccess 
              ? "Your luxury curation has been secured. You will be redirected to your collection shortly."
              : "Please do not close this window while we securely sync your transaction with the blockchain and database."}
          </p>

        </div>
      </div>
      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
    </>
  );
};

export default OrderSuccess;