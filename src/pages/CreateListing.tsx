import { useState } from "react";
import { Camera, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { ListingFormData, PropertyType } from "@/types/listing";

const AMENITIES = [
  { id: "wifi", label: "Wi-Fi", value: "wifi" },
  { id: "garage", label: "Garagem", value: "garage" },
  { id: "furnished", label: "Mobiliado", value: "furnished" },
  { id: "laundry", label: "Lavanderia", value: "laundry" },
  { id: "security", label: "Segurança 24h", value: "security" }
];

const CreateListing = () => {
  const [formData, setFormData] = useState<Partial<ListingFormData>>({
    amenities: [],
    photos: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.title || !formData.type || !formData.price) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // TODO: Integração com o backend
      console.log("Dados do formulário:", formData);
      
      // Exemplo de como seria a integração com o backend:
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (key === 'photos') {
      //     value.forEach((photo: File) => {
      //       formDataToSend.append('photos', photo);
      //     });
      //   } else {
      //     formDataToSend.append(key, value);
      //   }
      // });
      
      // const response = await fetch('/api/listings', {
      //   method: 'POST',
      //   body: formDataToSend
      // });
      
      // if (response.ok) {
      //   // Redirecionar para a página do anúncio
      //   window.location.href = '/';
      // }
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      alert("Erro ao criar anúncio. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Anunciar Imóvel
            </h1>
            <p className="text-muted-foreground mt-2">
              Preencha os detalhes do seu imóvel para anunciar na plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações básicas */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do anúncio</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Apartamento moderno próximo à UFMG"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo de imóvel</Label>
                    <select
                      id="type"
                      name="type"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      value={formData.type || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="kitnet">Kitnet</option>
                      <option value="quarto">Quarto</option>
                      <option value="apartamento">Apartamento</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="price">Valor do aluguel (R$)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      placeholder="Ex: 800"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição do imóvel</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva as características principais do seu imóvel..."
                    className="h-32"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Localização */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Localização</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      className="pl-10"
                      placeholder="Digite o endereço do imóvel"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      placeholder="Ex: Pampulha"
                      value={formData.neighborhood || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="university">Universidade próxima</Label>
                    <Input
                      id="university"
                      name="university"
                      placeholder="Ex: UFMG"
                      value={formData.university || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="distance">Distância até a universidade</Label>
                  <Input
                    id="distance"
                    name="distance"
                    placeholder="Ex: 500m"
                    value={formData.distance || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Características */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Características</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Capacidade (pessoas)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="Ex: 2"
                    value={formData.capacity || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label className="block mb-2">Comodidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES.map(({ id, label, value }) => (
                      <label key={id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.amenities || []).includes(value)}
                          onChange={() => handleAmenityToggle(value)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Fotos */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fotos do Imóvel</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Adicionar foto
                    </span>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adicione pelo menos 3 fotos do seu imóvel. A primeira foto será a capa do anúncio.
                </p>
              </div>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Publicar anúncio
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateListing;