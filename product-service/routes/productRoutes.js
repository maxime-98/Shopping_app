const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // JWT
const checkRole = require('../middleware/checkRole'); // Rôle

// GET all products (enrichis avec les magasins)
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtenir la liste des produits (avec les infos magasins)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste des produits avec leurs prix et magasins associés
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    const enrichedProducts = await Promise.all(products.map(async (product) => {
      const enrichedPrices = await Promise.all(product.prices.map(async (entry) => {
        try {
          const storeId = entry.storeId;
          const storeRes = await axios.get(`http://store-service:3005/stores/${storeId}`);
          return {
            store: storeRes.data,
            price: entry.price
          };
        } catch (err) {
          return {
            store: null,
            price: entry.price,
            error: "Store not found"
          };
        }
      }));

      return {
        ...product.toObject(),
        prices: enrichedPrices
      };
    }));

    res.json(enrichedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one product by ID (enrichi avec les magasins)
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtenir un produit par ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du produit avec prix par magasin
 *       404:
 *         description: Produit introuvable
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit introuvable" });

    const enrichedPrices = await Promise.all(product.prices.map(async (entry) => {
      try {
        const storeRes = await axios.get(`http://store-service:3005/stores/${entry.storeId}`);
        return {
          store: storeRes.data,
          price: entry.price
        };
      } catch (err) {
        return {
          store: null,
          price: entry.price,
          error: "Store not found"
        };
      }
    }));

    res.json({
      ...product.toObject(),
      prices: enrichedPrices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Créer un nouveau produit (admin uniquement)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - prices
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pâtes Barilla"
 *               brand:
 *                 type: string
 *                 example: "Barilla"
 *               category:
 *                 type: string
 *                 example: "Épicerie"
 *               prices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     storeId:
 *                       type: string
 *                       example: 661feb1234abcd567890
 *                     price:
 *                       type: number
 *                       example: 1.99
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Accès non autorisé
 */
router.post('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const { prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ error: "Prices must be a non-empty array." });
    }

    // Tolérer les erreurs de vérification, ne pas bloquer
    const checkedPrices = [];

    for (const entry of prices) {
      const storeId = entry.storeId;
      try {
        await axios.get(`http://store-service:3005/stores/${storeId}`);
        checkedPrices.push(entry);
      } catch (err) {
        console.warn(`⚠️ Store ${storeId} introuvable, mais on continue.`);
        checkedPrices.push(entry);
      }
    }

    const product = new Product({ ...req.body, prices: checkedPrices });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE all products (⚠️ pour les tests uniquement)
/**
 * @swagger
 * /products:
 *   delete:
 *     summary: Supprimer tous les produits (⚠️ uniquement pour les tests)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Tous les produits ont été supprimés
 *       500:
 *         description: Erreur serveur
 */
router.delete('/', async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: 'Tous les produits ont été supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
