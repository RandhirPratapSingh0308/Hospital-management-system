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

module.exports = router;
