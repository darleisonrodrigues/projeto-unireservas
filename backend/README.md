# UniReservas Backend

Em-Desenvolvimento 95%
Backend Python com FastAPI e Firebase Firestore para o sistema de reservas.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **Firebase Firestore** - Banco de dados NoSQL em tempo real (Adicionado auth por token)
- **Pydantic** - Validação de dados e serialização
- **Python 3.8+** - Linguagem de programação

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   ├── __init__.py
│   ├── firebase_config.py    # Configuração do Firebase
│   └── settings.py           # Configurações da aplicação
├── models/
│   ├── __init__.py
│   ├── property.py           # Modelos de propriedades
│   ├── listing.py            # Modelos de anúncios
│   └── profile.py            # Modelos de usuários
├── services/
│   ├── __init__.py
│   ├── property_service.py   # Lógica de negócio para propriedades
│   ├── listing_service.py    # Lógica de negócio para anúncios
│   └── profile_service.py    # Lógica de negócio para usuários
├── routers/
│   ├── __init__.py
│   ├── auth.py               # Rotas de autenticação
│   ├── properties.py         # Rotas de propriedades
│   ├── listings.py           # Rotas de anúncios
│   └── profiles.py           # Rotas de perfis
├── testes_realizados/
│   ├── check_emails.py       # Testes de email
│   ├── clear_users.py        # Limpeza de usuários
│   ├── populate_database.py  # Popular banco de dados
│   ├── test_api.py           # Testes de API
│   ├── test_database.py      # Testes de banco
│   └── test_register.py      # Testes de registro
├── utils/
│   ├── __init__.py
│   └── auth.py               # Utilitários de autenticação
├── main.py                   # Aplicação principal
├── run.py                    # Script de execução
├── requirements.txt          # Dependências Python
├── .env.example              # Exemplo de variáveis de ambiente
├── INSTRUCOES.md             # Instruções de uso
├── README.md                 # Este arquivo
└── Makefile                  # Comandos automatizados
```

## 🔧 Configuração

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative o Firestore Database
4. Vá em "Configurações do projeto" > "Contas de serviço"
5. Gere uma nova chave privada (arquivo JSON)
6. Salve o arquivo como `firebase-credentials.json` na pasta `backend/`

**OU** configure as variáveis de ambiente (recomendado para produção):

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Firebase:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-chave-privada-aqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40seu-projeto.iam.gserviceaccount.com

# JWT Configuration
SECRET_KEY=sua-chave-jwt-super-segura-aqui

# CORS Configuration
ALLOWED_ORIGINS=https://site-unireservas-ykc4.onrender.com/
```

## 🚀 Executar o servidor

```bash
# Modo desenvolvimento
cd backend
python main.py

# OU usando uvicorn diretamente
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

O servidor estará disponível em:
- **API**: http://localhost:8002
- **Documentação**: http://localhost:8002/docs
- **Redoc**: http://localhost:8002/redoc

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Propriedades
- `GET /api/properties/` - Listar propriedades
- `POST /api/properties/` - Criar propriedade (anunciantes)
- `GET /api/properties/{id}` - Obter propriedade específica
- `PUT /api/properties/{id}` - Atualizar propriedade
- `DELETE /api/properties/{id}` - Deletar propriedade
- `GET /api/properties/my` - Minhas propriedades
- `POST /api/properties/{id}/favorite` - Alternar favorito

### Listings
- `GET /api/listings/` - Listar listings
- `POST /api/listings/` - Criar listing (anunciantes)
- `GET /api/listings/{id}` - Obter listing específico
- `PUT /api/listings/{id}` - Atualizar listing
- `DELETE /api/listings/{id}` - Deletar listing
- `GET /api/listings/my` - Meus listings
- `POST /api/listings/{id}/photos` - Upload de fotos

### Perfis
- `GET /api/profiles/me` - Meu perfil
- `PUT /api/profiles/me` - Atualizar meu perfil
- `GET /api/profiles/{id}` - Perfil público de usuário
- `POST /api/profiles/favorites/{property_id}` - Adicionar favorito
- `DELETE /api/profiles/favorites/{property_id}` - Remover favorito
- `GET /api/profiles/favorites/list` - Listar favoritos

## 👥 Tipos de Usuário

### Estudante (`cliente`)
- Pode buscar e visualizar propriedades/listings
- Pode favoritar propriedades
- Pode atualizar seu perfil e preferências

### Anunciante (`anunciante`)
- Pode criar, editar e deletar propriedades/listings
- Pode fazer upload de fotos
- Pode visualizar estatísticas de seus anúncios

## 🗄️ Estrutura do Banco (Firestore)

### Collections:

**users**
- Perfis de usuários (estudantes e anunciantes)
- Autenticação e dados pessoais

**properties**
- Propriedades cadastradas pelos anunciantes
- Informações básicas como preço, localização, etc.

**listings**
- Anúncios detalhados das propriedades
- Descrições, fotos, amenidades, etc.

**user_favorites**
- Propriedades favoritadas pelos estudantes

## 🧪 Desenvolvimento

### Executar testes
```bash
pytest
```

### Formato do código
```bash
black .
flake8 .
```

## 📝 Próximos Passos

- [ ] Implementar upload de imagens para Firebase Storage
- [ ] Adicionar sistema de mensagens entre usuários
- [ ] Implementar notificações push
- [ ] Adicionar sistema de avaliações
- [ ] Implementar busca full-text
- [ ] Adicionar cache com Redis
- [ ] Implementar logging estruturado
- [ ] Adicionar monitoramento e métricas

## 🐛 Troubleshooting

### Se caso tiver ERRO de conexão com Firebase
- Verifique se as credenciais estão corretas
- Confirme se o Firestore está ativado no projeto
- Verifique se as regras de segurança permitem leitura/escrita

### Se caso em ERRO de CORS
- Adicione a URL do frontend em `ALLOWED_ORIGINS`
- Verifique se o frontend está fazendo requests para a URL correta

### Caso ERRO de token JWT
- Verifique se o `SECRET_KEY` está configurado
- Confirme se o token não expirou
- Verifique se o header `Authorization` está correto