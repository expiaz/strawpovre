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
    for (var key in a) if (a.hasOwnProperty(key) && (!b.hasOwnProperty(key) || !is(a[key], b[key]))) return true;
    for (var key in b) if (b.hasOwnProperty(key) && !a.hasOwnProperty(key)) return true;
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

function camelize(str) {
    return str.replace(/([\w])[_-]([\w])/g, function (fullMatch, before, after) {
        return before + after.toUpperCase();
    })
}

function hyphenize(str) {
    return str.replace(/([A-Z])/g, '-$1');
}

function styled(stylesheet) {
    var declaration = stylesheet && stylesheet[0] || '';
    return declaration.split('\n').reduce(function (css, line) {
        const pieces = line.trim().split(':');
        if (pieces.length !== 2) {
            return css;
        }
        css[camelize(pieces[0])] = pieces[1].trim().replace(';', '');
        return css;
    }, {})
}

/**
 * hyperscript (jsx) helper function to write dom manipulations
 * @param selector {string}
 * @param attrs {Object|undefined}
 * @param childs {HTMLElement[]|HTMLElement|undefined}
 * @return {HTMLElement|HTMLElement[]}
 */
function h(selector, attrs, childs) {
    var pcs = selector.split('.'),
        pcs = pcs[0].split('#'),
        name = pcs[0] || 'div',
        id = pcs[1] || '',
        node = document.createElement(name);

    attrs = attrs || {};

    if (id.length) {
        node.id = id;
    }

    for(var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            switch (key) {
                case 'className':
                    node.className = Object.keys(attrs[key])
                        .filter(function(cls) {
                            return !!attrs[key][cls];
                        })
                        .concat(pcs.length > 1 && pcs.slice(1) || [])
                        .join(' ');
                    break;
                case 'data':
                    for (var dataProp in attrs[key])
                        if (attrs[key].hasOwnProperty(dataProp))
                            node.dataset[dataProp] = typeof attrs[key][dataProp] === 'object'
                                ? JSON.stringify(attrs[key][dataProp])
                                : String(attrs[key][dataProp]);
                    break;
                case 'style':
                    for (var styleProp in attrs[key])
                        if (attrs[key].hasOwnProperty(styleProp))
                            node.style[styleProp] = String(attrs[key][styleProp]);
                    break;
                case 'on':
                    for (var event in attrs[key]) {
                        if (!attrs[key].hasOwnProperty(event) || typeof attrs[key] !== 'function') continue;
                        node.addEventListener(event, attrs[key]);
                        /*var target = node;
                        var handler = attrs[key][event];
                        if (!~event.indexOf(':')) {
                            var namespaces = event.split(':');
                            event = namespaces.pop();
                            var handler = namespaces.reduce(function (base, ns) {
                                return base[ns];
                            }, window);
                            if (! (handler instanceof EventTarget)) break;
                        }
                        target.addEventListener(event, handler);*/
                    }
                    break;
                default:
                    if(key.length > 3 && key.slice(0, 2) === 'on'
                        && (key.charCodeAt(3) - 90 <= 25)
                        && typeof attrs[key] === 'function') { // onClick ...
                        // handler
                        node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
                    } else if (key.length > 5 && key.slice(0, 4) === 'data'
                        && key.charCodeAt(4) - 90 <= 25) { // dataName ...
                        var value;
                        var data = hyphenize(key.slice(4)).toLowerCase();
                        if (typeof attrs[key] === 'object') {
                            value = JSON.stringify(attrs[key]);
                        } else {
                            value = String(attrs[key]);
                        }
                        node.dataset[data] = value;
                    } else if (node.style.hasOwnProperty(key)) { // fontSize ...
                        node.style[key] = String(attrs[key]);
                    } else { // href ...
                        node.setAttribute(key, attrs[key]);
                    }
                    break;
            }
        }
    }

    (childs && [].concat(childs) || []).forEach(function (child) {
        return node.appendChild(
            typeof child === 'string' ? document.createTextNode(child) : child
        );
    });

    return node;
}

/**
 * helper to create 'component' like groups of dom nodes
 * @param {Function} component the component to render
 * @param {Object|undefined} props arguments for the component
 * @param {HTMLElement[]|HTMLElement|undefined} childs
 */
function H(component, props, childs){
    var node, props, children;
    return function(newProps, newChildren) {
        newProps = props || {};
        newChildren = newChildren && [].concat(newChildren) || [];
        if (shallowDiff(props, children) || shallowDiff(childs, newChildren)) {
            props = Object.assign({}, newProps);
            childs = newChildren.slice();
            node = component(newProps, newChildren);
        }
        // TODO diffs dom
        return node;
    }
}

/**
 * manipulate DOM easily
 */
var Store = (function () {

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
    };

    /**
     *
     * @param action {String}
     * @param payload {Object}
     * @return {Object} the new state
     */
    Store.prototype.dispatch = function(action, payload) {
        if (typeof action === 'object') {
            payload = action;
            action = payload.type;
        }
        if (typeof payload.payload === 'object') {
            payload = payload.payload;
        }
        var actualState = this.getState();
        var newState = this.reducer(actualState, action, payload);
        console.log('---------- DISPATCH ------------ state & newState', actualState, newState);
        if (newState !== actualState || shallowDiff(actualState, newState)) {
            this.state = newState;
            var node = this.render(this.getState());
            this.root.replaceChild(node, this.node);
            this.node = node;
        }
        return this.state;
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
     * @return {Object}
     */
    Store.prototype.getState = function () {
        return Object.assign({}, this.state);
    };

    return Store;
})();

/*
const initialState = {
        todos: [],
        done: false
    };

    const actions = {
        ADD_TODO: 0,
        TOGGLE_TODO: 1,
        TOGGLE_MODE: 2,
    };

    var todoId = 0;

    const addTodo = name => ({
        type: actions.ADD_TODO,
        payload: {
            id: ++todoId,
            name: name,
            done: false
        }
    })

    const toggleTodo = todo => ({
        type: actions.TOGGLE_TODO,
        payload: todo
    })

    const toggleMode = () => ({
        type: actions.TOGGLE_MODE
    })

    const store = new Store(initialState, (state, action, payload) => {
        switch (action) {
            case actions.ADD_TODO:
                return Object.assign({}, state, {
                    todos: state.todos.concat(payload)
                });
                break;

            case actions.TOGGLE_TODO:
                return Object.assign({}, state, {
                    todos: state.todos.map(todo => {
                        if(todo.id === payload.id) {
                            todo.done = !todo.done;
                        }
                        return todo;
                    })
                });
                break;

            case actions.TOGGLE_MODE:
                return Object.assign({}, state, {done: !state.done});
                break;

            default:
                return state;
        }
    });

    const Todo = function (todo) {
        return h('li', {
            className: {
                done: todo.done
            },
        }, [
            h('span', null, todo.name),
            h('button', {
                onClick: function () {
                    store.dispatch(toggleTodo(todo))
                }
            }, todo.done ? 'undone' : 'done')
        ]);
    };

    const App = function (state) {
        return h('div', null, [
            h('h1', {
                fontSize: '40px',
                color: 'red'
            }, 'Todo App'),
            h('button', {
                onClick: function () {
                    store.dispatch(toggleMode())
                }
            }, state.done ? 'Show undones' : 'Show dones'),
            h('ul', null, state.todos
                .filter(todo => todo.done === state.done)
                .map(todo => Todo(todo))
            ),
            h('input', {
                type: 'text',
                placeholder: 'Add a todo ...',
                onKeyup: function (e) {
                    var val = e.target.value.trim();
                    if (val.length && e.which === 13) {
                        store.dispatch(addTodo(val));
                        e.target.value = '';
                    }
                }
            })
        ])
    };

    store.mount(document.getElementById('root'), App);
 */