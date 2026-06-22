import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WishlistButton from "../components/WishlistButton";

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <h2>My Wishlist ({products.length})</h2>
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Your wishlist is empty.</p>
          <button onClick={() => navigate("/")}>Browse Products</button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
              <div style={{ position: "relative" }}>
                <img src={product.imageUrl} alt={product.name} />
                <WishlistButton
                  productId={product.id}
                  style={{ position: "absolute", top: 8, right: 8 }}
                />
              </div>
              <h4>{product.name}</h4>
              <p>₹{product.price?.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;