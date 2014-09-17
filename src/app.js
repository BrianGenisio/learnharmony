import {appTemplate} from 'src/app.template';
import Editor from 'src/editor/editor';
import Console from 'src/console/console';
import Router from 'src/router/router';

$('#app-container').html(appTemplate);

let editor = new Editor();
editor.render($('#app-container .editor-container'));

let console = new Console();
console.render($('#app-container .console-container'));

function updateNav(url) {
  if(url === '/') url = '';
  $('.nav li').removeClass('active');
  let $active = $(`.nav li a[href="#${url}"]`);
  $active.closest('li').addClass('active');
  $active.closest('li').parent().closest('li').addClass('active');
}

function mapPage(pageName, url) {
  System.import(`src/pages/${pageName}.page`)
    .then(function({page}) {
      $('.heading').html(page.heading);
      $('.intro').html(page.intro);
      $('.editor').toggle(!page.hideEditor);
      editor.code = page.code || '';
      updateNav(url);
    }).catch(function(errors) {
      console.log('failed to load page: ', errors);
    });
}

let router = new Router();
router.route('/', url => mapPage('home', url));
router.route('about', url => mapPage('about', url));

router.route('lessons/arrow-functions', url => mapPage('lessons/arrow-functions', url));
router.listen();