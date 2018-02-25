const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


/**
 * wrap a callback function into a promise
 * @param fn
 * @return {Function}
 */
const promisify = function (fn, to = null) {
    /**
     * @return {Promise}
     */
    return function() {
        const args = arguments;
        return new Promise(function (resolve, reject) {
            fn.apply(to, [... args, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }]);
        });
    }
}

const log = function() {
    console.log(...arguments);
};

const render = (view, ctx) =>
    ejs.render(fs.readFileSync(path.join(__dirname, `../public/${view}.ejs`), {encoding: 'utf-8'}), ctx);

module.exports = {
    promisify,
    log,
    render
};