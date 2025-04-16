module.exports = (requiredRole) => {
    return (req, res, next) => {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ error: "Accès refusé : rôle insuffisant." });
      }
      next();
    };
  };
  