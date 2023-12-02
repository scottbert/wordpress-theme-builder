import { createProxyMiddleware } from 'http-proxy-middleware';
import { series } from 'gulp';
import connectCORS from 'connect-cors';
import connectLivereload from 'connect-livereload';
import fancyLog from 'fancy-log';
import gulpConnect from 'gulp-connect';
import gulpConnectPHP from 'gulp-connect-php';
import httpRewriteMiddleware from 'http-rewrite-middleware';
import serveStatic from 'serve-static';
import url from 'url';

import { CONSTS } from './CONSTS';

const { APPSERVER_PORT, RUN_DEST, GULP_PORT, LIVERELOAD_PORT } = CONSTS;

const urlrewrites = [
    {
        from: '^/(wp-admin|wp-includes|wp-content)/((?!.*php).*)',
        to: '/$2'
    }
];

const staticOptions = {
    etag: false,
    index: false
};

function runPHP(cb) {
    gulpConnectPHP.server({
        port: APPSERVER_PORT,
        hostname: '0.0.0.0',
        base: RUN_DEST,
        debug: false,
        configCallback: function _configCallback(type, collection) {
            if (type === gulpConnectPHP.OPTIONS_SPAWN_OBJ) {
                collection.env = Object.assign(
                    {
                        APPLICATION_ENV: 'development'
                    },
                    process.env
                );
                cb();

                return collection;
            }

            cb();

            return collection;
        }
    });
}

function makeServer(cb) {
    const gulpPort = GULP_PORT;

    gulpConnect.server({
        root: '.run',
        port: gulpPort,
        host: '0.0.0.0',
        debug: true,
        middleware: () => {
            return [
                connectLivereload({
                    port: LIVERELOAD_PORT
                }),
                httpRewriteMiddleware.getMiddleware(urlrewrites),
                serveStatic('.run/wp-admin/', staticOptions),
                serveStatic('.run/wp-content/', staticOptions),
                serveStatic('.run/wp-includes/', staticOptions),
                createProxyMiddleware('/', {
                    target: url.parse(`http://127.0.0.1:${APPSERVER_PORT}`)
                }),
                connectCORS()
            ];
        }
    });
    cb();

    fancyLog(`server http://127.0.0.1:${gulpPort}`);
}

function makeRemoteServer(cb) {
    gulpConnect.server({
      port: GULP_PORT,
      host: '0.0.0.0',
      root: STATIC_DIR,
      debug: false,
      middleware: () => {
        return [
          connectLivereload({
            port: LIVERELOAD_PORT
          }),
          connectCORS(),
          rewriteModule.getMiddleware(urlrewrites),
          createProxyMiddleware(
            ['/**', '!/css/**', '!/js/**', `!${APP_REMOTE_THEME_LOCATION}**`],
            {
              target: APP_REMOTE_SERVER,
              auth: 'lkq:lkqeurope2022',
              secure: false,
              //selfHandleResponse: true,
              xfwd: true,
              toProxy: true,
              preserveHeaderKeyCase: true,
              changeOrigin: true,
              selfHandleResponse: true,
              onProxyRes: responseInterceptor(
                async (responseBuffer, proxyRes, req) => {
                  const text =
                    req.headers &&
                    req.headers.accept &&
                    req.headers.accept.includes('text');
                  const response = text
                    ? responseBuffer.toString('utf8')
                    : responseBuffer; // convert buffer to string

                  return response; // manipulate response and return the result
                }
              )
              // onProxyReq: responseInterceptor(async proxyReq => {
              //   proxyReq.headers.host = 'lkqcorporatestg.prod.acquia-sites.com';
              // })
            }
          )
        ];
      }
    });

    cb();

    fancyLog(`server http://127.0.0.1:${GULP_PORT}`);
  }

const server = series(runPHP, makeServer);

export { server, runPHP, makeServer };
