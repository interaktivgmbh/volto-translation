import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Confirm, Message } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import { languageName } from '../../../helpers/languages';
import {
  duplicateValues,
  isIncomplete,
  languageCodes,
  mappingColumns,
  matchesSearch,
  normalisedMapping,
  pageSlice,
  withoutLanguage,
} from '../../../helpers/metadataMapping';
import type {
  MetadataMapping,
  MetadataMappingRow,
  TranslationState,
} from '../../../types';
import MappingExportModal from './MappingExportModal';
import MappingFieldBar from './MappingFieldBar';
import MappingFilterBar from './MappingFilterBar';
import MappingImportModal from './MappingImportModal';
import MappingPagination, { PAGE_SIZES } from './MappingPagination';
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

// the page size is a convenience of this browser only
const PAGE_SIZE_KEY = 'volto-translation-mapping-page-size';
const DEFAULT_PAGE_SIZE = 50;

function storedPageSize(): number {
  try {
    const stored = Number(window.localStorage.getItem(PAGE_SIZE_KEY));
    return PAGE_SIZES.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
  } catch (error) {
    return DEFAULT_PAGE_SIZE;
  }
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
  const [search, setSearch] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  // rows edited under a search or filter stay shown until it changes
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [focus, setFocus] = useState<{ index: number } | null>(null);

  // the browser's storage is unknown on the server: read it once mounted
  useEffect(() => setPageSize(storedPageSize()), []);

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

  const targetCodes = columns
    .filter((column) => column.role === 'target')
    .map((column) => column.code);
  const filtering = !!search.trim() || incompleteOnly;
  const entries = rows
    .map((row, index) => ({ row, index }))
    .filter(
      ({ row, index }) =>
        !filtering ||
        kept.has(index) ||
        (matchesSearch(row, search) &&
          (!incompleteOnly || isIncomplete(row, targetCodes))),
    );
  const incompleteCount = rows.filter((row) =>
    isIncomplete(row, targetCodes),
  ).length;
  const slice = pageSlice(entries.length, page, pageSize);

  // a new field, search or filter starts on the first page
  const resetView = (nextSearch = '', nextIncompleteOnly = false) => {
    setSearch(nextSearch);
    setIncompleteOnly(nextIncompleteOnly);
    setKept(new Set());
    setPage(1);
    setFocus(null);
  };

  const selectField = (fieldId: string) => {
    setSelected(fieldId);
    resetView(search, incompleteOnly);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
    try {
      window.localStorage.setItem(PAGE_SIZE_KEY, String(size));
    } catch (error) {
      // without storage the size holds until the page is left
    }
  };

  const change = (next: MetadataMapping) => onChange(id, next);
  const changeRows = (nextRows: MetadataMappingRow[]) => {
    if (current) {
      change({ ...mapping, [current]: nextRows });
    }
  };

  const changeRow = (index: number, row: MetadataMappingRow) => {
    const next = [...rows];
    next[index] = row;
    changeRows(next);
    if (filtering) {
      setKept(new Set(kept).add(index));
    }
  };

  const removeRow = (index: number) => {
    changeRows(rows.filter((_row, position) => position !== index));
    // the rows after it move up by one
    setKept(
      new Set(
        Array.from(kept)
          .filter((position) => position !== index)
          .map((position) => (position > index ? position - 1 : position)),
      ),
    );
    setFocus(null);
  };

  const addField = (fieldId: string) => {
    change({ ...mapping, [fieldId]: [] });
    setSelected(fieldId);
    resetView();
  };

  // a new value is shown at the end, with the cursor in its first target cell
  const addValue = (text: string) => {
    if (sourceLanguage) {
      changeRows([...rows, { [sourceLanguage]: text }]);
      resetView();
      setPage(Math.ceil((rows.length + 1) / pageSize));
      setFocus({ index: rows.length });
    }
  };

  // fields of the file replace theirs completely; the others stay
  const importFields = (fields: MetadataMapping) => {
    change({ ...mapping, ...fields });
    setSelected(Object.keys(fields)[0]);
    resetView();
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
        onSelect={selectField}
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
          <MappingFilterBar
            search={search}
            incompleteOnly={incompleteOnly}
            incompleteCount={incompleteCount}
            onSearch={(nextSearch) => resetView(nextSearch, incompleteOnly)}
            onIncompleteOnly={(nextIncompleteOnly) =>
              resetView(search, nextIncompleteOnly)
            }
          />
          <MappingToolbar
            sourceLanguageName={name(sourceLanguage || '')}
            onAdd={addValue}
            onRemoveField={() => setPending({ kind: 'field', field: current })}
          />
          <MappingTable
            entries={entries.slice(slice.start, slice.end)}
            columns={columns}
            duplicates={duplicates}
            emptyText={intl.formatMessage(
              rows.length ? messages.noMatches : messages.noValues,
            )}
            focus={focus}
            languageName={name}
            onChangeRow={changeRow}
            onRemoveRow={removeRow}
            onRemoveColumn={(code) => setPending({ kind: 'column', code })}
          />
          {rows.length > 0 && (
            <MappingPagination
              slice={slice}
              total={entries.length}
              all={rows.length}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={changePageSize}
            />
          )}
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
