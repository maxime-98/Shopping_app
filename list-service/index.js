const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const listRoutes = require('./routes/listRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB (list-service) connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

app.use('/lists', listRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`List Service actif sur le port ${PORT}`);
});
