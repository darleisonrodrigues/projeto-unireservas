"""
Testes de `utils.reservation_utils`.

Cobre o Enum `ReservationStatus` (refatoração CS-06 — substituição de strings
mágicas por um Enum tipado) e o parser de datas ISO `parse_iso_date`.
"""

from datetime import date

import pytest

from utils.reservation_utils import ReservationStatus, parse_iso_date


class TestReservationStatus:
    def test_valores_string(self):
        assert ReservationStatus.PENDING == "pending"
        assert ReservationStatus.CONFIRMED == "confirmed"
        assert ReservationStatus.CANCELLED == "cancelled"
        assert ReservationStatus.REJECTED == "rejected"

    def test_terminal_statuses(self):
        terminais = ReservationStatus.terminal_statuses()
        assert ReservationStatus.CANCELLED in terminais
        assert ReservationStatus.REJECTED in terminais
        assert ReservationStatus.PENDING not in terminais
        assert ReservationStatus.CONFIRMED not in terminais

    def test_active_statuses(self):
        ativos = ReservationStatus.active_statuses()
        assert ReservationStatus.PENDING in ativos
        assert ReservationStatus.CONFIRMED in ativos
        assert ReservationStatus.CANCELLED not in ativos
        assert ReservationStatus.REJECTED not in ativos

    def test_ativos_e_terminais_sao_disjuntos(self):
        ativos = set(ReservationStatus.active_statuses())
        terminais = set(ReservationStatus.terminal_statuses())
        assert ativos.isdisjoint(terminais)

    def test_cobre_todos_os_status(self):
        todos = set(ReservationStatus.active_statuses()) | set(ReservationStatus.terminal_statuses())
        assert todos == {s.value for s in ReservationStatus}


class TestParseIsoDate:
    def test_string_iso_simples(self):
        assert parse_iso_date("2026-06-03") == date(2026, 6, 3)

    def test_string_iso_com_horario(self):
        assert parse_iso_date("2026-06-03T14:30:00") == date(2026, 6, 3)

    def test_objeto_date_passa_inalterado(self):
        d = date(2026, 1, 15)
        assert parse_iso_date(d) == d

    def test_data_invalida_levanta_erro(self):
        with pytest.raises(ValueError):
            parse_iso_date("não-é-data")
