import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-apartment.jpg";

const Hero = () => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-20 lg:py-32 overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Encontre o lugar perfeito para<br />
            morar perto da sua universidade.
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 font-light">
            Kitnets, quartos e apartamentos próximos à sua universidade. 
            Simples, seguro e econômico.
          </p>
          
          {/* Search form */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-strong max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Localização</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Universidade ou bairro"
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-out"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo de imóvel</label>
                <select className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-out">
                  <option>Todos os tipos</option>
                  <option>Kitnet</option>
                  <option>Quarto</option>
                  <option>Apartamento</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Preço máximo</label>
                <select className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-out">
                  <option>Sem limite</option>
                  <option>Até R$ 500</option>
                  <option>Até R$ 800</option>
                  <option>Até R$ 1200</option>
                  <option>Até R$ 2000</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="primary" size="lg" className="w-full md:w-auto px-12">
                <Search className="mr-2 h-5 w-5" />
                Buscar imóveis
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-80">Imóveis disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-80">Universidades atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm opacity-80">Estudantes satisfeitos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;