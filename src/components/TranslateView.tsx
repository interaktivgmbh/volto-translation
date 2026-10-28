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
import config from '@plone/registry';
import { languageName } from '../helpers/languages';
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
  cancel: { id: 'volto-translation-cancel', defaultMessage: 'Cancel' },
  intro: {
    id: 'volto-translation-intro',
    defaultMessage: 'Choose the language to translate this page into.',
  },
  next: { id: 'volto-translation-next', defaultMessage: 'Continue' },
  headlineLanguage: {
    id: 'volto-translation-headline-language',
    defaultMessage: 'Translate into {language}',
  },
  noTranslation: {
    id: 'volto-translation-no-translation',
    defaultMessage:
      'There is no {language} translation yet. How should it be created?',
  },
  translationExists: {
    id: 'volto-translation-translation-exists',
    defaultMessage: 'Translation exists!',
  },
  workingCopyPresent: {
    id: 'volto-translation-working-copy-present',
    defaultMessage: 'Working copy exists!',
  },
  modeManual: {
    id: 'volto-translation-mode-manual',
    defaultMessage: 'Plone standard translation',
  },
  modeManualHint: {
    id: 'volto-translation-mode-manual-hint',
    defaultMessage:
      "Opens Plone's translation form. The content is transferred by hand.",
  },
  modeMachine: {
    id: 'volto-translation-mode-machine',
    defaultMessage: 'Translate automatically',
  },
  modeMachineHint: {
    id: 'volto-translation-mode-machine-hint',
    defaultMessage:
      'Content and metadata are translated automatically. The result then has to be reviewed editorially.',
  },
  notOfferedForMachine: {
    id: 'volto-translation-not-offered-for-machine',
    defaultMessage: '{language} is not offered for automatic translation.',
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
    id: 'volto-translation-working-copy-info',
    defaultMessage:
      'A published translation into {language} already exists. The automatic translation is therefore created in a new working copy. The published page stays unchanged until you apply this working copy with the new translation.',
  },
  workingCopyExists: {
    id: 'volto-translation-working-copy-exists',
    defaultMessage:
      'There is already a {language} translation, and a working copy of it is being revised. A new automatic translation is possible again once this working copy has been applied or discarded. The existing translation stays unchanged until then.',
  },
  openWorkingCopy: {
    id: 'volto-translation-open-working-copy',
    defaultMessage: 'Open the working copy',
  },
  failed: {
    id: 'volto-translation-failed',
    defaultMessage: 'The translation failed: {message}',
  },
});

type MessageKey = keyof typeof messages;
type Mode = '' | 'manual' | 'machine';

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
  const [mode, setMode] = useState<Mode>('');
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
  const languages = (info?.languages || []).filter(
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

  const isMultilingual = Boolean(config.settings?.isMultilingual);
  const targetLanguage = languages.find((language) => language.code === target);
  const targetEntry = target ? info?.translations?.[target] : undefined;
  const targetExists = Boolean(targetEntry?.url);
  const workingCopiesEnabled = Boolean(info?.working_copies_enabled);
  const workingCopyUrl = targetEntry?.working_copy?.url;
  const workingCopyExists = Boolean(workingCopyUrl);
  // A standing working copy holds somebody's work: it is never overwritten.
  const overwriteRequired =
    targetExists && !workingCopiesEnabled && !workingCopyExists;

  // Why a machine translation into the target is not possible, if it is not.
  const machineRefusal = !info?.configured
    ? messages.notConfigured
    : info?.translatable === false
      ? messages.notTranslatable
      : targetLanguage && !targetLanguage.machine
        ? messages.notOfferedForMachine
        : null;
  // Plone's own translation form only creates a translation that is missing,
  // and only on a multilingual site; there the editor chooses the way.
  const offersChoice =
    isMultilingual && Boolean(targetLanguage) && !targetExists;
  const chosenMode: Mode = offersChoice
    ? machineRefusal
      ? 'manual'
      : mode
    : targetLanguage
      ? 'machine'
      : '';

  useEffect(() => {
    setOverwrite(false);
    setMode('');
  }, [target]);

  if (!token) return null;

  // createPortal needs a real node; on the server there is none.
  const toolbarNode = __CLIENT__ ? document.getElementById('toolbar') : null;

  const targetName = targetLanguage
    ? languageName(targetLanguage.code, intl.locale, targetLanguage.title)
    : '';

  const createByHand = () =>
    history.push({
      pathname: `${path}/create-translation`,
      state: {
        type: content?.['@type'],
        translationOf: flattenToAppURL(content?.['@id'] || ''),
        language: target,
      },
    });

  const canProceed =
    chosenMode === 'manual' ||
    (chosenMode === 'machine' &&
      !machineRefusal &&
      !workingCopyExists &&
      !(overwriteRequired && !overwrite));

  const modes: { key: Mode; label: MessageKey; hint: MessageKey }[] = [
    { key: 'manual', label: 'modeManual', hint: 'modeManualHint' },
    { key: 'machine', label: 'modeMachine', hint: 'modeMachineHint' },
  ];

  return (
    <Container id="page-translate" className="controlpanel-translate">
      <Helmet title={intl.formatMessage(messages.title)} />
      <Segment.Group raised>
        <Segment className="primary">
          {result
            ? intl.formatMessage(messages.doneHeadline)
            : targetLanguage
              ? intl.formatMessage(messages.headlineLanguage, {
                  language: targetName,
                })
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

        {!result && info && languages.length === 0 && (
          <Segment>
            <Message warning>
              {intl.formatMessage(
                info.configured ? messages.noLanguages : messages.notConfigured,
              )}
            </Message>
          </Segment>
        )}

        {!result && !busy && languages.length > 0 && !preselected && (
          <Segment>
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
                  {languageName(language.code, intl.locale, language.title)}
                </option>
              ))}
            </select>
          </Segment>
        )}

        {!result && !busy && targetLanguage && isMultilingual && (
          <Segment secondary className="translation-situation">
            {intl.formatMessage(
              workingCopyExists
                ? messages.workingCopyPresent
                : targetExists
                  ? messages.translationExists
                  : messages.noTranslation,
              { language: targetName },
            )}
          </Segment>
        )}

        {!result && !busy && offersChoice && (
          <Segment>
            <div className="translation-modes" role="radiogroup">
              {modes.map(({ key, label, hint }) => {
                const disabled = key === 'machine' && Boolean(machineRefusal);
                return (
                  // the label holds its input and its text; the text sits in a
                  // column beside the radio, deeper than the rule looks for it
                  // eslint-disable-next-line jsx-a11y/label-has-associated-control
                  <label
                    key={key}
                    htmlFor={`translation-mode-${key}`}
                    className={`translation-mode${disabled ? ' disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`translation-mode-${key}`}
                      name="translation-mode"
                      value={key}
                      checked={chosenMode === key}
                      disabled={disabled}
                      onChange={() => setMode(key)}
                    />
                    <span>
                      <strong>{intl.formatMessage(messages[label])}</strong>
                      <span className="translation-mode-hint">
                        {intl.formatMessage(
                          disabled && machineRefusal
                            ? machineRefusal
                            : messages[hint],
                          { language: targetName },
                        )}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Segment>
        )}

        {!result &&
          !busy &&
          !offersChoice &&
          targetLanguage &&
          machineRefusal && (
            <Segment>
              <Message info>
                {intl.formatMessage(machineRefusal, { language: targetName })}
              </Message>
            </Segment>
          )}

        {!result &&
          !busy &&
          !offersChoice &&
          targetExists &&
          !machineRefusal && (
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
              {workingCopyUrl && (
                <p>
                  <Link to={flattenToAppURL(workingCopyUrl)}>
                    {intl.formatMessage(messages.openWorkingCopy)}
                  </Link>
                </p>
              )}
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
                  {intl.formatMessage(messages.overwriteLabel)}
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
              result ? messages.openResult : messages.next,
            )}
            title={intl.formatMessage(
              result ? messages.openResult : messages.next,
            )}
            loading={busy}
            disabled={result ? false : busy || !canProceed}
            onClick={
              result
                ? () =>
                    history.push({
                      pathname: flattenToAppURL(
                        result['@id'] || result.report?.['@id'] || path,
                      ),
                      // the banner there names a page just created
                      state: {
                        machineTranslationCreated: Boolean(
                          result.report?.created,
                        ),
                      },
                    })
                : chosenMode === 'manual'
                  ? createByHand
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
