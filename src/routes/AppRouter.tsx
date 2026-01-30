// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import NotFound from '../pages/general/NotFound';
import ServerError from '../pages/general/ServerError';
import BadRequest from '../pages/general/BadRequest';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ConfigurationPage from '../pages/auth/ConfigurationPage';
import Footer from '../components/layout/Footer';
import ContactPage from '../pages/general/ContactPage';
import HomePage from '../pages/general/HomePage';
import CatalogPage from '../pages/general/CatalogPage';
import ProductDetailPage from '../pages/general/ProductDetail';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <PublicNavbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            
            {/* Ruta dinámica */}
            <Route path="/catalogo/:id" element={<ProductDetailPage />} />
            
            {/* Rutas protegidos */}
            <Route path="/configuracion" element={<ConfigurationPage />} />

            {/* Páginas de Error */}
            <Route path="/404" element={<NotFound />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="/400" element={<BadRequest />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </BrowserRouter>
  );
};