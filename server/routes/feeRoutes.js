const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const { protect, adminOnly } = require('../middleware/auth');

// Get all fees
router.get('/', protect, async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new fee
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a fee
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a fee
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
