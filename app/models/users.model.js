var mysql = require('../config/mysql.configuration.js')

var db = mysql.getDb();

// Creates table users
module.exports = db.define('users', {
    id: { type: 'serial', key: true },
    username: { type: 'text', unique: true},
    password: String
}, {
        methods: {
            Username: function () {
                return this.username;
            }
        }
    }).sync();
