# @interaktivgmbh/volto-translation

Volto user interface for
[`interaktiv.translation`](https://github.com/interaktivgmbh/interaktiv.translation):
machine translation of Plone 6 content with DeepL, from the toolbar.

## Features

- A **Translations** menu in the toolbar, next to edit, contents and add. It
  offers one entry per target language, Plone's _Manage translations_ and,
  where `plone.app.iterate` is active, creating, viewing, checking in and
  discarding a working copy. The menu shows only for editors and only when a
  translation provider is configured.
- A translate page (`/<path>/translate`): pick the target language, see whether
  a translation or a working copy already exists and decide whether to
  overwrite it. A progress bar runs while the backend translates.
- A **report** after saving: where the translation went (new translation,
  replaced translation, working copy or the page itself), which fields were
  translated and which were carried over unchanged, how links were pointed at
  translated pages and how metadata values were mapped.
- A **banner** above machine translated content that has not been reviewed
  yet, or is still being edited.
- _Manage translations_ shows the review state of each language with a
  coloured button for machine translating into it, plus a column with open
  working copies.

What gets translated, and how, is configured in the backend's control panel
**Site Setup → Translation**.

## Requirements

- Volto 18
- The backend add-on
  [`interaktiv.translation`](https://github.com/interaktivgmbh/interaktiv.translation),
  installed and configured on the Plone site

## Installation

The package is not published on npm yet. Add it to your Volto project from
GitHub, for example with
[mrs-developer](https://github.com/collective/mrs-developer) in
`mrs.developer.json`:

```json
{
  "volto-translation": {
    "output": "./packages/",
    "package": "@interaktivgmbh/volto-translation",
    "url": "https://github.com/interaktivgmbh/volto-translation.git",
    "branch": "main"
  }
}
```

Add it as a workspace dependency of your project and enable it in
`volto.config.js`:

```js
const addons = ['@interaktivgmbh/volto-translation'];
```

## Development

The add-on is written in TypeScript; the payloads of the `@translate` endpoint
are typed in `src/types.ts`. Within a Volto project:

```bash
pnpm --filter @interaktivgmbh/volto-translation typecheck
pnpm --filter @interaktivgmbh/volto-translation i18n
```

## License

The project is licensed under the MIT license.
