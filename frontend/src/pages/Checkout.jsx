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

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]             = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

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

  // Step 1 — create order in DB
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

  // COD flow
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

  // Online payment — fake flow, no Razorpay modal
  const handleOnlinePayment = async () => {
    // 1. Create order in DB
    const order = await createOrderInDB();

    // 2. Tell backend to create a fake payment order
    await API.post("/payments/create-order", { orderId: order._id });

    // 3. Simulate a 1.5s "processing" delay
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Verify (mark as paid) directly — no gateway needed
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
      <div className="min-h-screen bg-nova-bg pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display font-bold text-3xl text-nova-text mb-4">No items to checkout</h2>
        <Link to="/products" className="nova-btn-primary px-8 py-3 rounded-xl text-base">Browse Products</Link>
      </div>
    );
  }

  const codFee = paymentMethod === "cod" ? 2 : 0;

  return (
    <div className="min-h-screen bg-nova-bg pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-4xl text-nova-text mb-8">Checkout</h1>

        <form onSubmit={handleOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">

              {/* SHIPPING */}
              <div className="nova-card p-6">
                <h2 className="font-display font-semibold text-xl text-nova-text mb-5">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-nova-muted mb-2">First Name</label>
                    <input type="text" name="firstName" value={shipping.firstName} onChange={handleShippingChange}
                      placeholder="John" autoComplete="given-name" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-2">Last Name</label>
                    <input type="text" name="lastName" value={shipping.lastName} onChange={handleShippingChange}
                      placeholder="Doe" autoComplete="family-name" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-2">Email</label>
                    <input type="email" name="email" value={shipping.email} onChange={handleShippingChange}
                      placeholder="you@example.com" autoComplete="email" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-2">Address</label>
                    <input type="text" name="address" value={shipping.address} onChange={handleShippingChange}
                      placeholder="123 Main Street" autoComplete="street-address" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-2">City</label>
                    <input type="text" name="city" value={shipping.city} onChange={handleShippingChange}
                      placeholder="Chennai" autoComplete="address-level2" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-nova-muted mb-2">ZIP Code</label>
                    <input type="text" name="zip" value={shipping.zip} onChange={handleShippingChange}
                      placeholder="600001" autoComplete="postal-code" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-nova-muted mb-2">Country</label>
                    <input type="text" name="country" value={shipping.country} onChange={handleShippingChange}
                      placeholder="India" autoComplete="country-name" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="nova-card p-6">
                <h2 className="font-display font-semibold text-xl text-nova-text mb-5">Payment Method</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        paymentMethod === method.id
                          ? "border-nova-accent bg-nova-accent/10 text-nova-accent"
                          : "border-nova-border bg-nova-surface text-nova-muted"
                      }`}>
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <div className="text-xs">{method.label}</div>
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
                  <div className="space-y-4">
                    <input type="text" name="cardName" value={card.cardName} onChange={handleCardChange}
                      placeholder="Name on Card" autoComplete="cc-name" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                    <input type="text" name="cardNumber" value={card.cardNumber} onChange={handleCardChange}
                      placeholder="4242 4242 4242 4242" autoComplete="cc-number" className="nova-input w-full px-4 py-3 rounded-xl text-sm font-mono tracking-widest" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="expiry" value={card.expiry} onChange={handleCardChange}
                        placeholder="MM/YY" autoComplete="cc-exp" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                      <input type="password" name="cvv" value={card.cvv} onChange={handleCardChange}
                        placeholder="CVV" autoComplete="cc-csc" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <input type="text" value={upi.upiId} onChange={(e) => setUpi({ upiId: e.target.value })}
                    placeholder="yourname@upi" className="nova-input w-full px-4 py-3 rounded-xl text-sm" />
                )}

                {paymentMethod === "netbanking" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BANKS.map((b) => (
                      <button key={b} type="button" onClick={() => setBank({ selectedBank: b })}
                        className={`p-3 rounded-xl border text-left ${
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
                    <p className="text-nova-text font-semibold mb-2">Cash on Delivery</p>
                    <p className="text-sm text-nova-muted">Pay cash after delivery. ₹2 COD fee applies.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Order Summary */}
            <div>
              <div className="nova-card p-6 sticky top-24">
                <h2 className="font-display font-bold text-xl text-nova-text mb-5">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover border border-nova-border" />
                      <div className="flex-1">
                        <p className="text-sm text-nova-text font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-nova-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-nova-text font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-nova-border pt-4 space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span className="text-nova-muted">Subtotal</span>
                    <span className="text-nova-text font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nova-muted">Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span className="text-nova-muted">COD Fee</span>
                      <span className="text-amber-400">$2.00</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-nova-border pt-3 font-bold text-lg">
                    <span className="text-nova-text">Total</span>
                    <span className="text-nova-text">${(cartTotal + codFee).toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="nova-btn-primary w-full py-3.5 rounded-xl text-base disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : paymentMethod === "cod" ? (
                    "Place Order"
                  ) : (
                    "Pay Now"
                  )}
                </button>

                <Link to="/cart" className="block text-center text-sm text-nova-muted hover:text-nova-text mt-4">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;