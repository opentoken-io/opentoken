"use strict";

class Account {
    constructor(config, hotp, password, storage) {
        this.config = config;
        this.hotp = hotp;
        this.password = password;
        this.storage = storage;
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * TODO: Encrypt contents before putting to storage
     *
     * @return {Promise.<Object>}
     */
    initiate() {
        return this.hotp.generateSecret().then((secretKey) => {
            var contents, directory, expires, options;

            contents = {
                accountId: this.password.generate(28),
                salt: this.password.generate(128),
                mfa: secretKey
            };
            expires = new Date();
            expires = expires.setHours(expires.getHours() + 1);
            options = {
                expires: new Date(expires)
            }
            this.storage.configure(this.config.storage);
            directory = "account/" + this.password.hashContent(contents.accountId);

            return this.storage.put(directory, contents.toString(), options).then(() => {
                return contents;
            });
        });
    }
}

module.exports = Account;