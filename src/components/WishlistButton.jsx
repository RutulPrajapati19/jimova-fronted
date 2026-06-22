import { useWishlist } from "../context/WishlistContext";
import { toast } from "react-hot-toast";

const WishlistButton = ({ productId, style = {} }) => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistIds.has(productId);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const added = await toggleWishlist(productId);
    if (added !== undefined) {
      toast.success(added ? "Added to wishlist ♥" : "Removed from wishlist");
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 22,
        color: isWishlisted ? "#E53E3E" : "#A0AEC0",
        lineHeight: 1,
        padding: "4px",
        transition: "color 0.2s, transform 0.15s",
        ...style,
      }}
    >
      {isWishlisted ? "♥" : "♡"}
    </button>
  );
};

export default WishlistButton;