import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { Container, Segment, Button, Message, Loader } from 'semantic-ui-react';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import aheadSVG from '@plone/volto/icons/ahead.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import backSVG from '@plone/volto/icons/back.svg';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import {
  fetchTranslationInfoFor,
  translateContent,
} from '../helpers/translateApi';
import TranslationReportView from './TranslationReportView';
import type {
  ApiError,
  TranslationInfo,
  TranslationResult,
  TranslationState,
} from '../types';

const messages = defineMessages({
  title: { id: 'volto-translation-title', defaultMessage: 'Translate' },
  headline: {
    id: 'volto-translation-headline',
    defaultMessage: 'Translate {title}',
  },
  hint: { id: 'volto-translation-hint', defaultMessage: 'Note' },
  running: {
    id: 'volto-translation-running',
    defaultMessage: 'Translating into {language}…',
  },
  runningHint: {
    id: 'volto-translation-running-hint',
    defaultMessage:
      'This can take a moment. Please leave the page open until it is done.',
  },
  doneHeadline: {
    id: 'volto-translation-done-headline',
    defaultMessage: 'Translation finished',
  },
  openResult: {
    id: 'volto-translation-open-result',
    defaultMessage: 'Open the translation',
  },
  close: { id: 'volto-translation-close', defaultMessage: 'Close' },
  workingCopyPresent: {
    id: 'volto-translation-working-copy-present',
    defaultMessage: 'A working copy exists!',
  },
  cancel: { id: 'volto-translation-cancel', defaultMessage: 'Cancel' },
  intro: {
    id: 'volto-translation-intro',
    defaultMessage: 'Choose the language to translate this page into.',
  },
  translate: {
    id: 'volto-translation-submit',
    defaultMessage: 'Translate',
  },
  back: { id: 'volto-translation-back', defaultMessage: 'Back' },
  notConfigured: {
    id: 'volto-translation-not-configured',
    defaultMessage:
      'No translation service is configured. Add a DeepL key in Site Setup → Translation.',
  },
  notTranslatable: {
    id: 'volto-translation-not-translatable',
    defaultMessage:
      'Machine translation is not available for this content type.',
  },
  noLanguages: {
    id: 'volto-translation-no-languages',
    defaultMessage: 'No target languages are configured for this site.',
  },
  singleTarget: {
    id: 'volto-translation-single-target',
    defaultMessage: 'This page will be translated into {language}.',
  },
  existsWarning: {
    id: 'volto-translation-exists',
    defaultMessage:
      'A translation into this language already exists. Overwriting replaces its content; the previous state remains in the version history.',
  },
  overwriteLabel: {
    id: 'volto-translation-overwrite',
    defaultMessage: 'Overwrite the existing translation',
  },
  workingCopyInfo: {
    id: 'volto-translation-working-copy',
    defaultMessage:
      'A published translation into {language} already exists. The machine translation is put in a working copy and replaces its content there. The published page stays unchanged until you apply the working copy.',
  },
  workingCopyExists: {
    id: 'volto-translation-working-copy-exists',
    defaultMessage:
      'A working copy of this translation already exists. Overwriting updates that working copy.',
  },
  overwriteWorkingCopyLabel: {
    id: 'volto-translation-overwrite-working-copy',
    defaultMessage: 'Update the existing working copy',
  },
  failed: {
    id: 'volto-translation-failed',
    defaultMessage: 'The translation failed: {message}',
  },
});

interface TranslateViewProps {
  location: { pathname: string; search?: string };
}

const TranslateView = (props: TranslateViewProps) => {
  const intl = useIntl();
  const history = useHistory();
  const path = getBaseUrl(props.location.pathname);
  const token = useSelector(
    (state: TranslationState) => state?.userSession?.token,
  );
  const content = useSelector(
    (state: TranslationState) => state?.content?.data,
  );

  const [info, setInfo] = useState<TranslationInfo | null>(null);
  const [target, setTarget] = useState<string>('');
  const [overwrite, setOverwrite] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the translation ran: the view then reports instead of asking.
  const [result, setResult] = useState<TranslationResult | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchTranslationInfoFor(path)
      .then((data) => mounted && setInfo(data))
      .catch(() => mounted && setInfo({ configured: false }));
    return () => {
      mounted = false;
    };
  }, [path]);

  const submit = () => {
    setBusy(true);
    setError(null);
    translateContent(path, target, true, overwrite)
      .then((answer: TranslationResult) => {
        setBusy(false);
        setResult(answer);
      })
      .catch((request: ApiError) => {
        setBusy(false);
        setError(
          request?.response?.body?.message ||
            request?.message ||
            String(request),
        );
      });
  };

  const contentLanguage =
    typeof content?.language === 'string'
      ? content.language
      : content?.language?.token || '';
  const languages = (info?.target_languages || []).filter(
    (language) => language.code !== contentLanguage,
  );

  const singleLanguage = languages.length === 1 ? languages[0] : null;
  const requested = new URLSearchParams(props.location.search || '').get(
    'target',
  );
  const preselected =
    languages.find((language) => language.code === requested) || singleLanguage;
  const preselectedCode = preselected?.code;
  useEffect(() => {
    if (preselectedCode) setTarget(preselectedCode);
  }, [preselectedCode]);

  const targetEntry = target ? info?.translations?.[target] : undefined;
  const targetExists = Boolean(targetEntry?.url);
  const workingCopiesEnabled = Boolean(info?.working_copies_enabled);
  const canTranslate =
    Boolean(info?.configured) && info?.translatable !== false;
  const workingCopyExists = Boolean(targetEntry?.working_copy);
  const overwriteRequired =
    targetExists && (!workingCopiesEnabled || workingCopyExists);
  useEffect(() => {
    setOverwrite(false);
  }, [target]);

  if (!token) return null;

  // createPortal needs a real node; on the server there is none.
  const toolbarNode = __CLIENT__ ? document.getElementById('toolbar') : null;

  const targetName = (() => {
    const chosen = languages.find((language) => language.code === target);
    if (!chosen) return '';
    try {
      const names = new (Intl as any).DisplayNames([intl.locale], {
        type: 'language',
      });

      return names.of(chosen.code) || chosen.title || chosen.code;
    } catch (error) {
      return chosen.title || chosen.code;
    }
  })();

  return (
    <Container id="page-translate" className="controlpanel-translate">
      <Helmet title={intl.formatMessage(messages.title)} />
      <Segment.Group raised>
        <Segment className="primary">
          {result
            ? intl.formatMessage(messages.doneHeadline)
            : intl.formatMessage(messages.headline, {
                title: <q>{content?.title || ''}</q>,
              })}
        </Segment>

        {result?.report && (
          <TranslationReportView report={result.report} language={targetName} />
        )}

        {!result && info === null && (
          <Segment>
            <Loader active inline="centered" />
          </Segment>
        )}

        {!result && info && !info.configured && (
          <Segment>
            <Message warning>
              {intl.formatMessage(messages.notConfigured)}
            </Message>
          </Segment>
        )}

        {!result && info?.configured && info.translatable === false && (
          <Segment>
            <Message info>
              {intl.formatMessage(messages.notTranslatable)}
            </Message>
          </Segment>
        )}

        {!result && canTranslate && workingCopyExists && (
          <Segment className="translation-status">
            {intl.formatMessage(messages.workingCopyPresent)}
          </Segment>
        )}

        {!result && canTranslate && languages.length === 0 && (
          <Segment>
            <Message warning>
              {intl.formatMessage(messages.noLanguages)}
            </Message>
          </Segment>
        )}

        {!result && !busy && canTranslate && languages.length > 0 && (
          <Segment>
            {preselected ? (
              <p>
                {intl.formatMessage(messages.singleTarget, {
                  language: targetName,
                })}
              </p>
            ) : (
              <>
                <p>{intl.formatMessage(messages.intro)}</p>
                <select
                  id="translation-target-language"
                  aria-label={intl.formatMessage(messages.intro)}
                  value={target}
                  disabled={busy}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    setTarget(event.target.value)
                  }
                >
                  <option value="">—</option>
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.title || language.code}
                    </option>
                  ))}
                </select>
              </>
            )}
          </Segment>
        )}

        {!result && !busy && canTranslate && targetExists && (
          <Segment>
            <h3>{intl.formatMessage(messages.hint)}</h3>
            <p>
              {intl.formatMessage(
                workingCopyExists
                  ? messages.workingCopyExists
                  : workingCopiesEnabled
                    ? messages.workingCopyInfo
                    : messages.existsWarning,
                { language: targetName },
              )}
            </p>
            {overwriteRequired && (
              <label htmlFor="translation-overwrite">
                <input
                  type="checkbox"
                  id="translation-overwrite"
                  checked={overwrite}
                  disabled={busy}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setOverwrite(event.target.checked)
                  }
                />{' '}
                {intl.formatMessage(
                  workingCopyExists
                    ? messages.overwriteWorkingCopyLabel
                    : messages.overwriteLabel,
                )}
              </label>
            )}
          </Segment>
        )}

        {busy && (
          <Segment className="translation-running">
            <p>
              {intl.formatMessage(messages.running, { language: targetName })}
            </p>
            <div
              className="translation-progress"
              role="progressbar"
              aria-busy="true"
              aria-label={intl.formatMessage(messages.running, {
                language: targetName,
              })}
            >
              <div className="translation-progress-bar" />
            </div>
            <p className="translation-running-hint">
              {intl.formatMessage(messages.runningHint)}
            </p>
          </Segment>
        )}

        {error && (
          <Segment>
            <Message error>
              {intl.formatMessage(messages.failed, { message: error })}
            </Message>
          </Segment>
        )}

        <Segment className="actions" clearing>
          <Button
            basic
            primary
            floated="right"
            type="submit"
            aria-label={intl.formatMessage(
              result ? messages.openResult : messages.translate,
            )}
            title={intl.formatMessage(
              result ? messages.openResult : messages.translate,
            )}
            loading={busy}
            disabled={
              result
                ? false
                : !target || busy || (overwriteRequired && !overwrite)
            }
            onClick={
              result
                ? () =>
                    history.push(
                      flattenToAppURL(
                        result['@id'] || result.report?.['@id'] || path,
                      ),
                    )
                : submit
            }
          >
            <Icon className="circled" name={aheadSVG} size="30px" />
          </Button>
          <Button
            basic
            secondary
            floated="right"
            type="button"
            aria-label={intl.formatMessage(
              result ? messages.close : messages.cancel,
            )}
            title={intl.formatMessage(
              result ? messages.close : messages.cancel,
            )}
            disabled={busy}
            onClick={() => history.push(flattenToAppURL(path))}
          >
            <Icon className="circled" name={clearSVG} size="30px" />
          </Button>
        </Segment>
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

export default TranslateView;
