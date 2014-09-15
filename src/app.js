import {appTemplate} from 'src/app.template';
import Editor from 'src/editor/editor';
import Console from 'src/console/console';

$('#app-container').html(appTemplate);

let editor = new Editor();
editor.render($('#app-container .editor-container'));

let console = new Console();
console.render($('#app-container .console-container'));