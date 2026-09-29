import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  toggleBookStatus,
  deleteBook,
  seedSampleBooks,
} from '../controllers/bookController.js';

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(createBook);

router.post('/seed', seedSampleBooks);

router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

router.patch('/:id/status', toggleBookStatus);

export default router;
