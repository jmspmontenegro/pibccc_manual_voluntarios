/**
 * Recusa de escala exige justificativa com pelo menos 3 palavras (pedido do
 * usuário, ver FLUXO_CADASTRO.md/card "Recusa de escala" no Trello) — não
 * basta um caractere ou uma palavra solta.
 */
export function isValidDeclineReason(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length >= 3;
}
