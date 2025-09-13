import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, Users, Home } from "lucide-react";

const TermsOfUsePage = () => {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Termos de Uso
            </h1>
            <p className="text-muted-foreground">
              UniReservas - Plataforma de Aluguel de Imóveis Universitários
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {currentDate}
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-8">
            {/* 1. Aceitação dos Termos */}
            <section>
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Ao acessar e utilizar a plataforma UniReservas, você concorda em cumprir e ficar vinculado aos 
                  presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá 
                  utilizar nossos serviços.
                </p>
                <p>
                  A UniReservas é uma plataforma digital que conecta estudantes universitários a proprietários 
                  de imóveis (kitnets, quartos, apartamentos e casas) localizados próximos a instituições de 
                  ensino superior.
                </p>
              </div>
            </section>

            {/* 2. Definições */}
            <section>
              <h2 className="text-xl font-semibold mb-4">2. Definições</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong className="text-foreground">Plataforma:</strong> O site e aplicativo UniReservas, 
                  incluindo todas as suas funcionalidades e serviços.
                </div>
                <div>
                  <strong className="text-foreground">Usuário Estudante:</strong> Pessoa física, estudante 
                  universitário, que busca acomodação através da plataforma.
                </div>
                <div>
                  <strong className="text-foreground">Usuário Anunciante:</strong> Pessoa física ou jurídica 
                  proprietária de imóveis que anuncia acomodações na plataforma.
                </div>
                <div>
                  <strong className="text-foreground">Imóvel:</strong> Kitnet, quarto, apartamento, casa ou 
                  qualquer tipo de acomodação anunciada na plataforma.
                </div>
              </div>
            </section>

            {/* 3. Serviços Oferecidos */}
            <section>
              <div className="flex items-center mb-4">
                <Home className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">3. Serviços Oferecidos</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>A UniReservas oferece:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Plataforma para busca e anúncio de imóveis universitários</li>
                  <li>Sistema de filtros por localização, preço, tipo de imóvel e universidade</li>
                  <li>Ferramentas de comunicação entre estudantes e anunciantes</li>
                  <li>Sistema de avaliações e comentários sobre imóveis</li>
                  <li>Suporte ao cliente para mediação de conflitos</li>
                </ul>
                <p>
                  <strong className="text-foreground">Importante:</strong> A UniReservas atua exclusivamente 
                  como intermediadora, não sendo responsável pela qualidade dos imóveis, cumprimento de 
                  contratos ou transações financeiras entre as partes.
                </p>
              </div>
            </section>

            {/* 4. Cadastro e Conta do Usuário */}
            <section>
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">4. Cadastro e Conta do Usuário</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="text-foreground font-medium">4.1 Requisitos para Cadastro</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ser maior de 18 anos ou ter representação legal</li>
                  <li>Fornecer informações verdadeiras e atualizadas</li>
                  <li>Possuir documento de identidade válido</li>
                  <li>Para estudantes: comprovante de matrícula em instituição de ensino superior</li>
                  <li>Para anunciantes: documentação que comprove a propriedade do imóvel</li>
                </ul>
                
                <h3 className="text-foreground font-medium mt-4">4.2 Responsabilidades do Usuário</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Manter os dados de cadastro sempre atualizados</li>
                  <li>Não compartilhar credenciais de acesso com terceiros</li>
                  <li>Notificar imediatamente sobre uso não autorizado da conta</li>
                  <li>Utilizar a plataforma de forma ética e legal</li>
                </ul>
              </div>
            </section>

            {/* 5. Obrigações dos Anunciantes */}
            <section>
              <h2 className="text-xl font-semibold mb-4">5. Obrigações dos Anunciantes</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>Fornecer informações verdadeiras sobre os imóveis</li>
                  <li>Possuir documentação legal que comprove a propriedade ou autorização para alugar</li>
                  <li>Manter os imóveis em condições habitáveis e seguras</li>
                  <li>Respeitar as leis de locação vigentes</li>
                  <li>Responder de forma educada e profissional às consultas dos estudantes</li>
                  <li>Atualizar a disponibilidade dos imóveis em tempo real</li>
                  <li>Não praticar discriminação de qualquer natureza</li>
                </ul>
              </div>
            </section>

            {/* 6. Obrigações dos Estudantes */}
            <section>
              <h2 className="text-xl font-semibold mb-4">6. Obrigações dos Estudantes</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>Fornecer informações verdadeiras sobre sua situação acadêmica</li>
                  <li>Tratar os anunciantes e outros usuários com respeito</li>
                  <li>Cumprir os compromissos assumidos com os proprietários</li>
                  <li>Respeitar as regras e condições dos imóveis visitados</li>
                  <li>Comunicar problemas ou irregularidades à plataforma</li>
                  <li>Não utilizar a plataforma para fins fraudulentos</li>
                </ul>
              </div>
            </section>

            {/* 7. Conduta Proibida */}
            <section>
              <h2 className="text-xl font-semibold mb-4">7. Conduta Proibida</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>É expressamente proibido:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Publicar informações falsas ou enganosas</li>
                  <li>Utilizar a plataforma para atividades ilegais</li>
                  <li>Assediar, ameaçar ou discriminar outros usuários</li>
                  <li>Tentar burlar os sistemas de segurança da plataforma</li>
                  <li>Criar múltiplas contas para o mesmo usuário</li>
                  <li>Solicitar pagamentos fora da plataforma para evitar taxas</li>
                  <li>Publicar conteúdo ofensivo, pornográfico ou inadequado</li>
                  <li>Fazer spam ou enviar mensagens não solicitadas</li>
                </ul>
              </div>
            </section>

            {/* 8. Taxas e Pagamentos */}
            <section>
              <h2 className="text-xl font-semibold mb-4">8. Taxas e Pagamentos</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="text-foreground font-medium">8.1 Taxas da Plataforma</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>O cadastro e busca de imóveis são gratuitos para estudantes</li>
                  <li>Anunciantes podem ter taxas sobre transações concluídas</li>
                  <li>Serviços premium podem ter custos adicionais</li>
                </ul>
                
                <h3 className="text-foreground font-medium mt-4">8.2 Transações</h3>
                <p>
                  As transações financeiras entre estudantes e anunciantes são de responsabilidade 
                  exclusiva das partes envolvidas. A UniReservas não é responsável por pagamentos, 
                  depósitos ou questões financeiras relacionadas aos aluguéis.
                </p>
              </div>
            </section>

            {/* 9. Privacidade e Proteção de Dados */}
            <section>
              <h2 className="text-xl font-semibold mb-4">9. Privacidade e Proteção de Dados</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  A UniReservas está comprometida com a proteção dos dados pessoais dos usuários, 
                  seguindo as diretrizes da Lei Geral de Proteção de Dados (LGPD).
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Coletamos apenas dados necessários para o funcionamento da plataforma</li>
                  <li>Não compartilhamos dados pessoais com terceiros sem consentimento</li>
                  <li>Implementamos medidas de segurança para proteger as informações</li>
                  <li>Os usuários podem solicitar a exclusão de seus dados a qualquer momento</li>
                </ul>
              </div>
            </section>

            {/* 10. Limitação de Responsabilidade */}
            <section>
              <h2 className="text-xl font-semibold mb-4">10. Limitação de Responsabilidade</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>A UniReservas não se responsabiliza por:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Qualidade, segurança ou condições dos imóveis anunciados</li>
                  <li>Cumprimento de contratos entre estudantes e anunciantes</li>
                  <li>Ações ou omissões dos usuários da plataforma</li>
                  <li>Perdas ou danos resultantes do uso da plataforma</li>
                  <li>Interrupções temporárias no serviço</li>
                  <li>Conflitos entre usuários</li>
                </ul>
              </div>
            </section>

            {/* 11. Suspensão e Cancelamento */}
            <section>
              <h2 className="text-xl font-semibold mb-4">11. Suspensão e Cancelamento</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="text-foreground font-medium">11.1 Pela UniReservas</h3>
                <p>
                  Reservamo-nos o direito de suspender ou cancelar contas que violem estes termos, 
                  sem aviso prévio e sem reembolso de taxas pagas.
                </p>
                
                <h3 className="text-foreground font-medium mt-4">11.2 Pelo Usuário</h3>
                <p>
                  Os usuários podem cancelar suas contas a qualquer momento através das 
                  configurações da plataforma ou entrando em contato conosco.
                </p>
              </div>
            </section>

            {/* 12. Modificações dos Termos */}
            <section>
              <h2 className="text-xl font-semibold mb-4">12. Modificações dos Termos</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  A UniReservas pode modificar estes Termos de Uso a qualquer momento. As alterações 
                  entrarão em vigor imediatamente após a publicação na plataforma. É responsabilidade 
                  do usuário verificar periodicamente os termos atualizados.
                </p>
                <p>
                  O uso continuado da plataforma após modificações constitui aceitação dos novos termos.
                </p>
              </div>
            </section>

            {/* 13. Lei Aplicável */}
            <section>
              <h2 className="text-xl font-semibold mb-4">13. Lei Aplicável e Foro</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Estes Termos de Uso são regidos pelas leis brasileiras. Quaisquer disputas 
                  serão resolvidas no foro da comarca de Belo Horizonte, Estado de Minas Gerais.
                </p>
              </div>
            </section>

            {/* 14. Contato */}
            <section>
              <h2 className="text-xl font-semibold mb-4">14. Contato</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Para esclarecimentos sobre estes Termos de Uso, entre em contato:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong className="text-foreground">UniReservas</strong></p>
                  <p>Email: contato@unireservas.com.br</p>
                  <p>Telefone: (85) 3333-4444</p>
                  <p>Endereço: Fortaleza, CE - Brasil</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Botão de aceitação */}
        <div className="text-center">
          <Button 
            onClick={() => window.history.back()}
            className="px-8"
          >
            Entendi os Termos de Uso
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

export default TermsOfUsePage;