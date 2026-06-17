import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(AppContext);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✦ FIX: Hitting the correct plural endpoint ✦
        const response = await axios.get(`${baseUrl}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, baseUrl]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success("Added to your Bag.");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Inter', sans-serif" }}>Loading curation...</div>;
  if (!product) return <div style={{ textAlign: "center", padding: "100px", fontFamily: "'Inter', sans-serif" }}>Product not found.</div>;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }
          .luxury-btn { transition: all 0.3s ease; }
          .luxury-btn:hover { background: transparent !important; color: #111111 !important; }
        `}
      </style>
      <div style={{ padding: "80px 6%", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", marginBottom: "40px", color: "#666" }}>
          ← Back
        </button>

        <div className="row">
          <div className="col-md-6" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#F8F8F8", padding: "40px", border: "1px solid #EAEAEA" }}>
            {/* ✦ FIX: Using Cloudinary imageUrl ✦ */}
            <img src={product.imageUrl || '/fallback-image.jpg'} alt={product.name} style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }} />
          </div>
          
          <div className="col-md-6" style={{ padding: "40px" }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" }}>{product.categoryName || 'Curation'}</div>
            <h1 className="luxury-serif" style={{ fontSize: "40px", color: "#111111", marginBottom: "16px" }}>{product.name}</h1>
            <div style={{ fontSize: "24px", color: "#111111", marginBottom: "32px" }}>₹{product.price?.toLocaleString('en-IN') || product.price}</div>
            
            <p style={{ color: "#666666", lineHeight: "1.8", marginBottom: "40px" }}>{product.description}</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: product.stockQuantity > 0 ? "#28a745" : "#dc3545", textTransform: "uppercase", letterSpacing: "1px" }}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
              </span>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={product.stockQuantity <= 0}
              className="luxury-btn" 
              style={{ width: "100%", padding: "20px", background: product.stockQuantity > 0 ? "#111111" : "#EAEAEA", color: product.stockQuantity > 0 ? "#FFFFFF" : "#999999", border: "1px solid #111111", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: product.stockQuantity > 0 ? "pointer" : "not-allowed" }}
            >
              {product.stockQuantity > 0 ? "Add to Bag" : "Currently Unavailable"}
            </button>
          </div>
        </div>
        <ToastContainer position="top-right" style={{ marginTop: "90px" }} />
      </div>
    </>
  );
};

export default Product;