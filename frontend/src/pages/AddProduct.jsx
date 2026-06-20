import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";

const CATEGORIES = [
  "Electronics", "Fashion", "Home & Living",
  "Sports", "Beauty", "Books", "Gaming", "Accessories",
];

const SUB_CATEGORIES = {
  Electronics:    ["Smartphones", "Laptops", "Tablets", "Audio", "Cameras", "Wearables", "Accessories"],
  Fashion:        ["Men", "Women", "Kids", "Footwear", "Bags", "Jewellery"],
  "Home & Living":["Furniture", "Kitchen", "Bedding", "Decor", "Lighting", "Storage"],
  Sports:         ["Fitness", "Outdoor", "Team Sports", "Water Sports", "Cycling", "Yoga"],
  Beauty:         ["Skincare", "Haircare", "Makeup", "Fragrances", "Men's Grooming"],
  Books:          ["Fiction", "Non-Fiction", "Academic", "Children", "Comics", "Self-Help"],
  Gaming:         ["Consoles", "PC Gaming", "Mobile Gaming", "Accessories", "Games"],
  Accessories:    ["Watches", "Sunglasses", "Belts", "Wallets", "Caps", "Scarves"],
};

const SAMPLE_IMAGES = [
  "https://i.pinimg.com/736x/84/6e/ec/846eecbc31f7dd4672e1917093334cdc.jpg",
  "https://i.pinimg.com/736x/d5/92/4b/d5924bc1408acb644e657fdf1b090759.jpg",
  "https://i.pinimg.com/1200x/47/5b/2e/475b2e92bb84f134055c4a15609673c7.jpg",
  "https://i.pinimg.com/736x/82/6c/f3/826cf344ffdc27bfba936d09614b6b2a.jpg",
  "https://i.pinimg.com/1200x/dc/18/78/dc187892400c48e277c6105d8d013803.jpg",
  "https://i.pinimg.com/736x/81/ca/09/81ca098e8bd2c9fedffcc687e5f89943.jpg",
];

/* ── tokens ─────────────────────────────────────────────────────── */
const T = {
  bg:        "#080a10",
  surface:   "#0d1017",
  surfaceHi: "#111520",
  border:    "#1c2030",
  borderHi:  "#252840",
  text:      "#eef2ff",
  muted:     "#4a5070",
  accent:    "#7c5cfc",
  accentLo:  "rgba(124,92,252,0.1)",
  accentRg:  "rgba(124,92,252,0.22)",
  danger:    "#ef4444",
  success:   "#22c55e",
  warn:      "#f5a623",
};

const input = {
  background: "rgba(8,10,16,0.6)",
  border: `1px solid ${T.border}`,
  color: T.text,
  borderRadius: 10,
  width: "100%",
  fontSize: "0.875rem",
  padding: "10px 14px",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const label = {
  display: "block",
  fontSize: "0.775rem",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  color: T.muted,
  marginBottom: 6,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const focusOn  = e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentLo}`; };
const focusOff = e => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = "none"; };

/* ── Field wrapper ───────────────────────────────────────────────── */
const Field = ({ labelText, required, hint, children }) => (
  <div>
    <label style={label}>
      {labelText}
      {required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <p style={{ color: T.muted, fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
        {hint}
      </p>
    )}
  </div>
);

/* ── Star Rating Input ───────────────────────────────────────────── */
const StarRatingInput = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
            transition: "transform 0.12s",
            transform: hovered === star ? "scale(1.2)" : "scale(1)",
          }}
        >
          <svg width={26} height={26} viewBox="0 0 20 20"
            fill={star <= display ? T.warn : "none"}
            stroke={star <= display ? T.warn : T.muted}
            strokeWidth={1.2}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span style={{ color: T.warn, fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", fontWeight: 700, marginLeft: 4 }}>
          {value}.0
        </span>
      )}
      {value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", marginLeft: 2, padding: "2px 6px" }}
        >
          Clear
        </button>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "", subCategory: "", image: "", stock: "",
    rating: 0,
  });

  const subCatOptions = form.category ? (SUB_CATEGORIES[form.category] || []) : [];

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "category") {
      setForm(f => ({ ...f, category: value, subCategory: "" }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    if (name === "image") setImgError(false);
  };

  const handleRating = val => setForm(f => ({ ...f, rating: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category || !form.image)
      return toast.error("Please fill all required fields");
    if (isNaN(form.price) || Number(form.price) < 0)
      return toast.error("Enter a valid price");

    try {
      setLoading(true);
      await API.post("/products", {
        title:         form.title,
        description:   form.description,
        price:         Number(form.price),
        category:      form.category,
        subCategory:   form.subCategory,
        images:        [form.image],
        stock:         Number(form.stock) || 0,
        averageRating: form.rating || 0,
      });
      toast.success("Product added!", {
        style: { background: "#13161e", color: "#e2e8f0", border: `1px solid ${T.border}` },
        iconTheme: { primary: T.accent, secondary: "#fff" },
      });
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const previewReady = form.image && !imgError;
  const filled = [form.title, form.description, form.price, form.category, form.image].filter(Boolean).length;
  const progress = Math.round((filled / 5) * 100);

  return (
    <AdminLayout>
      <div
        className="min-h-screen px-4 sm:px-5 pt-6 sm:pt-8 pb-16"
        style={{
          background: `radial-gradient(ellipse 70% 40% at 60% -5%, rgba(124,92,252,0.06) 0%, transparent 60%), ${T.bg}`,
        }}
      >
        <div className="max-w-[1100px] mx-auto">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start gap-3 sm:gap-3.5 mb-6 sm:mb-8 flex-wrap">
            <Link
              to="/admin"
              className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[10px] flex-shrink-0 flex items-center justify-center no-underline mt-1 transition-colors"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-[200px]">
              <h1
                className="font-['Syne',sans-serif] font-bold text-[1.4rem] sm:text-[clamp(1.5rem,3vw,2rem)] m-0"
                style={{ color: T.text, letterSpacing: "-0.02em" }}
              >
                Add New Product
              </h1>
              <p className="text-[#4a5070] text-[0.8rem] sm:text-[0.875rem] font-['DM_Sans',sans-serif] mt-1">
                Fill in the details below to list a new product
              </p>
            </div>

            {/* Progress pill */}
            <div
              className="flex items-center gap-2.5 mt-1 sm:mt-1.5 flex-shrink-0 px-3 sm:px-3.5 py-1.5 rounded-full w-full sm:w-auto justify-between sm:justify-start"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <div className="w-16 sm:w-20 h-1 rounded-full overflow-hidden" style={{ background: T.border }}>
                <div style={{
                  width: `${progress}%`, height: "100%", borderRadius: 9999,
                  background: `linear-gradient(90deg, ${T.accent}, #3b82f6)`,
                  transition: "width 0.3s ease",
                }} />
              </div>
              <span style={{ color: progress === 100 ? T.success : T.muted }} className="text-xs font-['DM_Sans',sans-serif] font-semibold">
                {progress}%
              </span>
            </div>
          </div>

          {/* ── Body: form + live preview ──────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 sm:gap-6 items-start">

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 sm:gap-[22px] rounded-2xl p-5 sm:p-7"
              style={{
                background: "linear-gradient(160deg, #0d1017, #080a10)",
                border: `1px solid ${T.border}`,
              }}
            >
              {/* Title */}
              <Field labelText="Product Title" required>
                <input
                  type="text" name="title" value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Premium Wireless Headphones"
                  style={input}
                  onFocus={focusOn} onBlur={focusOff}
                />
              </Field>

              {/* Description */}
              <Field labelText="Description" required>
                <textarea
                  name="description" value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product in detail…"
                  rows={4}
                  style={{ ...input, resize: "vertical", minHeight: 100 }}
                  onFocus={focusOn} onBlur={focusOff}
                />
              </Field>

              {/* Price + Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field labelText="Price (USD)" required>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      color: T.muted, fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif",
                      pointerEvents: "none",
                    }}>$</span>
                    <input
                      type="number" name="price" value={form.price}
                      onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01"
                      style={{ ...input, paddingLeft: 26 }}
                      onFocus={focusOn} onBlur={focusOff}
                    />
                  </div>
                </Field>
                <Field labelText="Stock Quantity" hint="Leave 0 if unlimited">
                  <input
                    type="number" name="stock" value={form.stock}
                    onChange={handleChange}
                    placeholder="0" min="0"
                    style={input}
                    onFocus={focusOn} onBlur={focusOff}
                  />
                </Field>
              </div>

              {/* Category + Sub-Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <Field labelText="Category" required>
                  <div style={{ position: "relative" }}>
                    <select
                      name="category" value={form.category}
                      onChange={handleChange}
                      style={{
                        ...input, cursor: "pointer", appearance: "none",
                        paddingRight: 38,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5070'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: 16,
                      }}
                      onFocus={focusOn} onBlur={focusOff}
                    >
                      <option value="" style={{ background: "#0d1017", color: T.muted }}>Select a category…</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} style={{ background: "#0d1017", color: T.text }}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                {/* Sub-Category */}
                <Field
                  labelText="Sub-Category"
                  hint={!form.category ? "Select a category first" : ""}
                >
                  <div style={{ position: "relative" }}>
                    <select
                      name="subCategory" value={form.subCategory}
                      onChange={handleChange}
                      disabled={!form.category}
                      style={{
                        ...input, cursor: form.category ? "pointer" : "not-allowed",
                        appearance: "none", paddingRight: 38,
                        opacity: form.category ? 1 : 0.45,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5070'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: 16,
                      }}
                      onFocus={focusOn} onBlur={focusOff}
                    >
                      <option value="" style={{ background: "#0d1017", color: T.muted }}>
                        {form.category ? "Select sub-category…" : "— pick category first —"}
                      </option>
                      {subCatOptions.map(sub => (
                        <option key={sub} value={sub} style={{ background: "#0d1017", color: T.text }}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              {/* Rating field */}
              <Field
                labelText="Initial Rating"
                hint="Set a seed rating (0–5 stars). Leave at 0 if not applicable."
              >
                <div style={{
                  background: "rgba(8,10,16,0.6)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                }}>
                  <StarRatingInput value={form.rating} onChange={handleRating} />
                </div>
              </Field>

              {/* Image URL */}
              <Field labelText="Image URL" required hint="Paste any direct image URL or pick from quick picks below">
                <input
                  type="url" name="image" value={form.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/…"
                  style={input}
                  onFocus={focusOn} onBlur={focusOff}
                />
              </Field>

              {/* Quick image picker */}
              <div>
                <p style={{ ...label, marginBottom: 10 }}>Quick Picks</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SAMPLE_IMAGES.map((img, i) => {
                    const active = form.image === img;
                    return (
                      <button
                        key={i} type="button"
                        onClick={() => { setForm(f => ({ ...f, image: img })); setImgError(false); }}
                        style={{
                          aspectRatio: "1", borderRadius: 9, overflow: "hidden", padding: 0,
                          border: `2px solid ${active ? T.accent : T.border}`,
                          boxShadow: active ? `0 0 0 3px ${T.accentLo}` : "none",
                          transform: active ? "scale(0.93)" : "scale(1)",
                          transition: "all 0.18s", cursor: "pointer",
                        }}
                      >
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${T.border}` }} />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "13px 24px", borderRadius: 11,
                  background: loading ? T.surface : "linear-gradient(135deg, #7c5cfc, #3b82f6)",
                  color: loading ? T.muted : "#fff",
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: "0.9rem", border: loading ? `1px solid ${T.border}` : "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.25)",
                      borderTopColor: T.muted,
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Adding Product…
                  </>
                ) : (
                  <>
                    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </form>

            {/* ── Live Preview — below form on mobile/tablet, sticky sidebar on lg+ ── */}
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0d1017, #080a10)",
                  border: `1px solid ${T.border}`,
                }}
              >
                {/* Preview header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <span style={{ color: T.text }} className="font-['Syne',sans-serif] font-semibold text-[0.85rem]">
                    Live Preview
                  </span>
                  <span style={{
                    fontSize: "0.68rem", fontFamily: "'DM Sans', sans-serif",
                    padding: "2px 8px", borderRadius: 9999,
                    background: "rgba(34,197,94,0.1)", color: T.success,
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}>
                    LIVE
                  </span>
                </div>

                {/* Image */}
                <div style={{ aspectRatio: "4/3", background: "#0a0c14", position: "relative", overflow: "hidden" }}>
                  {previewReady ? (
                    <img
                      src={form.image}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <svg width={28} height={28} fill="none" stroke={T.muted} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>
                        {imgError ? "Invalid image URL" : "No image yet"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="p-4 flex flex-col gap-2">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {form.category && (
                      <span style={{
                        display: "inline-block",
                        fontSize: "0.68rem", fontFamily: "'DM Sans', sans-serif",
                        padding: "2px 10px", borderRadius: 9999,
                        background: T.accentLo, color: T.accent, border: `1px solid ${T.accentRg}`,
                      }}>
                        {form.category}
                      </span>
                    )}
                    {form.subCategory && (
                      <span style={{
                        display: "inline-block",
                        fontSize: "0.68rem", fontFamily: "'DM Sans', sans-serif",
                        padding: "2px 10px", borderRadius: 9999,
                        background: "rgba(245,166,35,0.1)", color: T.warn,
                        border: "1px solid rgba(245,166,35,0.25)",
                      }}>
                        {form.subCategory}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 600, color: form.title ? T.text : T.muted,
                    fontSize: "0.9rem", margin: 0, lineHeight: 1.4,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {form.title || "Product title will appear here"}
                  </p>

                  {form.description && (
                    <p style={{
                      color: T.muted, fontSize: "0.78rem",
                      fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.5,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {form.description}
                    </p>
                  )}

                  {form.rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width={13} height={13} viewBox="0 0 20 20"
                          fill={s <= form.rating ? T.warn : T.border}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span style={{ color: T.warn, fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginLeft: 3 }}>
                        {form.rating}.0
                      </span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.text, fontSize: "1.1rem" }}>
                      {form.price ? `$${Number(form.price).toFixed(2)}` : "—"}
                    </span>
                    {form.stock && (
                      <span style={{
                        fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif",
                        color: Number(form.stock) > 0 ? T.success : T.danger,
                        padding: "2px 8px", borderRadius: 6,
                        background: Number(form.stock) > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                      }}>
                        {Number(form.stock) > 0 ? `${form.stock} in stock` : "Out of stock"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div
                className="mt-3.5 rounded-2xl px-4 py-3.5"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <p style={{ color: T.text }} className="font-['Syne',sans-serif] font-semibold text-[0.8rem] mb-2.5">
                  Tips
                </p>
                {[
                  "Use high-res images (800×600+) for best display",
                  "Keep titles under 60 characters",
                  "Add stock count to show availability",
                  "Select a sub-category for better discoverability",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                    <span style={{ color: T.accent, fontSize: 12, marginTop: 1, flexShrink: 0 }}>•</span>
                    <span style={{ color: T.muted, fontSize: "0.78rem", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
};

export default AddProduct;