const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  region: { type: String },
  type: { type: String, enum: ['Supermarché', 'Drive', 'Autre', 'Hypermarché', 'Discount', 'Magasin de surgelés'], default: 'Supermarché' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
