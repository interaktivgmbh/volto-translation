import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import PasswordWidget from '@plone/volto/components/manage/Widgets/PasswordWidget';
import {
  fetchApiKeyStatus,
  testTranslationConnection,
} from '../../../helpers/translateApi';
import type { ApiKeyStatus, ConnectionResult } from '../../../types';
import messages, { CODE_MESSAGES } from './messages';

interface ApiKeyWidgetProps {
  id: string;
  value?: string | null;
  formData?: { provider?: unknown; api_url?: unknown };
  [key: string]: unknown;
}

// what to set for the key to be safe in backups too, see the README
const SECRET_VARIABLE = 'INTERAKTIV_TRANSLATION_SECRET';

type TestState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'done'; result: ConnectionResult }
  | { kind: 'failed'; message: string };

// The API key as a password field — the backend hands out a placeholder for a
// stored key, never the key — and below it the test of the connection, with
// the settings as the form holds them, saved or not.
const ApiKeyWidget = (props: ApiKeyWidgetProps) => {
  const { id, value, formData } = props;
  const intl = useIntl();
  const [state, setState] = useState<TestState>({ kind: 'idle' });
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus | null>(null);

  // how the stored key is kept: asked on opening and after each test
  const loadKeyStatus = () =>
    fetchApiKeyStatus()
      .then(setKeyStatus)
      .catch(() => setKeyStatus(null));
  useEffect(() => {
    loadKeyStatus();
  }, []);

  // a result says nothing about a key or a service changed since
  useEffect(() => {
    setState({ kind: 'idle' });
  }, [value, formData?.provider, formData?.api_url]);

  const runTest = () => {
    setState({ kind: 'testing' });
    testTranslationConnection({
      provider: formData?.provider,
      api_key: value,
      api_url: formData?.api_url,
    })
      .then((result) => {
        setState({ kind: 'done', result });
        loadKeyStatus();
      })
      .catch((error: Error) =>
        setState({
          kind: 'failed',
          message: String(error?.message || error),
        }),
      );
  };

  const account = (result: ConnectionResult) => {
    const parts = [intl.formatMessage(messages.ok)];
    const provider = result.provider || '';
    if (result.plan) {
      parts.push(
        intl.formatMessage(
          result.plan === 'free' ? messages.planFree : messages.planPro,
          { provider },
        ),
      );
    } else if (provider) {
      parts.push(provider);
    }
    if (
      typeof result.character_count === 'number' &&
      typeof result.character_limit === 'number'
    ) {
      parts.push(
        intl.formatMessage(messages.usage, {
          count: intl.formatNumber(result.character_count),
          limit: intl.formatNumber(result.character_limit),
        }),
      );
    }

    return parts.join(' · ');
  };

  const problem = (result: ConnectionResult) => {
    const known = result.code && CODE_MESSAGES[result.code];

    return known
      ? intl.formatMessage(known)
      : intl.formatMessage(messages.failed, { message: result.message || '' });
  };

  const outcome =
    state.kind === 'done'
      ? state.result.ok
        ? 'ok'
        : 'problem'
      : state.kind === 'failed'
        ? 'problem'
        : '';

  const keyHint = (status: ApiKeyStatus | null) => {
    if (!status?.stored) {
      return null;
    }
    if (!status.readable) {
      return {
        kind: 'problem',
        text: intl.formatMessage(messages.keyUnreadable),
      };
    }
    if (status.encryption === 'environment') {
      return {
        kind: 'safe',
        text: `🔒 ${intl.formatMessage(messages.encryptedEnvironment)}`,
      };
    }
    if (status.encryption === 'site') {
      return {
        kind: 'safe',
        text: `🔒 ${intl.formatMessage(messages.encryptedSite, { variable: SECRET_VARIABLE })}`,
      };
    }

    return { kind: 'plain', text: intl.formatMessage(messages.notEncrypted) };
  };
  const hint = keyHint(keyStatus);

  return (
    <>
      <PasswordWidget {...props} />
      <div className="translation-connection-test">
        {hint && (
          <span className={`translation-key-status ${hint.kind}`}>
            {hint.text}
          </span>
        )}
        <Button
          type="button"
          basic
          className="translation-connection-button"
          loading={state.kind === 'testing'}
          disabled={state.kind === 'testing'}
          aria-describedby={`${id}-connection-result`}
          onClick={runTest}
        >
          {intl.formatMessage(messages.test)}
        </Button>
        {/* read out when the test answers */}
        <span
          id={`${id}-connection-result`}
          className={`translation-connection-result ${outcome}`}
          role="status"
          aria-live="polite"
        >
          {state.kind === 'testing' && intl.formatMessage(messages.testing)}
          {state.kind === 'done' &&
            (state.result.ok
              ? `✓ ${account(state.result)}`
              : `✗ ${problem(state.result)}`)}
          {state.kind === 'failed' &&
            `✗ ${intl.formatMessage(messages.notRun, { message: state.message })}`}
        </span>
      </div>
    </>
  );
};

export default ApiKeyWidget;
