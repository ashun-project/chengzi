
var fs = require("fs");
var pathName = 'D:\\project\\vip\\public\\videos'
var list = fs.readdirSync(pathName);
var len = list.length;
var num = 0;
var mysql = require('mysql');
var poolY = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'vip'
});
function instDown(str) {
    var sql = 'SELECT * FROM defdetail where video like "' +'%'+ list[num] +'%'+ '"';
    num += 1;
    if (num > len) return;
    poolY.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);
        conn.query(sql, function (err, rows, fields) {
            if (err) console.log('[chear ERROR] - ', err.message);
            if (rows.length) {
                var sqlList = 'SELECT * FROM list_beifen where createTime = "' + rows[0].createTime + '"';
                conn.query(sqlList, function (err, rowsList, fields) {
                    if(err) console.log(err, '=========');
                    var sql2 = "INSERT INTO list(createTime,url,title, img) VALUES (?,?,?,?)";
                    var info = [rowsList[0].createTime, rowsList[0].url, rowsList[0].title, rowsList[0].img];
                    conn.query(sql2, info, function (err, rows, fields) {
                        if(err) {
                            console.log(err, '=========')
                        }
                    });
                    conn.release();
                    setTimeout(function () {
                        instDown()
                    }, 500);
                });
            } else {
                conn.release();
                instDown()
            }
            
        })
    });
}
instDown();