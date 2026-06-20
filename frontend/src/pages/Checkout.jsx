import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { id: "card",       label: "Credit / Debit Card", icon: "💳" },
  { id: "upi",        label: "UPI",                 icon: "📱" },
  { id: "netbanking", label: "Net Banking",          icon: "🏦" },
  { id: "cod",        label: "Cash on Delivery",     icon: "💵" },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

// Inline style applied to every text input so the typed value is always
// readable regardless of what background color the shared `.nova-input`
// class applies (fixes "invisible text" when the input bg is light).
const inputTextStyle = { color: "#10131c", caretColor: "#10131c" };

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]             = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [step, setStep]                   = useState(1); // mobile step: 1=shipping, 2=payment

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName:  user?.name?.split(" ")[1] || "",
    email:     user?.email || "",
    address:   "",
    city:      "",
    zip:       "",
    country:   "",
  });

  const [card, setCard] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [upi,  setUpi]  = useState({ upiId: "" });
  const [bank, setBank] = useState({ selectedBank: "" });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 4);
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const required = ["firstName", "lastName", "email", "address", "city", "zip", "country"];
    for (const f of required) {
      if (!shipping[f]?.trim()) { toast.error("Please fill in all shipping details"); return false; }
    }
    if (!/^\S+@\S+\.\S+$/.test(shipping.email)) { toast.error("Enter a valid email"); return false; }
    if (!/^\d{4,10}$/.test(shipping.zip))        { toast.error("Enter a valid ZIP code"); return false; }

    if (paymentMethod === "card") {
      const digits = card.cardNumber.replace(/\s/g, "");
      if (!card.cardName.trim())         { toast.error("Enter name on card"); return false; }
      if (!/^\d{16}$/.test(digits))      { toast.error("Enter valid 16-digit card number"); return false; }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) { toast.error("Enter valid expiry MM/YY"); return false; }
      if (!/^\d{3,4}$/.test(card.cvv))  { toast.error("Enter valid CVV"); return false; }
    }
    if (paymentMethod === "upi") {
      if (!/^[\w.-]+@[\w]+$/.test(upi.upiId)) { toast.error("Enter valid UPI ID"); return false; }
    }
    if (paymentMethod === "netbanking") {
      if (!bank.selectedBank) { toast.error("Please select a bank"); return false; }
    }
    return true;
  };

  const createOrderInDB = async () => {
    const orderItems = cartItems.map((item) => ({
      product:  item._id,
      title:    item.title,
      image:    item.image || item.images?.[0] || "",
      price:    item.price,
      quantity: item.quantity,
    }));
    const { data } = await API.post("/orders", {
      items:           orderItems,
      shippingAddress: shipping,
      paymentMethod,
      totalAmount:     cartTotal + (paymentMethod === "cod" ? 2 : 0),
    });
    return data.order;
  };

  const handleCOD = async () => {
    const order = await createOrderInDB();
    clearCart();
    toast.success("🎉 Order placed! Pay on delivery.", {
      duration: 5000,
      style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
    });
    navigate("/orders");
    return order;
  };

  const handleOnlinePayment = async () => {
    const order = await createOrderInDB();
    await API.post("/payments/create-order", { orderId: order._id });
    await new Promise((r) => setTimeout(r, 1500));
    await API.post("/payments/verify", { orderId: order._id });
    clearCart();
    toast.success("🎉 Payment successful! Order confirmed.", {
      duration: 5000,
      style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1e2130" },
    });
    navigate("/orders");
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      if (paymentMethod === "cod") {
        await handleCOD();
      } else {
        await handleOnlinePayment();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-nova-bg pt-20 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-nova-text mb-4">No items to checkout</h2>
        <Link to="/products" className="nova-btn-primary px-8 py-3 rounded-xl text-base">Browse Products</Link>
      </div>
    );
  }

  const codFee = paymentMethod === "cod" ? 2 : 0;

  /* shared input class */
  const inputCls = "nova-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm";

  return (
    <div className="min-h-screen bg-nova-bg pt-16 sm:pt-20 pb-24 sm:pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="pt-4 sm:pt-6 mb-6 sm:mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-nova-text">Checkout</h1>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-3 mt-3 lg:hidden">
            {[{ n: 1, l: "Shipping" }, { n: 2, l: "Payment" }].map(({ n, l }) => (
              <div key={n} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= n ? "bg-nova-accent text-white" : "bg-nova-border text-nova-muted"}`}>{n}</div>
                <span className={`text-xs font-body ${step >= n ? "text-nova-text" : "text-nova-muted"}`}>{l}</span>
                {n < 2 && <svg className="w-3 h-3 text-nova-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
              </div>
            ))}
          </div>
        </div>

        <form id="checkout-form" onSubmit={handleOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

            {/* LEFT — Forms */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* SHIPPING — always visible on desktop, step 1 on mobile */}
              <div className={`nova-card p-4 sm:p-6 ${step !== 1 ? "hidden lg:block" : ""}`}>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="font-display font-semibold text-lg sm:text-xl text-nova-text">Shipping Information</h2>
                  <span className="text-xs text-nova-muted font-body bg-nova-surface border border-nova-border px-2 py-0.5 rounded-full">Step 1</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-nova-muted mb-1.5">First Name</label>
                    <input type="text" name="firstName" value={shipping.firstName} onChange={handleShippingChange}
                      placeholder="John" autoComplete="given-name" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-1.5">Last Name</label>
                    <input type="text" name="lastName" value={shipping.lastName} onChange={handleShippingChange}
                      placeholder="Doe" autoComplete="family-name" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-1.5">Email</label>
                    <input type="email" name="email" value={shipping.email} onChange={handleShippingChange}
                      placeholder="you@example.com" autoComplete="email" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-1.5">Address</label>
                    <input type="text" name="address" value={shipping.address} onChange={handleShippingChange}
                      placeholder="123 Main Street" autoComplete="street-address" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-1.5">City</label>
                    <input type="text" name="city" value={shipping.city} onChange={handleShippingChange}
                      placeholder="Chennai" autoComplete="address-level2" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-1.5">ZIP Code</label>
                    <input type="text" name="zip" value={shipping.zip} onChange={handleShippingChange}
                      placeholder="600001" autoComplete="postal-code" className={inputCls} style={inputTextStyle} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-1.5">Country</label>
                    <input type="text" name="country" value={shipping.country} onChange={handleShippingChange}
                      placeholder="India" autoComplete="country-name" className={inputCls} style={inputTextStyle} />
                  </div>
                </div>

                {/* Mobile next button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="lg:hidden nova-btn-primary w-full py-3 rounded-xl text-sm font-semibold mt-4"
                >
                  Continue to Payment →
                </button>
              </div>

              {/* PAYMENT — always visible on desktop, step 2 on mobile */}
              <div className={`nova-card p-4 sm:p-6 ${step !== 2 ? "hidden lg:block" : ""}`}>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="font-display font-semibold text-lg sm:text-xl text-nova-text">Payment Method</h2>
                  <span className="text-xs text-nova-muted font-body bg-nova-surface border border-nova-border px-2 py-0.5 rounded-full">Step 2</span>
                </div>

                {/* Mobile back */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="lg:hidden text-nova-muted text-xs flex items-center gap-1 mb-4 hover:text-nova-text transition-colors"
                >
                  ← Back to Shipping
                </button>

                {/* Payment method grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 sm:p-4 rounded-xl border transition-all active:scale-95 ${
                        paymentMethod === method.id
                          ? "border-nova-accent bg-nova-accent/10 text-nova-accent"
                          : "border-nova-border bg-nova-surface text-nova-muted"
                      }`}>
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{method.icon}</div>
                      <div className="text-[10px] sm:text-xs leading-snug">{method.label}</div>
                    </button>
                  ))}
                </div>

                {paymentMethod !== "cod" && (
                  <div className="mb-4 p-3 rounded-xl text-xs"
                    style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", color: "#a78bfa" }}>
                    🔒 Demo mode — payment is simulated instantly. No real transaction occurs.
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <input type="text" name="cardName" value={card.cardName} onChange={handleCardChange}
                      placeholder="Name on Card" autoComplete="cc-name" className={inputCls} style={inputTextStyle} />
                    <input type="text" name="cardNumber" value={card.cardNumber} onChange={handleCardChange}
                      placeholder="4242 4242 4242 4242" autoComplete="cc-number" className={`${inputCls} font-mono tracking-widest`} style={inputTextStyle} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="expiry" value={card.expiry} onChange={handleCardChange}
                        placeholder="MM/YY" autoComplete="cc-exp" className={inputCls} style={inputTextStyle} />
                      <input type="password" name="cvv" value={card.cvv} onChange={handleCardChange}
                        placeholder="CVV" autoComplete="cc-csc" className={inputCls} style={inputTextStyle} />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <input type="text" value={upi.upiId} onChange={(e) => setUpi({ upiId: e.target.value })}
                    placeholder="yourname@upi" className={inputCls} style={inputTextStyle} />
                )}

                {paymentMethod === "netbanking" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {BANKS.map((b) => (
                      <button key={b} type="button" onClick={() => setBank({ selectedBank: b })}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${
                          bank.selectedBank === b
                            ? "border-nova-accent bg-nova-accent/10 text-nova-accent"
                            : "border-nova-border bg-nova-surface text-nova-muted"
                        }`}>
                        🏦 {b}
                      </button>
                    ))}
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="p-4 rounded-xl bg-nova-surface border border-nova-border">
                    <p className="text-nova-text font-semibold mb-1 text-sm">Cash on Delivery</p>
                    <p className="text-xs sm:text-sm text-nova-muted">Pay cash after delivery. ₹2 COD fee applies.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Order Summary */}
            <div className="lg:col-span-1">
              <div className="nova-card p-4 sm:p-6 lg:sticky lg:top-20">
                <h2 className="font-display font-bold text-lg sm:text-xl text-nova-text mb-4 sm:mb-5">Order Summary</h2>

                {/* Items — scrollable if many */}
                <div className="space-y-3 mb-4 sm:mb-6 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-2 sm:gap-3">
                      <img src={item.image} alt={item.title}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-nova-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-nova-text font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] sm:text-xs text-nova-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-nova-text font-mono flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-nova-border pt-3 sm:pt-4 space-y-2 mb-4 sm:mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-nova-muted">Subtotal</span>
                    <span className="text-nova-text font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-nova-muted">Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-nova-muted">COD Fee</span>
                      <span className="text-amber-400">$2.00</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-nova-border pt-2 sm:pt-3 font-bold">
                    <span className="text-nova-text">Total</span>
                    <span className="text-nova-text text-lg sm:text-xl">${(cartTotal + codFee).toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="nova-btn-primary w-full py-3 sm:py-3.5 rounded-xl text-sm sm:text-base disabled:opacity-60 flex items-center justify-center gap-2 font-semibold">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : paymentMethod === "cod" ? "Place Order" : "Pay Now"}
                </button>

                <Link to="/cart" className="block text-center text-xs sm:text-sm text-nova-muted hover:text-nova-text mt-3 transition-colors">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </form>

        {/* Mobile sticky submit */}
        {step === 2 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-nova-card/95 backdrop-blur-lg border-t border-nova-border px-4 py-3 z-40">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="flex-1">
                <p className="text-nova-muted text-xs">Total</p>
                <p className="font-bold text-nova-text">${(cartTotal + codFee).toFixed(2)}</p>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="nova-btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : paymentMethod === "cod" ? "Place Order" : "Pay Now →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
