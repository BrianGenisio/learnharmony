import React, { Component } from 'react';
import {FormGroup, FormControl, Button} from 'react-bootstrap';

import codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';

class Editor extends Component {
    updateCodeMirror() {
        const host = document.getElementById('codeInput');
        
        if(!this.codeMirror) {
            this.codeMirror = codemirror.fromTextArea(host, {
                lineNumbers: true,
                mode: "javascript"
            });
        }

        this.codeMirror.setValue(this.props.code);
    }

    render() {
        setTimeout(() => this.updateCodeMirror(), 0);

        return <div>
            <FormGroup>
                <FormControl componentClass="textarea" rows="6" id="codeInput" />
            </FormGroup>
            <FormGroup>
                <Button block>Run!</Button>
            </FormGroup>
            <div>Module Name: <span className="module-name"></span></div>
        </div>;
    }
}

export default Editor;