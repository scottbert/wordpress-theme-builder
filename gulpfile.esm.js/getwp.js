import { src, dest, series } from 'gulp';
import gulpDownload from 'gulp-download';
import gulpUnzip from 'gulp-unzip';

const WP_URL = 'https://wordpress.org/latest.zip';

/**
 * Downloads the latest version of WordPress from the specified URL and extracts it to the './contrib' directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the download and extraction process.
 */
function download() {
  return gulpDownload(WP_URL).pipe(gulpUnzip()).pipe(dest('./contrib'));
}

/**
 * Moves the contents of the './contrib/wordpress' directory to the '.run/' directory.
 * @returns {NodeJS.ReadWriteStream} A stream that represents the move process.
 */
function move() {
  return src('./contrib/wordpress/**').pipe(dest('.run/'));
}

const getwp = series(download, move);

export { getwp };
