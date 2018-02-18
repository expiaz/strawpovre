const mysql = require('mysql');

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

module.exports = {
    promisify,
    log,
};