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

const SkeletonCard = () => (
  <div style={{ background:"#FFFFFF", border:"1px solid #EBEBEB", display:"flex", flexDirection:"column" }}>
    <div style={{ background:"#F0F0F0", aspectRatio:"1/1", position:"relative", overflow:"hidden" }}>
      <div className="jm-shimmer" style={{ position:"absolute", inset:0 }} />
    </div>
    <div style={{ padding:"18px 20px 22px" }}>
      <div className="jm-shimmer" style={{ height:"8px", width:"60px", background:"#F0F0F0", marginBottom:"10px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"14px", width:"90%", background:"#F0F0F0", marginBottom:"6px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"14px", width:"60%", background:"#F0F0F0", marginBottom:"14px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"14px", width:"40%", background:"#F0F0F0", position:"relative", overflow:"hidden" }} />
    </div>
  </div>
);

const Home = ({ selectedCategory }) => {
  const { addToCart } = useContext(AppContext);
  const navigate      = useNavigate();
  const scrollRef     = useRef(null);

  const [products, setProducts]           = useState([]);
  const [isError, setIsError]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const [showToast, setShowToast]         = useState(false);
  const [toastProduct, setToastProduct]   = useState(null);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");
  const [heroVisible, setHeroVisible]     = useState(false);
  const [countersVisible, setCountersVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => { if (selectedCategory) setActiveCategory(selectedCategory); }, [selectedCategory]);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCountersVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

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

  if (isError) return (
    <div style={{ minHeight:"100vh", background:"#FCFCFC", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <img src={unplugged} alt="Error" width="56" style={{ opacity:0.25 }} />
      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"20px", color:"#111", fontWeight:"400" }}>Archive Unavailable</div>
      <div style={{ fontSize:"10px", color:"#999", letterSpacing:"2px", textTransform:"uppercase" }}>Verify server connection</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .jm-serif { font-family: 'Playfair Display', serif; }
        .jm-sans  { font-family: 'Inter', sans-serif; }

        /* shimmer */
        @keyframes jm-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .jm-shimmer::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: jm-shimmer 1.6s ease-in-out infinite;
        }

        /* hero entrance */
        .jm-hero-in {
          opacity: 0; transform: translateY(32px);
          transition: opacity 1s cubic-bezier(0.25,1,0.5,1), transform 1s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-hero-in.visible { opacity: 1; transform: translateY(0); }
        .jm-hero-in.d1.visible { transition-delay: 0.1s; }
        .jm-hero-in.d2.visible { transition-delay: 0.2s; }
        .jm-hero-in.d3.visible { transition-delay: 0.35s; }

        /* cards */
        .jm-card {
          position: relative; cursor: pointer; overflow: hidden;
          background: #FFFFFF; border: 1px solid #EBEBEB;
          transition: border-color 0.4s ease, transform 0.5s cubic-bezier(0.25,1,0.5,1), box-shadow 0.5s ease;
          display: flex; flex-direction: column;
        }
        .jm-card:hover {
          border-color: #C5A059;
          transform: translateY(-8px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.08);
        }
        .jm-card:active { transform: translateY(-2px) scale(0.99); }
        .jm-card-img { transition: transform 0.9s cubic-bezier(0.25,1,0.5,1); }
        .jm-card:hover .jm-card-img { transform: scale(1.08); }

        /* price bar */
        .jm-price-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(17,17,17,0.97);
          padding: 14px 18px;
          transform: translateY(100%);
          transition: transform 0.45s cubic-bezier(0.25,1,0.5,1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .jm-card:hover .jm-price-bar { transform: translateY(0); }

        /* add button */
        .jm-add-btn {
          position: relative; overflow: hidden; z-index: 1;
          transition: color 0.3s ease;
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

        /* scroll strip */
        .jm-scroll-strip {
          overflow-x: auto; display: flex; gap: 20px;
          padding: 4px 2px 32px; scroll-behavior: smooth;
          scrollbar-width: none;
        }
        .jm-scroll-strip::-webkit-scrollbar { display: none; }
        .jm-scroll-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 92%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 4%, black 92%, transparent 100%);
        }

        /* arrow buttons */
        .jm-arrow {
          width: 38px; height: 38px; border: 1px solid #DDDDDD;
          background: transparent; cursor: pointer; color: #111;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s ease;
        }
        .jm-arrow:hover { background: #111; color: #fff; border-color: #111; }

        /* category icons */
        .jm-cat {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          cursor: pointer; min-width: 76px;
        }
        .jm-cat-icon {
          width: 64px; height: 64px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #E8E8E8; background: #FAFAFA;
          transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
        }
        .jm-cat:hover .jm-cat-icon { border-color: #C5A059; transform: translateY(-4px); color: #C5A059; }
        .jm-cat.active .jm-cat-icon { background: #111111; color: #C5A059; border-color: #111111; transform: translateY(-4px); }
        .jm-cat-label {
          font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #AAAAAA; transition: color 0.25s ease;
        }
        .jm-cat:hover .jm-cat-label { color: #111111; }
        .jm-cat.active .jm-cat-label { color: #111111; }

        /* scrollable cat row */
        .jm-cat-scroll {
          overflow-x: auto; display: flex; gap: 12px; padding: 8px 4px 20px;
          scrollbar-width: none;
        }
        .jm-cat-scroll::-webkit-scrollbar { display: none; }

        /* badges */
        .jm-badge-out { position: absolute; top: 12px; left: 0; background: #AAAAAA; color: #FFF; font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; }
        .jm-badge-low { position: absolute; top: 12px; left: 0; background: #111111; color: #C5A059; font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; }

        /* manifesto */
        .jm-manifesto {
          position: relative; background: #111111;
          padding: 44px 40px 36px; overflow: hidden; isolation: isolate;
        }
        .jm-manifesto-num {
          position: absolute; top: -18px; right: 8px;
          font-size: 130px; font-weight: 700; color: transparent;
          -webkit-text-stroke: 1px #222222; line-height: 1; z-index: 0;
          user-select: none; pointer-events: none;
        }
        .jm-manifesto-corner {
          position: absolute; width: 20px; height: 20px;
          border: 1px solid #C5A059; opacity: 0.5; z-index: 2;
        }
        .jm-manifesto-corner-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
        .jm-manifesto-corner-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }
        .jm-manifesto-cta {
          position: relative; z-index: 1; margin-top: 32px; width: 100%;
          background: transparent; border: 1px solid #2A2A2A; color: #FFFFFF;
          padding: 14px 20px; font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.35s ease; font-family: 'Inter', sans-serif;
        }
        .jm-manifesto-cta:hover { background: #C5A059; border-color: #C5A059; color: #111111; }

        /* custom toast */
        .jm-toast {
          position: fixed; top: 88px; right: 24px; z-index: 10000;
          background: #111111; color: #FFF; border: 1px solid #2A2A2A;
          padding: 16px 20px; display: flex; align-items: center; gap: 14px;
          min-width: 280px; max-width: 340px;
          box-shadow: 0 24px 56px rgba(0,0,0,0.18);
          transition: all 0.5s cubic-bezier(0.25,1,0.5,1);
          pointer-events: none;
        }
        .jm-toast.in  { opacity: 1; transform: translateX(0); pointer-events: auto; }
        .jm-toast.out { opacity: 0; transform: translateX(52px); }

        /* gold line */
        .jm-gold-line { width: 32px; height: 1px; background: #C5A059; display: inline-block; }
        .jm-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; }
        .jm-rule { border: none; border-top: 1px solid #EBEBEB; margin: 0; }

        /* stat counter */
        .jm-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 2.5vw, 32px);
          font-weight: 500; color: #111111;
          letter-spacing: -0.5px; line-height: 1;
          transition: opacity 0.6s ease;
        }

        /* feature strip */
        .jm-feature-strip {
          display: flex; gap: 2px;
          margin: 60px 6% 0;
        }
        .jm-feature-cell {
          flex: 1; background: #FFFFFF; border: 1px solid #EBEBEB;
          padding: 28px 24px;
          display: flex; align-items: flex-start; gap: 16px;
          transition: border-color 0.3s ease;
        }
        .jm-feature-cell:hover { border-color: #C5A059; }
        .jm-feature-icon {
          width: 40px; height: 40px; background: #FAFAFA;
          border: 1px solid #EBEBEB; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* editorial band */
        .jm-band {
          margin: 60px 6% 0; background: #111111;
          padding: 48px; overflow: hidden; position: relative;
        }
        .jm-band::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #C5A059, transparent);
        }

        @media (max-width: 900px) {
          .jm-hero-grid { grid-template-columns: 1fr !important; }
          .jm-manifesto-num { font-size: 100px; }
          .jm-feature-strip { flex-direction: column; }
        }

        @media (max-width: 600px) {
          .jm-feature-strip { display: grid; grid-template-columns: 1fr 1fr; }
          .jm-band { padding: 32px 24px; }
          .jm-band .jm-band-features { display: none; }
        }
      `}</style>

      {/* ── CUSTOM TOAST ── */}
      <div className={`jm-toast jm-sans ${showToast ? "in" : "out"}`}>
        {toastProduct && (
          <>
            <div style={{ width:"44px", height:"44px", background:"#FFFFFF", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px", border:"1px solid #1E1E1E" }}>
              <img src={toastProduct.imageUrl || unplugged} alt={toastProduct.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e => e.target.src = unplugged} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="jm-serif" style={{ fontSize:"14px", fontWeight:"500", lineHeight:1.2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{toastProduct.name}</div>
              <div style={{ fontSize:"9px", color:"#C5A059", marginTop:"5px", letterSpacing:"2px", textTransform:"uppercase" }}>Added to your bag ✦</div>
            </div>
            <button onClick={() => navigate("/cart")} style={{ background:"transparent", border:"1px solid #2A2A2A", color:"#C5A059", padding:"6px 12px", fontSize:"9px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", flexShrink:0, fontFamily:"'Inter', sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#C5A059"; e.currentTarget.style.color="#111"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#C5A059"; }}>
              View
            </button>
          </>
        )}
      </div>

      <div style={{ background:"#FCFCFC", minHeight:"100vh", fontFamily:"'Inter', sans-serif" }}>

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <div style={{ padding:"0 6%", background:"#FCFCFC", borderBottom:"1px solid #EBEBEB", position:"relative", overflow:"hidden" }}>

          {/* decorative watermark */}
          <div className="jm-serif" aria-hidden style={{ position:"absolute", right:"2%", top:"5%", fontSize:"clamp(90px,13vw,170px)", fontWeight:"700", color:"transparent", WebkitTextStroke:"1px #F0F0F0", lineHeight:1, userSelect:"none", pointerEvents:"none", letterSpacing:"-6px", zIndex:0 }}>
            26
          </div>

          {/* left gold rule */}
          <div style={{ position:"absolute", left:"6%", top:0, width:"1px", height:"100%", background:"linear-gradient(to bottom, transparent, #C5A059 25%, #C5A059 75%, transparent)" }} />

          <div className="jm-hero-grid" style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:"60px", padding:"80px 0 80px 48px", alignItems:"center", position:"relative", zIndex:1 }}>

            {/* LEFT — headline */}
            <div>
              <div className={`jm-hero-in ${heroVisible ? "visible" : ""}`} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
                <span className="jm-gold-line" />
                <span className="jm-eyebrow jm-sans">The Jimova Edit — 2026</span>
              </div>

              <div className={`jm-hero-in d1 ${heroVisible ? "visible" : ""}`}>
                <h1 className="jm-serif" style={{ fontSize:"clamp(44px,5.5vw,72px)", fontWeight:"400", lineHeight:1.04, letterSpacing:"-1px", color:"#0D0D0D", margin:"0 0 4px" }}>
                  Premium
                </h1>
                <h1 className="jm-serif" style={{ fontSize:"clamp(44px,5.5vw,72px)", fontWeight:"400", lineHeight:1.04, letterSpacing:"-1px", color:"#0D0D0D", margin:"0 0 28px", fontStyle:"italic" }}>
                  <span style={{ color:"#C5A059" }}>Essentials.</span>
                </h1>
                <p className="jm-sans" style={{ fontSize:"14px", fontWeight:"300", color:"#777777", lineHeight:1.9, maxWidth:"420px", margin:"0 0 36px", letterSpacing:"0.2px" }}>
                  Not everything deserves a place in your life. These do. Each piece is selected for its lasting worth — beyond trend, beyond season.
                </p>
              </div>

              {/* CTA buttons */}
              <div className={`jm-hero-in d2 ${heroVisible ? "visible" : ""}`} style={{ display:"flex", gap:"12px", marginBottom:"48px", flexWrap:"wrap" }}>
                <button
                  onClick={() => document.getElementById("jm-curations-anchor")?.scrollIntoView({ behavior:"smooth" })}
                  style={{ padding:"14px 32px", background:"#111111", color:"#FFFFFF", border:"1px solid #111111", fontSize:"10px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.35s ease", position:"relative", overflow:"hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#C5A059"; e.currentTarget.style.borderColor="#C5A059"; e.currentTarget.style.color="#111111"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#111111"; e.currentTarget.style.borderColor="#111111"; e.currentTarget.style.color="#FFFFFF"; }}
                >
                  Shop Collection
                </button>
                <button
                  onClick={() => document.getElementById("jm-curations-anchor")?.scrollIntoView({ behavior:"smooth" })}
                  style={{ padding:"14px 28px", background:"transparent", color:"#111111", border:"1px solid #DDDDDD", fontSize:"10px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.25s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#C5A059"; e.currentTarget.style.color="#C5A059"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#DDDDDD"; e.currentTarget.style.color="#111111"; }}
                >
                  Browse Categories
                </button>
              </div>

              {/* Stats row */}
              <div className={`jm-hero-in d3 ${heroVisible ? "visible" : ""}`} ref={statsRef} style={{ display:"flex", borderTop:"1px solid #EBEBEB", paddingTop:"28px" }}>
                {[
                  { n:`${products.length}+`, l:"Products" },
                  { n:`${CATEGORIES.length - 1}`, l:"Categories" },
                  { n:"Free", l:"Shipping" },
                  { n:"2026", l:"Collection" },
                ].map((s, i, arr) => (
                  <div key={i} style={{ flex:1, paddingRight:"20px", marginRight: i < arr.length-1 ? "20px" : 0, borderRight: i < arr.length-1 ? "1px solid #EBEBEB" : "none" }}>
                    <div className="jm-stat-num">{s.n}</div>
                    <div className="jm-sans" style={{ fontSize:"9px", color:"#AAAAAA", letterSpacing:"2px", textTransform:"uppercase", marginTop:"5px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — manifesto panel */}
            <div className={`jm-hero-in d1 ${heroVisible ? "visible" : ""}`}>
              <div className="jm-manifesto">
                <div className="jm-manifesto-corner jm-manifesto-corner-tl" />
                <div className="jm-manifesto-corner jm-manifesto-corner-br" />
                <div className="jm-serif jm-manifesto-num" aria-hidden>01</div>

                <div style={{ position:"relative", zIndex:1 }}>
                  <div className="jm-eyebrow jm-sans" style={{ color:"#C5A059", marginBottom:"18px" }}>The Standard</div>

                  <div className="jm-serif" style={{ fontSize:"clamp(20px,2vw,26px)", lineHeight:1.4, color:"#FFFFFF", fontWeight:"400", letterSpacing:"-0.2px" }}>
                    Quality is not what we add.<br />
                    It's what we <span style={{ color:"#C5A059", fontStyle:"italic" }}>refuse</span> to compromise.
                  </div>

                  <div style={{ borderTop:"1px solid #2A2A2A", margin:"28px 0 24px" }} />

                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                    {["Every piece inspected before listing", "Sourced for longevity, not trend cycles", "Packed and shipped within 24 hours"].map((line, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                        <span style={{ width:"5px", height:"5px", background:"#C5A059", flexShrink:0, transform:"rotate(45deg)", display:"inline-block" }} />
                        <span className="jm-sans" style={{ fontSize:"12px", color:"#BBBBBB", letterSpacing:"0.3px", lineHeight:1.5 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="jm-manifesto-cta" onClick={() => document.getElementById("jm-curations-anchor")?.scrollIntoView({ behavior:"smooth" })}>
                  Explore the Collection
                  <ArrowUpRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            FEATURE STRIP
        ═══════════════════════════════════════════ */}
        <div className="jm-feature-strip">
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:"Verified Products", sub:"Every item quality-checked" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title:"Secure Checkout", sub:"Powered by Stripe" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, title:"Free Shipping", sub:"On all orders" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, title:"Free Returns", sub:"Hassle-free policy" },
          ].map((f, i) => (
            <div key={i} className="jm-feature-cell">
              <div className="jm-feature-icon">{f.icon}</div>
              <div>
                <div className="jm-sans" style={{ fontSize:"12px", fontWeight:"700", color:"#111111", letterSpacing:"0.3px", marginBottom:"4px" }}>{f.title}</div>
                <div className="jm-sans" style={{ fontSize:"11px", color:"#AAAAAA", fontWeight:"300" }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            BEST SELLERS
        ═══════════════════════════════════════════ */}
        <div style={{ padding:"80px 6% 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"36px" }}>
            <div>
              <div className="jm-eyebrow jm-sans" style={{ marginBottom:"8px" }}>Icon Series</div>
              <h2 className="jm-serif" style={{ fontSize:"clamp(26px,3vw,36px)", fontWeight:"400", color:"#111111", margin:0, letterSpacing:"-0.3px" }}>Best Sellers</h2>
            </div>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <button className="jm-arrow" onClick={() => scroll("left")} aria-label="Prev"><ChevronLeft size={16} strokeWidth={1.5} /></button>
              <button className="jm-arrow" onClick={() => scroll("right")} aria-label="Next"><ChevronRight size={16} strokeWidth={1.5} /></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex", gap:"20px", overflow:"hidden" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width:"260px", flexShrink:0, background:"#FFFFFF", border:"1px solid #EBEBEB" }}>
                  <div style={{ background:"#F0F0F0", aspectRatio:"4/5", position:"relative", overflow:"hidden" }}>
                    <div className="jm-shimmer" style={{ position:"absolute", inset:0 }} />
                  </div>
                  <div style={{ padding:"16px 18px 20px" }}>
                    <div className="jm-shimmer" style={{ height:"8px", width:"50px", background:"#F0F0F0", marginBottom:"8px", position:"relative", overflow:"hidden" }} />
                    <div className="jm-shimmer" style={{ height:"13px", width:"85%", background:"#F0F0F0", position:"relative", overflow:"hidden" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            activeCategory === "All" && bestSellers.length > 0 && (
              <div className="jm-scroll-strip jm-scroll-mask" ref={scrollRef}>
                {bestSellers.map((p, i) => {
                  const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                  const isOut = stockQuantity === 0;
                  const isLow = !isOut && stockQuantity <= 5;
                  return (
                    <div key={`bs-${id}-${i}`} className="jm-card" style={{ width:"260px", flexShrink:0 }} onClick={() => navigate(`/product/${id}`)}>
                      <div style={{ background:"#F5F5F5", aspectRatio:"4/5", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"76%", maxHeight:"76%", objectFit:"contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                        {isOut && <div className="jm-badge-out">Sold Out</div>}
                        {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}
                        <div className="jm-price-bar">
                          <div>
                            <div className="jm-sans" style={{ fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"3px" }}>{categoryName}</div>
                            <div className="jm-sans" style={{ fontSize:"16px", fontWeight:"600", color:"#FFFFFF" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add-btn jm-sans" onClick={e => handleAddToCart(e, p)} disabled={isOut}
                            style={{ padding:"9px 16px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor: isOut ? "not-allowed" : "pointer" }}>
                            {isOut ? "Sold Out" : "Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"16px 18px 20px" }}>
                        <div className="jm-sans" style={{ fontSize:"9px", color:"#C5A059", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>{categoryName}</div>
                        <div className="jm-serif" style={{ fontSize:"15px", fontWeight:"500", color:"#111111", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* ═══════════════════════════════════════════
            EDITORIAL BAND
        ═══════════════════════════════════════════ */}
        <div className="jm-band">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"32px" }}>
            <div style={{ maxWidth:"480px" }}>
              <div className="jm-eyebrow jm-sans" style={{ color:"#C5A059", marginBottom:"12px" }}>Our Promise</div>
              <div className="jm-serif" style={{ fontSize:"clamp(22px,2.8vw,32px)", color:"#FFFFFF", fontWeight:"400", letterSpacing:"-0.3px", lineHeight:1.3 }}>
                Curated with intent.<br />
                <span style={{ fontStyle:"italic", color:"#C5A059" }}>Delivered with care.</span>
              </div>
              <p className="jm-sans" style={{ fontSize:"13px", color:"#666666", fontWeight:"300", lineHeight:1.8, marginTop:"16px", marginBottom:0 }}>
                Every product on Jimova is handpicked. No noise, no clutter — just pieces worth owning.
              </p>
            </div>
            <div className="jm-band-features" style={{ display:"flex", gap:"40px" }}>
              {[
                { icon:"◈", label:"Verified Products" },
                { icon:"◉", label:"Secure Checkout" },
                { icon:"◎", label:"Free Returns" },
              ].map((f, i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"24px", color:"#C5A059", marginBottom:"10px" }}>{f.icon}</div>
                  <div className="jm-sans" style={{ fontSize:"9px", fontWeight:"700", color:"#555555", letterSpacing:"1.5px", textTransform:"uppercase" }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            CATEGORY FILTER
        ═══════════════════════════════════════════ */}
        <div id="jm-curations-anchor" style={{ padding:"80px 6% 0" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"24px", marginBottom:"36px" }}>
            <div>
              <div className="jm-eyebrow jm-sans" style={{ marginBottom:"8px" }}>Shop by</div>
              <h2 className="jm-serif" style={{ fontSize:"clamp(22px,2.8vw,32px)", fontWeight:"400", color:"#111111", margin:0 }}>Curations</h2>
            </div>
            <div style={{ flex:1, height:"1px", background:"#EBEBEB", marginBottom:"8px" }} />
          </div>
          <div className="jm-cat-scroll">
            {CATEGORIES.map((cat, i) => {
              const isActive = activeCategory === cat.name;
              return (
                <div key={i} className={`jm-cat ${isActive ? "active" : ""}`} onClick={() => setActiveCategory(cat.name)}>
                  <div className="jm-cat-icon" style={{ color: isActive ? "#C5A059" : "#555555" }}>{cat.icon}</div>
                  <span className={`jm-cat-label jm-sans`} style={{ color: isActive ? "#111111" : "#AAAAAA" }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            PRODUCTS GRID
        ═══════════════════════════════════════════ */}
        <div style={{ padding:"60px 6% 0" }}>
          {!loading && filteredProducts.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"24px", borderBottom:"1px solid #EBEBEB", marginBottom:"32px" }}>
              <div className="jm-sans" style={{ fontSize:"10px", color:"#AAAAAA", letterSpacing:"2px", textTransform:"uppercase", fontWeight:"600" }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}{activeCategory !== "All" ? ` · ${activeCategory}` : ""}
              </div>
              <span className="jm-gold-line" />
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div style={{ textAlign:"center", padding:"100px 20px", border:"1px dashed #D8D8D8" }}>
              <div className="jm-serif" style={{ fontSize:"22px", color:"#111111", fontWeight:"400", marginBottom:"12px" }}>No pieces found.</div>
              <div className="jm-sans" style={{ fontSize:"10px", color:"#AAAAAA", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"28px" }}>Explore another curation</div>
              <button className="jm-sans" onClick={() => setActiveCategory("All")}
                style={{ background:"#111111", color:"#FFFFFF", border:"none", padding:"13px 32px", fontSize:"9px", fontWeight:"700", letterSpacing:"2.5px", textTransform:"uppercase", cursor:"pointer", transition:"background 0.25s" }}
                onMouseEnter={e => e.currentTarget.style.background="#C5A059"}
                onMouseLeave={e => e.currentTarget.style.background="#111111"}>
                View All
              </button>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:"2px" }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.map(p => {
                  const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                  const isOut = stockQuantity === 0;
                  const isLow = !isOut && stockQuantity <= 5;
                  return (
                    <div key={id} className="jm-card" onClick={() => navigate(`/product/${id}`)}>
                      <div style={{ background:"#F5F5F5", aspectRatio:"1/1", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"74%", maxHeight:"74%", objectFit:"contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                        {isOut && <div className="jm-badge-out">Sold Out</div>}
                        {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}
                        <div className="jm-price-bar">
                          <div>
                            <div className="jm-sans" style={{ fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"2px" }}>{categoryName}</div>
                            <div className="jm-sans" style={{ fontSize:"17px", fontWeight:"600", color:"#FFFFFF" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add-btn jm-sans" onClick={e => handleAddToCart(e, p)} disabled={isOut}
                            style={{ padding:"9px 16px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor: isOut ? "not-allowed" : "pointer" }}>
                            {isOut ? "Sold Out" : "Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"18px 20px 22px" }}>
                        <div className="jm-sans" style={{ fontSize:"9px", color:"#C5A059", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>{categoryName}</div>
                        <div className="jm-serif" style={{ fontSize:"15px", fontWeight:"500", color:"#111111", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"42px" }}>{name}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"14px" }}>
                          <div className="jm-sans" style={{ fontSize:"14px", fontWeight:"700", color:"#111111", letterSpacing:"-0.2px" }}>₹{price.toLocaleString("en-IN")}</div>
                          {isLow && <div style={{ fontSize:"8px", fontWeight:"700", color:"#C5A059", textTransform:"uppercase", letterSpacing:"1px" }}>Low stock</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <div style={{ margin:"100px 6% 0", paddingTop:"36px", paddingBottom:"56px", borderTop:"1px solid #EBEBEB", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div className="jm-serif" style={{ fontSize:"22px", color:"#111111", fontWeight:"400" }}>
            Jimova<span style={{ color:"#C5A059", fontStyle:"italic" }}>.</span>
          </div>
          <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
            {["Home", "Orders", "Bag"].map((l, i) => (
              <span key={i} className="jm-sans"
                style={{ fontSize:"9px", fontWeight:"600", color:"#CCCCCC", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"color 0.2s" }}
                onClick={() => navigate(l === "Home" ? "/" : `/${l.toLowerCase()}`)}
                onMouseEnter={e => e.currentTarget.style.color="#C5A059"}
                onMouseLeave={e => e.currentTarget.style.color="#CCCCCC"}>
                {l}
              </span>
            ))}
          </div>
          <div className="jm-sans" style={{ fontSize:"9px", color:"#CCCCCC", letterSpacing:"2px", textTransform:"uppercase" }}>
            © 2026 Jimova. All rights reserved.
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;