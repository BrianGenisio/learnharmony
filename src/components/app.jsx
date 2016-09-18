import React, { Component } from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col} from 'react-bootstrap';

import ContentRenderer from './content-renderer';

const styles = {
  contentRenderer: {
    marginBottom: "2em"
  }
};

class App extends Component {
  render() {
    const TopNav = <Navbar inverse fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">Learn Harmony (ES2015) Now!</a>
        </Navbar.Brand>
      </Navbar.Header>

      <Nav>
        <NavItem href="#">Home</NavItem>
        <NavDropdown title="Lessons" id="basic-nav-dropdown">
          <MenuItem href="#somelesson">Some Lesson</MenuItem>
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
