import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist for logged-in user
  useEffect(() => {
    if (!user?._id) {
      setWishlist([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`novacart_wishlist_${user._id}`);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [user?._id]);

  // Persist on change
  useEffect(() => {
    if (!user?._id) return;
    try {
      localStorage.setItem(
        `novacart_wishlist_${user._id}`,
        JSON.stringify(wishlist)
      );
    } catch {}
  }, [wishlist, user?._id]);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  const toggleWishlist = (product) => {
    if (wishlist.find((p) => p._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isWishlisted = (productId) =>
    wishlist.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);