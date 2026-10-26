import React from 'react';
import { useIntl } from 'react-intl';
import { Label, Table } from 'semantic-ui-react';
import type { FieldMode, TranslationField } from '../../../types';
import messages, { MODE_MESSAGES, REASON_MESSAGES } from './messages';

interface SelectionTableProps {
  fields: TranslationField[];
  // values per field in the metadata mapping as the form holds it now
  mappedCounts: Record<string, number>;
  caption: string;
  emptyText: string;
}

// One row per field: whether it goes along, and how. Read only for now: the
// check boxes show the suggestion until choosing the fields is built.
const SelectionTable = (props: SelectionTableProps) => {
  const { fields, mappedCounts } = props;
  const intl = useIntl();

  // a field the mapping has values for goes through it, whatever else applies
  const mappedCount = (field: TranslationField) =>
    field.role === 'impossible' ? 0 : mappedCounts[field.id] || 0;
  const modeOf = (field: TranslationField): FieldMode | null =>
    mappedCount(field) ? 'mapping' : field.mode;

  const reason = (field: TranslationField) =>
    field.role === 'impossible'
      ? intl.formatMessage(messages.reasonImpossible, { kind: field.kind })
      : mappedCount(field)
        ? intl.formatMessage(messages.reasonMapping, {
            count: mappedCount(field),
          })
        : intl.formatMessage(REASON_MESSAGES[field.reason], {
            kind: field.kind,
          });

  return (
    <div className="metadata-mapping-table-wrapper">
      <Table
        compact
        className="metadata-mapping-table metadata-selection-table"
      >
        <caption className="metadata-mapping-sr-only">{props.caption}</caption>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">
              {intl.formatMessage(messages.columnField)}
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className="metadata-selection-mode">
              {intl.formatMessage(messages.columnMode)}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {fields.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={2} className="metadata-mapping-empty">
                {props.emptyText}
              </Table.Cell>
            </Table.Row>
          )}
          {fields.map((field) => {
            const possible = field.role !== 'impossible';
            const checkboxId = `metadata-selection-${field.id}`;
            const fieldMode = modeOf(field);
            const mode = fieldMode
              ? intl.formatMessage(MODE_MESSAGES[fieldMode])
              : intl.formatMessage(messages.modeImpossible);

            return (
              <Table.Row key={field.id} className={`role-${field.role}`}>
                <Table.Cell>
                  <span className="metadata-selection-field">
                    <input
                      type="checkbox"
                      id={checkboxId}
                      checked={possible}
                      disabled
                      readOnly
                    />
                    <label htmlFor={checkboxId}>
                      {field.title}
                      <span className="metadata-selection-id">{field.id}</span>
                    </label>
                    {field.role === 'always' && (
                      <Label size="tiny" className="metadata-selection-always">
                        {intl.formatMessage(messages.always)}
                      </Label>
                    )}
                  </span>
                </Table.Cell>
                <Table.Cell className="metadata-selection-mode">
                  <span
                    className={`metadata-selection-status mode-${fieldMode || 'impossible'}`}
                    title={reason(field)}
                  >
                    {mode}
                  </span>
                  {/* the reason, read out with the treatment */}
                  <span className="metadata-mapping-sr-only">
                    {' '}
                    {reason(field)}
                  </span>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SelectionTable;
