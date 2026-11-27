/** Downloads rows as a CSV file. Cells that start with a formula character are escaped against CSV injection. */
export function downloadCSV(name: string, headers: string[], rows: string[][]) {
  const cell = (s: string) => '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  const data = [["DEMONSTRATION DATA — NOT A LIVE FINANCIAL REPORT"], headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + data], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(/[^a-z0-9-]/gi, "-") + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
