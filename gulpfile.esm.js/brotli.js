import { src, dest } from 'gulp';
import gulpBrotli from 'gulp-brotli';
import zlib from 'zlib';

import { CONSTS } from './CONSTS';

const { BUILD_DEST } = CONSTS;

/**
 * Compress static assets with Brotli so they can be served via nginx
 * without needing on-the-fly compression.
 * @function
 * @returns  {NodeJS.ReadWriteStream} vinylSourceStream
 */
function brotli() {
  return src(`${BUILD_DEST}**/*.{css,svg,js,html}`)
    .pipe(
      gulpBrotli.compress({
        skipLarger: true,
        params: {
          // brotli parameters are documented at
          // https://nodejs.org/docs/latest-v10.x/api/zlib.html#zlib_brotli_constants
          [zlib.constants.BROTLI_PARAM_QUALITY]:
            zlib.constants.BROTLI_MAX_QUALITY,
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
        }
      })
    )
    .pipe(dest(BUILD_DEST));
}

export { brotli };
