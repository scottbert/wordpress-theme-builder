import { deleteAsync } from 'del';
import { CONSTS } from './CONSTS';

const { STATIC_DEST, BUILD_DEST, BUILD_DIST } = CONSTS;

/**
 * Deletes the contents of the DIST_DEST and DEPLOY_TARGET directories.
 * @returns {Promise<string[]>} A promise that resolves when the directories have been deleted.
 */
function clean() {
  return deleteAsync(['contrib', STATIC_DEST, BUILD_DEST, BUILD_DIST]);
}

export { clean };
