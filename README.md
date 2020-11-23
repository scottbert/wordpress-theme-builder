### Wordpress Theme Builder

Requires global gulp and gulp-cli to be installed

Also requires node/npm, MySQL and PHP.

If you don't have homebrew on OSX, visit [brew.sh](http://brew.sh)

#### Node
OSX: `brew install node`.

#### PHP
OSX: `brew install php php-code-sniffer`

#### MySQL
OSX: `brew install mysql`


To run the demo, additionally check out [wordpress-theme-builder-src](https://github.com/scottbert/wordpress-theme-builder-src) then copy into the root of this folder as "src" (this exists as a submodule now).

For pre NPM 7 do `npm install`, post NPM 7 do `npm install --legacy-peer-deps`

then ```npm run get-wordpress``` to download and uncompress the latest wordpress into `.run`

Modify `src/wp-config.php` to contain the correct database credentials. By default this expects a local MySQL/MariaDB database called `wordpress` which can be accessed by `wordpress_user@localhost` with no password. This file is not part of the final zip of your theme and is only used for running the theme locally.

Optionally, modify ```src/options.js``` to change the name of your theme.

Then ```npm run develop``` to run the livereload local server ( http://localhost:9000 )

Fill out the usual WordPress configuration information, log in and change your theme to the Wordpress Theme Builder theme (or whatever you called yours :))

### Building
`npm run deploy` will build and gzip/brotli compress the assets then zip them into an installable zip in `dist` that you can install using your site's themes uploader.

[![Known Vulnerabilities](https://snyk.io/test/github/scottbert/wordpress-theme-builder/badge.svg?targetFile=package.json)](https://snyk.io/test/github/scottbert/wordpress-theme-builder?targetFile=package.json)
