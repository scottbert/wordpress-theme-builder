import fs from 'fs';
import fancyLog from 'fancy-log';

/**
 * Checks if the '.run' directory exists. If it does not exist, logs an error message and exits the process.
 * @param {Function} cb - The callback function to be executed after the check.
 * @returns {void} This function does not return a value.
 */
function check(cb) {
  if (!fs.existsSync('.run')) {
    fancyLog(`\n\n
             ╔═══════════════════════════════════════════════════════════╗
             ║  WordPress isn't downloaded. Run 'npm run get-wordpress'  ║
             ║  and make sure WordPress is configured according to the   ║
             ║  setup instructions in README.md                          ║
             ╚═══════════════════════════════════════════════════════════╝
            \n\n`);
    process.exit();
  }

  cb();
}

export { check };
