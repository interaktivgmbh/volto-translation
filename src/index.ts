import MachineTranslationBanner from './components/MachineTranslationBanner';
import TranslateMenuItem from './components/TranslateMenuItem';
import TranslationsMenu from './components/TranslationsMenu';
import TranslateView from './components/TranslateView';
import type { VoltoConfig } from './types';
import './theme/translations.css';

const applyConfig = (config: VoltoConfig): VoltoConfig => {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    { match: '/', component: TranslateMenuItem },
  ];

  config.registerSlotComponent({
    slot: 'aboveContent',
    name: 'machineTranslationBanner',
    component: MachineTranslationBanner,
  });

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
