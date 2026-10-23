import React from 'react';
import { useIntl } from 'react-intl';
import { Checkbox, Input } from 'semantic-ui-react';
import messages from './messages';
import { onEnter } from './utils';
import type { InputData } from './utils';

interface MappingFilterBarProps {
  search: string;
  incompleteOnly: boolean;
  incompleteCount: number;
  onSearch: (search: string) => void;
  onIncompleteOnly: (incompleteOnly: boolean) => void;
}

// Narrows the rows of the selected field: by a search and to the incomplete ones.
const MappingFilterBar = (props: MappingFilterBarProps) => {
  const { search, incompleteOnly, incompleteCount, onSearch } = props;
  const intl = useIntl();

  return (
    <div className="metadata-mapping-filter">
      <Input
        value={search}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        onChange={(_event: React.SyntheticEvent, data: InputData) =>
          onSearch(String(data.value))
        }
        // the search filters as one types; Enter must not submit the form
        onKeyDown={onEnter(() => {})}
      />
      <Checkbox
        checked={incompleteOnly}
        label={intl.formatMessage(messages.incompleteOnly, {
          count: incompleteCount,
        })}
        onChange={() => props.onIncompleteOnly(!incompleteOnly)}
      />
    </div>
  );
};

export default MappingFilterBar;
