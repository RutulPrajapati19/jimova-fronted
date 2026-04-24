import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api"; // ✦ IMPORT THE SECURE API CONFIG ✦
import { 
  LayoutGrid, 
  Laptop, 
  Smartphone, 
  Plug, 
  Gamepad2, 
  Shirt, 
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

// ✦ LUXURY CATEGORY ICONS ✦
const categories = [
  { name: "All", icon: <LayoutGrid size={24} strokeWidth={1} /> },
  { name: "Laptop", icon: <Laptop size={24} strokeWidth={1} /> },
  { name: "Mobile", icon: <Smartphone size={24} strokeWidth={1} /> },
  { name: "Electronics", icon: <Plug size={24} strokeWidth={1} /> },
  { name: "Toys", icon: <Gamepad2 size={24} strokeWidth={1} /> },
  { name: "Fashion", icon: <Shirt size={24} strokeWidth={1} /> },
  { name: "Headphone", icon: <Headphones size={24} strokeWidth={1} /> }
];

const Home = ({ selectedCategory }) => {
  const { addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]); // ✦ LOCAL STATE FOR API DATA ✦
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // ✦ FETCH DATA USING SECURE API INTERCEPTOR ✦
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products");
        setProducts(response.data);
        setIsError(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    if (!base64String) return unplugged;
    if (base64String.startsWith('data:')) return base64String;
    if (base64String.startsWith('http')) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); 
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; 
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const safeData = Array.isArray(products) ? products : [];
  
  const filteredProducts = activeCategory === "All"
    ? safeData
    : safeData.filter((product) => {
        const target = activeCategory.toLowerCase().trim();
        let pCat = "";
        if (typeof product.category === 'string') pCat = product.category;
        else if (typeof product.category === 'object' && product.category !== null) pCat = product.category.name || "";
        else if (typeof product.Category === 'string') pCat = product.Category;

        pCat = pCat.toLowerCase().trim();
        if (pCat && (pCat === target || pCat.equals?.(target) || pCat.includes(target))) return true;

        const fallbackSearch = `${product.name || ""} ${product.brand || ""} ${product.description || ""}`.toLowerCase();
        if (fallbackSearch.includes(target)) return true;

        const smartKeywords = {
          laptop: ["macbook", "dell", "xps", "thinkpad", "asus", "acer", "hp"],
          mobile: ["iphone", "galaxy", "samsung", "pixel", "smartphone", "phone"],
          electronics: ["macbook", "iphone", "galaxy", "dell", "xps", "headphone", "watch", "tv"],
          toys: ["lego", "action figure", "doll", "game", "puzzle"],
          fashion: ["levi", "jeans", "shirt", "t-shirt", "clothing", "apparel", "shoes"],
          headphone: ["earbuds", "airpods", "sony", "bose", "audio", "headset"]
        };

        if (smartKeywords[target]) return smartKeywords[target].some(keyword => fallbackSearch.includes(keyword));
        return false;
      });

  const bestSellers = safeData.slice(0, 10);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh", background: "#FCFCFC" }}>
        <div className="spinner-border" style={{ color: "#111111", width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <img src={unplugged} alt="Error" className="img-fluid" width="100" />
          <h4 className="luxury-serif mt-3" style={{letterSpacing: "1px"}}>ARCHIVE UNAVAILABLE</h4>
          <p style={{fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px"}}>Please verify server connection</p>
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

          /* ✦ LUXURY CAROUSEL NAVIGATION ✦ */
          .best-sellers-container {
            display: flex;
            gap: 24px;
            overflow-x: auto;
            scroll-behavior: smooth;
            padding: 4px 24px 32px 4px;
            margin: -4px -24px -24px -4px; 
            -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
            mask-image: linear-gradient(to right, black 85%, transparent 100%);
          }
          
          .best-sellers-container::-webkit-scrollbar {
            display: none;
          }
          
          .jimova-nav-btn {
            width: 44px;
            height: 44px;
            border-radius: 0px; 
            background: transparent;
            border: 1px solid #111111;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #111111;
            transition: all 0.4s ease;
            outline: none;
          }
          
          .jimova-nav-btn:hover {
            background: #111111;
            color: #FFFFFF;
          }
          
          .jimova-nav-btn:active {
            transform: scale(0.96);
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

          .category-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .jimova-cat-wrapper {
            cursor: pointer;
          }
          .jimova-cat-card {
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .jimova-cat-wrapper:hover:not(:active) .jimova-cat-card {
            border-color: #111111;
            transform: translateY(-4px);
          }
          .jimova-cat-wrapper:active .jimova-cat-card {
            transform: scale(0.96);
          }
        `}
      </style>

      {/* ✦ LUXURY TOAST NOTIFICATION ✦ */}
      <div className="position-fixed end-0 p-4" style={{ zIndex: 10000, top: "80px", pointerEvents: "none" }}>
        <div
          className={`toast ${showToast ? "show" : "hide"}`}
          style={{
            borderRadius: "0px", 
            background: "#111111", 
            color: "#ffffff", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            padding: "16px", 
            minWidth: "320px", 
            transform: showToast ? "translateX(0)" : "translateX(40px)",
            opacity: showToast ? 1 : 0, 
            transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)", 
            border: "1px solid #333333", 
            display: "flex", 
            alignItems: "center",
            pointerEvents: showToast ? "auto" : "none" 
          }}
        >
          {toastProduct && (
            <>
              <div style={{ width: "48px", height: "48px", background: "#ffffff", borderRadius: "0px", overflow: "hidden", marginRight: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <img src={convertBase64ToDataURL(toastProduct.imageData)} alt={toastProduct.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => (e.target.src = unplugged)} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="luxury-serif" style={{ fontSize: "16px", fontWeight: "600", lineHeight: "1.2", letterSpacing: "0.5px" }}>{toastProduct.name}</div>
                <div style={{ fontSize: "11px", color: "#C5A059", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Added to your collection</div>
              </div>
              <div style={{ paddingLeft: "16px", fontSize: "18px", color: "#C5A059" }}>
                ✦
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "80px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", overflowX: "hidden" }}>

        <div style={{ marginBottom: "80px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "40px" }}>
          
          <div style={{ flex: "1 1 min-content" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              marginBottom: "24px",
            }}>
              <span style={{ width: "24px", height: "1px", background: "#C5A059" }}></span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>
                Collection 2026
              </span>
            </div>
            
            <h1 className="luxury-serif" style={{ 
              fontSize: "clamp(48px, 6vw, 72px)", 
              fontWeight: "400", 
              letterSpacing: "-0.5px", 
              lineHeight: "1.1",
              margin: "0",
              color: "#111111"
            }}>
              Premium <br/><span style={{ fontStyle: "italic", color: "#444444" }}>Essentials.</span>
            </h1>
          </div>

          <div style={{ maxWidth: "380px", paddingBottom: "12px", borderLeft: "1px solid #EAEAEA", paddingLeft: "24px" }}>
            <p style={{ 
              color: "#666666", 
              fontSize: "14px", 
              fontWeight: "400", 
              lineHeight: "1.8", 
              margin: 0,
              letterSpacing: "0.5px"
            }}>
              Designed for life. Built to last. Discover the pieces that define the absolute modern standard of luxury. Curated with an obsession for detail and timeless appeal.
            </p>
          </div>
          
        </div>

        {activeCategory === "All" && bestSellers.length > 0 && (
          <div style={{ marginBottom: "80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
              <div>
                <h2 className="luxury-serif" style={{ fontSize: "32px", fontWeight: "400", color: "#111111", margin: 0 }}>
                  Best Sellers
                </h2>
                <div style={{ fontSize: "11px", color: "#888888", fontWeight: "500", marginTop: "8px", textTransform: "uppercase", letterSpacing: "2px" }}>The Icon Series</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => scroll('left')} className="jimova-nav-btn" aria-label="Scroll left">
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button onClick={() => scroll('right')} className="jimova-nav-btn" aria-label="Scroll right">
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            
            <div className="best-sellers-container" ref={scrollRef}>
              {bestSellers.map((product, index) => {
                const { id, brand, name, price, productAvailable, imageData, stockQuantity } = product;
                const isOut = !productAvailable || stockQuantity === 0;

                return (
                  <div key={`bs-${id}-${index}`} onClick={() => navigate(`/product/${id}`)} className="jimova-product-card" style={{ width: "300px", flexShrink: 0 }}>
                    <div style={{ background: "#F8F8F8", borderRadius: "0px", aspectRatio: "4 / 5", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", marginBottom: "24px" }}>
                      <img src={convertBase64ToDataURL(imageData)} alt={name} style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain", opacity: isOut ? 0.4 : 1, transition: "transform 0.7s ease" }} className="product-image" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "0 4px" }}>
                      <div style={{ fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>{brand}</div>
                      <div className="luxury-serif" style={{ fontSize: "18px", fontWeight: "600", color: "#111111", lineHeight: "1.3", height: "46px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "24px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "400", color: "#111111", letterSpacing: "0.5px" }}>₹{price.toLocaleString('en-IN')}</div>
                        <button onClick={(e) => handleAddToCart(e, product)} disabled={isOut} className="jimova-btn-add" style={{ padding: "10px 24px", borderRadius: "0px", border: isOut ? "1px solid #EAEAEA" : "1px solid #111111", background: "transparent", color: isOut ? "#A1A1A6" : "#111111", fontSize: "11px", fontWeight: "600", cursor: isOut ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {isOut ? "Out" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
             <h2 className="luxury-serif" style={{ fontSize: "28px", fontWeight: "400", color: "#111111", margin: 0 }}>
               Curations
             </h2>
             <div style={{ flexGrow: 1, height: "1px", background: "#EAEAEA" }}></div>
          </div>
          
          <div 
            className="d-flex gap-4 py-4 px-2 category-scroll-container" 
            style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "16px", margin: "0 -8px" }}
          >
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat.name;
              
              return (
                <div
                  key={index}
                  className="text-center jimova-cat-wrapper"
                  style={{ minWidth: "100px" }}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  <div
                    className="d-flex align-items-center justify-content-center jimova-cat-card"
                    style={{ 
                      height: "80px", 
                      width: "80px", 
                      margin: "0 auto",
                      borderRadius: "0px", 
                      background: isActive ? "#111111" : "transparent",
                      color: isActive ? "#C5A059" : "#111111",
                      border: isActive ? "1px solid #111111" : "1px solid #EAEAEA",
                      transform: isActive ? "translateY(-4px)" : "translateY(0)"
                    }}
                  >
                    {cat.icon}
                  </div>
                  <small 
                    className="d-block mt-4" 
                    style={{ 
                      fontWeight: isActive ? "600" : "500", 
                      color: isActive ? "#111111" : "#888888",
                      fontSize: "11px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      transition: "color 0.4s ease"
                    }}
                  >
                    {cat.name}
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px", marginTop: "24px" }}>
          
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 20px", background: "transparent", border: "1px dashed #D0D0D0", marginTop: "24px" }}>
              <h3 className="luxury-serif" style={{ fontSize: "24px", fontWeight: "400", color: "#111111", margin: 0 }}>No curated pieces found.</h3>
              <p style={{ color: "#888888", fontSize: "14px", marginTop: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>Explore our other collections for available essentials.</p>
            </div>
          )}

          {filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageData, stockQuantity } = product;
            const isOut = !productAvailable || stockQuantity === 0;

            return (
              <div key={id} onClick={() => navigate(`/product/${id}`)} className="jimova-product-card">
                <div style={{ background: "#F8F8F8", borderRadius: "0px", aspectRatio: "4 / 5", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", marginBottom: "24px" }}>
                  <img src={convertBase64ToDataURL(imageData)} alt={name} style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain", opacity: isOut ? 0.4 : 1 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "0 4px" }}>
                  <div style={{ fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>{brand}</div>
                  <div className="luxury-serif" style={{ fontSize: "18px", fontWeight: "600", color: "#111111", lineHeight: "1.3", height: "46px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "24px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "400", color: "#111111", letterSpacing: "0.5px" }}>₹{price.toLocaleString('en-IN')}</div>
                    <button onClick={(e) => handleAddToCart(e, product)} disabled={isOut} className="jimova-btn-add" style={{ padding: "10px 24px", borderRadius: "0px", border: isOut ? "1px solid #EAEAEA" : "1px solid #111111", background: "transparent", color: isOut ? "#A1A1A6" : "#111111", fontSize: "11px", fontWeight: "600", cursor: isOut ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {isOut ? "Out" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Home;