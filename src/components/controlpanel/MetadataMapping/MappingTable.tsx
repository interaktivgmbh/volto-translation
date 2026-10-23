import React, { useEffect, useRef } from 'react';
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
  emptyText: string;
  // the row whose first target cell takes the cursor, e.g. a new one
  focus?: { index: number } | null;
  languageName: (code: string) => string;
  onChangeRow: (index: number, row: MetadataMappingRow) => void;
  onRemoveRow: (index: number) => void;
  onRemoveColumn: (code: string) => void;
}

// One row per value, one column per language; the header shows each language's role.
const MappingTable = (props: MappingTableProps) => {
  const {
    entries,
    columns,
    duplicates,
    focus,
    languageName,
    onChangeRow,
    onRemoveColumn,
  } = props;
  const intl = useIntl();
  const focusInput = useRef<{ focus: () => void } | null>(null);
  const focusCode = (
    columns.find((column) => column.role === 'target') ||
    columns.find((column) => column.role !== 'source')
  )?.code;

  // a new request each time, so the same row may take the cursor again
  useEffect(() => {
    if (focus) {
      focusInput.current?.focus();
    }
  }, [focus]);

  return (
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
                  {languageName(column.code)}
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
                    onClick={() => onRemoveColumn(column.code)}
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
          {entries.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={columns.length + 1}>
                {props.emptyText}
              </Table.Cell>
            </Table.Row>
          )}
          {entries.map(({ row, index }) => (
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
                      ref={
                        index === focus?.index && column.code === focusCode
                          ? focusInput
                          : undefined
                      }
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
                        data: InputData,
                      ) =>
                        onChangeRow(
                          index,
                          withCell(row, column.code, String(data.value)),
                        )
                      }
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
                  onClick={() => props.onRemoveRow(index)}
                >
                  <Icon name={clearSVG} size="18px" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default MappingTable;
