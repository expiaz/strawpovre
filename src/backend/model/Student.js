class Student {
    constructor(email, name, firstname, poll = '') {
        this.email = email;
        this.name = name;
        this.firstname = firstname;
        this.poll = poll;
        this.admin = false;
    }

    toString() {
        return `${this.name} ${this.firstname}`;
    }
}

module.exports = Student;