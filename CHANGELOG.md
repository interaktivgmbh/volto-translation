# Changelog

## Unreleased

- Manage translations shows the status `machine_without_review` of content
  without a workflow: "machine translated, no review needed".
- The translate page no longer offers to overwrite an existing working copy.
  It links the working copy instead; translating again is possible once it is
  checked in or discarded.
- The Translations menu has one entry per language. The translate page asks
  how a missing translation is created: Plone's standard translation form or
  automatically. Needs the `languages` answer of `GET @translate` from
  interaktiv.translation.
- The working copy hint of the translate page no longer shares its message id
  with the "Working copy" column of Manage translations, so each shows its own
  text.

## 1.0.0-alpha.1 (2026-10-15)

- Initial public release.
