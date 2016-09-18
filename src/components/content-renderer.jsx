import React, { Component } from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import Console from './console';
import Editor from './editor';

class ContentRenderer extends Component {
    render() {
        return <Grid>
            <Row>
                <Col md={12}>
                    <h2>HEADING</h2>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    intro
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Editor />
                </Col>

                <Col md={6}>
                    <Console />
                </Col>
            </Row>
        </Grid>;
    }
}

export default ContentRenderer;