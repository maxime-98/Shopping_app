const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const mockData = require('./mockData.json');

dotenv.config();

const app = express();
app.use(express.json());

let adminToken = null;

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
    adminToken = null; // sécurité
  }
}

app.get('/scrape', async (req, res) => {
  await loginAsAdmin();

  if (!adminToken) {
    return res.status(401).json({
      error: "Échec de la connexion admin. Aucun token reçu."
    });
  }

  const results = [];

  for (const product of mockData) {
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
