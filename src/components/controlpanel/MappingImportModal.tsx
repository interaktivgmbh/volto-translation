import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  Dropdown,
  Input,
  Label,
  Message,
  Modal,
} from 'semantic-ui-react';
import { readWorkbook } from '../../helpers/excelFile';
import { sheetToRows } from '../../helpers/metadataMappingExcel';
import type {
  ImportedSheet,
  SheetWarning,
} from '../../helpers/metadataMappingExcel';
import type { MetadataMapping } from '../../types';
import messages from './messages';
import type { InputData } from './messages';

interface MappingImportModalProps {
  open: boolean;
  mapping: MetadataMapping;
  currentField?: string;
  siteLanguages: string[];
  onImport: (fields: MetadataMapping) => void;
  onClose: () => void;
}

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

// Imports one sheet of a file into one field, the selected one by default.
const MappingImportModal = (props: MappingImportModalProps) => {
  const { open, mapping, currentField, siteLanguages, onImport, onClose } =
    props;
  const intl = useIntl();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fieldId, setFieldId] = useState(currentField || '');
  const [fileName, setFileName] = useState('');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // only the sheets that hold values
  const [sheets, setSheets] = useState<ImportedSheet[]>([]);
  const [sheetName, setSheetName] = useState('');

  // each opening starts over, with the field selected now
  useEffect(() => {
    if (open) {
      setFieldId(currentField || '');
      setFileName('');
      setReading(false);
      setError(null);
      setSheets([]);
      setSheetName('');
    }
  }, [open, currentField]);

  const readFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setSheets([]);
    setSheetName('');
    setReading(true);
    try {
      const withValues = (await readWorkbook(file))
        .map((sheet) => sheetToRows(sheet, siteLanguages, intl.locale))
        .filter((sheet) => sheet.rows.length);
      if (!withValues.length) {
        setError(intl.formatMessage(messages.importNoSheets));
      }
      setSheets(withValues);
      setSheetName(withValues[0]?.name || '');
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

  const target = fieldId.trim();
  const fieldIdError = !target
    ? intl.formatMessage(messages.emptyFieldId)
    : /\s/.test(target)
      ? intl.formatMessage(messages.spaceInFieldId)
      : null;
  const existing = target ? mapping[target] : undefined;
  const sheet = sheets.find((candidate) => candidate.name === sheetName);
  const canImport = !fieldIdError && !!sheet;

  const apply = () => {
    if (sheet && !fieldIdError) {
      onImport({ [target]: sheet.rows });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="metadata-mapping-import">
      <Modal.Header>{intl.formatMessage(messages.importHeader)}</Modal.Header>
      <Modal.Content>
        <div className="metadata-mapping-import-row">
          <label htmlFor="metadata-mapping-import-field">
            {intl.formatMessage(messages.importField)}
          </label>
          <Input
            id="metadata-mapping-import-field"
            value={fieldId}
            error={!!fieldIdError}
            onChange={(_event: React.SyntheticEvent, data: InputData) =>
              setFieldId(String(data.value))
            }
          />
          {!fieldIdError && (
            <span className="metadata-mapping-import-effect">
              {existing
                ? intl.formatMessage(messages.importReplaces, {
                    count: existing.length,
                  })
                : intl.formatMessage(messages.importNewField)}
            </span>
          )}
        </div>
        {fieldIdError && (
          <Label basic color="red" pointing>
            {fieldIdError}
          </Label>
        )}

        <p className="metadata-mapping-import-intro">
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

        {error && <Message negative>{error}</Message>}

        {sheets.length > 1 && (
          <div className="metadata-mapping-import-row">
            <label htmlFor="metadata-mapping-import-sheet">
              {intl.formatMessage(messages.importSheet)}
            </label>
            <Dropdown
              id="metadata-mapping-import-sheet"
              selection
              value={sheetName}
              options={sheets.map((candidate) => ({
                key: candidate.name,
                value: candidate.name,
                text: candidate.name,
              }))}
              onChange={(_event: React.SyntheticEvent, data: InputData) =>
                setSheetName(String(data.value))
              }
            />
          </div>
        )}

        {sheet && (
          <div className="metadata-mapping-import-summary">
            <div>
              {intl.formatMessage(messages.importSheetValues, {
                sheet: sheet.name,
                count: sheet.rows.length,
              })}
            </div>
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
          </div>
        )}

        {sheet && !fieldIdError && (
          <Message info>
            {intl.formatMessage(messages.importNote, { field: target })}
          </Message>
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
