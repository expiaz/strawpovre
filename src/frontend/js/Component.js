import { store, actions } from "./store";
import { h } from "./h";

const Component = function (props, childs) {
    return h('div', {
        onClick: function (e) {
            const nextPhase = props.phase === actions.TICK ? actions.TOCK : actions.TICK;
            store.dispatch(nextPhase, {});
        }
    }, [
        props.phase
    ]);
};

const mapStateToProps = function (state) {
    return state;
};

export default store.connect(Component, mapStateToProps);