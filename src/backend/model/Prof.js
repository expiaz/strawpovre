const md5 = require("md5");

class Prof {

    constructor(email, encryptedPassword, name, firstname) {
        this._email = email;
        this._name = name;
        this._firstname = firstname;
        this._encryptedPassword = encryptedPassword;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get plainPassword() {
        return this._plainPassword;
    }

    set plainPassword(value) {
        this._plainPassword = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get firstname() {
        return this._firstname;
    }

    set firstname(value) {
        this._firstname = value;
    }

    get encryptedPassword() {
        return this._encryptedPassword;
    }

    set encryptedPassword(value) {
        this._encryptedPassword = value;
    }
}