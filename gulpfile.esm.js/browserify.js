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

import { notify } from './notify';
import { CONSTS } from './CONSTS';

const isDev = CONSTS.NODE_ENV !== 'production';

const entries = glob.sync(`${CONSTS.JS_SRC}*.js`);

function addToBrowserify(entry) {
    const options = {
        entries: [entry],
        cache: {},
        packageCache: {},
        paths: [
            `./${CONSTS.JS_SRC}modules`
        ]
    };

    if (isDev) {
        options.debug = true;
    }

    const name = entry.replace('$name', CONSTS.NAME).replace('$version', CONSTS.VERSION)
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
        b.plugin('tinyify', { flat: false });
    }

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

    function bundle() {
        return b.bundle()
            .on('error', err => {
                notify('Browserify error')(err);
                this.emit('end');
            })
            .pipe(vinylSourceStream(name + CONSTS.JS_OUTPUT))
            .pipe(vinylBuffer())
            .pipe(gulpReplace('$$API$$', CONSTS.API))
            .pipe(gulpReplace('$$name$$', CONSTS.NAME))
            .pipe(gulpReplace('$$version$$', CONSTS.VERSION))
            .pipe(gulpReplace('$$oldMobile$$', CONSTS.BREAKPOINTS.OLD_MOBILE))
            .pipe(gulpReplace('$$mobile$$', CONSTS.BREAKPOINTS.MOBILE))
            .pipe(gulpReplace('$$smalltablet$$', CONSTS.BREAKPOINTS.SMALL_TABLET))
            .pipe(gulpReplace('$$tablet$$', CONSTS.BREAKPOINTS.TABLET))
            .pipe(gulpReplace('$$smalldesktop$$', CONSTS.BREAKPOINTS.SMALL_DESKTOP))
            .pipe(dest(CONSTS.JS_DEST))
            .pipe(gulpIf(doLR(), gulpLivereload({
                port: CONSTS.LIVERELOAD_PORT
            })));
    }

    b.on('update', bundle);
    b.on('log', fancyLog);

    return bundle();
}

function createJSbundles() {
    const tasks = entries.map(addToBrowserify);

    return merge2(tasks);
}

export { createJSbundles as browserify };
