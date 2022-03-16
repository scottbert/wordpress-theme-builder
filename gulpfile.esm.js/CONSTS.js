const LIVERELOAD = 35679;
const RANDOM_PORT = LIVERELOAD + parseInt(Math.random() * 100); // Randomize port for livereload.
const APPSERVER_PORT = 8888;
const SERVER_PORT = 9000;

const CONTENT = '.run/wp-content/';
const THEME = `${CONTENT}themes/wp-theme/`;

const { name, version } = require('../package.json');

let OPTIONS = {};

if (!process.env.LIVERELOAD_PORT) {
    process.env.LIVERELOAD_PORT = RANDOM_PORT;
}

try {
    const fs = require('fs');
    const pth = fs.realpathSync('.');

    OPTIONS = require(pth + '/src/options.js');
} catch (ex) {} //eslint-disable-line

let CONSTS = {
    APPSERVER_PORT: process.env.PORT || APPSERVER_PORT,
    AUDIO_SRC: 'src/audio',
    BREAKPOINTS: {
        OLD_MOBILE: 320,
        MOBILE: 767,
        SMALL_TABLET: 600,
        TABLET: 979,
        SMALL_DESKTOP: 1440
    },
    BREAKPOINT_DEVELOPMENT: 'mobile-first',
    BUILD_DEST: 'build/',
    BUILD_DIST: 'dist/',
    CONTENT,
    CSS_DEST: `${THEME}css/`,
    CSS_NANO_PRESET: 'advanced',
    CSS_SRC: 'src/css/',
    FAVICON: 'src/images/favicon.ico',
    FONT_SRC: 'src/fonts',
    GULP_PORT: process.env.GULP_PORT || SERVER_PORT,
    GULP_TASKS: 'gulp-tasks',
    GULPFILE: 'gulpfile.esm.js',
    IMG_DEST: `${THEME}img/`,
    IMG_SRC: 'src/images',
    JS_DEST: `${THEME}js/`,
    JS_OUTPUT: '.min.js',
    JS_SRC: 'src/js/',
    JSON_SRC: 'src/json/',
    LANGUAGES_SRC: 'src/languages',
    LIVERELOAD_PORT: process.env.LIVERELOAD_PORT,
    NAME: OPTIONS.NAME || name,
    NODE_ENV: process.env.NODE_ENV,
    RUN_DEST: '.run/',
    SASS_SRC: 'src/sass',
    SRC: 'src',
    STATIC_DEST: `${THEME}`,
    TEMPLATES_DEST: `${THEME}`,
    TEMPLATES_SRC: 'src/templates',
    TEXT_SRC: 'src/text',
    THEME,
    UPLOAD_SRC: 'src/upload',
    VERSION: OPTIONS.VERSION || version,
    VIDEO_SRC: 'src/video',
    WP_SRC: '.contrib/wordpress',
    WP_CSS_SRC: 'src/css/style.css',
    WPCONFIG_SRC: 'src/wp-config.php'
};

CONSTS = {
    ...CONSTS,
    ...OPTIONS
};

export { CONSTS };
