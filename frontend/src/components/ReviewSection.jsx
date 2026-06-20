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
              interactive ? "w-7 h-7 sm:w-7 sm:h-7" : "w-4 h-4"
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
    <section className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-nova-text">
          Reviews
        </h2>

        <span className="px-3 py-1 rounded-full bg-nova-surface border border-nova-border text-sm text-nova-muted font-mono">
          {reviews.length}
        </span>
      </div>

      {/* Review Form */}
      {user ? (
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e]">
          <h3 className="font-['Syne',sans-serif] font-semibold text-base sm:text-[1.05rem] text-[#eef2ff] mb-4 sm:mb-5">
            Write a Review
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-[18px]">
            {/* Rating */}
            <div>
              <p className="text-[0.8rem] text-[#525878] mb-2 font-['DM_Sans',sans-serif]">
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
                className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-[#13161f] border border-[#1a1d2e] text-[#eef2ff] text-sm font-['DM_Sans',sans-serif] resize-y outline-none leading-relaxed transition-[border-color,box-shadow] focus:border-[#7c5cfc] focus:shadow-[0_0_0_3px_rgba(124,92,252,0.12)]"
              />

              <p className="text-[0.72rem] text-right mt-1 text-[#525878] font-mono">
                {comment.length}/500
              </p>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl border-none font-['Syne',sans-serif] font-semibold text-sm transition-opacity ${
                  submitting
                    ? "bg-[#1a1d2e] text-[#525878] cursor-not-allowed opacity-60"
                    : "bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] text-white cursor-pointer"
                }`}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-5 sm:p-6 rounded-2xl bg-nova-surface border border-nova-border text-center">
          <p className="text-nova-muted mb-3 text-sm sm:text-base">
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
              className="p-4 sm:p-5 rounded-2xl border border-nova-border"
            >
              <div className="shimmer h-4 w-32 rounded mb-3" />

              <div className="shimmer h-3 w-full rounded mb-2" />

              <div className="shimmer h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 sm:py-12 text-center">
          <p className="text-nova-muted text-sm sm:text-base">
            No reviews yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-3.5">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0f1219] to-[#080a10] border border-[#1a1d2e] transition-colors hover:border-[rgba(124,92,252,0.25)]"
            >
              <div className="flex items-start gap-3 sm:gap-3.5">
                {/* Avatar */}
                <img
                  src={review.userId?.avatar || FALLBACK_AVATAR}
                  alt={review.userId?.name || "User"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#1a1d2e] flex-shrink-0"
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_AVATAR; }}
                />

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1.5">
                    <span className="font-['Syne',sans-serif] font-semibold text-[#eef2ff] text-sm">
                      {review.userId?.name || "Anonymous"}
                    </span>

                    <span className="text-[0.7rem] sm:text-[0.72rem] text-[#525878] font-mono">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <StarRating rating={review.rating} />

                  <p className="mt-2.5 text-sm text-[#c7d2fe] leading-relaxed break-words">
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