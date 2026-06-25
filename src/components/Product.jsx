import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import unplugged from "../assets/unplugged.png";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useContext(AppContext);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/products/${id}`);
        setProduct(response.data);
      } catch {
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, baseUrl]);

  const handleAddToCart = () => {
    if (!product || product.stockQuantity <= 0) return;
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to your Bag.`);
    setTimeout(() => setAdded(false), 2500);
  };

  const isOut = product?.stockQuantity === 0;
  const isLow = product && !isOut && product.stockQuantity <= 5;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pd-root {
          min-height: 100vh;
          background: #FCFCFC;
          padding: 60px 6% 100px;
          font-family: 'Inter', sans-serif;
        }

        /* ── BREADCRUMB ── */
        .pd-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 48px;
        }
        .pd-back {
          background: none; border: none; cursor: pointer;
          font-size: 10px; font-weight: 700; color: #AAAAAA;
          text-transform: uppercase; letter-spacing: 1.5px;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s; padding: 0;
          display: flex; align-items: center; gap: 6px;
        }
        .pd-back:hover { color: #C5A059; }
        .pd-breadcrumb-sep { color: #DDDDDD; font-size: 12px; }
        .pd-breadcrumb-cat {
          font-size: 10px; font-weight: 700; color: #C5A059;
          text-transform: uppercase; letter-spacing: 1.5px;
        }

        /* ── LOADING ── */
        .pd-loading {
          min-height: 70vh; display: flex;
          align-items: center; justify-content: center;
        }
        .pd-ring {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1px solid #EBEBEB; border-top-color: #C5A059;
          animation: pd-spin 1s linear infinite;
        }
        @keyframes pd-spin { to { transform: rotate(360deg); } }

        /* ── LAYOUT ── */
        .pd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }

        /* ── IMAGE PANEL ── */
        .pd-img-panel {
          position: sticky; top: 88px;
          background: #F5F5F5;
          border: 1px solid #EBEBEB;
          aspect-ratio: 1/1;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }

        .pd-img {
          max-width: 72%; max-height: 72%;
          object-fit: contain;
          transition: transform 0.8s cubic-bezier(0.25,1,0.5,1), opacity 0.4s ease;
        }
        .pd-img-panel:hover .pd-img { transform: scale(1.04); }

        .pd-img-skeleton {
          position: absolute; inset: 0;
          background: #F0F0F0;
          overflow: hidden;
        }
        .pd-img-skeleton::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: pd-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes pd-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* sold out overlay */
        .pd-sold-overlay {
          position: absolute; inset: 0;
          background: rgba(252,252,252,0.7);
          display: flex; align-items: center; justify-content: center;
        }
        .pd-sold-label {
          font-size: 10px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #AAAAAA;
          border: 1px solid #DDDDDD; padding: 10px 24px;
          background: #FFFFFF;
        }

        /* ── INFO PANEL ── */
        .pd-info { display: flex; flex-direction: column; }

        .pd-eyebrow {
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .pd-eyebrow-line { width: 16px; height: 1px; background: #C5A059; }
        .pd-eyebrow-text {
          font-size: 9px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #C5A059;
        }

        .pd-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 400; color: #111111;
          margin: 0 0 20px; line-height: 1.15; letter-spacing: -0.5px;
        }
        .pd-name em { color: #C5A059; font-style: italic; }

        .pd-price {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3vw, 38px);
          font-weight: 400; color: #111111;
          margin: 0 0 28px; letter-spacing: -0.3px;
        }

        .pd-rule { border: none; border-top: 1px solid #EBEBEB; margin: 0 0 28px; }

        .pd-desc {
          font-size: 14px; font-weight: 300; color: #666666;
          line-height: 1.9; margin: 0 0 32px; letter-spacing: 0.2px;
        }

        /* stock */
        .pd-stock-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 32px;
        }
        .pd-stock-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pd-stock-text {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px;
        }

        /* attributes */
        .pd-attrs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; margin-bottom: 36px;
        }
        .pd-attr {
          padding: 14px 16px; background: #FAFAFA; border: 1px solid #EBEBEB;
        }
        .pd-attr-label {
          font-size: 9px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #AAAAAA; margin-bottom: 5px;
        }
        .pd-attr-value { font-size: 13px; font-weight: 500; color: #111111; }

        /* CTA */
        .pd-cta {
          width: 100%; padding: 18px 24px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          cursor: pointer; margin-bottom: 12px;
          position: relative; overflow: hidden;
          transition: all 0.35s ease;
        }
        .pd-cta::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1); z-index: 0;
        }
        .pd-cta:hover:not(:disabled)::after { transform: scaleX(1); }
        .pd-cta:hover:not(:disabled) { color: #111111; border-color: #C5A059; }
        .pd-cta span { position: relative; z-index: 1; }
        .pd-cta:disabled { background: #F0F0F0; border-color: #EBEBEB; color: #AAAAAA; cursor: not-allowed; }
        .pd-cta.added { background: #5A8F35; border-color: #5A8F35; }
        .pd-cta.added::after { display: none; }

        .pd-secondary {
          width: 100%; padding: 15px 24px;
          background: transparent; color: #888888;
          border: 1px solid #EBEBEB;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s ease;
        }
        .pd-secondary:hover { border-color: #111111; color: #111111; }

        /* trust signals */
        .pd-trust {
          display: flex; gap: 24px; margin-top: 28px;
          padding-top: 24px; border-top: 1px solid #EBEBEB;
        }
        .pd-trust-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; color: #AAAAAA; font-weight: 500;
          letter-spacing: 0.5px;
        }

        @media (max-width: 900px) {
          .pd-grid { grid-template-columns: 1fr; gap: 40px; }
          .pd-img-panel { position: static; aspect-ratio: 4/3; }
          .pd-root { padding: 50px 16px 80px; }
        }
      `}</style>

      <div className="pd-root">

        {/* ── BREADCRUMB ── */}
        <div className="pd-breadcrumb">
          <button className="pd-back" onClick={() => navigate(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          {product && (
            <>
              <span className="pd-breadcrumb-sep">/</span>
              <span className="pd-breadcrumb-cat">{product.categoryName}</span>
            </>
          )}
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="pd-loading">
            <div className="pd-ring" />
          </div>
        )}

        {/* ── NOT FOUND ── */}
        {!loading && !product && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#111111", fontWeight: "400", marginBottom: "12px" }}>
              Product not found<span style={{ color: "#C5A059" }}>.</span>
            </h2>
            <button className="pd-back" onClick={() => navigate("/")} style={{ margin: "0 auto" }}>
              ← Return to Collection
            </button>
          </div>
        )}

        {/* ── PRODUCT ── */}
        {!loading && product && (
          <div className="pd-grid">

            {/* IMAGE */}
            <div className="pd-img-panel" style={{ position: "sticky", top: "88px" }}>
              {!imgLoaded && <div className="pd-img-skeleton" />}
              <img
                src={product.imageUrl || unplugged}
                alt={product.name}
                className="pd-img"
                style={{ opacity: imgLoaded ? (isOut ? 0.4 : 1) : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={e => { e.target.src = unplugged; setImgLoaded(true); }}
              />
              {isOut && (
                <div className="pd-sold-overlay">
                  <div className="pd-sold-label">Sold Out</div>
                </div>
              )}
              {isLow && !isOut && (
                <div style={{ position: "absolute", top: "16px", left: "0", background: "#111111", color: "#C5A059", fontSize: "8px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", padding: "5px 14px" }}>
                  Only {product.stockQuantity} left
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="pd-info">
              <div className="pd-eyebrow">
                <span className="pd-eyebrow-line" />
                <span className="pd-eyebrow-text">{product.categoryName || "Curation"}</span>
              </div>

              <h1 className="pd-name">
                {product.name}<em>.</em>
              </h1>

              <div className="pd-price">
                ₹{product.price?.toLocaleString("en-IN")}
              </div>

              <hr className="pd-rule" />

              <p className="pd-desc">{product.description}</p>

              {/* Stock status */}
              <div className="pd-stock-row">
                <span className="pd-stock-dot" style={{ background: isOut ? "#CC4444" : isLow ? "#CC8800" : "#5A8F35" }} />
                <span className="pd-stock-text" style={{ color: isOut ? "#CC4444" : isLow ? "#CC8800" : "#5A8F35" }}>
                  {isOut ? "Out of Stock" : isLow ? `Only ${product.stockQuantity} remaining` : `In Stock — ${product.stockQuantity} available`}
                </span>
              </div>

              {/* Attributes */}
              <div className="pd-attrs">
                <div className="pd-attr">
                  <div className="pd-attr-label">Category</div>
                  <div className="pd-attr-value">{product.categoryName || "—"}</div>
                </div>
                <div className="pd-attr">
                  <div className="pd-attr-label">Availability</div>
                  <div className="pd-attr-value" style={{ color: isOut ? "#CC4444" : "#5A8F35" }}>
                    {isOut ? "Unavailable" : "Available"}
                  </div>
                </div>
                <div className="pd-attr">
                  <div className="pd-attr-label">Shipping</div>
                  <div className="pd-attr-value">Free Delivery</div>
                </div>
                <div className="pd-attr">
                  <div className="pd-attr-label">Returns</div>
                  <div className="pd-attr-value">Free Returns</div>
                </div>
              </div>

              {/* CTA */}
              <button
                className={`pd-cta${added ? " added" : ""}`}
                onClick={handleAddToCart}
                disabled={isOut}
              >
                <span>
                  {added ? (
                    <>
                      <svg style={{ marginRight: 8, verticalAlign: "middle" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Added to Bag
                    </>
                  ) : isOut ? "Currently Unavailable" : "Add to Bag"}
                </span>
              </button>

              <button className="pd-secondary" onClick={() => navigate("/")}>
                ← Continue Shopping
              </button>

              {/* Trust signals */}
              <div className="pd-trust">
                {[
                  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Verified Product" },
                  { icon: "M3 11l19-9-9 19-2-8-8-2z", label: "Fast Dispatch" },
                  { icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z", label: "Premium Quality" },
                ].map((t, i) => (
                  <div key={i} className="pd-trust-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={t.icon} />
                    </svg>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default Product;