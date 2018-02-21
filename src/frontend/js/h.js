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
 * @param {Object} props arguments for the component
 * @param {HTMLElement[]|HTMLElement|undefined} childs
 */
function H(component, props, childs){
    return component(props || {}, childs && [].concat(childs) || []);
}

/**
 * manipulate DOM easily
 */
var Store = (function () {

    function is(x, y) {
        if (x === y) {
            return x !== 0 || y !== 0 || 1 / x === 1 / y
        } else {
            return x !== x && y !== y
        }
    }
    function shallowEqual(a,b) {
        if (is(a, b)) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                if (!b.hasOwnProperty(key)) {
                    return false;
                }
                var equals = is(a[key], b[key]);
                if (equals === false) return false;
            }
        }
        return true;
    }
    function identity(a) {
        return a;
    }

    function Store(initialState, reducer) {
        this.state = initialState;
        this.reducer = reducer || this.reducer;
    }

    Store.prototype.mount = function(root, app) {
        this.root = root;
        this.app = app;
        /*this.dispatch('__INIT__');*/
        this.node = this.app(this.state);
        root.appendChild(this.node);
        return this.node;
    };

    Store.prototype.dispatch = function(action, payload) {
        var newState = this.reducer(this.state, action, payload);
        console.log('---------- DISPATCH ------------ state & newState', this.state, newState);
        if (newState !== this.state) {
            this.state = newState;
            var node = this.app(this.state);
            this.root.replaceChild(node, this.node);
            this.node = node;
        }
        return this.state;
    };

    Store.prototype.reducer = function(state, action, payload) {
        switch (action) {
            default:
                return state;
        }
    };

    Store.prototype.connect = function(component, mapStateToProps) {
        mapStateToProps = mapStateToProps || identity;
        var self = this;

        var node;
        var props;
        var childs;
/*        var connector = function(newProps, newChildren) {
            const mergedProps = Object.assign({}, newProps, mapStateToProps(self.getState()));
            console.log('--------------- ' + component.name + ' ------------- connector');
            console.log('--------------- ' + component.name + ' ------------- state', self.getState());
            console.log('--------------- ' + component.name + ' ------------- actual props & childs', props, childs);
            console.log('--------------- ' + component.name + ' ------------- new props & childs', mergedProps, newChildren);
            console.log('--------------- ' + component.name + ' ------------- diffs props & childs', !shallowEqual(props, mergedProps), !shallowEqual(childs, newChildren));
            if (!shallowEqual(props, mergedProps) || !shallowEqual(childs, newChildren)) {
                console.log('--------------- ' + component.name + ' ------------- trigger rendering');
                props = mergedProps;
                childs = newChildren;
                node = component(props);
            }
            return node;
        };
        connector.name = 'Connect(' + component.name + ')';*/
        return function(newProps, newChildren) {
            const mergedProps = Object.assign({}, newProps, mapStateToProps(self.getState()));
            console.log('--------------- ' + component.name + ' ------------- connector');
            console.log('--------------- ' + component.name + ' ------------- state', self.getState());
            console.log('--------------- ' + component.name + ' ------------- actual props & childs', props, childs);
            console.log('--------------- ' + component.name + ' ------------- new props & childs', mergedProps, newChildren);
            console.log('--------------- ' + component.name + ' ------------- diffs props & childs', !shallowEqual(props, mergedProps), !shallowEqual(childs, newChildren));
            if (!shallowEqual(props, mergedProps) || !shallowEqual(childs, newChildren)) {
                console.log('--------------- ' + component.name + ' ------------- trigger rendering');
                props = mergedProps;
                childs = newChildren;
                node = component(props);
            }
            return node;
        }
    }

    Store.prototype.getState = function () {
        return Object.assign({}, this.state);
    };

    Store.prototype.createComponent = function(component, name) {
        component.name = name || component.name;
        return this.connect(component);
    }

    return Store;

})();