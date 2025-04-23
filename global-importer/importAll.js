const axios = require('axios');
require('dotenv').config();

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL;

const BRANDS = ["Carrefour", "Leclerc", "Intermarché", "Auchan", "Lidl", "Monoprix"];

async function getStoresFromOSM(brand) {
  /*const query = `
    [out:json][timeout:25];
    area["name"="France"]->.searchArea;
    (
      node["name"~"${brand}", i](area.searchArea);
      way["name"~"${brand}", i](area.searchArea);
      relation["name"~"${brand}", i](area.searchArea);
    );
    out center;
  `;*/
  const query = `
  [out:json][timeout:25];
  node(48.80,2.25,48.90,2.45)["name"~"${brand}", i];
  out center;
    `;

  try {
    const res = await axios.post(OVERPASS_API, `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return res.data.elements;
  } catch (err) {
    console.error(`❌ Erreur OSM pour ${brand} :`, err.message);
    return [];
  }
}

function convertToStore(entry, brand) {
  return {
    name: entry.tags?.name || brand,
    address: entry.tags?.['addr:street'] || 'Adresse inconnue',
    city: entry.tags?.['addr:city'] || 'Ville inconnue',
    region: 'France',
    type: 'Supermarché'
  };
}

async function importStores() {
  for (const brand of BRANDS) {
    const elements = await getStoresFromOSM(brand);
    const stores = elements.map(e => convertToStore(e, brand));

    for (const store of stores) {
      try {
        await axios.post(STORE_SERVICE_URL, store);
        console.log(`✅ ${store.name} ajouté (${store.city})`);
      } catch (err) {
        console.warn(`⚠️ ${store.name} échoué :`, err.response?.data || err.message);
      }
    }

    console.log(`🎉 Fini pour ${brand} – total : ${stores.length}`);
  }
}

importStores();
