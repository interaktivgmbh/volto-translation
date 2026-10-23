import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Input } from 'semantic-ui-react';
import messages from './messages';
import { onEnter } from './utils';
import type { InputData } from './utils';

interface MappingToolbarProps {
  sourceLanguageName: string;
  onAdd: (value: string) => void;
  onRemoveField: () => void;
}

// Actions on the selected field: a new value in the source language, removing the field.
const MappingToolbar = (props: MappingToolbarProps) => {
  const { sourceLanguageName, onAdd, onRemoveField } = props;
  const intl = useIntl();
  const [newValue, setNewValue] = useState('');

  const add = () => {
    const text = newValue.trim();
    if (text) {
      onAdd(text);
      setNewValue('');
    }
  };

  return (
    <div className="metadata-mapping-toolbar">
      <Input
        value={newValue}
        placeholder={intl.formatMessage(messages.newValuePlaceholder, {
          language: sourceLanguageName,
        })}
        onChange={(_event: React.SyntheticEvent, data: InputData) =>
          setNewValue(String(data.value))
        }
        onKeyDown={onEnter(add)}
      />
      <Button type="button" primary disabled={!newValue.trim()} onClick={add}>
        {intl.formatMessage(messages.addValue)}
      </Button>
      <Button
        type="button"
        className="metadata-mapping-secondary negative metadata-mapping-remove-field"
        onClick={onRemoveField}
      >
        {intl.formatMessage(messages.removeField)}
      </Button>
    </div>
  );
};

export default MappingToolbar;
