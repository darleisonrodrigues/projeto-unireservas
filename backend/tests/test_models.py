"""
Testes de validação dos modelos Pydantic (`models.property`).

Garante que as regras de validação declaradas nos modelos (preço positivo,
capacidade positiva, tipo restrito ao Literal, limites de tamanho) são
efetivamente aplicadas — protegendo os endpoints de dados inválidos.
"""

import pytest
from pydantic import ValidationError

from models.property import (
    Property,
    PropertyCreate,
    FilterState,
    PropertiesListResponse,
)


def _propriedade_valida_kwargs(**overrides):
    base = dict(
        title="Kitnet perto da UNIFOR",
        type="kitnet",
        price=800.0,
        location="Benfica, Fortaleza",
        university="UNIFOR",
        distance="500m",
        capacity=2,
    )
    base.update(overrides)
    return base


class TestPropertyCreate:
    def test_propriedade_valida(self):
        prop = PropertyCreate(**_propriedade_valida_kwargs())
        assert prop.price == 800.0
        assert prop.type == "kitnet"
        assert prop.images == []
        assert prop.amenities == []

    def test_preco_zero_ou_negativo_invalido(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**_propriedade_valida_kwargs(price=0))
        with pytest.raises(ValidationError):
            PropertyCreate(**_propriedade_valida_kwargs(price=-10))

    def test_capacidade_deve_ser_positiva(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**_propriedade_valida_kwargs(capacity=0))

    def test_tipo_invalido_rejeitado(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**_propriedade_valida_kwargs(type="mansao"))

    def test_titulo_vazio_rejeitado(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**_propriedade_valida_kwargs(title=""))


class TestProperty:
    def test_rating_fora_do_intervalo_rejeitado(self):
        with pytest.raises(ValidationError):
            Property(**_propriedade_valida_kwargs(rating=6.0))

    def test_rating_padrao_zero(self):
        prop = Property(**_propriedade_valida_kwargs())
        assert prop.rating == 0.0
        assert prop.is_favorited is False


class TestFilterState:
    def test_sort_by_padrao(self):
        f = FilterState()
        assert f.sort_by == "relevancia"

    def test_sort_by_invalido_rejeitado(self):
        with pytest.raises(ValidationError):
            FilterState(sort_by="ordem-aleatoria")

    def test_max_price_positivo(self):
        with pytest.raises(ValidationError):
            FilterState(max_price=0)


class TestPropertiesListResponse:
    def test_paginacao(self):
        prop = Property(**_propriedade_valida_kwargs())
        resp = PropertiesListResponse(
            properties=[prop], total=1, page=1, per_page=10, total_pages=1
        )
        assert resp.total == 1
        assert len(resp.properties) == 1
