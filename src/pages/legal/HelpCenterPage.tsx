import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";

const HelpCenterPage = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Central de Ajuda
            </h1>
            <p className="text-muted-foreground">
              Encontre respostas para suas dúvidas sobre a plataforma UniReservas.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {currentDate}
            </p>
          </div>
        </div>

        {/* Conteúdo da Central de Ajuda */}
        <Card className="mb-8">
          <CardContent className="p-8 space-y-8">
            {/* Seção 1 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Como funciona a UniReservas?</h2>
              <p className="text-muted-foreground">
                A UniReservas conecta estudantes universitários a proprietários de imóveis próximos a instituições de ensino superior. Você pode buscar acomodações, filtrar por localização, preço e muito mais.
              </p>
            </section>

            {/* Seção 2 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">2. Como criar uma conta?</h2>
              <p className="text-muted-foreground">
                Para criar uma conta, clique em "Registrar" na página inicial e preencha as informações solicitadas. Certifique-se de usar um e-mail válido.
              </p>
            </section>

            {/* Seção 3 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">3. Como entrar em contato com o suporte?</h2>
              <p className="text-muted-foreground">
                Você pode entrar em contato com nosso suporte através do e-mail contato@unireservas.com.br ou pelo telefone (85) 3333-4444.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Botão de voltar */}
        <div className="text-center">
          <Button 
            onClick={() => window.history.back()}
            className="px-8"
          >
            Voltar para a página anterior
          </Button>
        </div>
      </main>

      {/* Footer simplificado */}
      <footer className="bg-muted/30 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 UniReservas. Todos os direitos reservados.</p>
            <p className="mt-2">
              Plataforma dedicada a conectar estudantes aos melhores imóveis universitários.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenterPage;