import _ from 'lodash';

function _orderPages(pages) {
  let result = [];
  let current = _.find(pages, page => page.first);

  while(current) {
    _.remove(pages, current);
    result.push(current);
    let nextName = current.next;

    current = nextName ? _.find(pages, page => page.route === nextName) : null;
    if(!current) current = pages.pop();
  }

  result.push(...pages);

  return result;
}

export function generateContentNavOptions(content) {
  return _(content)
    .filter(route => !!route.navGroup)
    .groupBy(route => route.navGroup)
    .values()
    .map(_orderPages)
    .flatten()
    .value();
};