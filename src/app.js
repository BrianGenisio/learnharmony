import {appTemplate} from 'src/app.template';
import Editor from 'src/editor/editor';
import Console from 'src/console/console';
import Router from 'src/router/router';

$('#app-container').html(appTemplate);

let editor = new Editor();
editor.render($('#app-container .editor-container'));

let console = new Console();
console.render($('#app-container .console-container'));

function mapPage(pageName) {
  System.import(`src/pages/${pageName}.page`)
    .then(function({page}) {
      $('.heading').html(page.heading);
      $('.intro').html(page.intro);
      $('.editor').toggle(!page.hideEditor);
      editor.code = page.code || '';
    }).catch(function(errors) {
      console.log('failed to load page: ', errors);
    });
}

let router = new Router();
router.route('/', () => mapPage('home'));
router.route('about', () => mapPage('about'));
router.listen();