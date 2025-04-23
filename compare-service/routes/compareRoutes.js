const express = require('express');
const router = express.Router();
const axios = require('axios');

// 🔁 Utilitaire pour récupérer le nom du magasin depuis son ID
async function getStoreName(storeId) {
  try {
    const res = await axios.get(`http://store-service:3005/stores/${storeId}`);
    return res.data.name;
  } catch {
    return "Magasin inconnu";
  }
}

// ✅ ROUTE 1 : /compare (avec enrichissement des noms)
/**
 * @swagger
 * /compare:
 *   post:
 *     summary: Compare les prix d'une liste de produits dans différents magasins
 *     tags: [Compare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Magasins triés selon le prix total
 */
router.post('/', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Liste invalide.' });
  }

  const storeTotals = {};

  for (const item of items) {
    try {
      const productRes = await axios.get(`http://product-service:3000/products/${item.productId}`);
      const product = productRes.data;

      const availableStoreIds = product.prices.map(p => p.storeId?.toString());

      for (const priceInfo of product.prices) {
        const storeId = priceInfo.storeId?.toString();
        const totalForItem = priceInfo.price * item.quantity;

        if (!storeTotals[storeId]) {
          storeTotals[storeId] = {
            total: 0,
            missing: false
          };
        }

        storeTotals[storeId].total += totalForItem;
      }

      for (const storeId in storeTotals) {
        if (!availableStoreIds.includes(storeId)) {
          storeTotals[storeId].missing = true;
        }
      }

    } catch (err) {
      console.error(`Erreur produit ${item.productId}:`, err.message);
      return res.status(500).json({ error: `Erreur produit ${item.productId}` });
    }
  }

  const rankedStores = await Promise.all(
    Object.entries(storeTotals).map(async ([storeId, data]) => ({
      store: await getStoreName(storeId),
      ...data
    }))
  );

  rankedStores.sort((a, b) => a.total - b.total);

  res.json({
    rankedStores,
    cheapestStore: rankedStores[0]?.store || null
  });
});

// ✅ ROUTE 2 : /compare/intelligent (affiche économie)
/**
 * @swagger
 * /compare/intelligent:
 *   post:
 *     summary: Compare les magasins et affiche l'économie potentielle
 *     tags: [Compare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Résumé avec économie et magasin le moins cher
 */
router.post('/intelligent', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid list format.' });
  }

  const storeTotals = {};

  try {
    for (const item of items) {
      const productRes = await axios.get(`http://product-service:3000/products/${item.productId}`);
      const product = productRes.data;

      for (const priceInfo of product.prices) {
        const storeId = priceInfo.storeId?.toString();
        const total = priceInfo.price * item.quantity;

        if (!storeTotals[storeId]) {
          storeTotals[storeId] = 0;
        }

        storeTotals[storeId] += total;
      }
    }

    const storeIds = Object.keys(storeTotals);

    if (storeIds.length === 0) {
      return res.status(404).json({ error: "No store data found." });
    }

    const cheapestId = storeIds.reduce((min, curr) =>
      storeTotals[curr] < storeTotals[min] ? curr : min
    );
    const mostExpensiveId = storeIds.reduce((max, curr) =>
      storeTotals[curr] > storeTotals[max] ? curr : max
    );

    const storeNames = {};
    for (const id of storeIds) {
      storeNames[id] = await getStoreName(id);
    }

    const response = {
      bestStore: storeNames[cheapestId],
      cheapestTotal: parseFloat(storeTotals[cheapestId].toFixed(2)),
      mostExpensiveTotal: parseFloat(storeTotals[mostExpensiveId].toFixed(2)),
      youSave: parseFloat((storeTotals[mostExpensiveId] - storeTotals[cheapestId]).toFixed(2)),
      storeTotals: Object.fromEntries(
        storeIds.map(id => [storeNames[id], parseFloat(storeTotals[id].toFixed(2))])
      )
    };

    res.json(response);
  } catch (err) {
    console.error("Compare intelligent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
