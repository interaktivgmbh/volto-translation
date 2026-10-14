/**
 * Shadow of @plone/volto/components/manage/Multilingual/ManageTranslations
 * (Volto 18.32.3). Deltas to the stock component
 *
 * - the table headers go through react-intl (hardcoded English upstream),
 * - a machine-translate button per language row, coloured by the row's
 *   translation status (read from GET @translate's `translations`),
 * - a "Working copy" column linking the open copy of each translation,
 *   its badge coloured by the copy's status.
 *
 * Everything else — linking, unlinking, manual creation — is stock.
 */
import React, { useEffect, useState } from 'react';
import { Button, Container, Segment, Table } from 'semantic-ui-react';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';
import langmap from '@plone/volto/helpers/LanguageMap/LanguageMap';
import reduce from 'lodash/reduce';
import { Link, useLocation } from 'react-router-dom';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import config from '@plone/volto/registry';

import withObjectBrowser from '@plone/volto/components/manage/Sidebar/ObjectBrowser';
import {
  deleteLinkTranslation,
  linkTranslation,
} from '@plone/volto/actions/translations/translations';
import { getContent } from '@plone/volto/actions/content/content';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

import addSVG from '@plone/volto/icons/add.svg';
import backSVG from '@plone/volto/icons/back.svg';
import linkSVG from '@plone/volto/icons/link.svg';
import translateSVG from '@plone/volto/icons/translate.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';

import { fetchTranslationInfoFor } from '../../../../../helpers/translateApi';

const messages = defineMessages({
  success: {
    id: 'Success',
    defaultMessage: 'Success',
  },
  linked: {
    id: 'Translation linked',
    defaultMessage: 'Translation linked',
  },
  unlinked: {
    id: 'Translation linking removed',
    defaultMessage: 'Translation linking removed',
  },
  link: {
    id: 'Link translation for',
    defaultMessage: 'Link translation for',
  },
  unlink: {
    id: 'Unlink translation for',
    defaultMessage: 'Unlink translation for',
  },
  ManageTranslations: {
    id: 'Manage Translations',
    defaultMessage: 'Manage Translations',
  },
  ManageTranslationsTitle: {
    id: 'Manage translations for {title}',
    defaultMessage: 'Manage translations for {title}',
  },
  back: {
    id: 'Back',
    defaultMessage: 'Back',
  },
  language: {
    id: 'Language',
    defaultMessage: 'Language',
  },
  path: {
    id: 'Path',
    defaultMessage: 'Path',
  },
  tools: {
    id: 'Tools',
    defaultMessage: 'Tools',
  },
  workingCopy: {
    id: 'volto-translation-working-copy',
    defaultMessage: 'Working copy',
  },
  machineTranslate: {
    id: 'volto-translation-machine-translate-into',
    defaultMessage: 'Machine translate into',
  },
  notTranslatable: {
    id: 'volto-translation-not-translatable',
    defaultMessage:
      'Machine translation is not available for this content type.',
  },
  statusNone: {
    id: 'volto-translation-status-none',
    defaultMessage: 'no translation',
  },
  statusManual: {
    id: 'volto-translation-status-manual',
    defaultMessage: 'created manually',
  },
  statusUnreviewed: {
    id: 'volto-translation-status-machine_unreviewed',
    defaultMessage: 'machine translated, not reviewed yet',
  },
  statusEdited: {
    id: 'volto-translation-status-machine_edited',
    defaultMessage: 'machine translated, edited editorially',
  },
  statusReviewed: {
    id: 'volto-translation-status-machine_reviewed',
    defaultMessage: 'machine translated, reviewed',
  },
  workingCopyNotice: {
    id: 'volto-translation-working-copy-notice',
    defaultMessage:
      'This is a working copy — translations are managed on the original.',
  },
  goToOriginal: {
    id: 'volto-translation-go-to-original',
    defaultMessage: 'Go to the original',
  },
});

const STATUS_MESSAGES = {
  manual: 'statusManual',
  machine_unreviewed: 'statusUnreviewed',
  machine_edited: 'statusEdited',
  machine_reviewed: 'statusReviewed',
};

const ManageTranslations = (props) => {
  const intl = useIntl();
  const pathname = useLocation().pathname;
  const content = useSelector((state) => state.content.data);
  const dispatch = useDispatch();

  const [isClient, setIsClient] = useState(false);
  // GET @translate's per-language view: {lang: {url, status, working_copy}}.
  const [translationInfo, setTranslationInfo] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadTranslationInfo = React.useCallback(() => {
    fetchTranslationInfoFor(getBaseUrl(pathname))
      .then((info) => setTranslationInfo(info))
      .catch(() => setTranslationInfo(null));
  }, [pathname]);

  useEffect(() => {
    loadTranslationInfo();
  }, [loadTranslationInfo]);

  const { isObjectBrowserOpen, openObjectBrowser } = props;

  const currentSelectedItem = React.useRef(null);

  React.useEffect(() => {
    if (!content) {
      dispatch(getContent(getBaseUrl(pathname)));
    }
  }, [dispatch, content, pathname]);

  React.useEffect(() => {
    // Only execute the link API call on the final item selected, once the ObjectBrowser
    // is closed
    if (!isObjectBrowserOpen && currentSelectedItem.current) {
      dispatch(
        linkTranslation(
          flattenToAppURL(content['@id']),
          currentSelectedItem.current,
        ),
      )
        .then((resp) => {
          toast.success(
            <Toast
              success
              title={intl.formatMessage(messages.success)}
              content={intl.formatMessage(messages.linked)}
            />,
          );
          dispatch(getContent(getBaseUrl(pathname)));
          loadTranslationInfo();
        })
        .catch((error) => {
          // TODO: The true error sent by the API is shadowed by the superagent one
          // Update this when this issue is fixed.
          const shadowedError = JSON.parse(error.response.text);
          toast.error(
            <Toast
              error
              title={shadowedError.error.type}
              content={shadowedError.error.message}
            />,
            { toastId: 'linkFailed' },
          );
        });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [isObjectBrowserOpen]);

  const translations = content &&
    content['@components'].translations.items && {
      [content.language.token]: {
        url: content['@id'],
      },
      ...reduce(
        content['@components'].translations.items,
        (acc, value) => {
          return { ...acc, [value.language]: { url: value['@id'] } };
        },
        {},
      ),
    };

  function onSelectTarget(target) {
    // We store the selection temporarily on the component, because we don't want it to
    // execute it right away, since that will lead into duplicate link requests and we
    // only want the last to get through
    currentSelectedItem.current = target;
  }

  function onDeleteTranslation(lang) {
    dispatch(deleteLinkTranslation(flattenToAppURL(content['@id']), lang))
      .then((resp) => {
        toast.success(
          <Toast
            success
            title={intl.formatMessage(messages.success)}
            content={intl.formatMessage(messages.unlinked)}
          />,
        );
        dispatch(getContent(getBaseUrl(pathname)));
        loadTranslationInfo();
      })
      .catch((error) => {
        // TODO: The true error sent by the API is shadowed by the superagent one
        // Update this when this issue is fixed.
        const shadowedError = JSON.parse(error.response.text);
        toast.error(
          <Toast
            error
            title={shadowedError.error.type}
            content={shadowedError.error.message}
          />,
          { toastId: 'linkFailed' },
        );
      });
  }

  function statusLabel(status) {
    const message = STATUS_MESSAGES[status];

    return message
      ? intl.formatMessage(messages[message])
      : intl.formatMessage(messages.statusNone);
  }

  return (
    <Container id="page-manage-translations">
      <Helmet title={intl.formatMessage(messages.ManageTranslations)} />
      <Segment.Group raised>
        <Segment className="primary">
          <FormattedMessage
            id="Manage translations for {title}"
            defaultMessage="Manage translations for {title}"
            values={{ title: <q>{content.title}</q> }}
          />
        </Segment>
        {content && translationInfo?.is_working_copy && (
          <Segment className="machine-translation-working-copy-notice">
            {intl.formatMessage(messages.workingCopyNotice)}{' '}
            {translationInfo?.baseline_url && (
              <Link to={flattenToAppURL(translationInfo.baseline_url)}>
                {intl.formatMessage(messages.goToOriginal)}
              </Link>
            )}
          </Segment>
        )}
        {content && !translationInfo?.is_working_copy && (
          <Table selectable compact singleLine attached>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {intl.formatMessage(messages.language)}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {intl.formatMessage(messages.path)}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {intl.formatMessage(messages.workingCopy)}
                </Table.HeaderCell>
                <Table.HeaderCell textAlign="right">
                  {intl.formatMessage(messages.tools)}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {config.settings.supportedLanguages.map((lang) => {
                const entry = translationInfo?.translations?.[lang];
                const workingCopy = entry?.working_copy;

                return (
                  <Table.Row key={lang}>
                    <Table.Cell collapsing>
                      {lang === content.language.token ? (
                        <strong>{langmap[lang].nativeName}</strong>
                      ) : (
                        langmap[lang].nativeName
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={flattenToAppURL(translations[lang]?.url || '')}>
                        {flattenToAppURL(translations[lang]?.url || '')}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {workingCopy?.url && (
                        <Link
                          to={flattenToAppURL(workingCopy.url)}
                          className={`machine-translation-working-copy machine-translation-status--${workingCopy.status}`}
                          title={statusLabel(workingCopy.status)}
                        >
                          {flattenToAppURL(workingCopy.url)}
                        </Link>
                      )}
                    </Table.Cell>
                    <Table.Cell
                      textAlign="right"
                      className="manage-multilingual-tools"
                    >
                      {/* The reason sits on the group: a disabled Semantic
                          button takes no pointer events, so its own title
                          would never show. */}
                      <Button.Group
                        title={
                          translationInfo?.translatable === false
                            ? intl.formatMessage(messages.notTranslatable)
                            : undefined
                        }
                      >
                        <Button
                          className={`machine-translation-status--${entry?.status}`}
                          aria-label={`${intl.formatMessage(
                            messages.machineTranslate,
                          )} ${langmap[lang].nativeName.toLowerCase()} — ${statusLabel(entry?.status)}`}
                          title={statusLabel(entry?.status)}
                          basic
                          icon
                          disabled={
                            lang === content.language.token ||
                            !translationInfo?.configured ||
                            translationInfo?.translatable === false
                          }
                          as={Link}
                          to={`${getBaseUrl(pathname)}/translate?target=${encodeURIComponent(lang)}`}
                        >
                          <Icon name={translateSVG} size="24px" />
                        </Button>
                      </Button.Group>
                      <Button.Group>
                        <Button
                          basic
                          icon
                          disabled={
                            lang === content.language.token ||
                            translations?.[lang]
                          }
                          as={Link}
                          to={{
                            pathname: `${pathname}/create-translation`,
                            state: {
                              type: content['@type'],
                              translationOf: flattenToAppURL(content['@id']),
                              language: lang,
                            },
                          }}
                        >
                          <Icon name={addSVG} size="24px" />
                        </Button>
                      </Button.Group>
                      {translations?.[lang] ? (
                        <Button.Group>
                          <Button
                            aria-label={`${intl.formatMessage(
                              messages.unlink,
                            )} ${langmap[lang].nativeName.toLowerCase()}`}
                            basic
                            icon
                            disabled={lang === content.language.token}
                            onClick={() => onDeleteTranslation(lang)}
                          >
                            <Icon
                              name={
                                lang === content.language.token
                                  ? linkSVG
                                  : unlinkSVG
                              }
                              size="24px"
                            />
                          </Button>
                        </Button.Group>
                      ) : (
                        <Button.Group>
                          <Button
                            aria-label={`${intl.formatMessage(
                              messages.link,
                            )} ${langmap[lang].nativeName.toLowerCase()}`}
                            basic
                            icon
                            disabled={lang === content.language.token}
                            onClick={() =>
                              openObjectBrowser({
                                mode: 'link',
                                overlay: true,
                                onSelectItem: (url) => {
                                  onSelectTarget(url, isObjectBrowserOpen);
                                },
                              })
                            }
                          >
                            <Icon name={linkSVG} size="24px" />
                          </Button>
                        </Button.Group>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
        {isClient &&
          createPortal(
            <Toolbar
              pathname={pathname}
              hideDefaultViewButtons
              inner={
                <Link to={`${getBaseUrl(pathname)}`} className="item">
                  <Icon
                    name={backSVG}
                    className="contents circled"
                    size="30px"
                    title={intl.formatMessage(messages.back)}
                  />
                </Link>
              }
            />,
            document.getElementById('toolbar'),
          )}
      </Segment.Group>
    </Container>
  );
};

export default withObjectBrowser(ManageTranslations);
