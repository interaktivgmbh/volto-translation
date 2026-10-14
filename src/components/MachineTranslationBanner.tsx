import React from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  unreviewed: {
    id: 'volto-translation-unreviewed',
    defaultMessage:
      'This page was machine translated ({provider}) and has not been reviewed yet.',
  },
  edited: {
    id: 'volto-translation-edited',
    defaultMessage:
      'This page was machine translated ({provider}) and is being revised editorially — not yet approved.',
  },
});

interface MachineTranslationInfo {
  machine_translated?: boolean;
  provider?: string;
  status?: string;
}

const BANNER_MESSAGES: Record<string, keyof typeof messages> = {
  machine_unreviewed: 'unreviewed',
  machine_edited: 'edited',
};

const MachineTranslationBanner = () => {
  const intl = useIntl();
  const token = useSelector<any, string | undefined>(
    (state) => state.userSession?.token,
  );
  const info = useSelector<any, MachineTranslationInfo | undefined>(
    (state) => state.content?.data?.['@components']?.machine_translation,
  );

  const message = info?.status ? BANNER_MESSAGES[info.status] : undefined;
  if (!token || !message) {
    return null;
  }

  return (
    <div
      className={`ui container machine-translation-banner machine-translation-banner--${info?.status}`}
      role="status"
    >
      {intl.formatMessage(messages[message], { provider: info?.provider })}
    </div>
  );
};

export default MachineTranslationBanner;
