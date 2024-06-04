import { dest } from 'gulp';
import browserify from 'browserify';
import fancyLog from 'fancy-log';
import { sync } from 'glob';
import gulpIf from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import gulpReplace from 'gulp-replace';
import merge2 from 'merge2';
import vinylBuffer from 'vinyl-buffer';
import vinylSourceStream from 'vinyl-source-stream';
import watchify from 'watchify';
import gulpTerser from 'gulp-terser';
import { minify } from 'terser';

import { notify } from './notify';
import { CONSTS } from './CONSTS';

const {
  NODE_ENV,
  JS_SRC,
  NAME,
  VERSION,
  JS_OUTPUT,
  API,
  BREAKPOINTS,
  JS_DEST,
  LIVERELOAD_PORT
} = CONSTS;

const isDev = NODE_ENV !== 'production';

const entries = sync(`${JS_SRC}*.js`);

const plugins = [
  [
    'module-resolver',
    {
      root: ['./src/js'],
      alias: {
        '~': './src/js/modules'
      },
      extentions: ['.js', '.jsx']
    }
  ]
];

/**
 * @param {string} entry entry file string from glob.
 * @returns {NodeJS.ReadWriteStream} stream
 */
function addToBrowserify(entry) {
  const options = {
    entries: [entry],
    cache: {},
    packageCache: {},
    paths: ['./src/node_modules', 'node_modules'],
    debug: false
  };

  if (isDev) {
    options.debug = true;
  }

  const name = entry
    .replace('$name', NAME)
    .replace('$version', VERSION)
    .replace(/.*\/([\w$\-.]+).js/, '$1');

  const b = browserify(options);

  if (isDev) {
    b.transform('babelify', {
      presets: [
        '@babel/preset-env',
        [
          '@babel/preset-react',
          {
            development: true
          }
        ]
      ],
      plugins,
      sourceMaps: true
    });
    b.plugin(watchify, { delay: 10 });
  } else {
    b.transform('babelify', {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins
    });
    b.transform('envify');
  }

  /**
   * Executes a logic to determine if a line return is needed.
   * @returns {boolean} Returns true if a line return is needed, false otherwise.
   */
  function doLR() {
    if (process.env.OVERRIDE_LR === 'true') {
      return false;
    }

    process.env.OVERRIDE_LR = 'true';

    setTimeout(() => {
      process.env.OVERRIDE_LR = 'false';
    }, 500);

    return isDev;
  }

  /**
   * Bundles the JavaScript code using Browserify.
   * @returns {NodeJS.ReadWriteStream} The bundled JavaScript code stream.
   */
  function bundle() {
    return (
      b
        .bundle()
        .pipe(vinylSourceStream(name + JS_OUTPUT))
        .pipe(vinylBuffer())
        .pipe(gulpReplace('$$API$$', API || ''))
        .pipe(gulpReplace('$$name$$', NAME))
        .pipe(gulpReplace('$$version$$', VERSION))
        .pipe(gulpReplace('$$oldMobile$$', `${BREAKPOINTS.OLD_MOBILE}`))
        .pipe(gulpReplace('$$mobile$$', `${BREAKPOINTS.MOBILE}`))
        .pipe(gulpReplace('$$smalltablet$$', `${BREAKPOINTS.SMALL_TABLET}`))
        .pipe(gulpReplace('$$tablet$$', `${BREAKPOINTS.TABLET}`))
        .pipe(gulpReplace('$$smalldesktop$$', `${BREAKPOINTS.SMALL_DESKTOP}`))
        // @ts-ignore
        .pipe(gulpIf(!isDev, gulpTerser({}, minify)))
        .pipe(dest(JS_DEST))
        .pipe(
          gulpIf(
            doLR(),
            gulpLivereload({
              port: LIVERELOAD_PORT
            })
          )
        )
    );
  }

  b.on('update', bundle);
  b.on('log', fancyLog);
  b.on('error', (/** @type {any} */ err) => {
    notify('Browserify error')(err);
    // @ts-ignore
    this.emit('end');
  });

  return bundle();
}

/**
 * Creates JavaScript bundles for each language.
 * @returns {NodeJS.ReadWriteStream} A stream of merged tasks representing the JavaScript bundles.
 */
function createJSbundles() {
  const tasks = entries.map(addToBrowserify);

  return merge2(tasks);
}

export { createJSbundles as browserify };
