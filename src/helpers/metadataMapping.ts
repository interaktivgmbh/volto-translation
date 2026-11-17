import type {
  MetadataMapping,
  MetadataMappingRow,
  TranslationFieldsType,
} from '../types';

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

// A row as one text, whatever the order and the case of its language keys.
export function rowText(row: MetadataMappingRow): string {
  return JSON.stringify(
    Object.entries(row)
      .filter(([, value]) => value)
      .map(([language, value]) => [language.toLowerCase(), value])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

// What tells a row from the others: its value in the source language, or all
// it holds where it has none.
export function rowKey(
  row: MetadataMappingRow,
  sourceLanguage: string | undefined,
): string {
  const value = sourceLanguage ? cellValue(row, sourceLanguage).trim() : '';

  return value ? `value ${value}` : `row ${rowText(row)}`;
}

// The rows by what tells them. A value named twice has two rows: the first
// of now stands to the first of before, the second to the second.
function rowsByKey(
  rows: MetadataMappingRow[],
  sourceLanguage: string | undefined,
): Map<string, MetadataMappingRow[]> {
  const byKey = new Map<string, MetadataMappingRow[]>();
  rows.forEach((row) => {
    const key = rowKey(row, sourceLanguage);
    byKey.set(key, [...(byKey.get(key) || []), row]);
  });

  return byKey;
}

export type RowMark = 'added' | 'changed';

export interface RowChange {
  mark: RowMark;
  // the languages whose value changed, in lower case; none for a new row
  languages: string[];
}

// How each row stands to the rows the field had before: new, changed in some
// of its languages, or as it was (undefined).
export function rowChanges(
  before: MetadataMappingRow[],
  rows: MetadataMappingRow[],
  sourceLanguage: string | undefined,
): (RowChange | undefined)[] {
  const known = rowsByKey(before, sourceLanguage);
  const met = new Map<string, number>();

  return rows.map((row) => {
    const key = rowKey(row, sourceLanguage);
    const position = met.get(key) || 0;
    met.set(key, position + 1);
    const old = known.get(key)?.[position];
    if (!old) {
      return { mark: 'added', languages: [] };
    }
    const languages = Array.from(
      new Set(
        [...Object.keys(old), ...Object.keys(row)].map((language) =>
          language.toLowerCase(),
        ),
      ),
    ).filter(
      (language) => cellValue(old, language) !== cellValue(row, language),
    );

    return languages.length ? { mark: 'changed', languages } : undefined;
  });
}

// The rows the field had before that it has no longer.
export function removedCount(
  before: MetadataMappingRow[],
  rows: MetadataMappingRow[],
  sourceLanguage: string | undefined,
): number {
  const kept = rowsByKey(rows, sourceLanguage);
  let removed = 0;
  rowsByKey(before, sourceLanguage).forEach((old, key) => {
    removed += Math.max(0, old.length - (kept.get(key) || []).length);
  });

  return removed;
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

// A row is incomplete when an offered target language has no value.
export function isIncomplete(
  row: MetadataMappingRow,
  targetCodes: string[],
): boolean {
  return targetCodes.some((code) => !cellValue(row, code).trim());
}

// A search finds a row by any of its values, in any language.
export function matchesSearch(
  row: MetadataMappingRow,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();

  return (
    !query ||
    Object.values(row).some((value) =>
      (value || '').toLowerCase().includes(query),
    )
  );
}

export interface PageSlice {
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

// The rows of one page; a page beyond the last, e.g. after a removal, shows the last.
export function pageSlice(
  total: number,
  page: number,
  pageSize: number,
): PageSlice {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;

  return {
    page: current,
    pageCount,
    start,
    end: Math.min(start + pageSize, total),
  };
}

// The page links to show: first, last and the neighbours of the current page;
// null stands for the pages left out in between.
export function pageNumbers(
  page: number,
  pageCount: number,
): (number | null)[] {
  const shown = new Set(
    [1, pageCount, page - 1, page, page + 1].filter(
      (number) => number >= 1 && number <= pageCount,
    ),
  );
  const numbers: (number | null)[] = [];
  Array.from(shown)
    .sort((a, b) => a - b)
    .forEach((number, position, sorted) => {
      if (position && number - sorted[position - 1] > 1) {
        numbers.push(null);
      }
      numbers.push(number);
    });

  return numbers;
}

// A field to add to the mapping: each mappable field of the site's content
// types once, by its title.
export interface FieldChoice {
  id: string;
  title: string;
}

export function mappableFields(
  types: TranslationFieldsType[],
  mapped: string[],
): FieldChoice[] {
  const choices = new Map<string, FieldChoice>();
  types.forEach((type) =>
    type.fields.forEach((field) => {
      if (
        field.mappable &&
        !mapped.includes(field.id) &&
        !choices.has(field.id)
      ) {
        choices.set(field.id, { id: field.id, title: field.title || field.id });
      }
    }),
  );

  return Array.from(choices.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

// The fields an import may go into: the mapped ones first, as the tabs show
// them, then those that may be added.
export function importableFields(
  types: TranslationFieldsType[] | null,
  mapped: string[],
): FieldChoice[] {
  const titles = types ? fieldTitles(types) : {};

  return [
    ...mapped.map((id) => ({ id, title: titles[id] || id })),
    ...(types ? mappableFields(types, mapped) : []),
  ];
}

// Mapped fields no content type of the site has (left from an import or an
// earlier setup): shown with a hint, to be removed.
export function unknownFields(
  types: TranslationFieldsType[],
  mapped: string[],
): string[] {
  const known = new Set(
    types.flatMap((type) => type.fields.map((field) => field.id)),
  );

  return mapped.filter((fieldId) => !known.has(fieldId));
}

// The title of each field of the site's content types, by its id.
export function fieldTitles(
  types: TranslationFieldsType[],
): Record<string, string> {
  const titles: Record<string, string> = {};
  types.forEach((type) =>
    type.fields.forEach((field) => {
      if (!(field.id in titles) && field.title) {
        titles[field.id] = field.title;
      }
    }),
  );

  return titles;
}
