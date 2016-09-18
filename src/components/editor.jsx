import React, { Component } from 'react';
import {FormGroup, FormControl, Button} from 'react-bootstrap';

class Editor extends Component {
    render() {
        return <div>
            <FormGroup>
                <FormControl componentClass="textarea" rows="6" />
            </FormGroup>
            <FormGroup>
                <Button block>Run!</Button>
            </FormGroup>
            <div>Module Name: <span className="module-name"></span></div>
        </div>;
    }
}

export default Editor;