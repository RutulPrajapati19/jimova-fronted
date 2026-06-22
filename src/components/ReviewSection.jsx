import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { toast } from "react-hot-toast";

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [productId, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews?page=${page}&size=5`);
      const data = await res.json();
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews/summary`);
      const data = await res.json();
      setSummary(data);
    } catch {
      console.error("Failed to load summary");
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit review");
      }
      toast.success("Review submitted!");
      setNewReview({ rating: 0, comment: "" });
      fetchReviews();
      fetchSummary();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-section">
      <h3>Customer Reviews</h3>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="average-rating">
          <span className="big-rating">{summary.averageRating}</span>
          <StarRating value={Math.round(summary.averageRating)} size={24} />
          <span className="review-count">{summary.totalReviews} reviews</span>
        </div>
      </div>

      {/* Write a Review */}
      {isLoggedIn && (
        <div className="write-review">
          <h4>Write a Review</h4>
          <div className="rating-picker">
            <span>Your Rating: </span>
            <StarRating
              value={newReview.rating}
              onChange={(r) => setNewReview({ ...newReview, rating: r })}
              size={28}
            />
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={1000}
          />
          <button onClick={handleSubmitReview} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review!</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.userName}</strong>
                <StarRating value={review.rating} size={16} />
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="review-pagination">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>{page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;