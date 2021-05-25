var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var mysql = require('mysql');
var qs = require('querystring');
var http = require('http');
var path = require('path');
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var MySQLstore = require('express-mysql-session')(session);
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json')
const lowdbstore = require('lowdb-session-store')(session);
const db = low(adapter)
db.defaults({users:[], sessions:[]}).write();

//app.engine('.html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

// var db = mysql.createConnection({
//     host     : '13.124.179.142',
//     user     : 'TestMan',
//     password : 'a5375309!',
//     database : 'TestDB'
// });
// db.connect();

// var db = mysql.createConnection({
//     host     : '127.0.0.1',
//     user     : 'root',
//     password : 'rlarkddn13579!',
//     database : 'login'
// });
// db.connect();

app.use(session({
    secret: 'agdfsg#@$dg',
    resave: false,
    saveUninitialized: false,
    store:new lowdbstore(db.get('sessions'), {
        ttl: 86400
    })
}))

app.use(flash());

if(db.find('users').find({email:'5359663'})){
    var email = '5359663';
    var pwd = '111111';
    //비밀번호 암호화하기
    bcrypt.hash(pwd, 10, function(err, hash) {
        var user = {
            id: shortid.generate(),
            email: email,
            password: hash,
        }
        db.get('users').push(user).write();
    })
}

var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
const shortid = require('shortid');
    
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    if(user){
        console.log('serializeUser', user);
        done(null, user.email);
    }
});
  
passport.deserializeUser(function(id, done) {
    var user = db.get('users').find({email:id}).value();
    console.log('deserializeUser', id, user);
    done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
},
function(email, password, done) {
    console.log('LocalStrategy',email, password);
    var user = db.get('users').find({email:email}).value();
    if(user) {
        //암호화된 비밀번호 비교하기
        bcrypt.compare(password, user.password, function(err, result) {
            if(result) {
                return done(null, user, { message: 'Welcome.' });
            } else {
                return done(null, false, { message: 'Incorrect user password.'});
            }
        });
    } else {
        return done(null, false, {message: 'not exist email'})
    }    
}
));

app.get('/', function (request, response) {
    var fmsg = request.flash();
    var feedbacks = '';
    if(fmsg.message) {
        feedbacks = fmsg.message[0];
    }
    console.log("feedback",feedbacks);
    console.log("success", __dirname + request.url);
    response.render('login.ejs', {feedback:feedbacks});
});

app.post('/login_process', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("login failure");
            req.session.save(function () {
                console.log('info', info.message);
                req.flash('message', info.message);
                return req.session.save(function() {
                    res.redirect('/');
                });
            });
        }
        req.logIn(user, function (err) {
            console.log("login success");
            if (err) { return next(err); }
            req.session.save(function () {
                console.log('login success info', info.message);
                res.redirect('/index');
                return;
            });
        });
    })(req, res, next);
});

app.get('/index', function(req, res){
    console.log(req.session.passport.user);
    console.log("success", __dirname + req.url);
    res.render('index.ejs');
})

app.use('*', function(req, res, next) {
    console.log("fails", __dirname + req.url);
    res.status(404).send('Sorry cant find that!');
});

app.listen(4000, function(){
    console.log('server is listening on port 4000...');
})
