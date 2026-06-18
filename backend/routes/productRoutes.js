const express = require("express");

const router = express.Router();

// Controllers
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Middleware
const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// ================= ADMIN ROUTES =================

// Create product
router.post("/", protect, admin, createProduct);

// Update product
router.put("/:id", protect, admin, updateProduct);

// Delete product
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;