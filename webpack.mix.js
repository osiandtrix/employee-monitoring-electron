const path = require('path');
const mix = require('laravel-mix');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

mix.setPublicPath('./build');
mix.disableNotifications();
mix.webpackConfig({ target: 'electron-renderer', devtool: 'source-map' });

/* Build JS */
if (mix.inProduction)
  mix.js('./app/renderer/js/app.js', 'app.js').vue().sourceMaps();
else
  mix.js('./app/renderer/js/app.js', 'app.js').vue();

/* Build SASS */
mix
  .sass('./app/renderer/scss/app.scss', 'app.css')
  .options({ processCssUrls: false });

/* Copy static assets & templates */
mix
  .copy('./app/renderer/app.html', path.resolve(__dirname, 'build', 'app.html'))
  .copy('./app/renderer/fonts/**/*', path.resolve(__dirname, 'build', 'fonts'))
  .copy('./app/renderer/screen-notie.html', path.resolve(__dirname, 'build', 'screen-notie.html'))
  .copy(
    './node_modules/element-ui/packages/theme-chalk/lib/fonts/element-icons.woff',
    path.resolve(__dirname, 'build', 'fonts', 'element-icons.woff'),
  );

/* If MAKE_RELEASE flag is set, build renderer in production mode, then submit all the code to Sentry */
if (mix.inProduction && process.env.MAKE_RELEASE) {

  // eslint-disable-next-line global-require
  const packageManifest = require('./package.json');

  // eslint-disable-next-line global-require
  const sentryConfiguration = require('./.sentry.json');

  mix.webpackConfig({
    plugins: [
      new SentryWebpackPlugin({
        include: 'build',
        urlPrefix: 'build/',
        ignore: ['mix-manifest.json', 'app.css.map'],
        configFile: '.sentry.renderer',
        release: `${packageManifest.name}@${packageManifest.version}`,
        setCommits: { auto: true },
        url: sentryConfiguration.url,
        org: sentryConfiguration.org,
        project: sentryConfiguration.frontend.project,
      }),
      new SentryWebpackPlugin({
        include: 'app/src',
        urlPrefix: 'app/src/',
        configFile: '.sentry.main',
        release: `${packageManifest.name}@${packageManifest.version}`,
        setCommits: { auto: true },
        url: sentryConfiguration.url,
        org: sentryConfiguration.org,
        project: sentryConfiguration.backend.project,
      }),
    ],
  });

}
