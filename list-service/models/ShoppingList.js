const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Id fictif pour l'instant
  name: { type: String, required: true }, // nom de la liste : "Courses du weekend"
  items: [
    {
      productId: String,   // id du produit (du Product Service)
      quantity: Number
    }
  ],
  archived: { type: Boolean, default: false },
  copiedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList', default: null }
}, { timestamps: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
