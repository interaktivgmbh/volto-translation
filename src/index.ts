import MachineTranslationBannerPortal from './components/MachineTranslationBannerPortal';
import ApiKeyWidget from './components/controlpanel/ApiKey/ApiKeyWidget';
import GlossaryIdsWidget from './components/controlpanel/Glossary/GlossaryIdsWidget';
import MetadataMappingWidget from './components/controlpanel/MetadataMapping/MetadataMappingWidget';
import MetadataSelectionWidget from './components/controlpanel/MetadataSelection/MetadataSelectionWidget';
import TranslateMenuItem from './components/TranslateMenuItem';
import TranslationsMenu from './components/TranslationsMenu';
import TranslateView from './components/TranslateView';
import TranslationLinksView from './components/TranslationLinksView';
import type { VoltoConfig } from './types';
import './theme/translations.css';
import './theme/controlpanel.css';

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

  // Volto 16 shows the working copy actions under "Manage content…" in the
  // more menu only with this; Volto 17 and later whenever iterate offers them
  config.settings.hasWorkingCopySupport = true;

  // the control panel names these widgets for its metadata fields
  const widgets = config.widgets as { widget: Record<string, unknown> };
  widgets.widget.translation_metadata_mapping = MetadataMappingWidget;
  widgets.widget.translation_metadata_selection = MetadataSelectionWidget;
  widgets.widget.translation_api_key = ApiKeyWidget;
  widgets.widget.translation_glossary_ids = GlossaryIdsWidget;

  config.addonRoutes = [
    ...(config.addonRoutes || []),
    { path: '/**/translate', component: TranslateView, exact: true },
    {
      path: '/**/translation-links',
      component: TranslationLinksView,
      exact: true,
    },
  ];

  config.settings.nonContentRoutes = [
    ...(config.settings.nonContentRoutes || []),
    '/translate',
    '/translation-links',
  ];

  return config;
};

export default applyConfig;
