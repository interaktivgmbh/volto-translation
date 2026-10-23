import React from 'react';
import { useIntl } from 'react-intl';
import { Checkbox, Input } from 'semantic-ui-react';
import messages from './messages';
import { onEnter } from './utils';
import type { InputData } from './utils';

interface MappingFilterBarProps {
  // without a selected field there is nothing to filter, only the actions
  filterable: boolean;
  actions: React.ReactNode;
  search: string;
  incompleteOnly: boolean;
  incompleteCount: number;
  onSearch: (search: string) => void;
  onIncompleteOnly: (incompleteOnly: boolean) => void;
}

// Narrows the rows of the selected field, by a search and to the incomplete
// ones; export and import sit at its end, as in the layout.
const MappingFilterBar = (props: MappingFilterBarProps) => {
  const { filterable, search, incompleteOnly, incompleteCount, onSearch } =
    props;
  const intl = useIntl();

  return (
    <div className="metadata-mapping-filter">
      {filterable && (
        <>
          <Input
            value={search}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            aria-label={intl.formatMessage(messages.searchLabel)}
            onChange={(_event: React.SyntheticEvent, data: InputData) =>
              onSearch(String(data.value))
            }
            // the search filters as one types; Enter must not submit the form
            onKeyDown={onEnter(() => {})}
          />
          <Checkbox
            id="metadata-mapping-incomplete-only"
            checked={incompleteOnly}
            label={intl.formatMessage(messages.incompleteOnly, {
              count: incompleteCount,
            })}
            onChange={() => props.onIncompleteOnly(!incompleteOnly)}
          />
        </>
      )}
      <span className="metadata-mapping-actions">{props.actions}</span>
    </div>
  );
};

export default MappingFilterBar;
