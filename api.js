var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var router = express.Router();
var num = 0;        
var menu = [
    {url: '/', name: '首页'},
    {url: '/list/wumavideo.html', name: '无码性爱'},
    {url: '/list/sanjivideo.html', name: '三级在线'},
    {url: '/list/youmavideo.html', name: '有码视频'},
    {url: '/list/dongmanvideo.html', name: '卡通动漫'},
    {url: '/list/oumeivideo.html', name: '欧美性爱'},
    {url: '/list/zipaivideo.html', name: '网友自拍'},
    {url: '/list/lingleivideo.html', name: '另类视频'}
]
var getIp = function (req) {
    var ip = req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    num = num + 1;
    return ip;
};

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'down_list'
});

// 首页
router.get('/', function (req, res) {
    var sql = 'select a.* from (select * from youmavideolist order by createTime desc limit 4) a union all select b.* from (select * from oumeivideolist order by createTime desc limit 4) b union all select c.* from (select * from dongmanvideolist order by createTime desc limit 4) c union all select d.* from (select * from zipaivideolist order by createTime desc limit 4) d union all select e.* from (select * from sanjivideolist order by createTime desc limit 4) e';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL-index ==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                pageTitle: '茄子',
                pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
                pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
                host: 'http://'+req.headers['host'],
                menu: menu,
                result: ''
            }
            if (err) {
                res.render('index', listObj);
            } else {
                var obj = {
                    youmavideo: [],
                    oumeivideo: [],
                    dongmanvideo: [],
                    zipaivideo: [],
                    sanjivideo: []
                }
                var arr = [];
                for (var i = 0; i < result.length; i++) {
                    obj[result[i].type].push(result[i]);
                }
                arr = [
                    {type: 'youmavideo', list: obj.youmavideo, name: '有码性爱'},
                    {type: 'oumeivideo', list: obj.oumeivideo, name: '欧美性爱'},
                    {type: 'dongmanvideo', list: obj.dongmanvideo, name: '卡通动漫'},
                    {type: 'zipaivideo', list: obj.zipaivideo, name: '自拍偷拍'},
                    {type: 'sanjivideo', list: obj.sanjivideo, name: '三级在线'}
                ]
                listObj.result = arr;
                res.render('index', listObj);
            }
            conn.release();
        });
    })
})

// 获取列表
router.get('/list/:type', function getList (req, res) {
    var typeU = req.params.type || '';
    var params = typeU.split('.');
    var type = params[0].split('_');
    var listObj = {
        pageTitle: type[0]+'列表-茄子',
        pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu,
        type: type[0],
        result: []
    }
    res.render('list', listObj);
})
function getPage(total, currentPage, type, pSearch) {
    var totalPage = 0;//总页数
    var pageSize = 12;//每页显示行数
    var pageUrl = '/list/' + type;
    var pageSearch = pSearch? '?search=' + pSearch : '';
    //总共分几页
    if(total/pageSize > parseInt(total/pageSize)){
        totalPage=parseInt(total/pageSize)+1;
    }else{
        totalPage=parseInt(total/pageSize);
    }
    var tempStr = "<span>共"+totalPage+"页</span>";
    if(currentPage>1){
        tempStr += "<a href="+ pageUrl + '.html' + pageSearch + ">首页</a>";
        tempStr += "<a href="+ pageUrl + '_' + (currentPage-1) + '.html' + pageSearch +">上一页</a>"
    }else{
        tempStr += "<span class='btn'>首页</span>";
        tempStr += "<span class='btn'>上一页</span>";
    }

    if (currentPage > 5 && currentPage < (totalPage -5)) {
        for(var pageIndex= currentPage - 5; pageIndex<currentPage+5;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage > (totalPage -5) && totalPage >= 10){
        for(var pageIndex= (totalPage - 9); pageIndex < totalPage+1;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage <= 5 && totalPage > 10) {
        for(var pageIndex= 1; pageIndex <= 10;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else {
        for(var pageIndex= 1; pageIndex <= totalPage;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    }

    if(currentPage<totalPage){
        tempStr += "<a href="+ pageUrl + '_' + (currentPage+1) + '.html' + pageSearch +">下一页</a>";
        tempStr += "<a href="+ pageUrl + '_' + totalPage + '.html' + pageSearch +">尾页</a>";
    }else{
        tempStr += "<span class='btn'>下一页</span>";
        tempStr += "<span class='btn'>尾页</span>";
    }

    return tempStr;
}
router.post('/getList', function (req, res){
    var currUlr = req.headers.referer || req.body.url;
    var type = currUlr.split('list/')[1].split('.html');
    var search = currUlr.split('search=');
    // var page = Number(req.body.page) || 1;
    var limit = (Number(req.body.page) * 10) + ',' + 10;
    var sql = 'SELECT * FROM ' + type[0] + 'list order by createTime desc limit ' + limit;
    if (search[1]) {
        sql = 'SELECT * FROM ' + type[0] + 'list where title like "' +'%'+ decodeURI(search[1]) +'%'+ '" order by createTime desc limit ' + limit;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL-list ==> " + err); 
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] -list ', err.message);
                res.json({error: err});
            } else {
                res.json({list: result, type: type[0]});
            }
            conn.release();
        });
    });
})

// 菜单
router.get('/menu/:all', function (req, res) {
    var listObj = {
        pageTitle: '菜单分类-茄子',
        pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu
    }
    res.render('menu', listObj);
})

// 视频详情
router.get('/detail/:type/:id', function (req, res) {
    // var sql = 'SELECT * FROM ' + req.body.title + 'detail where createTime = ' + id;
    var id = req.params.id || '';
    var sql = 'SELECT '+ req.params.type +'list.title, '+ req.params.type +'detail.* FROM '+ req.params.type +'list LEFT JOIN '+ req.params.type +'detail ON '+ req.params.type +'list.createTime = '+ req.params.type +'detail.createTime WHERE '+ req.params.type +'detail.createTime = '+ '"' + id.replace('.html', '') + '"';
    var reNum = Math.floor(Math.random()*20+1) * 12;
    var recommond = 'SELECT * FROM '+ req.params.type +'list order by createTime desc limit ' + (reNum + ',' + 8);
    var typeText = menu.filter(function(item){return item.url.indexOf(req.params.type) > -1});
    var listObj = {
        pageTitle: '没找到数据-茄子',
        pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu,
        typeText: typeText[0] || {},
        type: req.params.type,
        result: '',
        recommond: []
    }
    if (!Number(id.replace('.html', ''))) {
        res.render('detail', listObj);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> detail" + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - detail', err.message);
                res.render('detail', listObj);
                conn.release();
            } else {
                if (result[0]) {
                    var obj = {
                        content: result[0].content,
                        video: result[0].video
                    }
                    listObj.result = obj;
                    listObj.pageTitle = result[0].title;
                    conn.query(recommond, function (err, result2) {
                        listObj.recommond = result2;
                        res.render('detail', listObj);
                        conn.release();
                    });
                
                } else{
                    res.render('detail', listObj);
                    var sqlde = 'DELETE FROM ' + req.params.type + 'list WHERE createTime = "'+ id.replace('.html', '') + '"';
                    conn.query(sqlde, function (err, result) {
                        if (err) console.log('delete-list',err);
                        conn.release();
                    })
                }
            }
        });
    })
})
router.get('/mine/:me', function (req, res) {
    var user = req.session.loginUser;
    var listObj = {
        pageTitle: '我的-茄子',
        pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu,
        user: user
    }
    res.render('mine', listObj);
});

router.get('*', function (req, res, next) {
    var listObj = {
        pageTitle: '茄子404页面',
        pageKeyword: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '茄子/茄子有你,, ady, ady在线, 茄子, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
});


function vaidParams(userName, password) {
    var error = '';
    if (!userName || !password) {
        error = '用户或密码不能为空';
    }
    if (userName.length > 12 || password.length > 12) {
        error = '用户或密码不可超过12位';
    }
    if (userName.length < 3 || password.length < 3) {
        error = '用户或密码不可小于3位';
    }
    return error;
}

router.post('/register', function (req, res) {
    var userName = req.body.userName? req.body.userName.replace(/\s+/g, "") : '';
    var err = vaidParams(userName, req.body.password);
    var sql = 'SELECT * FROM user where username = "'+ userName + '"';
    var sql2 = "INSERT INTO user(username, password, ip) VALUES (?, ?, ?)";
    if (err) {
        res.json({error: err});
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL register==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('register - ', err.message);
                res.json({error: '系统出错请重新操作'});
                conn.release();
            } else {
                if (!result[0]) {
                    conn.query(sql2, [userName, req.body.password, ''], function (err1, result1) {
                        if (err1) {
                            console.log('register1- ', err1.message);
                            res.json({error: '系统出错请重新操作2'});
                        }  else {
                            req.session.loginUser = {username: userName};
                            res.json({userName: userName});
                        }
                        conn.release();
                    });
                } else {
                    res.json({error: '用户已存在'});
                    conn.release();
                }
            }
        });
    });
});

router.post('/login', function (req, res, next) {
    // 获取所有列表
    var userName = req.body.userName? req.body.userName.replace(/(^\s*)|(\s*$)/g, "") : '';
    var err = vaidParams(userName, req.body.password);
    var sql = 'SELECT * FROM user where username = "'+ userName + '"';
    if (err) {
        res.json({error: err});
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL login==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('login--', err.message);
                res.json({error: '系统出错请重新操作'});
            } else {
                if (result.length) {
                    if (req.body.password === result[0].password) {
                        delete result[0].password;
                        req.session.loginUser = result[0];
                        res.json(result[0]);
                    } else {
                        res.json({error: '用户或密码不正确'});
                    }
                } else {
                    res.json({error: '用户不存在'});
                }
            }
            conn.release();
        });
    });
});

router.post('/logout', function (req, res, next) {
    req.session.loginUser = null;
    res.clearCookie('testapp');
    res.json({success:'退出成功'});
});

module.exports = router;
