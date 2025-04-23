const express = require('express');
const mongoose = require('mongoose');
const { swaggerUi, specs } = require('./swagger');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

// Swagger UI + JSON
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get('/swagger.json', (req, res) => res.json(specs)); // ✅ À ajouter

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Routes
app.use('/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Product Service actif sur le port ${PORT}`);
});
