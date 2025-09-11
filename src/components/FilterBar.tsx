import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState<string>("todos");

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
                onClick={() => setActiveFilter(type.id)}
                className={`filter-chip whitespace-nowrap ${
                  activeFilter === type.id ? 'active' : ''
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Price range filter */}
          <div className="flex items-center space-x-2 border-r border-border pr-4 mr-2">
            <select className="filter-chip bg-transparent border-none outline-none cursor-pointer">
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filters */}
          <div className="flex items-center space-x-2">
            <button className="filter-chip">
              Perto da universidade
            </button>
            <button className="filter-chip">
              Mobiliado
            </button>
            <button className="filter-chip">
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
            <span className="font-medium text-foreground">247 imóveis</span> encontrados
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <select className="text-sm bg-transparent border border-border rounded-md px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
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