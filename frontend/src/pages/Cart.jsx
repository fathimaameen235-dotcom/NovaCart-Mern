import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-nova-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-3xl text-nova-text mb-2">Your cart is empty</h2>
        <p className="text-nova-muted font-body mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="nova-btn-primary px-8 py-3 rounded-xl text-base">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-4xl text-nova-text">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 text-sm font-body underline transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="nova-card p-4 flex gap-4 animate-fade-in">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 rounded-xl object-cover border border-nova-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item._id}`}
                    className="font-display font-semibold text-nova-text hover:text-nova-accent transition-colors line-clamp-1 block mb-1"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs font-mono text-nova-muted px-2 py-0.5 bg-nova-surface border border-nova-border rounded-full">
                    {item.category}
                  </span>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div className="flex items-center border border-nova-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                      >−</button>
                      <span className="w-10 text-center text-nova-text font-mono text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-nova-muted hover:text-nova-text hover:bg-nova-surface transition-all"
                      >+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-nova-text">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1.5 rounded-lg text-nova-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="nova-card p-6 sticky top-24">
              <h2 className="font-display font-bold text-xl text-nova-text mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-nova-muted font-body truncate pr-2">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-nova-text font-mono flex-shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-nova-border pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-nova-muted font-body text-sm">Subtotal</span>
                  <span className="text-nova-text font-mono">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-nova-muted font-body text-sm">Shipping</span>
                  <span className="text-emerald-400 font-mono text-sm">Free</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-nova-border">
                  <span className="font-display font-bold text-nova-text">Total</span>
                  <span className="font-display font-bold text-2xl text-nova-text">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="nova-btn-primary w-full py-3.5 rounded-xl text-base mb-3"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className="block text-center text-nova-muted hover:text-nova-text text-sm font-body transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;