import {compile} from '../helpers/compiler';
import {execute} from '../helpers/executor';
import {action} from './constants.js';

export function changeRoute(route) {
    return {type: action.CHANGE_ROUTE, route};
}

export function updateCode(code) {
    return {type: action.UPDATE_CODE, code};
};

function nextModule(currentModule) {
    const PREFIX = 'repl';
    const nextId = currentModule ? 
        parseInt(currentModule.replace(PREFIX, ''), 10) + 1:
        0;
    
    return `${PREFIX}${nextId}`;
}

export function executeCode(code, currentModule) {
    return dispatch => {
        const moduleName = nextModule(currentModule);

        dispatch({type: action.EXECUTE_CODE, code, moduleName});

        compile(code)
            .then(transpiled => execute(transpiled, moduleName))
            .then(() => dispatch({type: action.EXECUTE_CODE_COMPLETE}))
            .catch(e => { console.log(`[ERROR] ${e.toString()}`); });
    };
};

export function consoleLog(line) {
    return {type: action.CONSOLE_LOG, line};
}

export function consoleClear() {
    return {type: action.CONSOLE_CLEAR};
}