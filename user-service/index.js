const express = require('express');
const mongoose = require('mongoose');
const { swaggerUi, specs } = require('./swagger');

require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Swagger UI (pour accès direct)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// Swagger JSON (pour centralisation)
app.get('/swagger.json', (req, res) => {
  res.json(specs);
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB (user-service) connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

app.use('/users', userRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`User Service actif sur le port ${PORT}`);
});
