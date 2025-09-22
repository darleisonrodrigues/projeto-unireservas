// projeto-unireservas/src/pages/LoginPage.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuthFirebase } from "@/contexts/AuthFirebaseContext";
import { Separator } from "@/components/ui/separator";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple } = useAuthFirebase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted with data:", {
      email: formData.email,
      password: "***",
    });

    // Validação básica
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, digite um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting login process...");
      await login(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      console.log("✅ Login successful");

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
        variant: "default",
      });

      // Limpar formulário
      setFormData({ email: "", password: "" });

      // Redirecionar para página inicial
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("Erro no login:", error);

      let errorTitle = "Erro no login";
      let errorDescription = "Verifique suas credenciais e tente novamente.";

      if (error instanceof Error) {
        errorDescription = error.message;

        if (
          error.message.includes("conexão") ||
          error.message.includes("rede")
        ) {
          errorTitle = "Erro de conexão";
        } else if (error.message.includes("servidor")) {
          errorTitle = "Erro do servidor";
        } else if (
          error.message.includes("credenciais") ||
          error.message.includes("senha")
        ) {
          errorTitle = "Credenciais inválidas";
        } else if (error.message.includes("sessão")) {
          errorTitle = "Sessão expirada";
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
        variant: "default",
      });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro ao fazer login com Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithApple();
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
        variant: "default",
      });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("Erro no login com Apple:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro ao fazer login com Apple",
        variant: "destructive",
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
              <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
              <CardDescription>
                Acesse sua conta para encontrar ou anunciar imóveis
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:underline"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </Button>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Não tem uma conta?{" "}
                </span>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="text-primary hover:underline font-medium"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Cadastre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
