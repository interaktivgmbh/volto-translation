// The shapes of the `@translate` REST endpoint of interaktiv.translation, and
// the slices of Volto state this add-on reads. Only the fields we consume.
export interface TranslationLanguage {
  code: string;
  title?: string;
  // offered for machine translation; the others by hand only
  machine?: boolean;
}

export interface TranslationLanguageEntry {
  url?: string | null;
  status?: string | null;
  working_copy?: { url?: string; status?: string } | null;
}

export interface TranslationInfo {
  configured: boolean;
  provider?: string | null;
  languages?: TranslationLanguage[];
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

// The metadata mapping of the control panel: per field one row per value,
// with one entry per language. A missing language keeps the source value.
export type MetadataMappingRow = Record<string, string>;
export type MetadataMapping = Record<string, MetadataMappingRow[]>;

export interface SiteData {
  'plone.default_language'?: string;
  'plone.available_languages'?: string[];
}

export interface TranslationState {
  content?: { data?: TranslationContent };
  site?: { data?: SiteData };
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
  registerSlotComponent: (options: {
    slot: string;
    name: string;
    component: unknown;
    predicates?: unknown[];
  }) => void;
  [key: string]: unknown;
}
