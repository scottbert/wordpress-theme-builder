import { dest } from 'gulp';
import browserify from 'browserify';
import fancyLog from 'fancy-log';
import glob from 'glob';
import gulpIf from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import gulpReplace from 'gulp-replace';
import merge2 from 'merge2';
import vinylBuffer from 'vinyl-buffer';
import vinylSourceStream from 'vinyl-source-stream';
import watchify from 'watchify';
import gulpTerser from 'gulp-terser';
import terser from 'terser';

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

const entries = glob.sync(`${JS_SRC}*.js`);

/**
 * @param {string} entry entry file string from glob.
 * @returns {NodeJS.ReadWriteStream} stream
 */
function addToBrowserify(entry) {
    const options = {
        entries: [entry],
        cache: {},
        packageCache: {},
        paths: [
            `./${JS_SRC}modules`,
            './src/node_modules',
            'node_modules'
        ]
    };

  /**
   * Executes a logic to determine if a line return is needed.
   *
   * @return {boolean} Returns true if a line return is needed, false otherwise.
   */
  function doLR() {
    if (process.env.OVERRIDE_LR === 'true') {
      return false;
    }

    const name = entry.replace('$name', NAME).replace('$version', VERSION)
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
            sourceMaps: true
        });
        b.plugin(watchify, { delay: 10 });
    } else {
        b.transform('babelify', { presets: ['@babel/preset-env', '@babel/preset-react'] });
        b.transform('envify');
    }

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

        process.env.OVERRIDE_LR = 'true';

        setTimeout(() => {
            process.env.OVERRIDE_LR = 'false';
        }, 500);

        return isDev;
    }

    function bundle() {
        return b.bundle()
            .pipe(vinylSourceStream(name + JS_OUTPUT))
            .pipe(vinylBuffer())
            .pipe(gulpReplace('$$API$$', API))
            .pipe(gulpReplace('$$name$$', NAME))
            .pipe(gulpReplace('$$version$$', VERSION))
            .pipe(gulpReplace('$$oldMobile$$', BREAKPOINTS.OLD_MOBILE))
            .pipe(gulpReplace('$$mobile$$', BREAKPOINTS.MOBILE))
            .pipe(gulpReplace('$$smalltablet$$', BREAKPOINTS.SMALL_TABLET))
            .pipe(gulpReplace('$$tablet$$', BREAKPOINTS.TABLET))
            .pipe(gulpReplace('$$smalldesktop$$', BREAKPOINTS.SMALL_DESKTOP))
            .pipe(gulpTerser({}, terser.minify))
            .pipe(dest(JS_DEST))
            .pipe(gulpIf(doLR(), gulpLivereload({
                port: LIVERELOAD_PORT
            })));
    }

    b.on('update', bundle);
    b.on('log', fancyLog);
    b.on('error', err => {
        notify('Browserify error')(err);
        this.emit('end');
    });

    return bundle();
}

function createJSbundles() {
    const tasks = entries.map(addToBrowserify);

    return merge2(tasks);
}

export { createJSbundles as browserify };
