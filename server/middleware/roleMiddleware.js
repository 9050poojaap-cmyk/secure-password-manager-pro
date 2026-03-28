function requireRole(...allowed) {
  return (req, res, next) => {
    if (req.decoySession) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const role = req.user?.role || 'citizen';
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  };
}

module.exports = { requireRole };
