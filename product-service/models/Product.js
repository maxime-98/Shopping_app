const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  prices: [
    {
      store: { type: String, required: true }, // Ex: Carrefour, Lidl
      price: { type: Number, required: true },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
