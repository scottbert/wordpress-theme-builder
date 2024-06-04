import { copyConfig, copyCssLR, copyViews, copyStaticFiles } from './copy';
import { parallel, watch } from 'gulp';
import fancyLog from 'fancy-log';
import { mochaTestLR } from './mochaTest';
import { listen, reload } from 'gulp-livereload';
import { sass } from './sass';
import { CONSTS } from './CONSTS';

const {
  AUDIO_SRC,
  FONT_SRC,
  IMG_SRC,
  JS_SRC,
  GULPFILE,
  LIVERELOAD_PORT,
  SASS_SRC,
  TEMPLATES_DEST,
  TEMPLATES_SRC,
  VIDEO_SRC,
  WP_CSS_SRC,
  WPCONFIG_SRC
} = CONSTS;

const TESTS = [`${JS_SRC}**/*.test.js`, `${GULPFILE}**/*.test.js`];

/**
 * Watches for changes in various directories and triggers corresponding tasks.
 * @param {Function} cb - The callback function to be called
 * @returns {void}
 */
function watchers(cb) {
  listen({
    port: LIVERELOAD_PORT
  });
  const watchCopiedTemplates = watch(
    `${TEMPLATES_DEST}/**/*.php`,
    // @ts-ignore
    parallel(reload)
  );
  const watchPublic = watch(
    [
      `${IMG_SRC}/**/*`,
      `${FONT_SRC}/**/*`,
      `${AUDIO_SRC}/**/*`,
      `${VIDEO_SRC}/**/*`
    ],
    parallel(copyStaticFiles)
  );
  const watchSass = watch(`${SASS_SRC}/**/*`, parallel(sass));
  const watchCss = watch(WP_CSS_SRC, parallel(copyCssLR));
  const watchConfig = watch(WPCONFIG_SRC, parallel(copyConfig));
  const watchTests = watch(TESTS, mochaTestLR);
  const watchTemplates = watch(`${TEMPLATES_SRC}/**/*`, copyViews);

  [
    { label: 'watchPublic', watcher: watchPublic },
    { label: 'watchSass', watcher: watchSass },
    { label: 'watchCss', watcher: watchCss },
    { label: 'watchCopiedTemplates', watcher: watchCopiedTemplates },
    { label: 'watchConfig', watcher: watchConfig },
    { label: 'watchTemplates', watcher: watchTemplates },
    { label: 'watchTests', watcher: watchTests },
    { label: 'watchPublic', watcher: watchPublic }
  ].forEach(w => {
    w.watcher.on('change', path => {
      fancyLog(`file ${path} was changed. Triggered by ${w.label} watcher.`);
    });
  });
  cb();
}

export { watchers as watch };
