import { Store } from './h';

const reducer = function(state, action, payload) {
    return { phase: action };
};

const initialState = {
    phase: actions.TICK
};

export const actions = {
    TICK: 'TICK',
    TOCK: 'TOCK'
};

export const store = new Store(initialState, reducer);