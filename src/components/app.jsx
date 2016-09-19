import React, { Component } from 'react';
import {connect} from 'react-redux';

import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col} from 'react-bootstrap';

import ContentRenderer from './content-renderer';

const styles = {
  contentRenderer: {
    marginBottom: "2em"
  }
};

class App extends Component {
  render() {
    const {contentPage, contentOptions} = this.props;

    const menuItems = contentOptions.map(page => {
      return <MenuItem href={`#${page.route}`} key={page.route}>{page.title}</MenuItem>
    });

    const TopNav = <Navbar inverse fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#/">Learn Harmony (ES2015) Now!</a>
        </Navbar.Brand>
      </Navbar.Header>

      <Nav>
        <NavItem href="#/">Home</NavItem>
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
              {contentPage.nextText}
            </Navbar.Brand>
          </Navbar.Header>

          <Nav pullRight={true}>
            <NavItem href={'#' + contentPage.next}>
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
            <ContentRenderer content={contentPage} />
            {BottomNav}
        </Grid>
        
      </div>
    );
  }
}

const mapStateToProps = ({page, contentOptions}, {route}) => {    
    return {contentPage: page, contentOptions};
};

export default connect(mapStateToProps)(App);
