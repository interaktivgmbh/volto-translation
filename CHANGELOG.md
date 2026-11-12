# Changelog

## Unreleased

- Manage translations shows the status `machine_without_review` for content
  without a workflow.
- The translate page links an existing working copy instead of offering to
  overwrite it.
- The Translations menu has one entry per language; the translate page asks
  whether to translate by hand or by machine. Needs `languages` from
  `GET @translate`.
- The report shows links and metadata as separate sections with a summary.
- The banner on machine translated content has a title and a text per
  situation and names the source language. Needs `source_language` from the
  backend.
- Fix: the German title of Manage translations shows the page title again.
- Fix: prop type warning for `disabled` in Manage translations.
- Fix: the working copy hint and column of the translate page and Manage
  translations no longer share a message id.
- Disabled machine translate buttons in Manage translations show the reason
  on hover.
- Added widget for editing metadata-mapping in controlpanel providing xlsx
  import/export based on read-excel-file/write-excel-file
- Added widget for the glossary IDs per direction in the control panel; it
  lists the glossaries of the account on demand (`POST @translation-glossaries`)
  to take an ID over, and tells entered IDs that are not in the account or are
  for another direction.
- Fix: the metadata mapping shows its hint for a site without languages; it
  was hidden inside the form.
- Volto 16: the control panel widgets load the site languages from
  `GET @site` themselves; Volto 16 does not keep them in its state.
- The field selection explains references: taken over, pointing at the
  translation of their target. Needs `reason: reference` from the backend.
- The field selection explains link fields (`reason: link`), as the address
  of a link.
- A page with an open working copy is not offered for machine translation:
  the Translations menu and the translate page say to check it in or discard
  it first. Needs `working_copy_url` from `GET @translate`.
- Content without a language of its own is not offered for translation, by
  machine or by hand: the Translations menu, the translate page and Manage
  translations say why instead, in the words of the backend. Needs
  `manual_translatable` and `refusal` from `GET @translate`.
- The metadata mapping adds a field by choosing it from the fields of the
  site's content types that may be mapped, instead of typing its id. The
  field tabs show title and id; a mapped field no content type has is marked
  so. Needs `mappable` from `GET @translation-fields`.
- The working copy actions are back under "Manage content…" in the more menu,
  as Volto has them, and no longer in the Translations menu. Fix: the rule
  hiding Volto's own "Manage translations" there hid the whole list, the
  working copy actions with it; now only that entry goes. Volto 16: the
  add-on sets `hasWorkingCopySupport`, without which Volto 16 does not show
  them.
- New page "Link status" (`/translation-links` on a content, an entry in the
  Translations menu): the links of the content as it is now, grouped by how
  they stand to its language: a translation is available, target not found,
  without translation, external, in the language of the content, without a
  language of its own; images and files in a section of their own, as in the
  report. Read-only. Needs `GET @translation-links`.
- The report lists images and files in a section of their own instead of
  among the links: they are usually not translated. Needs `kind` in the link
  report of `POST @translate`; without it everything stays under the links.
- Fix: the translate page and the link status page no longer fail to
  hydrate when loaded directly; the toolbar is rendered once the page is
  mounted (`ToolbarPortal`). Fix: no prop type warning for the children of
  `Container` on these pages and in Manage translations.

## 1.0.0-alpha.1 (2026-10-15)

- Initial public release.
