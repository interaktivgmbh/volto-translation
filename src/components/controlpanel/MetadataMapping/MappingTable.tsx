import React from 'react';
import { useIntl } from 'react-intl';
import { Button, Input, Label, Table } from 'semantic-ui-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import clearSVG from '@plone/volto/icons/clear.svg';
import { cellValue, withCell } from '../../../helpers/metadataMapping';
import type { MappingColumn } from '../../../helpers/metadataMapping';
import type { MetadataMappingRow } from '../../../types';
import messages, { ROLE_MESSAGES } from './messages';
import type { InputData } from './utils';

// A shown row and its position among all rows of the field.
export interface MappingEntry {
  row: MetadataMappingRow;
  index: number;
}

interface MappingTableProps {
  entries: MappingEntry[];
  columns: MappingColumn[];
  duplicates: Set<string>;
  caption: string;
  emptyText: string;
  languageName: (code: string) => string;
  onChangeRow: (index: number, row: MetadataMappingRow) => void;
  onRemoveRow: (index: number) => void;
  onRemoveColumn: (code: string) => void;
}

// One row per value, one column per language; the header shows each language's
// role. The source value heads its row, so a screen reader names the row with it.
const MappingTable = (props: MappingTableProps) => {
  const { entries, columns, duplicates, languageName, onChangeRow } = props;
  const intl = useIntl();
  const source = columns.find((column) => column.role === 'source')?.code;
  // the cell a new row's cursor goes to, see the widget
  const focusCode = (
    columns.find((column) => column.role === 'target') ||
    columns.find((column) => column.role !== 'source')
  )?.code;

  return (
    <div className="metadata-mapping-table-wrapper">
      <Table
        compact
        className="metadata-mapping-table"
        // fixed layout gives every language the same width; many scroll sideways
        style={{ minWidth: `${columns.length * 12 + 5}em` }}
      >
        <caption className="metadata-mapping-sr-only">{props.caption}</caption>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.HeaderCell
                key={column.code}
                scope="col"
                className={`role-${column.role}`}
              >
                <div className="metadata-mapping-language">
                  {languageName(column.code)}
                </div>
                <Label
                  size="tiny"
                  className={`metadata-mapping-role role-${column.role}`}
                >
                  {intl.formatMessage(ROLE_MESSAGES[column.role])}
                </Label>
                {column.role === 'orphan' && (
                  <Button
                    type="button"
                    className="metadata-mapping-secondary negative"
                    size="mini"
                    aria-label={intl.formatMessage(messages.removeColumnLabel, {
                      language: languageName(column.code),
                    })}
                    onClick={() => props.onRemoveColumn(column.code)}
                  >
                    {intl.formatMessage(messages.removeColumn)}
                  </Button>
                )}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell scope="col" className="metadata-mapping-action">
              {intl.formatMessage(messages.action)}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {entries.length === 0 && (
            <Table.Row>
              <Table.Cell
                colSpan={columns.length + 1}
                className="metadata-mapping-empty"
              >
                {props.emptyText}
              </Table.Cell>
            </Table.Row>
          )}
          {entries.map(({ row, index }) => {
            const sourceValue = source ? cellValue(row, source).trim() : '';
            const duplicateId = `metadata-mapping-duplicate-${index}`;
            const removeLabel = sourceValue
              ? intl.formatMessage(messages.removeValue, { value: sourceValue })
              : intl.formatMessage(messages.removeRow, { row: index + 1 });

            return (
              // rows have no id of their own; their position is their identity
              // eslint-disable-next-line react/no-array-index-key
              <Table.Row key={index} data-row={index}>
                {columns.map((column) => {
                  const cell = cellValue(row, column.code);
                  const isSource = column.code === source;
                  const duplicate = isSource && duplicates.has(cell.trim());
                  const label =
                    isSource || !sourceValue
                      ? intl.formatMessage(messages.cellLabelRow, {
                          language: languageName(column.code),
                          row: index + 1,
                        })
                      : intl.formatMessage(messages.cellLabel, {
                          language: languageName(column.code),
                          source: sourceValue,
                        });

                  return (
                    <Table.Cell
                      key={column.code}
                      as={isSource ? 'th' : 'td'}
                      scope={isSource ? 'row' : undefined}
                      className={[
                        `role-${column.role}`,
                        column.code === focusCode
                          ? 'metadata-mapping-focus'
                          : '',
                      ].join(' ')}
                    >
                      <Input
                        className={cell ? 'filled' : 'empty'}
                        fluid
                        value={cell}
                        lang={column.code}
                        aria-label={label}
                        error={duplicate}
                        aria-invalid={duplicate || undefined}
                        aria-describedby={duplicate ? duplicateId : undefined}
                        title={
                          duplicate
                            ? intl.formatMessage(messages.duplicate)
                            : undefined
                        }
                        placeholder={
                          isSource
                            ? undefined
                            : intl.formatMessage(messages.sameAsSource)
                        }
                        onChange={(
                          _event: React.SyntheticEvent,
                          data: InputData,
                        ) =>
                          onChangeRow(
                            index,
                            withCell(row, column.code, String(data.value)),
                          )
                        }
                      />
                      {duplicate && (
                        <span
                          id={duplicateId}
                          className="metadata-mapping-sr-only"
                        >
                          {intl.formatMessage(messages.duplicate)}
                        </span>
                      )}
                    </Table.Cell>
                  );
                })}
                <Table.Cell className="metadata-mapping-action">
                  <Button
                    type="button"
                    basic
                    icon
                    className="metadata-mapping-remove-row"
                    aria-label={removeLabel}
                    title={removeLabel}
                    onClick={() => props.onRemoveRow(index)}
                  >
                    <Icon name={clearSVG} size="18px" ariaHidden />
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default MappingTable;
