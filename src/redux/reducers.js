import {action} from "./constants";
import allContent from '../content.json';
import {generateContentNavOptions} from '../helpers/content';

function content(state=[]) {
    return allContent;
}

function contentOptions(state=[]) {
    return generateContentNavOptions(allContent)
      .filter(page => page.navGroup === ".lessons")
      .map(page => ({route: page.route, title: page.title}));
}

function code(state="", {type, value}) {
    switch (type) {
        case action.UPDATE_CODE:
            return value;

        default:
            return state;
    }
}

function consoleLog(state=[], {type, text}) {
    switch (type) {
        case action.CONSOLE_LOG:
            return [
                ...state,
                text
            ];

        default:
            return state;
    }
}

export default {
    content,
    contentOptions,
    code,
    consoleLog,
};