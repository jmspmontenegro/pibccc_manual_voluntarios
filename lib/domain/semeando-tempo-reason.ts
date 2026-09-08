/**
 * Ao recusar uma escala, a entrada automática no banco de horas Semeando
 * Tempo usa a justificativa do voluntário como motivo — concatenando o
 * nome do substituto indicado, quando houver (substituto é opcional).
 */
export function buildSemeandoTempoReason(
  justification: string,
  substituteName: string | null
): string {
  const reason = justification.trim();
  if (!substituteName) return reason;
  return `${reason} — substituto indicado: ${substituteName.trim()}`;
}
