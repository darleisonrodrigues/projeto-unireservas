# Observabilidade — UniReservas

Stack completa de **métricas e dashboards** para a API UniReservas, baseada em
**Prometheus + Grafana**, com instrumentação automática do FastAPI e integração
com os testes de carga do **Locust**.

```
tests/observability/
├── docker-compose.observability.yml   # Prometheus, Grafana, exporters
├── .env.example                       # credenciais e URIs configuráveis
├── prometheus/
│   ├── prometheus.yml                 # jobs de scrape
│   └── alerts/
│       └── api_rules.yml              # recording rules + alertas
└── grafana/
    ├── provisioning/
    │   ├── datasources/datasource.yml # datasource Prometheus (auto)
    │   └── dashboards/dashboards.yml  # provider de dashboards (auto)
    └── dashboards/
        ├── 01-api-overview.json       # visão geral (RPS, erros, latência)
        ├── 02-api-endpoints.json      # por endpoint, heatmap, payloads
        ├── 03-python-runtime.json     # CPU/memória/GC do processo
        ├── 04-system-resources.json   # host (node-exporter) + containers (cAdvisor)
        └── 05-locust-loadtest.json    # métricas dos testes de carga
```

## Arquitetura

```
   ┌─────────────┐   /metrics    ┌──────────────┐   PromQL    ┌──────────┐
   │ FastAPI API │◀──────────────│  Prometheus  │◀────────────│ Grafana  │
   │   :8000     │   scrape 15s  │    :9090     │             │  :3000   │
   └─────────────┘               └──────┬───────┘             └──────────┘
                                        │ scrape
   ┌─────────────┐  scrape UI    ┌──────┴───────────┐
   │   Locust    │◀──────────────│ locust-exporter  │
   │   :8089     │               │     :9646        │
   └─────────────┘               └──────────────────┘
   (opcional --profile system: node-exporter :9100 + cAdvisor :8080)
```

## Pré-requisitos

- Docker + Docker Compose
- A API UniReservas precisa expor `/metrics` (já incluso). Instale a dependência:
  ```bash
  cd backend
  pip install -r requirements.txt   # inclui prometheus-fastapi-instrumentator
  ```
  O endpoint é controlado por `METRICS_ENABLED` (default `True`) em `backend/config/settings.py`.

## Como subir

```bash
cd tests/observability
cp .env.example .env          # ajuste credenciais/URIs se desejar

# Stack principal (Prometheus + Grafana + Locust exporter)
docker compose -f docker-compose.observability.yml up -d

# Incluindo métricas de host e containers (node-exporter + cAdvisor)
docker compose -f docker-compose.observability.yml --profile system up -d
```

Acessos:

| Serviço     | URL                     | Credenciais        |
|-------------|-------------------------|--------------------|
| Grafana     | http://localhost:3000   | admin / admin      |
| Prometheus  | http://localhost:9090   | —                  |

Os 5 dashboards são provisionados automaticamente na pasta **UniReservas**
do Grafana — não é preciso importar nada manualmente.

## Rodando com os testes de carga (Locust)

Para alimentar o dashboard de load test, rode o Locust em modo web (porta 8089):

```bash
cd tests/performance/locust
pip install -r requirements.txt
locust -f locustfile.py --web-host 0.0.0.0
```

Abra http://localhost:8089, inicie o teste e acompanhe o dashboard
**UniReservas — Locust Load Test** em tempo real, correlacionando a carga
gerada com a resposta da API nos demais dashboards.

> O `locust-exporter` lê a UI web do Locust no host via `host.docker.internal:8089`.
> Ajuste `LOCUST_URI` no `.env` se o Locust rodar em outro host/porta.

## Dashboards

| Dashboard            | O que mostra |
|----------------------|--------------|
| **API Overview**     | RPS, taxa de erro 5xx, latência p50/p90/p95/p99, requisições em andamento, throughput por status/método, distribuição de status |
| **API Endpoints**    | Top endpoints por throughput, mais lentos (p95), heatmap de latência, erros por endpoint/status, tamanho de resposta — com filtro por endpoint |
| **Python Runtime**   | Memória (RSS/VMS), CPU, file descriptors, coletas e objetos do Garbage Collector, uptime |
| **System & Containers** | CPU/memória/disco/rede do host e CPU/memória por container |
| **Locust Load Test** | Usuários virtuais, RPS, falhas/s, tempos de resposta (p50/p95/média) e estatísticas por endpoint |

## Métricas expostas pela API

A instrumentação (`prometheus-fastapi-instrumentator`) expõe, entre outras:

- `http_requests_total{handler,method,status}` — contador de requisições
- `http_request_duration_seconds_bucket{handler,le}` — histograma de latência
- `http_requests_inprogress{handler,method}` — requisições em andamento
- `unireservas_http_request_size_bytes` / `unireservas_http_response_size_bytes` — tamanho dos payloads
- métricas padrão do processo: `process_*`, `python_gc_*`

## Alertas e recording rules

Definidos em `prometheus/alerts/api_rules.yml`:

- **APIDown** — alvo da API fora do ar por > 1min
- **HighErrorRate** — taxa de erros 5xx > 5% por 2min
- **HighLatencyP95** — latência p95 > 1s por 5min
- **TrafficSpike** — tráfego > 200 req/s por 3min

Para enviar notificações, configure um Alertmanager no bloco `alerting` de
`prometheus.yml`. Os alertas atuais ficam visíveis em
http://localhost:9090/alerts.

## Operação

```bash
# Recarregar config do Prometheus sem reiniciar (web.enable-lifecycle ativo)
curl -X POST http://localhost:9090/-/reload

# Ver alvos e se o scrape está saudável
#   http://localhost:9090/targets

# Derrubar a stack (mantém os volumes)
docker compose -f docker-compose.observability.yml --profile system down

# Derrubar e apagar os dados históricos
docker compose -f docker-compose.observability.yml --profile system down -v
```

## Notas

- No **Docker Desktop (Windows/macOS)** algumas métricas de host do
  `node-exporter`/`cAdvisor` ficam limitadas pela camada de virtualização;
  as métricas da API e do Locust funcionam normalmente.
- O alvo `unireservas-api` usa `host.docker.internal:8000`, funcionando tanto
  com a API local (`uvicorn`) quanto com o `docker-compose.yml` principal
  (que expõe a porta 8000 no host).
- Em produção, **troque as credenciais do Grafana** e proteja as portas
  `9090`/`3000` atrás de rede privada ou autenticação.
- O `containersol/locust_exporter` expõe `locust_users` (nº de usuários),
  `locust_running` (`0`=parado, `1`=iniciando, `2`=ativo) e estatísticas por
  endpoint via label `name` (incluindo `name="Aggregated"`). As séries
  `locust_requests_current_response_time_percentile_*` ficam zeradas nesta
  versão, por isso o dashboard de carga usa mediana/média/máx, que são confiáveis.
