# Modificações no Repositório `projeto-unireservas`

Este documento descreve as alterações realizadas no repositório `projeto-unireservas` em relação ao estado original.

## Modificações Gerais
- **Refatoração de Serviços**: Os serviços de autenticação, listagem, perfil e propriedades foram refatorados para utilizar o Firebase Authentication e simplificar a lógica de autenticação.
- **Atualização de Dependências**: Algumas dependências foram ajustadas, como o uso de `@vitejs/plugin-react` no lugar de `@vitejs/plugin-react-swc`.
- **Correções de Tipos**: Ajustes nos tipos TypeScript para maior compatibilidade com o backend.

## Alterações Específicas

### Arquivo `src/services/authService.ts`
- Substituição do `TokenManager` por uma classe `AuthService` que utiliza o Firebase Authentication.
- Adição de métodos para login, logout e restauração de sessão a partir do `localStorage`.
- Remoção de funções relacionadas a tokens de atualização e renovação.

### Arquivo `src/services/listingService.ts`
- Substituição do `TokenManager` por `authFirebaseService` para gerenciar tokens de autenticação.
- Ajustes nos métodos de upload de imagens e listagem de propriedades.

### Arquivo `src/services/profileService.ts`
- Refatoração completa para utilizar o Firebase Authentication.
- Adição de métodos para buscar, atualizar e deletar o perfil do usuário logado.
- Remoção de métodos antigos que utilizavam `TokenManager`.

### Arquivo `src/services/propertyService.ts`
- Refatoração para utilizar `authFirebaseService`.
- Adição de novos métodos para buscar propriedades, criar, atualizar e deletar propriedades.
- Ajustes nos headers de autenticação para suportar `FormData`.

### Arquivo `src/types/profile.ts`
- Ajustes nos tipos `StudentProfile` e `AdvertiserProfile` para maior compatibilidade com o backend.
- Adição de propriedades opcionais para suportar diferentes formatos de dados (`snake_case` e `camelCase`).

### Arquivo `src/types/property.ts`
- Criação do tipo `PropertyCreate` para representar dados de criação de propriedades.
- Ajustes no tipo `Property` para incluir propriedades opcionais e compatibilidade com o backend.

### Arquivo `tailwind.config.ts`
- Substituição de `require` por `import` para carregar o plugin `tailwindcss-animate`.

### Arquivo `vite.config.ts`
- Substituição de `@vitejs/plugin-react-swc` por `@vitejs/plugin-react`.
- Ajustes no formato de alias para o diretório `src`.

## Conclusão
As alterações realizadas visam melhorar a integração com o Firebase Authentication, simplificar a lógica de autenticação e garantir maior compatibilidade entre o frontend e o backend. Além disso, foram feitos ajustes para melhorar a consistência do código e a experiência do desenvolvedor.