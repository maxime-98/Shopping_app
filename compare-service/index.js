const express = require('express');
require('dotenv').config();

const compareRoutes = require('./routes/compareRoutes');

const app = express();
app.use(express.json());

app.use('/compare', compareRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Compare Service actif sur le port ${PORT}`);
});
