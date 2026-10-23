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

## 1.0.0-alpha.1 (2026-10-15)

- Initial public release.
