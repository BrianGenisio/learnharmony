import React, { Component } from 'react';
import {FormGroup, Button} from 'react-bootstrap';

const styles = {
    output: {height: "21.5em"},
    outputRender: {height: "100%"}
};

class Console extends Component {
    render() {
        return <div>
            <FormGroup style={styles.output}>
                <pre style={styles.outputRender}></pre>
            </FormGroup>
            <FormGroup>
                <Button block>Clear Log</Button>
            </FormGroup>
        </div>;
    }
}

export default Console;