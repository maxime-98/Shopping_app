const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /compare
router.post('/', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Liste invalide.' });
  }

  // Dictionnaire : { store: { total: 0, missing: false } }
  const storeTotals = {};

  for (const item of items) {
    try {
      const productRes = await axios.get(`http://product-service:3000/products/${item.productId}`);
      const product = productRes.data;

      const availableStores = product.prices.map(p => p.store);

      for (const priceInfo of product.prices) {
        const totalForItem = priceInfo.price * item.quantity;

        if (!storeTotals[priceInfo.store]) {
          storeTotals[priceInfo.store] = {
            total: 0,
            missing: false
          };
        }

        storeTotals[priceInfo.store].total += totalForItem;
      }

      // Marquer les magasins qui ne vendent PAS ce produit
      for (const store in storeTotals) {
        if (!availableStores.includes(store)) {
          storeTotals[store].missing = true;
        }
      }

    } catch (err) {
      console.error(`Erreur produit ${item.productId}:`, err.message);
      return res.status(500).json({ error: `Erreur produit ${item.productId}` });
    }
  }

  // Construire la réponse : liste des magasins triés
  const rankedStores = Object.entries(storeTotals)
    .map(([store, data]) => ({ store, ...data }))
    .sort((a, b) => a.total - b.total);

  res.json({
    rankedStores,
    cheapestStore: rankedStores[0]?.store || null
  });
});

module.exports = router;
