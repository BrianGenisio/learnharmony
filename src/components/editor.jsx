import React, { Component } from 'react';
import {connect} from 'react-redux';
import {FormGroup, FormControl, Button} from 'react-bootstrap';

import codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';

import {updateCode, executeCode} from '../redux/actions';

class Editor extends Component {
    updateCodeMirror() {
        const {code} = this.props;

        if(code && this.codeMirror) {
            const existingValue = this.codeMirror.getValue();

            if(code !== existingValue) {
                this.codeMirror.setValue(code);
            }
        }
    }

    componentDidMount() {
        const {onUpdateCode} = this.props;
        const host = document.getElementById('codeInput');
        
        this.codeMirror = codemirror.fromTextArea(host, {
            lineNumbers: true,
            mode: "javascript"
        });

        this.codeMirror.on('change', () => {
            onUpdateCode(this.codeMirror.getValue());
        });

        this.updateCodeMirror();
    }

    render() {
        const {code, moduleName, onExecuteCode} = this.props;
        
        if(this.codeMirror) {
            this.updateCodeMirror();
        }

        return <div>
            <FormGroup>
                <FormControl componentClass="textarea" rows="6" id="codeInput" />
            </FormGroup>
            <FormGroup>
                <Button block onClick={() => onExecuteCode(code, moduleName)}>Run!</Button>
            </FormGroup>
            <div>Module Name: {moduleName}</div>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onUpdateCode: code => dispatch(updateCode(code)),
        onExecuteCode: (code, moduleName) => dispatch(executeCode(code, moduleName))
    };
}

export default connect(
    ({code, moduleName}) => ({code, moduleName}), 
    mapDispatchToProps
)(Editor);