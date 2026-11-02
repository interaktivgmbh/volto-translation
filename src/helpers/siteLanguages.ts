import { useEffect, useState } from 'react';
import Api from '@plone/volto/helpers/Api/Api';
import type { SiteData } from '../types';

export interface SiteLanguages {
  // the site's default language, the source of every translation
  source: string | undefined;
  available: string[];
  // false while the languages are still on their way
  loaded: boolean;
}

// Volto 16 does not load GET @site (Volto 17 keeps it in state.site), so this
// variant asks for it itself, once per page load. The main branch reads the
// state instead; only this file differs.
let cache: SiteData | null = null;
let inflight: Promise<SiteData> | null = null;

function fetchSite(): Promise<SiteData> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  const request: Promise<SiteData> = new Api()
    .get('/@site')
    .then((data: SiteData) => {
      cache = data || {};
      inflight = null;
      return cache;
    })
    .catch((error: unknown) => {
      inflight = null;
      throw error;
    });
  inflight = request;
  return request;
}

function languagesOf(site: SiteData | null): SiteLanguages {
  const available = site?.['plone.available_languages'] || [];

  return {
    source: site?.['plone.default_language'] || available[0],
    available,
    loaded: site !== null,
  };
}

export function useSiteLanguages(): SiteLanguages {
  const [site, setSite] = useState<SiteData | null>(cache);

  useEffect(() => {
    let active = true;
    fetchSite()
      .then((data) => active && setSite(data))
      .catch(() => active && setSite({}));
    return () => {
      active = false;
    };
  }, []);

  return languagesOf(site);
}
