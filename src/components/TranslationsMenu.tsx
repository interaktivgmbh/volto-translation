import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import applySVG from '@plone/volto/icons/ready.svg';
import removeSVG from '@plone/volto/icons/circle-dismiss.svg';
import {
  createWorkingCopy,
  applyWorkingCopy,
  removeWorkingCopy,
} from '@plone/volto/actions/workingcopy/workingcopy';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import { fetchTranslationInfoFor } from '../helpers/translateApi';
import type { TranslationInfo, TranslationState } from '../types';

const messages = defineMessages({
  title: { id: 'volto-translation-menu-title', defaultMessage: 'Translations' },
  translateInto: {
    id: 'volto-translation-menu-translate-into',
    defaultMessage: 'Translate into {language}',
  },
  addTranslation: {
    id: 'volto-translation-menu-add',
    defaultMessage: 'Translate into {language} by hand',
  },
  manageTranslations: {
    id: 'volto-translation-menu-manage',
    defaultMessage: 'Manage translations',
  },
  createWorkingCopy: {
    id: 'volto-translation-menu-working-copy',
    defaultMessage: 'Create working copy',
  },
  viewWorkingCopy: {
    id: 'volto-translation-menu-view-working-copy',
    defaultMessage: 'View working copy',
  },
  applyWorkingCopy: {
    id: 'volto-translation-menu-apply-working-copy',
    defaultMessage: 'Check in working copy',
  },
  removeWorkingCopy: {
    id: 'volto-translation-menu-remove-working-copy',
    defaultMessage: 'Discard working copy',
  },
  workingCopyRemoved: {
    id: 'volto-translation-menu-working-copy-removed',
    defaultMessage: 'The working copy was discarded',
  },
  workingCopyApplied: {
    id: 'volto-translation-menu-working-copy-applied',
    defaultMessage: 'The working copy is now the main content',
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
  notTranslatable: {
    id: 'volto-translation-not-translatable',
    defaultMessage:
      'Machine translation is not available for this content type.',
  },
});

interface TranslationsMenuProps {
  pathname?: string;
  closeMenu?: () => void;
  theToolbar?: { current?: HTMLElement | null };
}

function languageName(code: string, locale: string, fallback?: string): string {
  try {
    const names = new (Intl as any).DisplayNames([locale], {
      type: 'language',
    });

    return names.of(code) || fallback || code;
  } catch (error) {
    return fallback || code;
  }
}

const TranslationsMenu = (props: TranslationsMenuProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const path = getBaseUrl(props.pathname || '');
  const close = () => props.closeMenu && props.closeMenu();

  const content = useSelector(
    (state: TranslationState) => state?.content?.data,
    shallowEqual,
  );
  const actions = useSelector(
    (state: TranslationState) => state?.actions?.actions,
    shallowEqual,
  );

  const [info, setInfo] = useState<TranslationInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTranslationInfoFor(path)
      .then((data) => mounted && setInfo(data))
      .catch(() => mounted && setInfo({ configured: false }));
    return () => {
      mounted = false;
    };
  }, [path]);

  const contentLanguage =
    typeof content?.language === 'string'
      ? content.language
      : content?.language?.token || '';

  const targets = (info?.target_languages || []).filter(
    (language) => language.code !== contentLanguage,
  );

  const isMultilingual = Boolean(config.settings?.isMultilingual);
  const hasObjectButton = (id: string) =>
    (actions?.object_buttons || []).some((action) => action?.id === id);

  const existingLanguages = (
    content?.['@components']?.translations?.items || []
  ).map((item) => item?.language);
  const untranslated: string[] = isMultilingual
    ? ((config.settings?.supportedLanguages as string[]) || []).filter(
        (language) =>
          language !== contentLanguage && !existingLanguages.includes(language),
      )
    : [];

  const canCheckOut = hasObjectButton('iterate_checkout');
  const canCheckIn = hasObjectButton('iterate_checkin');
  const baselineUrl = content?.working_copy_of?.['@id'];
  const workingCopyUrl = content?.working_copy?.['@id'];

  const isWorkingCopy = Boolean(info?.is_working_copy);
  const originalUrl = info?.baseline_url || baselineUrl;

  const notify = (title: string) =>
    toast.info(<Toast info title={title} />, { autoClose: 10000 });

  return (
    <div
      className="menu-more pastanaga-menu translations-menu"
      style={{
        flex: props.theToolbar?.current
          ? `0 0 ${props.theToolbar.current.getBoundingClientRect().width}px`
          : undefined,
      }}
    >
      <header>
        <h2>{intl.formatMessage(messages.title)}</h2>
      </header>
      <div className="pastanaga-menu-list">
        <ul>
          {isWorkingCopy && (
            <li className="translations-menu-notice">
              <span>{intl.formatMessage(messages.workingCopyNotice)}</span>
            </li>
          )}
          {isWorkingCopy && originalUrl && (
            <li>
              <Link to={flattenToAppURL(originalUrl)} onClick={close}>
                {intl.formatMessage(messages.goToOriginal)}
                <Icon name={rightArrowSVG} size="24px" />
              </Link>
            </li>
          )}

          {!isWorkingCopy &&
            info?.configured &&
            info?.translatable === false && (
              <li className="translations-menu-notice">
                <span>{intl.formatMessage(messages.notTranslatable)}</span>
              </li>
            )}

          {!isWorkingCopy &&
            info?.configured &&
            info?.translatable !== false &&
            targets.map((language) => (
              <li key={`translate-${language.code}`}>
                <Link
                  to={`${path}/translate?target=${encodeURIComponent(
                    language.code,
                  )}`}
                  onClick={close}
                >
                  {intl.formatMessage(messages.translateInto, {
                    language: languageName(
                      language.code,
                      intl.locale,
                      language.title,
                    ),
                  })}
                  <Icon name={rightArrowSVG} size="24px" />
                </Link>
              </li>
            ))}

          {!isWorkingCopy &&
            untranslated.map((language) => (
              <li key={`add-${language}`}>
                <Link
                  to={{
                    pathname: `${path}/create-translation`,
                    state: {
                      type: content?.['@type'],
                      translationOf: flattenToAppURL(content?.['@id'] || ''),
                      language,
                    },
                  }}
                  onClick={close}
                >
                  {intl.formatMessage(messages.addTranslation, {
                    language: languageName(language, intl.locale),
                  })}
                  <Icon name={rightArrowSVG} size="24px" />
                </Link>
              </li>
            ))}

          {!isWorkingCopy && isMultilingual && (
            <li>
              <Link to={`${path}/manage-translations`} onClick={close}>
                {intl.formatMessage(messages.manageTranslations)}
                <Icon name={rightArrowSVG} size="24px" />
              </Link>
            </li>
          )}

          {canCheckOut && (
            <li>
              <button
                aria-label={intl.formatMessage(messages.createWorkingCopy)}
                onClick={() => {
                  dispatch(createWorkingCopy(path)).then((response: any) => {
                    history.push(flattenToAppURL(response['@id']));
                    close();
                  });
                }}
              >
                {intl.formatMessage(messages.createWorkingCopy)}
                <Icon name={rightArrowSVG} size="24px" />
              </button>
            </li>
          )}

          {workingCopyUrl && !baselineUrl && (
            <li>
              <Link to={flattenToAppURL(workingCopyUrl)} onClick={close}>
                {intl.formatMessage(messages.viewWorkingCopy)}
                <Icon name={rightArrowSVG} size="24px" />
              </Link>
            </li>
          )}

          {canCheckIn && (
            <>
              <li>
                <button
                  aria-label={intl.formatMessage(messages.applyWorkingCopy)}
                  onClick={() => {
                    dispatch(applyWorkingCopy(path)).then(() => {
                      history.push(flattenToAppURL(baselineUrl || path));
                      close();
                      notify(intl.formatMessage(messages.workingCopyApplied));
                    });
                  }}
                >
                  {intl.formatMessage(messages.applyWorkingCopy)}
                  <Icon name={applySVG} size="24px" />
                </button>
              </li>
              <li>
                <button
                  aria-label={intl.formatMessage(messages.removeWorkingCopy)}
                  onClick={() => {
                    dispatch(removeWorkingCopy(path)).then(() => {
                      history.push(flattenToAppURL(baselineUrl || path));
                      close();
                      notify(intl.formatMessage(messages.workingCopyRemoved));
                    });
                  }}
                >
                  {intl.formatMessage(messages.removeWorkingCopy)}
                  <Icon name={removeSVG} size="24px" color="#e40166" />
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TranslationsMenu;
