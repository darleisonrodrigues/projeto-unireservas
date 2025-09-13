import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, ArrowRight, GraduationCap, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useState } from "react";

const RegisterPage = () => {
  const [userType, setUserType] = useState<'client' | 'advertiser'>('client');

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
              {/* Tipo de usuário */}
              <div className="space-y-2">
                <Label>Você é:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={userType === 'client' ? 'default' : 'outline'}
                    onClick={() => setUserType('client')}
                    className="h-12"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Estudante
                  </Button>
                  <Button
                    variant={userType === 'advertiser' ? 'default' : 'outline'}
                    onClick={() => setUserType('advertiser')}
                    className="h-12"
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
                    placeholder={userType === 'advertiser' ? 'Nome da sua empresa' : 'Seu nome completo'}
                    className="pl-10"
                  />
                </div>
              </div>
              
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
              
              {userType === 'client' && (
                <div className="space-y-2">
                  <Label htmlFor="university">Universidade</Label>
                  <Select>
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
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button className="w-full" size="lg">
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
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