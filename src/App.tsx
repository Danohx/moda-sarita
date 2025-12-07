// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ComingSoon from './pages/ComingSoon';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar fijo arriba */}
      <Navbar />
      
      {/* El contenido de las páginas */}
      <Routes>
        <Route path="/" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;