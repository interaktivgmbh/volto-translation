import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Confirm,
  Input,
  Label,
  Message,
  Table,
} from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import clearSVG from '@plone/volto/icons/clear.svg';
import { languageName } from '../helpers/languages';
import {
  cellValue,
  duplicateValues,
  languageCodes,
  mappingColumns,
  normalisedMapping,
  withCell,
  withoutLanguage,
} from '../helpers/metadataMapping';
import type { ColumnRole } from '../helpers/metadataMapping';
import type {
  MetadataMapping,
  MetadataMappingRow,
  TranslationState,
} from '../types';

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

const ROLE_MESSAGES: Record<
  ColumnRole,
  (typeof messages)[keyof typeof messages]
> = {
  source: messages.roleSource,
  target: messages.roleTarget,
  unoffered: messages.roleUnoffered,
  orphan: messages.roleOrphan,
};

interface MetadataMappingWidgetProps {
  id: string;
  title: string;
  description?: string;
  value?: MetadataMapping | null;
  onChange: (id: string, value: MetadataMapping) => void;
  formData?: { target_languages?: unknown };
  error?: string[];
  fieldSet?: string;
  required?: boolean;
}

type Pending =
  | { kind: 'field'; field: string }
  | { kind: 'column'; code: string }
  | null;

// Enter in an input of the control panel would submit the whole form.
const onEnter = (action: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    action();
  }
};

const MetadataMappingWidget = (props: MetadataMappingWidgetProps) => {
  const { id, title, value, onChange, formData } = props;
  const intl = useIntl();
  const site = useSelector((state: TranslationState) => state.site?.data) || {};

  const mapping = normalisedMapping(value);
  const fieldIds = Object.keys(mapping);
  const [selected, setSelected] = useState<string | undefined>(fieldIds[0]);
  const [newFieldId, setNewFieldId] = useState('');
  const [fieldIdError, setFieldIdError] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');
  const [pending, setPending] = useState<Pending>(null);

  const current = selected && selected in mapping ? selected : fieldIds[0];
  const rows: MetadataMappingRow[] = current ? mapping[current] || [] : [];

  const siteLanguages = site['plone.available_languages'] || [];
  const sourceLanguage = site['plone.default_language'] || siteLanguages[0];
  const columns = mappingColumns(
    rows,
    siteLanguages,
    sourceLanguage,
    languageCodes(formData?.target_languages),
  );
  const duplicates = sourceLanguage
    ? duplicateValues(rows, sourceLanguage)
    : new Set<string>();
  const name = (code: string) => languageName(code, intl.locale);

  const change = (next: MetadataMapping) => onChange(id, next);
  const changeRows = (nextRows: MetadataMappingRow[]) => {
    if (current) {
      change({ ...mapping, [current]: nextRows });
    }
  };

  const addField = () => {
    const fieldId = newFieldId.trim();
    if (!fieldId) {
      setFieldIdError(intl.formatMessage(messages.emptyFieldId));
    } else if (/\s/.test(fieldId)) {
      setFieldIdError(intl.formatMessage(messages.spaceInFieldId));
    } else if (fieldId in mapping) {
      setFieldIdError(intl.formatMessage(messages.existingFieldId));
    } else {
      change({ ...mapping, [fieldId]: [] });
      setSelected(fieldId);
      setNewFieldId('');
      setFieldIdError(null);
    }
  };

  const addValue = () => {
    const text = newValue.trim();
    if (text && sourceLanguage) {
      changeRows([...rows, { [sourceLanguage]: text }]);
      setNewValue('');
    }
  };

  const confirmPending = () => {
    if (pending?.kind === 'field') {
      const { [pending.field]: _removed, ...rest } = mapping;
      change(rest);
    } else if (pending?.kind === 'column') {
      changeRows(withoutLanguage(rows, pending.code));
    }
    setPending(null);
  };

  return (
    <FormFieldWrapper
      {...props}
      columns={1}
      className="metadata-mapping-widget"
    >
      <div className="metadata-mapping-title">{title}</div>

      <div className="metadata-mapping-fields">
        {fieldIds.map((fieldId) => (
          <Button
            key={fieldId}
            type="button"
            active={fieldId === current}
            className={
              fieldId === current
                ? 'metadata-mapping-tab selected'
                : 'metadata-mapping-tab'
            }
            onClick={() => setSelected(fieldId)}
          >
            {fieldId}
          </Button>
        ))}
        <span className="metadata-mapping-add-field">
          <Input
            value={newFieldId}
            placeholder={intl.formatMessage(messages.fieldIdPlaceholder)}
            error={!!fieldIdError}
            onChange={(
              _event: React.SyntheticEvent,
              data: { value?: unknown },
            ) => {
              setNewFieldId(String(data.value));
              setFieldIdError(null);
            }}
            onKeyDown={onEnter(addField)}
          />
          <Button
            type="button"
            className="metadata-mapping-secondary"
            onClick={addField}
          >
            {intl.formatMessage(messages.addField)}
          </Button>
        </span>
      </div>
      {fieldIdError && (
        <Label basic color="red" pointing>
          {fieldIdError}
        </Label>
      )}

      {!current && (
        <Message info>{intl.formatMessage(messages.noFields)}</Message>
      )}
      {current && !siteLanguages.length && (
        <Message warning>{intl.formatMessage(messages.noLanguages)}</Message>
      )}

      {current && siteLanguages.length > 0 && (
        <>
          <div className="metadata-mapping-toolbar">
            <Input
              value={newValue}
              placeholder={intl.formatMessage(messages.newValuePlaceholder, {
                language: name(sourceLanguage || ''),
              })}
              onChange={(
                _event: React.SyntheticEvent,
                data: { value?: unknown },
              ) => setNewValue(String(data.value))}
              onKeyDown={onEnter(addValue)}
            />
            <Button
              type="button"
              primary
              disabled={!newValue.trim()}
              onClick={addValue}
            >
              {intl.formatMessage(messages.addValue)}
            </Button>
            <Button
              type="button"
              className="metadata-mapping-secondary negative metadata-mapping-remove-field"
              onClick={() => setPending({ kind: 'field', field: current })}
            >
              {intl.formatMessage(messages.removeField)}
            </Button>
          </div>

          <div className="metadata-mapping-table-wrapper">
            <Table compact className="metadata-mapping-table">
              <Table.Header>
                <Table.Row>
                  {columns.map((column) => (
                    <Table.HeaderCell
                      key={column.code}
                      className={`role-${column.role}`}
                    >
                      <div className="metadata-mapping-language">
                        {name(column.code)}
                      </div>
                      <Label
                        size="mini"
                        className={`metadata-mapping-role role-${column.role}`}
                      >
                        {intl.formatMessage(ROLE_MESSAGES[column.role])}
                      </Label>
                      {column.role === 'orphan' && (
                        <Button
                          type="button"
                          className="metadata-mapping-secondary negative"
                          size="mini"
                          onClick={() =>
                            setPending({ kind: 'column', code: column.code })
                          }
                        >
                          {intl.formatMessage(messages.removeColumn)}
                        </Button>
                      )}
                    </Table.HeaderCell>
                  ))}
                  <Table.HeaderCell collapsing>
                    {intl.formatMessage(messages.action)}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length + 1}>
                      {intl.formatMessage(messages.noValues)}
                    </Table.Cell>
                  </Table.Row>
                )}
                {rows.map((row, index) => (
                  // rows have no id of their own; their position is their identity
                  // eslint-disable-next-line react/no-array-index-key
                  <Table.Row key={index}>
                    {columns.map((column) => {
                      const cell = cellValue(row, column.code);
                      const duplicate =
                        column.role === 'source' && duplicates.has(cell.trim());

                      return (
                        <Table.Cell
                          key={column.code}
                          className={`role-${column.role}`}
                        >
                          <Input
                            fluid
                            value={cell}
                            error={duplicate}
                            title={
                              duplicate
                                ? intl.formatMessage(messages.duplicate)
                                : undefined
                            }
                            placeholder={
                              column.role === 'source'
                                ? undefined
                                : intl.formatMessage(messages.sameAsSource)
                            }
                            onChange={(
                              _event: React.SyntheticEvent,
                              data: { value?: unknown },
                            ) => {
                              const next = [...rows];
                              next[index] = withCell(
                                row,
                                column.code,
                                String(data.value),
                              );
                              changeRows(next);
                            }}
                          />
                        </Table.Cell>
                      );
                    })}
                    <Table.Cell collapsing>
                      <Button
                        type="button"
                        basic
                        icon
                        className="metadata-mapping-remove-row"
                        aria-label={intl.formatMessage(messages.removeRow)}
                        title={intl.formatMessage(messages.removeRow)}
                        onClick={() =>
                          changeRows(
                            rows.filter((_row, position) => position !== index),
                          )
                        }
                      >
                        <Icon name={clearSVG} size="18px" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </>
      )}

      <Confirm
        open={pending !== null}
        header={
          pending?.kind === 'field'
            ? intl.formatMessage(messages.removeFieldHeader, {
                field: pending.field,
              })
            : pending?.kind === 'column'
              ? intl.formatMessage(messages.removeColumnHeader, {
                  language: name(pending.code),
                })
              : ''
        }
        content={
          <div className="content">
            {pending?.kind === 'field'
              ? intl.formatMessage(messages.removeFieldContent, {
                  count: (mapping[pending.field] || []).length,
                })
              : pending?.kind === 'column'
                ? intl.formatMessage(messages.removeColumnContent, {
                    language: name(pending.code),
                  })
                : null}
          </div>
        }
        confirmButton={intl.formatMessage(messages.remove)}
        cancelButton={intl.formatMessage(messages.cancel)}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </FormFieldWrapper>
  );
};

export default MetadataMappingWidget;
