import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (sessionId) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  if (status === "loading") return <p>Verifying payment...</p>;

  if (status === "error") return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h2>Something went wrong</h2>
      <button onClick={() => navigate("/cart")}>Back to Cart</button>
    </div>
  );

  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2>Payment Successful!</h2>
      <p>Your order #{orderId} has been placed.</p>
      <button onClick={() => navigate("/orders")}>View My Orders</button>
      <button onClick={() => navigate("/")}>Continue Shopping</button>
    </div>
  );
};

export default PaymentSuccess;