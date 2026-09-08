import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "./storage";

describe("sanitizeFilename", () => {
  it("remove acentos e troca espaço por hífen", () => {
    expect(sanitizeFilename("adoção de crianças.pdf")).toBe("adocao-de-criancas.pdf");
  });

  it("preserva a extensão original", () => {
    expect(sanitizeFilename("Certidão (2026) final.PDF")).toBe("certidao-2026-final.PDF");
  });

  it("não muda nome já seguro", () => {
    expect(sanitizeFilename("no-accent-name.docx")).toBe("no-accent-name.docx");
  });

  it("nunca deixa a key vazia", () => {
    expect(sanitizeFilename("....pdf")).toBe("arquivo.pdf");
  });

  it("funciona sem extensão", () => {
    expect(sanitizeFilename("relatório final")).toBe("relatorio-final");
  });
});
