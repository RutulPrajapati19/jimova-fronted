import unplugged from "../assets/unplugged.png";
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppContext from "../Context/Context"; // ✦ IMPORT APP CONTEXT ✦

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✦ BRING IN ACTUAL CART FUNCTIONALITY ✦
  const { addToCart } = useContext(AppContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✦ ADDED LUXURY TOAST STATE ✦
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  useEffect(() => {
    // ✅ SAFE ACCESS (no crash)
    const data = location?.state?.searchData;

    if (Array.isArray(data)) {
      setSearchData(data);
    } else {
      setSearchData([]); // fallback
    }

    setLoading(false);
  }, [location]);

  // ✦ AUTO-HIDE TOAST ✦
  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  // ✅ IMAGE SAFE FUNCTION
  const convertBase64ToDataURL = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return unplugged;
    if (typeof base64String !== "string") return unplugged;
    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ✦ FIXED: Actually adds product to context instead of just showing a fake toast! ✦
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevents the card click from navigating away
    addToCart(product); // Saves to your global state
    setToastProduct(product); // Sets the data for the luxury popup
    setShowToast(true); // Shows the luxury popup
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border" style={{ color: "#111111" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* ✦ IMPORT LUXURY EDITORIAL FONT ✦ */
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');

          .luxury-serif {
            font-family: 'Playfair Display', serif;
          }

          /* ✦ EDITORIAL PRODUCT CARD HOVERS ✦ */
          .jimova-product-card {
            background: #FFFFFF;
            border-radius: 0px; 
            padding: 16px;
            border: 1px solid #EAEAEA;
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            display: flex;
            flex-direction: column;
            position: relative;
            cursor: pointer;
          }
          .jimova-product-card:hover {
            border-color: #C5A059; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            transform: translateY(-4px);
          }
          .jimova-product-card:active {
            transform: scale(0.99) translateY(0);
          }

          /* Luxury Ghost Button */
          .jimova-btn-add {
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
            z-index: 1;
          }
          .jimova-btn-add::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #111111;
            z-index: -1;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .jimova-btn-add:hover:not(:disabled)::after {
            transform: translateY(0);
          }
          .jimova-btn-add:hover:not(:disabled) {
            color: #FFFFFF !important;
            border-color: #111111 !important;
          }
          .jimova-btn-add:active:not(:disabled) {
            transform: scale(0.96);
          }
        `}
      </style>

      {/* ✦ CUSTOM LUXURY TOAST NOTIFICATION ✦ */}
      <div className="position-fixed end-0 p-4" style={{ zIndex: 999999, top: "90px", pointerEvents: "none" }}>
        <div
          style={{
            borderRadius: "0px", 
            background: "#111111", 
            color: "#ffffff", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            padding: "16px", 
            minWidth: "320px", 
            transform: showToast ? "translateX(0)" : "translateX(120%)",
            opacity: showToast ? 1 : 0, 
            transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)", 
            border: "1px solid #333333", 
            display: "flex", 
            alignItems: "center",
            pointerEvents: showToast ? "auto" : "none" 
          }}
        >
          <div style={{ width: "48px", height: "48px", background: "#ffffff", borderRadius: "0px", overflow: "hidden", marginRight: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
            <img src={toastProduct ? convertBase64ToDataURL(toastProduct.imageData) : unplugged} alt={toastProduct?.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="luxury-serif" style={{ fontSize: "16px", fontWeight: "600", lineHeight: "1.2", letterSpacing: "0.5px" }}>{toastProduct?.name}</div>
            <div style={{ fontSize: "11px", color: "#C5A059", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Added to your collection</div>
          </div>
          <div style={{ paddingLeft: "16px", fontSize: "18px", color: "#C5A059" }}>
            ✦
          </div>
        </div>
      </div>

      <div style={{ padding: "80px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", overflowX: "hidden" }}>
        
        {/* ✦ EDITORIAL HEADER ✦ */}
        <div style={{ marginBottom: "64px", maxWidth: "800px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>
              Curated Results
            </span>
          </div>
          
          <h1 className="luxury-serif" style={{ fontSize: "44px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>
            Search Archives<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          </h1>
          
          {searchData && searchData.length > 0 && (
            <p style={{ marginTop: "12px", color: "#666666", fontSize: "14px", fontWeight: "400", letterSpacing: "0.5px", margin: 0 }}>
              Found {searchData.length} exquisite piece{searchData.length !== 1 ? 's' : ''} matching your inquiry.
            </p>
          )}
        </div>

        {/* ✦ LUXURY PRODUCTS GRID ✦ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px", marginTop: "24px" }}>
          
          {(!searchData || searchData.length === 0) ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 20px", background: "transparent", border: "1px dashed #D0D0D0", marginTop: "24px" }}>
              <h3 className="luxury-serif" style={{ fontSize: "24px", fontWeight: "400", color: "#111111", margin: 0 }}>No pieces found matching your criteria.</h3>
              <p style={{ color: "#888888", fontSize: "14px", marginTop: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>Adjust your search terms to explore the collection.</p>
            </div>
          ) : (
            searchData.map((product) => {
              const desc = product?.description || "";
              const price = product?.price || 0;
              const isOut = !product?.productAvailable || product?.stockQuantity <= 0;

              return (
                <div key={product?.id} onClick={() => handleViewProduct(product?.id)} className="jimova-product-card">
                  
                  {/* IMAGE */}
                  <div style={{ background: "#F8F8F8", borderRadius: "0px", aspectRatio: "4 / 5", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", marginBottom: "24px" }}>
                    <img 
                      src={convertBase64ToDataURL(product?.imageData)} 
                      alt={product?.name || "product"} 
                      style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain", opacity: isOut ? 0.4 : 1, transition: "transform 0.7s ease" }} 
                    />
                  </div>
                  
                  {/* DETAILS */}
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "0 4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                        {product?.brand || "Unknown"}
                      </div>
                      <div style={{ fontSize: "9px", color: "#111111", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", background: "#F2F2F2", padding: "4px 8px" }}>
                        {product?.category || "General"}
                      </div>
                    </div>
                    
                    <div className="luxury-serif" style={{ fontSize: "18px", fontWeight: "600", color: "#111111", lineHeight: "1.3", height: "46px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {product?.name || "No Name"}
                    </div>

                    <div style={{ fontSize: "12px", color: "#888888", marginTop: "8px", height: "36px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.5" }}>
                      {desc}
                    </div>

                    {/* PRICE & ACTION */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "24px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "400", color: "#111111", letterSpacing: "0.5px" }}>
                        ₹{price.toLocaleString("en-IN")}
                      </div>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)} 
                        disabled={isOut} 
                        className="jimova-btn-add" 
                        style={{ 
                          padding: "10px 24px", borderRadius: "0px", 
                          border: isOut ? "1px solid #EAEAEA" : "1px solid #111111", 
                          background: "transparent", color: isOut ? "#A1A1A6" : "#111111", 
                          fontSize: "11px", fontWeight: "600", cursor: isOut ? "not-allowed" : "pointer", 
                          textTransform: "uppercase", letterSpacing: "1px" 
                        }}
                      >
                        {isOut ? "Out" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResults;