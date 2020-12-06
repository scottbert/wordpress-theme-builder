import { src, dest } from 'gulp';
import cssnano from 'cssnano';
import Fiber from 'fibers';
import gulpChanged from 'gulp-changed';
import gulpIf from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import gulpPlumber from 'gulp-plumber';
import gulpPostcss from 'gulp-postcss';
import gulpRename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import gulpSassVariables from 'gulp-sass-variables';
import postcssAssets from 'postcss-assets';
import postcssCombineMediaQuery from 'postcss-combine-media-query';
import postcssNormalize from 'postcss-normalize';
import postcssPresetEnv from 'postcss-preset-env';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import sass from 'sass';

import { CONSTS } from './CONSTS';
import { notify } from './notify';

const {
    NODE_ENV,
    BREAKPOINTS,
    BREAKPOINT_DEVELOPMENT,
    CSS_NANO_PRESET,
    NAME,
    VERSION,
    SASS_SRC,
    CSS_DEST,
    LIVERELOAD_PORT
} = CONSTS;

const isDev = NODE_ENV !== 'production';

const sassOptions = {
    errLogToConsole: true,
    fiber: Fiber,
    includePaths: []
};

const gulpOptions = isDev ? { sourcemaps: true } : {};

gulpSass.compiler = sass;

function buildSassVariables(breakpoints) {
    const c = {};

    for (const b in breakpoints) {
        c[`$${b.toLowerCase().replace(/_/g, '')}`] = `${breakpoints[b]}px`;
    }

    return c;
}

const sassVariables = buildSassVariables(BREAKPOINTS);

function rename(path) {
    path.basename = `${path.basename
        .replace('$name', NAME)
        .replace('$version', VERSION)}.min`;
}

const processors = [
    postcssCombineMediaQuery,
    postcssSortMediaQueries({
        sort: BREAKPOINT_DEVELOPMENT // default
    }),
    cssnano({
        preset: CSS_NANO_PRESET
    }),
    postcssAssets,
    postcssNormalize,
    postcssPresetEnv
];

function compileSass() {
    return src(`${SASS_SRC}/**/*.scss`, gulpOptions)
        .pipe(gulpChanged(CSS_DEST))
        .pipe(
            gulpPlumber({
                errorHandler: notify('Styles Error')
            })
        )
        .pipe(gulpSassVariables(sassVariables))
        .pipe(gulpSass(sassOptions).on('error', gulpSass.logError))
        .pipe(gulpPostcss(processors))
        .pipe(gulpRename(rename))
        .pipe(dest(CSS_DEST, gulpOptions))
        .pipe(gulpIf(isDev, gulpLivereload({ port: LIVERELOAD_PORT })));
}

export { compileSass as sass };
