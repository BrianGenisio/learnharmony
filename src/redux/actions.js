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

        console.log("EXECUTE CODE: ", code);
        // execute the code 
        //.then dispatch({type: action.EXECUTE_CODE_COMPLETE});
    };
};