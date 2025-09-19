# 🚀 GUIA PRÁTICO DE IMPLEMENTAÇÃO BACKEND - UniReservas

## 📋 RESUMO EXECUTIVO

O frontend está **100% funcional** com dados mockados. Este guia mostra exatamente onde e como substituir os mocks por integrações reais com banco de dados.

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### 🥇 **PRIORIDADE 1: Sistema de Autenticação**
### 🥈 **PRIORIDADE 2: Criação de Anúncios** 
### 🥉 **PRIORIDADE 3: Sistema de Filtros e Busca**

---

## 🔐 1. SISTEMA DE AUTENTICAÇÃO (PRIORIDADE 1)

### **📍 Local no Frontend:**
- **Arquivo:** `src/pages/auth/LoginPage.tsx`
- **Linhas:** 61-94

### **🔄 O que substituir:**
```typescript
// ATUAL (mock):
await new Promise(resolve => setTimeout(resolve, 1500));
toast({ title: "Login realizado!" });
navigate(ROUTES.HOME);

// IMPLEMENTAR (real):
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: formData.email,
    password: formData.password
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  toast({ title: "Login realizado!" });
  navigate(ROUTES.HOME);
} else {
  toast({ title: "Erro", description: data.message, variant: "destructive" });
}
```

### **🗄️ Estrutura do Banco - Tabela `users`:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type ENUM('cliente', 'anunciante') NOT NULL,
  profile_image VARCHAR(500),
  
  -- Campos específicos para estudantes
  university VARCHAR(255),
  course VARCHAR(255),
  semester VARCHAR(50),
  bio TEXT,
  
  -- Campos específicos para anunciantes
  company_name VARCHAR(255),
  cnpj VARCHAR(20),
  description TEXT,
  address TEXT,
  website VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **📡 Endpoints necessários:**
```
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
GET  /api/auth/me
```

---

## 🏠 2. CRIAÇÃO DE ANÚNCIOS (PRIORIDADE 2)

### **📍 Local no Frontend:**
- **Arquivo:** `src/pages/listings/CreateListing.tsx`
- **Linhas:** 79-103

### **📝 Dados do Formulário (já capturados):**
```typescript
interface ListingFormData {
  title: string;           // Título do anúncio
  type: PropertyType;      // 'kitnet' | 'quarto' | 'apartamento'
  price: number;           // Preço em reais
  description: string;     // Descrição detalhada
  address: string;         // Endereço completo
  neighborhood: string;    // Bairro
  university: string;      // Universidade próxima
  distance: string;        // Distância da universidade
  capacity: number;        // Capacidade de pessoas
  amenities: string[];     // ['wifi', 'garagem', 'mobiliado', etc.]
  photos: File[];          // Array de arquivos de imagem
}
```

### **🔄 O que implementar:**
```typescript
// SUBSTITUIR as linhas 79-103 por:
const formDataToSend = new FormData();

// Adicionar dados do formulário
Object.entries(formData).forEach(([key, value]) => {
  if (key === 'photos') {
    value.forEach((photo: File, index: number) => {
      formDataToSend.append(`photos[${index}]`, photo);
    });
  } else if (key === 'amenities') {
    formDataToSend.append('amenities', JSON.stringify(value));
  } else {
    formDataToSend.append(key, String(value));
  }
});

// Adicionar ID do usuário logado
const user = JSON.parse(localStorage.getItem('user') || '{}');
formDataToSend.append('user_id', user.id);

const response = await fetch('/api/listings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: formDataToSend
});

const result = await response.json();
if (result.success) {
  toast({ title: "Anúncio criado com sucesso!" });
  navigate('/listings/manage'); // ou onde você quiser redirecionar
} else {
  toast({ title: "Erro", description: result.message, variant: "destructive" });
}
```

### **🗄️ Estrutura do Banco - Tabela `properties`:**
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('kitnet', 'quarto', 'apartamento') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  address TEXT NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  university VARCHAR(255) NOT NULL,
  distance VARCHAR(100),
  capacity INTEGER NOT NULL,
  amenities JSON, -- ['wifi', 'garagem', 'mobiliado']
  images JSON,    -- ['url1.jpg', 'url2.jpg', 'url3.jpg']
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **📡 Endpoint necessário:**
```
POST /api/listings
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

---

## 🔍 3. SISTEMA DE FILTROS E BUSCA (PRIORIDADE 3)

### **📍 Local no Frontend:**
- **Arquivo:** `src/contexts/PropertyContext.tsx`
- **Linhas:** 4, 23-24, 192

### **🔄 Filtros disponíveis no frontend:**
```typescript
interface FilterState {
  searchTerm: string;      // Busca por texto
  location: string;        // Localização/bairro
  priceRange: string;      // "0-500", "500-1000", etc.
  propertyType: string;    // "kitnet", "quarto", "apartamento"
  amenities: string[];     // ["wifi", "garagem", "mobiliado"]
  sortBy: string;         // "price_asc", "price_desc", "recent"
}
```

### **🔄 O que substituir:**
```typescript
// SUBSTITUIR linha 192 em PropertyContext.tsx:
// const [properties, setProperties] = useState<Property[]>(mockProperties);

// POR:
const [properties, setProperties] = useState<Property[]>([]);
const [isLoading, setIsLoading] = useState(false);

// Adicionar função para buscar propriedades:
const fetchProperties = async (filters: FilterState) => {
  setIsLoading(true);
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.priceRange) queryParams.append('price_range', filters.priceRange);
    if (filters.propertyType) queryParams.append('type', filters.propertyType);
    if (filters.amenities.length) queryParams.append('amenities', JSON.stringify(filters.amenities));
    if (filters.sortBy) queryParams.append('sort', filters.sortBy);
    
    const response = await fetch(`/api/properties?${queryParams.toString()}`);
    const data = await response.json();
    
    if (data.success) {
      setProperties(data.data);
    }
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
  } finally {
    setIsLoading(false);
  }
};

// Chamar fetchProperties sempre que os filtros mudarem
useEffect(() => {
  fetchProperties(filters);
}, [filters]);
```

### **📡 Endpoint necessário:**
```
GET /api/properties?search=kitnet&location=pampulha&price_range=500-1000&type=kitnet&amenities=["wifi","garagem"]&sort=price_asc
```

### **🗄️ Consulta SQL de exemplo:**
```sql
SELECT * FROM properties 
WHERE 
  (title ILIKE '%kitnet%' OR description ILIKE '%kitnet%') -- search
  AND neighborhood ILIKE '%pampulha%' -- location
  AND price BETWEEN 500 AND 1000 -- price_range
  AND type = 'kitnet' -- type
  AND amenities::jsonb ?& ARRAY['wifi', 'garagem'] -- amenities
  AND available = true
ORDER BY price ASC; -- sort
```

---

## 📂 4. UPLOAD DE IMAGENS

### **🔧 Configuração necessária:**
```javascript
// Backend (Node.js/Express exemplo)
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/properties/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Rota para criação de listings
app.post('/api/listings', upload.array('photos', 10), async (req, res) => {
  try {
    const imagePaths = req.files.map(file => `/uploads/properties/${file.filename}`);
    
    // Salvar no banco de dados
    const listing = await createListing({
      ...req.body,
      images: imagePaths,
      user_id: req.user.id
    });
    
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## 🔧 5. CHECKLIST DE IMPLEMENTAÇÃO

### **✅ Autenticação**
- [ ] Criar tabela `users` no banco
- [ ] Implementar hash de senhas (bcrypt)
- [ ] Implementar JWT tokens
- [ ] Criar endpoint `POST /api/auth/login`
- [ ] Criar endpoint `POST /api/auth/register`
- [ ] Middleware de autenticação

### **✅ Criação de Anúncios**
- [ ] Criar tabela `properties` no banco
- [ ] Configurar upload de múltiplas imagens
- [ ] Criar endpoint `POST /api/listings`
- [ ] Validação de dados do formulário
- [ ] Compressão/redimensionamento de imagens

### **✅ Sistema de Filtros**
- [ ] Criar endpoint `GET /api/properties` com query params
- [ ] Implementar busca por texto (ILIKE/FULLTEXT)
- [ ] Implementar filtros por preço, tipo, localização
- [ ] Implementar ordenação (preço, data)
- [ ] Paginação de resultados

### **✅ Extras**
- [ ] Middleware de autenticação
- [ ] Validação de entrada (joi/yup)
- [ ] Logs de auditoria
- [ ] Backup automático de imagens
- [ ] Rate limiting

---

## 🎯 RESUMO PARA O DESENVOLVEDOR

**3 arquivos principais para modificar no frontend:**

1. **`src/pages/auth/LoginPage.tsx`** (linhas 61-94) → Autenticação real
2. **`src/pages/listings/CreateListing.tsx`** (linhas 79-103) → Criação de anúncios
3. **`src/contexts/PropertyContext.tsx`** (linhas 4, 192) → Busca e filtros

**Banco de dados:** 2 tabelas principais (`users`, `properties`)

**APIs:** 4 endpoints principais (`/auth/login`, `/auth/register`, `/listings`, `/properties`)

**O frontend já está 100% pronto - só precisa trocar os mocks por chamadas reais! 🚀**

===========================

## 🎯 RESUMO PARA OS DEVS

**Backend 50% finalizado**
=============================