const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const LabTest = require('./models/LabTest');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms-db');
  
  await Doctor.deleteMany();
  await LabTest.deleteMany();
  await User.deleteMany();

  const doctors = await Doctor.create([
    { name: 'Dr. Smith', specialization: 'Cardiologist', opdFee: 500, ipdVisitFee: 800 },
    { name: 'Dr. Adams', specialization: 'Neurologist', opdFee: 600, ipdVisitFee: 1000 },
  ]);

  const tests = await LabTest.create([
    { name: 'CBC', price: 300, normalRange: '13-17 g/dL', unit: 'g/dL' },
    { name: 'LFT', price: 800, normalRange: 'Varies', unit: 'U/L' },
    { name: 'Lipid Profile', price: 1200, normalRange: '<200 mg/dL', unit: 'mg/dL' },
  ]);

  const admin = await User.create({
    username: 'admin',
    password: 'password@123',
    name: 'Admin User',
    role: 'admin'
  }); 

  const subAdmin = await User.create({
    username: 'reception',
    password: 'reception123',
    name: 'Receptionist',
    role: 'sub-admin'
  });

  console.log('Seeded successfully');
  process.exit();
};

seed();
