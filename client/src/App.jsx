import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import OPDRegistration from './pages/OPDRegistration';
import IPDRegistration from './pages/IPDRegistration';
import Billing from './pages/Billing';
import LabServices from './pages/LabServices';
import MISReports from './pages/MISReports';
import SubAdminManagement from './pages/SubAdminManagement';
import PatientHistory from './pages/PatientHistory';
import FeeStructure from './pages/FeeStructure';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="opd" element={<OPDRegistration />} />
            <Route path="ipd" element={<IPDRegistration />} />
            <Route path="billing/:id" element={<Billing />} />
            <Route path="lab" element={<LabServices />} />
            <Route path="records" element={<PatientHistory />} />
            <Route path="mis" element={<MISReports />} />
            <Route path="users" element={<SubAdminManagement />} />
            <Route path="fee-structure" element={<FeeStructure />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
