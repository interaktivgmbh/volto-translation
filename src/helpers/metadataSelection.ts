import type { MetadataSelection, TranslationField } from '../types';

// The checks of the metadata selection. What always goes along, and what the
// mapping translates, is checked and cannot be unchecked; what cannot go along
// is never checked.

// values per field in the metadata mapping as the form holds it
export type MappedCounts = Record<string, number>;

export function normalisedSelection(value: unknown): MetadataSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, ids]) => Array.isArray(ids))
      .map(([typeId, ids]) => [
        typeId,
        (ids as unknown[]).filter(
          (id): id is string => typeof id === 'string' && !!id,
        ),
      ]),
  );
}

export function isMapped(
  field: TranslationField,
  mappedCounts: MappedCounts,
): boolean {
  return field.role !== 'impossible' && (mappedCounts[field.id] || 0) > 0;
}

export function isLocked(
  field: TranslationField,
  mappedCounts: MappedCounts,
): boolean {
  return field.role !== 'default' || isMapped(field, mappedCounts);
}

export function isChecked(
  field: TranslationField,
  chosen: string[] | undefined,
  mappedCounts: MappedCounts,
): boolean {
  if (field.role === 'impossible') {
    return false;
  }
  if (field.role === 'always' || isMapped(field, mappedCounts)) {
    return true;
  }

  // a field goes along only when it is chosen
  return !!chosen && chosen.includes(field.id);
}

// The checked fields of a type, in the order of the list; fields the type no
// longer has drop out.
export function checkedIds(
  fields: TranslationField[],
  chosen: string[] | undefined,
  mappedCounts: MappedCounts,
): string[] {
  return fields
    .filter((field) => isChecked(field, chosen, mappedCounts))
    .map((field) => field.id);
}

export function withChoice(
  selection: MetadataSelection,
  typeId: string,
  fields: TranslationField[],
  mappedCounts: MappedCounts,
  fieldId: string,
  checked: boolean,
): MetadataSelection {
  const current = new Set(checkedIds(fields, selection[typeId], mappedCounts));
  if (checked) {
    current.add(fieldId);
  } else {
    current.delete(fieldId);
  }

  return {
    ...selection,
    [typeId]: fields.map((field) => field.id).filter((id) => current.has(id)),
  };
}

// Every field that can go along, or only those that must.
export function withAll(
  selection: MetadataSelection,
  typeId: string,
  fields: TranslationField[],
  mappedCounts: MappedCounts,
  checked: boolean,
): MetadataSelection {
  return {
    ...selection,
    [typeId]: fields
      .filter((field) =>
        checked
          ? field.role !== 'impossible'
          : isChecked(field, [], mappedCounts),
      )
      .map((field) => field.id),
  };
}
