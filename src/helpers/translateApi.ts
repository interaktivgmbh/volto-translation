import Api from '@plone/volto/helpers/Api/Api';
import type {
  ApiKeyStatus,
  ConnectionResult,
  GlossariesResult,
  TranslationFieldsType,
  TranslationInfo,
  TranslationResult,
} from '../types';

// One Api instance for the add-on; it picks the auth token off the cookie itself.
let api: Api | null = null;

function getApi(): Api {
  if (!api) api = new Api();
  return api;
}

// GET @translate on the site root: is a provider configured, and into which
// languages? Cached per page load — the menu item asks on every content view.
let cache: TranslationInfo | null = null;
let inflight: Promise<TranslationInfo> | null = null;

export function fetchTranslationInfo(): Promise<TranslationInfo> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  const request: Promise<TranslationInfo> = getApi()
    .get('/@translate')
    .then((data: TranslationInfo) => {
      cache = data || { configured: false };
      inflight = null;
      return cache;
    })
    .catch((error: unknown) => {
      inflight = null;
      throw error;
    });
  inflight = request;
  return request;
}

// GET @translate on one object — same shape as the root call, plus which
// languages already hold a translation of it. Uncached: the answer changes
// with every translation stored.
export function fetchTranslationInfoFor(
  path: string,
): Promise<TranslationInfo> {
  return getApi().get(`${path}/@translate`);
}

// POST @translate on one object. `save` stores the result (language sibling on a
// multilingual site, the object itself otherwise) — the backend decides where.
// Without `overwrite` the backend refuses to replace an existing translation.
export function translateContent(
  path: string,
  targetLanguage: string,
  save: boolean = true,
  overwrite: boolean = false,
): Promise<TranslationResult> {
  return getApi().post(`${path}/@translate`, {
    data: { target_language: targetLanguage, save, overwrite },
  });
}

// GET @translation-fields on the site root: the content types an editor adds,
// each with its fields and how the translation treats them. For the control
// panel only, so uncached.
export function fetchTranslationFields(): Promise<TranslationFieldsType[]> {
  return getApi()
    .get('/@translation-fields')
    .then((data: { types?: TranslationFieldsType[] }) => data?.types || []);
}

// POST @translation-connection on the site root: asks the translation service
// with the settings as the control panel's form holds them. The placeholder of
// the API key, or no key, means the stored one.
export function testTranslationConnection(form: {
  provider?: unknown;
  api_key?: unknown;
  api_url?: unknown;
}): Promise<ConnectionResult> {
  return getApi().post('/@translation-connection', { data: form });
}

// POST @translation-glossaries on the site root: the glossaries of the
// account, with the settings as the form holds them, saved or not.
export function fetchGlossaries(form: {
  provider?: unknown;
  api_key?: unknown;
  api_url?: unknown;
}): Promise<GlossariesResult> {
  return getApi().post('/@translation-glossaries', { data: form });
}

// GET @translation-connection on the site root: how the stored API key is
// kept — encrypted, with which secret, readable — never the key.
export function fetchApiKeyStatus(): Promise<ApiKeyStatus> {
  return getApi()
    .get('/@translation-connection')
    .then((data: { api_key: ApiKeyStatus }) => data.api_key);
}

// Test-only / hot-reload helper.
export function _resetTranslationInfoCache(): void {
  cache = null;
  inflight = null;
}
