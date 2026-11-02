import { defineMessages } from 'react-intl';

const messages = defineMessages({
  test: {
    id: 'volto-translation-connection-test',
    defaultMessage: 'Test connection',
  },
  testing: {
    id: 'volto-translation-connection-testing',
    defaultMessage: 'Testing the connection …',
  },
  ok: {
    id: 'volto-translation-connection-ok',
    defaultMessage: 'Connected',
  },
  planFree: {
    id: 'volto-translation-connection-plan-free',
    defaultMessage: '{provider} API Free',
  },
  planPro: {
    id: 'volto-translation-connection-plan-pro',
    defaultMessage: '{provider} API Pro',
  },
  usage: {
    id: 'volto-translation-connection-usage',
    defaultMessage: '{count} of {limit} characters this month',
  },
  notConfigured: {
    id: 'volto-translation-connection-not-configured',
    defaultMessage: 'There is no API key.',
  },
  keyRefused: {
    id: 'volto-translation-connection-key-refused',
    defaultMessage: 'The service refused the API key.',
  },
  quotaExceeded: {
    id: 'volto-translation-connection-quota-exceeded',
    defaultMessage: 'The quota of this key is used up.',
  },
  rateLimited: {
    id: 'volto-translation-connection-rate-limited',
    defaultMessage: 'The service is busy. Please try again later.',
  },
  unreachable: {
    id: 'volto-translation-connection-unreachable',
    defaultMessage: 'The service cannot be reached.',
  },
  failed: {
    id: 'volto-translation-connection-failed',
    defaultMessage: 'The test failed: {message}',
  },
  keyUnreadable: {
    id: 'volto-translation-connection-key-unreadable',
    defaultMessage:
      'The stored key cannot be decrypted. Please enter it again.',
  },
  encryptedEnvironment: {
    id: 'volto-translation-connection-encrypted-environment',
    defaultMessage: 'Stored encrypted (secret from the server environment).',
  },
  encryptedSite: {
    id: 'volto-translation-connection-encrypted-site',
    defaultMessage:
      'Stored encrypted (secret in the database). Set {variable} to protect it in backups too.',
  },
  notEncrypted: {
    id: 'volto-translation-connection-not-encrypted',
    defaultMessage:
      'Stored unencrypted yet; it is encrypted when the settings are saved next.',
  },
  notRun: {
    id: 'volto-translation-connection-not-run',
    defaultMessage: 'The test could not be run: {message}',
  },
});

// the codes of the backend, in the editor's language
export const CODE_MESSAGES: Record<
  string,
  (typeof messages)[keyof typeof messages]
> = {
  not_configured: messages.notConfigured,
  key_refused: messages.keyRefused,
  quota_exceeded: messages.quotaExceeded,
  rate_limited: messages.rateLimited,
  unreachable: messages.unreachable,
  key_unreadable: messages.keyUnreadable,
};

export default messages;
