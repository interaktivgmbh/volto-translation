import type {
  ChosenFields,
  ChosenMode,
  MetadataSelection,
  TranslationField,
} from '../types';

// The choices of the metadata selection. What always goes along, and what the
// mapping translates, is checked and cannot be unchecked; what cannot go along
// is never checked. A checked field is translated or taken over, as chosen
// among the modes it can take.

// values per field in the metadata mapping as the form holds it
export type MappedCounts = Record<string, number>;

const CHOSEN_MODES: unknown[] = ['translate', 'copy'];

export function normalisedSelection(value: unknown): MetadataSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  // a type's fields as a list, as they were before a field named how it goes
  // along, are dropped: the backend's upgrade step turns them into this form
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(
        ([, chosen]) =>
          !!chosen && typeof chosen === 'object' && !Array.isArray(chosen),
      )
      .map(([typeId, chosen]) => [
        typeId,
        Object.fromEntries(
          Object.entries(chosen as Record<string, unknown>).filter(
            ([fieldId, mode]) => !!fieldId && CHOSEN_MODES.includes(mode),
          ),
        ) as ChosenFields,
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
  chosen: ChosenFields | undefined,
  mappedCounts: MappedCounts,
): boolean {
  if (field.role === 'impossible') {
    return false;
  }
  if (field.role === 'always' || isMapped(field, mappedCounts)) {
    return true;
  }

  // a field goes along only when it is chosen
  return !!chosen && Object.prototype.hasOwnProperty.call(chosen, field.id);
}

// The mode a field goes by when it is chosen: as chosen, else as its kind
// suggests; undefined for a field without a choice.
export function chosenMode(
  field: TranslationField,
  chosen: ChosenFields | undefined,
): ChosenMode | undefined {
  const modes = field.modes || [];
  const wanted = chosen?.[field.id];
  if (wanted && modes.includes(wanted)) {
    return wanted;
  }

  return modes.find((mode) => mode === field.mode) || modes[0];
}

// A checked field that may go along either way, and that no mapping takes.
export function hasChoice(
  field: TranslationField,
  chosen: ChosenFields | undefined,
  mappedCounts: MappedCounts,
): boolean {
  return (
    field.role === 'default' &&
    (field.modes || []).length > 1 &&
    !isMapped(field, mappedCounts) &&
    isChecked(field, chosen, mappedCounts)
  );
}

// The fields of a type as they are saved, in the order of the list: those
// with a choice that are checked. Fields the type no longer has drop out.
function chosenFields(
  fields: TranslationField[],
  chosen: ChosenFields | undefined,
  checked: (field: TranslationField) => boolean,
): ChosenFields {
  const next: ChosenFields = {};
  fields.forEach((field) => {
    const mode = field.role === 'default' && chosenMode(field, chosen);
    if (mode && checked(field)) {
      next[field.id] = mode;
    }
  });

  return next;
}

export function withChoice(
  selection: MetadataSelection,
  typeId: string,
  fields: TranslationField[],
  mappedCounts: MappedCounts,
  fieldId: string,
  checked: boolean,
): MetadataSelection {
  const chosen = selection[typeId];

  return {
    ...selection,
    [typeId]: chosenFields(fields, chosen, (field) =>
      field.id === fieldId ? checked : isChecked(field, chosen, mappedCounts),
    ),
  };
}

export function withMode(
  selection: MetadataSelection,
  typeId: string,
  fields: TranslationField[],
  mappedCounts: MappedCounts,
  fieldId: string,
  mode: ChosenMode,
): MetadataSelection {
  const chosen = { ...selection[typeId], [fieldId]: mode };

  return {
    ...selection,
    [typeId]: chosenFields(fields, chosen, (field) =>
      isChecked(field, chosen, mappedCounts),
    ),
  };
}

// Every field that can go along, each as it is chosen or as its kind
// suggests; or only those that must.
export function withAll(
  selection: MetadataSelection,
  typeId: string,
  fields: TranslationField[],
  mappedCounts: MappedCounts,
  checked: boolean,
): MetadataSelection {
  const chosen = selection[typeId];

  return {
    ...selection,
    [typeId]: chosenFields(
      fields,
      chosen,
      (field) => checked || isChecked(field, {}, mappedCounts),
    ),
  };
}
