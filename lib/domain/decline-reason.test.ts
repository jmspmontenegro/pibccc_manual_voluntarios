import { describe, expect, it } from "vitest";
import { isValidDeclineReason } from "./decline-reason";

describe("isValidDeclineReason", () => {
  it("rejeita string vazia", () => {
    expect(isValidDeclineReason("")).toBe(false);
  });

  it("rejeita 1 ou 2 palavras", () => {
    expect(isValidDeclineReason("viagem")).toBe(false);
    expect(isValidDeclineReason("viagem trabalho")).toBe(false);
  });

  it("aceita 3 palavras ou mais", () => {
    expect(isValidDeclineReason("viagem a trabalho")).toBe(true);
    expect(isValidDeclineReason("estou doente hoje infelizmente")).toBe(true);
  });

  it("ignora espaços extras entre palavras", () => {
    expect(isValidDeclineReason("  viagem   a    trabalho  ")).toBe(true);
  });

  it("não conta espaços em branco como palavra", () => {
    expect(isValidDeclineReason("   ")).toBe(false);
  });
});
