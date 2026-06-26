import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutGrid, Laptop, Smartphone, Plug,
  Gamepad2, Shirt, Headphones, ChevronLeft, ChevronRight,
} from "lucide-react";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

const CATEGORIES = [
  { name: "All",         icon: <LayoutGrid  size={18} strokeWidth={1} /> },
  { name: "Laptop",      icon: <Laptop      size={18} strokeWidth={1} /> },
  { name: "Mobile",      icon: <Smartphone  size={18} strokeWidth={1} /> },
  { name: "Electronics", icon: <Plug        size={18} strokeWidth={1} /> },
  { name: "Toys",        icon: <Gamepad2    size={18} strokeWidth={1} /> },
  { name: "Fashion",     icon: <Shirt       size={18} strokeWidth={1} /> },
  { name: "Headphone",   icon: <Headphones  size={18} strokeWidth={1} /> },
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
  <div style={{ background:"#FFFFFF", display:"flex", flexDirection:"column" }}>
    <div style={{ background:"#F3F3F3", aspectRatio:"1/1", position:"relative", overflow:"hidden" }}>
      <div className="jm-shimmer" style={{ position:"absolute", inset:0 }} />
    </div>
    <div style={{ padding:"20px" }}>
      <div className="jm-shimmer" style={{ height:"8px", width:"50px", background:"#F3F3F3", marginBottom:"10px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"14px", width:"88%", background:"#F3F3F3", marginBottom:"6px", position:"relative", overflow:"hidden" }} />
      <div className="jm-shimmer" style={{ height:"14px", width:"50%", background:"#F3F3F3", position:"relative", overflow:"hidden" }} />
    </div>
  </div>
);

const Home = ({ selectedCategory }) => {
  const { addToCart } = useContext(AppContext);
  const navigate      = useNavigate();
  const scrollRef     = useRef(null);

  const [products, setProducts]             = useState([]);
  const [isError, setIsError]               = useState(false);
  const [loading, setLoading]               = useState(true);
  const [showToast, setShowToast]           = useState(false);
  const [toastProduct, setToastProduct]     = useState(null);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");
  const [heroVisible, setHeroVisible]       = useState(false);

  useEffect(() => { if (selectedCategory) setActiveCategory(selectedCategory); }, [selectedCategory]);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 120); return () => clearTimeout(t); }, []);

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

  const scroll = dir => scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior:"smooth" });

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => {
        const t = activeCategory.toLowerCase().trim();
        const c = (p.categoryName || "").toLowerCase().trim();
        if (c === t || c.includes(t)) return true;
        const tx = `${p.name||""} ${p.description||""}`.toLowerCase();
        if (tx.includes(t)) return true;
        return (SMART_KEYWORDS[t] || []).some(kw => tx.includes(kw));
      });

  const bestSellers  = products.slice(0, 10);
  const heroProducts = products.slice(0, 4);

  if (isError) return (
    <div style={{ minHeight:"100vh", background:"#FAFAFA", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <img src={unplugged} alt="Error" width="48" style={{ opacity:0.2 }} />
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#111", fontWeight:"400" }}>Archive Unavailable</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* shimmer */
        @keyframes jm-sh { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .jm-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent); animation:jm-sh 1.8s ease-in-out infinite; }

        /* entrance animations */
        @keyframes jm-fade-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes jm-fade-in { from{opacity:0} to{opacity:1} }
        .jm-au   { animation: jm-fade-up 1s cubic-bezier(0.16,1,0.3,1) both; }
        .jm-af   { animation: jm-fade-in 1.2s ease both; }
        .jm-d1   { animation-delay: 0.1s; }
        .jm-d2   { animation-delay: 0.22s; }
        .jm-d3   { animation-delay: 0.36s; }
        .jm-d4   { animation-delay: 0.5s; }
        .jm-d5   { animation-delay: 0.64s; }

        /* product cards */
        .jm-card { position:relative; cursor:pointer; overflow:hidden; background:#FFFFFF; display:flex; flex-direction:column; transition:transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease; }
        .jm-card:hover { transform:translateY(-4px); box-shadow:0 32px 80px rgba(0,0,0,0.1); }
        .jm-card-img { transition:transform 1s cubic-bezier(0.16,1,0.3,1); }
        .jm-card:hover .jm-card-img { transform:scale(1.06); }

        /* price reveal */
        .jm-price-bar { position:absolute; bottom:0; left:0; right:0; background:rgba(8,8,8,0.95); padding:16px 20px; transform:translateY(100%); transition:transform 0.42s cubic-bezier(0.16,1,0.3,1); display:flex; justify-content:space-between; align-items:center; backdrop-filter:blur(8px); }
        .jm-card:hover .jm-price-bar { transform:translateY(0); }

        /* add button */
        .jm-add { position:relative; overflow:hidden; z-index:1; transition:color 0.3s; }
        .jm-add::after { content:''; position:absolute; inset:0; background:#C9A96E; z-index:-1; transform:scaleX(0); transform-origin:left; transition:transform 0.32s cubic-bezier(0.16,1,0.3,1); }
        .jm-add:hover:not(:disabled)::after { transform:scaleX(1); }
        .jm-add:hover:not(:disabled) { color:#0A0A0A !important; border-color:#C9A96E !important; }

        /* scroll */
        .jm-scroll { overflow-x:auto; display:flex; gap:2px; padding:4px 0 24px; scrollbar-width:none; }
        .jm-scroll::-webkit-scrollbar { display:none; }
        .jm-mask { -webkit-mask-image:linear-gradient(to right,transparent 0%,black 3%,black 94%,transparent 100%); mask-image:linear-gradient(to right,transparent 0%,black 3%,black 94%,transparent 100%); }

        /* arrows */
        .jm-arr { width:40px; height:40px; border:1px solid #E0E0E0; background:transparent; cursor:pointer; color:#111; display:flex; align-items:center; justify-content:center; transition:all 0.22s ease; flex-shrink:0; }
        .jm-arr:hover { background:#0A0A0A; color:#FFF; border-color:#0A0A0A; }

        /* categories */
        .jm-cat { display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; min-width:80px; }
        .jm-cat-ic { width:68px; height:68px; display:flex; align-items:center; justify-content:center; border:1px solid #EBEBEB; background:#FFFFFF; transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .jm-cat:hover .jm-cat-ic { border-color:#C9A96E; transform:translateY(-3px); color:#C9A96E; box-shadow:0 8px 24px rgba(201,169,110,0.15); }
        .jm-cat.active .jm-cat-ic { background:#0A0A0A; color:#C9A96E; border-color:#0A0A0A; transform:translateY(-3px); }
        .jm-cat-lb { font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:#BBBBBB; transition:color 0.25s; font-family:'Inter',sans-serif; }
        .jm-cat:hover .jm-cat-lb, .jm-cat.active .jm-cat-lb { color:#111; }
        .jm-cat-row { overflow-x:auto; display:flex; gap:16px; padding:8px 2px 20px; scrollbar-width:none; }
        .jm-cat-row::-webkit-scrollbar { display:none; }

        /* badges */
        .jm-b-out { position:absolute; top:14px; left:0; background:#888; color:#FFF; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }
        .jm-b-low { position:absolute; top:14px; left:0; background:#0A0A0A; color:#C9A96E; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }

        /* toast */
        .jm-toast { position:fixed; top:80px; right:24px; z-index:99999; background:#0A0A0A; color:#FFF; border-top:1px solid #C9A96E; padding:18px 22px; display:flex; align-items:center; gap:16px; min-width:290px; max-width:360px; box-shadow:0 32px 80px rgba(0,0,0,0.24); transition:all 0.48s cubic-bezier(0.16,1,0.3,1); pointer-events:none; }
        .jm-toast.in  { opacity:1; transform:translateX(0); pointer-events:auto; }
        .jm-toast.out { opacity:0; transform:translateX(60px); }

        /* collage */
        .jm-col-wrap { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:2px; }
        .jm-col-item { overflow:hidden; background:#F5F5F5; position:relative; cursor:pointer; aspect-ratio:1/1; }
        .jm-col-item img { width:100%; height:100%; object-fit:contain; padding:14%; transition:transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .jm-col-item:hover img { transform:scale(1.07); }
        .jm-col-veil { position:absolute; inset:0; background:rgba(0,0,0,0); transition:background 0.3s; display:flex; flex-direction:column; justify-content:flex-end; padding:14px; }
        .jm-col-item:hover .jm-col-veil { background:rgba(0,0,0,0.22); }
        .jm-col-chip { font-family:'Inter',sans-serif; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#FFF; background:rgba(0,0,0,0.72); padding:5px 10px; width:fit-content; opacity:0; transform:translateY(8px); transition:all 0.28s ease; }
        .jm-col-item:hover .jm-col-chip { opacity:1; transform:translateY(0); }
        .jm-col-price { position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.94); padding:4px 10px; font-family:'Inter',sans-serif; font-size:11px; font-weight:700; color:#0A0A0A; letter-spacing:-0.2px; border:1px solid rgba(0,0,0,0.06); }

        /* feature row */
        .jm-feat { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#EBEBEB; }
        .jm-feat-cell { background:#FFFFFF; padding:28px 22px; display:flex; align-items:flex-start; gap:14px; transition:background 0.22s; }
        .jm-feat-cell:hover { background:#FAFAFA; }
        .jm-feat-ic { width:36px; height:36px; background:#F5F5F5; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.22s; }
        .jm-feat-cell:hover .jm-feat-ic { background:#0A0A0A; }
        .jm-feat-cell:hover .jm-feat-ic svg { stroke:#C9A96E; }

        /* band */
        .jm-band { background:#0A0A0A; position:relative; }
        .jm-band::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent 0%,#C9A96E 50%,transparent 100%); }

        /* cta */
        .jm-btn { padding:15px 36px; background:#0A0A0A; color:#FFF; border:1px solid #0A0A0A; font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.3s ease; }
        .jm-btn:hover { background:#C9A96E; border-color:#C9A96E; color:#0A0A0A; }
        .jm-btn-o { padding:15px 32px; background:transparent; color:#0A0A0A; border:1px solid #CCCCCC; font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.28s ease; }
        .jm-btn-o:hover { border-color:#C9A96E; color:#C9A96E; }

        /* footer */
        .jm-foot { background:#0A0A0A; padding:64px 6% 40px; }
        .jm-foot-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:48px; padding-bottom:48px; border-bottom:1px solid #1A1A1A; margin-bottom:32px; }
        .jm-foot-link { display:block; font-size:12px; color:#555; cursor:pointer; transition:color 0.2s; margin-bottom:11px; font-family:'Inter',sans-serif; text-decoration:none; }
        .jm-foot-link:hover { color:#C9A96E; }
        .jm-foot-lbl { font-size:9px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:#333; margin-bottom:20px; font-family:'Inter',sans-serif; }

        @media (max-width:960px) {
          .jm-hero-g { grid-template-columns:1fr !important; }
          .jm-feat { grid-template-columns:1fr 1fr; }
          .jm-foot-grid { grid-template-columns:1fr 1fr; }
        }
        @media (max-width:600px) {
          .jm-feat { grid-template-columns:1fr; }
          .jm-foot-grid { grid-template-columns:1fr; }
          .jm-hero-cta { flex-direction:column; }
          .jm-band-inner { flex-direction:column !important; }
        }
      `}</style>

      {/* ── TOAST ── */}
      <div className={`jm-toast ${showToast?"in":"out"}`}>
        {toastProduct && (<>
          <div style={{ width:"48px", height:"48px", background:"#FFFFFF", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px" }}>
            <img src={toastProduct.imageUrl||unplugged} alt={toastProduct.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e=>e.target.src=unplugged} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", fontWeight:"400", lineHeight:1.25, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{toastProduct.name}</div>
            <div style={{ fontSize:"9px", color:"#C9A96E", marginTop:"5px", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>Added to bag</div>
          </div>
          <button onClick={()=>navigate("/cart")} style={{ background:"transparent", border:"1px solid #2A2A2A", color:"#C9A96E", padding:"7px 14px", fontSize:"9px", fontWeight:"600", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", flexShrink:0, fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#C9A96E";e.currentTarget.style.color="#0A0A0A";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C9A96E";}}>Bag</button>
        </>)}
      </div>

      <div style={{ background:"#FAFAFA", minHeight:"100vh" }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section style={{ background:"#FFFFFF", borderBottom:"1px solid #EBEBEB" }}>
          <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"0 6%" }}>
            <div className="jm-hero-g" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:"92vh", alignItems:"center" }}>

              {/* LEFT */}
              <div style={{ padding:"80px 60px 80px 0", borderRight:"1px solid #F0F0F0" }}>

                {!heroVisible ? null : <>
                  <div className="jm-au" style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
                    <span style={{ width:"32px", height:"1px", background:"#C9A96E", display:"block" }} />
                    <span style={{ fontSize:"9px", fontWeight:"600", letterSpacing:"3.5px", textTransform:"uppercase", color:"#C9A96E", fontFamily:"'Inter',sans-serif" }}>The Jimova Edit — 2026</span>
                  </div>

                  <div className="jm-au jm-d1">
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,6vw,82px)", fontWeight:"300", lineHeight:1.0, letterSpacing:"-2px", color:"#0A0A0A", margin:"0" }}>
                      Premium
                    </h1>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,6vw,82px)", fontWeight:"300", lineHeight:1.0, letterSpacing:"-2px", color:"#0A0A0A", margin:"0 0 4px", fontStyle:"italic" }}>
                      <span style={{ color:"#C9A96E" }}>Essentials.</span>
                    </h1>
                  </div>

                  <div className="jm-au jm-d2" style={{ width:"48px", height:"1px", background:"#EBEBEB", margin:"28px 0" }} />

                  <div className="jm-au jm-d2">
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:"300", color:"#777", lineHeight:1.85, maxWidth:"400px", marginBottom:"40px", letterSpacing:"0.1px" }}>
                      Not everything deserves a place in your life. These do. Each piece is selected for its lasting worth — beyond trend, beyond season.
                    </p>
                  </div>

                  <div className="jm-au jm-d3 jm-hero-cta" style={{ display:"flex", gap:"12px", marginBottom:"60px" }}>
                    <button className="jm-btn" onClick={()=>document.getElementById("jm-grid")?.scrollIntoView({behavior:"smooth"})}>Shop Collection</button>
                    <button className="jm-btn-o" onClick={()=>document.getElementById("jm-cats")?.scrollIntoView({behavior:"smooth"})}>Browse Categories</button>
                  </div>

                  {/* stats */}
                  <div className="jm-au jm-d4" style={{ display:"flex", paddingTop:"28px", borderTop:"1px solid #F0F0F0" }}>
                    {[
                      { n:`${products.length}+`, l:"Products" },
                      { n:`${CATEGORIES.length-1}`, l:"Categories" },
                      { n:"Free", l:"Shipping" },
                      { n:"2026", l:"Collection" },
                    ].map((s,i,arr)=>(
                      <div key={i} style={{ flex:1, paddingRight:"20px", marginRight:i<arr.length-1?"20px":0, borderRight:i<arr.length-1?"1px solid #F0F0F0":"none" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.2vw,28px)", fontWeight:"400", color:"#0A0A0A", letterSpacing:"-0.5px", lineHeight:1 }}>{s.n}</div>
                        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#BBBBBB", letterSpacing:"2px", textTransform:"uppercase", marginTop:"6px" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </>}
              </div>

              {/* RIGHT — product collage */}
              <div className="jm-af jm-d3" style={{ padding:"40px 0 40px 40px", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                {heroProducts.length >= 4 ? (
                  <div className="jm-col-wrap">
                    {heroProducts.map((p,i)=>(
                      <div key={p.id} className="jm-col-item"
                        style={{ background: ["#F7F7F7","#F2F2F2","#F4F4F4","#F0F0F0"][i] }}
                        onClick={()=>navigate(`/product/${p.id}`)}>
                        <img src={p.imageUrl||unplugged} alt={p.name} onError={e=>e.target.src=unplugged} />
                        <div className="jm-col-veil">
                          <div className="jm-col-chip">{p.categoryName}</div>
                        </div>
                        <div className="jm-col-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background:"#F5F5F5", height:"500px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"48px", color:"#E0E0E0", fontWeight:"300" }}>Jimova<span style={{ color:"#C9A96E", fontStyle:"italic" }}>.</span></div>
                  </div>
                )}

                {/* collage caption */}
                {heroProducts.length >= 4 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"16px", padding:"0 2px" }}>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#BBBBBB", letterSpacing:"1.5px", textTransform:"uppercase" }}>Featured pieces</span>
                    <button onClick={()=>document.getElementById("jm-grid")?.scrollIntoView({behavior:"smooth"})}
                      style={{ background:"none", border:"none", fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#C9A96E", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", fontWeight:"600" }}>
                      View all →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE STRIP
        ══════════════════════════════════════════ */}
        <div className="jm-feat" style={{ maxWidth:"1400px", margin:"0 auto" }}>
          {[
            { d:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title:"Verified Products", sub:"Every item quality-checked" },
            { d:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>, title:"Secure Checkout", sub:"Powered by Stripe" },
            { d:<><path d="M5 12h14M12 5l7 7-7 7"/></>, title:"Free Shipping", sub:"On every order" },
            { d:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>, title:"Easy Returns", sub:"Hassle-free policy" },
          ].map((f,i)=>(
            <div key={i} className="jm-feat-cell">
              <div className="jm-feat-ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{f.d}</svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight:"600", color:"#0A0A0A", marginBottom:"3px", letterSpacing:"0.1px" }}>{f.title}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"#AAAAAA", fontWeight:"300" }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            BEST SELLERS
        ══════════════════════════════════════════ */}
        <section style={{ maxWidth:"1400px", margin:"0 auto", padding:"88px 6% 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"40px" }}>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", fontWeight:"600", letterSpacing:"3px", textTransform:"uppercase", color:"#C9A96E", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ width:"20px", height:"1px", background:"#C9A96E", display:"block" }} />
                Icon Series
              </div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3.2vw,42px)", fontWeight:"300", color:"#0A0A0A", margin:0, letterSpacing:"-0.8px" }}>Best Sellers</h2>
            </div>
            <div style={{ display:"flex", gap:"6px" }}>
              <button className="jm-arr" onClick={()=>scroll("left")}><ChevronLeft size={16} strokeWidth={1.5}/></button>
              <button className="jm-arr" onClick={()=>scroll("right")}><ChevronRight size={16} strokeWidth={1.5}/></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex", gap:"2px", overflow:"hidden" }}>
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} style={{ width:"260px", flexShrink:0, background:"#FFF" }}>
                  <div style={{ background:"#F3F3F3", aspectRatio:"4/5", position:"relative", overflow:"hidden" }}><div className="jm-shimmer" style={{ position:"absolute", inset:0 }}/></div>
                  <div style={{ padding:"16px 18px" }}>
                    <div className="jm-shimmer" style={{ height:"8px", width:"48px", background:"#F3F3F3", marginBottom:"8px", position:"relative", overflow:"hidden" }}/>
                    <div className="jm-shimmer" style={{ height:"14px", width:"80%", background:"#F3F3F3", position:"relative", overflow:"hidden" }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : activeCategory === "All" && bestSellers.length > 0 && (
            <div className="jm-scroll jm-mask" ref={scrollRef}>
              {bestSellers.map((p,i)=>{
                const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                const isOut = stockQuantity===0, isLow = !isOut && stockQuantity<=5;
                return (
                  <div key={`bs-${id}`} className="jm-card" style={{ width:"280px", flexShrink:0, background:"#FFFFFF" }} onClick={()=>navigate(`/product/${id}`)}>
                    <div style={{ background:"#F5F5F5", aspectRatio:"4/5", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <img src={imageUrl||unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"74%", maxHeight:"74%", objectFit:"contain", opacity:isOut?0.3:1 }} onError={e=>e.target.src=unplugged}/>
                      {isOut && <div className="jm-b-out">Sold Out</div>}
                      {isLow && <div className="jm-b-low">Only {stockQuantity} left</div>}
                      <div className="jm-price-bar">
                        <div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C9A96E", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>{categoryName}</div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"18px", fontWeight:"600", color:"#FFFFFF", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                        </div>
                        <button className="jm-add" onClick={e=>handleAddToCart(e,p)} disabled={isOut}
                          style={{ padding:"9px 16px", border:isOut?"1px solid #444":"1px solid #C9A96E", background:"transparent", color:"#C9A96E", fontSize:"9px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", cursor:isOut?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif" }}>
                          {isOut?"Sold Out":"Add"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:"18px 20px 22px", background:"#FFFFFF" }}>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C9A96E", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>{categoryName}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", fontWeight:"400", color:"#0A0A0A", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:"10px" }}>{name}</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:"600", color:"#0A0A0A", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            EDITORIAL BAND
        ══════════════════════════════════════════ */}
        <div className="jm-band" style={{ margin:"80px 0 0" }}>
          <div className="jm-band-inner" style={{ maxWidth:"1400px", margin:"0 auto", padding:"64px 6%", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"48px", flexWrap:"wrap" }}>
            <div style={{ maxWidth:"520px" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", fontWeight:"600", letterSpacing:"3px", textTransform:"uppercase", color:"#C9A96E", marginBottom:"16px" }}>Our Standard</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,40px)", color:"#FFFFFF", fontWeight:"300", letterSpacing:"-0.8px", lineHeight:1.25 }}>
                Not a marketplace.<br/>
                <span style={{ fontStyle:"italic", color:"#C9A96E" }}>A curation.</span>
              </div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:"#555", fontWeight:"300", lineHeight:1.85, marginTop:"18px" }}>
                Every product is handpicked. Every category curated. No noise — just pieces worth owning for years to come.
              </p>
            </div>
            <div style={{ display:"flex", gap:"1px" }}>
              {[
                { n:`${products.length}+`, l:"Products" },
                { n:`${CATEGORIES.length-1}`, l:"Categories" },
                { n:"24h", l:"Dispatch" },
              ].map((s,i)=>(
                <div key={i} style={{ padding:"32px 40px", background:"rgba(255,255,255,0.03)", border:"1px solid #1A1A1A", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", color:"#C9A96E", fontWeight:"300", letterSpacing:"-0.5px" }}>{s.n}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginTop:"8px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CATEGORY FILTER
        ══════════════════════════════════════════ */}
        <section id="jm-cats" style={{ maxWidth:"1400px", margin:"0 auto", padding:"88px 6% 0" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"28px", marginBottom:"36px" }}>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", fontWeight:"600", letterSpacing:"3px", textTransform:"uppercase", color:"#C9A96E", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ width:"20px", height:"1px", background:"#C9A96E", display:"block" }} />
                Shop by
              </div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3vw,36px)", fontWeight:"300", color:"#0A0A0A", margin:0, letterSpacing:"-0.6px" }}>Curations</h2>
            </div>
            <div style={{ flex:1, height:"1px", background:"#EBEBEB", marginBottom:"10px" }}/>
          </div>
          <div className="jm-cat-row">
            {CATEGORIES.map((cat,i)=>{
              const isActive = activeCategory===cat.name;
              return (
                <div key={i} className={`jm-cat${isActive?" active":""}`} onClick={()=>setActiveCategory(cat.name)}>
                  <div className="jm-cat-ic" style={{ color:isActive?"#C9A96E":"#666" }}>{cat.icon}</div>
                  <span className="jm-cat-lb" style={{ color:isActive?"#0A0A0A":"#BBBBBB" }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PRODUCTS GRID
        ══════════════════════════════════════════ */}
        <section id="jm-grid" style={{ maxWidth:"1400px", margin:"0 auto", padding:"48px 6% 0" }}>
          {!loading && filteredProducts.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"20px", borderBottom:"1px solid #EBEBEB", marginBottom:"1px" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#BBBBBB", letterSpacing:"2px", textTransform:"uppercase", fontWeight:"500" }}>
                {filteredProducts.length} {filteredProducts.length===1?"piece":"pieces"}{activeCategory!=="All"?` · ${activeCategory}`:""}
              </div>
              <span style={{ width:"28px", height:"1px", background:"#C9A96E", display:"block" }}/>
            </div>
          )}

          {!loading && filteredProducts.length===0 && (
            <div style={{ textAlign:"center", padding:"100px 20px", border:"1px dashed #E0E0E0", background:"#FAFAFA" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:"#0A0A0A", fontWeight:"300", marginBottom:"12px" }}>No pieces found.</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#AAAAAA", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"28px" }}>Explore another curation</div>
              <button className="jm-btn" onClick={()=>setActiveCategory("All")}>View All</button>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1px", background:"#EBEBEB" }}>
            {loading
              ? Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)
              : filteredProducts.map(p=>{
                  const { id, name, price, stockQuantity, imageUrl, categoryName } = p;
                  const isOut = stockQuantity===0, isLow = !isOut && stockQuantity<=5;
                  return (
                    <div key={id} className="jm-card" style={{ background:"#FFFFFF" }} onClick={()=>navigate(`/product/${id}`)}>
                      <div style={{ background:"#F5F5F5", aspectRatio:"1/1", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={imageUrl||unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"72%", maxHeight:"72%", objectFit:"contain", opacity:isOut?0.3:1 }} onError={e=>e.target.src=unplugged}/>
                        {isOut && <div className="jm-b-out">Sold Out</div>}
                        {isLow && <div className="jm-b-low">Only {stockQuantity} left</div>}
                        <div className="jm-price-bar">
                          <div>
                            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C9A96E", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"3px" }}>{categoryName}</div>
                            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"18px", fontWeight:"600", color:"#FFFFFF", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add" onClick={e=>handleAddToCart(e,p)} disabled={isOut}
                            style={{ padding:"9px 16px", border:isOut?"1px solid #444":"1px solid #C9A96E", background:"transparent", color:"#C9A96E", fontSize:"9px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", cursor:isOut?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif" }}>
                            {isOut?"Sold Out":"Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"20px" }}>
                        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C9A96E", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>{categoryName}</div>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", fontWeight:"400", color:"#0A0A0A", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"42px", marginBottom:"12px" }}>{name}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:"600", color:"#0A0A0A", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                          {isLow && <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"8px", fontWeight:"600", color:"#C9A96E", textTransform:"uppercase", letterSpacing:"1px" }}>Low stock</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <footer className="jm-foot" style={{ marginTop:"100px" }}>
          <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
            <div className="jm-foot-grid">
              {/* Brand */}
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:"300", color:"#FFFFFF", marginBottom:"18px", letterSpacing:"-0.5px" }}>
                  Jimova<span style={{ color:"#C9A96E", fontStyle:"italic" }}>.</span>
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"#444", fontWeight:"300", lineHeight:1.85, maxWidth:"260px", marginBottom:"28px" }}>
                  A luxury e-commerce destination for pieces worth owning. Curated with intent, delivered with care.
                </p>
                <div style={{ display:"flex", gap:"10px" }}>
                  {["Home","Cart","Orders"].map(l=>(
                    <button key={l} onClick={()=>navigate(l==="Home"?"/":`/${l.toLowerCase()}`)}
                      style={{ background:"transparent", border:"1px solid #1E1E1E", color:"#444", padding:"7px 16px", fontSize:"9px", fontWeight:"600", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#C9A96E";e.currentTarget.style.color="#C9A96E";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#1E1E1E";e.currentTarget.style.color="#444";}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop */}
              <div>
                <div className="jm-foot-lbl">Shop</div>
                {CATEGORIES.filter(c=>c.name!=="All").map(c=>(
                  <a key={c.name} className="jm-foot-link" onClick={()=>{setActiveCategory(c.name);window.scrollTo({top:0,behavior:"smooth"});}}>{c.name}</a>
                ))}
              </div>

              {/* Account */}
              <div>
                <div className="jm-foot-lbl">Account</div>
                {[{l:"Sign In",p:"/login"},{l:"My Orders",p:"/orders"},{l:"My Cart",p:"/cart"}].map(item=>(
                  <a key={item.l} className="jm-foot-link" onClick={()=>navigate(item.p)}>{item.l}</a>
                ))}
              </div>

              {/* Promise */}
              <div>
                <div className="jm-foot-lbl">Our Promise</div>
                {["Free Shipping","Easy Returns","Secure Checkout","Quality Guaranteed"].map(l=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                    <span style={{ width:"4px", height:"4px", background:"#C9A96E", display:"inline-block", transform:"rotate(45deg)", flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"#444" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#2A2A2A", letterSpacing:"1.5px", textTransform:"uppercase" }}>© 2026 Jimova. All rights reserved.</div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ width:"4px", height:"4px", background:"#C9A96E", display:"inline-block", transform:"rotate(45deg)" }}/>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#2A2A2A", letterSpacing:"2.5px", textTransform:"uppercase" }}>Luxury E-Commerce</span>
                <span style={{ width:"4px", height:"4px", background:"#C9A96E", display:"inline-block", transform:"rotate(45deg)" }}/>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;