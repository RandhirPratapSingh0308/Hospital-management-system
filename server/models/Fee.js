const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Room', 'Service', 'Other'], 
    default: 'Service' 
  },
  rate: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Fee', FeeSchema);
