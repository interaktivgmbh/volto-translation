import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { languageName } from '../helpers/languages';

const messages = defineMessages({
  titleNew: {
    id: 'volto-translation-banner-title-new',
    defaultMessage:
      'New page created with machine translation – review pending!',
  },
  titleUnreviewed: {
    id: 'volto-translation-banner-title-unreviewed',
    defaultMessage: 'Machine translated – review pending!',
  },
  titleEdited: {
    id: 'volto-translation-banner-title-edited',
    defaultMessage: 'Machine translated – being revised, review pending!',
  },
  titleWorkingCopy: {
    id: 'volto-translation-banner-title-working-copy',
    defaultMessage:
      'Working copy created with machine translation – review pending!',
  },
  unreviewed: {
    id: 'volto-translation-banner-unreviewed',
    defaultMessage:
      'This page was machine translated from the original{source, select, none {} other { ({source})}} and has not been reviewed yet.',
  },
  edited: {
    id: 'volto-translation-banner-edited',
    defaultMessage:
      'This page was machine translated from the original{source, select, none {} other { ({source})}} and is being revised editorially, but has not been approved yet.',
  },
  private: {
    id: 'volto-translation-banner-private',
    defaultMessage: 'It is private and not visible to visitors.',
  },
  reviewBeforePublishing: {
    id: 'volto-translation-banner-review-before-publishing',
    defaultMessage:
      'Before it is published, the translation has to be reviewed for content and editorially. Publishing completes the review.',
  },
  workingCopy: {
    id: 'volto-translation-banner-working-copy',
    defaultMessage:
      'This working copy was machine translated from the original{source, select, none {} other { ({source})}} and replaces the previous translation. Before it is published, the translation has to be reviewed for content and editorially. Applying the working copy replaces the existing translation and completes the review.',
  },
});

type MessageKey = keyof typeof messages;

interface MachineTranslationInfo {
  machine_translated?: boolean;
  provider?: string;
  source_language?: string | null;
  status?: string;
}

const BANNER_STATUSES = ['machine_unreviewed', 'machine_edited'];

const MachineTranslationBanner = () => {
  const intl = useIntl();
  const location = useLocation<{ machineTranslationCreated?: boolean }>();
  const token = useSelector<any, string | undefined>(
    (state) => state.userSession?.token,
  );
  const content = useSelector<any, any>((state) => state.content?.data);
  const info: MachineTranslationInfo | undefined =
    content?.['@components']?.machine_translation;

  if (!token || !info?.status || !BANNER_STATUSES.includes(info.status)) {
    return null;
  }

  const source = info.source_language
    ? languageName(info.source_language, intl.locale)
    : 'none';
  const edited = info.status === 'machine_edited';
  const isWorkingCopy = Boolean(content?.working_copy_of);
  // Set by the translate page when it leads to the page it has just created.
  const justCreated = Boolean(location.state?.machineTranslationCreated);

  const title: MessageKey = isWorkingCopy
    ? 'titleWorkingCopy'
    : edited
      ? 'titleEdited'
      : justCreated
        ? 'titleNew'
        : 'titleUnreviewed';
  const sentences: MessageKey[] = isWorkingCopy
    ? ['workingCopy']
    : [
        edited ? 'edited' : 'unreviewed',
        ...(content?.review_state === 'private'
          ? (['private'] as MessageKey[])
          : []),
        'reviewBeforePublishing',
      ];

  return (
    <div
      className={`ui container machine-translation-banner machine-translation-banner--${info.status}`}
      role="status"
    >
      <strong className="machine-translation-banner-title">
        {intl.formatMessage(messages[title])}
      </strong>
      <p>
        {sentences
          .map((key) => intl.formatMessage(messages[key], { source }))
          .join(' ')}
      </p>
    </div>
  );
};

export default MachineTranslationBanner;
