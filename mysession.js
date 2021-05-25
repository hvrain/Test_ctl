var express = require('express');
var app = module.exports = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var db = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'rlarkddn13579!',
    database : 'login'
});
db.connect();

app.use(session({
    secret: 'agdfsg#@$dg',
    resave: false,
    saveUninitialized: false,
    store:new lowdbstore(db.get('sessions'), {
        ttl: 86400
    })
}))