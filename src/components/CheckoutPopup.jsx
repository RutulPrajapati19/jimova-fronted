import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import unplugged from '../assets/unplugged.png';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, onCheckout }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // ✦ FIX: Instantly fills the correct saved name and email ✦
  useEffect(() => {
    if (show) {
      setName(localStorage.getItem('userName') || '');
      setEmail(localStorage.getItem('userEmail') || '');
    }
  }, [show]);

  if (!show) return null;

  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    if (!base64String) return unplugged;
    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const submitOrder = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your full name and email.");
      return;
    }
    onCheckout({ name, email });
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#FFFFFF", padding: "40px", width: "500px", maxWidth: "90%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        
        <button onClick={handleClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#999" }}>&times;</button>
        
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#111", marginBottom: "32px" }}>Checkout.</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: "flex", gap: "16px", alignItems: "center", borderBottom: "1px solid #EAEAEA", paddingBottom: "16px" }}>
              <img src={convertBase64ToDataURL(item.imageData)} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "contain", background: "#F8F8F8" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "600", color: "#111" }}>{item.name}</div>
                <div style={{ fontSize: "11px", color: "#888", fontWeight: "600", letterSpacing: "1px" }}>QTY: {item.quantity}</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#111" }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px" }}>Total Collection Value</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#111" }}>₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "10px", fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", display: "block" }}>Full Name</label>
          <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "14px", border: "1px solid #EAEAEA", background: "#FAFAFA", outline: "none", fontSize: "14px" }} />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <label style={{ fontSize: "10px", fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", display: "block" }}>Email Address</label>
          <input type="email" placeholder="Enter your email" value={email} disabled style={{ width: "100%", padding: "14px", border: "1px solid #EAEAEA", background: "#EFEFEF", color: "#666", outline: "none", fontSize: "14px", cursor: "not-allowed" }} />
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={handleClose} style={{ flex: 1, padding: "16px", background: "transparent", border: "1px solid #EAEAEA", color: "#111", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}>Cancel</button>
          <button onClick={submitOrder} style={{ flex: 1, padding: "16px", background: "#111", border: "1px solid #111", color: "#FFF", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}>Confirm Order</button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPopup;