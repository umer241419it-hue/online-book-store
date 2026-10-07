const mongoose = require('mongoose');
const Book = require('../models/Book');

// Helper to find a book either by MongoDB _id or by custom bookId
const findBookByIdentifier = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Book.findOne({
      $or: [{ _id: id }, { bookId: id }]
    });
  }
  return await Book.findOne({ bookId: id });
};

// @desc    Get all books (with optional search and category filter)
// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Search by title or author (case-insensitive with regex special character escaping)
    if (search && search.trim() !== '') {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { author: { $regex: searchRegex } }
      ];
    }

    // Filter by category (ignoring 'all' or 'all categories')
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all categories') {
      const sanitizedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: new RegExp(`^${sanitizedCategory}$`, 'i') };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID (bookId or MongoDB _id)
// @route   GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await findBookByIdentifier(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with identifier: ${req.params.id}`
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const { bookId, title, author, category, price, quantity, description, image } = req.body;

    // Validate required fields
    if (!bookId || !title || !author || !category || price === undefined || quantity === undefined || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields (bookId, title, author, category, price, quantity, description) are required'
      });
    }

    // Check duplicate bookId
    const existingBook = await Book.findOne({ bookId: bookId.trim() });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with Book ID "${bookId}" already exists`
      });
    }

    const newBook = new Book({
      bookId: bookId.trim(),
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      description: description.trim(),
      image: image ? image.trim() : ''
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    next(error);
  }
};

// @desc    Update book by ID (bookId or MongoDB _id)
// @route   PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const book = await findBookByIdentifier(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with identifier: ${req.params.id}`
      });
    }

    const { bookId, title, author, category, price, quantity, description, image } = req.body;

    // Check if new bookId conflicts with another existing book
    if (bookId && bookId.trim() !== book.bookId) {
      const duplicate = await Book.findOne({ bookId: bookId.trim(), _id: { $ne: book._id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Book ID "${bookId}" is already taken by another book`
        });
      }
      book.bookId = bookId.trim();
    }

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();
    if (price !== undefined) book.price = Number(price);
    if (quantity !== undefined) book.quantity = Number(quantity);
    if (description !== undefined) book.description = description.trim();
    if (image !== undefined) book.image = image ? image.trim() : '';

    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book by ID (bookId or MongoDB _id)
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await findBookByIdentifier(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with identifier: ${req.params.id}`
      });
    }

    await Book.findByIdAndDelete(book._id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      deletedBookId: book.bookId
    });
  } catch (error) {
    next(error);
  }
};
