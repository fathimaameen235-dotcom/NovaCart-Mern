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

/* ── Star display ───────────────────────────────────── */
const StarDisplay = ({ rating = 0, size = 17 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 20 20"
        fill={s <= Math.round(rating) ? T.warn : T.border}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ── Pill badge ─────────────────────────────────────── */
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
      padding: "4px 13px", borderRadius: 9999, fontSize: 12,
      fontWeight: 600, letterSpacing: "0.03em",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </span>
  );
};

/* ── Feature card ───────────────────────────────────── */
const FeatureCard = ({ icon, title, sub }) => (
  <div style={{
    background: T.surface, border: `1.5px solid ${T.border}`,
    borderRadius: 12, padding: "13px 14px",
    display: "flex", alignItems: "center", gap: 10,
  }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{title}</p>
      <p style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{sub}</p>
    </div>
  </div>
);

/* ── Related Product Card ───────────────────────────── */
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
        borderRadius: 16,
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
      {/* Image */}
      <div style={{
        aspectRatio: "4/3", background: "#131825",
        overflow: "hidden", position: "relative",
      }}>
        {img ? (
          <img
            src={img}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 40, opacity: 0.3 }}>📦</span>
          </div>
        )}
        {/* Price badge overlay */}
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "rgba(8,10,16,0.85)", backdropFilter: "blur(6px)",
          border: `1px solid ${T.border}`, borderRadius: 8,
          padding: "4px 10px",
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>
            ${product.price}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {/* Category */}
        <span style={{
          fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {product.subCategory || product.category}
        </span>

        {/* Title */}
        <p style={{
          fontSize: 14, fontWeight: 600, color: T.text,
          fontFamily: "'DM Sans', sans-serif", margin: 0,
          lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.title}
        </p>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StarDisplay rating={rating} size={13} />
          <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
            {rating.toFixed(1)} ({reviews})
          </span>
        </div>

        {/* Price row + button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>
              ${product.price}
            </span>
            <span style={{
              fontSize: 11, color: T.muted, textDecoration: "line-through",
              marginLeft: 5, fontFamily: "'DM Sans', sans-serif",
            }}>
              ${(product.price * 1.25).toFixed(0)}
            </span>
          </div>
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            style={{
              padding: "7px 14px", borderRadius: 9,
              background: T.accentLo, border: `1px solid ${T.accentRg}`,
              color: T.accentTx, fontSize: 12, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              transition: "background 0.18s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,252,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = T.accentLo}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Related Section ────────────────────────────────── */
const RelatedSection = ({ related, relatedSource, product }) => {
  if (!related.length) return null;

  const label = relatedSource === "subcategory"
    ? `More in "${product.subCategory}"`
    : `More in "${product.category}"`;

  return (
    <div style={{ marginTop: 56 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", color: T.text, margin: "0 0 4px",
          }}>
            You May Also Like
          </h2>
          <p style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {label} · {related.length} product{related.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10,
            background: T.accentLo, border: `1px solid ${T.accentRg}`,
            color: T.accentTx, fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
            transition: "background 0.18s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,252,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = T.accentLo}
        >
          View All →
        </Link>
      </div>

      {/* Desktop grid / Mobile horizontal scroll */}
      <>
        {/* Desktop grid — hidden on mobile via CSS */}
        <div className="related-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 18,
        }}>
          {related.map(p => <RelatedCard key={p._id} product={p} />)}
        </div>

        {/* Mobile slider — hidden on desktop via CSS */}
        <div className="related-slider" style={{
          display: "none",
          overflowX: "auto",
          gap: 14,
          paddingBottom: 12,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {related.map(p => (
            <div key={p._id} style={{ minWidth: 200, maxWidth: 200 }}>
              <RelatedCard product={p} />
            </div>
          ))}
        </div>
      </>

      {/* Divider line at bottom */}
      <div style={{ marginTop: 40, height: 1, background: T.border }} />
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
  const [relatedSource, setRelatedSource] = useState("category"); // "subcategory" | "category"
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

      /* ── Related: subcategory first, fallback to category ── */
      let relatedList = [];

      // 1️⃣ Try subcategory match first
      if (p.subCategory) {
        try {
          const { data: subData } = await API.get(
            `/products?category=${encodeURIComponent(p.category)}&subCategory=${encodeURIComponent(p.subCategory)}`
          );
          const subList = Array.isArray(subData) ? subData : subData?.products || [];
          relatedList = subList.filter(x => x._id !== id).slice(0, 8);
          if (relatedList.length >= 2) {
            setRelatedSource("subcategory");
          }
        } catch {
          // subCategory fetch failed — fall through
        }
      }

      // 2️⃣ Fallback to same category
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

  /* ── Loading ─────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 88 }}>
      <div style={{ width: 40, height: 40, border: `2px solid ${T.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 88, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Breadcrumb ─────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: T.muted, fontFamily: "'DM Sans', sans-serif", flexWrap: "wrap" }}>
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
          <span style={{ color: T.muted }}>{product.title}</span>
        </div>

        {/* ── Main grid ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 36, alignItems: "start" }}>

          {/* LEFT – Image gallery */}
          <div>
            <div style={{ borderRadius: 20, overflow: "hidden", border: `1.5px solid ${T.border}`, background: T.surface, position: "relative", marginBottom: 14 }}>
              <img
                src={selectedImage}
                alt={product.title}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              />
              <button
                onClick={() => setWishlist(!wishlist)}
                aria-label="Toggle wishlist"
                style={{ position: "absolute", top: 14, right: 14, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <svg width="17" height="17" fill={wishlist ? "#ef4444" : "none"} stroke={wishlist ? "#ef4444" : T.muted} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <div style={{ position: "absolute", top: 14, left: 14, background: T.accent, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
                20% OFF
              </div>
            </div>

            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`, gap: 10 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(img)} style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `2px solid ${selectedImage === img ? T.accent : T.border}`, transition: "border-color 0.18s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: 76, objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT – Product info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill color="accent">{product.category}</Pill>
              {product.subCategory && <Pill color="accent">{product.subCategory}</Pill>}
              {stock > 0 ? <Pill color="success">✓ In Stock</Pill> : <Pill color="warn">Out of Stock</Pill>}
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: T.text, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0 }}>
              {product.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <StarDisplay rating={product.averageRating || product.rating} />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
                {(product.averageRating || product.rating || 0).toFixed(1)}
              </span>
              <span style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                · {product.numReviews || product.reviewCount || 0} reviews
              </span>
            </div>

            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 11, color: T.muted, marginBottom: 2, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Price</p>
                <span style={{ fontSize: 32, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>${product.price}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 13, color: T.muted, textDecoration: "line-through", fontFamily: "'DM Sans', sans-serif" }}>${mrp}</span>
                <span style={{ fontSize: 13, color: T.successTx, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>You save ${saving}</span>
              </div>
              <Pill color="success">20% OFF</Pill>
            </div>

            <p style={{ color: T.sub, fontSize: 14, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{product.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FeatureCard icon="🚚" title="Free Delivery"   sub="Ships in 2-3 days" />
              <FeatureCard icon="🔒" title="Secure Payment"  sub="100% protected" />
              <FeatureCard icon="🔄" title="Easy Returns"    sub="7-day return policy" />
              <FeatureCard icon="🛡️" title="1 Year Warranty" sub="Brand certified" />
            </div>

            {stock > 0 && stock < 20 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${stockPct}%`, height: "100%", background: T.warn, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: T.warnTx, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Only {stock} left!</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: T.sub, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Quantity</span>
              <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${T.border}`, borderRadius: 11, background: T.surface, overflow: "hidden" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: "transparent", border: "none", color: T.text, fontSize: 20, width: 40, height: 40, cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => e.target.style.background = T.accentLo}
                  onMouseLeave={e => e.target.style.background = "transparent"}>−</button>
                <span style={{ padding: "0 22px", fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif", minWidth: 50, textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} style={{ background: "transparent", border: "none", color: T.text, fontSize: 20, width: 40, height: 40, cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => e.target.style.background = T.accentLo}
                  onMouseLeave={e => e.target.style.background = "transparent"}>+</button>
              </div>
              {stock > 0 && <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>Max {stock} per order</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={handleAddToCart} disabled={stock === 0}
                style={{ padding: "15px", borderRadius: 11, background: stock > 0 ? "linear-gradient(135deg, #7c5cfc, #5b8def)" : T.border, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, border: "none", cursor: stock > 0 ? "pointer" : "not-allowed", opacity: stock > 0 ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.18s" }}
                onMouseEnter={e => stock > 0 && (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >🛒 Add to Cart</button>
              <button
                onClick={handleBuyNow} disabled={stock === 0}
                style={{ padding: "15px", borderRadius: 11, background: "transparent", color: T.text, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 15, border: `1.5px solid ${T.accent}`, cursor: stock > 0 ? "pointer" : "not-allowed", opacity: stock > 0 ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.18s" }}
                onMouseEnter={e => stock > 0 && (e.currentTarget.style.background = T.accentLo)}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >⚡ Buy Now</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 6, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>Share:</span>
              <button onClick={handleShare} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", color: T.muted, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                🔗 Copy link
              </button>
            </div>
          </div>
        </div>

        {/* ── Specs strip ───────────────────────────── */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div style={{ marginTop: 36, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px" }}>{val}</p>
                <p style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", margin: 0, textTransform: "capitalize" }}>{key}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Reviews ───────────────────────────────── */}
        <div style={{ marginTop: 48, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: T.text, margin: "0 0 20px" }}>
            Customer Reviews
          </h2>
          <ReviewSection productId={id} />
        </div>

        {/* ── Related Products ──────────────────────── */}
        <RelatedSection
          related={related}
          relatedSource={relatedSource}
          product={product}
        />

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .related-slider::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .related-grid   { display: none !important; }
          .related-slider { display: flex !important; }
        }
        @media (min-width: 769px) {
          .related-grid   { display: grid !important; }
          .related-slider { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;