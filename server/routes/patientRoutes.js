const express = require('express');
const router = express.Router();
const { 
  registerOPD, 
  admitIPD, 
  updateStay, 
  addLabTest, 
  dischargePatient, 
  registerDirectLab, 
  getNextUHID,
  getPatientByUHID,
  addBillItem,
  getDischargedPatients,
  reAdmitPatient
} = require('../controllers/PatientController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/next-uhid', protect, getNextUHID);
router.get('/uhid/:uhid', protect, getPatientByUHID);
router.post('/opd', protect, registerOPD);
router.post('/ipd', protect, admitIPD);
router.post('/direct-lab', protect, registerDirectLab);
router.patch('/:id/stay', protect, updateStay);
router.patch('/:id/lab', protect, addLabTest);
router.post('/:id/bill-item', protect, addBillItem);
router.post('/:id/discharge', protect, dischargePatient);
router.post('/:id/re-admit', protect, reAdmitPatient);

// New: Admitted patients list
const Patient = require('../models/Patient');
router.get('/admitted', protect, async (req, res) => {
  const patients = await Patient.find({ status: 'Admitted', isIPD: true }).populate('consultantDoctor');
  res.json(patients);
});

router.get('/discharged', protect, getDischargedPatients);

module.exports = router;
