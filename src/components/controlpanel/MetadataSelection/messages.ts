import { defineMessages } from 'react-intl';
import type { FieldMode, FieldReason } from '../../../types';

const messages = defineMessages({
  typesLabel: {
    id: 'volto-translation-selection-types-label',
    defaultMessage: 'Content types',
  },
  searchPlaceholder: {
    id: 'volto-translation-selection-search-placeholder',
    defaultMessage: 'Search fields …',
  },
  searchLabel: {
    id: 'volto-translation-selection-search-label',
    defaultMessage: 'Search fields',
  },
  count: {
    id: 'volto-translation-selection-count',
    defaultMessage:
      '{selected} of {total, plural, one {# field} other {# fields}} {selected, plural, one {goes} other {go}} along',
  },
  columnField: {
    id: 'volto-translation-selection-column-field',
    defaultMessage: 'Field',
  },
  columnMode: {
    id: 'volto-translation-selection-column-mode',
    defaultMessage: 'Treatment',
  },
  tableCaption: {
    id: 'volto-translation-selection-table-caption',
    defaultMessage: 'Fields of the type {type}',
  },
  modeTranslate: {
    id: 'volto-translation-selection-mode-translate',
    defaultMessage: 'Translate',
  },
  modeCopy: {
    id: 'volto-translation-selection-mode-copy',
    defaultMessage: 'Take over',
  },
  modeMapping: {
    id: 'volto-translation-selection-mode-mapping',
    defaultMessage: 'Via mapping',
  },
  modeImpossible: {
    id: 'volto-translation-selection-mode-impossible',
    defaultMessage: 'Not possible',
  },
  always: {
    id: 'volto-translation-selection-always',
    defaultMessage: 'Always along',
  },
  reasonAlways: {
    id: 'volto-translation-selection-reason-always',
    defaultMessage: 'Title, description and page content always go along.',
  },
  reasonPrimary: {
    id: 'volto-translation-selection-reason-primary',
    defaultMessage: 'The main field of this type always goes along.',
  },
  reasonMapping: {
    id: 'volto-translation-selection-reason-mapping',
    defaultMessage:
      'The field has {count, plural, one {# value} other {# values}} in the metadata mapping.',
  },
  reasonFieldName: {
    id: 'volto-translation-selection-reason-field-name',
    defaultMessage: 'A known field whose text is no prose, e.g. an address.',
  },
  reasonLanguageIndependent: {
    id: 'volto-translation-selection-reason-language-independent',
    defaultMessage: 'The field is the same in every language.',
  },
  reasonFieldType: {
    id: 'volto-translation-selection-reason-field-type',
    defaultMessage: 'Follows from the kind of field: {kind}.',
  },
  reasonImpossible: {
    id: 'volto-translation-selection-reason-impossible',
    defaultMessage: 'A reference or a structure cannot go along: {kind}.',
  },
  loading: {
    id: 'volto-translation-selection-loading',
    defaultMessage: 'Loading the fields …',
  },
  loadError: {
    id: 'volto-translation-selection-load-error',
    defaultMessage: 'The fields could not be loaded: {error}',
  },
  noTypes: {
    id: 'volto-translation-selection-no-types',
    defaultMessage: 'There is no content type to set up.',
  },
  noMatches: {
    id: 'volto-translation-selection-no-matches',
    defaultMessage: 'No field found.',
  },
  modeSkipped: {
    id: 'volto-translation-selection-mode-skipped',
    defaultMessage: 'Not selected',
  },
  selectAll: {
    id: 'volto-translation-selection-select-all',
    defaultMessage: 'Select all',
  },
  deselectAll: {
    id: 'volto-translation-selection-deselect-all',
    defaultMessage: 'Deselect all',
  },
  selectAllLabel: {
    id: 'volto-translation-selection-select-all-label',
    defaultMessage: 'Select all fields of {type}',
  },
  deselectAllLabel: {
    id: 'volto-translation-selection-deselect-all-label',
    defaultMessage: 'Deselect all fields of {type}',
  },
});

export const MODE_MESSAGES: Record<
  FieldMode,
  (typeof messages)[keyof typeof messages]
> = {
  translate: messages.modeTranslate,
  copy: messages.modeCopy,
  mapping: messages.modeMapping,
};

export const REASON_MESSAGES: Record<
  FieldReason,
  (typeof messages)[keyof typeof messages]
> = {
  always: messages.reasonAlways,
  primary: messages.reasonPrimary,
  field_name: messages.reasonFieldName,
  language_independent: messages.reasonLanguageIndependent,
  field_type: messages.reasonFieldType,
};

export default messages;
