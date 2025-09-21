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
import PropertyDetailsPage from "@/pages/properties/PropertyDetailsPage";

// Listings (anúncios)
import CreateListing from "@/pages/listings/CreateListing";
import EditListing from "@/pages/listings/EditListing";

// Perfil
import ProfilePage from "@/pages/profile/ProfilePage";

// Páginas legais
import TermsOfUsePage from "@/pages/legal/TermsOfUsePage";
import PrivacyPolicyPage from "@/pages/legal/PrivacyPolicyPage";
import HelpCenterPage from "@/pages/legal/HelpCenterPage";
import FAQPage from "@/pages/legal/FAQPage";

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
      <Route path={ROUTES.PROPERTIES.DETAILS(':id')} element={<PropertyDetailsPage />} />
      <Route path={ROUTES.PROPERTIES.FAVORITES} element={<div>Favoritos - Em desenvolvimento</div>} />
      
      {/* Listings (anúncios) */}
      <Route path={ROUTES.LISTINGS.CREATE} element={<CreateListing />} />
      <Route path={ROUTES.LISTINGS.EDIT(':id')} element={<EditListing />} />
      
      {/* Perfis */}
      <Route path={ROUTES.PROFILE.CLIENT} element={<ProfilePage />} />
      <Route path={ROUTES.PROFILE.ADVERTISER} element={<ProfilePage />} />
      
      {/* Páginas de suporte e legais */}
      <Route path={ROUTES.SUPPORT.TERMS} element={<TermsOfUsePage />} />
      <Route path={ROUTES.SUPPORT.PRIVACY} element={<PrivacyPolicyPage />} />
      <Route path={ROUTES.SUPPORT.HELP_CENTER} element={<HelpCenterPage />} />
      <Route path={ROUTES.SUPPORT.FAQ} element={<FAQPage />} />
      
      {/* Rotas legadas - manter compatibilidade */}
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* 404 - Deve ficar por último */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;