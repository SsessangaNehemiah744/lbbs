/**
 * auth.js — backend-based authentication
 * All credentials stored in MongoDB via the hosted backend.
 * Session (user object only, no password) stored in localStorage.
 *
 * Librarian: tabitha.lib / Lib@Mak2025  (fixed, seeded in DB)
 * Students:  register → saved to DB → login from any device
 */

import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://lbbs-backend.onrender.com/api';
const SESSION_KEY = 'lbbs_session';

function _err(e) {
  return e.response?.data?.error || e.response?.data?.message || e.message || 'An error occurred.';
}

// ── Librarian login ───────────────────────────────────────────────────────────
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

// ── Student login ─────────────────────────────────────────────────────────────
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

// ── Student signup ────────────────────────────────────────────────────────────
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

// ── Session helpers ───────────────────────────────────────────────────────────
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
