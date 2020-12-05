import { src } from 'gulp';
import gulpESLint from 'gulp-eslint';
import { notify } from './notify';
import gulpPlumber from 'gulp-plumber';
import { CONSTS } from './CONSTS';
const { GULPFILE, GULP_TASKS, JS_SRC } = CONSTS;

function eslint() {
    return src([GULPFILE, `${GULP_TASKS}/**/*.js`, `${JS_SRC}/**/*.js`])
        .pipe(gulpPlumber({ errorHandler: notify('ESLint Error') }))
        .pipe(gulpESLint())
        .pipe(gulpESLint.format())
        .pipe(gulpESLint.failAfterError());
}

export { eslint };
