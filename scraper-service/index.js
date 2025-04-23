const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const mockData = require('./mockData.json');

dotenv.config();

const app = express();
app.use(express.json());

let adminToken = null;
let storeMap = {};

// 🔐 Connexion admin
async function loginAsAdmin() {
  try {
    const res = await axios.post(process.env.USER_SERVICE_URL, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    adminToken = res.data.accessToken;
    console.log("✅ Token reçu :", adminToken);
  } catch (err) {
    console.error("❌ Erreur login admin :", err.response?.data || err.message);
    adminToken = null;
  }
}

// 🏪 Chargement des magasins
async function loadStores() {
  try {
    const res = await axios.get('http://store-service:3005/stores');
    for (const store of res.data) {
      storeMap[store.name] = store._id;
    }
    console.log("✅ Magasins chargés :", Object.keys(storeMap));
  } catch (err) {
    console.error("❌ Erreur lors du chargement des magasins :", err.message);
    storeMap = {};
  }
}

// 🚀 Route de scraping
app.get('/scrape', async (req, res) => {
  await loginAsAdmin();
  await loadStores();

  if (!adminToken) {
    return res.status(401).json({
      error: "Échec de la connexion admin. Aucun token reçu."
    });
  }

  const results = [];

  for (const rawProduct of mockData) {
    const product = { ...rawProduct };

    // Conversion store → storeId
    product.prices = product.prices
      .map(({ store, price }) => {
        const storeId = storeMap[store];
        if (!storeId) {
          console.warn(`⚠️ Magasin non trouvé : ${store}`);
          return null;
        }
        return { storeId, price };
      })
      .filter(Boolean); // retirer ceux qui ont échoué

    try {
      const response = await axios.post(process.env.PRODUCT_SERVICE_URL, product, {
        headers: {
          Authorization: adminToken
        }
      });
      results.push({ name: product.name, status: 'Ajouté', id: response.data._id });
    } catch (err) {
      results.push({
        name: product.name,
        status: 'Erreur',
        error: err.response?.data || err.message
      });
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Scraper Service actif sur le port ${PORT}`);
});
