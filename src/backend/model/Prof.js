class Prof {
    constructor(email, name, firstname, polls = []) {
        this.email = email;
        this.name = name;
        this.firstname = firstname;
        this.polls = polls;
        this.admin = true;
    }

    toString() {
        return `${this.name} ${this.firstname}`;
    }
}

module.exports = Prof;