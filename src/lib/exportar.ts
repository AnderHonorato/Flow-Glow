export function exportarCSV(cabecalhos: string[], linhas: string[][], nomeArquivo: string) {
  const conteudo = [
    cabecalhos.map((h) => `"${h}"`).join(","),
    ...linhas.map((linha) => linha.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomeArquivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportarTXT(conteudo: string, nomeArquivo: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomeArquivo}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
