import { deleteAsync } from 'del';
import { CONSTS } from './CONSTS';

const { STATIC_DEST, BUILD_DEST, BUILD_DIST } = CONSTS;

function clean() {
    return deleteAsync(['contrib', STATIC_DEST, BUILD_DEST, BUILD_DIST]);
}

export { clean };
