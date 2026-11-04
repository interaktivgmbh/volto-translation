import { useSelector } from 'react-redux';
import type { TranslationState } from '../types';

export interface SiteLanguages {
  // the site's default language, the source of every translation
  source: string | undefined;
  available: string[];
  // false while the languages are still on their way
  loaded: boolean;
}

// The languages of the site, as Volto keeps them from GET @site. The Volto 16
// branch has its own variant of this file: Volto 16 does not load @site.
export function useSiteLanguages(): SiteLanguages {
  const site = useSelector((state: TranslationState) => state.site?.data) || {};
  const available = site['plone.available_languages'] || [];

  return {
    source: site['plone.default_language'] || available[0],
    available,
    // Volto has the site in its state from the start
    loaded: true,
  };
}
