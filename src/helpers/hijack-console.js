import {prunedJson} from './pruned-json';

function hijack(obj, funcName, action) {

    if(obj[funcName] && obj[funcName].hijacked) return;
    const oldFunc = obj[funcName] || function() {};

    obj[funcName] = (...args) => {
        oldFunc.apply(obj, args);
        action(args);
    };

    obj[funcName].hijacked = true;
}

function logToScreen(args, callback) {
    const line = args.map(arg => !arg ? 'undefined' : prunedJson(arg) || arg.toString()).join(' ');
    callback(line);
}

function hijackConsole(lineCallback, clearCallback) {
    hijack(console, 'log', args => logToScreen(args, lineCallback));
    hijack(console, 'clear', clearCallback);
}

export {
    hijackConsole
};