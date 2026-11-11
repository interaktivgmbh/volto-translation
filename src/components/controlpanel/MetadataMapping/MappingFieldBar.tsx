import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Dropdown, Label } from 'semantic-ui-react';
import type { FieldChoice } from '../../../helpers/metadataMapping';
import messages from './messages';

const FIELD_ERROR = 'metadata-mapping-field-error';

interface MappingFieldBarProps {
  fieldIds: string[];
  current?: string;
  // the fields that may be added; null while they load
  choices: FieldChoice[] | null;
  // mapped fields no content type has
  unknownIds: string[];
  // the fields' titles, by id
  titles: Record<string, string>;
  loadError?: string | null;
  onSelect: (fieldId: string) => void;
  onAdd: (fieldId: string) => void;
  onRemove: () => void;
}

// The mapped fields as tabs, the choice of a new field and removing the selected one.
const MappingFieldBar = (props: MappingFieldBarProps) => {
  const {
    fieldIds,
    current,
    choices,
    unknownIds,
    titles,
    loadError,
    onSelect,
    onAdd,
  } = props;
  const intl = useIntl();
  const [chosen, setChosen] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (!chosen) {
      setError(intl.formatMessage(messages.noFieldChosen));
    } else {
      onAdd(chosen);
      setChosen('');
      setError(null);
    }
  };

  const unknownHint = intl.formatMessage(messages.unknownField);
  const shownError =
    error ||
    (loadError
      ? intl.formatMessage(messages.fieldsNotLoaded, { message: loadError })
      : null);

  return (
    <>
      <div className="metadata-mapping-fields">
        {/* toggle buttons: aria-pressed tells which field is shown */}
        <div
          role="group"
          aria-label={intl.formatMessage(messages.fieldsLabel)}
          className="metadata-mapping-tabs"
        >
          {fieldIds.map((fieldId) => {
            const unknown = unknownIds.includes(fieldId);

            return (
              // a plain button: semantic-ui's Button overwrites aria-pressed
              <button
                key={fieldId}
                type="button"
                aria-pressed={fieldId === current}
                title={unknown ? unknownHint : undefined}
                className={
                  'ui button metadata-mapping-tab' +
                  (fieldId === current ? ' selected' : '') +
                  (unknown ? ' unknown' : '')
                }
                onClick={() => onSelect(fieldId)}
              >
                {titles[fieldId] ? `${titles[fieldId]} (${fieldId})` : fieldId}
                {unknown && (
                  <span className="metadata-mapping-tab-hint">
                    {unknownHint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <span className="metadata-mapping-add-field">
          <Dropdown
            search
            selection
            clearable
            value={chosen}
            loading={choices === null && !loadError}
            disabled={!!loadError}
            options={(choices || []).map((choice) => ({
              key: choice.id,
              value: choice.id,
              text: `${choice.title} (${choice.id})`,
            }))}
            placeholder={intl.formatMessage(messages.fieldChoicePlaceholder)}
            noResultsMessage={intl.formatMessage(messages.noFieldLeft)}
            aria-label={intl.formatMessage(messages.fieldChoiceLabel)}
            error={!!shownError}
            aria-invalid={!!shownError || undefined}
            aria-describedby={shownError ? FIELD_ERROR : undefined}
            onChange={(
              _event: React.SyntheticEvent,
              data: { value?: unknown },
            ) => {
              setChosen(String(data.value || ''));
              setError(null);
            }}
          />
          <Button
            type="button"
            className="metadata-mapping-secondary"
            onClick={add}
          >
            {intl.formatMessage(messages.addField)}
          </Button>
        </span>
        {current && (
          <Button
            type="button"
            className="metadata-mapping-secondary negative"
            aria-label={intl.formatMessage(messages.removeFieldLabel, {
              field: current,
            })}
            onClick={props.onRemove}
          >
            {intl.formatMessage(messages.removeField)}
          </Button>
        )}
      </div>
      {shownError && (
        <Label id={FIELD_ERROR} role="alert" basic color="red" pointing>
          {shownError}
        </Label>
      )}
    </>
  );
};

export default MappingFieldBar;
