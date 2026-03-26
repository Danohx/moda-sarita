import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ConfigurationPage from "../pages/auth/ConfigurationPage";
import ContactPage from "../pages/general/ContactPage";
import HomePage from "../pages/general/HomePage";
import CatalogPage from "../pages/general/CatalogPage";
import ProductDetailPage from "../pages/general/ProductDetail";
import PublicLayout from "../components/layout/PublicLayout";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:id" element={<ProductDetailPage />} />
          <Route path="/configuracion" element={<ConfigurationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};