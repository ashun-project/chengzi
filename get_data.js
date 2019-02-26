var request = require("request");
var cheerio = require('cheerio');
const iconv = require('iconv-lite');
var mysql = require('mysql');
var num = 8;//716
var dtNum = 0;
var arr = [];
var ip = [
    '14.192.76.22',
    '27.54.72.21',
    '27.224.0.14',
    '36.0.32.19',
    '36.37.40.21',
    '36.96.0.11',
    '39.0.0.24',
    '39.0.128.17',
    '40.0.255.24',
    '40.251.227.24',
    '42.0.8.21',
    '42.1.48.21',
    '42.1.56.22',
    '42.62.128.19',
    '42.80.0.15',
    '42.83.64.20',
    '42.96.96.21',
    '42.99.112.22',
    '42.99.120.21',
    '42.100.0.14',
    '42.157.128.20',
    '42.187.96.20',
    '42.194.64.18',
    '42.248.0.13',
    '43.224.212.22',
    '43.225.236.22',
    '43.226.32.19',
    '43.241.88.21',
    '43.242.64.22',
    '43.247.152.22',
    '45.116.208.24',
    '45.120.243.24'
];
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'vip'
});


function getAjax(url) {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: url,
            gzip: true,
            encoding: null,
            headers: {
                "X-Forwarded-For": ip[Math.floor(Math.random()*ip.length)] || '42.194.64.18',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'referer': 'http://www.66ip.cn/'
            }
        };
        request(options, function (error, response, body) {
            try {
                if (error) throw error;
                var buf = iconv.decode(body, 'UTF-8');//获取内容进行转码
                $ = cheerio.load(buf);
                resolve();
            } catch (e) {
                console.log(e)
                reject(e);
            }
        })
    });
}

function getList () {
    var url = 'https://51xiaoluoli.space/page/'+num;
    getAjax(url).then(function (){
        var li = $('.update_area_lists .i_list');
        var time = new Date().getTime();
        var img = '';
        var title = '';
        var url = '';
        for (var i = 0; i < li.length; i++) {
            if ($('.waitpic', li[i]).attr('data-original')) {
                img = $('.waitpic', li[i]).attr('data-original');
            } else {
                img = $('.waitpic', li[i]).attr('src')
            }
            title = $('.meta-title', li[i]).text();
            url = $('.meta-title', li[i]).attr('href');
            arr.push([(time+i).toString(), url, title, img]);
        }
        
        if (num > 1) {
            console.log('current page is========', num);
            num--;
            getList();
        } else {
            num = 2;
            if (arr.length) {
                var nArr = JSON.parse(JSON.stringify(arr));
                arr = [];
                dtNum = 0;
                listArr(nArr);
            }
        }
    }, function () {
        getList();
    });
}

function listArr (newArr) {
    if (dtNum < newArr.length) {
        var sql = 'select * from list where url =' + '"' + newArr[dtNum][1] +'"';
        pool.getConnection(function (err, conn) {
            if (err) console.log("detail ==> " + err);
            conn.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log('[newArr-error] - ', err.message);
                    conn.release();
                    listArr(newArr);
                } else {
                    if (rows.length) {
                        // console.log(rows);
                        dtNum++;
                        conn.release();
                        listArr(newArr);
                    } else {
                        var sql = "INSERT INTO list(createTime,url,title,img) VALUES (?,?,?,?)";
                        conn.query(sql, newArr[dtNum], function (err, rows, fields) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                listArr(newArr);
                            } else {
                                dtNum++;
                                listArr(newArr);
                            }
                            conn.release();
                        });
                    }
                }
            });
        });
    } else {
        console.log('get list end=', newArr.length);
        getDetail();
    }
}

function getDetail() {
    var sql = 'select * from list order by createTime desc limit 0,30';
    // var sql = 'select * from list';
    pool.getConnection(function (err, conn) {
        if (err) console.log("detail ==> " + err);
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                getDetail();
            } else {
                if (rows.length) {
                    dtNum = 0;
                    detailList(rows);
                }
            }
            conn.release();
        });
    });
}

function detailList (list) {
    if (dtNum === list.length) {
        console.log('end--', dtNum, 'current-time--', new Date().getTime());
        var date = new Date();
        var timeS = new Date(date.getFullYear() +'-' + (date.getMonth()+1) + '-' + date.getDate() + ' 23:00:00').getTime();
        setTimeout(function () {
            getList();
        }, timeS - date.getTime() + (6*60*60*1000)); // 8小时后重新调  
    } else {
        var sql = 'select * from defDetail where createTime =' + '"' + list[dtNum].createTime +'"';
        pool.getConnection(function (err, conn) {
            if (err) console.log("detail ==> " + err);
            conn.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log('[chear ERROR] - ', err.message);
                    conn.release();
                    detailList(list);
                } else {
                    if (rows.length) {
                        dtNum++;
                        conn.release();
                        detailList(list);
                    } else {
                        getAjax(list[dtNum].url).then(function () {
                            var video = $('#content video').attr('src');
                            if (video) {
                                var sql = "INSERT INTO defDetail(createTime,url,title, video) VALUES (?,?,?,?)";
                                var info = [list[dtNum].createTime, list[dtNum].url, list[dtNum].title, video];
                                conn.query(sql, info, function (err, rows, fields) {
                                    if (err) {
                                        console.log('[SELECT ERROR] - ', err.message);
                                    }else{
                                        console.log('add number'+dtNum+'data success');
                                    }
                                    conn.release();
                                });
                            } else {
                                var sql = 'DELETE FROM list where createTime = '+ '"' + list[dtNum].createTime +'"';
                                conn.query(sql, function (err, rows, fields) {
                                    if (err) {
                                        console.log('[SELECT ERROR] - ', err.message);
                                    }else{
                                        console.log('delete number'+dtNum+'data success');
                                    }
                                    conn.release();
                                });
                            }
                            dtNum++;
                            detailList(list);
                        }, function () {
                            detailList(list);
                        });
                    }
                }
            });
        }); 
    }
}

function getRepeat () {
    var sql = "select * from list where title in (select title from list group by title having count(title)>1)";
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);
        conn.query(sql, function (err, rows, fields) {
            if (err) console.log('[chear ERROR] - ', err.message);
            console.log(rows, '=======');
            conn.release();
        });
    });
}
function deleteNot() {
    var sql = 'SELECT list.* FROM list LEFT JOIN defDetail ON list.createTime = defDetail.createTime WHERE defDetail.createTime is null';
    var delSql = 'DELETE list FROM list LEFT JOIN defDetail ON list.createTime = defDetail.createTime WHERE defDetail.createTime is null';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);
        conn.query(sql, function (err, rows, fields) {
            if (err) console.log('[chear ERROR] - ', err.message);
            console.log(rows.length, '=======');
            conn.release();
        })
    });
}
// deleteNot()
getList();