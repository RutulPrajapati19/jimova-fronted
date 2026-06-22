import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchWishlistIds();
  }, [token]);

  const fetchWishlistIds = async () => {
    try {
      const res = await fetch("/api/wishlist/ids", {
        headers: { Authorization: "Bearer " + token },
      });
      const ids = await res.json();
      setWishlistIds(new Set(ids));
    } catch {
      console.error("Failed to fetch wishlist IDs");
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (data.added) next.add(productId);
        else next.delete(productId);
        return next;
      });
      return data.added;
    } catch {
      console.error("Failed to toggle wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);