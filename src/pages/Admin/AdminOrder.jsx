import { useState, useEffect } from "react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");
  const PAGE_SIZE = 20;

  const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders?page=${page}&size=${PAGE_SIZE}&sortBy=createdAt&direction=desc`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const data = await res.json();
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/admin/orders/${orderId}/status?status=${newStatus}`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      fetchOrders();
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h2>Orders</h2>
        <span className="total-count">{totalElements} total orders</span>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.userEmail}</td>
                  <td>₹{order.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={page === i ? "active" : ""}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>

          <p className="pagination-info">
            Page {page + 1} of {totalPages} — showing {orders.length} of {totalElements} orders
          </p>
        </>
      )}
    </div>
  );
};

export default AdminOrders;