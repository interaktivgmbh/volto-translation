import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Input, Label } from 'semantic-ui-react';
import messages, { onEnter } from './messages';
import type { InputData } from './messages';

interface MappingFieldBarProps {
  fieldIds: string[];
  current?: string;
  onSelect: (fieldId: string) => void;
  onAdd: (fieldId: string) => void;
}

// The mapped fields as tabs, and the input for a new field.
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
        {fieldIds.map((fieldId) => (
          <Button
            key={fieldId}
            type="button"
            active={fieldId === current}
            className={
              fieldId === current
                ? 'metadata-mapping-tab selected'
                : 'metadata-mapping-tab'
            }
            onClick={() => onSelect(fieldId)}
          >
            {fieldId}
          </Button>
        ))}
        <span className="metadata-mapping-add-field">
          <Input
            value={newFieldId}
            placeholder={intl.formatMessage(messages.fieldIdPlaceholder)}
            error={!!error}
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
      </div>
      {error && (
        <Label basic color="red" pointing>
          {error}
        </Label>
      )}
    </>
  );
};

export default MappingFieldBar;
