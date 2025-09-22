import { Heart, MapPin, Users, Wifi, Car, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types/property";
import { useProperties } from "@/hooks/useProperties";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuthFirebase } from "@/contexts/AuthFirebaseContext";
import { useState } from "react";
import ReservationModal from "@/components/ReservationModal";

const PropertyCard = ({
  id,
  title,
  type,
  price,
  location,
  university,
  distance,
  image,
  rating,
  amenities,
  capacity,
  isFavorited
}: Property) => {
  const { toggleFavorite } = useProperties();
  const navigate = useNavigate();

  const { user } = useAuthFirebase();

  const [showReservationModal, setShowReservationModal] = useState(false);
  
  const typeLabels = {
    kitnet: "Kitnet",
    quarto: "Quarto",
    apartamento: "Apartamento"
  };

  const typeColors = {
    kitnet: "bg-blue-100 text-blue-800",
    quarto: "bg-green-100 text-green-800", 
    apartamento: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="property-card group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Favorite button */}
        <button
          onClick={async () => await toggleFavorite(id)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ease-out ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
        
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className={typeColors[type]}>
            {typeLabels[type]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and rating */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg leading-tight text-card-foreground line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="flex items-center ml-2 text-sm">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-muted-foreground">{rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
          <div className="text-sm text-primary font-medium">
            {distance} da {university}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center space-x-4 text-muted-foreground">
          {amenities.includes('wifi') && <Wifi className="h-4 w-4" />}
          {amenities.includes('garagem') && <Car className="h-4 w-4" />}
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{capacity} pessoa{capacity > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {price}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </div>
          </div>
          <div className="flex gap-2">
            {user?.userType === 'student' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReservationModal(true)}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Reservar
              </Button>
            )}
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(ROUTES.PROPERTIES.DETAILS(id))}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      {showReservationModal && (
        <ReservationModal
          property={{
            id,
            title,
            type,
            price,
            location,
            university,
            distance,
            images: image ? [image] : [],
            image,
            rating,
            amenities,
            capacity,
            isFavorited,
            is_favorited: isFavorited
          }}
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          onSuccess={() => {
            // Aqui você pode adicionar alguma ação após sucesso, como refresh da lista
            console.log('Reserva criada com sucesso!');
          }}
        />
      )}
    </div>
  );
};

export default PropertyCard;