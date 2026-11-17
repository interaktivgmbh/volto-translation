import React from 'react';
import { useIntl } from 'react-intl';
import { Label, Table } from 'semantic-ui-react';
import {
  chosenMode,
  isChecked,
  isLocked,
} from '../../../helpers/metadataSelection';
import type {
  ChosenFields,
  ChosenMode,
  FieldMode,
  TranslationField,
} from '../../../types';
import messages, { MODE_MESSAGES, REASON_MESSAGES } from './messages';

interface SelectionTableProps {
  fields: TranslationField[];
  // values per field in the metadata mapping as the form holds it now
  mappedCounts: Record<string, number>;
  // the fields chosen for the type, and how they go along; undefined: none yet
  chosen: ChosenFields | undefined;
  onToggle: (fieldId: string, checked: boolean) => void;
  onMode: (fieldId: string, mode: ChosenMode) => void;
  caption: string;
  emptyText: string;
}

// One row per field: whether it goes along, and how, chosen in one place. A
// text is translated, taken over or left out; any other field taken over or
// left out. What always goes along, what the mapping translates and what
// cannot go along has no choice.
const SelectionTable = (props: SelectionTableProps) => {
  const { fields, mappedCounts, chosen, onToggle, onMode } = props;
  const intl = useIntl();

  // a field the mapping has values for goes through it, whatever else applies
  const mappedCount = (field: TranslationField) =>
    field.role === 'impossible' ? 0 : mappedCounts[field.id] || 0;
  // a field of the site's choice goes as it is chosen, any other by its kind
  const modeOf = (field: TranslationField): FieldMode | null =>
    mappedCount(field)
      ? 'mapping'
      : (field.role === 'default' && chosenMode(field, chosen)) || field.mode;

  const reason = (field: TranslationField) =>
    field.role === 'impossible'
      ? intl.formatMessage(messages.reasonImpossible, { kind: field.kind })
      : mappedCount(field)
        ? intl.formatMessage(messages.reasonMapping, {
            count: mappedCount(field),
          })
        : modeOf(field) !== field.mode
          ? intl.formatMessage(messages.reasonChosen)
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
            const checked = isChecked(field, chosen, mappedCounts);
            const modes = isLocked(field, mappedCounts)
              ? []
              : field.modes || [];
            const fieldMode = modeOf(field);
            const status =
              !checked && field.role !== 'impossible'
                ? 'skipped'
                : fieldMode || 'impossible';
            const mode =
              status === 'skipped'
                ? intl.formatMessage(messages.modeSkipped)
                : fieldMode
                  ? intl.formatMessage(MODE_MESSAGES[fieldMode])
                  : intl.formatMessage(messages.modeImpossible);

            return (
              <Table.Row
                key={field.id}
                className={`role-${field.role} status-${status}`}
              >
                <Table.Cell>
                  <span className="metadata-selection-field">
                    {/* told by the treatment as well: only to tell at a glance */}
                    <span className="metadata-selection-check" aria-hidden>
                      {checked ? '✓' : ''}
                    </span>
                    <span>
                      {field.title}
                      <span className="metadata-selection-id">{field.id}</span>
                    </span>
                    {field.role === 'always' && (
                      <Label size="tiny" className="metadata-selection-always">
                        {intl.formatMessage(messages.always)}
                      </Label>
                    )}
                  </span>
                </Table.Cell>
                <Table.Cell className="metadata-selection-mode">
                  {modes.length ? (
                    <select
                      className={`metadata-selection-choice mode-${status}`}
                      value={checked && fieldMode ? fieldMode : ''}
                      title={reason(field)}
                      aria-label={intl.formatMessage(messages.modeChoice, {
                        field: field.title,
                      })}
                      onChange={(event) =>
                        event.target.value
                          ? onMode(field.id, event.target.value as ChosenMode)
                          : onToggle(field.id, false)
                      }
                    >
                      <option value="">
                        {intl.formatMessage(messages.modeSkipped)}
                      </option>
                      {modes.map((choice) => (
                        <option key={choice} value={choice}>
                          {intl.formatMessage(MODE_MESSAGES[choice])}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`metadata-selection-status mode-${status}`}
                      title={reason(field)}
                    >
                      {mode}
                    </span>
                  )}
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
