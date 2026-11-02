import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Input, Label } from 'semantic-ui-react';
import messages from './messages';
import { onEnter } from './utils';
import type { InputData } from './utils';

const FIELD_ID_ERROR = 'metadata-mapping-field-id-error';

interface MappingFieldBarProps {
  fieldIds: string[];
  current?: string;
  onSelect: (fieldId: string) => void;
  onAdd: (fieldId: string) => void;
  onRemove: () => void;
}

// The mapped fields as tabs, the input for a new field and removing the selected one.
const MappingFieldBar = (props: MappingFieldBarProps) => {
  const { fieldIds, current, onSelect, onAdd } = props;
  const intl = useIntl();
  const [newFieldId, setNewFieldId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const fieldId = newFieldId.trim();
    if (!fieldId) {
      setError(intl.formatMessage(messages.emptyFieldId));
    } else if (/\s/.test(fieldId)) {
      setError(intl.formatMessage(messages.spaceInFieldId));
    } else if (fieldIds.includes(fieldId)) {
      setError(intl.formatMessage(messages.existingFieldId));
    } else {
      onAdd(fieldId);
      setNewFieldId('');
      setError(null);
    }
  };

  return (
    <>
      <div className="metadata-mapping-fields">
        {/* toggle buttons: aria-pressed tells which field is shown */}
        <div
          role="group"
          aria-label={intl.formatMessage(messages.fieldsLabel)}
          className="metadata-mapping-tabs"
        >
          {fieldIds.map((fieldId) => (
            // a plain button: semantic-ui's Button overwrites aria-pressed
            <button
              key={fieldId}
              type="button"
              aria-pressed={fieldId === current}
              className={
                fieldId === current
                  ? 'ui button metadata-mapping-tab selected'
                  : 'ui button metadata-mapping-tab'
              }
              onClick={() => onSelect(fieldId)}
            >
              {fieldId}
            </button>
          ))}
        </div>
        <span className="metadata-mapping-add-field">
          <Input
            value={newFieldId}
            placeholder={intl.formatMessage(messages.fieldIdPlaceholder)}
            aria-label={intl.formatMessage(messages.fieldIdLabel)}
            error={!!error}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? FIELD_ID_ERROR : undefined}
            onChange={(_event: React.SyntheticEvent, data: InputData) => {
              setNewFieldId(String(data.value));
              setError(null);
            }}
            onKeyDown={onEnter(add)}
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
      {error && (
        <Label id={FIELD_ID_ERROR} role="alert" basic color="red" pointing>
          {error}
        </Label>
      )}
    </>
  );
};

export default MappingFieldBar;
