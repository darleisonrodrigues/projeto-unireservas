# Script para facilitar o desenvolvimento

# Instalar dependências
install:
	pip install -r requirements.txt

# Executar servidor de desenvolvimento
dev:
	python main.py

# Executar com uvicorn
serve:
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Executar testes
test:
	pytest

# Formatar código
format:
	black .
	isort .

# Verificar linting
lint:
	flake8 .
	mypy .

# Limpar cache Python
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

# Setup completo para desenvolvimento
setup: install
	@echo "Backend setup completo!"
	@echo "1. Configure o arquivo .env com suas credenciais Firebase"
	@echo "2. Execute 'make dev' para iniciar o servidor"
	@echo "3. Acesse http://localhost:8000/docs para ver a documentação"

.PHONY: install dev serve test format lint clean setup