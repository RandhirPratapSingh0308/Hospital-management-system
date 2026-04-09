require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PORT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms-db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/authRoutes'); // Need to split out
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const labRoutes = require('./routes/labRoutes');

app.use('/api/auth', authRoutes);

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/lab', labRoutes);

app.get('/', (req, res) => res.send('HMS API Running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
