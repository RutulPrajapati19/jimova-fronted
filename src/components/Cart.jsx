import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import api from "../api";
import CheckoutPopup from "./CheckoutPopup";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length) {
      setCartItems(cart);
    } else {
      setCartItems([]);
    }
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleIncreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stockQuantity) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          toast.info("Cannot add more than available stock");
        }
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  const handleDecreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    );
    setCartItems(newCartItems);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to place an order.");
      setTimeout(() => setShowModal(false), 1500);
      return;
    }

    try {
      toast.info("Preparing secure checkout...", { autoClose: 2000 });

      // 1. SYNC LOCAL CART TO MYSQL DATABASE FIRST
      for (const item of cartItems) {
        try {
          await api.post("/api/cart", {
            productId: item.id,
            quantity: item.quantity,
          });
        } catch (syncError) {
          console.warn(`Could not sync item ${item.name} (might already be in DB)`);
        }
      }

      // 2. NOW GENERATE THE STRIPE SESSION
      const response = await api.post("/api/payment/create-checkout-session", {});

      if (response.data && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error("Could not initiate checkout session.");
      }
    } catch (error) {
      console.error("Critical checkout error:", error);

      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error.response && error.response.status === 403) {
        toast.error("Session expired or invalid. Please log out and log back in.");
      } else {
        toast.error("Failed to connect to payment gateway. Please try again.");
      }
      setShowModal(false);
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
          .luxury-serif { font-family: 'Playfair Display', serif; }
          
          .luxury-btn {
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative;
            z-index: 1;
            overflow: hidden;
          }
          .luxury-btn::after {
            content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
            background-color: transparent; border: 1px solid #111111; z-index: -1;
            transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .luxury-btn:hover:not(:disabled)::after { transform: translateY(0); }
          .luxury-btn:hover:not(:disabled) { color: #111111 !important; background: transparent !important; }
          .luxury-btn:active:not(:disabled) { transform: scale(0.98); }
        `}
      </style>

      <div style={{ padding: "100px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">

            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Checkout</span>
              </div>
              <h1 className="luxury-serif" style={{ fontSize: "44px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>
                Your Bag<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </h1>
              <p style={{ marginTop: "12px", color: "#666666", fontSize: "14px", fontWeight: "400", letterSpacing: "0.5px", margin: 0 }}>
                Review your curated items and proceed to checkout.
              </p>
            </div>

            {cart.length === 0 ? (
              <div style={{ background: "#FFFFFF", borderRadius: "0px", padding: "100px 20px", border: "1px solid #EAEAEA", textAlign: "center" }}>
                <h5 className="luxury-serif" style={{ fontSize: "24px", fontWeight: "400", color: "#111111", marginBottom: "24px" }}>
                  Your collection is empty.
                </h5>
                <a href="/" className="luxury-btn" style={{ display: "inline-block", padding: "14px 32px", borderRadius: "0px", background: "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", textDecoration: "none", border: "1px solid #111111" }}>
                  Explore Essentials
                </a>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", background: "#FFFFFF", borderRadius: "0px", border: "1px solid #EAEAEA", flexWrap: "wrap", gap: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <div style={{ width: "96px", height: "120px", background: "#F8F8F8", borderRadius: "0px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
                          <img src={item.imageUrl || '/fallback-image.jpg'} alt={item.name} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>
                            {item.categoryName || 'Curation'}
                          </div>
                          <div className="luxury-serif" style={{ fontSize: "18px", fontWeight: "600", color: "#111111", lineHeight: "1.3" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "400", color: "#111111", marginTop: "12px", letterSpacing: "0.5px" }}>
                            ₹{item.price?.toLocaleString('en-IN') || item.price}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #EAEAEA", borderRadius: "0px", padding: "4px" }}>
                          <button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#111111", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >−</button>
                          <span style={{ width: "36px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#111111" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#111111", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >+</button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          style={{ background: "transparent", border: "none", color: "#999999", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.3s ease" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#111111"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#999999"}
                        >
                          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#FFFFFF", borderRadius: "0px", padding: "40px", border: "1px solid #EAEAEA", marginTop: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #EAEAEA" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#888888", textTransform: "uppercase", letterSpacing: "1.5px" }}>Subtotal</span>
                    <span className="luxury-serif" style={{ fontSize: "32px", fontWeight: "400", color: "#111111" }}>
                      ₹{totalPrice.toLocaleString('en-IN') || totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="luxury-btn"
                    style={{ width: "100%", padding: "20px", borderRadius: "0px", border: "1px solid #111111", background: "#111111", color: "#FFFFFF", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer" }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <CheckoutPopup
          show={showModal}
          handleClose={() => setShowModal(false)}
          cartItems={cartItems}
          totalPrice={totalPrice}
          onCheckout={handleCheckout}
        />
        <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "90px" }} />
      </div>
    </>
  );
};

export default Cart;