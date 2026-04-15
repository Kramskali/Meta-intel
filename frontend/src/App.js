import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import PaymentSuccess from '@/components/PaymentSuccess';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/success" element={<PaymentSuccess />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </div>
  );
}

export default App;
