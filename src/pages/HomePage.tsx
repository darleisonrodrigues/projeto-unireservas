import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { filteredProperties } = useProperties();
  const [showMoreProperties, setShowMoreProperties] = useState(false);
  
  // Para paginação, vamos mostrar os primeiros 8 imóveis inicialmente
  const displayedProperties = showMoreProperties 
    ? filteredProperties 
    : filteredProperties.slice(0, 8);

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
          {!showMoreProperties && filteredProperties.length > 8 ? (
            <Button 
              variant="outline"
              onClick={() => setShowMoreProperties(true)}
            >
              Carregar mais imóveis
            </Button>
          ) : (
            showMoreProperties && (
              <p className="text-muted-foreground">
                Todos os imóveis foram carregados
              </p>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;