const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes for all users: Browse and view book details
// Protected routes for authenticated admin: Create, Update, Delete books
router.route('/')
  .get(getBooks)
  .post(protectAdmin, createBook);

router.route('/:id')
  .get(getBookById)
  .put(protectAdmin, updateBook)
  .delete(protectAdmin, deleteBook);

module.exports = router;
