import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, MapPin, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { ListingFormData, PropertyType } from "@/types/listing";
import { propertyService } from "@/services/propertyService";

const AMENITIES = [
  { id: "wifi", label: "Wi-Fi", value: "wifi" },
  { id: "garage", label: "Garagem", value: "garage" },
  { id: "furnished", label: "Mobiliado", value: "furnished" },
  { id: "laundry", label: "Lavanderia", value: "laundry" },
  { id: "security", label: "Segurança 24h", value: "security" }
];

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<ListingFormData>>({
    amenities: [],
    photos: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Carregar dados da propriedade para edição
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        toast({
          title: "Erro",
          description: "ID da propriedade não encontrado.",
          variant: "destructive"
        });
        navigate("/profile");
        return;
      }

      try {
        setIsLoading(true);
        const property = await propertyService.getPropertyById(id);

        if (!property) {
          toast({
            title: "Propriedade não encontrada",
            description: "A propriedade que você está tentando editar não foi encontrada.",
            variant: "destructive"
          });
          navigate("/profile");
          return;
        }

        // Preencher formulário com dados existentes
        setFormData({
          title: property.title,
          type: property.type as PropertyType,
          price: property.price,
          university: property.university,
          address: property.location,
          distance: property.distance,
          capacity: property.capacity,
          description: property.description,
          amenities: property.amenities || [],
          photos: []
        });

        // Salvar imagens existentes
        setExistingImages(property.images || []);

      } catch (error) {
        console.error('Erro ao carregar propriedade:', error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os dados da propriedade.",
          variant: "destructive"
        });
        navigate("/profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, navigate, toast]);

  // Limpa as URLs de objeto quando o componente é desmontado
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (value: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities || [];
      return {
        ...prev,
        amenities: amenities.includes(value)
          ? amenities.filter((a) => a !== value)
          : [...amenities, value]
      };
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Gerar URLs de preview
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Atualizar fotos no formData
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...files]
    }));
  };

  const removePhoto = (index: number) => {
    // Revoga a URL do objeto para liberar memória
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validação básica
    if (!formData.title || !formData.type || !formData.price || !formData.university || !formData.address) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      toast({
        title: "Capacidade inválida",
        description: "A capacidade deve ser um número maior que zero.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Atualizar dados da propriedade
      await propertyService.updateProperty(id, {
        title: formData.title!,
        type: formData.type!,
        price: Number(formData.price),
        location: formData.address!,
        university: formData.university!,
        distance: formData.distance || "",
        amenities: formData.amenities || [],
        capacity: Number(formData.capacity),
        description: formData.description || ""
      });

      // 2. Se há novas fotos, fazer upload
      if (formData.photos && formData.photos.length > 0) {
        await propertyService.uploadImages(id, formData.photos);
      }

      toast({
        title: "Propriedade atualizada!",
        description: "Sua propriedade foi atualizada com sucesso.",
        variant: "default"
      });

      navigate("/profile");

    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a propriedade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Editar Propriedade</h1>
          <p className="text-muted-foreground">
            Atualize as informações da sua propriedade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Apartamento moderno próximo à UFMG"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Imóvel *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="kitnet">Kitnet</option>
                  <option value="quarto">Quarto</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço Mensal (R$) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  placeholder="800"
                  min="0"
                  step="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (pessoas) *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={handleInputChange}
                  placeholder="2"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Localização */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Localização
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  placeholder="Rua, número, bairro, cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">Universidade de Referência *</Label>
                <Input
                  id="university"
                  name="university"
                  value={formData.university || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: UFMG, PUC Minas"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distance">Distância da Universidade</Label>
                <Input
                  id="distance"
                  name="distance"
                  value={formData.distance || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: 500m, 1.2km, 5 min a pé"
                />
              </div>
            </div>
          </Card>

          {/* Comodidades */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Comodidades</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity.value) || false}
                    onChange={() => handleAmenityToggle(amenity.value)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{amenity.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Descrição */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Descrição</h2>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Descreva os detalhes do imóvel, regras, etc."
                rows={4}
              />
            </div>
          </Card>

          {/* Imagens Existentes */}
          {existingImages.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Imagens Atuais</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Novas Fotos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Adicionar Novas Fotos
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Adicione novas fotos da sua propriedade
                </p>
                <Label htmlFor="photos" className="cursor-pointer">
                  <Button type="button" variant="outline" className="inline-flex">
                    <Plus className="w-4 h-4 mr-2" />
                    Selecionar Fotos
                  </Button>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </Label>
              </div>

              {/* Preview das novas fotos */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Propriedade"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;