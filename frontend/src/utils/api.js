import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor: normalise errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Books ─────────────────────────────────────────────────────────────
export const addBook = (data) => api.post('/books', data);
export const getBooks = (q = '') => api.get(`/books${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const getBook = (bookId) => api.get(`/books/${bookId}`);
export const updateBook = (bookId, data) => api.put(`/books/${bookId}`, data);
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`);

// ── Members ───────────────────────────────────────────────────────────
export const addMember = (data) => api.post('/members', data);
export const getMembers = (q = '') => api.get(`/members${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const getMember = (memberId) => api.get(`/members/${memberId}`);
export const deleteMember = (memberId) => api.delete(`/members/${memberId}`);

// ── Borrows ───────────────────────────────────────────────────────────
export const borrowBook = (data) => api.post('/borrows/borrow', data);
export const returnBook = (data) => api.post('/borrows/return', data);
export const getMemberBorrows = (memberId) => api.get(`/borrows/member/${memberId}`);

export default api;
