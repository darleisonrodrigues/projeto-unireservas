import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useProfile } from "@/hooks/useProfile";
import { useUserProperties } from "@/hooks/useUserProperties";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Home, Heart, MessageSquare, Bell, Loader2, Trash2, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/config/routes";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userType = searchParams.get("type") || "cliente";
  const [activeTab, setActiveTab] = useState("dados-pessoais");

  const { profile, isLoading, error, updateProfile, deleteProfile } = useProfile();
  const { properties, isLoading: isLoadingProperties, error: propertiesError, refreshProperties } = useUserProperties();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | number | boolean | undefined>>({});

  const isAdvertiser = profile?.userType === "advertiser";

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
        variant: "default"
      });
      setFormData({}); // Limpar alterações pendentes
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProfile();
      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso.",
        variant: "default"
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Erro ao deletar conta",
        description: "Não foi possível deletar a conta. Tente novamente.",
        variant: "destructive"
      });
      console.error('Erro ao deletar conta:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar perfil</h2>
            <p className="text-muted-foreground">{error || 'Perfil não encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profileImage || profile.profile_image || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">
                      {profile.userType === 'advertiser' && 'company_name' in profile
                        ? (profile.companyName || profile.company_name)
                        : profile.name}
                    </CardTitle>
                    {profile.userType === 'advertiser' && profile.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-base mb-4 text-muted-foreground">
                    {profile.userType === 'advertiser' && 'description' in profile ? (
                      <>
                        <div>{profile.description}</div>
                        <div className="mt-1 text-sm">
                          {(profile.totalProperties || profile.total_properties) && `${profile.totalProperties || profile.total_properties} imóveis`}
                          {' • '}
                          {profile.rating && `Avaliação ${profile.rating}/5`}
                        </div>
                      </>
                    ) : (
                      'university' in profile && (
                        <>
                          <div>{profile.university} • {profile.course}</div>
                          <div className="mt-1">{profile.semester}</div>
                        </>
                      )
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    {profile.userType === 'advertiser' && (
                      <Button variant="outline" size="sm">
                        <Home className="w-4 h-4 mr-2" />
                        Gerenciar Imóveis
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="dados-pessoais" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            
            {!isAdvertiser && (
              <TabsTrigger value="preferencias" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Preferências</span>
              </TabsTrigger>
            )}
            
            <TabsTrigger value="imoveis" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isAdvertiser ? "Meus Imóveis" : "Favoritos"}
              </span>
            </TabsTrigger>
            
            <TabsTrigger value="mensagens" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </TabsTrigger>
            
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="dados-pessoais" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {profile.userType === 'advertiser' ? "Nome da Empresa" : "Nome Completo"}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name !== undefined ? String(formData.name) :
                        (profile.userType === 'advertiser' && 'company_name' in profile
                          ? (profile.companyName || profile.company_name || '')
                          : profile.name)}
                      onChange={(e) => {
                        const field = profile.userType === 'advertiser' ? 'company_name' : 'name';
                        handleFieldChange(field, e.target.value);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email !== undefined ? String(formData.email) : profile.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone !== undefined ? String(formData.phone) : (profile.phone || '')}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                    />
                  </div>
                  
                  {profile.userType === 'advertiser' && 'cnpj' in profile ? (
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj !== undefined ? String(formData.cnpj) : (profile.cnpj || '')}
                        onChange={(e) => handleFieldChange('cnpj', e.target.value)}
                      />
                    </div>
                  ) : (
                    'university' in profile && (
                      <div className="space-y-2">
                        <Label htmlFor="university">Universidade</Label>
                        <Input
                          id="university"
                          value={formData.university !== undefined ? String(formData.university) : profile.university || ''}
                          onChange={(e) => handleFieldChange('university', e.target.value)}
                        />
                      </div>
                    )
                  )}
                </div>
                
                {profile.userType === 'student' && 'course' in profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso</Label>
                      <Input
                        id="course"
                        value={formData.course !== undefined ? String(formData.course) : profile.course || ''}
                        onChange={(e) => handleFieldChange('course', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="semester">Período</Label>
                      <Input
                        id="semester"
                        value={formData.semester !== undefined ? String(formData.semester) : profile.semester || ''}
                        onChange={(e) => handleFieldChange('semester', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {profile.userType === 'advertiser' ? "Descrição da Empresa" : "Sobre mim"}
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={
                      profile.userType === 'advertiser'
                        ? (formData.description !== undefined ? String(formData.description) : (profile.description || ''))
                        : (formData.bio !== undefined ? String(formData.bio) : (profile.bio || ''))
                    }
                    onChange={(e) => {
                      const field = profile.userType === 'advertiser' ? 'description' : 'bio';
                      handleFieldChange(field, e.target.value);
                    }}
                    placeholder={profile.userType === 'advertiser' ?
                      "Descreva sua empresa e especializações..." :
                      "Conte um pouco sobre você..."
                    }
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving || Object.keys(formData).length === 0}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas serão implementadas aqui */}
          <TabsContent value="preferencias" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Moradia</CardTitle>
                <CardDescription>
                  Configure suas preferências para encontrar o imóvel ideal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="imoveis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{profile.userType === 'advertiser' ? "Meus Imóveis" : "Imóveis Favoritos"}</span>
                  {profile.userType === 'advertiser' && (
                    <Button onClick={() => navigate('/listings/create')} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Anúncio
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {profile.userType === 'advertiser' ?
                    "Gerencie seus anúncios de imóveis" :
                    "Seus imóveis salvos e favoritos"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.userType === 'advertiser' ? (
                  // Mostrar propriedades do anunciante
                  <>
                    {isLoadingProperties ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Carregando suas propriedades...
                      </div>
                    ) : propertiesError ? (
                      <div className="text-center py-8 text-red-500">
                        <p>{propertiesError}</p>
                        <Button variant="outline" onClick={refreshProperties} className="mt-2">
                          Tentar novamente
                        </Button>
                      </div>
                    ) : properties.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Nenhum imóvel cadastrado</p>
                        <p className="mb-4">Comece criando seu primeiro anúncio!</p>
                        <Button onClick={() => navigate('/listings/create')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar primeiro anúncio
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {properties.map((property) => (
                          <Card key={property.id} className="overflow-hidden">
                            <div className="aspect-video bg-gray-100 relative">
                              {property.images && property.images.length > 0 ? (
                                <img
                                  src={property.images[0]}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Home className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <Badge className="absolute top-2 right-2">
                                {property.type}
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {property.description}
                              </p>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-green-600">
                                  R$ {property.price}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {property.capacity} pessoas
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {property.location}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => navigate(ROUTES.LISTINGS.EDIT(property.id))}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(ROUTES.PROPERTIES.DETAILS(property.id))}
                                >
                                  Ver
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Mostrar favoritos do estudante (funcionalidade futura)
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Funcionalidade de favoritos em desenvolvimento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mensagens" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens</CardTitle>
                <CardDescription>
                  Converse com {profile.userType === 'advertiser' ? "potenciais inquilinos" : "proprietários"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notificacoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuracoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Configurações gerais da conta e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-t pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
                      <p className="text-sm text-muted-foreground">
                        Ações irreversíveis que afetam permanentemente sua conta.
                      </p>
                    </div>

                    <Card className="border-destructive">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Deletar conta</h4>
                            <p className="text-sm text-muted-foreground">
                              Remove permanentemente sua conta e todos os dados associados.
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deletando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Deletar Conta
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;