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

function copyWordPress() {
    return copyFilesFn(`${WP_SRC}/**`, RUN_DEST, WP_SRC, true);
}

function copyViews() {
    return copyFilesReplaceFn(
        TEMPLATES,
        TEMPLATES_DEST,
        TEMPLATES_SRC,
        true,
        {
            name: '@@@name@@@',
            value: NAME
        }
    );
}

function copyStaticFiles() {
    return copyFilesFn(STATIC_SRC, STATIC_DEST, SRC, true);
}

function copyFilesFn(gsrc, gdest, base = '.', reload) {
    return src(gsrc, { base })
        .pipe(gulpPlumber({ errorHandler: notify('Copy Files Error') }))
        .pipe(gulpChanged(gdest))
        .pipe(dest(gdest))
        .pipe(
            gulpIf(
                reload,
                gulpLivereload({
                    port: LIVERELOAD_PORT
                })
            )
        );
}

function copyFilesReplaceFn(gsrc, gdest, base = '.', reload, rp) {
    return src(gsrc, { base })
        .pipe(gulpPlumber({ errorHandler: notify('Copy Files (replace name) Error') }))
        .pipe(gulpReplace(rp.name, rp.value))
        .pipe(gulpChanged(gdest))
        .pipe(dest(gdest))
        .pipe(
            gulpIf(
                reload,
                gulpLivereload({
                    port: LIVERELOAD_PORT
                })
            )
        );
}

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

function copyDeploy() {
    return copyFilesFn(`${STATIC_DEST}**`, BUILD_DEST, STATIC_DEST);
}

function copyCss() {
    return src(`${CSS_SRC}/style.css`)
        .pipe(gulpPlumber({ errorHandler: notify('Copy Files (css) Error') }))
        .pipe(gulpReplace('$version', VERSION))
        .pipe(gulpReplace('$name', FULL_NAME))
        .pipe(gulpReplace('$datetime', getDateTime()))
        .pipe(dest(STATIC_DEST));
}

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

function copyBits() {
    return src(BITS_SRC, { base: '.' })
        .pipe(gulpPlumber({ errorHandler: notify('Copy Files (bits) Error') }))
        .pipe(gulpRename({ dirname: '' }))
        .pipe(dest(STATIC_DEST));
}

function copyFavicon() {
    return src(FAVICON, { base: IMG_SRC, allowEmpty: true })
        .pipe(gulpPlumber({ errorHandler: notify('Copy Files (favicon) Error') }))
        .pipe(dest(CONTENT));
}

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
