const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // JWT
const checkRole = require('../middleware/checkRole'); // Rôle

// GET all products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET one product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit introuvable" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product
router.post('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE all products (⚠️ pour les tests)
router.delete('/', async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: 'Tous les produits ont été supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
