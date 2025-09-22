# Modificações Recentes no Backend

## Estrutura de Pastas
- Adicionado arquivo `run.py` para execução simplificada do backend.
- Adicionado `Makefile` para comandos automatizados.
- Adicionado arquivo `INSTRUCOES.md` com instruções de uso.

## Serviços e APIs
- **Endpoints migrados para porta 8000** (`http://localhost:8000/api/...`).
- Novos endpoints para:
	- Deleção de propriedades (`DELETE /api/properties/{id}`)
	- Deleção e reordenação de imagens de propriedades
	- Upload de imagens com validação e preview
	- Gerenciamento de reservas e interesses em imóveis
- Refatoração dos serviços para maior compatibilidade com frontend e integração com Firebase Authentication.

## Modelos e Tipos
- Ajustes nos tipos de propriedade (`Property`) para suportar ordenação, filtragem e compatibilidade com componentes do frontend.
- Novos tipos para filtragem e ordenação de propriedades (`FilterState`, `SortOption`).

## Funcionalidades Novas
- Implementação de drag-and-drop para reordenação de imagens de imóveis.
- Adição de zona de perigo para deleção de anúncios.
- Novas abas de reservas e interesses no perfil do usuário (estudante e anunciante).
- Modais para reserva e demonstração de interesse em imóveis.

## Integração
- Integração total dos serviços com Firebase Authentication.
- Ajuste dos endpoints para garantir CORS e evitar problemas de cache.

## Observações
- Todos os endpoints e serviços agora utilizam a porta 8000.
- A estrutura do projeto está mais modular e preparada para escalabilidade.
- Novos scripts e utilitários facilitam testes e manutenção do backend.

---

Essas modificações tornam o backend mais robusto, seguro e alinhado com as necessidades.