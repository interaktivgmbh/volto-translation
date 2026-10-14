import MachineTranslationBannerPortal from './components/MachineTranslationBannerPortal';
import TranslateMenuItem from './components/TranslateMenuItem';
import TranslationsMenu from './components/TranslationsMenu';
import TranslateView from './components/TranslateView';
import type { VoltoConfig } from './types';
import './theme/translations.css';

const applyConfig = (config: VoltoConfig): VoltoConfig => {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    { match: '/', component: TranslateMenuItem },
    // The "machine translated, not reviewed yet" bar, directly over the page's
    // content, where an editor reads before publishing. Volto 16 has no
    // aboveContent slot; the component portals itself there.
    { match: '/', component: MachineTranslationBannerPortal },
  ];

  config.settings.apiExpanders = [
    ...(config.settings.apiExpanders || []),
    { match: '', GET_CONTENT: ['machine_translation'] },
  ];

  config.settings.additionalToolbarComponents = {
    ...(config.settings.additionalToolbarComponents || {}),
    translations: { component: TranslationsMenu, wrapper: null },
  };

  config.addonRoutes = [
    ...(config.addonRoutes || []),
    { path: '/**/translate', component: TranslateView, exact: true },
  ];

  config.settings.nonContentRoutes = [
    ...(config.settings.nonContentRoutes || []),
    '/translate',
  ];

  return config;
};

export default applyConfig;
