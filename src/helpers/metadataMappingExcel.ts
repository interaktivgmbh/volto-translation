import type { MetadataMapping, MetadataMappingRow } from '../types';
import { ISO_639_1_CODES, languageName } from './languages';
import { mappingColumns } from './metadataMapping';
import type { FieldChoice } from './metadataMapping';

// A worksheet as plain cells: no library type leaks past this point.
export interface Sheet {
  name: string;
  rows: unknown[][];
}

export type SheetWarning =
  | { kind: 'unknownColumn'; header: string }
  | { kind: 'duplicateLanguage'; header: string }
  | { kind: 'notSiteLanguage'; header: string }
  | { kind: 'headerlessValues'; column: string; count: number }
  | { kind: 'noLanguageColumns' };

export interface ImportedSheet {
  name: string;
  rows: MetadataMappingRow[];
  warnings: SheetWarning[];
}

const LANGUAGE_RE = /^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})?$/;
// "Deutsch (de)", as the export writes it
const NAMED_CODE_RE = /\(([^()]+)\)\s*$/;
// Excel refuses these in a sheet name, and more than 31 characters
const SHEET_NAME_RE = /^[^[\]:*?/\\]{1,31}$/;

// "A" for the first column, "AA" after "Z", as Excel names them
export function columnLetter(index: number): string {
  let letters = '';
  for (let rest = index + 1; rest > 0; rest = Math.floor((rest - 1) / 26)) {
    letters = String.fromCharCode(65 + ((rest - 1) % 26)) + letters;
  }

  return letters;
}

function cellText(cell: unknown): string {
  if (cell === null || cell === undefined) {
    return '';
  }

  return String(cell).trim();
}

// The language a header names: a code ("de"), the export's "Deutsch (de)",
// or a name in the editor's language, English or the language itself.
// Site languages come first, so their spelling of the code wins.
export function headerLanguage(
  header: string,
  siteLanguages: string[],
  locale: string,
): string | undefined {
  const text = header.trim();
  const named = NAMED_CODE_RE.exec(text);
  const code = named ? named[1].trim() : text;
  if (LANGUAGE_RE.test(code)) {
    const site = siteLanguages.find(
      (language) => language.toLowerCase() === code.toLowerCase(),
    );

    return site || code;
  }

  const lower = text.toLowerCase();

  return [...siteLanguages, ...ISO_639_1_CODES].find((language) =>
    [locale, 'en', language].some(
      (nameLocale) =>
        languageName(language, nameLocale).toLowerCase() === lower,
    ),
  );
}

export function sheetToRows(
  sheet: Sheet,
  siteLanguages: string[],
  locale: string,
): ImportedSheet {
  const [header = [], ...body] = sheet.rows;
  const warnings: SheetWarning[] = [];
  const seen = new Set<string>();
  // a column that names no language, or one named before, is dropped
  const columns = header.map((cell) => {
    const text = cellText(cell);
    if (!text) {
      return undefined;
    }
    const language = headerLanguage(text, siteLanguages, locale);
    if (!language) {
      warnings.push({ kind: 'unknownColumn', header: text });
      return undefined;
    }
    if (seen.has(language.toLowerCase())) {
      warnings.push({ kind: 'duplicateLanguage', header: text });
      return undefined;
    }
    seen.add(language.toLowerCase());
    // kept, as the table keeps it: the site may offer the language later
    if (!siteLanguages.includes(language)) {
      warnings.push({ kind: 'notSiteLanguage', header: text });
    }

    return language;
  });
  if (!seen.size) {
    warnings.push({ kind: 'noLanguageColumns' });
  }

  // values below an empty header are dropped as well, but not silently
  const width = Math.max(header.length, ...body.map((cells) => cells.length));
  for (let index = 0; index < width; index += 1) {
    const count = cellText(header[index])
      ? 0
      : body.filter((cells) => cellText(cells[index])).length;
    if (count) {
      warnings.push({
        kind: 'headerlessValues',
        column: columnLetter(index),
        count,
      });
    }
  }

  const rows: MetadataMappingRow[] = [];
  body.forEach((cells) => {
    // an empty cell is left out: the translation keeps the source value
    const row: MetadataMappingRow = {};
    columns.forEach((language, index) => {
      const text = cellText(cells[index]);
      if (language && text) {
        row[language] = text;
      }
    });
    if (Object.keys(row).length) {
      rows.push(row);
    }
  });

  return { name: sheet.name, rows, warnings };
}

// The field a name tells: its id, or its title when no other field has it.
function namedField(name: string, fields: FieldChoice[]): string | undefined {
  const text = name.trim();
  const exact = fields.find((field) => field.id === text);
  if (exact) {
    return exact.id;
  }
  const lower = text.toLowerCase();
  const byId = fields.filter((field) => field.id.toLowerCase() === lower);
  if (byId.length) {
    return byId.length === 1 ? byId[0].id : undefined;
  }
  const byTitle = fields.filter((field) => field.title.toLowerCase() === lower);

  return byTitle.length === 1 ? byTitle[0].id : undefined;
}

// The field each sheet goes into where that is beyond doubt: the sheet is
// named like one field, as the export names it, and no other sheet is. The
// only sheet of a file, named like no field, goes into the fallback.
export function sheetTargets(
  sheetNames: string[],
  fields: FieldChoice[],
  fallback?: string,
): Record<string, string> {
  const named = sheetNames.map((name) => namedField(name, fields));
  const targets: Record<string, string> = {};
  sheetNames.forEach((name, index) => {
    const field = named[index];
    if (field && named.filter((other) => other === field).length === 1) {
      targets[name] = field;
    }
  });
  if (
    sheetNames.length === 1 &&
    !named[0] &&
    fallback &&
    fields.some((field) => field.id === fallback)
  ) {
    targets[sheetNames[0]] = fallback;
  }

  return targets;
}

// A sheet without a single value: Excel's spare sheets, left out unseen.
export function isEmptySheet(sheet: Sheet): boolean {
  return !sheet.rows.some((cells) => cells.some((cell) => cellText(cell)));
}

export interface SheetChanges {
  added: number;
  changed: number;
  removed: number;
  unchanged: number;
}

// A row as one text, whatever the order and the case of its language keys.
function rowText(row: MetadataMappingRow): string {
  return JSON.stringify(
    Object.entries(row)
      .filter(([, value]) => value)
      .map(([language, value]) => [language.toLowerCase(), value])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

// What an import does to a field. A row is told by its value in the source
// language, a row without one by all it holds: new, changed, unchanged, or,
// where the file no longer has it, removed. A value named twice counts once,
// its last row, as the translation takes it.
export function sheetChanges(
  existing: MetadataMappingRow[],
  imported: MetadataMappingRow[],
  sourceLanguage: string | undefined,
): SheetChanges {
  const byKey = (rows: MetadataMappingRow[]) => {
    const texts = new Map<string, string>();
    rows.forEach((row) => {
      const text = rowText(row);
      const language = Object.keys(row).find(
        (key) => key.toLowerCase() === sourceLanguage?.toLowerCase(),
      );
      const value = language ? row[language].trim() : '';
      texts.set(value ? `value ${value}` : `row ${text}`, text);
    });

    return texts;
  };
  const before = byKey(existing);
  const after = byKey(imported);
  const changes = { added: 0, changed: 0, removed: 0, unchanged: 0 };
  after.forEach((text, key) => {
    if (!before.has(key)) {
      changes.added += 1;
    } else if (before.get(key) === text) {
      changes.unchanged += 1;
    } else {
      changes.changed += 1;
    }
  });
  before.forEach((_text, key) => {
    if (!after.has(key)) {
      changes.removed += 1;
    }
  });

  return changes;
}

export function isSheetName(name: string): boolean {
  return SHEET_NAME_RE.test(name);
}

// One sheet per field; the header names each language as "Deutsch (de)".
export function mappingToSheets(
  mapping: MetadataMapping,
  siteLanguages: string[],
  sourceLanguage: string | undefined,
  locale: string,
): Sheet[] {
  return Object.entries(mapping).map(([fieldId, rows]) => {
    // every site language counts as offered: the file holds all of them
    const codes = mappingColumns(rows, siteLanguages, sourceLanguage, []).map(
      (column) => column.code,
    );
    const header = codes.map(
      (code) => `${languageName(code, locale)} (${code})`,
    );
    const body = rows.map((row) => {
      const lower = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
      );
      return codes.map((code) => lower[code.toLowerCase()] || '');
    });

    return { name: fieldId, rows: [header, ...body] };
  });
}

// metadata-mapping-subjects-2026-10-23.xlsx, or without the field for all
export function exportFileName(
  fieldId?: string,
  date: Date = new Date(),
): string {
  const day = date.toISOString().slice(0, 10);
  const field = fieldId ? `${fieldId.replace(/[^\w.-]+/g, '-')}-` : '';

  return `metadata-mapping-${field}${day}.xlsx`;
}
