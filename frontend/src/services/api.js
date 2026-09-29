// API Client for Book Library Management System
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth header with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('library_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with clean error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend server is down or CORS failed
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn(`[API] Backend unreachable at ${API_BASE_URL}. Ensure your backend server is running.`);
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the server is started.`);
    }
    throw error;
  }
}

// Auth API methods
export const authApi = {
  signup: async (userData) => {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('library_token', data.token);
      localStorage.setItem('library_user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('library_token', data.token);
      localStorage.setItem('library_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('library_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('library_token');
  },

  logout: () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
  },

  getProfile: async () => {
    return await request('/auth/me');
  },
};

// Books API methods
export const booksApi = {
  getBooks: async ({ search = '', category = 'All', status = 'All', sortBy = 'newest' } = {}) => {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (category && category !== 'All') params.append('category', category);
    if (status && status !== 'All') params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/books${queryString}`);
  },

  getBookById: async (id) => {
    return await request(`/books/${id}`);
  },

  createBook: async (bookData) => {
    return await request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  updateBook: async (id, bookData) => {
    return await request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },

  toggleBookStatus: async (id) => {
    return await request(`/books/${id}/status`, {
      method: 'PATCH',
    });
  },

  deleteBook: async (id) => {
    return await request(`/books/${id}`, {
      method: 'DELETE',
    });
  },

  seedSampleBooks: async () => {
    return await request('/books/seed', {
      method: 'POST',
    });
  },
};

export default {
  auth: authApi,
  books: booksApi,
  API_BASE_URL,
};
