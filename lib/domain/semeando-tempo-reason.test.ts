import { describe, expect, it } from "vitest";
import { buildSemeandoTempoReason } from "./semeando-tempo-reason";

describe("buildSemeandoTempoReason", () => {
  it("retorna só a justificativa quando não há substituto", () => {
    expect(buildSemeandoTempoReason("viagem a trabalho", null)).toBe("viagem a trabalho");
  });

  it("concatena o nome do substituto quando informado", () => {
    expect(buildSemeandoTempoReason("viagem a trabalho", "Maria Silva")).toBe(
      "viagem a trabalho — substituto indicado: Maria Silva"
    );
  });

  it("remove espaços extras da justificativa e do nome", () => {
    expect(buildSemeandoTempoReason("  viagem a trabalho  ", "  Maria Silva  ")).toBe(
      "viagem a trabalho — substituto indicado: Maria Silva"
    );
  });
});
