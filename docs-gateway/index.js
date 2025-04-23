const express = require('express');
const swaggerUi = require('swagger-ui-express');
const loadAndMerge = require('./swaggerLoader');

const app = express();

// Route qui retourne le JSON fusionné
app.get('/swagger.json', async (req, res) => {
  const merged = await loadAndMerge();
  res.json(merged);
});

// Swagger UI centralisé
app.use('/docs', swaggerUi.serve, async (req, res, next) => {
  const merged = await loadAndMerge();
  return swaggerUi.setup(merged)(req, res, next);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`📘 Swagger centralisé sur http://localhost:${PORT}/docs`);
});
