import { Routes, Route } from "react-router-dom";
import { ROUTES } from "@/config/routes";

// Páginas principais
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";

// Autenticação
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Propriedades
import PropertiesListPage from "@/pages/properties/PropertiesListPage";

// Listings (anúncios)
import CreateListing from "@/pages/listings/CreateListing";

// Perfil
import ProfilePage from "@/pages/profile/ProfilePage";

/**
 * Sistema de roteamento centralizado
 * Organizado por contexto/funcionalidade para facilitar manutenção
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      
      {/* Autenticação */}
      <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
      
      {/* Propriedades */}
      <Route path={ROUTES.PROPERTIES.LIST} element={<PropertiesListPage />} />
      <Route path={ROUTES.PROPERTIES.SEARCH} element={<PropertiesListPage />} />
      <Route path={ROUTES.PROPERTIES.FAVORITES} element={<div>Favoritos - Em desenvolvimento</div>} />
      
      {/* Listings (anúncios) */}
      <Route path={ROUTES.LISTINGS.CREATE} element={<CreateListing />} />
      
      {/* Perfis */}
      <Route path={ROUTES.PROFILE.CLIENT} element={<ProfilePage />} />
      <Route path={ROUTES.PROFILE.ADVERTISER} element={<ProfilePage />} />
      
      {/* Rotas legadas - manter compatibilidade */}
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* 404 - Deve ficar por último */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;