const Payment = require("../models/Payment");
const Order   = require("../models/Order");

// ── POST /api/payments/create-order ─────────────────────────────
// Simulates creating a payment order (no real gateway)
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ success: false, message: "Order already paid" });

    // Return a fake razorpay-shaped response
    res.status(200).json({
      success:         true,
      razorpayOrderId: `fake_order_${Date.now()}`,
      amount:          Math.round(order.totalAmount * 100),
      currency:        "INR",
      keyId:           "fake_key",
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/payments/verify ────────────────────────────────────
// Simulates payment verification — always succeeds
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId)
      return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Mark order as paid
    order.paymentStatus = "paid";
    order.paidAt        = new Date();
    order.status        = "processing";
    await order.save();

    // Save payment record
    const payment = await Payment.create({
      user:          req.user._id,
      order:         orderId,
      amount:        order.totalAmount,
      paymentMethod: order.paymentMethod,
      transactionId: `fake_txn_${Date.now()}`,
      status:        "success",
      paidAt:        new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      payment,
      order,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/payments/my ─────────────────────────────────────────
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/payments/all (admin) ────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user", "name email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
};