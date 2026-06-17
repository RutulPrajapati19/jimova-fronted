import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view your orders.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
          setLoading(false);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
      } catch {
        localStorage.removeItem("token");
        toast.error("Invalid session. Please log in again.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        const response = await api.get("/api/orders/my-orders");
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          toast.error("Failed to load your orders. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }
        .spinner { width: 40px; height: 40px; border: 2px solid #EAEAEA; border-top: 2px solid #C5A059; border-radius: 50%; animation: spin 1s linear infinite; margin: 40px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .order-card:hover { border-color: #C5A059 !important; transition: border-color 0.2s ease; }
      `}</style>

      <div style={{ padding: "100px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">

            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 16, height: 1, background: "#C5A059" }}></span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Archive</span>
              </div>
              <h1 className="luxury-serif" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>
                Your Orders<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
              </h1>
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : orders.length === 0 ? (
              <div style={{ background: "#FFFFFF", padding: "100px 20px", border: "1px solid #EAEAEA", textAlign: "center" }}>
                <h5 className="luxury-serif" style={{ fontSize: 24, fontWeight: 400, color: "#111111", marginBottom: 24 }}>
                  No past orders found.
                </h5>
                <a href="/" style={{ display: "inline-block", padding: "14px 32px", background: "#111111", color: "#FFFFFF", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", textDecoration: "none" }}>
                  Explore Essentials
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {orders.map((order, index) => (
                  <div key={order.orderId} className="order-card" style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", padding: 32, position: "relative" }}>

                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                          {/* ✦ FIX: Show sequential order number, not DB ID ✦ */}
                          Order #{orders.length - index}
                        </div>
                        <div style={{ fontSize: 14, color: "#111111", fontWeight: 500 }}>
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                          Total Amount
                        </div>
                        <div className="luxury-serif" style={{ fontSize: 24, color: "#111111" }}>
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ borderTop: "1px solid #EAEAEA", borderBottom: "1px solid #EAEAEA", padding: "24px 0", marginBottom: 24 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>
                        Curations in this order
                      </div>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: idx === order.items.length - 1 ? 0 : 16 }}>
                            <div style={{ width: 64, height: 64, background: "#F8F8F8", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
                              <img
                                src={item.imageUrl || "https://placehold.co/64x64?text=No+Image"}
                                alt={item.productName}
                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                onError={(e) => { e.target.src = "https://placehold.co/64x64?text=No+Image"; }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="luxury-serif" style={{ fontSize: 16, fontWeight: 600, color: "#111111" }}>
                                {item.productName}
                              </div>
                              <div style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
                                Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString("en-IN")}
                              </div>
                              <div style={{ fontSize: 13, color: "#111111", fontWeight: 500, marginTop: 2 }}>
                                ₹{(item.quantity * item.unitPrice)?.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: 13, color: "#999999" }}>No item details available.</div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                          Status
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: order.status === "COMPLETED" ? "#C5A059" : order.status === "SHIPPED" ? "#639922" : "#111111" }}></span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#111111", textTransform: "uppercase", letterSpacing: "1px" }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", maxWidth: 250 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                          Shipping to
                        </div>
                        <div style={{ fontSize: 12, color: "#666666", lineHeight: 1.5 }}>
                          {order.shippingAddress}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: 90 }} />
    </>
  );
};

export default Order;