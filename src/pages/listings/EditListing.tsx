import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, MapPin, Plus, X, Loader2, Trash2, GripVertical, AlertTriangle } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<ListingFormData>>({
    amenities: [],
    photos: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

    console.log('Arquivos selecionados:', files.length);

    // Validar tipos de arquivo
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast({
        title: "Alguns arquivos foram ignorados",
        description: "Apenas arquivos de imagem são aceitos.",
        variant: "destructive"
      });
    }

    if (validFiles.length === 0) return;

    // Gerar URLs de preview
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Atualizar fotos no formData
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...validFiles]
    }));

    // Limpar o input para permitir selecionar os mesmos arquivos novamente
    e.target.value = '';

    toast({
      title: "Fotos adicionadas",
      description: `${validFiles.length} foto(s) adicionada(s) com sucesso.`,
      variant: "default"
    });
  };

  // Função para abrir seletor de arquivos
  const openFileSelector = () => {
    const fileInput = document.getElementById('photos') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
    const imageToDelete = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToDelete]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Reordenar imagens por drag and drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...existingImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setExistingImages(newImages);
    setDraggedIndex(null);
  };

  // Função para deletar propriedade
  const handleDeleteProperty = async () => {
    if (!id) {
      console.error('ID da propriedade não encontrado');
      toast({
        title: "Erro",
        description: "ID da propriedade não encontrado.",
        variant: "destructive"
      });
      return;
    }

    console.log('Iniciando deleção da propriedade:', id);

    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Esta ação é irreversível!\n\n" +
      "Tem certeza que deseja deletar este anúncio?\n" +
      "Todos os dados, fotos e reservas relacionadas serão perdidos."
    );

    if (!confirmed) {
      console.log('Deleção cancelada pelo usuário');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Chamando propertyService.deleteProperty com ID:', id);

      await propertyService.deleteProperty(id);

      console.log('Propriedade deletada com sucesso');
      toast({
        title: "Anúncio deletado!",
        description: "O anúncio foi removido com sucesso.",
        variant: "default"
      });

      // Aguardar um pouco antes de navegar para garantir que o toast seja visível
      setTimeout(() => {
        navigate("/profile?tab=imoveis");
      }, 1000);

    } catch (error) {
      console.error('Erro detalhado ao deletar propriedade:', error);

      let errorMessage = "Não foi possível deletar o anúncio. Tente novamente.";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Mensagem de erro:', error.message);
      }

      toast({
        title: "Erro ao deletar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
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
      // 1. Atualizar dados da propriedade com imagens reorganizadas
      await propertyService.updateProperty(id, {
        title: formData.title!,
        type: formData.type!,
        price: Number(formData.price),
        location: formData.address!,
        university: formData.university!,
        distance: formData.distance || "",
        amenities: formData.amenities || [],
        capacity: Number(formData.capacity),
        description: formData.description || "",
        images: existingImages // Incluir ordem das imagens
      });

      // 2. Deletar imagens marcadas para remoção
      if (imagesToDelete.length > 0) {
        await propertyService.deleteImages(id, imagesToDelete);
      }

      // 3. Se há novas fotos, fazer upload
      if (formData.photos && formData.photos.length > 0) {
        await propertyService.uploadImages(id, formData.photos);
      }

      toast({
        title: "Propriedade atualizada!",
        description: "Sua propriedade foi atualizada com sucesso.",
        variant: "default"
      });

      navigate("/profile?tab=imoveis");

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
              <p className="text-sm text-muted-foreground mb-4">
                Arraste as imagens para reordená-las. A primeira imagem será a capa do anúncio.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-primary transition-colors"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Capa
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remover imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {imagesToDelete.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {imagesToDelete.length} imagem(ns) será(ão) removida(s) ao salvar.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Novas Fotos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Adicionar Novas Fotos
            </h2>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={openFileSelector}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary');
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    // Simular evento de input para reutilizar a lógica
                    const inputEvent = {
                      target: { files, value: '' }
                    } as any;
                    handlePhotoSelect(inputEvent);
                  }
                }}
              >
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Adicione novas fotos da sua propriedade
                </p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="inline-flex hover:bg-muted transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar double click
                      openFileSelector();
                    }}
                    disabled={isSubmitting}
                  >
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
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Clique para selecionar ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aceita JPG, PNG, GIF. Máximo 10MB por arquivo.
                  </p>
                </div>
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

          {/* Zona de Perigo */}
          <Card className="p-6 border-destructive bg-red-50">
            <h2 className="text-xl font-semibold mb-4 text-destructive flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Zona de Perigo
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta ação é irreversível. Todos os dados, fotos e reservas relacionadas a este anúncio serão perdidos permanentemente.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Botão deletar clicado! ID da propriedade:', id);
                  handleDeleteProperty();
                }}
                disabled={isSubmitting || isDeleting}
                className="min-w-[140px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar Anúncio
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile?tab=imoveis")}
              disabled={isSubmitting || isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
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