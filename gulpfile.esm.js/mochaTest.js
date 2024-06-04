import { src } from 'gulp';
import { notify } from './notify';
import gulpPlumber from 'gulp-plumber';
import gulpSpawnMocha from 'gulp-spawn-mocha';
import gulpWait from 'gulp-wait';
import { CONSTS } from './CONSTS';

const { SRC, GULPFILE } = CONSTS;

const TEST_DELAY = 3050;

const mochaOptions = {
  require: ['esm'],
  R: 'spec'
};

if (process.env.NODE_ENV === 'production') {
  mochaOptions.R = 'nyan';
}

const TESTS_SRC = [`${SRC}/**/*.test.js`, `${GULPFILE}/**/*.test.js`];

/**
 * Runs the Mocha test suite with live reloading.
 * @returns {NodeJS.ReadWriteStream} The stream of the Mocha test suite.
 */
function mochaTestLR() {
  return src(TESTS_SRC, { read: false })
    .pipe(gulpWait(TEST_DELAY))
    .pipe(
      gulpPlumber({
        errorHandler: notify('gulpMocha Error: <%= error.message %>')
      })
    )
    .pipe(gulpSpawnMocha(mochaOptions));
}

/**
 * Runs the Mocha test suite and handles any errors that occur.
 * @returns {NodeJS.ReadWriteStream} The stream of the Mocha test suite.
 */
function mochaTest() {
  return src(TESTS_SRC, { read: false })
    .pipe(
      gulpPlumber({
        errorHandler: notify('gulpMocha Error: <%= error.message %>')
      })
    )
    .pipe(gulpSpawnMocha(mochaOptions));
}

export { mochaTest, mochaTestLR };
