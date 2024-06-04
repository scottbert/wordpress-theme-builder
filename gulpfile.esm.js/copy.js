import { src, dest, series, parallel } from 'gulp';
import gulpChanged from 'gulp-changed';
import gulpIf from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import gulpPlumber from 'gulp-plumber';
import gulpRename from 'gulp-rename';
import gulpReplace from 'gulp-replace';

import { CONSTS } from './CONSTS';
import { notify } from './notify';

const {
  AUDIO_SRC,
  BUILD_DEST,
  CONTENT,
  CSS_SRC,
  FAVICON,
  FONT_SRC,
  FULL_NAME,
  IMG_SRC,
  JSON_SRC,
  LANGUAGES_SRC,
  LIVERELOAD_PORT,
  NAME,
  RUN_DEST,
  SRC,
  STATIC_DEST,
  TEMPLATES_DEST,
  TEMPLATES_SRC,
  TEXT_SRC,
  VERSION,
  VIDEO_SRC,
  WP_SRC,
  WPCONFIG_SRC
} = CONSTS;

const STATIC_SRC = [
  `${IMG_SRC}/**`,
  `${AUDIO_SRC}/**`,
  `${FONT_SRC}/**`,
  `${LANGUAGES_SRC}/**`,
  `${VIDEO_SRC}/**`,
  `${JSON_SRC}/**`
];

const TEMPLATES = [`${TEMPLATES_SRC}/**`];
const BITS_SRC = [`${IMG_SRC}/screenshot.png`, `${TEXT_SRC}/**`];

/**
 * Copies Wordpress from the source directory to the destination directory.
 * @returns {NodeJS.ReadWriteStream} A promise that resolves when the copying is complete.
 */
function copyWordPress() {
  return copyFilesFn(`${WP_SRC}/**`, RUN_DEST, WP_SRC, true);
}

/**
 * Copies Views from the source directory to the destination directory.
 * @returns {NodeJS.ReadWriteStream} A promise that resolves when the copying is complete.
 */
function copyViews() {
  return copyFilesReplaceFn(TEMPLATES, TEMPLATES_DEST, TEMPLATES_SRC, true, {
    name: '@@@name@@@',
    value: NAME
  });
}

/**
 * Copies static files from the source directory to the destination directory.
 * @returns {NodeJS.ReadWriteStream} A promise that resolves when the copying is complete.
 */
function copyStaticFiles() {
  return copyFilesFn(STATIC_SRC, STATIC_DEST, SRC, true);
}

/**
 * Copies files from the source directory to the destination directory.
 * @param {string|Array<string>} srcdir - The source directory or directories to copy files from.
 * @param {string} destdir - The destination directory to copy files to.
 * @param {string} [base] - The base directory for resolving relative paths.
 * @param {boolean} [reload] - Whether to reload the files using gulp-livereload.
 * @returns {NodeJS.ReadWriteStream} A promise that resolves when the copying is complete.
 */
function copyFilesFn(srcdir, destdir, base = '.', reload) {
  return src(srcdir, { base })
    .pipe(gulpPlumber({ errorHandler: notify('Copy Files Error') }))
    .pipe(gulpChanged(destdir))
    .pipe(dest(destdir))
    .pipe(
      gulpIf(
        !!reload,
        gulpLivereload({
          port: LIVERELOAD_PORT
        })
      )
    );
}

/**
 * Copies files from the source directory to the destination directory.
 * @param {string|Array<string>} srcdir - The source directory or directories to copy files from.
 * @param {string} destdir - The destination directory to copy files to.
 * @param {string} base - The base directory for resolving relative paths.
 * @param {boolean} reload - Whether to reload the files using gulp-livereload.
 * @param {{ name: string, value: string }} rp - The replacement object.
 * @returns {NodeJS.ReadWriteStream} A promise that resolves when the copying is complete.
 */
function copyFilesReplaceFn(srcdir, destdir, base = '.', reload, rp) {
  return src(srcdir, { base })
    .pipe(
      gulpPlumber({ errorHandler: notify('Copy Files (replace name) Error') })
    )
    .pipe(gulpReplace(rp.name, rp.value))
    .pipe(gulpChanged(destdir))
    .pipe(dest(destdir))
    .pipe(
      gulpIf(
        reload,
        gulpLivereload({
          port: LIVERELOAD_PORT
        })
      )
    );
}

/**
 * Returns the current date and time in the format:
 * - weekday: short (e.g. Mon, Tue, Wed)
 * - day: numeric (e.g. 1, 2, 3)
 * - year: numeric (e.g. 2022)
 * - month: short (e.g. Jan, Feb, Mar)
 * - hour: numeric (e.g. 13, 14, 15)
 * - minute: numeric (e.g. 30, 45, 59)
 * @returns {string} The current date and time in the specified format.
 */
function getDateTime() {
  return new Date().toLocaleString('en', {
    weekday: 'short',
    day: 'numeric',
    year: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric'
  });
}

/**
 * Copies the contents of the `DIST_DEST` directory to the `DEPLOY_DEST` directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyDeploy() {
  return copyFilesFn(`${STATIC_DEST}**`, BUILD_DEST, STATIC_DEST);
}

/**
 * Copies the CSS file for the theme name to the `STATIC_DEST` directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyCss() {
  return src(`${CSS_SRC}/style.css`)
    .pipe(gulpPlumber({ errorHandler: notify('Copy Files (css) Error') }))
    .pipe(gulpReplace('$version', VERSION))
    .pipe(gulpReplace('$name', FULL_NAME))
    .pipe(gulpReplace('$datetime', getDateTime()))
    .pipe(dest(STATIC_DEST));
}

/**
 * Copies the CSS file for the theme name to the `STATIC_DEST` directory then triggers livereload.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyCssLR() {
  return src(`${CSS_SRC}/style.css`)
    .pipe(gulpPlumber({ errorHandler: notify('Copy Files (css) Error') }))
    .pipe(gulpReplace('$version', VERSION))
    .pipe(gulpReplace('$name', FULL_NAME))
    .pipe(gulpReplace('$datetime', getDateTime()))
    .pipe(dest(STATIC_DEST))
    .pipe(
      gulpLivereload({
        port: LIVERELOAD_PORT
      })
    );
}

/**
 * Copies the contents of the bits src folder to the `STATIC_DEST` directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyBits() {
  return src(BITS_SRC, { base: '.' })
    .pipe(gulpPlumber({ errorHandler: notify('Copy Files (bits) Error') }))
    .pipe(gulpRename({ dirname: '' }))
    .pipe(dest(STATIC_DEST));
}

/**
 * Copies the contents of the bits src folder to the `CONTENT` directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyFavicon() {
  return src(FAVICON, { base: IMG_SRC, allowEmpty: true })
    .pipe(gulpPlumber({ errorHandler: notify('Copy Files (favicon) Error') }))
    .pipe(dest(CONTENT));
}

/**
 * Copies the wp-config.php file to the `RUN_DEST` directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the copying operation.
 */
function copyConfig() {
  return copyFilesFn(WPCONFIG_SRC, RUN_DEST, SRC, true);
}

const copy = series(
  parallel(
    copyConfig,
    copyCss,
    copyFavicon,
    copyStaticFiles,
    copyViews,
    copyWordPress
  ),
  copyBits
);

export { copy, copyDeploy, copyViews, copyCssLR, copyConfig, copyStaticFiles };
