import { copyConfig, copyCssLR, copyViews, copyStaticFiles } from './copy';
import { parallel, watch } from 'gulp';
import fancyLog from 'fancy-log';
import { listen, reload } from 'gulp-livereload';
import { sass } from './sass';
import { CONSTS } from './CONSTS';

const {
  AUDIO_SRC,
  FONT_SRC,
  IMG_SRC,
  LIVERELOAD_PORT,
  SASS_SRC,
  TEMPLATES_DEST,
  TEMPLATES_SRC,
  VIDEO_SRC,
  WP_CSS_SRC,
  WPCONFIG_SRC
} = CONSTS;

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
  const watchTemplates = watch(`${TEMPLATES_SRC}/**/*`, copyViews);

  [
    watchCopiedTemplates,
    watchPublic,

    watchSass,
    watchCss,
    watchConfig,
    watchTemplates
  ].forEach(w => {
    w.on('change', path => {
      fancyLog(`file ${path} was changed`);
    });
    const watchCopiedTemplates = watch(
        `${TEMPLATES_DEST}/**/*.php`,
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
    const watchTemplates = watch(`${TEMPLATES_SRC}/**/*`, copyViews);
    const watchJs = watch(
        [GULPFILE, `${GULP_TASKS}/**/*.js`, `${JS_SRC}/**/*.js`],
        parallel(eslint)
    );

    [
        watchCopiedTemplates,
        watchPublic,
        watchJs,
        watchSass,
        watchCss,
        watchConfig,
        watchTemplates
    ].forEach(w => {
        w.on('change', path => {
            fancyLog(`file ${path} was changed`);
        });
    });
    cb();
}

export { watchers as watch };
