import { src, dest } from 'gulp';
import cssnano from 'cssnano';
import gulpChanged from 'gulp-changed';
import gulpIf from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import gulpPlumber from 'gulp-plumber';
import gulpPostcss from 'gulp-postcss';
import gulpRename from 'gulp-rename';
import gulpSass from 'gulp-dart-sass';
import gulpSassVariables from 'gulp-sass-variables';
import postcssAssets from 'postcss-assets';
import postcssCombineMediaQuery from 'postcss-combine-media-query';
import postcssImport from 'postcss-import';
import postcssNormalize from 'postcss-normalize';
import postcssPresetEnv from 'postcss-preset-env';
import postcssSortMediaQueries from 'postcss-sort-media-queries';

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
  includePaths: []
};

const gulpOptions = isDev ? { sourcemaps: true } : {};

/**
 * Generates a Sass variables object based on the provided breakpoints.
 * @param {object} breakpoints - An object containing breakpoints as key-value pairs.
 * @returns {object} - An object containing Sass variables with breakpoints as keys and pixel values as values.
 */
function buildSassVariables(breakpoints) {
  const c = {};

  for (const b in breakpoints) {
    // @ts-ignore
    c[`$${b.toLowerCase().replace(/_/g, '')}`] = `${breakpoints[b]}px`;
  }

  return c;
}

const sassVariables = buildSassVariables(BREAKPOINTS);

/**
 * Renames the basename of a given path by replacing placeholders with the values of `NAME` and `VERSION`,
 * and appends `.min` to the end of the basename.
 * @param {{basename: string}} path - The path object to be renamed.
 * @returns {void} This function does not return a value.
 */
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
  postcssImport,
  postcssNormalize,
  postcssPresetEnv
];

/**
 * Compiles SCSS files into CSS using Gulp and various PostCSS plugins.
 * @returns {NodeJS.ReadWriteStream} The Gulp stream containing the compiled CSS files.
 */
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
