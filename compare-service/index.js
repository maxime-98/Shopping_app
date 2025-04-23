const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const compareRoutes = require('./routes/compareRoutes');

const app = express();
app.use(express.json());

// Ajout de Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint JSON brut (pour gateway)
app.use('/swagger.json', (req, res) => res.json(swaggerSpec));

// Routes principales
app.use('/compare', compareRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Compare Service actif sur le port ${PORT}`);
});
