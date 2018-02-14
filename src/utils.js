const promisify = (fn) => () => {
    const args = arguments;
    return new Promise((resolve, reject) => {
        fn.apply(null, [... args, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        }]);
    });
}

const log = function() {
    console.log(...arguments);
};

module.exports = {
    promisify,
    log
};