const express = require('express');
const router = express.Router();
const axios = require('axios');
const ShoppingList = require('../models/ShoppingList');
const auth = require('../middleware/auth');

// GET all lists with product info
/**
 * @swagger
 * /lists:
 *   get:
 *     summary: Récupérer toutes les listes de l'utilisateur connecté
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listes récupérées avec succès
 *       401:
 *         description: Non autorisé
 */
router.get('/', auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.user.id });

    // Facultatif : enrichir avec les produits comme avant
    const enrichedLists = await Promise.all(lists.map(async (list) => {
      const enrichedItems = await Promise.all(list.items.map(async (item) => {
        try {
          const productRes = await axios.get(`http://product-service:3000/products/${item.productId}`);
          return {
            ...item.toObject(),
            product: productRes.data
          };
        } catch (err) {
          return {
            ...item.toObject(),
            product: null,
            error: 'Produit introuvable'
          };
        }
      }));

      return {
        ...list.toObject(),
        items: enrichedItems
      };
    }));

    res.json(enrichedLists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new shopping list
/**
 * @swagger
 * /lists:
 *   post:
 *     summary: Créer une nouvelle liste de courses
 *     tags: [Lists]
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
 *               - items
 *             properties:
 *               name:
 *                 type: string
 *                 example: Courses de la semaine
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 661fc1abc1d4f1234567890a
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Liste créée
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, async (req, res) => {
  try {
    const listData = req.body;
    listData.userId = req.user.id; // Ajoute l’ID de l’utilisateur automatiquement

    const list = new ShoppingList(listData);
    const saved = await list.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /lists/{id}:
 *   delete:
 *     summary: Supprimer une liste spécifique
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la liste
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste supprimée
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Liste introuvable
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: "Liste introuvable" });
    }

    if (list.userId !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé à supprimer cette liste" });
    }

    await list.deleteOne();
    res.json({ message: "Liste supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔁 Historique = toutes les listes de l'utilisateur, même anciennes
/**
 * @swagger
 * /lists/history:
 *   get:
 *     summary: Récupérer l'historique des listes de l'utilisateur
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
 *       401:
 *         description: Non autorisé
 */
router.get('/history', auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /lists/{id}/archive:
 *   patch:
 *     summary: Archiver une liste
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la liste
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste archivée
 *       404:
 *         description: Liste introuvable ou non autorisée
 */
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list || list.userId !== req.user.id) {
      return res.status(404).json({ error: "Liste introuvable ou non autorisée" });
    }

    list.archived = true;
    await list.save();

    res.json({ message: "Liste archivée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /lists/{id}/duplicate:
 *   post:
 *     summary: Dupliquer une liste existante
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la liste à dupliquer
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Nouvelle liste dupliquée
 *       404:
 *         description: Liste introuvable ou non autorisée
 */
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalList = await ShoppingList.findById(req.params.id);
    if (!originalList || originalList.userId !== req.user.id) {
      return res.status(404).json({ error: "Liste introuvable ou non autorisée" });
    }

    const newList = new ShoppingList({
      userId: req.user.id,
      name: originalList.name + " (copie)",
      items: originalList.items
    });

    const saved = await newList.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all shopping lists (⚠️ à n’utiliser que pour les tests)
/**
 * @swagger
 * /lists:
 *   delete:
 *     summary: Supprimer toutes les listes (tests uniquement)
 *     tags: [Lists]
 *     responses:
 *       200:
 *         description: Toutes les listes supprimées
 *       500:
 *         description: Erreur serveur
 */
router.delete('/', async (req, res) => {
  try {
    await ShoppingList.deleteMany({});
    res.json({ message: 'Toutes les listes ont été supprimées' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
