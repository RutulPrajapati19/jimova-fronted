import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import unplugged from "../assets/unplugged.png";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);
  const searchResults = location.state?.searchData || [];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to bag`, { autoClose: 2000 });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .sr-root {
          min-height: 100vh;
          background: #FCFCFC;
          padding: 80px 6% 100px;
          font-family: 'Inter', sans-serif;
        }

        /* ── HEADER ── */
        .sr-header { margin-bottom: 52px; }

        .sr-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
        }
        .sr-eyebrow-line { width: 16px; height: 1px; background: #C5A059; }
        .sr-eyebrow-text {
          font-size: 9px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: #C5A059;
        }

        .sr-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400; color: #111111;
          margin: 0 0 10px; letter-spacing: -0.5px; line-height: 1.1;
        }
        .sr-title em { color: #C5A059; font-style: italic; }

        .sr-count {
          font-size: 12px; color: #AAAAAA;
          font-weight: 400; letter-spacing: 0.3px;
        }
        .sr-count strong { color: #111111; font-weight: 600; }

        /* ── RULE ── */
        .sr-rule {
          display: flex; align-items: center;
          gap: 20px; margin-bottom: 36px;
        }
        .sr-rule-line { flex: 1; height: 1px; background: #EBEBEB; }
        .sr-rule-text {
          font-size: 10px; font-weight: 600; color: #AAAAAA;
          text-transform: uppercase; letter-spacing: 2px;
          white-space: nowrap;
        }

        /* ── GRID ── */
        .sr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 2px;
        }

        /* ── CARD ── */
        .sr-card {
          background: #FFFFFF;
          border: 1px solid #EBEBEB;
          cursor: pointer;
          display: flex; flex-direction: column;
          transition: border-color 0.4s ease, transform 0.5s cubic-bezier(0.25,1,0.5,1), box-shadow 0.5s ease;
          position: relative; overflow: hidden;
        }
        .sr-card:hover {
          border-color: #C5A059;
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.07);
          z-index: 1;
        }

        .sr-card-img-wrap {
          background: #F5F5F5;
          aspect-ratio: 1/1;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }

        .sr-card-img {
          max-width: 72%; max-height: 72%;
          object-fit: contain;
          transition: transform 0.8s cubic-bezier(0.25,1,0.5,1);
        }
        .sr-card:hover .sr-card-img { transform: scale(1.06); }

        /* hover price bar — same as Home */
        .sr-price-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(17,17,17,0.96);
          padding: 14px 18px;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.25,1,0.5,1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .sr-card:hover .sr-price-bar { transform: translateY(0); }

        .sr-add-btn {
          position: relative; overflow: hidden; z-index: 1;
          padding: 9px 16px;
          border: 1px solid #C5A059; background: transparent;
          color: #C5A059; font-size: 9px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: color 0.3s ease;
        }
        .sr-add-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #C5A059; z-index: -1;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.25,1,0.5,1);
        }
        .sr-add-btn:hover::after { transform: scaleX(1); }
        .sr-add-btn:hover { color: #111111; border-color: #C5A059; }

        .sr-card-body { padding: 18px 20px 22px; }

        .sr-cat {
          font-size: 9px; font-weight: 700;
          color: #C5A059; text-transform: uppercase;
          letter-spacing: 2px; margin-bottom: 7px;
        }

        .sr-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 500; color: #111111;
          line-height: 1.4; margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; min-height: 42px;
        }

        .sr-price {
          font-size: 14px; font-weight: 600;
          color: #111111; letter-spacing: -0.2px;
        }

        /* ── EMPTY ── */
        .sr-empty {
          background: #FFFFFF; border: 1px solid #EBEBEB;
          padding: 100px 40px; text-align: center;
        }
        .sr-empty-icon {
          width: 64px; height: 64px; border-radius: 50%;
          border: 1px solid #EBEBEB;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }
        .sr-empty h2 {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 400; color: #111111;
          margin: 0 0 10px;
        }
        .sr-empty p { font-size: 13px; color: #AAAAAA; margin: 0 0 32px; }
        .sr-empty-btn {
          display: inline-block; padding: 14px 40px;
          background: #111111; color: #FFFFFF;
          border: 1px solid #111111; font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.3s ease;
        }
        .sr-empty-btn:hover { background: #C5A059; border-color: #C5A059; color: #111111; }

        /* ── SOLD OUT BADGE ── */
        .sr-badge-out {
          position: absolute; top: 12px; left: 0;
          background: #AAAAAA; color: #FFF;
          font-size: 8px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 4px 12px;
        }
        .sr-badge-low {
          position: absolute; top: 12px; left: 0;
          background: #111111; color: #C5A059;
          font-size: 8px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 4px 12px;
        }

        @media (max-width: 600px) {
          .sr-root { padding: 70px 16px 80px; }
          .sr-grid { grid-template-columns: repeat(2, 1fr); gap: 1px; }
          .sr-title { font-size: 28px; }
        }
      `}</style>

      <div className="sr-root">

        {/* ── HEADER ── */}
        <div className="sr-header">
          <div className="sr-eyebrow">
            <span className="sr-eyebrow-line" />
            <span className="sr-eyebrow-text">Search Results</span>
          </div>
          <h1 className="sr-title">
            Curations Found<em>.</em>
          </h1>
          <p className="sr-count">
            <strong>{searchResults.length}</strong>{" "}
            {searchResults.length === 1 ? "piece" : "pieces"} matching your search
          </p>
        </div>

        {searchResults.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h2>Nothing found.</h2>
            <p>Try a different search term or browse the full collection.</p>
            <button className="sr-empty-btn" onClick={() => navigate("/")}>
              Explore Collection
            </button>
          </div>
        ) : (
          <>
            <div className="sr-rule">
              <span className="sr-rule-text">
                {searchResults.length} {searchResults.length === 1 ? "piece" : "pieces"}
              </span>
              <span className="sr-rule-line" />
            </div>

            <div className="sr-grid">
              {searchResults.map((product) => {
                const isOut = product.stockQuantity === 0;
                const isLow = !isOut && product.stockQuantity <= 5;
                return (
                  <div
                    key={product.id}
                    className="sr-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="sr-card-img-wrap">
                      <img
                        src={product.imageUrl || unplugged}
                        alt={product.name}
                        className="sr-card-img"
                        style={{ opacity: isOut ? 0.3 : 1 }}
                        onError={e => { e.target.src = unplugged; }}
                      />
                      {isOut && <div className="sr-badge-out">Sold Out</div>}
                      {isLow && <div className="sr-badge-low">Only {product.stockQuantity} left</div>}

                      {/* Hover price bar */}
                      <div className="sr-price-bar">
                        <div>
                          <div style={{ fontSize: "9px", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>
                            {product.categoryName}
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: "600", color: "#FFF" }}>
                            ₹{product.price?.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <button
                          className="sr-add-btn"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isOut}
                        >
                          {isOut ? "Sold Out" : "Add"}
                        </button>
                      </div>
                    </div>

                    <div className="sr-card-body">
                      <div className="sr-cat">{product.categoryName || "Curation"}</div>
                      <div className="sr-name">{product.name}</div>
                      <div className="sr-price">₹{product.price?.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back link */}
            <div style={{ textAlign: "center", marginTop: "56px" }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "10px", fontWeight: "700", color: "#AAAAAA",
                  textTransform: "uppercase", letterSpacing: "2px",
                  fontFamily: "'Inter', sans-serif", transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#C5A059"}
                onMouseLeave={e => e.currentTarget.style.color = "#AAAAAA"}
              >
                ← Back to Collection
              </button>
            </div>
          </>
        )}
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default SearchResults;