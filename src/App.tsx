import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Skills from './pages/Skills';
import About from './pages/About';
import Contact from './pages/Contact';
import Maintenance from './pages/Maintenance';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import GoogleDriveCallback from './pages/GoogleDriveCallback';
import AnimatedBackground from './components/ui/AnimatedBackground';

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  useEffect(() => {
    //<============= You can toggle this to true to enable maintenance mode ====================
    setMaintenanceMode(false);
  }, []);

  if (maintenanceMode) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Maintenance />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
        <AnimatedBackground variant="primary" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col min-h-screen"
        >
          <Navbar />
          <main className="flex-grow relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/google-callback" element={<GoogleDriveCallback />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/maintenance" element={<Maintenance />} />
            </Routes>
          </main>
          <Footer />
        </motion.div>
      </div>
    </Router>
  );
}

export default App;