import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {MapPin,Users,Wifi,Car,Heart,Star,Phone,Mail,MessageSquare,Share2,ArrowLeft,Loader2,CheckCircle,Calendar,Shield,Home} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Property } from "@/types/property";
import { propertyService } from "@/services/propertyService";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { rentalService } from "@/services/rentalService";

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleFavorite } = useProperties();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInterestedLoading, setIsInterestedLoading] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError("ID da propriedade não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const propertyData = await propertyService.getPropertyById(id);

        if (!propertyData) {
          setError("Propriedade não encontrada");
          return;
        }

        setProperty(propertyData);
      } catch (err) {
        console.error('Erro ao carregar propriedade:', err);
        setError("Erro ao carregar propriedade");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleFavorite = async () => {
    if (!property) return;
    await toggleFavorite(property.id);

    // Atualizar estado local
    setProperty(prev => prev ? {
      ...prev,
      isFavorited: !prev.isFavorited,
      is_favorited: !prev.is_favorited
    } : null);
  };

  const handleInterest = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para demonstrar interesse.",
        variant: "destructive"
      });
      navigate("/auth/login");
      return;
    }

    if (!property) return;

    setIsInterestedLoading(true);

    try {
      await rentalService.expressInterest(property.id, "Tenho interesse neste imóvel!");

      toast({
        title: "Interesse demonstrado!",
        description: "O anunciante foi notificado sobre seu interesse.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao demonstrar interesse:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível demonstrar interesse. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsInterestedLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Confira este imóvel: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando propriedade...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Propriedade não encontrada</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const amenityIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    garagem: <Car className="w-4 h-4" />,
    garage: <Car className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Detalhes do imóvel</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Imagens e Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery de Imagens */}
            <Card className="overflow-hidden">
              {images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-[16/10] bg-gray-100">
                    <img
                      src={images[currentImageIndex]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Indicadores de imagem */}
                  {images.length > 1 && (
                    <>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Miniaturas */}
                      <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
                  <Home className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </Card>

            {/* Informações Principais */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{property.title}</h1>
                      <Badge className={typeColors[property.type]}>
                        {typeLabels[property.type]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{property.capacity} pessoa{property.capacity > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-medium">{property.rating}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-primary font-medium">
                        {property.distance} da {property.university}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleFavorite}
                      className={property.isFavorited || property.is_favorited ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${(property.isFavorited || property.is_favorited) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  R$ {property.price}
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>

                {property.description && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold mb-2">Descrição</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {property.description}
                      </p>
                    </div>
                  </>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold mb-3">Comodidades</h3>
                      <div className="flex flex-wrap gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            {amenityIcons[amenity as keyof typeof amenityIcons] || <CheckCircle className="w-4 h-4 text-green-500" />}
                            <span className="text-sm capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ações e Contato */}
          <div className="space-y-6">
            {/* Card de Ação Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Interessado?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleInterest}
                  disabled={isInterestedLoading}
                >
                  {isInterestedLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Demonstrar Interesse
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Resposta rápida garantida</span>
                  </div>
                  <p>O anunciante será notificado sobre seu interesse e entrará em contato em breve.</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Anunciante */}
            <Card>
              <CardHeader>
                <CardTitle>Anunciante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>AN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Anunciante Verificado</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>4.8 • Responde rapidamente</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Endereço:</strong> {property.location}</p>
                  <p><strong>Universidade:</strong> {property.university}</p>
                  <p><strong>Distância:</strong> {property.distance}</p>
                </div>

                {/* Aqui você pode adicionar um mapa no futuro */}
                <div className="mt-4 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Mapa em breve</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;