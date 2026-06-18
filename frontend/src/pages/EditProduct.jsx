import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

export const CATEGORIES_WITH_SUBS = {
  Electronics: [
    "Smartphones", "Laptops", "Tablets", "Cameras", "Audio", "Wearables",
    "Smart Home", "Accessories", "Other",
  ],
  Fashion: [
    "Men's Clothing", "Women's Clothing", "Kids' Clothing",
    "Footwear", "Bags & Wallets", "Watches", "Sunglasses", "Jewellery", "Other",
  ],
  "Home & Living": [
    "Furniture", "Kitchen & Dining", "Bedding", "Bath", "Lighting",
    "Décor", "Storage", "Garden", "Other",
  ],
  Sports: [
    "Fitness Equipment", "Outdoor & Camping", "Cycling", "Cricket",
    "Football", "Swimming", "Yoga", "Running", "Other",
  ],
  Beauty: [
    "Skin Care", "Hair Care", "Make-up", "Fragrances",
    "Men's Grooming", "Bath & Body", "Nail Care", "Other",
  ],
  Books: [
    "Fiction", "Non-Fiction", "Science & Technology", "Self-Help",
    "Children's Books", "Comics & Graphic Novels", "Textbooks", "Other",
  ],
  Gaming: [
    "Consoles", "PC Gaming", "Mobile Gaming", "Controllers & Accessories",
    "Games", "Virtual Reality", "Other",
  ],
  Accessories: [
    "Phone Cases", "Chargers & Cables", "Laptop Bags", "Headphone Accessories",
    "Smart Bands", "Stands & Mounts", "Other",
  ],
};

export const CATEGORIES = Object.keys(CATEGORIES_WITH_SUBS);

/* ── Styles ───────────────────────────────────────── */
const inputStyle = {
  background: "rgba(8, 10, 16, 0.7)",
  border: "1px solid #1a1d2e",
  color: "#eef2ff",
  borderRadius: "12px",
  width: "100%",
  fontSize: "0.875rem",
  padding: "10px 14px",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontFamily: "'DM Sans', sans-serif",
  color: "#525878",
  marginBottom: "6px",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23525878'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "16px",
  paddingRight: "40px",
};

/* ════════════════════════════════════════════════════ */
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    image: "",
    stock: "",
  });

  /* Derive subcategory list from selected category */
  const subCategoryOptions = form.category ? (CATEGORIES_WITH_SUBS[form.category] || []) : [];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        const p = data.product || data;
        setForm({
          title:       p.title           || "",
          description: p.description     || "",
          price:       p.price?.toString()|| "",
          category:    p.category        || "",
          subCategory: p.subCategory     || "",
          image:       Array.isArray(p.images) ? p.images[0] : (p.image || ""),
          stock:       p.stock?.toString()|| "",
        });
      } catch {
        toast.error("Product not found");
        navigate("/dashboard");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    /* Reset subCategory whenever main category changes */
    if (name === "category") {
      setForm((prev) => ({ ...prev, category: value, subCategory: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category || !form.image) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      await API.put(`/products/${id}`, {
        title:       form.title,
        description: form.description,
        price:       Number(form.price),
        category:    form.category,
        subCategory: form.subCategory || undefined,
        images:      [form.image],
        stock:       Number(form.stock) || 0,
      });

      toast.success("Product updated successfully!", {
        style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
        iconTheme: { primary: "#7c5cfc", secondary: "#fff" },
      });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading spinner ─────────────────────────────── */
  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--nova-bg)" }}>
        <div style={{ width: 40, height: 40, border: "2px solid #7c5cfc", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "var(--nova-bg)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" style={{ color: "#525878" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.875rem", color: "#eef2ff" }}>
              Edit Product
            </h1>
            <p style={{ color: "#525878", fontSize: "0.875rem" }}>Update your product details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Form ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              style={{
                background: "linear-gradient(145deg, #0f1219 0%, #080a10 100%)",
                border: "1px solid #1a1d2e",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div className="space-y-5">

                {/* Title */}
                <div>
                  <label style={labelStyle}>Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      min="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: "#0f1219", color: "#eef2ff" }}>
                      Select category…
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} style={{ background: "#0f1219", color: "#eef2ff" }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category — only shown when a category is selected */}
                {subCategoryOptions.length > 0 && (
                  <div>
                    <label style={labelStyle}>
                      Sub Category
                      <span style={{ color: "#3a3f5a", marginLeft: 4 }}>(optional)</span>
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                      style={selectStyle}
                    >
                      <option value="" style={{ background: "#0f1219", color: "#eef2ff" }}>
                        Select sub category…
                      </option>
                      {subCategoryOptions.map((sub) => (
                        <option key={sub} value={sub} style={{ background: "#0f1219", color: "#eef2ff" }}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Image URL */}
                <div>
                  <label style={labelStyle}>Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      background: loading ? "#1a1d2e" : "linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)",
                      color: "#fff",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Saving…
                      </>
                    ) : "Save Changes"}
                  </button>
                  <Link
                    to="/dashboard"
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      background: "transparent",
                      color: "#c7d2fe",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      border: "1px solid #1a1d2e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cancel
                  </Link>
                </div>

              </div>
            </form>
          </div>

          {/* ── Preview ──────────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              style={{
                background: "linear-gradient(145deg, #0f1219 0%, #080a10 100%)",
                border: "1px solid #1a1d2e",
                borderRadius: "16px",
                padding: "16px",
                position: "sticky",
                top: "96px",
              }}
            >
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.875rem", marginBottom: "12px" }}>
                Preview
              </p>

              {/* Image */}
              {form.image ? (
                <div style={{ aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: "1px solid #1a1d2e", marginBottom: "10px", background: "#13161f" }}>
                  <img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ aspectRatio: "1", borderRadius: "12px", border: "1px dashed #1a1d2e", marginBottom: "10px", background: "#13161f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#525878", fontSize: "0.8rem" }}>No image</span>
                </div>
              )}

              {/* Category + SubCategory pills */}
              {(form.category || form.subCategory) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {form.category && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
                      borderRadius: 9999, background: "rgba(124,92,252,0.12)",
                      border: "1px solid rgba(124,92,252,0.25)", color: "#9b7fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{form.category}</span>
                  )}
                  {form.subCategory && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
                      borderRadius: 9999, background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.22)", color: "#34d399",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{form.subCategory}</span>
                  )}
                </div>
              )}

              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#eef2ff", fontSize: "0.875rem", marginBottom: "4px" }}>
                {form.title || "Title"}
              </p>
              {form.price && (
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#eef2ff" }}>
                  ${Number(form.price).toFixed(2)}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EditProduct;