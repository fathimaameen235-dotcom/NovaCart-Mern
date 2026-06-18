import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeatured = async () => {
      try {
        setLoading(true);

        const { data } = await API.get("/products?sort=rating", {
          signal: controller.signal,
        });

        const products = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        setFeaturedProducts(products.slice(0, 6));
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error("Failed to load featured products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();

    return () => controller.abort();
  }, []);

  const stats = [
    { label: "Active Users", value: "12K+", icon: "👥" },
    { label: "Products Listed", value: "4.5K+", icon: "📦" },
    { label: "Happy Customers", value: "98%", icon: "⭐" },
    { label: "Countries", value: "32+", icon: "🌍" },
  ];

  const categories = [
    { name: "Electronics", icon: "⚡", color: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/20" },
    { name: "Fashion", icon: "👗", color: "from-pink-500/20 to-pink-600/5", border: "border-pink-500/20" },
    { name: "Home & Living", icon: "🏠", color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20" },
    { name: "Sports", icon: "🏋️", color: "from-orange-500/20 to-orange-600/5", border: "border-orange-500/20" },
    { name: "Gaming", icon: "🎮", color: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20" },
    { name: "Beauty", icon: "💄", color: "from-rose-500/20 to-rose-600/5", border: "border-rose-500/20" },
    { name: "Books", icon: "📚", color: "from-indigo-500/20 to-indigo-600/5", border: "border-indigo-500/20" },
    { name: "Accessories", icon: "⌚", color: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/20" },
  ];

  const floatingImages = [
    "https://i.pinimg.com/736x/84/6e/ec/846eecbc31f7dd4672e1917093334cdc.jpg",
    "https://i.pinimg.com/736x/d5/92/4b/d5924bc1408acb644e657fdf1b090759.jpg",
    "https://i.pinimg.com/1200x/47/5b/2e/475b2e92bb84f134055c4a15609673c7.jpg",
    "https://i.pinimg.com/736x/82/6c/f3/826cf344ffdc27bfba936d09614b6b2a.jpg",
    "https://i.pinimg.com/1200x/dc/18/78/dc187892400c48e277c6105d8d013803.jpg",
  ];

  return (
    <div className="min-h-screen bg-nova-bg">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">

        <div className="absolute top-20 left-1/4 w-96 h-96 bg-nova-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center animate-fade-in">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nova-border bg-nova-surface mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-nova-muted text-sm font-mono">
              AI-powered shopping experience
            </span>
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-nova-text mb-6 leading-tight">
            Shop the Future,
            <br />
            <span className="text-transparent bg-clip-text bg-nova-gradient">
              Ship Today
            </span>
          </h1>

          <p className="font-body text-nova-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            NovaCart is the modern commerce platform built for the next generation.
          </p>

          <div className="flex flex-wrap justify-center gap-4">

            <Link
              to="/products"
              className="nova-btn-primary px-8 py-4 rounded-xl inline-flex items-center gap-2"
            >
              Explore Products
            </Link>

            <Link
              to="/register"
              className="nova-btn-secondary px-8 py-4 rounded-xl"
            >
              Create Account
            </Link>

          </div>

          <div className="relative mt-20 flex justify-center">
            <div className="flex gap-4">
              {floatingImages.map((src, i) => (
                <div
                  key={i}
                  className="w-24 h-24 rounded-2xl overflow-hidden border border-nova-border"
                  style={{
                    transform: `translateY(${i % 2 === 0 ? "-8px" : "8px"})`,
                  }}
                >
                  <img
                    src={src}
                    alt="Product"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-nova-border bg-nova-surface/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl">{stat.icon}</div>
              <div className="text-3xl font-bold text-nova-text">
                {stat.value}
              </div>
              <div className="text-nova-muted text-sm">{stat.label}</div>
            </div>
          ))}

        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-center text-3xl font-bold text-nova-text mb-12">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`p-5 rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.color}`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-semibold text-nova-text">
                  {cat.name}
                </p>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-nova-text mb-8">
            Featured Products
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="nova-card h-60 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-nova-muted">
              No products found
            </p>
          )}

        </div>
      </section>

    </div>
  );
};

export default Home;