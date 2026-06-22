import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import unplugged from "../assets/unplugged.png";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setCartItems(cart.length ? cart : []); }, [cart]);
  useEffect(() => {
    setTotalPrice(cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
  }, [cartItems]);

  const handleIncrease = (id) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (item.quantity < item.stockQuantity) return { ...item, quantity: item.quantity + 1 };
        else { toast.info("Maximum stock reached."); return item; }
      }
      return item;
    }));
  };

  const handleDecrease = (id) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    ));
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please sign in to checkout."); return; }
    setCheckoutLoading(true);
    try {
      toast.info("Preparing secure checkout…", { autoClose: 2000 });
      for (const item of cartItems) {
        try { await api.post("/api/cart", { productId: item.id, quantity: item.quantity }); }
        catch { /* already in DB */ }
      }
      const res = await api.post("/api/payment/create-checkout-session", {});
      if (res.data?.checkoutUrl) window.location.href = res.data.checkoutUrl;
      else toast.error("Could not initiate checkout.");
    } catch (err) {
      if (err.response?.status === 403) toast.error("Session expired. Please log in again.");
      else toast.error("Payment gateway error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        .jm-cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 24px;
          align-items: center;
          padding: 28px;
          background: #FFFFFF;
          border: 1px solid #EBEBEB;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .jm-cart-item:hover { border-color: #D0D0D0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }

        .jm-qty-btn {
          width: 34px; height: 34px; background: transparent; border: none;
          color: #111; font-size: 18px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: color 0.2s ease;
        }
        .jm-qty-btn:hover { color: #C5A059; }

        .jm-remove-btn {
          background: none; border: none; cursor: pointer;
          font-size: 9px; font-weight: 700; color: #BBBBBB;
          letter-spacing: 1.5px; text-transform: uppercase;
          transition: color 0.3s ease; padding: 4px 0;
          font-family: 'Inter', sans-serif;
        }
        .jm-remove-btn:hover { color: #111; }

        .jm-checkout-btn {
          width: 100%; padding: 18px; border: 1px solid #111;
          background: #111; color: #FFF; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 2px; cursor: pointer;
          transition: all 0.35s ease; font-family: 'Inter', sans-serif;
          position: relative; overflow: hidden;
        }
        .jm-checkout-btn:not(:disabled):hover { background: #C5A059; border-color: #C5A059; color: #111; }
        .jm-checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .jm-empty-btn {
          display: inline-block; padding: 14px 40px; background: #111;
          color: #FFF; font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; text-decoration: none; border: 1px solid #111;
          cursor: pointer; transition: all 0.3s ease; font-family: 'Inter', sans-serif;
        }
        .jm-empty-btn:hover { background: #C5A059; border-color: #C5A059; color: #111; }

        @media (max-width: 640px) {
          .jm-cart-item {
            grid-template-columns: 80px 1fr;
            grid-template-rows: auto auto;
          }
          .jm-cart-item-actions {
            grid-column: 1 / -1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #F5F5F5;
          }
        }
      `}</style>

      <div style={{ padding: "80px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ width: "24px", height: "1px", background: "#C5A059" }} />
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#C5A059", letterSpacing: "3px", textTransform: "uppercase" }}>Your Selection</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px,5vw,52px)", fontWeight: "400", color: "#111", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Your Bag<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </h1>
            {cartItems.length > 0 && (
              <p style={{ color: "#999", fontSize: "13px", margin: 0, letterSpacing: "0.3px" }}>
                {itemCount} {itemCount === 1 ? "item" : "items"} selected
              </p>
            )}
          </div>

          {cartItems.length === 0 ? (
            /* Empty state */
            <div style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "100px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "20px", opacity: 0.15 }}>◻</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "400", color: "#111", marginBottom: "10px" }}>
                Your bag is empty.
              </h2>
              <p style={{ color: "#AAAAAA", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "32px" }}>
                Discover pieces worth keeping.
              </p>
              <button className="jm-empty-btn" onClick={() => navigate("/")}>Explore Collection</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

              {/* Cart items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="jm-cart-item">
                    {/* Image */}
                    <div style={{ width: "100px", height: "120px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <img src={item.imageUrl || unplugged} alt={item.name} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} onError={e => e.target.src = unplugged} />
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>
                        {item.categoryName || "Curation"}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "500", color: "#111", lineHeight: 1.3, marginBottom: "10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#111", letterSpacing: "-0.2px" }}>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "2px" }}>
                          ₹{item.price?.toLocaleString("en-IN")} each
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="jm-cart-item-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                      {/* Quantity */}
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #EBEBEB" }}>
                        <button className="jm-qty-btn" onClick={() => handleDecrease(item.id)}>−</button>
                        <span style={{ width: "36px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#111", fontFamily: "'Inter', sans-serif" }}>{item.quantity}</span>
                        <button className="jm-qty-btn" onClick={() => handleIncrease(item.id)}>+</button>
                      </div>
                      <button className="jm-remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", padding: "32px", position: "sticky", top: "88px" }}>
                <div style={{ fontSize: "9px", fontWeight: "700", color: "#BBBBBB", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>Order Summary</div>

                {/* Line items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#666", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#111", flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #EBEBEB", paddingTop: "20px", marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#AAAAAA", textTransform: "uppercase", letterSpacing: "1.5px" }}>Subtotal</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "400", color: "#111" }}>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "#AAAAAA", letterSpacing: "0.5px" }}>Shipping</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#28a745", letterSpacing: "0.5px" }}>Free</span>
                  </div>
                </div>

                <button className="jm-checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Preparing…" : "Proceed to Checkout"}
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span style={{ fontSize: "10px", color: "#AAAAAA", letterSpacing: "0.5px" }}>Secured by Stripe</span>
                </div>

                <button onClick={() => navigate("/")} style={{ marginTop: "16px", background: "none", border: "none", width: "100%", textAlign: "center", fontSize: "10px", color: "#AAAAAA", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "600", transition: "color 0.3s ease", fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#111"}
                  onMouseLeave={e => e.currentTarget.style.color = "#AAAAAA"}>
                  ← Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default Cart;