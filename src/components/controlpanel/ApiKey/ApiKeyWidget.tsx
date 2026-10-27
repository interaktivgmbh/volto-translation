import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import PasswordWidget from '@plone/volto/components/manage/Widgets/PasswordWidget';
import { testTranslationConnection } from '../../../helpers/translateApi';
import type { ConnectionResult } from '../../../types';
import messages, { CODE_MESSAGES } from './messages';

interface ApiKeyWidgetProps {
  id: string;
  value?: string | null;
  formData?: { provider?: unknown; api_url?: unknown };
  [key: string]: unknown;
}

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
      .then((result) => setState({ kind: 'done', result }))
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

  return (
    <>
      <PasswordWidget {...props} />
      <div className="translation-connection-test">
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
