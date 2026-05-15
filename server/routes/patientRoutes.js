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
  updateBillItem,
  deleteBillItem,
  updateLabTest,
  deleteLabTest,
  updateDoctorVisit,
  deleteDoctorVisit,
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

// Update/Delete Bill Items
router.patch('/:id/bill-item/:itemId', protect, updateBillItem);
router.delete('/:id/bill-item/:itemId', protect, deleteBillItem);

// Update/Delete Lab Tests
router.patch('/:id/lab/:labId', protect, updateLabTest);
router.delete('/:id/lab/:labId', protect, deleteLabTest);

// Update/Delete Doctor Visits
router.patch('/:id/doctor-visit/:visitId', protect, updateDoctorVisit);
router.delete('/:id/doctor-visit/:visitId', protect, deleteDoctorVisit);

router.post('/:id/discharge', protect, dischargePatient);
router.post('/:id/re-admit', protect, reAdmitPatient);

// New: Admitted patients list
const Patient = require('../models/Patient');
router.get('/admitted', protect, async (req, res) => {
  const patients = await Patient.find({ status: 'Admitted', isIPD: true })
    .populate('consultantDoctor')
    .populate('ipdDetails.doctorVisits.doctor')
    .populate('receivedBy', 'name');
  res.json(patients);
});

router.get('/discharged', protect, getDischargedPatients);

module.exports = router;
