import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={ROUTES.HOME} className="text-primary hover:underline mb-4 inline-block">
        Voltar para a página principal
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-lg">UniReservas - Plataforma de Aluguel de Imóveis Universitários</p>
        <p className="text-sm text-muted-foreground">Última atualização: 14/09/2025</p>
      </div>
      <p className="mb-4">
        Bem-vindo à nossa Política de Privacidade. Sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos suas informações pessoais.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Informações que coletamos</h2>
      <p className="mb-4">
        Informações Necessárias para Usar a Plataforma Airbnb.
        Nós coletamos dados pessoais sobre você quando você usa a Plataforma Airbnb. Sem esses dados, é possível que não possamos prestar todos os serviços que você solicitar. Esses dados incluem:
      </p>
      <h3 className="text-xl font-semibold mb-2">Informações de Contato, da Conta e do Perfil.</h3>
      <p className="mb-4">
        Como nome, sobrenome, número de telefone, endereço postal, endereço de email, data de nascimento e foto de perfil, dos quais alguns dependerão dos recursos que você usa.
      </p>
      <h3 className="text-xl font-semibold mb-2">Informações de Identidade.</h3>
      <p className="mb-4">
        Quando apropriado, podemos pedir que você envie uma imagem do(s) seu(s) documento(s) de identificação oficial, passaporte, carteira de identidade, CPF ou carteira de motorista (de acordo com as leis aplicáveis) ou outras informações de verificação, como sua data de nascimento, endereço, endereço de email, número de telefone ou identidade digital, e/ou uma selfie quando verificamos seu documento de identificação. Se uma cópia do seu documento de identificação nos for fornecida, coletaremos informações do seu documento. Confira nosso artigo da Central de Ajuda sobre Verificação da sua identidade.
      </p>
      <h3 className="text-xl font-semibold mb-2">Informações de Transação de Pagamento.</h3>
      <p className="mb-4">
        Como conta de pagamento, informações do cartão de crédito, informações da conta bancária, instrumento de pagamento usado, data e hora, valor do pagamento, data de vencimento do instrumento de pagamento e código postal de cobrança, endereço de email do PayPal, número do IBAN, seu endereço e outros detalhes relacionados à transação.
      </p>
      <h3 className="text-xl font-semibold mb-2">Informações de Seguro.</h3>
      <p className="mb-4">
        No momento em que você expressa interesse em adquirir um Plano de Seguro de Viagem, Seguro da Reserva ou Proteção para Estadia ("Seguro"), exigimos determinadas informações pré-contratuais, como nome, endereço da acomodação, endereço residencial, data de nascimento, idade, endereço de email, número de contato, data de início/fim da viagem, custo da viagem, moeda da transação e número da reserva.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Como usamos suas informações</h2>
      <p className="mb-4">
        Podemos tratar essas informações para:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>permitir que você acesse a Plataforma UniReservas e faça e receba pagamentos;</li>
        <li>permitir que você se comunique e interaja com outras pessoas;</li>
        <li>processar e responder ao seu pedido;</li>
        <li>fornecer atendimento a você;</li>
        <li>enviar mensagens, atualizações, alertas de segurança e notificações da conta para você;</li>
        <li>determinar seu país ou estado de residência com base na análise automatizada das informações da sua conta e suas interações com a Plataforma UniReservas, conforme descrito em "Alteração do Seu País ou Estado de Residência";</li>
        <li>permitir seu uso de nossos produtos corporativos e serviços de acomodação.</li>
      </ul>
      <h3 className="text-xl font-semibold mb-2">Melhoria e Desenvolvimento da Plataforma UniReservas.</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>realizar análises, depurações e pesquisas;</li>
        <li>melhorar e desenvolver nossos produtos e serviços;</li>
        <li>fornecer treinamento à equipe de atendimento ao cliente.</li>
      </ul>
      <h3 className="text-xl font-semibold mb-2">Personalização da Plataforma UniReservas.</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>personalizar sua experiência com base em suas interações na Plataforma UniReservas, seu histórico de buscas e reservas, suas informações e preferências de perfil e outras informações que você optar por nos fornecer;</li>
        <li>personalizar sua experiência com o UniReservas.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Compartilhamento de informações</h2>
      <p className="mb-4">
        Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário para fornecer nossos serviços ou conforme exigido por lei.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Seus direitos</h2>
      <p className="mb-4">
        Você pode exercer qualquer um dos direitos descritos nesta seção de acordo com a Lei Geral de Proteção de Dados Pessoais do Brasil.
      </p>
      <h3 className="text-xl font-semibold mb-2">Residentes do Brasil</h3>
      <p className="mb-4">
        De acordo com a Lei Geral de Proteção de Dados Pessoais do Brasil
      </p>
      <h3 className="text-xl font-semibold mb-2">Gerenciamento das Suas Informações.</h3>
      <p className="mb-4">
        Você pode acessar e atualizar alguns de seus dados pessoais através das configurações de sua Conta. Você é responsável por manter seus dados pessoais atualizados.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Alterações nesta política</h2>
      <p className="mb-4">
        Podemos atualizar esta política de tempos em tempos. Notificaremos você sobre alterações significativas publicando a nova política em nosso site.
      </p>
      <p className="mb-4">
        Se você tiver dúvidas sobre esta política, entre em contato conosco.
      </p>
      <div className="text-center mt-8">
        <Link to={ROUTES.HOME} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
          Entendi a Política de Privacidade
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;