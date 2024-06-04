import { CONSTS } from './CONSTS';
import { src, dest } from 'gulp';
import gulpZip from 'gulp-zip';

const { BUILD_DEST, NAME, VERSION } = CONSTS;

/**
 * Zips the build folder and puts it in the `dist` folder, ready for install as a theme in Wordpress.
 * @returns {NodeJS.ReadWriteStream} The stream of compressed files.
 */
function zip() {
  return src(`${BUILD_DEST}/**`)
    .pipe(gulpZip(`${NAME}-${VERSION.replace(/\./gi, '-')}.zip`))
    .pipe(dest('dist'));
}

export { zip };
