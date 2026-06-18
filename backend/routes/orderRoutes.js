const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

// ── Static named routes MUST come before /:id params ──
router.get("/", protect, admin, getAllOrders);
router.get("/my",           protect,        getMyOrders);      // GET  /api/orders/my
router.get("/all",          protect, admin, getAllOrders);      // GET  /api/orders/all  (admin)

// ── Param routes ──
router.post("/",            protect,        createOrder);      // POST /api/orders
router.get("/:id",          protect,        getOrderById);     // GET  /api/orders/:id
router.put("/:id/status",   protect, admin, updateOrderStatus);// PUT  /api/orders/:id/status
router.put("/:id/cancel",   protect,        cancelOrder);      // PUT  /api/orders/:id/cancel

module.exports = router;