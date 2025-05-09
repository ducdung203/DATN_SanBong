import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx'; // App.jsx sẽ quản lý các route

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScopedCssBaseline>
      <Router>
        <App /> {/* App sẽ quản lý các route */}
      </Router>
    </ScopedCssBaseline>
  </StrictMode>
);