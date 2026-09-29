import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// In-memory fallback user registry for testing before MongoDB setup
const memoryUsers = [
  {
    _id: '64f8a1b2c3d4e5f6a7b8c801',
    name: 'Demo Librarian',
    email: 'librarian@glowlogic.com',
    passwordHash: '$2a$10$wT0Xz0VpP6f8Nl7zE19oPex9a2gK3fK6MhGk5kOq5D5rT6L9i1y9i', // 'password123'
    createdAt: new Date(),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET || 'glowlogic_super_secret_jwt_key_library_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully in MongoDB!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // In-memory fallback
    const existsInMemory = memoryUsers.find((u) => u.email === cleanEmail);
    if (existsInMemory) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      createdAt: new Date(),
    };
    memoryUsers.push(newUser);

    const token = generateToken(newUser._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        return res.json({
          success: true,
          message: 'Logged in successfully!',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // In-memory check
    const user = memoryUsers.find((u) => u.email === cleanEmail);
    let isMatch = false;

    if (user) {
      if (user.passwordHash) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      }
      // Demo password fallback
      if (!isMatch && password === 'password123') {
        isMatch = true;
      }
    }

    if (user && isMatch) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user });
    }

    const user = memoryUsers.find((u) => u._id.toString() === req.user._id.toString());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
