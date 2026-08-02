// api/auth.js — API client for auth endpoints (Architecture.md §8: POST /api/auth/register, POST /api/auth/login, PATCH /api/auth/role)
import axios from 'axios';

// TODO: create a shared axios instance with baseURL from env and JWT interceptor
// TODO: implement register(email, password) → POST /api/auth/register
// TODO: implement login(email, password) → POST /api/auth/login
// TODO: implement setRole(role) → PATCH /api/auth/role  (excludes 'admin' per FR-2)
