import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { pageNumbers } from '../../helpers/metadataMapping';
import type { PageSlice } from '../../helpers/metadataMapping';
import messages from './messages';

export const PAGE_SIZES = [25, 50, 100];

interface MappingPaginationProps {
  slice: PageSlice;
  // the rows shown with search and filter, and all rows of the field
  total: number;
  all: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (pageSize: number) => void;
}

// Below the table: which rows are shown, the pages and the page size.
const MappingPagination = (props: MappingPaginationProps) => {
  const { slice, total, all, pageSize, onPage, onPageSize } = props;
  const intl = useIntl();
  const range = {
    start: total ? slice.start + 1 : 0,
    end: slice.end,
    total,
    all,
  };

  return (
    <div className="metadata-mapping-pagination">
      <span className="metadata-mapping-range">
        {intl.formatMessage(
          total === all ? messages.pageRange : messages.pageRangeFiltered,
          range,
        )}
      </span>

      {slice.pageCount > 1 && (
        <span className="metadata-mapping-pages">
          <Button
            type="button"
            basic
            disabled={slice.page === 1}
            aria-label={intl.formatMessage(messages.previousPage)}
            onClick={() => onPage(slice.page - 1)}
          >
            ‹
          </Button>
          {pageNumbers(slice.page, slice.pageCount).map((number, position) =>
            number === null ? (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`gap-${position}`} className="gap">
                …
              </span>
            ) : (
              <Button
                key={number}
                type="button"
                basic
                className={number === slice.page ? 'selected' : undefined}
                aria-label={intl.formatMessage(messages.page, {
                  page: number,
                })}
                aria-current={number === slice.page ? 'page' : undefined}
                onClick={() => onPage(number)}
              >
                {number}
              </Button>
            ),
          )}
          <Button
            type="button"
            basic
            disabled={slice.page === slice.pageCount}
            aria-label={intl.formatMessage(messages.nextPage)}
            onClick={() => onPage(slice.page + 1)}
          >
            ›
          </Button>
        </span>
      )}

      <span className="metadata-mapping-page-size">
        {intl.formatMessage(messages.perPage)}
        {PAGE_SIZES.map((size) => (
          <Button
            key={size}
            type="button"
            basic
            className={size === pageSize ? 'selected' : undefined}
            aria-pressed={size === pageSize}
            onClick={() => onPageSize(size)}
          >
            {size}
          </Button>
        ))}
      </span>
    </div>
  );
};

export default MappingPagination;
