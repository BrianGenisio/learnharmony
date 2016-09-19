import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers.js';

const rootReducer = combineReducers(reducers);

const createStoreWithMiddleware =
        applyMiddleware(thunkMiddleware)(createStore);

function create(initialState = {}) {
    return createStoreWithMiddleware(rootReducer, initialState);
}

export default create;