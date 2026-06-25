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
    <div style={{ background:"#F2F2F2", aspectRatio:"1/1", position:"relative", overflow:"hidden" }}>
      <div className="jm-shimmer" style={{ position:"absolute", inset:0 }} />
    </div>
    <div style={{ padding:"18px 20px 22px" }}>
      <div className="jm-shimmer" style={{ height:"8px", width:"55px", background:"#F2F2F2", marginBottom:"10px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"13px", width:"88%", background:"#F2F2F2", marginBottom:"6px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"13px", width:"55%", background:"#F2F2F2", marginBottom:"14px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"13px", width:"38%", background:"#F2F2F2", position:"relative", overflow:"hidden" }} />
    </div>
  </div>
);

const Home = ({ selectedCategory }) => {
  const { addToCart } = useContext(AppContext);
  const navigate      = useNavigate();
  const scrollRef     = useRef(null);

  const [products, setProducts]         = useState([]);
  const [isError, setIsError]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showToast, setShowToast]       = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");
  const [heroVisible, setHeroVisible]   = useState(false);

  useEffect(() => { if (selectedCategory) setActiveCategory(selectedCategory); }, [selectedCategory]);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/products?pageSize=200&sortBy=id&sortDir=desc`)
      .then(r => { setProducts(r.data.content || []); setIsError(false); })
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3200);
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

  const bestSellers   = products.slice(0, 10);
  const heroProducts  = products.slice(0, 4);

  if (isError) return (
    <div style={{ minHeight:"100vh", background:"#FCFCFC", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <img src={unplugged} alt="Error" width="56" style={{ opacity:0.25 }} />
      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"20px", color:"#111" }}>Archive Unavailable</div>
      <div style={{ fontSize:"10px", color:"#999", letterSpacing:"2px", textTransform:"uppercase" }}>Verify server connection</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .jm-serif { font-family: 'Playfair Display', serif; }
        .jm-sans  { font-family: 'Inter', sans-serif; }

        /* shimmer */
        @keyframes jm-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .jm-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent); animation:jm-shimmer 1.6s ease-in-out infinite; }

        /* entrance */
        .jm-in { opacity:0; transform:translateY(28px); transition:opacity 0.9s cubic-bezier(0.25,1,0.5,1), transform 0.9s cubic-bezier(0.25,1,0.5,1); }
        .jm-in.vis { opacity:1; transform:translateY(0); }
        .jm-in.d1.vis { transition-delay:0.12s; }
        .jm-in.d2.vis { transition-delay:0.24s; }
        .jm-in.d3.vis { transition-delay:0.38s; }
        .jm-in.d4.vis { transition-delay:0.52s; }

        /* product cards */
        .jm-card { position:relative; cursor:pointer; overflow:hidden; background:#FFFFFF; border:1px solid #EBEBEB; display:flex; flex-direction:column; transition:border-color 0.35s ease, transform 0.45s cubic-bezier(0.25,1,0.5,1), box-shadow 0.45s ease; }
        .jm-card:hover { border-color:#C5A059; transform:translateY(-6px); box-shadow:0 20px 56px rgba(0,0,0,0.09); }
        .jm-card:active { transform:translateY(-2px) scale(0.99); }
        .jm-card-img { transition:transform 0.8s cubic-bezier(0.25,1,0.5,1); }
        .jm-card:hover .jm-card-img { transform:scale(1.07); }

        /* hover price reveal */
        .jm-price-bar { position:absolute; bottom:0; left:0; right:0; background:rgba(12,12,12,0.97); padding:14px 18px; transform:translateY(100%); transition:transform 0.4s cubic-bezier(0.25,1,0.5,1); display:flex; justify-content:space-between; align-items:center; }
        .jm-card:hover .jm-price-bar { transform:translateY(0); }

        /* add button */
        .jm-add-btn { position:relative; overflow:hidden; z-index:1; transition:color 0.3s ease; }
        .jm-add-btn::after { content:''; position:absolute; inset:0; background:#C5A059; z-index:-1; transform:scaleX(0); transform-origin:left; transition:transform 0.32s cubic-bezier(0.25,1,0.5,1); }
        .jm-add-btn:hover:not(:disabled)::after { transform:scaleX(1); }
        .jm-add-btn:hover:not(:disabled) { color:#111111 !important; border-color:#C5A059 !important; }

        /* scroll strip */
        .jm-scroll { overflow-x:auto; display:flex; gap:16px; padding:4px 2px 28px; scrollbar-width:none; }
        .jm-scroll::-webkit-scrollbar { display:none; }
        .jm-scroll-mask { -webkit-mask-image:linear-gradient(to right,transparent 0%,black 4%,black 93%,transparent 100%); mask-image:linear-gradient(to right,transparent 0%,black 4%,black 93%,transparent 100%); }

        /* arrows */
        .jm-arrow { width:38px; height:38px; border:1px solid #DDDDDD; background:transparent; cursor:pointer; color:#111; display:flex; align-items:center; justify-content:center; transition:all 0.25s ease; }
        .jm-arrow:hover { background:#111; color:#FFF; border-color:#111; }

        /* category */
        .jm-cat { display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; min-width:76px; }
        .jm-cat-icon { width:64px; height:64px; display:flex; align-items:center; justify-content:center; border:1px solid #E8E8E8; background:#FAFAFA; transition:all 0.35s cubic-bezier(0.25,1,0.5,1); }
        .jm-cat:hover .jm-cat-icon { border-color:#C5A059; transform:translateY(-4px); color:#C5A059; }
        .jm-cat.active .jm-cat-icon { background:#111111; color:#C5A059; border-color:#111111; transform:translateY(-4px); }
        .jm-cat-label { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#AAAAAA; transition:color 0.25s; }
        .jm-cat:hover .jm-cat-label { color:#111; }
        .jm-cat.active .jm-cat-label { color:#111; }
        .jm-cat-scroll { overflow-x:auto; display:flex; gap:12px; padding:8px 4px 20px; scrollbar-width:none; }
        .jm-cat-scroll::-webkit-scrollbar { display:none; }

        /* badges */
        .jm-badge-out { position:absolute; top:12px; left:0; background:#AAAAAA; color:#FFF; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }
        .jm-badge-low { position:absolute; top:12px; left:0; background:#111111; color:#C5A059; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }

        /* toast */
        .jm-toast { position:fixed; top:88px; right:24px; z-index:10000; background:#111111; color:#FFF; border:1px solid #2A2A2A; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:280px; max-width:340px; box-shadow:0 24px 56px rgba(0,0,0,0.18); transition:all 0.45s cubic-bezier(0.25,1,0.5,1); pointer-events:none; }
        .jm-toast.in  { opacity:1; transform:translateX(0); pointer-events:auto; }
        .jm-toast.out { opacity:0; transform:translateX(52px); }

        /* hero collage */
        .jm-collage { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:3px; height:100%; }
        .jm-collage-item { overflow:hidden; background:#F5F5F5; position:relative; cursor:pointer; }
        .jm-collage-item img { width:100%; height:100%; object-fit:contain; padding:12%; transition:transform 0.7s cubic-bezier(0.25,1,0.5,1); }
        .jm-collage-item:hover img { transform:scale(1.08); }
        .jm-collage-item .jm-collage-overlay { position:absolute; inset:0; background:rgba(12,12,12,0); transition:background 0.3s ease; display:flex; align-items:flex-end; padding:12px; }
        .jm-collage-item:hover .jm-collage-overlay { background:rgba(12,12,12,0.18); }
        .jm-collage-tag { font-family:'Inter',sans-serif; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#FFFFFF; background:rgba(12,12,12,0.7); padding:4px 9px; opacity:0; transform:translateY(6px); transition:all 0.3s ease; }
        .jm-collage-item:hover .jm-collage-tag { opacity:1; transform:translateY(0); }

        /* feature row */
        .jm-feat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
        .jm-feat-cell { padding:28px 24px; border:1px solid #EBEBEB; border-left:none; display:flex; align-items:flex-start; gap:14px; background:#FFFFFF; transition:background 0.25s; }
        .jm-feat-cell:first-child { border-left:1px solid #EBEBEB; }
        .jm-feat-cell:hover { background:#FAFAFA; }
        .jm-feat-icon { width:38px; height:38px; background:#F5F5F5; border:1px solid #EBEBEB; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all 0.25s; }
        .jm-feat-cell:hover .jm-feat-icon { background:#111; border-color:#111; }
        .jm-feat-cell:hover .jm-feat-icon svg { stroke:#C5A059; }

        /* band */
        .jm-band { background:#111111; position:relative; overflow:hidden; }
        .jm-band::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#C5A059,transparent); }
        .jm-band::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(197,160,89,0.3),transparent); }

        /* section heading */
        .jm-sec-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px; }

        /* footer */
        .jm-footer { background:#111111; color:#FFFFFF; padding:60px 6% 40px; }
        .jm-footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
        .jm-footer-link { font-size:12px; color:#666666; cursor:pointer; transition:color 0.2s; display:block; margin-bottom:10px; font-family:'Inter',sans-serif; letter-spacing:0.3px; text-decoration:none; }
        .jm-footer-link:hover { color:#C5A059; }

        /* CTA button */
        .jm-cta { padding:14px 32px; background:#111111; color:#FFFFFF; border:1px solid #111111; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.32s ease; }
        .jm-cta:hover { background:#C5A059; border-color:#C5A059; color:#111111; }
        .jm-cta-ghost { padding:14px 28px; background:transparent; color:#111111; border:1px solid #DDDDDD; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.25s ease; }
        .jm-cta-ghost:hover { border-color:#C5A059; color:#C5A059; }

        @media (max-width:900px) {
          .jm-hero-grid { grid-template-columns:1fr !important; }
          .jm-collage { height:320px; }
          .jm-feat-row { grid-template-columns:1fr 1fr; }
          .jm-footer-grid { grid-template-columns:1fr 1fr; }
        }
        @media (max-width:600px) {
          .jm-feat-row { grid-template-columns:1fr; }
          .jm-footer-grid { grid-template-columns:1fr; }
          .jm-band-inner { flex-direction:column !important; }
        }
      `}</style>

      {/* ── TOAST ── */}
      <div className={`jm-toast jm-sans ${showToast ? "in" : "out"}`}>
        {toastProduct && (
          <>
            <div style={{ width:"44px", height:"44px", background:"#FFFFFF", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px", border:"1px solid #1E1E1E" }}>
              <img src={toastProduct.imageUrl || unplugged} alt={toastProduct.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e => e.target.src = unplugged} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="jm-serif" style={{ fontSize:"14px", fontWeight:"500", lineHeight:1.2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{toastProduct.name}</div>
              <div style={{ fontSize:"9px", color:"#C5A059", marginTop:"5px", letterSpacing:"2px", textTransform:"uppercase" }}>Added to bag ✦</div>
            </div>
            <button onClick={() => navigate("/cart")} style={{ background:"transparent", border:"1px solid #2A2A2A", color:"#C5A059", padding:"6px 12px", fontSize:"9px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", flexShrink:0, fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#C5A059"; e.currentTarget.style.color="#111"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#C5A059"; }}>
              Bag
            </button>
          </>
        )}
      </div>

      <div style={{ background:"#FCFCFC", minHeight:"100vh" }}>

        {/* ══════════════════════════════════
            HERO
        ══════════════════════════════════ */}
        <section style={{ padding:"0 6%", background:"#FCFCFC", borderBottom:"1px solid #EBEBEB", position:"relative", overflow:"hidden" }}>

          {/* watermark */}
          <div className="jm-serif" aria-hidden style={{ position:"absolute", right:"-2%", top:"0%", fontSize:"clamp(120px,18vw,240px)", fontWeight:"700", color:"transparent", WebkitTextStroke:"1px #F0F0F0", lineHeight:0.9, userSelect:"none", pointerEvents:"none", letterSpacing:"-8px", zIndex:0 }}>
            J
          </div>

          <div className="jm-hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0", alignItems:"stretch", position:"relative", zIndex:1, minHeight:"580px" }}>

            {/* LEFT */}
            <div style={{ padding:"80px 48px 80px 0", display:"flex", flexDirection:"column", justifyContent:"center", borderRight:"1px solid #EBEBEB" }}>

              <div className={`jm-in ${heroVisible?"vis":""}`} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
                <span style={{ width:"28px", height:"1px", background:"#C5A059", display:"inline-block" }} />
                <span style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", color:"#C5A059", fontFamily:"'Inter',sans-serif" }}>The Jimova Edit — 2026</span>
              </div>

              <div className={`jm-in d1 ${heroVisible?"vis":""}`}>
                <h1 className="jm-serif" style={{ fontSize:"clamp(48px,5.5vw,76px)", fontWeight:"400", lineHeight:1.02, letterSpacing:"-1.5px", color:"#0D0D0D", margin:"0" }}>
                  Crafted for
                </h1>
                <h1 className="jm-serif" style={{ fontSize:"clamp(48px,5.5vw,76px)", fontWeight:"600", lineHeight:1.02, letterSpacing:"-1.5px", color:"#0D0D0D", margin:"0 0 6px", fontStyle:"italic" }}>
                  <span style={{ color:"#C5A059" }}>the discerning.</span>
                </h1>
              </div>

              <div className={`jm-in d2 ${heroVisible?"vis":""}`}>
                <p style={{ fontSize:"14px", fontWeight:"300", color:"#777777", lineHeight:1.9, maxWidth:"400px", margin:"20px 0 32px", letterSpacing:"0.2px", fontFamily:"'Inter',sans-serif" }}>
                  Every piece in our collection is selected for longevity, craft, and meaning. Not for the moment — for the years that follow.
                </p>
                <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                  <button className="jm-cta" onClick={() => document.getElementById("jm-grid")?.scrollIntoView({ behavior:"smooth" })}>
                    Shop Now
                  </button>
                  <button className="jm-cta-ghost" onClick={() => document.getElementById("jm-curations")?.scrollIntoView({ behavior:"smooth" })}>
                    Browse Categories
                  </button>
                </div>
              </div>

              {/* stats */}
              <div className={`jm-in d3 ${heroVisible?"vis":""}`} style={{ display:"flex", gap:"0", marginTop:"48px", paddingTop:"32px", borderTop:"1px solid #EBEBEB" }}>
                {[
                  { n:`${products.length}+`, l:"Products" },
                  { n:`${CATEGORIES.length - 1}`, l:"Categories" },
                  { n:"Free", l:"Shipping" },
                ].map((s, i, arr) => (
                  <div key={i} style={{ flex:1, paddingRight:"24px", marginRight: i < arr.length-1 ? "24px" : 0, borderRight: i < arr.length-1 ? "1px solid #EBEBEB" : "none" }}>
                    <div className="jm-serif" style={{ fontSize:"clamp(22px,2.5vw,30px)", fontWeight:"500", color:"#111111", letterSpacing:"-0.5px", lineHeight:1 }}>{s.n}</div>
                    <div style={{ fontSize:"9px", color:"#AAAAAA", letterSpacing:"2px", textTransform:"uppercase", marginTop:"5px", fontFamily:"'Inter',sans-serif" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — product collage */}
            <div className={`jm-in d2 ${heroVisible?"vis":""}`} style={{ padding:"24px 0 24px 24px" }}>
              {heroProducts.length >= 4 ? (
                <div className="jm-collage" style={{ height:"100%" }}>
                  {heroProducts.slice(0,4).map((p, i) => (
                    <div key={p.id} className="jm-collage-item" onClick={() => navigate(`/product/${p.id}`)}
                      style={{ background: i % 2 === 0 ? "#F5F5F5" : "#FAFAFA" }}>
                      <img src={p.imageUrl || unplugged} alt={p.name} onError={e => e.target.src = unplugged} />
                      <div className="jm-collage-overlay">
                        <span className="jm-collage-tag">{p.categoryName}</span>
                      </div>
                      {/* price chip */}
                      <div style={{ position:"absolute", top:"10px", right:"10px", background:"rgba(255,255,255,0.92)", border:"1px solid #EBEBEB", padding:"4px 10px", fontSize:"11px", fontWeight:"700", color:"#111", fontFamily:"'Inter',sans-serif", letterSpacing:"-0.2px" }}>
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* fallback if less than 4 products loaded yet */
                <div style={{ height:"100%", background:"#F5F5F5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ textAlign:"center", padding:"40px" }}>
                    <div className="jm-serif" style={{ fontSize:"32px", color:"#DDDDDD", fontWeight:"400" }}>Jimova<span style={{ color:"#C5A059", fontStyle:"italic" }}>.</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            FEATURE STRIP
        ══════════════════════════════════ */}
        <div className="jm-feat-row" style={{ margin:"0 6%" }}>
          {[
            { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:"Verified Products", sub:"Every item quality-checked" },
            { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title:"Secure Checkout", sub:"Powered by Stripe" },
            { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, title:"Free Shipping", sub:"On every order" },
            { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, title:"Easy Returns", sub:"Hassle-free policy" },
          ].map((f, i) => (
            <div key={i} className="jm-feat-cell">
              <div className="jm-feat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon.props.children}
                </svg>
              </div>
              <div>
                <div style={{ fontSize:"12px", fontWeight:"700", color:"#111111", letterSpacing:"0.2px", marginBottom:"3px", fontFamily:"'Inter',sans-serif" }}>{f.title}</div>
                <div style={{ fontSize:"11px", color:"#AAAAAA", fontWeight:"300", fontFamily:"'Inter',sans-serif" }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════
            BEST SELLERS
        ══════════════════════════════════ */}
        <section style={{ padding:"80px 6% 0" }}>
          <div className="jm-sec-head">
            <div>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", color:"#C5A059", marginBottom:"8px", display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Inter',sans-serif" }}>
                <span style={{ width:"20px", height:"1px", background:"#C5A059", display:"inline-block" }} />
                Icon Series
              </div>
              <h2 className="jm-serif" style={{ fontSize:"clamp(26px,3vw,38px)", fontWeight:"400", color:"#111111", margin:0, letterSpacing:"-0.5px" }}>Best Sellers</h2>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button className="jm-arrow" onClick={() => scroll("left")}><ChevronLeft size={16} strokeWidth={1.5} /></button>
              <button className="jm-arrow" onClick={() => scroll("right")}><ChevronRight size={16} strokeWidth={1.5} /></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex", gap:"16px", overflow:"hidden" }}>
              {Array.from({ length:5 }).map((_,i) => (
                <div key={i} style={{ width:"280px", flexShrink:0, background:"#FFFFFF", border:"1px solid #EBEBEB" }}>
                  <div style={{ background:"#F2F2F2", aspectRatio:"4/5", position:"relative", overflow:"hidden" }}><div className="jm-shimmer" style={{ position:"absolute", inset:0 }} /></div>
                  <div style={{ padding:"16px 18px 20px" }}>
                    <div className="jm-shimmer" style={{ height:"8px", width:"50px", background:"#F2F2F2", marginBottom:"8px", position:"relative", overflow:"hidden" }} />
                    <div className="jm-shimmer" style={{ height:"13px", width:"80%", background:"#F2F2F2", position:"relative", overflow:"hidden" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            activeCategory === "All" && bestSellers.length > 0 && (
              <div className="jm-scroll jm-scroll-mask" ref={scrollRef}>
                {bestSellers.map((p, i) => {
                  const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                  const isOut = stockQuantity === 0;
                  const isLow = !isOut && stockQuantity <= 5;
                  return (
                    <div key={`bs-${id}`} className="jm-card" style={{ width:"280px", flexShrink:0 }} onClick={() => navigate(`/product/${id}`)}>
                      <div style={{ background:"#F5F5F5", aspectRatio:"4/5", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"74%", maxHeight:"74%", objectFit:"contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                        {isOut && <div className="jm-badge-out">Sold Out</div>}
                        {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}
                        <div className="jm-price-bar">
                          <div>
                            <div style={{ fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"3px", fontFamily:"'Inter',sans-serif" }}>{categoryName}</div>
                            <div style={{ fontSize:"17px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'Inter',sans-serif" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add-btn jm-sans" onClick={e => handleAddToCart(e, p)} disabled={isOut}
                            style={{ padding:"9px 16px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor: isOut ? "not-allowed" : "pointer" }}>
                            {isOut ? "Sold Out" : "Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"18px 20px 22px" }}>
                        <div style={{ fontSize:"9px", color:"#C5A059", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px", fontFamily:"'Inter',sans-serif" }}>{categoryName}</div>
                        <div className="jm-serif" style={{ fontSize:"16px", fontWeight:"500", color:"#111111", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:"10px" }}>{name}</div>
                        <div style={{ fontSize:"15px", fontWeight:"700", color:"#111111", fontFamily:"'Inter',sans-serif", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>

        {/* ══════════════════════════════════
            EDITORIAL BAND
        ══════════════════════════════════ */}
        <div className="jm-band" style={{ margin:"80px 6% 0" }}>
          <div className="jm-band-inner" style={{ padding:"56px 48px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"40px", flexWrap:"wrap" }}>
            <div style={{ maxWidth:"500px" }}>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", color:"#C5A059", marginBottom:"14px", fontFamily:"'Inter',sans-serif" }}>Our Standard</div>
              <div className="jm-serif" style={{ fontSize:"clamp(24px,3vw,36px)", color:"#FFFFFF", fontWeight:"400", letterSpacing:"-0.5px", lineHeight:1.3 }}>
                Not a marketplace.<br />
                <span style={{ fontStyle:"italic", color:"#C5A059" }}>A curation.</span>
              </div>
              <p style={{ fontSize:"13px", color:"#666666", fontWeight:"300", lineHeight:1.8, marginTop:"14px", marginBottom:0, fontFamily:"'Inter',sans-serif" }}>
                Every product is handpicked. Every category is curated. No noise — just pieces worth owning.
              </p>
            </div>
            <div style={{ display:"flex", gap:"2px" }}>
              {[
                { num: `${products.length}+`, label:"Products" },
                { num:`${CATEGORIES.length-1}`, label:"Categories" },
                { num:"24h", label:"Dispatch" },
              ].map((s,i) => (
                <div key={i} style={{ padding:"28px 32px", background:"rgba(255,255,255,0.04)", border:"1px solid #1E1E1E", textAlign:"center", minWidth:"100px" }}>
                  <div className="jm-serif" style={{ fontSize:"28px", color:"#C5A059", fontWeight:"500", letterSpacing:"-0.5px" }}>{s.num}</div>
                  <div style={{ fontSize:"9px", color:"#555555", letterSpacing:"2px", textTransform:"uppercase", marginTop:"6px", fontFamily:"'Inter',sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            CATEGORY FILTER
        ══════════════════════════════════ */}
        <section id="jm-curations" style={{ padding:"80px 6% 0" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"24px", marginBottom:"32px" }}>
            <div>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", color:"#C5A059", marginBottom:"8px", display:"flex", alignItems:"center", gap:"10px", fontFamily:"'Inter',sans-serif" }}>
                <span style={{ width:"20px", height:"1px", background:"#C5A059", display:"inline-block" }} />
                Shop by
              </div>
              <h2 className="jm-serif" style={{ fontSize:"clamp(22px,2.8vw,32px)", fontWeight:"400", color:"#111111", margin:0, letterSpacing:"-0.3px" }}>Curations</h2>
            </div>
            <div style={{ flex:1, height:"1px", background:"#EBEBEB", marginBottom:"8px" }} />
          </div>
          <div className="jm-cat-scroll">
            {CATEGORIES.map((cat, i) => {
              const isActive = activeCategory === cat.name;
              return (
                <div key={i} className={`jm-cat ${isActive ? "active" : ""}`} onClick={() => setActiveCategory(cat.name)}>
                  <div className="jm-cat-icon" style={{ color: isActive ? "#C5A059" : "#555555" }}>{cat.icon}</div>
                  <span className="jm-cat-label jm-sans" style={{ color: isActive ? "#111111" : "#AAAAAA" }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════
            PRODUCTS GRID
        ══════════════════════════════════ */}
        <section id="jm-grid" style={{ padding:"48px 6% 0" }}>
          {!loading && filteredProducts.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"20px", borderBottom:"1px solid #EBEBEB", marginBottom:"2px" }}>
              <div style={{ fontSize:"10px", color:"#AAAAAA", letterSpacing:"2px", textTransform:"uppercase", fontWeight:"700", fontFamily:"'Inter',sans-serif" }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}{activeCategory !== "All" ? ` · ${activeCategory}` : ""}
              </div>
              <span style={{ width:"32px", height:"1px", background:"#C5A059", display:"inline-block" }} />
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div style={{ textAlign:"center", padding:"100px 20px", border:"1px dashed #D8D8D8" }}>
              <div className="jm-serif" style={{ fontSize:"24px", color:"#111111", fontWeight:"400", marginBottom:"12px" }}>No pieces found.</div>
              <div style={{ fontSize:"10px", color:"#AAAAAA", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"28px", fontFamily:"'Inter',sans-serif" }}>Explore another curation</div>
              <button className="jm-cta" onClick={() => setActiveCategory("All")}>View All</button>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"1px" }}>
            {loading
              ? Array.from({ length:8 }).map((_,i) => <SkeletonCard key={i} />)
              : filteredProducts.map(p => {
                  const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                  const isOut = stockQuantity === 0;
                  const isLow = !isOut && stockQuantity <= 5;
                  return (
                    <div key={id} className="jm-card" onClick={() => navigate(`/product/${id}`)}>
                      <div style={{ background:"#F5F5F5", aspectRatio:"1/1", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={imageUrl || unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"72%", maxHeight:"72%", objectFit:"contain", opacity: isOut ? 0.3 : 1 }} onError={e => e.target.src = unplugged} />
                        {isOut && <div className="jm-badge-out">Sold Out</div>}
                        {isLow && <div className="jm-badge-low">Only {stockQuantity} left</div>}
                        <div className="jm-price-bar">
                          <div>
                            <div style={{ fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"2px", fontFamily:"'Inter',sans-serif" }}>{categoryName}</div>
                            <div style={{ fontSize:"17px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'Inter',sans-serif" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add-btn jm-sans" onClick={e => handleAddToCart(e, p)} disabled={isOut}
                            style={{ padding:"9px 16px", border: isOut ? "1px solid #555" : "1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", cursor: isOut ? "not-allowed" : "pointer" }}>
                            {isOut ? "Sold Out" : "Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"18px 20px 22px" }}>
                        <div style={{ fontSize:"9px", color:"#C5A059", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px", fontFamily:"'Inter',sans-serif" }}>{categoryName}</div>
                        <div className="jm-serif" style={{ fontSize:"15px", fontWeight:"500", color:"#111111", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"42px" }}>{name}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px" }}>
                          <div style={{ fontSize:"14px", fontWeight:"700", color:"#111111", fontFamily:"'Inter',sans-serif", letterSpacing:"-0.2px" }}>₹{price.toLocaleString("en-IN")}</div>
                          {isLow && <div style={{ fontSize:"8px", fontWeight:"700", color:"#C5A059", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"'Inter',sans-serif" }}>Low stock</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* ══════════════════════════════════
            FOOTER
        ══════════════════════════════════ */}
        <footer className="jm-footer" style={{ marginTop:"100px" }}>
          <div className="jm-footer-grid">
            {/* Brand */}
            <div>
              <div className="jm-serif" style={{ fontSize:"28px", fontWeight:"400", color:"#FFFFFF", marginBottom:"16px" }}>
                Jimova<span style={{ color:"#C5A059", fontStyle:"italic" }}>.</span>
              </div>
              <p style={{ fontSize:"12px", color:"#555555", fontWeight:"300", lineHeight:1.8, maxWidth:"260px", margin:"0 0 24px", fontFamily:"'Inter',sans-serif" }}>
                A luxury e-commerce destination for pieces worth owning. Curated with intent, delivered with care.
              </p>
              <div style={{ display:"flex", gap:"12px" }}>
                {["Home", "Cart", "Orders"].map(l => (
                  <button key={l} onClick={() => navigate(l === "Home" ? "/" : `/${l.toLowerCase()}`)}
                    style={{ background:"transparent", border:"1px solid #222222", color:"#555555", padding:"7px 16px", fontSize:"9px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="#C5A059"; e.currentTarget.style.color="#C5A059"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="#222222"; e.currentTarget.style.color="#555555"; }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", color:"#444444", marginBottom:"20px", fontFamily:"'Inter',sans-serif" }}>Shop</div>
              {CATEGORIES.filter(c => c.name !== "All").map(c => (
                <a key={c.name} className="jm-footer-link" onClick={() => { setActiveCategory(c.name); window.scrollTo({ top:0, behavior:"smooth" }); }}>{c.name}</a>
              ))}
            </div>

            {/* Account */}
            <div>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", color:"#444444", marginBottom:"20px", fontFamily:"'Inter',sans-serif" }}>Account</div>
              {[{ l:"Sign In", p:"/login" }, { l:"My Orders", p:"/orders" }, { l:"My Cart", p:"/cart" }].map(item => (
                <a key={item.l} className="jm-footer-link" onClick={() => navigate(item.p)}>{item.l}</a>
              ))}
            </div>

            {/* Info */}
            <div>
              <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", color:"#444444", marginBottom:"20px", fontFamily:"'Inter',sans-serif" }}>Info</div>
              {["Free Shipping", "Easy Returns", "Secure Checkout", "Quality Guarantee"].map(l => (
                <div key={l} style={{ fontSize:"12px", color:"#555555", marginBottom:"10px", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)", flexShrink:0 }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Footer bottom */}
          <div style={{ borderTop:"1px solid #1A1A1A", paddingTop:"28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ fontSize:"10px", color:"#333333", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>
              © 2026 Jimova. All rights reserved.
            </div>
            <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
              <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)" }} />
              <span style={{ fontSize:"9px", color:"#333333", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>Luxury E-Commerce</span>
              <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)" }} />
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;