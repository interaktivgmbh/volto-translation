import { defineMessages } from 'react-intl';
import type { ColumnRole } from '../../../helpers/metadataMapping';

const messages = defineMessages({
  addField: {
    id: 'volto-translation-mapping-add-field',
    defaultMessage: 'Add field',
  },
  fieldIdPlaceholder: {
    id: 'volto-translation-mapping-field-id-placeholder',
    defaultMessage: 'Field id, e.g. subject',
  },
  removeField: {
    id: 'volto-translation-mapping-remove-field',
    defaultMessage: 'Remove field',
  },
  removeFieldHeader: {
    id: 'volto-translation-mapping-remove-field-header',
    defaultMessage: 'Remove the mapping of {field}?',
  },
  removeFieldContent: {
    id: 'volto-translation-mapping-remove-field-content',
    defaultMessage:
      'Its {count} values are removed with it. They take effect once the settings are saved.',
  },
  emptyFieldId: {
    id: 'volto-translation-mapping-empty-field-id',
    defaultMessage: 'Enter a field id.',
  },
  spaceInFieldId: {
    id: 'volto-translation-mapping-space-in-field-id',
    defaultMessage: 'A field id has no spaces.',
  },
  existingFieldId: {
    id: 'volto-translation-mapping-existing-field-id',
    defaultMessage: 'This field is mapped already.',
  },
  noFields: {
    id: 'volto-translation-mapping-no-fields',
    defaultMessage:
      'No field is mapped yet. Add the field whose values have fixed translations, e.g. subject.',
  },
  noLanguages: {
    id: 'volto-translation-mapping-no-languages',
    defaultMessage: 'The site has no languages to map between.',
  },
  newValuePlaceholder: {
    id: 'volto-translation-mapping-new-value-placeholder',
    defaultMessage: 'New value in {language}',
  },
  addValue: {
    id: 'volto-translation-mapping-add-value',
    defaultMessage: 'Add',
  },
  noValues: {
    id: 'volto-translation-mapping-no-values',
    defaultMessage: 'This field has no values yet.',
  },
  action: { id: 'volto-translation-mapping-action', defaultMessage: 'Action' },
  removeRow: {
    id: 'volto-translation-mapping-remove-row',
    defaultMessage: 'Remove row',
  },
  sameAsSource: {
    id: 'volto-translation-mapping-same-as-source',
    defaultMessage: 'as source language',
  },
  duplicate: {
    id: 'volto-translation-mapping-duplicate',
    defaultMessage: 'Appears in more than one row; the last row wins.',
  },
  roleSource: {
    id: 'volto-translation-mapping-role-source',
    defaultMessage: 'Source language',
  },
  roleTarget: {
    id: 'volto-translation-mapping-role-target',
    defaultMessage: 'Target language',
  },
  roleUnoffered: {
    id: 'volto-translation-mapping-role-unoffered',
    defaultMessage: 'Not offered',
  },
  roleOrphan: {
    id: 'volto-translation-mapping-role-orphan',
    defaultMessage: 'No site language',
  },
  removeColumn: {
    id: 'volto-translation-mapping-remove-column',
    defaultMessage: 'Remove column',
  },
  removeColumnHeader: {
    id: 'volto-translation-mapping-remove-column-header',
    defaultMessage: 'Remove the values in {language}?',
  },
  removeColumnContent: {
    id: 'volto-translation-mapping-remove-column-content',
    defaultMessage:
      '{language} is no site language; its values are never used.',
  },
  remove: { id: 'volto-translation-mapping-remove', defaultMessage: 'Remove' },
  cancel: { id: 'volto-translation-mapping-cancel', defaultMessage: 'Cancel' },
  searchPlaceholder: {
    id: 'volto-translation-mapping-search-placeholder',
    defaultMessage: 'Search values …',
  },
  incompleteOnly: {
    id: 'volto-translation-mapping-incomplete-only',
    defaultMessage: 'Only incomplete ({count})',
  },
  noMatches: {
    id: 'volto-translation-mapping-no-matches',
    defaultMessage: 'No values found.',
  },
  pageRange: {
    id: 'volto-translation-mapping-page-range',
    defaultMessage:
      '{start}–{end} of {total, plural, one {# value} other {# values}}',
  },
  pageRangeFiltered: {
    id: 'volto-translation-mapping-page-range-filtered',
    defaultMessage:
      '{start}–{end} of {total, plural, one {# match} other {# matches}} ({all} values)',
  },
  perPage: {
    id: 'volto-translation-mapping-per-page',
    defaultMessage: 'per page',
  },
  page: { id: 'volto-translation-mapping-page', defaultMessage: 'Page {page}' },
  previousPage: {
    id: 'volto-translation-mapping-previous-page',
    defaultMessage: 'Previous page',
  },
  nextPage: {
    id: 'volto-translation-mapping-next-page',
    defaultMessage: 'Next page',
  },
  exportExcel: {
    id: 'volto-translation-mapping-export-excel',
    defaultMessage: 'Export (Excel)',
  },
  importExcel: {
    id: 'volto-translation-mapping-import-excel',
    defaultMessage: 'Import (Excel)',
  },
  exportSheetName: {
    id: 'volto-translation-mapping-export-sheet-name',
    defaultMessage:
      'The field {field} cannot name an Excel sheet: at most 31 characters, none of [ ] : * ? / \\.',
  },
  exportHeader: {
    id: 'volto-translation-mapping-export-header',
    defaultMessage: 'Export the mapping to Excel',
  },
  exportScopeField: {
    id: 'volto-translation-mapping-export-scope-field',
    defaultMessage:
      'Only the selected field {field} ({count, plural, one {# value} other {# values}})',
  },
  exportScopeAll: {
    id: 'volto-translation-mapping-export-scope-all',
    defaultMessage:
      'All fields ({fields, plural, one {# field} other {# fields}}, {count, plural, one {# value} other {# values}}), one sheet per field',
  },
  exportIntro: {
    id: 'volto-translation-mapping-export-intro',
    defaultMessage:
      'The first row names the languages as "German (de)": the source language first, then the other site languages, then languages the site does not have. An empty cell stays empty.',
  },
  exportFile: {
    id: 'volto-translation-mapping-export-file',
    defaultMessage: 'File: {fileName}',
  },
  exportButton: {
    id: 'volto-translation-mapping-export-button',
    defaultMessage: 'Export',
  },
  exportError: {
    id: 'volto-translation-mapping-export-error',
    defaultMessage: 'The file could not be written: {error}',
  },
  importHeader: {
    id: 'volto-translation-mapping-import-header',
    defaultMessage: 'Import the mapping from Excel',
  },
  importIntro: {
    id: 'volto-translation-mapping-import-intro',
    defaultMessage:
      'One column per language, one row per value. The first row names the languages, by code ("de") or name ("German"). An empty cell keeps the value of the source language. A file with several sheets asks which one to take.',
  },
  importChooseFile: {
    id: 'volto-translation-mapping-import-choose-file',
    defaultMessage: 'Choose an .xlsx file',
  },
  importReadError: {
    id: 'volto-translation-mapping-import-read-error',
    defaultMessage: 'The file could not be read: {error}',
  },
  importNoSheets: {
    id: 'volto-translation-mapping-import-no-sheets',
    defaultMessage: 'No sheet of the file holds values.',
  },
  importSheet: {
    id: 'volto-translation-mapping-import-sheet',
    defaultMessage: 'Sheet',
  },
  importField: {
    id: 'volto-translation-mapping-import-field',
    defaultMessage: 'Into field',
  },
  importReplaces: {
    id: 'volto-translation-mapping-import-replaces',
    defaultMessage: 'Replaces {count, plural, one {# value} other {# values}}',
  },
  importSheetValues: {
    id: 'volto-translation-mapping-import-sheet-values',
    defaultMessage: '{sheet}: {count, plural, one {# value} other {# values}}',
  },
  importNewField: {
    id: 'volto-translation-mapping-import-new-field',
    defaultMessage: 'New field',
  },
  importUnknownColumn: {
    id: 'volto-translation-mapping-import-unknown-column',
    defaultMessage: 'Column "{header}" names no language and is left out.',
  },
  importDuplicateLanguage: {
    id: 'volto-translation-mapping-import-duplicate-language',
    defaultMessage: 'Column "{header}" repeats a language and is left out.',
  },
  importNotSiteLanguage: {
    id: 'volto-translation-mapping-import-not-site-language',
    defaultMessage:
      'Column "{header}" is no language of the site; it is taken over but not used.',
  },
  importHeaderlessValues: {
    id: 'volto-translation-mapping-import-headerless-values',
    defaultMessage:
      'Column {column} has no header; {count, plural, one {# value is} other {# values are}} left out.',
  },
  importNoLanguageColumns: {
    id: 'volto-translation-mapping-import-no-language-columns',
    defaultMessage: 'No column names a language.',
  },
  importNote: {
    id: 'volto-translation-mapping-import-note',
    defaultMessage:
      'The import replaces the values of {field} completely; the other fields stay as they are. It takes effect once the settings are saved.',
  },
  importButton: {
    id: 'volto-translation-mapping-import-button',
    defaultMessage: 'Import',
  },
});

export const ROLE_MESSAGES: Record<
  ColumnRole,
  (typeof messages)[keyof typeof messages]
> = {
  source: messages.roleSource,
  target: messages.roleTarget,
  unoffered: messages.roleUnoffered,
  orphan: messages.roleOrphan,
};

export default messages;
