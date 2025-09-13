import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";

const LoginPage = () => {
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
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Link 
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              
              <Button className="w-full" size="lg">
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <Link 
                  to={ROUTES.AUTH.REGISTER}
                  className="text-primary hover:underline font-medium"
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