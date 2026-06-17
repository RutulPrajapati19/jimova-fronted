import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // ✦ FIX: Properly extracting data from state ✦
  const searchResults = location.state?.searchData || [];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }
          .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; border: 1px solid #EAEAEA; background: #FFFFFF; cursor: pointer; }
          .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        `}
      </style>
      <div style={{ padding: "80px 6%", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <h1 className="luxury-serif" style={{ fontSize: "36px", color: "#111111" }}>Search Results<span style={{ color: "#C5A059" }}>.</span></h1>
          <p style={{ color: "#666666", marginTop: "12px" }}>Found {searchResults.length} curations matching your search.</p>
        </div>

        {searchResults.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", border: "1px solid #EAEAEA", background: "#FFFFFF" }}>
            <h5 className="luxury-serif" style={{ fontSize: "20px", color: "#111" }}>No items found.</h5>
            <button onClick={() => navigate('/')} style={{ marginTop: "20px", background: "none", border: "1px solid #111", padding: "12px 24px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}>Back to Essentials</button>
          </div>
        ) : (
          <div className="row g-4">
            {searchResults.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="product-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "250px", background: "#F8F8F8", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                    {/* ✦ FIX: Using Cloudinary imageUrl ✦ */}
                    <img src={product.imageUrl || '/fallback-image.jpg'} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>{product.categoryName || 'Curation'}</div>
                    <div className="luxury-serif" style={{ fontSize: "18px", color: "#111111", marginBottom: "8px" }}>{product.name}</div>
                    <div style={{ marginTop: "auto", fontSize: "14px", fontWeight: "500", color: "#111111" }}>₹{product.price?.toLocaleString('en-IN') || product.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;