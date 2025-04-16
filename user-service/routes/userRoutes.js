const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { isValidToken, addToken, removeToken } = require('../utils/tokens');

const router = express.Router();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });


// REGISTER - Créer un compte
router.post('/register', async (req, res) => {
  const { email, password, role = 'client' } = req.body; // 👈 rôle par défaut

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Utilisateur déjà inscrit." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "Inscription réussie !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN - Se connecter
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email incorrect." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect." });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    addToken(refreshToken); // Ajoute dans la liste

    res.json({ accessToken, refreshToken });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Token manquant." });

  if (!isValidToken(refreshToken)) return res.status(403).json({ error: "Token invalide ou expiré." });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: "Refresh token invalide." });
  }
});

router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Token manquant." });

  removeToken(refreshToken); // Supprime le token
  res.json({ message: "Déconnexion réussie." });
});

// ME - Voir ses infos (protégé)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/favorites', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({ message: "Ajouté aux favoris." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/favorites/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: "Retiré des favoris." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
