import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  Dropdown,
  Label,
  Message,
  Modal,
  Table,
} from 'semantic-ui-react';
import { readWorkbook } from '../../../helpers/excelFile';
import type { FieldChoice } from '../../../helpers/metadataMapping';
import {
  sheetTargets,
  sheetToRows,
} from '../../../helpers/metadataMappingExcel';
import type {
  ImportedSheet,
  SheetWarning,
} from '../../../helpers/metadataMappingExcel';
import type { MetadataMapping } from '../../../types';
import messages from './messages';
import { dialogProps, useDialogFocus } from './utils';
import type { InputData } from './utils';

interface MappingImportModalProps {
  open: boolean;
  mapping: MetadataMapping;
  // the fields a sheet may go into: the mapped ones and those to be added
  fields: FieldChoice[];
  currentField?: string;
  siteLanguages: string[];
  onImport: (fields: MetadataMapping) => void;
  onClose: () => void;
}

const FIELD_ERROR = 'metadata-mapping-import-field-error';
// the choice not to import a sheet; no field id has a space
const NO_FIELD = 'no field';
const SHEETS_LABEL = 'metadata-mapping-import-sheets-label';

const XLSX_TYPES =
  '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const WARNING_MESSAGES: Record<
  SheetWarning['kind'],
  (typeof messages)[keyof typeof messages]
> = {
  unknownColumn: messages.importUnknownColumn,
  duplicateLanguage: messages.importDuplicateLanguage,
  notSiteLanguage: messages.importNotSiteLanguage,
  noLanguageColumns: messages.importNoLanguageColumns,
  headerlessValues: messages.importHeaderlessValues,
};

// Imports the sheets of a file, each into the field chosen for it: the one
// the sheet is named like, as the export names it, unless the editor says
// otherwise. A sheet without a field is left out.
const MappingImportModal = (props: MappingImportModalProps) => {
  const {
    open,
    mapping,
    fields,
    currentField,
    siteLanguages,
    onImport,
    onClose,
  } = props;
  const intl = useIntl();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // only the sheets that hold values
  const [sheets, setSheets] = useState<ImportedSheet[]>([]);
  // the field of each sheet, by the sheet's name
  const [targets, setTargets] = useState<Record<string, string>>({});

  useDialogFocus(open, '.metadata-mapping-import-modal');

  // each opening starts over
  useEffect(() => {
    if (open) {
      setFileName('');
      setReading(false);
      setError(null);
      setSheets([]);
      setTargets({});
    }
  }, [open]);

  const readFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setSheets([]);
    setTargets({});
    setReading(true);
    try {
      const withValues = (await readWorkbook(file))
        .map((sheet) => sheetToRows(sheet, siteLanguages, intl.locale))
        .filter((sheet) => sheet.rows.length);
      if (!withValues.length) {
        setError(intl.formatMessage(messages.importNoSheets));
      }
      setSheets(withValues);
      setTargets(
        sheetTargets(
          withValues.map((sheet) => sheet.name),
          fields,
          currentField,
        ),
      );
    } catch (readError) {
      setError(
        intl.formatMessage(messages.importReadError, {
          error: String((readError as Error)?.message || readError),
        }),
      );
    } finally {
      setReading(false);
    }
  };

  const chosen = sheets.filter((sheet) => targets[sheet.name]);
  // a field takes the values of one sheet only
  const shared = (fieldId: string) =>
    chosen.filter((sheet) => targets[sheet.name] === fieldId).length > 1;
  const canImport =
    chosen.length > 0 && !chosen.some((sheet) => shared(targets[sheet.name]));

  const apply = () => {
    if (canImport) {
      onImport(
        Object.fromEntries(
          chosen.map((sheet) => [targets[sheet.name], sheet.rows]),
        ),
      );
      onClose();
    }
  };

  const options = [
    {
      key: NO_FIELD,
      value: NO_FIELD,
      text: intl.formatMessage(messages.importNoField),
    },
    ...fields.map((field) => ({
      key: field.id,
      value: field.id,
      text:
        field.title === field.id ? field.id : `${field.title} (${field.id})`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="metadata-mapping-modal metadata-mapping-import-modal"
      {...dialogProps('metadata-mapping-import-title')}
    >
      <Modal.Header id="metadata-mapping-import-title">
        {intl.formatMessage(messages.importHeader)}
      </Modal.Header>
      <Modal.Content>
        <p className="metadata-mapping-modal-intro">
          {intl.formatMessage(messages.importIntro)}
        </p>

        <div className="metadata-mapping-import-row">
          <input
            ref={fileInput}
            type="file"
            accept={XLSX_TYPES}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              // the same file again would fire no change
              event.target.value = '';
              if (file) {
                readFile(file);
              }
            }}
          />
          <Button
            type="button"
            className="metadata-mapping-secondary"
            loading={reading}
            disabled={reading}
            onClick={() => fileInput.current?.click()}
          >
            {intl.formatMessage(messages.importChooseFile)}
          </Button>
          {fileName && <span className="file-name">{fileName}</span>}
        </div>

        {error && (
          <Message negative role="alert">
            {error}
          </Message>
        )}

        {/* read out once the file is read */}
        <div className="metadata-mapping-import-summary" aria-live="polite">
          {sheets.length > 0 && (
            <>
              <span id={SHEETS_LABEL} className="metadata-mapping-sr-only">
                {intl.formatMessage(messages.importSheets)}
              </span>
              <Table
                compact
                className="metadata-mapping-import-sheets"
                aria-labelledby={SHEETS_LABEL}
              >
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">
                      {intl.formatMessage(messages.importSheet)}
                    </Table.HeaderCell>
                    <Table.HeaderCell scope="col">
                      {intl.formatMessage(messages.importValues)}
                    </Table.HeaderCell>
                    <Table.HeaderCell scope="col">
                      {intl.formatMessage(messages.importField)}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sheets.map((sheet, index) => {
                    const target = targets[sheet.name] || '';
                    const existing = target ? mapping[target] : undefined;
                    const sameField = !!target && shared(target);
                    const errorId = `${FIELD_ERROR}-${index}`;

                    return (
                      <Table.Row key={sheet.name}>
                        <Table.Cell>
                          {sheet.name}
                          {sheet.warnings.map((warning) => (
                            <div
                              key={JSON.stringify(warning)}
                              className="metadata-mapping-import-warning"
                            >
                              {intl.formatMessage(
                                WARNING_MESSAGES[warning.kind],
                                // header, column, count: whatever the kind has
                                warning,
                              )}
                            </div>
                          ))}
                        </Table.Cell>
                        <Table.Cell>{sheet.rows.length}</Table.Cell>
                        <Table.Cell>
                          <Dropdown
                            search
                            selection
                            value={target || NO_FIELD}
                            options={options}
                            aria-label={intl.formatMessage(
                              messages.importFieldFor,
                              { sheet: sheet.name },
                            )}
                            error={sameField}
                            aria-invalid={sameField || undefined}
                            aria-describedby={sameField ? errorId : undefined}
                            onChange={(
                              _event: React.SyntheticEvent,
                              data: InputData,
                            ) =>
                              setTargets({
                                ...targets,
                                [sheet.name]:
                                  data.value === NO_FIELD
                                    ? ''
                                    : String(data.value || ''),
                              })
                            }
                          />
                          {target && !sameField && (
                            <div className="metadata-mapping-import-effect">
                              {existing
                                ? intl.formatMessage(messages.importReplaces, {
                                    count: existing.length,
                                  })
                                : intl.formatMessage(messages.importNewField)}
                            </div>
                          )}
                          {sameField && (
                            <Label
                              id={errorId}
                              role="alert"
                              basic
                              color="red"
                              pointing
                            >
                              {intl.formatMessage(messages.importSameField)}
                            </Label>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </>
          )}
        </div>

        {canImport && (
          <Message info>{intl.formatMessage(messages.importNote)}</Message>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" onClick={onClose}>
          {intl.formatMessage(messages.cancel)}
        </Button>
        <Button type="button" primary disabled={!canImport} onClick={apply}>
          {intl.formatMessage(messages.importButton)}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default MappingImportModal;
