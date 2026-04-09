const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  contact: { type: String },
  opdFee: { type: Number, required: true },
  ipdVisitFee: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
