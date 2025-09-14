import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";

const FAQPage = () => {
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
              Perguntas Frequentes (FAQ)
            </h1>
            <p className="text-muted-foreground">
              Respostas para as dúvidas mais comuns sobre a plataforma UniReservas.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {currentDate}
            </p>
          </div>
        </div>

        {/* Conteúdo da FAQ */}
        <Card className="mb-8">
          <CardContent className="p-8 space-y-8">
            {/* Pergunta 1 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">1. O que é a UniReservas?</h2>
              <p className="text-muted-foreground">
                A UniReservas é uma plataforma que conecta estudantes universitários a proprietários de imóveis próximos a instituições de ensino superior.
              </p>
            </section>

            {/* Pergunta 2 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">2. Como posso anunciar meu imóvel?</h2>
              <p className="text-muted-foreground">
                Para anunciar seu imóvel, clique na opção "Anunciar imóvel" no menu principal e preencha as informações solicitadas.
              </p>
            </section>

            {/* Pergunta 3 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">3. Como funciona o sistema de avaliações?</h2>
              <p className="text-muted-foreground">
                Os estudantes podem avaliar os imóveis após a estadia, ajudando outros usuários a tomarem decisões informadas.
              </p>
            </section>

            {/* Pergunta 4 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">4. Como posso entrar em contato com o suporte?</h2>
              <p className="text-muted-foreground">
                Você pode entrar em contato com nosso suporte através do e-mail contato@unireservas.com.br ou pelo telefone (85) 3333-4444.
              </p>
            </section>

            {/* Pergunta 5 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">5. Quais são os métodos de pagamento aceitos?</h2>
              <p className="text-muted-foreground">
                Aceitamos pagamentos via transferência bancária, cartão de crédito e boleto. Mais detalhes podem ser encontrados na página de pagamentos.
              </p>
            </section>

            {/* Pergunta 6 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">6. Como posso cancelar minha conta?</h2>
              <p className="text-muted-foreground">
                Para cancelar sua conta, acesse as configurações do perfil e clique na opção "Cancelar conta". Caso precise de ajuda, entre em contato com o suporte.
              </p>
            </section>

            {/* Pergunta 7 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">7. É seguro alugar imóveis pela UniReservas?</h2>
              <p className="text-muted-foreground">
                Sim, a UniReservas utiliza medidas de segurança para proteger seus dados e garantir uma experiência confiável. Recomendamos sempre verificar as avaliações dos imóveis e dos proprietários.
              </p>
            </section>

            {/* Pergunta 8 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">8. Posso alterar meu anúncio após publicá-lo?</h2>
              <p className="text-muted-foreground">
                Sim, você pode editar seu anúncio a qualquer momento acessando a seção "Gerenciar anúncios" no seu perfil.
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

export default FAQPage;