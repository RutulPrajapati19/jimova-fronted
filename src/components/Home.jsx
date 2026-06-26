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
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#111", fontWeight:"300" }}>Archive Unavailable</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; }

        /* ── SHIMMER ── */
        @keyframes jm-sh { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .jm-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent); animation:jm-sh 1.8s ease-in-out infinite; }

        /* ── ENTRANCE ── */
        @keyframes jm-up  { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes jm-in  { from{opacity:0} to{opacity:1} }
        .jm-au  { animation:jm-up 1.1s cubic-bezier(0.16,1,0.3,1) both; }
        .jm-af  { animation:jm-in 1.4s ease both; }
        .jm-d1  { animation-delay:0.08s; }
        .jm-d2  { animation-delay:0.18s; }
        .jm-d3  { animation-delay:0.3s; }
        .jm-d4  { animation-delay:0.44s; }
        .jm-d5  { animation-delay:0.58s; }

        /* ── CARDS ── */
        .jm-card { position:relative; cursor:pointer; overflow:hidden; background:#FFFFFF; display:flex; flex-direction:column; transition:transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s ease; }
        .jm-card:hover { transform:translateY(-6px); box-shadow:0 40px 96px rgba(0,0,0,0.1); }
        .jm-card-img { transition:transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        .jm-card:hover .jm-card-img { transform:scale(1.07); }

        /* ── PRICE BAR ── */
        .jm-price-bar { position:absolute; bottom:0; left:0; right:0; background:rgba(6,6,6,0.97); padding:16px 20px; transform:translateY(100%); transition:transform 0.44s cubic-bezier(0.16,1,0.3,1); display:flex; justify-content:space-between; align-items:center; }
        .jm-card:hover .jm-price-bar { transform:translateY(0); }

        /* ── ADD BUTTON ── */
        .jm-add { position:relative; overflow:hidden; z-index:1; transition:color 0.3s; }
        .jm-add::after { content:''; position:absolute; inset:0; background:#C5A059; z-index:-1; transform:scaleX(0); transform-origin:left; transition:transform 0.35s cubic-bezier(0.16,1,0.3,1); }
        .jm-add:hover:not(:disabled)::after { transform:scaleX(1); }
        .jm-add:hover:not(:disabled) { color:#0A0A0A !important; border-color:#C5A059 !important; }
        .jm-add:active:not(:disabled) { transform:scale(0.95); }

        /* ── SCROLL STRIP ── */
        .jm-scroll { overflow-x:auto; display:flex; gap:2px; padding:4px 0 28px; scrollbar-width:none; }
        .jm-scroll::-webkit-scrollbar { display:none; }
        .jm-mask { -webkit-mask-image:linear-gradient(to right,transparent 0%,black 3%,black 94%,transparent 100%); mask-image:linear-gradient(to right,transparent 0%,black 3%,black 94%,transparent 100%); }

        /* ── ARROWS ── */
        .jm-arr { width:40px; height:40px; border:1px solid #E0E0E0; background:#FFF; cursor:pointer; color:#111; display:flex; align-items:center; justify-content:center; transition:all 0.22s ease; flex-shrink:0; }
        .jm-arr:hover { background:#0A0A0A; color:#FFF; border-color:#0A0A0A; }

        /* ── CATEGORIES ── */
        .jm-cat { display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; min-width:80px; }
        .jm-cat-ic { width:68px; height:68px; display:flex; align-items:center; justify-content:center; border:1px solid #EBEBEB; background:#FFFFFF; transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .jm-cat:hover .jm-cat-ic { border-color:#C5A059; transform:translateY(-4px); color:#C5A059; box-shadow:0 8px 24px rgba(197,160,89,0.12); }
        .jm-cat.active .jm-cat-ic { background:#0A0A0A; color:#C5A059; border-color:#0A0A0A; transform:translateY(-4px); }
        .jm-cat-lb { font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:#BBBBBB; transition:color 0.25s; font-family:'Inter',sans-serif; }
        .jm-cat:hover .jm-cat-lb, .jm-cat.active .jm-cat-lb { color:#111; }
        .jm-cat-row { overflow-x:auto; display:flex; gap:16px; padding:8px 2px 20px; scrollbar-width:none; }
        .jm-cat-row::-webkit-scrollbar { display:none; }

        /* ── BADGES ── */
        .jm-b-out { position:absolute; top:14px; left:0; background:#888; color:#FFF; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }
        .jm-b-low { position:absolute; top:14px; left:0; background:#0A0A0A; color:#C5A059; font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; }

        /* ── TOAST ── */
        .jm-toast { position:fixed; top:80px; right:24px; z-index:99999; background:#0A0A0A; color:#FFF; border-top:2px solid #C5A059; padding:18px 22px; display:flex; align-items:center; gap:16px; min-width:290px; max-width:360px; box-shadow:0 40px 80px rgba(0,0,0,0.24); transition:all 0.5s cubic-bezier(0.16,1,0.3,1); pointer-events:none; }
        .jm-toast.in  { opacity:1; transform:translateX(0); pointer-events:auto; }
        .jm-toast.out { opacity:0; transform:translateX(64px); }

        /* ── COLLAGE ── */
        .jm-col-grid { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:3px; }
        .jm-col-item { overflow:hidden; background:#F5F5F5; position:relative; cursor:pointer; aspect-ratio:1/1; }
        .jm-col-img { width:100%; height:100%; object-fit:contain; padding:14%; transition:transform 0.9s cubic-bezier(0.16,1,0.3,1); }
        .jm-col-item:hover .jm-col-img { transform:scale(1.08); }
        .jm-col-veil { position:absolute; inset:0; background:rgba(0,0,0,0); transition:background 0.32s; display:flex; flex-direction:column; justify-content:flex-end; padding:14px; }
        .jm-col-item:hover .jm-col-veil { background:rgba(0,0,0,0.18); }
        .jm-col-tag { font-family:'Inter',sans-serif; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#FFF; background:rgba(0,0,0,0.7); padding:5px 10px; width:fit-content; opacity:0; transform:translateY(10px); transition:all 0.28s ease; }
        .jm-col-item:hover .jm-col-tag { opacity:1; transform:translateY(0); }
        .jm-col-price { position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.96); padding:5px 10px; font-family:'Inter',sans-serif; font-size:11px; font-weight:700; color:#0A0A0A; letter-spacing:-0.2px; border:1px solid rgba(0,0,0,0.07); }

        /* ── FEATURE STRIP ── */
        .jm-feat { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#EBEBEB; }
        .jm-feat-cell { background:#FFFFFF; padding:26px 20px; display:flex; align-items:flex-start; gap:14px; transition:background 0.2s; }
        .jm-feat-cell:hover { background:#FAFAFA; }
        .jm-feat-ic { width:36px; height:36px; border:1px solid #EBEBEB; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.25s; }
        .jm-feat-cell:hover .jm-feat-ic { border-color:#C5A059; }

        /* ── BAND ── */
        .jm-band { background:#0A0A0A; position:relative; overflow:hidden; }
        .jm-band::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#C5A059 50%,transparent); }
        .jm-band-stat { padding:32px 40px; border:1px solid #161616; text-align:center; transition:border-color 0.2s; }
        .jm-band-stat:hover { border-color:#C5A059; }

        /* ── BUTTONS ── */
        .jm-btn { padding:15px 36px; background:#0A0A0A; color:#FFF; border:1px solid #0A0A0A; font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.3s ease; }
        .jm-btn:hover { background:#C5A059; border-color:#C5A059; color:#0A0A0A; }
        .jm-btn-o { padding:15px 32px; background:transparent; color:#0A0A0A; border:1px solid #CCCCCC; font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.28s ease; }
        .jm-btn-o:hover { border-color:#C5A059; color:#C5A059; }

        /* ── SECTION LABEL ── */
        .jm-sec-label { font-family:'Inter',sans-serif; font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#C5A059; display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .jm-sec-label span { width:20px; height:1px; background:#C5A059; display:block; }
        .jm-sec-title { font-family:'Playfair Display',serif; font-size:clamp(26px,3vw,40px); font-weight:300; color:#0A0A0A; margin:0; letter-spacing:-0.8px; }

        /* ── FOOTER ── */
        .jm-foot { background:#060606; padding:72px 6% 44px; }
        .jm-foot-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:48px; padding-bottom:52px; border-bottom:1px solid #111; margin-bottom:32px; }
        .jm-foot-link { display:block; font-size:12px; color:#444; cursor:pointer; transition:color 0.2s; margin-bottom:12px; font-family:'Inter',sans-serif; }
        .jm-foot-link:hover { color:#C5A059; }
        .jm-foot-lbl { font-size:9px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:#2A2A2A; margin-bottom:20px; font-family:'Inter',sans-serif; }

        /* ── RESPONSIVE ── */
        @media (max-width:960px) {
          .jm-hero-g { grid-template-columns:1fr !important; }
          .jm-hero-right { display:none !important; }
          .jm-feat { grid-template-columns:1fr 1fr; }
          .jm-foot-grid { grid-template-columns:1fr 1fr; }
          .jm-band-inner { flex-direction:column !important; }
          .jm-band-stats { flex-direction:row !important; }
        }
        @media (max-width:600px) {
          .jm-feat { grid-template-columns:1fr; }
          .jm-foot-grid { grid-template-columns:1fr; }
          .jm-hero-cta { flex-direction:column; }
          .jm-band-stats { flex-direction:column !important; }
        }
      `}</style>

      {/* ══ TOAST ══ */}
      <div className={`jm-toast ${showToast?"in":"out"}`}>
        {toastProduct && (<>
          <div style={{ width:"48px", height:"48px", background:"#111", border:"1px solid #1A1A1A", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px" }}>
            <img src={toastProduct.imageUrl||unplugged} alt={toastProduct.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e=>e.target.src=unplugged} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", fontWeight:"400", lineHeight:1.25, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{toastProduct.name}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C5A059", marginTop:"5px", letterSpacing:"2px", textTransform:"uppercase" }}>Added to bag ✦</div>
          </div>
          <button onClick={()=>navigate("/cart")}
            style={{ background:"transparent", border:"1px solid #1E1E1E", color:"#C5A059", padding:"7px 14px", fontSize:"9px", fontWeight:"600", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", flexShrink:0, fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#C5A059";e.currentTarget.style.color="#0A0A0A";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C5A059";}}>
            View Bag
          </button>
        </>)}
      </div>

      <div style={{ background:"#FAFAFA", minHeight:"100vh" }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section style={{ background:"#FFFFFF", borderBottom:"1px solid #EBEBEB" }}>
          <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"0 6%" }}>
            <div className="jm-hero-g" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:"92vh", alignItems:"center" }}>

              {/* ── LEFT ── */}
              <div style={{ padding:"80px 64px 80px 0", borderRight:"1px solid #F0F0F0", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                {heroVisible && <>
                  <div className="jm-au" style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"32px" }}>
                    <span style={{ width:"32px", height:"1px", background:"#C5A059", display:"block" }} />
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", fontWeight:"600", letterSpacing:"3.5px", textTransform:"uppercase", color:"#C5A059" }}>The Jimova Edit — 2026</span>
                  </div>

                  <div className="jm-au jm-d1">
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,6.5vw,88px)", fontWeight:"300", lineHeight:0.98, letterSpacing:"-2.5px", color:"#0A0A0A", margin:"0" }}>
                      Premium
                    </h1>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,6.5vw,88px)", fontWeight:"300", lineHeight:0.98, letterSpacing:"-2.5px", color:"#0A0A0A", margin:"0 0 6px", fontStyle:"italic" }}>
                      <span style={{ color:"#C5A059" }}>Essentials.</span>
                    </h1>
                  </div>

                  <div className="jm-au jm-d2" style={{ width:"48px", height:"1px", background:"linear-gradient(to right, #C5A059, transparent)", margin:"28px 0" }} />

                  <p className="jm-au jm-d2" style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:"300", color:"#777", lineHeight:1.85, maxWidth:"380px", marginBottom:"40px", letterSpacing:"0.1px" }}>
                    Not everything deserves a place in your life. These do. Each piece selected for lasting worth — beyond trend, beyond season.
                  </p>

                  <div className="jm-au jm-d3 jm-hero-cta" style={{ display:"flex", gap:"12px", marginBottom:"64px" }}>
                    <button className="jm-btn" onClick={()=>document.getElementById("jm-grid")?.scrollIntoView({behavior:"smooth"})}>
                      Shop Collection
                    </button>
                    <button className="jm-btn-o" onClick={()=>document.getElementById("jm-cats")?.scrollIntoView({behavior:"smooth"})}>
                      Browse Categories
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="jm-au jm-d4" style={{ display:"flex", paddingTop:"28px", borderTop:"1px solid #F0F0F0" }}>
                    {[
                      { n:`${products.length}+`, l:"Products" },
                      { n:`${CATEGORIES.length-1}`, l:"Categories" },
                      { n:"Free", l:"Shipping" },
                      { n:"2026", l:"Collection" },
                    ].map((s,i,arr)=>(
                      <div key={i} style={{ flex:1, paddingRight:"20px", marginRight:i<arr.length-1?"20px":0, borderRight:i<arr.length-1?"1px solid #F0F0F0":"none" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.4vw,30px)", fontWeight:"400", color:"#0A0A0A", letterSpacing:"-0.5px", lineHeight:1 }}>{s.n}</div>
                        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#BBBBBB", letterSpacing:"2px", textTransform:"uppercase", marginTop:"7px" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </>}
              </div>

              {/* ── RIGHT — product collage ── */}
              <div className="jm-hero-right jm-af jm-d3" style={{ padding:"40px 0 40px 40px", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", gap:"16px" }}>
                {heroProducts.length >= 4 ? (
                  <>
                    <div className="jm-col-grid">
                      {heroProducts.map((p,i)=>(
                        <div key={p.id} className="jm-col-item"
                          style={{ background:["#F7F7F5","#F3F3F1","#F5F5F3","#F1F1EF"][i] }}
                          onClick={()=>navigate(`/product/${p.id}`)}>
                          <img src={p.imageUrl||unplugged} alt={p.name} className="jm-col-img" onError={e=>e.target.src=unplugged} />
                          <div className="jm-col-veil">
                            <div className="jm-col-tag">{p.categoryName}</div>
                          </div>
                          <div className="jm-col-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 2px" }}>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#BBBBBB", letterSpacing:"1.5px", textTransform:"uppercase" }}>Featured this week</span>
                      <button onClick={()=>document.getElementById("jm-grid")?.scrollIntoView({behavior:"smooth"})}
                        style={{ background:"none", border:"none", fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#C5A059", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", fontWeight:"600", display:"flex", alignItems:"center", gap:"6px" }}>
                        View all <span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background:"#F5F5F5", height:"500px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"52px", color:"#E0E0E0", fontWeight:"300" }}>Jimova<span style={{ color:"#C5A059", fontStyle:"italic" }}>.</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE STRIP
        ══════════════════════════════════════════ */}
        <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
          <div className="jm-feat">
            {[
              { icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title:"Verified Products", sub:"Every item quality-checked before listing" },
              { icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>, title:"Secure Checkout", sub:"End-to-end encryption via Stripe" },
              { icon:<path d="M5 12h14M12 5l7 7-7 7"/>, title:"Free Shipping", sub:"Complimentary delivery on every order" },
              { icon:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>, title:"Easy Returns", sub:"Hassle-free 30-day return policy" },
            ].map((f,i)=>(
              <div key={i} className="jm-feat-cell">
                <div className="jm-feat-ic">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                </div>
                <div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight:"600", color:"#0A0A0A", marginBottom:"3px" }}>{f.title}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"#AAAAAA", fontWeight:"300", lineHeight:1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BEST SELLERS
        ══════════════════════════════════════════ */}
        <section style={{ maxWidth:"1400px", margin:"0 auto", padding:"96px 6% 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"44px" }}>
            <div>
              <div className="jm-sec-label"><span/>Icon Series</div>
              <h2 className="jm-sec-title">Best Sellers</h2>
            </div>
            <div style={{ display:"flex", gap:"6px" }}>
              <button className="jm-arr" onClick={()=>scroll("left")}><ChevronLeft size={16} strokeWidth={1.5}/></button>
              <button className="jm-arr" onClick={()=>scroll("right")}><ChevronRight size={16} strokeWidth={1.5}/></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex", gap:"2px", overflow:"hidden" }}>
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} style={{ width:"280px", flexShrink:0, background:"#FFF" }}>
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
                  <div key={`bs-${id}`} className="jm-card" style={{ width:"280px", flexShrink:0 }} onClick={()=>navigate(`/product/${id}`)}>
                    <div style={{ background:"#F5F5F5", aspectRatio:"4/5", overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <img src={imageUrl||unplugged} alt={name} className="jm-card-img" style={{ maxWidth:"74%", maxHeight:"74%", objectFit:"contain", opacity:isOut?0.3:1 }} onError={e=>e.target.src=unplugged}/>
                      {isOut && <div className="jm-b-out">Sold Out</div>}
                      {isLow && <div className="jm-b-low">Only {stockQuantity} left</div>}
                      <div className="jm-price-bar">
                        <div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>{categoryName}</div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"18px", fontWeight:"600", color:"#FFF", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                        </div>
                        <button className="jm-add" onClick={e=>handleAddToCart(e,p)} disabled={isOut}
                          style={{ padding:"9px 16px", border:isOut?"1px solid #444":"1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", cursor:isOut?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif" }}>
                          {isOut?"Sold Out":"Add"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:"18px 20px 22px" }}>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C5A059", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>{categoryName}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", fontWeight:"400", color:"#0A0A0A", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:"12px" }}>{name}</div>
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
        <div className="jm-band" style={{ margin:"96px 0 0" }}>
          <div className="jm-band-inner" style={{ maxWidth:"1400px", margin:"0 auto", padding:"72px 6%", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"48px", flexWrap:"wrap" }}>
            <div style={{ maxWidth:"520px" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", fontWeight:"600", letterSpacing:"3px", textTransform:"uppercase", color:"#C5A059", marginBottom:"16px" }}>Our Standard</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3.5vw,46px)", color:"#FFFFFF", fontWeight:"300", letterSpacing:"-1px", lineHeight:1.2 }}>
                Not a marketplace.<br/>
                <span style={{ fontStyle:"italic", color:"#C5A059" }}>A curation.</span>
              </div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:"#4A4A4A", fontWeight:"300", lineHeight:1.9, marginTop:"20px", maxWidth:"400px" }}>
                Every product is handpicked. Every category curated with intent. No noise — just pieces worth owning for years to come.
              </p>
            </div>

            <div className="jm-band-stats" style={{ display:"flex", gap:"1px" }}>
              {[
                { n:`${products.length}+`, l:"Products" },
                { n:`${CATEGORIES.length-1}`, l:"Categories" },
                { n:"24h", l:"Dispatch" },
                { n:"100%", l:"Curated" },
              ].map((s,i)=>(
                <div key={i} className="jm-band-stat">
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"34px", color:"#C5A059", fontWeight:"300", letterSpacing:"-0.5px", lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#333", letterSpacing:"2px", textTransform:"uppercase", marginTop:"10px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CATEGORY FILTER
        ══════════════════════════════════════════ */}
        <section id="jm-cats" style={{ maxWidth:"1400px", margin:"0 auto", padding:"96px 6% 0" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"28px", marginBottom:"36px" }}>
            <div>
              <div className="jm-sec-label"><span/>Shop by</div>
              <h2 className="jm-sec-title">Curations</h2>
            </div>
            <div style={{ flex:1, height:"1px", background:"#EBEBEB", marginBottom:"10px" }}/>
          </div>
          <div className="jm-cat-row">
            {CATEGORIES.map((cat,i)=>{
              const isActive = activeCategory===cat.name;
              return (
                <div key={i} className={`jm-cat${isActive?" active":""}`} onClick={()=>setActiveCategory(cat.name)}>
                  <div className="jm-cat-ic" style={{ color:isActive?"#C5A059":"#666" }}>{cat.icon}</div>
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
              <span style={{ width:"28px", height:"1px", background:"#C5A059", display:"block" }}/>
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
                            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C5A059", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"3px" }}>{categoryName}</div>
                            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"18px", fontWeight:"600", color:"#FFF", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                          </div>
                          <button className="jm-add" onClick={e=>handleAddToCart(e,p)} disabled={isOut}
                            style={{ padding:"9px 16px", border:isOut?"1px solid #444":"1px solid #C5A059", background:"transparent", color:"#C5A059", fontSize:"9px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", cursor:isOut?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif" }}>
                            {isOut?"Sold Out":"Add"}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding:"20px" }}>
                        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#C5A059", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>{categoryName}</div>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", fontWeight:"400", color:"#0A0A0A", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"42px", marginBottom:"12px" }}>{name}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:"600", color:"#0A0A0A", letterSpacing:"-0.3px" }}>₹{price.toLocaleString("en-IN")}</div>
                          {isLow && <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"8px", fontWeight:"600", color:"#C5A059", textTransform:"uppercase", letterSpacing:"1px" }}>Low stock</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FULL FOOTER
        ══════════════════════════════════════════ */}
        <footer className="jm-foot" style={{ marginTop:"100px" }}>
          <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
            <div className="jm-foot-grid">

              {/* Brand */}
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"36px", fontWeight:"300", color:"#FFFFFF", marginBottom:"20px", letterSpacing:"-1px" }}>
                  Jimova<span style={{ color:"#C5A059", fontStyle:"italic" }}>.</span>
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"#3A3A3A", fontWeight:"300", lineHeight:1.9, maxWidth:"260px", marginBottom:"32px" }}>
                  A luxury e-commerce destination for pieces worth owning. Curated with intent, delivered with care.
                </p>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {["Home","Cart","Orders"].map(l=>(
                    <button key={l} onClick={()=>navigate(l==="Home"?"/":`/${l.toLowerCase()}`)}
                      style={{ background:"transparent", border:"1px solid #161616", color:"#3A3A3A", padding:"8px 18px", fontSize:"9px", fontWeight:"600", letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#C5A059";e.currentTarget.style.color="#C5A059";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#161616";e.currentTarget.style.color="#3A3A3A";}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop */}
              <div>
                <div className="jm-foot-lbl">Shop</div>
                {CATEGORIES.filter(c=>c.name!=="All").map(c=>(
                  <div key={c.name} className="jm-foot-link" onClick={()=>{ setActiveCategory(c.name); window.scrollTo({top:0,behavior:"smooth"}); }}>{c.name}</div>
                ))}
              </div>

              {/* Account */}
              <div>
                <div className="jm-foot-lbl">Account</div>
                {[{l:"Sign In",p:"/login"},{l:"My Orders",p:"/orders"},{l:"My Bag",p:"/cart"},{l:"Profile",p:"/profile"}].map(item=>(
                  <div key={item.l} className="jm-foot-link" onClick={()=>navigate(item.p)}>{item.l}</div>
                ))}
              </div>

              {/* Promise */}
              <div>
                <div className="jm-foot-lbl">Our Promise</div>
                {["Free Shipping on all orders","Easy 30-day returns","Secure Stripe checkout","100% quality guaranteed"].map(l=>(
                  <div key={l} style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"13px" }}>
                    <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)", flexShrink:0, marginTop:"5px" }}/>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"#3A3A3A", lineHeight:1.5 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"#222", letterSpacing:"1.5px", textTransform:"uppercase" }}>© 2026 Jimova. All rights reserved.</div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)" }}/>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"9px", color:"#222", letterSpacing:"2.5px", textTransform:"uppercase" }}>Luxury E-Commerce</span>
                <span style={{ width:"4px", height:"4px", background:"#C5A059", display:"inline-block", transform:"rotate(45deg)" }}/>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;