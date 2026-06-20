import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import ReviewSection from "../components/ReviewSection";
import toast from "react-hot-toast";

/* ── Design tokens ─────────────────────────────────── */
const T = {
  bg:       "#080a10",
  surface:  "#0d1017",
  border:   "#1c2030",
  text:     "#eef2ff",
  muted:    "#4a5070",
  sub:      "#8892b0",
  accent:   "#7c5cfc",
  accentLo: "rgba(124,92,252,0.12)",
  accentRg: "rgba(124,92,252,0.25)",
  accentTx: "#9b7fff",
  success:  "#10b981",
  successLo:"rgba(16,185,129,0.12)",
  successRg:"rgba(16,185,129,0.25)",
  successTx:"#34d399",
  warn:     "#f5a623",
  warnLo:   "rgba(245,166,35,0.12)",
  warnRg:   "rgba(245,166,35,0.25)",
  warnTx:   "#fbbf24",
};

const StarDisplay = ({ rating = 0, size = 16 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 20 20"
        fill={s <= Math.round(rating) ? T.warn : T.border}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Pill = ({ children, color = "accent" }) => {
  const map = {
    accent:  { bg: T.accentLo,  border: T.accentRg,  text: T.accentTx },
    success: { bg: T.successLo, border: T.successRg,  text: T.successTx },
    warn:    { bg: T.warnLo,    border: T.warnRg,     text: T.warnTx },
  };
  const c = map[color] || map.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 9999, fontSize: 11,
      fontWeight: 600, letterSpacing: "0.03em",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </span>
  );
};

const FeatureCard = ({ icon, title, sub }) => (
  <div style={{
    background: T.surface, border: `1.5px solid ${T.border}`,
    borderRadius: 10, padding: "10px 12px",
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{title}</p>
      <p style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{sub}</p>
    </div>
  </div>
);

const RelatedCard = ({ product }) => {
  const navigate = useNavigate();
  const img = product.images?.[0] || product.image;
  const rating = product.averageRating || product.rating || 0;
  const reviews = product.numReviews || product.reviewCount || 0;

  return (
    <div
      style={{
        background: T.surface,
        border: `1.5px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
        flexShrink: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = T.accentRg;
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ aspectRatio: "4/3", background: "#131825", overflow: "hidden", position: "relative" }}>
        {img ? (
          <img src={img} alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 36, opacity: 0.3 }}>📦</span>
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(8,10,16,0.85)", backdropFilter: "blur(6px)",
          border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px",
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>
            ${product.price}
          </span>
        </div>
      </div>
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <span style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {product.subCategory || product.category}
        </span>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <StarDisplay rating={rating} size={11} />
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
            {rating.toFixed(1)} ({reviews})
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>
            ${product.price}
          </span>
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            style={{
              padding: "6px 12px", borderRadius: 8,
              background: T.accentLo, border: `1px solid ${T.accentRg}`,
              color: T.accentTx, fontSize: 11, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

const RelatedSection = ({ related, relatedSource, product }) => {
  if (!related.length) return null;
  const label = relatedSource === "subcategory"
    ? `More in "${product.subCategory}"`
    : `More in "${product.category}"`;

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", color: T.text, margin: "0 0 4px" }}>
            You May Also Like
          </h2>
          <p style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {label} · {related.length} product{related.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "7px 14px", borderRadius: 9,
            background: T.accentLo, border: `1px solid ${T.accentRg}`,
            color: T.accentTx, fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
          }}
        >
          View All →
        </Link>
      </div>

      {/* Desktop grid */}
      <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {related.map(p => <RelatedCard key={p._id} product={p} />)}
      </div>

      {/* Mobile slider */}
      <div className="related-slider" style={{ display: "none", overflowX: "auto", gap: 12, paddingBottom: 10, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {related.map(p => (
          <div key={p._id} style={{ minWidth: 175, maxWidth: 175 }}>
            <RelatedCard product={p} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, height: 1, background: T.border }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct]             = useState(null);
  const [related, setRelated]             = useState([]);
  const [relatedSource, setRelatedSource] = useState("category");
  const [loading, setLoading]             = useState(true);
  const [quantity, setQuantity]           = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [wishlist, setWishlist]           = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      const p = data?.product || data?.data || data;
      setProduct(p);
      setSelectedImage(p.images?.[0] || p.image);

      let relatedList = [];
      if (p.subCategory) {
        try {
          const { data: subData } = await API.get(
            `/products?category=${encodeURIComponent(p.category)}&subCategory=${encodeURIComponent(p.subCategory)}`
          );
          const subList = Array.isArray(subData) ? subData : subData?.products || [];
          relatedList = subList.filter(x => x._id !== id).slice(0, 8);
          if (relatedList.length >= 2) setRelatedSource("subcategory");
        } catch { /* fall through */ }
      }

      if (relatedList.length < 2) {
        const { data: catData } = await API.get(
          `/products?category=${encodeURIComponent(p.category)}`
        );
        const catList = Array.isArray(catData) ? catData : catData?.products || [];
        relatedList = catList.filter(x => x._id !== id).slice(0, 8);
        setRelatedSource("category");
      }

      setRelated(relatedList);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { window.scrollTo(0, 0); fetchProduct(); }, [fetchProduct]);

  const stock    = product?.stock ?? 0;
  const stockPct = Math.min(100, (stock / 50) * 100);
  const mrp      = product ? (product.price * 1.25).toFixed(2) : 0;
  const saving   = product ? (product.price * 0.25).toFixed(2) : 0;

  const handleAddToCart = () => {
    addToCart({ ...product, image: selectedImage }, quantity);
    toast.success(`${quantity} × ${product.title} added to cart`);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => { handleAddToCart(); navigate("/checkout"); };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 88 }}>
      <div style={{ width: 36, height: 36, border: `2px solid ${T.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 64, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, marginTop: 16, fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif", flexWrap: "wrap" }}>
          <Link to="/" style={{ color: T.accent, textDecoration: "none" }}>Home</Link>
          <span>›</span>
          <Link to="/products" style={{ color: T.accent, textDecoration: "none" }}>Products</Link>
          <span>›</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: T.accent, textDecoration: "none" }}>{product.category}</Link>
          {product.subCategory && (
            <>
              <span>›</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}&subCategory=${encodeURIComponent(product.subCategory)}`} style={{ color: T.accent, textDecoration: "none" }}>{product.subCategory}</Link>
            </>
          )}
          <span>›</span>
          <span style={{ color: T.muted, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</span>
        </div>

        {/* Main grid — stacks on mobile */}
        <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>

          {/* LEFT – Image gallery */}
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", border: `1.5px solid ${T.border}`, background: T.surface, position: "relative", marginBottom: 12 }}>
              <img
                src={selectedImage}
                alt={product.title}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
              />
              <button
                onClick={() => setWishlist(!wishlist)}
                aria-label="Toggle wishlist"
                style={{ position: "absolute", top: 12, right: 12, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <svg width="16" height="16" fill={wishlist ? "#ef4444" : "none"} stroke={wishlist ? "#ef4444" : T.muted} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <div style={{ position: "absolute", top: 12, left: 12, background: T.accent, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, fontFamily: "'DM Sans', sans-serif" }}>
                20% OFF
              </div>
            </div>

            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`, gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(img)} style={{ borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${selectedImage === img ? T.accent : T.border}`, transition: "border-color 0.18s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: 60, objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT – Product info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Pill color="accent">{product.category}</Pill>
              {product.subCategory && <Pill color="accent">{product.subCategory}</Pill>}
              {stock > 0 ? <Pill color="success">✓ In Stock</Pill> : <Pill color="warn">Out of Stock</Pill>}
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.3rem, 4vw, 2rem)", color: T.text, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0 }}>
              {product.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <StarDisplay rating={product.averageRating || product.rating} />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
                {(product.averageRating || product.rating || 0).toFixed(1)}
              </span>
              <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                · {product.numReviews || product.reviewCount || 0} reviews
              </span>
            </div>

            {/* Price card */}
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 10, color: T.muted, marginBottom: 2, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Price</p>
                <span style={{ fontSize: 28, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>${product.price}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 12, color: T.muted, textDecoration: "line-through", fontFamily: "'DM Sans', sans-serif" }}>${mrp}</span>
                <span style={{ fontSize: 12, color: T.successTx, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>You save ${saving}</span>
              </div>
              <Pill color="success">20% OFF</Pill>
            </div>

            <p style={{ color: T.sub, fontSize: 13, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{product.description}</p>

            {/* Feature cards — 2-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FeatureCard icon="🚚" title="Free Delivery" sub="Ships in 2-3 days" />
              <FeatureCard icon="🔒" title="Secure Payment" sub="100% protected" />
              <FeatureCard icon="🔄" title="Easy Returns" sub="7-day policy" />
              <FeatureCard icon="🛡️" title="1 Year Warranty" sub="Brand certified" />
            </div>

            {/* Stock bar */}
            {stock > 0 && stock < 20 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${stockPct}%`, height: "100%", background: T.warn, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, color: T.warnTx, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Only {stock} left!</span>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: T.sub, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Qty</span>
              <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${T.border}`, borderRadius: 10, background: T.surface, overflow: "hidden" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: "transparent", border: "none", color: T.text, fontSize: 20, width: 38, height: 38, cursor: "pointer" }}>−</button>
                <span style={{ padding: "0 18px", fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif", minWidth: 44, textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} style={{ background: "transparent", border: "none", color: T.text, fontSize: 20, width: 38, height: 38, cursor: "pointer" }}>+</button>
              </div>
              {stock > 0 && <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>Max {stock}</span>}
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={handleAddToCart} disabled={stock === 0}
                style={{ padding: "14px", borderRadius: 10, background: stock > 0 ? "linear-gradient(135deg, #7c5cfc, #5b8def)" : T.border, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, border: "none", cursor: stock > 0 ? "pointer" : "not-allowed", opacity: stock > 0 ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >🛒 Add to Cart</button>
              <button
                onClick={handleBuyNow} disabled={stock === 0}
                style={{ padding: "14px", borderRadius: 10, background: "transparent", color: T.text, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, border: `1.5px solid ${T.accent}`, cursor: stock > 0 ? "pointer" : "not-allowed", opacity: stock > 0 ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >⚡ Buy Now</button>
            </div>

            {/* Share */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>Share:</span>
              <button onClick={handleShare} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", color: T.muted, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
                🔗 Copy link
              </button>
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div style={{ marginTop: 28, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 14 }}>
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px" }}>{val}</p>
                <p style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0, textTransform: "capitalize" }}>{key}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginTop: 40, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "20px 20px" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: T.text, margin: "0 0 16px" }}>
            Customer Reviews
          </h2>
          <ReviewSection productId={id} />
        </div>

        {/* Related */}
        <RelatedSection related={related} relatedSource={relatedSource} product={product} />

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .related-slider::-webkit-scrollbar { display: none; }
        @media (max-width: 640px) {
          .related-grid   { display: none !important; }
          .related-slider { display: flex !important; }
        }
        @media (min-width: 641px) {
          .product-detail-grid { grid-template-columns: 1fr 1fr !important; }
          .related-grid   { display: grid !important; }
          .related-slider { display: none !important; }
        }
        @media (min-width: 1024px) {
          .product-detail-grid { grid-template-columns: 5fr 6fr !important; gap: 36px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;