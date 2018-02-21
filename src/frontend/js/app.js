import Component from "./Component";
import { store } from "./store";
import { H } from "./h";

const root = document.getElementById('root');

const node = store.mount(root, function (state) {
    return H(Component, null, []);
});

// store.unmount()