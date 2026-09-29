import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Book author is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Book category is required'],
      trim: true,
      default: 'General',
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Issued'],
        message: '{VALUE} is not a valid status. Allowed values are Available or Issued',
      },
      default: 'Available',
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add index on title and author for fast text search
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;
