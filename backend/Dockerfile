FROM python:3.11-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o resto do código
COPY . .

# Expor a porta que a aplicação vai rodar
EXPOSE 8000

# Comando para rodar a aplicação em modo de produção
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
