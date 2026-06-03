import { describe, it, expect } from "vitest";
import {
  formatReservationDate,
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
} from "./reservationUtils";

describe("getStatusLabel", () => {
  it("traduz status conhecidos para português", () => {
    expect(getStatusLabel("pending")).toBe("Pendente");
    expect(getStatusLabel("confirmed")).toBe("Confirmada");
    expect(getStatusLabel("cancelled")).toBe("Cancelada");
    expect(getStatusLabel("rejected")).toBe("Rejeitada");
  });

  it("retorna o próprio valor para status desconhecido", () => {
    expect(getStatusLabel("desconhecido")).toBe("desconhecido");
  });
});

describe("getStatusColor", () => {
  it("retorna a classe de cor do status", () => {
    expect(getStatusColor("confirmed")).toBe("bg-green-100 text-green-800");
    expect(getStatusColor("rejected")).toBe("bg-red-100 text-red-800");
  });

  it("usa cor neutra como fallback", () => {
    expect(getStatusColor("inexistente")).toBe("bg-gray-100 text-gray-800");
  });
});

describe("formatReservationDate", () => {
  it("formata data ISO no padrão 'dd de mês de aaaa' em português", () => {
    // Asserção por padrão (não pelo dia exato) para não depender do fuso horário
    // do ambiente em que o teste roda.
    expect(formatReservationDate("2026-06-15T12:00:00")).toMatch(
      /^\d{2} de \w+ de 2026$/
    );
  });

  it("retorna a string original quando a data é inválida", () => {
    expect(formatReservationDate("data-invalida")).toBe("data-invalida");
  });
});

describe("getStatusIcon", () => {
  it("retorna um elemento para qualquer status", () => {
    expect(getStatusIcon("confirmed")).toBeTruthy();
    expect(getStatusIcon("pending")).toBeTruthy();
  });
});
