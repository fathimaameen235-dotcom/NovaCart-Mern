import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3 h-3 flex-shrink-0 ${star <= Math.round(rating) ? "text-amber-400" : "text-nova-border"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=450&fit=crop";

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, image: imageUrl });
    toast.success(`${product.title} added to cart!`, {
      style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
      iconTheme: { primary: "#7c5cfc", secondary: "#fff" },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ ...product, image: imageUrl });
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️", {
      style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
    });
  };

  const categoryColors = {
    Electronics: "text-blue-400 bg-blue-400/10",
    Fashion: "text-pink-400 bg-pink-400/10",
    "Home & Living": "text-emerald-400 bg-emerald-400/10",
    Sports: "text-orange-400 bg-orange-400/10",
    Beauty: "text-rose-400 bg-rose-400/10",
    Books: "text-purple-400 bg-purple-400/10",
    Gaming: "text-cyan-400 bg-cyan-400/10",
    Accessories: "text-yellow-400 bg-yellow-400/10",
  };

  const catStyle = categoryColors[product.category] || "text-nova-accent bg-nova-accent/10";

  return (
    <Link to={`/products/${product._id}`} className="group block h-full">
      <div className="nova-card overflow-hidden h-full flex flex-col hover:border-nova-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-nova-accent/5 hover:-translate-y-0.5">

        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-nova-surface flex-shrink-0">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=450&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nova-bg/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 active:scale-90"
            style={{
              background: wishlisted ? "rgba(248,113,113,0.2)" : "rgba(0,0,0,0.45)",
              border: wishlisted ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg
              className="w-4 h-4"
              fill={wishlisted ? "#f87171" : "none"}
              stroke={wishlisted ? "#f87171" : "white"}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Stock badges */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-[10px] sm:text-xs font-mono">
              Only {product.stock} left
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-[10px] sm:text-xs font-mono">
              Sold Out
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 flex-1">
          {/* Category tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full w-fit ${catStyle}`}>
              {product.category}
            </span>
            {product.subCategory && (
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full w-fit text-nova-muted bg-nova-border/40">
                {product.subCategory}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-nova-text text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-nova-accent transition-colors duration-200">
            {product.title}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-nova-muted text-[10px] sm:text-xs font-mono">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-nova-border">
            <div>
              <span className="font-display font-bold text-lg sm:text-xl text-nova-text">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-nova-muted text-xs line-through ml-1.5 font-body">
                ${(product.price * 1.25).toFixed(0)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={product.stock === 0 ? "Out of stock" : "Add to cart"}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-display font-semibold transition-all duration-200 active:scale-95 flex-shrink-0 ${
                product.stock === 0
                  ? "bg-nova-border text-nova-muted cursor-not-allowed"
                  : "nova-btn-primary"
              }`}
            >
              {product.stock === 0 ? "Sold Out" : (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;