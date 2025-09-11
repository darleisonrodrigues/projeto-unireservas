import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import kitnetImage from "@/assets/kitnet-1.jpg";
import roomImage from "@/assets/room-1.jpg";
import apartmentImage from "@/assets/apartment-1.jpg";

const Index = () => {
  // Mock data for properties
  const properties = [
    {
      id: "1",
      title: "Kitnet moderna próxima à UFMG",
      type: "kitnet" as const,
      price: 650,
      location: "Pampulha, Belo Horizonte",
      university: "UFMG",
      distance: "500m",
      image: kitnetImage,
      rating: 4.8,
      amenities: ["wifi", "garagem"],
      capacity: 1,
      isFavorited: false
    },
    {
      id: "2", 
      title: "Quarto individual com banheiro privativo",
      type: "quarto" as const,
      price: 480,
      location: "Savassi, Belo Horizonte", 
      university: "PUC Minas",
      distance: "800m",
      image: roomImage,
      rating: 4.6,
      amenities: ["wifi"],
      capacity: 1,
      isFavorited: true
    },
    {
      id: "3",
      title: "Apartamento 2 quartos para compartilhar",
      type: "apartamento" as const,
      price: 900,
      location: "Funcionários, Belo Horizonte",
      university: "UFMG",
      distance: "1.2km", 
      image: apartmentImage,
      rating: 4.9,
      amenities: ["wifi", "garagem"],
      capacity: 2,
      isFavorited: false
    },
    {
      id: "4",
      title: "Kitnet compacta e funcional",
      type: "kitnet" as const,
      price: 580,
      location: "Centro, Belo Horizonte",
      university: "PUC Minas", 
      distance: "600m",
      image: kitnetImage,
      rating: 4.4,
      amenities: ["wifi"],
      capacity: 1,
      isFavorited: false
    },
    {
      id: "5",
      title: "Quarto em casa compartilhada",
      type: "quarto" as const,
      price: 420,
      location: "Ouro Preto, Belo Horizonte",
      university: "UFMG",
      distance: "400m",
      image: roomImage, 
      rating: 4.7,
      amenities: ["wifi", "garagem"],
      capacity: 1,
      isFavorited: false
    },
    {
      id: "6",
      title: "Apartamento completo com 3 quartos",
      type: "apartamento" as const,
      price: 1200,
      location: "Coração de Jesus, Belo Horizonte",
      university: "UFMG",
      distance: "900m",
      image: apartmentImage,
      rating: 4.8,
      amenities: ["wifi", "garagem"],
      capacity: 3,
      isFavorited: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FilterBar />
      
      {/* Properties grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>
        
        {/* Load more */}
        <div className="text-center mt-12">
          <Button variant="outline-primary">
            Carregar mais imóveis
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-100 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Uni Reservas
              </h3>
              <p className="text-muted-foreground text-sm">
                A plataforma que conecta estudantes aos melhores imóveis próximos às universidades.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Estudantes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Buscar imóveis</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Como alugar</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Dicas para estudantes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Proprietários</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Anunciar imóvel</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Como funciona</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Gerenciar anúncios</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 ease-out">Termos de uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Uni Reservas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;