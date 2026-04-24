import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";
import unplugged from "../assets/unplugged.png";

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, cart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  
  const [showToast, setShowToast] = useState(false);
  
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/product/${id}`);
        setProduct(response.data);
        console.log(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      const response = await axios.get(
        `${baseUrl}/api/product/${id}/image`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(response.data));
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  const handlAddToCart = () => {
    addToCart(product);
    setShowToast(true); 
  };

  if (!product) {
    return (
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border" style={{ color: "#111111" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }
          
          .luxury-btn {
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative;
            z-index: 1;
            overflow: hidden;
          }
          .luxury-btn::after {
            content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
            background-color: transparent; border: 1px solid #111111; z-index: -1;
            transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .luxury-btn:hover:not(:disabled)::after { transform: translateY(0); }
          .luxury-btn:hover:not(:disabled) { color: #111111 !important; background: transparent !important; }
          .luxury-btn:active:not(:disabled) { transform: scale(0.98); }
        `}
      </style>

      {/* ✦ BULLETPROOF LUXURY TOAST NOTIFICATION ✦ */}
      {/* Hardcoded absolute positioning ensures it can never be hidden or pushed off-screen */}
      <div style={{
        position: "fixed",
        top: "100px", /* Guaranteed to sit perfectly below the Navbar */
        right: showToast ? "24px" : "-400px", /* Hardcoded slide-in/slide-out coordinates */
        zIndex: 9999999, /* Absolute highest layer possible */
        background: "#111111",
        border: "1px solid #333333",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        padding: "16px",
        width: "320px",
        display: "flex",
        alignItems: "center",
        transition: "right 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease",
        opacity: showToast ? 1 : 0,
        pointerEvents: showToast ? "auto" : "none"
      }}>
        <div style={{ width: "48px", height: "48px", background: "#ffffff", borderRadius: "0px", overflow: "hidden", marginRight: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
          <img src={imageUrl || unplugged} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="luxury-serif" style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", lineHeight: "1.2", letterSpacing: "0.5px" }}>{product.name}</div>
          <div style={{ fontSize: "11px", color: "#C5A059", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Added to your collection</div>
        </div>
        <div style={{ paddingLeft: "16px", fontSize: "18px", color: "#C5A059" }}>
          ✦
        </div>
      </div>

      <div style={{
        padding: "100px 6% 120px",
        background: "#FCFCFC", 
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        <div className="row g-5 align-items-center">

          {/* LEFT: IMAGE SHOWCASE */}
          <div className="col-md-6">
            <div style={{
              background: "#F8F8F8",
              borderRadius: "0px",
              padding: "40px",
              border: "1px solid #EAEAEA",
              aspectRatio: "1 / 1", 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden"
              }}>
                <img
                  src={imageUrl || unplugged}
                  alt={product.name}
                  style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="col-md-6">

            {/* BRAND & CATEGORY */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <span style={{
                fontSize: "10px",
                fontWeight: "600",
                color: "#111111",
                border: "1px solid #111111",
                padding: "6px 16px",
                textTransform: "uppercase",
                letterSpacing: "1.5px"
              }}>
                {product.category}
              </span>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                color: "#888888", 
                textTransform: "uppercase", 
                letterSpacing: "1.5px" 
              }}>
                {product.brand}
              </span>
            </div>

            {/* TITLE */}
            <h1 className="luxury-serif" style={{
              fontSize: "clamp(36px, 4vw, 56px)",
              fontWeight: "400",
              color: "#111111",
              letterSpacing: "-0.5px",
              lineHeight: "1.1",
              marginBottom: "24px"
            }}>
              {product.name}
            </h1>

            {/* PRICE */}
            <div style={{
              fontSize: "28px",
              fontWeight: "400",
              color: "#111111",
              letterSpacing: "0.5px",
              marginBottom: "40px"
            }}>
              ₹{product.price?.toLocaleString('en-IN') || product.price}
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginBottom: "40px" }}>
              <h6 style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                color: "#111111", 
                textTransform: "uppercase", 
                letterSpacing: "1.5px", 
                marginBottom: "16px" 
              }}>
                Details
              </h6>
              <p style={{ 
                fontSize: "15px", 
                color: "#666666", 
                lineHeight: "1.8", 
                margin: 0,
                letterSpacing: "0.2px"
              }}>
                {product.description}
              </p>
            </div>

            {/* STOCK & DATE INFO */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "40px", 
              paddingBottom: "40px", 
              borderBottom: "1px solid #EAEAEA" 
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                  Availability
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: product.stockQuantity > 0 ? "#111111" : "#D32F2F" }}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} Remaining` : "Currently Unavailable"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                  Curated
                </span>
                <span style={{ fontSize: "14px", fontWeight: "400", color: "#111111", letterSpacing: "0.5px" }}>
                  {new Date(product.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* ADD TO BAG BUTTON */}
            <button
              onClick={handlAddToCart}
              disabled={!product.productAvailable || product.stockQuantity === 0}
              className={(!product.productAvailable || product.stockQuantity === 0) ? "" : "luxury-btn"}
              style={{
                width: "100%",
                padding: "20px",
                borderRadius: "0px",
                border: (!product.productAvailable || product.stockQuantity === 0) ? "1px solid #EAEAEA" : "1px solid #111111",
                background: (!product.productAvailable || product.stockQuantity === 0) ? "#FAFAFA" : "#111111",
                color: (!product.productAvailable || product.stockQuantity === 0) ? "#999999" : "#FFFFFF",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                cursor: (!product.productAvailable || product.stockQuantity === 0) ? "not-allowed" : "pointer",
                marginBottom: "16px"
              }}
            >
              {product.stockQuantity !== 0 && product.productAvailable ? "Add to Collection" : "Out of Stock"}
            </button>

          </div>
        </div>
      </div>
    </>
  );
};

export default Product;