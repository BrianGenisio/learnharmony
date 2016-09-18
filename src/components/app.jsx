import _ from 'lodash';
import React, { Component } from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col} from 'react-bootstrap';

import content from '../content.json';
import ContentRenderer from './content-renderer';

const styles = {
  contentRenderer: {
    marginBottom: "2em"
  }
};

function orderPages(pages) {
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

function processContent(routes) {
  return _(routes)
    .filter(route => !!route.navGroup)
    .groupBy(route => route.navGroup)
    .values()
    .map(orderPages)
    .flatten()
    .value();
}

class App extends Component {
  render() {
    const menuItems = processContent(content)
      .filter(page => page.navGroup === ".lessons")
      .map(page => {
        return <MenuItem href={`#${page.route}`} key={page.route}>{page.title}</MenuItem>
      });

    const TopNav = <Navbar inverse fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">Learn Harmony (ES2015) Now!</a>
        </Navbar.Brand>
      </Navbar.Header>

      <Nav>
        <NavItem href="#">Home</NavItem>
        <NavDropdown title="Lessons" id="basic-nav-dropdown">
          {menuItems}
        </NavDropdown>
        <NavItem href="#about">About</NavItem>
      </Nav>
    </Navbar>;

    const BottomNav = <Row>
      <Col md={12}>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              Next Text
            </Navbar.Brand>
          </Navbar.Header>

          <Nav pullRight={true}>
            <NavItem href="#nextItem">
              <span style={{marginLeft: "-4em"}}>Next</span> &gt;&gt;
            </NavItem>
          </Nav>
        </Navbar>
      </Col>
    </Row>;

    return (
      <div>
        {TopNav}
        <Grid style={styles.contentRenderer}>
            <ContentRenderer />
            {BottomNav}
        </Grid>
        
      </div>
    );
  }
}

export default App;
