import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const [input, setInput] = useState("");
  const [showNoProductsMessage, setShowNoProductsMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', role: 'USER' });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // ✦ NEW FIX: Silently checks for and fixes stuck "OUT" items in the database ✦
  useEffect(() => {
    const autoRestockEmptyItems = async () => {
      const token = localStorage.getItem("token");
      // Only run once per session to prevent spamming your backend
      if (!token || sessionStorage.getItem("restockDone")) return;

      try {
        const response = await axios.get(`${baseUrl}/api/products`);
        const emptyProducts = response.data.filter(p => p.stockQuantity <= 0);

        if (emptyProducts.length > 0) {
          for (const item of emptyProducts) {
            const { imageUrl, imageName, imageData, imageType, ...rest } = item;
            const updatedProductData = { ...rest, stockQuantity: 100 }; // Force back to 100

            const cartProduct = new FormData();
            
            let imageFile;
            if (imageData) {
              try {
                const base64Data = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData;
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                imageFile = new File([byteArray], imageName || "image.jpg", { type: imageType || "image/jpeg" });
              } catch(e) {
                imageFile = new File([], "empty.jpg", { type: "image/jpeg" });
              }
            } else {
              imageFile = new File([], "empty.jpg", { type: "image/jpeg" });
            }

            cartProduct.append("imageFile", imageFile); 
            cartProduct.append("product", new Blob([JSON.stringify(updatedProductData)], { type: "application/json" }));

            await axios.put(`${baseUrl}/api/product/${item.id}`, cartProduct, {
              headers: { "Authorization": `Bearer ${token}` },
            });
          }
          toast.success("Database Auto-Restocked! Please refresh the page to unlock items.");
        }
        sessionStorage.setItem("restockDone", "true");
      } catch (error) {
        console.error("Auto-restock check failed:", error);
      }
    };

    autoRestockEmptyItems();
  }, [baseUrl]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        setUserDetails({
          name: localStorage.getItem("userName") || "Jimova Member",
          email: localStorage.getItem("userEmail") || "Restricted",
          role: "USER"
        });
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    setShowProfileModal(false);
    toast.info("Securely logged out.");
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear(); // Clear session flags too
      window.dispatchEvent(new Event("storage"));
      setIsLoggedIn(false);
      navigate("/login");
    }, 1500);
  };

  const handleInputChange = (value) => {
    setInput(value);
    if (showNoProductsMessage) setShowNoProductsMessage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    
    setShowNoProductsMessage(false);
    try {
      const response = await axios.get(`${baseUrl}/api/product/search?keyword=${input}`);
      if (response.data.length === 0) setShowNoProductsMessage(true);
      else navigate(`/search-results`, { state: { searchData: response.data } });
    } catch (error) {
      console.error("Error searching:", error);
      setShowNoProductsMessage(true);
    }
  };

  return (
    <>
      <style>
        {`
          .luxury-nav-item { transition: all 0.3s ease; position: relative; }
          .luxury-nav-item::after { content: ''; position: absolute; bottom: 4px; left: 50%; width: 0%; height: 1px; background: #C5A059; transition: all 0.3s ease; transform: translateX(-50%); }
          .luxury-nav-item:hover::after { width: 40%; }
          .luxury-search-input:focus { border-color: #111111 !important; }
        `}
      </style>
      <nav className="px-5 py-3" style={{ background: "rgba(252, 252, 252, 0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #EAEAEA", position: "sticky", top: 0, zIndex: 9999, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div className="container-fluid d-flex align-items-center justify-content-between gap-4">

          <div className="d-flex align-items-center">
            <div onClick={() => navigate('/')} style={{ textDecoration: "none", position: "relative", zIndex: 20, cursor: "pointer" }}>
              <span className="luxury-serif" style={{ fontSize: "28px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span></span>
            </div>
          </div>

          <form className="flex-grow-1" style={{ maxWidth: "500px" }} role="search" onSubmit={handleSubmit}>
            <div style={{ display: "flex", alignItems: "center", background: "transparent", border: "1px solid #EAEAEA", padding: "4px 4px 4px 16px", transition: "border-color 0.3s ease" }} className="luxury-search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="search" style={{ border: "none", background: "transparent", outline: "none", width: "100%", padding: "10px 12px", fontSize: "13px", color: "#111111", fontWeight: "400", letterSpacing: "0.5px" }} placeholder="Search curations..." value={input} onChange={(e) => handleInputChange(e.target.value)} />
              <button type="submit" style={{ background: "#111111", color: "#FFFFFF", border: "1px solid #111111", padding: "10px 24px", fontSize: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase", letterSpacing: "1px", position: "relative", zIndex: 20 }} onMouseEnter={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111111"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; e.currentTarget.style.color = "#FFFFFF"; }}>Search</button>
            </div>
          </form>

          <div className="d-flex align-items-center gap-4" style={{ flexShrink: 0, position: "relative", zIndex: 20 }}>
            <div onClick={() => navigate('/')} className="luxury-nav-item" style={{ fontSize: "11px", fontWeight: "600", color: "#111111", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", padding: "8px" }}>Home</div>
            <div onClick={() => navigate('/orders')} className="luxury-nav-item" style={{ fontSize: "11px", fontWeight: "600", color: "#111111", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", padding: "8px" }}>Orders</div>
            <div style={{ width: "1px", height: "16px", background: "#EAEAEA", margin: "0 8px" }}></div>

            {isLoggedIn ? (
              <div onClick={() => setShowProfileModal(!showProfileModal)} style={{ color: "#111111", cursor: "pointer", padding: "8px", transition: "color 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"} onMouseLeave={(e) => e.currentTarget.style.color = "#111111"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            ) : (
              <div onClick={() => navigate('/login')} style={{ color: "#111111", cursor: "pointer", padding: "8px", transition: "color 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"} onMouseLeave={(e) => e.currentTarget.style.color = "#111111"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            )}

            <div onClick={() => navigate('/cart')} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#111111", cursor: "pointer", padding: "8px", transition: "color 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#C5A059"} onMouseLeave={(e) => e.currentTarget.style.color = "#111111"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Bag</span>
            </div>
          </div>
        </div>

        {showProfileModal && (
          <div style={{ position: "absolute", top: "100%", right: "20px", marginTop: "12px", background: "#FFFFFF", border: "1px solid #EAEAEA", padding: "32px", minWidth: "300px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", zIndex: 99999 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div className="luxury-serif" style={{ fontSize: "20px", color: "#111" }}>Account<span style={{color: "#C5A059"}}>.</span></div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>&times;</button>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Full Name</div>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#111111" }}>{userDetails.name}</div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Email Address</div>
              <div style={{ fontSize: "14px", fontWeight: "400", color: "#666666" }}>{userDetails.email}</div>
            </div>
            <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Role</div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#C5A059", textTransform: "uppercase" }}>{userDetails.role}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Status</div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#28a745", textTransform: "uppercase" }}>Active</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #EAEAEA", paddingTop: "24px" }}>
              <button onClick={handleLogout} style={{ background: "#111111", color: "#FFFFFF", padding: "14px", width: "100%", border: "none", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer" }}>Secure Log Out</button>
            </div>
          </div>
        )}

        {showNoProductsMessage && (
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "16px", background: "#111111", color: "#FFFFFF", padding: "12px 32px", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #333" }}>
            <span style={{ color: "#C5A059" }}>✦</span> No curations found matching your search.
          </div>
        )}
      </nav>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
    </>
  );
};

export default Navbar;