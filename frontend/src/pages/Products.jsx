import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import { CATEGORIES_WITH_SUBS } from "../pages/EditProduct";

/* ── Static data ─────────────────────────────────── */
const CATEGORIES = [
  { name: "All",           icon: "ti-category" },
  { name: "Electronics",   icon: "ti-device-laptop" },
  { name: "Fashion",       icon: "ti-hanger" },
  { name: "Home & Living", icon: "ti-home" },
  { name: "Sports",        icon: "ti-ball-football" },
  { name: "Beauty",        icon: "ti-sparkles" },
  { name: "Books",         icon: "ti-book" },
  { name: "Gaming",        icon: "ti-device-gamepad-2" },
  { name: "Accessories",   icon: "ti-watch" },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated" },
  { value: "popular",    label: "Most Popular" },
];

const PRICE_RANGES = [
  { label: "Under ₹500",        min: 0,     max: 500 },
  { label: "₹500 – ₹2,000",    min: 500,   max: 2000 },
  { label: "₹2,000 – ₹10,000", min: 2000,  max: 10000 },
  { label: "Above ₹10,000",    min: 10000, max: Infinity },
];

/* ── Design tokens ───────────────────────────────── */
const T = {
  bg:        "#080a10",
  surface:   "#0d1017",
  border:    "#1c2030",
  text:      "#eef2ff",
  muted:     "#4a5070",
  accent:    "#7c5cfc",
  accentLo:  "rgba(124,92,252,0.12)",
  accentRg:  "rgba(124,92,252,0.25)",
  accentTx:  "#9b7fff",
  success:   "#10b981",
  successLo: "rgba(16,185,129,0.1)",
  successRg: "rgba(16,185,129,0.22)",
  successTx: "#34d399",
};

/* ── Reusable dropdown style ─────────────────────── */
const dropdownStyle = (hasValue) => ({
  background: hasValue
    ? `${T.accentLo} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239b7fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center/14px`
    : `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5070'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center/14px`,
  border: `1.5px solid ${hasValue ? T.accentRg : T.border}`,
  color: hasValue ? T.accentTx : T.text,
  borderRadius: 10,
  fontSize: "0.875rem",
  padding: "9px 34px 9px 12px",
  appearance: "none",
  cursor: "pointer",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.18s, background 0.18s",
  minWidth: 160,
});

/* ── Skeleton ────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.border}`, background: T.surface }}>
    <div style={{ aspectRatio: "4/3", background: "#131825", position: "relative", overflow: "hidden" }}>
      <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
    </div>
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
      <div className="shimmer" style={{ height: 10, width: "35%", borderRadius: 5 }} />
      <div className="shimmer" style={{ height: 15, width: "90%", borderRadius: 5 }} />
      <div className="shimmer" style={{ height: 12, width: "50%", borderRadius: 5 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <div className="shimmer" style={{ height: 18, width: "28%", borderRadius: 5 }} />
        <div className="shimmer" style={{ height: 30, width: "34%", borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

/* ── Filter chip ─────────────────────────────────── */
const FilterChip = ({ label, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 10px 4px 12px", borderRadius: 9999,
    background: T.accentLo, border: `1px solid ${T.accentRg}`,
    color: T.accentTx, fontSize: "0.76rem", fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  }}>
    {label}
    <button onClick={onRemove} style={{
      width: 16, height: 16, borderRadius: "50%", border: "none",
      background: "rgba(124,92,252,0.2)", color: T.accentTx,
      cursor: "pointer", display: "inline-flex", alignItems: "center",
      justifyContent: "center", fontSize: 11, padding: 0,
    }}>×</button>
  </span>
);

/* ── Sidebar section wrapper ─────────────────────── */
const SideSection = ({ title, children }) => (
  <div style={{
    background: T.surface, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: "14px 10px", marginBottom: 12,
  }}>
    <p style={{
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      color: T.muted, fontSize: "0.65rem",
      letterSpacing: "0.1em", textTransform: "uppercase",
      margin: "0 6px 12px",
    }}>{title}</p>
    {children}
  </div>
);

/* ════════════════════════════════════════════════════ */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [activeSearch, setActiveSearch]   = useState("");
  const [category, setCategory]           = useState(searchParams.get("category") || "All");
  const [subCategory, setSubCategory]     = useState(searchParams.get("subCategory") || "");
  const [sort, setSort]                   = useState("newest");
  const [priceRange, setPriceRange]       = useState(null);
  const [minRating, setMinRating]         = useState(null);
  const [inStockOnly, setInStockOnly]     = useState(false);
  const [gridView, setGridView]           = useState(true);

  /* Subcategory list derived from selected main category */
  const subCatOptions = category !== "All" ? (CATEGORIES_WITH_SUBS[category] || []) : [];

  /* Sync URL params → state */
  useEffect(() => {
    const c  = searchParams.get("category");
    const sc = searchParams.get("subCategory");
    if (c)  setCategory(c);
    if (sc) setSubCategory(sc);
  }, [searchParams]);

  /* Fetch */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== "All") params.append("category", category);
      if (subCategory)                    params.append("subCategory", subCategory);
      if (activeSearch.trim())            params.append("search", activeSearch.trim());
      if (sort && sort !== "newest")      params.append("sort", sort);
      if (priceRange !== null) {
        params.append("minPrice", PRICE_RANGES[priceRange].min);
        if (PRICE_RANGES[priceRange].max !== Infinity)
          params.append("maxPrice", PRICE_RANGES[priceRange].max);
      }
      if (minRating)   params.append("minRating", minRating);
      if (inStockOnly) params.append("inStock", "true");

      const { data } = await API.get(`/products?${params.toString()}`);
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, sort, activeSearch, priceRange, minRating, inStockOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* Handlers */
  const handleSearch = (e) => { e.preventDefault(); setActiveSearch(search); };
  const clearSearch  = ()  => { setSearch(""); setActiveSearch(""); };

  const handleCat = (cat) => {
    setCategory(cat);
    setSubCategory("");
    const p = new URLSearchParams();
    if (cat !== "All") p.set("category", cat);
    setSearchParams(p);
  };

  const handleSubCat = (sub) => {
    const next = subCategory === sub ? "" : sub;
    setSubCategory(next);
    const p = new URLSearchParams();
    if (category !== "All") p.set("category", category);
    if (next)               p.set("subCategory", next);
    setSearchParams(p);
  };

  const clearAll = () => {
    clearSearch();
    handleCat("All");
    setSubCategory("");
    setPriceRange(null);
    setMinRating(null);
    setInStockOnly(false);
  };

  const hasFilters = activeSearch || category !== "All" || subCategory || priceRange !== null || minRating || inStockOnly;

  /* ── Category icon lookup ─────────────────────── */
  const catIcon = CATEGORIES.find(c => c.name === category)?.icon || "ti-category";

  return (
    <div style={{
      minHeight: "100vh", paddingTop: 88, paddingBottom: 80,
      background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,252,0.06) 0%, transparent 65%), ${T.bg}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Top bar ─────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0 22px", borderBottom: `1px solid ${T.border}`, marginBottom: 22,
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: "clamp(1.5rem,4vw,2.2rem)", color: T.text,
              margin: 0, letterSpacing: "-0.02em",
            }}>All Products</h1>
            {!loading && (
              <span style={{ fontSize: "0.85rem", color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                {products.length} result{products.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: T.muted, fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>Sort by</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                background: `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5070'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center/14px`,
                border: `1.5px solid ${T.border}`, color: T.text, borderRadius: 10,
                fontSize: "0.875rem", padding: "8px 34px 8px 12px",
                appearance: "none", cursor: "pointer", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: T.surface }}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${T.surface}, #0a0c14)`,
          border: `1.5px solid ${T.border}`, borderRadius: 14,
          padding: "16px 20px", marginBottom: 16,
          display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, flex: "1 1 260px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: T.muted, pointerEvents: "none" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands and more…"
                style={{
                  width: "100%", background: "#060810",
                  border: `1.5px solid ${T.border}`, color: T.text,
                  borderRadius: 10, fontSize: "0.875rem",
                  padding: "11px 38px 11px 40px", outline: "none",
                  fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentLo}`; }}
                onBlur={e  => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = "none"; }}
              />
              {search && (
                <button type="button" onClick={clearSearch} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: T.muted, fontSize: 16, padding: 2, display: "flex", alignItems: "center",
                }}>×</button>
              )}
            </div>
            <button type="submit" style={{
              padding: "11px 22px", borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #7c5cfc, #5b8def)",
              color: "#fff", fontFamily: "'Syne', sans-serif",
              fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer",
            }}>Search</button>
          </form>
        </div>

        {/* ── Category + SubCategory dropdowns bar ── */}
        <div style={{
          display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
          marginBottom: 16,
        }}>
          {/* Category label */}
          <span style={{ fontSize: "0.8rem", color: T.muted, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
            Browse by
          </span>

          {/* Category dropdown */}
          <div style={{ position: "relative" }}>
            {category !== "All" && (
              <i
                className={`ti ${catIcon}`}
                style={{
                  position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                  fontSize: 15, color: T.accentTx, pointerEvents: "none",
                }}
              />
            )}
            <select
              value={category}
              onChange={e => handleCat(e.target.value)}
              style={{
                ...dropdownStyle(category !== "All"),
                paddingLeft: category !== "All" ? 30 : 12,
              }}
            >
              {CATEGORIES.map(({ name }) => (
                <option key={name} value={name} style={{ background: T.surface, color: T.text }}>
                  {name === "All" ? "All Categories" : name}
                </option>
              ))}
            </select>
          </div>

          {/* SubCategory dropdown — only when subs exist */}
          {subCatOptions.length > 0 && (
            <>
              {/* Separator chevron */}
              <svg width="14" height="14" fill="none" stroke={T.muted} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>

              <div style={{ position: "relative" }}>
                {subCategory && (
                  <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    width: 7, height: 7, borderRadius: "50%",
                    background: T.success, pointerEvents: "none", flexShrink: 0,
                  }} />
                )}
                <select
                  value={subCategory}
                  onChange={e => handleSubCat(e.target.value)}
                  style={{
                    ...dropdownStyle(!!subCategory),
                    border: subCategory
                      ? `1.5px solid ${T.successRg}`
                      : `1.5px solid ${T.border}`,
                    background: subCategory
                      ? `${T.successLo} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2334d399'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center/14px`
                      : `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5070'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center/14px`,
                    color: subCategory ? T.successTx : T.text,
                    paddingLeft: subCategory ? 24 : 12,
                  }}
                >
                  <option value="" style={{ background: T.surface, color: T.text }}>All {category}</option>
                  {subCatOptions.map(sub => (
                    <option key={sub} value={sub} style={{ background: T.surface, color: T.text }}>{sub}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Result count pill — spacer filler on the right */}
          {!loading && (category !== "All" || subCategory) && (
            <span style={{
              marginLeft: "auto",
              fontSize: "0.78rem", color: T.muted,
              fontFamily: "'DM Sans', sans-serif",
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 9999, padding: "4px 12px",
            }}>
              {products.length} product{products.length !== 1 ? "s" : ""}
              {subCategory ? ` · ${subCategory}` : category !== "All" ? ` · ${category}` : ""}
            </span>
          )}
        </div>

        {/* ── Active filter chips ──────────────────── */}
        {hasFilters && !loading && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
            <span style={{ color: T.muted, fontSize: "0.76rem", fontFamily: "'DM Sans', sans-serif" }}>Active filters:</span>
            {category !== "All" && <FilterChip label={category}              onRemove={() => handleCat("All")} />}
            {subCategory        && <FilterChip label={subCategory}           onRemove={() => handleSubCat(subCategory)} />}
            {activeSearch       && <FilterChip label={`"${activeSearch}"`}   onRemove={clearSearch} />}
            {priceRange !== null && <FilterChip label={PRICE_RANGES[priceRange].label} onRemove={() => setPriceRange(null)} />}
            {minRating          && <FilterChip label={`${minRating}+ stars`} onRemove={() => setMinRating(null)} />}
            {inStockOnly        && <FilterChip label="In stock"              onRemove={() => setInStockOnly(false)} />}
            <button onClick={clearAll} style={{
              background: "transparent", border: "none", color: T.muted,
              fontSize: "0.76rem", cursor: "pointer", textDecoration: "underline",
              fontFamily: "'DM Sans', sans-serif",
            }}>Clear all</button>
          </div>
        )}

        {/* ── Body ────────────────────────────────── */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── Sidebar (desktop) ────────────────── */}
          <aside style={{ width: 215, flexShrink: 0, display: "none" }} className="lg-sidebar">

            {/* Categories */}
            <SideSection title="Categories">
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {CATEGORIES.map(({ name, icon }) => {
                  const active = category === name;
                  return (
                    <button key={name} onClick={() => handleCat(name)} style={{
                      textAlign: "left", padding: "9px 12px", borderRadius: 9,
                      fontSize: "0.855rem", fontFamily: "'DM Sans', sans-serif",
                      border: "none", cursor: "pointer", transition: "all 0.18s",
                      background: active ? T.accentLo : "transparent",
                      color: active ? T.accentTx : T.muted,
                      fontWeight: active ? 600 : 400,
                      outline: active ? `1px solid ${T.accentRg}` : "none",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
                      {name}
                    </button>
                  );
                })}
              </nav>
            </SideSection>

            {/* Sub Categories */}
            {subCatOptions.length > 0 && (
              <SideSection title="Sub Category">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {subCatOptions.map((sub) => {
                    const active = subCategory === sub;
                    return (
                      <button key={sub} onClick={() => handleSubCat(sub)} style={{
                        textAlign: "left", padding: "8px 12px", borderRadius: 9,
                        fontSize: "0.825rem", fontFamily: "'DM Sans', sans-serif",
                        border: "none", cursor: "pointer", transition: "all 0.18s",
                        background: active ? T.successLo : "transparent",
                        color: active ? T.successTx : T.muted,
                        fontWeight: active ? 600 : 400,
                        outline: active ? `1px solid ${T.successRg}` : "none",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: active ? T.success : T.muted,
                          flexShrink: 0, transition: "background 0.18s",
                        }} />
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </SideSection>
            )}

            {/* Price range */}
            <SideSection title="Price Range">
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="number" placeholder="Min ₹" style={{
                  width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
                  color: T.text, borderRadius: 8, fontSize: "0.8rem",
                  padding: "7px 10px", outline: "none", fontFamily: "'DM Sans', sans-serif",
                }} />
                <input type="number" placeholder="Max ₹" style={{
                  width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
                  color: T.text, borderRadius: 8, fontSize: "0.8rem",
                  padding: "7px 10px", outline: "none", fontFamily: "'DM Sans', sans-serif",
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRICE_RANGES.map((r, i) => (
                  <label key={i} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    cursor: "pointer", fontSize: "0.84rem",
                    color: priceRange === i ? T.accentTx : T.muted,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <input
                      type="radio" name="price"
                      checked={priceRange === i}
                      onChange={() => setPriceRange(priceRange === i ? null : i)}
                      style={{ accentColor: T.accent, width: 15, height: 15 }}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </SideSection>

            {/* Rating */}
            <SideSection title="Customer Rating">
              {[{ val: 4.5, label: "4.5+ ★" }, { val: 4, label: "4+ ★" }, { val: 3, label: "3+ ★" }].map(r => (
                <label key={r.val} style={{
                  display: "flex", alignItems: "center", gap: 9, cursor: "pointer",
                  fontSize: "0.84rem", color: minRating === r.val ? T.accentTx : T.muted,
                  fontFamily: "'DM Sans', sans-serif", marginBottom: 8,
                }}>
                  <input
                    type="checkbox" checked={minRating === r.val}
                    onChange={() => setMinRating(minRating === r.val ? null : r.val)}
                    style={{ accentColor: T.accent, width: 15, height: 15 }}
                  />
                  <span style={{ color: "#f5a623", marginRight: 2 }}>{"★".repeat(Math.floor(r.val))}</span>
                  {r.label}
                </label>
              ))}
            </SideSection>

            {/* Availability */}
            <SideSection title="Availability">
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "0.84rem", color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>In stock only</span>
                <div
                  onClick={() => setInStockOnly(!inStockOnly)}
                  style={{
                    width: 38, height: 21, borderRadius: 999, position: "relative", cursor: "pointer",
                    background: inStockOnly ? T.accent : T.border, transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3,
                    left: inStockOnly ? "auto" : 3, right: inStockOnly ? 3 : "auto",
                    width: 15, height: 15, background: "#fff", borderRadius: "50%",
                    transition: "left 0.2s, right 0.2s",
                  }} />
                </div>
              </label>
            </SideSection>

          </aside>

          {/* ── Main content ─────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Results row */}
            {!loading && products.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 16,
              }}>
                <span style={{ fontSize: "0.84rem", color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                  Showing <strong style={{ color: T.text }}>{products.length}</strong> product{products.length !== 1 ? "s" : ""}
                  {subCategory && (
                    <span style={{ color: T.successTx, marginLeft: 6 }}>in {subCategory}</span>
                  )}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setGridView(true)} style={{
                    padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: gridView ? T.accentLo : "transparent",
                    outline: gridView ? `1px solid ${T.accentRg}` : `1px solid ${T.border}`,
                    color: gridView ? T.accentTx : T.muted, fontSize: 16,
                  }}>⊞</button>
                  <button onClick={() => setGridView(false)} style={{
                    padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: !gridView ? T.accentLo : "transparent",
                    outline: !gridView ? `1px solid ${T.accentRg}` : `1px solid ${T.border}`,
                    color: !gridView ? T.accentTx : T.muted, fontSize: 16,
                  }}>☰</button>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>

            /* Empty state */
            ) : products.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 24px",
                border: `1.5px solid ${T.border}`, borderRadius: 16,
                background: `linear-gradient(160deg, ${T.surface}, ${T.bg})`,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🔍</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: T.text, margin: "0 0 8px" }}>
                  No products found
                </h3>
                <p style={{ color: T.muted, fontSize: "0.875rem", margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>
                  Try a different search term or category
                </p>
                <button onClick={clearAll} style={{
                  padding: "9px 22px", borderRadius: 10,
                  background: T.accentLo, border: `1px solid ${T.accentRg}`,
                  color: T.accentTx, fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                }}>Clear all filters</button>
              </div>

            /* Product grid */
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: gridView
                  ? "repeat(auto-fill,minmax(200px,1fr))"
                  : "1fr",
                gap: 16,
              }}>
                {products.map((product, i) => (
                  <div key={product._id} className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(i * 0.04, 0.28)}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar  { display: block !important; }
        }
        .shimmer {
          background: linear-gradient(90deg, #131825 25%, #1c2235 50%, #131825 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes animate-slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: animate-slide-up 0.35s ease forwards; }
        select:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentLo}; }
      `}</style>
    </div>
  );
};

export default Products;