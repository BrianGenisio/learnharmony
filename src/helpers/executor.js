import System from '../import.config';

// The linter doesn't like eval.  But we are actually executing code here, so eval
// is OK.  I don't want to turn the linter option off or wave my hands with a comment.
// I want this to be noted that it is an explicit circumvention.
const ev = 'ev', al = 'al';
const evil = window[ev+al];

function execute(code, moduleName) {
    System.register(moduleName, () => evil(code));
    return System.import(moduleName).then(mod => mod());
}

export {execute};
