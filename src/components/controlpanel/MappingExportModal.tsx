import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Checkbox, Message, Modal } from 'semantic-ui-react';
import { writeWorkbook } from '../../helpers/excelFile';
import {
  exportFileName,
  isSheetName,
  mappingToSheets,
} from '../../helpers/metadataMappingExcel';
import type { MetadataMapping } from '../../types';
import messages from './messages';

interface MappingExportModalProps {
  open: boolean;
  mapping: MetadataMapping;
  currentField?: string;
  siteLanguages: string[];
  sourceLanguage?: string;
  onClose: () => void;
}

type Scope = 'field' | 'all';

const valueCount = (mapping: MetadataMapping) =>
  Object.values(mapping).reduce((sum, rows) => sum + rows.length, 0);

// Exports the selected field, or every field with one sheet each.
const MappingExportModal = (props: MappingExportModalProps) => {
  const { open, mapping, currentField, siteLanguages, sourceLanguage } = props;
  const intl = useIntl();
  const [scope, setScope] = useState<Scope>('field');
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // each opening starts with the selected field, if there is one
  useEffect(() => {
    if (open) {
      setScope(currentField ? 'field' : 'all');
      setWriting(false);
      setError(null);
    }
  }, [open, currentField]);

  const fieldIds = Object.keys(mapping);
  const exported: MetadataMapping =
    scope === 'field' && currentField
      ? { [currentField]: mapping[currentField] || [] }
      : mapping;
  const fileName = exportFileName(scope === 'field' ? currentField : undefined);
  const badField = Object.keys(exported).find(
    (fieldId) => !isSheetName(fieldId),
  );

  const write = async () => {
    setError(null);
    setWriting(true);
    try {
      await writeWorkbook(
        mappingToSheets(exported, siteLanguages, sourceLanguage, intl.locale),
        fileName,
      );
      props.onClose();
    } catch (writeError) {
      setError(
        intl.formatMessage(messages.exportError, {
          error: String((writeError as Error)?.message || writeError),
        }),
      );
    } finally {
      setWriting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={props.onClose}
      className="metadata-mapping-modal"
    >
      <Modal.Header>{intl.formatMessage(messages.exportHeader)}</Modal.Header>
      <Modal.Content>
        <div className="metadata-mapping-export-scope">
          <Checkbox
            radio
            name="metadata-mapping-export-scope"
            checked={scope === 'field'}
            disabled={!currentField}
            label={intl.formatMessage(messages.exportScopeField, {
              field: currentField || '–',
              count: currentField ? (mapping[currentField] || []).length : 0,
            })}
            onChange={() => setScope('field')}
          />
          <Checkbox
            radio
            name="metadata-mapping-export-scope"
            checked={scope === 'all'}
            label={intl.formatMessage(messages.exportScopeAll, {
              fields: fieldIds.length,
              count: valueCount(mapping),
            })}
            onChange={() => setScope('all')}
          />
        </div>

        <p className="metadata-mapping-modal-intro">
          {intl.formatMessage(messages.exportIntro)}
        </p>
        <p className="file-name">
          {intl.formatMessage(messages.exportFile, { fileName })}
        </p>

        {badField && (
          <Message negative>
            {intl.formatMessage(messages.exportSheetName, { field: badField })}
          </Message>
        )}
        {error && <Message negative>{error}</Message>}
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" onClick={props.onClose}>
          {intl.formatMessage(messages.cancel)}
        </Button>
        <Button
          type="button"
          primary
          loading={writing}
          disabled={writing || !!badField || !fieldIds.length}
          onClick={write}
        >
          {intl.formatMessage(messages.exportButton)}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default MappingExportModal;
