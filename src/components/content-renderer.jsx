import React, { Component } from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import Console from './console';
import Editor from './editor';

class ContentRenderer extends Component {
    render() {
        const {content} = this.props;

        return <Grid>
            <Row>
                <Col md={12}>
                    <h2>{content.heading}</h2>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <div dangerouslySetInnerHTML={
                        {__html: content.intro}
                    }></div>
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