import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveFeed from './pages/LiveFeed';
import SessionAnalytics from './pages/SessionAnalytics';
import Auth from './pages/Auth';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<SessionAnalytics />} />
            <Route path="live" element={<LiveFeed />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
