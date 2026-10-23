import type { MetadataMapping, MetadataMappingRow } from '../types';

// What a language column is for. "orphan" holds values of a language the site
// no longer has: they are never used and the column may be removed.
export type ColumnRole = 'source' | 'target' | 'unoffered' | 'orphan';

export interface MappingColumn {
  code: string;
  role: ColumnRole;
}

// One column per site language, the source language first, then the
// languages that only the rows still name.
export function mappingColumns(
  rows: MetadataMappingRow[],
  siteLanguages: string[],
  sourceLanguage: string | undefined,
  targetLanguages: string[] | null | undefined,
): MappingColumn[] {
  const site = sourceLanguage
    ? [
        sourceLanguage,
        ...siteLanguages.filter((code) => code !== sourceLanguage),
      ]
    : [...siteLanguages];
  // an empty choice offers every site language
  const offered = targetLanguages?.length ? targetLanguages : site;

  const columns: MappingColumn[] = site.map((code) => ({
    code,
    role:
      code === sourceLanguage
        ? 'source'
        : offered.includes(code)
          ? 'target'
          : 'unoffered',
  }));

  const known = new Set(site.map((code) => code.toLowerCase()));
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!known.has(key.toLowerCase())) {
        known.add(key.toLowerCase());
        columns.push({ code: key, role: 'orphan' });
      }
    });
  });

  return columns;
}

// The backend reads language keys without regard to case: "DE" is "de".
function keyFor(row: MetadataMappingRow, code: string): string | undefined {
  return Object.keys(row).find(
    (key) => key.toLowerCase() === code.toLowerCase(),
  );
}

export function cellValue(row: MetadataMappingRow, code: string): string {
  const key = keyFor(row, code);

  return key ? row[key] : '';
}

// An emptied cell leaves the row: the translation keeps the source value.
export function withCell(
  row: MetadataMappingRow,
  code: string,
  value: string,
): MetadataMappingRow {
  const next = { ...row };
  const key = keyFor(next, code);
  if (key) {
    delete next[key];
  }
  if (value) {
    next[code] = value;
  }

  return next;
}

export function withoutLanguage(
  rows: MetadataMappingRow[],
  code: string,
): MetadataMappingRow[] {
  return rows.map((row) => withCell(row, code, ''));
}

// Source values that appear in more than one row: the last row wins on
// translation, so the editor should see them.
export function duplicateValues(
  rows: MetadataMappingRow[],
  code: string,
): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  rows.forEach((row) => {
    const value = cellValue(row, code).trim();
    if (value && seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  });

  return duplicates;
}

// A choice field arrives as [{token, title}] from the backend and may hold
// plain codes once the editor changed it.
export function languageCodes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) =>
      typeof entry === 'string' ? entry : entry?.token || entry?.value,
    )
    .filter((code): code is string => typeof code === 'string' && !!code);
}

export function normalisedMapping(value: unknown): MetadataMapping {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as MetadataMapping)
    : {};
}
