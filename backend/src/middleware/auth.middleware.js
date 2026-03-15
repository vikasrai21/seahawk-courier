// src/middleware/auth.middleware.js — JWT auth + role-based guards
const jwt    = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const R      = require('../utils/response');

// ── Verify access token ───────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // 1. Try Authorization header (Bearer token) — API clients
    // 2. Fall back to httpOnly cookie — browser clients
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return R.unauthorized(res, 'Authentication required.');

    // Verify signature + expiry
    const decoded = jwt.verify(token, config.jwt.secret);

    // Confirm user still exists and is active (not deactivated since token was issued)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, branch: true, active: true },
    });

    if (!user)        return R.unauthorized(res, 'User no longer exists.');
    if (!user.active) return R.unauthorized(res, 'Account is deactivated. Contact admin.');

    req.user = user;
    next();
  } catch (err) {
    // Let JWT errors bubble to global handler for consistent response
    next(err);
  }
};

// ── Role-based guards ─────────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user)                    return R.unauthorized(res);
  if (!roles.includes(req.user.role)) return R.forbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
  next();
};

const adminOnly    = requireRole('ADMIN');
const staffOrAdmin = requireRole('STAFF', 'ADMIN');

module.exports = { protect, requireRole, adminOnly, staffOrAdmin };
