import React from 'react';
import { useIntl } from 'react-intl';
import { Button, Input, Label, Table } from 'semantic-ui-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import clearSVG from '@plone/volto/icons/clear.svg';
import { cellValue, withCell } from '../../helpers/metadataMapping';
import type { MappingColumn } from '../../helpers/metadataMapping';
import type { MetadataMappingRow } from '../../types';
import messages, { ROLE_MESSAGES } from './messages';
import type { InputData } from './messages';

interface MappingTableProps {
  rows: MetadataMappingRow[];
  columns: MappingColumn[];
  duplicates: Set<string>;
  languageName: (code: string) => string;
  onChangeRows: (rows: MetadataMappingRow[]) => void;
  onRemoveColumn: (code: string) => void;
}

// One row per value, one column per language; the header shows each language's role.
const MappingTable = (props: MappingTableProps) => {
  const {
    rows,
    columns,
    duplicates,
    languageName,
    onChangeRows,
    onRemoveColumn,
  } = props;
  const intl = useIntl();

  const changeCell = (index: number, code: string, value: string) => {
    const next = [...rows];
    next[index] = withCell(rows[index], code, value);
    onChangeRows(next);
  };

  const removeRow = (index: number) =>
    onChangeRows(rows.filter((_row, position) => position !== index));

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
                        data: InputData,
                      ) => changeCell(index, column.code, String(data.value))}
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
                  onClick={() => removeRow(index)}
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
