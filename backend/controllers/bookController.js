import mongoose from 'mongoose';
import Book from '../models/Book.js';

// In-memory fallback dataset for seamless offline / initial testing
let memoryBooks = [
  {
    _id: '64f8a1b2c3d4e5f6a7b8c901',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Technology',
    status: 'Available',
    isbn: '978-0132350884',
    description: 'A handbook on agile software craftsmanship and best practices for writing readable, maintainable code.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c902',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    status: 'Issued',
    isbn: '978-0061120084',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c903',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    status: 'Available',
    isbn: '978-0062316097',
    description: 'Explores how an insignificant ape became the ruler of planet Earth.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c904',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    category: 'Technology',
    status: 'Available',
    isbn: '978-0201616224',
    description: 'Your journey to mastery: one of the most significant books on modern software engineering.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c905',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    status: 'Issued',
    isbn: '978-0374533557',
    description: 'A tour of the mind and explains the two systems that drive the way we think.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c906',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    status: 'Available',
    isbn: '978-0735211292',
    description: 'An easy & proven way to build good habits and break bad ones.',
    createdAt: new Date(),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all books with optional search & filter
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const { search, category, status, sortBy } = req.query;

    if (isDbConnected()) {
      let query = {};

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { author: searchRegex },
          { category: searchRegex },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      let sortOptions = { createdAt: -1 };
      if (sortBy === 'title_asc') sortOptions = { title: 1 };
      else if (sortBy === 'title_desc') sortOptions = { title: -1 };
      else if (sortBy === 'author_asc') sortOptions = { author: 1 };
      else if (sortBy === 'oldest') sortOptions = { createdAt: 1 };

      const books = await Book.find(query).sort(sortOptions);
      const totalCount = await Book.countDocuments();
      const availableCount = await Book.countDocuments({ status: 'Available' });
      const issuedCount = await Book.countDocuments({ status: 'Issued' });
      const categories = await Book.distinct('category');

      return res.json({
        success: true,
        count: books.length,
        source: 'mongodb',
        stats: {
          total: totalCount,
          available: availableCount,
          issued: issuedCount,
          categoriesCount: categories.length,
        },
        categories,
        books,
      });
    }

    // In-memory fallback
    let filtered = [...memoryBooks];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((b) => b.category === category);
    }

    if (status && status !== 'All') {
      filtered = filtered.filter((b) => b.status === status);
    }

    if (sortBy === 'title_asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title_desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'author_asc') {
      filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCount = memoryBooks.length;
    const availableCount = memoryBooks.filter((b) => b.status === 'Available').length;
    const issuedCount = memoryBooks.filter((b) => b.status === 'Issued').length;
    const distinctCategories = Array.from(new Set(memoryBooks.map((b) => b.category).filter(Boolean)));

    res.json({
      success: true,
      count: filtered.length,
      source: 'memory_fallback',
      stats: {
        total: totalCount,
        available: availableCount,
        issued: issuedCount,
        categoriesCount: distinctCategories.length,
      },
      categories: distinctCategories,
      books: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({ success: true, book });
    }

    const book = memoryBooks.find((b) => b._id.toString() === req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Public
export const createBook = async (req, res, next) => {
  try {
    const { title, author, category, status, isbn, description } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and author for the book',
      });
    }

    if (isDbConnected()) {
      const newBook = await Book.create({
        title: title.trim(),
        author: author.trim(),
        category: category ? category.trim() : 'General',
        status: status || 'Available',
        isbn: isbn ? isbn.trim() : '',
        description: description ? description.trim() : '',
      });

      return res.status(201).json({
        success: true,
        message: 'Book added successfully!',
        book: newBook,
      });
    }

    // In-memory fallback
    const newBook = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      author: author.trim(),
      category: category ? category.trim() : 'General',
      status: status || 'Available',
      isbn: isbn ? isbn.trim() : '',
      description: description ? description.trim() : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryBooks.unshift(newBook);

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      book: newBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book & toggle status between Available and Issued
// @route   PUT /api/books/:id
// @access  Public
export const updateBook = async (req, res, next) => {
  try {
    const { title, author, category, status, isbn, description } = req.body;

    if (isDbConnected()) {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      if (title !== undefined) book.title = title.trim();
      if (author !== undefined) book.author = author.trim();
      if (category !== undefined) book.category = category.trim();
      if (status !== undefined) book.status = status;
      if (isbn !== undefined) book.isbn = isbn.trim();
      if (description !== undefined) book.description = description.trim();

      const updated = await book.save();
      return res.json({
        success: true,
        message: 'Book updated successfully!',
        book: updated,
      });
    }

    // In-memory update
    const index = memoryBooks.findIndex((b) => b._id.toString() === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    memoryBooks[index] = {
      ...memoryBooks[index],
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(author !== undefined ? { author: author.trim() } : {}),
      ...(category !== undefined ? { category: category.trim() } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(isbn !== undefined ? { isbn: isbn.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'Book updated successfully!',
      book: memoryBooks[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle book status (shortcut for instant status change)
// @route   PATCH /api/books/:id/status
// @access  Public
export const toggleBookStatus = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      book.status = book.status === 'Available' ? 'Issued' : 'Available';
      const updatedBook = await book.save();

      return res.json({
        success: true,
        message: `Book marked as ${updatedBook.status}`,
        book: updatedBook,
      });
    }

    // In-memory toggle
    const index = memoryBooks.findIndex((b) => b._id.toString() === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const currentStatus = memoryBooks[index].status;
    const newStatus = currentStatus === 'Available' ? 'Issued' : 'Available';
    memoryBooks[index].status = newStatus;
    memoryBooks[index].updatedAt = new Date();

    res.json({
      success: true,
      message: `Book marked as ${newStatus}`,
      book: memoryBooks[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Public
export const deleteBook = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      await book.deleteOne();
      return res.json({
        success: true,
        message: 'Book removed successfully',
        id: req.params.id,
      });
    }

    const index = memoryBooks.findIndex((b) => b._id.toString() === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    memoryBooks.splice(index, 1);
    res.json({
      success: true,
      message: 'Book removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample books
// @route   POST /api/books/seed
// @access  Public
export const seedSampleBooks = async (req, res, next) => {
  try {
    const sampleBooks = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Technology',
        status: 'Available',
        isbn: '978-0132350884',
        description: 'A handbook on agile software craftsmanship and best practices for writing readable, maintainable code.',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        status: 'Issued',
        isbn: '978-0061120084',
        description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        status: 'Available',
        isbn: '978-0062316097',
        description: 'Explores how an insignificant ape became the ruler of planet Earth.',
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        category: 'Technology',
        status: 'Available',
        isbn: '978-0201616224',
        description: 'Your journey to mastery: one of the most significant books on modern software engineering.',
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        category: 'Psychology',
        status: 'Issued',
        isbn: '978-0374533557',
        description: 'A tour of the mind and explains the two systems that drive the way we think.',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        status: 'Available',
        isbn: '978-0735211292',
        description: 'An easy & proven way to build good habits and break bad ones.',
      },
    ];

    if (isDbConnected()) {
      const count = await Book.countDocuments();
      if (count === 0) {
        await Book.insertMany(sampleBooks);
      }
      return res.status(201).json({
        success: true,
        message: 'Sample books seeded into MongoDB successfully',
        count: sampleBooks.length,
      });
    }

    // Reset memory collection
    memoryBooks = sampleBooks.map((b) => ({
      ...b,
      _id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date(),
    }));

    res.status(201).json({
      success: true,
      message: 'Sample books reset in memory store',
      count: memoryBooks.length,
    });
  } catch (error) {
    next(error);
  }
};
