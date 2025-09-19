import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, GraduationCap, Building, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useState } from "react";
import { authService, RegisterData } from "@/services/authService";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  university?: string;
  companyName?: string;
}

const RegisterPage = () => {
  const [userType, setUserType] = useState<'student' | 'advertiser'>('student');
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      university: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, digite um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, confirme sua senha corretamente.",
        variant: "destructive"
      });
      return;
    }

    if (userType === 'student' && !formData.university) {
      toast({
        title: "Universidade obrigatória",
        description: "Por favor, selecione sua universidade.",
        variant: "destructive"
      });
      return;
    }

    if (userType === 'advertiser' && !formData.companyName) {
      toast({
        title: "Nome da empresa obrigatório",
        description: "Por favor, informe o nome da sua empresa.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para o backend
      const registerData: RegisterData = {
        name: userType === 'advertiser' ? (formData.companyName || '') : formData.name,
        email: formData.email,
        password: formData.password,
        userType: userType,
        ...(userType === 'student' && { university: formData.university }),
        ...(userType === 'advertiser' && { companyName: formData.companyName })
      };
      
      const authResponse = await authService.register(registerData);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${authResponse.user.name}!`,
        variant: "default"
      });

      // Redirecionar para página inicial
      navigate(ROUTES.HOME);
      
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Criar conta</CardTitle>
              <CardDescription>
                Junte-se à comunidade Uni Reservas
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Você é:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={userType === 'student' ? 'default' : 'outline'}
                    onClick={() => setUserType('student')}
                    className="h-12"
                    type="button"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Estudante
                  </Button>
                  <Button
                    variant={userType === 'advertiser' ? 'default' : 'outline'}
                    onClick={() => setUserType('advertiser')}
                    className="h-12"
                    type="button"
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Proprietário
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">
                  {userType === 'advertiser' ? 'Nome da empresa' : 'Nome completo'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name={userType === 'advertiser' ? 'companyName' : 'name'}
                    placeholder={userType === 'advertiser' ? 'Nome da sua empresa' : 'Seu nome completo'}
                    className="pl-10"
                    value={userType === 'advertiser' ? formData.companyName || '' : formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {userType === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="university">Universidade</Label>
                  <Select onValueChange={handleSelectChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua universidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ufmg">UFMG</SelectItem>
                      <SelectItem value="puc-mg">PUC Minas</SelectItem>
                      <SelectItem value="fumec">FUMEC</SelectItem>
                      <SelectItem value="una">UNA</SelectItem>
                      <SelectItem value="outras">Outras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    className="pl-10 pr-10"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Criando conta..."
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              </form>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link 
                  to={ROUTES.AUTH.LOGIN}
                  className="text-primary hover:underline font-medium"
                >
                  Faça login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;