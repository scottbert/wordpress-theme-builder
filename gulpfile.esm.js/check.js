import fs from 'fs';
import fancyLog from 'fancy-log';

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
