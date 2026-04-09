const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const LabTest = require('../models/LabTest');

// Helper to calculate bill
const calculateIPDBill = (patient) => {
  const { ipdDetails } = patient;
  const roomCharges = (ipdDetails.daysInRoom || 0) * (ipdDetails.roomRate || 0);
  const doctorCharges = ipdDetails.doctorVisits.reduce((acc, v) => acc + (v.count * v.feePerVisit), 0);
  const oxygenCharges = (ipdDetails.oxygenUsage.hours || 0) * (ipdDetails.oxygenUsage.ratePerHour || 0);
  const labCharges = ipdDetails.labTests.reduce((acc, t) => acc + t.price, 0);
  const itemsCharges = (ipdDetails.billItems || []).reduce((acc, item) => acc + (item.total || 0), 0);

  const subTotal = roomCharges + doctorCharges + oxygenCharges + labCharges + itemsCharges;
  const grandTotal = subTotal - (patient.billing.discount || 0);
  const totalPaid = (ipdDetails.advancePaid || 0) + (ipdDetails.additionalPayments || 0);

  return {
    totalRoomCharges: roomCharges,
    totalDoctorCharges: doctorCharges,
    totalOxygenCharges: oxygenCharges,
    totalLabCharges: labCharges,
    grandTotal,
    totalPaid,
    dueAmount: grandTotal - totalPaid
  };
};

const registerOPD = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.body.consultantDoctor);
    const patient = await Patient.create({
      ...req.body,
      opdFee: doctor.opdFee,
      isIPD: false
    });
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const admitIPD = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.body.consultantDoctor);
    const patient = await Patient.create({
      ...req.body,
      isIPD: true,
      status: 'Admitted',
      ipdDetails: {
        admissionDate: new Date(),
        roomType: req.body.roomType,
        roomRate: req.body.roomRate, // Passed from frontend based on roomType
        advancePaid: req.body.advancePaid,
        doctorVisits: [{ doctor: doctor._id, count: 1, feePerVisit: doctor.ipdVisitFee }]
      }
    });
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStay = async (req, res) => {
  const { id } = req.params;
  const { daysInRoom, oxygenHours, additionalPayments, discount, discountAuthorizedBy } = req.body;
  
  try {
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (daysInRoom !== undefined) patient.ipdDetails.daysInRoom = daysInRoom;
    if (oxygenHours !== undefined) patient.ipdDetails.oxygenUsage.hours = oxygenHours;
    if (additionalPayments !== undefined) patient.ipdDetails.additionalPayments += additionalPayments;
    if (discount !== undefined) patient.billing.discount = discount;
    if (discountAuthorizedBy !== undefined) patient.billing.discountAuthorizedBy = discountAuthorizedBy;

    const billing = calculateIPDBill(patient);
    patient.billing = { ...patient.billing, ...billing };
    
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addLabTest = async (req, res) => {
  const { id } = req.params;
  const { testId } = req.body;
  try {
    const patient = await Patient.findById(id);
    const test = await LabTest.findById(testId);
    
    patient.ipdDetails.labTests.push({
      testId: test._id,
      testName: test.name,
      price: test.price
    });

    const billing = calculateIPDBill(patient);
    patient.billing = { ...patient.billing, ...billing };
    
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const dischargePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findById(id);
    const billing = calculateIPDBill(patient);
    
    if (billing.dueAmount > 0) {
      return res.status(400).json({ message: 'Cannot discharge: Due amount must be zero' });
    }

    patient.status = 'Discharged';
    await patient.save();
    res.json({ message: 'Patient discharged successfully', patient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerDirectLab = async (req, res) => {
  const { patientName, contact, testId, amount, uhid, address, city, state } = req.body;
  try {
    const test = await LabTest.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    let patient = await Patient.findOne({ uhid });

    if (patient) {
      // Update existing patient info
      patient.name = patientName;
      patient.contact = contact;
      patient.address = address;
      patient.city = city;
      patient.state = state;
      
      // Add lab test to history
      patient.ipdDetails.labTests.push({
        testId: test._id,
        testName: test.name,
        price: amount,
        date: new Date()
      });

      // For walk-in, we just want to mark this specific test as paid
      // Given the current structure, we might just update the billing.totalLabCharges
      // but if they were already in the system, we don't want to mess with their IPD bill.
      // However, the user's current 'direct-lab' logic seems to create a separate "Patient" entry for each walk-in.
      // If we use the SAME UHID, we have to decide if we want to reuse the same record.
      // If I reuse the record, I'll just append to labTests and adjust totalLabCharges.
      patient.billing.totalLabCharges = (patient.billing.totalLabCharges || 0) + amount;
      patient.billing.grandTotal = (patient.billing.grandTotal || 0) + amount;
      patient.billing.totalPaid = (patient.billing.totalPaid || 0) + amount;
      patient.billing.dueAmount = 0;
      patient.status = 'Paid'; // Mark as paid for this walk-in
      
      await patient.save();
    } else {
      // Create new patient for walk-in with the provided UHID
      patient = await Patient.create({
        uhid,
        name: patientName,
        contact: contact,
        address: address,
        city: city,
        state: state,
        isIPD: false,
        status: 'Paid',
        ipdDetails: {
          labTests: [{
            testId: test._id,
            testName: test.name,
            price: amount,
            date: new Date()
          }]
        },
        billing: {
          totalRoomCharges: 0,
          totalDoctorCharges: 0,
          totalOxygenCharges: 0,
          totalLabCharges: amount,
          grandTotal: amount,
          totalPaid: amount,
          dueAmount: 0
        }
      });
    }

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPatientByUHID = async (req, res) => {
  const { uhid } = req.params;
  try {
    const patient = await Patient.findOne({ uhid });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNextUHID = async (req, res) => {
  try {
    // Find the latest patient with UHID starting with PT-
    const lastPatient = await Patient.findOne({ uhid: /^PT-/ }).sort({ createdAt: -1 });
    
    if (!lastPatient) {
      return res.json({ nextUHID: 'PT-001' });
    }

    const lastUHID = lastPatient.uhid;
    const parts = lastUHID.split('-');
    
    if (parts.length < 2) {
      return res.json({ nextUHID: 'PT-001' });
    }

    const currentNumber = parseInt(parts[1]);
    const nextNumber = isNaN(currentNumber) ? 1 : currentNumber + 1;
    const nextUHID = `PT-${nextNumber.toString().padStart(3, '0')}`;
    
    res.json({ nextUHID });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBillItem = async (req, res) => {
  const { id } = req.params;
  const { type, unit, amount } = req.body;
  try {
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.ipdDetails.billItems.push({
      type,
      unit,
      amount,
      total: unit * amount
    });

    const billing = calculateIPDBill(patient);
    patient.billing = { ...patient.billing, ...billing };

    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDischargedPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'Discharged' }).populate('consultantDoctor');
    res.json(patients);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reAdmitPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.status = 'Admitted';
    await patient.save();
    res.json({ message: 'Patient re-admitted successfully', patient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  registerOPD, 
  admitIPD, 
  updateStay, 
  addLabTest, 
  dischargePatient, 
  registerDirectLab, 
  calculateIPDBill, 
  getNextUHID,
  getPatientByUHID,
  addBillItem,
  getDischargedPatients,
  reAdmitPatient
};
