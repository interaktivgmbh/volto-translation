import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Confirm, Message } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import { languageName } from '../../helpers/languages';
import {
  duplicateValues,
  languageCodes,
  mappingColumns,
  normalisedMapping,
  withoutLanguage,
} from '../../helpers/metadataMapping';
import type {
  MetadataMapping,
  MetadataMappingRow,
  TranslationState,
} from '../../types';
import MappingExportModal from './MappingExportModal';
import MappingFieldBar from './MappingFieldBar';
import MappingImportModal from './MappingImportModal';
import MappingTable from './MappingTable';
import MappingToolbar from './MappingToolbar';
import messages from './messages';

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

// Holds the mapping and the selected field; the parts below only show and report changes.
const MetadataMappingWidget = (props: MetadataMappingWidgetProps) => {
  const { id, title, value, onChange, formData } = props;
  const intl = useIntl();
  const site = useSelector((state: TranslationState) => state.site?.data) || {};

  const mapping = normalisedMapping(value);
  const fieldIds = Object.keys(mapping);
  const [selected, setSelected] = useState<string | undefined>(fieldIds[0]);
  const [pending, setPending] = useState<Pending>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const addField = (fieldId: string) => {
    change({ ...mapping, [fieldId]: [] });
    setSelected(fieldId);
  };

  const addValue = (text: string) => {
    if (sourceLanguage) {
      changeRows([...rows, { [sourceLanguage]: text }]);
    }
  };

  // fields of the file replace theirs completely; the others stay
  const importFields = (fields: MetadataMapping) => {
    change({ ...mapping, ...fields });
    setSelected(Object.keys(fields)[0]);
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
      <div className="metadata-mapping-header">
        <div className="metadata-mapping-title">{title}</div>
        <Button
          type="button"
          basic
          className="metadata-mapping-link"
          disabled={!fieldIds.length}
          onClick={() => setExporting(true)}
        >
          {intl.formatMessage(messages.exportExcel)}
        </Button>
        <Button
          type="button"
          basic
          className="metadata-mapping-link"
          onClick={() => setImporting(true)}
        >
          {intl.formatMessage(messages.importExcel)}
        </Button>
      </div>

      <MappingFieldBar
        fieldIds={fieldIds}
        current={current}
        onSelect={setSelected}
        onAdd={addField}
      />

      {!current && (
        <Message info>{intl.formatMessage(messages.noFields)}</Message>
      )}
      {current && !siteLanguages.length && (
        <Message warning>{intl.formatMessage(messages.noLanguages)}</Message>
      )}

      {current && siteLanguages.length > 0 && (
        <>
          <MappingToolbar
            sourceLanguageName={name(sourceLanguage || '')}
            onAdd={addValue}
            onRemoveField={() => setPending({ kind: 'field', field: current })}
          />
          <MappingTable
            rows={rows}
            columns={columns}
            duplicates={duplicates}
            languageName={name}
            onChangeRows={changeRows}
            onRemoveColumn={(code) => setPending({ kind: 'column', code })}
          />
        </>
      )}

      <MappingImportModal
        open={importing}
        mapping={mapping}
        currentField={current}
        siteLanguages={siteLanguages}
        onImport={importFields}
        onClose={() => setImporting(false)}
      />

      <MappingExportModal
        open={exporting}
        mapping={mapping}
        currentField={current}
        siteLanguages={siteLanguages}
        sourceLanguage={sourceLanguage}
        onClose={() => setExporting(false)}
      />

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
