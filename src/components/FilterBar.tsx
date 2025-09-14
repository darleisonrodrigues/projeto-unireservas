import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/contexts/PropertyContext";

const FilterBar = () => {
  const { filters, updateFilter, filteredProperties } = useProperties();

  const propertyTypes = [
    { id: "todos", label: "Todos" },
    { id: "kitnet", label: "Kitnets" },
    { id: "quarto", label: "Quartos" },
    { id: "apartamento", label: "Apartamentos" }
  ];

  const priceRanges = [
    { id: "todos-precos", label: "Qualquer preço" },
    { id: "ate-500", label: "Até R$ 500" },
    { id: "500-800", label: "R$ 500 - R$ 800" },
    { id: "800-1200", label: "R$ 800 - R$ 1.200" },
    { id: "acima-1200", label: "Acima de R$ 1.200" }
  ];

  return (
    <div className="bg-background border-b border-border sticky top-16 z-40 backdrop-blur-sm bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Filter chips */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          
          {/* Property type filters */}
          <div className="flex items-center space-x-2 border-r border-border pr-4 mr-2">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  console.log('Clicou no filtro:', type.id);
                  updateFilter('propertyType', type.id);
                }}
                className={`filter-chip whitespace-nowrap ${
                  filters.propertyType === type.id ? 'active' : ''
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Price range filter */}
          <div className="flex items-center space-x-2 border-r border-border pr-4 mr-2">
            <select 
              className="filter-chip bg-transparent border-none outline-none cursor-pointer"
              value={filters.priceRange}
              onChange={(e) => updateFilter('priceRange', e.target.value)}
            >
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filters */}
          <div className="flex items-center space-x-2">
            <button 
              className={`filter-chip ${filters.amenities.includes('perto-universidade') ? 'active' : ''}`}
              onClick={() => {
                const currentAmenities = filters.amenities;
                const amenity = 'perto-universidade';
                const updatedAmenities = currentAmenities.includes(amenity)
                  ? currentAmenities.filter(a => a !== amenity)
                  : [...currentAmenities, amenity];
                updateFilter('amenities', updatedAmenities);
              }}
            >
              Perto da universidade
            </button>
            <button 
              className={`filter-chip ${filters.amenities.includes('mobiliado') ? 'active' : ''}`}
              onClick={() => {
                const currentAmenities = filters.amenities;
                const amenity = 'mobiliado';
                const updatedAmenities = currentAmenities.includes(amenity)
                  ? currentAmenities.filter(a => a !== amenity)
                  : [...currentAmenities, amenity];
                updateFilter('amenities', updatedAmenities);
              }}
            >
              Mobiliado
            </button>
            <button 
              className={`filter-chip ${filters.amenities.includes('pets') ? 'active' : ''}`}
              onClick={() => {
                const currentAmenities = filters.amenities;
                const amenity = 'pets';
                const updatedAmenities = currentAmenities.includes(amenity)
                  ? currentAmenities.filter(a => a !== amenity)
                  : [...currentAmenities, amenity];
                updateFilter('amenities', updatedAmenities);
              }}
            >
              Permite pets
            </button>
          </div>

          {/* More filters button */}
          <Button variant="outline" size="sm" className="ml-4 whitespace-nowrap">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Mais filtros
          </Button>
        </div>

        {/* Results count and sorting */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredProperties.length} imóveis</span> encontrados
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <select 
              className="text-sm bg-transparent border border-border rounded-md px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="mais-recente">Mais recente</option>
              <option value="melhor-avaliado">Melhor avaliado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;