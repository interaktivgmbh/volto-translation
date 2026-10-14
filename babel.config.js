module.exports = function (api) {
  api.cache(true);
  const presets = ['@plone/razzle'];
  const plugins = [
    [
      'react-intl',
      {
        messagesDir: './build/messages/',
      },
    ],
  ];

  return {
    plugins,
    presets,
  };
};
