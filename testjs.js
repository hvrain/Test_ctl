const spawn = require('child_process').spawn;
const { PythonShell } = require("python-shell")
const path = require('path')

var data = {
    user: '5359663',
    scores: ['50', '70', '80']
}

let options = {
    scriptPath: path.join(__dirname, "/"),
    args: [JSON.stringify(data)]
};

PythonShell.run("testpy.py", options, function(err, result){
    if (err) throw err;
    console.log(data);
    console.log(JSON.parse(result[0]));
    var arr = JSON.parse(result[0]);
    console.log(arr.user);

})

// // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행 
// const result = spawn('python', ['testpy.py', data]);

// // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다. 
// result.stdout.on('data', function(result1) {
//     console.log(result1);
// }); 

// // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다. 
// result.stderr.on('data', function(data) {
//     console.log(data.toString()); 
// });

// result.stdin.write(JSON.stringify(data));
// result.stdin.end();