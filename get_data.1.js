var request = require("request");
var cheerio = require('cheerio');
const iconv = require('iconv-lite');
var mysql = require('mysql');
var num = 2;
var dtNum = 0;
var arr = [];
var resour = 'http://mvxxoo.com';
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


function getAjax(url, met) {
    return new Promise((resolve, reject) => {
        var options = {
            method: met || 'GET',
            url: resour+url,
            gzip: true,
            encoding: null,
            headers: {
                "X-Forwarded-For": ip[Math.floor(Math.random()*ip.length)] || '42.194.64.18',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'referer': resour,
                'Cookie': "PHPSESSID=88f1qocpntbtjnp990pkqvo3a4; UM_distinctid=16846df58e71c8-0735f5020bd16-10326653-13c680-16846df58e8f22; CNZZDATA1273706240=1075868105-1547372666-http%253A%252F%252Fmvxoxo.com%252F%7C1547431260; CNZZDATA1275906764=206766016-1547375436-http%253A%252F%252Fmvxoxo.com%252F%7C1547430243"
            }
        };
        if (met) {
            options.json = {
                username: 'ashun',
                password: 'ashun666',
                redirect: ''
            }
        }
        request(options, function (error, response, body) {
            try {
                if (error) throw error;
                var buf = iconv.decode(body, 'UTF-8');//获取内容进行转码
                $ = cheerio.load(buf);
                resolve();
            } catch (e) {
                console.log(options.url, 'eeeeeeeß')
                reject(e);
            }
        })
    });
}

function getList () {
    getAjax(encodeURI('/亚洲在线xoxo日本在线,在线视频播放.html?page='+num)).then(function (){
        var li = $('ul.pic-list li');
        var title = '';
        var url = '';
        var img = '';
        var imgD = '';
        for (var i = 0; i < li.length; i++) {
            title = $('h2 a', li[i]).text();
            url = $('h2 a', li[i]).attr('href');
            img = '';
            imgD = $('.fly-case-img .img-responsive', li[i]).eq(0).attr('style');
            if (!imgD) {
                imgD = $('.fly-case-img .layui-carousel .img-responsive', li[i]).eq(0).attr('style');
            }
            if (imgD) {
                var sp = imgD.split('src=');
                if (sp.length > 1) {
                    img = sp[1].replace(/\"|\)/, '');
                    if (img.indexOf('http') == -1) img = "//mvxxoo.com/upload/"+img;
                }
            }
            arr.push({url:url, title: title, img: img});
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

function listArr (list) {
    if (dtNum === list.length) {
        console.log('end--', dtNum, 'current-time--', new Date().getTime());
        var date = new Date();
        var timeS = new Date(date.getFullYear() +'-' + (date.getMonth()+1) + '-' + date.getDate() + ' 23:00:00').getTime();
        setTimeout(function () {
            init();
        }, timeS - date.getTime() + (6*60*60*1000)); // 8小时后重新调  
    } else {      
        var sql = 'select * from list where url =' + '"' + list[dtNum].url +'"';
        pool.getConnection(function (err, conn) {
            if (err) console.log("detail ==> " + err);
            conn.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log('[chear ERROR] - ', err.message);
                    conn.release();
                    listArr(list);
                } else {
                    if (rows.length) {
                        dtNum++;
                        conn.release();
                        listArr(list);
                    } else {
                        getAjax(encodeURI(list[dtNum].url)).then(function () {
                            var fr = $('.detail-body.photos');
                            var sr = $('script', fr);
                            if (sr.length) {
                                var video = [];
                                // var img = $('p', fr).eq(0).find('img').attr('src');
                                var time = new Date().getTime();
                                var curTime = (time+dtNum).toString();
                                for(var i = 0; i < sr.length; i++) {
                                    var reTag = /url\:(?:.|\s)*?mp4/g;
                                    var ht = reTag.exec($(sr[i]).html());
                                    if (ht) {
                                        var ht2 = ht[0].replace(/url\:|\'|\"|\s/g, '');
                                        if (ht2.indexOf('mp4') > -1) {
                                            video.push(ht2);
                                        }
                                    }
                                }
                                if (video.length) {
                                    var sqlD = "INSERT INTO defDetail(createTime,url,title, video) VALUES (?,?,?,?)";
                                    var infoD = [curTime, list[dtNum].url, list[dtNum].title, video.join(',')];
                                    var sqlL = "INSERT INTO list(createTime,url,title,img) VALUES (?,?,?,?)";
                                    var info = [curTime, list[dtNum].url, list[dtNum].title, list[dtNum].img];
                                    conn.query(sqlL, info, function (err, rows, fields) {});
                                    conn.query(sqlD, infoD, function (err, rows, fields) {
                                        if (err) {
                                            console.log('[SELECT ERROR] - ', err.message);
                                        }else{
                                            console.log('add number'+dtNum+'data success');
                                        }
                                    });
                                }
                            } 
                            setTimeout(function () {
                                conn.release();
                                dtNum++;
                                listArr(list);
                            }, 1000);
                        }, function () {
                            listArr(list);
                        });
                    }
                }
            });
        });
    }
}

function init() {
    getAjax('/user/login/dologin.html', 'POST').then(function () {
        getList();
        ///portal/article/index/id/27.html
        // listArr([{url: '/portal/article/index/id/19123.html', title: '3423'}, {url:'/portal/article/index/id/19123.html', title: ''}, {url: '/清纯萝莉写真/19094.html', title: ''}]);
    }); // 先登入
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
            // getAjax('/user/login/dologin.html', 'POST').then(function () {
            //     listArr(rows);
            // });
        })
    });
}
init();
// getList();