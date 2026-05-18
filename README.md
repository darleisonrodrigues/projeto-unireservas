# 🏠 Sistema de Reservas - UniReservas

<p align="center">
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007acc?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B06A4E?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/FastAPI-005527?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

## 📋 Visão Geral

O sistema de reservas implementado com sucesso, permitindo que estudantes façam reservas de imóveis e anunciantes gerenciem essas solicitações de forma completa e intuitiva.

## ✨ Features em Destaque

👨‍🎓 **Para Estudantes**
- **Exploração Fácil**: Busca inteligente e listagem completa de propriedades para sua moradia ideal.
- **Reservas Inteligentes**: Escolha de datas via calendário, prevenção automática de conflitos com reservas confirmadas e cálculo de dias x preços em tempo real.
- **Gestão de Estadias**: Acompanhamento claro e prático do status (Aguardando, Confirmado ou Rejeitado).
- **Chat Integrado**: Canal de mensagens entre os locatários e locadores.

🏢 **Para Anunciantes**
- **Gestão de Portfólio**: Cadastro das suas moradias contendo regras, limitadores e uploads de imagens.
- **Dashboard de Negócios**: Aprove ou recuse reservas pendentes e verifique ocupações do imóvel por período.
- **Hospedagem de Mídia Refinada**: Suporte robusto a Firebase Storage (com fallback containerizado suportando Docker Volumes).

---

## 🛠 Arquitetura do Projeto

Implementado em um formato **Monorepo** focado em contêineres para *deploy self-hosted*:

- `/src` e `/public`: Aplicação Front-end construída com **React + Vite + Tailwind**.
- `/backend`: API e Regras de Negócio construídas com **Python + FastAPI**, integrando autenticação avançada da Cloud com Firebase.

---

### 👨‍🎓 Para Estudantes

#### 1. **Fazer uma Reserva**
- Acesse a **página principal** ou **detalhes de uma propriedade**
- Clique no botão **"Reservar"** (disponível apenas para estudantes logados)
- Preencha o formulário:
  - **Data de entrada e saída** (usando calendário interativo)
  - **Número de hóspedes** (respeitando capacidade máxima)
  - **Mensagem opcional** para o proprietário
- O **preço total** é calculado automaticamente
- Clique em **"Solicitar Reserva"**

#### 2. **Gerenciar Reservas**
- Acesse **Perfil > Aba "Reservas"**
- Visualize todas suas reservas com:
  - **Status atual** (Pendente, Confirmada, Cancelada, Rejeitada)
  - **Informações da propriedade**
  - **Datas e detalhes da reserva**
  - **Valor total**
- **Cancele reservas pendentes** quando necessário

### 🏢 Para Anunciantes

#### 1. **Gerenciar Solicitações de Reserva**
- Acesse **Perfil > Aba "Reservas"**
- Visualize **dashboard com resumo**:
  - Reservas pendentes
  - Reservas confirmadas
  - Total de reservas

#### 2. **Aprovar/Rejeitar Reservas**
- Na seção **"Reservas Pendentes"**:
  - Visualize informações do solicitante
  - Veja detalhes da reserva (datas, hóspedes, mensagem)
  - Clique em **"Confirmar"** para aprovar
  - Clique em **"Rejeitar"** para recusar

#### 3. **Acompanhar Reservas Ativas**
- Na seção **"Reservas Confirmadas"**:
  - Visualize todas as reservas aprovadas
  - Acesse informações de contato dos hóspedes

## 🔧 Funcionalidades Técnicas

### ✅ Validações Implementadas
- **Conflito de datas**: Sistema impede reservas sobrepostas
- **Capacidade máxima**: Valida número de hóspedes
- **Datas válidas**: Impede reservas no passado
- **Autenticação**: Apenas usuários logados podem fazer reservas
- **Permissões**: Estudantes fazem reservas, anunciantes gerenciam

### 📊 Status de Reservas
- **🟡 Pendente**: Aguardando aprovação do anunciante
- **🟢 Confirmada**: Reserva aprovada pelo anunciante
- **🔴 Cancelada**: Cancelada pelo estudante
- **❌ Rejeitada**: Rejeitada pelo anunciante

### 🔄 Fluxo de Estados
```
Solicitação → Pendente → Confirmada/Rejeitada
     ↓
Cancelada (se pendente)
```

## 🗂️ Estrutura de Arquivos

### Backend
```
backend/
├── models/rental.py              # Modelos de dados de reserva
├── services/reservation_service.py  # Lógica de negócio
├── routers/reservations.py       # Endpoints da API
└── main.py                      # Registro das rotas
```

### Frontend
```
src/
├── types/reservation.ts          # Types TypeScript
├── services/reservationService.ts  # Cliente da API
├── components/
│   ├── ReservationModal.tsx      # Modal de reserva
│   ├── ReservationsTab.tsx       # Aba para estudantes
│   └── AdvertiserReservationsTab.tsx  # Aba para anunciantes
└── pages/properties/
    └── PropertyDetailsPage.tsx   # Página com botão de reserva
```

## 🌐 Endpoints da API

### Reservas
- `POST /api/reservations/` - Criar reserva
- `GET /api/reservations/my` - Listar minhas reservas
- `GET /api/reservations/{id}` - Buscar reserva específica
- `PUT /api/reservations/{id}` - Atualizar reserva
- `PATCH /api/reservations/{id}/cancel` - Cancelar reserva
- `PATCH /api/reservations/{id}/confirm` - Confirmar reserva (anunciantes)
- `PATCH /api/reservations/{id}/reject` - Rejeitar reserva (anunciantes)

## 📱 Interface de Usuário

### Componentes Principais
1. **ReservationModal**: Formulário de criação de reserva
2. **ReservationsTab**: Gerenciamento para estudantes
3. **AdvertiserReservationsTab**: Gerenciamento para anunciantes
4. **PropertyCard**: Botão de reserva nos cards
5. **PropertyDetailsPage**: Botão de reserva na página de detalhes

### Recursos Visuais
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Calendário interativo** para seleção de datas
- ✅ **Badges coloridos** para status
- ✅ **Loading states** para feedback visual
- ✅ **Toasts** para notificações
- ✅ **Validação em tempo real**

### **Fluxo de Teste Completo**
1. **Crie duas contas**: uma de estudante e uma de anunciante
2. **Como anunciante**: crie uma propriedade
3. **Como estudante**:
   - Acesse a página principal
   - Clique em "Reservar" em uma propriedade
   - Preencha o formulário e solicite reserva
   - Vá para Perfil > Reservas para acompanhar
4. **Como anunciante**:
   - Vá para Perfil > Reservas
   - Confirme ou rejeite a solicitação
5. **Verifique** se o status foi atualizado para o estudante

## 🔐 Segurança

### Validações de Segurança
- ✅ **Autenticação obrigatória** para todas as operações
- ✅ **Validação de propriedade** do anunciante
- ✅ **Verificação de permissões** por tipo de usuário
- ✅ **Sanitização de dados** de entrada
- ✅ **Validação de conflitos** de data no backend