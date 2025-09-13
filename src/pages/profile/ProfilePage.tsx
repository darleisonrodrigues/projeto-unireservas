import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Home, Heart, MessageSquare, Bell, Loader2 } from "lucide-react";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "cliente";
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  const isAdvertiser = userType === "anunciante";

  const handleSaveProfile = async (formData: any) => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      // TODO: Mostrar toast de sucesso
    } catch (err) {
      // TODO: Mostrar toast de erro
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
        <Header />
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
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">
                      {profile.userType === 'anunciante' && 'companyName' in profile 
                        ? profile.companyName 
                        : profile.name}
                    </CardTitle>
                    {profile.userType === 'anunciante' && 'verified' in profile && profile.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <CardDescription className="text-base mb-4">
                    {profile.userType === 'anunciante' && 'description' in profile ? (
                      <>
                        <div>{profile.description}</div>
                        <div className="mt-1 text-sm">
                          {'totalProperties' in profile && `${profile.totalProperties} imóveis`} 
                          {' • '}
                          {'rating' in profile && `Avaliação ${profile.rating}/5`}
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
                  </CardDescription>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    {profile.userType === 'anunciante' && (
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
                      {profile.userType === 'anunciante' ? "Nome da Empresa" : "Nome Completo"}
                    </Label>
                    <Input
                      id="name"
                      value={profile.userType === 'anunciante' && 'companyName' in profile 
                        ? profile.companyName 
                        : profile.name}
                      onChange={(e) => {
                        const field = profile.userType === 'anunciante' ? 'companyName' : 'name';
                        handleSaveProfile({ [field]: e.target.value });
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleSaveProfile({ email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleSaveProfile({ phone: e.target.value })}
                    />
                  </div>
                  
                  {profile.userType === 'anunciante' && 'cnpj' in profile ? (
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={profile.cnpj}
                        onChange={(e) => handleSaveProfile({ cnpj: e.target.value })}
                      />
                    </div>
                  ) : (
                    'university' in profile && (
                      <div className="space-y-2">
                        <Label htmlFor="university">Universidade</Label>
                        <Input
                          id="university"
                          value={profile.university}
                          onChange={(e) => handleSaveProfile({ university: e.target.value })}
                        />
                      </div>
                    )
                  )}
                </div>
                
                {profile.userType === 'cliente' && 'course' in profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso</Label>
                      <Input
                        id="course"
                        value={profile.course}
                        onChange={(e) => handleSaveProfile({ course: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="semester">Período</Label>
                      <Input
                        id="semester"
                        value={profile.semester}
                        onChange={(e) => handleSaveProfile({ semester: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {profile.userType === 'anunciante' ? "Descrição da Empresa" : "Sobre mim"}
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.userType === 'anunciante' && 'description' in profile 
                      ? profile.description 
                      : 'bio' in profile ? profile.bio || '' : ''}
                    onChange={(e) => {
                      const field = profile.userType === 'anunciante' ? 'description' : 'bio';
                      handleSaveProfile({ [field]: e.target.value });
                    }}
                    placeholder={profile.userType === 'anunciante' ? 
                      "Descreva sua empresa e especializações..." : 
                      "Conte um pouco sobre você..."
                    }
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button disabled={isSaving}>
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
                <CardTitle>
                  {profile.userType === 'anunciante' ? "Meus Imóveis" : "Imóveis Favoritos"}
                </CardTitle>
                <CardDescription>
                  {profile.userType === 'anunciante' ? 
                    "Gerencie seus anúncios de imóveis" : 
                    "Seus imóveis salvos e favoritos"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mensagens" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens</CardTitle>
                <CardDescription>
                  Converse com {profile.userType === 'anunciante' ? "potenciais inquilinos" : "proprietários"}
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
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidade em desenvolvimento
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