import type { SheetData } from 'write-excel-file/browser';
import type { Sheet } from './metadataMappingExcel';

// Reading and writing the .xlsx file itself, the only place that knows the
// Excel libraries. They load on first use and stay out of the main bundle.

export async function readWorkbook(file: File): Promise<Sheet[]> {
  const { default: readExcelFile } = await import('read-excel-file/browser');
  const sheets = await readExcelFile(file);

  return sheets.map(({ sheet, data }) => ({ name: sheet, rows: data }));
}

function sheetData(rows: unknown[][]): SheetData {
  const [header = [], ...body] = rows;

  return [
    header.map((cell) => ({ value: String(cell), fontWeight: 'bold' })),
    // an empty cell stays empty rather than holding an empty text
    ...body.map((row) => row.map((cell) => (cell ? String(cell) : null))),
  ];
}

export async function writeWorkbook(
  sheets: Sheet[],
  fileName: string,
): Promise<void> {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  await writeExcelFile(
    sheets.map(({ name, rows }) => ({
      sheet: name,
      data: sheetData(rows),
      columns: (rows[0] || []).map(() => ({ width: 30 })),
      stickyRowsCount: 1,
    })),
  ).toFile(fileName);
}
