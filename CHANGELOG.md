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
- The report shows links and metadata as sections of their own, each with a
  title and an introduction that sums it up ("6 of 8 links now point to
  English"); a link without a translation says that it stays as it was.
- The banner above machine translated content has a title and a longer text,
  naming the source language: one variant for a page just created, one for a
  page not reviewed yet, one for a page being revised and one for a working
  copy. It says that a private page is not visible to visitors, and how the
  review is completed. Needs `source_language` from the `machine_translation`
  expander of interaktiv.translation.

## 1.0.0-alpha.1 (2026-10-15)

- Initial public release.
