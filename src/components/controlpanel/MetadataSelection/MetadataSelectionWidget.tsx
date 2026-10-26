import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Input, Message } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import { normalisedMapping } from '../../../helpers/metadataMapping';
import { fetchTranslationFields } from '../../../helpers/translateApi';
import type { TranslationFieldsType } from '../../../types';
import { onEnter } from '../MetadataMapping/utils';
import type { InputData } from '../MetadataMapping/utils';
import SelectionTable from './SelectionTable';
import messages from './messages';

interface MetadataSelectionWidgetProps {
  id: string;
  title: string;
  description?: string;
  value?: unknown;
  onChange: (id: string, value: unknown) => void;
  formData?: { metadata_mapping_table?: unknown };
  error?: string[];
  fieldSet?: string;
  required?: boolean;
}

// The fields of each content type and how the translation treats them, as the
// backend suggests it. Shows them only: choosing the fields comes next.
const MetadataSelectionWidget = (props: MetadataSelectionWidgetProps) => {
  const { title, description, formData } = props;
  const intl = useIntl();
  const [types, setTypes] = useState<TranslationFieldsType[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    let current = true;
    fetchTranslationFields()
      .then((loaded) => current && setTypes(loaded))
      .catch(
        (error: Error) =>
          current &&
          setLoadError(String(error?.message || error?.toString?.() || error)),
      );
    return () => {
      current = false;
    };
  }, []);

  // the mapping as the form holds it, saved or not
  const mappedCounts = Object.fromEntries(
    Object.entries(normalisedMapping(formData?.metadata_mapping_table)).map(
      ([fieldId, rows]) => [fieldId, Array.isArray(rows) ? rows.length : 0],
    ),
  );

  const shown = types?.find((type) => type.id === selected) || (types || [])[0];
  const query = search.trim().toLowerCase();
  const fields = (shown?.fields || []).filter(
    (field) =>
      !query ||
      field.title.toLowerCase().includes(query) ||
      field.id.toLowerCase().includes(query),
  );
  const possible = (shown?.fields || []).filter(
    (field) => field.role !== 'impossible',
  );

  return (
    <FormFieldWrapper
      {...props}
      // shown on top, as in the layout, rather than below the widget
      description={undefined}
      columns={1}
      // the mapping widget's styles fit this one too
      className="metadata-mapping-widget metadata-selection-widget"
    >
      <div className="metadata-mapping-title">{title}</div>
      {description && (
        <div className="metadata-mapping-description">{description}</div>
      )}

      {!types && !loadError && (
        <Message info>{intl.formatMessage(messages.loading)}</Message>
      )}
      {loadError && (
        <Message negative role="alert">
          {intl.formatMessage(messages.loadError, { error: loadError })}
        </Message>
      )}
      {types && types.length === 0 && (
        <Message info>{intl.formatMessage(messages.noTypes)}</Message>
      )}

      {shown && (
        <>
          <div className="metadata-mapping-fields">
            {/* toggle buttons: aria-pressed tells which type is shown */}
            <div
              role="group"
              aria-label={intl.formatMessage(messages.typesLabel)}
              className="metadata-mapping-tabs"
            >
              {(types || []).map((type) => (
                // a plain button: semantic-ui's Button overwrites aria-pressed
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={type.id === shown.id}
                  className={
                    type.id === shown.id
                      ? 'ui button metadata-mapping-tab selected'
                      : 'ui button metadata-mapping-tab'
                  }
                  onClick={() => setSelected(type.id)}
                >
                  {type.title}
                </button>
              ))}
            </div>
          </div>

          <div className="metadata-mapping-filter">
            <Input
              value={search}
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
              aria-label={intl.formatMessage(messages.searchLabel)}
              onChange={(_event: React.SyntheticEvent, data: InputData) =>
                setSearch(String(data.value))
              }
              onKeyDown={onEnter(() => {})}
            />
            <span aria-live="polite" aria-atomic>
              {intl.formatMessage(messages.count, {
                selected: possible.length,
                total: possible.length,
              })}
            </span>
          </div>

          <p className="metadata-selection-note">
            {intl.formatMessage(messages.readOnly)}
          </p>

          <SelectionTable
            fields={fields}
            mappedCounts={mappedCounts}
            caption={intl.formatMessage(messages.tableCaption, {
              type: shown.title,
            })}
            emptyText={intl.formatMessage(messages.noMatches)}
          />
        </>
      )}
    </FormFieldWrapper>
  );
};

export default MetadataSelectionWidget;
