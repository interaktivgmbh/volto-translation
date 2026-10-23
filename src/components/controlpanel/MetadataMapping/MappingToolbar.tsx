import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Input } from 'semantic-ui-react';
import messages from './messages';
import { onEnter } from './utils';
import type { InputData } from './utils';

interface MappingToolbarProps {
  sourceLanguageName: string;
  onAdd: (value: string) => void;
}

// A new value of the selected field, in the source language.
const MappingToolbar = (props: MappingToolbarProps) => {
  const { sourceLanguageName, onAdd } = props;
  const intl = useIntl();
  const [newValue, setNewValue] = useState('');

  const add = () => {
    const text = newValue.trim();
    if (text) {
      onAdd(text);
      setNewValue('');
    }
  };

  const label = intl.formatMessage(messages.newValuePlaceholder, {
    language: sourceLanguageName,
  });

  return (
    <div className="metadata-mapping-toolbar">
      <Input
        value={newValue}
        placeholder={label}
        aria-label={label}
        onChange={(_event: React.SyntheticEvent, data: InputData) =>
          setNewValue(String(data.value))
        }
        onKeyDown={onEnter(add)}
      />
      <Button type="button" primary disabled={!newValue.trim()} onClick={add}>
        {intl.formatMessage(messages.addValue)}
      </Button>
    </div>
  );
};

export default MappingToolbar;
