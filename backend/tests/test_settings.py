"""
Testes de `config.settings.Settings`.

Foco nas regras de negócio puras: parsing das origens de CORS (refatoração
CS-05 — origens vêm do ambiente, não mais hardcoded) e a montagem do dicionário
de credenciais do Firebase (normalização das quebras de linha da private key).
"""

import pytest

from config.settings import Settings


class TestGetOriginsList:
    def test_origens_vazias_retorna_lista_vazia(self):
        s = Settings(ALLOWED_ORIGINS="")
        assert s.get_origins_list() == []

    def test_origem_unica(self):
        s = Settings(ALLOWED_ORIGINS="https://unireservas.com")
        assert s.get_origins_list() == ["https://unireservas.com"]

    def test_multiplas_origens_separadas_por_virgula(self):
        s = Settings(ALLOWED_ORIGINS="https://a.com,https://b.com")
        assert s.get_origins_list() == ["https://a.com", "https://b.com"]

    def test_remove_espacos_em_branco(self):
        s = Settings(ALLOWED_ORIGINS=" https://a.com ,  https://b.com  ")
        assert s.get_origins_list() == ["https://a.com", "https://b.com"]

    def test_ignora_itens_vazios_entre_virgulas(self):
        s = Settings(ALLOWED_ORIGINS="https://a.com,,  ,https://b.com,")
        assert s.get_origins_list() == ["https://a.com", "https://b.com"]


class TestGetFirebaseCredentials:
    def test_estrutura_basica(self):
        s = Settings(FIREBASE_PROJECT_ID="proj-123", FIREBASE_CLIENT_EMAIL="x@y.com")
        creds = s.get_firebase_credentials()
        assert creds["type"] == "service_account"
        assert creds["project_id"] == "proj-123"
        assert creds["client_email"] == "x@y.com"

    def test_normaliza_quebras_de_linha_da_private_key(self):
        # No ambiente a chave costuma vir com \n literal escapado.
        s = Settings(FIREBASE_PRIVATE_KEY="-----BEGIN-----\\nlinha2\\n-----END-----")
        creds = s.get_firebase_credentials()
        assert "\\n" not in creds["private_key"]
        assert creds["private_key"] == "-----BEGIN-----\nlinha2\n-----END-----"


class TestMetricsDefaults:
    def test_metrics_habilitado_por_padrao(self):
        s = Settings()
        assert s.METRICS_ENABLED is True
        assert s.METRICS_ENDPOINT == "/metrics"
        assert s.METRICS_NAMESPACE == "unireservas"
