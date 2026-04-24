import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view your order history.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        const fetchedData = response.data;
        const validOrdersArray = Array.isArray(fetchedData) ? fetchedData : 
                                 (fetchedData?.orders || fetchedData?.content || fetchedData?.data || []);
                                 
        setOrders(validOrdersArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders from DB:", error);
        setError("Failed to fetch orders. Your backend might not have an /api/orders endpoint configured.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [baseUrl]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => setShowToast(false), 4000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleClearHistory = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete all order history from the database?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    setIsDeleting(true);
    try {
      await axios.delete(`${baseUrl}/api/orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      setOrders([]); 
      setToastVariant('success');
      setToastMessage('Database order history completely cleared.');
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting orders:", error);
      setToastVariant('danger');
      setToastMessage('Failed to clear history. Check backend logs.');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-info';
      case 'SHIPPED': return 'bg-primary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  };

  const calculateOrderTotal = (itemsArray) => {
    return itemsArray ? itemsArray.reduce((total, item) => total + item.totalPrice, 0) : 0;
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="spinner-border" style={{ color: "#111111" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div style={{ padding: "24px", border: "1px solid #111111", background: "#FCFCFC", color: "#111111", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>
          {error}
        </div>
      </div>
    );
  }

return (
  <>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }
      `}
    </style>
    <div style={{ padding: "100px 6% 120px", background: "#FCFCFC", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>Account</span>
        </div>
        <h1 className="luxury-serif" style={{ fontSize: "44px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>
          Order History<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
        </h1>
        <p style={{ marginTop: "12px", color: "#666666", fontSize: "14px", fontWeight: "400", letterSpacing: "0.5px", margin: 0 }}>
          Track and review your past acquisitions.
        </p>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "0px", border: "1px solid #EAEAEA" }}>
        
        <div style={{ padding: "32px", borderBottom: "1px solid #EAEAEA", background: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h5 className="luxury-serif" style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "400", color: "#111111" }}>Total Archives</h5>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#999999", letterSpacing: "2px" }}>({orders.length} ITEMS)</span>
          </div>
          
          {orders.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={isDeleting}
              style={{
                padding: "10px 24px", borderRadius: "0px", border: "1px solid #D32F2F", background: "transparent", color: "#D32F2F", fontSize: "10px", fontWeight: "600", cursor: isDeleting ? "not-allowed" : "pointer", transition: "all 0.3s ease", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px"
              }}
              onMouseEnter={(e) => { if(!isDeleting){ e.target.style.background = "#D32F2F"; e.target.style.color = "#FFFFFF"; }}}
              onMouseLeave={(e) => { if(!isDeleting){ e.target.style.background = "transparent"; e.target.style.color = "#D32F2F"; }}}
            >
              {isDeleting ? "Clearing..." : "Clear History"}
            </button>
          )}
        </div>

        <div className="table-responsive" style={{ margin: 0 }}>
          <table className="table align-middle mb-0" style={{ borderCollapse: "collapse" }}>
            
            <thead style={{ background: "#F8F8F8" }}>
              <tr>
                {["Order No.", "Client Details", "Date acquired", "Status", "Items", "Total Value", "Action"].map((heading, i) => (
                  <th key={i} style={{ padding: "20px 32px", fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "1px solid #EAEAEA", borderTop: "none" }}>{heading}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "100px 0", textAlign: "center", color: "#888888", fontSize: "14px", letterSpacing: "0.5px" }}>
                    No acquisitions found in your database history.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  // ✦ FIX: Maps to 'orderItems' directly matching your Order.java ✦
                  const itemsArray = order.orderItems || order.items || order.cartItems || [];
                  const orderKey = order.orderId || order.id || Math.random();

                  return (
                  <React.Fragment key={orderKey}>
                    
                    <tr style={{ borderBottom: "1px solid #EAEAEA", transition: "background 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}>
                      <td style={{ padding: "24px 32px", fontSize: "13px", fontWeight: "600", color: "#111111", letterSpacing: "0.5px" }}>
                        #{orderKey}
                      </td>

                      <td style={{ padding: "24px 32px" }}>
                        <div className="luxury-serif" style={{ fontSize: "16px", fontWeight: "600", color: "#111111" }}>{order.customerName || order.name || 'Jimova Client'}</div>
                        <div style={{ fontSize: "12px", color: "#888888", marginTop: "4px", letterSpacing: "0.5px" }}>{order.email || order.userEmail || 'N/A'}</div>
                      </td>

                      <td style={{ padding: "24px 32px", fontSize: "13px", color: "#666666", fontWeight: "400", letterSpacing: "0.5px" }}>
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </td>

                      <td style={{ padding: "24px 32px" }}>
                        <span className={getStatusClass(order.status || 'PLACED')} style={{ background: "transparent", color: "#111111", padding: "6px 16px", borderRadius: "0px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", border: "1px solid #111111" }}>
                          {order.status || 'PLACED'}
                        </span>
                      </td>

                      <td style={{ padding: "24px 32px", fontSize: "13px", fontWeight: "600", color: "#111111" }}>
                        {itemsArray.length}
                      </td>

                      <td style={{ padding: "24px 32px", fontSize: "14px", fontWeight: "600", color: "#111111", letterSpacing: "0.5px" }}>
                        {formatCurrency(order.totalAmount || order.totalPrice || calculateOrderTotal(itemsArray))}
                      </td>

                      <td style={{ padding: "24px 32px" }}>
                        <button
                          onClick={() => toggleOrderDetails(orderKey)}
                          style={{
                            padding: "10px 24px", borderRadius: "0px", border: "1px solid #111111",
                            background: expandedOrder === orderKey ? "#111111" : "transparent",
                            color: expandedOrder === orderKey ? "#FFFFFF" : "#111111",
                            fontSize: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase", letterSpacing: "1px"
                          }}
                        >
                          {expandedOrder === orderKey ? "Close" : "Inspect"}
                        </button>
                      </td>
                    </tr>

                    {expandedOrder === orderKey && (
                      <tr>
                        <td colSpan="7" style={{ padding: 0, borderBottom: "1px solid #EAEAEA" }}>
                          <div style={{ background: "#FAFAFA", padding: "40px", borderTop: "1px solid #EAEAEA" }}>
                            <h6 style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>Detailed Ledger</h6>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "1px solid #EAEAEA" }}>Product</th>
                                  <th style={{ textAlign: "center", paddingBottom: "16px", fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "1px solid #EAEAEA" }}>Qty</th>
                                  <th style={{ textAlign: "right", paddingBottom: "16px", fontSize: "10px", color: "#999999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "1px solid #EAEAEA" }}>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {itemsArray.map((item, index) => (
                                  <tr key={index}>
                                    <td className="luxury-serif" style={{ padding: "20px 0", fontSize: "16px", fontWeight: "600", color: "#111111", borderBottom: "1px solid #EAEAEA" }}>
                                      {item.productName || item.name || `Item #${item.productId || item.id}`}
                                    </td>
                                    <td style={{ padding: "20px 0", textAlign: "center", fontSize: "13px", fontWeight: "500", color: "#666666", borderBottom: "1px solid #EAEAEA" }}>
                                      {item.quantity}
                                    </td>
                                    <td style={{ padding: "20px 0", textAlign: "right", fontSize: "14px", fontWeight: "400", color: "#111111", borderBottom: "1px solid #EAEAEA", letterSpacing: "0.5px" }}>
                                      {formatCurrency(item.totalPrice || (item.price * item.quantity))}
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan="2" style={{ paddingTop: "24px", textAlign: "right", fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px" }}>Total Value</td>
                                  <td className="luxury-serif" style={{ paddingTop: "24px", textAlign: "right", fontSize: "20px", fontWeight: "600", color: "#111111", letterSpacing: "0.5px" }}>
                                    {formatCurrency(order.totalAmount || order.totalPrice || calculateOrderTotal(itemsArray))}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="position-fixed end-0 p-4" style={{ zIndex: 999999, top: "90px", pointerEvents: "none" }}>
        <div style={{ borderRadius: "0px", background: "#111111", color: "#ffffff", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", padding: "16px 24px", minWidth: "320px", transform: showToast ? "translateX(0)" : "translateX(120%)", opacity: showToast ? 1 : 0, transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)", border: "1px solid #333333", display: "flex", alignItems: "center", gap: "16px", pointerEvents: showToast ? "auto" : "none" }}>
          <span style={{ color: toastVariant === 'success' ? '#C5A059' : '#FF2D55', fontSize: "18px" }}>✦</span> 
          <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px" }}>{toastMessage}</span>
        </div>
      </div>

    </div>
  </>
);
};

export default Order;