var express = require('express');
var app = express();
var mysql = require('mysql');
var qs = require('querystring');
var bcrypt = require('bcrypt');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);


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

var subcode = [];
const lecture = new Promise(function(resolve){

    db.query("Select * From 성적 where 학번 = ?", [5359663] , function(err, result, fields) {  //?부분이 [user_id]값과 같은 것을 찾음
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
}).then(function(result){
    console.log("Promise lecture: ", result);
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
})

Promise.all([notice]).then(function(values){
    console.log("lecture, notice :", result, values);
})



















// var sql = "INSERT INTO login_set (id, email, password) VALUES ?";
// var users = [
//     [1, '5359663', '111111'],
//     [2, '5469866', '123456'],
//     [3, '5469666', '222222'],
// ];


       
// // //비밀번호 암호화하기
// // bcrypt.hash(users[2][2], 10, function(err, hash) {
// //     var user = [
// //         [users[2][0], users[2][1], hash]
// //     ]
// //     db.query(sql, [user], function(err, result) {
// //         if (err) throw err;
// //         console.log("insert into " , result);
// //     })
// // });



// db.query("Select * From login_set where email = ?", [users[0][1]], function(err, result, fields) {
//     console.log(result);
//     console.log(result.length);
//     if (err) throw err;
//     if(result[0]){
//         bcrypt.compare(users[0][2], result[0].password, function(err, result1) {
//             if(result1) {
//                 console.log("login success");
//                 db.query("Select * From notices where email = ?", [users[0][1]], function(err, result2, fields2) {
//                     console.log(result2.length);
//                     if(result2[0]) {
//                         for(var i = 0; i < result2.length; i++) {
//                             console.log(result2[i].notice);
//                         }
//                     } else {
//                         console.log("not exist notices data");
//                     }
//                 });
//             } else {
//                 console.log("login failure");
//                 console.log('unloaded notices');
//             }
//         });
//     } else {
//         console.log("fail: not exist login_set data")
//     }
// });