const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: "Token manquant." });

  try {
    const decoded = jwt.verify(token, "supersecretkey123"); // même clé que dans user-service
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide." });
  }
};
