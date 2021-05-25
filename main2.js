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
var MySQLStore = require('express-mysql-session')(session);
// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('db.json')
// const lowdbstore = require('lowdb-session-store')(session);
// const db = low(adapter)
// db.defaults({users:[], sessions:[]}).write();

//app.engine('.html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

// var options = {
//     host     : '',
//     port     : 3306,
//     user     : 'root',
//     password : '',
//     database : 'login'
// };

var options = {
    host     : '13.124.179.142',
    port     : 3306,
    user     : 'TestMan',
    password : 'a5375309!',
    database : 'TestDB'
};

var db = mysql.createConnection(options);
var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'agdfsg#@$dg',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

// app.use(session({
//     secret: 'agdfsg#@$dg',
//     resave: false,
//     saveUninitialized: false,
//     store:new lowdbstore(db.get('sessions'), {
//         ttl: 86400
//     })
// }))

app.use(flash());

// db.query("select * from 로그인 where ID = 5469866", function(err, result, fields) {
//     console.log(result[0]);
//     if(err) throw err;
//     if(!result[0]) {
//         var email = '5469866';
//         var pwd = '222222';
//         bcrypt.hash(pwd, 10, function(err, hash) {
//             var user = [
//                 [5, email, hash, 1, 5469866]
//             ]
//             var sql = "insert into 로그인 (로그인ID, ID, 비밀번호, 권한, 학번) values ?"
//             db.query(sql, [user], function(err, result1) {
//                 if(err) throw err;
//                 console.log("insert success");
//             })
//         })
//     }
// })

var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
const shortid = require('shortid');
    
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    if(user){
        console.log('serializeUser', user);
        done(null, user.학번);
    }
});
  
passport.deserializeUser(function(id, done) {
    db.query("select * from 로그인 where ID = ?", [id], function(err, result, fields) {
        console.log(result[0]);
        if(err) throw err;
        if(result[0]) {
            console.log('deserializeUser', id, result[0]);
            done(null, result[0]);
        }
    })
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
},
function(email, password, done) {
    console.log('LocalStrategy',email, password);
    db.query("select * from 로그인 where ID = ?", [email], function(err, result, fields) {
        console.log(result[0]);
        if(err) throw err;
        if(result[0]) {
            bcrypt.compare(password, result[0].비밀번호, function(err, result1) {
                console.log("result : ", result);
                if(result1) {
                    return done(null, result[0], { message: 'Welcome.' });
                } else {
                    return done(null, false, { message: 'Incorrect user password.'});
                }
            });
        } else {
            return done(null, false, {message: 'not exist email'})
        }
    })
    // if(user) {
    //     //암호화된 비밀번호 비교하기
    //     bcrypt.compare(password, user.password, function(err, result) {
    //         if(result) {
    //             return done(null, user, { message: 'Welcome.' });
    //         } else {
    //             return done(null, false, { message: 'Incorrect user password.'});
    //         }
    //     });
    // } else {
    //     return done(null, false, {message: 'not exist email'})
    // }    
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
        console.log("user : ", user);
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
            console.log('login success info', info.message);
            req.session.save(function () {
                res.redirect('/index');
                return;
            });
        });
    })(req, res, next);
});

app.get('/logout_process',function(req,res){
    req.logOut();
    req.session.save(function(){
        res.redirect('/');
    })
});

app.get('/index', function(req, res){
    console.log("----------------------------------");
    console.log(req.session.passport.user);
    var user_id = req.session.passport.user;

    var subcode = [];
    new Promise(function(resolve){
        db.query("Select * From 성적 where 학번 = ?", [user_id] , function(err, result, fields) {  //?부분이 [user_id]값과 같은 것을 찾음
            console.log("성적result: ", result);
            var lecture = '';

            for(var i = 0; i < result.length; i++) {
                subcode[i] = result[i].과목코드;
            }
            console.log(subcode);

            db.query("Select * from 과목 where 과목코드 in (?) order by 시간", [subcode] , function(err, result1, fields1){
                console.log("result111", result1);
                db.query("SELECT * FROM 교수 WHERE 교수코드 in (?) ",  [result1[0].교수코드], function(err,result2,fields2){
                    console.log("교수result2", result2);
                    
                    if(result2[0]){
                        lecture = [result1[0].과목명, result2[0].이름, result1[0].시간];
                        console.log('here',lecture);
                        resolve(lecture);
                    }
                });
            });
        });
    }).then(function(lecture1){
        console.log("Promise lecture: ", lecture1);
        const notice = new Promise(function(resolve) {
            db.query("Select * from 공지사항 where 과목코드 in (?) order by 날짜 DESC", [subcode] , function(err, result1, fields1){
                console.log("result1", result1);
                var notice = new Array();
                if(result1[0]){
                    for(var i=0; i<result1.length && i<4; i++){
                        notice[i] = result1[i].제목;
                    }
                    console.log('공지', notice);
                    resolve(notice);
                    //res.render('index.ejs', {notice:notice,lecture:lecture});
                } else{
                    console.log("fail: load notice");
                }
            })
        })
        
        Promise.all([notice]).then(function(notice){
            const new_notice = notice[0];
            console.log("lecture, notice :", lecture1, notice);
            res.render('index.ejs', {lecture:lecture1, notice:new_notice});
        })
    })
})

app.use('*', function(req, res, next) {
    console.log("fails", __dirname + req.url);
    res.status(404).send('Sorry cant find that!');
});

app.listen(4000, function(){
    console.log('server is listening on port 4000...');
})