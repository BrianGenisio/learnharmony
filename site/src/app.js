import {appTemplate} from 'src/app.template';
import Editor from 'src/editor/editor';
import Console from 'src/console/console';
import AppRouter from 'src/app-router';
import {routes} from 'src/routes';

$('#app-container').html(appTemplate);

let editor = new Editor();
editor.render($('#app-container .editor-container'));

let console = new Console();
console.render($('#app-container .console-container'));

populateNav(routes);

new AppRouter(routes).start(mapPage);

function navEntry(route) {
  var result = `
<li>
  <a href="#${route.page}">${route.title}</a>
</li>`;

  return result;
}

function orderRoutes(routes) {
  let result = [];
  let current = _.find(routes, route => route.first);

  while(current) {
    _.remove(routes, current);
    result.push(current);
    let nextName = current.next;

    current = nextName ? _.find(routes, route => route.page === nextName) : null;
    if(!current) current = routes.pop();
  }

  result.push(...routes);

  return result;
}

function populateNav(routes) {
  _(routes)
    .filter(route => !!route.navGroup)
    .groupBy(route => route.navGroup)
    .values()
    .map(orderRoutes)
    .flatten()
    .forEach(route => $(route.navGroup).append(navEntry(route)));
}

function updateNav(url) {
  if(url === '/') url = '';
  $('.nav li').removeClass('active');
  let $active = $(`.nav li a[href="#${url}"]`);
  $active.closest('li').addClass('active');
  $active.closest('li').parent().closest('li').addClass('active');
}

function animateContent(content) {
  var $intro = $('.intro');
  var $body = $('body');

  $intro.fadeOut(function() {
    $intro.html(content || '').fadeIn(function() {
    });
  });

  $body.animate({scrollTop: 0});
}

function reloadComments(hash, heading) {
  DISQUS.reset({
    reload: true,
    config: function () {  
      this.page.identifier = hash;  
      this.page.url = "http://learnharmony.org/#" + hash;
      this.page.title = heading;
    }
  });
}

function mapPage(pageName, url) {
  System.import(`src/pages/${pageName}.page`)
    .then(function({page}) {
      $('.heading').html(page.heading || '');
      $('.editor').toggle(!page.hideEditor);
      $('#disqus_thread').toggle(!page.hideComments);
      $('.next-text').html(page.nextText || '');
      $('.next-link').toggle(!!page.next);
      $('.next-link a').attr('href', '#' + (page.next || ''));
      editor.code = page.code || '';
      updateNav(url);

      animateContent(page.intro);
      reloadComments(pageName, heading);

    }).catch(function(errors) {
      console.log('failed to load page: ', errors);
    });
}