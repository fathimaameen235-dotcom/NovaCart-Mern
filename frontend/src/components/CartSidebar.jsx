import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const CartSidebar = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  // Prevent quantity below 1
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleIncrease = (item) => {
    updateQuantity(item._id, item.quantity + 1);
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "#13161e",
          borderLeft: "1px solid #1e2130",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nova-border">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-xl text-nova-text">
              Your Cart
            </h2>

            {cartCount > 0 && (
              <span className="w-6 h-6 bg-nova-accent rounded-full text-white text-xs flex items-center justify-center font-mono font-bold">
                {cartCount}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
            aria-label="Close Cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-nova-surface flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-nova-border"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-display font-semibold text-nova-text mb-1">
                  Cart is empty
                </h3>

                <p className="text-sm text-nova-muted">
                  Add some products to start shopping
                </p>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="nova-btn-primary px-6 py-2.5 rounded-lg text-sm"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 p-3 rounded-xl bg-nova-surface border border-nova-border"
                >
                  {/* Product Image */}
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-nova-text line-clamp-1 mb-1">
                      {item.title}
                    </h3>

                    <p className="text-sm font-mono font-bold text-nova-accent mb-2">
                      ${(item.price || 0).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="w-6 h-6 rounded-md bg-nova-border hover:bg-nova-accent/20 text-nova-text flex items-center justify-center transition-colors"
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-sm font-mono text-nova-text">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleIncrease(item)}
                        className="w-6 h-6 rounded-md bg-nova-border hover:bg-nova-accent/20 text-nova-text flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 rounded-lg text-nova-muted hover:text-red-400 hover:bg-red-400/10 transition-all self-start"
                    aria-label="Remove Product"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-nova-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-nova-muted">Total</span>

              <span className="font-display font-bold text-2xl text-nova-text">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full nova-btn-primary py-3 rounded-xl text-center text-sm font-display"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block w-full nova-btn-secondary py-3 rounded-xl text-center text-sm font-display mt-2"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;