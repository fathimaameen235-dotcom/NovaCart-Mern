import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop";

const StarRating = ({
  rating = 0,
  interactive = false,
  onRate,
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-transform duration-150 ${
            interactive
              ? "cursor-pointer hover:scale-110"
              : "cursor-default"
          }`}
          aria-label={`Rate ${star} star`}
        >
          <svg
            className={`transition-colors duration-150 ${
              interactive ? "w-7 h-7" : "w-4 h-4"
            } ${
              star <= (hover || rating)
                ? "text-amber-400"
                : "text-nova-border"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =========================
  // Fetch Reviews
  // =========================
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await API.get(`/reviews/${productId}`);

      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Review fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [fetchReviews, productId]);

  // =========================
  // Submit Review
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!rating) {
      return toast.error("Please select a rating");
    }

    if (!comment.trim()) {
      return toast.error("Please write a comment");
    }

    try {
      setSubmitting(true);

      const { data } = await API.post(
        `/reviews/${productId}`,
        {
          rating,
          comment: comment.trim(),
        }
      );

      setReviews((prev) => [data, ...prev]);

      setRating(0);
      setComment("");

      toast.success("Review submitted!", {
        style: {
          background: "#13161e",
          color: "#e2e8f0",
          border: "1px solid #1e2130",
        },
        iconTheme: {
          primary: "#7c5cfc",
          secondary: "#fff",
        },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Date Format
  // =========================
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date";

    return new Date(dateStr).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-2xl text-nova-text">
          Reviews
        </h2>

        <span className="px-3 py-1 rounded-full bg-nova-surface border border-nova-border text-sm text-nova-muted font-mono">
          {reviews.length}
        </span>
      </div>

      {/* Review Form */}
      {user ? (
        <div style={{
          padding: "24px", borderRadius: 16,
          background: "linear-gradient(145deg,#0f1219,#080a10)",
          border: "1px solid #1a1d2e",
        }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#eef2ff", marginBottom: 20 }}>
            Write a Review
          </h3>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Rating */}
            <div>
              <p style={{ fontSize: "0.8rem", color: "#525878", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>
                Your Rating
              </p>

              <StarRating
                rating={rating}
                interactive
                onRate={setRating}
              />
            </div>

            {/* Comment */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product…"
                rows={4}
                maxLength={500}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "#13161f", border: "1px solid #1a1d2e",
                  color: "#eef2ff", fontSize: "0.875rem",
                  fontFamily: "'DM Sans',sans-serif", resize: "vertical",
                  outline: "none", lineHeight: 1.6,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = "#7c5cfc"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"; }}
                onBlur={e  => { e.target.style.borderColor = "#1a1d2e"; e.target.style.boxShadow = "none"; }}
              />

              <p style={{ fontSize: "0.72rem", textAlign: "right", marginTop: 4, color: "#525878", fontFamily: "monospace" }}>
                {comment.length}/500
              </p>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 24px", borderRadius: 12, border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  background: submitting ? "#1a1d2e" : "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                  color: submitting ? "#525878" : "#fff",
                  fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.875rem",
                  transition: "opacity 0.2s", opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-nova-surface border border-nova-border text-center">
          <p className="text-nova-muted mb-3">
            Sign in to leave a review
          </p>

          <Link
            to="/login"
            className="inline-block nova-btn-primary px-6 py-2.5 rounded-xl text-sm"
          >
            Login to Review
          </Link>
        </div>
      )}

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-5 rounded-2xl border border-nova-border"
            >
              <div className="shimmer h-4 w-32 rounded mb-3" />

              <div className="shimmer h-3 w-full rounded mb-2" />

              <div className="shimmer h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-nova-muted">
            No reviews yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map((review) => (
            <article
              key={review._id}
              style={{
                padding: 20, borderRadius: 14,
                background: "linear-gradient(145deg,#0f1219,#080a10)",
                border: "1px solid #1a1d2e",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(124,92,252,0.25)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1a1d2e"}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Avatar */}
                <img
                  src={review.userId?.avatar || FALLBACK_AVATAR}
                  alt={review.userId?.name || "User"}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    objectFit: "cover", border: "2px solid #1a1d2e", flexShrink: 0,
                  }}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_AVATAR; }}
                />

                {/* Review Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.9rem" }}>
                      {review.userId?.name || "Anonymous"}
                    </span>

                    <span style={{ fontSize: "0.72rem", color: "#525878", fontFamily: "monospace" }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <StarRating rating={review.rating} />

                  <p style={{ marginTop: 10, fontSize: "0.875rem", color: "#c7d2fe", lineHeight: 1.65 }}>
                    {review.comment}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;