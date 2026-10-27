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

// GET @translation-fields: per content type its fields and how the
// translation treats them, as the backend suggests it.
export type FieldRole = 'always' | 'default' | 'impossible';
export type FieldMode = 'translate' | 'copy' | 'mapping';
export type FieldReason =
  | 'always'
  | 'primary'
  | 'field_name'
  | 'language_independent'
  | 'field_type';

export interface TranslationField {
  id: string;
  title: string;
  fieldset: string;
  kind: string;
  role: FieldRole;
  mode: FieldMode | null;
  reason: FieldReason;
  // the saved mapping has values for it; the control panel uses its own
  mapped: boolean;
}

// The control panel's choice: per content type the fields that go along. A
// type without an entry takes only what always goes along and what is mapped.
export type MetadataSelection = Record<string, string[]>;

export interface TranslationFieldsType {
  id: string;
  title: string;
  fields: TranslationField[];
}

// POST @translation-connection: does the translation service answer?
export interface ConnectionResult {
  ok: boolean;
  provider?: string;
  plan?: 'free' | 'pro' | null;
  character_count?: number | null;
  character_limit?: number | null;
  // why not, for the front end to say in its own words
  code?: string;
  message?: string;
}

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
