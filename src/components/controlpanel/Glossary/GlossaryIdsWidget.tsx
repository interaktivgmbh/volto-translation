import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Input } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import { fetchGlossaries } from '../../../helpers/translateApi';
import { languageName } from '../../../helpers/languages';
import { languageCodes } from '../../../helpers/metadataMapping';
import type {
  Glossary,
  GlossariesResult,
  TranslationState,
} from '../../../types';
import type { InputData } from '../MetadataMapping/utils';
import { CODE_MESSAGES } from '../ApiKey/messages';
import messages from './messages';

type GlossaryIds = Record<string, string>;

interface GlossaryIdsWidgetProps {
  id: string;
  value?: unknown;
  onChange: (id: string, value: GlossaryIds) => void;
  formData?: {
    target_languages?: unknown;
    provider?: unknown;
    api_key?: unknown;
    api_url?: unknown;
  };
  [key: string]: unknown;
}

type ListState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; result: GlossariesResult }
  | { kind: 'failed'; message: string };

function normalisedGlossaries(value: unknown): GlossaryIds {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as GlossaryIds)
    : {};
}

// DeepL keeps glossaries by base language: "en" serves "en-gb" and "en-us"
function baseCode(code: string): string {
  return code.toLowerCase().split('-')[0];
}

// One DeepL glossary ID per direction, from the site's default language to each
// offered target language, as the form holds them. IDs of languages no longer
// offered stay stored, untouched. On demand, the glossaries of the account are
// listed, with the settings of the form, to take an ID over from.
const GlossaryIdsWidget = (props: GlossaryIdsWidgetProps) => {
  const { id, value, onChange, formData } = props;
  const intl = useIntl();
  const site = useSelector((state: TranslationState) => state.site?.data) || {};
  const [list, setList] = useState<ListState>({ kind: 'idle' });

  const siteLanguages = site['plone.available_languages'] || [];
  const source = site['plone.default_language'] || siteLanguages[0];
  const offered = languageCodes(formData?.target_languages);
  // an empty choice offers every site language
  const targets = (offered.length ? offered : siteLanguages).filter(
    (code) => code !== source,
  );
  const glossaries = normalisedGlossaries(value);
  const name = (code: string) => languageName(code, intl.locale);

  // a list says nothing about a key or a service changed since
  useEffect(() => {
    setList({ kind: 'idle' });
  }, [formData?.provider, formData?.api_key, formData?.api_url]);

  const change = (target: string, text: string) => {
    const next = { ...glossaries };
    if (text.trim()) {
      next[target] = text.trim();
    } else {
      delete next[target];
    }
    onChange(id, next);
  };

  const loadList = () => {
    setList({ kind: 'loading' });
    fetchGlossaries({
      provider: formData?.provider,
      api_key: formData?.api_key,
      api_url: formData?.api_url,
    })
      .then((result) => setList({ kind: 'done', result }))
      .catch((error: Error) =>
        setList({ kind: 'failed', message: String(error?.message || error) }),
      );
  };

  const listed: Glossary[] | null =
    list.kind === 'done' && list.result.ok
      ? list.result.glossaries || []
      : null;

  // the offered directions a glossary serves
  const fitting = (glossary: Glossary) =>
    source && baseCode(glossary.source) === baseCode(source)
      ? targets.filter((target) => baseCode(target) === glossary.target)
      : [];

  // what the list tells of an entered ID
  const rowHint = (target: string) => {
    const entered = glossaries[target];
    if (!listed || !entered) {
      return null;
    }
    const glossary = listed.find((entry) => entry.id === entered);
    if (!glossary) {
      return { kind: 'problem', text: intl.formatMessage(messages.unknown) };
    }
    if (!fitting(glossary).includes(target)) {
      return {
        kind: 'problem',
        text: intl.formatMessage(messages.otherDirection, {
          name: glossary.name,
          direction: `${name(glossary.source)} → ${name(glossary.target)}`,
        }),
      };
    }

    return { kind: 'ok', text: `✓ ${glossary.name}` };
  };

  const status = () => {
    if (list.kind === 'loading') {
      return intl.formatMessage(messages.loading);
    }
    if (list.kind === 'failed') {
      return `✗ ${intl.formatMessage(messages.notListed, { message: list.message })}`;
    }
    if (list.kind === 'done' && !list.result.ok) {
      const known = list.result.code && CODE_MESSAGES[list.result.code];
      return `✗ ${
        known
          ? intl.formatMessage(known)
          : intl.formatMessage(messages.notListed, {
              message: list.result.message || '',
            })
      }`;
    }
    if (listed) {
      return intl.formatMessage(messages.count, { count: listed.length });
    }

    return '';
  };

  const listId = `${id}-glossary-list`;

  return (
    <FormFieldWrapper {...props} className="translation-glossary-ids">
      {targets.length === 0 && (
        <p>{intl.formatMessage(messages.noDirections)}</p>
      )}
      {source &&
        targets.map((target) => {
          const inputId = `${id}-${target}`;
          const hint = rowHint(target);

          return (
            <div key={target} className="translation-glossary-row">
              <label htmlFor={inputId}>
                {name(source)} → {name(target)}
              </label>
              <Input
                id={inputId}
                value={glossaries[target] || ''}
                placeholder={intl.formatMessage(messages.noGlossary)}
                aria-describedby={hint ? `${inputId}-hint` : undefined}
                onChange={(_event: React.SyntheticEvent, data: InputData) =>
                  change(target, String(data.value))
                }
              />
              {hint && (
                <span
                  id={`${inputId}-hint`}
                  className={`translation-glossary-hint ${hint.kind}`}
                >
                  {hint.text}
                </span>
              )}
            </div>
          );
        })}

      <div className="translation-glossary-list">
        <Button
          type="button"
          basic
          className="translation-connection-button"
          loading={list.kind === 'loading'}
          disabled={list.kind === 'loading'}
          aria-describedby={`${listId}-status`}
          onClick={loadList}
        >
          {intl.formatMessage(messages.list)}
        </Button>
        {/* read out when the list arrives */}
        <span
          id={`${listId}-status`}
          className={`translation-connection-result ${
            list.kind === 'failed' || (list.kind === 'done' && !list.result.ok)
              ? 'problem'
              : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {status()}
        </span>
        {listed && listed.length > 0 && (
          <table id={listId} className="ui very basic compact table">
            <thead>
              <tr>
                <th scope="col">{intl.formatMessage(messages.columnName)}</th>
                <th scope="col">
                  {intl.formatMessage(messages.columnDirection)}
                </th>
                <th scope="col">
                  {intl.formatMessage(messages.columnEntries)}
                </th>
                <th scope="col">{intl.formatMessage(messages.columnId)}</th>
                <th scope="col">
                  <span className="metadata-mapping-sr-only">
                    {intl.formatMessage(messages.columnAction)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listed.map((glossary) => (
                <tr key={glossary.id}>
                  <td>{glossary.name}</td>
                  <td>
                    {name(glossary.source)} → {name(glossary.target)}
                  </td>
                  <td>
                    {typeof glossary.entries === 'number'
                      ? intl.formatNumber(glossary.entries)
                      : ''}
                  </td>
                  <td>
                    <code>{glossary.id}</code>
                  </td>
                  <td>
                    {fitting(glossary).map((target) =>
                      glossaries[target] === glossary.id ? (
                        <span
                          key={target}
                          className="translation-glossary-hint ok"
                        >
                          {intl.formatMessage(messages.taken, {
                            language: name(target),
                          })}
                        </span>
                      ) : (
                        <Button
                          key={target}
                          type="button"
                          basic
                          size="small"
                          className="translation-connection-button"
                          onClick={() => change(target, glossary.id)}
                        >
                          {intl.formatMessage(messages.take, {
                            language: name(target),
                          })}
                        </Button>
                      ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default GlossaryIdsWidget;
