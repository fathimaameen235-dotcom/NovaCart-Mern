const express = require("express");
const router = express.Router();

const {
  register,
  login,
  adminRegister,
  adminLogin,
  getProfile,
  getAllUsers,
  deleteUser,
  getAllOrders,
} = require("../controllers/authController");

const { protect, admin } = require("../middleware/authMiddleware");

// ── User auth ──
router.post("/register", register);
router.post("/login",    login);

// ── Admin auth ──
router.post("/admin/register", adminRegister); // ✅ middleware remove - controller handles it
router.post("/admin/login",    adminLogin);

// ── Profile ──
router.get("/profile", protect, getProfile);

// ── Admin only ──
router.get("/users",        protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);
router.get("/orders",       protect, admin, getAllOrders);

module.exports = router;