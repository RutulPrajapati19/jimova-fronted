import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutGrid, Laptop, Smartphone, Plug,
  Gamepad2, Shirt, Headphones, ChevronLeft, ChevronRight, ArrowUpRight,
} from "lucide-react";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

const CATEGORIES = [
  { name: "All",         icon: <LayoutGrid  size={20} strokeWidth={1} /> },
  { name: "Laptop",      icon: <Laptop      size={20} strokeWidth={1} /> },
  { name: "Mobile",      icon: <Smartphone  size={20} strokeWidth={1} /> },
  { name: "Electronics", icon: <Plug        size={20} strokeWidth={1} /> },
  { name: "Toys",        icon: <Gamepad2    size={20} strokeWidth={1} /> },
  { name: "Fashion",     icon: <Shirt       size={20} strokeWidth={1} /> },
  { name: "Headphone",   icon: <Headphones  size={20} strokeWidth={1} /> },
];

const SMART_KEYWORDS = {
  laptop:      ["macbook","dell","xps","thinkpad","asus","acer","hp","victus"],
  mobile:      ["iphone","galaxy","samsung","pixel","smartphone","phone"],
  electronics: ["macbook","iphone","galaxy","dell","xps","headphone","watch","tv"],
  toys:        ["lego","action figure","doll","game","puzzle"],
  fashion:     ["levi","jeans","shirt","t-shirt","clothing","apparel","shoes"],
  headphone:   ["earbuds","airpods","sony","bose","audio","headset"],
};

const Home = ({ selectedCategory }) => {
  const { addToCart }   = useContext(AppContext);
  const navigate        = useNavigate();
  const scrollRef       = useRef(null);

  const [products, setProducts]         = useState([]);
  const [isError, setIsError]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showToast, setShowToast]       = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");
  const [heroVisible, setHeroVisible]   = useState(false);

  useEffect(() => { if (selectedCategory) setActiveCategory(selectedCategory); }, [selectedCategory]);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/products?pageSize=200&sortBy=id&sortDir=desc`)
      .then(r => { setProducts(r.data.content || []); setIsError(false); })
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => {
        const target = activeCategory.toLowerCase().trim();
        const pCat   = (p.categoryName || "").toLowerCase().trim();
        if (pCat === target || pCat.includes(target)) return true;
        const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();
        if (text.includes(target)) return true;
        return (SMART_KEYWORDS[target] || []).some(kw => text.includes(kw));
      });

  const bestSellers = products.slice(0, 10);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
      <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom, transparent, #C5A059)", animation: "pulseBar 1.4s ease-in-out infinite" }} />
      <div style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "4px", textTransform: "uppercase" }}>Curating</div>
      <style>{`@keyframes pulseBar { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ minHeight: "100vh", background: "#FCFCFC", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <img src={unplugged} alt="Error" width="64" style={{ opacity: 0.3 }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#111", fontWeight: "400" }}>Archive Unavailable</div>
      <div style={{ fontSize: "10px", color: "#999", letterSpacing: "2px", textTransform: "uppercase" }}>Verify server connection</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        .jm-serif  { font-family: 'Playfair Display', serif; }
        .jm-sans   { font-family: 'Inter', sans-serif; }

        .jm-hero-in {
          opacity: 0; transform: translateY(28px);
          transition: opacity 1s cubic-bezier(0.25,1,0.5,1), transform 1s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-hero-in.visible { opacity: 1; transform: translateY(0); }
        .jm-hero-in.delay-1.visible { transition-delay: 0.12s; }

        .jm-scroll-strip { overflow-x: auto; display: flex; gap: 20px; padding: 4px 2px 32px; scroll-behavior: smooth; }
        .jm-scroll-strip::-webkit-scrollbar { display: none; }
        .jm-scroll-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 90%, transparent 100%);
        }

        .jm-card {
          position: relative; cursor: pointer; overflow: hidden;
          background: #FFFFFF; border: 1px solid #EBEBEB;
          transition: border-color 0.4s ease, transform 0.5s cubic-bezier(0.25,1,0.5,1), box-shadow 0.5s ease;
          display: flex; flex-direction: column;
        }
        .jm-card:hover {
          border-color: #C5A059;
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.07);
        }
        .jm-card:active { transform: translateY(-2px) scale(0.99); }

        .jm-card-img { transition: transform 0.8s cubic-bezier(0.25,1,0.5,1); }
        .jm-card:hover .jm-card-img { transform: scale(1.07); }

        .jm-price-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(17,17,17,0.96);
          padding: 14px 18px;
          transform: translateY(100%);
          transition: transform 0.45s cubic-bezier(0.25,1,0.5,1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .jm-card:hover .jm-price-bar { transform: translateY(0); }

        .jm-add-btn {
          position: relative; overflow: hidden; z-index: 1;
          transition: color 0.35s ease;
        }
        .jm-add-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; z-index: -1;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-add-btn:hover:not(:disabled)::after { transform: scaleX(1); }
        .jm-add-btn:hover:not(:disabled) { color: #111111 !important; border-color: #C5A059 !important; }
        .jm-add-btn:active:not(:disabled) { transform: scale(0.95); }

        .jm-add-btn-solid {
          position: relative; overflow: hidden; z-index: 1;
          transition: color 0.35s ease;
        }
        .jm-add-btn-solid::after {
          content: ''; position: absolute; inset: 0;
          background: #111111; z-index: -1;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-add-btn-solid:hover:not(:disabled)::after { transform: scaleX(1); }
        .jm-add-btn-solid:hover:not(:disabled) { color: #FFFFFF !important; border-color: #111111 !important; }

        .jm-arrow {
          width: 38px; height: 38px; border: 1px solid #D0D0D0;
          background: transparent; cursor: pointer; color: #111;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        .jm-arrow:hover { background: #111; color: #fff; border-color: #111; }

        .jm-cat {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          cursor: pointer; min-width: 80px;
        }
        .jm-cat-icon {
          width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #E8E8E8; background: #FAFAFA;
          transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-cat:hover .jm-cat-icon { border-color: #C5A059; transform: translateY(-4px); color: #C5A059; }
        .jm-cat.active .jm-cat-icon { background: #111; color: #C5A059; border-color: #111; transform: translateY(-4px); }
        .jm-cat-label {
          font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #AAAAAA;
          transition: color 0.3s ease;
        }
        .jm-cat:hover .jm-cat-label { color: #111; }
        .jm-cat.active .jm-cat-label { color: #111; }

        .jm-gold-line { width: 32px; height: 1px; background: #C5A059; display: inline-block; }

        .jm-eyebrow {
          font-size: 9px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #C5A059;
        }

        .jm-badge-out { position: absolute; top: 12px; left: 0; background: #AAAAAA; color: #FFF; font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; }
        .jm-badge-low { position: absolute; top: 12px; left: 0; background: #111; color: #C5A059; font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; }

        .jm-rule { border: none; border-top: 1px solid #EBEBEB; margin: 0; }

        .jm-toast {
          position: fixed; top: 88px; right: 24px; z-index: 10000;
          background: #111111; color: #FFF; border: 1px solid #2A2A2A;
          padding: 16px 20px; display: flex; align-items: center; gap: 14px;
          min-width: 300px; max-width: 360px;
          box-shadow: 0 24px 56px rgba(0,0,0,0.2);
          transition: all 0.5s cubic-bezier(0.25,1,0.5,1);
          pointer-events: none;
        }
        .jm-toast.in  { opacity: 1; transform: translateX(0); pointer-events: auto; }
        .jm-toast.out { opacity: 0; transform: translateX(48px); }

        .jm-cat-scroll { overflow-x: auto; display: flex; gap: 12px; padding: 8px 4px 20px; }
        .jm-cat-scroll::-webkit-scrollbar { display: none; }

        /* ── BRAND MANIFESTO PANEL (fills hero right column) ── */
        .jm-manifesto-panel {
          position: relative;
          background: #111111;
          padding: 44px 40px 36px;
          overflow: hidden;
          isolation: isolate;
        }
        .jm-manifesto-num {
          position: absolute;
          top: -18px;
          right: 8px;
          font-size: 130px;
          font-weight: 700;
          color: transparent;
          -webkit-text-stroke: 1px #232323;
          line-height: 1;
          z-index: 0;
          user-select: none;
          pointer-events: none;
        }
        .jm-manifesto-corner {
          position: absolute;
          width: 22px; height: 22px;
          border: 1px solid #C5A059;
          opacity: 0.6;
          z-index: 2;
        }
        .jm-manifesto-corner-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
        .jm-manifesto-corner-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }
        .jm-manifesto-cta {
          position: relative; z-index: 1;
          margin-top: 34px;
          width: 100%;
          background: transparent;
          border: 1px solid #2E2E2E;
          color: #FFFFFF;
          padding: 15px 20px;
          font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.35s ease;
        }
        .jm-manifesto-cta:hover {
          background: #C5A059;
          border-color: #C5A059;
          color: #111111;
        }

        @media (max-width: 900px) {
          .jm-hero-grid { grid-template-columns: 1fr !important; }
          .jm-manifesto-num { font-size: 100px; }
        }
      `}</style>


      <div className={`jm-toast jm-sans ${showToast ? "in" : "out"}`}>
        {toastProduct && (
          <>
            <div style={{ width: "44px", height: "44px", background: "#FFF", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
              <img src={toastProduct.imageUrl || unplugged} alt={toastProduct.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.src = unplugged} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="jm-serif" style={{ fontSize: "14px", fontWeight: "500", lineHeight: 1.2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{toastProduct.name}</div>
              <div style={{ fontSize: "9px", color: "#C5A059", marginTop: "5px", letterSpacing: "2px", textTransform: "uppercase" }}>Added to your bag</div>
            </div>
            <div style={{ color: "#C5A059", fontSize: "14px", flexShrink: 0 }}>✦</div>
          </>
        )}
      </div>

      <div style={{ background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

        {/* HERO */}
        <div style={{ padding: "0 6%", background: "#FCFCFC", borderBottom: "1px solid #EBEBEB", position: "relative", overflow: "hidden" }}>

          <div className="jm-serif" aria-hidden style={{ position: "absolute", right: "2%", top: "8%", fontSize: "clamp(100px, 14vw, 180px)", fontWeight: "700", color: "transparent", WebkitTextStroke: "1px #EFEFEF", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-6px", zIndex: 0 }}>26</div>

          <div style={{ position: "absolute", left: "6%", top: 0, width: "1px", height: "100%", background: "linear-gradient(to bottom, transparent, #C5A059 30%, #C5A059 70%, transparent)" }} />

          <div
            className="jm-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: "64px",
              padding: "80px 0 80px 48px",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div className={`jm-hero-in ${heroVisible ? "visible" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                <span className="jm-gold-line" />
                <span className="jm-eyebrow jm-sans">The Jimova Edit — 2026</span>
              </div>

              <h1 className="jm-serif" style={{ fontSize: "clamp(48px, 5.5vw, 74px)", fontWeight: "400", lineHeight: 1.05, letterSpacing: "-1px", color: "#0D0D0D", margin: "0 0 8px" }}>
                Premium
              </h1>
              <h1 className="jm-serif" style={{ fontSize: "clamp(48px, 5.5vw, 74px)", fontWeight: "400", lineHeight: 1.05, letterSpacing: "-1px", color: "#0D0D0D", margin: "0 0 32px", fontStyle: "italic" }}>
                <span style={{ color: "#C5A059" }}>Essentials.</span>
              </h1>

              <p className="jm-sans" style={{ fontSize: "14px", fontWeight: "300", color: "#777", lineHeight: 1.9, maxWidth: "440px", margin: "0 0 40px", letterSpacing: "0.3px" }}>
                Not everything deserves a place in your life. These do. Each piece is selected for its lasting worth — beyond trend, beyond season.
              </p>

              <div style={{ display: "flex", gap: "0", borderTop: "1px solid #EBEBEB", paddingTop: "32px" }}>
                {[
                  { n: `${products.length}+`, l: "Products" },
                  { n: `${CATEGORIES.length - 1}`,  l: "Categories" },
                  { n: "Free", l: "Shipping" },
                  { n: "2026", l: "Collection" },
                ].map((s, i, arr) => (
                  <div key={i} style={{ flex: 1, paddingRight: "24px", marginRight: i < arr.length - 1 ? "24px" : 0, borderRight: i < arr.length - 1 ? "1px solid #EBEBEB" : "none" }}>
                    <div className="jm-serif" style={{ fontSize: "clamp(20px,2.3vw,28px)", fontWeight: "500", color: "#111", letterSpacing: "-0.5px", lineHeight: 1 }}>{s.n}</div>
                    <div className="jm-sans" style={{ fontSize: "9px", color: "#AAAAAA", letterSpacing: "2px", textTransform: "uppercase", marginTop: "6px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand manifesto panel — always present, never depends on stock/products */}
            <div className={`jm-hero-in delay-1 ${heroVisible ? "visible" : ""}`}>
              <div className="jm-manifesto-panel">
                <div className="jm-manifesto-corner jm-manifesto-corner-tl" />
                <div className="jm-manifesto-corner jm-manifesto-corner-br" />

                <div className="jm-serif jm-manifesto-num" aria-hidden>01</div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="jm-eyebrow jm-sans" style={{ color: "#C5A059", marginBottom: "20px" }}>The Standard</div>
                  <div className="jm-serif" style={{ fontSize: "26px", lineHeight: 1.35, color: "#FFFFFF", fontWeight: "400", letterSpacing: "-0.2px" }}>
                    Quality is not what we add.<br />
                    It's what we <span style={{ color: "#C5A059", fontStyle: "italic" }}>refuse</span> to compromise.
                  </div>

                  <div className="jm-rule" style={{ borderColor: "#2A2A2A", margin: "36px 0 28px" }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {[
                      "Every piece inspected before listing",
                      "Sourced for longevity, not trend cycles",
                      "Packed and shipped within 24 hours",
                    ].map((line, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ width: "5px", height: "5px", background: "#C5A059", flexShrink: 0, transform: "rotate(45deg)" }} />
                        <span className="jm-sans" style={{ fontSize: "12px", color: "#BBBBBB", letterSpacing: "0.3px" }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="jm-manifesto-cta jm-sans"
                  onClick={() => {
                    document.getElementById("jm-curations-anchor")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore the Collection
                  <ArrowUpRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BEST SELLERS */}
        {activeCategory === "All" && bestSellers.length > 0 && (
          <div style={{ padding: "80px 6% 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
              <div>
                <div className="jm-eyebrow jm-sans" style={{ marginBottom: "8px" }}>Icon Series</div>
                <h2 className="jm-serif" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: "400", color: "#111", margin: 0, letterSpacing: "-0.3px" }}>Best Sellers</h2>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button className="jm-arrow" onClick={() => scroll("left")}  aria-label="Prev"><ChevronLeft  size={16} strokeWidth={1.5} /></button>
                <button className="jm-arrow" onClick={() => scroll("right")} aria-label="Next"><ChevronRight size={16} strokeWidth={1.5} /></button>
              </div>
            </div>

            <div className="jm-scroll-strip jm-scroll-mask" ref={scrollRef}>
              {bestSellers.map((p, i) => {
                const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                const isOut = stockQuantity === 0;
                const isLow = !isOut && stockQuantity <= 5;
                return (
                  <div key={`bs-${id}-${i}`} className="jm-card" style={{ width: "260px", flexShrink: 0 }} onClick={() => navigate(`/product/${id}`)}>
                    <div style={{ background: "#F5F5F5", aspectRatio: "4/5", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth: "76%", maxHeight: "76%", objectFit: "contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                      {isOut && <div className="jm-badge-out">Sold Out</div>}
                      {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}
                      <div className="jm-price-bar">
                        <div>
                          <div className="jm-sans" style={{ fontSize: "9px", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>{categoryName}</div>
                          <div className="jm-sans" style={{ fontSize: "16px", fontWeight: "600", color: "#FFF" }}>₹{price.toLocaleString("en-IN")}</div>
                        </div>
                        <button
                          className="jm-add-btn jm-sans"
                          onClick={(e) => handleAddToCart(e, p)}
                          disabled={isOut}
                          style={{ padding: "9px 18px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background: "transparent", color: "#C5A059", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: isOut ? "not-allowed" : "pointer" }}
                        >
                          {isOut ? "Sold Out" : "Add"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px 20px" }}>
                      <div className="jm-sans" style={{ fontSize: "9px", color: "#C5A059", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>{categoryName}</div>
                      <div className="jm-serif" style={{ fontSize: "15px", fontWeight: "500", color: "#111", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div id="jm-curations-anchor" style={{ padding: "80px 6% 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "24px", marginBottom: "36px" }}>
            <div>
              <div className="jm-eyebrow jm-sans" style={{ marginBottom: "8px" }}>Shop by</div>
              <h2 className="jm-serif" style={{ fontSize: "clamp(24px,2.8vw,32px)", fontWeight: "400", color: "#111", margin: 0 }}>Curations</h2>
            </div>
            <div style={{ flex: 1, height: "1px", background: "#EBEBEB", marginBottom: "8px" }} />
          </div>

          <div className="jm-cat-scroll">
            {CATEGORIES.map((cat, i) => {
              const isActive = activeCategory === cat.name;
              return (
                <div key={i} className={`jm-cat ${isActive ? "active" : ""}`} onClick={() => setActiveCategory(cat.name)}>
                  <div className="jm-cat-icon" style={{ color: isActive ? "#C5A059" : "#555" }}>{cat.icon}</div>
                  <span className={`jm-cat-label jm-sans ${isActive ? "active" : ""}`} style={{ color: isActive ? "#111" : "#AAA" }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EDITORIAL BAND */}
        <div style={{ margin: "60px 6% 0", background: "#111111", padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div className="jm-eyebrow jm-sans" style={{ color: "#C5A059", marginBottom: "10px" }}>Promise</div>
            <div className="jm-serif" style={{ fontSize: "clamp(20px,2.5vw,28px)", color: "#FFFFFF", fontWeight: "400", letterSpacing: "-0.3px" }}>Curated with intent.<br /><span style={{ fontStyle: "italic", color: "#C5A059" }}>Delivered with care.</span></div>
          </div>
          <div style={{ display: "flex", gap: "48px" }}>
            {[
              { icon: "◈", label: "Verified Products" },
              { icon: "◉", label: "Secure Checkout" },
              { icon: "◎", label: "Free Returns" },
            ].map((f, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", color: "#C5A059", marginBottom: "8px" }}>{f.icon}</div>
                <div className="jm-sans" style={{ fontSize: "9px", fontWeight: "600", color: "#888", letterSpacing: "1.5px", textTransform: "uppercase" }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div style={{ padding: "60px 6% 0" }}>

          {filteredProducts.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: "1px solid #EBEBEB", marginBottom: "32px" }}>
              <div className="jm-sans" style={{ fontSize: "10px", color: "#AAAAAA", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600" }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}{activeCategory !== "All" ? ` · ${activeCategory}` : ""}
              </div>
              <span className="jm-gold-line" />
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "100px 20px", border: "1px dashed #D8D8D8" }}>
              <div className="jm-serif" style={{ fontSize: "22px", color: "#111", fontWeight: "400", marginBottom: "12px" }}>No pieces found.</div>
              <div className="jm-sans" style={{ fontSize: "10px", color: "#AAA", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "28px" }}>Explore another curation</div>
              <button className="jm-sans" onClick={() => setActiveCategory("All")} style={{ background: "#111", color: "#FFF", border: "none", padding: "12px 32px", fontSize: "9px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer" }}>View All</button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
            {filteredProducts.map(p => {
              const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
              const isOut = stockQuantity === 0;
              const isLow = !isOut && stockQuantity <= 5;
              return (
                <div key={id} className="jm-card" onClick={() => navigate(`/product/${id}`)}>
                  <div style={{ background: "#F5F5F5", aspectRatio: "1/1", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth: "74%", maxHeight: "74%", objectFit: "contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                    {isOut && <div className="jm-badge-out">Sold Out</div>}
                    {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}

                    <div className="jm-price-bar">
                      <div>
                        <div className="jm-sans" style={{ fontSize: "9px", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "2px" }}>{categoryName}</div>
                        <div className="jm-sans" style={{ fontSize: "17px", fontWeight: "600", color: "#FFF" }}>₹{price.toLocaleString("en-IN")}</div>
                      </div>
                      <button
                        className="jm-add-btn jm-sans"
                        onClick={(e) => handleAddToCart(e, p)}
                        disabled={isOut}
                        style={{ padding: "9px 18px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background: "transparent", color: "#C5A059", fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: isOut ? "not-allowed" : "pointer" }}
                      >
                        {isOut ? "Sold Out" : "Add"}
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: "18px 20px 22px" }}>
                    <div className="jm-sans" style={{ fontSize: "9px", color: "#C5A059", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "7px" }}>{categoryName}</div>
                    <div className="jm-serif" style={{ fontSize: "15px", fontWeight: "500", color: "#111", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "42px" }}>{name}</div>
                    <div className="jm-sans" style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "14px", letterSpacing: "-0.2px" }}>₹{price.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ margin: "100px 6% 0", paddingTop: "40px", paddingBottom: "60px", borderTop: "1px solid #EBEBEB", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div className="jm-serif" style={{ fontSize: "22px", color: "#111", fontWeight: "400" }}>
            Jimova<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
          </div>
          <div className="jm-sans" style={{ fontSize: "9px", color: "#CCCCCC", letterSpacing: "2px", textTransform: "uppercase" }}>
            © 2026 Jimova. All rights reserved.
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;