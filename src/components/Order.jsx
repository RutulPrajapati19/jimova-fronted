import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import unplugged from "../assets/unplugged.png";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) { toast.error("Please log in to view your orders."); setLoading(false); setTimeout(() => navigate("/login"), 2000); return; }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) { localStorage.removeItem("token"); toast.error("Session expired."); setLoading(false); setTimeout(() => navigate("/login"), 2000); return; }
      } catch { localStorage.removeItem("token"); toast.error("Invalid session."); setLoading(false); setTimeout(() => navigate("/login"), 2000); return; }
      try {
        const res = await api.get("/api/orders/my-orders");
        const sorted = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sorted);
        if (sorted.length > 0) setExpanded({ [sorted[0].orderId]: true });
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem("token"); toast.error("Session expired."); setTimeout(() => navigate("/login"), 2000); }
        else toast.error("Failed to load your orders.");
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, [navigate]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusColor = (s) => {
    switch ((s || "").toUpperCase()) {
      case "COMPLETED": return "#C5A059";
      case "SHIPPED":   return "#6A9F3E";
      case "DELIVERED": return "#4CAF50";
      case "CANCELLED": return "#CC3333";
      default:          return "#999999";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        .or-root { min-height: 100vh; background: #FCFCFC; padding: 80px 6% 100px; font-family: 'Inter', sans-serif; }
        .or-container { max-width: 780px; margin: 0 auto; }

        .or-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .or-eyebrow::before { content: ''; width: 20px; height: 1px; background: #C5A059; }
        .or-title { font-family: 'Playfair Display', serif; font-size: clamp(32px,5vw,46px); font-weight: 400; color: #111; margin: 0 0 8px; line-height: 1.15; }
        .or-subtitle { font-size: 13px; color: #AAAAAA; font-weight: 300; margin: 0 0 48px; }

        .or-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }
        .or-ring { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #EBEBEB; border-top-color: #C5A059; animation: or-spin 1s linear infinite; }
        @keyframes or-spin { to { transform: rotate(360deg); } }

        .or-empty { background: #FFFFFF; border: 1px solid #EBEBEB; padding: 80px 40px; text-align: center; }
        .or-empty-icon { width: 56px; height: 56px; border: 1px solid #EBEBEB; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .or-empty h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: #111; margin: 0 0 10px; }
        .or-empty p { font-size: 13px; color: #AAAAAA; margin: 0 0 32px; font-weight: 300; }
        .or-shop-btn { display: inline-block; padding: 13px 36px; border: 1px solid #111; color: #111; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; background: #111; color: #FFF; font-family: 'Inter', sans-serif; transition: all 0.25s ease; }
        .or-shop-btn:hover { background: #C5A059; border-color: #C5A059; color: #111; }

        .or-list { display: flex; flex-direction: column; gap: 12px; }

        .or-card { background: #FFFFFF; border: 1px solid #EBEBEB; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
        .or-card:hover { border-color: #D0D0D0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .or-card.first-card { border-top: 2px solid #C5A059; }

        .or-card-header { padding: 24px 28px; display: flex; align-items: center; gap: 20px; cursor: pointer; user-select: none; }

        .or-order-num { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C5A059; flex-shrink: 0; min-width: 60px; }
        .or-header-meta { flex: 1; min-width: 0; }
        .or-header-date { font-size: 13px; color: #555; font-weight: 400; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .or-header-items { font-size: 11px; color: #AAAAAA; }
        .or-header-right { text-align: right; flex-shrink: 0; }
        .or-amount { font-family: 'Playfair Display', serif; font-size: 20px; color: #111; margin-bottom: 5px; }
        .or-status-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        .or-status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .or-toggle { color: #CCCCCC; transition: all 0.25s ease; flex-shrink: 0; }
        .or-toggle.open { transform: rotate(180deg); color: #C5A059; }

        .or-body { border-top: 1px solid #F0F0F0; padding: 24px 28px; animation: or-expand 0.2s ease; }
        @keyframes or-expand { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .or-section-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #AAAAAA; margin-bottom: 16px; }

        .or-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .or-item { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: #FAFAFA; border: 1px solid #F0F0F0; }
        .or-item-img { width: 56px; height: 56px; background: #F5F5F5; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 1px solid #EBEBEB; }
        .or-item-img img { width: 100%; height: 100%; object-fit: contain; }
        .or-item-name { font-family: 'Playfair Display', serif; font-size: 14px; color: #111; margin-bottom: 3px; }
        .or-item-qty { font-size: 11px; color: #AAAAAA; }
        .or-item-price { margin-left: auto; text-align: right; flex-shrink: 0; }
        .or-item-total { font-size: 14px; font-weight: 600; color: #111; }
        .or-item-unit { font-size: 11px; color: #AAAAAA; margin-top: 2px; }

        .or-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid #F0F0F0; padding-top: 20px; }
        .or-footer-cell { padding: 14px 16px; background: #FAFAFA; border: 1px solid #F0F0F0; }
        .or-footer-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #AAAAAA; margin-bottom: 6px; }
        .or-footer-value { font-size: 13px; color: #555; font-weight: 400; line-height: 1.5; }

        @media (max-width: 600px) {
          .or-root { padding: 80px 16px 60px; }
          .or-card-header { flex-wrap: wrap; gap: 12px; padding: 18px 16px; }
          .or-header-right { text-align: left; width: 100%; display: flex; align-items: center; gap: 16px; }
          .or-body { padding: 18px 16px; }
          .or-footer { grid-template-columns: 1fr; }
          .or-toggle { margin-left: auto; }
        }
      `}</style>

      <div className="or-root">
        <div className="or-container">
          <div className="or-eyebrow">Order History</div>
          <h1 className="or-title">Your Orders<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span></h1>
          <p className="or-subtitle">{orders.length > 0 ? `${orders.length} order${orders.length > 1 ? "s" : ""} in your archive` : "Your luxury archive awaits"}</p>

          {loading && <div className="or-loading"><div className="or-ring" /></div>}

          {!loading && orders.length === 0 && (
            <div className="or-empty">
              <div className="or-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <h3>No orders yet</h3>
              <p>Your first curation is one click away.</p>
              <button className="or-shop-btn" onClick={() => navigate("/")}>Explore Collection</button>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="or-list">
              {orders.map((order, index) => {
                const isOpen = !!expanded[order.orderId];
                const itemCount = order.items?.length || 0;
                return (
                  <div key={order.orderId} className={`or-card${index === 0 ? " first-card" : ""}`}>
                    <div className="or-card-header" onClick={() => toggleExpand(order.orderId)}>
                      <div className="or-order-num">#{String(orders.length - index).padStart(3, "0")}</div>
                      <div className="or-header-meta">
                        <div className="or-header-date">{formatDate(order.orderDate)}</div>
                        <div className="or-header-items">{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
                      </div>
                      <div className="or-header-right">
                        <div className="or-amount">₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                        <div className="or-status-pill">
                          <span className="or-status-dot" style={{ background: statusColor(order.status) }} />
                          <span style={{ color: statusColor(order.status) }}>{order.status}</span>
                        </div>
                      </div>
                      <svg className={`or-toggle${isOpen ? " open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>

                    {isOpen && (
                      <div className="or-body">
                        <div className="or-section-label">Items in this order</div>
                        <div className="or-items">
                          {order.items?.length > 0 ? order.items.map((item, idx) => (
                            <div key={idx} className="or-item">
                              <div className="or-item-img">
                                <img src={item.imageUrl || unplugged} alt={item.productName} onError={e => e.target.src = unplugged} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="or-item-name">{item.productName}</div>
                                <div className="or-item-qty">Qty: {item.quantity}</div>
                              </div>
                              <div className="or-item-price">
                                <div className="or-item-total">₹{(item.quantity * item.unitPrice)?.toLocaleString("en-IN")}</div>
                                <div className="or-item-unit">₹{item.unitPrice?.toLocaleString("en-IN")} each</div>
                              </div>
                            </div>
                          )) : <div style={{ fontSize: 13, color: "#AAAAAA", padding: "12px 0" }}>No item details available.</div>}
                        </div>
                        <div className="or-footer">
                          <div className="or-footer-cell">
                            <div className="or-footer-label">Order Total</div>
                            <div className="or-footer-value" style={{ color: "#C5A059", fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400 }}>₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                          </div>
                          <div className="or-footer-cell">
                            <div className="or-footer-label">Status</div>
                            <div className="or-footer-value" style={{ color: statusColor(order.status), fontWeight: 600 }}>{order.status}</div>
                          </div>
                          <div className="or-footer-cell" style={{ gridColumn: "1 / -1" }}>
                            <div className="or-footer-label">Shipping Address</div>
                            <div className="or-footer-value">{order.shippingAddress || "—"}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" style={{ zIndex: 999999, marginTop: "80px" }} />
    </>
  );
};

export default Order;