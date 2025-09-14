import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import kitnetImage from "@/assets/kitnet-1.jpg";
import roomImage from "@/assets/room-1.jpg";
import apartmentImage from "@/assets/apartment-1.jpg";
import apartamento01Image from "@/assets/apartamento01.jpg";
import apartamento02Image from "@/assets/apartamento02.jpg";
import apartamento03Image from "@/assets/apartamento03.jpg";

const Index = () => {
  const [showMoreProperties, setShowMoreProperties] = useState(false);
  // Mock data for properties - Imóveis iniciais
  const initialProperties = [
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
    },
    {
      id: "7",
      title: "Apartamento com vista para a cidade",
      type: "apartamento" as const,
      price: 1100,
      location: "Centro, Belo Horizonte",
      university: "UFMG",
      distance: "700m",
      image: apartamento01Image,
      rating: 4.7,
      amenities: ["wifi", "garagem"],
      capacity: 2,
      isFavorited: false
    },
    {
      id: "8",
      title: "Apartamento espaçoso com varanda",
      type: "apartamento" as const,
      price: 1300,
      location: "Savassi, Belo Horizonte",
      university: "PUC Minas",
      distance: "1km",
      image: apartamento02Image,
      rating: 4.9,
      amenities: ["wifi", "garagem"],
      capacity: 3,
      isFavorited: true
    }
  ];

  // Imóveis adicionais que aparecem após clicar em "Carregar mais"
  const additionalProperties = [
    {
      id: "9",
      title: "Apartamento moderno e bem localizado",
      type: "apartamento" as const,
      price: 1250,
      location: "Funcionários, Belo Horizonte",
      university: "UFMG",
      distance: "500m",
      image: apartamento03Image,
      rating: 4.8,
      amenities: ["wifi", "garagem"],
      capacity: 2,
      isFavorited: false
    }
  ];

  // Propriedades a serem exibidas (iniciais + adicionais se showMoreProperties for true)
  const displayedProperties = showMoreProperties 
    ? [...initialProperties, ...additionalProperties] 
    : initialProperties;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FilterBar />
      
      {/* Properties grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>
        
        {/* Load more */}
        <div className="text-center mt-12">
          {!showMoreProperties ? (
            <Button 
              variant="outline-primary"
              onClick={() => setShowMoreProperties(true)}
            >
              Carregar mais imóveis
            </Button>
          ) : (
            <p className="text-muted-foreground">
              Todos os imóveis foram carregados
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;