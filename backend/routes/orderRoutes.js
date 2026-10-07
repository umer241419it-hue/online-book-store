const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public route to place orders from customer checkout
router.post('/', createOrder);

// Protected Admin routes for tracking & managing orders
router.get('/', protectAdmin, getAllOrders);
router.get('/stats', protectAdmin, getOrderStats);
router.get('/:id', protectAdmin, getOrderById);
router.patch('/:id/status', protectAdmin, updateOrderStatus);
router.delete('/:id', protectAdmin, deleteOrder);

module.exports = router;
