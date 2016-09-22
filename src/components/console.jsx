import React, { Component } from 'react';
import {connect} from 'react-redux';
import {FormGroup, Button} from 'react-bootstrap';

import {consoleClear} from '../redux/actions';

const styles = {
    output: {height: "21.5em"},
    outputRender: {height: "100%"}
};

class Console extends Component {
    render() {
        const {consoleOutput, onClear} = this.props;

        return <div>
            <FormGroup style={styles.output}>
                <pre style={styles.outputRender}>{consoleOutput}</pre>
            </FormGroup>
            <FormGroup>
                <Button block onClick={onClear}>Clear Log</Button>
            </FormGroup>
        </div>;
    }
}

function mapStateToProps({consoleLog}) {
    const consoleOut = consoleLog
        .map(line => `console > ${line}`)
        .reduce((out, line) => `${out}${line}\n`, '');

    
    return {consoleOutput: consoleOut || 'console > '};
}

function mapDispatchToProps(dispatch) {
    return {
        onClear: () => dispatch(consoleClear())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Console);