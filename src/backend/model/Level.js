const { log } = require('../../utils');

class Level {

    /**
     *
     * @param id {Number}
     * @param label {String}
     */
    constructor(id, label) {
        this.id = id;
        this.label = label;
    }
}

module.exports = Level;