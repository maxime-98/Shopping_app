const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const mockStores = require('../mockStores.json');

// GET all stores
/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Récupérer tous les magasins
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Liste des magasins
 */
router.get('/', async (req, res) => {
  const stores = await Store.find();
  res.json(stores);
});

// GET one store
/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Récupérer un magasin par ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Magasin trouvé
 *       404:
 *         description: Magasin introuvable
 */
router.get('/:id', async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ error: 'Store not found' });
  res.json(store);
});

// POST (admin)
/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Ajouter un nouveau magasin
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Carrefour Market Paris 15e"
 *               address:
 *                 type: string
 *                 example: "12 Rue de Paris"
 *               city:
 *                 type: string
 *                 example: "Paris"
 *               region:
 *                 type: string
 *                 example: "Île-de-France"
 *               type:
 *                 type: string
 *                 enum: [Supermarché, Hypermarché, Drive, Discount, Autre, Magasin de surgelés]
 *                 example: "Supermarché"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Magasin ajouté
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  const store = new Store(req.body);
  await store.save();
  res.status(201).json(store);
});

// PUT (admin)
/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Modifier un magasin existant
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               type:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Magasin mis à jour
 *       404:
 *         description: Magasin non trouvé
 */
router.put('/:id', async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!store) return res.status(404).json({ error: 'Store not found' });
  res.json(store);
});

// DELETE (admin)
/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Supprimer un magasin
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Magasin supprimé
 *       404:
 *         description: Magasin introuvable
 */
router.delete('/:id', async (req, res) => {
  const store = await Store.findByIdAndDelete(req.params.id);
  if (!store) return res.status(404).json({ error: 'Store not found' });
  res.json({ message: 'Store deleted' });
});

// Route pour importer les magasins de test
/**
 * @swagger
 * /stores/import-mocks:
 *   post:
 *     summary: Importer des magasins fictifs (mock)
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Magasins mock ajoutés
 *       500:
 *         description: Erreur serveur
 */
router.post('/import-mocks', async (req, res) => {
  try {
    await Store.insertMany(mockStores);
    res.json({ message: 'Magasins mock ajoutés avec succès !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
