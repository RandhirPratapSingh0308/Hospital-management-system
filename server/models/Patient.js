const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  uhid: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contact: { type: String, required: true },
  aadhaar: { type: String },
  dob: { type: Date },
  bloodGroup: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },

  consultantDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  opdFee: { type: Number },
  registrationDate: { type: Date, default: Date.now },

  isIPD: { type: Boolean, default: false },
  status: { type: String, enum: ['Admitted', 'Discharged'], default: 'Admitted' },

  ipdDetails: {
    admissionDate: { type: Date },
    roomType: { type: String, enum: ['ICU', 'General Ward', 'Private Room'] },
    roomRate: { type: Number },
    daysInRoom: { type: Number, default: 0 },
    
    doctorVisits: [{
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      count: { type: Number, default: 1 },
      feePerVisit: { type: Number }
    }],
    
    oxygenUsage: {
      hours: { type: Number, default: 0 },
      ratePerHour: { type: Number, default: 0 }
    },

    advancePaid: { type: Number, default: 0 },
    
    labTests: [{
      testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
      testName: { type: String },
      price: { type: Number },
      date: { type: Date, default: Date.now }
    }],

    additionalPayments: { type: Number, default: 0 },
    
    billItems: [{
      type: { type: String },
      unit: { type: Number, default: 1 },
      amount: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }]
  },

  billing: {
    totalLabCharges: { type: Number, default: 0 },
    totalRoomCharges: { type: Number, default: 0 },
    totalDoctorCharges: { type: Number, default: 0 },
    totalOxygenCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountAuthorizedBy: { type: String },
    grandTotal: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
