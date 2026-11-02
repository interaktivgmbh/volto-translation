import { defineMessages } from 'react-intl';

const messages = defineMessages({
  noGlossary: {
    id: 'volto-translation-glossary-none',
    defaultMessage: 'without glossary',
  },
  noDirections: {
    id: 'volto-translation-glossary-no-directions',
    defaultMessage: 'There is no target language to translate into.',
  },
  list: {
    id: 'volto-translation-glossary-list',
    defaultMessage: 'Show available glossaries',
  },
  loading: {
    id: 'volto-translation-glossary-loading',
    defaultMessage: 'Loading the glossaries …',
  },
  count: {
    id: 'volto-translation-glossary-count',
    defaultMessage:
      '{count, plural, =0 {The account has no glossaries.} one {The account has one glossary.} other {The account has # glossaries.}}',
  },
  notListed: {
    id: 'volto-translation-glossary-not-listed',
    defaultMessage: 'The glossaries could not be loaded: {message}',
  },
  columnName: {
    id: 'volto-translation-glossary-column-name',
    defaultMessage: 'Name',
  },
  columnDirection: {
    id: 'volto-translation-glossary-column-direction',
    defaultMessage: 'Direction',
  },
  columnEntries: {
    id: 'volto-translation-glossary-column-entries',
    defaultMessage: 'Entries',
  },
  columnId: {
    id: 'volto-translation-glossary-column-id',
    defaultMessage: 'ID',
  },
  columnAction: {
    id: 'volto-translation-glossary-column-action',
    defaultMessage: 'Action',
  },
  take: {
    id: 'volto-translation-glossary-take',
    defaultMessage: 'Use for {language}',
  },
  taken: {
    id: 'volto-translation-glossary-taken',
    defaultMessage: '✓ Used for {language}',
  },
  unknown: {
    id: 'volto-translation-glossary-unknown',
    defaultMessage: 'Not found in the account',
  },
  otherDirection: {
    id: 'volto-translation-glossary-other-direction',
    defaultMessage: '“{name}” is for {direction}',
  },
});

export default messages;
