import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";
import kitnetImage from "@/assets/kitnet-1.jpg";
import roomImage from "@/assets/room-1.jpg";
import apartmentImage from "@/assets/apartment-1.jpg";

const PropertiesListPage = () => {
  // Mock data - será substituído por dados da API
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
      amenities: ["wifi", "garagem", "lavanderia"],
      capacity: 2,
      isFavorited: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section com busca */}
      <section className="bg-gradient-to-r from-primary/10 to-blue-600/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Encontre seu lar ideal
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra os melhores imóveis para estudantes universitários
            </p>
          </div>
          
          {/* Barra de busca principal */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Localização (ex: Pampulha, BH)"
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tipo de imóvel ou universidade"
                      className="pl-10"
                    />
                  </div>
                  
                  <Button size="lg" className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {properties.length} imóveis encontrados
            </h2>
            
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
          
          <FilterBar />
        </div>

        {/* Grid de propriedades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>

        {/* Paginação */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              Anterior
            </Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesListPage;