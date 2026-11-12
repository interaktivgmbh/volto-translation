import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { Container, Segment, Message, Loader } from 'semantic-ui-react';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import backSVG from '@plone/volto/icons/back.svg';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { fetchTranslationLinks } from '../helpers/translateApi';
import type {
  ApiError,
  TranslationLink,
  TranslationLinkStatus,
  TranslationLinks,
  TranslationState,
} from '../types';

const messages = defineMessages({
  title: {
    id: 'volto-translation-links-title',
    defaultMessage: 'Link status',
  },
  headline: {
    id: 'volto-translation-links-headline',
    defaultMessage: 'Translation status of the links of {title}',
  },
  noLinks: {
    id: 'volto-translation-links-none',
    defaultMessage: 'This content holds no links.',
  },
  failed: {
    id: 'volto-translation-links-failed',
    defaultMessage: 'The links could not be loaded: {message}',
  },
  translatable: {
    id: 'volto-translation-links-translatable',
    defaultMessage: 'Translation available ({count})',
  },
  translatableHint: {
    id: 'volto-translation-links-translatable-hint',
    defaultMessage:
      'These links point at content of another language that has a translation by now.',
  },
  broken: {
    id: 'volto-translation-links-broken',
    defaultMessage: 'Target not found ({count})',
  },
  brokenHint: {
    id: 'volto-translation-links-broken-hint',
    defaultMessage: 'The target of these links was not found.',
  },
  untranslated: {
    id: 'volto-translation-links-untranslated',
    defaultMessage: 'Without translation ({count})',
  },
  untranslatedHint: {
    id: 'volto-translation-links-untranslated-hint',
    defaultMessage:
      'These links point at content of another language that has no translation.',
  },
  external: {
    id: 'volto-translation-links-external',
    defaultMessage: 'External links ({count})',
  },
  externalHint: {
    id: 'volto-translation-links-external-hint',
    defaultMessage:
      'These links lead out of the site and are not checked any further.',
  },
  translated: {
    id: 'volto-translation-links-translated',
    defaultMessage: 'In the language of this content ({count})',
  },
  translatedHint: {
    id: 'volto-translation-links-translated-hint',
    defaultMessage:
      'These links point at content in the language of this content.',
  },
  independent: {
    id: 'volto-translation-links-independent',
    defaultMessage: 'Without a language of its own ({count})',
  },
  independentHint: {
    id: 'volto-translation-links-independent-hint',
    defaultMessage: 'The target of these links has no language of its own.',
  },
  assets: {
    id: 'volto-translation-links-assets',
    defaultMessage: 'Images and files ({count})',
  },
  assetsHint: {
    id: 'volto-translation-links-assets-hint',
    defaultMessage:
      'Images and files are not translated. Their references stay as they are, unless the image or file has a translation of its own.',
  },
  kindImage: {
    id: 'volto-translation-links-kind-image',
    defaultMessage: 'Image',
  },
  kindFile: {
    id: 'volto-translation-links-kind-file',
    defaultMessage: 'File',
  },
  translation: {
    id: 'volto-translation-links-translation',
    defaultMessage: 'Translation',
  },
  showAll: {
    id: 'volto-translation-links-show-all',
    defaultMessage: 'Show all {count}',
  },
  back: { id: 'volto-translation-links-back', defaultMessage: 'Back' },
});

type MessageKey = keyof typeof messages;

// what an editor goes through first comes first
const SECTIONS: {
  status: TranslationLinkStatus;
  label: MessageKey;
  hint: MessageKey;
}[] = [
  { status: 'translatable', label: 'translatable', hint: 'translatableHint' },
  { status: 'broken', label: 'broken', hint: 'brokenHint' },
  { status: 'untranslated', label: 'untranslated', hint: 'untranslatedHint' },
  { status: 'external', label: 'external', hint: 'externalHint' },
  { status: 'translated', label: 'translated', hint: 'translatedHint' },
  { status: 'independent', label: 'independent', hint: 'independentHint' },
];

const LINKS_SHOWN = 5;

interface TranslationLinksViewProps {
  location: { pathname: string };
}

const TranslationLinksView = (props: TranslationLinksViewProps) => {
  const intl = useIntl();
  const path = getBaseUrl(props.location.pathname);
  const content = useSelector(
    (state: TranslationState) => state?.content?.data,
  );

  const [links, setLinks] = useState<TranslationLinks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    setLinks(null);
    setError(null);
    fetchTranslationLinks(path)
      .then((data) => mounted && setLinks(data))
      .catch(
        (request: ApiError) =>
          mounted &&
          setError(
            request?.response?.body?.message ||
              request?.message ||
              String(request),
          ),
      );
    return () => {
      mounted = false;
    };
  }, [path]);

  // createPortal needs a real node; on the server there is none.
  const toolbarNode = __CLIENT__ ? document.getElementById('toolbar') : null;

  // images and files have a section of their own, as in the report: they are
  // usually not translated, which is no link to go after
  const isAsset = (link: TranslationLink) =>
    link.kind === 'image' || link.kind === 'file';
  const items = (links?.items || []).filter((link) => !isAsset(link));
  const assets = (links?.items || []).filter(isAsset);

  const kindLabel = (link: TranslationLink) => {
    if (link.kind === 'image') return intl.formatMessage(messages.kindImage);
    if (link.kind === 'file') return intl.formatMessage(messages.kindFile);

    return null;
  };

  return (
    <Container id="page-translate" className="controlpanel-translate">
      <Helmet title={intl.formatMessage(messages.title)} />
      <Segment.Group raised>
        <Segment className="primary">
          {intl.formatMessage(messages.headline, {
            title: <q>{content?.title || ''}</q>,
          })}
        </Segment>

        {links === null && !error && (
          <Segment>
            <Loader active inline="centered" />
          </Segment>
        )}

        {error && (
          <Segment>
            <Message error>
              {intl.formatMessage(messages.failed, { message: error })}
            </Message>
          </Segment>
        )}

        {links !== null && items.length === 0 && assets.length === 0 && (
          <Segment>{intl.formatMessage(messages.noLinks)}</Segment>
        )}

        {[
          ...SECTIONS.map((section) => ({
            key: section.status as string,
            label: section.label,
            hint: section.hint,
            found: items.filter((link) => link.status === section.status),
          })),
          {
            key: 'assets',
            label: 'assets' as MessageKey,
            hint: 'assetsHint' as MessageKey,
            found: assets,
          },
        ].map((section) => {
          const found = section.found;
          if (found.length === 0) return null;
          const all = expanded.includes(section.key);
          const shown = all ? found : found.slice(0, LINKS_SHOWN);

          return (
            <React.Fragment key={section.key}>
              <Segment className="translation-section-title">
                {intl.formatMessage(messages[section.label], {
                  count: found.length,
                })}
              </Segment>
              <Segment secondary className="translation-situation">
                {intl.formatMessage(messages[section.hint])}
              </Segment>
              <Segment
                className={`translation-links translation-links--${section.key}`}
              >
                <div className="translation-links-table">
                  {shown.map((link, index) => (
                    <div
                      className="translation-link"
                      key={`${link.url}-${index}`}
                    >
                      {link.text && <strong>{link.text}</strong>}
                      {kindLabel(link) && (
                        <span className="translation-link-kind">
                          {kindLabel(link)}
                        </span>
                      )}
                      <div className="translation-asset-url">
                        {link.status === 'broken' || !link.url ? (
                          link.url
                        ) : (
                          <UniversalLink href={flattenToAppURL(link.url)}>
                            {link.url}
                          </UniversalLink>
                        )}
                      </div>
                      {link.translation && (
                        <dl>
                          <dt className="rewritten">
                            {intl.formatMessage(messages.translation)}
                          </dt>
                          <dd>
                            <UniversalLink
                              href={flattenToAppURL(link.translation)}
                            >
                              {link.translation}
                            </UniversalLink>
                          </dd>
                        </dl>
                      )}
                    </div>
                  ))}
                </div>
                {!all && found.length > LINKS_SHOWN && (
                  <button
                    type="button"
                    className="translation-links-more"
                    onClick={() => setExpanded([...expanded, section.key])}
                  >
                    {intl.formatMessage(messages.showAll, {
                      count: found.length,
                    })}
                  </button>
                )}
              </Segment>
            </React.Fragment>
          );
        })}
      </Segment.Group>
      {__CLIENT__ &&
        toolbarNode &&
        createPortal(
          <Toolbar
            pathname={props.location.pathname}
            hideDefaultViewButtons
            inner={
              <Link to={flattenToAppURL(path)} className="item">
                <Icon
                  name={backSVG}
                  className="contents circled"
                  size="30px"
                  title={intl.formatMessage(messages.back)}
                />
              </Link>
            }
          />,
          toolbarNode,
        )}
    </Container>
  );
};

export default TranslationLinksView;
