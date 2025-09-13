# 🗂️ Estrutura de Rotas e Páginas - Uni Reservas

## 📋 Visão Geral

A estrutura de roteamento foi reorganizada para ser mais escalável, organizável e fácil de manter. O sistema foi dividido por contextos/funcionalidades específicas.

## 🏗️ Nova Estrutura de Pastas

```
src/
├── config/
│   └── routes.ts                 # ⚙️ Configuração central de todas as rotas
├── routes/
│   └── AppRoutes.tsx            # 🛣️ Sistema de roteamento centralizado
├── pages/
│   ├── HomePage.tsx             # 🏠 Página inicial (antiga Index.tsx)
│   ├── NotFound.tsx             # ❌ Página 404
│   ├── auth/                    # 🔐 Páginas de autenticação
│   │   ├── LoginPage.tsx        # ✅ Login
│   │   └── RegisterPage.tsx     # ✅ Cadastro
│   ├── properties/              # 🏘️ Páginas relacionadas a imóveis
│   │   ├── PropertiesListPage.tsx  # ✅ Lista de imóveis
│   │   ├── PropertyDetailsPage.tsx # 🚧 Detalhes do imóvel
│   │   └── FavoritesPage.tsx    # 🚧 Favoritos
│   ├── listings/                # 📋 Páginas de anúncios (proprietários)
│   │   ├── CreateListing.tsx    # ✅ Criar anúncio
│   │   ├── ManageListings.tsx   # 🚧 Gerenciar anúncios
│   │   └── ListingAnalytics.tsx # 🚧 Analytics
│   ├── profile/                 # 👤 Páginas de perfil
│   │   ├── ProfilePage.tsx      # ✅ Perfil principal
│   │   └── ProfileSettings.tsx  # 🚧 Configurações
│   └── messages/                # 💬 Sistema de mensagens
│       ├── InboxPage.tsx        # 🚧 Caixa de entrada
│       └── ChatPage.tsx         # 🚧 Chat individual
```

## 🛣️ Rotas Organizadas

### **Principais**
- `/` - Página inicial
- `/404` - Página não encontrada

### **Autenticação** (`/auth/*`)
- `/auth/login` - Login
- `/auth/register` - Cadastro
- `/auth/forgot-password` - Esqueci senha
- `/auth/reset-password` - Redefinir senha

### **Imóveis** (`/properties/*`)
- `/properties` - Lista de imóveis
- `/properties/search` - Busca de imóveis
- `/properties/:id` - Detalhes do imóvel
- `/properties/favorites` - Favoritos

### **Anúncios** (`/listings/*`)
- `/listings/create` - Criar anúncio
- `/listings/manage` - Gerenciar anúncios
- `/listings/:id/edit` - Editar anúncio
- `/listings/analytics` - Analytics

### **Perfil** (`/profile/*`)
- `/profile/client` - Perfil do estudante
- `/profile/advertiser` - Perfil do anunciante
- `/profile/settings` - Configurações
- `/profile/edit` - Editar perfil

### **Mensagens** (`/messages/*`)
- `/messages` - Caixa de entrada
- `/messages/:userId` - Chat com usuário
- `/notifications` - Notificações

## 🔧 Como Usar

### **1. Navegação Type-Safe**
```typescript
import { ROUTES, navigate } from '@/config/routes';

// Uso básico
window.location.href = ROUTES.AUTH.LOGIN;

// Com React Router
navigate.login();
navigate.propertyDetails('123');
```

### **2. Adicionando Nova Rota**

**1. Adicione em `config/routes.ts`:**
```typescript
export const ROUTES = {
  // ... rotas existentes
  NOVA_SECAO: {
    PAGINA: '/nova-secao/pagina',
  }
};
```

**2. Crie a página em `pages/nova-secao/`:**
```typescript
// src/pages/nova-secao/PaginaExample.tsx
const PaginaExample = () => {
  return <div>Nova página</div>;
};
export default PaginaExample;
```

**3. Adicione em `routes/AppRoutes.tsx`:**
```typescript
import PaginaExample from '@/pages/nova-secao/PaginaExample';

// Dentro de <Routes>
<Route path={ROUTES.NOVA_SECAO.PAGINA} element={<PaginaExample />} />
```

## 🎯 Benefícios

### **✅ Para Desenvolvedores**
- **Organização clara** por contexto/funcionalidade
- **Type-safety** nas rotas com TypeScript
- **Fácil manutenção** - rotas centralizadas
- **Navegação consistente** com helpers
- **Escalabilidade** - estrutura preparada para crescimento

### **✅ Para o Projeto**
- **URLs semânticas** e SEO-friendly
- **Backward compatibility** - rotas antigas mantidas
- **Estrutura profissional** seguindo melhores práticas
- **Documentação clara** para novos desenvolvedores

## 🔄 Migração de Rotas Antigas

As rotas antigas foram mantidas para compatibilidade:
- `/create-listing` → mantida + nova `/listings/create`
- `/profile` → mantida + novas `/profile/client` e `/profile/advertiser`

## 📚 Próximos Passos

1. **🚧 Implementar páginas em desenvolvimento** (marcadas com 🚧)
2. **🔐 Adicionar autenticação e proteção de rotas**
3. **🎨 Implementar lazy loading** para otimização
4. **📱 Adicionar rotas específicas para mobile**
5. **🔍 Implementar breadcrumbs** baseados nas rotas

## 💡 Convenções

- **Páginas**: sempre terminam com `Page.tsx` (ex: `LoginPage.tsx`)
- **Pastas**: organização por contexto/funcionalidade
- **Rotas**: sempre em UPPER_CASE no arquivo de config
- **URLs**: kebab-case para consistência (`/create-listing`)

---

Esta estrutura torna o projeto mais profissional, escalável e fácil de manter! 🚀