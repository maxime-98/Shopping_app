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
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: pass123
 *               role:
 *                 type: string
 *                 enum: [client, admin]
 *                 example: client
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *       400:
 *         description: Erreur de validation
 */
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
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: pass123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Email ou mot de passe invalide
 */
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

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: Nouveau token d'accès généré
 *       403:
 *         description: Token de rafraîchissement invalide
 */

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


/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur (supprimer le refresh token)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       400:
 *         description: Token manquant ou invalide
 */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Token manquant." });

  removeToken(refreshToken); // Supprime le token
  res.json({ message: "Déconnexion réussie." });
});

// ME - Voir ses infos (protégé)
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Récupérer les infos de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *       401:
 *         description: Token invalide ou expiré
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/favorites:
 *   post:
 *     summary: Ajouter un produit aux favoris
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 643c71d8a999b5f9e0a1d2c4
 *     responses:
 *       200:
 *         description: Produit ajouté aux favoris
 *       401:
 *         description: Non autorisé
 */
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

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Obtenir tous les produits favoris de l'utilisateur
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits favoris
 *       401:
 *         description: Non autorisé
 */
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/favorites/{id}:
 *   delete:
 *     summary: Supprimer un produit des favoris
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID du produit à retirer
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit retiré des favoris
 *       401:
 *         description: Non autorisé
 */
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
