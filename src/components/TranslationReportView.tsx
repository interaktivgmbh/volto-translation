import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Segment } from 'semantic-ui-react';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import type { TranslationReport } from '../types';

const messages = defineMessages({
  storedAsTranslation: {
    id: 'volto-translation-report-stored-translation',
    defaultMessage: 'The {language} translation was created.',
  },
  storedAsUpdated: {
    id: 'volto-translation-report-stored-updated',
    defaultMessage: 'The {language} translation was replaced.',
  },
  storedAsWorkingCopy: {
    id: 'volto-translation-report-stored-working-copy',
    defaultMessage:
      'The translation was put in a working copy. The published page stays unchanged until you apply it.',
  },
  storedInPlace: {
    id: 'volto-translation-report-stored-in-place',
    defaultMessage: 'The page itself now holds the {language} translation.',
  },
  fields: {
    id: 'volto-translation-report-fields',
    defaultMessage: 'Translated fields: {fields}',
  },
  copiedFields: {
    id: 'volto-translation-report-copied-fields',
    defaultMessage: 'Carried over unchanged: {fields}',
  },
  linksHeadline: {
    id: 'volto-translation-report-links-headline',
    defaultMessage: 'Link text and target URL',
  },
  linksSection: {
    id: 'volto-translation-report-links-section',
    defaultMessage: 'Links in the text',
  },
  linksIntro: {
    id: 'volto-translation-report-links-intro',
    defaultMessage:
      'Links to other pages are adjusted automatically where the linked page already has a translation in the target language; otherwise the previous link to the page in the source language stays. {rewritten} of {total} links now point to {language}.',
  },
  before: {
    id: 'volto-translation-report-before',
    defaultMessage: 'Before',
  },
  after: {
    id: 'volto-translation-report-after',
    defaultMessage: 'After',
  },
  noTranslation: {
    id: 'volto-translation-report-no-translation',
    defaultMessage:
      'unchanged – no translation available, the previous link stays',
  },
  showAllLinks: {
    id: 'volto-translation-report-show-all-links',
    defaultMessage: 'Show all {count} links',
  },
  metadataSection: {
    id: 'volto-translation-report-metadata-section',
    defaultMessage: 'Metadata',
  },
  metadataSummary: {
    id: 'volto-translation-report-metadata-summary',
    defaultMessage:
      '{mapped} replaced by the mapping, {kept} carried over unchanged.',
  },
  metadataIntro: {
    id: 'volto-translation-report-metadata-intro',
    defaultMessage:
      'These fields are not machine translated: their values come from the metadata mapping in the translation settings.',
  },
  noMappingEntry: {
    id: 'volto-translation-report-no-mapping-entry',
    defaultMessage: 'no mapping entry',
  },
});

const LINKS_SHOWN = 5;

interface TranslationReportViewProps {
  report: TranslationReport;
  language: string;
}

const TranslationReportView = ({
  report,
  language,
}: TranslationReportViewProps) => {
  const intl = useIntl();
  const [allLinks, setAllLinks] = useState(false);

  const links = report.links || [];
  const shown = allLinks ? links : links.slice(0, LINKS_SHOWN);
  const rewritten = links.filter((link) => link.after).length;
  const copied = report.copied || [];

  const metadata = report.metadata || [];
  const mapped = metadata.filter((entry) => entry.after).length;
  const metadataFields = Array.from(
    new Set(metadata.map((entry) => entry.field || '')),
  );

  const outcome = (() => {
    if (report.stored_as === 'working_copy') {
      return intl.formatMessage(messages.storedAsWorkingCopy);
    }
    if (report.stored_as === 'in_place') {
      return intl.formatMessage(messages.storedInPlace, { language });
    }

    return intl.formatMessage(
      report.created ? messages.storedAsTranslation : messages.storedAsUpdated,
      { language },
    );
  })();

  return (
    <>
      <Segment className="translation-status">{outcome}</Segment>

      <Segment>
        <p>
          {intl.formatMessage(messages.fields, {
            fields: (report.fields || []).join(', '),
          })}
        </p>
        {copied.length > 0 && (
          <p className="translation-copied-fields">
            {intl.formatMessage(messages.copiedFields, {
              fields: copied.join(', '),
            })}
          </p>
        )}
      </Segment>

      {links.length > 0 && (
        <Segment className="translation-section-title">
          {intl.formatMessage(messages.linksSection)}
        </Segment>
      )}
      {links.length > 0 && (
        <Segment secondary className="translation-situation">
          {intl.formatMessage(messages.linksIntro, {
            rewritten,
            total: links.length,
            language,
          })}
        </Segment>
      )}
      {links.length > 0 && (
        <Segment className="translation-links">
          <div className="translation-links-table">
            <h4>{intl.formatMessage(messages.linksHeadline)}</h4>
            {shown.map((link, index) => (
              <div className="translation-link" key={`${link.before}-${index}`}>
                <strong>{link.text}</strong>
                <dl>
                  <dt>{intl.formatMessage(messages.before)}</dt>
                  <dd>{link.before}</dd>
                  <dt className={link.after ? 'rewritten' : undefined}>
                    {intl.formatMessage(messages.after)}
                  </dt>
                  <dd>
                    {link.after ? (
                      <UniversalLink href={flattenToAppURL(link.after)}>
                        {link.after}
                      </UniversalLink>
                    ) : (
                      <span className="translation-link-untouched">
                        {intl.formatMessage(messages.noTranslation)}
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            ))}
          </div>
          {!allLinks && links.length > LINKS_SHOWN && (
            <button
              type="button"
              className="translation-links-more"
              onClick={() => setAllLinks(true)}
            >
              {intl.formatMessage(messages.showAllLinks, {
                count: links.length,
              })}
            </button>
          )}
        </Segment>
      )}

      {metadata.length > 0 && (
        <Segment className="translation-section-title">
          {intl.formatMessage(messages.metadataSection)}
        </Segment>
      )}
      {metadata.length > 0 && (
        <Segment secondary className="translation-situation">
          {intl.formatMessage(messages.metadataIntro)}{' '}
          {intl.formatMessage(messages.metadataSummary, {
            mapped,
            kept: metadata.length - mapped,
          })}
        </Segment>
      )}
      {metadata.length > 0 && (
        <Segment className="translation-metadata">
          {metadataFields.map((field) => (
            <div className="translation-metadata-field" key={field}>
              <h4>{field}</h4>
              <ul className="translation-metadata-values">
                {metadata
                  .filter((entry) => (entry.field || '') === field)
                  .map((entry, index) => (
                    <li key={`${entry.before}-${index}`}>
                      {entry.after ? (
                        <>
                          <span>{entry.before}</span> →{' '}
                          <strong>{entry.after}</strong>
                        </>
                      ) : (
                        <>
                          <span>{entry.before}</span>{' '}
                          <span className="translation-metadata-unmapped">
                            ({intl.formatMessage(messages.noMappingEntry)})
                          </span>
                        </>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </Segment>
      )}
    </>
  );
};

export default TranslationReportView;
