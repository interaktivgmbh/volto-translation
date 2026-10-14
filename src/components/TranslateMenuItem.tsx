import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Plug } from '@plone/volto/components/manage/Pluggable';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import translateSVG from '@plone/volto/icons/translate.svg';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import config from '@plone/registry';
import { fetchTranslationInfo } from '../helpers/translateApi';
import type { TranslationState } from '../types';

const messages = defineMessages({
  translate: {
    id: 'volto-translation-menu-item',
    defaultMessage: 'Translations',
  },
});

type ToggleMenu = (event: React.MouseEvent, name: string) => void;

// Written by the bottom plug, read by the top one. A ref rather than state:
// the toggle is Volto's own bound method and stays the same for the life of
// the toolbar, and the button must see the current one at click time.
const toolbarToggle: { current: ToggleMenu | null } = { current: null };

const CaptureToggle = ({ onClickHandler }: { onClickHandler?: ToggleMenu }) => {
  useEffect(() => {
    toolbarToggle.current = onClickHandler || null;

    return () => {
      toolbarToggle.current = null;
    };
  }, [onClickHandler]);

  return null;
};

// Module scope, so the renderer keeps its identity: `Plug` registers what it
// is given once and does not re-register on later renders.
const captureRenderer = (params: { onClickHandler?: ToggleMenu }) => (
  <CaptureToggle onClickHandler={params?.onClickHandler} />
);

interface TranslateMenuItemProps {
  pathname?: string;
}

const TranslateMenuItem = (props: TranslateMenuItemProps) => {
  const intl = useIntl();
  const token = useSelector(
    (state: TranslationState) => state?.userSession?.token,
  );
  const content = useSelector(
    (state: TranslationState) => state?.content?.data,
  );
  const pathname = props?.pathname || '';
  // null = not asked yet; an unconfigured site must not be offered the action.
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return undefined;
    let mounted = true;
    fetchTranslationInfo()
      .then((info) => mounted && setConfigured(Boolean(info?.configured)))
      .catch(() => mounted && setConfigured(false));
    return () => {
      mounted = false;
    };
  }, [token]);

  // The menu also carries the stock multilingual entries, so it is worth
  // opening on a multilingual site even where no provider is configured.
  const worthOpening = configured || Boolean(config.settings?.isMultilingual);

  if (!token || !worthOpening) return null;
  // Volto renders `main.toolbar.top` outside the block it hides on views that
  // bring their own toolbar — edit, contents, manage-translations, our own
  // translate page. Without this the button would be the only one left
  // standing there. getBaseUrl strips exactly those routes, so a path it
  // shortens is not a content view.
  if (getBaseUrl(pathname) !== pathname) return null;
  if (!content?.['@id'] || content['@type'] === 'Plone Site') return null;

  const label = intl.formatMessage(messages.translate);

  return (
    <>
      <Plug pluggable="main.toolbar.bottom" id="translations-toggle">
        {captureRenderer}
      </Plug>
      <Plug pluggable="main.toolbar.top" id="translations">
        <button
          className="translations"
          id="toolbar-translations"
          aria-label={label}
          tabIndex={0}
          onClick={(event: React.MouseEvent) =>
            toolbarToggle.current &&
            toolbarToggle.current(event, 'translations')
          }
        >
          <Icon name={translateSVG} size="30px" title={label} />
        </button>
      </Plug>
    </>
  );
};

export default TranslateMenuItem;
