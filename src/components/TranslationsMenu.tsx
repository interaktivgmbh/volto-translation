import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import { fetchTranslationInfoFor } from '../helpers/translateApi';
import { languageName } from '../helpers/languages';
import type { TranslationInfo, TranslationState } from '../types';

const messages = defineMessages({
  title: { id: 'volto-translation-menu-title', defaultMessage: 'Translations' },
  translateInto: {
    id: 'volto-translation-menu-translate-into',
    defaultMessage: 'Translate into {language}',
  },
  manageTranslations: {
    id: 'volto-translation-menu-manage',
    defaultMessage: 'Manage translations',
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
  sourceWorkingCopy: {
    id: 'volto-translation-source-working-copy',
    defaultMessage:
      'This page has an open working copy. Check it in or discard it, then translate.',
  },
});

interface TranslationsMenuProps {
  pathname?: string;
  closeMenu?: () => void;
  theToolbar?: { current?: HTMLElement | null };
}

const TranslationsMenu = (props: TranslationsMenuProps) => {
  const intl = useIntl();
  const path = getBaseUrl(props.pathname || '');
  const close = () => props.closeMenu && props.closeMenu();

  const content = useSelector(
    (state: TranslationState) => state?.content?.data,
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

  const isMultilingual = Boolean(config.settings?.isMultilingual);

  // One entry per language there is something to do for: a machine
  // translation, or, while there is no translation yet, Plone's own form.
  // The translate page offers the choice.
  // the live content would be translated, not the newer working copy
  const machineReady =
    Boolean(info?.configured) &&
    info?.translatable !== false &&
    !info?.working_copy_url;
  const targets = (info?.languages || []).filter((language) => {
    if (language.code === contentLanguage) return false;
    const exists = Boolean(info?.translations?.[language.code]?.url);

    return (
      (language.machine && machineReady) ||
      (isMultilingual && !exists && info?.manual_translatable !== false)
    );
  });

  // the working copy actions are Volto's own, under "Manage content…" in the
  // more menu; here only the way back to the original
  const baselineUrl = content?.working_copy_of?.['@id'];

  const isWorkingCopy = Boolean(info?.is_working_copy);
  const originalUrl = info?.baseline_url || baselineUrl;

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
                <span>
                  {info?.refusal?.message ||
                    intl.formatMessage(messages.notTranslatable)}
                </span>
              </li>
            )}

          {!isWorkingCopy &&
            info?.configured &&
            info?.translatable !== false &&
            info?.working_copy_url && (
              <li className="translations-menu-notice">
                <span>{intl.formatMessage(messages.sourceWorkingCopy)}</span>
              </li>
            )}

          {!isWorkingCopy &&
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

          {!isWorkingCopy && isMultilingual && (
            <li>
              <Link to={`${path}/manage-translations`} onClick={close}>
                {intl.formatMessage(messages.manageTranslations)}
                <Icon name={rightArrowSVG} size="24px" />
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TranslationsMenu;
