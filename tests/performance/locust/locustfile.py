"""
═══════════════════════════════════════════════════════════════
 LOCUST — Testes de Performance — UniReservas API
═══════════════════════════════════════════════════════════════

 Simula comportamentos reais de três tipos de usuário:

 1. StudentUser (Estudante) — peso 5
    - Navega propriedades, busca, vê detalhes, faz reservas

 2. AdvertiserUser (Anunciante) — peso 2
    - Vê suas propriedades, gerencsia reservas, chats

 3. AnonymousUser (Visitante)   — peso 3
    - Apenas navega e busca propriedades sem autenticação
═══════════════════════════════════════════════════════════════
"""

import os
import json
import random
import logging
import datetime
from locust import HttpUser, task, between, tag, events
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env localizado na raiz do projeto (2 níveis acima)
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configurações
# ──────────────────────────────────────────────
BASE_URL = os.environ.get("LOCUST_BASE_URL", "http://localhost:8000")
STUDENT_TOKEN = os.environ.get("STUDENT_TOKEN", " ")
ADVERTISER_TOKEN = os.environ.get("ADVERTISER_TOKEN", " ")

# Termos de busca para simular buscas reais
SEARCH_TERMS = ["UFMG", "USP", "UNICAMP", "PUC", "apartamento", "quarto", "kitnet", "Pampulha", "centro", "mobiliado"]
PROPERTY_TYPES = ["apartamento", "kitnet", "quarto"]
SORT_OPTIONS = ["relevancia", "menor-preco", "maior-preco", "melhor-avaliado", "mais-recente"]
MAX_PRICES = [500, 800, 1000, 1200, 1500, 2000]


# ──────────────────────────────────────────────
# Listeners de eventos (métricas e relatórios)
# ──────────────────────────────────────────────
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logger.info("═" * 60)
    logger.info("  LOCUST — Teste de Performance — UniReservas")
    logger.info(f"  Host: {environment.host}")
    logger.info(f"  Token Estudante:   {'Sim' if STUDENT_TOKEN else 'Não'}")
    logger.info(f"  Token Anunciante:  {'Sim' if ADVERTISER_TOKEN else 'Não'}")
    logger.info("═" * 60)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    stats = environment.runner.stats
    logger.info("═" * 60)
    logger.info("  LOCUST — Resultado Final")
    logger.info(f"  Total de requests:  {stats.total.num_requests}")
    logger.info(f"  Total de falhas:    {stats.total.num_failures}")
    logger.info(f"  Taxa de falha:      {stats.total.fail_ratio * 100:.2f}%")
    logger.info(f"  Requests/s (média): {stats.total.total_rps:.2f}")
    logger.info(f"  Tempo médio:        {stats.total.avg_response_time:.2f}ms")
    if stats.total.num_requests > 0:
        logger.info(f"  p50:                {stats.total.get_response_time_percentile(0.50):.0f}ms")
        logger.info(f"  p95:                {stats.total.get_response_time_percentile(0.95):.0f}ms")
        logger.info(f"  p99:                {stats.total.get_response_time_percentile(0.99):.0f}ms")
    logger.info("═" * 60)


# ──────────────────────────────────────────────
# Base User — métodos compartilhados
# ──────────────────────────────────────────────
#Classe base abstrata com métodos compartilhados.

class BaseUser(HttpUser):
    abstract = True
    host = BASE_URL

    # Caches de IDs obtidos durante navegação
    _property_ids_cache = []
    _reservation_ids_cache = []
    _chat_ids_cache = []
    _listing_ids_cache = []
    _rental_interest_ids_cache = []

    token = None

    def get_default_headers(self):
        """Headers padrão sem autenticação."""
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def get_auth_headers(self):
        """Headers com autenticação Firebase."""
        headers = self.get_default_headers()
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def browse_properties(self, with_filters=False):
        """Navegar propriedades com ou sem filtros."""
        params = {"page": random.randint(1, 3), "per_page": 10}

        if with_filters:
            # Aplicar filtros aleatórios
            if random.random() > 0.5:
                params["property_type"] = random.choice(PROPERTY_TYPES)
            if random.random() > 0.5:
                params["max_price"] = random.choice(MAX_PRICES)
            if random.random() > 0.7:
                params["sort_by"] = random.choice(SORT_OPTIONS)

        with self.client.get(
            "/api/properties/",
            params=params,
            headers=self.get_default_headers(),
            name="/api/properties/ [list]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    properties = data.get("properties", [])

                    # Cachear IDs para uso posterior
                    for prop in properties:
                        prop_id = prop.get("id")
                        if prop_id and prop_id not in self._property_ids_cache:
                            self._property_ids_cache.append(prop_id)
                            # Manter cache com tamanho razoável
                            if len(self._property_ids_cache) > 50:
                                self._property_ids_cache.pop(0)

                    response.success()
                except (json.JSONDecodeError, KeyError) as e:
                    response.failure(f"Resposta inválida: {e}")
            elif response.status_code < 500:
                response.success()  # 4xx não é falha de performance
            else:
                response.failure(f"Server error: {response.status_code}")

    def view_property_detail(self):
        """Ver detalhes de uma propriedade aleatória do cache."""
        if not self._property_ids_cache:
            # Se cache vazio, navegar primeiro
            self.browse_properties()
            if not self._property_ids_cache:
                return

        property_id = random.choice(self._property_ids_cache)

        with self.client.get(
            f"/api/properties/{property_id}",
            headers=self.get_default_headers(),
            name="/api/properties/[id] [detail]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                # Remover do cache se não existe mais
                if property_id in self._property_ids_cache:
                    self._property_ids_cache.remove(property_id)
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    def search_properties(self):
        """Buscar propriedades por termo."""
        term = random.choice(SEARCH_TERMS)

        with self.client.get(
            "/api/properties/search/",
            params={"q": term, "page": 1, "per_page": 10},
            headers=self.get_default_headers(),
            name="/api/properties/search/ [search]",
            catch_response=True,
        ) as response:
            if response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")


# ──────────────────────────────────────────────
# Visitante Anônimo (sem autenticação)
# ──────────────────────────────────────────────
class AnonymousUser(BaseUser):
    """
    Simula visitante que navega o site sem estar logado.
    Peso 3: 30% do tráfego total.
    """
    weight = 3
    wait_time = between(1, 5)  # Think time: 1-5 segundos

    @task(5)
    @tag("public", "browse")
    def browse_properties_no_filter(self):
        """Navegar propriedades sem filtros."""
        self.browse_properties(with_filters=False)

    @task(3)
    @tag("public", "browse", "filter")
    def browse_properties_filtered(self):
        """Navegar propriedades com filtros."""
        self.browse_properties(with_filters=True)

    @task(4)
    @tag("public", "detail")
    def view_detail(self):
        """Ver detalhes de uma propriedade."""
        self.view_property_detail()

    @task(3)
    @tag("public", "search")
    def search(self):
        """Buscar propriedades."""
        self.search_properties()

    @task(1)
    @tag("public", "health")
    def check_health(self):
        """Verificar saúde da API."""
        self.client.get("/health", name="/health [health]")

    @task(2)
    @tag("public", "listings")
    def browse_listings(self):
        """Navegar listings."""
        with self.client.get(
            "/api/listings/",
            params={"page": random.randint(1, 3), "per_page": 10},
            headers=self.get_default_headers(),
            name="/api/listings/ [list]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for listing in data.get("listings", []):
                        lid = listing.get("id")
                        if lid and lid not in self._listing_ids_cache:
                            self._listing_ids_cache.append(lid)
                            if len(self._listing_ids_cache) > 30:
                                self._listing_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")

    @task(2)
    @tag("public", "listings")
    def view_listing_detail(self):
        """Ver detalhe de um listing."""
        if not self._listing_ids_cache:
            self.browse_listings()
            if not self._listing_ids_cache:
                return

        listing_id = random.choice(self._listing_ids_cache)

        with self.client.get(
            f"/api/listings/{listing_id}",
            headers=self.get_default_headers(),
            name="/api/listings/[id] [detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            elif response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")

    @task(2)
    @tag("public", "listings", "search")
    def search_listings(self):
        """Buscar listings por termo."""
        with self.client.get(
            "/api/listings/search/",
            params={"q": random.choice(SEARCH_TERMS), "page": 1, "per_page": 10},
            headers=self.get_default_headers(),
            name="/api/listings/search/ [search]",
            catch_response=True,
        ) as response:
            if response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")

    @task(1)
    @tag("public", "listings")
    def browse_listings_by_university(self):
        """Navegar listings filtrados por universidade."""
        university = random.choice(["UFMG", "USP", "UNICAMP", "PUC-MG", "UNIFESP"])

        with self.client.get(
            f"/api/listings/university/{university}",
            headers=self.get_default_headers(),
            name="/api/listings/university/[uni] [by_university]",
            catch_response=True,
        ) as response:
            if response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")


# ──────────────────────────────────────────────
# Estudante Autenticado
# ──────────────────────────────────────────────
class StudentUser(BaseUser):
    """
    Simula estudante logado buscando moradia.
    Peso 5: 50% do tráfego total (maior grupo de usuários).
    """
    weight = 5
    token = STUDENT_TOKEN
    wait_time = between(2, 7)  # Think time mais longo (usuário lendo)

    @task(5)
    @tag("authenticated", "browse")
    def browse_and_filter(self):
        """Navegar propriedades com filtros variados."""
        self.browse_properties(with_filters=True)

    @task(4)
    @tag("authenticated", "detail")
    def view_property(self):
        """Ver detalhes de propriedade."""
        self.view_property_detail()

    @task(3)
    @tag("authenticated", "search")
    def search(self):
        """Buscar propriedades."""
        self.search_properties()

    @task(3)
    @tag("authenticated", "profile")
    def view_profile(self):
        """Acessar perfil próprio."""
        if not self.token:
            return

        with self.client.get(
            "/api/profiles/me",
            headers=self.get_auth_headers(),
            name="/api/profiles/me [profile]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    @tag("authenticated", "reservations")
    def view_reservations(self):
        """Verificar minhas reservas."""
        if not self.token:
            return

        with self.client.get(
            "/api/reservations/my",
            headers=self.get_auth_headers(),
            name="/api/reservations/my [reservations]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for res in data.get("reservations", []):
                        res_id = res.get("id")
                        if res_id and res_id not in self._reservation_ids_cache:
                            self._reservation_ids_cache.append(res_id)
                            if len(self._reservation_ids_cache) > 20:
                                self._reservation_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "reservations", "write")
    def make_reservation(self):
        """Fazer uma reserva de propriedade."""
        if not self.token or not self._property_ids_cache:
            return

        property_id = random.choice(self._property_ids_cache)
        start_date = datetime.date.today() + datetime.timedelta(days=random.randint(7, 30))
        end_date = start_date + datetime.timedelta(days=random.randint(1, 6))

        payload = {
            "property_id": property_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "guests": random.randint(1, 3),
            "total_price": round(random.uniform(500, 2000), 2),
            "message": "Tenho interesse neste imóvel. Poderia me dar mais informações?",
        }

        with self.client.post(
            "/api/reservations/",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/reservations/ [create]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201):
                try:
                    data = response.json()
                    res_id = data.get("id") or (data.get("reservation") or {}).get("id")
                    if res_id and res_id not in self._reservation_ids_cache:
                        self._reservation_ids_cache.append(res_id)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (400, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "reservations")
    def view_reservation_detail(self):
        """Ver detalhes de uma reserva."""
        if not self.token or not self._reservation_ids_cache:
            return

        reservation_id = random.choice(self._reservation_ids_cache)

        with self.client.get(
            f"/api/reservations/{reservation_id}",
            headers=self.get_auth_headers(),
            name="/api/reservations/[id] [detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "reservations", "write")
    def cancel_reservation(self):
        """Cancelar uma reserva pendente."""
        if not self.token or not self._reservation_ids_cache:
            return

        reservation_id = random.choice(self._reservation_ids_cache)

        with self.client.patch(
            f"/api/reservations/{reservation_id}/cancel",
            headers=self.get_auth_headers(),
            name="/api/reservations/[id]/cancel [cancel]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "chat")
    def view_chats(self):
        """Acessar lista de chats."""
        if not self.token:
            return

        with self.client.get(
            "/api/chat/my",
            headers=self.get_auth_headers(),
            name="/api/chat/my [chats]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for chat in data.get("chats", []):
                        chat_id = chat.get("id")
                        if chat_id and chat_id not in self._chat_ids_cache:
                            self._chat_ids_cache.append(chat_id)
                            if len(self._chat_ids_cache) > 20:
                                self._chat_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "chat", "write")
    def start_chat(self):
        """Iniciar conversa sobre uma propriedade."""
        if not self.token or not self._property_ids_cache:
            return

        payload = {
            "property_id": random.choice(self._property_ids_cache),
            "initial_message": random.choice([
                "Olá, tenho interesse neste imóvel!",
                "Poderia me dar mais informações sobre o imóvel?",
                "O imóvel ainda está disponível?",
            ]),
        }

        with self.client.post(
            "/api/chat/create",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/chat/create [create_chat]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201):
                try:
                    data = response.json()
                    chat_id = data.get("id") or (data.get("chat") or {}).get("id")
                    if chat_id and chat_id not in self._chat_ids_cache:
                        self._chat_ids_cache.append(chat_id)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (400, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "chat", "write")
    def send_chat_message(self):
        """Enviar mensagem em um chat existente."""
        if not self.token or not self._chat_ids_cache:
            return

        payload = {
            "chat_id": random.choice(self._chat_ids_cache),
            "content": random.choice([
                "Qual é a disponibilidade do imóvel?",
                "O imóvel aceita animais?",
                "Inclui contas de água e luz?",
                "Tem vaga de garagem?",
                "É possível agendar uma visita?",
            ]),
        }

        with self.client.post(
            "/api/chat/message",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/chat/message [send_message]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201, 400, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "chat")
    def view_chat_messages(self):
        """Ver mensagens de um chat."""
        if not self.token or not self._chat_ids_cache:
            return

        chat_id = random.choice(self._chat_ids_cache)

        with self.client.get(
            f"/api/chat/{chat_id}/messages",
            params={"page": 1, "limit": 20},
            headers=self.get_auth_headers(),
            name="/api/chat/[id]/messages [messages]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    @tag("authenticated", "favorites", "write")
    def add_favorite(self):
        """Adicionar propriedade aos favoritos."""
        if not self.token or not self._property_ids_cache:
            return

        property_id = random.choice(self._property_ids_cache)

        with self.client.post(
            f"/api/properties/{property_id}/favorite",
            headers=self.get_auth_headers(),
            name="/api/properties/[id]/favorite [add_favorite]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201, 400, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "favorites", "write")
    def remove_favorite(self):
        """Remover propriedade dos favoritos."""
        if not self.token or not self._property_ids_cache:
            return

        property_id = random.choice(self._property_ids_cache)

        with self.client.delete(
            f"/api/properties/{property_id}/favorite",
            headers=self.get_auth_headers(),
            name="/api/properties/[id]/favorite [remove_favorite]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 204, 400, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "auth")
    def check_auth_status(self):
        """Verificar estado da autenticação."""
        if not self.token:
            return

        with self.client.get(
            "/api/auth-firebase/me",
            headers=self.get_auth_headers(),
            name="/api/auth-firebase/me [auth]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "auth")
    def verify_token(self):
        """Verificar validade do token Firebase."""
        if not self.token:
            return

        with self.client.post(
            "/api/auth-firebase/verify-token",
            json={"token": self.token},
            headers=self.get_auth_headers(),
            name="/api/auth-firebase/verify-token [verify]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "auth")
    def logout(self):
        """Fazer logout."""
        if not self.token:
            return

        with self.client.post(
            "/api/auth-firebase/logout",
            headers=self.get_auth_headers(),
            name="/api/auth-firebase/logout [logout]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "profile", "write")
    def update_profile(self):
        """Atualizar dados do perfil."""
        if not self.token:
            return

        payload = random.choice([
            {"bio": "Estudante buscando moradia próxima à universidade."},
            {"phone": f"(31) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}"},
            {"bio": "Procuro imóvel mobiliado e bem localizado.", "phone": f"(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}"},
        ])

        with self.client.put(
            "/api/profiles/me",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/profiles/me [update_profile]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "listings")
    def browse_student_listings(self):
        """Navegar listings autenticado."""
        with self.client.get(
            "/api/listings/",
            params={"page": random.randint(1, 3), "per_page": 10},
            headers=self.get_auth_headers(),
            name="/api/listings/ [student_list]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for listing in data.get("listings", []):
                        lid = listing.get("id")
                        if lid and lid not in self._listing_ids_cache:
                            self._listing_ids_cache.append(lid)
                            if len(self._listing_ids_cache) > 30:
                                self._listing_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "listings")
    def view_listing_detail(self):
        """Ver detalhe de um listing."""
        if not self._listing_ids_cache:
            return

        listing_id = random.choice(self._listing_ids_cache)

        with self.client.get(
            f"/api/listings/{listing_id}",
            headers=self.get_auth_headers(),
            name="/api/listings/[id] [student_detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "listings", "search")
    def search_student_listings(self):
        """Buscar listings por universidade."""
        university = random.choice(["UFMG", "USP", "UNICAMP", "PUC-MG", "UNIFESP"])

        with self.client.get(
            f"/api/listings/university/{university}",
            headers=self.get_auth_headers(),
            name="/api/listings/university/[uni] [student_by_university]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "rentals", "write")
    def express_rental_interest(self):
        """Demonstrar interesse em uma propriedade."""
        if not self.token or not self._property_ids_cache:
            return

        with self.client.post(
            "/api/rentals/interest",
            json={"property_id": random.choice(self._property_ids_cache)},
            headers=self.get_auth_headers(),
            name="/api/rentals/interest [express_interest]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201, 400, 401, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "rentals")
    def view_my_rental_interests(self):
        """Ver meus interesses de aluguel."""
        if not self.token:
            return

        with self.client.get(
            "/api/rentals/interests/my",
            headers=self.get_auth_headers(),
            name="/api/rentals/interests/my [my_interests]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    items = data if isinstance(data, list) else data.get("interests", [])
                    for interest in items:
                        iid = interest.get("id")
                        if iid and iid not in self._rental_interest_ids_cache:
                            self._rental_interest_ids_cache.append(iid)
                            if len(self._rental_interest_ids_cache) > 20:
                                self._rental_interest_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "reservations", "write")
    def update_reservation(self):
        """Atualizar dados de uma reserva existente."""
        if not self.token or not self._reservation_ids_cache:
            return

        reservation_id = random.choice(self._reservation_ids_cache)
        payload = {"message": "Atualização: confirmo o interesse no imóvel."}

        with self.client.put(
            f"/api/reservations/{reservation_id}",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/reservations/[id] [update]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "chat")
    def view_chat_detail(self):
        """Ver detalhe de um chat."""
        if not self.token or not self._chat_ids_cache:
            return

        chat_id = random.choice(self._chat_ids_cache)

        with self.client.get(
            f"/api/chat/{chat_id}",
            headers=self.get_auth_headers(),
            name="/api/chat/[id] [chat_detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")


# ──────────────────────────────────────────────
# Anunciante Autenticado
# ──────────────────────────────────────────────
class AdvertiserUser(BaseUser):
    """
    Simula um anunciante logado (gerenciando suas listagens, vendo conversas).
    Peso 2: 20% do tráfego total.
    """
    weight = 2
    token = ADVERTISER_TOKEN
    wait_time = between(3, 8)  # Think time mais longo (gerenciamento)

    # Caches de IDs próprios do anunciante
    _advertiser_property_ids_cache = []
    _advertiser_listing_ids_cache = []

    @task(4)
    @tag("authenticated", "advertiser", "properties")
    def view_my_properties(self):
        """Ver minhas propriedades publicadas."""
        if not self.token:
            self.browse_properties(with_filters=False)
            return

        with self.client.get(
            "/api/properties/my",
            headers=self.get_auth_headers(),
            name="/api/properties/my [my_properties]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for prop in data.get("properties", []):
                        prop_id = prop.get("id")
                        if prop_id and prop_id not in self._advertiser_property_ids_cache:
                            self._advertiser_property_ids_cache.append(prop_id)
                            if len(self._advertiser_property_ids_cache) > 20:
                                self._advertiser_property_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (401, 403):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "properties", "write")
    def create_property(self):
        """Criar nova hospedagem."""
        if not self.token:
            return

        universities = ["UFMG", "USP", "UNICAMP", "PUC-MG", "UNIFESP"]
        prop_types = ["kitnet", "quarto", "apartamento"]
        amenities_pool = ["Wi-Fi", "Lavanderia", "Garagem", "Ar-condicionado", "Academia", "Piscina"]

        payload = {
            "title": f"{random.choice(['Quarto', 'Kitnet', 'Apartamento'])} mobiliado próximo à {random.choice(universities)}",
            "type": random.choice(prop_types),
            "price": round(random.uniform(400, 2000), 2),
            "location": random.choice(["Pampulha, BH", "Centro, SP", "Barão Geraldo, Campinas", "Vila Mariana, SP"]),
            "university": random.choice(universities),
            "distance": random.choice(["200m", "500m", "1km", "2km"]),
            "capacity": random.randint(1, 4),
            "description": "Imóvel bem localizado, próximo ao transporte público e comércio.",
            "images": [],
            "amenities": random.sample(amenities_pool, k=random.randint(1, 4)),
        }

        with self.client.post(
            "/api/properties/",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/properties/ [create_property]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201):
                try:
                    data = response.json()
                    prop_id = data.get("id") or (data.get("property") or {}).get("id")
                    if prop_id:
                        self._advertiser_property_ids_cache.append(prop_id)
                        self._property_ids_cache.append(prop_id)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (400, 401, 403, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "properties", "write")
    def edit_property(self):
        """Editar hospedagem existente."""
        if not self.token or not self._advertiser_property_ids_cache:
            return

        property_id = random.choice(self._advertiser_property_ids_cache)
        payload = random.choice([
            {"price": round(random.uniform(400, 2000), 2)},
            {"description": "Descrição atualizada: imóvel reformado recentemente."},
            {"title": f"Imóvel atualizado — {random.choice(['Pampulha', 'Centro', 'Savassi'])}"},
            {"amenities": random.sample(["Wi-Fi", "Garagem", "Lavanderia", "Academia"], k=2)},
        ])

        with self.client.put(
            f"/api/properties/{property_id}",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/properties/[id] [edit_property]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "properties", "write")
    def delete_property(self):
        """Excluir uma hospedagem."""
        if not self.token or not self._advertiser_property_ids_cache:
            return

        property_id = random.choice(self._advertiser_property_ids_cache)

        with self.client.delete(
            f"/api/properties/{property_id}",
            headers=self.get_auth_headers(),
            name="/api/properties/[id] [delete_property]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 204):
                self._advertiser_property_ids_cache.remove(property_id)
                if property_id in self._property_ids_cache:
                    self._property_ids_cache.remove(property_id)
                response.success()
            elif response.status_code in (401, 403, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    @tag("authenticated", "advertiser", "reservations")
    def manage_reservations(self):
        """Verificar reservas recebidas."""
        if not self.token:
            return

        with self.client.get(
            "/api/reservations/my",
            headers=self.get_auth_headers(),
            name="/api/reservations/my [advertiser_reservations]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for res in data.get("reservations", []):
                        res_id = res.get("id")
                        if res_id and res_id not in self._reservation_ids_cache:
                            self._reservation_ids_cache.append(res_id)
                            if len(self._reservation_ids_cache) > 20:
                                self._reservation_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "reservations", "write")
    def confirm_reservation(self):
        """Confirmar uma reserva pendente."""
        if not self.token or not self._reservation_ids_cache:
            return

        reservation_id = random.choice(self._reservation_ids_cache)

        with self.client.patch(
            f"/api/reservations/{reservation_id}/confirm",
            headers=self.get_auth_headers(),
            name="/api/reservations/[id]/confirm [confirm]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "reservations", "write")
    def reject_reservation(self):
        """Rejeitar uma reserva."""
        if not self.token or not self._reservation_ids_cache:
            return

        reservation_id = random.choice(self._reservation_ids_cache)

        with self.client.patch(
            f"/api/reservations/{reservation_id}/reject",
            headers=self.get_auth_headers(),
            name="/api/reservations/[id]/reject [reject]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    @tag("authenticated", "advertiser", "chat")
    def respond_chats(self):
        """Verificar e responder chats."""
        if not self.token:
            return

        with self.client.get(
            "/api/chat/my",
            headers=self.get_auth_headers(),
            name="/api/chat/my [advertiser_chats]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for chat in data.get("chats", []):
                        chat_id = chat.get("id")
                        if chat_id and chat_id not in self._chat_ids_cache:
                            self._chat_ids_cache.append(chat_id)
                            if len(self._chat_ids_cache) > 20:
                                self._chat_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code == 401:
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "chat", "write")
    def reply_in_chat(self):
        """Responder mensagem em um chat de estudante."""
        if not self.token or not self._chat_ids_cache:
            return

        payload = {
            "chat_id": random.choice(self._chat_ids_cache),
            "content": random.choice([
                "Olá! O imóvel está disponível sim.",
                "Pode entrar em contato para agendar uma visita.",
                "As contas de água e luz não estão inclusas.",
                "Infelizmente não aceitamos animais.",
                "Ótimo! Quando você gostaria de visitar?",
            ]),
        }

        with self.client.post(
            "/api/chat/message",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/chat/message [advertiser_reply]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201, 400, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "chat")
    def view_chat_messages(self):
        """Ver mensagens de um chat com estudante."""
        if not self.token or not self._chat_ids_cache:
            return

        chat_id = random.choice(self._chat_ids_cache)

        with self.client.get(
            f"/api/chat/{chat_id}/messages",
            params={"page": 1, "limit": 20},
            headers=self.get_auth_headers(),
            name="/api/chat/[id]/messages [advertiser_messages]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "profile")
    def view_profile(self):
        """Acessar perfil do anunciante."""
        if not self.token:
            return

        with self.client.get(
            "/api/profiles/me",
            headers=self.get_auth_headers(),
            name="/api/profiles/me [advertiser_profile]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("public", "browse")
    def browse_competitor_properties(self):
        """Navegar propriedades dos concorrentes."""
        self.browse_properties(with_filters=True)

    @task(2)
    @tag("authenticated", "advertiser", "listings")
    def view_listings(self):
        """Listar todos os listings."""
        with self.client.get(
            "/api/listings/",
            params={"page": random.randint(1, 3), "per_page": 10},
            headers=self.get_auth_headers(),
            name="/api/listings/ [advertiser_listings]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for listing in data.get("listings", []):
                        lid = listing.get("id")
                        if lid and lid not in self._listing_ids_cache:
                            self._listing_ids_cache.append(lid)
                            if len(self._listing_ids_cache) > 30:
                                self._listing_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (401, 403):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    @tag("authenticated", "advertiser", "listings")
    def view_my_listings(self):
        """Ver meus listings publicados."""
        if not self.token:
            return

        with self.client.get(
            "/api/listings/my",
            headers=self.get_auth_headers(),
            name="/api/listings/my [my_listings]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    for listing in data.get("listings", []):
                        lid = listing.get("id")
                        if lid and lid not in self._advertiser_listing_ids_cache:
                            self._advertiser_listing_ids_cache.append(lid)
                            if len(self._advertiser_listing_ids_cache) > 20:
                                self._advertiser_listing_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (401, 403):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "listings")
    def view_listing_detail(self):
        """Ver detalhe de um listing."""
        if not self._listing_ids_cache:
            return

        listing_id = random.choice(self._listing_ids_cache)

        with self.client.get(
            f"/api/listings/{listing_id}",
            headers=self.get_auth_headers(),
            name="/api/listings/[id] [advertiser_detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "listings", "write")
    def create_listing(self):
        """Criar novo listing."""
        if not self.token:
            return

        universities = ["UFMG", "USP", "UNICAMP", "PUC-MG", "UNIFESP"]
        payload = {
            "title": f"Listing — {random.choice(['Quarto', 'Kitnet', 'Apartamento'])} próximo à {random.choice(universities)}",
            "type": random.choice(["kitnet", "quarto", "apartamento"]),
            "price": round(random.uniform(400, 2000), 2),
            "location": random.choice(["Pampulha, BH", "Centro, SP", "Barão Geraldo, Campinas"]),
            "university": random.choice(universities),
            "distance": random.choice(["200m", "500m", "1km", "2km"]),
            "capacity": random.randint(1, 4),
            "description": "Imóvel listado para aluguel, bem localizado.",
            "is_active": True,
        }

        with self.client.post(
            "/api/listings/",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/listings/ [create_listing]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 201):
                try:
                    data = response.json()
                    lid = data.get("id") or (data.get("listing") or {}).get("id")
                    if lid:
                        self._advertiser_listing_ids_cache.append(lid)
                        self._listing_ids_cache.append(lid)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (400, 401, 403, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "listings", "write")
    def edit_listing(self):
        """Editar listing existente."""
        if not self.token or not self._advertiser_listing_ids_cache:
            return

        listing_id = random.choice(self._advertiser_listing_ids_cache)
        payload = random.choice([
            {"price": round(random.uniform(400, 2000), 2)},
            {"description": "Descrição atualizada do listing."},
            {"is_active": random.choice([True, False])},
        ])

        with self.client.put(
            f"/api/listings/{listing_id}",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/listings/[id] [edit_listing]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "listings", "write")
    def delete_listing(self):
        """Excluir um listing."""
        if not self.token or not self._advertiser_listing_ids_cache:
            return

        listing_id = random.choice(self._advertiser_listing_ids_cache)

        with self.client.delete(
            f"/api/listings/{listing_id}",
            headers=self.get_auth_headers(),
            name="/api/listings/[id] [delete_listing]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 204):
                self._advertiser_listing_ids_cache.remove(listing_id)
                if listing_id in self._listing_ids_cache:
                    self._listing_ids_cache.remove(listing_id)
                response.success()
            elif response.status_code in (401, 403, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "rentals")
    def view_received_interests(self):
        """Ver interesses de aluguel recebidos."""
        if not self.token:
            return

        with self.client.get(
            "/api/rentals/interests/received",
            headers=self.get_auth_headers(),
            name="/api/rentals/interests/received [received_interests]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    items = data if isinstance(data, list) else data.get("interests", [])
                    for interest in items:
                        iid = interest.get("id")
                        if iid and iid not in self._rental_interest_ids_cache:
                            self._rental_interest_ids_cache.append(iid)
                            if len(self._rental_interest_ids_cache) > 20:
                                self._rental_interest_ids_cache.pop(0)
                    response.success()
                except (json.JSONDecodeError, KeyError):
                    response.success()
            elif response.status_code in (401, 403):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "rentals", "write")
    def update_rental_interest_status(self):
        """Aceitar ou rejeitar interesse de aluguel."""
        if not self.token or not self._rental_interest_ids_cache:
            return

        interest_id = random.choice(self._rental_interest_ids_cache)
        new_status = random.choice(["accepted", "rejected"])

        with self.client.patch(
            f"/api/rentals/interests/{interest_id}/status",
            json={"status": new_status},
            headers=self.get_auth_headers(),
            name="/api/rentals/interests/[id]/status [update_status]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "chat")
    def view_chat_detail(self):
        """Ver detalhe de um chat com estudante."""
        if not self.token or not self._chat_ids_cache:
            return

        chat_id = random.choice(self._chat_ids_cache)

        with self.client.get(
            f"/api/chat/{chat_id}",
            headers=self.get_auth_headers(),
            name="/api/chat/[id] [advertiser_chat_detail]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 404):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "auth")
    def verify_token(self):
        """Verificar validade do token Firebase."""
        if not self.token:
            return

        with self.client.post(
            "/api/auth-firebase/verify-token",
            json={"token": self.token},
            headers=self.get_auth_headers(),
            name="/api/auth-firebase/verify-token [advertiser_verify]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "auth")
    def logout(self):
        """Fazer logout."""
        if not self.token:
            return

        with self.client.post(
            "/api/auth-firebase/logout",
            headers=self.get_auth_headers(),
            name="/api/auth-firebase/logout [advertiser_logout]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 401):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(2)
    @tag("authenticated", "advertiser", "profile", "write")
    def update_profile(self):
        """Atualizar dados do perfil do anunciante."""
        if not self.token:
            return

        payload = random.choice([
            {"bio": "Anunciante com imóveis próximos às principais universidades."},
            {"phone": f"(31) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}"},
        ])

        with self.client.put(
            "/api/profiles/me",
            json=payload,
            headers=self.get_auth_headers(),
            name="/api/profiles/me [advertiser_update_profile]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "properties", "write")
    def reorder_property_images(self):
        """Reordenar imagens de uma propriedade."""
        if not self.token or not self._advertiser_property_ids_cache:
            return

        property_id = random.choice(self._advertiser_property_ids_cache)

        with self.client.put(
            f"/api/properties/{property_id}/reorder-images",
            json={"image_urls": []},
            headers=self.get_auth_headers(),
            name="/api/properties/[id]/reorder-images [reorder_images]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")

    @task(1)
    @tag("authenticated", "advertiser", "properties", "write")
    def delete_property_images(self):
        """Deletar imagens de uma propriedade."""
        if not self.token or not self._advertiser_property_ids_cache:
            return

        property_id = random.choice(self._advertiser_property_ids_cache)

        with self.client.delete(
            f"/api/properties/{property_id}/delete-images",
            json={"image_urls": []},
            headers=self.get_auth_headers(),
            name="/api/properties/[id]/delete-images [delete_images]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 204, 400, 401, 403, 404, 422):
                response.success()
            else:
                response.failure(f"Error: {response.status_code}")
