import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pipeline from './pages/Pipeline.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Contacts from './pages/Contacts.jsx';
import Companies from './pages/Companies.jsx';
import Tasks from './pages/Tasks.jsx';
import Templates from './pages/Templates.jsx';
import ImportExport from './pages/ImportExport.jsx';
import Users from './pages/Users.jsx';
import NotFound from './pages/NotFound.jsx';

const TEAM = ['admin', 'manager'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="companies" element={<Companies />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="templates" element={<Templates />} />
        <Route path="import-export" element={<ProtectedRoute roles={TEAM}><ImportExport /></ProtectedRoute>} />
        <Route path="team" element={<ProtectedRoute roles={TEAM}><Users /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
