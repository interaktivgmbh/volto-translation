import { defineMessages } from 'react-intl';
import type React from 'react';
import type { ColumnRole } from '../../helpers/metadataMapping';

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

// Enter in an input of the control panel would submit the whole form.
export const onEnter = (action: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    action();
  }
};

// the shape semantic-ui passes to the onChange of an input
export type InputData = { value?: unknown };

export default messages;
