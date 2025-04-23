const express = require('express');
const mongoose = require('mongoose');
const { swaggerUi, specs } = require('./swagger');
const dotenv = require('dotenv');
dotenv.config();

const storeRoutes = require('./routes/storeRoutes');

const app = express();
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// ✅ Route JSON pour le gateway
app.get('/swagger.json', (req, res) => res.json(specs));

app.use('/stores', storeRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🏪 Store-service running on port ${PORT}`);
});
