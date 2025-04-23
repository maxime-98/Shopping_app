const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let adminToken = null;

const products = [
  { name: "Lait demi-écrémé", brand: "Président", category: "Alimentaire" },
  { name: "Pâtes Barilla", brand: "Barilla", category: "Épicerie" },
  { name: "Pain complet", brand: "Harrys", category: "Boulangerie" },
  { name: "Yaourt nature", brand: "Danone", category: "Produits laitiers" },
  { name: "Farine de blé", brand: "Francine", category: "Épicerie" },
  { name: "Beurre doux", brand: "Président", category: "Produits laitiers" },
  { name: "Jus d'orange", brand: "Tropicana", category: "Boissons" },
  { name: "Café moulu", brand: "Lavazza", category: "Épicerie" },
  { name: "Confiture de fraises", brand: "Bonne Maman", category: "Épicerie" },
  { name: "Œufs bio", brand: "Matines", category: "Alimentaire" }
];

async function loginAsAdmin() {
  try {
    const res = await axios.post(USER_SERVICE_URL, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = res.data.accessToken;
    console.log("🔐 Admin connecté");
  } catch (err) {
    console.error("❌ Connexion admin échouée :", err.response?.data || err.message);
  }
}

function randomPrice(min = 1.0, max = 6.0) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function getAllStores() {
  const res = await axios.get(STORE_SERVICE_URL);
  return res.data;
}

async function importProducts() {
  await loginAsAdmin();
  if (!adminToken) return;

  const stores = await getAllStores();
  if (!stores.length) {
    console.warn("⚠️ Aucun magasin trouvé !");
    return;
  }

  for (const p of products) {
    const selectedStores = stores.sort(() => 0.5 - Math.random()).slice(0, 3); // 3 magasins aléatoires
    const prices = selectedStores.map(store => ({
        storeId: new mongoose.Types.ObjectId(store._id),
        price: randomPrice()
      }));
      

    const productToSend = { ...p, prices };

    try {
      const res = await axios.post(PRODUCT_SERVICE_URL, productToSend, {
        headers: { Authorization: adminToken }
      });
      console.log(`✅ Produit ajouté : ${res.data.name}`);
    } catch (err) {
      console.error(`❌ Échec : ${p.name}`, err.response?.data || err.message);
    }
  }

  console.log("🎉 Import des produits terminé !");
}

importProducts();
