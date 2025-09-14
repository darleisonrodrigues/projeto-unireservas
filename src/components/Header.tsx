import { Search, Menu, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = true }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Uni Reservas
              </h1>
            </div>
          </div>

          {/* Search bar - Hidden on mobile */}
          {showSearch && (
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar kitnets, quartos, apartamentos..."
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-full bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-out"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(ROUTES.PROPERTIES.SEARCH);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation items */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => navigate(ROUTES.LISTINGS.CREATE)}
            >
              Anunciar imóvel
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(ROUTES.PROPERTIES.FAVORITES)}
              title="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Button>
            
            {/* Botões de autenticação */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.AUTH.LOGIN)}
            >
              Entrar
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            >
              Cadastrar
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(ROUTES.PROFILE.CLIENT)}
              title="Perfil"
              className="hidden sm:flex"
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Buscar imóveis..."
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-full bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-out"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(ROUTES.PROPERTIES.SEARCH);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;