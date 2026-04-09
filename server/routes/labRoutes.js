const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const tests = await LabTest.find();
  res.json(tests);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const test = await LabTest.create(req.body);
  res.status(201).json(test);
});

module.exports = router;
