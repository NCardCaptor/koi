var mysql = require('../config/mysql.configuration.js')

var db = mysql.getDb();

// Creates table users
module.exports = db.define('users', {
    id: {
        type: 'serial',
        key: true
    },
    username: {
        type: 'text',
        unique: true
    },
    password: String,
    status: String,
    lastModifyDate: Date,
    createDate: Date,
    caducityDate: Date
}, {
    methods: {
        Username: function () {
            return this.username;
        }
    }
});