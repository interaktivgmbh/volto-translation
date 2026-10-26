import MachineTranslationBanner from './components/MachineTranslationBanner';
import MetadataMappingWidget from './components/controlpanel/MetadataMapping/MetadataMappingWidget';
import MetadataSelectionWidget from './components/controlpanel/MetadataSelection/MetadataSelectionWidget';
import TranslateMenuItem from './components/TranslateMenuItem';
import TranslationsMenu from './components/TranslationsMenu';
import TranslateView from './components/TranslateView';
import type { VoltoConfig } from './types';
import './theme/translations.css';
import './theme/controlpanel.css';

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

  // the control panel names these widgets for its metadata fields
  const widgets = config.widgets as { widget: Record<string, unknown> };
  widgets.widget.translation_metadata_mapping = MetadataMappingWidget;
  widgets.widget.translation_metadata_selection = MetadataSelectionWidget;

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
