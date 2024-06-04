import { series, parallel } from 'gulp';

import { copy, copyDeploy, copyViews as copyviews } from './copy';
import { brotli } from './brotli';
import { browserify } from './browserify';
import { server, runPHP } from './server';
import { check } from './check';
import { clean } from './clean';
import { eslint } from './eslint';
import { getwp } from './getwp';
import { gzip } from './gzip';
import { sass } from './sass';
import { watch } from './watch';
import { zip } from './zip';

const buildcode = parallel(check, eslint, copy, sass, browserify);
const build = series(clean, buildcode);
const deploy = series(build, copyDeploy, parallel(gzip, brotli), zip);

const defaultTask = series(build, watch, server);

export {
  browserify,
  build,
  copyviews,
  defaultTask as default,
  deploy,
  eslint,
  getwp,
  sass,
  server,
  runPHP
};
