// The shapes of the `@translate` REST endpoint of interaktiv.translation, and
// the slices of Volto state this add-on reads. Only the fields we consume.
export interface TargetLanguage {
  code: string;
  title?: string;
}

export interface TranslationLanguageEntry {
  url?: string | null;
  status?: string | null;
  working_copy?: { url?: string; status?: string } | null;
}

export interface TranslationInfo {
  configured: boolean;
  provider?: string | null;
  target_languages?: TargetLanguage[];
  working_copies_enabled?: boolean;
  translations?: Record<string, TranslationLanguageEntry>;
  is_working_copy?: boolean;
  baseline_url?: string | null;
  translatable?: boolean;
}

export interface TranslationLinkReport {
  text?: string;
  before?: string;
  after?: string | null;
}

export interface TranslationMetadataReport {
  field?: string;
  before?: string;
  after?: string | null;
}

export interface TranslationReport {
  source_language?: string | null;
  target_language: string;
  fields: string[];
  stored_as?: 'translation' | 'working_copy' | 'in_place' | null;
  created?: boolean;
  title?: string;
  '@id'?: string;
  links?: TranslationLinkReport[];
  metadata?: TranslationMetadataReport[];
  copied?: string[];
}

export interface TranslationResult {
  target_language: string;
  fields?: Record<string, unknown>;
  saved?: boolean;
  '@id'?: string;
  report?: TranslationReport;
}

export interface TranslationContent {
  '@id': string;
  '@type': string;
  title?: string;
  language?: string | { token?: string };
  '@components'?: {
    translations?: { items?: Array<{ language?: string; '@id'?: string }> };
  };
  working_copy?: { '@id'?: string };
  working_copy_of?: { '@id'?: string };
}

export interface TranslationState {
  content?: { data?: TranslationContent };
  userSession?: { token?: string };
  actions?: { actions?: { object_buttons?: Array<{ id?: string }> } };
}

export interface ApiError {
  message?: string;
  response?: { body?: { message?: string; type?: string } };
}

export interface VoltoConfig {
  settings: {
    apiExpanders?: unknown[];
    appExtras?: unknown[];
    nonContentRoutes?: unknown[];
    [key: string]: unknown;
  };
  addonRoutes?: unknown[];
  [key: string]: unknown;
}
