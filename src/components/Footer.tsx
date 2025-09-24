import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div>
            <h3 className="font-bold text-lg mb-4">UniReservas</h3>
            <p className="text-sm text-muted-foreground">
              Encontre o lugar perfeito para morar perto da sua universidade.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.LISTINGS.CREATE} className="hover:text-primary transition-all duration-300 ease-out">Anunciar imóvel</Link></li>
              <li><Link to="#" className="hover:text-primary transition-all duration-300 ease-out">Gerenciar anúncios</Link></li>
            </ul>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="font-semibold mb-4">Sobre</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.SUPPORT.HELP_CENTER} className="hover:text-primary transition-all duration-300 ease-out">Central de ajuda</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-all duration-300 ease-out">Termos de uso</Link></li>
              <li><Link to={ROUTES.SUPPORT.PRIVACY} className="hover:text-primary transition-all duration-300 ease-out">Política de privacidade</Link></li>
              <li><Link to={ROUTES.SUPPORT.FAQ} className="hover:text-primary transition-all duration-300 ease-out">Perguntas Frequentes</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: contato@unireservas.com.br</p>
              <p>Telefone: (85) 3333-4444</p>
              <p>Endereço: Fortaleza, CE - Brasil</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;