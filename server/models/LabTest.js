const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  normalRange: { type: String },
  unit: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', LabTestSchema);
