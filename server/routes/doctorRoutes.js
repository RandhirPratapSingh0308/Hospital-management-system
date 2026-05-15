const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json(doctor);
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
