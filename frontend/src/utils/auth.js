/**
 * auth.js — backend-based authentication
 * Session is stored in localStorage (just the user object, no sensitive data).
 * All credential checks happen on the backend.
 */

import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://lbbs-backend.onrender.com/api';
const SESSION_KEY = 'lbbs_session';

function _err(e) {
  return e.response?.data?.error || e.response?.data?.message || e.message || 'An error occurred.';
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export async function loginAdmin(username, password) {
  try {
    const res = await axios.post(`${BASE}/auth/login-admin`, { username, password });
    const user = res.data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: _err(e) };
  }
}

export async function loginStudent(studentId, password) {
  try {
    const res = await axios.post(`${BASE}/auth/login-student`, { studentId, password });
    const user = res.data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: _err(e) };
  }
}

export async function signupStudent({ name, studentId, email, password }) {
  try {
    const res = await axios.post(`${BASE}/auth/signup-student`, { name, studentId, email, password });
    const user = res.data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: _err(e) };
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin() {
  return getSession()?.role === 'admin';
}

export function isStudent() {
  return getSession()?.role === 'student';
}
