import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number>;

/**
 * Uso só de exportação (nunca lê arquivo enviado por usuário), então o CVE
 * conhecido do pacote "xlsx" da npm registry (parsing de arquivo malicioso)
 * não se aplica aqui — ver AGENTS.md. Recebe linhas já achatadas (chave =
 * cabeçalho da coluna) porque isto roda num Client Component e valores do
 * tipo função não podem atravessar a fronteira Server -> Client Component.
 */
export function exportToExcel(rows: ExportRow[], filename: string) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Dados");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function printArea() {
  window.print();
}
