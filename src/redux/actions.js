import {compile} from '../helpers/compiler';
import {execute} from '../helpers/executor';
import {action} from './constants.js';

export function changeRoute(route) {
    return {type: action.CHANGE_ROUTE, route};
}

export function updateCode(code) {
    return {type: action.UPDATE_CODE, code};
};

export function executeCode(code) {
    return dispatch => {
        dispatch({type: action.EXECUTE_CODE, code});

        const moduleName = "ModuleXYZ"; //TBD
        compile(code)
            .then(transpiled => execute(code, moduleName))
            .then(() => dispatch({type: action.EXECUTE_CODE_COMPLETE}));
    };
};