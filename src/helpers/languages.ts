// The name of a language in the editor's own language: "Englisch" for "en"
// in a German interface.
export function languageName(
  code: string,
  locale: string,
  fallback?: string,
): string {
  try {
    const names = new (Intl as any).DisplayNames([locale], {
      type: 'language',
    });

    return names.of(code) || fallback || code;
  } catch (error) {
    return fallback || code;
  }
}
