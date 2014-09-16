import {appTemplate} from 'src/app.template';
import Editor from 'src/editor/editor';
import Console from 'src/console/console';
import Router from 'src/router/router';

$('#app-container').html(appTemplate);

let editor = new Editor();
editor.render($('#app-container .editor-container'));

let console = new Console();
console.render($('#app-container .console-container'));

let router = new Router();
router.route('/', () => window.console.log('home'));
router.route('about', () => window.console.log('about'));
router.route('contact', () => window.console.log('contact'));
router.listen();