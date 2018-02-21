/**
 * hyperscript (jsx) helper function to write dom manipulations
 * @param selector {string}
 * @param attrs {Object|undefined}
 * @param childs {HTMLElement[]|undefined}
 * @return {HTMLElement|HTMLElement[]}
 */
function h(selector, attrs, childs) {
    var pcs = selector.split('.'),
        pcs = pcs[0].split('#'),
        name = pcs[0] || 'div',
        id = pcs[1] || '',
        node = document.createElement(name);

    if (id.length) {
        node.id = id;
    }

    for(var key in (attrs || {})) {
        switch (key) {
            case 'className':
                if (typeof attrs[key] !== 'object') {
                    break;
                }
                node.className = attrs[key].filter(cls => !!attrs[key][cls]).concat(pcs.length > 1 && pcs.slice(1) || []).join(' ');
                break;
            case 'data':
                if (typeof attrs[key] !== 'object') {
                    break;
                }
                for (var dataProp in attrs[key]) {
                    node.dataset[dataProp] = attrs[key][dataProp];
                }
                break;
            case 'style':
                if (typeof attrs[key] !== 'object') {
                    break;
                }
                for (var styleProp in attrs[key]) {
                    node.style[styleProp] = attrs[key][styleProp];
                }
                break;
            case 'on':
                if (typeof attrs[key] !== 'object') {
                    break;
                }
                for (var event in attrs[key]) {
                    var target = node;
                    var handler = attrs[key][event];
                    if (!~event.indexOf(':')) {
                        var namespaces = event.split(':');
                        event = namespaces.pop();
                        var handler = namespaces.reduce((base, ns) => base[ns], window);
                        if (! (handler instanceof EventTarget)) break;
                    }
                    target.addEventListener(event, handler);
                }
                break;
            default:
                if(key.length > 3 && key[0] === 'o' && key[1] === 'n' && (key.charCodeAt(3) - 90 <= 25) && typeof attrs[key] === 'function') {
                    // handler
                    node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
                } else {
                    node.setAttribute(key, attrs[key]);
                }
                break;
        }
    }

    (childs && [].concat(childs) || []).forEach(child => node.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child
    ));

    return node;
}

/**
 * helper to create 'component' like groups of dom nodes
 * @param {Function} component the component to render
 * @param {Object|undefined} props arguments for the component
 * @param {HTMLElement[]|HTMLElement|undefined} childs
 */
function H(component, props, childs){
    return component(props || {}, childs && [].concat(childs) || []);
}

/**
 * manipulate DOM easily
 */
var Store = (function () {

    /**
     *
     * @param x {*}
     * @param y {*}
     * @return {boolean}
     */
    function is(x, y) {
        if (x === y) {
            return x !== 0 || y !== 0 || 1 / x === 1 / y
        } else {
            return x !== x && y !== y
        }
    }

    /**
     *
     * @param a {Object}
     * @param b {Object}
     * @return {boolean}
     */
    function shallowDiff(a,b) {
        if (is(a, b)) return false;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return true;
        if (Object.keys(a).length !== Object.keys(b).length) return true;
        for (var key in a) if (a.hasOwnProperty(key) && (!b.hasOwnProperty(key) || !is(a[key], b[key]))) return true;
        return false;
    }

    /**
     *
     * @param a {*}
     * @return {*}
     */
    function identity(a) {
        return a;
    }

    /**
     *
     * @param initialState {Object}
     * @param reducer {Function}
     * @constructor
     */
    function Store(initialState, reducer) {
        this.state = initialState;
        this.reducer = reducer || this.reducer;
        this.mounted = false;
    }

    /**
     *
     * @param root {HTMLElement}
     * @param render {Function}
     * @return {HTMLElement} the mount point of the app
     */
    Store.prototype.mount = function(root, render) {
        if (this.mounted) {
            this.unmount();
        }
        this.root = root;
        this.render = render;

        this.node = render(this.getState());
        root.appendChild(this.node);
        this.mounted = true;

        return this.node;
    };

    /**
     *
     */
    Store.prototype.unmount = function () {
        while (this.root.firstChild) this.root.removeChild(this.root.firstChild);
        this.mounted = false;
    }

    /**
     *
     * @param action {String}
     * @param payload {Object}
     * @return {Object} the new state
     */
    Store.prototype.dispatch = function(action, payload) {
        var actualState = this.getState();
        var newState = this.reducer(actualState, action, payload);
        console.log('---------- DISPATCH ------------ state & newState', actualState, newState);
        if (newState !== actualState || shallowDiff(actualState, newState)) {
            this.state = newState;
            var node = this.render(actualState);
            this.root.replaceChild(node, this.node);
            this.node = node;
        }
        return this.state;
    };

    /**
     *
     * @param state {Object}
     * @param action {String}
     * @param payload {Object}
     * @return {*}
     */
    Store.prototype.reducer = function(state, action, payload) {
        switch (action) {
            default:
                return state;
        }
    };

    /**
     *
     * @param component
     * @param mapStateToProps
     * @return {Function}
     */
    Store.prototype.connect = function(component, mapStateToProps) {
        mapStateToProps = mapStateToProps || identity;
        var self = this;

        return function (nextProps, nextChildrens) {
            const mergedProps = Object.assign({}, nextProps, mapStateToProps(self.getState()));
            return component(mergedProps, nextChildrens);
        }
    }

    Store.prototype.getState = function () {
        return Object.assign({}, this.state);
    };

    return Store;

})();

export {
    Store,
    h,
    H
};